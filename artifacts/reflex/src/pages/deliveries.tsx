import { useEffect, useState } from 'react';
import { Check, ChevronRight, MapPin, Phone, Plus, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAssignDeliveryRequest, useCancelDeliveryRequest, useGetDeliveryRequest, useListDeliveryRequests, useListRiders, useUpdateDeliveryStatus, getGetDashboardSummaryQueryKey, getGetDeliveryRequestQueryKey, getListActivityQueryKey, getListRidersQueryKey } from '@workspace/api-client-react';
import type { DeliveryStatus, DeliveryRequestDetail, Rider } from '@workspace/api-client-react';
import { NewDeliveryDialog } from '@/components/delivery-dialog';
import { ErrorState, LoadingRows, StatusBadge, formatDate, formatTime } from '@/components/shell';

export default function Deliveries() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const deliveries = useListDeliveryRequests({
    search: search || undefined,
    status: (status || undefined) as DeliveryStatus | undefined,
    limit: 100,
  });
  const queryClient = useQueryClient();
  const selected = useGetDeliveryRequest(selectedId ?? '', {
    query: {
      enabled: Boolean(selectedId),
      queryKey: getGetDeliveryRequestQueryKey(selectedId ?? ''),
    },
  });
  const riders = useListRiders();

  useEffect(() => {
    if (selectedId && deliveries.data && !deliveries.data.some((item) => item.id === selectedId)) {
      setSelectedId(null);
    }
  }, [deliveries.data, selectedId]);

  const refresh = () => {
    queryClient.invalidateQueries({
      predicate: ({ queryKey }) => queryKey[0] === '/api/v1/delivery-requests',
    });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListActivityQueryKey({ limit: 8 }) });
    queryClient.invalidateQueries({ queryKey: getListRidersQueryKey() });
  };

  return (
    <div className="page-wrap">
      <div className="page-heading">
        <div>
          <div className="eyebrow">Operations / Queue</div>
          <h1 className="page-title">Deliveries</h1>
          <p className="page-description">Search every request, see who has it, and move the next handoff forward.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setNewOpen(true)} data-testid="button-new-delivery">
          <Plus size={15} /> New delivery
        </button>
      </div>

      <div className="panel">
        <div className="table-tools">
          <div className="search-wrap">
            <input className="input" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reference, customer or address" data-testid="input-search-deliveries" />
          </div>
          <select className="input filter-select" value={status} onChange={(event) => setStatus(event.target.value)} data-testid="select-delivery-status">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="picked_up">Picked up</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {deliveries.isError ? (
          <div style={{ padding: 18 }}><ErrorState onRetry={() => deliveries.refetch()} /></div>
        ) : deliveries.isLoading ? (
          <LoadingRows />
        ) : deliveries.data?.length ? (
          <div className="delivery-list">
            <div className="delivery-row table-head"><div>Request</div><div>Customer</div><div>Destination</div><div>Rider</div><div>Status</div><div /></div>
            {deliveries.data.map((item) => (
              <button className={`delivery-row ${selectedId === item.id ? 'selected' : ''}`} key={item.id} onClick={() => setSelectedId(item.id)} data-testid={`row-delivery-${item.id}`}>
                <div className="delivery-ref">{item.reference}<span className="delivery-sub">{formatDate(item.createdAt)}</span></div>
                <div className="delivery-customer">{item.customerName}<span className="delivery-sub">{item.customerPhone}</span></div>
                <div className="delivery-sub">{item.address}</div>
                <div className="delivery-sub">{item.riderName || 'Unassigned'}</div>
                <div><StatusBadge status={item.status} /></div>
                <ChevronRight size={15} color="hsl(var(--muted-foreground))" />
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon"><MapPin size={19} /></div>
            <strong>No deliveries found</strong>
            <p>Try another search, or create a new request for the queue.</p>
            <button className="btn btn-primary" onClick={() => setNewOpen(true)} data-testid="button-empty-new-delivery">Create first delivery</button>
          </div>
        )}
      </div>

      {selectedId && (
        <DeliveryDrawer
          id={selectedId}
          detail={selected.data}
          isLoading={selected.isLoading}
          isError={selected.isError}
          riders={riders.data ?? []}
          onClose={() => setSelectedId(null)}
          onRefresh={refresh}
        />
      )}
      {newOpen && <NewDeliveryDialog onClose={() => setNewOpen(false)} />}
    </div>
  );
}

function DeliveryDrawer({
  id,
  detail,
  isLoading,
  isError,
  riders,
  onClose,
  onRefresh,
}: {
  id: string;
  detail?: DeliveryRequestDetail;
  isLoading: boolean;
  isError: boolean;
  riders: Rider[];
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [riderId, setRiderId] = useState('');
  const queryClient = useQueryClient();
  const assign = useAssignDeliveryRequest();
  const cancel = useCancelDeliveryRequest();
  const update = useUpdateDeliveryStatus();
  const currentDetail = detail?.id === id ? detail : undefined;

  useEffect(() => {
    setRiderId(currentDetail?.riderId ?? '');
  }, [currentDetail?.id, currentDetail?.riderId]);

  const finish = () => {
    queryClient.invalidateQueries({ queryKey: getGetDeliveryRequestQueryKey(id) });
    onRefresh();
  };

  const move = (next: 'assigned' | 'picked_up') => {
    if (!currentDetail) return;
    update.mutate({
      id,
      data: { status: next, version: currentDetail.version, clientEventId: `desk-${crypto.randomUUID()}` },
    }, { onSuccess: finish });
  };

  return (
    <div className="drawer" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <aside className="drawer-card">
        <div className="drawer-head">
          <div>
            {currentDetail ? (
              <>
                <div className="detail-ref">{currentDetail.reference}</div>
                <div className="detail-title">{currentDetail.customerName}</div>
                <StatusBadge status={currentDetail.status} />
              </>
            ) : (
              <div className="detail-title">Loading delivery…</div>
            )}
          </div>
          <button className="icon-btn" onClick={onClose} data-testid="button-close-delivery-detail"><X size={15} /></button>
        </div>

        <div className="drawer-body">
          {isLoading || !currentDetail ? (
            isError ? <ErrorState onRetry={onRefresh} /> : <LoadingRows count={5} />
          ) : (
            <>
              <div className="detail-grid">
                <div><div className="detail-label">Drop-off</div><div className="detail-value"><MapPin size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />{currentDetail.address}</div></div>
                <div><div className="detail-label">Customer</div><div className="detail-value"><Phone size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />{currentDetail.customerPhone}</div></div>
                <div><div className="detail-label">Item</div><div className="detail-value">{currentDetail.itemDescription}</div></div>
                <div><div className="detail-label">Created</div><div className="detail-value">{formatDate(currentDetail.createdAt)} · {formatTime(currentDetail.createdAt)}</div></div>
              </div>

              <div className="detail-section">
                <div className="detail-section-title">Assignment</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select className="input" value={riderId} onChange={(event) => setRiderId(event.target.value)} data-testid="select-assign-rider">
                    <option value="">Choose a rider</option>
                    {riders.map((rider) => <option key={rider.id} value={rider.id}>{rider.name} · {rider.status.replace('_', ' ')}</option>)}
                  </select>
                  <button className="btn btn-primary" disabled={!riderId || assign.isPending} onClick={() => assign.mutate({ id, data: { riderId, version: currentDetail.version } }, { onSuccess: finish })} data-testid="button-assign-rider">
                    {assign.isPending ? '…' : <Check size={15} />}
                  </button>
                </div>
                {assign.isError && <div className="form-hint" style={{ color: 'hsl(var(--destructive))' }}>Assignment changed elsewhere. Refresh and try again.</div>}
              </div>

              <div className="detail-section">
                <div className="detail-section-title">Move this delivery</div>
                <div className="action-row">
                  {currentDetail.status === 'pending' && <button className="btn btn-warn" disabled={!currentDetail.riderId || update.isPending} onClick={() => move('assigned')} data-testid="button-mark-assigned">Mark assigned</button>}
                  {currentDetail.status === 'assigned' && <button className="btn btn-warn" disabled={update.isPending} onClick={() => move('picked_up')} data-testid="button-mark-picked-up">Mark picked up</button>}
                  {currentDetail.status !== 'delivered' && currentDetail.status !== 'cancelled' && <button className="btn btn-danger" disabled={cancel.isPending} onClick={() => { if (window.confirm('Cancel this delivery request?')) cancel.mutate({ id }, { onSuccess: finish }); }} data-testid="button-cancel-delivery">Cancel request</button>}
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-section-title">Handoff history</div>
                {currentDetail.events?.length ? currentDetail.events.slice().reverse().map((event) => (
                  <div className="timeline-item" key={event.id}>
                    <span className="timeline-dot" />
                    <div className="timeline-copy"><strong>{event.status.replace('_', ' ')}</strong><p>{event.actorName} · {formatTime(event.createdAt)}{event.note ? ` · ${event.note}` : ''}</p></div>
                  </div>
                )) : <div className="panel-note">No events recorded yet.</div>}
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}