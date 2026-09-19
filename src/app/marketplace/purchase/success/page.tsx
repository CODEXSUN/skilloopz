"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PurchaseSuccessPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          </CardHeader>
        </Card>
      </div>
    }>
      <PurchaseSuccessPage />
    </Suspense>
  );
}

function PurchaseSuccessPage() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get("listingId");
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsProcessing(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            {isProcessing ? (
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            ) : (
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            )}
          </div>
          <CardTitle className="text-emerald-400">
            {isProcessing ? "Processing Payment..." : "Payment Successful!"}
          </CardTitle>
          <CardDescription>
            {isProcessing
              ? "Please wait while we confirm your purchase"
              : "You now have access to this course"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!isProcessing && (
            <>
              <Link href="/my-courses">
                <Button className="w-full">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Go to My Courses
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
