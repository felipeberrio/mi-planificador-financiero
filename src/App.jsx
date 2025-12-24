import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  PlusCircle, Trash2, Wallet, ArrowUpCircle, ArrowDownCircle, 
  Settings, List, Search, Edit3, Copy, X, TrendingUp, 
  CreditCard, RotateCcw, PiggyBank, Moon, Sun, ArrowRightCircle, 
  Repeat, ArrowUp, ArrowDown, Target, Plus, AlertTriangle, Sparkles, 
  Clock, AlertCircle, ChevronDown, ChevronUp, Eye, EyeOff, 
  CreditCard as CardIcon, Maximize2, Zap, Calculator, Calendar
} from 'lucide-react';
import { 
  PieChart, Pie, Legend, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';

const App = () => {
  // --- 1. ESTADOS ---
  const [incomes, setIncomes] = useState(() => JSON.parse(localStorage.getItem('fin_incomes')) || []);
  const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem('fin_expenses')) || []);
  
  // Categorías
  const [categories, setCategories] = useState(() => JSON.parse(localStorage.getItem('fin_categories')) || ["🏠 Vivienda", "🍔 Comida", "🚌 Transporte", "💊 Salud", "🎉 Ocio", "📺 Suscripciones", "📱 Tecnología"]);
  const incomeCategories = ["Salario", "Ingreso Extra", "Devolución", "Regalo", "Inversión", "Otro"]; 

  // --- NUEVO: ESTADO SUSCRIPCIONES ---
  const [subscriptions, setSubscriptions] = useState(() => JSON.parse(localStorage.getItem('fin_subscriptions')) || []);

  const [recurring, setRecurring] = useState(() => JSON.parse(localStorage.getItem('fin_recurring')) || []);
  const [goals, setGoals] = useState(() => JSON.parse(localStorage.getItem('fin_goals')) || []); 
  const [budgets, setBudgets] = useState(() => JSON.parse(localStorage.getItem('fin_budgets')) || []); 
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('fin_dark')) || false);
  
  // --- MODO PRIVACIDAD ---
  const [privacyMode, setPrivacyMode] = useState(() => JSON.parse(localStorage.getItem('fin_privacy')) || false);

  // --- ESTADO DE VISIBILIDAD DE SECCIONES ---
  const [sectionState, setSectionState] = useState(() => JSON.parse(localStorage.getItem('fin_sections_view')) || {
    form: true, goals: true, budgets: true, categories: true, recurring: true, wallets: true, subscriptions: true
  });

  const [lastActivity, setLastActivity] = useState(() => localStorage.getItem('fin_last_activity') || "Sin actividad");
  const [isLate, setIsLate] = useState(false); 

  // --- ESTADO PARA GRÁFICA EXPANDIDA ---
  const [expandedChart, setExpandedChart] = useState(null);

  // MAGIC INPUT STATE
  const [magicText, setMagicText] = useState("");
  const [magicPreview, setMagicPreview] = useState(null);

  // Inicialización de orden de bloques
  const [leftOrder, setLeftOrder] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('fin_order'));
    const defaultOrder = ['form', 'goals', 'subscriptions', 'budgets', 'categories', 'recurring'];
    if (!saved) return defaultOrder;
    if (!saved.includes('subscriptions')) return ['subscriptions', ...saved];
    return saved;
  });
  
  const [wallets, setWallets] = useState(() => JSON.parse(localStorage.getItem('fin_wallets')) || [
    { id: 'w1', name: 'Bolsita (Físico)', type: 'cash', limit: 0 },
    { id: 'w2', name: 'Billetera', type: 'cash', limit: 0 },
    { id: 'w3', name: 'Tarjeta Débito', type: 'bank', limit: 0 },
    { id: 'w4', name: 'Tarjeta Crédito', type: 'credit', limit: 2000 }
  ]);

  const [themeColor, setThemeColor] = useState(localStorage.getItem('fin_theme') || '#3b82f6');
  const [walletFilter, setWalletFilter] = useState('all'); 
  const [categoryFilter, setCategoryFilter] = useState('all'); 
  const [dateFrom, setDateFrom] = useState(""); 
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('expense'); 
  const [newCat, setNewCat] = useState("");
  const [editingCategory, setEditingCategory] = useState({ oldName: '', newName: '' });
  const [sortBy, setSortBy] = useState('date-desc'); 
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  
  const historyRef = useRef(null);

  // Modales
  const [modalMode, setModalMode] = useState(null);
  const [walletForm, setWalletForm] = useState({ id: '', name: '', type: 'cash', limit: 0 });
  const [goalForm, setGoalForm] = useState({ id: '', name: '', target: '', saved: 0 });
  const [budgetForm, setBudgetForm] = useState({ id: '', category: '', limit: '' });
  
  // --- NUEVO: FORMULARIO SUSCRIPCION ---
  const [subForm, setSubForm] = useState({ id: '', name: '', price: '', day: 1, details: '' });
  // --- NUEVO: ESTADO SIMULADOR ---
  const [simAmount, setSimAmount] = useState('');
  const [simResult, setSimResult] = useState(null);

  // Formularios
  const [incomeForm, setIncomeForm] = useState({ name: '', amount: '', date: new Date().toISOString().split('T')[0], walletId: 'w3', category: 'Salario', details: '' });
  const [expenseForm, setExpenseForm] = useState({ name: '', amount: '', date: new Date().toISOString().split('T')[0], walletId: 'w3', category: 'Vivienda', details: '' });
  const [recurringForm, setRecurringForm] = useState({ name: '', amount: '', category: 'Vivienda' });

  // --- PERSISTENCIA ---
  useEffect(() => {
    localStorage.setItem('fin_incomes', JSON.stringify(incomes));
    localStorage.setItem('fin_expenses', JSON.stringify(expenses));
    localStorage.setItem('fin_categories', JSON.stringify(categories));
    localStorage.setItem('fin_wallets', JSON.stringify(wallets));
    localStorage.setItem('fin_recurring', JSON.stringify(recurring));
    localStorage.setItem('fin_subscriptions', JSON.stringify(subscriptions));
    localStorage.setItem('fin_goals', JSON.stringify(goals));
    localStorage.setItem('fin_budgets', JSON.stringify(budgets));
    localStorage.setItem('fin_theme', themeColor);
    localStorage.setItem('fin_dark', JSON.stringify(darkMode));
    localStorage.setItem('fin_order', JSON.stringify(leftOrder));
    localStorage.setItem('fin_sections_view', JSON.stringify(sectionState));
    localStorage.setItem('fin_privacy', JSON.stringify(privacyMode)); 
  }, [incomes, expenses, categories, wallets, recurring, subscriptions, goals, budgets, themeColor, darkMode, leftOrder, sectionState, privacyMode]);

  // CALCULAR SI ESTAMOS "LATE"
  useEffect(() => {
    const checkLateness = () => {
        const lastTs = localStorage.getItem('fin_last_activity_ts');
        if (lastTs) {
            const lastDate = new Date(lastTs);
            const now = new Date();
            const diffTime = Math.abs(now - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            setIsLate(diffDays > 3);
        }
    };
    checkLateness();
    window.addEventListener('focus', checkLateness);
    return () => window.removeEventListener('focus', checkLateness);
  }, [lastActivity]);

  const getThemePalette = (theme) => {
    switch(theme) {
        case '#3b82f6': return ['#3b82f6', '#60a5fa', '#93c5fd', '#2563eb', '#1d4ed8', '#1e40af']; 
        case '#8b5cf6': return ['#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed', '#6d28d9', '#5b21b6']; 
        case '#10b981': return ['#10b981', '#34d399', '#6ee7b7', '#059669', '#047857', '#065f46']; 
        case '#f43f5e': return ['#f43f5e', '#fb7185', '#fda4af', '#e11d48', '#be123c', '#9f1239']; 
        case '#ec4899': return ['#ec4899', '#f472b6', '#fbcfe8', '#db2777', '#be185d', '#9d174d']; 
        default: return ['#3B82F6', '#8B5CF6', '#10B981', '#f43f5e', '#F59E0B', '#EC4899'];
    }
  };
  
  const currentPalette = useMemo(() => getThemePalette(themeColor), [themeColor]);

  const getCategoryIcon = (name) => Array.from(name)[0];

  const touchActivity = () => {
    const now = new Date();
    localStorage.setItem('fin_last_activity_ts', now.toISOString());
    const options = { weekday: 'short', hour: '2-digit', minute: '2-digit' };
    const stamp = now.toLocaleDateString('es-ES', options).replace('.', ''); 
    setLastActivity(stamp);
    localStorage.setItem('fin_last_activity', stamp);
    setIsLate(false); 
  };

  const toggleSection = (section) => {
    setSectionState(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleBudgetClick = (category) => {
    setCategoryFilter(category);
    setWalletFilter('all');
    if (historyRef.current) {
        historyRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    setExpandedChart(null);
  };

  // --- MAGIC INPUT ---
  useEffect(() => {
    if (!magicText.trim()) { 
        if(magicPreview) setMagicPreview(null);
        return; 
    }
    const lowerText = magicText.toLowerCase();
    const amountMatch = magicText.match(/[$]?\d+([.,]\d{1,2})?/);
    const amount = amountMatch ? amountMatch[0].replace('$','').replace(',','.') : null;
    let detectedWallet = null;
    wallets.forEach(w => { if (lowerText.includes(w.name.toLowerCase())) detectedWallet = w.id; });
    let detectedCategory = null;
    categories.forEach(c => { if(lowerText.includes(c.toLowerCase())) detectedCategory = c; });
    if (amount || detectedWallet || detectedCategory) {
      setMagicPreview({ amount, walletId: detectedWallet, category: detectedCategory });
    } else {
      setMagicPreview(null);
    }
  }, [magicText, wallets, categories, magicPreview]);

  const applyMagic = () => {
    if (!magicPreview) return;
    setActiveTab('expense');
    setExpenseForm({
      ...expenseForm,
      amount: magicPreview.amount || expenseForm.amount,
      walletId: magicPreview.walletId || wallets[0].id,
      category: magicPreview.category || categories[0],
      name: magicText,
      date: new Date().toISOString().split('T')[0]
    });
    setMagicText("");
    setMagicPreview(null);
  };

  // --- STATS LOGIC ---
  const walletStats = useMemo(() => {
    return wallets.map(w => {
      const wIncomes = incomes.filter(i => i.walletId === w.id).reduce((sum, curr) => sum + Number(curr.amount), 0);
      const wExpenses = expenses.filter(e => e.walletId === w.id).reduce((sum, curr) => sum + Number(curr.amount), 0);
      const balance = wIncomes - wExpenses;
      const currentDebt = w.type === 'credit' && balance < 0 ? Math.abs(balance) : 0;
      const available = w.type === 'credit' ? (w.limit - currentDebt) : 0;
      return { ...w, balance, currentDebt, available };
    });
  }, [incomes, expenses, wallets]);

  const budgetStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysRemaining = Math.ceil((lastDayOfMonth - now) / (1000 * 60 * 60 * 24));

    return budgets.map(b => {
      const spent = expenses
        .filter(e => e.category === b.category && new Date(e.date).getMonth() === currentMonth && new Date(e.date).getFullYear() === currentYear)
        .reduce((sum, curr) => sum + Number(curr.amount), 0);
      return { ...b, spent, percentage: (spent / b.limit) * 100, daysRemaining };
    });
  }, [budgets, expenses]);

  const totalNetWorth = useMemo(() => walletStats.reduce((sum, curr) => sum + curr.balance, 0), [walletStats]);

  const activeWallet = useMemo(() => {
    if (walletFilter === 'all') return null;
    return walletStats.find(w => w.id === walletFilter);
  }, [walletFilter, walletStats]);

  const filteredData = useMemo(() => {
    const applyDate = (item) => (dateFrom ? item.date >= dateFrom : true) && (dateTo ? item.date <= dateTo : true);
    const fExpenses = expenses.filter(e => applyDate(e) && (walletFilter === 'all' || e.walletId === walletFilter));
    const pie = categories.map(cat => {
      const value = fExpenses.filter(e => e.category === cat).reduce((sum, curr) => sum + Number(curr.amount), 0);
      return { name: cat, value };
    }).filter(item => item.value > 0);
    return { pieData: pie };
  }, [expenses, categories, dateFrom, dateTo, walletFilter]);

  const trendData = useMemo(() => {
    const all = [...incomes.map(i => ({ ...i, type: 'income' })), ...expenses.map(e => ({ ...e, type: 'expense' }))]
      .filter(t => (walletFilter === 'all' || t.walletId === walletFilter) && (dateFrom ? t.date >= dateFrom : true) && (dateTo ? t.date <= dateTo : true))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    let runningSum = 0;
    const data = [];
    const chrono = [...all].sort((a, b) => new Date(a.date) - new Date(b.date));
    for (const t of chrono) {
      runningSum += (t.type === 'income' ? Number(t.amount) : -Number(t.amount));
      data.push({ fecha: t.date, balance: runningSum });
    }
    return data.length > 0 ? data : [{ fecha: '', balance: 0 }];
  }, [incomes, expenses, walletFilter, dateFrom, dateTo]);

  const allTransactions = useMemo(() => {
    let list = [...incomes.map(i => ({ ...i, type: 'income' })), ...expenses.map(e => ({ ...e, type: 'expense' }))];
    list = list.filter(t => {
      const isDate = (dateFrom ? t.date >= dateFrom : true) && (dateTo ? t.date <= dateTo : true);
      const isWallet = walletFilter === 'all' || t.walletId === walletFilter;
      const isCat = categoryFilter === 'all' || (t.type === 'expense' && t.category === categoryFilter) || (t.type === 'income' && t.category === categoryFilter); 
      const isSearch = searchTerm ? t.name.toLowerCase().includes(searchTerm.toLowerCase()) || (t.details && t.details.toLowerCase().includes(searchTerm.toLowerCase())) : true;
      return isDate && isWallet && isCat && isSearch;
    });
    return list.sort((a, b) => sortBy === 'date-desc' ? new Date(b.date) - new Date(a.date) : sortBy === 'date-asc' ? new Date(a.date) - new Date(b.date) : Number(b.amount) - Number(a.amount));
  }, [incomes, expenses, sortBy, searchTerm, walletFilter, categoryFilter, dateFrom, dateTo]);

  // --- HANDLERS ---
  const handleWalletSave = () => { if (!walletForm.name) return; if (walletForm.id) setWallets(wallets.map(w => w.id === walletForm.id ? walletForm : w)); else setWallets([...wallets, { ...walletForm, id: 'w' + Date.now() }]); setModalMode(null); setWalletForm({ id: '', name: '', type: 'cash', limit: 0 }); touchActivity(); };
  const deleteWallet = (id) => { if (window.confirm("¿Eliminar cuenta?")) { setWallets(wallets.filter(w => w.id !== id)); touchActivity(); } };
  const handleGoalSave = () => { if (!goalForm.name || !goalForm.target) return; if (goalForm.id) setGoals(goals.map(g => g.id === goalForm.id ? goalForm : g)); else setGoals([...goals, { ...goalForm, id: 'g' + Date.now() }]); setModalMode(null); setGoalForm({ id: '', name: '', target: '', saved: 0 }); touchActivity(); };
  const handleBudgetSave = () => { if (!budgetForm.category || !budgetForm.limit) return; const exists = budgets.find(b => b.category === budgetForm.category && b.id !== budgetForm.id); if(exists) { alert("Ya existe un presupuesto para esta categoría"); return; } if (budgetForm.id) setBudgets(budgets.map(b => b.id === budgetForm.id ? budgetForm : b)); else setBudgets([...budgets, { ...budgetForm, id: 'b' + Date.now() }]); setModalMode(null); setBudgetForm({ id: '', category: categories[0], limit: '' }); touchActivity(); };
  
  // --- HANDLERS SUSCRIPCIONES ---
  const handleSubSave = () => { if(!subForm.name || !subForm.price) return; if(subForm.id) setSubscriptions(subscriptions.map(s => s.id === subForm.id ? subForm : s)); else setSubscriptions([...subscriptions, {...subForm, id: 's' + Date.now()}]); setModalMode(null); setSubForm({id:'', name:'', price:'', day:1, details:''}); touchActivity(); };
  const deleteSub = (id) => { setSubscriptions(subscriptions.filter(s => s.id !== id)); touchActivity(); };
  const paySub = (sub) => {
    setActiveTab('expense');
    setExpenseForm({ name: sub.name, amount: sub.price, date: new Date().toISOString().split('T')[0], walletId: wallets[0].id, category: 'Suscripciones', details: sub.details });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const subStats = useMemo(() => {
    const monthly = subscriptions.reduce((acc, sub) => acc + Number(sub.price), 0);
    return { monthly, yearly: monthly * 12 };
  }, [subscriptions]);

  // --- HANDLER SIMULADOR ---
  const runSimulation = () => {
    const val = Number(simAmount);
    if(val <= 0) return;
    const msgs = [];
    const futureBalance = totalNetWorth - val;
    
    // Check 1: Saldo total
    if (futureBalance < 0) msgs.push({ type: 'danger', text: "❌ Te quedarás en números rojos (Deuda Total)." });
    else msgs.push({ type: 'success', text: `✅ Tu patrimonio bajará a $${futureBalance.toLocaleString()}, pero sigues solvente.` });

    // Check 2: Presupuestos
    // Usamos una categoría genérica o la primera para el ejemplo
    const impactedBudgets = budgets.filter(b => (b.limit - b.spent) < val);
    if(impactedBudgets.length > 0) {
        msgs.push({ type: 'warning', text: `⚠️ Romperás el presupuesto de: ${impactedBudgets.map(b=>b.category).join(', ')}.` });
    } else {
        msgs.push({ type: 'success', text: "✅ No rompes ningún presupuesto actual." });
    }

    // Check 3: Suscripciones pendientes este mes
    const pendingSubsCost = subscriptions.reduce((acc, s) => acc + Number(s.price), 0);
    if (futureBalance < pendingSubsCost) {
        msgs.push({ type: 'warning', text: "⚠️ Cuidado: No te quedará suficiente para pagar todas tus suscripciones del mes." });
    }

    setSimResult(msgs);
  };

  const addFundsToGoal = (goal) => { const amount = prompt(`Monto a sumar a ${goal.name}:`); if (amount && !isNaN(amount)) { setGoals(goals.map(g => g.id === goal.id ? { ...g, saved: Number(g.saved) + Number(amount) } : g)); touchActivity(); } };
  const deleteGoal = (id) => { setGoals(goals.filter(g => g.id !== id)); touchActivity(); }
  const deleteBudget = (id) => { setBudgets(budgets.filter(b => b.id !== id)); touchActivity(); }
  const handleSave = () => { const isIncome = activeTab === 'income'; const form = isIncome ? incomeForm : expenseForm; if (!form.name || !form.amount) return; const newItem = { ...form, id: editingId || Date.now(), type: activeTab }; if (editingId) { if (isIncome) setIncomes(prev => prev.map(i => i.id === editingId ? newItem : i)); else setExpenses(prev => prev.map(e => e.id === editingId ? newItem : e)); } else { if (isIncome) setIncomes(prev => [...prev, newItem]); else setExpenses(prev => [...prev, newItem]); } setEditingId(null); setIncomeForm({ name: '', amount: '', date: new Date().toISOString().split('T')[0], walletId: 'w3', category: 'Salario', details: '' }); setExpenseForm({ name: '', amount: '', date: new Date().toISOString().split('T')[0], walletId: 'w3', category: 'Vivienda', details: '' }); touchActivity(); };
  const startEdit = (item) => { setEditingId(item.id); setActiveTab(item.type); if (item.type === 'income') setIncomeForm({ ...item }); else setExpenseForm({ ...item }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const deleteItem = (id, type) => { if (type === 'income') setIncomes(prev => prev.filter(i => i.id !== id)); else setExpenses(prev => prev.filter(e => e.id !== id)); touchActivity(); };
  const duplicateTransaction = (item) => { const newItem = { ...item, id: Date.now(), date: new Date().toISOString().split('T')[0] }; if (item.type === 'income') setIncomes(prev => [...prev, newItem]); else setExpenses(prev => [...prev, newItem]); touchActivity(); };
  const addCategory = () => { if (newCat.trim() && !categories.includes(newCat.trim())) { setCategories([...categories, newCat.trim()]); setNewCat(""); touchActivity(); } };
  const handleUpdateCategory = () => { if (!editingCategory.newName.trim()) return setEditingCategory({oldName:'', newName:''}); setCategories(prev => prev.map(c => c === editingCategory.oldName ? editingCategory.newName : c)); setExpenses(prev => prev.map(e => e.category === editingCategory.oldName ? {...e, category: editingCategory.newName} : e)); setEditingCategory({ oldName: '', newName: '' }); touchActivity(); };
  const copyRecurring = (item) => { setActiveTab('expense'); setExpenseForm({ ...expenseForm, name: item.name, amount: item.amount, category: item.category }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const moveBlock = (direction, index) => { const newOrder = [...leftOrder]; const targetIndex = direction === 'up' ? index - 1 : index + 1; if (targetIndex < 0 || targetIndex >= newOrder.length) return; [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]]; setLeftOrder(newOrder); };
  const onPieClick = (data) => { setCategoryFilter(categoryFilter === data.name ? 'all' : data.name); };

  // --- ESTILOS ---
  const cardClass = darkMode ? "bg-slate-900 border-slate-800 shadow-none" : "bg-white border-slate-100 shadow-sm";
  const textClass = darkMode ? "text-slate-100" : "text-slate-800";
  const mutedText = darkMode ? "text-slate-400" : "text-slate-500";
  const borderClass = darkMode ? "border-slate-700" : "border-slate-200";

  return (
    <div className={`min-h-screen pb-12 font-sans transition-colors duration-300 relative overflow-x-hidden ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      
      {/* BACKGROUND WATERMARK */}
      <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center opacity-[0.03] ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ color: themeColor }}>
         <Wallet size={800} strokeWidth={0.5} />
      </div>

      {/* --- MODAL DE GRÁFICA EXPANDIDA --- */}
      {expandedChart && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className={`w-full max-w-4xl h-[80vh] rounded-[3rem] p-6 relative flex flex-col ${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-2xl font-black uppercase flex items-center gap-3 ${textClass}`}>
                        {expandedChart === 'pie' ? <><List/> Detalle de Distribución</> : <><TrendingUp/> Evolución Temporal</>}
                    </h2>
                    <button onClick={() => setExpandedChart(null)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:scale-110 transition-transform">
                        <X size={24} className={textClass}/>
                    </button>
                </div>
                <div className="flex-1 w-full min-h-0">
                    {expandedChart === 'pie' && (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={filteredData.pieData} 
                                    innerRadius="50%" 
                                    outerRadius="80%" 
                                    paddingAngle={4} 
                                    dataKey="value" 
                                    label={({ name, percent }) => {
                                        const value = (percent * 100).toFixed(0);
                                        if (percent >= 0.2) return `${getCategoryIcon(name)} ${value}%`;
                                        return `${value}%`;
                                    }}
                                >
                                    {filteredData.pieData.map((_, i) => <Cell key={i} fill={currentPalette[i % currentPalette.length]} stroke="none" />)}
                                </Pie>
                                <Tooltip contentStyle={{borderRadius: '16px', border:'none', backgroundColor: darkMode ? '#1e293b' : '#fff', color: darkMode ? '#fff' : '#334155'}} />
                                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{color: darkMode ? '#fff' : '#334155', fontWeight: 'bold'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                    {expandedChart === 'trend' && (
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                <defs><linearGradient id="themeGradBig" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={themeColor} stopOpacity={0.5}/><stop offset="95%" stopColor={themeColor} stopOpacity={0}/></linearGradient></defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#e2e8f0"} />
                                <XAxis dataKey="fecha" tick={{fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12}} />
                                <YAxis tick={{fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12}} />
                                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', backgroundColor: darkMode ? '#1e293b' : '#fff', color: darkMode ? '#fff' : '#334155'}} />
                                <Area type="monotone" dataKey="balance" stroke={themeColor} fill="url(#themeGradBig)" strokeWidth={4} />
                            </AreaChart>
                         </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* MODAL SYSTEM */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className={`${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'} rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative z-50`}>
            {/* ... WALLET MODAL ... */}
            {modalMode === 'wallet' && (
              <>
                <h3 className={`text-xl font-black mb-6 flex gap-2 ${textClass}`}><Settings/> {walletForm.id ? 'Editar Cuenta' : 'Nueva Cuenta'}</h3>
                <div className="space-y-4">
                  <input placeholder="Nombre..." className={`w-full p-4 rounded-2xl font-bold outline-none border ${borderClass} ${darkMode?'bg-slate-800':'bg-slate-50'} ${textClass}`} value={walletForm.name} onChange={e => setWalletForm({...walletForm, name: e.target.value})} />
                  <select className={`w-full p-4 rounded-2xl font-bold outline-none border ${borderClass} ${darkMode?'bg-slate-800':'bg-slate-50'} ${textClass}`} value={walletForm.type} onChange={e => setWalletForm({...walletForm, type: e.target.value})}>
                    <option value="cash">Efectivo / Bolsa</option><option value="bank">Débito / Banco</option><option value="credit">Crédito (Deuda)</option>
                  </select>
                  {walletForm.type === 'credit' && <input type="number" placeholder="Cupo Total" className="w-full p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl font-black text-rose-500 outline-none" value={walletForm.limit} onChange={e => setWalletForm({...walletForm, limit: Number(e.target.value)})} />}
                  <div className="flex gap-2"><button onClick={() => setModalMode(null)} className="flex-1 py-4 font-bold text-slate-400">Cancelar</button><button onClick={handleWalletSave} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg">GUARDAR</button></div>
                </div>
              </>
            )}
            
            {/* ... NUEVO: MODAL SUSCRIPCION (DISEÑO MEJORADO) ... */}
            {modalMode === 'sub' && (
              <>
                <h3 className={`text-xl font-black mb-6 flex gap-2 ${textClass}`}><Calendar/> {subForm.id ? 'Editar Suscripción' : 'Nueva Suscripción'}</h3>
                <div className="space-y-4">
                  <div>
                    <label className={`text-[10px] font-black uppercase ml-1 mb-1 block ${mutedText}`}>Nombre del servicio</label>
                    <input placeholder="Ej: Netflix, Spotify..." className={`w-full p-4 rounded-2xl font-bold outline-none border ${borderClass} ${darkMode?'bg-slate-800':'bg-slate-50'} ${textClass}`} value={subForm.name} onChange={e => setSubForm({...subForm, name: e.target.value})} />
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                        <label className={`text-[10px] font-black uppercase ml-1 mb-1 block ${mutedText}`}>Valor (USD)</label>
                        <input type="number" placeholder="$ 0.00" className={`w-full p-4 rounded-2xl font-bold outline-none border ${borderClass} ${darkMode?'bg-slate-800':'bg-slate-50'} ${textClass}`} value={subForm.price} onChange={e => setSubForm({...subForm, price: e.target.value})} />
                    </div>
                    <div className="w-32">
                        <label className={`text-[10px] font-black uppercase ml-1 mb-1 block ${mutedText}`}>Día Renovación</label>
                        <input type="number" min="1" max="31" placeholder="Ej: 15" className={`w-full p-4 rounded-2xl font-bold outline-none border ${borderClass} ${darkMode?'bg-slate-800':'bg-slate-50'} ${textClass}`} value={subForm.day} onChange={e => setSubForm({...subForm, day: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className={`text-[10px] font-black uppercase ml-1 mb-1 block ${mutedText}`}>Detalles (Opcional)</label>
                    <input placeholder="Ej: Plan Familiar 4K" className={`w-full p-4 rounded-2xl text-xs outline-none border ${borderClass} ${darkMode?'bg-slate-800':'bg-slate-50'} ${textClass}`} value={subForm.details} onChange={e => setSubForm({...subForm, details: e.target.value})} />
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button onClick={() => setModalMode(null)} className="flex-1 py-4 font-bold text-slate-400">Cancelar</button>
                    <button onClick={handleSubSave} className="flex-1 py-4 bg-indigo-500 text-white rounded-2xl font-black shadow-lg">{subForm.id ? 'ACTUALIZAR' : 'CREAR'}</button>
                  </div>
                </div>
              </>
            )}

            {/* ... NUEVO: MODAL SIMULADOR ... */}
            {modalMode === 'simulator' && (
              <>
                <h3 className={`text-xl font-black mb-6 flex gap-2 ${textClass}`}><Calculator/> Simulador "What If"</h3>
                <div className="space-y-4">
                  <p className={`text-xs ${mutedText}`}>¿Qué pasa si gasto esto hoy?</p>
                  <input type="number" placeholder="Monto a gastar..." className={`w-full p-4 rounded-2xl font-black text-2xl outline-none border ${borderClass} ${darkMode?'bg-slate-800':'bg-slate-50'} ${textClass}`} value={simAmount} onChange={e => setSimAmount(e.target.value)} />
                  
                  {simResult && (
                    <div className="space-y-2 mt-2">
                        {simResult.map((res, i) => (
                            <div key={i} className={`p-3 rounded-xl text-xs font-bold ${res.type==='danger' ? 'bg-rose-500/10 text-rose-500' : res.type==='warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                {res.text}
                            </div>
                        ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => {setModalMode(null); setSimResult(null); setSimAmount('');}} className="flex-1 py-4 font-bold text-slate-400">Cerrar</button>
                    <button onClick={runSimulation} className="flex-1 py-4 bg-purple-600 text-white rounded-2xl font-black shadow-lg">SIMULAR</button>
                  </div>
                </div>
              </>
            )}

            {/* ... GOAL MODAL ... */}
            {modalMode === 'goal' && (
              <>
                <h3 className={`text-xl font-black mb-6 flex gap-2 ${textClass}`}><Target/> {goalForm.id ? 'Editar Meta' : 'Nueva Meta'}</h3>
                <div className="space-y-4">
                  <input placeholder="Nombre (Ej: Viaje)" className={`w-full p-4 rounded-2xl font-bold outline-none border ${borderClass} ${darkMode?'bg-slate-800':'bg-slate-50'} ${textClass}`} value={goalForm.name} onChange={e => setGoalForm({...goalForm, name: e.target.value})} />
                  <input type="number" placeholder="Meta Total $" className={`w-full p-4 rounded-2xl font-bold outline-none border ${borderClass} ${darkMode?'bg-slate-800':'bg-slate-50'} ${textClass}`} value={goalForm.target} onChange={e => setGoalForm({...goalForm, target: e.target.value})} />
                  <input type="number" placeholder="Ya ahorrado $" className={`w-full p-4 rounded-2xl font-bold outline-none border ${borderClass} ${darkMode?'bg-slate-800':'bg-slate-50'} ${textClass}`} value={goalForm.saved} onChange={e => setGoalForm({...goalForm, saved: e.target.value})} />
                  <div className="flex gap-2"><button onClick={() => setModalMode(null)} className="flex-1 py-4 font-bold text-slate-400">Cancelar</button><button onClick={handleGoalSave} className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-lg">GUARDAR</button></div>
                </div>
              </>
            )}
            {/* ... BUDGET MODAL ... */}
            {modalMode === 'budget' && (
              <>
                <h3 className={`text-xl font-black mb-6 flex gap-2 ${textClass}`}><AlertTriangle/> Presupuesto Mensual</h3>
                <div className="space-y-4">
                  <select className={`w-full p-4 rounded-2xl font-bold outline-none border ${borderClass} ${darkMode?'bg-slate-800':'bg-slate-50'} ${textClass}`} value={budgetForm.category} onChange={e => setBudgetForm({...budgetForm, category: e.target.value})}>
                    {categories.map(c => <option key={c} value={c} className="text-slate-900">{c}</option>)}
                  </select>
                  <input type="number" placeholder="Límite Mensual $" className={`w-full p-4 rounded-2xl font-bold outline-none border ${borderClass} ${darkMode?'bg-slate-800':'bg-slate-50'} ${textClass}`} value={budgetForm.limit} onChange={e => setBudgetForm({...budgetForm, limit: e.target.value})} />
                  <div className="flex gap-2"><button onClick={() => setModalMode(null)} className="flex-1 py-4 font-bold text-slate-400">Cancelar</button><button onClick={handleBudgetSave} className="flex-1 py-4 bg-violet-500 text-white rounded-2xl font-black shadow-lg">DEFINIR</button></div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className={`border-b px-6 py-4 mb-8 sticky top-0 z-40 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 relative z-30 ${darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2" style={{ color: themeColor }}>
                <Wallet size={28} strokeWidth={2.5} />
                <h1 className="text-xl font-black uppercase">FinPlan Pro <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full ml-1">v2.0</span></h1>
            </div>
            
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide transition-all duration-500 
                ${isLate 
                    ? (darkMode ? 'bg-rose-900/30 border-rose-500 text-rose-400 animate-pulse' : 'bg-rose-100 border-rose-200 text-rose-600 animate-pulse') 
                    : (darkMode ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500')
                }`}
            >
                {isLate ? <AlertCircle size={12} /> : <Clock size={12} className={lastActivity !== 'Sin actividad' ? 'text-emerald-500' : 'text-slate-400'} />}
                <span>{isLate ? '¡ACTUALIZA TUS GASTOS!' : `Último: ${lastActivity}`}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* --- NUEVO: BOTÓN SIMULADOR EN HEADER --- */}
            <button onClick={() => setModalMode('simulator')} className={`p-2 rounded-xl flex items-center gap-2 border font-bold text-[10px] uppercase hover:scale-105 transition-transform ${darkMode ? 'bg-purple-900/20 border-purple-500 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-600'}`}>
                <Calculator size={16} /> What If?
            </button>

            <div className={`flex p-1.5 rounded-2xl border items-center gap-2 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100'}`}>
              <select className={`rounded-xl px-2 py-1 text-[10px] font-black uppercase outline-none bg-transparent ${textClass}`} onChange={(e) => {
                const month = e.target.value; const year = dateTo.split('-')[0] || '2025';
                if(month) { const lastDay = new Date(year, month, 0).getDate(); setDateFrom(`${year}-${month.padStart(2, '0')}-01`); setDateTo(`${year}-${month.padStart(2, '0')}-${lastDay}`); }
              }}>
                <option value="">MES</option>{["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"].map((m, i) => <option key={m} value={i+1} className="text-slate-900">{m}</option>)}
              </select>
              <div className="h-4 w-[1px] bg-slate-400 mx-1"></div>
              <button onClick={() => {setDateFrom(""); setDateTo(new Date().toISOString().split('T')[0]);}} className="p-1 text-slate-400 hover:text-blue-500"><RotateCcw size={14}/></button>
              <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-xl ml-2 ${darkMode ? 'bg-amber-500 text-slate-900' : 'bg-slate-900 text-white'}`}>{darkMode ? <Sun size={16}/> : <Moon size={16}/>}</button>
            </div>
            <div className="flex gap-1">{['#3b82f6', '#8b5cf6', '#10b981', '#f43f5e', '#ec4899'].map(c => <button key={c} onClick={() => setThemeColor(c)} className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c }} />)}</div>
          </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        <div className="lg:col-span-4 space-y-6">
          {/* --- TARJETA HERO DINAMICA --- */}
          <div className={`p-6 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group border transition-all duration-300 ${darkMode ? 'bg-slate-900 border-white/5' : 'border-black/5 shadow-2xl'}`} style={{ backgroundColor: darkMode ? '#0f172a' : themeColor }}>
            <div className="relative z-10">
                <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                    {activeWallet ? (
                        <>
                            {activeWallet.type === 'credit' ? <CardIcon size={12}/> : <Wallet size={12}/>}
                            {activeWallet.name}
                        </>
                    ) : (
                        <><PiggyBank size={12}/> Patrimonio Neto Real</>
                    )}
                </p>
                
                {activeWallet && activeWallet.type === 'credit' ? (
                    <div className="mt-2">
                        <div className="flex items-end gap-2 mb-3">
                           <h2 className={`text-4xl font-black tracking-tighter ${privacyMode ? 'blur-md select-none opacity-50' : ''}`}>${activeWallet.currentDebt.toLocaleString()}</h2>
                           <span className="text-xs font-bold text-white/60 mb-1">Deuda Actual</span>
                        </div>
                        <div className="bg-black/20 rounded-2xl p-3 backdrop-blur-sm border border-white/10">
                            <div className="flex justify-between text-[9px] font-black uppercase mb-1.5 text-white/80">
                                <span>Uso del Cupo</span>
                                <span className={privacyMode ? 'blur-[3px]' : ''}>Disponible: ${activeWallet.available.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden mb-1 border border-white/5">
                                <div className="h-full bg-white relative">
                                    <div className="h-full bg-rose-500 absolute top-0 left-0 transition-all duration-1000 shadow-[0_0_10px_rgba(244,63,94,0.6)]" style={{ width: `${Math.min(100, (activeWallet.currentDebt / activeWallet.limit) * 100)}%` }} />
                                </div>
                            </div>
                            <div className="text-right text-[8px] font-bold text-white/50">Cupo Total: ${activeWallet.limit.toLocaleString()}</div>
                        </div>
                    </div>
                ) : (
                    <h2 className={`text-4xl font-black tracking-tighter transition-all duration-300 ${(!activeWallet && totalNetWorth < 0) || (activeWallet && activeWallet.balance < 0) ? 'text-rose-200' : 'text-white'} ${privacyMode ? 'blur-md select-none opacity-50' : ''}`}>
                        ${activeWallet ? activeWallet.balance.toLocaleString() : totalNetWorth.toLocaleString()}
                    </h2>
                )}
            </div>
            
            <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 group-hover:scale-110 transition-transform">
                {activeWallet && activeWallet.type === 'credit' ? <CreditCard size={140}/> : <Wallet size={120}/>}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center px-4">
                <p className={`text-[10px] font-black uppercase tracking-widest ${mutedText}`}>Mis Cuentas</p>
                <div className="flex items-center gap-1">
                    <button onClick={() => setPrivacyMode(!privacyMode)} className={`p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${mutedText}`} title="Ocultar saldos">
                        {privacyMode ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                    <button onClick={() => toggleSection('wallets')} className={`p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${mutedText}`} title="Minimizar">
                        {sectionState.wallets ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </button>
                    <button onClick={() => { setWalletForm({id:'', name:'', type:'cash', limit:0}); setModalMode('wallet'); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">
                        <PlusCircle size={18}/>
                    </button>
                </div>
            </div>
            
            {sectionState.wallets && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
                    {walletStats.map(w => (
                    <div key={w.id} onClick={() => setWalletFilter(w.id === walletFilter ? 'all' : w.id)} className={`p-4 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${cardClass} ${w.id === walletFilter ? 'ring-2' : ''}`} style={w.id === walletFilter ? { borderColor: themeColor } : {}}>
                        <div className="relative z-10 flex justify-between items-start mb-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl" style={{ backgroundColor: `${themeColor}20`, color: themeColor }}>{w.type === 'credit' ? <CreditCard size={18}/> : <Wallet size={18}/>}</div>
                            <div><p className={`text-xs font-bold ${textClass}`}>{w.name}</p>{w.type === 'credit' && <p className={`text-[8px] font-black text-rose-500 uppercase transition-all duration-300 ${privacyMode ? 'blur-[3px]' : ''}`}>Usado: ${w.currentDebt.toLocaleString()}</p>}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className={`font-black text-sm transition-all duration-300 ${w.balance < 0 ? 'text-rose-500' : 'text-emerald-500'} ${privacyMode ? 'blur-[6px] select-none bg-slate-200/50 dark:bg-slate-800/50 rounded text-transparent' : ''}`}>${w.balance.toLocaleString()}</span>
                            <div className="flex gap-1">
                            <button onClick={(e) => { e.stopPropagation(); setWalletForm(w); setModalMode('wallet'); }} className={`p-1 hover:text-blue-500 transition-colors ${mutedText}`}><Settings size={14}/></button>
                            <button onClick={(e) => { e.stopPropagation(); deleteWallet(w.id); }} className={`p-1 hover:text-rose-500 transition-colors ${mutedText}`}><Trash2 size={14}/></button>
                            </div>
                        </div>
                        </div>
                        {w.type === 'credit' && (
                        <div className="relative z-10 mt-1">
                            <div className="flex justify-between text-[7px] font-black uppercase mb-1"><span className="text-rose-400">Deuda</span><span className={`text-emerald-500 font-bold transition-all duration-300 ${privacyMode ? 'blur-[3px]' : ''}`}>Libre: ${w.available.toLocaleString()}</span></div>
                            <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <div className="w-full h-full bg-emerald-400 relative">
                                <div className="h-full bg-rose-500 absolute top-0 left-0 transition-all duration-1000" style={{ width: `${Math.min(100, (w.currentDebt / w.limit) * 100)}%` }} />
                            </div>
                            </div>
                        </div>
                        )}
                    </div>
                    ))}
                </div>
            )}
          </div>

          {leftOrder.map((block, index) => {
            const upBtn = <button onClick={() => moveBlock('up', index)} className={`p-1 hover:text-blue-500 ${mutedText}`}><ArrowUp size={12}/></button>;
            const downBtn = <button onClick={() => moveBlock('down', index)} className={`p-1 hover:text-blue-500 ${mutedText}`}><ArrowDown size={12}/></button>;
            const isVisible = sectionState[block];
            const toggleBtn = <button onClick={() => toggleSection(block)} className={`p-1 hover:text-blue-500 ${mutedText}`}>{isVisible ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}</button>;
            
            const ctrls = <div className="absolute right-4 top-4 flex gap-1 z-20">{toggleBtn}<div className="w-[1px] h-3 bg-slate-300 mx-1 self-center"></div>{upBtn}{downBtn}</div>;

            if(block === 'form') return (
              <section key="form" className={`p-5 rounded-[2.2rem] border relative transition-all ${cardClass} ${editingId ? 'ring-2 ring-amber-400' : ''}`}>
                {ctrls}
                <div className={`mb-4 flex items-center gap-2 ${!isVisible ? 'mb-0' : ''}`}><Sparkles size={14} className="text-indigo-500"/><span className={`text-[10px] font-black uppercase ${mutedText}`}>Registro Rápido</span></div>
                
                {isVisible && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className={`flex items-center gap-2 p-3 rounded-2xl border-2 mb-4 transition-all ${darkMode ? 'bg-slate-950 border-indigo-900' : 'bg-white border-indigo-100'}`} style={{ borderColor: magicText ? themeColor : undefined }}>
                      <Sparkles size={18} className={magicText ? "text-indigo-500 animate-pulse" : "text-slate-300"} />
                      <input placeholder="✨ Magic: 'Cena $25 en Mcdonalds...'" className={`flex-1 bg-transparent outline-none text-sm font-bold ${textClass}`} value={magicText} onChange={e => setMagicText(e.target.value)} onKeyPress={e => e.key === 'Enter' && applyMagic()} />
                      {magicPreview && <button onClick={applyMagic} className="bg-indigo-500 text-white p-1 rounded-lg"><ArrowRightCircle size={14}/></button>}
                    </div>

                    <div className={`flex p-1 rounded-2xl mb-4 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <button onClick={() => setActiveTab('expense')} className={`flex-1 py-2 rounded-xl font-bold text-xs ${activeTab === 'expense' ? (darkMode ? 'bg-slate-700 text-rose-400 shadow-lg' : 'bg-white text-rose-500 shadow-sm') : 'text-slate-500'}`}>Gasto</button>
                      <button onClick={() => setActiveTab('income')} className={`flex-1 py-2 rounded-xl font-bold text-xs ${activeTab === 'income' ? (darkMode ? 'bg-slate-700 text-emerald-400 shadow-lg' : 'bg-white text-emerald-500 shadow-sm') : 'text-slate-500'}`}>Ingreso</button>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input type="date" className={`p-3 rounded-xl text-xs font-bold outline-none border ${borderClass} ${darkMode?'bg-slate-800':'bg-slate-50'} ${textClass}`} value={activeTab === 'expense' ? expenseForm.date : incomeForm.date} onChange={e => activeTab === 'expense' ? setExpenseForm({...expenseForm, date: e.target.value}) : setIncomeForm({...incomeForm, date: e.target.value})} />
                        <select className={`p-3 rounded-xl text-xs font-bold outline-none border ${borderClass} ${darkMode?'bg-slate-800':'bg-slate-50'} ${textClass}`} value={activeTab === 'expense' ? expenseForm.walletId : incomeForm.walletId} onChange={e => activeTab === 'expense' ? setExpenseForm({...expenseForm, walletId: e.target.value}) : setIncomeForm({...incomeForm, walletId: e.target.value})}>{wallets.map(w => <option key={w.id} value={w.id} className="text-slate-900">{w.name}</option>)}</select>
                      </div>
                      
                      {activeTab === 'expense' ? (
                        <select className={`w-full p-3 rounded-xl text-xs font-bold uppercase outline-none border ${borderClass} ${darkMode?'bg-slate-800':'bg-slate-50'} ${textClass}`} value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}>
                          {categories.map(c => <option key={c} value={c} className="text-slate-900">{c}</option>)}
                        </select>
                      ) : (
                        <select className={`w-full p-3 rounded-xl text-xs font-bold uppercase outline-none border ${borderClass} ${darkMode?'bg-slate-800':'bg-slate-50'} ${textClass}`} value={incomeForm.category} onChange={e => setIncomeForm({...incomeForm, category: e.target.value})}>
                          {incomeCategories.map(c => <option key={c} value={c} className="text-slate-900">{c}</option>)}
                        </select>
                      )}

                      <input placeholder="Concepto..." className={`w-full p-3 rounded-xl text-sm outline-none border ${borderClass} ${darkMode?'bg-slate-800':'bg-slate-50'} ${textClass}`} value={activeTab === 'expense' ? expenseForm.name : incomeForm.name} onChange={e => activeTab === 'expense' ? setExpenseForm({...expenseForm, name: e.target.value}) : setIncomeForm({...incomeForm, name: e.target.value})} />
                      <input type="number" placeholder="Monto" className={`w-full p-3 rounded-xl font-black text-xl outline-none border ${borderClass} ${darkMode?'bg-slate-800':'bg-slate-50'} ${textClass}`} value={activeTab === 'expense' ? expenseForm.amount : incomeForm.amount} onChange={e => activeTab === 'expense' ? setExpenseForm({...expenseForm, amount: e.target.value}) : setIncomeForm({...incomeForm, amount: e.target.value})} />
                      <textarea placeholder="Notas opcionales..." className={`w-full p-3 rounded-xl text-xs outline-none border resize-none ${borderClass} ${darkMode?'bg-slate-800':'bg-slate-50'} ${textClass}`} rows="2" value={activeTab === 'expense' ? expenseForm.details : incomeForm.details} onChange={e => activeTab === 'expense' ? setExpenseForm({...expenseForm, details: e.target.value}) : setIncomeForm({...incomeForm, details: e.target.value})} />
                      <button onClick={handleSave} className="w-full py-4 rounded-2xl font-black text-white shadow-lg active:scale-95 transition-all" style={{ backgroundColor: themeColor }}>{editingId ? 'ACTUALIZAR' : 'REGISTRAR'}</button>
                    </div>
                  </div>
                )}
              </section>
            );

            // --- NUEVO: BLOQUE SUSCRIPCIONES (DISEÑO MEJORADO) ---
            if(block === 'subscriptions') return (
                <section key="subscriptions" className={`p-6 rounded-[2.5rem] border relative transition-all ${cardClass}`}>
                    {ctrls}
                    <div className={`flex justify-between items-center ${isVisible ? 'mb-4 pr-28' : ''}`}>
                        <h3 className={`text-[10px] font-black uppercase flex items-center gap-2 ${mutedText}`}><Calendar size={14}/> Suscripciones</h3>
                        {isVisible && <button onClick={()=>{setSubForm({id:'', name:'', price:'', day:1, details:''}); setModalMode('sub');}} className="p-1.5 text-indigo-500 bg-indigo-500/10 rounded-lg hover:bg-indigo-500/20 transition-colors"><Plus size={18}/></button>}
                    </div>
                    {isVisible && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                             <div className="space-y-3 max-h-56 overflow-y-auto mb-3 pr-1">
                                {subscriptions.length === 0 && <p className="text-xs text-center text-slate-400 italic py-2">Sin suscripciones</p>}
                                {subscriptions.map(s => {
                                    return (
                                        <div key={s.id} className={`p-3 rounded-xl border flex items-center justify-between group ${borderClass} ${darkMode ? 'bg-slate-800/30' : 'bg-slate-50'}`}>
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center font-black text-sm text-white bg-indigo-500 shadow-sm`}>
                                                    {s.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-xs font-bold truncate ${textClass}`}>{s.name}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                                                        <span>📅 Día {s.day}</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                        <span>${Number(s.price).toLocaleString()}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 shrink-0">
                                                <button onClick={() => paySub(s)} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors" title="Registrar Pago"><Zap size={14}/></button>
                                                <button onClick={() => {setSubForm(s); setModalMode('sub');}} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors" title="Editar"><Edit3 size={14}/></button>
                                                <button onClick={() => deleteSub(s.id)} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-colors" title="Eliminar"><Trash2 size={14}/></button>
                                            </div>
                                        </div>
                                    )
                                })}
                             </div>
                             {subscriptions.length > 0 && (
                                 <div className={`p-4 rounded-2xl border flex justify-between items-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-indigo-50 border-indigo-100'}`}>
                                     <div className="flex flex-col">
                                         <span className="text-[9px] font-black uppercase text-indigo-400">Mensual</span>
                                         <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">${subStats.monthly.toLocaleString()}</span>
                                     </div>
                                     <div className="h-8 w-[1px] bg-indigo-200 dark:bg-slate-600"></div>
                                     <div className="flex flex-col text-right">
                                         <span className="text-[9px] font-black uppercase text-rose-400">Anual</span>
                                         <span className="text-lg font-black text-rose-500">${subStats.yearly.toLocaleString()}</span>
                                     </div>
                                 </div>
                             )}
                        </div>
                    )}
                </section>
            );

            if(block === 'goals') return (
              <section key="goals" className={`p-6 rounded-[2.5rem] border relative transition-all ${cardClass}`}>
                {ctrls}
                <div className={`flex justify-between items-center ${isVisible ? 'mb-4 pr-16' : ''}`}><h3 className={`text-[10px] font-black uppercase flex items-center gap-2 ${mutedText}`}><Target size={14}/> Metas de Ahorro</h3>{isVisible && <button onClick={()=>{setGoalForm({id:'', name:'', target:'', saved:0}); setModalMode('goal');}} className="p-1 text-emerald-500 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20"><Plus size={16}/></button>}</div>
                {isVisible && <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">{goals.map(g => (<div key={g.id} className={`p-3 rounded-xl border ${borderClass} ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}><div className="flex justify-between mb-1"><span className={`text-xs font-bold ${textClass}`}>{g.name}</span><span className="text-[10px] font-bold text-emerald-500">${Number(g.saved).toLocaleString()} / ${Number(g.target).toLocaleString()}</span></div><div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2"><div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (g.saved / g.target) * 100)}%` }}/></div><div className="flex justify-end gap-2"><button onClick={() => deleteGoal(g.id)} className="p-1.5 text-rose-400 bg-rose-400/10 rounded-lg"><Trash2 size={12}/></button><button onClick={() => { setGoalForm(g); setModalMode('goal'); }} className="p-1.5 text-blue-400 bg-blue-400/10 rounded-lg"><Edit3 size={12}/></button><button onClick={() => addFundsToGoal(g)} className="px-2 py-1 text-[9px] font-bold text-white bg-emerald-500 rounded-lg">+ Fondos</button></div></div>))}</div>}
              </section>
            );

            if(block === 'budgets') return (
              <section key="budgets" className={`p-6 rounded-[2.5rem] border relative transition-all ${cardClass}`}>
                {ctrls}
                <div className={`flex justify-between items-center ${isVisible ? 'mb-4 pr-16' : ''}`}><h3 className={`text-[10px] font-black uppercase flex items-center gap-2 ${mutedText}`}><AlertTriangle size={14}/> Presupuestos</h3>{isVisible && <button onClick={()=>{setBudgetForm({id:'', category:categories[0], limit:''}); setModalMode('budget');}} className="p-1 text-violet-500 bg-violet-500/10 rounded-lg"><Plus size={16}/></button>}</div>
                {isVisible && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        {budgetStats.map(b => (
                            <div 
                                key={b.id} 
                                onClick={() => handleBudgetClick(b.category)}
                                className={`p-3 rounded-xl border cursor-pointer hover:scale-[1.02] transition-transform ${borderClass} ${darkMode?'bg-slate-800/50':'bg-slate-50'}`}
                            >
                                <div className="flex justify-between mb-1">
                                    <div className="flex flex-col">
                                        <span className={`text-xs font-bold ${textClass}`}>{b.category}</span>
                                        <span className={`text-[8px] font-bold ${mutedText}`}>Reinicia en {b.daysRemaining} días</span>
                                    </div>
                                    <span className={`text-[10px] font-black ${b.percentage>100?'text-rose-500':'text-violet-500'}`}>${b.spent.toLocaleString()} / ${Number(b.limit).toLocaleString()}</span>
                                </div>
                                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-1">
                                    <div className={`h-full ${b.percentage>100?'bg-rose-500':'bg-violet-500'}`} style={{ width: `${Math.min(100, b.percentage)}%` }}/>
                                </div>
                                <div className="flex justify-end">
                                    <button onClick={(e) => { e.stopPropagation(); deleteBudget(b.id); }} className="text-[9px] text-rose-400 hover:text-rose-600">Eliminar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
              </section>
            );

            if(block === 'categories') return (
              <section key="categories" className={`p-6 rounded-[2.5rem] border relative transition-all ${cardClass}`}>
                {ctrls}
                <h3 className={`font-bold text-[10px] uppercase ${isVisible ? 'mb-4' : ''} flex items-center gap-2 ${mutedText}`}><Settings size={14}/> Categorías</h3>
                {isVisible && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex gap-2 mb-4"><input placeholder="Nueva..." className={`flex-1 p-2.5 text-sm rounded-xl outline-none border ${borderClass} ${darkMode?'bg-slate-800':'bg-slate-50'} ${textClass}`} value={newCat} onChange={e => setNewCat(e.target.value)} onKeyPress={(e) => {if(e.key==='Enter'&&newCat) addCategory();}} /><button onClick={addCategory} className="bg-slate-900 text-white p-2.5 rounded-xl"><PlusCircle size={20}/></button></div>
                    <div className="flex flex-wrap gap-2">{categories.map(c => (<div key={c} className="group relative">{editingCategory.oldName===c ? <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-lg p-1"><input autoFocus className="text-[10px] bg-white px-2 py-1 rounded w-20 font-bold outline-none text-slate-800" value={editingCategory.newName} onChange={e => setEditingCategory({...editingCategory, newName: e.target.value})} onBlur={handleUpdateCategory} onKeyPress={e => e.key === 'Enter' && handleUpdateCategory()} /></div> : <span className={`text-[10px] px-3 py-1.5 rounded-lg font-bold border flex items-center gap-2 transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>{c}<button onClick={() => setEditingCategory({ oldName: c, newName: c })} className="text-slate-400 hover:text-blue-500"><Edit3 size={12}/></button><button onClick={() => setCategories(categories.filter(cat => cat !== c))} className="text-rose-400 font-bold">×</button></span>}</div>))}</div>
                  </div>
                )}
              </section>
            );

            if(block === 'recurring') return (
              <section key="recurring" className={`p-6 rounded-[2.5rem] border relative transition-all ${cardClass}`}>
                {ctrls}
                <h3 className={`text-[10px] font-black uppercase ${isVisible ? 'mb-4' : ''} flex items-center gap-2 ${mutedText}`}><Repeat size={14} style={{ color: themeColor }}/> Programados (Varios)</h3>
                {isVisible && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex gap-2 mb-4"><input placeholder="Fijo..." className={`flex-1 p-2.5 text-xs rounded-xl outline-none border ${borderClass} ${darkMode?'bg-slate-800':'bg-slate-50'} ${textClass}`} value={recurringForm.name} onChange={e => setRecurringForm({...recurringForm, name: e.target.value})} /><input type="number" placeholder="$" className={`w-20 p-2.5 text-xs rounded-xl outline-none border ${borderClass} ${darkMode?'bg-slate-800':'bg-slate-50'} ${textClass}`} value={recurringForm.amount} onChange={e => setRecurringForm({...recurringForm, amount: e.target.value})} /><button onClick={()=>{if(recurringForm.name)setRecurring([...recurring,{...recurringForm,id:Date.now()}]);setRecurringForm({name:'',amount:'',category:'Vivienda'});}} className="bg-slate-900 text-white p-2.5 rounded-xl"><PlusCircle size={18}/></button></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto">{recurring.map(item => (<div key={item.id} className={`flex items-center justify-between p-3 rounded-xl border ${borderClass} ${darkMode?'bg-slate-800/50':'bg-slate-50'}`}><div className="truncate"><p className={`text-[10px] font-black uppercase truncate ${textClass}`}>{item.name}</p><p className="text-[10px] font-bold text-slate-400">${Number(item.amount).toLocaleString()}</p></div><div className="flex gap-1"><button onClick={() => copyRecurring(item)} className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg"><ArrowRightCircle size={14}/></button><button onClick={() => setRecurring(recurring.filter(r=>r.id!==item.id))} className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg"><Trash2 size={14}/></button></div></div>))}</div>
                  </div>
                )}
              </section>
            );
            return null;
          })}
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PIE CHART */}
            <div className={`p-6 rounded-[2.5rem] border min-h-[460px] flex flex-col relative ${cardClass}`}>
              <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-bold text-[10px] uppercase tracking-widest ${mutedText}`}>Distribución</h3>
                  <button onClick={() => setExpandedChart('pie')} className="p-1.5 text-slate-400 hover:text-blue-500 rounded-lg transition-colors"><Maximize2 size={16}/></button>
              </div>
              <div className="flex-1 w-full h-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={filteredData.pieData} 
                      innerRadius="55%" 
                      outerRadius="75%" 
                      paddingAngle={6} 
                      dataKey="value" 
                      cx="50%" 
                      cy="45%" 
                      onClick={onPieClick} 
                      cursor="pointer"
                      label={({ name, percent }) => {
                          const value = (percent * 100).toFixed(0);
                          if (percent >= 0.2) return `${getCategoryIcon(name)} ${value}%`;
                          return `${value}%`;
                      }}
                    >
                      {filteredData.pieData.map((_, i) => <Cell key={i} fill={currentPalette[i % currentPalette.length]} stroke="none" />)}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '16px', border:'none', backgroundColor: darkMode ? '#1e293b' : '#fff', color: darkMode ? '#fff' : '#334155'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* AREA CHART */}
            <div className={`p-6 rounded-[2.5rem] border min-h-[460px] flex flex-col relative ${cardClass}`}>
              <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-bold text-[10px] uppercase tracking-widest text-emerald-500`}>Línea de Tiempo</h3>
                  <button onClick={() => setExpandedChart('trend')} className="p-1.5 text-slate-400 hover:text-emerald-500 rounded-lg transition-colors"><Maximize2 size={16}/></button>
              </div>
              <div className="flex-1 w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 20, right: 15, left: -10, bottom: 20 }}>
                    <defs><linearGradient id="themeGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={themeColor} stopOpacity={0.3}/><stop offset="95%" stopColor={themeColor} stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#f1f5f9"} />
                    <XAxis 
                      dataKey="fecha" 
                      hide={false} 
                      axisLine={false}
                      tickLine={false}
                      tick={{fontSize: 10, fill: darkMode ? '#94a3b8' : '#64748b'}}
                      tickFormatter={(value) => {
                        if (!value) return '';
                        const [, month, day] = value.split('-'); 
                        return `${day} ${['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][parseInt(month)-1]}`;
                      }}
                      interval="preserveStartEnd"
                      minTickGap={30}
                    />
                    <YAxis tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', backgroundColor: darkMode ? '#1e293b' : '#fff', color: darkMode ? '#fff' : '#334155'}} />
                    <Area type="monotone" dataKey="balance" stroke={themeColor} fill="url(#themeGrad)" strokeWidth={3} animationDuration={1200} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div ref={historyRef} className={`rounded-[2.5rem] border overflow-hidden ${cardClass}`}>
            <div className={`p-6 md:p-8 border-b flex flex-col gap-4 ${darkMode ? 'bg-slate-900/50' : 'bg-slate-50/50'}`}>
              <div className="flex justify-between items-center w-full"><h3 className={`font-black text-lg flex items-center gap-2 ${textClass}`}><List size={18} style={{ color: themeColor }}/> Historial General</h3><div className="relative md:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/><input placeholder="Buscar..." className={`pl-9 pr-4 py-2 border rounded-xl text-xs w-full font-bold outline-none ${borderClass} ${darkMode ? 'bg-slate-800' : 'bg-white'} ${textClass}`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></div>
              <div className="flex flex-wrap gap-2">
                <select value={walletFilter} onChange={(e) => {
                    const val = e.target.value;
                    setWalletFilter(val);
                    if (val === 'all') {
                        setSectionState(prev => ({ ...prev, wallets: true }));
                    }
                }} className={`text-[10px] font-black uppercase px-3 py-2 rounded-xl border outline-none bg-transparent ${textClass}`}><option value="all">🏦 Todas las Wallets</option>{wallets.map(w => <option key={w.id} value={w.id} className="text-slate-900">{w.name}</option>)}</select>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={`text-[10px] font-black uppercase px-3 py-2 rounded-xl border outline-none bg-transparent ${textClass}`}><option value="all">🏷️ Todas Categorías</option>{categories.map(c => <option key={c} value={c} className="text-slate-900">{c}</option>)}</select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`text-[10px] font-black uppercase px-4 py-2 rounded-xl border outline-none bg-transparent ${textClass}`}><option value="date-desc">📅 Recientes</option><option value="date-asc">📅 Antiguos</option><option value="amount-desc">💰 Monto Max</option></select>
              </div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto px-4 py-2">
              {allTransactions.map(item => {
                const wallet = wallets.find(w => w.id === item.walletId);
                return (
                  <div key={item.id} className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 group rounded-2xl my-1 flex items-center justify-between text-left ${item.id === editingId ? 'ring-2 ring-amber-400' : ''}`}>
                    <div className="flex gap-4 items-center flex-1 min-w-0">
                      <div className={`p-3 rounded-2xl ${item.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{item.type === 'income' ? <ArrowUpCircle size={22}/> : <ArrowDownCircle size={22}/>}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap truncate">
                          <h4 className={`font-bold text-sm ${textClass}`}>{item.name}</h4>
                          <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`} style={{color: !darkMode ? themeColor : undefined}}>{item.type === 'expense' ? item.category : 'Ingreso'}</span>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase ${borderClass}`} style={{ color: themeColor }}>{wallet?.name || 'Borrada'}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 shrink-0 min-w-0"><p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{item.date}</p>{item.details && <p className="text-[10px] text-slate-500 italic truncate max-w-[200px]">"{item.details}"</p>}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-black text-xl tracking-tighter mr-3 ${item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>${Number(item.amount).toLocaleString()}</span>
                      <div className="flex opacity-0 group-hover:opacity-100 transition-all gap-1"><button onClick={() => startEdit(item)} className={`p-2 hover:text-blue-500 ${mutedText}`}><Edit3 size={16}/></button><button onClick={() => duplicateTransaction(item)} className={`p-2 hover:text-emerald-500 ${mutedText}`}><Copy size={16}/></button><button onClick={() => deleteItem(item.id, item.type)} className={`p-2 hover:text-rose-500 ${mutedText}`}><Trash2 size={16}/></button></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;