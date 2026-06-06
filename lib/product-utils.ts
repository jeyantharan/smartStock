import type { ProductDocument, ProductVariant, StoreProduct, VariantOption } from "@/types/product";

type PriceFields = { price: number; originalPrice?: number };

/** Regular (MRP) — stored in originalPrice; falls back to price for legacy rows */
export function getRegularPrice(item: PriceFields): number {
  return item.originalPrice ?? item.price;
}

/** Offer/sale price when set and lower than regular */
export function getOfferPrice(item: PriceFields): number | undefined {
  if (item.originalPrice != null && item.price < item.originalPrice) {
    return item.price;
  }
  return undefined;
}

/** What the customer pays */
export function getSellingPrice(item: PriceFields): number {
  return getOfferPrice(item) ?? getRegularPrice(item);
}

/** Storefront display: price = selling, originalPrice = regular when on sale */
export function variantDisplayPrices(item: PriceFields): {
  price: number;
  originalPrice?: number;
} {
  const regular = getRegularPrice(item);
  const offer = getOfferPrice(item);
  return {
    price: offer ?? regular,
    originalPrice: offer != null ? regular : undefined,
  };
}

export function normalizeVariantPricing(v: ProductVariant): ProductVariant {
  const regular = getRegularPrice(v);
  const offer = getOfferPrice(v);
  return {
    ...v,
    originalPrice: regular,
    price: offer ?? regular,
  };
}

export function normalizeProductBasePricing(
  regular: number,
  offer?: number
): { baseOriginalPrice: number; basePrice: number } {
  return {
    baseOriginalPrice: regular,
    basePrice: offer != null && offer < regular ? offer : regular,
  };
}

export function isVariantProduct(product?: Pick<ProductDocument, "variantOptions">): boolean {
  return (product?.variantOptions?.length ?? 0) > 0;
}

