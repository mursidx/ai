import bcrypt from 'bcryptjs';
import db from './client.js';

const now=new Date().toISOString();
const existing=db.prepare('SELECT id FROM users WHERE email=?').get('demo@mybillbook.ai');
if(!existing){
  const hash=await bcrypt.hash('password123',10);
  const u=db.prepare('INSERT INTO users (name,email,password_hash,phone,created_at) VALUES (?,?,?,?,?)').run('Amit Sharma','demo@mybillbook.ai',hash,'9999999999',now).lastInsertRowid;
  const b=db.prepare('INSERT INTO businesses (owner_user_id,name,gstin,phone,email,invoice_prefix,invoice_start,invoice_theme,created_at,invoice_settings_json) VALUES (?,?,?,?,?,?,?,?,?,?)').run(u,'Sharma Electronics, Delhi','07ABCDE1234F1Z5','9999999999','demo@mybillbook.ai','INV-',1,'modern',now,JSON.stringify({prefix:'INV-',start:1,dueDays:15})).lastInsertRowid;
  db.prepare('INSERT INTO business_users (business_id,user_id,role,created_at) VALUES (?,?,?,?)').run(b,u,'owner',now);
  ['Customer A','Customer B','Customer C','Customer D','Customer E','Supplier X','Supplier Y','Supplier Z'].forEach((n,i)=>db.prepare('INSERT INTO parties (business_id,type,name,phone,city,created_at) VALUES (?,?,?,?,?,?)').run(b,i<5?'customer':'supplier',n,'98'+(10000000+i),'Delhi',now));
  for(let i=1;i<=15;i++) db.prepare('INSERT INTO items (business_id,name,unit,hsn_sac,purchase_price,mrp,selling_price,tax_rate,current_stock,min_stock_alert,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(b,`Item ${i}`,'pcs','8517',100+i*10,200+i*10,180+i*10,[0,5,12,18][i%4],30-i,5,now);

  for(let i=1;i<=10;i++){
    const gt=500+i*200;
    const invoiceDate = new Date(Date.now()-i*86400000).toISOString().slice(0,10);
    const dueDate = new Date(Date.now()+(15-i)*86400000).toISOString().slice(0,10);
    const status=i%3===0?'partial':i%2===0?'paid':'sent';
    const id=db.prepare('INSERT INTO invoices (business_id,invoice_number,type,party_id,invoice_date,due_date,status,subtotal,tax_total,grand_total,amount_paid,is_same_state,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(b,`INV-${String(i).padStart(4,'0')}`,'invoice',1,invoiceDate,dueDate,status,gt-50,50,gt,status==='paid'?gt:status==='partial'?gt/2:0,1,now,now).lastInsertRowid;
    db.prepare('INSERT INTO invoice_items (invoice_id,item_id,item_name,qty,unit,rate,tax_rate,tax_amount,amount) VALUES (?,?,?,?,?,?,?,?,?)').run(id,1,'Item 1',2,'pcs',gt/2,18,50,gt);
  }
  for(let i=1;i<=5;i++) {
    const billDate = new Date(Date.now()-i*172800000).toISOString().slice(0,10);
    db.prepare('INSERT INTO purchase_bills (business_id,bill_number,party_id,bill_date,status,subtotal,tax_total,grand_total,created_at) VALUES (?,?,?,?,?,?,?,?,?)').run(b,`PB-${i}`,6,billDate,'paid',400+i*100,50,450+i*100,now);
  }
  ['Rent','Salaries','Utilities','Travel','Marketing','Misc','Utilities','Rent'].forEach((c,i)=>db.prepare('INSERT INTO expenses (business_id,category,amount,expense_date,payment_mode,notes,created_at) VALUES (?,?,?,?,?,?,?)').run(b,c,1000+i*200,new Date(Date.now()-i*86400000).toISOString().slice(0,10),'Cash','Seed',now));
}
console.log('Seeded: demo@mybillbook.ai / password123');
