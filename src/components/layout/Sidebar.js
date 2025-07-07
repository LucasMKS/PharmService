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
  FiFileText,
  FiSettings,
} from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import AlertsDrawer from "../dashboard/AlertsDrawer";
import PharmService from "../services/PharmService";
import UserSettingsModalContent from "../modals/UserSettingsModalContent";

const Sidebar = ({ setSelectedContent, refreshAlerts, userAlerts }) => {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState("Dashboard");
  const { user, logout, updateUser } = useAuth();
  const [alertsDrawerOpen, setAlertsDrawerOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
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

  // Função para atualizar dados do usuário
  const handleUserUpdate = (updatedUser) => {
    if (updatedUser) {
      updateUser(updatedUser);
    }
  };

  const handleOptionSelect = (title) => {
    setSelected(title);
    setSelectedContent(title);
  };

  return (
    <motion.nav
      layout
      className="sticky top-0 h-screen shrink-0 border-r border-border bg-card p-2"
      style={{
        width: open ? "225px" : "fit-content",
      }}
    >
      {/* Top Section */}
      <div>
        <TitleSection
          open={open}
          user={user}
          onSettingsClick={() => setSettingsModalOpen(true)}
        />
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

          {Array.isArray(roles) &&
            (roles.includes("GERENTE") || roles.includes("ADMIN")) && (
              <Option
                Icon={FiMonitor}
                title="Funcionarios"
                selected={selected}
                setSelected={handleOptionSelect}
                open={open}
              />
            )}

          {Array.isArray(roles) && roles.includes("GERENTE") && (
            <Option
              Icon={FiFileText}
              title="Relatórios"
              selected={selected}
              setSelected={handleOptionSelect}
              open={open}
            />
          )}

          {Array.isArray(roles) && roles.includes("ADMIN") && (
            <Option
              Icon={FiFileText}
              title="Farmácias"
              selected={selected}
              setSelected={handleOptionSelect}
              open={open}
            />
          )}

          {Array.isArray(roles) && roles.includes("CLIENTE") && (
            <div className="relative">
              <button
                onClick={() => {
                  setAlertsDrawerOpen(true);
                  refreshAlerts();
                }}
                className="group flex h-10 w-full items-center rounded-md transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
                      <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground animate-pulse">
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
        </div>
      </div>

      {/* Modal de Configurações do Usuário */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <UserSettingsModalContent
              user={user}
              onClose={() => setSettingsModalOpen(false)}
              onUpdate={handleUserUpdate}
            />
          </div>
        </div>
      )}

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
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
          className="absolute right-2 top-1/2 size-4 rounded bg-primary text-xs text-primary-foreground"
        >
          {notifs}
        </motion.span>
      )}
    </motion.button>
  );
};

const TitleSection = ({ open, user, onSettingsClick }) => {
  return (
    <div className="mb-3 border-b border-border pb-3">
      <div className="flex cursor-pointer items-center justify-between rounded-md transition-colors hover:bg-accent hover:text-accent-foreground p-2">
        <div className="flex items-center gap-2">
          <Logo />
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.125 }}
              className="flex flex-col"
            >
              <span className="text-xs font-bold text-foreground">
                PharmService
              </span>
              <span className="text-xs text-muted-foreground">
                {user?.name || "Usuário"}
              </span>
            </motion.div>
          )}
        </div>
        {open && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={(e) => {
              e.stopPropagation();
              onSettingsClick();
            }}
            className="p-1 rounded-md hover:bg-accent/50 transition-colors"
            title="Configurações"
          >
            <FiSettings className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </motion.button>
        )}
      </div>
    </div>
  );
};

const Logo = () => {
  return (
    <div className="grid h-10 w-10 place-content-center rounded-lg bg-primary text-primary-foreground">
      <span className="text-lg font-bold">P</span>
    </div>
  );
};

const Logout = ({ open, logout }) => {
  return (
    <motion.button
      layout
      onClick={logout}
      className="flex h-10 w-full items-center rounded-md transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    >
      <motion.div
        layout
        className="grid h-full w-10 place-content-center text-lg"
      >
        <FiLogOut />
      </motion.div>
      {open && (
        <motion.span
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.125 }}
          className="text-xs font-medium"
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
      onClick={() => setOpen(!open)}
      className="flex h-10 w-full items-center rounded-md transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    >
      <motion.div
        layout
        className="grid h-full w-10 place-content-center text-lg"
      >
        <FiChevronsRight
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </motion.div>
      {open && (
        <motion.span
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.125 }}
          className="text-xs font-medium"
        >
          Fechar
        </motion.span>
      )}
    </motion.button>
  );
};

export default Sidebar;
