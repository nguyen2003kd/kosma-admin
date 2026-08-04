"use client";

import { useGetApiV10FooterId } from "@/api/endpoints/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";
import { extractErrorMessage } from "@/utils/error";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { useFooterForm, useFooterMutations } from "../../hooks";
import { FooterEditor } from "../../components/footer-editor";

export default function EditFooterPage() {
  const params = useParams();
  const id = decodeURIComponent(params.id as string);
  const router = useRouter();
  const { data: footerData, isLoading } = useGetApiV10FooterId(id);
  const { updateMutation, invalidateFooters } = useFooterMutations();

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
    loadFromApi,
  } = useFooterForm();

  useEffect(() => {
    if (footerData?.responseData) {
      loadFromApi(footerData.responseData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [footerData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id,
        data: getSubmitData() as any,
      });
      toast.success({ title: "Thành công", content: "Đã cập nhật footer" });
      invalidateFooters();
      router.push("/footer");
    } catch (error) {
      const msg = extractErrorMessage(error);
      toast.error({ title: "Cập nhật thất bại", content: msg });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!footerData?.responseData) {
    return (
      <div className="p-6">
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Không tìm thấy footer</h3>
            <p className="text-muted-foreground mb-4">
              Footer này không tồn tại hoặc đã bị xóa
            </p>
            <Link href="/footer">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại danh sách
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Card>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between px-2">
            <div>
              <h1 className="text-2xl font-bold">Chỉnh sửa Footer</h1>
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
              disabled={updateMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
