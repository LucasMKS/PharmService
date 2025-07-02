import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const UserInfoModalContent = ({ isOpen = true, user, onClose }) => {
  if (!user) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Informações do Usuário</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <span className="text-sm font-medium text-muted-foreground">
              Nome:
            </span>
            <p className="text-base text-foreground">{user.name}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">
              Email:
            </span>
            <p className="text-base text-foreground">{user.email}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">
              Perfil:
            </span>
            <p className="text-base text-foreground">
              {user.roles?.join(", ") || "N/A"}
            </p>
          </div>
        </div>
        <DialogFooter className="flex justify-end mt-6">
          <Button onClick={onClose} variant="secondary">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserInfoModalContent;
