"use client";

import ErrorPage from "@/app/error";
import { CustomerState } from "@/core/schema/types";
import { Mail, Phone, MapPin, CreditCard, ShoppingBag } from "lucide-react";
import { getCustomer } from "@/core/services/customers";
import { Badge } from "@/core/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import { CustomLoader } from "@/core/components/elements/loader";
import DeleteCustomerDialog from "../modals/delete-customer";
import EditCustomerSheet from "../modals/edit-customer";

interface ParamProps {
  customerId: string;
}

export default function CustomerDetailsPage({ customerId }: ParamProps) {
  const { data: customer, isLoading, error } = getCustomer(customerId);

  if (error) return <ErrorPage />;
  if (isLoading) return <CustomLoader />;
  if (!customer) return null;

  return (
    <div className="space-y-6">
      <PageHeader customer={customer} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src="./placeholder.jpg" />
              <AvatarFallback>
                {customer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-semibold">{customer.name}</h2>
              <Badge
                variant={
                  customer.customerType === "business" ? "default" : "secondary"
                }
                className="mt-2"
              >
                {customer.customerType === "business"
                  ? "Business"
                  : "Individual"}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="h-5 w-5" />
              <span>{customer.email || "No email provided"}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Phone className="h-5 w-5" />
              <span>{customer.phone || "No phone provided"}</span>
            </div>
            {customer.address && (
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin className="h-5 w-5 mt-0.5" />
                <span>{customer.address}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-3">Customer Since</h3>
            <p className="text-gray-600">
              {new Date(customer.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Order History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Order History</h2>
              {/* <Badge variant="outline">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </Badge> */}
            </div>

            {/* {orders.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <ShoppingBag className="h-12 w-12 mx-auto text-gray-400" />
                <p className="text-gray-500">No orders found for this customer</p>
                <Button variant="outline">View Products</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )} */}
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              <ActivityItem
                icon={<ShoppingBag className="h-5 w-5 text-blue-500" />}
                title="Placed new order"
                date="2 hours ago"
                description="Order #12345 with 3 items"
              />
              <ActivityItem
                icon={<CreditCard className="h-5 w-5 text-green-500" />}
                title="Payment received"
                date="1 day ago"
                description="$245.00 for Order #12344"
              />
              <ActivityItem
                icon={<Mail className="h-5 w-5 text-purple-500" />}
                title="Sent follow-up email"
                date="3 days ago"
                description="Special offer on new products"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageHeader({ customer }: { customer: CustomerState }) {
  return (
    <div className="flex items-center justify-between p-6 bg-white rounded-md">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
          Customer Details
        </h1>
        <p className="text-gray-500 mt-1">
          Manage {customer.name}'s account and orders
        </p>
      </div>

      <div className="flex items-center gap-2">
        <EditCustomerSheet customer={customer} />
        <DeleteCustomerDialog customer={customer} />
      </div>
    </div>
  );
}

// function OrderCard({ order }: { order: OrderProps }) {
//   return (
//     <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
//       <div className="flex justify-between items-start">
//         <div>
//           <h3 className="font-medium">Order #{order.id.slice(0, 8)}</h3>
//           <p className="text-sm text-gray-500 mt-1">
//             {new Date(order.createdAt).toLocaleDateString()}
//           </p>
//         </div>
//         <Badge variant={order.status === 'completed' ? 'default' : 'outline'}>
//           {order.status}
//         </Badge>
//       </div>

//       <div className="mt-4 flex justify-between items-center">
//         <div className="flex items-center space-x-2">
//           <div className="flex -space-x-2">
//             {order.products.slice(0, 3).map((product) => (
//               <div key={product.id} className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
//                 <Image
//                   src={product.image || "/placeholder.jpg"}
//                   alt={product.name}
//                   width={32}
//                   height={32}
//                   className="object-cover"
//                 />
//               </div>
//             ))}
//             {order.products.length > 3 && (
//               <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium">
//                 +{order.products.length - 3}
//               </div>
//             )}
//           </div>
//           <span className="text-sm text-gray-500">
//             {order.products.length} items
//           </span>
//         </div>
//         <span className="font-medium">${order.totalAmount.toFixed(2)}</span>
//       </div>
//     </div>
//   );
// }

function ActivityItem({
  icon,
  title,
  date,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  date: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="p-2 rounded-full bg-gray-50">{icon}</div>
        <div className="w-px h-full bg-gray-200 mt-2"></div>
      </div>
      <div className="flex-1 pb-4">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{date}</p>
      </div>
    </div>
  );
}
