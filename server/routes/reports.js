import express from 'express';
import db from '../db/client.js';
import { auth } from '../middleware/auth.js';
import { dashboardData } from '../services/reportService.js';
const r=express.Router();r.use(auth);

r.get('/dashboard',(req,res)=>{
  const stats=dashboardData(req.user.businessId);
  const recent=db.prepare("SELECT i.invoice_number, i.invoice_date, i.grand_total, i.status, p.name customer FROM invoices i LEFT JOIN parties p ON p.id=i.party_id WHERE i.business_id=? AND i.type='invoice' ORDER BY i.id DESC LIMIT 5").all(req.user.businessId);
  const salesByMonth=db.prepare("SELECT substr(invoice_date,1,7) month, SUM(grand_total) sales FROM invoices WHERE business_id=? AND type='invoice' GROUP BY 1 ORDER BY 1 DESC LIMIT 6").all(req.user.businessId);
  res.json({stats,recent,salesByMonth:salesByMonth.reverse()});
});

r.get('/pnl',(req,res)=>{
  const revenue=db.prepare("SELECT COALESCE(SUM(grand_total),0) s FROM invoices WHERE business_id=? AND type='invoice' AND status IN ('paid','partial','sent')").get(req.user.businessId).s;
  const cogs=db.prepare('SELECT COALESCE(SUM(ii.qty * it.purchase_price),0) s FROM invoice_items ii JOIN invoices i ON i.id=ii.invoice_id JOIN items it ON it.id=ii.item_id WHERE i.business_id=? AND i.type=\'invoice\'').get(req.user.businessId).s;
  const exp=db.prepare('SELECT COALESCE(SUM(amount),0) s FROM expenses WHERE business_id=?').get(req.user.businessId).s;
  res.json({revenue,cogs,expenses:exp,netProfit:revenue-cogs-exp});
});

export default r;
