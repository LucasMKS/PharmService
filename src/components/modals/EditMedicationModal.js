import React, { useState, useEffect } from "react";
import PharmService from "../services/PharmService";
import {
  FiEdit,
  FiPackage,
  FiArchive,
  FiX,
  FiAlertCircle,
  FiDroplet,
  FiGrid,
  FiLayers,
  FiTag,
  FiFileText,
} from "react-icons/fi";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const EditMedicationModal = ({
  isOpen,
  selectedMedicine,
  onClose,
  onSave,
  showToast,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm({
    defaultValues: {
      medicineName: selectedMedicine?.medicineName || "",
      quantity: selectedMedicine?.quantity || 0,
      category: selectedMedicine?.category || "",
      dosageForm: selectedMedicine?.dosageForm || "",
      manufacturer: selectedMedicine?.manufacturer || "",
      classification: selectedMedicine?.classification || "",
      requiresPrescription: selectedMedicine?.requiresPrescription || false,
    },
  });

  useEffect(() => {
    reset({
      medicineName: selectedMedicine?.medicineName || "",
      quantity: selectedMedicine?.quantity || 0,
      category: selectedMedicine?.category || "",
      dosageForm: selectedMedicine?.dosageForm || "",
      manufacturer: selectedMedicine?.manufacturer || "",
      classification: selectedMedicine?.classification || "",
      requiresPrescription: selectedMedicine?.requiresPrescription || false,
    });
  }, [selectedMedicine, reset]);

  const onSubmit = async (data) => {
    try {
      setIsUpdating(true);
      data.requiresPrescription = !!data.requiresPrescription;
      await PharmService.updateMedicine(selectedMedicine.pharmacy.id, data);
      onSave();
      onClose();
      showToast("Medicamento atualizado com sucesso!");
    } catch (error) {
      showToast(`Erro ao atualizar: ${error.response?.data?.error}`, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FiEdit className="w-6 h-6 text-primary" /> Editar Medicamento
          </DialogTitle>
          <DialogDescription>
            Altere as informações do medicamento abaixo e clique em Salvar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="medicineName" className="flex items-center gap-2">
                <FiPackage className="w-4 h-4 text-primary" /> Nome do
                Medicamento
              </Label>
              <Input
                id="medicineName"
                type="text"
                placeholder="Ex: Paracetamol 500mg"
                {...register("medicineName", { required: "Campo obrigatório" })}
                className={errors.medicineName ? "border-destructive" : ""}
                disabled={isUpdating}
              />
              {errors.medicineName && (
                <div className="flex items-center gap-2 mt-1 text-destructive text-xs">
                  <FiAlertCircle className="w-4 h-4" />
                  {errors.medicineName.message}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="quantity" className="flex items-center gap-2">
                <FiArchive className="w-4 h-4 text-primary" /> Quantidade
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                placeholder="Ex: 150"
                {...register("quantity", {
                  required: "Campo obrigatório",
                  min: { value: 0, message: "Valor mínimo é 0" },
                })}
                className={errors.quantity ? "border-destructive" : ""}
                disabled={isUpdating}
              />
              {errors.quantity && (
                <div className="flex items-center gap-2 mt-1 text-destructive text-xs">
                  <FiAlertCircle className="w-4 h-4" />
                  {errors.quantity.message}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="category" className="flex items-center gap-2">
                <FiGrid className="w-4 h-4 text-primary" /> Categoria
              </Label>
              <Select
                onValueChange={(value) => {
                  reset({ ...getValues(), category: value });
                }}
                defaultValue={selectedMedicine?.category || ""}
                disabled={isUpdating}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Antidiabético">Antidiabético</SelectItem>
                  <SelectItem value="Antiviral">Antiviral</SelectItem>
                  <SelectItem value="Analgésico">Analgésico</SelectItem>
                  <SelectItem value="Antibiótico">Antibiótico</SelectItem>
                  <SelectItem value="Antiinflamatório">
                    Antiinflamatório
                  </SelectItem>
                  <SelectItem value="Antihipertensivo">
                    Antihipertensivo
                  </SelectItem>
                  <SelectItem value="Ansiolítico">Ansiolítico</SelectItem>
                  <SelectItem value="Antidepressivo">Antidepressivo</SelectItem>
                  <SelectItem value="Antifúngico">Antifúngico</SelectItem>
                  <SelectItem value="Antialérgico">Antialérgico</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <div className="flex items-center gap-2 mt-1 text-destructive text-xs">
                  <FiAlertCircle className="w-4 h-4" />
                  {errors.category.message}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="dosageForm" className="flex items-center gap-2">
                <FiLayers className="w-4 h-4 text-primary" /> Forma Farmacêutica
              </Label>
              <Select
                onValueChange={(value) => {
                  reset({ ...getValues(), dosageForm: value });
                }}
                defaultValue={selectedMedicine?.dosageForm || ""}
                disabled={isUpdating}
              >
                <SelectTrigger id="dosageForm">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Comprimido">Comprimido</SelectItem>
                  <SelectItem value="Cápsula">Cápsula</SelectItem>
                  <SelectItem value="Xarope">Xarope</SelectItem>
                  <SelectItem value="Pomada">Pomada</SelectItem>
                  <SelectItem value="Injeção">Injeção</SelectItem>
                  <SelectItem value="Creme">Creme</SelectItem>
                  <SelectItem value="Gotas">Gotas</SelectItem>
                  <SelectItem value="Inalador">Inalador</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
              {errors.dosageForm && (
                <div className="flex items-center gap-2 mt-1 text-destructive text-xs">
                  <FiAlertCircle className="w-4 h-4" />
                  {errors.dosageForm.message}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="manufacturer" className="flex items-center gap-2">
                <FiTag className="w-4 h-4 text-primary" /> Fabricante
              </Label>
              <Input
                id="manufacturer"
                type="text"
                placeholder="Ex: EMS"
                {...register("manufacturer", { required: "Campo obrigatório" })}
                className={errors.manufacturer ? "border-destructive" : ""}
                disabled={isUpdating}
              />
              {errors.manufacturer && (
                <div className="flex items-center gap-2 mt-1 text-destructive text-xs">
                  <FiAlertCircle className="w-4 h-4" />
                  {errors.manufacturer.message}
                </div>
              )}
            </div>
            <div>
              <Label
                htmlFor="classification"
                className="flex items-center gap-2"
              >
                <FiFileText className="w-4 h-4 text-primary" /> Classificação
              </Label>
              <Input
                id="classification"
                type="text"
                placeholder="Ex: Tarja Vermelha"
                {...register("classification", {
                  required: "Campo obrigatório",
                })}
                className={errors.classification ? "border-destructive" : ""}
                disabled={isUpdating}
              />
              {errors.classification && (
                <div className="flex items-center gap-2 mt-1 text-destructive text-xs">
                  <FiAlertCircle className="w-4 h-4" />
                  {errors.classification.message}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                id="requiresPrescription"
                type="checkbox"
                {...register("requiresPrescription")}
                disabled={isUpdating}
                className="accent-primary w-4 h-4"
              />
              <Label
                htmlFor="requiresPrescription"
                className="flex items-center gap-2"
              >
                <FiDroplet className="w-4 h-4 text-primary" /> Requer Prescrição
              </Label>
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMedicationModal;
