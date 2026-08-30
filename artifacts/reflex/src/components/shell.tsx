import { useState, type ReactNode } from 'react';
import { Bell, ClipboardList, LayoutDashboard, Menu, Settings, Bike, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useHealthCheck } from '@workspace/api-client-react';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/deliveries', label: 'Deliveries', icon: ClipboardList },
  { href: '/riders', label: 'Riders', icon: Bike },
  { href: '/rider', label: 'Rider mode', icon: Bike },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const health = useHealthCheck();
  const active = (href: string) => href === '/' ? location === '/' : location.startsWith(href);
  return (
    <div className="reflex-shell">
      <aside className={`reflex-sidebar ${open ? 'open' : ''}`}>
        <Link href="/" className="brand-mark" data-testid="link-brand" onClick={() => setOpen(false)}>
          <span className="brand-symbol">R</span>
          <span><span className="brand-name">reflex</span><span className="brand-sub">operations desk</span></span>
        </Link>
        <div className="nav-label">Workspace</div>
        <nav aria-label="Main navigation">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`nav-link ${active(href) ? 'active' : ''}`} data-testid={`link-nav-${label.toLowerCase().replace(' ', '-')}`} onClick={() => setOpen(false)}>
              <Icon /><span>{label}</span>
            </Link>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="mobile-menu" aria-label="Open navigation" data-testid="button-open-navigation" onClick={() => setOpen(true)}><Menu size={21} /></button>
            <div><div className="topbar-kicker">Thursday · 06 June 2024</div><div className="topbar-title">Good morning, Amara</div></div>
          </div>
          <div className="topbar-actions">
            <div className="connection-pill" data-testid="status-connection"><span className={`online-dot ${health.isError ? 'offline-dot' : ''}`} /> {health.isLoading ? 'Checking desk' : health.isError ? 'Limited connection' : 'Connected'}</div>
            <button className="icon-btn" aria-label="Notifications" data-testid="button-notifications"><Bell size={15} /></button>
            {open && <button className="icon-btn" aria-label="Close navigation" data-testid="button-close-navigation" onClick={() => setOpen(false)}><X size={15} /></button>}
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = { pending: 'Pending', assigned: 'Assigned', picked_up: 'Picked up', delivered: 'Delivered', cancelled: 'Cancelled' };
  return <span className={`status-badge ${status}`} data-testid={`status-badge-${status}`}><span className={`status-dot ${status}`} />{labels[status] ?? status}</span>;
}

export function formatTime(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
}

export function initials(name?: string | null) {
  return (name ?? 'Unassigned').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <div className="error-state" data-testid="state-error">We could not reach the desk right now. Check your connection and try again. <button className="btn btn-danger" data-testid="button-retry" onClick={onRetry} style={{ marginLeft: 8, padding: '6px 9px' }}>Retry</button></div>;
}

export function LoadingRows({ count = 4 }: { count?: number }) {
  return <div data-testid="state-loading">{Array.from({ length: count }).map((_, index) => <div key={index} className="skeleton" style={{ height: 62, marginBottom: 1 }} />)}</div>;
}