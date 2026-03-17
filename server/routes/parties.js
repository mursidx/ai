import express from 'express';
import db from '../db/client.js';
import { auth } from '../middleware/auth.js';
import { partyOutstanding } from '../services/balanceService.js';

const r = express.Router();
r.use(auth);

r.get('/', (req,res)=>{
  const q = req.query.q ? `%${req.query.q}%` : '%';
  const rows = db.prepare('SELECT * FROM parties WHERE business_id=? AND (name LIKE ? OR phone LIKE ?) ORDER BY id DESC').all(req.user.businessId,q,q);
  res.json(rows.map(p=>({...p,outstanding:partyOutstanding(req.user.businessId,p.id)})));
});
r.post('/',(req,res)=>{
  const b=req.body; const now=new Date().toISOString();
  const o=db.prepare('INSERT INTO parties (business_id,type,name,phone,email,gstin,pan,city,billing_address_json,shipping_address_json,credit_limit,credit_period_days,opening_balance,opening_balance_type,notes,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
  .run(req.user.businessId,b.type||'customer',b.name,b.phone||'',b.email||'',b.gstin||'',b.pan||'',b.city||'',JSON.stringify(b.billing_address||{}),JSON.stringify(b.shipping_address||{}),b.credit_limit||0,b.credit_period_days||0,b.opening_balance||0,b.opening_balance_type||'dr',b.notes||'',now);
  res.json({id:o.lastInsertRowid});
});
r.put('/:id',(req,res)=>{const b=req.body;db.prepare('UPDATE parties SET type=?,name=?,phone=?,email=?,gstin=?,city=?,notes=? WHERE id=? AND business_id=?').run(b.type,b.name,b.phone,b.email,b.gstin,b.city,b.notes,req.params.id,req.user.businessId);res.json({ok:true});});
r.delete('/:id',(req,res)=>{db.prepare('DELETE FROM parties WHERE id=? AND business_id=?').run(req.params.id,req.user.businessId);res.json({ok:true});});

export default r;
