"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface TextFieldWithDiffProps {
  id: string;
  label: string;
  value: string;
  originalValue: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Text field with visual indicator for modified values
 * Shows "Modifié" badge when value differs from original
 */
export function TextFieldWithDiff({
  id,
  label,
  value,
  originalValue,
  onChange,
  placeholder,
}: TextFieldWithDiffProps) {
  // Check if value has been modified
  const isModified = value !== originalValue && value !== "";
  const hasValue = originalValue !== null && originalValue !== undefined && originalValue !== "";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-base font-medium">
          {label}
        </Label>
        {isModified && (
          <Badge variant="default" className="bg-blue-500 text-xs">
            Modifié
          </Badge>
        )}
      </div>

      {/* Show original value from PDF */}
      {hasValue && (
        <div className="text-xs text-gray-600">
          <span className="font-medium">PDF:</span> {String(originalValue)}
        </div>
      )}

      {/* Input field */}
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-14 ${isModified ? "border-blue-500 ring-1 ring-blue-500" : ""}`}
        placeholder={placeholder || String(originalValue)}
      />
    </div>
  );
}
