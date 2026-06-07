"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ProductDocument, ProductVariant, VariantOption } from "@/types/product";
import { adminProductService } from "@/services/adminProductService";
import { mergeGeneratedVariants, syncVariantOptionsFromSkus, normalizeVariantPricing, normalizeProductBasePricing, getRegularPrice, getOfferPrice, buildSimpleProductVariant, isVariantProduct } from "@/lib/product-utils";
import { DEFAULT_SHIPPING_CHARGE_LKR } from "@/lib/shipping";
import VariantPricingMatrix from "@/components/admin/VariantPricingMatrix";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { flattenCategoryTree } from "@/lib/category-utils";
import type { CategoryTreeNode } from "@/types/category";

interface ProductFormProps {
  initial?: ProductDocument;
  mode: "create" | "edit";
}

interface OptionGroupForm {
  name: string;
  valuesInput: string;
  displayOrder: number;
}

function parseOptionGroups(groups: OptionGroupForm[]): VariantOption[] {
  return groups
    .filter((g) => g.name.trim() && g.valuesInput.trim())
    .map((g, index) => ({
      name: g.name.trim(),
      values: g.valuesInput
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
      displayOrder: g.displayOrder ?? index,
    }));
}

function initialRegularPrice(initial?: ProductDocument): number | "" {
  if (!initial) return "";
  const price = initial.baseOriginalPrice ?? initial.basePrice;
  return price != null && price > 0 ? price : "";
}

function initialOfferPrice(initial?: ProductDocument): number | "" {
  if (!initial?.baseOriginalPrice || initial.basePrice >= initial.baseOriginalPrice) {
    return "";
  }
  return initial.basePrice;
}

function initialOptionGroups(initial?: ProductDocument): OptionGroupForm[] {
  if (initial?.variantOptions?.length) {
    return initial.variantOptions.map((o) => ({
      name: o.name,
      valuesInput: o.values.join(", "),
      displayOrder: o.displayOrder,
    }));
  }
  return [];
}

const VARIANT_TEMPLATE: OptionGroupForm[] = [
  { name: "Model", valuesInput: "iPhone 14, iPhone 15", displayOrder: 0 },
  { name: "Color", valuesInput: "Black, Red, Blue", displayOrder: 1 },
];

