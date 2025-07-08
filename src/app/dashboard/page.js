"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getSessionData } from "@/hooks/useSessionStorage";
import PharmService from "@/components/services/PharmService";
import Sidebar from "@/components/layout/Sidebar";
import TableContent from "@/components/dashboard/TableContent";
import Reservation from "@/components/dashboard/Reservation";
import ExportReports from "@/components/dashboard/ExportReports";
import PharmacyManagement from "@/components/dashboard/PharmacyManagement";
import EmployeeManagement from "@/components/dashboard/EmployeeManagement";
import { ClipLoader } from "react-spinners";

// Componente de carregamento global
const GlobalLoader = () => (
  <div className="flex justify-center items-center h-screen bg-background">
    <ClipLoader color="hsl(var(--primary))" size={40} />
  </div>
);

// Adicione um fallback de carregamento
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-32">
    <ClipLoader color="hsl(var(--primary))" size={40} />
  </div>
);

const CONTENT_MAP = {
  Dashboard: TableContent,
  Reservas: Reservation,
  Funcionarios: EmployeeManagement,
  Relatórios: ExportReports,
  Farmácias: PharmacyManagement,
};

export const Dashboard = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const sessionData = getSessionData("user", {});
  const roles = user?.roles || sessionData.roles;
  const pharmacyId = user?.pharmacyId || sessionData.pharmacyId;

  const [userAlerts, setUserAlerts] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  // Determinar o conteúdo inicial baseado nos parâmetros da URL
  const getInitialContent = () => {
    const contentParam = searchParams.get("content");
    return contentParam && CONTENT_MAP[contentParam]
      ? contentParam
      : "Dashboard";
  };

  const [currentContent, setCurrentContent] = useState(getInitialContent());
  const [isContentLoading, setIsContentLoading] = useState(false);

  // Memoize a função de refresh para evitar recriações desnecessárias
  const refreshAlerts = useCallback(async () => {
    try {
      const alerts = await PharmService.getActiveAlerts();
      console.log(alerts);
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
    return <GlobalLoader />;
  }

  return (
    <div className="flex bg-background">
      <Sidebar
        setSelectedContent={handleContentChange}
        user={user}
        roles={roles}
        userAlerts={userAlerts}
        refreshAlerts={refreshAlerts}
        initialSelected={getInitialContent()}
      />

      <main className="flex-1">
        {isContentLoading ? (
          <div className="flex items-center justify-center h-full bg-background">
            <ClipLoader color="hsl(var(--primary))" size={40} />
          </div>
        ) : (
          renderContent()
        )}
      </main>
    </div>
  );
};

export default Dashboard;
