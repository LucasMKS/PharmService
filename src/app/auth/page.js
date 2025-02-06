"use client";

import React from "react";
import LoginPage from "@components/loginPage/Login";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="font-inter ">
        <LoginPage />
      </main>
    </div>
  );
}
