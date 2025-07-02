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
  const { user, login } = useAuth();

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
        if (isLogin) {
          const response = await PharmService.login(data);
          login(response); // Usar o novo sistema de autenticação
        } else {
          await PharmService.register(data);
        }

        router.push("/dashboard");
      }
    } catch (error) {
      setError(
        error.response?.data?.error || "Erro ao processar sua solicitação"
      );
    }
  };

  return (
    <section className="bg-background">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
        <section className="relative flex h-32 items-end bg-card lg:col-span-5 lg:h-full xl:col-span-6 border-r border-border">
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
                src="/images/pharm/PharmService.png"
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

        <main className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
          <div className="w-full max-w-xl lg:max-w-3xl bg-card rounded-2xl shadow-xl p-8 border border-border">
            <div className="text-center mb-8">
              <div className="inline-block p-3">
                <span className="sr-only">Home</span>
                <Image
                  src="/images/pharm/PharmServiceInv.png"
                  width={60}
                  height={48}
                  alt="Logo"
                  className="fill-slate-50 rounded-2xl"
                />
              </div>

              <h2 className="text-2xl font-bold text-card-foreground mb-2">
                {isLogin ? "Acesse sua conta" : "Crie sua conta"}
              </h2>
              <p className="text-muted-foreground">
                {isLogin
                  ? "Gerencie seu estoque de forma eficiente"
                  : "Comece a gerenciar sua farmácia agora mesmo"}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {showForgotPassword ? (
                <>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <FiMail className="w-5 h-5 text-primary" />
                      <span>E-mail</span>
                    </label>
                    <input
                      type="email"
                      {...register("email", { required: "Campo obrigatório" })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="exemplo@farmacia.com"
                    />
                    {errors.email && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <FiAlertCircle className="text-sm" />
                        <span>{errors.email.message}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2 gap-2"
                  >
                    Enviar e-mail de recuperação
                    <FiArrowRight className="text-lg" />
                  </button>

                  <p className="text-center text-muted-foreground">
                    Lembrou sua senha?{" "}
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="text-primary hover:text-primary/80"
                    >
                      Voltar ao login
                    </button>
                  </p>
                </>
              ) : (
                <>
                  {/* Formulário original de login/registro */}
                  {!isLogin && (
                    <div className="space-y-2">
                      <label
                        htmlFor="nome"
                        className="flex items-center gap-2 text-sm font-medium text-foreground"
                      >
                        <FiUser className="w-5 h-5 text-primary" />
                        <span>Nome completo</span>
                      </label>

                      <input
                        type="text"
                        {...register("nome", { required: "Campo obrigatório" })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Ex: João da Silva"
                      />
                      {errors.nome && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <FiAlertCircle className="text-sm" />
                          <span>{errors.nome.message}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <FiMail className="w-5 h-5 text-primary" />
                      <span>E-mail</span>
                    </label>
                    <input
                      type="email"
                      {...register("email", { required: "Campo obrigatório" })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="exemplo@farmacia.com"
                    />
                    {errors.email && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <FiAlertCircle className="text-sm" />
                        <span>{errors.email.message}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <FiLock className="w-5 h-5 text-primary" />
                      <span>Senha</span>
                    </label>
                    <input
                      type="password"
                      {...register("password", {
                        required: "Campo obrigatório",
                      })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="••••••••"
                    />
                    {errors.password && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <FiAlertCircle className="text-sm" />
                        <span>{errors.password.message}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2 gap-2"
                  >
                    {isLogin ? "Entrar" : "Cadastrar"}
                    <FiArrowRight className="text-lg" />
                  </button>

                  <div className="flex flex-col gap-2">
                    <p className="text-center text-muted-foreground">
                      {isLogin ? "Novo por aqui?" : "Já tem uma conta?"}
                      <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="ml-2 text-primary hover:text-primary/80"
                      >
                        {isLogin ? "Criar conta" : "Fazer login"}
                      </button>
                    </p>

                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-center text-primary hover:text-primary/80 text-sm"
                      >
                        Esqueci minha senha
                      </button>
                    )}
                  </div>
                </>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 text-sm border border-destructive/50 bg-destructive/10 text-destructive rounded-md">
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
