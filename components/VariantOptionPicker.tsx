"use client";

import React from "react";
import type { VariantOption, ProductVariant } from "@/types/product";
import { formatCurrency } from "@/utils/format";
import {
  getVariantPriceHint,
  getVariantImageHint,
  isOptionValueAvailable,
  isOptionValueOutOfStock,
} from "@/lib/product-utils";

interface VariantOptionPickerProps {
  groups: VariantOption[];
  variants: ProductVariant[];
  selectedOptions: Record<string, string>;
  onSelect: (optionName: string, value: string) => void;
}

export default function VariantOptionPicker({
  groups,
  variants,
  selectedOptions,
  onSelect,
}: VariantOptionPickerProps) {
  return (
    <>
      {groups.map((group) => (
        <div key={group.name} className="product-option-group">
          <div className="d-flex align-items-baseline justify-content-between mb-2">
            <span className="product-option-label">{group.name}</span>
            <span className="product-option-selected">{selectedOptions[group.name] ?? "Choose one"}</span>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {group.values.map((value) => {
              const available = isOptionValueAvailable(
                variants,
                groups,
                group.name,
                value,
                selectedOptions
              );
              const outOfStock = isOptionValueOutOfStock(
                variants,
                groups,
                group.name,
                value,
                selectedOptions
              );
              const isSelected = selectedOptions[group.name] === value;
              const valueThumb = getVariantImageHint(
                variants,
                group.name,
                value,
                selectedOptions
              );
              const valuePrice = getVariantPriceHint(
                variants,
                group.name,
                value,
                selectedOptions,
                groups
              );

              return (
                <button
                  key={value}
                  type="button"
                  disabled={!available}
                  className={`product-option-chip ${isSelected ? "selected" : ""} ${!available ? "disabled" : ""}`}
                  onClick={() => onSelect(group.name, value)}
                >
                  {valueThumb && (
                    <span className="product-option-chip-img">
                      <img src={valueThumb} alt="" />
                    </span>
                  )}
                  <span className="product-option-chip-text">
                    <span>{value}</span>
                    {valuePrice != null && (
                      <span className="product-option-chip-price">{formatCurrency(valuePrice)}</span>
                    )}
                  </span>
                  {outOfStock && available && (
                    <span className="product-option-oos">OOS</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
