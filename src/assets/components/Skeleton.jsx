export default function Skeleton({ className = "", variant = "rect" }) {
  const baseClass = "skeleton";
  const variantClass = {
    rect: "rounded-lg",
    circle: "rounded-full",
    text: "rounded h-4",
  };
  
  return (
    <div 
      className={`${baseClass} ${variantClass[variant]} ${className}`}
      aria-hidden="true"
    />
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm">
      <Skeleton className="mb-4 h-40 w-full" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3 mb-3" />
      <Skeleton className="h-8 w-24 rounded-full" />
    </div>
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="rounded-xl border border-brand-border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-6 w-32 mb-1" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr className="border-t border-brand-border">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="rounded-xl border border-brand-border bg-white p-5 shadow-sm">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full mt-6" />
    </div>
  );
}

