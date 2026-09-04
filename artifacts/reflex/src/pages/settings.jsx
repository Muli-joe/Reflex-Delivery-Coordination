import { useEffect, useState } from 'react';
import { Check, ChevronRight, ShieldCheck, Smartphone, Store, Users } from 'lucide-react';
import { useUser } from '@clerk/react';
import { getUserDisplayName, initials } from '@/components/shell';

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [alerts, setAlerts] = useState(true);
  const [sound, setSound] = useState(true);
  const [business, setBusiness] = useState('Mwangaza Mini Mart');
  const { user } = useUser();
  const userName = getUserDisplayName(user);

  useEffect(() => {
    const raw = localStorage.getItem('reflex-settings');
    if (raw) {
      const value = JSON.parse(raw);
      setAlerts(value.alerts ?? true);
      setSound(value.sound ?? true);
      setBusiness(value.business ?? 'Mwangaza Mini Mart');
    }
  }, []);

  const save = () => {
    localStorage.setItem('reflex-settings', JSON.stringify({ alerts, sound, business }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="page-wrap">
      <div className="page-heading"><div><div className="eyebrow">Workspace / Settings</div><h1 className="page-title">A desk that fits your shop.</h1><p className="page-description">Keep the team details and field preferences that make each handoff feel familiar.</p></div><button className="btn btn-primary" onClick={save} data-testid="button-save-settings">{saved ? <><Check size={14} /> Saved</> : 'Save changes'}</button></div>
      <div className="settings-grid">
        <section className="panel"><div className="panel-head"><div><div className="panel-title">Business profile</div><div className="panel-note">Shown to your internal team</div></div><Store size={16} color="hsl(var(--muted-foreground))" /></div><div className="panel-body"><div className="form-grid"><div className="form-field"><label htmlFor="business-name">Business name</label><input id="business-name" className="input" value={business} onChange={(event) => setBusiness(event.target.value)} data-testid="input-business-name" /></div><div className="form-field"><label htmlFor="business-location">Base location</label><input id="business-location" className="input" defaultValue="Nairobi, Kenya" data-testid="input-business-location" /></div><div className="form-field"><label htmlFor="business-phone">Dispatch phone</label><input id="business-phone" className="input" defaultValue="+254 700 000 000" data-testid="input-business-phone" /></div></div></div></section>
        <section className="panel"><div className="panel-head"><div><div className="panel-title">Field preferences</div><div className="panel-note">Built for the moving parts</div></div><Smartphone size={16} color="hsl(var(--muted-foreground))" /></div><div className="panel-body"><div className="setting-row"><div className="setting-copy"><strong>Delivery movement alerts</strong><p>Let dispatchers know when a rider updates a stop.</p></div><button className={`toggle ${alerts ? 'on' : ''}`} onClick={() => setAlerts(!alerts)} aria-label="Toggle delivery alerts" data-testid="toggle-delivery-alerts"><span /></button></div><div className="setting-row"><div className="setting-copy"><strong>Rider confirmation sound</strong><p>A small cue when an offline update is queued.</p></div><button className={`toggle ${sound ? 'on' : ''}`} onClick={() => setSound(!sound)} aria-label="Toggle confirmation sound" data-testid="toggle-confirmation-sound"><span /></button></div><div className="setting-row"><div className="setting-copy"><strong>Offline mode</strong><p>Always enabled for field updates. Nothing is lost when signal drops.</p></div><ShieldCheck size={18} color="hsl(var(--primary))" /></div></div></section>
        <section className="panel"><div className="panel-head"><div><div className="panel-title">Team access</div><div className="panel-note">3 people can access this desk</div></div><Users size={16} color="hsl(var(--muted-foreground))" /></div><div className="panel-body"><div className="setting-row"><div className="operator-row"><div className="operator-avatar">{initials(userName)}</div><div className="setting-copy"><strong>{userName}</strong><p>Owner · Nairobi</p></div></div><span className="status-badge delivered">You</span></div><div className="setting-row"><div className="operator-row"><div className="operator-avatar" style={{ background: 'hsl(var(--secondary))', color: 'hsl(var(--foreground))' }}>JO</div><div className="setting-copy"><strong>Jabali Otieno</strong><p>Dispatcher</p></div></div><ChevronRight size={15} color="hsl(var(--muted-foreground))" /></div><button className="btn btn-secondary" style={{ width: '100%', marginTop: 16 }} onClick={() => window.alert('Team invites are managed by your account owner.')} data-testid="button-manage-team">Manage team</button></div></section>
      </div>
      {saved && <div className="toast-note" data-testid="toast-settings-saved">Settings saved for this desk.</div>}
    </div>
  );
}