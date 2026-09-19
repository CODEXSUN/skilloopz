"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { ArrowLeft, CreditCard, Loader2, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function CheckoutForm({ listingId, amount }: { listingId: string; amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;

      setIsProcessing(true);
      setError(null);

      try {
        const { error: submitError } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/marketplace/purchase/success?listingId=${listingId}`,
          },
          redirect: "if_required",
        });

        if (submitError) {
          setError(submitError.message || "Payment failed");
        } else {
          setMessage("Payment successful!");
          setTimeout(() => {
            window.location.href = `/marketplace/purchase/success?listingId=${listingId}`;
          }, 1000);
        }
      } catch {
        setError("An unexpected error occurred");
      } finally {
        setIsProcessing(false);
      }
    },
    [stripe, elements, listingId],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-400">
          {message}
        </div>
      )}

      <Button type="submit" disabled={isProcessing || !stripe || !elements} className="w-full">
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay Now
          </>
        )}
      </Button>
    </form>
  );
}

export default function CheckoutPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <CheckoutPage />
    </Suspense>
  );
}

function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get("listingId");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listingId) {
      setError("No listing selected");
      setIsLoading(false);
      return;
    }

    async function initCheckout() {
      try {
        const res = await fetch("/api/payments/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create payment");
        }

        const data = await res.json();
        setClientSecret(data.clientSecret);
        setPublishableKey(data.publishableKey);
        setAmount(data.amount);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize checkout");
      } finally {
        setIsLoading(false);
      }
    }

    initCheckout();
  }, [listingId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !clientSecret || !publishableKey) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-400">Checkout Error</CardTitle>
            <CardDescription>{error || "Unable to initialize payment"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/marketplace">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Marketplace
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stripePromise = loadStripe(publishableKey);

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/marketplace">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
          <p className="text-sm text-muted-foreground">Complete your purchase securely</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Payment Details
          </CardTitle>
          <CardDescription>
            Total: ${(amount).toFixed(2)} USD
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise} options={{ clientSecret: clientSecret || "" }}>
            <CheckoutForm listingId={listingId!} amount={amount} />
          </Elements>
        </CardContent>
      </Card>
    </div>
  );
}
