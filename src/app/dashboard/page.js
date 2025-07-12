"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getSessionData } from "@/hooks/useSessionStorage";
import { useLoading } from "@/hooks/useLoading";
import PharmService from "@/components/services/PharmService";
import Sidebar from "@/components/layout/Sidebar";
import TableContent from "@/components/dashboard/TableContent";
import Reservation from "@/components/dashboard/Reservation";
import ExportReports from "@/components/dashboard/ExportReports";
import PharmacyManagement from "@/components/dashboard/PharmacyManagement";
import EmployeeManagement from "@/components/dashboard/EmployeeManagement";
import {
  PageLoader,
  ContentLoader,
  SuspenseLoader,
} from "@/components/ui/loading";

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

  // Usando o hook personalizado para gerenciar loading
  const {
    isPageLoading,
    isContentLoading,
    setIsPageLoading,
    withPageLoading,
    withContentLoading,
  } = useLoading({
    initialPageLoading: true,
    initialContentLoading: false,
  });

  // Determinar o conteúdo inicial baseado nos parâmetros da URL
  const getInitialContent = () => {
    const contentParam = searchParams.get("content");
    return contentParam && CONTENT_MAP[contentParam]
      ? contentParam
      : "Dashboard";
  };

  const [currentContent, setCurrentContent] = useState(getInitialContent());

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

  // Carregamento inicial usando o hook
  useEffect(() => {
    const initializeDashboard = async () => {
      if (!user) return;

      await withPageLoading(async () => {
        await Promise.all([
          refreshAlerts(),
          new Promise((resolve) => setTimeout(resolve, 500)), // Simula carregamento
        ]);
      });
    };

    initializeDashboard();
  }, [user, refreshAlerts, withPageLoading]);

  // Manipulador de mudança de conteúdo usando o hook
  const handleContentChange = useCallback(
    async (title) => {
      await withContentLoading(async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setCurrentContent(title);
      });
    },
    [withContentLoading]
  );

  // Modifique a função renderContent
  const renderContent = useCallback(() => {
    const ContentComponent = CONTENT_MAP[currentContent];

    return (
      <Suspense fallback={<SuspenseLoader />}>
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
    return <PageLoader message="Carregando dashboard..." />;
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
          <ContentLoader message="Carregando conteúdo..." />
        ) : (
          renderContent()
        )}
      </main>
    </div>
  );
};

export default Dashboard;
