import { api } from "@/lib/httpClient";

export const checkEmailAvailability = async (email: string) => {
  if (!email) return true;
  const response = await api.get("/auth/check-email", {
    params: { email },
  });
  const data = response.data as { available: boolean };
  return data.available;
};

