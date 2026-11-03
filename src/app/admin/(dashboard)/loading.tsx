import { NavigationHold } from '@/components/site-next/NavigationSpinner';

export default function Loading() {
  return (
    <div aria-hidden className="min-h-[60vh] space-y-4">
      <NavigationHold />
      <div className="h-8 w-64 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
      <div className="h-64 w-full animate-pulse rounded-xl bg-slate-200 motion-reduce:animate-none" />
    </div>
  );
}
