import { useState } from 'react';
import { Bike, Phone, Search, Users } from 'lucide-react';
import { useListRiders } from '@workspace/api-client-react';
import { ErrorState, LoadingRows, initials } from '@/components/shell';

export default function Riders() {
  const riders = useListRiders();
  const [search, setSearch] = useState('');
  const visible = riders.data?.filter((r) => `${r.name} ${r.phone}`.toLowerCase().includes(search.toLowerCase())) ?? [];
  return <div className="page-wrap"><div className="page-heading"><div><div className="eyebrow">People / Field team</div><h1 className="page-title">Rider roster</h1><p className="page-description">Know who is ready, who is moving, and who needs a quieter shift.</p></div><div className="connection-pill"><Users size={13} /> {riders.data?.length ?? '—'} riders</div></div>
    <div className="panel" style={{ marginBottom: 18 }}><div className="table-tools"><div className="search-wrap"><Search size={15} /><input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find a rider" data-testid="input-search-riders" /></div></div></div>
    {riders.isError ? <ErrorState onRetry={() => riders.refetch()} /> : riders.isLoading ? <LoadingRows count={3} /> : visible.length ? <div className="rider-grid">{visible.map((rider) => <article className="rider-card" key={rider.id} data-testid={`card-rider-${rider.id}`}><div className="rider-card-head"><div className="rider-initial">{initials(rider.name)}</div><div><div className="rider-name">{rider.name}</div><div className="rider-phone"><Phone size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} />{rider.phone}</div></div><span className={`rider-status ${rider.status}`} title={rider.status} /></div><div className="rider-stats"><div className="rider-load">{rider.activeDeliveries}<span>active deliveries</span></div><div className="rider-status-label">{rider.status.replace('_', ' ')}</div></div></article>)}</div> : <div className="empty-state"><div className="empty-icon"><Bike size={19} /></div><strong>No riders match</strong><p>Try a different name or check your spelling.</p></div>}</div>;
}