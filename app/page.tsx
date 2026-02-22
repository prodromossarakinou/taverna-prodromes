import { HomeClient } from '@/components/features/root/HomeClient';

export default function Page({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const viewParam = (searchParams?.view as string | undefined) ?? undefined;
  const initialView = viewParam === 'kitchen' || viewParam === 'admin' || viewParam === 'waiter' ? viewParam : undefined;
  return <HomeClient initialView={initialView} />;
}
