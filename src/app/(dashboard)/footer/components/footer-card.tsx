import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Edit,
  Eye,
  Loader2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import Can from "@/acl/Can";

interface FooterElementData {
  id?: string;
  type?: string;
  content?: string | null;
  link?: string | null;
}

interface FooterRowData {
  id?: string;
  footer_elements?: FooterElementData[] | null;
}

interface FooterColumnData {
  id?: string;
  title?: string | null;
  footer_rows?: FooterRowData[] | null;
}

interface FooterData {
  id?: string;
  language?: string;
  is_active?: boolean | null;
  footer_columns?: FooterColumnData[] | null;
}

interface FooterCardProps {
  footer: FooterData;
  index: number;
  canEdit?: boolean;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  deletingId?: string | null;
}

export function FooterCard({
  footer,
  index,
  canEdit = false,
  onDelete,
  isDeleting = false,
  deletingId,
}: FooterCardProps) {
  const isThisDeleting = deletingId === footer.id;
  const columns = footer.footer_columns ?? [];

  return (
    <Card className="border-2 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600">{index}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Footer {footer.language?.toUpperCase()}
                </h3>
                <span
                  className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${footer.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                    }`}
                >
                  {footer.is_active ? "Đang hiển thị" : "Ẩn"}
                </span>
              </div>
            </div>
          </div>

          {/* Columns preview */}
          {columns.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {columns.map((col, colIdx) => {
                const rows = col.footer_rows ?? [];
                const allElements = rows.flatMap((r) => r.footer_elements ?? []);
                return (
                  <div
                    key={col.id ?? colIdx}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <p className="font-medium text-sm mb-2 truncate">
                      {col.title || `Column ${colIdx + 1}`}
                    </p>
                    <ul className="space-y-1">
                      {allElements.slice(0, 5).map((el, elIdx) => (
                        <li
                          key={el.id ?? elIdx}
                          className="text-xs text-muted-foreground truncate flex items-center gap-1"
                        >
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                          {el.type === "image" ? "🖼️ " : ""}
                          {el.content || "(trống)"}
                        </li>
                      ))}
                      {allElements.length > 5 && (
                        <li className="text-xs text-muted-foreground italic">
                          +{allElements.length - 5} mục khác...
                        </li>
                      )}
                      {allElements.length === 0 && (
                        <li className="text-xs text-muted-foreground italic">
                          Chưa có element
                        </li>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {columns.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              Footer chưa có column nào
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Can I="view_detail" a="footer">
              <Link href={`/footer/${footer.id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Xem
                </Button>
              </Link>
            </Can>
            {canEdit && (
              <Link href={`/footer/edit/${footer.id}`}>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Sửa
                </Button>
              </Link>
            )}
            <Can I="delete" a="footer">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => footer.id && onDelete(footer.id)}
                disabled={isDeleting || isThisDeleting}
              >
                {isThisDeleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Xóa
              </Button>
            </Can>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
