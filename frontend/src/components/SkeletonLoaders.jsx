import React from "react";

export const SkeletonBanner = () => (
  <div className="relative h-[600px] w-full md:h-[700px] lg:h-[800px] overflow-hidden">
    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/50 to-transparent" />
    <div className="relative mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-5 lg:px-8">
      <div className="text-center space-y-6 w-full max-w-3xl">
        <div className="inline-block h-8 w-48 rounded-full bg-white/20 animate-pulse" />
        <div className="space-y-3">
          <div className="h-10 w-3/4 mx-auto rounded bg-white/20 animate-pulse" />
          <div className="h-10 w-2/3 mx-auto rounded bg-white/20 animate-pulse" />
        </div>
        <div className="h-12 w-full max-w-2xl mx-auto rounded-2xl bg-white/20 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-full mx-auto rounded bg-white/10 animate-pulse" />
          <div className="h-4 w-5/6 mx-auto rounded bg-white/10 animate-pulse" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="h-12 w-32 rounded-xl bg-white/20 animate-pulse" />
          <div className="h-12 w-32 rounded-xl border border-white/30 bg-white/10 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonCategoryItem = () => (
  <div className="flex flex-col items-center gap-2 p-2 animate-pulse">
    <div className="h-16 w-16 rounded-full bg-gray-200 sm:h-20 sm:w-20" />
    <div className="h-3 w-16 rounded bg-gray-200" />
  </div>
);

export const SkeletonProductCard = () => (
  <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
    <div className="aspect-square bg-gray-200 animate-pulse" />
    <div className="flex flex-col flex-1 p-5 space-y-3">
      <div className="space-y-2">
        <div className="h-5 w-3/4 rounded bg-gray-200 animate-pulse" />
        <div className="h-8 w-1/3 rounded bg-gray-200 animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-gray-100 animate-pulse" />
        <div className="h-3 w-2/3 rounded bg-gray-100 animate-pulse" />
      </div>
      <div className="flex items-center gap-2 pt-2">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
          ))}
        </div>
        <div className="h-4 w-8 rounded bg-gray-200 animate-pulse" />
      </div>
      <div className="mt-auto pt-6">
        <div className="h-12 w-full rounded-xl bg-gray-200 animate-pulse" />
      </div>
    </div>
  </div>
);

export const SkeletonTestimonial = () => (
  <div className="flex h-48 flex-col rounded-3xl border border-gray-200 p-8 space-y-4">
    <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-full rounded bg-gray-200 animate-pulse" />
      <div className="h-3 w-5/6 rounded bg-gray-200 animate-pulse" />
    </div>
    <div className="border-t border-gray-200 pt-2 space-y-2">
      <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
      <div className="h-3 w-40 rounded bg-gray-200 animate-pulse" />
    </div>
  </div>
);

export const SkeletonValueCard = () => (
  <div className="rounded-2xl border border-gray-200 p-6 text-center space-y-4">
    <div className="mx-auto h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
    <div className="h-5 w-3/4 mx-auto rounded bg-gray-200 animate-pulse" />
    <div className="space-y-2">
      <div className="h-3 w-full rounded bg-gray-200 animate-pulse" />
      <div className="h-3 w-2/3 mx-auto rounded bg-gray-200 animate-pulse" />
    </div>
  </div>
);

export const SkeletonFooter = () => (
  <footer className="bg-[#0F1320] text-gray-400">
    <div className="mx-auto max-w-full px-8 py-12 lg:px-14">
      <div className="grid grid-cols-2 gap-y-10 gap-x-6 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-6 w-32 rounded bg-white/10 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-white/10 animate-pulse" />
              <div className="h-3 w-4/5 rounded bg-white/10 animate-pulse" />
              <div className="h-3 w-3/5 rounded bg-white/10 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </footer>
);

export const SkeletonProductDetail = () => (
  <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
      {/* Left: Image Gallery Skeleton */}
      <div className="lg:col-span-5 space-y-4">
        <div className="aspect-square rounded-3xl bg-gray-200 animate-pulse" />
        <div className="flex gap-2.5 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 w-16 shrink-0 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>

      {/* Right: Product Info Skeleton */}
      <div className="lg:col-span-7 space-y-5">
        {/* Category Badge */}
        <div className="h-6 w-24 rounded-full bg-gray-200 animate-pulse" />

        {/* Title */}
        <div className="h-8 w-3/4 rounded bg-gray-200 animate-pulse" />

        {/* Rating */}
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
            ))}
          </div>
          <div className="h-4 w-16 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-4">
          <div className="h-10 w-32 rounded bg-gray-200 animate-pulse" />
          <div className="h-6 w-24 rounded bg-gray-200 animate-pulse" />
          <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />
        </div>

        {/* Shipping badges */}
        <div className="flex flex-wrap gap-2">
          <div className="h-9 w-36 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-9 w-48 rounded-lg bg-gray-200 animate-pulse" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-4/6 rounded bg-gray-200 animate-pulse" />
        </div>

        {/* Color Options */}
        <div className="space-y-3">
          <div className="h-5 w-16 rounded bg-gray-200 animate-pulse" />
          <div className="flex flex-wrap gap-2.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 w-24 rounded-xl border-2 border-gray-200 bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Stand Type Options */}
        <div className="space-y-3">
          <div className="h-5 w-24 rounded bg-gray-200 animate-pulse" />
          <div className="flex flex-wrap gap-2.5">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-10 w-28 rounded-xl border border-gray-200 bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center gap-4">
          <div className="h-5 w-8 rounded bg-gray-200 animate-pulse" />
          <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            <div className="h-11 w-11 bg-gray-200 animate-pulse" />
            <div className="w-14 text-center">
              <div className="h-5 w-8 mx-auto rounded bg-gray-200 animate-pulse" />
            </div>
            <div className="h-11 w-11 bg-gray-200 animate-pulse" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="h-12 flex-1 rounded-xl bg-gray-200 animate-pulse" />
          <div className="h-12 w-12 rounded-xl border border-gray-200 bg-gray-100 animate-pulse" />
        </div>

        {/* Product Details Checklist */}
        <div className="rounded-xl bg-gray-50 p-4 space-y-3">
          <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-48 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-36 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    </div>

    {/* Tabs Skeleton */}
    <div className="mt-16 space-y-6">
      <div className="flex gap-6 border-b border-gray-200">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-5 w-24 rounded bg-gray-200 animate-pulse" />
        ))}
      </div>
      <div className="rounded-3xl bg-white p-6 space-y-3">
        <div className="h-6 w-48 rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-5/6 rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-4/6 rounded bg-gray-200 animate-pulse" />
      </div>
    </div>

    {/* Related Products Skeleton */}
    <div className="mt-16 border-t border-gray-100 pt-16">
      <div className="h-8 w-48 rounded bg-gray-200 animate-pulse mb-8" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="aspect-square bg-gray-200 animate-pulse" />
            <div className="flex flex-col flex-1 p-5 space-y-3">
              <div className="space-y-2">
                <div className="h-5 w-3/4 rounded bg-gray-200 animate-pulse" />
                <div className="h-8 w-1/3 rounded bg-gray-200 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-gray-100 animate-pulse" />
                <div className="h-3 w-2/3 rounded bg-gray-100 animate-pulse" />
              </div>
              <div className="mt-auto pt-6">
                <div className="h-12 w-full rounded-xl bg-gray-200 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
