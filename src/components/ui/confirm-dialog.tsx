"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title = "Xác nhận",
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg z-10">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        {description && <div className="p-4 text-sm text-gray-700">{description}</div>}
        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
          <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
          <Button onClick={onConfirm} className="bg-red-600 text-white hover:bg-red-700">{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;

// Hook wrapper for imperative confirm usage
type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
};

export function useConfirmModal(): {
  confirm: (options?: ConfirmOptions) => Promise<boolean>;
  ConfirmDialog: React.ReactNode;
} {
  const [state, setState] = React.useState<{
    open: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  }>({ open: false, options: {}, resolve: () => {} });

  const confirm = React.useCallback((options: ConfirmOptions = {}): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ open: true, options, resolve });
    });
  }, []);

  const handleConfirm = () => {
    state.resolve(true);
    setState((s) => ({ ...s, open: false }));
  };

  const handleCancel = () => {
    state.resolve(false);
    setState((s) => ({ ...s, open: false }));
  };

  return {
    confirm,
    ConfirmDialog: (
      <ConfirmDialog
        open={state.open}
        title={state.options.title}
        description={state.options.description}
        confirmLabel={state.options.confirmText}
        cancelLabel={state.options.cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    ),
  };
}
