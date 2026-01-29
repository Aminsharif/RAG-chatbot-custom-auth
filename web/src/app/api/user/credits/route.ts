import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/auth/supabase-server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 },
      );
    }

    console.log("Fetching credits for user:", userId);

    const { data: userData, error } = await supabaseServer
      .from("users")
      .select("credits_available, subscription_status, price_id")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user credits:", error);

      if (error.code === "PGRST116") {
        console.log("User not found in database, creating basic record...");

        const { data: newUser, error: createError } = await supabaseServer
          .from("users")
          .insert({
            id: userId,
            credits_available: 0,
            subscription_status: "inactive",
          })
          .select("credits_available, subscription_status, price_id")
          .single();

        if (createError) {
          console.error("Error creating user record:", createError);
          return NextResponse.json(
            { error: "Failed to create user record" },
            { status: 500 },
          );
        }

        return NextResponse.json({
          credits: newUser.credits_available || 0,
          subscriptionStatus: newUser.subscription_status,
          priceId: newUser.price_id,
        });
      }

      return NextResponse.json(
        { error: "Failed to fetch credits" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      credits: userData.credits_available || 0,
      subscriptionStatus: userData.subscription_status,
      priceId: userData.price_id,
    });
  } catch (error) {
    console.error("Credits API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, amount, operation } = body as {
      userId?: string;
      amount?: number;
      operation?: "add" | "deduct";
    };

    if (!userId || typeof amount !== "number" || !operation) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 },
      );
    }

    const { data: currentUser, error: fetchError } = await supabaseServer
      .from("users")
      .select("credits_available, subscription_status")
      .eq("id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching user for credit update:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 },
      );
    }

    const existingCredits = (currentUser?.credits_available as number) || 0;

    let newCredits = existingCredits;

    if (operation === "add") {
      newCredits = existingCredits + amount;
    } else {
      if (existingCredits < amount) {
        return NextResponse.json(
          { error: "Insufficient credits" },
          { status: 400 },
        );
      }
      newCredits = existingCredits - amount;
    }

    const updatePayload: Record<string, unknown> = {
      credits_available: newCredits,
    };

    if (operation === "add" && currentUser?.subscription_status === "inactive") {
      updatePayload.subscription_status = "active";
    }

    const { error: updateError } = await supabaseServer
      .from("users")
      .upsert(
        {
          id: userId,
          ...updatePayload,
        },
        { onConflict: "id" },
      );

    if (updateError) {
      console.error("Error updating user credits:", updateError);
      return NextResponse.json(
        { error: "Failed to update credits" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      newBalance: newCredits,
    });
  } catch (error) {
    console.error("Credits POST API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
