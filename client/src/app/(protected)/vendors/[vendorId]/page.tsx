import VendorDetailsPage from "../_components/pages/vendor-details";

interface ParamProps {
  params: Promise<{ vendorId: string }>;
}

export default async function VendorDetails({ params }: ParamProps) {
  const { vendorId } = await params;

  return (
    <div>
      <VendorDetailsPage vendorId={vendorId} />
    </div>
  );
}
