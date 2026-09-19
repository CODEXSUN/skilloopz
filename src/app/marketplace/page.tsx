import Link from "next/link";
import Image from "next/image";
import { Star, BookOpen, ShoppingCart, DollarSign } from "lucide-react";

import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PurchaseButton } from "./purchase-button";

export default async function MarketplacePage() {
  const userId = await getUserId();

  const listings = await prisma.marketplaceListing.findMany({
    where: { status: "published" },
    orderBy: [{ featured: "desc" }, { purchaseCount: "desc" }],
    take: 20,
  }).catch(() => []);

  const purchasedIds = userId
    ? (
        await prisma.marketplacePurchase.findMany({
          where: { buyerId: userId },
          select: { listingId: true },
        }).catch(() => [])
      ).map((p) => p.listingId)
    : [];

  const categories = await prisma.marketplaceListing.groupBy({
    by: ["category"],
    where: { status: "published" },
    _count: { id: true },
  }).catch(() => []);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Course Marketplace
        </h1>
        <p className="mt-1 text-muted-foreground">
          Discover and purchase courses from talented educators.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Badge variant="outline" className="cursor-pointer">All</Badge>
        {categories.map((cat) => (
          <Badge key={cat.category} variant="outline" className="cursor-pointer capitalize">
            {cat.category} ({cat._count.id})
          </Badge>
        ))}
      </div>

      {listings.length === 0 ? (
        <Card className="relative overflow-hidden">
          <Image src="/images/fallbacks/learning-card.webp" alt="A visual library of practical learning projects" fill sizes="(min-width: 1152px) 1152px, 100vw" className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-background/80" />
          <CardContent className="relative flex flex-col items-center justify-center py-16 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">No courses available yet.</p>
            <p className="mt-1 text-sm text-muted-foreground/60">
              Check back soon or become a teacher to list your courses.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => {
            const tags = JSON.parse(listing.tags) as string[];
            return (
              <Card key={listing.id} className="overflow-hidden">
                <div className="relative aspect-video w-full bg-muted">
                  <Image src={listing.thumbnailUrl ?? "/images/fallbacks/learning-card.webp"} alt={listing.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{listing.title}</CardTitle>
                    {listing.featured && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">{listing.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-sm text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        <span>{listing.rating > 0 ? listing.rating.toFixed(1) : "—"}</span>
                        <span className="text-muted-foreground">({listing.ratingCount})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      {listing.purchaseCount}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-lg font-bold text-foreground">
                      <DollarSign className="h-5 w-5" />
                      {listing.price === 0 ? "Free" : listing.price.toFixed(2)}
                    </div>
                    <PurchaseButton
                      listingId={listing.id}
                      price={listing.price}
                      purchased={purchasedIds.includes(listing.id)}
                    />
                  </div>

                  {tags.length > 0 && (
                    <div className="mt-3 flex gap-1 flex-wrap">
                      {tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex justify-center">
        <Button asChild variant="outline">
          <Link href="/teacher/courses">List Your Course</Link>
        </Button>
      </div>
    </div>
  );
}
