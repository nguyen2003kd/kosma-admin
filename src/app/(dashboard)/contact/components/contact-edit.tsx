"use client"

import React, { useEffect, useState } from "react"
import type { Contact } from "@/api/models/contact"
import type { ContactMutate } from "@/api/models/contactMutate"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface ContactEditProps {
  item: Contact | null
  open: boolean
  onClose: () => void
  onSubmit: (id: string, values: ContactMutate) => Promise<void>
}

export const ContactEdit: React.FC<ContactEditProps> = ({
  item,
  open,
  onClose,
  onSubmit,
}) => {
  const [values, setValues] = useState<ContactMutate>({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    content: "",
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (item) {
      setValues({
        first_name: item.first_name ?? "",
        last_name: item.last_name ?? "",
        phone_number: item.phone_number ?? "",
        email: item.email ?? "",
        content: item.content ?? "",
      })
    }
  }, [item])

  const handleChange = (field: keyof ContactMutate, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!item?.id) return
    setSaving(true)
    try {
      await onSubmit(item.id, values)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    if (!saving) onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa liên hệ</DialogTitle>
        </DialogHeader>
        <Card>
          <CardHeader>
            <CardTitle>Chỉnh sửa thông tin liên hệ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="c-lastname">Họ <span className="text-red-500">*</span></Label>
                    <Input
                      id="c-lastname"
                      value={values.last_name ?? ""}
                      onChange={(e) => handleChange("last_name", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="c-firstname">Tên <span className="text-red-500">*</span></Label>
                    <Input
                      id="c-firstname"
                      value={values.first_name ?? ""}
                      onChange={(e) => handleChange("first_name", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="c-phone">Số điện thoại</Label>
                  <Input
                    id="c-phone"
                    value={values.phone_number ?? ""}
                    onChange={(e) => handleChange("phone_number", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="c-email">Email</Label>
                  <Input
                    id="c-email"
                    type="email"
                    value={values.email ?? ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="c-content">Nội dung tin nhắn</Label>
                <Textarea
                  id="c-content"
                  value={values.content ?? ""}
                  onChange={(e) => handleChange("content", e.target.value)}
                  rows={4}
                  className="mt-1 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  "Cập nhật"
                )}
              </Button>
              <Button variant="outline" onClick={handleClose} disabled={saving}>
                Hủy bỏ
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
