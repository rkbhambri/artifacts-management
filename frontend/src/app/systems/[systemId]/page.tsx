import SystemView from '@/components/SystemView';

export default function SystemPage({
  params,
}: {
  params: { systemId: string };
}) {
  return <SystemView systemId={params.systemId} />;
}
