import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import partyRoutes from './routes/parties.js';
import invoiceRoutes from './routes/invoices.js';
import purchaseRoutes from './routes/purchases.js';
import expenseRoutes from './routes/expenses.js';
import reportRoutes from './routes/reports.js';
import settingsRoutes from './routes/settings.js';

const app=express();
app.use(cors());
app.use(express.json({limit:'2mb'}));

app.get('/health',(_,res)=>res.json({ok:true}));
app.use('/api/auth',authRoutes);
app.use('/api/items',itemRoutes);
app.use('/api/parties',partyRoutes);
app.use('/api/invoices',invoiceRoutes);
app.use('/api/purchases',purchaseRoutes);
app.use('/api/expenses',expenseRoutes);
app.use('/api/reports',reportRoutes);
app.use('/api/settings',settingsRoutes);

app.listen(3001,()=>console.log('API on 3001'));
