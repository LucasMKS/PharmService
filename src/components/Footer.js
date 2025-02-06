"use client";
import React from "react";
import Link from "next/link";
import { PiGithubLogo, PiLinkedinLogo } from "react-icons/pi";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="container flex flex-col items-center justify-between p-6 mx-auto space-y-4 sm:space-y-0 sm:flex-row">
        <Link href="/" className="w-auto border-b-2 border-blue-500 rounded-xl">
          <p className="font-alkatra text-2xl p-1 bg-gradient-to-r from-red-200 to-red-400 bg-clip-text text-transparent">
            Pharm Service
          </p>
        </Link>

        <p className="text-sm text-gray-600 dark:text-gray-300">
          © Copyright 2025. All Rights Reserved.
        </p>

        <div className="flex -mx-2">
          <Link
            href="https://www.linkedin.com/in/lucas-marques-da-silva-23b919232/"
            className="mx-2 text-gray-600 transition-colors duration-300 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            <PiLinkedinLogo className="w-8 h-8 fill-current" />
          </Link>
          <Link
            href="https://github.com/LucasMKS"
            className="mx-2 text-gray-600 transition-colors duration-300 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            <PiGithubLogo className="w-8 h-8 fill-current" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
