import db from '../db/client.js';

export function partyOutstanding(businessId, partyId) {
  const inv = db.prepare("SELECT COALESCE(SUM(grand_total),0) t, COALESCE(SUM(amount_paid),0) p FROM invoices WHERE business_id=? AND party_id=? AND type='invoice'").get(businessId, partyId);
  return Number(inv.t) - Number(inv.p);
}
