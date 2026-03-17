import express from 'express';
import db from '../db/client.js';
import { auth } from '../middleware/auth.js';
const r=express.Router();r.use(auth);
r.get('/',(req,res)=>res.json(db.prepare('SELECT * FROM expenses WHERE business_id=? ORDER BY expense_date DESC').all(req.user.businessId)));
r.post('/',(req,res)=>{const b=req.body;const id=db.prepare('INSERT INTO expenses (business_id,category,amount,expense_date,payment_mode,notes,created_at) VALUES (?,?,?,?,?,?,?)').run(req.user.businessId,b.category,b.amount,b.expense_date,b.payment_mode||'',b.notes||'',new Date().toISOString()).lastInsertRowid;res.json({id});});
export default r;
