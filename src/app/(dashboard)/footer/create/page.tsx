"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";
import { extractErrorMessage } from "@/utils/error";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFooterForm, useFooterMutations } from "../hooks";
import { FooterEditor } from "../components/footer-editor";

export default function CreateFooterPage() {
  const router = useRouter();
  const { createMutation, invalidateFooters } = useFooterMutations();

  const {
    formData,
    setFormData,
    addColumn,
    removeColumn,
    updateColumnTitle,
    addRow,
    removeRow,
    addElement,
    removeElement,
    updateElement,
    reorderColumns,
    reorderRows,
    reorderElements,
    getSubmitData,
  } = useFooterForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        data: getSubmitData() as any,
      });
      toast.success({ title: "Thành công", content: "Đã tạo footer mới" });
      invalidateFooters();
      router.push("/footer");
    } catch (error) {
      const msg = extractErrorMessage(error);
      toast.error({ title: "Tạo thất bại", content: msg });
    }
  };

  return (
    <>
      <Card>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between px-2">
            <div>
              <h1 className="text-2xl font-bold">Tạo Footer Mới</h1>
              <p className="text-base text-muted-foreground mt-1">
                Footer theo cấu trúc: Column → Row → Element (text/image). Kéo
                thả để đổi thứ tự.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="px-6 py-5">
        <form id="footer-form" onSubmit={handleSubmit} className="space-y-4">
          <FooterEditor
            columns={formData.columns}
            language={formData.language}
            is_active={formData.is_active}
            onLanguageChange={(lang) =>
              setFormData({ ...formData, language: lang })
            }
            onActiveChange={(v) => setFormData({ ...formData, is_active: v })}
            onAddColumn={addColumn}
            onRemoveColumn={removeColumn}
            onUpdateColumnTitle={updateColumnTitle}
            onAddRow={addRow}
            onRemoveRow={removeRow}
            onAddElement={addElement}
            onRemoveElement={removeElement}
            onUpdateElement={updateElement}
            onReorderColumns={reorderColumns}
            onReorderRows={reorderRows}
            onReorderElements={reorderElements}
          />

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/footer")}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Tạo footer
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
