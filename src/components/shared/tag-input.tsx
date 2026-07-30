"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useGetApiV10Tags } from "@/api/endpoints/tag";

export interface TagItem {
  id: string;
  name: string;
  isNew?: boolean;
}

interface TagInputProps {
  value: TagItem[];
  onChange: (tags: TagItem[]) => void;
  label?: string;
  placeholder?: string;
}

export function TagInput({
  value,
  onChange,
  label = "Tags",
  placeholder = "Nhập tag, phân tách bởi dấu phẩy",
}: TagInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: tagsData } = useGetApiV10Tags(
    { pageSize: 1000 },
    {
      query: {
        staleTime: 60 * 1000,
      },
    },
  );

  const existingTags = useMemo(() => {
    const rows = (tagsData?.responseData?.rows as any[]) || [];
    return rows.map((t) => ({ id: t.id as string, name: (t.name as string) || "" }));
  }, [tagsData]);

  const suggestions = useMemo(() => {
    const query = input.split(",").pop()?.trim().toLowerCase() ?? "";
    if (!query) return [];
    return existingTags
      .filter(
        (t) =>
          t.name.toLowerCase().includes(query) &&
          !value.some((v) => v.id === t.id || v.name.toLowerCase() === t.name.toLowerCase()),
      )
      .slice(0, 8);
  }, [input, existingTags, value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addTagFromText = (rawName: string) => {
    const name = rawName.trim();
    if (!name) return;

    if (value.some((v) => v.name.toLowerCase() === name.toLowerCase())) return;

    const matched = existingTags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (matched) {
      onChange([...value, { id: matched.id, name: matched.name }]);
      return;
    }

    onChange([
      ...value,
      { id: `__new__${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, name, isNew: true },
    ]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    setShowSuggestions(true);

    if (val.includes(",")) {
      const parts = val.split(",").map((p) => p.trim()).filter(Boolean);
      const last = val.split(",").pop()?.trim() ?? "";
      parts.forEach(addTagFromText);
      setInput(last);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const last = input.split(",").pop()?.trim() ?? "";
      if (last) {
        addTagFromText(last);
        setInput("");
        setShowSuggestions(false);
      }
    } else if (e.key === "Backspace" && input === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleSuggestionClick = (tag: { id: string; name: string }) => {
    if (value.some((v) => v.id === tag.id)) return;
    onChange([...value, { id: tag.id, name: tag.name }]);
    const baseInput = input.split(",").slice(0, -1).join(",");
    setInput(baseInput ? baseInput + "," : "");
    setShowSuggestions(false);
  };

  const removeTag = (id: string) => {
    onChange(value.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label>{label}</Label>

      {/* Selected tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className={
                tag.isNew
                  ? "bg-amber-100 text-amber-800 pr-1"
                  : "bg-blue-50 text-blue-700 pr-1"
              }
            >
              {tag.name}
              {tag.isNew && <span className="ml-1 text-[10px]">(mới)</span>}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="ml-1 rounded-full hover:bg-black/10 p-0.5"
                aria-label={`Xoá tag ${tag.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="relative">
        <Input
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
            {suggestions.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleSuggestionClick(tag)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center justify-between"
              >
                <span>{tag.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Nhập tag rồi nhấn Enter hoặc dấu phẩy để thêm. Tag chưa có sẽ được tạo mới khi lưu.
      </p>
    </div>
  );
}
