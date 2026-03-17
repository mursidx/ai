import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  password_hash: text('password_hash').notNull(),
  phone: text('phone'),
  created_at: text('created_at').notNull()
});

export const businesses = sqliteTable('businesses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  owner_user_id: integer('owner_user_id').notNull(),
  name: text('name').notNull(),
  gstin: text('gstin'),
  invoice_prefix: text('invoice_prefix').default('INV-'),
  invoice_start: integer('invoice_start').default(1),
  created_at: text('created_at').notNull()
});

export const items = sqliteTable('items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  business_id: integer('business_id').notNull(),
  name: text('name').notNull(),
  hsn_sac: text('hsn_sac'),
  unit: text('unit'),
  purchase_price: real('purchase_price').default(0),
  selling_price: real('selling_price').default(0),
  tax_rate: real('tax_rate').default(0),
  current_stock: real('current_stock').default(0),
  min_stock_alert: real('min_stock_alert').default(0)
});
