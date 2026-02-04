"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  disabled?: boolean;
}

const presetColors = [
  { name: "Rouge", value: "#dc2626" },
  { name: "Orange", value: "#ea580c" },
  { name: "Ambre", value: "#d97706" },
  { name: "Jaune", value: "#ca8a04" },
  { name: "Lime", value: "#65a30d" },
  { name: "Vert", value: "#16a34a" },
  { name: "Emeraude", value: "#059669" },
  { name: "Cyan", value: "#0891b2" },
  { name: "Bleu ciel", value: "#0284c7" },
  { name: "Bleu", value: "#2563eb" },
  { name: "Indigo", value: "#4f46e5" },
  { name: "Violet", value: "#7c3aed" },
  { name: "Pourpre", value: "#9333ea" },
  { name: "Fuchsia", value: "#c026d3" },
  { name: "Rose", value: "#db2777" },
  { name: "Gris", value: "#525252" },
];

export function ColorPicker({ value, onChange, label, disabled }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(value || "");

  const handlePresetClick = (color: string) => {
    if (disabled) return;
    setCustomColor(color);
    onChange(color);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomColor(newValue);
    // Only call onChange if it's a valid hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}

      {/* Preset Colors Grid */}
      <div className="flex flex-wrap gap-2">
        {presetColors.map((color) => (
          <button
            key={color.value}
            type="button"
            disabled={disabled}
            title={color.name}
            className={cn(
              "w-8 h-8 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
              value === color.value
                ? "border-white ring-2 ring-primary shadow-lg"
                : "border-transparent hover:border-white/50",
              disabled && "opacity-50 cursor-not-allowed hover:scale-100"
            )}
            style={{ backgroundColor: color.value }}
            onClick={() => handlePresetClick(color.value)}
          />
        ))}
      </div>

      {/* Custom Color Input */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg border border-border shrink-0"
          style={{ backgroundColor: value || "#525252" }}
        />
        <Input
          type="text"
          placeholder="#hex (ex: #dc2626)"
          value={customColor}
          onChange={handleCustomChange}
          disabled={disabled}
          className="font-mono"
        />
        <input
          type="color"
          value={value || "#525252"}
          onChange={(e) => {
            setCustomColor(e.target.value);
            onChange(e.target.value);
          }}
          disabled={disabled}
          className="w-10 h-10 rounded cursor-pointer border-0 p-0"
        />
      </div>
    </div>
  );
}
