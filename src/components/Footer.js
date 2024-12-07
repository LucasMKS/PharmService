"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PiRedditLogo, PiGithubLogo } from "react-icons/pi";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="container flex flex-col items-center justify-between p-6 mx-auto space-y-4 sm:space-y-0 sm:flex-row">
        <Link href="/" className="w-auto h-7">
          <Image
            src="https://merakiui.com/images/full-logo.svg"
            width={170}
            height={260}
            alt="Avatar"
          />
        </Link>

        <p className="text-sm text-gray-600 dark:text-gray-300">
          © Copyright 2021. All Rights Reserved.
        </p>

        <div className="flex -mx-2">
          <Link
            href="#"
            className="mx-2 text-gray-600 transition-colors duration-300 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
          >
            <PiRedditLogo className="w-5 h-5 fill-current" />
          </Link>
          <Link
            href="#"
            className="mx-2 text-gray-600 transition-colors duration-300 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
          >
            {" "}
            <PiGithubLogo className="w-5 h-5 fill-current" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
