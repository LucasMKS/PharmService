"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
} from "react-icons/fi";
import PharmService from "../services/PharmService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const UserSettingsModalContent = ({
  isOpen = true,
  user,
  onClose,
  onUpdate,
}) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const showMessage = (type, text) => {
    setMessage({ type, text });
  };

  const clearMessage = () => {
    setMessage({ type: "", text: "" });
  };

  const onSubmit = async (data) => {
    setLoading(true);
    clearMessage();

    try {
      const userData = JSON.parse(sessionStorage.getItem("user"));
      if (!userData || !userData.userId) {
        throw new Error("Usuário não autenticado");
      }

      // Preparar dados para envio
      const updateData = {
        name: data.name,
        email: data.email,
      };

      let response;
      let hasPasswordChange = false;

      response = await PharmService.updateUser(
        parseInt(userData.userId),
        updateData
      );

      if (data.newPassword && data.newPassword.trim() !== "") {
        const passwordData = {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        };
        await PharmService.requestPasswordChange(
          parseInt(userData.userId),
          passwordData
        );
        hasPasswordChange = true;
      }

      if (hasPasswordChange) {
        showMessage(
          "success",
          "Dados pessoais atualizados com sucesso! E-mail de confirmação de senha enviado. Verifique sua caixa de entrada."
        );
      } else {
        showMessage("success", "Dados pessoais atualizados com sucesso!");
      }

      if (response.user) {
        const currentUserData = JSON.parse(
          sessionStorage.getItem("user") || "{}"
        );
        const updatedUserData = { ...currentUserData, ...response.user };
        sessionStorage.setItem("user", JSON.stringify(updatedUserData));
      }

      if (onUpdate) {
        onUpdate(response.user);
      }

      reset({
        name: response.user?.name || data.name,
        email: response.user?.email || data.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(
        () => {
          onClose();
        },
        hasPasswordChange ? 3000 : 2000
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Erro inesperado. Tente novamente.";
      showMessage("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FiUser className="w-5 h-5 text-primary" /> Configurações do Usuário
          </DialogTitle>
          <DialogDescription>
            Atualize suas informações pessoais e senha.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Nome completo
              </label>
              <Input
                type="text"
                {...register("name", { required: "Nome é obrigatório" })}
                placeholder="Seu nome completo"
                disabled={loading}
              />
              {errors.name && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <FiAlertCircle className="w-4 h-4" />
                  <span>{errors.name.message}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                E-mail
              </label>
              <Input
                type="email"
                {...register("email", { required: "E-mail é obrigatório" })}
                placeholder="Seu e-mail"
                disabled={loading}
              />
              {errors.email && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <FiAlertCircle className="w-4 h-4" />
                  <span>{errors.email.message}</span>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <FiLock className="w-4 h-4 text-primary" /> Alterar Senha
            </h4>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Senha atual
              </label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  {...register("currentPassword")}
                  placeholder="Digite sua senha atual"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowCurrentPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Nova senha
              </label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  {...register("newPassword")}
                  placeholder="Digite a nova senha"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowNewPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showNewPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Confirmar nova senha
              </label>
              <Input
                type="password"
                {...register("confirmPassword", {
                  validate: (value) =>
                    !watch("newPassword") ||
                    value === watch("newPassword") ||
                    "As senhas não coincidem",
                })}
                placeholder="Confirme a nova senha"
                disabled={loading}
              />
              {errors.confirmPassword && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <FiAlertCircle className="w-4 h-4" />
                  <span>{errors.confirmPassword.message}</span>
                </div>
              )}
            </div>
          </div>
          {message.text && (
            <div
              className={`rounded-md px-3 py-2 text-sm flex items-center gap-2 mt-2 ${
                message.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {message.type === "success" ? (
                <FiCheckCircle className="w-4 h-4" />
              ) : (
                <FiAlertCircle className="w-4 h-4" />
              )}
              <span>{message.text}</span>
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
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserSettingsModalContent;
