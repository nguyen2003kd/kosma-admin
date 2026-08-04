import { useState } from "react";

export type FooterElementType = "text" | "image";

export interface FooterElementInput {
  type: FooterElementType;
  content: string;
  link: string;
}

export interface FooterRowInput {
  elements: FooterElementInput[];
}

export interface FooterColumnInput {
  title: string;
  rows: FooterRowInput[];
}

export interface FooterFormState {
  language: "vi" | "en";
  is_active: boolean;
  columns: FooterColumnInput[];
}

export interface FooterSubmitPayload {
  language: "vi" | "en";
  is_active: boolean;
  columns: Array<{
    title: string | null;
    sort_order: number;
    rows: Array<{
      elements: Array<{
        type: FooterElementType;
        content: string | null;
        link: string | null;
        sort_order: number;
      }>;
    }>;
  }>;
}

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------
const emptyElement = (type: FooterElementType = "text"): FooterElementInput => ({
  type,
  content: "",
  link: "",
});

const emptyRow = (): FooterRowInput => ({
  elements: [emptyElement()],
});

const emptyColumn = (): FooterColumnInput => ({
  title: "",
  rows: [emptyRow()],
});

const defaultFormState: FooterFormState = {
  language: "vi",
  is_active: true,
  columns: [emptyColumn()],
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useFooterForm(initial?: Partial<FooterFormState>) {
  const [formData, setFormData] = useState<FooterFormState>({
    language: initial?.language ?? "vi",
    is_active: initial?.is_active ?? true,
    columns: initial?.columns ?? [emptyColumn()],
  });

  // ---- Column helpers ----
  const addColumn = () => {
    setFormData((prev) => ({
      ...prev,
      columns: [...prev.columns, emptyColumn()],
    }));
  };

  const removeColumn = (colIdx: number) => {
    setFormData((prev) => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== colIdx),
    }));
  };

  const updateColumnTitle = (colIdx: number, title: string) => {
    setFormData((prev) => {
      const cols = [...prev.columns];
      cols[colIdx] = { ...cols[colIdx], title };
      return { ...prev, columns: cols };
    });
  };

  // ---- Row helpers ----
  const addRow = (colIdx: number) => {
    setFormData((prev) => {
      const cols = [...prev.columns];
      const col = { ...cols[colIdx] };
      col.rows = [...col.rows, emptyRow()];
      cols[colIdx] = col;
      return { ...prev, columns: cols };
    });
  };

  const removeRow = (colIdx: number, rowIdx: number) => {
    setFormData((prev) => {
      const cols = [...prev.columns];
      const col = { ...cols[colIdx] };
      col.rows = col.rows.filter((_, i) => i !== rowIdx);
      cols[colIdx] = col;
      return { ...prev, columns: cols };
    });
  };

  // ---- Element helpers ----
  const addElement = (colIdx: number, rowIdx: number, type: FooterElementType = "text") => {
    setFormData((prev) => {
      const cols = [...prev.columns];
      const col = { ...cols[colIdx] };
      const rows = [...col.rows];
      const row = { ...rows[rowIdx] };
      row.elements = [...row.elements, emptyElement(type)];
      rows[rowIdx] = row;
      col.rows = rows;
      cols[colIdx] = col;
      return { ...prev, columns: cols };
    });
  };

  const removeElement = (colIdx: number, rowIdx: number, elIdx: number) => {
    setFormData((prev) => {
      const cols = [...prev.columns];
      const col = { ...cols[colIdx] };
      const rows = [...col.rows];
      const row = { ...rows[rowIdx] };
      row.elements = row.elements.filter((_, i) => i !== elIdx);
      rows[rowIdx] = row;
      col.rows = rows;
      cols[colIdx] = col;
      return { ...prev, columns: cols };
    });
  };

  const updateElement = (
    colIdx: number,
    rowIdx: number,
    elIdx: number,
    field: keyof FooterElementInput,
    value: string,
  ) => {
    setFormData((prev) => {
      const cols = [...prev.columns];
      const col = { ...cols[colIdx] };
      const rows = [...col.rows];
      const row = { ...rows[rowIdx] };
      const elements = [...row.elements];
      elements[elIdx] = { ...elements[elIdx], [field]: value };
      row.elements = elements;
      rows[rowIdx] = row;
      col.rows = rows;
      cols[colIdx] = col;
      return { ...prev, columns: cols };
    });
  };

  // ---- Reorder helpers (for drag-and-drop) ----
  const reorderColumns = (fromIdx: number, toIdx: number) => {
    setFormData((prev) => {
      const cols = [...prev.columns];
      const [moved] = cols.splice(fromIdx, 1);
      cols.splice(toIdx, 0, moved);
      return { ...prev, columns: cols };
    });
  };

  const reorderRows = (colIdx: number, fromIdx: number, toIdx: number) => {
    setFormData((prev) => {
      const cols = [...prev.columns];
      const col = { ...cols[colIdx] };
      const rows = [...col.rows];
      const [moved] = rows.splice(fromIdx, 1);
      rows.splice(toIdx, 0, moved);
      col.rows = rows;
      cols[colIdx] = col;
      return { ...prev, columns: cols };
    });
  };

  const reorderElements = (
    colIdx: number,
    rowIdx: number,
    fromIdx: number,
    toIdx: number,
  ) => {
    setFormData((prev) => {
      const cols = [...prev.columns];
      const col = { ...cols[colIdx] };
      const rows = [...col.rows];
      const row = { ...rows[rowIdx] };
      const elements = [...row.elements];
      const [moved] = elements.splice(fromIdx, 1);
      elements.splice(toIdx, 0, moved);
      row.elements = elements;
      rows[rowIdx] = row;
      col.rows = rows;
      cols[colIdx] = col;
      return { ...prev, columns: cols };
    });
  };

  // ---- Submit ----
  const getSubmitData = (): FooterSubmitPayload => {
    return {
      language: formData.language,
      is_active: formData.is_active,
      columns: formData.columns.map((col, cIdx) => ({
        title: col.title.trim() || null,
        sort_order: cIdx,
        rows: col.rows.map((row) => ({
          elements: row.elements
            .filter((el) => el.content.trim() || el.link.trim())
            .map((el, eIdx) => ({
              type: el.type,
              content: el.content.trim() || null,
              link: el.link.trim() || null,
              sort_order: eIdx,
            })),
        })),
      })),
    };
  };

  // ---- Load from API (for edit page) ----
  const loadFromApi = (data: any) => {
    if (!data) return;
    const columns: FooterColumnInput[] = (data.footer_columns || []).map((col: any) => ({
      title: col.title || "",
      rows: (col.footer_rows || []).map((row: any) => ({
        elements: (row.footer_elements || []).map((el: any) => ({
          type: (el.type as FooterElementType) || "text",
          content: el.content || "",
          link: el.link || "",
        })),
      })),
    }));
    setFormData({
      language: data.language ?? "vi",
      is_active: data.is_active ?? true,
      columns: columns.length > 0 ? columns : [emptyColumn()],
    });
  };

  return {
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
  };
}
