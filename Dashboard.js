import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

function getIcon(category, type) {
  const map = {
    'Entretenimiento': '🎬',
    'Servicios': '💡',
    'Ingreso': '💰',
    'Comida': '🍽️',
    'Transporte': '🚗',
    'Salud': '🩺',
    'Compras': '🛍️',
    'Educación': '📚',
    'Otros': '🎉',
    'Diversión': '😄'
  };
  return map[category] || (type === 'income' ? '💰' : '💸');
}
function formatDateTime(dt) {
  const d = new Date(dt);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' }) + ', ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

const RANGE_OPTIONS = [
  { label: 'Último mes', value: '30d' },
  { label: 'Últimas 2 semanas', value: '14d' },
  { label: 'Últimos 7 días', value: '7d' },
  { label: 'Ayer', value: 'yesterday' },
  { label: 'Hoy', value: 'today' }
];

function getRangeDates(range) {
  const now = new Date();
  let startDate, endDate;
  switch (range) {
    case 'today':
      startDate = new Date();
      startDate.setHours(0,0,0,0);
      endDate = new Date();
      endDate.setHours(23,59,59,999);
      break;
    case 'yesterday': {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      startDate = new Date(y.setHours(0,0,0,0));
      endDate = new Date(y.setHours(23,59,59,999));
      break;
    }
    case '7d':
      startDate = new Date(now - 7*24*60*60*1000);
      endDate = now;
      break;
    case '14d':
      startDate = new Date(now - 14*24*60*60*1000);
      endDate = now;
      break;
    case '30d':
    default:
      startDate = new Date(now - 30*24*60*60*1000);
      endDate = now;
      break;
  }
  return { startDate, endDate };
}

function Dashboard({ userId }) {
  // State for balance, transactions, loading, and error
  const [balance, setBalance] = useState(null); // null = loading, number = loaded
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  // Eliminar: showModal, modalType, form, openModal, closeModal, handleSubmit, CATEGORIES, y el JSX del modal

  // Nombre de usuario
  const [userName, setUserName] = useState('');

  // Métricas state
  const [range, setRange] = useState('30d');
  const [metrics, setMetrics] = useState({ ingresos: null, gastos: null, promedio: null });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState(null);

  // Gasto últimos 30 días (independiente del rango)
  const [gasto30dias, setGasto30dias] = useState(null);
  const [gasto30diasLoading, setGasto30diasLoading] = useState(true);

  // Categorías predefinidas
  const CATEGORIES = [
    { label: 'Transporte', icon: '🚗' },
    { label: 'Entretenimiento', icon: '🎬' },
    { label: 'Compras', icon: '🛍️' },
    { label: 'Servicios', icon: '💡' },
    { label: 'Salud', icon: '🩺' },
    { label: 'Educación', icon: '📚' },
    { label: 'Otros', icon: '🎉' },
  ];

  // Fetch user name from Supabase
  useEffect(() => {
    async function fetchUserName() {
      if (!userId) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', userId)
        .single();
      if (!error && data?.name) setUserName(data.name);
    }
    fetchUserName();
  }, [userId]);

  // Fetch balance and recent transactions on mount and after add
  useEffect(() => {
    fetchData();
    fetchGasto30dias();
    // eslint-disable-next-line
  }, [userId]);

  // Fetch metrics when range or userId changes
  useEffect(() => {
    fetchMetrics();
    // eslint-disable-next-line
  }, [range, userId]);

  // Fetch gasto últimos 30 días
  async function fetchGasto30dias() {
    setGasto30diasLoading(true);
    try {
      const now = new Date();
      const startDate = new Date(now - 30*24*60*60*1000);
      const { data, error } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString());
      if (error) throw error;
      const total = data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      setGasto30dias(total);
    } catch {
      setGasto30dias(0);
    } finally {
      setGasto30diasLoading(false);
    }
  }

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      // Fetch balance from profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('balance_total')
        .eq('id', userId)
        .single();
      if (profileError) throw profileError;
      setBalance(profile?.balance_total ?? 0);
      // Fetch latest 5 transactions
      const { data: txs, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      if (txError) throw txError;
      setTransactions(txs || []);
    } catch (err) {
      setError('Error al cargar datos. Intenta de nuevo.');
      setBalance(0);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }

  // Fetch metrics for selected range
  async function fetchMetrics() {
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      const { startDate, endDate } = getRangeDates(range);
      // Ingresos
      const { data: ingresosData, error: ingresosError } = await supabase
        .from('transactions')
        .select('amount, type, created_at')
        .eq('user_id', userId)
        .eq('type', 'income')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      if (ingresosError) throw ingresosError;
      const ingresos = ingresosData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      // Gastos
      const { data: gastosData, error: gastosError } = await supabase
        .from('transactions')
        .select('amount, type, created_at')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      if (gastosError) throw gastosError;
      const gastos = gastosData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      // Promedio diario
      const MS_PER_DAY = 24*60*60*1000;
      let days = 1;
      if (range === 'yesterday' || range === 'today') days = 1;
      else days = Math.round((endDate - startDate) / MS_PER_DAY) + 1;
      const promedio = days > 0 ? Math.round(gastos / days) : 0;
      setMetrics({ ingresos, gastos, promedio });
    } catch (err) {
      setMetricsError('Error al calcular métricas.');
      setMetrics({ ingresos: 0, gastos: 0, promedio: 0 });
    } finally {
      setMetricsLoading(false);
    }
  }

  // Add transaction and optimistically update UI
  async function addTransaction({ amount, type, category, description }) {
    setAdding(true);
    setError(null);
    try {
      // Insert transaction
      const { data: inserted, error: insertError } = await supabase.from('transactions').insert([
        {
          user_id: userId,
          amount,
          type,
          category,
          description,
          created_at: new Date().toISOString()
        }
      ]).select();
      if (insertError) throw insertError;
      // Optimistically update balance
      setBalance(prev => (prev ?? 0) + (type === 'income' ? Number(amount) : -Number(amount)));
      // Optimistically update recent transactions
      setTransactions(prev => [inserted[0], ...prev].slice(0, 5));
      fetchMetrics(); // update metrics after add
      fetchGasto30dias(); // update gasto 30 días después de agregar
    } catch (err) {
      setError('Error al agregar transacción. Intenta de nuevo.');
    } finally {
      setAdding(false);
    }
  }

  // Eliminar: showModal, modalType, form, openModal, closeModal, handleSubmit, CATEGORIES, y el JSX del modal

  // UI rendering
  return (
    <div>
      {/* Balance Total Section */}
      <div className="balance-card">
        <h2>Balance Total</h2>
        {loading ? (
          <div className="amount" style={{color:'#888'}}>Cargando...</div>
        ) : error ? (
          <div className="amount" style={{color:'#e53e3e'}}>{error}</div>
        ) : (
          <div className="amount">${(balance ?? 0).toLocaleString('es-MX')}</div>
        )}
      </div>
      {/* Botones de acción */}
      <div className="actions">
        <button className="action-btn ingreso">Ingreso</button>
        <button className="action-btn gasto">Gasto</button>
      </div>
      {/* Métricas Section with Range Selector */}
      <div className="card" style={{position:'relative',marginBottom:'1.5rem',paddingBottom:'2rem'}}>
        <div style={{display:'flex',justifyContent:'flex-start',alignItems:'center',marginBottom:'1rem',gap:'0.7rem'}}>
          <div className="card-title" style={{fontSize:'2rem',fontWeight:700,marginBottom:0,display:'flex',alignItems:'center',gap:'0.7rem'}}>
            <span role="img" aria-label="chart" style={{fontSize:'2.1rem'}}>📊</span> Reporte
          </div>
        </div>
        <div style={{display:'flex',gap:'1rem',marginBottom:'1.2rem',flexWrap:'wrap'}}>
          <div style={{flex:1,minWidth:'140px',background:'#e6faea',borderRadius:'20px',padding:'1.2rem 0',textAlign:'center',boxShadow:'0 2px 8px rgba(34,197,94,0.07)'}}>
            <div style={{color:'#22c55e',fontWeight:600,fontSize:'1.1rem'}}>Ingresos Totales</div>
            <div style={{color:'#16a34a',fontWeight:700,fontSize:'2rem',marginTop:'0.2rem'}}>
              {metricsLoading ? 'Cargando...' : `$${metrics.ingresos?.toLocaleString('es-MX')}`}
            </div>
            {!metricsLoading && metrics.ingresos === 0 && <div style={{fontSize:'0.9rem',color:'#888'}}>Sin datos</div>}
          </div>
          <div style={{flex:1,minWidth:'140px',background:'#ffeaea',borderRadius:'20px',padding:'1.2rem 0',textAlign:'center',boxShadow:'0 2px 8px rgba(239,68,68,0.07)'}}>
            <div style={{color:'#ef4444',fontWeight:600,fontSize:'1.1rem'}}>Gastos Totales</div>
            <div style={{color:'#b91c1c',fontWeight:700,fontSize:'2rem',marginTop:'0.2rem'}}>
              {metricsLoading ? 'Cargando...' : `$${metrics.gastos?.toLocaleString('es-MX')}`}
            </div>
            {!metricsLoading && metrics.gastos === 0 && <div style={{fontSize:'0.9rem',color:'#888'}}>Sin datos</div>}
          </div>
        </div>
        <div style={{background:'#eaf1ff',borderRadius:'20px',padding:'1.2rem 0',textAlign:'center',boxShadow:'0 2px 8px rgba(37,99,235,0.07)'}}>
          <div style={{color:'#2563eb',fontWeight:600,fontSize:'1.1rem'}}>Gasto En Los Últimos 30 Días</div>
          <div style={{color:'#2563eb',fontWeight:700,fontSize:'2rem',marginTop:'0.2rem'}}>
            {gasto30diasLoading ? 'Cargando...' : `$${gasto30dias?.toLocaleString('es-MX')}`}
          </div>
          {!gasto30diasLoading && gasto30dias === 0 && <div style={{fontSize:'0.9rem',color:'#888'}}>Sin datos</div>}
        </div>
        {metricsError && <div style={{color:'#e53e3e',textAlign:'center',marginTop:'1rem'}}>{metricsError}</div>}
      </div>
      {/* Recent Transactions Section */}
      <div className="card">
        <div className="card-title">🧾 Transacciones Recientes</div>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '2rem 0' }}>Cargando...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#e53e3e', padding: '2rem 0' }}>{error}</div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '2rem 0', fontSize:'1.1rem' }}>No hay transacciones aún</div>
        ) : (
          <ul className="recent-list">
            {transactions.map(tx => (
              <li className="recent-item" key={tx.id}>
                <span className="recent-icon">{getIcon(tx.category, tx.type)}</span>
                <div className="recent-info">
                  <div className="recent-title">{tx.category}</div>
                  <div className="recent-date">{formatDateTime(tx.created_at)}</div>
                </div>
                <div className={`recent-amount ${tx.type === 'income' ? 'ingreso' : 'gasto'}`}>
                  {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toLocaleString('es-MX')}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Add popups and handlers for adding transactions, passing addTransaction as needed */}
      {/* Example: <AddTransactionModal onAdd={addTransaction} loading={adding} /> */}
    </div>
  );
}

export default Dashboard; 