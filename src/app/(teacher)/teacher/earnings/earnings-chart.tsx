"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EarningsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Earnings Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          Chart will render here once you have sales data.
        </div>
      </CardContent>
    </Card>
  );
}
