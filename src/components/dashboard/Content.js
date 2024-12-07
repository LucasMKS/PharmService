import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function teste() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // const token = Cookies.get("token");
    // const roles = JSON.parse(Cookies.get("roles") || "[]");
    // const name = Cookies.get("name");

    const token = "das21das1d23as12d3as13das1";
    const roles = "USER";
    const name = "Lucas";

    if (!token) {
      router.push("/auth");
    } else {
      setUser({ name, roles });
    }
  }, [router]);

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="h-[200vh] w-full bg-base-200">
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl">
            PharmStock Dashboard
          </a>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1">
            <li>
              <a>Perfil</a>
            </li>
            <li>
              <details>
                <summary>Opções</summary>
                <ul className="p-2 bg-base-100">
                  <li>
                    <a>Configurações</a>
                  </li>
                  <li>
                    <a
                      onClick={() => {
                        Cookies.remove("token");
                        Cookies.remove("email");
                        Cookies.remove("roles");
                        Cookies.remove("name");
                        router.push("/auth");
                      }}
                    >
                      Sair
                    </a>
                  </li>
                </ul>
              </details>
            </li>
          </ul>
        </div>
      </div>

      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">
          Bem-vindo ao Dashboard, {user.name}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.roles.includes("ADMIN") && (
            <div className="card bg-primary text-primary-content">
              <div className="card-body">
                <h2 className="card-title">Administração</h2>
                <p>Gerencie usuários e permissões do sistema.</p>
                <div className="card-actions justify-end">
                  <button className="btn">Acessar</button>
                </div>
              </div>
            </div>
          )}
          {(user.roles.includes("farmacia") ||
            user.roles.includes("ADMIN")) && (
            <div className="card bg-secondary text-secondary-content">
              <div className="card-body">
                <h2 className="card-title">Gestão de Estoque</h2>
                <p>Controle o estoque de medicamentos da farmácia.</p>
                <div className="card-actions justify-end">
                  <button className="btn">Acessar</button>
                </div>
              </div>
            </div>
          )}
          {(user.roles.includes("gerente") || user.roles.includes("ADMIN")) && (
            <div className="card bg-accent text-accent-content">
              <div className="card-body">
                <h2 className="card-title">Relatórios</h2>
                <p>Visualize relatórios e estatísticas da farmácia.</p>
                <div className="card-actions justify-end">
                  <button className="btn">Acessar</button>
                </div>
              </div>
            </div>
          )}
          <div className="card bg-neutral text-neutral-content">
            <div className="card-body">
              <h2 className="card-title">Busca de Medicamentos</h2>
              <p>Pesquise medicamentos disponíveis no estoque.</p>
              <div className="card-actions justify-end">
                <button className="btn">Acessar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
