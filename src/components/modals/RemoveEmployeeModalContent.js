import React from "react";
import { FiUserX, FiX } from "react-icons/fi";

const RemoveEmployeeModalContent = ({
  employeeID,
  onEmployeeIDChange,
  onCancel,
  onRemove,
  loading,
  error,
}) => (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      onRemove();
    }}
    className="space-y-4"
  >
    <div className="form-control">
      <input
        type="number"
        placeholder="ID do funcionário"
        className="input input-bordered w-full"
        value={employeeID}
        onChange={(e) => onEmployeeIDChange(e.target.value)}
        required
        disabled={loading}
      />
    </div>
    <div className="flex gap-3 justify-end mt-4">
      <button
        type="button"
        className="btn btn-ghost gap-2"
        onClick={onCancel}
        disabled={loading}
      >
        <FiX className="text-lg" />
        Cancelar
      </button>
      <button
        type="submit"
        className="btn btn-primary gap-2"
        disabled={loading || !employeeID}
      >
        {loading ? (
          <span className="loading loading-spinner"></span>
        ) : (
          <FiUserX className="text-lg" />
        )}
        Remover
      </button>
    </div>
    {error && <div className="alert alert-error mt-2">{error}</div>}
  </form>
);

export default RemoveEmployeeModalContent;
