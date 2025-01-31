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
        <div className="menu p-6 w-96 min-h-full bg-base-100 dark:bg-neutral-800 text-base-content dark:text-gray-300">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b dark:border-neutral-700">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="text-2xl text-primary dark:text-purple-400" />
              <h2 className="text-xl font-bold">Meus Alertas</h2>
              <span className="badge badge-primary dark:badge-accent ml-2">
                {alerts.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="btn btn-circle btn-sm btn-ghost"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          {/* Lista de Alertas */}
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <FiPackage className="text-4xl text-gray-400 dark:text-neutral-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-neutral-500">
                  Nenhum alerta ativo no momento
                </p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="card bg-base-200 dark:bg-neutral-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="card-body p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FiPackage className="text-lg text-secondary dark:text-purple-300" />
                          <h3 className="card-title text-lg font-semibold">
                            {alert.stock.medicineName}
                          </h3>
                        </div>

                        <div className="space-y-1 text-sm">
                          <p className="flex items-center gap-2">
                            <span className="font-medium">Farmácia:</span>
                            <span className="text-gray-500 dark:text-neutral-400">
                              {alert.stock.pharmacy.name}
                            </span>
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="font-medium">Telefone:</span>
                            <span className="text-gray-500 dark:text-neutral-400">
                              {alert.stock.pharmacy.phone}
                            </span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteAlert(alert.id)}
                        className="btn btn-sm btn-ghost text-error hover:text-error-focus dark:text-red-400 dark:hover:text-red-300"
                        title="Remover Alerta"
                      >
                        <FiTrash2 className="text-lg" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t dark:border-neutral-700">
            <p className="text-sm text-gray-500 dark:text-neutral-500">
              Você será notificado por e-mail quando o medicamento estiver
              disponível
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsDrawer;
