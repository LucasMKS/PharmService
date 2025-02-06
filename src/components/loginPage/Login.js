"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import PharmService from "@/components/services/PharmService";
import {
  FiLock,
  FiMail,
  FiUser,
  FiArrowRight,
  FiAlertCircle,
} from "react-icons/fi";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    setError("");
    if (user) router.push("/dashboard");
  }, [user]);

  const onSubmit = async (data) => {
    try {
      if (showForgotPassword) {
        await PharmService.forgotPassword(data.email);
        setError("");
        alert("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
        setShowForgotPassword(false);
      } else {
        isLogin
          ? await PharmService.login(data)
          : await PharmService.register(data);

        router.push("/dashboard");
      }
    } catch (error) {
      setError(
        error.response?.data?.error || "Erro ao processar sua solicitação"
      );
    }
  };

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
        <section className="relative flex h-32 items-end bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6 border-r-2 border-neutral-800">
          <Image
            alt="Night"
            src="/images/login/img4.jpg"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
            layout="fill"
          />

          <div className="hidden lg:relative lg:block lg:p-12">
            <Link href="/" className="block text-white">
              <span className="sr-only">Home</span>
              <Image
                src="/images/pharm/PharmService.png" //
                width={170}
                height={260}
                alt="Logo"
                className="fill-slate-50 rounded-2xl"
              />
            </Link>

            <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
              Bem-vindo ao PharmService 🏥
            </h2>

            <p className="mt-4 leading-relaxed text-white/90">
              Encontre os medicamentos que precisa ou gerencie o estoque da sua
              farmácia de forma eficiente. <br /> Conectamos clientes e
              farmácias para facilitar o acesso a remédios!
            </p>
          </div>
        </section>

        <main className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6 ">
          <div className="w-full max-w-xl lg:max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-block p-3">
                <span className="sr-only">Home</span>
                <Image
                  src="/images/pharm/PharmServiceInv.png" //
                  width={60}
                  height={48}
                  alt="Logo"
                  className="fill-slate-50 rounded-2xl"
                />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {isLogin ? "Acesse sua conta" : "Crie sua conta"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {isLogin
                  ? "Gerencie seu estoque de forma eficiente"
                  : "Comece a gerenciar sua farmácia agora mesmo"}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {showForgotPassword ? (
                <>
                  <div className="form-control">
                    <label className="label justify-start gap-2">
                      <FiMail className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                      <span className="label-text dark:text-gray-300">
                        E-mail
                      </span>
                    </label>
                    <input
                      type="email"
                      {...register("email", { required: "Campo obrigatório" })}
                      className="input input-bordered bg-white dark:bg-gray-700"
                      placeholder="exemplo@farmacia.com"
                    />
                    {errors.email && (
                      <div className="flex items-center gap-2 mt-2 text-error">
                        <FiAlertCircle className="text-sm" />
                        <span className="text-sm">{errors.email.message}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full gap-2 hover:scale-[1.02] transition-transform"
                  >
                    Enviar e-mail de recuperação
                    <FiArrowRight className="text-lg" />
                  </button>

                  <p className="text-center text-gray-600 dark:text-gray-400">
                    Lembrou sua senha?{" "}
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      Voltar ao login
                    </button>
                  </p>
                </>
              ) : (
                <>
                  {/* Formulário original de login/registro */}
                  {!isLogin && (
                    <div className="form-control">
                      <label
                        htmlFor="nome"
                        className="label justify-start gap-2"
                      >
                        <FiUser className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                        <span className="label-text dark:text-gray-300">
                          Nome completo
                        </span>
                      </label>

                      <input
                        type="text"
                        {...register("nome", { required: "Campo obrigatório" })}
                        className="input input-bordered bg-white dark:bg-gray-700"
                        placeholder="Ex: João da Silva"
                      />
                      {errors.nome && (
                        <div className="flex items-center gap-2 mt-2 text-error">
                          <FiAlertCircle className="text-sm" />
                          <span className="text-sm">{errors.nome.message}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="form-control">
                    <label className="label justify-start gap-2">
                      <FiMail className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                      <span className="label-text dark:text-gray-300">
                        E-mail
                      </span>
                    </label>
                    <input
                      type="email"
                      {...register("email", { required: "Campo obrigatório" })}
                      className="input input-bordered bg-white dark:bg-gray-700"
                      placeholder="exemplo@farmacia.com"
                    />
                    {errors.email && (
                      <div className="flex items-center gap-2 mt-2 text-error">
                        <FiAlertCircle className="text-sm" />
                        <span className="text-sm">{errors.email.message}</span>
                      </div>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label justify-start gap-2">
                      <FiLock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                      <span className="label-text dark:text-gray-300">
                        Senha
                      </span>
                    </label>
                    <input
                      type="password"
                      {...register("password", {
                        required: "Campo obrigatório",
                      })}
                      className="input input-bordered bg-white dark:bg-gray-700"
                      placeholder="••••••••"
                    />
                    {errors.password && (
                      <div className="flex items-center gap-2 mt-2 text-error">
                        <FiAlertCircle className="text-sm" />
                        <span className="text-sm">
                          {errors.password.message}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full gap-2 hover:scale-[1.02] transition-transform"
                  >
                    {isLogin ? "Entrar" : "Cadastrar"}
                    <FiArrowRight className="text-lg" />
                  </button>

                  <div className="flex flex-col gap-2">
                    <p className="text-center text-gray-600 dark:text-gray-400">
                      {isLogin ? "Novo por aqui?" : "Já tem uma conta?"}
                      <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="ml-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        {isLogin ? "Criar conta" : "Fazer login"}
                      </button>
                    </p>

                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-center text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm"
                      >
                        Esqueci minha senha
                      </button>
                    )}
                  </div>
                </>
              )}

              {error && (
                <div className="alert alert-error py-2">
                  <FiAlertCircle className="text-lg" />
                  <span>{error}</span>
                </div>
              )}
            </form>
          </div>
        </main>
      </div>
    </section>
  );
}
