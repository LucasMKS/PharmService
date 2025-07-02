import { useState, useEffect } from "react";

export const useSessionStorage = (key, defaultValue = null) => {
  const [value, setValue] = useState(defaultValue);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    try {
      const item = sessionStorage.getItem(key);
      if (item !== null) {
        setValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Erro ao ler ${key} do sessionStorage:`, error);
    }
  }, [key]);

  const setSessionValue = (newValue) => {
    try {
      setValue(newValue);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(key, JSON.stringify(newValue));
      }
    } catch (error) {
      console.error(`Erro ao salvar ${key} no sessionStorage:`, error);
    }
  };

  const removeSessionValue = () => {
    try {
      setValue(defaultValue);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Erro ao remover ${key} do sessionStorage:`, error);
    }
  };

  return [value, setSessionValue, removeSessionValue, isClient];
};

export const getSessionData = (key, defaultValue = null) => {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Erro ao ler ${key} do sessionStorage:`, error);
    return defaultValue;
  }
};
