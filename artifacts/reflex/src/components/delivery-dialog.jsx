import { useState } from 'react';
import { X, ArrowUpRight } from 'lucide-react';
import { useCreateDeliveryRequest, getGetDashboardSummaryQueryKey, getListActivityQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

export function NewDeliveryDialog({ onClose }) {
  const queryClient = useQueryClient();
  const create = useCreateDeliveryRequest();
  const [form, setForm] = useState({ customerName: '', customerPhone: '', address: '', itemDescription: '' });
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    create.mutate({ data: form }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ predicate: ({ queryKey }) => queryKey[0] === '/api/v1/delivery-requests' });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListActivityQueryKey({ limit: 8 }) });
        onClose();
      },
    });
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="new-delivery-title">
        <div className="modal-head"><div><div className="eyebrow">New request</div><div className="modal-title" id="new-delivery-title">Send something across town</div></div><button className="icon-btn" onClick={onClose} data-testid="button-close-new-delivery"><X size={15} /></button></div>
        <form className="modal-body" onSubmit={submit}>
          <div className="form-grid">
            <div className="form-field"><label htmlFor="customer-name">Customer name</label><input id="customer-name" className="input" required minLength={2} value={form.customerName} onChange={update('customerName')} placeholder="e.g. Wanjiku Njeri" data-testid="input-customer-name" /></div>
            <div className="form-field"><label htmlFor="customer-phone">Phone number</label><input id="customer-phone" className="input" required minLength={7} value={form.customerPhone} onChange={update('customerPhone')} placeholder="+254 7..." data-testid="input-customer-phone" /></div>
            <div className="form-field"><label htmlFor="delivery-address">Drop-off address</label><input id="delivery-address" className="input" required minLength={4} value={form.address} onChange={update('address')} placeholder="Building, street, estate, landmark" data-testid="input-delivery-address" /></div>
            <div className="form-field"><label htmlFor="item-description">What is moving?</label><textarea id="item-description" className="textarea" required minLength={2} rows={3} value={form.itemDescription} onChange={update('itemDescription')} placeholder="Keep it useful for the rider" data-testid="input-item-description" /></div>
          </div>
          {create.isError && <div className="error-state" style={{ marginTop: 14 }}>This request could not be created. Check the details and try again.</div>}
          <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={onClose} data-testid="button-cancel-new-delivery">Cancel</button><button className="btn btn-primary" disabled={create.isPending} type="submit" data-testid="button-submit-new-delivery">{create.isPending ? 'Creating…' : 'Create request'}<ArrowUpRight size={14} /></button></div>
        </form>
      </div>
    </div>
  );
}