"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/utils";

interface PopupProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  children?: React.ReactNode;
  className?: string;
}

export function Popup({
  open,
  title,
  onClose,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
  children,
  className,
}: PopupProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet on mobile, modal on sm+ */}
      <div className={cn(
        "absolute inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[520px] bg-card text-card-foreground border rounded-t-xl sm:rounded-xl shadow-2xl",
        className
      )}>
        {title && (
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        )}
        <div className="p-4 max-h-[60vh] overflow-auto">
          {children}
        </div>
        <div className="px-4 py-3 border-t flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>{cancelText}</Button>
          {onConfirm && (
            <Button size="sm" onClick={onConfirm}>{confirmText}</Button>
          )}
        </div>
      </div>
    </div>
  );
}
