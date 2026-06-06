"use client";

import { useCallback, useEffect, useState } from "react";
import { adminCategoryService } from "@/services/adminCategoryService";
import type { CategoryDocument, CategoryTreeNode } from "@/types/category";
import { flattenCategoryTree, getDescendantIds } from "@/lib/category-utils";

const ICON_OPTIONS = [
  "bi-folder",
  "bi-laptop",
  "bi-phone",
  "bi-headphones",
  "bi-watch",
  "bi-house",
  "bi-gender-ambiguous",
  "bi-dribbble",
  "bi-bag",
  "bi-lightning-charge",
  "bi-shield-check",
  "bi-phone-flip",
];

interface FormState {
  name: string;
  slug: string;
  parentId: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
}

const emptyForm: FormState = {
  name: "",
  slug: "",
  parentId: "",
  icon: "bi-folder",
  displayOrder: 0,
  isActive: true,
};

function AdminCategoryRow({
  node,
  depth,
  onEdit,
  onDelete,
  onAddChild,
}: {
  node: CategoryTreeNode;
  depth: number;
  onEdit: (cat: CategoryDocument) => void;
  onDelete: (cat: CategoryDocument) => void;
  onAddChild: (parentId: string) => void;
}) {
  return (
    <>
      <tr style={{ fontSize: "0.85rem" }}>
        <td style={{ paddingLeft: 12 + depth * 20 }}>
          <span className="d-inline-flex align-items-center gap-2">
            <i className={`bi ${node.icon} text-primary`}></i>
            <span className="fw-semibold">{node.name}</span>
            {!node.isActive && (
              <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: "0.65rem" }}>
                Hidden
              </span>
            )}
          </span>
        </td>
        <td className="text-muted font-monospace" style={{ fontSize: "0.8rem" }}>
          {node.slug}
        </td>
        <td>{node.displayOrder}</td>
        <td className="text-end">
          <div className="d-flex justify-content-end gap-1">
            <button
              type="button"
              className="btn btn-outline-primary btn-sm py-0 px-2"
              style={{ fontSize: "0.75rem" }}
              onClick={() => onAddChild(node.id)}
            >
              + Sub
            </button>
            <button
              type="button"
              className="btn btn-light btn-sm py-0 px-2"
              style={{ fontSize: "0.75rem" }}
              onClick={() => onEdit(node)}
            >
              Edit
            </button>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm py-0 px-2"
              style={{ fontSize: "0.75rem" }}
              onClick={() => onDelete(node)}
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
      {node.children.map((child) => (
        <AdminCategoryRow
          key={child.id}
          node={child}
          depth={depth + 1}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </>
  );
}

export default function AdminCategoriesPage() {
  const [tree, setTree] = useState<CategoryTreeNode[]>([]);
  const [categories, setCategories] = useState<CategoryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await adminCategoryService.list();
    if (data) {
      setTree(data.tree);
      setCategories(data.categories);
    } else {
      setError(err ?? "Failed to load categories.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const flatOptions = flattenCategoryTree(tree);
  const invalidParentIds = editingId ? getDescendantIds(editingId, categories) : [];

  const openCreate = (parentId = "") => {
    setEditingId(null);
    setForm({ ...emptyForm, parentId, displayOrder: categories.length });
    setShowForm(true);
    setError("");
  };

  const openEdit = (cat: CategoryDocument) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId ?? "",
      icon: cat.icon,
      displayOrder: cat.displayOrder,
      isActive: cat.isActive,
    });
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      parentId: form.parentId || null,
      icon: form.icon,
      displayOrder: Number(form.displayOrder),
      isActive: form.isActive,
    };

    const result = editingId
      ? await adminCategoryService.update(editingId, payload)
      : await adminCategoryService.create(payload);

    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
    load();
  };

  const handleDelete = async (cat: CategoryDocument) => {
    if (!confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    const { error: err } = await adminCategoryService.remove(cat.id);
    if (err) {
      setError(err);
      return;
    }
    load();
  };

  return (
    <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white h-100">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-2">
        <h4 className="fw-bold mb-0">Categories</h4>
        <button
          type="button"
          className="btn btn-primary btn-sm rounded-pill px-4 fw-semibold"
          onClick={() => openCreate()}
        >
          + Add Category
        </button>
      </div>
      <p className="text-muted mb-4 pb-2 border-bottom" style={{ fontSize: "0.85rem" }}>
        Build multi-level categories (e.g. Electronics → Phone Accessories → Cases). The storefront sidebar shows this tree.
      </p>

      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      )}

      {showForm && (
        <div className="card bg-light border-0 p-4 mb-4 rounded-4">
          <h6 className="fw-bold mb-3">{editingId ? "Edit Category" : "New Category"}</h6>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Name</label>
                <input
                  className="form-control form-control-sm"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Phone Cases"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Slug (URL)</label>
                <input
                  className="form-control form-control-sm font-monospace"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="auto-generated if empty"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Parent</label>
                <select
                  className="form-select form-select-sm"
                  value={form.parentId}
                  onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                >
                  <option value="">— Top level —</option>
                  {flatOptions
                    .filter((c) => {
                      const id = categories.find((x) => x.slug === c.slug)?.id;
                      return id && id !== editingId && !invalidParentIds.includes(id);
                    })
                    .map((c) => (
                      <option key={c.slug} value={categories.find((x) => x.slug === c.slug)?.id ?? ""}>
                        {"—".repeat(c.depth)} {c.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Icon</label>
                <select
                  className="form-select form-select-sm"
                  value={form.icon}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                >
                  {ICON_OPTIONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Order</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={form.displayOrder}
                  onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))}
                />
              </div>
              <div className="col-12">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="catActive"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  />
                  <label className="form-check-label small" htmlFor="catActive">
                    Visible in store
                  </label>
                </div>
              </div>
            </div>
            <div className="d-flex gap-2 mt-3">
              <button type="submit" className="btn btn-primary btn-sm rounded-pill px-4" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Update" : "Create"}
              </button>
              <button
                type="button"
                className="btn btn-light btn-sm rounded-pill px-4"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : tree.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-diagram-3 fs-1 d-block mb-3"></i>
          <p>No categories yet. Add your first category.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr style={{ fontSize: "0.8rem" }}>
                <th>Name</th>
                <th>Slug</th>
                <th>Order</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tree.map((node) => (
                <AdminCategoryRow
                  key={node.id}
                  node={node}
                  depth={0}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onAddChild={(parentId) => openCreate(parentId)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
