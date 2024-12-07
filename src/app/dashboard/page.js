"use client";

import { Dashboard } from "@components/dashboard/Dashboard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-blue-100 dark:bg-slate-950">
      <main className="font-roboto font-normal">
        <Dashboard />
      </main>
    </div>
  );
}
