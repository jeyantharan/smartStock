"use client";

import React, { useState } from "react";
import type { ProductVariant, VariantOption } from "@/types/product";
import { optionsKey, getRegularPrice, getOfferPrice } from "@/lib/product-utils";

interface VariantPricingMatrixProps {
  optionGroups: VariantOption[];
  variants: ProductVariant[];
  baseRegularPrice?: number;
  baseOfferPrice?: number;
  uploading: boolean;
  uploadImage: (file: File) => Promise<string | null>;
  onVariantsChange: (variants: ProductVariant[]) => void;
}

interface AddRowDraft {
  color: string;
  regularPrice: string;
  offerPrice: string;
  stock: string;
  image: string;
}

function sortedGroups(groups: VariantOption[]) {
  return [...groups].sort((a, b) => a.displayOrder - b.displayOrder);
}

function buildSku(options: Record<string, string>): string {
  const suffix = Object.values(options)
    .join("-")
    .toUpperCase()
    .replace(/\s+/g, "-")
    .slice(0, 40);
  return `SKU-${suffix || "DEFAULT"}`;
}

function parseOptionalPrice(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const n = parseFloat(value);
  return Number.isNaN(n) || n <= 0 ? undefined : n;
}

function parseRequiredPrice(value: string): number | undefined {
  return parseOptionalPrice(value);
}

