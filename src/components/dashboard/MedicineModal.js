import React from "react";
import {
  FiPackage,
  FiGrid,
  FiArchive,
  FiX,
  FiDroplet,
  FiTag,
  FiLayers,
} from "react-icons/fi";

const MedicineModal = ({ medicine, onClose }) => {
  if (!medicine) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="modal-box relative max-w-lg bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 shadow-2xl">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle absolute right-4 top-4 text-gray-500 hover:text-blue-600"
        >
          <FiX className="text-lg" />
        </button>

        <div className="text-center space-y-4">
          <div className="inline-block p-3 bg-blue-100 dark:bg-gray-700 rounded-full mb-2">
            <FiPackage className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>

          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            {medicine.medicineName}
          </h3>

          <div className="space-y-3 text-left">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem icon={<FiGrid />} label="Categoria">
                {medicine.category || "N/A"}
              </InfoItem>

              <InfoItem icon={<FiArchive />} label="Quantidade">
                {medicine.quantity || "N/A"}
              </InfoItem>
            </div>
            <InfoItem icon={<FiLayers />} label="Forma farmacêutica">
              {medicine.dosageForm || "N/A"}
            </InfoItem>

            <InfoItem icon={<FiTag />} label="Fabricante">
              {medicine.manufacturer || "N/A"}
            </InfoItem>

            <InfoItem icon={<FiDroplet />} label="Classificação">
              {medicine.classification || "N/A"}
            </InfoItem>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, children }) => (
  <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-neutral-500 shadow-sm">
    <span className="text-blue-600 dark:text-blue-400 mt-1">{icon}</span>
    <div>
      <p className="text-xs font-semibold text-gray-500 dark:text-neutral-400 mb-1">
        {label}
      </p>
      <p className="text-sm text-gray-700 dark:text-neutral-300 font-medium">
        {children}
      </p>
    </div>
  </div>
);

export default MedicineModal;
