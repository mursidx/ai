import express from 'express';
import db from '../db/client.js';
import { auth } from '../middleware/auth.js';

const r = express.Router();
r.use(auth);

r.get('/', (req,res)=>{
  const q = req.query.q ? `%${req.query.q}%` : '%';
  const rows = db.prepare('SELECT * FROM items WHERE business_id=? AND (name LIKE ? OR hsn_sac LIKE ?) ORDER BY id DESC').all(req.user.businessId,q,q);
  res.json(rows);
});

r.post('/', (req,res)=>{
  const b=req.body; const now=new Date().toISOString();
  const out=db.prepare('INSERT INTO items (business_id,name,type,category_id,unit,hsn_sac,purchase_price,mrp,selling_price,tax_rate,current_stock,min_stock_alert,description,sku,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
  .run(req.user.businessId,b.name,b.type||'product',b.category_id||null,b.unit||'pcs',b.hsn_sac||'',b.purchase_price||0,b.mrp||0,b.selling_price||0,b.tax_rate||0,b.current_stock||0,b.min_stock_alert||0,b.description||'',b.sku||'',now);
  res.json({id:out.lastInsertRowid});
});

r.put('/:id', (req,res)=>{
  const b=req.body;
  db.prepare('UPDATE items SET name=?,type=?,unit=?,hsn_sac=?,purchase_price=?,mrp=?,selling_price=?,tax_rate=?,current_stock=?,min_stock_alert=?,description=?,sku=? WHERE id=? AND business_id=?')
  .run(b.name,b.type,b.unit,b.hsn_sac,b.purchase_price,b.mrp,b.selling_price,b.tax_rate,b.current_stock,b.min_stock_alert,b.description,b.sku,req.params.id,req.user.businessId);
  res.json({ok:true});
});

r.delete('/:id', (req,res)=>{db.prepare('DELETE FROM items WHERE id=? AND business_id=?').run(req.params.id,req.user.businessId);res.json({ok:true});});

export default r;
