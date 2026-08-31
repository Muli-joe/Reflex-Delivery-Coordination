import { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Clock3, PackageOpen, Plus, Truck, Users } from 'lucide-react';
import { Link } from 'wouter';
import { useGetDashboardSummary, useListActivity } from '@workspace/api-client-react';
import { NewDeliveryDialog } from '@/components/delivery-dialog';
import { ErrorState, LoadingRows, StatusBadge, formatTime } from '@/components/shell';

export default function Dashboard() {
  const summary = useGetDashboardSummary();
  const activity = useListActivity({ limit: 8 });
  const [newOpen, setNewOpen] = useState(false);
  const data = summary.data;
  const statItems = data ? [
    ['Deliveries today', data.totalToday, PackageOpen, 'totalToday'],
    ['Waiting assignment', data.pending, Clock3, 'pending'],
    ['On the road', data.pickedUp + data.assigned, Truck, 'active'],
    ['Delivered', data.delivered, CheckCircle2, 'delivered'],
  ] : [];

  return (
    <div className="page-wrap">
      <div className="page-heading"><div><div className="eyebrow">Operations / Today</div><h1 className="page-title">Keep the day moving.</h1><p className="page-description">A clear view of every handoff, from the first request to the customer’s doorstep.</p></div><button className="btn btn-primary" onClick={() => setNewOpen(true)} data-testid="button-new-delivery"><Plus size={15} /> New delivery</button></div>
      {summary.isError ? <ErrorState onRetry={() => summary.refetch()} /> : summary.isLoading ? <div className="stats-grid">{[1, 2, 3, 4].map((x) => <div key={x} className="stat-card skeleton" />)}</div> : <div className="stats-grid">{statItems.map(([label, number, Icon, key]) => <div className="stat-card" key={key} data-testid={`card-stat-${key}`}><div className="stat-label"><span>{label}</span><Icon size={15} /></div><div className="stat-number">{number}</div><div className="stat-rail"><i style={{ width: `${Math.min(100, (Number(number) / Math.max(1, data?.totalToday ?? 1)) * 100)}%` }} /></div></div>)}</div>}
      <div className="dashboard-grid">
        <section className="panel"><div className="panel-head"><div><div className="panel-title">Live activity</div><div className="panel-note">The latest handoffs in your desk</div></div><Link href="/deliveries" className="btn btn-secondary" style={{ padding: '7px 10px' }} data-testid="link-view-all-deliveries">View queue <ArrowUpRight size={13} /></Link></div><div className="panel-body">{activity.isError ? <ErrorState onRetry={() => activity.refetch()} /> : activity.isLoading ? <LoadingRows count={5} /> : activity.data?.length ? activity.data.map((item) => <div className="activity-item" key={item.id} data-testid={`activity-item-${item.id}`}><div className="activity-marker"><Truck size={13} /></div><div className="activity-copy"><strong>{item.actorName} · <span style={{ color: 'hsl(var(--primary))' }}>{item.reference}</span></strong><p>{item.note || `Delivery marked ${item.status.replace('_', ' ')}`}</p></div><div><StatusBadge status={item.status} /><div className="activity-time" style={{ marginTop: 6, textAlign: 'right' }}>{formatTime(item.createdAt)}</div></div></div>) : <div className="empty-state"><div className="empty-icon"><PackageOpen size={19} /></div><strong>No activity yet</strong><p>When the first delivery moves, its story will show up here.</p></div>}</div></section>
        <section className="panel"><div className="panel-head"><div><div className="panel-title">Desk pulse</div><div className="panel-note">Where attention is needed</div></div><Users size={16} color="hsl(var(--muted-foreground))" /></div><div className="panel-body"><div className="queue-stack"><div className="queue-row"><span className="status-dot pending" /><div className="queue-count">{data?.pending ?? '—'}</div><div className="queue-copy">Need a rider<span>Pending assignment</span></div></div><div className="queue-row"><span className="status-dot assigned" /><div className="queue-count">{data?.assigned ?? '—'}</div><div className="queue-copy">Assigned<span>Awaiting pick-up</span></div></div><div className="queue-row"><span className="status-dot picked_up" /><div className="queue-count">{data?.pickedUp ?? '—'}</div><div className="queue-copy">In transit<span>Riders on the road</span></div></div></div><div className="detail-section"><div className="detail-section-title">Rider health</div><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}><span>{data?.activeRiders ?? '—'} active riders</span><span style={{ color: 'hsl(var(--primary))' }}>{data?.onTimeRate ?? '—'}% on time</span></div><div className="stat-rail" style={{ marginTop: 10 }}><i style={{ width: `${data?.onTimeRate ?? 0}%`, background: 'hsl(var(--primary))' }} /></div><Link href="/riders" className="btn btn-secondary" style={{ width: '100%', marginTop: 17 }} data-testid="link-rider-roster">Open rider roster <ArrowUpRight size={13} /></Link></div></div></section>
      </div>
      {newOpen && <NewDeliveryDialog onClose={() => setNewOpen(false)} />}
    </div>
  );
}