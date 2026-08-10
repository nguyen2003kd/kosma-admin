"use client"

import React, { useEffect, useState } from "react"
import type { Question } from "@/api/models/question"
import type { File } from "@/api/models/file"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, Paperclip, FileText, Image as ImageIcon, Download } from "lucide-react"
import { mainInstance } from "@/api/mutator/custom-instance"
import Image from "next/image"

interface QuestionFileRow {
  id: string
  question_id: string
  file_id: string
  file?: File | null
}

interface QuestionDetailProps {
  item: Question | null
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

const getFileUrl = (file?: File | null): string => {
  if (!file) return ""
  return file.path || ""
}

const isImage = (file?: File | null): boolean => {
  if (!file) return false
  if (file.type === "IMAGE") return true
  if (file.mime?.startsWith("image/")) return true
  return false
}

const formatFileSize = (bytes?: number | null): string => {
  if (!bytes) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const QuestionDetail: React.FC<QuestionDetailProps> = ({
  item,
  open,
  onClose,
}) => {
  const [files, setFiles] = useState<File[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)

  useEffect(() => {
    if (!item?.id || !open) {
      setFiles([])
      return
    }
    let cancelled = false
    setLoadingFiles(true)
    mainInstance<{ responseData?: QuestionFileRow[] }>({
      url: `/api/v1.0/questionFile/${item.id}`,
      method: "GET",
    })
      .then((res) => {
        if (cancelled) return
        const rows = res?.responseData ?? []
        const fileList: File[] = []
        for (const row of rows) {
          if (row.file) fileList.push(row.file)
        }
        setFiles(fileList)
      })
      .catch(() => {
        if (!cancelled) setFiles([])
      })
      .finally(() => {
        if (!cancelled) setLoadingFiles(false)
      })
    return () => {
      cancelled = true
    }
  }, [item?.id, open])

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết câu hỏi</DialogTitle>
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
            <Separator />
            <div>
              <span className="text-sm font-medium text-gray-500 block mb-1">
                Nội dung câu hỏi
              </span>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                {item.content || "—"}
              </p>
            </div>
            <Separator />
            <div>
              <span className="text-sm font-medium text-gray-500 block mb-2">
                File đính kèm
              </span>
              {loadingFiles ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải...
                </div>
              ) : files.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Paperclip className="h-4 w-4" />
                  Không có file đính kèm
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {files.map((file) => {
                    const url = getFileUrl(file)
                    const img = isImage(file)
                    return (
                      <a
                        key={file.id}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 hover:bg-gray-50 transition-colors flex flex-col gap-2"
                      >
                        {img ? (
                          <div className="relative w-full h-24 bg-gray-100 rounded overflow-hidden">
                            <Image
                              src={url}
                              alt={file.file_name || "file"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center">
                            <FileText className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {file.file_name || "Unnamed"}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                          {img ? (
                            <ImageIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          ) : (
                            <Download className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          )}
                        </div>
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
            <Separator />
            <DetailRow label="Ngày tạo" value={formatDateTime(item.created_at)} />
            <DetailRow label="Cập nhật" value={formatDateTime(item.updated_at)} />
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
