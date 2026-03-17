import express from 'express';
import db from '../db/client.js';
import { auth } from '../middleware/auth.js';
import { adjustStock } from '../services/stockService.js';

const r=express.Router();
r.use(auth);

function nextInvoiceNumber(businessId){
  const b=db.prepare('SELECT invoice_prefix,invoice_start FROM businesses WHERE id=?').get(businessId);
  const cnt=db.prepare("SELECT COUNT(*) c FROM invoices WHERE business_id=? AND type='invoice'").get(businessId).c;
  return `${b.invoice_prefix || 'INV-'}${String((b.invoice_start||1)+cnt).padStart(4,'0')}`;
}

r.get('/',(req,res)=>{
  const rows=db.prepare('SELECT i.*, p.name party_name FROM invoices i LEFT JOIN parties p ON p.id=i.party_id WHERE i.business_id=? ORDER BY i.id DESC').all(req.user.businessId);
  const today=new Date().toISOString().slice(0,10);
  res.json(rows.map(x=> ({...x,computed_status:(x.status==='sent'&&x.due_date<today)?'overdue':x.status})));
});

r.get('/:id',(req,res)=>{
  const inv=db.prepare('SELECT * FROM invoices WHERE id=? AND business_id=?').get(req.params.id,req.user.businessId);
  const items=db.prepare('SELECT * FROM invoice_items WHERE invoice_id=?').all(req.params.id);
  res.json({...inv,items});
});

r.post('/',(req,res)=>{
  const b=req.body;const now=new Date().toISOString();
  const no=b.invoice_number || nextInvoiceNumber(req.user.businessId);
  const inv=db.prepare('INSERT INTO invoices (business_id,invoice_number,type,party_id,invoice_date,due_date,status,subtotal,discount_total,tax_total,round_off,grand_total,amount_paid,payment_mode,notes,terms,is_same_state,created_at,updated_at,source_invoice_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
  .run(req.user.businessId,no,b.type||'invoice',b.party_id,b.invoice_date,b.due_date,b.status||'draft',b.subtotal||0,b.discount_total||0,b.tax_total||0,b.round_off||0,b.grand_total||0,b.amount_paid||0,b.payment_mode||'',b.notes||'',b.terms||'',b.is_same_state?1:0,now,now,b.source_invoice_id||null);
  const id=inv.lastInsertRowid;
  const insertItem=db.prepare('INSERT INTO invoice_items (invoice_id,item_id,item_name,hsn_sac,qty,unit,rate,discount_pct,tax_rate,tax_amount,amount) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
  for(const it of b.items||[]){
    insertItem.run(id,it.item_id||null,it.item_name,it.hsn_sac||'',it.qty,it.unit||'',it.rate,it.discount_pct||0,it.tax_rate||0,it.tax_amount||0,it.amount||0);
    if((b.type||'invoice')==='invoice' && ['sent','paid','partial'].includes(b.status) && it.item_id){
      adjustStock({businessId:req.user.businessId,itemId:it.item_id,qtyChange:-Math.abs(it.qty),movementType:'sale',referenceId:id,referenceType:'invoice'});
    }
  }
  res.json({id,invoice_number:no});
});

r.post('/:id/payments',(req,res)=>{
  const {amount,payment_mode,notes,payment_date}=req.body;
  const inv=db.prepare('SELECT * FROM invoices WHERE id=? AND business_id=?').get(req.params.id,req.user.businessId);
  db.prepare('INSERT INTO payments_received (business_id,invoice_id,party_id,amount,payment_date,payment_mode,notes,created_at) VALUES (?,?,?,?,?,?,?,?)').run(req.user.businessId,inv.id,inv.party_id,amount,payment_date||new Date().toISOString().slice(0,10),payment_mode||'',notes||'',new Date().toISOString());
  const paid=db.prepare('SELECT COALESCE(SUM(amount),0) s FROM payments_received WHERE invoice_id=?').get(inv.id).s;
  const status=paid>=inv.grand_total?'paid':paid>0?'partial':'sent';
  db.prepare('UPDATE invoices SET amount_paid=?,status=?,updated_at=? WHERE id=?').run(paid,status,new Date().toISOString(),inv.id);
  res.json({ok:true,status,amount_paid:paid});
});

r.post('/:id/convert',(req,res)=>{
  const q=db.prepare("SELECT * FROM invoices WHERE id=? AND business_id=? AND type='quotation'").get(req.params.id,req.user.businessId);
  const items=db.prepare('SELECT * FROM invoice_items WHERE invoice_id=?').all(req.params.id);
  const no=nextInvoiceNumber(req.user.businessId); const now=new Date().toISOString();
  const c=db.prepare('INSERT INTO invoices (business_id,invoice_number,type,source_invoice_id,party_id,invoice_date,due_date,status,subtotal,discount_total,tax_total,round_off,grand_total,amount_paid,payment_mode,notes,terms,is_same_state,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(req.user.businessId,no,'invoice',q.id,q.party_id,q.invoice_date,q.due_date,'draft',q.subtotal,q.discount_total,q.tax_total,q.round_off,q.grand_total,0,q.payment_mode,q.notes,q.terms,q.is_same_state,now,now);
  const nid=c.lastInsertRowid; const st=db.prepare('INSERT INTO invoice_items (invoice_id,item_id,item_name,hsn_sac,qty,unit,rate,discount_pct,tax_rate,tax_amount,amount) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
  items.forEach(it=>st.run(nid,it.item_id,it.item_name,it.hsn_sac,it.qty,it.unit,it.rate,it.discount_pct,it.tax_rate,it.tax_amount,it.amount));
  res.json({id:nid,invoice_number:no});
});

r.delete('/:id',(req,res)=>{db.prepare('DELETE FROM invoice_items WHERE invoice_id=?').run(req.params.id);db.prepare('DELETE FROM invoices WHERE id=? AND business_id=?').run(req.params.id,req.user.businessId);res.json({ok:true});});

export default r;
