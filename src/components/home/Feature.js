"use client";

import { Airplay } from "lucide-react";
import Image from "next/image";

export default function Feature() {
  return (
    <section className="px-4 py-24 mx-auto bg-blue-100 dark:bg-slate-950">
      <div className="w-full mx-auto text-left md:w-11/12 xl:w-9/12 md:text-center">
        <h1 className="mb-6 text-4xl font-extrabold leading-none tracking-normal text-neutral-900 dark:text-neutral-100 md:text-6xl md:tracking-tight">
          Centralize a{" "}
          <span className="block w-full text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-500 lg:inline">
            gestão de medicamentos
          </span>{" "}
          em um só lugar.
        </h1>
        <p className="px-0 mb-6 text-lg text-neutral-600 dark:text-neutral-200 md:text-xl lg:px-24">
          PharmService é um sistema completo que conecta farmácias e usuários.
        </p>
        <p className="px-0 mb-6 text-lg text-neutral-600 dark:text-neutral-200 md:text-xl lg:px-24">
          <span className="inline-flex items-center gap-2">
            <Airplay className="w-5 h-5 text-green-500" />
            &ensp;Farmácias podem gerenciar estoques, controlar reservas e gerar
            relatórios com facilidade.
          </span>
          <br />
          <span className="inline-flex items-center gap-2">
            <Airplay className="w-5 h-5 text-purple-500" />
            &ensp;Usuários podem pesquisar medicamentos, fazer reservas e
            receber notificações em tempo real.
          </span>{" "}
        </p>
        <div className="mb-4 space-x-0 md:space-x-2 md:mb-8">
          <a
            className="inline-flex items-center justify-center w-full mb-2 btn btn-primary btn-lg sm:w-auto sm:mb-0"
            href="#"
          >
            Get Started
            <Airplay />
          </a>
        </div>
      </div>
      <div className="w-full mx-auto mt-20 text-center md:w-10/12">
        <Image
          src="/images/pharm/imgTela.png"
          width={1920}
          height={1080}
          alt="Avatar"
        />
      </div>
    </section>
  );
}
