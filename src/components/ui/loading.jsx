import React from "react";
import { ClipLoader } from "react-spinners";

/**
 * Componente de loading para página inteira
 */
export const PageLoader = ({ message = "Carregando..." }) => (
  <div className="flex justify-center items-center h-screen bg-background">
    <div className="text-center">
      <ClipLoader color="hsl(var(--primary))" size={40} />
      {message && <p className="mt-4 text-muted-foreground">{message}</p>}
    </div>
  </div>
);

/**
 * Componente de loading para conteúdo específico
 */
export const ContentLoader = ({ message = "Carregando conteúdo..." }) => (
  <div className="flex items-center justify-center h-full bg-background">
    <div className="text-center">
      <ClipLoader color="hsl(var(--primary))" size={40} />
      {message && <p className="mt-4 text-muted-foreground">{message}</p>}
    </div>
  </div>
);

/**
 * Componente de loading para dados em tabelas/cards
 */
export const DataLoader = ({ message = "Carregando dados..." }) => (
  <div className="bg-background min-h-screen flex items-center justify-center p-6">
    <div className="text-center">
      <ClipLoader color="hsl(var(--primary))" size={40} />
      {message && <p className="mt-4 text-muted-foreground">{message}</p>}
    </div>
  </div>
);

/**
 * Componente de loading inline (para botões, etc.)
 */
export const InlineLoader = ({ size = 16, className = "" }) => (
  <ClipLoader color="hsl(var(--primary))" size={size} className={className} />
);

/**
 * Componente de loading com fallback para Suspense
 */
export const SuspenseLoader = () => (
  <div className="flex justify-center items-center h-32">
    <ClipLoader color="hsl(var(--primary))" size={40} />
  </div>
);

/**
 * Componente de loading condicional que renderiza o conteúdo quando não está carregando
 */
export const LoadingWrapper = ({
  isLoading,
  loadingComponent = <DataLoader />,
  children,
}) => {
  if (isLoading) {
    return loadingComponent;
  }

  return children;
};

/**
 * Componente de loading para operações específicas (como reservas, etc.)
 */
export const OperationLoader = ({
  operation,
  message = "Processando...",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className="flex items-center gap-2">
      <ClipLoader
        color="hsl(var(--primary))"
        size={sizeClasses[size] || sizeClasses.md}
      />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
};
