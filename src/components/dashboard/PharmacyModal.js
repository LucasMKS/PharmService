import React from "react";

const PharmacyModal = ({ pharmacy, onClose }) => {
  if (!pharmacy) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
      onClick={onClose}
    >
      <div
        className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {pharmacy.name}
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              Endereço: {pharmacy.address}, {pharmacy.number}
            </p>
            <p className="text-sm text-gray-500">
              Bairro: {pharmacy.neighborhood || "N/A"}
            </p>
            <p className="text-sm text-gray-500">
              Cidade: {pharmacy.city || "N/A"}
            </p>
            <p className="text-sm text-gray-500">
              Estado: {pharmacy.state || "N/A"}
            </p>
            <p className="text-sm text-gray-500">
              CEP: {pharmacy.zipCode || "N/A"}
            </p>
            <p className="text-sm text-gray-500">
              Telefone: {pharmacy.phone || "N/A"}
            </p>
          </div>
          <div className="items-center px-4 py-3">
            <button
              id="ok-btn"
              className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              onClick={onClose}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyModal;
