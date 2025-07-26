import WarehouseDetailsPage from "../_components/pages/warehouse-details";

interface ParamProps {
  params: Promise<{ warehouseId: string }>;
}

export default async function WarehouseDetails({ params }: ParamProps) {
  const { warehouseId } = await params;

  return (
    <div>
      <WarehouseDetailsPage warehouseId={warehouseId} />
    </div>
  );
}
