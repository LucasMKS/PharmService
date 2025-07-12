"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowLeft,
  FiSave,
  FiShield,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { getSessionData } from "@/hooks/useSessionStorage";
import PharmService from "@/components/services/PharmService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import AvatarUpload from "@/components/ui/avatar-upload";

const SettingsPage = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [currentContent, setCurrentContent] = useState("Configurações");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const router = useRouter();
  const { toast } = useToast();
  const { user: authUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  useEffect(() => {
    const user = getSessionData("user", {});
    if (!user || !user.userId) {
      router.push("/auth");
      return;
    }
    setUserData(user);
    setAvatarUrl(user.avatarUrl || null);
    setValue("name", user.name || "");
    setValue("email", user.email || "");
  }, [router, setValue]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const clearMessage = () => {
    setMessage({ type: "", text: "" });
  };

  const handleAvatarChange = (newAvatarUrl) => {
    setAvatarUrl(newAvatarUrl);

    // Atualizar dados do usuário no sessionStorage
    if (userData) {
      const updatedUserData = { ...userData, avatarUrl: newAvatarUrl };
      sessionStorage.setItem("user", JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
    }
  };

  const handleContentChange = (title) => {
    if (title === "Configurações") {
      // Já estamos na página de configurações
      return;
    } else if (title === "Dashboard") {
      router.push("/dashboard");
    } else if (title === "Reservas") {
      router.push("/dashboard?content=Reservas");
    } else if (title === "Funcionarios") {
      router.push("/dashboard?content=Funcionarios");
    } else if (title === "Relatórios") {
      router.push("/dashboard?content=Relatórios");
    } else if (title === "Farmácias") {
      router.push("/dashboard?content=Farmácias");
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    clearMessage();

    try {
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
        toast({
          title: "Sucesso",
          description:
            "Dados atualizados! Verifique seu e-mail para confirmar a mudança de senha.",
        });
      } else {
        showMessage("success", "Dados pessoais atualizados com sucesso!");
        toast({
          title: "Sucesso",
          description: "Dados pessoais atualizados com sucesso!",
        });
      }

      if (response.user) {
        const currentUserData = JSON.parse(
          sessionStorage.getItem("user") || "{}"
        );
        const updatedUserData = { ...currentUserData, ...response.user };
        sessionStorage.setItem("user", JSON.stringify(updatedUserData));
        setUserData(updatedUserData);
      }

      reset({
        name: response.user?.name || data.name,
        email: response.user?.email || data.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Erro inesperado. Tente novamente.";
      showMessage("error", errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-ring loading-lg text-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar
        setSelectedContent={handleContentChange}
        user={userData || authUser || {}}
        userAlerts={[]}
        refreshAlerts={() => {}}
        initialSelected="Configurações"
      />

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Configurações do Usuário
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie suas informações pessoais e segurança da conta
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Avatar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FiUser className="w-5 h-5 text-primary" />
                  Foto do Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AvatarUpload
                  currentAvatarUrl={avatarUrl}
                  onAvatarChange={handleAvatarChange}
                  userId={userData?.userId}
                  userName={userData?.name}
                  size="xl"
                />
              </CardContent>
            </Card>

            {/* Informações Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FiUser className="w-5 h-5 text-primary" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo</Label>
                      <Input
                        id="name"
                        type="text"
                        {...register("name", {
                          required: "Nome é obrigatório",
                        })}
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
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email", {
                          required: "E-mail é obrigatório",
                        })}
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

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="loading loading-spinner loading-sm"></div>
                        Salvando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FiSave className="w-4 h-4" />
                        Salvar Alterações
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Alterar Senha */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FiShield className="w-5 h-5 text-primary" />
                  Segurança da Conta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha atual</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        {...register("currentPassword")}
                        placeholder="Digite sua senha atual"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowCurrentPassword((v) => !v)}
                        tabIndex={-1}
                      >
                        {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova senha</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        {...register("newPassword")}
                        placeholder="Digite a nova senha"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowNewPassword((v) => !v)}
                        tabIndex={-1}
                      >
                        {showNewPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirmar nova senha
                    </Label>
                    <Input
                      id="confirmPassword"
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

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      Informações sobre a alteração de senha:
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• A senha deve ter pelo menos 6 caracteres</li>
                      <li>• Um e-mail de confirmação será enviado</li>
                      <li>
                        • Você precisará confirmar a alteração pelo e-mail
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mensagens */}
          {message.text && (
            <Alert
              className={`mt-6 ${
                message.type === "success"
                  ? "border-green-200 bg-green-50"
                  : "border-destructive/20 bg-destructive/10"
              }`}
            >
              <div className="flex items-center gap-2">
                {message.type === "success" ? (
                  <FiCheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <FiAlertCircle className="w-4 h-4 text-destructive" />
                )}
                <AlertDescription
                  className={
                    message.type === "success"
                      ? "text-green-800"
                      : "text-destructive"
                  }
                >
                  {message.text}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
