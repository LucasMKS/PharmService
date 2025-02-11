import React from "react";
import { FiEdit, FiTrash2, FiPackage, FiAlertCircle } from "react-icons/fi";

const TableRow = ({
  medication,
  roles,
  onPharmacyClick,
  onMedicineClick,
  onEdit,
  onDelete,
  onReserve,
  onAlert,
}) => {
  const { medicineName, quantity, updatedOn, pharmacy } = medication;

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">
        <button
          onClick={() => onMedicineClick(medication)}
          className="link link-primary link-hover"
        >
          {medicineName}
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">
        {quantity}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">
        {new Date(updatedOn).toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">
        <button
          onClick={() => onPharmacyClick(pharmacy)}
          className="link link-primary link-hover"
        >
          {pharmacy.name}
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center justify-center gap-2">
          {roles !== "CLIENTE" ? (
            <>
              <button
                onClick={() => onEdit(medication)}
                className="btn btn-ghost btn-sm text-info"
                aria-label="Editar"
              >
                <FiEdit className="text-lg" />
              </button>
              <button
                onClick={() => onDelete(medication.medicineId)}
                className="btn btn-ghost btn-sm text-error ml-2"
                aria-label="Excluir"
              >
                <FiTrash2 className="text-lg" />
              </button>
            </>
          ) : quantity !== 0 ? (
            <button
              onClick={onReserve}
              className="btn btn-ghost btn-sm text-success"
              aria-label="Reservar"
            >
              <FiPackage className="text-lg" />
            </button>
          ) : (
            <button
              onClick={() => onAlert(medication)}
              className="btn btn-ghost btn-sm text-warning"
              aria-label="Criar Alerta"
            >
              <FiAlertCircle className="text-lg" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default TableRow;
