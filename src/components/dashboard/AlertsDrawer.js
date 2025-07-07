// components/AlertsDrawer.js
"use client";
import React from "react";
import { FiX, FiAlertCircle, FiPackage, FiTrash2 } from "react-icons/fi";

const AlertsDrawer = ({ isOpen, onClose, alerts, onDeleteAlert }) => {
  if (!isOpen) return null;

  return (
    <div className="drawer drawer-end">
      <input
        id="alerts-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={isOpen}
        onChange={onClose}
      />
      <div className="drawer-side">
        <label
          htmlFor="alerts-drawer"
          className="drawer-overlay"
          onClick={onClose}
        ></label>
        <div className="menu p-6 w-96 min-h-full bg-card text-card-foreground border-l border-border">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="text-2xl text-primary" />
              <h2 className="text-xl font-bold">Meus Alertas</h2>
              <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground ml-2">
                {alerts.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 w-8"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          {/* Lista de Alertas */}
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <FiPackage className="text-4xl text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum alerta ativo</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 border border-border rounded-lg bg-background"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">
                        {alert.medicineName || "Medicamento"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Farmácia: {alert.pharmacyName || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Criado em:{" "}
                        {new Date(alert.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <button
                      onClick={() => onDeleteAlert(alert.id)}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 w-8 ml-2"
                      title="Remover alerta"
                    >
                      <FiTrash2 className="text-sm text-destructive" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsDrawer;
