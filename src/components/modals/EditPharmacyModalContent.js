"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  FiHome,
  FiMapPin,
  FiHash,
  FiMap,
  FiFlag,
  FiMail,
  FiPhone,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EditPharmacyModalContent = ({
  pharmacy,
  formData,
  onConfirm,
  onCancel,
  loading,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: formData,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await onConfirm(data);
      reset();
    } catch (error) {
      console.error("Erro ao atualizar farmácia:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Nome da Farmácia
          </Label>
          <div className="relative">
            <FiHome className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              {...register("name", { required: "Nome é obrigatório" })}
              className="pl-10"
              placeholder="Nome da farmácia"
            />
          </div>
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Telefone
          </Label>
          <div className="relative">
            <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              id="phone"
              {...register("phone", { required: "Telefone é obrigatório" })}
              className="pl-10"
              placeholder="(11) 99999-9999"
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            Endereço
          </Label>
          <div className="relative">
            <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              id="address"
              {...register("address", { required: "Endereço é obrigatório" })}
              className="pl-10"
              placeholder="Rua das Flores"
            />
          </div>
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="number" className="text-sm font-medium">
            Número
          </Label>
          <div className="relative">
            <FiHash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              id="number"
              {...register("number", { required: "Número é obrigatório" })}
              className="pl-10"
              placeholder="123"
            />
          </div>
          {errors.number && (
            <p className="text-sm text-destructive">{errors.number.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="neighborhood" className="text-sm font-medium">
            Bairro
          </Label>
          <div className="relative">
            <FiMap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              id="neighborhood"
              {...register("neighborhood", {
                required: "Bairro é obrigatório",
              })}
              className="pl-10"
              placeholder="Centro"
            />
          </div>
          {errors.neighborhood && (
            <p className="text-sm text-destructive">
              {errors.neighborhood.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium">
            Cidade
          </Label>
          <div className="relative">
            <FiMap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              id="city"
              {...register("city", { required: "Cidade é obrigatória" })}
              className="pl-10"
              placeholder="São Paulo"
            />
          </div>
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state" className="text-sm font-medium">
            Estado
          </Label>
          <div className="relative">
            <FiFlag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              id="state"
              {...register("state", { required: "Estado é obrigatório" })}
              className="pl-10"
              placeholder="SP"
              maxLength={2}
            />
          </div>
          {errors.state && (
            <p className="text-sm text-destructive">{errors.state.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode" className="text-sm font-medium">
            CEP
          </Label>
          <div className="relative">
            <FiHash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              id="zipCode"
              {...register("zipCode", { required: "CEP é obrigatório" })}
              className="pl-10"
              placeholder="01234-567"
            />
          </div>
          {errors.zipCode && (
            <p className="text-sm text-destructive">{errors.zipCode.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || loading}>
          {isSubmitting ? "Atualizando..." : "Atualizar Farmácia"}
        </Button>
      </div>
    </form>
  );
};

export default EditPharmacyModalContent;