export function buildSimpleProductVariant(
  name: string,
  regular: number,
  offer: number | undefined,
  stock: number,
  image?: string,
  existing?: ProductVariant
): ProductVariant {
  const skuBase = slugify(name).toUpperCase().replace(/-/g, "").slice(0, 24) || "DEFAULT";
  return normalizeVariantPricing({
    sku: existing?.sku ?? `SKU-${skuBase}`,
    options: {},
    originalPrice: regular,
    price: offer ?? regular,
    stock,
    image: image ?? existing?.image,
    isActive: existing?.isActive !== false,
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateCombinations(
  options: VariantOption[]
): Record<string, string>[] {
  if (options.length === 0) return [{}];

  const sorted = [...options].sort((a, b) => a.displayOrder - b.displayOrder);
  const [first, ...rest] = sorted;
  const restCombos = generateCombinations(rest);
  const result: Record<string, string>[] = [];

  for (const value of first.values) {
    for (const combo of restCombos) {
      result.push({ [first.name]: value, ...combo });
    }
  }
  return result;
}

export function optionsKey(options: Record<string, string>): string {
  return Object.entries(options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
}

/** Pick price from option valuePrices — only when product has a single option dimension */
export function resolvePriceForCombo(
  combo: Record<string, string>,
  optionGroups: VariantOption[],
  basePrice: number
): number {
  if (optionGroups.length !== 1) return basePrice;
  const group = optionGroups[0];
  const val = combo[group.name];
  const price = group.valuePrices?.[val];
  if (price != null && price >= 0) return price;
  return basePrice;
}

export function mergeGeneratedVariants(
  existing: ProductVariant[],
  optionGroups: VariantOption[],
  baseRegular: number,
  baseOffer?: number
): ProductVariant[] {
  const combinations = generateCombinations(optionGroups);
  const existingMap = new Map(existing.map((v) => [optionsKey(v.options), v]));
  const defaultSelling =
    baseOffer != null && baseOffer < baseRegular ? baseOffer : baseRegular;

  return combinations.map((combo) => {
    const key = optionsKey(combo);
    const found = existingMap.get(key);
    if (found) {
      return { ...found, options: combo };
    }
    const skuSuffix = Object.values(combo)
      .join("-")
      .toUpperCase()
      .replace(/\s+/g, "-")
      .slice(0, 40);
    return {
      sku: `SKU-${skuSuffix || "DEFAULT"}`,
      options: combo,
      price: resolvePriceForCombo(combo, optionGroups, defaultSelling),
      originalPrice: baseRegular,
      stock: 0,
      isActive: true,
    };
  });
}

export function getActiveVariants(variants: ProductVariant[]): ProductVariant[] {
  return variants.filter((v) => v.isActive);
}

export function resolveVariant(
  variants: ProductVariant[],
  selections: Record<string, string>
): ProductVariant | undefined {
  return variants.find(
    (v) =>
      v.isActive &&
      Object.entries(selections).every(([key, val]) => v.options[key] === val)
  );
}

/** Selections from option groups ordered before the target group (by displayOrder) */
export function selectionsBeforeGroup(
  optionGroups: VariantOption[],
  optionName: string,
  currentSelections: Record<string, string>
): Record<string, string> {
  const sorted = [...optionGroups].sort((a, b) => a.displayOrder - b.displayOrder);
  const targetIndex = sorted.findIndex((g) => g.name === optionName);
  const result: Record<string, string> = {};
  for (let i = 0; i < targetIndex; i++) {
    const name = sorted[i].name;
    if (currentSelections[name]) result[name] = currentSelections[name];
  }
  return result;
}

/** After changing an option, keep later groups in sync with valid values */
export function resolveSelectionsAfterChange(
  variants: ProductVariant[],
  optionGroups: VariantOption[],
  optionName: string,
  optionValue: string,
  currentSelections: Record<string, string>
): Record<string, string> {
  const sorted = [...optionGroups].sort((a, b) => a.displayOrder - b.displayOrder);
  const changedIndex = sorted.findIndex((g) => g.name === optionName);
  const next: Record<string, string> = { ...currentSelections, [optionName]: optionValue };

  for (let i = changedIndex + 1; i < sorted.length; i++) {
    const group = sorted[i];
    delete next[group.name];
    const firstAvailable = group.values.find((val) =>
      isOptionValueAvailable(variants, optionGroups, group.name, val, next)
    );
    if (firstAvailable) next[group.name] = firstAvailable;
  }

  return next;
}

export function isOptionValueAvailable(
  variants: ProductVariant[],
  optionGroups: VariantOption[],
  optionName: string,
  optionValue: string,
  currentSelections: Record<string, string>
): boolean {
  const prior = selectionsBeforeGroup(optionGroups, optionName, currentSelections);
  const merged = { ...prior, [optionName]: optionValue };
  const selectedCount = Object.keys(merged).filter((k) => merged[k]).length;
  const allGroupsSelected = selectedCount >= optionGroups.length;

  return variants.some((variant) => {
    if (!variant.isActive) return false;
    const matches = Object.entries(merged)
      .filter(([, val]) => val)
      .every(([key, val]) => variant.options[key] === val);
    if (!matches) return false;
    if (allGroupsSelected) {
      return variant.stock > 0;
    }
    return true;
  });
}

export function isOptionValueOutOfStock(
  variants: ProductVariant[],
  optionGroups: VariantOption[],
  optionName: string,
  optionValue: string,
  currentSelections: Record<string, string>
): boolean {
  const prior = selectionsBeforeGroup(optionGroups, optionName, currentSelections);
  const merged = { ...prior, [optionName]: optionValue };
  const allSelected = optionGroups.every((g) => merged[g.name]);

  if (!allSelected) {
    const hasStock = variants.some(
      (v) =>
        v.isActive &&
        v.stock > 0 &&
        v.options[optionName] === optionValue &&
        Object.entries(prior).every(([k, val]) => v.options[k] === val)
    );
    return !hasStock;
  }

  const variant = resolveVariant(variants, merged);
  return !variant || variant.stock <= 0;
}

/** Resolve which image to show based on current variant selections */
export function resolveDisplayImage(
  product: Pick<StoreProduct, "image" | "images" | "variantOptions" | "variants">,
  selectedOptions: Record<string, string>,
  changedOption?: string
): string {
  const variants = product.variants ?? [];
  const sorted = [...(product.variantOptions ?? [])].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  const allSelected = sorted.length > 0 && sorted.every((o) => selectedOptions[o.name]);
  if (allSelected) {
    const variant = resolveVariant(variants, selectedOptions);
    if (variant?.image) return variant.image;
  }

  const priorityNames = changedOption
    ? [changedOption, ...sorted.map((o) => o.name).filter((n) => n !== changedOption)]
    : sorted.map((o) => o.name);

  const partialMatch = variants.find(
    (v) =>
      v.isActive &&
      v.image &&
      Object.entries(selectedOptions).every(([key, val]) => !val || v.options[key] === val)
  );
  if (partialMatch?.image) return partialMatch.image;

  for (const optName of priorityNames) {
    const val = selectedOptions[optName];
    if (!val) continue;
    const variantWithImage = variants.find(
      (v) =>
        v.isActive &&
        v.image &&
        v.options[optName] === val &&
        Object.entries(selectedOptions)
          .filter(([k]) => k !== optName)
          .every(([k, sel]) => !sel || v.options[k] === sel)
    );
    if (variantWithImage?.image) return variantWithImage.image;
  }

  return product.images[0] ?? product.image ?? "";
}

/** Resolve price to show based on current variant selections */
export function resolveDisplayPrice(
  product: Pick<StoreProduct, "price" | "variantOptions" | "variants">,
  selectedOptions: Record<string, string>
): number {
  const variants = product.variants ?? [];
  const sorted = [...(product.variantOptions ?? [])].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  const allSelected = sorted.length > 0 && sorted.every((o) => selectedOptions[o.name]);
  if (allSelected) {
    const variant = resolveVariant(variants, selectedOptions);
    if (variant) return getSellingPrice(variant);
  }

  const matching = variants.filter(
    (v) =>
      v.isActive &&
      Object.entries(selectedOptions).every(([key, val]) => v.options[key] === val)
  );
  if (matching.length === 1) return getSellingPrice(matching[0]);
  if (matching.length > 1) {
    const inStock = matching.filter((v) => v.stock > 0);
    const pool = inStock.length > 0 ? inStock : matching;
    return Math.min(...pool.map((v) => getSellingPrice(v)));
  }

  // Single-option products may use valuePrices on the option group
  if (sorted.length === 1) {
    const group = sorted[0];
    const val = selectedOptions[group.name];
    const optionPrice = val ? group.valuePrices?.[val] : undefined;
    if (optionPrice != null && optionPrice >= 0) return optionPrice;
  }

  for (const optName of sorted.map((o) => o.name)) {
    const val = selectedOptions[optName];
    if (!val) continue;
    const withOption = variants.filter((v) => v.isActive && v.options[optName] === val);
    if (withOption.length > 0) {
      const narrowed = withOption.filter((v) =>
        Object.entries(selectedOptions).every(([k, sel]) => !sel || k === optName || v.options[k] === sel)
      );
      const pool = narrowed.length > 0 ? narrowed : withOption;
      return Math.min(...pool.map((v) => getSellingPrice(v)));
    }
  }

  return product.price;
}

export function getVariantPriceHint(
  variants: ProductVariant[],
  optionName: string,
  optionValue: string,
  selectedOptions: Record<string, string>,
  optionGroups?: VariantOption[]
): number | undefined {
  const context = optionGroups
    ? selectionsBeforeGroup(optionGroups, optionName, selectedOptions)
    : selectedOptions;
  const matching = variants.filter(
    (v) =>
      v.isActive &&
      v.options[optionName] === optionValue &&
      Object.entries(context)
        .filter(([k]) => k !== optionName)
        .every(([k, val]) => !val || v.options[k] === val)
  );
  if (matching.length === 0) return undefined;
  if (matching.length === 1) return getSellingPrice(matching[0]);
  return Math.min(...matching.map((v) => getSellingPrice(v)));
}

export function getVariantImageHint(
  variants: ProductVariant[],
  optionName: string,
  optionValue: string,
  selectedOptions: Record<string, string>
): string | undefined {
  const matching = variants.filter(
    (v) =>
      v.isActive &&
      v.image &&
      v.options[optionName] === optionValue &&
      Object.entries(selectedOptions)
        .filter(([k]) => k !== optionName)
        .every(([k, val]) => !val || v.options[k] === val)
  );
  return matching.find((v) => v.image)?.image;
}

export function syncVariantOptionsFromSkus(
  options: VariantOption[],
  variants: ProductVariant[]
): VariantOption[] {
  return options.map((group) => {
    const fromSkus = new Set(group.values);
    variants.forEach((v) => {
      if (v.isActive && v.options[group.name]) {
        fromSkus.add(v.options[group.name]);
      }
    });
    return { ...group, values: Array.from(fromSkus) };
  });
}

export function toStoreProduct(product: ProductDocument): StoreProduct {
  const activeVariants = getActiveVariants(product.variants);
  const inStockVariants = activeVariants.filter((v) => v.stock > 0);

  const baseDisplay = variantDisplayPrices({
    price: product.basePrice,
    originalPrice: product.baseOriginalPrice,
  });

  let price = baseDisplay.price;
  let originalPrice = baseDisplay.originalPrice;
  let stockCount = 0;
  let inStock = false;

  if (activeVariants.length > 0) {
    const priceSource = inStockVariants.length > 0 ? inStockVariants : activeVariants;
    price = Math.min(...priceSource.map((v) => getSellingPrice(v)));
    const minVariant = priceSource.reduce(
      (best, v) => (getSellingPrice(v) < getSellingPrice(best) ? v : best),
      priceSource[0]
    );
    const display = variantDisplayPrices(minVariant);
    originalPrice = display.originalPrice;
    stockCount = activeVariants.reduce((sum, v) => sum + v.stock, 0);
    inStock = inStockVariants.length > 0;
  } else {
    stockCount = 0;
    inStock = false;
  }

  const sortedOptions = [...product.variantOptions].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return {
    id: product.id,
    name: product.name,
    price,
    originalPrice,
    rating: product.rating,
    ratingCount: product.ratingCount,
    image: product.images[0] ?? "",
    images: product.images,
    category: product.category,
    description: product.description,
    inStock,
    stockCount,
    specifications: product.specifications,
    variantOptions: sortedOptions,
    variants: product.variants.map((v) => ({ ...v, id: v.id })),
    colors: sortedOptions[0]?.values,
    sizes: sortedOptions[1]?.values,
    isFeatured: product.isFeatured,
    isBestSeller: product.isBestSeller,
    isLatest: product.isLatest,
    shippingCharge: product.shippingCharge,
  };
}
