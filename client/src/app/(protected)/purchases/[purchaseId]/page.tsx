import PurchaseDetailsPage from "../_components/pages/purchase-details";

interface ParamProps {
  params: Promise<{ purchaseId: string }>;
}

export default async function PurchaseDetails({ params }: ParamProps) {
  const { purchaseId } = await params;

  return (
    <div>
      <PurchaseDetailsPage purchaseId={purchaseId} />
    </div>
  );
}
