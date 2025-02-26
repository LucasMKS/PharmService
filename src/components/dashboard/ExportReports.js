import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiDownloadCloud } from "react-icons/fi";
import PharmService from "../services/PharmService";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

const ExportReports = () => {
  const [reportType, setReportType] = useState("stock");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [format, setFormat] = useState("pdf");
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  const formatDate = (date, isEnd = false) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Mês começa em 0
    const day = String(date.getDate()).padStart(2, "0");
    const hours = isEnd ? "23" : "00";
    const minutes = isEnd ? "59" : "00";
    const seconds = isEnd ? "59" : "00";

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };
  const pharmacyName = Cookies.get("pharmacyName");
  const pharmacyId = Cookies.get("pharmacyId");
  const name = Cookies.get("name");

  const handleExport = async (e) => {
    e.preventDefault();

    // Validar datas
    if (startDate > endDate) {
      toast.error("Data final não pode ser anterior à data inicial");
      return;
    }

    setLoading(true);

    try {
      const params = {
        reportType,
        format,
        start: formatDate(startDate),
        end: formatDate(endDate, true),
        pharmacyId,
        pharmacyName,
        name,
        clientId: reportType === "clients" ? clientId : undefined,
        userId: reportType === "employees" ? employeeId : undefined,
      };

      await PharmService.exportReport(params);
      toast.success("Relatório gerado com sucesso!");
    } catch (error) {
      toast.error(`Erro ao gerar relatório: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-100 dark:bg-slate-900 min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-neutral-600 dark:bg-neutral-900 rounded-lg shadow-lg shadow-neutral-950 overflow-hidden">
        <div className="p-6 min-w-full inline-block align-middle">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 dark:text-white">
            <FiDownloadCloud className="text-indigo-600 dark:text-indigo-400" />
            Exportar Relatórios
          </h1>

          <form onSubmit={handleExport} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Relatório
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:text-white dark:border-neutral-600"
                >
                  <option value="stock">Estoque</option>
                  <option value="employees">Funcionários</option>
                  <option value="clients">Clientes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Formato
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:text-white dark:border-neutral-600 "
                >
                  <option value="pdf">PDF</option>
                  <option disabled value="excel">
                    Excel
                  </option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Inicial
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={setStartDate}
                  className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:text-white dark:border-neutral-600"
                  dateFormat="dd/MM/yyyy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Final
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:text-white dark:border-neutral-600"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
            </div>

            {reportType === "clients" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ID do Cliente (deixe em branco para todos)
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:text-white dark:border-neutral-600"
                />
              </div>
            )}

            {reportType === "employees" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ID do Funcionário (deixe em branco para todos)
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-neutral-700 dark:text-white dark:border-neutral-600"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 dark:bg-indigo-700 text-white py-2 px-4 rounded-md 
                     hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors 
                     disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Gerando Relatório..." : "Exportar Relatório"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExportReports;
