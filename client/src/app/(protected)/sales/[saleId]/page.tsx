import SaleDetailsPage from "../_components/pages/sale-details";

interface ParamProps {
  params: Promise<{ saleId: string }>;
}

export default async function SaleDetails({ params }: ParamProps) {
  const { saleId } = await params;

  return (
    <div>
      <SaleDetailsPage saleId={saleId} />
    </div>
  );
}