export default function VariantPricingMatrix({
  optionGroups,
  variants,
  baseRegularPrice,
  baseOfferPrice,
  uploading,
  uploadImage,
  onVariantsChange,
}: VariantPricingMatrixProps) {
  const sorted = sortedGroups(optionGroups);
  const primary = sorted[0];
  const colorGroup = sorted[1];

  const [drafts, setDrafts] = useState<Record<string, AddRowDraft>>({});
  const [draftError, setDraftError] = useState("");

  if (!primary || !colorGroup) {
    return (
      <div className="alert alert-warning small mb-0">
        Add at least two option groups (e.g. <strong>Model</strong> and <strong>Color</strong>) above to
        set prices per combination.
      </div>
    );
  }

  const colorSuggestions = colorGroup.values.filter(Boolean);

  const defaultDraft = (): AddRowDraft => ({
    color: "",
    regularPrice: baseRegularPrice != null ? String(baseRegularPrice) : "",
    offerPrice: baseOfferPrice != null ? String(baseOfferPrice) : "",
    stock: "0",
    image: "",
  });

  const getDraft = (model: string): AddRowDraft => drafts[model] ?? defaultDraft();

  const setDraft = (model: string, patch: Partial<AddRowDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [model]: { ...getDraft(model), ...patch },
    }));
  };

  const resetDraft = (model: string) => {
    setDrafts((prev) => ({ ...prev, [model]: defaultDraft() }));
  };

  const updateVariant = (index: number, patch: Partial<ProductVariant>) => {
    onVariantsChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };

  const removeVariant = (index: number) => {
    onVariantsChange(variants.filter((_, i) => i !== index));
  };

  const handleRowImageUpload = async (variantIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) updateVariant(variantIndex, { image: url });
    e.target.value = "";
  };

  const handleDraftImageUpload = async (modelValue: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) setDraft(modelValue, { image: url });
    e.target.value = "";
  };

  const addColorToModel = (modelValue: string) => {
    const draft = getDraft(modelValue);
    const colorName = draft.color.trim();
    if (!colorName) return;

    const regular = parseRequiredPrice(draft.regularPrice);
    if (!regular) {
      setDraftError("Regular price is required for each variant.");
      return;
    }

    const offer = parseOptionalPrice(draft.offerPrice);
    if (offer != null && offer >= regular) {
      setDraftError("Offer price must be less than regular price.");
      return;
    }

    setDraftError("");

    const options: Record<string, string> = {
      [primary.name]: modelValue,
      [colorGroup.name]: colorName,
    };

    for (const group of sorted.slice(2)) {
      if (group.values[0]) options[group.name] = group.values[0];
    }

    const key = optionsKey(options);
    if (variants.some((v) => optionsKey(v.options) === key)) {
      return;
    }

    onVariantsChange([
      ...variants,
      {
        sku: buildSku(options),
        options,
        originalPrice: regular,
        price: offer ?? regular,
        stock: parseInt(draft.stock, 10) || 0,
        image: draft.image || undefined,
        isActive: true,
      },
    ]);

    resetDraft(modelValue);
  };

  const models = primary.values.filter(Boolean);

  if (models.length === 0) {
    return (
      <div className="alert alert-info small mb-0">
        Enter model names in the first option group (e.g. <strong>iPhone 14, iPhone 15</strong>), then add
        colors, regular prices, and optional offer prices for each model below.
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4">
      {draftError && (
        <div className="alert alert-danger py-2 px-3 mb-0" style={{ fontSize: "0.85rem" }}>
          {draftError}
        </div>
      )}
      <div className="alert alert-light border small mb-0">
        <strong>Regular price</strong> = list/MRP (required). <strong>Offer price</strong> = optional sale
        price; when set and lower than regular, the regular price is shown crossed out.
      </div>

      {models.map((modelValue) => {
        const rows = variants
          .map((v, index) => ({ v, index }))
          .filter(({ v }) => v.options[primary.name] === modelValue);
        const draft = getDraft(modelValue);
        const listId = `color-suggestions-${modelValue.replace(/\s+/g, "-")}`;
        const draftInputId = `draft-image-${modelValue.replace(/\s+/g, "-")}`;

        return (
          <div
            key={modelValue}
            className="border border-2 border-primary border-opacity-25 rounded-4 overflow-hidden"
          >
            <div className="bg-primary bg-opacity-10 px-3 py-2 border-bottom">
              <span className="fw-bold text-primary" style={{ fontSize: "0.95rem" }}>
                <i className="bi bi-phone me-2"></i>
                {primary.name}: {modelValue}
              </span>
            </div>

            <div className="p-3 bg-light border-bottom">
              <p className="small fw-semibold mb-2">Add a color for this model</p>
              <div className="row g-2 align-items-end">
                <div className="col-md-2">
                  <label className="form-label small text-muted mb-1">{colorGroup.name}</label>
                  <input
                    className="form-control form-control-sm"
                    list={listId}
                    placeholder="Black"
                    value={draft.color}
                    onChange={(e) => setDraft(modelValue, { color: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addColorToModel(modelValue);
                      }
                    }}
                  />
                  <datalist id={listId}>
                    {colorSuggestions.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                <div className="col-md-2">
                  <label className="form-label small text-muted mb-1">Regular (Rs.) *</label>
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    className="form-control form-control-sm"
                    value={draft.regularPrice}
                    onChange={(e) => setDraft(modelValue, { regularPrice: e.target.value })}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label small text-muted mb-1">Offer (Rs.)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    className="form-control form-control-sm"
                    placeholder="Optional"
                    value={draft.offerPrice}
                    onChange={(e) => setDraft(modelValue, { offerPrice: e.target.value })}
                  />
                </div>
                <div className="col-md-1">
                  <label className="form-label small text-muted mb-1">Stock</label>
                  <input
                    type="number"
                    min={0}
                    className="form-control form-control-sm"
                    value={draft.stock}
                    onChange={(e) => setDraft(modelValue, { stock: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small text-muted mb-1">Image</label>
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="rounded border bg-white d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                      style={{ width: 36, height: 36 }}
                    >
                      {draft.image ? (
                        <img src={draft.image} alt="" className="w-100 h-100 object-fit-cover" />
                      ) : (
                        <i className="bi bi-image text-muted small"></i>
                      )}
                    </div>
                    <label
                      htmlFor={draftInputId}
                      className={`btn btn-outline-secondary btn-sm mb-0 ${uploading ? "disabled" : ""}`}
                      style={{ fontSize: "0.7rem" }}
                    >
                      Upload
                    </label>
                    <input
                      id={draftInputId}
                      type="file"
                      accept="image/*"
                      className="d-none"
                      disabled={uploading}
                      onChange={(e) => handleDraftImageUpload(modelValue, e)}
                    />
                  </div>
                </div>
                <div className="col-md-2">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm w-100 fw-semibold"
                    onClick={() => addColorToModel(modelValue)}
                  >
                    <i className="bi bi-plus-lg me-1"></i>
                    Add
                  </button>
                </div>
              </div>
            </div>

            {rows.length === 0 ? (
              <p className="text-muted small mb-0 p-3">
                No colors yet for {modelValue}. Add regular price (required), optional offer price, stock,
                and image above.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead className="table-light">
                    <tr style={{ fontSize: "0.72rem" }}>
                      <th>{colorGroup.name}</th>
                      <th style={{ minWidth: 100 }}>Regular (Rs.) *</th>
                      <th style={{ minWidth: 100 }}>Offer (Rs.)</th>
                      <th style={{ minWidth: 72 }}>Stock</th>
                      <th style={{ minWidth: 130 }}>Image</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ v, index }) => {
                      const rowInputId = `variant-image-${index}`;
                      const regular = getRegularPrice(v);
                      const offer = getOfferPrice(v);
                      const hasDiscount = offer != null;
                      return (
                        <tr key={index} className={v.stock <= 0 ? "table-warning" : ""}>
                          <td className="fw-semibold" style={{ fontSize: "0.85rem" }}>
                            {v.options[colorGroup.name]}
                            {hasDiscount && (
                              <span className="badge bg-danger ms-1" style={{ fontSize: "0.6rem" }}>
                                Sale
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="input-group input-group-sm">
                              <span className="input-group-text">Rs.</span>
                              <input
                                type="number"
                                min={0.01}
                                step={0.01}
                                className="form-control"
                                value={regular}
                                onChange={(e) => {
                                  const nextRegular = Number(e.target.value);
                                  const currentOffer = getOfferPrice(v);
                                  updateVariant(index, {
                                    originalPrice: nextRegular,
                                    price:
                                      currentOffer != null && currentOffer < nextRegular
                                        ? currentOffer
                                        : nextRegular,
                                  });
                                }}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="input-group input-group-sm">
                              <span className="input-group-text">Rs.</span>
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                className="form-control"
                                placeholder="—"
                                value={offer ?? ""}
                                onChange={(e) => {
                                  const nextRegular = getRegularPrice(v);
                                  const raw = e.target.value;
                                  if (raw === "") {
                                    updateVariant(index, { price: nextRegular });
                                    return;
                                  }
                                  const nextOffer = Number(raw);
                                  updateVariant(index, {
                                    price:
                                      !Number.isNaN(nextOffer) && nextOffer < nextRegular
                                        ? nextOffer
                                        : nextRegular,
                                  });
                                }}
                              />
                            </div>
                          </td>
                          <td>
                            <input
                              type="number"
                              min={0}
                              className="form-control form-control-sm"
                              value={v.stock}
                              onChange={(e) =>
                                updateVariant(index, { stock: Number(e.target.value) })
                              }
                            />
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-1">
                              <div
                                className="rounded border bg-light d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                                style={{ width: 40, height: 40 }}
                              >
                                {v.image ? (
                                  <img
                                    src={v.image}
                                    alt=""
                                    className="w-100 h-100 object-fit-cover"
                                  />
                                ) : (
                                  <i className="bi bi-image text-muted small"></i>
                                )}
                              </div>
                              <label
                                htmlFor={rowInputId}
                                className={`btn btn-outline-primary btn-sm mb-0 py-0 px-1 ${uploading ? "disabled" : ""}`}
                                style={{ fontSize: "0.65rem" }}
                              >
                                {v.image ? "Change" : "Upload"}
                              </label>
                              <input
                                id={rowInputId}
                                type="file"
                                accept="image/*"
                                className="d-none"
                                disabled={uploading}
                                onChange={(e) => handleRowImageUpload(index, e)}
                              />
                            </div>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm py-0 px-2"
                              onClick={() => removeVariant(index)}
                              title="Remove"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
