import React, { useState } from "react";
import { FiPackage, FiUploadCloud, FiFile, FiCheck, FiX } from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ReservationModalContent = ({
  isOpen = true,
  medicineName,
  requiresPrescription,
  onConfirm,
  onCancel,
  loading,
  showToast,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async (file) => {
    if (isSubmitting || loading) return; // Prevenir múltiplos cliques

    setIsSubmitting(true);
    try {
      await onConfirm(file);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FiPackage className="w-6 h-6 text-primary" /> Reservar{" "}
            {medicineName}
          </DialogTitle>
          <DialogDescription>
            {requiresPrescription
              ? "Envie a prescrição médica para concluir a reserva."
              : `O medicamento ${medicineName} não requer prescrição médica.`}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          {requiresPrescription ? (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <FiFile className="w-5 h-5 text-primary" /> Prescrição Médica
                (PDF ou imagem)
              </label>
              <div className="relative group">
                <div
                  className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg transition-all ${
                    loading || isSubmitting
                      ? "border-gray-200 bg-gray-50 opacity-50"
                      : selectedFile
                      ? "border-green-100 bg-green-50"
                      : "border-blue-200 hover:border-blue-300 bg-background"
                  }`}
                >
                  <FiUploadCloud className="w-8 h-8 text-blue-400 mb-2" />
                  <span className="text-sm text-muted-foreground">
                    {selectedFile?.name || "Arraste ou clique para enviar"}
                  </span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className={`absolute inset-0 w-full h-full opacity-0 ${
                      loading || isSubmitting
                        ? "cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    onChange={handleFileChange}
                    disabled={loading || isSubmitting}
                  />
                </div>
              </div>
              {selectedFile && (
                <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                  <FiFile className="flex-shrink-0" />
                  <span className="truncate">{selectedFile.name}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-4">
              Deseja continuar com a reserva?
            </p>
          )}
        </div>
        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading || isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => handleConfirm(selectedFile)}
            disabled={
              (requiresPrescription && !selectedFile) || loading || isSubmitting
            }
            className="gap-2"
          >
            {loading || isSubmitting ? (
              <>
                <span className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></span>
                Processando...
              </>
            ) : (
              <>
                <FiCheck className="text-lg" />
                Confirmar Reserva
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationModalContent;
