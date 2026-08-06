"use client"

import React from "react"
import type { Contact } from "@/api/models/contact"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface ContactDetailProps {
  item: Contact | null
  open: boolean
  onClose: () => void
}

const formatDateTime = (value?: string | null): string => {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const DetailRow: React.FC<{ label: string; value?: string | null }> = ({
  label,
  value,
}) => (
  <div className="flex gap-3">
    <span className="w-36 flex-shrink-0 text-sm font-medium text-gray-500">
      {label}
    </span>
    <span className="text-sm text-gray-900">{value || "—"}</span>
  </div>
)

export const ContactDetail: React.FC<ContactDetailProps> = ({
  item,
  open,
  onClose,
}) => {
  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết liên hệ</DialogTitle>
        </DialogHeader>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {[item.last_name, item.first_name].filter(Boolean).join(" ") || "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label="Số điện thoại" value={item.phone_number} />
            <DetailRow label="Email" value={item.email} />
            <DetailRow label="Địa chỉ" value={item.address} />
            <DetailRow label="Loại liên hệ" value={item.content_type} />
            <DetailRow label="Ngày hẹn" value={formatDateTime(item.preferred_date)} />
            <DetailRow label="Giờ hẹn" value={item.preferred_time} />
            <Separator />
            <div>
              <span className="text-sm font-medium text-gray-500 block mb-1">
                Nội dung tin nhắn
              </span>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                {item.content || "—"}
              </p>
            </div>
            <Separator />
            <DetailRow label="Ngày tạo" value={formatDateTime(item.created_at)} />
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
