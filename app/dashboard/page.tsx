"use client";

import Dashboard from "@/components/dashboard";
import { SessionProvider } from "next-auth/react";

export default function DashboardPage() {
  return (
    <SessionProvider>
      <Dashboard />
    </SessionProvider>
  );
}