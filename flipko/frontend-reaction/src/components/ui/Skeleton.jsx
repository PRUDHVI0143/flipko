import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = ({ className, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className={`bg-slate-200 dark:bg-slate-700 rounded-md ${className}`}
      {...props}
    />
  );
};

export const ProductSkeleton = () => (
  <div className="flex flex-col bg-white dark:bg-dark-800 rounded-[24px] overflow-hidden border border-slate-100 dark:border-slate-700 h-full p-5 space-y-4">
    <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
    <div className="flex justify-between">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-12" />
    </div>
    <Skeleton className="h-6 w-3/4" />
    <div className="flex justify-between items-end mt-auto">
      <div className="space-y-2">
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="w-10 h-10 rounded-full" />
    </div>
  </div>
);

export const CategorySkeleton = () => (
  <div className="flex flex-col items-center gap-3 shrink-0">
    <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl" />
    <Skeleton className="h-3 w-12" />
  </div>
);

export default Skeleton;
