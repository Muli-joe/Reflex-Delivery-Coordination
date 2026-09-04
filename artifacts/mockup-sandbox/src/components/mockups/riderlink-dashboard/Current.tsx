import {
  ArrowUpRight,
  Bell,
  Bike,
  CheckCircle2,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  PackageOpen,
  Plus,
  Settings,
  Truck,
  Users,
} from 'lucide-react';
import './_group.css';

type Status = 'pending' | 'assigned' | 'picked_up' | 'delivered';

const summary = {
  totalToday: 24,
  pending: 6,
  assigned: 5,
  pickedUp: 8,
  delivered: 5,
  activeRiders: 12,
  onTimeRate: 94,
};

const activity: { id: number; actorName: string; reference: string; note: string; status: Status; time: string }[] = [
  { id: 1, actorName: 'Njeri K.', reference: 'RL-2048', note: 'Picked up from Westlands store', status: 'picked_up', time: '10:42 AM' },
  { id: 2, actorName: 'Amara Mwangi', reference: 'RL-2047', note: 'Delivery assigned to Brian O.', status: 'assigned', time: '10:35 AM' },
  { id: 3, actorName: 'Kevin O.', reference: 'RL-2046', note: 'Delivered to customer in Kilimani', status: 'delivered', time: '10:18 AM' },
  { id: 4, actorName: 'Amara Mwangi', reference: 'RL-2045', note: 'New delivery is waiting for a rider', status: 'pending', time: '10:04 AM' },
  { id: 5, actorName: 'Faith M.', reference: 'RL-2044', note: 'Picked up from Ngara market', status: 'picked_up', time: '9:51 AM' },
];

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, active: true },
  { label: 'Deliveries', icon: ClipboardList },
  { label: 'Riders', icon: Bike },
  { label: 'Rider mode', icon: Bike },
  { label: 'Settings', icon: Settings },
];

const statusLabels: Record<Status, string> = {
  pending: 'Pending',
  assigned: 'Assigned',
  picked_up: 'Picked up',
  delivered: 'Delivered',
};

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`status-badge ${status}`}>
      <span className={`status-dot ${status}`} />
      {statusLabels[status]}
    </span>
  );
}

export function Current() {
  const statItems = [
    ['Deliveries today', summary.totalToday, PackageOpen],
    ['Waiting assignment', summary.pending, Clock3],
    ['On the road', summary.pickedUp + summary.assigned, Truck],
    ['Delivered', summary.delivered, CheckCircle2],
  ] as const;

  return (
    <div className="riderlink-dashboard min-h-screen">
      <div className="reflex-shell">
        <aside className="reflex-sidebar">
          <a href="#overview" className="brand-mark">
            <span className="brand-symbol">R</span>
            <span><span className="brand-name">RiderLink</span><span className="brand-sub">operations desk</span></span>
          </a>
          <div className="nav-label">Workspace</div>
          <nav aria-label="Main navigation">
            {navItems.map(({ label, icon: Icon, active }) => (
              <a key={label} href={`#${label.toLowerCase().replace(' ', '-')}`} className={`nav-link ${active ? 'active' : ''}`}>
                <Icon /><span>{label}</span>
              </a>
            ))}
          </nav>
          <div className="sidebar-foot">
            <div className="operator-row">
              <div className="operator-avatar">AM</div>
              <div className="operator-meta"><strong>Amara Mwangi</strong><span>Dispatcher · Nairobi</span></div>
            </div>
          </div>
        </aside>

        <main className="reflex-main">
          <header className="topbar">
            <div>
              <div className="topbar-kicker">Thursday · 06 June 2024</div>
              <div className="topbar-title">Good morning, Amara</div>
            </div>
            <div className="topbar-actions">
              <div className="connection-pill"><span className="online-dot" /> Connected</div>
              <button className="icon-btn" aria-label="Notifications"><Bell size={15} /></button>
            </div>
          </header>

          <div className="page-wrap">
            <div className="page-heading">
              <div>
                <div className="eyebrow">Operations / Today</div>
                <h1 className="page-title">Keep the day moving.</h1>
                <p className="page-description">A clear view of every handoff, from the first request to the customer’s doorstep.</p>
              </div>
              <button className="btn btn-primary" onClick={() => window.alert('New delivery request started')}><Plus size={15} /> New delivery</button>
            </div>

            <div className="stats-grid">
              {statItems.map(([label, number, Icon]) => (
                <div className="stat-card" key={label}>
                  <div className="stat-label"><span>{label}</span><Icon size={15} /></div>
                  <div className="stat-number">{number}</div>
                  <div className="stat-rail"><i style={{ width: `${Math.min(100, (number / summary.totalToday) * 100)}%` }} /></div>
                </div>
              ))}
            </div>

            <div className="dashboard-grid">
              <section className="panel">
                <div className="panel-head">
                  <div><div className="panel-title">Live activity</div><div className="panel-note">The latest handoffs in your desk</div></div>
                  <a href="#deliveries" className="btn btn-secondary" style={{ padding: '7px 10px' }}>View queue <ArrowUpRight size={13} /></a>
                </div>
                <div className="panel-body">
                  {activity.map((item) => (
                    <div className="activity-item" key={item.id}>
                      <div className="activity-marker"><Truck size={13} /></div>
                      <div className="activity-copy"><strong>{item.actorName} · <span style={{ color: 'hsl(var(--primary))' }}>{item.reference}</span></strong><p>{item.note}</p></div>
                      <div><StatusBadge status={item.status} /><div className="activity-time" style={{ marginTop: 6, textAlign: 'right' }}>{item.time}</div></div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel">
                <div className="panel-head"><div><div className="panel-title">Desk pulse</div><div className="panel-note">Where attention is needed</div></div><Users size={16} color="hsl(var(--muted-foreground))" /></div>
                <div className="panel-body">
                  <div className="queue-stack">
                    <div className="queue-row"><span className="status-dot pending" /><div className="queue-count">{summary.pending}</div><div className="queue-copy">Need a rider<span>Pending assignment</span></div></div>
                    <div className="queue-row"><span className="status-dot assigned" /><div className="queue-count">{summary.assigned}</div><div className="queue-copy">Assigned<span>Awaiting pick-up</span></div></div>
                    <div className="queue-row"><span className="status-dot picked_up" /><div className="queue-count">{summary.pickedUp}</div><div className="queue-copy">In transit<span>Riders on the road</span></div></div>
                  </div>
                  <div className="detail-section">
                    <div className="detail-section-title">Rider health</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}><span>{summary.activeRiders} active riders</span><span style={{ color: 'hsl(var(--primary))' }}>{summary.onTimeRate}% on time</span></div>
                    <div className="stat-rail" style={{ marginTop: 10 }}><i style={{ width: `${summary.onTimeRate}%`, background: 'hsl(var(--primary))' }} /></div>
                    <a href="#riders" className="btn btn-secondary" style={{ width: '100%', marginTop: 17 }}>Open rider roster <ArrowUpRight size={13} /></a>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Current;