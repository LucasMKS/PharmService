import React, { useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import { useAuth } from "@/hooks/useAuth";
import Cookies from "js-cookie";
import Sidebar from "./Sidebar";
import TableContent from "./TableContent";
import Reservation from "@/components/reservation/Reservation";
import Teste2 from "@/components/dashboard/Feature";

const Loader = () => (
  <div className="flex items-center justify-center h-screen bg-blue-100 dark:bg-slate-950 ">
    <ClipLoader color="#4F46E5" size={50} />
  </div>
);

export const Dashboard = () => {
  const roles = Cookies.get("roles");
  const pharmacyId = Cookies.get("pharmacyId");
  const [selectedContent, setSelectedContent] = useState(<TableContent roles={roles} pharmacyId={pharmacyId}/>);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
 

  const contentMap = {
    Dashboard: <TableContent roles={roles} pharmacyId={pharmacyId}/>,
    Reservas: <Reservation />,
    Funcionarios: <Teste2 />,
  };

  useEffect(() => {
    const loadPage = async () => {
      if (!user) return; // useAuth já redireciona, evite conflitos
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simula atraso no carregamento inicial
      setIsPageLoading(false);
    };
    loadPage();
  }, [user]);

  if (isPageLoading) {
    return <Loader className="bg-blue-100 dark:bg-slate-950" />; // Exibe o carregador global enquanto carrega tudo
  }

  if (!user) {
    return null; // O useAuth já cuida do redirecionamento
  }

  const handleContentChange = (title) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedContent(contentMap[title]);
      setIsLoading(false);
    }, 500); // Simulating a 500ms load time
  };

  return (
    <div className="flex bg-indigo-50">
      <Sidebar setSelectedContent={handleContentChange} user={user} roles={roles} />
      <main className="flex-1">
        {isLoading ? (
          <Loader className="bg-blue-100 dark:bg-slate-950" />
        ) : (
          selectedContent
        )}
      </main>
    </div>
  );
};

export default Dashboard;