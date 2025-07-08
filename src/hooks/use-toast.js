"use client";

import { useState, useCallback } from "react";
import { useToast as useToastPrimitive } from "@/hooks/use-toast-primitive";

export function useToast() {
  const { toast } = useToastPrimitive();

  const showToast = useCallback(
    ({ title, description, variant = "default" }) => {
      toast({
        title,
        description,
        variant,
      });
    },
    [toast]
  );

  return { toast: showToast };
}
