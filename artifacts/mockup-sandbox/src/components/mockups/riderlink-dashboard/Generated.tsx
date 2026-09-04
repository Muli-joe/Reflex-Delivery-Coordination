import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Bell,
  Bike,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Command,
  Gauge,
  LayoutDashboard,
  MapPin,
  Package,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Truck,
  X,
  Zap,
} from 'lucide-react';
import './_group.css';

type Status = 'pending' | 'assigned' | 'picked_up' | 'delivered';
type NavKey = 'overview' | 'deliveries' | 'riders' | 'rider-mode' | 'settings';

const summary = {
  totalToday: 24,
  pending: 6,
  assigned: 5,
  pickedUp: 8,
  delivered: 5,
  activeRiders: 12,
  onTimeRate: 94,
};

const activity: {
  id: number;
  actorName: string;
  reference: string;
  note: string;
  status: Status;
  time: string;
  area: string;
}[] = [
  { id: 1, actorName: 'Njeri K.', reference: 'RL-2048', note: 'Picked up from Westlands store', status: 'picked_up', time: '10:42 AM', area: 'Westlands' },
  { id: 2, actorName: 'Amara Mwangi', reference: 'RL-2047', note: 'Delivery assigned to Brian O.', status: 'assigned', time: '10:35 AM', area: 'Lavington' },
  { id: 3, actorName: 'Kevin O.', reference: 'RL-2046', note: 'Delivered to customer in Kilimani', status: 'delivered', time: '10:18 AM', area: 'Kilimani' },
  { id: 4, actorName: 'Amara Mwangi', reference: 'RL-2045', note: 'New delivery is waiting for a rider', status: 'pending', time: '10:04 AM', area: 'Parklands' },
  { id: 5, actorName: 'Faith M.', reference: 'RL-2044', note: 'Picked up from Ngara market', status: 'picked_up', time: '9:51 AM', area: 'Ngara' },
];

const statusLabels: Record<Status, string> = {
  pending: 'Needs rider',
  assigned: 'Assigned',
  picked_up: 'In transit',
  delivered: 'Delivered',
};

const navItems: { key: NavKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'deliveries', label: 'Deliveries', icon: ClipboardList },
  { key: 'riders', label: 'Riders', icon: Bike },
  { key: 'rider-mode', label: 'Rider mode', icon: Truck },
  { key: 'settings', label: 'Settings', icon: Settings },
];

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`generated-status generated-status-${status}`}>
      <span className="generated-status-dot" />
      {statusLabels[status]}
    </span>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | string;
  detail: string;
  icon: typeof Package;
  tone: 'sun' | 'blue' | 'orange' | 'green';
}) {
  return (
    <article className={`generated-metric generated-metric-${tone}`}>
      <div className="generated-metric-top">
        <span>{label}</span>
        <span className="generated-metric-icon"><Icon size={15} strokeWidth={1.8} /></span>
      </div>
      <div className="generated-metric-value">{value}</div>
      <div className="generated-metric-detail">{detail}</div>
    </article>
  );
}

