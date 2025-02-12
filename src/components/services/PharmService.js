import axios from "axios";
import Cookies from "js-cookie";

// const API_BASE_URL = "http://localhost:8080/api";
const API_BASE_URL = "https://pharm-service-api-629de3f47ddb.herokuapp.com/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar o token a todas as requisições
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token && !config.url.includes("/auth/")) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const PharmService = {
  // Método para fazer login
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      // Salvar token e informações do usuário nos cookies
      Cookies.set("token", response.data.token);
      Cookies.set("name", response.data.name);
      Cookies.set("roles", response.data.roles);
      Cookies.set("userId", response.data.userId);
      if (
        response.data.roles.includes("FARMACIA") ||
        response.data.roles.includes("GERENTE")
      ) {
        Cookies.set("pharmacyId", response.data.idPharmacy);
      }
      return response.data;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
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
      const response = await axiosInstance.get("/medicine/all");
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
      const response = await axiosInstance.get(
        `/medicine/pharmacy/${pharmacyId}`
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
      const response = await axiosInstance.post(
        "/medicineFarm/create",
        medicineData
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
      const response = await axiosInstance.put(
        `/medicineFarm/update/${id}`,
        medicineData
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
      const response = await axiosInstance.delete(`/medicineFarm/delete/${id}`);
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
      const response = await axiosInstance.post(
        "/reservations/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao criar reserva:", error);
      throw new Error(`Failed to create reservation. ${error.message}`);
    }
  },

  // PharmService.js
  getReservationsByUser: async () => {
    try {
      const response = await axiosInstance.get(`/reservations/user`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
      throw error;
    }
  },

  getAllReservations: async () => {
    try {
      const response = await axiosInstance.get("/reservations/list", {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
      throw error;
    }
  },

  cancelReservation: async (reservationId) => {
    try {
      await axiosInstance.post(`/reservations/cancel/${reservationId}`, null, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
    } catch (error) {
      console.error("Erro ao cancelar reserva:", error);
      throw error;
    }
  },

  manageReservation: async (reservationId, status, message) => {
    try {
      await axiosInstance.post("/reservations/manage", null, {
        params: {
          reservationId,
          status,
          message,
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
    } catch (error) {
      console.error("Erro ao gerenciar reserva:", error);
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
      const response = await axiosInstance.get("/medicines/alert", {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar alertas:", error);
      throw error;
    }
  },

  deleteAlert: async (alertId) => {
    try {
      await axiosInstance.delete(`/medicines/alert/${alertId}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
    } catch (error) {
      console.error("Erro ao deletar alerta:", error);
      throw error;
    }
  },

  // Método para buscar todos os funcionários (ADMIN)
  getAllEmployees: async () => {
    try {
      const response = await axiosInstance.get("/pharmacies/employees/all");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      throw error;
    }
  },

  // Método para buscar funcionários de uma farmácia específica (GERENTE)
  getPharmacyEmployees: async (pharmacyId) => {
    try {
      const response = await axiosInstance.get(
        `/pharmacies/${pharmacyId}/employees`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar funcionários da farmácia:", error);
      throw error;
    }
  },

  // Método para adicionar um novo funcionário
  addEmployee: async (pharmacyId, employeeEmail) => {
    try {
      const response = await axiosInstance.post("/pharmacies/employees/add", {
        pharmacyId,
        employeeEmail,
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao adicionar funcionário:", error);
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
    console.log(email);
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
    console.log(token, newPassword);
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
      const response = await axiosInstance.post(
        `/medicine/import-medicines/${pharmacyId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
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
};

export default PharmService;
