import CustomerDetailsPage from "../_components/pages/customer-details";

interface ParamProps {
  params: Promise<{ customerId: string }>;
}

export default async function CustomerDetails({ params }: ParamProps) {
  const { customerId } = await params;

  return (
    <div>
      <CustomerDetailsPage customerId={customerId} />
    </div>
  );
}
