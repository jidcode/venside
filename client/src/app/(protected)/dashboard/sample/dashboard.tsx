"use client";

import React, { useState } from "react";
import ChartsComponent from "./charts";
import StatsComponent from "./stats";

export default function SampleDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Inventory Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor your inventory performance and sales metrics in real-time
          </p>
        </div>

        <StatsComponent />

        <ChartsComponent />
      </div>
    </div>
  );
}
