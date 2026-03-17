import db from '../db/client.js';

export function auth(req, _res, next) {
  const business = db.prepare('SELECT id FROM businesses ORDER BY id LIMIT 1').get();
  req.user = {
    userId: 1,
    businessId: business?.id || 1,
    role: 'owner'
  };
  next();
}
