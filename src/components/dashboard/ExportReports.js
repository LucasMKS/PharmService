"use client";
import React, { useState } from "react";
import { FiDownloadCloud } from "react-icons/fi";
import PharmService from "../services/PharmService";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ExportReports = () => {
  const [reportType, setReportType] = useState("stock");
  const [format, setFormat] = useState("pdf");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [clientId, setClientId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleExport = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const reportData = {
        reportType,
        format,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        pharmacyId: null, // Ajuste conforme necessário
        pharmacyName: "",
        name: "",
        clientId: reportType === "clients" && clientId ? clientId : null,
        employeeId:
          reportType === "employees" && employeeId ? employeeId : null,
      };

      const response = await PharmService.exportReport(reportData);

      if (response.success && response.downloadUrl) {
        // Abrir o PDF em nova aba
        window.open(response.downloadUrl, "_blank", "noopener,noreferrer");
        showToast("Relatório exportado com sucesso!");
      } else {
        showToast(response.message || "Erro ao exportar relatório", "error");
      }
    } catch (error) {
      showToast(error.message || "Erro ao exportar relatório", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl shadow-lg border border-border rounded-lg overflow-hidden">
        <div className="p-6 min-w-full inline-block align-middle">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
            <FiDownloadCloud className="text-primary" />
            Exportar Relatórios
          </h1>

          <form onSubmit={handleExport} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Tipo de Relatório
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="stock">Estoque</option>
                  <option value="employees">Funcionários</option>
                  <option value="clients">Clientes</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Formato
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="pdf">PDF</option>
                  <option disabled value="excel">
                    Excel
                  </option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Data Inicial
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={setStartDate}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  dateFormat="dd/MM/yyyy"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Data Final
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
            </div>

            {reportType === "clients" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  ID do Cliente (deixe em branco para todos)
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            )}

            {reportType === "employees" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  ID do Funcionário (deixe em branco para todos)
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2"
            >
              {loading ? "Gerando Relatório..." : "Exportar Relatório"}
            </button>
          </form>
        </div>
      </div>

      {toast.show && (
        <div className="toast toast-top toast-end z-50">
          <div
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow transition-colors ${
              toast.type === "error" ? "bg-destructive" : "bg-chart-2"
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportReports;
