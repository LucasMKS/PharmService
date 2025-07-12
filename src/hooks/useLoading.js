import { useState, useCallback } from "react";

/**
 * Hook personalizado para gerenciar estados de loading
 * @param {Object} options - Opções de configuração
 * @param {boolean} options.initialPageLoading - Estado inicial do carregamento da página
 * @param {boolean} options.initialContentLoading - Estado inicial do carregamento de conteúdo
 * @param {boolean} options.initialDataLoading - Estado inicial do carregamento de dados
 * @returns {Object} Estados e funções de controle de loading
 */
export const useLoading = ({
  initialPageLoading = false,
  initialContentLoading = false,
  initialDataLoading = false,
} = {}) => {
  const [isPageLoading, setIsPageLoading] = useState(initialPageLoading);
  const [isContentLoading, setIsContentLoading] = useState(
    initialContentLoading
  );
  const [isDataLoading, setIsDataLoading] = useState(initialDataLoading);

  // Função para executar uma operação com loading de página
  const withPageLoading = useCallback(async (operation) => {
    setIsPageLoading(true);
    try {
      const result = await operation();
      return result;
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  // Função para executar uma operação com loading de conteúdo
  const withContentLoading = useCallback(async (operation) => {
    setIsContentLoading(true);
    try {
      const result = await operation();
      return result;
    } finally {
      setIsContentLoading(false);
    }
  }, []);

  // Função para executar uma operação com loading de dados
  const withDataLoading = useCallback(async (operation) => {
    setIsDataLoading(true);
    try {
      const result = await operation();
      return result;
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  // Função para executar múltiplas operações com loading de página
  const withPageLoadingMultiple = useCallback(async (operations) => {
    setIsPageLoading(true);
    try {
      const results = await Promise.all(operations);
      return results;
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  return {
    // Estados
    isPageLoading,
    isContentLoading,
    isDataLoading,

    // Setters
    setIsPageLoading,
    setIsContentLoading,
    setIsDataLoading,

    // Funções utilitárias
    withPageLoading,
    withContentLoading,
    withDataLoading,
    withPageLoadingMultiple,

    // Função para resetar todos os estados
    resetLoading: useCallback(() => {
      setIsPageLoading(false);
      setIsContentLoading(false);
      setIsDataLoading(false);
    }, []),
  };
};
