import db from '../db/client.js';

export function adjustStock({ businessId, itemId, qtyChange, movementType, referenceId, referenceType, notes }) {
  const item = db.prepare('SELECT current_stock FROM items WHERE id=? AND business_id=?').get(itemId, businessId);
  if (!item) return;
  const balance = Number(item.current_stock) + Number(qtyChange);
  db.prepare('UPDATE items SET current_stock=? WHERE id=? AND business_id=?').run(balance, itemId, businessId);
  db.prepare('INSERT INTO stock_movements (business_id,item_id,movement_type,qty_change,balance_after,reference_id,reference_type,notes,created_at) VALUES (?,?,?,?,?,?,?,?,datetime("now"))')
    .run(businessId, itemId, movementType, qtyChange, balance, referenceId || null, referenceType || null, notes || null);
}
