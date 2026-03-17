import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/client.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password, phone, businessName, gstin } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const now = new Date().toISOString();
    const user = db.prepare('INSERT INTO users (name,email,password_hash,phone,created_at) VALUES (?,?,?,?,?)').run(name, email, hash, phone || null, now);
    const business = db.prepare('INSERT INTO businesses (owner_user_id,name,gstin,created_at,invoice_settings_json) VALUES (?,?,?,?,?)').run(user.lastInsertRowid, businessName || 'My Business', gstin || null, now, JSON.stringify({ prefix: 'INV-', start: 1, dueDays: 15 }));
    db.prepare('INSERT INTO business_users (business_id,user_id,role,created_at) VALUES (?,?,?,?)').run(business.lastInsertRowid, user.lastInsertRowid, 'owner', now);
    const token = jwt.sign({ userId: user.lastInsertRowid, businessId: business.lastInsertRowid, role: 'owner' }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
    res.json({ token });
  } catch (e) {
    res.status(400).json({ message: 'Email already exists' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email=?').get(email);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const bu = db.prepare('SELECT * FROM business_users WHERE user_id=? ORDER BY id LIMIT 1').get(user.id);
  const token = jwt.sign({ userId: user.id, businessId: bu.business_id, role: bu.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
  res.json({ token });
});

export default router;
