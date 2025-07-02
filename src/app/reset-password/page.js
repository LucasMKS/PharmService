"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import PharmService from "@/components/services/PharmService";
import {
  FiLock,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";

export default function ResetPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const onSubmit = async (data) => {
    try {
      if (!token) throw new Error("Token inválido");
      await PharmService.resetPassword(token, data.newPassword);
      setSuccess(true);
      setTimeout(() => router.push("/auth"), 3000);
    } catch (error) {
      setError(error.message || "Erro ao redefinir a senha");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card p-8 rounded-lg shadow-md max-w-md w-full text-center border border-border">
          <FiCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-card-foreground mb-2">
            Senha redefinida com sucesso!
          </h2>
          <p className="text-muted-foreground">
            Redirecionando para o login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card p-8 rounded-lg shadow-md max-w-md w-full border border-border">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-muted rounded-full mb-4">
            <FiLock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-card-foreground mb-2">
            Redefinir Senha
          </h2>
          <p className="text-muted-foreground">Digite sua nova senha</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FiLock className="w-5 h-5 text-primary" />
              <span>Nova Senha</span>
            </label>
            <input
              type="password"
              {...register("newPassword", {
                required: "Campo obrigatório",
                minLength: {
                  value: 6,
                  message: "Mínimo de 6 caracteres",
                },
              })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="••••••••"
            />
            {errors.newPassword && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <FiAlertCircle className="text-sm" />
                <span>{errors.newPassword.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FiLock className="w-5 h-5 text-primary" />
              <span>Confirmar Senha</span>
            </label>
            <input
              type="password"
              {...register("confirmPassword", {
                required: "Confirme sua senha",
                validate: (val) =>
                  val === watch("newPassword") || "Senhas não coincidem",
              })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <FiAlertCircle className="text-sm" />
                <span>{errors.confirmPassword.message}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm border border-destructive/50 bg-destructive/10 text-destructive rounded-md">
              <FiAlertCircle className="text-lg" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2 gap-2"
          >
            Redefinir Senha
            <FiArrowRight className="text-lg" />
          </button>
        </form>
      </div>
    </div>
  );
}
