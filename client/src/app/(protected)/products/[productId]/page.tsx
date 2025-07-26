import ProductDetailsPage from "../_components/pages/product-details";

interface ParamProps {
  params: Promise<{ productId: string }>;
}

export default async function ProductDetails({ params }: ParamProps) {
  const { productId } = await params;

  return (
    <div>
      <ProductDetailsPage productId={productId} />
    </div>
  );
}
