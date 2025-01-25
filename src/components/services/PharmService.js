import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = "http://localhost:8080/api";

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
      if (response.data.roles.includes("FARMACIA") || response.data.roles.includes("GERENTE")) {
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
      const response = await axiosInstance.get(`/medicine/pharmacy/${pharmacyId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar medicamento:", error);
      throw error;
    }
  },

  // Método para adicionar um novo medicamento
  addMedicine: async (medicineData) => {
    try {
      const response = await axiosInstance.post("/medicineFarm/create", medicineData);
      return response.data;
    } catch (error) {
      console.error("Network Error Details:", {
        message: error.message,
        code: error.code,
        config: error.config,
        response: error.response
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
      throw error;
    }
  },

  // Método para deletar um medicamento
  deleteMedicine: async (id) => {
    try {
      const response = await axiosInstance.delete(`/medicineFarm/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar medicamento:", error);
      throw error;
    }
  },

  // Método para verificar disponibilidade de um medicamento
  checkMedicineAvailability: async (id) => {
    try {
      const response = await axiosInstance.get(`/medicines/${id}/availability`);
      return response.data;
    } catch (error) {
      console.error("Erro ao verificar disponibilidade do medicamento:", error);
      throw error;
    }
  },

  createReservation: async (formData) => {
    try {
      const response = await axiosInstance.post("/reservations/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      console.error("Erro ao criar reserva:", error)
      throw error
    }
  },

};

export default PharmService;
