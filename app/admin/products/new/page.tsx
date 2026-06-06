import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white">
      <h4 className="fw-bold mb-1">Add New Product</h4>
      <p className="text-muted mb-4 pb-2 border-bottom small">
        Create a simple product (one price &amp; stock) or a product with variants like Model + Color.
      </p>
      <ProductForm mode="create" />
    </div>
  );
}
