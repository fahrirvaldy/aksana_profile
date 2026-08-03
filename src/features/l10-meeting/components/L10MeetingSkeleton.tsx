
"use client";

import React from 'react';

const SkeletonElement = ({ className }: { className?: string }) => (
  <div className={`bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse ${className}`} />
);

export const L10MeetingSkeleton = () => {
  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col bg-white dark:bg-slate-950 p-1 select-none">
      {/* Controls Skeleton */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <SkeletonElement className="w-24 h-10" />
          <SkeletonElement className="w-32 h-10" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonElement className="w-10 h-10 rounded-full" />
          <SkeletonElement className="w-10 h-10 rounded-full" />
        </div>
        <div className="flex items-center gap-4">
          <SkeletonElement className="w-24 h-10" />
          <SkeletonElement className="w-24 h-10" />
        </div>
      </div>

      {/* Slide Content Skeleton */}
      <div className="flex-1 px-4 md:px-6 xl:px-8 pb-12 pt-4">
        <div className="space-y-4">
          <SkeletonElement className="w-1/3 h-8" />
          <SkeletonElement className="w-1/2 h-6" />
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <SkeletonElement className="w-full h-24" />
            <SkeletonElement className="w-full h-24" />
            <SkeletonElement className="w-full h-24" />
          </div>
          <div className="space-y-4">
            <SkeletonElement className="w-full h-48" />
            <SkeletonElement className="w-full h-24" />
          </div>
        </div>
      </div>
    </div>
  );
};
