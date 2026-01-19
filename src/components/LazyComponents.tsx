import { lazy, Suspense, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Wrapper para lazy loading com fallback
export function lazyLoad<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const Component = lazy(factory);
  
  return (props: any) => (
    <Suspense fallback={fallback || <ComponentFallback />}>
      <Component {...props} />
    </Suspense>
  );
}

// Fallback padrão para componentes lazy
function ComponentFallback() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

// Charts Lazy Loading - wrapping named exports as default
export const LazyRevenueChart = lazyLoad(
  () => import('@/components/dashboard/RevenueChart').then(m => ({ default: m.RevenueChart })),
  <div className="h-[400px] rounded-lg border bg-card p-6">
    <Skeleton className="h-full w-full" />
  </div>
);

export const LazyMarginChart = lazyLoad(
  () => import('@/components/dashboard/MarginChart').then(m => ({ default: m.MarginChart })),
  <div className="h-[400px] rounded-lg border bg-card p-6">
    <Skeleton className="h-full w-full" />
  </div>
);

export const LazyTimeSeriesChart = lazyLoad(
  () => import('@/components/dashboard/TimeSeriesChart').then(m => ({ default: m.TimeSeriesChart })),
  <div className="h-[500px] rounded-lg border bg-card p-6">
    <Skeleton className="h-full w-full" />
  </div>
);

export const LazySmartAlertsPanel = lazyLoad(
  () => import('@/components/dashboard/SmartAlertsPanel').then(m => ({ default: m.default })),
  <div className="rounded-lg border bg-card p-6">
    <Skeleton className="h-48 w-full" />
  </div>
);
