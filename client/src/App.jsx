import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './store/authStore';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Sales from './pages/sales/Sales';
import Purchases from './pages/purchases/Purchases';
import Inventory from './pages/inventory/Inventory';
import Parties from './pages/parties/Parties';
import Expenses from './pages/expenses/Expenses';
import Reports from './pages/reports/Reports';
import Settings from './pages/settings/Settings';

function Private(){const t=useAuth(s=>s.token);return t?<Layout/>:<Navigate to='/login'/>}

export default function App(){return <Routes><Route path='/login' element={<Login/>}/><Route path='/register' element={<Register/>}/><Route element={<Private/>}><Route path='/' element={<Dashboard/>}/><Route path='/sales' element={<Sales/>}/><Route path='/purchases' element={<Purchases/>}/><Route path='/inventory' element={<Inventory/>}/><Route path='/parties' element={<Parties/>}/><Route path='/expenses' element={<Expenses/>}/><Route path='/reports' element={<Reports/>}/><Route path='/settings' element={<Settings/>}/></Route></Routes>}
