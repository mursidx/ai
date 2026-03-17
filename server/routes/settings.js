import express from 'express';
import db from '../db/client.js';
import { auth } from '../middleware/auth.js';
const r=express.Router();r.use(auth);
r.get('/',(req,res)=>res.json(db.prepare('SELECT * FROM businesses WHERE id=?').get(req.user.businessId)));
r.put('/',(req,res)=>{const b=req.body;db.prepare('UPDATE businesses SET name=?, gstin=?, phone=?, email=?, invoice_prefix=?, invoice_theme=?, invoice_settings_json=? WHERE id=?').run(b.name,b.gstin,b.phone,b.email,b.invoice_prefix,b.invoice_theme,JSON.stringify(b.invoice_settings||{}),req.user.businessId);res.json({ok:true});});
export default r;
