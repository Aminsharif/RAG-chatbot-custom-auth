"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

type ProfileMenuProps = {
  name: string;
  email: string;
  isAdmin: boolean;
  onLogout: () => void;
  onClose: () => void;
};

export default function ProfileMenu({
  name,
  email,
  isAdmin,
  onLogout,
  onClose,
}: ProfileMenuProps) {
  return (
    <motion.div
      role="menu"
      aria-label="Profile menu"
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-full left-0 z-50 mb-3 w-64 rounded-xl border bg-background p-4 shadow-lg"
    >
      <div className="text-sm font-semibold">{name}</div>
      <div className="text-xs text-muted-foreground">{email}</div>
      <div className="my-3 h-px bg-border" />
      {isAdmin ? (
        <Link
          role="menuitem"
          href="/admin"
          onClick={onClose}
          className="flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Admin
        </Link>
      ) : null}
      <button
        role="menuitem"
        type="button"
        onClick={onLogout}
        className="flex w-full items-center rounded-md px-2 py-2 text-sm text-destructive hover:bg-destructive/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Logout
      </button>
    </motion.div>
  );
}
