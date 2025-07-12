"use client";

import React, { useState, useRef } from "react";
import { FiCamera, FiUpload, FiX } from "react-icons/fi";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import PharmService from "@/components/services/PharmService";

const AvatarUpload = ({
  currentAvatarUrl,
  onAvatarChange,
  userId,
  userName,
  size = "lg",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de imagem.",
          variant: "destructive",
        });
        return;
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive",
        });
        return;
      }

      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files[0]) return;

    setIsUploading(true);
    try {
      const response = await PharmService.uploadAvatar(
        userId,
        fileInputRef.current.files[0]
      );

      onAvatarChange(response.avatarUrl);
      setPreviewUrl(null);

      toast({
        title: "Sucesso",
        description: "Avatar atualizado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer upload do avatar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    onAvatarChange(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className={`${sizeClasses[size]} border-2 border-border`}>
          <AvatarImage src={displayUrl} alt={userName} />
          <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>

        {/* Botão de upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90 transition-colors"
          disabled={isUploading}
        >
          <FiCamera className="w-4 h-4" />
        </button>
      </div>

      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Botões de ação */}
      <div className="flex gap-2">
        {previewUrl && (
          <>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              size="sm"
              className="flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <FiUpload className="w-4 h-4" />
                  Salvar
                </>
              )}
            </Button>

            <Button
              onClick={() => {
                setPreviewUrl(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <FiX className="w-4 h-4" />
              Cancelar
            </Button>
          </>
        )}

        {currentAvatarUrl && !previewUrl && (
          <Button
            onClick={handleRemoveAvatar}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-destructive hover:text-destructive"
          >
            <FiX className="w-4 h-4" />
            Remover
          </Button>
        )}
      </div>

      {/* Informações */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Formatos aceitos: JPG, PNG, GIF</p>
        <p>Tamanho máximo: 5MB</p>
      </div>
    </div>
  );
};

export default AvatarUpload;
