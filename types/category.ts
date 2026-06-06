export interface CategoryDocument {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  icon: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CategoryTreeNode extends CategoryDocument {
  children: CategoryTreeNode[];
}

/** Flat category for selects and cards (slug used as id in URLs) */
export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  parentId: string | null;
  depth: number;
}
