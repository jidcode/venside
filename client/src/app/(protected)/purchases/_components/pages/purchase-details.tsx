"use client";

import ErrorPage from "@/app/error";
import { PurchaseItemState, PurchaseState } from "@/core/schema/types";
import {
  Calendar,
  CreditCard,
  ShoppingBag,
  User,
  Percent,
  DollarSign,
} from "lucide-react";
import { getPurchase } from "@/core/services/purchases";
import { Badge } from "@/core/components/ui/badge";
import { CustomLoader } from "@/core/components/elements/loader";
import DeletePurchaseDialog from "../modals/delete-purchase";
import { formatCurrency } from "@/core/hooks/use-currency";

interface ParamProps {
  purchaseId: string;
}

export default function PurchaseDetailsPage({ purchaseId }: ParamProps) {
  const { data: purchase, isLoading, error } = getPurchase(purchaseId);

  if (error) return <ErrorPage />;
  if (isLoading) return <CustomLoader />;
  if (!purchase) return null;

  return (
    <div className="space-y-6">
      <PageHeader purchase={purchase} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Purchase Summary Card */}
        <div className="bg-primary rounded-xl shadow-sm p-6 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-24 w-24 rounded-full bg-blue-50 flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-blue-500" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold">
                #{purchase.purchaseNumber}
              </h2>
              <Badge
                variant={
                  purchase.paymentStatus === "paid"
                    ? "default"
                    : purchase.paymentStatus === "partial"
                    ? "secondary"
                    : "destructive"
                }
                className="mt-2"
              >
                {purchase.paymentStatus.charAt(0).toUpperCase() +
                  purchase.paymentStatus.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 ">
              <User className="h-5 w-5" />
              <span>{purchase.vendorName || "No supplier specified"}</span>
            </div>
            <div className="flex items-center gap-3 ">
              <Calendar className="h-5 w-5" />
              <span>
                {new Date(purchase.purchaseDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-3 ">
              <DollarSign className="h-5 w-5" />
              <span>{formatCurrency(purchase.totalAmount)}</span>
            </div>
            {(purchase.discountAmount > 0 || purchase.discountPercent > 0) && (
              <div className="flex items-center gap-3 ">
                <Percent className="h-5 w-5" />
                <span>
                  Discount: {purchase.discountPercent}% (
                  {formatCurrency(purchase.discountAmount)})
                </span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-3">Created</h3>
            <p className="">
              {new Date(purchase.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Items List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-primary rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Items</h2>
              <Badge variant="outline">
                {purchase.items?.length || 0}{" "}
                {purchase.items?.length === 1 ? "item" : "items"}
              </Badge>
            </div>

            {!purchase.items || purchase.items.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <ShoppingBag className="h-12 w-12 mx-auto " />
                <p className="">No items found for this purchase</p>
              </div>
            ) : (
              <div className="space-y-4">
                {purchase.items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="bg-primary rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Payment History</h2>
            <div className="space-y-4">
              <ActivityItem
                icon={<CreditCard className="h-5 w-5 text-green-500" />}
                title="Initial payment"
                date={new Date(purchase.createdAt).toLocaleDateString()}
                description={`${formatCurrency(purchase.totalAmount)} paid`}
              />
              {/* {purchase.balance > 0 && (
                <ActivityItem
                  icon={<DollarSign className="h-5 w-5 text-blue-500" />}
                  title="Balance due"
                  date="Pending"
                  description={`${formatCurrency(purchase.balance)} remaining`}
                />
              )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageHeader({ purchase }: { purchase: PurchaseState }) {
  return (
    <div className="flex items-center justify-between p-6 bg-primary rounded-md">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold ">
          Order / {purchase.purchaseNumber}
        </h1>
        <p className=" mt-1">View and manage purchase order details</p>
      </div>

      <div className="flex items-center gap-2">
        {/* <EditPurchaseSheet purchase={purchase} /> */}
        <DeletePurchaseDialog purchase={purchase} />
      </div>
    </div>
  );
}

function ItemCard({ item }: { item: PurchaseItemState }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">
            {item.product?.name || "Product not found"}
          </h3>
          <p className="text-sm  mt-1">
            {item.quantity} × {formatCurrency(item.unitPrice)}
          </p>
        </div>
        <div className="font-medium">{formatCurrency(item.subtotal)}</div>
      </div>
    </div>
  );
}

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
        <p className="text-sm ">{description}</p>
        <p className="text-xs  mt-1">{date}</p>
      </div>
    </div>
  );
}
