import React from "react";
import {
  FiHome,
  FiMapPin,
  FiHash,
  FiMap,
  FiFlag,
  FiMail,
  FiPhone,
  FiUsers,
} from "react-icons/fi";

const PharmacyDetailsCard = ({ pharmacy }) => {
  if (!pharmacy) return null;
  return (
    <div className="max-w-md w-full bg-card text-card-foreground rounded-xl shadow-lg p-6 space-y-4 border border-border">
      <div className="flex items-center gap-3 mb-2">
        <FiHome className="text-2xl text-primary" />
        <h2 className="text-xl font-bold">{pharmacy.name}</h2>
      </div>
      <div className="space-y-3">
        <InfoItem icon={<FiMapPin />} label="Endereço">
          {pharmacy.address}, {pharmacy.number}
        </InfoItem>
        <InfoItem icon={<FiMap />} label="Bairro/Cidade">
          {pharmacy.neighborhood} - {pharmacy.city}/{pharmacy.state}
        </InfoItem>
        <InfoItem icon={<FiMail />} label="CEP">
          {pharmacy.zipCode}
        </InfoItem>
        <InfoItem icon={<FiPhone />} label="Telefone">
          {pharmacy.phone}
        </InfoItem>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, children }) => (
  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
    <span className="text-primary text-lg">{icon}</span>
    <div>
      <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-base font-medium leading-tight">{children}</div>
    </div>
  </div>
);

export default PharmacyDetailsCard;
