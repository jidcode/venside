"use client";

import ErrorPage from "@/app/error";
import { VendorState } from "@/core/schema/types";
import { Mail, Phone, MapPin, Globe, Building2, Package } from "lucide-react";
import { getVendor } from "@/core/services/vendors";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/core/components/ui/avatar";
import { CustomLoader } from "@/core/components/elements/loader";
import DeleteVendorDialog from "../modals/delete-vendor";
import EditVendorSheet from "../modals/edit-vendor";

interface ParamProps {
  vendorId: string;
}

export default function VendorDetailsPage({ vendorId }: ParamProps) {
  const { data: vendor, isLoading, error } = getVendor(vendorId);

  if (error) return <ErrorPage />;
  if (isLoading) return <CustomLoader />;
  if (!vendor) return null;

  return (
    <div className="space-y-6">
      <PageHeader vendor={vendor} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src="./placeholder.jpg" />
              <AvatarFallback>
                {vendor.companyName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-semibold">{vendor.companyName}</h2>
              {vendor.contactName && (
                <p className="text-gray-600 mt-1">{vendor.contactName}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="h-5 w-5" />
              <span>{vendor.email || "No email provided"}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Phone className="h-5 w-5" />
              <span>{vendor.phone || "No phone provided"}</span>
            </div>
            {vendor.website && (
              <div className="flex items-center gap-3 text-gray-600">
                <Globe className="h-5 w-5" />
                <span className="truncate">{vendor.website}</span>
              </div>
            )}
            {vendor.address && (
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin className="h-5 w-5 mt-0.5" />
                <span>{vendor.address}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-3">Vendor Since</h3>
            <p className="text-gray-600">
              {new Date(vendor.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Inventory & Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Supplied Products</h2>
              {/* <Badge variant="outline">
                {products.length} {products.length === 1 ? 'product' : 'products'}
              </Badge> */}
            </div>

            {/* {products.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <Package className="h-12 w-12 mx-auto text-gray-400" />
                <p className="text-gray-500">No products supplied by this vendor</p>
                <Button variant="outline">Add Product</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )} */}
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              <ActivityItem
                icon={<Building2 className="h-5 w-5 text-blue-500" />}
                title="Vendor information updated"
                date="2 hours ago"
                description="Contact details were modified"
              />
              <ActivityItem
                icon={<Package className="h-5 w-5 text-green-500" />}
                title="New product added"
                date="1 day ago"
                description="Added 'Premium Widget' to inventory"
              />
              <ActivityItem
                icon={<Mail className="h-5 w-5 text-purple-500" />}
                title="Sent purchase order"
                date="3 days ago"
                description="PO #78910 for inventory restock"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageHeader({ vendor }: { vendor: VendorState }) {
  return (
    <div className="flex items-center justify-between p-6 bg-white rounded-md">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
          Vendor Details
        </h1>
        <p className="text-gray-500 mt-1">
          Manage {vendor.companyName}'s information and products
        </p>
      </div>

      <div className="flex items-center gap-2">
        <EditVendorSheet vendor={vendor} />
        <DeleteVendorDialog vendor={vendor} />
      </div>
    </div>
  );
}

// function ProductCard({ product }: { product: ProductProps }) {
//   return (
//     <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
//       <div className="flex justify-between items-start">
//         <div>
//           <h3 className="font-medium">{product.name}</h3>
//           <p className="text-sm text-gray-500 mt-1">{product.sku}</p>
//         </div>
//         <Badge variant={product.stockStatus === 'in-stock' ? 'default' : 'destructive'}>
//           {product.stockStatus}
//         </Badge>
//       </div>

//       <div className="mt-4 flex justify-between items-center">
//         <div className="text-sm text-gray-600">
//           Stock: {product.quantity} units
//         </div>
//         <span className="font-medium">${product.price.toFixed(2)}</span>
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
