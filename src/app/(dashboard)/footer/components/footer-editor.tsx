"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Columns3,
  GripVertical,
  Image as ImageIcon,
  Plus,
  Rows3,
  Trash2,
  Type,
} from "lucide-react";
import type { FooterElementType } from "../hooks/useFooterForm";

interface ElementData {
  type: FooterElementType;
  content: string;
  link: string;
}

interface RowData {
  elements: ElementData[];
}

interface ColumnData {
  title: string;
  rows: RowData[];
}

interface EditorProps {
  columns: ColumnData[];
  language: "vi" | "en";
  is_active: boolean;
  onLanguageChange: (lang: "vi" | "en") => void;
  onActiveChange: (v: boolean) => void;
  onAddColumn: () => void;
  onRemoveColumn: (idx: number) => void;
  onUpdateColumnTitle: (idx: number, title: string) => void;
  onAddRow: (colIdx: number) => void;
  onRemoveRow: (colIdx: number, rowIdx: number) => void;
  onAddElement: (colIdx: number, rowIdx: number, type: FooterElementType) => void;
  onRemoveElement: (colIdx: number, rowIdx: number, elIdx: number) => void;
  onUpdateElement: (
    colIdx: number,
    rowIdx: number,
    elIdx: number,
    field: keyof ElementData,
    value: string,
  ) => void;
  onReorderColumns: (from: number, to: number) => void;
  onReorderRows: (colIdx: number, from: number, to: number) => void;
  onReorderElements: (
    colIdx: number,
    rowIdx: number,
    from: number,
    to: number,
  ) => void;
}

// ---------------------------------------------------------------------------
// Sortable wrappers
// ---------------------------------------------------------------------------
function SortableColumn({
  colIdx,
  children,
  onRemove,
}: {
  colIdx: number;
  children: React.ReactNode;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `col-${colIdx}` });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <Card ref={setNodeRef} style={style}>
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-3 flex-1">
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="h-8 w-8 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 text-blue-600" />
            </button>
            <span className="text-sm font-medium text-muted-foreground flex-shrink-0">
              Column {colIdx + 1}
            </span>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="h-8 w-8 p-0 hover:bg-red-50 rounded-md flex items-center justify-center"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
        {children}
      </div>
    </Card>
  );
}

function SortableRow({
  rowIdx,
  children,
  onRemove,
}: {
  rowIdx: number;
  children: React.ReactNode;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `row-${rowIdx}` });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing flex items-center gap-1"
          >
            <Rows3 className="h-4 w-4 text-gray-500" />
            <span className="text-xs font-medium text-muted-foreground">
              Row {rowIdx + 1}
            </span>
          </button>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="h-7 w-7 p-0 hover:bg-red-50 rounded-md flex items-center justify-center"
        >
          <Trash2 className="h-3.5 w-3.5 text-red-600" />
        </button>
      </div>
      {children}
    </div>
  );
}

