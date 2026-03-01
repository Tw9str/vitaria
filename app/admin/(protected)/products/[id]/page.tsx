import { notFound } from "next/navigation";
import { getProductById } from "@/lib/db/products";
import ProductEditor from "@/components/admin/ProductEditorForm";

export default async function EditProduct({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return <ProductEditor mode="edit" product={product} />;
}
