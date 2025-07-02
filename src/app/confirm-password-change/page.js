"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiCheckCircle, FiAlertCircle, FiLoader } from "react-icons/fi";
import PharmService from "@/components/services/PharmService";

export default function ConfirmPasswordChange() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const confirmPasswordChange = async () => {
      try {
        const token = searchParams.get("token");
        const newPassword = searchParams.get("newPassword");

        if (!token || !newPassword) {
          setStatus("error");
          setMessage("Link inválido. Token ou nova senha não encontrados.");
          return;
        }

        await PharmService.confirmPasswordChange(token, newPassword);
        setStatus("success");
        setMessage(
          "Senha alterada com sucesso! Você será redirecionado para a página de login."
        );

        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          router.push("/auth");
        }, 3000);
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data ||
            "Erro ao confirmar troca de senha. Tente novamente."
        );
      }
    };

    confirmPasswordChange();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <span className="text-xl font-bold text-primary-foreground">P</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">PharmService</h2>
          <p className="text-muted-foreground mt-2">
            Confirmação de Troca de Senha
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
          {status === "loading" && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <FiLoader className="w-8 h-8 text-primary animate-spin" />
              </div>
              <p className="text-foreground">Confirmando troca de senha...</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <FiCheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Sucesso!
              </h3>
              <p className="text-muted-foreground">{message}</p>
              <div className="pt-4">
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full animate-pulse"></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Redirecionando...
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <FiAlertCircle className="w-12 h-12 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Erro</h3>
              <p className="text-muted-foreground">{message}</p>
              <button
                onClick={() => router.push("/auth")}
                className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2"
              >
                Voltar para Login
              </button>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Se você não solicitou esta alteração, entre em contato conosco.
          </p>
        </div>
      </div>
    </div>
  );
}
