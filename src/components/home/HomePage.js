import { Airplay } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <section className="bg-background">
      <div className="container px-6 py-10 mx-auto">
        <h1 className="text-2xl font-semibold text-foreground capitalize lg:text-3xl">
          Principais <br /> Funcionalidades{" "}
        </h1>
        {/* 
        <p className="mt-4 text-gray-500 xl:mt-6 dark:text-gray-300">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nostrum quam
          voluptatibus
        </p> */}

        <div className="grid grid-cols-1 gap-8 mt-8 xl:mt-12 xl:gap-12 md:grid-cols-2 xl:grid-cols-3">
          <div className="p-8 space-y-3 border-2 border-border rounded-xl bg-card">
            <span className="inline-block text-primary">
              <Airplay />
            </span>

            <h1 className="text-xl font-semibold text-card-foreground capitalize">
              Controle de Estoque em Tempo Real
            </h1>

            <p className="text-muted-foreground">
              Monitore seu estoque de medicamentos em tempo real, evitando
              faltas e excessos.
            </p>
          </div>

          <div className="p-8 space-y-3 border-2 border-border rounded-xl bg-card">
            <span className="inline-block text-primary">
              <Airplay />
            </span>

            <h1 className="text-xl font-semibold text-card-foreground capitalize">
              Busca Inteligente de Medicamentos
            </h1>

            <p className="text-muted-foreground">
              Localize medicamentos rapidamente com nossa busca inteligente e
              filtros avançados.
            </p>
          </div>

          <div className="p-8 space-y-3 border-2 border-border rounded-xl bg-card">
            <span className="inline-block text-primary">
              <Airplay />
            </span>

            <h1 className="text-xl font-semibold text-card-foreground capitalize">
              Reservas
            </h1>

            <p className="text-muted-foreground">
              Reservas de medicamentos por até 7 dias com upload de receita.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