export default function ProductForm({ initial, mode }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "phone-accessories");
  const [categoryOptions, setCategoryOptions] = useState<{ slug: string; name: string; depth: number }[]>([]);

  useEffect(() => {
    fetch("/api/categories", { credentials: "include" })
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data.tree) {
          const flat = flattenCategoryTree(res.data.tree as CategoryTreeNode[]);
          setCategoryOptions(flat.map((c) => ({ slug: c.slug, name: c.name, depth: c.depth })));
          if (!initial?.category && flat.length > 0) {
            setCategory((prev) => (flat.some((c) => c.slug === prev) ? prev : flat[0].slug));
          }
        }
      });
  }, [initial?.category]);
  const [productType, setProductType] = useState<"simple" | "variants">(() =>
    isVariantProduct(initial) ? "variants" : "simple"
  );
  const [simpleStock, setSimpleStock] = useState(initial?.variants?.[0]?.stock ?? 10);
  const [simpleSku, setSimpleSku] = useState(initial?.variants?.[0]?.sku ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [baseRegularPrice, setBaseRegularPrice] = useState<number | "">(initialRegularPrice(initial));
  const [baseOfferPrice, setBaseOfferPrice] = useState<number | "">(initialOfferPrice(initial));
  const [shippingCharge, setShippingCharge] = useState<number | "">(
    initial?.shippingCharge != null && initial.shippingCharge >= 0 ? initial.shippingCharge : ""
  );
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(
    Object.entries(initial?.specifications ?? {}).map(([key, value]) => ({ key, value }))
  );
  const [optionGroups, setOptionGroups] = useState<OptionGroupForm[]>(() =>
    initialOptionGroups(initial)
  );
  const [variants, setVariants] = useState<ProductVariant[]>(initial?.variants ?? []);
  const [flags, setFlags] = useState({
    isFeatured: initial?.isFeatured ?? false,
    isBestSeller: initial?.isBestSeller ?? false,
    isLatest: initial?.isLatest ?? false,
    isPublished: initial?.isPublished ?? true,
  });

  const parsedOptions = parseOptionGroups(optionGroups);
  const sortedParsedOptions = [...parsedOptions].sort((a, b) => a.displayOrder - b.displayOrder);

  const handleGenerateVariants = () => {
    if (baseRegularPrice === "") {
      setError("Enter a regular price before generating variants.");
      return;
    }
    const merged = mergeGeneratedVariants(
      variants,
      parsedOptions,
      Number(baseRegularPrice),
      baseOfferPrice !== "" ? Number(baseOfferPrice) : undefined
    );
    setVariants(merged);
    setError("");
  };

  const showPricingMatrix =
    productType === "variants" &&
    sortedParsedOptions.length >= 2 &&
    sortedParsedOptions[0]?.values.length > 0;

  const handleProductTypeChange = (type: "simple" | "variants") => {
    setProductType(type);
    if (type === "variants" && optionGroups.length === 0) {
      setOptionGroups(VARIANT_TEMPLATE.map((g) => ({ ...g })));
    }
    if (type === "simple") {
      setError("");
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    setUploading(true);
    const { data, error: uploadError } = await adminProductService.uploadImage(file);
    setUploading(false);
    if (data?.url) return data.url;
    setError(uploadError ?? "Image upload failed.");
    return null;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (url) setImages((prev) => [...prev, url]);
    e.target.value = "";
  };

  const handleVariantImageUpload = async (
    variantIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (url) updateVariant(variantIndex, { image: url });
    e.target.value = "";
  };

  const updateVariant = (index: number, patch: Partial<ProductVariant>) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, ...patch } : v))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (productType === "variants" && parsedOptions.length === 0) {
      setError("Add at least one variant option group (e.g. Model, Color).");
      return;
    }

    if (productType === "variants" && variants.length === 0) {
      setError("Add variant rows or click Generate All Combinations.");
      return;
    }

    if (productType === "simple" && simpleStock < 0) {
      setError("Stock cannot be negative.");
      return;
    }

    const regular = baseRegularPrice === "" ? NaN : Number(baseRegularPrice);
    if (!regular || regular <= 0) {
      setError("Regular price is required.");
      return;
    }

    const offer = baseOfferPrice !== "" ? Number(baseOfferPrice) : undefined;
    if (offer != null && (offer <= 0 || offer >= regular)) {
      setError("Offer price must be greater than 0 and less than regular price.");
      return;
    }

    const normalizedVariants =
      productType === "variants" ? variants.map(normalizeVariantPricing) : [];

    if (productType === "variants") {
      const invalidOffer = normalizedVariants.some((v) => {
        const vOffer = getOfferPrice(v);
        const vRegular = getRegularPrice(v);
        return vOffer != null && vOffer >= vRegular;
      });
      if (invalidOffer) {
        setError("Variant offer prices must be less than their regular price.");
        return;
      }
    }

    const { baseOriginalPrice, basePrice } = normalizeProductBasePricing(regular, offer);

    const existingSimple = initial?.variants?.[0];
    const finalVariants =
      productType === "simple"
        ? [
            buildSimpleProductVariant(
              name.trim(),
              regular,
              offer,
              simpleStock,
              images[0],
              existingSimple
                ? { ...existingSimple, sku: simpleSku.trim() || existingSimple.sku }
                : simpleSku.trim()
                  ? ({ sku: simpleSku.trim(), options: {}, price: regular, stock: simpleStock, isActive: true } as ProductVariant)
                  : undefined
            ),
          ]
        : normalizedVariants;

    if (productType === "variants") {
      const missingRegular = finalVariants.some((v) => getRegularPrice(v) <= 0);
      if (missingRegular) {
        setError("Every variant must have a regular price.");
        return;
      }
    }

    setSaving(true);

    const payload = {
      name: name.trim(),
      category,
      description,
      images,
      specifications: Object.fromEntries(
        specs.filter((s) => s.key.trim()).map((s) => [s.key.trim(), s.value])
      ),
      variantOptions:
        productType === "simple"
          ? []
          : syncVariantOptionsFromSkus(parsedOptions, finalVariants),
      variants: finalVariants,
      basePrice,
      baseOriginalPrice,
      shippingCharge: shippingCharge !== "" ? Number(shippingCharge) : undefined,
      ...flags,
    };

    const result =
      mode === "create"
        ? await adminProductService.create(payload)
        : await adminProductService.update(initial!.id, payload);

    setSaving(false);

    if (result.data?.product) {
      router.push("/admin/products");
    } else {
      setError(result.error ?? "Failed to save product.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-danger py-2 px-3 mb-4" style={{ fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {/* Product type */}
      <div className="card border rounded-4 p-4 mb-4">
        <h5 className="fw-bold mb-2">Product Type</h5>
        <p className="text-muted small mb-3">
          Choose <strong>Simple</strong> for one price and stock, or <strong>With variants</strong> for
          Model, Color, Size, etc.
        </p>
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn btn-sm ${productType === "simple" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => handleProductTypeChange("simple")}
          >
            Simple product
          </button>
          <button
            type="button"
            className={`btn btn-sm ${productType === "variants" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => handleProductTypeChange("variants")}
          >
            Product with variants
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="card border rounded-4 p-4 mb-4">
        <h5 className="fw-bold mb-3">Basic Information</h5>
        <div className="row g-3">
          <div className="col-md-8">
            <label className="form-label text-muted fw-semibold small">Product Name *</label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="iPhone Back Cover Case"
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label text-muted fw-semibold small">Category *</label>
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categoryOptions.length === 0 ? (
                <option value={category}>{category}</option>
              ) : (
                categoryOptions.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {"—".repeat(c.depth)} {c.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="col-12">
            <label className="form-label text-muted fw-semibold small">Description</label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Premium silicone back cover with precise cutouts..."
            />
          </div>
          <div className="col-12">
            <label className="form-label text-muted fw-semibold small mb-2">Default pricing</label>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label text-muted fw-semibold small">Regular price (Rs.) *</label>
                <input
                  type="number"
                  min={0.01}
                  step={0.01}
                  className="form-control"
                  placeholder="Enter regular price"
                  value={baseRegularPrice}
                  onChange={(e) =>
                    setBaseRegularPrice(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  required
                />
                <small className="text-muted">MRP / list price — default for new variant rows</small>
              </div>
              <div className="col-md-4">
                <label className="form-label text-muted fw-semibold small">Offer price (Rs.)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className="form-control"
                  placeholder="Optional — sale price"
                  value={baseOfferPrice}
                  onChange={(e) =>
                    setBaseOfferPrice(e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
                <small className="text-muted">Optional discount; leave empty to sell at regular price</small>
              </div>
              {productType === "simple" && (
                <>
                  <div className="col-md-4">
                    <label className="form-label text-muted fw-semibold small">Stock *</label>
                    <input
                      type="number"
                      min={0}
                      className="form-control"
                      value={simpleStock}
                      onChange={(e) => setSimpleStock(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted fw-semibold small">SKU</label>
                    <input
                      className="form-control"
                      placeholder="Auto-generated if empty"
                      value={simpleSku}
                      onChange={(e) => setSimpleSku(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="row g-3 mt-1">
              <div className="col-md-4">
                <label className="form-label text-muted fw-semibold small">Shipping charge (Rs.)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  className="form-control"
                  placeholder={`Default Rs. ${DEFAULT_SHIPPING_CHARGE_LKR}`}
                  value={shippingCharge}
                  onChange={(e) =>
                    setShippingCharge(e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
                <small className="text-muted">
                  Optional — leave empty to use default Rs. {DEFAULT_SHIPPING_CHARGE_LKR} at checkout
                </small>
              </div>
            </div>
          </div>
          <div className="col-12 d-flex flex-wrap gap-3 align-items-end">
            {Object.entries(flags).map(([key, val]) => (
              <div className="form-check" key={key}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={key}
                  checked={val}
                  onChange={(e) => setFlags((f) => ({ ...f, [key]: e.target.checked }))}
                />
                <label className="form-check-label small text-capitalize" htmlFor={key}>
                  {key.replace(/([A-Z])/g, " $1").replace("is ", "")}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="card border rounded-4 p-4 mb-4">
        <h5 className="fw-bold mb-3">Product Images</h5>
        <div className="d-flex flex-wrap gap-2 mb-3">
          {images.map((url, i) => (
            <div key={url} className="position-relative">
              <img src={url} alt="" className="rounded object-fit-cover border" style={{ width: 72, height: 72 }} />
              <button
                type="button"
                className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle p-0"
                style={{ width: 22, height: 22, fontSize: "0.65rem" }}
                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <label className="btn btn-outline-primary btn-sm rounded-pill px-3">
          {uploading ? "Uploading..." : "+ Upload Image"}
          <input type="file" accept="image/*" className="d-none" disabled={uploading} onChange={handleImageUpload} />
        </label>
      </div>

      {/* Variant Options — variants mode only */}
      {productType === "variants" && (
      <div className="card border rounded-4 p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold mb-1">Variant Options</h5>
            <p className="text-muted mb-0 small">
              Define option groups like Model, Color, Size. Values are comma-separated.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm rounded-pill"
            onClick={() =>
              setOptionGroups((prev) => [
                ...prev,
                { name: "", valuesInput: "", displayOrder: prev.length },
              ])
            }
          >
            + Add Option Group
          </button>
        </div>

        {optionGroups.map((group, index) => (
          <div key={index} className="row g-2 mb-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label text-muted fw-semibold small">Option Name</label>
              <input
                className="form-control form-control-sm"
                value={group.name}
                placeholder="e.g. Model"
                onChange={(e) =>
                  setOptionGroups((prev) =>
                    prev.map((g, i) => (i === index ? { ...g, name: e.target.value } : g))
                  )
                }
              />
            </div>
            <div className="col-md-8">
              <label className="form-label text-muted fw-semibold small">
                Values (comma separated)
                {index === 0 && (
                  <span className="text-muted fw-normal"> — required for pricing sections below</span>
                )}
                {index === 1 && (
                  <span className="text-muted fw-normal"> — optional suggestions; you can also type colors per model below</span>
                )}
              </label>
              <input
                className="form-control form-control-sm"
                value={group.valuesInput}
                placeholder="Black, Blue, Red"
                onChange={(e) =>
                  setOptionGroups((prev) =>
                    prev.map((g, i) => (i === index ? { ...g, valuesInput: e.target.value } : g))
                  )
                }
              />
            </div>
            <div className="col-md-1">
              <button
                type="button"
                className="btn btn-outline-danger btn-sm w-100"
                onClick={() => setOptionGroups((prev) => prev.filter((_, i) => i !== index))}
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
          </div>
        ))}

        <details className="mb-3">
          <summary className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-semibold" style={{ cursor: "pointer" }}>
            Optional: Generate all combinations at once
          </summary>
          <p className="text-muted small mt-2 mb-2">
            Creates every model × color row automatically. You can still edit or delete rows after.
          </p>
          <button type="button" className="btn btn-outline-primary btn-sm rounded-pill px-4 fw-semibold" onClick={handleGenerateVariants}>
            <i className="bi bi-grid-3x3-gap me-1"></i>
            Generate All Combinations
          </button>
        </details>
      </div>
      )}

      {/* Pricing — variants mode only */}
      {productType === "variants" && (
      <div className="card border border-primary border-2 rounded-4 p-4 mb-4">
        <h5 className="fw-bold mb-1 text-primary">
          <i className="bi bi-currency-dollar me-2"></i>
          Variant Prices &amp; Stock
        </h5>
        <p className="text-muted small mb-4">
          Add colors per model with price, stock, and image (e.g. iPhone 14 Black $20 with black case photo).
        </p>

        {showPricingMatrix ? (
          <VariantPricingMatrix
            optionGroups={parsedOptions}
            variants={variants}
            baseRegularPrice={baseRegularPrice !== "" ? Number(baseRegularPrice) : undefined}
            baseOfferPrice={baseOfferPrice !== "" ? Number(baseOfferPrice) : undefined}
            uploading={uploading}
            uploadImage={uploadFile}
            onVariantsChange={setVariants}
          />
        ) : parsedOptions.length >= 2 ? (
          <p className="text-muted small mb-0">
            Enter model names in the first option group (e.g. <strong>iPhone 14, iPhone 15</strong>) to unlock
            per-model pricing.
          </p>
        ) : (
          <>
            <p className="text-muted small mb-3">
              Set price and stock per SKU. Click <strong>Generate All Combinations</strong> above if the
              table is empty.
            </p>
            {variants.length === 0 && parsedOptions.length > 0 && (
              <div className="alert alert-info small py-2 mb-3">
                No SKU rows yet.{" "}
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 align-baseline"
                  onClick={handleGenerateVariants}
                >
                  Generate all combinations
                </button>{" "}
                or add rows in the matrix above.
              </div>
            )}
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead className="table-light">
                  <tr style={{ fontSize: "0.75rem" }}>
                    {parsedOptions.map((o) => (
                      <th key={o.name}>{o.name}</th>
                    ))}
                    <th>SKU</th>
                    <th>Image</th>
                    <th>Regular (Rs.) *</th>
                    <th>Offer (Rs.)</th>
                    <th>Stock</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant, index) => (
                    <tr key={index} className={variant.stock <= 0 ? "table-warning" : ""}>
                      {parsedOptions.map((o) => (
                        <td key={o.name} style={{ fontSize: "0.8rem" }}>
                          {variant.options[o.name] ?? "—"}
                        </td>
                      ))}
                      <td>
                        <input
                          className="form-control form-control-sm"
                          style={{ minWidth: 100 }}
                          value={variant.sku}
                          onChange={(e) => updateVariant(index, { sku: e.target.value })}
                        />
                      </td>
                      <td>
                        <label className="btn btn-outline-secondary btn-sm py-0 px-2" style={{ fontSize: "0.65rem" }}>
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            className="d-none"
                            disabled={uploading}
                            onChange={(e) => handleVariantImageUpload(index, e)}
                          />
                        </label>
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0.01}
                          step={0.01}
                          className="form-control form-control-sm"
                          style={{ width: 90 }}
                          value={getRegularPrice(variant)}
                          onChange={(e) => {
                            const regular = Number(e.target.value);
                            const offer = getOfferPrice(variant);
                            updateVariant(index, {
                              originalPrice: regular,
                              price: offer != null && offer < regular ? offer : regular,
                            });
                          }}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          className="form-control form-control-sm"
                          style={{ width: 90 }}
                          placeholder="—"
                          value={getOfferPrice(variant) ?? ""}
                          onChange={(e) => {
                            const regular = getRegularPrice(variant);
                            const raw = e.target.value;
                            if (raw === "") {
                              updateVariant(index, { price: regular });
                              return;
                            }
                            const offer = Number(raw);
                            updateVariant(index, {
                              price: !Number.isNaN(offer) && offer < regular ? offer : regular,
                            });
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          className="form-control form-control-sm"
                          style={{ width: 70 }}
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, { stock: Number(e.target.value) })}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={variant.isActive}
                          onChange={(e) => updateVariant(index, { isActive: e.target.checked })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      )}

      <div className="card border rounded-4 p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">Specifications</h5>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setSpecs((prev) => [...prev, { key: "", value: "" }])}
          >
            + Add Spec
          </button>
        </div>
        {specs.map((spec, index) => (
          <div key={index} className="row g-2 mb-2">
            <div className="col-md-4">
              <input
                className="form-control form-control-sm"
                placeholder="Material"
                value={spec.key}
                onChange={(e) =>
                  setSpecs((prev) =>
                    prev.map((s, i) => (i === index ? { ...s, key: e.target.value } : s))
                  )
                }
              />
            </div>
            <div className="col-md-7">
              <input
                className="form-control form-control-sm"
                placeholder="Silicone"
                value={spec.value}
                onChange={(e) =>
                  setSpecs((prev) =>
                    prev.map((s, i) => (i === index ? { ...s, value: e.target.value } : s))
                  )
                }
              />
            </div>
            <div className="col-md-1">
              <button
                type="button"
                className="btn btn-outline-danger btn-sm w-100"
                onClick={() => setSpecs((prev) => prev.filter((_, i) => i !== index))}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex gap-2">
        <button type="submit" disabled={saving} className="btn btn-primary rounded-pill px-4 fw-semibold">
          {saving ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
        </button>
        <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => router.push("/admin/products")}>
          Cancel
        </button>
      </div>
    </form>
  );
}
