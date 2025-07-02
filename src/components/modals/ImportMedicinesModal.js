import React, { useState, useEffect } from "react";
import { FiUploadCloud, FiX } from "react-icons/fi";
import PharmService from "../services/PharmService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ImportMedicinesModal = ({ isOpen = true, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const userRole =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("user") || "{}").roles
      : null;

  useEffect(() => {
    if (!Array.isArray(userRole) || !userRole.includes("GERENTE")) {
      onClose();
    }
  }, [userRole, onClose]);

  const pharmacyId =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("user") || "{}").pharmacyId
      : null;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Selecione um arquivo Excel válido");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await PharmService.importMedicines(formData, pharmacyId);

      if (response.errors && response.errors.length > 0) {
        setError(`Importação parcial: ${response.errors.join(", ")}`);
      } else {
        setSuccess(true);
        onSuccess?.();
      }
    } catch (err) {
      setError(err.message || "Erro ao importar arquivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FiUploadCloud className="w-6 h-6 text-primary" /> Importar
            Medicamentos via Excel
          </DialogTitle>
          <DialogDescription>
            Envie um arquivo Excel (.xlsx, .xls, .csv) para importar
            medicamentos em lote.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Arquivo</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              disabled={loading}
            />
            <span className="text-xs text-muted-foreground">
              Formatos suportados: .xlsx, .xls, .csv
            </span>
          </div>
          {error && (
            <div className="rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm flex items-center gap-2">
              <FiX className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-100 text-green-800 px-3 py-2 text-sm flex items-center gap-2">
              <span>Arquivo importado com sucesso!</span>
            </div>
          )}
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !file}>
              {loading ? "Enviando..." : "Importar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ImportMedicinesModal;
