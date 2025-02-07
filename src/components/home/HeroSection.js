"use client";
import React from "react";

export default function First() {
  return (
    <section className="relative bg-[url(https://images.unsplash.com/photo-1585830812416-a6c86bb14576?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)] bg-cover bg-center bg-no-repeat opacity-80">
      <div className="absolute inset-0 bg-neutral-900/50 sm:bg-transparent sm:from-gray-900/95 sm:to-gray-900/25 ltr:sm:bg-gradient-to-r rtl:sm:bg-gradient-to-l "></div>

      <div className="relative mx-auto max-w-screen-xl px-4 py-32 sm:px-6 lg:flex lg:h-screen lg:items-center lg:px-8">
        <div className="max-w-xl text-center ltr:sm:text-left rtl:sm:text-right">
          <h1 className="text-3xl font-extrabold text-blue-300 sm:text-5xl">
            Pharm
            <strong className=" font-extrabold text-rose-500">Service.</strong>
          </h1>

          <p className="mt-4 max-w-xl text-white sm:text-xl/relaxed">
            PharmService revoluciona a gestão de estoque farmacêutico,
            permitindo que usuários verifiquem a disponibilidade de medicamentos
            em tempo real, reduzindo deslocamentos desnecessários e otimizando o
            atendimento ao cliente.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 text-center  justify-center">
            <a
              href="/auth"
              className="block w-full rounded bg-rose-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-rose-700 focus:outline-none focus:ring active:bg-rose-500 sm:w-auto"
            >
              Get Started
            </a>

            <a
              href="#"
              className="block w-full rounded bg-white px-12 py-3 text-sm font-medium text-rose-600 shadow hover:text-rose-700 focus:outline-none focus:ring active:text-rose-500 sm:w-auto"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
