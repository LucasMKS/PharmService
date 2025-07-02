import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const router = useRouter();

  // Função para decodificar token JWT e extrair dados do usuário
  const decodeToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return {
        userId: decoded.userId,
        name: decoded.name,
        email: decoded.email,
        roles: decoded.roles,
        pharmacyId: decoded.pharmacyId,
        pharmacyName: decoded.pharmacyName,
        exp: decoded.exp,
      };
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
      return null;
    }
  };

  // Função para verificar se o token ainda é válido
  const isTokenValid = (token) => {
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  // Função para salvar dados de autenticação
  const saveAuthData = (authData) => {
    if (authData.token) {
      localStorage.setItem("token", authData.token);
      setToken(authData.token);
    }

    if (authData.refreshToken) {
      localStorage.setItem("refreshToken", authData.refreshToken);
    }

    const userData = decodeToken(authData.token);
    if (userData) {
      sessionStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
  };

  // Função para limpar dados de autenticação
  const clearAuthData = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    // Verificar se há token válido no localStorage
    const storedToken = localStorage.getItem("token");

    if (storedToken && isTokenValid(storedToken)) {
      setToken(storedToken);

      // Tentar obter dados do usuário do sessionStorage primeiro
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          console.error("Erro ao parsear dados do usuário:", error);
        }
      } else {
        // Se não há dados no sessionStorage, decodificar do token
        const userData = decodeToken(storedToken);
        if (userData) {
          sessionStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);
        }
      }
    } else {
      // Token inválido ou expirado, limpar dados
      clearAuthData();
      router.push("/auth");
    }
  }, [router]);

  const login = (authData) => {
    saveAuthData(authData);
  };

  const logout = () => {
    clearAuthData();
    router.push("/auth");
  };

  const updateUser = (updatedUserData) => {
    if (updatedUserData) {
      const currentUser = { ...user, ...updatedUserData };
      sessionStorage.setItem("user", JSON.stringify(currentUser));
      setUser(currentUser);
    }
  };

  // Função para obter token atual (para uso em requisições)
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // Função para verificar se o usuário está autenticado
  const isAuthenticated = () => {
    const currentToken = localStorage.getItem("token");
    return currentToken && isTokenValid(currentToken);
  };

  return {
    user,
    token,
    login,
    logout,
    updateUser,
    getToken,
    isAuthenticated,
  };
};
