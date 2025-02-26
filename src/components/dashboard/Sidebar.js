import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FiHome,
  FiDollarSign,
  FiMonitor,
  FiChevronDown,
  FiChevronsRight,
  FiAlertCircle,
  FiLogOut,
  FiUploadCloud,
  FiFileText,
} from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import AlertsDrawer from "./AlertsDrawer";
import PharmService from "../services/PharmService";
import ImportMedicinesModal from "./ImportMedicinesModal";

const Sidebar = ({ setSelectedContent, refreshAlerts, userAlerts }) => {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState("Dashboard");
  const { user, logout } = useAuth();
  const [alertsDrawerOpen, setAlertsDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const roles = user ? user.roles : "";

  // Função para deletar alerta
  const handleDeleteAlert = async (alertId) => {
    try {
      await PharmService.deleteAlert(alertId);
      refreshAlerts(); // Atualiza via função do pai

      alert("Alerta removido com sucesso!");
    } catch (error) {
      alert(`Erro ao remover alerta: ${error.message}`);
    }
  };

  const handleOptionSelect = (title) => {
    setSelected(title);
    setSelectedContent(title);
  };

  return (
    <motion.nav
      layout
      className="sticky top-0 h-screen shrink-0 border-r border-slate-300 bg-white p-2"
      style={{
        width: open ? "225px" : "fit-content",
      }}
    >
      {/* Top Section */}
      <div>
        <TitleSection open={open} user={user} />
        <div className="space-y-1">
          <Option
            Icon={FiHome}
            title="Dashboard"
            selected={selected}
            setSelected={handleOptionSelect}
            open={open}
          />
          <Option
            Icon={FiDollarSign}
            title="Reservas"
            selected={selected}
            setSelected={handleOptionSelect}
            open={open}
          />

          {roles == "GERENTE" && (
            <Option
              Icon={FiMonitor}
              title="Funcionarios"
              selected={selected}
              setSelected={handleOptionSelect}
              open={open}
            />
          )}

          {roles === "GERENTE" && (
            <Option
              Icon={FiUploadCloud}
              title="Importar Medicamentos"
              selected={selected}
              setSelected={() => setImportModalOpen(true)}
              open={open}
            />
          )}

          {roles === "GERENTE" && (
            <Option
              Icon={FiFileText}
              title="Relatórios"
              selected={selected}
              setSelected={handleOptionSelect}
              open={open}
            />
          )}

          {roles === "ADMIN" && (
            <Option
              Icon={FiFileText}
              title="Farmácias"
              selected={selected}
              setSelected={handleOptionSelect}
              open={open}
            />
          )}

          {roles == "CLIENTE" && (
            <div className="relative">
              <button
                onClick={() => {
                  setAlertsDrawerOpen(true);
                  refreshAlerts();
                }}
                className="group flex h-10 w-full items-center rounded-md transition-colors text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                <div className="grid h-full w-10 place-content-center text-lg">
                  <FiAlertCircle className="transition-transform group-hover:scale-110" />
                </div>
                {open && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-xs font-medium">Ver Alertas</span>
                    {userAlerts.length > 0 && (
                      <span className="badge badge-sm badge-primary animate-pulse">
                        {userAlerts.length}
                      </span>
                    )}
                  </motion.div>
                )}
              </button>

              {/* Drawer de Alertas mantido igual */}
              <AlertsDrawer
                isOpen={alertsDrawerOpen}
                onClose={() => setAlertsDrawerOpen(false)}
                alerts={userAlerts}
                onDeleteAlert={handleDeleteAlert}
              />
            </div>
          )}

          {importModalOpen && (
            <ImportMedicinesModal
              onClose={() => setImportModalOpen(false)}
              onSuccess={() => {
                setImportModalOpen(false);
                if (onMedicationAdded) onMedicationAdded();
              }}
            />
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div>
        <ToggleClose open={open} setOpen={setOpen} />
        <Logout open={open} logout={logout} />
      </div>
    </motion.nav>
  );
};

const Option = ({ Icon, title, selected, setSelected, open, notifs }) => {
  return (
    <motion.button
      layout
      onClick={() => setSelected(title)}
      className={`relative flex h-10 w-full items-center rounded-md transition-colors ${
        selected === title
          ? "bg-indigo-100 text-indigo-800"
          : "text-slate-500 hover:bg-slate-100"
      }`}
    >
      <motion.div
        layout
        className="grid h-full w-10 place-content-center text-lg"
      >
        <Icon />
      </motion.div>
      {open && (
        <motion.span
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.125 }}
          className="text-xs font-medium"
        >
          {title}
        </motion.span>
      )}

      {notifs && open && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          style={{ y: "-50%" }}
          transition={{ delay: 0.5 }}
          className="absolute right-2 top-1/2 size-4 rounded bg-indigo-500 text-xs text-white"
        >
          {notifs}
        </motion.span>
      )}
    </motion.button>
  );
};

const TitleSection = ({ open, user }) => {
  return (
    <div className="mb-3 border-b border-slate-300 pb-3">
      <div className="flex cursor-pointer items-center justify-between rounded-md transition-colors hover:bg-slate-100">
        <div className="flex items-center gap-2">
          <Logo />
          {open && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.125 }}
            >
              <span className="block text-xs font-semibold text-black">
                {user ? user.name : "Nome do Usuário"}
              </span>
              <span className="block text-xs text-slate-500">
                {" "}
                {user ? user.roles : "Função do Usuário"}
              </span>
            </motion.div>
          )}
        </div>
        {open && <FiChevronDown className="mr-2" />}
      </div>
    </div>
  );
};

const Logo = () => {
  return (
    <motion.div
      layout
      className="grid size-10 shrink-0 place-content-center rounded-md "
    >
      <Image
        src="/images/pharm/pharm.png"
        width={170}
        height={260}
        alt="Logo"
        className="fill-slate-50"
      />
    </motion.div>
  );
};

const Logout = ({ open, logout }) => {
  return (
    <motion.button
      layout
      onClick={logout}
      className="flex items-center w-full p-3 text-slate-500 hover:bg-red-100 hover:text-red-600"
    >
      <motion.div layout className=" place-content-center text-lg">
        <FiLogOut className="mr-2 text-lg" />
      </motion.div>
      {open && (
        <motion.span
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.125 }}
          className="text-sm "
        >
          Sair
        </motion.span>
      )}
    </motion.button>
  );
};

const ToggleClose = ({ open, setOpen }) => {
  return (
    <motion.button
      layout
      onClick={() => setOpen((pv) => !pv)}
      className="absolute bottom-0 left-0 right-0 border-t border-slate-300 transition-colors hover:bg-slate-100"
    >
      <div className="flex items-center p-2">
        <motion.div
          layout
          className="grid size-10 place-content-center text-lg"
        >
          <FiChevronsRight
            className={`transition-transform ${open && "rotate-180"} bg-black`}
          />
        </motion.div>
        {open && (
          <motion.span
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.125 }}
            className="ml-2 text-sm font-medium text-black"
          >
            Esconder
          </motion.span>
        )}
      </div>
    </motion.button>
  );
};

export default Sidebar;
