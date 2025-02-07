import { Airplay } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <section className="bg-blue-100 dark:bg-slate-950">
      <div className="container px-6 py-10 mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 capitalize lg:text-3xl dark:text-white">
          Principais <br /> Funcionalidades{" "}
        </h1>
        {/* 
        <p className="mt-4 text-gray-500 xl:mt-6 dark:text-gray-300">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nostrum quam
          voluptatibus
        </p> */}

        <div className="grid grid-cols-1 gap-8 mt-8 xl:mt-12 xl:gap-12 md:grid-cols-2 xl:grid-cols-3">
          <div className="p-8 space-y-3 border-2 border-blue-400 dark:border-blue-300 rounded-xl">
            <span className="inline-block text-blue-500 dark:text-blue-400">
              <Airplay />
            </span>

            <h1 className="text-xl font-semibold text-gray-700 capitalize dark:text-white">
              Controle de Estoque em Tempo Real
            </h1>

            <p className="text-gray-500 dark:text-gray-300">
              Monitore seu estoque de medicamentos em tempo real, evitando
              faltas e excessos.
            </p>
          </div>

          <div className="p-8 space-y-3 border-2 border-blue-400 dark:border-blue-300 rounded-xl">
            <span className="inline-block text-blue-500 dark:text-blue-400">
              <Airplay />
            </span>

            <h1 className="text-xl font-semibold text-gray-700 capitalize dark:text-white">
              Busca Inteligente de Medicamentos
            </h1>

            <p className="text-gray-500 dark:text-gray-300">
              Localize medicamentos rapidamente com nossa busca inteligente e
              filtros avançados. eveniet
            </p>
          </div>

          <div className="p-8 space-y-3 border-2 border-blue-400 dark:border-blue-300 rounded-xl">
            <span className="inline-block text-blue-500 dark:text-blue-400">
              <Airplay />
            </span>

            <h1 className="text-xl font-semibold text-gray-700 capitalize dark:text-white">
              Reservas
            </h1>

            <p className="text-gray-500 dark:text-gray-300">
              Reservas de medicamentos por até 7 dias com upload de receita.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
