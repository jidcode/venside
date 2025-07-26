"use client";

import { Button } from "@/core/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function ErrorPage() {
  return (
    <div className=" flex items-center justify-center p-4 min-h-[70vh]">
      <div className="max-w-lg w-full space-y-8 text-center">
        {/* Main Error Alert */}
        <div>
          <div className="flex items-center justify-center mb-6">
            <div className="bg-red-100 rounded-full p-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-destructive mb-4">
            Oops! Something went wrong
          </h1>

          <p className="text-foreground text leading-relaxed mb-8">
            We encountered an unexpected error. <br /> Don't worry, it's
            probably temporary.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4 flex flex-col items-center">
            <Button
              variant="secondary"
              className="w-40"
              onClick={() => {
                window.location.reload();
              }}
            >
              <RefreshCw className="h-5 w-5" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