export function Generated() {
  const [activeNav, setActiveNav] = useState<NavKey>('overview');
  const [selectedStatus, setSelectedStatus] = useState<'all' | Status>('all');
  const [search, setSearch] = useState('');
  const [isDeliveryOpen, setDeliveryOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState('');

  const visibleActivity = useMemo(() => {
    const query = search.trim().toLowerCase();
    return activity.filter((item) => {
      const statusMatch = selectedStatus === 'all' || item.status === selectedStatus;
      const searchMatch = !query || `${item.actorName} ${item.reference} ${item.note} ${item.area}`.toLowerCase().includes(query);
      return statusMatch && searchMatch;
    });
  }, [search, selectedStatus]);

  const announce = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  };

  const handleNav = (key: NavKey) => {
    setActiveNav(key);
    if (key !== 'overview') announce(`${navItems.find((item) => item.key === key)?.label} view selected`);
  };

  return (
    <div className="riderlink-generated">
      <style>{`
        .riderlink-generated {
          --g-ink: #193b38;
          --g-ink-soft: #58716c;
          --g-paper: #f5f1e7;
          --g-card: #fffdf8;
          --g-line: #dfe5d9;
          --g-saffron: #e5a52e;
          --g-saffron-dark: #9a6810;
          --g-teal: #236962;
          --g-coral: #dc7956;
          --g-blue: #668aa0;
          min-height: 100dvh;
          background: var(--g-paper);
          color: var(--g-ink);
          font-family: var(--app-font-sans);
          overflow: hidden;
          position: relative;
        }
        .riderlink-generated::before {
          content: '';
          pointer-events: none;
          position: absolute;
          inset: 0;
          opacity: .24;
          background-image: radial-gradient(#b8b9a5 .7px, transparent .7px);
          background-size: 18px 18px;
          mask-image: linear-gradient(90deg, rgba(0,0,0,.32), transparent 54%);
        }
        .riderlink-generated, .riderlink-generated * { box-sizing: border-box; }
        .generated-shell { min-height: 100dvh; display: flex; position: relative; z-index: 1; }
        .generated-sidebar {
          width: 238px;
          flex: 0 0 238px;
          background: var(--g-ink);
          color: #eef2e8;
          padding: 26px 15px 17px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        .generated-sidebar::after {
          content: '';
          width: 170px;
          height: 170px;
          position: absolute;
          right: -90px;
          top: 188px;
          border: 1px solid rgba(229,165,46,.2);
          border-radius: 50%;
          box-shadow: 0 0 0 23px rgba(229,165,46,.04), 0 0 0 47px rgba(229,165,46,.025);
        }
        .generated-brand { display: flex; gap: 11px; align-items: center; padding: 0 10px 34px; color: inherit; text-decoration: none; }
        .generated-brand-mark {
          width: 32px; height: 32px; display: grid; place-items: center;
          background: var(--g-saffron); color: var(--g-ink); border-radius: 11px 4px 11px 4px;
          font-family: var(--app-font-serif); font-weight: 800; font-size: 19px; transform: rotate(-7deg);
          box-shadow: 7px 7px 0 rgba(229,165,46,.12);
        }
        .generated-brand-name { display: block; font-family: var(--app-font-serif); font-size: 20px; font-weight: 700; letter-spacing: -.055em; }
        .generated-brand-sub { display: block; margin-top: 1px; color: rgba(238,242,232,.48); font-family: var(--app-font-mono); font-size: 9px; letter-spacing: .12em; text-transform: uppercase; }
        .generated-nav-label { color: rgba(238,242,232,.38); font-family: var(--app-font-mono); font-size: 9px; letter-spacing: .16em; text-transform: uppercase; padding: 0 12px; margin: 0 0 9px; }
        .generated-nav { display: grid; gap: 5px; }
        .generated-nav button {
          border: 0; width: 100%; background: transparent; color: rgba(238,242,232,.65); text-align: left;
          display: flex; align-items: center; gap: 11px; padding: 11px 12px; border-radius: 8px; font-size: 12px; font-weight: 700;
          transition: background .2s ease, color .2s ease, transform .2s ease;
        }
        .generated-nav button:hover { background: rgba(255,255,255,.065); color: #f4f1e5; transform: translateX(2px); }
        .generated-nav button:focus-visible, .generated-sidebar button:focus-visible { outline: 2px solid var(--g-saffron); outline-offset: 2px; }
        .generated-nav button.active { background: #2b514c; color: var(--g-saffron); box-shadow: inset 3px 0 var(--g-saffron); }
        .generated-nav svg { width: 16px; height: 16px; stroke-width: 1.8; }
        .generated-sidebar-note { margin: auto 10px 18px; padding: 14px 13px; border: 1px solid rgba(238,242,232,.12); border-radius: 9px; background: rgba(255,255,255,.035); }
        .generated-sidebar-note-label { color: var(--g-saffron); font-family: var(--app-font-mono); font-size: 9px; letter-spacing: .12em; text-transform: uppercase; }
        .generated-sidebar-note p { margin: 8px 0 0; color: rgba(238,242,232,.7); font-size: 11px; line-height: 1.45; }
        .generated-operator { border-top: 1px solid rgba(238,242,232,.13); padding: 17px 10px 0; display: flex; align-items: center; gap: 10px; }
        .generated-avatar { width: 31px; height: 31px; border-radius: 50%; background: var(--g-saffron); color: var(--g-ink); display: grid; place-items: center; font-family: var(--app-font-mono); font-weight: 700; font-size: 10px; }
        .generated-operator strong, .generated-operator span { display: block; }
        .generated-operator strong { font-size: 11px; }
        .generated-operator span { color: rgba(238,242,232,.47); font-size: 10px; margin-top: 3px; }
        .generated-main { min-width: 0; flex: 1; }
        .generated-topbar { height: 70px; padding: 0 37px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--g-line); background: rgba(245,241,231,.82); backdrop-filter: blur(12px); }
        .generated-topbar-context { display: flex; align-items: center; gap: 10px; }
        .generated-topbar-kicker { color: var(--g-ink-soft); font-family: var(--app-font-mono); text-transform: uppercase; letter-spacing: .13em; font-size: 9px; }
        .generated-topbar-separator { width: 3px; height: 3px; border-radius: 50%; background: var(--g-saffron); }
        .generated-topbar-shift { color: var(--g-ink); font-size: 11px; font-weight: 700; }
        .generated-topbar-actions { display: flex; align-items: center; gap: 11px; position: relative; }
        .generated-connection { display: flex; align-items: center; gap: 7px; border: 1px solid var(--g-line); border-radius: 999px; background: var(--g-card); color: var(--g-ink-soft); padding: 7px 11px; font-size: 10px; }
        .generated-online { width: 7px; height: 7px; border-radius: 50%; background: #4c9d76; box-shadow: 0 0 0 3px rgba(76,157,118,.13); }
        .generated-icon-btn { width: 33px; height: 33px; border: 1px solid var(--g-line); border-radius: 8px; background: var(--g-card); color: var(--g-ink-soft); display: grid; place-items: center; transition: border-color .2s ease, color .2s ease, transform .2s ease; }
        .generated-icon-btn:hover { border-color: var(--g-saffron); color: var(--g-ink); transform: translateY(-1px); }
        .generated-icon-btn:focus-visible, .generated-btn:focus-visible, .generated-filter:focus-visible, .generated-search input:focus-visible, .generated-modal input:focus-visible { outline: 2px solid var(--g-saffron); outline-offset: 2px; }
        .generated-notification-popover { position: absolute; z-index: 4; right: 0; top: 46px; width: 248px; padding: 14px; border: 1px solid var(--g-line); border-radius: 10px; background: var(--g-card); box-shadow: 0 14px 32px rgba(25,59,56,.15); animation: generated-rise .22s ease both; }
        .generated-notification-popover strong { display: block; font-size: 12px; }
        .generated-notification-popover p { color: var(--g-ink-soft); font-size: 11px; line-height: 1.45; margin: 6px 0 11px; }
        .generated-notification-popover button { padding: 0; border: 0; background: none; color: var(--g-teal); font-size: 10px; font-weight: 800; }
        .generated-content { max-width: 1450px; padding: 31px 37px 58px; margin: 0 auto; }
        .generated-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 23px; }
        .generated-heading-kicker { display: flex; align-items: center; gap: 8px; color: var(--g-teal); font-family: var(--app-font-mono); font-size: 9px; letter-spacing: .15em; text-transform: uppercase; }
        .generated-heading-kicker span { width: 22px; height: 1px; background: var(--g-saffron); }
        .generated-title { margin: 9px 0 7px; font-family: var(--app-font-serif); font-size: clamp(30px, 3vw, 44px); line-height: .98; letter-spacing: -.065em; }
        .generated-description { max-width: 555px; color: var(--g-ink-soft); font-size: 12px; line-height: 1.6; margin: 0; }
        .generated-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 7px; border: 1px solid transparent; padding: 10px 14px; font-size: 11px; font-weight: 800; transition: transform .2s ease, box-shadow .2s ease, background .2s ease; white-space: nowrap; }
        .generated-btn:hover { transform: translateY(-2px); box-shadow: 0 7px 13px rgba(25,59,56,.12); }
        .generated-btn-primary { background: var(--g-saffron); color: var(--g-ink); }
        .generated-btn-primary:hover { background: #eab146; }
        .generated-btn-secondary { border-color: var(--g-line); background: var(--g-card); color: var(--g-ink); }
        .generated-metrics { display: grid; grid-template-columns: 1.2fr repeat(3, 1fr); gap: 10px; margin-bottom: 23px; }
        .generated-metric { min-height: 119px; padding: 16px 17px 14px; border: 1px solid var(--g-line); border-radius: 10px; background: var(--g-card); position: relative; overflow: hidden; animation: generated-rise .4s ease both; }
        .generated-metric:nth-child(2) { animation-delay: .05s; } .generated-metric:nth-child(3) { animation-delay: .1s; } .generated-metric:nth-child(4) { animation-delay: .15s; }
        .generated-metric::after { content: ''; width: 80px; height: 80px; border: 1px solid currentColor; opacity: .12; position: absolute; right: -32px; bottom: -37px; border-radius: 50%; }
        .generated-metric-sun { background: #f9edc9; border-color: #ead7a1; color: var(--g-saffron-dark); }
        .generated-metric-blue { color: var(--g-blue); } .generated-metric-orange { color: var(--g-coral); } .generated-metric-green { color: var(--g-teal); }
        .generated-metric-top { display: flex; align-items: center; justify-content: space-between; color: var(--g-ink-soft); font-size: 10px; font-weight: 800; }
        .generated-metric-sun .generated-metric-top { color: var(--g-saffron-dark); }
        .generated-metric-icon { width: 24px; height: 24px; display: grid; place-items: center; border-radius: 7px; background: rgba(255,255,255,.55); color: currentColor; }
        .generated-metric-value { color: var(--g-ink); font-family: var(--app-font-serif); font-size: 35px; line-height: 1; letter-spacing: -.08em; margin-top: 14px; }
        .generated-metric-detail { color: var(--g-ink-soft); font-family: var(--app-font-mono); font-size: 9px; margin-top: 11px; }
        .generated-metric-sun .generated-metric-detail { color: var(--g-saffron-dark); }
        .generated-layout { display: grid; grid-template-columns: minmax(0, 1.42fr) minmax(290px, .8fr); gap: 12px; }
        .generated-panel { border: 1px solid var(--g-line); border-radius: 10px; background: rgba(255,253,248,.92); overflow: hidden; }
        .generated-panel-header { min-height: 70px; display: flex; align-items: center; justify-content: space-between; gap: 14px; border-bottom: 1px solid var(--g-line); padding: 14px 17px; }
        .generated-panel-eyebrow { color: var(--g-ink-soft); font-family: var(--app-font-mono); text-transform: uppercase; letter-spacing: .12em; font-size: 9px; }
        .generated-panel-title { display: block; font-family: var(--app-font-serif); font-size: 16px; letter-spacing: -.04em; margin-top: 4px; }
        .generated-panel-caption { color: var(--g-ink-soft); font-size: 10px; margin-top: 4px; }
        .generated-panel-actions { display: flex; gap: 8px; align-items: center; }
        .generated-search { display: flex; align-items: center; gap: 7px; border: 1px solid var(--g-line); border-radius: 7px; background: var(--g-paper); padding: 0 9px; color: var(--g-ink-soft); }
        .generated-search input { width: 115px; border: 0; outline: 0; background: transparent; padding: 7px 0; color: var(--g-ink); font: inherit; font-size: 10px; }
        .generated-search input::placeholder { color: #81918b; }
        .generated-panel-body { padding: 9px 17px 15px; }
        .generated-feed-filter { display: flex; align-items: center; gap: 5px; padding: 6px 0 8px; overflow-x: auto; }
        .generated-filter { border: 0; background: transparent; color: var(--g-ink-soft); padding: 5px 8px; border-radius: 5px; font-family: var(--app-font-mono); font-size: 9px; white-space: nowrap; }
        .generated-filter:hover { color: var(--g-ink); background: var(--g-paper); } .generated-filter.active { background: #e8f0e6; color: var(--g-teal); font-weight: 700; }
        .generated-activity-item { display: grid; grid-template-columns: 27px minmax(0,1fr) auto; align-items: start; gap: 11px; padding: 12px 0; border-top: 1px solid rgba(223,229,217,.82); animation: generated-fade .38s ease both; }
        .generated-activity-item:first-of-type { border-top: 0; }
        .generated-activity-marker { width: 27px; height: 27px; display: grid; place-items: center; border-radius: 8px; background: #e8f0e6; color: var(--g-teal); }
        .generated-activity-main { min-width: 0; }
        .generated-activity-title { color: var(--g-ink); font-size: 11px; font-weight: 800; }
        .generated-reference { color: var(--g-teal); font-family: var(--app-font-mono); font-size: 10px; }
        .generated-activity-note { color: var(--g-ink-soft); font-size: 10px; margin: 4px 0 0; }
        .generated-activity-meta { display: flex; align-items: center; gap: 8px; margin-top: 6px; color: #82918b; font-family: var(--app-font-mono); font-size: 9px; }
        .generated-activity-meta span { display: inline-flex; align-items: center; gap: 3px; }
        .generated-activity-right { text-align: right; }
        .generated-status { display: inline-flex; align-items: center; gap: 5px; border-radius: 999px; padding: 5px 7px; font-family: var(--app-font-mono); font-size: 8px; white-space: nowrap; }
        .generated-status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
        .generated-status-pending { color: #a56d0a; background: #fff1c9; } .generated-status-assigned { color: #527187; background: #e5eef3; }
        .generated-status-picked_up { color: #b45f43; background: #fae8df; } .generated-status-delivered { color: #347553; background: #e1f0e6; }
        .generated-activity-time { color: #82918b; font-family: var(--app-font-mono); font-size: 9px; margin-top: 7px; }
        .generated-empty { text-align: center; padding: 34px 10px; color: var(--g-ink-soft); font-size: 11px; }
        .generated-empty strong { display: block; color: var(--g-ink); margin-bottom: 4px; }
        .generated-pulse { padding: 17px; }
        .generated-pulse-intro { display: flex; justify-content: space-between; gap: 12px; align-items: start; }
        .generated-pulse-number { color: var(--g-teal); font-family: var(--app-font-serif); font-size: 40px; line-height: .9; letter-spacing: -.09em; }
        .generated-pulse-intro p { max-width: 130px; color: var(--g-ink-soft); font-size: 10px; line-height: 1.45; text-align: right; margin: 1px 0 0; }
        .generated-queue { display: grid; gap: 7px; margin-top: 21px; }
        .generated-queue-row { display: grid; grid-template-columns: 9px 28px minmax(0,1fr) auto; align-items: center; gap: 9px; padding: 10px; border-radius: 7px; background: var(--g-paper); transition: background .2s ease, transform .2s ease; }
        .generated-queue-row:hover { background: #eaf0e7; transform: translateX(2px); }
        .generated-queue-dot { width: 7px; height: 7px; border-radius: 50%; }
        .generated-queue-dot.pending { background: var(--g-saffron); } .generated-queue-dot.assigned { background: var(--g-blue); } .generated-queue-dot.picked_up { background: var(--g-coral); }
        .generated-queue-count { font-family: var(--app-font-mono); color: var(--g-ink); font-size: 16px; }
        .generated-queue-copy { font-size: 10px; font-weight: 800; } .generated-queue-copy span { display: block; color: var(--g-ink-soft); font-size: 9px; font-weight: 500; margin-top: 2px; }
        .generated-queue-arrow { color: #9aaba4; }
        .generated-health { border-top: 1px solid var(--g-line); margin-top: 18px; padding-top: 17px; }
        .generated-health-head { display: flex; align-items: center; justify-content: space-between; color: var(--g-ink-soft); font-family: var(--app-font-mono); font-size: 9px; text-transform: uppercase; letter-spacing: .1em; }
        .generated-health-score { display: flex; align-items: end; justify-content: space-between; margin-top: 15px; }
        .generated-health-score strong { font-family: var(--app-font-serif); font-size: 28px; letter-spacing: -.07em; }
        .generated-health-score span { color: var(--g-teal); font-size: 10px; font-weight: 800; margin-bottom: 4px; }
        .generated-health-rail { height: 5px; border-radius: 8px; background: #e8ede5; margin-top: 9px; overflow: hidden; }
        .generated-health-rail i { display: block; width: 94%; height: 100%; border-radius: inherit; background: var(--g-teal); animation: generated-width .8s ease both; }
        .generated-health-note { color: var(--g-ink-soft); font-size: 10px; line-height: 1.45; margin: 11px 0 15px; }
        .generated-wide-btn { width: 100%; }
        .generated-modal-backdrop { position: fixed; inset: 0; z-index: 8; display: grid; place-items: center; padding: 18px; background: rgba(25,59,56,.34); backdrop-filter: blur(5px); animation: generated-fade .2s ease both; }
        .generated-modal { width: min(440px, 100%); border: 1px solid var(--g-line); border-radius: 12px; background: var(--g-card); box-shadow: 0 24px 60px rgba(25,59,56,.22); animation: generated-rise .25s ease both; overflow: hidden; }
        .generated-modal-head { display: flex; align-items: start; justify-content: space-between; padding: 19px 20px 15px; border-bottom: 1px solid var(--g-line); }
        .generated-modal-head h2 { margin: 0; font-family: var(--app-font-serif); font-size: 20px; letter-spacing: -.04em; }
        .generated-modal-head p { color: var(--g-ink-soft); font-size: 10px; margin: 5px 0 0; }
        .generated-modal-close { border: 0; background: transparent; color: var(--g-ink-soft); padding: 2px; }
        .generated-modal form { display: grid; gap: 13px; padding: 19px 20px 20px; }
        .generated-modal label { display: grid; gap: 6px; color: var(--g-ink-soft); font-family: var(--app-font-mono); font-size: 9px; text-transform: uppercase; letter-spacing: .1em; }
        .generated-modal input { border: 1px solid var(--g-line); border-radius: 7px; outline: 0; padding: 10px; background: var(--g-paper); color: var(--g-ink); font: inherit; font-size: 11px; }
        .generated-modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 5px; }
        .generated-toast { position: fixed; z-index: 9; right: 22px; bottom: 22px; border: 1px solid #c7d9c9; border-radius: 8px; padding: 11px 13px; background: #e7f1e6; color: var(--g-teal); box-shadow: 0 8px 22px rgba(25,59,56,.13); font-size: 11px; font-weight: 800; animation: generated-rise .25s ease both; }
        @keyframes generated-rise { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes generated-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes generated-width { from { transform: scaleX(0); transform-origin: left; } to { transform: scaleX(1); transform-origin: left; } }
        @media (max-width: 920px) {
          .generated-sidebar { width: 210px; flex-basis: 210px; }
          .generated-content, .generated-topbar { padding-left: 23px; padding-right: 23px; }
          .generated-metrics { grid-template-columns: repeat(2, 1fr); }
          .generated-layout { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .generated-sidebar { display: none; }
          .generated-topbar { height: 62px; padding: 0 17px; }
          .generated-connection { display: none; }
          .generated-content { padding: 25px 16px 42px; }
          .generated-heading { align-items: start; flex-direction: column; gap: 16px; }
          .generated-heading .generated-btn { width: 100%; }
          .generated-metrics { gap: 8px; }
          .generated-metric { min-height: 108px; padding: 13px; }
          .generated-metric-value { font-size: 30px; margin-top: 11px; }
          .generated-panel-header { align-items: start; flex-direction: column; }
          .generated-panel-actions { width: 100%; }
          .generated-search { flex: 1; }
          .generated-search input { width: 100%; }
          .generated-activity-item { grid-template-columns: 27px minmax(0,1fr); }
          .generated-activity-right { grid-column: 2; display: flex; align-items: center; gap: 9px; text-align: left; }
          .generated-activity-time { margin-top: 0; }
        }
      `}</style>

      <div className="generated-shell">
        <aside className="generated-sidebar">
          <a className="generated-brand" href="#overview" onClick={() => handleNav('overview')}>
            <span className="generated-brand-mark">R</span>
            <span><span className="generated-brand-name">RiderLink</span><span className="generated-brand-sub">operations desk</span></span>
          </a>
          <div className="generated-nav-label">Workspace</div>
          <nav className="generated-nav" aria-label="Main navigation">
            {navItems.map(({ key, label, icon: Icon }) => (
              <button key={key} className={activeNav === key ? 'active' : ''} type="button" onClick={() => handleNav(key)}>
                <Icon /><span>{label}</span>
              </button>
            ))}
          </nav>
          <div className="generated-sidebar-note">
            <div className="generated-sidebar-note-label">Desk note</div>
            <p>Morning volume is steady. Keep Parklands and Lavington close.</p>
          </div>
          <div className="generated-operator">
            <div className="generated-avatar">AM</div>
            <div><strong>Amara Mwangi</strong><span>Dispatcher · Nairobi</span></div>
          </div>
        </aside>

        <main className="generated-main">
          <header className="generated-topbar">
            <div className="generated-topbar-context">
              <span className="generated-topbar-kicker">Thursday · 06 June 2024</span>
              <span className="generated-topbar-separator" />
              <span className="generated-topbar-shift">Morning shift</span>
            </div>
            <div className="generated-topbar-actions">
              <div className="generated-connection"><span className="generated-online" /> Connected</div>
              <button className="generated-icon-btn" type="button" aria-label="Notifications" onClick={() => setNotificationsOpen((open) => !open)}>
                <Bell size={15} />
              </button>
              {isNotificationsOpen && (
                <div className="generated-notification-popover">
                  <strong>Desk is in good shape</strong>
                  <p>Six requests still need a rider. No connection issues reported.</p>
                  <button type="button" onClick={() => { setNotificationsOpen(false); setSelectedStatus('pending'); }}>Review pending requests <ArrowRight size={11} /></button>
                </div>
              )}
            </div>
          </header>

          <div className="generated-content">
            <section className="generated-heading">
              <div>
                <div className="generated-heading-kicker"><span /> Operations / Today</div>
                <h1 className="generated-title">Keep the day moving.</h1>
                <p className="generated-description">A clear view of every handoff, from the first request to the customer&apos;s doorstep.</p>
              </div>
              <button className="generated-btn generated-btn-primary" type="button" onClick={() => setDeliveryOpen(true)}>
                <Plus size={15} /> New delivery
              </button>
            </section>

            <section className="generated-metrics" aria-label="Delivery summary">
              <MetricCard label="Deliveries today" value={summary.totalToday} detail="Across Nairobi · 06 Jun" icon={Package} tone="sun" />
              <MetricCard label="Waiting assignment" value={summary.pending} detail="Needs attention now" icon={Clock3} tone="blue" />
              <MetricCard label="On the road" value={summary.pickedUp + summary.assigned} detail="5 assigned · 8 picked up" icon={Truck} tone="orange" />
              <MetricCard label="Delivered" value={summary.delivered} detail="Closed handoffs" icon={CheckCircle2} tone="green" />
            </section>

            <div className="generated-layout">
              <section className="generated-panel">
                <header className="generated-panel-header">
                  <div>
                    <div className="generated-panel-eyebrow">Dispatch feed</div>
                    <span className="generated-panel-title">Live activity</span>
                    <div className="generated-panel-caption">The latest handoffs in your desk</div>
                  </div>
                  <div className="generated-panel-actions">
                    <label className="generated-search" aria-label="Search activity">
                      <Search size={13} />
                      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search desk" />
                    </label>
                    <button className="generated-icon-btn" type="button" aria-label="Activity filters" onClick={() => announce('Use the status filters to narrow the feed')}><SlidersHorizontal size={14} /></button>
                  </div>
                </header>
                <div className="generated-panel-body">
                  <div className="generated-feed-filter" aria-label="Filter activity">
                    {(['all', 'pending', 'assigned', 'picked_up', 'delivered'] as const).map((status) => (
                      <button key={status} type="button" className={`generated-filter ${selectedStatus === status ? 'active' : ''}`} onClick={() => setSelectedStatus(status)}>
                        {status === 'all' ? 'All updates' : statusLabels[status]}
                      </button>
                    ))}
                  </div>
                  {visibleActivity.length > 0 ? visibleActivity.map((item) => (
                    <div className="generated-activity-item" key={item.id}>
                      <div className="generated-activity-marker"><Activity size={13} /></div>
                      <div className="generated-activity-main">
                        <div className="generated-activity-title">{item.actorName} · <span className="generated-reference">{item.reference}</span></div>
                        <p className="generated-activity-note">{item.note}</p>
                        <div className="generated-activity-meta"><span><MapPin size={10} /> {item.area}</span><span><Command size={9} /> Desk update</span></div>
                      </div>
                      <div className="generated-activity-right"><StatusBadge status={item.status} /><div className="generated-activity-time">{item.time}</div></div>
                    </div>
                  )) : (
                    <div className="generated-empty"><strong>No matching handoffs</strong>Try another status or search term.</div>
                  )}
                </div>
              </section>

              <section className="generated-panel">
                <header className="generated-panel-header">
                  <div>
                    <div className="generated-panel-eyebrow">Attention map</div>
                    <span className="generated-panel-title">Desk pulse</span>
                    <div className="generated-panel-caption">Where attention is needed</div>
                  </div>
                  <Gauge size={17} color="var(--g-teal)" />
                </header>
                <div className="generated-pulse">
                  <div className="generated-pulse-intro">
                    <div><div className="generated-pulse-number">{summary.pending + summary.assigned}</div><div className="generated-panel-caption">open handoffs</div></div>
                    <p>Nothing is slipping through the cracks. Keep an eye on the next rider handoff.</p>
                  </div>
                  <div className="generated-queue">
                    <button className="generated-queue-row" type="button" onClick={() => { setSelectedStatus('pending'); announce('Showing requests waiting for a rider'); }}>
                      <span className="generated-queue-dot pending" /><span className="generated-queue-count">{summary.pending}</span><span className="generated-queue-copy">Need a rider<span>Pending assignment</span></span><ChevronRight className="generated-queue-arrow" size={14} />
                    </button>
                    <button className="generated-queue-row" type="button" onClick={() => { setSelectedStatus('assigned'); announce('Showing assigned deliveries'); }}>
                      <span className="generated-queue-dot assigned" /><span className="generated-queue-count">{summary.assigned}</span><span className="generated-queue-copy">Assigned<span>Awaiting pick-up</span></span><ChevronRight className="generated-queue-arrow" size={14} />
                    </button>
                    <button className="generated-queue-row" type="button" onClick={() => { setSelectedStatus('picked_up'); announce('Showing riders on the road'); }}>
                      <span className="generated-queue-dot picked_up" /><span className="generated-queue-count">{summary.pickedUp}</span><span className="generated-queue-copy">In transit<span>Riders on the road</span></span><ChevronRight className="generated-queue-arrow" size={14} />
                    </button>
                  </div>
                  <div className="generated-health">
                    <div className="generated-health-head"><span>Rider health</span><ShieldCheck size={13} /></div>
                    <div className="generated-health-score"><strong>{summary.activeRiders} active riders</strong><span>{summary.onTimeRate}% on time</span></div>
                    <div className="generated-health-rail"><i /></div>
                    <p className="generated-health-note">Riders are moving smoothly across Westlands, Kilimani and Ngara.</p>
                    <button className="generated-btn generated-btn-secondary generated-wide-btn" type="button" onClick={() => { handleNav('riders'); announce('Rider roster selected'); }}>Open rider roster <ArrowRight size={13} /></button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {isDeliveryOpen && (
        <div className="generated-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeliveryOpen(false); }}>
          <div className="generated-modal" role="dialog" aria-modal="true" aria-labelledby="new-delivery-title">
            <div className="generated-modal-head">
              <div><h2 id="new-delivery-title">Start a delivery</h2><p>Give the desk enough detail for a clean handoff.</p></div>
              <button className="generated-modal-close" type="button" aria-label="Close new delivery form" onClick={() => setDeliveryOpen(false)}><X size={17} /></button>
            </div>
            <form onSubmit={(event) => { event.preventDefault(); setDeliveryOpen(false); announce('Delivery request RL-2049 added to the desk'); }}>
              <label>Customer or order reference<input required placeholder="e.g. Kifaru Home · Order 4821" /></label>
              <label>Pickup point<input required placeholder="e.g. Westlands store" /></label>
              <label>Drop-off area<input required placeholder="e.g. Kilimani" /></label>
              <div className="generated-modal-actions">
                <button className="generated-btn generated-btn-secondary" type="button" onClick={() => setDeliveryOpen(false)}>Cancel</button>
                <button className="generated-btn generated-btn-primary" type="submit"><Zap size={13} /> Add to desk</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {toast && <div className="generated-toast" role="status">{toast}</div>}
    </div>
  );
}

export default Generated;