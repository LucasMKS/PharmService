import React from "react";
import { useForm } from "react-hook-form";
import PharmService from "../services/PharmService";
import { FiBox, FiAlertCircle, FiPlus, FiX } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AddMedication = ({
  pharmacyId,
  onMedicationAdded,
  roles,
  loading,
  error,
  onCancel,
  showToast,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      medicineName: "",
      idPharmacy: pharmacyId || "",
      quantity: "",
      manufacturer: "",
      category: "",
      dosageForm: "",
      classification: "",
    },
  });

  const handleAddMedication = async (data) => {
    try {
      const finalPharmacyId =
        roles === "GERENTE" ? pharmacyId : data.idPharmacy;
      if (!finalPharmacyId) {
        showToast
          ? showToast("ID da farmácia é obrigatório", "error")
          : alert("ID da farmácia é obrigatório");
        return;
      }
      await PharmService.addMedicine(data);
      reset({ medicineName: "", quantity: "", idPharmacy: pharmacyId || "" });
      showToast
        ? showToast("Medicamento adicionado com sucesso!", "success")
        : alert("Medicamento adicionado com sucesso!");
      if (onMedicationAdded) onMedicationAdded();
    } catch (error) {
      showToast
        ? showToast(
            "Não foi possível adicionar o medicamento. " +
              (error.message || ""),
            "error"
          )
        : alert(
            "Não foi possível adicionar o medicamento. " + (error.message || "")
          );
    }
  };

  return (
    <form onSubmit={handleSubmit(handleAddMedication)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="medicineName" className="flex items-center gap-2">
            <FiBox className="w-4 h-4 text-primary" /> Nome do Medicamento
          </Label>
          <Input
            id="medicineName"
            type="text"
            {...register("medicineName", { required: "Campo obrigatório" })}
            className={errors.medicineName ? "border-destructive" : ""}
            disabled={loading}
          />
          {errors.medicineName && (
            <div className="flex items-center gap-2 mt-1 text-destructive text-xs">
              <FiAlertCircle className="w-4 h-4" />
              {errors.medicineName.message}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity" className="flex items-center gap-2">
            <FiBox className="w-4 h-4 text-primary" /> Quantidade
          </Label>
          <Input
            id="quantity"
            type="number"
            {...register("quantity", {
              required: "Campo obrigatório",
              min: { value: 0, message: "Valor mínimo é 0" },
            })}
            className={errors.quantity ? "border-destructive" : ""}
            disabled={loading}
          />
          {errors.quantity && (
            <div className="flex items-center gap-2 mt-1 text-destructive text-xs">
              <FiAlertCircle className="w-4 h-4" />
              {errors.quantity.message}
            </div>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="manufacturer" className="flex items-center gap-2">
          <FiBox className="w-4 h-4 text-primary" /> Fabricante
        </Label>
        <Input
          id="manufacturer"
          type="text"
          {...register("manufacturer", { required: "Campo obrigatório" })}
          className={errors.manufacturer ? "border-destructive" : ""}
          disabled={loading}
        />
        {errors.manufacturer && (
          <div className="flex items-center gap-2 mt-1 text-destructive text-xs">
            <FiAlertCircle className="w-4 h-4" />
            {errors.manufacturer.message}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category" className="flex items-center gap-2">
            <FiBox className="w-4 h-4 text-primary" /> Categoria
          </Label>
          <Select
            onValueChange={(value) => setValue("category", value)}
            defaultValue=""
            disabled={loading}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Antidiabético">Antidiabético</SelectItem>
              <SelectItem value="Antiviral">Antiviral</SelectItem>
              <SelectItem value="Analgésico">Analgésico</SelectItem>
              <SelectItem value="Antibiótico">Antibiótico</SelectItem>
              <SelectItem value="Antiinflamatório">Antiinflamatório</SelectItem>
              <SelectItem value="Antihipertensivo">Antihipertensivo</SelectItem>
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
        <div className="space-y-2">
          <Label htmlFor="dosageForm" className="flex items-center gap-2">
            <FiBox className="w-4 h-4 text-primary" /> Forma farmacêutica
          </Label>
          <Input
            id="dosageForm"
            type="text"
            {...register("dosageForm", { required: "Campo obrigatório" })}
            className={errors.dosageForm ? "border-destructive" : ""}
            disabled={loading}
          />
          {errors.dosageForm && (
            <div className="flex items-center gap-2 mt-1 text-destructive text-xs">
              <FiAlertCircle className="w-4 h-4" />
              {errors.dosageForm.message}
            </div>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="classification" className="flex items-center gap-2">
          <FiBox className="w-4 h-4 text-primary" /> Classificação
        </Label>
        <Input
          id="classification"
          type="text"
          {...register("classification", { required: "Campo obrigatório" })}
          className={errors.classification ? "border-destructive" : ""}
          disabled={loading}
        />
        {errors.classification && (
          <div className="flex items-center gap-2 mt-1 text-destructive text-xs">
            <FiAlertCircle className="w-4 h-4" />
            {errors.classification.message}
          </div>
        )}
      </div>
      <div className="space-y-2 flex items-center gap-2 mt-2">
        <input
          id="requiresPrescription"
          type="checkbox"
          {...register("requiresPrescription")}
          disabled={loading}
          className="accent-primary w-4 h-4"
        />
        <Label
          htmlFor="requiresPrescription"
          className="flex items-center gap-2"
        >
          <FiBox className="w-4 h-4 text-primary" /> Requer Prescrição
        </Label>
      </div>
      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm flex items-center gap-2 mt-2">
          <FiX className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      <div className="flex justify-end gap-2 mt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? (
            <span className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></span>
          ) : (
            <FiPlus className="text-lg" />
          )}
          Adicionar
        </Button>
      </div>
    </form>
  );
};

export default AddMedication;
