import React from "react";
import { FiUserPlus, FiX } from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AddEmployeeModalContent = ({
  isOpen = true,
  email,
  onEmailChange,
  onCancel,
  onAdd,
  loading,
  error,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FiUserPlus className="w-5 h-5 text-primary" /> Adicionar
            Funcionário
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onAdd();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="employee-email">Email do funcionário</Label>
            <Input
              id="employee-email"
              type="email"
              placeholder="Email do funcionário"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && (
            <div className="rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm flex items-center gap-2">
              <FiX className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !email}
              className="gap-2"
            >
              {loading ? (
                <span className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></span>
              ) : (
                <FiUserPlus className="text-lg" />
              )}
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeModalContent;
