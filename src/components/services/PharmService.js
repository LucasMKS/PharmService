import axios from "axios";
import { getSessionData } from "@/hooks/useSessionStorage";

const API_BASE_URL = "http://localhost:8080/api";
//const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar o token a todas as requisições
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (
      token &&
      !config.url.includes("/auth/login") &&
      !config.url.includes("/auth/register") &&
      !config.url.includes("/auth/refresh-token")
    ) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar erros 401 e tentar renovar o token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tentar renovar o token
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            {
              refreshToken: refreshToken,
            }
          );

          // Atualizar tokens
          if (response.data.token) {
            localStorage.setItem("token", response.data.token);
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${response.data.token}`;

            // Tentar a requisição original novamente
            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        // Se falhar ao renovar, limpar dados e redirecionar para login
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        sessionStorage.removeItem("user");
        window.location.href = "/auth";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Função helper para obter dados do usuário do sessionStorage
const getUserData = () => {
  return getSessionData("user", null);
};

const PharmService = {
  // Método para fazer login
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    }
  },

  // Método para renovar token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("Refresh token não encontrado");
      }

      const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
        refreshToken: refreshToken,
      });

      // Atualizar tokens no localStorage
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      if (response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }

      return response.data;
    } catch (error) {
      console.error("Erro ao renovar token:", error);
      throw error;
    }
  },

  // Método para fazer cadastro
  register: async (userData) => {
    try {
      const response = await axiosInstance.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      console.error("Erro ao fazer cadastro:", error);
      throw error;
    }
  },

  // Método para buscar todos os medicamentos
  getAllMedicines: async () => {
    try {
      const userData = getUserData();
      if (!userData) {
        throw new Error("Usuário não autenticado");
      }

      const response = await axiosInstance.get("/medicine/all", {
        headers: {
          userId: userData.userId,
          role: Array.isArray(userData.roles)
            ? userData.roles[0]
            : userData.roles,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar medicamentos:", error);
      throw error;
    }
  },

  // Método para buscar um medicamento específico
  getMedicineByName: async (medicineName) => {
    try {
      const response = await axiosInstance.get(`/medicine/${medicineName}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar medicamento:", error);
      throw error;
    }
  },

  // Método para buscar um medicamento pela farmacia
  getMedicineByPharmacyId: async (pharmacyId) => {
    try {
      const userData = getUserData();
      if (!userData) {
        throw new Error("Usuário não autenticado");
      }

      const response = await axiosInstance.get(
        `/medicine/pharmacy/${pharmacyId}`,
        {
          headers: {
            userId: userData.userId,
            role: Array.isArray(userData.roles)
              ? userData.roles[0]
              : userData.roles,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar medicamento:", error);
      throw error;
    }
  },

  // Método para adicionar um novo medicamento
  addMedicine: async (medicineData) => {
    try {
      const userData = getUserData();
      if (!userData) {
        throw new Error("Usuário não autenticado");
      }

      console.log(userData.userId, userData.roles);
      const response = await axiosInstance.post(
        "/medicineFarm/create",
        medicineData,
        {
          headers: {
            UserId: userData.userId,
            Role: Array.isArray(userData.roles)
              ? userData.roles[0]
              : userData.roles,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Network Error Details:", {
        message: error.message,
        code: error.code,
        config: error.config,
        response: error.response,
      });
      throw error;
    }
  },

  // Método para atualizar um medicamento
  updateMedicine: async (id, medicineData) => {
    try {
      const userData = getUserData();
      if (!userData) {
        throw new Error("Usuário não autenticado");
      }

      const response = await axiosInstance.put(
        `/medicineFarm/update/${id}`,
        medicineData,
        {
          headers: {
            UserId: userData.userId,
            Role: Array.isArray(userData.roles)
              ? userData.roles[0]
              : userData.roles,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar medicamento:", error);
      throw new Error(`Failed to update medication. ${error.message}`);
    }
  },

  // Método para deletar um medicamento
  deleteMedicine: async (id) => {
    try {
      const userData = getUserData();
      if (!userData) {
        throw new Error("Usuário não autenticado");
      }

      const response = await axiosInstance.delete(
        `/medicineFarm/delete/${id}`,
        {
          headers: {
            UserId: userData.userId,
            Role: Array.isArray(userData.roles)
              ? userData.roles[0]
              : userData.roles,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar medicamento:", error);
      throw new Error(`Failed to delete medication. ${error.message}`);
    }
  },

  // Método para verificar disponibilidade de um medicamento
  checkMedicineAvailability: async (id) => {
    try {
      const response = await axiosInstance.get(`/medicines/${id}/availability`);
      return response.data;
    } catch (error) {
      console.error("Erro ao verificar disponibilidade do medicamento:", error);
      throw new Error(
        `Error checking medication availability. ${error.message}`
      );
    }
  },

  createReservation: async (formData) => {
    try {
      const userData = getUserData();
      if (!userData) {
        throw new Error("Usuário não autenticado");
      }

      console.log("Dados do usuário para reserva:", userData);
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await axiosInstance.post(
        "/reservations/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Role: Array.isArray(userData.roles)
              ? userData.roles[0]
              : userData.roles,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao criar reserva:", error);
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);

      // Tratar erro específico de reserva duplicada
      if (error.response?.data?.includes("já possui uma reserva pendente")) {
        throw new Error(
          "Você já possui uma reserva pendente para este medicamento"
        );
      }

      throw new Error(`Failed to create reservation. ${error.message}`);
    }
  },

  // PharmService.js
  getReservationsByUser: async () => {
    try {
      const response = await axiosInstance.get(`/reservations/user`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
      throw error;
    }
  },

  getAllReservations: async () => {
    try {
      const response = await axiosInstance.get("/reservations/list");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
      throw error;
    }
  },

  // Método para atualizar status da reserva
  updateReservationStatus: async (reservationId, newStatus) => {
    try {
      const userData = getUserData();
      if (!userData) {
        throw new Error("Usuário não autenticado");
      }

      await axiosInstance.post("/reservations/manage", null, {
        params: {
          reservationId,
          status: newStatus,
          message:
            newStatus === "cancelado"
              ? "Cancelado pelo administrador"
              : "Aprovado pelo administrador",
        },
        headers: {
          Role: Array.isArray(userData.roles)
            ? userData.roles[0]
            : userData.roles,
          UserId: userData.userId,
        },
      });
    } catch (error) {
      console.error("Erro ao atualizar status da reserva:", error);
      throw error;
    }
  },

  manageReservation: async (reservationId, status, message) => {
    try {
      const userData = getUserData();
      if (!userData) {
        throw new Error("Usuário não autenticado");
      }

      console.log("Dados do usuário para gerenciar reserva:", userData);
      console.log("Token:", localStorage.getItem("token"));

      await axiosInstance.post("/reservations/manage", null, {
        params: {
          reservationId,
          status,
          message,
        },
        headers: {
          Role: Array.isArray(userData.roles)
            ? userData.roles[0]
            : userData.roles,
          UserId: userData.userId,
        },
      });
    } catch (error) {
      console.error("Erro ao gerenciar reserva:", error);
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
      throw error;
    }
  },

  cancelOwnReservation: async (reservationId, cancelReason) => {
    try {
      const userData = getUserData();
      if (!userData) {
        throw new Error("Usuário não autenticado");
      }

      await axiosInstance.post("/reservations/cancel", null, {
        params: {
          reservationId,
          cancelReason,
        },
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
    } catch (error) {
      console.error("Erro ao cancelar reserva:", error);
      throw error;
    }
  },

  createAlert: async (userId, stockId) => {
    try {
      const response = await axiosInstance.post(
        `/medicines/alert/${userId}/${stockId}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao criar alerta:", error);
      throw error;
    }
  },

  getActiveAlerts: async () => {
    try {
      const response = await axiosInstance.get("/medicines/alert");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar alertas:", error);
      throw error;
    }
  },

  deleteAlert: async (alertId) => {
    try {
      await axiosInstance.delete(`/medicines/alert/${alertId}`);
    } catch (error) {
      console.error("Erro ao deletar alerta:", error);
      throw error;
    }
  },

  // ADMIN: buscar todos os funcionários
  getAllEmployees: async () => {
    try {
      const userData = getUserData();
      if (!userData) throw new Error("Usuário não autenticado");
      const response = await axiosInstance.get("/pharmacies/employees/all");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      throw error;
    }
  },

  // GERENTE: buscar funcionários da própria farmácia
  getPharmacyEmployees: async (pharmacyId) => {
    try {
      const userData = getUserData();
      if (!userData) throw new Error("Usuário não autenticado");
      const response = await axiosInstance.get(
        `/pharmacies/${pharmacyId}/employees`,
        {
          params: { userId: userData.userId },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar funcionários da farmácia:", error);
      throw error;
    }
  },

  // ADMIN: adicionar funcionário em qualquer farmácia
  addEmployee: async (email, pharmacyId) => {
    try {
      const response = await axiosInstance.post("/employees", {
        email,
        pharmacyId,
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao adicionar funcionário:", error);
      throw error;
    }
  },

  // GERENTE: adicionar funcionário na própria farmácia
  addEmployeeByManager: async (email, pharmacyId) => {
    try {
      const userData = getUserData();
      if (!userData) throw new Error("Usuário não autenticado");
      const response = await axiosInstance.post(
        `/pharmacies/${pharmacyId}/employees`,
        { email },
        {
          params: { userId: userData.userId },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao adicionar funcionário pela gerente:", error);
      throw error;
    }
  },

  // Método para promover um funcionário a gerente
  promoteEmployee: async (employeeId, pharmacyId) => {
    try {
      await axiosInstance.put(
        `/pharmacies/employees/promote/${employeeId}/${pharmacyId}`
      );
    } catch (error) {
      console.error("Erro ao promover funcionário:", error);
      throw error;
    }
  },

  // Método para demitir um funcionário
  dismissEmployee: async (employeeId, pharmacyId) => {
    try {
      await axiosInstance.put(
        `/pharmacies/employees/dismiss/${employeeId}/${pharmacyId}`
      );
    } catch (error) {
      console.error("Erro ao demitir funcionário:", error);
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const formData = new URLSearchParams();
      formData.append("email", email);

      await axiosInstance.post("/auth/forgot-password", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
    } catch (error) {
      console.error("Erro ao demitir funcionário:", error);
      throw error;
    }
  },

  resetPassword: async (token, newPassword) => {
    const formData = new URLSearchParams();
    formData.append("newPassword", newPassword);
    formData.append("token", token);

    try {
      await axiosInstance.post(`/auth/reset-password`, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      throw error;
    }
  },

  // Adicione este método
  importMedicines: async (formData, pharmacyId) => {
    try {
      const userData = getUserData();
      if (!userData) {
        throw new Error("Usuário não autenticado");
      }

      const response = await axiosInstance.post(
        `/medicine/import-medicines/${pharmacyId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            UserId: userData.userId,
            UserRole: userData.roles,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao importar medicamentos:", error);
      throw new Error(
        error.response?.data?.message || "Falha ao importar arquivo"
      );
    }
  },

  exportReport: async (params) => {
    try {
      const response = await axiosInstance.post("/reports/export", params);
      // Se a resposta for string, faz o parse para objeto
      if (typeof response.data === "string") {
        return JSON.parse(response.data);
      }
      return response.data;
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      let message = error.message;
      if (error.response) {
        message = error.response.data?.message || message;
      }
      throw new Error(message);
    }
  },

  listAllPharmacies: async () => {
    try {
      const response = await axiosInstance.get("/pharmacies/list");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar farmácias:", error);
      throw error;
    }
  },

  registerPharmacy: async (data) => {
    try {
      const response = await axiosInstance.post("/pharmacies/register", data);
      return response.data;
    } catch (error) {
      console.error("Erro ao registrar farmácia:", error);
      throw error;
    }
  },

  getPharmacyById: async (pharmacyId) => {
    try {
      const userData = getUserData();
      if (!userData) {
        throw new Error("Usuário não autenticado");
      }

      const response = await axiosInstance.get(`/pharmacies/${pharmacyId}`, {
        headers: {
          userId: userData.userId,
          role: Array.isArray(userData.roles)
            ? userData.roles[0]
            : userData.roles,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar farmácia:", error);
      throw error;
    }
  },

  updatePharmacy: async (pharmacyId, data) => {
    try {
      const userData = getUserData();
      if (!userData) {
        throw new Error("Usuário não autenticado");
      }

      const response = await axiosInstance.put(
        `/pharmacies/${pharmacyId}`,
        data,
        {
          headers: {
            userId: userData.userId,
            role: Array.isArray(userData.roles)
              ? userData.roles[0]
              : userData.roles,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar farmácia:", error);
      throw error;
    }
  },

  deletePharmacy: async (pharmacyId) => {
    try {
      const response = await axiosInstance.delete(`/pharmacies/${pharmacyId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar farmácia:", error);
      throw error;
    }
  },

  addEmployeeToPharmacy: async (data) => {
    try {
      const response = await axiosInstance.post(
        "/pharmacies/employees/add",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao registrar farmácia:", error);
      throw error;
    }
  },

  promoteEmployee: async (employeeId, pharmacyId) => {
    try {
      const response = await axiosInstance.post(
        `/pharmacies/employees/promote/${employeeId}/${pharmacyId}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao registrar farmácia:", error);
      throw error;
    }
  },

  dismissEmployee: async (employeeId, pharmacyId) => {
    try {
      const response = await axiosInstance.post(
        `/pharmacies/employees/dismiss/${employeeId}/${pharmacyId}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao registrar farmácia:", error);
      throw error;
    }
  },

  // Método para atualizar dados do usuário
  updateUser: async (userId, userData) => {
    try {
      const response = await axiosInstance.put(
        `/auth/update-user/${userId}`,
        userData
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw error;
    }
  },

  // Método para solicitar troca de senha
  requestPasswordChange: async (userId, passwordData) => {
    try {
      const response = await axiosInstance.post(
        `/auth/request-password-change/${userId}`,
        passwordData
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao solicitar troca de senha:", error);
      throw error;
    }
  },

  // Método para confirmar troca de senha
  confirmPasswordChange: async (token, newPassword) => {
    try {
      const formData = new URLSearchParams();
      formData.append("newPassword", newPassword);
      formData.append("token", token);

      const response = await axiosInstance.post(
        "/auth/confirm-password-change",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao confirmar troca de senha:", error);
      throw error;
    }
  },

  // Método para buscar usuário por ID
  getUserById: async (userId) => {
    try {
      const response = await axiosInstance.get(`/auth/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      throw error;
    }
  },

  exportClientReportPDF: async (params) => {
    try {
      const userData = getUserData();
      const response = await axiosInstance.post(
        "/reports/export-client-pdf",
        params,
        {
          responseType: "blob",
          headers: {
            Authorization: userData?.token
              ? `Bearer ${userData.token}`
              : undefined,
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Erro ao exportar relatório PDF:", error);
      let message = error.message;
      if (error.response) {
        message = error.response.data?.message || message;
      }
      throw new Error(message);
    }
  },

  exportStockReportPDF: async (params) => {
    try {
      const userData = getUserData();
      const response = await axiosInstance.post(
        "/reports/export-stock-pdf",
        params,
        {
          responseType: "blob",
          headers: {
            Authorization: userData?.token
              ? `Bearer ${userData.token}`
              : undefined,
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Erro ao exportar relatório de estoque PDF:", error);
      let message = error.message;
      if (error.response) {
        message = error.response.data?.message || message;
      }
      throw new Error(message);
    }
  },

  exportEmployeeReportPDF: async (params) => {
    try {
      const userData = getUserData();
      const response = await axiosInstance.post(
        "/reports/export-employee-pdf",
        params,
        {
          responseType: "blob",
          headers: {
            Authorization: userData?.token
              ? `Bearer ${userData.token}`
              : undefined,
          },
        }
      );
      return response;
    } catch (error) {
      console.error("Erro ao exportar relatório de funcionários PDF:", error);
      let message = error.message;
      if (error.response) {
        message = error.response.data?.message || message;
      }
      throw new Error(message);
    }
  },

  // Métodos para gestão de funcionários
  getPharmacyEmployees: async (pharmacyId) => {
    try {
      const userData = getUserData();
      if (!userData) {
        throw new Error("Usuário não autenticado");
      }

      const response = await axiosInstance.get(
        `/pharmacies/${pharmacyId}/employees`,
        {
          headers: {
            userId: userData.userId,
            role: Array.isArray(userData.roles)
              ? userData.roles[0]
              : userData.roles,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      throw error;
    }
  },

  addEmployeeToPharmacy: async (pharmacyId, employeeData) => {
    try {
      const userData = getUserData();
      if (!userData) {
        throw new Error("Usuário não autenticado");
      }

      const response = await axiosInstance.post(
        `/pharmacies/${pharmacyId}/employees`,
        employeeData,
        {
          headers: {
            userId: userData.userId,
            role: Array.isArray(userData.roles)
              ? userData.roles[0]
              : userData.roles,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao adicionar funcionário:", error);
      throw error;
    }
  },

  removeEmployeeFromPharmacy: async (pharmacyId, employeeId) => {
    try {
      const userData = getUserData();
      if (!userData) {
        throw new Error("Usuário não autenticado");
      }

      const response = await axiosInstance.delete(
        `/pharmacies/${pharmacyId}/employees/${employeeId}`,
        {
          headers: {
            userId: userData.userId,
            role: Array.isArray(userData.roles)
              ? userData.roles[0]
              : userData.roles,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao remover funcionário:", error);
      throw error;
    }
  },

  promoteEmployeeToManager: async (pharmacyId, employeeId) => {
    try {
      const userData = getUserData();
      if (!userData) {
        throw new Error("Usuário não autenticado");
      }

      const response = await axiosInstance.put(
        `/pharmacies/${pharmacyId}/employees/${employeeId}/promote`,
        {},
        {
          headers: {
            userId: userData.userId,
            role: Array.isArray(userData.roles)
              ? userData.roles[0]
              : userData.roles,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao promover funcionário:", error);
      throw error;
    }
  },

  getMyPharmacy: async () => {
    try {
      const userData = getUserData();
      if (!userData) {
        throw new Error("Usuário não autenticado");
      }
      const response = await axiosInstance.get("/pharmacies/my", {
        headers: {
          userId: userData.userId,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar sua farmácia:", error);
      throw error;
    }
  },
};

export default PharmService;
