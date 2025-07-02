import React from "react";
import {
  FiHome,
  FiUsers,
  FiMapPin,
  FiHash,
  FiMap,
  FiFlag,
  FiMail,
  FiPhone,
  FiPlus,
  FiX,
} from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CreatePharmacyModalContent = ({
  isOpen = true,
  formData,
  setFormData,
  onCancel,
  onSubmit,
  loading,
  error,
}) => (
  <Dialog open={isOpen} onOpenChange={onCancel}>
    <DialogContent className="max-w-lg w-full">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FiHome className="w-5 h-5 text-primary" /> Criar Nova Farmácia
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pharmacy-name" className="flex items-center gap-2">
              <FiHome className="w-4 h-4 text-primary" /> Nome da Farmácia
            </Label>
            <Input
              id="pharmacy-name"
              type="text"
              placeholder="Ex: Farmácia Central"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pharmacy-email" className="flex items-center gap-2">
              <FiUsers className="w-4 h-4 text-primary" /> Email do Responsável
            </Label>
            <Input
              id="pharmacy-email"
              type="email"
              placeholder="Ex: gerente@farmacia.com"
              value={formData.userEmail}
              onChange={(e) =>
                setFormData({ ...formData, userEmail: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="pharmacy-address"
              className="flex items-center gap-2"
            >
              <FiMapPin className="w-4 h-4 text-primary" /> Endereço
            </Label>
            <Input
              id="pharmacy-address"
              type="text"
              placeholder="Ex: Rua das Flores"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="pharmacy-number"
              className="flex items-center gap-2"
            >
              <FiHash className="w-4 h-4 text-primary" /> Número
            </Label>
            <Input
              id="pharmacy-number"
              type="text"
              placeholder="Ex: 123"
              value={formData.number}
              onChange={(e) =>
                setFormData({ ...formData, number: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="pharmacy-neighborhood"
              className="flex items-center gap-2"
            >
              <FiMap className="w-4 h-4 text-primary" /> Bairro
            </Label>
            <Input
              id="pharmacy-neighborhood"
              type="text"
              placeholder="Ex: Centro"
              value={formData.neighborhood}
              onChange={(e) =>
                setFormData({ ...formData, neighborhood: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pharmacy-city" className="flex items-center gap-2">
              <FiMap className="w-4 h-4 text-primary" /> Cidade
            </Label>
            <Input
              id="pharmacy-city"
              type="text"
              placeholder="Ex: São Paulo"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pharmacy-state" className="flex items-center gap-2">
              <FiFlag className="w-4 h-4 text-primary" /> Estado (UF)
            </Label>
            <Input
              id="pharmacy-state"
              type="text"
              maxLength={2}
              placeholder="Ex: SP"
              value={formData.state}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  state: e.target.value.toUpperCase().slice(0, 2),
                })
              }
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pharmacy-zip" className="flex items-center gap-2">
              <FiMail className="w-4 h-4 text-primary" /> CEP
            </Label>
            <Input
              id="pharmacy-zip"
              type="text"
              placeholder="Ex: 12345-678"
              value={formData.zipCode}
              onChange={(e) =>
                setFormData({ ...formData, zipCode: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pharmacy-phone" className="flex items-center gap-2">
              <FiPhone className="w-4 h-4 text-primary" /> Telefone
            </Label>
            <Input
              id="pharmacy-phone"
              type="tel"
              placeholder="Ex: (11) 99999-9999"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>
        </div>
        {error && (
          <div className="rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm flex items-center gap-2 mt-2">
            <FiX className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        <DialogFooter className="flex justify-end gap-2 mt-8">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></span>
            ) : (
              <FiPlus className="text-lg" />
            )}
            Criar Farmácia
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
);

export default CreatePharmacyModalContent;
