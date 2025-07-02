import React from "react";
import {
  FiPackage,
  FiGrid,
  FiArchive,
  FiDroplet,
  FiTag,
  FiLayers,
} from "react-icons/fi";

const MedicineDetailsCard = ({ medicine }) => {
  if (!medicine) return null;
  return (
    <div className="max-w-md w-full bg-card text-card-foreground rounded-xl shadow-lg p-6 space-y-4 border border-border">
      <div className="flex items-center gap-3 mb-2">
        <FiPackage className="text-2xl text-primary" />
        <h2 className="text-xl font-bold">{medicine.medicineName}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoItem icon={<FiGrid />} label="Categoria">
          {medicine.category || (
            <span className="text-muted-foreground">N/A</span>
          )}
        </InfoItem>
        <InfoItem icon={<FiArchive />} label="Quantidade">
          {medicine.quantity || (
            <span className="text-muted-foreground">N/A</span>
          )}
        </InfoItem>
        <InfoItem icon={<FiLayers />} label="Forma farmacêutica">
          {medicine.dosageForm || (
            <span className="text-muted-foreground">N/A</span>
          )}
        </InfoItem>
        <InfoItem icon={<FiTag />} label="Fabricante">
          {medicine.manufacturer || (
            <span className="text-muted-foreground">N/A</span>
          )}
        </InfoItem>
        <InfoItem icon={<FiDroplet />} label="Classificação">
          {medicine.classification || (
            <span className="text-muted-foreground">N/A</span>
          )}
        </InfoItem>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, children }) => (
  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg border border-border">
    <span className="mt-1 text-primary">{icon}</span>
    <div>
      <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-base font-medium leading-tight">{children}</div>
    </div>
  </div>
);

export default MedicineDetailsCard;
