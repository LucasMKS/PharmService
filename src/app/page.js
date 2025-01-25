"use client";

import React from "react";
import HomePage from "@components/home/HomePage";
import First from "@components/home/HeroSection";
import Feature from "@components/home/Feature";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* <Navbar /> */}
      <main className="font-roboto font-normal">
        <First />
        <Feature />
        <HomePage className="bg-blue-700" />
      </main>
    </div>
  );
}