function SortableElement({
  elIdx,
  children,
  onRemove,
}: {
  elIdx: number;
  children: React.ReactNode;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `el-${elIdx}` });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 bg-white rounded-md border border-gray-200 space-y-2"
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-3.5 w-3.5 text-gray-400" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="h-7 w-7 p-0 hover:bg-red-50 rounded-md flex items-center justify-center"
        >
          <Trash2 className="h-3.5 w-3.5 text-red-600" />
        </button>
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main editor
// ---------------------------------------------------------------------------
export function FooterEditor(props: EditorProps) {
  const {
    columns,
    language,
    is_active,
    onLanguageChange,
    onActiveChange,
    onAddColumn,
    onRemoveColumn,
    onUpdateColumnTitle,
    onAddRow,
    onRemoveRow,
    onAddElement,
    onRemoveElement,
    onUpdateElement,
    onReorderColumns,
    onReorderRows,
    onReorderElements,
  } = props;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleColumnDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = Number((active.id as string).replace("col-", ""));
    const to = Number((over.id as string).replace("col-", ""));
    onReorderColumns(from, to);
  };

  const handleRowDragEnd = (colIdx: number) => (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = Number((active.id as string).replace("row-", ""));
    const to = Number((over.id as string).replace("row-", ""));
    onReorderRows(colIdx, from, to);
  };

  const handleElementDragEnd =
    (colIdx: number, rowIdx: number) => (e: DragEndEvent) => {
      const { active, over } = e;
      if (!over || active.id === over.id) return;
      const from = Number((active.id as string).replace("el-", ""));
      const to = Number((over.id as string).replace("el-", ""));
      onReorderElements(colIdx, rowIdx, from, to);
    };

  return (
    <div className="space-y-4">
      {/* Basic settings */}
      <Card>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Columns3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Cài đặt chung</h3>
              <p className="text-sm text-muted-foreground">
                Ngôn ngữ và trạng thái footer
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ngôn ngữ</Label>
              <div className="flex gap-2">
                {(["vi", "en"] as const).map((lang) => (
                  <Button
                    key={lang}
                    type="button"
                    variant={language === lang ? "default" : "outline"}
                    size="sm"
                    onClick={() => onLanguageChange(lang)}
                  >
                    {lang === "vi" ? "Tiếng Việt" : "English"}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Trạng thái hoạt động</Label>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  checked={is_active}
                  onChange={(e) => onActiveChange(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm text-muted-foreground">
                  {is_active ? "Đang hiển thị" : "Ẩn"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Columns (sortable) */}
      <DndContext sensors={sensors} onDragEnd={handleColumnDragEnd}>
        <SortableContext
          items={columns.map((_, idx) => `col-${idx}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {columns.map((column, colIdx) => (
              <SortableColumn
                key={`col-${colIdx}`}
                colIdx={colIdx}
                onRemove={() => onRemoveColumn(colIdx)}
              >
                {/* Column title input (separate from sortable handle) */}
                <Input
                  value={column.title}
                  onChange={(e) => onUpdateColumnTitle(colIdx, e.target.value)}
                  placeholder="Tiêu đề column (vd: Services, Company...)"
                  className="bg-gray-50"
                />

                {/* Rows (sortable) */}
                <DndContext
                  sensors={sensors}
                  onDragEnd={handleRowDragEnd(colIdx)}
                >
                  <SortableContext
                    items={column.rows.map((_, idx) => `row-${idx}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {column.rows.map((row, rowIdx) => (
                        <SortableRow
                          key={`row-${rowIdx}`}
                          rowIdx={rowIdx}
                          onRemove={() => onRemoveRow(colIdx, rowIdx)}
                        >
                          {/* Elements (sortable) */}
                          <DndContext
                            sensors={sensors}
                            onDragEnd={handleElementDragEnd(colIdx, rowIdx)}
                          >
                            <SortableContext
                              items={row.elements.map((_, idx) => `el-${idx}`)}
                              strategy={
                                row.elements.length >= 2
                                  ? rectSortingStrategy
                                  : verticalListSortingStrategy
                              }
                            >
                              <div
                                className={
                                  row.elements.length >= 2
                                    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"
                                    : "space-y-2"
                                }
                              >
                                {row.elements.map((el, elIdx) => (
                                  <SortableElement
                                    key={`el-${elIdx}`}
                                    elIdx={elIdx}
                                    onRemove={() =>
                                      onRemoveElement(colIdx, rowIdx, elIdx)
                                    }
                                  >
                                    <div className="flex gap-1 mb-1">
                                      <Button
                                        type="button"
                                        variant={
                                          el.type === "text" ? "default" : "outline"
                                        }
                                        size="sm"
                                        className="h-7 px-2"
                                        onClick={() =>
                                          onUpdateElement(
                                            colIdx,
                                            rowIdx,
                                            elIdx,
                                            "type",
                                            "text",
                                          )
                                        }
                                      >
                                        <Type className="h-3 w-3 mr-1" />
                                        Text
                                      </Button>
                                      <Button
                                        type="button"
                                        variant={
                                          el.type === "image" ? "default" : "outline"
                                        }
                                        size="sm"
                                        className="h-7 px-2"
                                        onClick={() =>
                                          onUpdateElement(
                                            colIdx,
                                            rowIdx,
                                            elIdx,
                                            "type",
                                            "image",
                                          )
                                        }
                                      >
                                        <ImageIcon className="h-3 w-3 mr-1" />
                                        Image
                                      </Button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2">
                                      <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">
                                          {el.type === "text"
                                            ? "Nội dung text"
                                            : "URL ảnh"}
                                        </Label>
                                        <Input
                                          value={el.content}
                                          onChange={(e) =>
                                            onUpdateElement(
                                              colIdx,
                                              rowIdx,
                                              elIdx,
                                              "content",
                                              e.target.value,
                                            )
                                          }
                                          placeholder={
                                            el.type === "text"
                                              ? "Về chúng tôi"
                                              : "https://example.com/logo.png"
                                          }
                                          className="bg-gray-50 h-8 text-sm"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">
                                          Link (tùy chọn)
                                        </Label>
                                        <Input
                                          value={el.link}
                                          onChange={(e) =>
                                            onUpdateElement(
                                              colIdx,
                                              rowIdx,
                                              elIdx,
                                              "link",
                                              e.target.value,
                                            )
                                          }
                                          placeholder="/about-us hoặc https://..."
                                          className="bg-gray-50 h-8 text-sm"
                                        />
                                      </div>
                                    </div>
                                  </SortableElement>
                                ))}
                              </div>
                            </SortableContext>
                          </DndContext>

                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7"
                              onClick={() => onAddElement(colIdx, rowIdx, "text")}
                            >
                              <Type className="h-3 w-3 mr-1" />
                              Thêm text
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7"
                              onClick={() => onAddElement(colIdx, rowIdx, "image")}
                            >
                              <ImageIcon className="h-3 w-3 mr-1" />
                              Thêm image
                            </Button>
                          </div>
                        </SortableRow>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onAddRow(colIdx)}
                >
                  <Rows3 className="h-4 w-4 mr-2" />
                  Thêm row
                </Button>
              </SortableColumn>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button type="button" variant="outline" onClick={onAddColumn}>
        <Plus className="h-4 w-4 mr-2" />
        Thêm column
      </Button>
    </div>
  );
}
