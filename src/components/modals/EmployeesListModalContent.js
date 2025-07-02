import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const EmployeesListModalContent = ({
  isOpen = true,
  employees,
  onPromote,
  onDismiss,
  onClose,
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-lg w-full">
      <DialogHeader>
        <DialogTitle>Lista de Funcionários</DialogTitle>
      </DialogHeader>
      <div className="divide-y divide-border max-h-96 overflow-y-auto">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className="flex items-center justify-between py-2"
          >
            <div className="flex items-center gap-2">
              <p className="font-medium">
                {employee.name} - ID: {employee.id}
              </p>
              <span className="inline-block px-2 py-0.5 rounded bg-muted text-xs font-bold">
                {employee.roles.includes("GERENTE") ? "Gerente" : "Funcionário"}
              </span>
            </div>
            <div className="flex gap-2">
              {!employee.roles.includes("GERENTE") && (
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => onPromote(employee.id)}
                >
                  Promover
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDismiss(employee.id)}
              >
                Demitir
              </Button>
            </div>
          </div>
        ))}
      </div>
      <DialogFooter className="flex justify-end mt-4">
        <Button onClick={onClose} variant="secondary">
          Fechar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default EmployeesListModalContent;
