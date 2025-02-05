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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <FiCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Senha redefinida com sucesso!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Redirecionando para o login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-100 dark:bg-gray-700 rounded-full mb-4">
            <FiLock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Redefinir Senha
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Digite sua nova senha
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="form-control">
            <label className="label justify-start gap-2">
              <FiLock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <span className="label-text dark:text-gray-300">Nova Senha</span>
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
              className="input input-bordered bg-white dark:bg-gray-700"
              placeholder="••••••••"
            />
            {errors.newPassword && (
              <div className="flex items-center gap-2 mt-2 text-error">
                <FiAlertCircle className="text-sm" />
                <span className="text-sm">{errors.newPassword.message}</span>
              </div>
            )}
          </div>

          <div className="form-control">
            <label className="label justify-start gap-2">
              <FiLock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <span className="label-text dark:text-gray-300">
                Confirmar Senha
              </span>
            </label>
            <input
              type="password"
              {...register("confirmPassword", {
                required: "Confirme sua senha",
                validate: (val) =>
                  val === watch("newPassword") || "Senhas não coincidem",
              })}
              className="input input-bordered bg-white dark:bg-gray-700"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <div className="flex items-center gap-2 mt-2 text-error">
                <FiAlertCircle className="text-sm" />
                <span className="text-sm">
                  {errors.confirmPassword.message}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="alert alert-error py-2">
              <FiAlertCircle className="text-lg" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full gap-2 hover:scale-[1.02] transition-transform"
          >
            Redefinir Senha
            <FiArrowRight className="text-lg" />
          </button>
        </form>
      </div>
    </div>
  );
}
