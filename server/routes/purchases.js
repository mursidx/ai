import express from 'express';
import db from '../db/client.js';
import { auth } from '../middleware/auth.js';
import { adjustStock } from '../services/stockService.js';

const r=express.Router();
r.use(auth);

r.get('/',(req,res)=>res.json(db.prepare('SELECT p.*, parties.name party_name FROM purchase_bills p LEFT JOIN parties ON parties.id=p.party_id WHERE p.business_id=? ORDER BY p.id DESC').all(req.user.businessId)));
r.post('/',(req,res)=>{
  const b=req.body; const now=new Date().toISOString();
  const o=db.prepare('INSERT INTO purchase_bills (business_id,bill_number,party_id,bill_date,due_date,status,subtotal,tax_total,grand_total,amount_paid,notes,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').run(req.user.businessId,b.bill_number,b.party_id,b.bill_date,b.due_date,b.status||'unpaid',b.subtotal||0,b.tax_total||0,b.grand_total||0,b.amount_paid||0,b.notes||'',now);
  const id=o.lastInsertRowid; const st=db.prepare('INSERT INTO purchase_bill_items (purchase_bill_id,item_id,item_name,qty,unit,rate,tax_rate,tax_amount,amount) VALUES (?,?,?,?,?,?,?,?,?)');
  (b.items||[]).forEach(it=>{st.run(id,it.item_id||null,it.item_name,it.qty,it.unit||'',it.rate,it.tax_rate||0,it.tax_amount||0,it.amount||0); if(it.item_id) adjustStock({businessId:req.user.businessId,itemId:it.item_id,qtyChange:Math.abs(it.qty),movementType:'purchase',referenceId:id,referenceType:'purchase'});});
  res.json({id});
});

export default r;
