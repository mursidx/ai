import db from '../db/client.js';

export function dashboardData(businessId) {
  const totals = db.prepare(`SELECT 
  COALESCE(SUM(CASE WHEN type='invoice' THEN grand_total END),0) sales,
  COALESCE((SELECT SUM(grand_total) FROM purchase_bills WHERE business_id=?),0) purchases,
  COALESCE((SELECT SUM(grand_total-amount_paid) FROM invoices WHERE business_id=? AND type='invoice'),0) receivable,
  COALESCE((SELECT SUM(grand_total-amount_paid) FROM purchase_bills WHERE business_id=?),0) payable,
  COALESCE((SELECT COUNT(*) FROM items WHERE business_id=? AND current_stock<=min_stock_alert),0) lowStock
  FROM invoices WHERE business_id=?`).get(businessId,businessId,businessId,businessId,businessId);
  return totals;
}
