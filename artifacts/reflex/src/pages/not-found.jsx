import { Link } from 'wouter';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return <div className="empty-state" style={{ minHeight: 'calc(100dvh - 70px)', display: 'grid', placeItems: 'center' }}><div><div className="empty-icon"><Compass size={21} /></div><div className="eyebrow">Route not found · 404</div><h1 className="page-title">This stop is not on the route.</h1><p className="page-description" style={{ margin: '0 auto 18px' }}>The page may have moved, but the operations desk is still right where you left it.</p><Link href="/" className="btn btn-primary" data-testid="link-back-overview"><ArrowLeft size={14} /> Back to overview</Link></div></div>;
}