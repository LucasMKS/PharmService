import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { ClipLoader } from "react-spinners";
import { useAuth } from "@/hooks/useAuth";
import Cookies from "js-cookie";
import Sidebar from "./Sidebar";
import TableContent from "./TableContent";
import Reservation from "./Reservation";
import EmployeeManagement from "./EmployeeManagement";
import PharmService from "../services/PharmService";

const Loader = () => (
  <div className="flex items-center justify-center h-screen bg-blue-100 dark:bg-slate-950">
    <ClipLoader color="#4F46E5" size={50} />
  </div>
);

// Adicione um fallback de carregamento
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-32">
    <span className="loading loading-ring loading-lg text-primary"></span>
  </div>
);

const CONTENT_MAP = {
  Dashboard: TableContent,
  Reservas: Reservation,
  Funcionarios: EmployeeManagement,
};

export const Dashboard = () => {
  const { user } = useAuth();
  const roles = Cookies.get("roles");
  const pharmacyId = Cookies.get("pharmacyId");

  const [userAlerts, setUserAlerts] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [currentContent, setCurrentContent] = useState("Dashboard");
  const [isContentLoading, setIsContentLoading] = useState(false);

  // Memoize a função de refresh para evitar recriações desnecessárias
  const refreshAlerts = useCallback(async () => {
    try {
      const alerts = await PharmService.getActiveAlerts();
      setUserAlerts(alerts);
    } catch (error) {
      console.error("Erro ao atualizar alertas:", error);
      throw error;
    }
  }, []);

  // Carregamento inicial
  useEffect(() => {
    const initializeDashboard = async () => {
      if (!user) return;

      try {
        await Promise.all([
          refreshAlerts(),
          new Promise((resolve) => setTimeout(resolve, 500)), // Simula carregamento
        ]);
      } finally {
        setIsPageLoading(false);
      }
    };

    initializeDashboard();
  }, [user, refreshAlerts]);

  // Manipulador de mudança de conteúdo
  const handleContentChange = useCallback(async (title) => {
    setIsContentLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setCurrentContent(title);
    } finally {
      setIsContentLoading(false);
    }
  }, []);

  // Modifique a função renderContent
  const renderContent = useCallback(() => {
    const ContentComponent = CONTENT_MAP[currentContent];

    return (
      <Suspense fallback={<LoadingFallback />}>
        {currentContent === "Dashboard" ? (
          <ContentComponent
            roles={roles}
            pharmacyId={pharmacyId}
            refreshAlerts={refreshAlerts}
          />
        ) : (
          <ContentComponent />
        )}
      </Suspense>
    );
  }, [currentContent, roles, pharmacyId, refreshAlerts]);

  if (isPageLoading || !user) {
    return <Loader className="bg-blue-100 dark:bg-slate-950" />;
  }

  return (
    <div className="flex bg-indigo-50">
      <Sidebar
        setSelectedContent={handleContentChange}
        user={user}
        roles={roles}
        userAlerts={userAlerts}
        refreshAlerts={refreshAlerts}
      />

      <main className="flex-1">
        {isContentLoading ? (
          <div className="flex items-center justify-center h-full bg-blue-100 dark:bg-slate-950">
            <ClipLoader color="#4F46E5" size={40} />
          </div>
        ) : (
          renderContent()
        )}
      </main>
    </div>
  );
};

export default Dashboard;

// Deixar a mudança de pagina mais suavizada
