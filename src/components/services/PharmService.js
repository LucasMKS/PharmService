import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
// localhost:8080/api/auth/login
const PharmService = {
  // Método para fazer login
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      console.error("Erro ao fazer login:", error.response);
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
      const response = await axiosInstance.get("/medicines");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar medicamentos:", error);
      throw error;
    }
  },

  // Método para buscar um medicamento específico
  getMedicineById: async (id) => {
    try {
      const response = await axiosInstance.get(`/medicines/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar medicamento:", error);
      throw error;
    }
  },

  // Método para adicionar um novo medicamento
  addMedicine: async (medicineData) => {
    try {
      const response = await axiosInstance.post("/medicines", medicineData);
      return response.data;
    } catch (error) {
      console.error("Erro ao adicionar medicamento:", error);
      throw error;
    }
  },

  // Método para atualizar um medicamento
  updateMedicine: async (id, medicineData) => {
    try {
      const response = await axiosInstance.put(
        `/medicines/${id}`,
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
      const response = await axiosInstance.delete(`/medicines/${id}`);
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
};

export default PharmService;
