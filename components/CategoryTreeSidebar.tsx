"use client";

import React, { useMemo, useState } from "react";
import type { CategoryTreeNode } from "@/types/category";

interface CategoryTreeSidebarProps {
  tree: CategoryTreeNode[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
}

function findPathToSlug(nodes: CategoryTreeNode[], slug: string, path: string[] = []): string[] | null {
  for (const node of nodes) {
    const next = [...path, node.slug];
    if (node.slug === slug) return next;
    const found = findPathToSlug(node.children, slug, next);
    if (found) return found;
  }
  return null;
}

function CategoryNode({
  node,
  depth,
  selectedSlug,
  expandedSlugs,
  onToggle,
  onSelect,
}: {
  node: CategoryTreeNode;
  depth: number;
  selectedSlug: string;
  expandedSlugs: Set<string>;
  onToggle: (slug: string) => void;
  onSelect: (slug: string) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedSlugs.has(node.slug);
  const isSelected = selectedSlug === node.slug;
  const isAncestorOfSelected = Boolean(
    selectedSlug &&
      node.slug !== selectedSlug &&
      findPathToSlug([node], selectedSlug)?.[findPathToSlug([node], selectedSlug)!.length - 1] === selectedSlug
  );

  return (
    <div>
      <div
        className="d-flex align-items-center gap-1"
        style={{ paddingLeft: depth * 14 }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="btn btn-link p-0 text-secondary border-0 flex-shrink-0"
            style={{ width: 18, fontSize: "0.7rem" }}
            onClick={() => onToggle(node.slug)}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <i className={`bi bi-chevron-${isExpanded ? "down" : "right"}`}></i>
          </button>
        ) : (
          <span style={{ width: 18, flexShrink: 0 }} />
        )}
        <button
          type="button"
          className={`btn btn-sm text-start border-0 p-1 flex-grow-1 d-flex align-items-center justify-content-between ${
            isSelected ? "text-primary fw-bold" : isAncestorOfSelected ? "text-primary" : "text-secondary"
          }`}
          onClick={() => onSelect(node.slug)}
          style={{ fontSize: "0.9rem", background: "none" }}
        >
          <span className="text-truncate">
            <i className={`bi ${node.icon} me-2`}></i>
            {node.name}
          </span>
          {isSelected && <i className="bi bi-check2 text-primary fs-6 flex-shrink-0 ms-1"></i>}
        </button>
      </div>
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {node.children.map((child) => (
            <CategoryNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedSlug={selectedSlug}
              expandedSlugs={expandedSlugs}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryTreeSidebar({
  tree,
  selectedSlug,
  onSelect,
}: CategoryTreeSidebarProps) {
  const defaultExpanded = useMemo(() => {
    if (!selectedSlug) return new Set(tree.map((n) => n.slug));
    const path = findPathToSlug(tree, selectedSlug);
    if (path) return new Set(path.slice(0, -1));
    return new Set(tree.map((n) => n.slug));
  }, [tree, selectedSlug]);

  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(defaultExpanded);

  React.useEffect(() => {
    setExpandedSlugs((prev) => {
      const next = new Set(prev);
      defaultExpanded.forEach((s) => next.add(s));
      return next;
    });
  }, [defaultExpanded]);

  const handleToggle = (slug: string) => {
    setExpandedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const handleSelect = (slug: string) => {
    onSelect(selectedSlug === slug ? "" : slug);
  };

  if (tree.length === 0) {
    return <p className="text-muted small mb-0">No categories yet.</p>;
  }

  return (
    <div className="d-flex flex-column gap-1">
      {tree.map((node) => (
        <CategoryNode
          key={node.id}
          node={node}
          depth={0}
          selectedSlug={selectedSlug}
          expandedSlugs={expandedSlugs}
          onToggle={handleToggle}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
