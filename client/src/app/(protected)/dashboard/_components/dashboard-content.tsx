import { useAuthStore } from "@/core/stores/auth-store";
import React from "react";

export default function DashboardContent() {
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl">Dashboard</h1>
        </div>

        {user?.inventories && user.inventories.length > 0 ? (
          <div className="mt-8">
            <div className="flex mb-6">
              <h2 className="text-2xl font-semibold text-focus">
                Inventory Details
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {user.inventories.map((inventory) => (
                <div
                  key={inventory.id}
                  className="p-6 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-semibold mb-2 capitalize">
                    {user.username}
                  </h3>
                  <h3 className="text-xl font-semibold mb-2">
                    {inventory.name}
                  </h3>
                  <p className="text-sm text-secondary mb-4">
                    ID: {inventory.id}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 text-center">
            <p className="text-secondary">No inventories found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
