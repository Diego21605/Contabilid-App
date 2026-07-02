import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  User as UserIcon, 
  Lock, 
  Mail, 
  LogOut, 
  Plus, 
  Trash2, 
  Code, 
  LayoutDashboard, 
  CheckCircle, 
  Copy, 
  FileText, 
  Check, 
  Loader2, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity,
  Sparkles,
  RefreshCw,
  FolderOpen,
  Layers,
  Wallet,
  CreditCard,
  Search,
  Calendar,
  Filter,
  PlusCircle,
  ArrowLeftRight,
  Landmark,
  Banknote,
  Smartphone,
  Coins,
  Paperclip,
  Eye,
  Edit2,
  Building2,
  Tv,
  PieChart,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  getDocFromServer,
  updateDoc,
  setDoc
} from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError } from './firebase';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

// Modelos locales para simular
interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  accountId?: string;
  cuentaId?: string;
  attachment?: string;
  attachmentName?: string;
  adjunto?: string;
}

// Helpers para renderizar iconos y colores de cuentas
const renderAccountIcon = (iconName: string, className = "w-4 h-4") => {
  switch (iconName) {
    case 'landmark': return <Landmark className={className} />;
    case 'credit-card': return <CreditCard className={className} />;
    case 'banknote': return <Banknote className={className} />;
    case 'smartphone': return <Smartphone className={className} />;
    case 'dollar-sign': return <DollarSign className={className} />;
    case 'coins': return <Coins className={className} />;
    default: return <Wallet className={className} />;
  }
};

const getAccountColorStyles = (colorName: string) => {
  switch (colorName) {
    case 'emerald': return {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      border: 'border-emerald-500/30 hover:border-emerald-500/50',
      glow: 'shadow-emerald-500/5',
      text: 'text-emerald-400'
    };
    case 'blue': return {
      bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      border: 'border-blue-500/30 hover:border-blue-500/50',
      glow: 'shadow-blue-500/5',
      text: 'text-blue-400'
    };
    case 'rose': return {
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      border: 'border-rose-500/30 hover:border-rose-500/50',
      glow: 'shadow-rose-500/5',
      text: 'text-rose-400'
    };
    case 'red': return {
      bg: 'bg-red-500/10 border-red-500/20 text-red-400',
      border: 'border-red-500/30 hover:border-red-500/50',
      glow: 'shadow-red-500/5',
      text: 'text-red-400'
    };
    case 'purple': return {
      bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      border: 'border-purple-500/30 hover:border-purple-500/50',
      glow: 'shadow-purple-500/5',
      text: 'text-purple-400'
    };
    case 'amber': return {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      border: 'border-amber-500/30 hover:border-amber-500/50',
      glow: 'shadow-amber-500/5',
      text: 'text-amber-400'
    };
    case 'yellow': return {
      bg: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
      border: 'border-yellow-500/30 hover:border-yellow-500/50',
      glow: 'shadow-yellow-500/5',
      text: 'text-yellow-400'
    };
    case 'indigo': return {
      bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
      border: 'border-indigo-500/30 hover:border-indigo-500/50',
      glow: 'shadow-indigo-500/5',
      text: 'text-indigo-400'
    };
    default: return {
      bg: 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400',
      border: 'border-zinc-500/30 hover:border-zinc-500/50',
      glow: 'shadow-zinc-500/5',
      text: 'text-zinc-400'
    };
  }
};

// Detalle artístico y normalización de categorías con Emojis, Nombres y Paletas de Colores de alta calidad
export const getCategoryDetails = (category: string) => {
  if (!category) return { emoji: '📦', name: 'Otros', color: 'from-slate-500 to-slate-600', textCol: 'text-slate-400', bgCol: 'bg-slate-500/10 border-slate-500/20' };
  
  const normalized = category.toLowerCase().trim();
  
  if (normalized.includes('aliment') || normalized.includes('alimento') || normalized.includes('comida') || normalized.includes('🍔')) {
    return { emoji: '🍔', name: 'Alimentación', color: 'from-amber-400 to-orange-500', textCol: 'text-amber-400', bgCol: 'bg-amber-500/10 border-amber-500/20' };
  }
  if (normalized.includes('transport') || normalized.includes('auto') || normalized.includes('carro') || normalized.includes('🚗')) {
    return { emoji: '🚗', name: 'Transporte', color: 'from-blue-400 to-indigo-500', textCol: 'text-blue-400', bgCol: 'bg-blue-500/10 border-blue-500/20' };
  }
  if (normalized.includes('hogar') || normalized.includes('alquiler') || normalized.includes('casa') || normalized.includes('renta') || normalized.includes('🏠')) {
    return { emoji: '🏠', name: 'Hogar', color: 'from-purple-400 to-violet-500', textCol: 'text-purple-400', bgCol: 'bg-purple-500/10 border-purple-500/20' };
  }
  if (normalized.includes('entretenimiento') || normalized.includes('ocio') || normalized.includes('diversión') || normalized.includes('cine') || normalized.includes('🎬')) {
    return { emoji: '🎬', name: 'Entretenimiento', color: 'from-pink-400 to-rose-500', textCol: 'text-pink-400', bgCol: 'bg-pink-500/10 border-pink-500/20' };
  }
  if (normalized.includes('compra') || normalized.includes('tienda') || normalized.includes('shopping') || normalized.includes('🛒')) {
    return { emoji: '🛒', name: 'Compras', color: 'from-emerald-400 to-teal-500', textCol: 'text-emerald-400', bgCol: 'bg-emerald-500/10 border-emerald-500/20' };
  }
  if (normalized.includes('salud') || normalized.includes('medicina') || normalized.includes('médico') || normalized.includes('🏥')) {
    return { emoji: '🏥', name: 'Salud', color: 'from-red-400 to-rose-600', textCol: 'text-red-400', bgCol: 'bg-red-500/10 border-red-500/20' };
  }
  if (normalized.includes('educa') || normalized.includes('colegio') || normalized.includes('estudio') || normalized.includes('🎓')) {
    return { emoji: '🎓', name: 'Educación', color: 'from-sky-400 to-blue-500', textCol: 'text-sky-400', bgCol: 'bg-sky-500/10 border-sky-500/20' };
  }
  if (normalized.includes('viaje') || normalized.includes('vuelo') || normalized.includes('✈️')) {
    return { emoji: '✈️', name: 'Viajes', color: 'from-cyan-400 to-blue-400', textCol: 'text-cyan-400', bgCol: 'bg-cyan-500/10 border-cyan-500/20' };
  }
  if (normalized.includes('mascota') || normalized.includes('perro') || normalized.includes('gato') || normalized.includes('🐶')) {
    return { emoji: '🐶', name: 'Mascotas', color: 'from-yellow-500 to-amber-600', textCol: 'text-yellow-400', bgCol: 'bg-yellow-500/10 border-yellow-500/20' };
  }
  if (normalized.includes('trabajo') || normalized.includes('oficina') || normalized.includes('empleo') || normalized.includes('💼')) {
    return { emoji: '💼', name: 'Trabajo', color: 'from-neutral-400 to-neutral-600', textCol: 'text-neutral-300', bgCol: 'bg-neutral-500/10 border-neutral-500/20' };
  }
  if (normalized.includes('tarjeta') || normalized.includes('crédito') || normalized.includes('💳')) {
    return { emoji: '💳', name: 'Tarjetas', color: 'from-orange-400 to-red-500', textCol: 'text-orange-400', bgCol: 'bg-orange-500/10 border-orange-500/20' };
  }
  if (normalized.includes('servicio') || normalized.includes('luz') || normalized.includes('agua') || normalized.includes('gas') || normalized.includes('💡')) {
    return { emoji: '💡', name: 'Servicios', color: 'from-yellow-300 to-yellow-500', textCol: 'text-yellow-300', bgCol: 'bg-yellow-500/10 border-yellow-500/20' };
  }
  if (normalized.includes('suscrip') || normalized.includes('netflix') || normalized.includes('spotify') || normalized.includes('📱')) {
    return { emoji: '📱', name: 'Suscripciones', color: 'from-rose-400 to-indigo-500', textCol: 'text-rose-400', bgCol: 'bg-rose-500/10 border-rose-500/20' };
  }
  if (normalized.includes('regalo') || normalized.includes('detalle') || normalized.includes('🎁')) {
    return { emoji: '🎁', name: 'Regalos', color: 'from-red-400 to-pink-500', textCol: 'text-red-400', bgCol: 'bg-red-500/10 border-red-500/20' };
  }
  if (normalized.includes('sueldo') || normalized.includes('salario') || normalized.includes('💰')) {
    return { emoji: '💰', name: 'Sueldo', color: 'from-emerald-400 to-green-500', textCol: 'text-emerald-400', bgCol: 'bg-emerald-500/10 border-emerald-500/20' };
  }
  if (normalized.includes('invers') || normalized.includes('ahorro') || normalized.includes('📈')) {
    return { emoji: '📈', name: 'Inversión', color: 'from-teal-400 to-emerald-500', textCol: 'text-teal-400', bgCol: 'bg-teal-500/10 border-teal-500/20' };
  }
  if (normalized.includes('venta') || normalized.includes('comercio') || normalized.includes('🛍️')) {
    return { emoji: '🛍️', name: 'Ventas', color: 'from-purple-400 to-fuchsia-500', textCol: 'text-purple-400', bgCol: 'bg-purple-500/10 border-purple-500/20' };
  }
  if (normalized.includes('freelance') || normalized.includes('💻')) {
    return { emoji: '💻', name: 'Freelance', color: 'from-cyan-500 to-blue-500', textCol: 'text-cyan-400', bgCol: 'bg-cyan-500/10 border-cyan-500/20' };
  }
  if (normalized.includes('otros') || normalized.includes('📦') || normalized.includes('💵')) {
    return { emoji: '📦', name: 'Otros', color: 'from-slate-400 to-slate-600', textCol: 'text-slate-400', bgCol: 'bg-slate-500/10 border-slate-500/20' };
  }

  // Si tiene un emoji general al principio, devuélvalo
  const emojiMatch = category.match(/^([\ud800-\udbff][\udc00-\udfff]|\p{Emoji})\s*(.*)$/u);
  if (emojiMatch) {
    return { emoji: emojiMatch[1], name: emojiMatch[2].trim(), color: 'from-indigo-400 to-blue-500', textCol: 'text-indigo-400', bgCol: 'bg-indigo-500/10 border-indigo-500/20' };
  }

  return { emoji: '📦', name: category, color: 'from-slate-400 to-slate-600', textCol: 'text-slate-400', bgCol: 'bg-slate-500/10 border-slate-500/20' };
};

export default function App() {
  // Módulos del Sidebar
  const [activeModule, setActiveModule] = useState<'dashboard' | 'cuentas' | 'consultas' | 'usuario' | 'categorias' | 'presupuestos' | 'ahorros' | 'deudas' | 'suscripciones' | 'estadisticas' | 'reportes'>('dashboard');
  const [activeTab, setActiveTab] = useState<'demo' | 'angular'>('demo'); // Mantener para compatibilidad interna de código

  // Suscripciones en base de datos
  const [dbSubscriptions, setDbSubscriptions] = useState<{ id: string; name: string; cost: number; dueDate: string; account: string; status: 'active' | 'paused' | 'cancelled'; fechaCreacion: string }[]>([]);
  
  // Campos para creación de suscripciones
  const [newSubName, setNewSubName] = useState('');
  const [newSubCost, setNewSubCost] = useState('');
  const [newSubDueDate, setNewSubDueDate] = useState('');
  const [newSubAccount, setNewSubAccount] = useState('');
  const [newSubStatus, setNewSubStatus] = useState<'active' | 'paused' | 'cancelled'>('active');
  const [newSubLoading, setNewSubLoading] = useState(false);

  // Campos para edición rápida de suscripciones
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editingSubCost, setEditingSubCost] = useState('');
  const [editingSubDueDate, setEditingSubDueDate] = useState('');
  const [editingSubStatus, setEditingSubStatus] = useState<'active' | 'paused' | 'cancelled'>('active');
  const [editingSubLoading, setEditingSubLoading] = useState(false);

  // Campos para perfil / configuración
  const [userProfileName, setUserProfileName] = useState('');
  const [userProfileCurrency, setUserProfileCurrency] = useState('COP');
  const [userProfileLanguage, setUserProfileLanguage] = useState('es');
  const [userProfileTheme, setUserProfileTheme] = useState('dark');
  const [userProfileLoading, setUserProfileLoading] = useState(false);

  // Filtros de reportes
  const [reportType, setReportType] = useState<'gastos-categoria' | 'ingresos' | 'balance-mensual' | 'balance-anual' | 'flujo-caja' | 'patrimonio'>('gastos-categoria');
  const [reportYear, setReportYear] = useState('2026');
  const [reportMonth, setReportMonth] = useState('7');

  // Estado para el módulo OCR inteligente
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [ocrPreviewUrl, setOcrPreviewUrl] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<{
    place: string;
    date: string;
    value: number;
    products: { name: string; qty: number; price: number }[];
  } | null>(null);

  
  // Categorías personalizadas en base de datos
  const [dbCategories, setDbCategories] = useState<{ id: string; name: string; type: 'income' | 'expense'; emoji: string }[]>([]);
  
  // Presupuestos en base de datos
  const [dbBudgets, setDbBudgets] = useState<{ id: string; category: string; maxAmount: number; alertThreshold: number }[]>([]);

  // Metas de ahorro en base de datos
  const [dbSavingsGoals, setDbSavingsGoals] = useState<{ id: string; name: string; targetAmount: number; currentSaved: number; emoji: string }[]>([]);
  
  // Deudas en base de datos
  const [dbDebts, setDbDebts] = useState<{ id: string; name: string; balance: number; minPayment: number; dueDate: string; type: 'card' | 'loan' | 'other'; fechaCreacion: string }[]>([]);

  // Campos para creación de deudas
  const [newDebtName, setNewDebtName] = useState('');
  const [newDebtBalance, setNewDebtBalance] = useState('');
  const [newDebtMinPayment, setNewDebtMinPayment] = useState('');
  const [newDebtDueDate, setNewDebtDueDate] = useState('');
  const [newDebtType, setNewDebtType] = useState<'card' | 'loan' | 'other'>('card');
  const [newDebtLoading, setNewDebtLoading] = useState(false);

  // Campos para edición rápida de deudas
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);
  const [editingDebtBalance, setEditingDebtBalance] = useState('');
  const [editingDebtMinPayment, setEditingDebtMinPayment] = useState('');
  const [editingDebtDueDate, setEditingDebtDueDate] = useState('');
  const [editingDebtLoading, setEditingDebtLoading] = useState(false);
  
  // Campos para creación de metas de ahorro
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalSaved, setNewGoalSaved] = useState('');
  const [newGoalEmoji, setNewGoalEmoji] = useState('💰');
  const [newGoalLoading, setNewGoalLoading] = useState(false);

  // Campos para edición rápida de ahorro (para poder sumar/restar o cambiar el valor directamente)
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingGoalSaved, setEditingGoalSaved] = useState('');
  const [editingGoalLoading, setEditingGoalLoading] = useState(false);
  
  // Campos para creación de presupuestos
  const [newBudgetCategory, setNewBudgetCategory] = useState('');
  const [newBudgetLimit, setNewBudgetLimit] = useState('');
  const [newBudgetAlertThreshold, setNewBudgetAlertThreshold] = useState('95');
  const [newBudgetLoading, setNewBudgetLoading] = useState(false);

  // Campos para creación de categorías
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');
  const [newCatEmoji, setNewCatEmoji] = useState('🍕');
  const [newCatLoading, setNewCatLoading] = useState(false);
  const [activeCodeFile, setActiveCodeFile] = useState<'config' | 'routes' | 'service' | 'finance' | 'transaction' | 'history' | 'dashboard' | 'login' | 'register' | 'guard'>('dashboard');
  const [demoView, setDemoView] = useState<'ledger' | 'dashboard'>('dashboard');

  // Estado de Cuenta seleccionada para el módulo Cuentas
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Campos para depósito / retiro en cuenta
  const [actTxAmount, setActTxAmount] = useState('');
  const [actTxType, setActTxType] = useState<'income' | 'expense'>('income');
  const [actTxCategory, setActTxCategory] = useState('Sueldo');
  const [actTxDescription, setActTxDescription] = useState('');
  const [actTxLoading, setActTxLoading] = useState(false);

  // Campos para transferencia entre cuentas
  const [transferAmount, setTransferAmount] = useState('');
  const [transferTargetAccountId, setTransferTargetAccountId] = useState('');
  const [transferDescription, setTransferDescription] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  // Campos para creación de cuenta
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState<'credito' | 'deuda'>('credito');
  const [newAccountSubtipo, setNewAccountSubtipo] = useState<'disponible' | 'ahorros' | 'deudas'>('disponible');
  const [newAccountColor, setNewAccountColor] = useState<string>('emerald');
  const [newAccountIcon, setNewAccountIcon] = useState<string>('wallet');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [newAccountLoading, setNewAccountLoading] = useState(false);

  // Campos para "Consultas"
  const [queryStartDate, setQueryStartDate] = useState('');
  const [queryEndDate, setQueryEndDate] = useState('');
  const [queryAccountId, setQueryAccountId] = useState('ALL');
  const [queryCategory, setQueryCategory] = useState('ALL');

  // Campos para "+ Nuevo Movimiento"
  const [showNewTxModal, setShowNewTxModal] = useState(false);
  const [newTxType, setNewTxType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [newTxAccountId, setNewTxAccountId] = useState('');
  const [newTxTargetAccountId, setNewTxTargetAccountId] = useState('');
  const [newTxCategory, setNewTxCategory] = useState('🍔 Alimentación');
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxDate, setNewTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTxNotes, setNewTxNotes] = useState('');
  const [newTxAttachment, setNewTxAttachment] = useState<string | null>(null);
  const [newTxAttachmentName, setNewTxAttachmentName] = useState('');
  const [newTxLoading, setNewTxLoading] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<any[]>([]);

  // Estado de Autenticación
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Estado de Transacciones
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [txCategory, setTxCategory] = useState('💰 Sueldo');
  const [txDescription, setTxDescription] = useState('');
  const [txLoading, setTxLoading] = useState(false);
  const [txAccountId, setTxAccountId] = useState('');

  // Autoseleccionar la primera cuenta cuando se carguen las cuentas en el Dashboard
  useEffect(() => {
    if (accounts.length > 0) {
      if (!txAccountId) setTxAccountId(accounts[0].id);
      if (!newTxAccountId) setNewTxAccountId(accounts[0].id);
      if (!newTxTargetAccountId && accounts.length > 1) {
        setNewTxTargetAccountId(accounts[1].id);
      } else if (!newTxTargetAccountId && accounts.length > 0) {
        setNewTxTargetAccountId(accounts[0].id);
      }
    }
  }, [accounts, txAccountId, newTxAccountId, newTxTargetAccountId]);

  // Estado de Copiar Código
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Estado de conexión Firestore
  const [firestoreConnected, setFirestoreConnected] = useState<boolean | null>(null);

  // Categorías predefinidas combinadas con las cargadas de Firestore
  const categories = React.useMemo(() => {
    const defaultIncome = [
      '💰 Sueldo',
      '📈 Inversión',
      '🛍️ Ventas',
      '💻 Freelance',
      '💵 Otros'
    ];
    const defaultExpense = [
      '🍔 Alimentación',
      '🚗 Transporte',
      '🏠 Hogar',
      '🎬 Entretenimiento',
      '🛒 Compras',
      '🏥 Salud',
      '🎓 Educación',
      '✈️ Viajes',
      '🐶 Mascotas',
      '💼 Trabajo',
      '💳 Tarjetas',
      '💡 Servicios',
      '📱 Suscripciones',
      '🎁 Regalos',
      '📦 Otros'
    ];

    // Combinar con las cargadas de Firestore
    const dbIncome = dbCategories
      .filter((c) => c.type === 'income')
      .map((c) => `${c.emoji || '💰'} ${c.name}`);
    const dbExpense = dbCategories
      .filter((c) => c.type === 'expense')
      .map((c) => `${c.emoji || '📦'} ${c.name}`);

    // Asegurar que no haya duplicados
    const incomeSet = new Set([...defaultIncome, ...dbIncome]);
    const expenseSet = new Set([...defaultExpense, ...dbExpense]);

    return {
      income: Array.from(incomeSet),
      expense: Array.from(expenseSet)
    };
  }, [dbCategories]);

  // Referencias para lienzos de gráficos
  const barCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const doughnutCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const barChartRef = React.useRef<any>(null);
  const doughnutChartRef = React.useRef<any>(null);

  // Efecto para inicializar/actualizar gráficos en tiempo real con Chart.js
  useEffect(() => {
    if (activeModule !== 'dashboard' || !currentUser || transactions.length === 0) return;

    // Filtrar transacciones del mes actual (Julio 2026 en nuestro simulador / entorno)
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    // Calcular flujos del mes actual
    const currentMonthTxs = transactions.filter(t => {
      if (!t.date) return false;
      const d = new Date(t.date);
      // Validar si la fecha es de este mes
      return d.getFullYear() === currentYear && (d.getMonth() + 1) === currentMonth;
    });

    const barIncome = currentMonthTxs
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const barExpense = currentMonthTxs
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // 1. Gráfico de Barras: Comparación Mensual
    if (barCanvasRef.current) {
      if (barChartRef.current) {
        barChartRef.current.destroy();
      }

      barChartRef.current = new ChartJS(barCanvasRef.current, {
        type: 'bar',
        data: {
          labels: ['Ingresos del Mes', 'Egresos del Mes'],
          datasets: [{
            data: [barIncome, barExpense],
            backgroundColor: [
              'rgba(16, 185, 129, 0.25)', // Emerald
              'rgba(244, 63, 94, 0.25)'   // Rose
            ],
            borderColor: [
              '#10b981',
              '#f43f5e'
            ],
            borderWidth: 2,
            borderRadius: 12,
            barThickness: 36
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
          }
        }
      });
    }

    // Calcular gastos por categoría del mes actual
    const expensesByCategory: Record<string, number> = {};
    currentMonthTxs
      .filter(t => t.type === 'expense')
      .forEach(t => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });

    const doughnutLabels = Object.keys(expensesByCategory);
    const doughnutData = Object.values(expensesByCategory);

    // 2. Gráfico de Dona: Distribución de Egresos
    if (doughnutCanvasRef.current && doughnutLabels.length > 0) {
      if (doughnutChartRef.current) {
        doughnutChartRef.current.destroy();
      }

      const colors = [
        { fill: 'rgba(99, 102, 241, 0.2)', border: '#6366f1' }, // Indigo
        { fill: 'rgba(236, 72, 153, 0.2)', border: '#ec4899' }, // Pink
        { fill: 'rgba(245, 158, 11, 0.2)', border: '#f59e0b' },  // Amber
        { fill: 'rgba(59, 130, 246, 0.2)', border: '#3b82f6' },  // Blue
        { fill: 'rgba(139, 92, 246, 0.2)', border: '#8b5cf6' }   // Violet
      ];

      doughnutChartRef.current = new ChartJS(doughnutCanvasRef.current, {
        type: 'doughnut',
        data: {
          labels: doughnutLabels,
          datasets: [{
            data: doughnutData,
            backgroundColor: doughnutLabels.map((_, i) => colors[i % colors.length].fill),
            borderColor: doughnutLabels.map((_, i) => colors[i % colors.length].border),
            borderWidth: 1.5,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: { 
              position: 'right', 
              labels: { 
                color: '#94a3b8', 
                boxWidth: 10,
                font: { size: 10 }
              } 
            }
          }
        }
      });
    }

    return () => {
      if (barChartRef.current) barChartRef.current.destroy();
      if (doughnutChartRef.current) doughnutChartRef.current.destroy();
    };
  }, [activeModule, transactions, currentUser]);

  // Validar conexión a Firestore al iniciar la aplicación (Requisito de la guía de Firebase)
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        setFirestoreConnected(true);
      } catch (error: any) {
        if (error instanceof Error && error.message.includes('offline')) {
          setFirestoreConnected(false);
        } else {
          // Si es por permisos o porque no existe el documento pero sí hay respuesta, la conexión es exitosa
          setFirestoreConnected(true);
        }
      }
    }
    testConnection();
  }, []);

  // Escuchar cambios en el estado de autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Escuchar transacciones en tiempo real de Firestore para el usuario activo
  useEffect(() => {
    if (!currentUser) {
      setTransactions([]);
      return;
    }

    const q = query(
      collection(db, 'usuarios', currentUser.uid, 'movimientos'),
      orderBy('fechaCreacion', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Soportar campos tanto en español (de Angular) como en inglés para total compatibilidad
        const monto = data.monto !== undefined ? data.monto : (data.amount || 0);
        const tipo = data.tipo !== undefined ? data.tipo : (data.type || 'egreso');
        const fecha = data.fecha || data.date || new Date().toISOString();
        
        items.push({
          id: doc.id,
          amount: monto,
          type: (tipo === 'ingreso' || tipo === 'income') ? 'income' : 'expense',
          category: data.categoria || data.category || 'Otros',
          description: data.descripcion || data.description || '',
          date: fecha
        });
      });
      setTransactions(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `usuarios/${currentUser.uid}/movimientos`);
    });

    return unsubscribe;
  }, [currentUser]);

  // Escuchar categorías personalizadas en tiempo real desde Firestore
  useEffect(() => {
    if (!currentUser) {
      setDbCategories([]);
      return;
    }

    const q = query(
      collection(db, 'usuarios', currentUser.uid, 'categorias'),
      orderBy('fechaCreacion', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          name: data.name || data.nombre || '',
          type: data.type || data.tipo || 'expense',
          emoji: data.emoji || '📦',
          fechaCreacion: data.fechaCreacion
        });
      });
      setDbCategories(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `usuarios/${currentUser.uid}/categorias`);
    });

    return unsubscribe;
  }, [currentUser]);

  // Escuchar presupuestos personalizados en tiempo real desde Firestore
  useEffect(() => {
    if (!currentUser) {
      setDbBudgets([]);
      return;
    }

    const q = query(
      collection(db, 'usuarios', currentUser.uid, 'presupuestos')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          category: data.category || '',
          maxAmount: Number(data.maxAmount || 0),
          alertThreshold: Number(data.alertThreshold || 95),
          fechaCreacion: data.fechaCreacion
        });
      });
      setDbBudgets(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `usuarios/${currentUser.uid}/presupuestos`);
    });

    return unsubscribe;
  }, [currentUser]);

  // Escuchar metas de ahorro en tiempo real desde Firestore + auto-seeding de metas demo
  useEffect(() => {
    if (!currentUser) {
      setDbSavingsGoals([]);
      return;
    }

    const q = query(
      collection(db, 'usuarios', currentUser.uid, 'metas')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          name: data.name || '',
          targetAmount: Number(data.targetAmount || 0),
          currentSaved: Number(data.currentSaved || 0),
          emoji: data.emoji || '💰',
          fechaCreacion: data.fechaCreacion
        });
      });
      
      if (snapshot.empty) {
        try {
          const goalsRef = collection(db, 'usuarios', currentUser.uid, 'metas');
          await addDoc(goalsRef, {
            name: 'Viaje Japón',
            targetAmount: 15000000,
            currentSaved: 8300000,
            emoji: '✈️',
            fechaCreacion: new Date().toISOString()
          });
          await addDoc(goalsRef, {
            name: 'Emergencias',
            targetAmount: 10000000,
            currentSaved: 8200000,
            emoji: '🚨',
            fechaCreacion: new Date().toISOString()
          });
        } catch (err) {
          console.error("Error al inicializar metas demo:", err);
        }
      } else {
        items.sort((a, b) => new Date(a.fechaCreacion || '').getTime() - new Date(b.fechaCreacion || '').getTime());
        setDbSavingsGoals(items);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `usuarios/${currentUser.uid}/metas`);
    });

    return unsubscribe;
  }, [currentUser]);

  // Escuchar deudas en tiempo real desde Firestore + auto-seeding de deudas demo
  useEffect(() => {
    if (!currentUser) {
      setDbDebts([]);
      return;
    }

    const q = query(
      collection(db, 'usuarios', currentUser.uid, 'deudas')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          name: data.name || '',
          balance: Number(data.balance || 0),
          minPayment: Number(data.minPayment || 0),
          dueDate: data.dueDate || '',
          type: data.type || 'card',
          fechaCreacion: data.fechaCreacion
        });
      });
      
      if (snapshot.empty) {
        try {
          const debtsRef = collection(db, 'usuarios', currentUser.uid, 'deudas');
          await addDoc(debtsRef, {
            name: 'Visa',
            balance: 1200000,
            minPayment: 180000,
            dueDate: '2026-07-18',
            type: 'card',
            fechaCreacion: new Date().toISOString()
          });
          await addDoc(debtsRef, {
            name: 'Préstamo',
            balance: 8000000,
            minPayment: 650000,
            dueDate: '2026-07-07',
            type: 'loan',
            fechaCreacion: new Date().toISOString()
          });
        } catch (err) {
          console.error("Error al inicializar deudas demo:", err);
        }
      } else {
        items.sort((a, b) => new Date(a.fechaCreacion || '').getTime() - new Date(b.fechaCreacion || '').getTime());
        setDbDebts(items);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `usuarios/${currentUser.uid}/deudas`);
    });

    return unsubscribe;
  }, [currentUser]);

  // Escuchar cuentas en tiempo real de Firestore para el usuario activo + auto-seeding
  useEffect(() => {
    if (!currentUser) {
      setAccounts([]);
      return;
    }

    const q = query(
      collection(db, 'usuarios', currentUser.uid, 'cuentas'),
      orderBy('nombre', 'asc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          nombre: data.nombre,
          tipo: data.tipo,
          saldo: data.saldo,
          fechaCreacion: data.fechaCreacion,
          color: data.color || 'emerald',
          icono: data.icono || 'wallet',
          subtipo: data.subtipo || (data.tipo === 'deuda' ? 'deudas' : (data.nombre.toLowerCase().includes('ahorro') ? 'ahorros' : 'disponible'))
        });
      });
      
      setAccounts(items);

      // Si no hay cuentas registradas en Firestore, creamos las cuentas solicitadas por el usuario
      if (snapshot.empty) {
        try {
          const cuentasRef = collection(db, 'usuarios', currentUser.uid, 'cuentas');
          const movsRef = collection(db, 'usuarios', currentUser.uid, 'movimientos');

          const defaultAccounts = [
            { nombre: 'Bancolombia', tipo: 'credito', subtipo: 'ahorros', saldo: 4000000, color: 'amber', icono: 'landmark' },
            { nombre: 'Tarjeta Visa', tipo: 'deuda', subtipo: 'deudas', saldo: 2100000, color: 'rose', icono: 'credit-card' },
            { nombre: 'Efectivo', tipo: 'credito', subtipo: 'disponible', saldo: 500000, color: 'emerald', icono: 'banknote' },
            { nombre: 'Nequi', tipo: 'credito', subtipo: 'ahorros', saldo: 1120000, color: 'purple', icono: 'smartphone' },
            { nombre: 'Daviplata', tipo: 'credito', subtipo: 'ahorros', saldo: 1000000, color: 'red', icono: 'smartphone' },
            { nombre: 'Paypal', tipo: 'credito', subtipo: 'disponible', saldo: 3500000, color: 'blue', icono: 'dollar-sign' },
            { nombre: 'Caja menor', tipo: 'credito', subtipo: 'disponible', saldo: 230000, color: 'zinc', icono: 'coins' }
          ];

          for (const acc of defaultAccounts) {
            const docRef = await addDoc(cuentasRef, {
              nombre: acc.nombre,
              tipo: acc.tipo,
              subtipo: acc.subtipo,
              saldo: acc.saldo,
              color: acc.color,
              icono: acc.icono,
              fechaCreacion: new Date().toISOString()
            });

            // Añadir un movimiento inicial para cada una de las cuentas
            await addDoc(movsRef, {
              monto: acc.saldo,
              tipo: acc.tipo === 'credito' ? 'ingreso' : 'egreso',
              categoria: acc.tipo === 'credito' ? 'Sueldo' : 'Otros',
              descripcion: `Saldo inicial - ${acc.nombre}`,
              fecha: new Date().toISOString().split('T')[0],
              fechaCreacion: new Date().toISOString(),
              accountId: docRef.id,
              cuentaId: docRef.id,
              amount: acc.saldo,
              type: acc.tipo === 'credito' ? 'income' : 'expense',
              category: acc.tipo === 'credito' ? 'Sueldo' : 'Otros',
              description: `Saldo inicial - ${acc.nombre}`,
              date: new Date().toISOString()
            });
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `usuarios/${currentUser.uid}`);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `usuarios/${currentUser.uid}/cuentas`);
    });

    return unsubscribe;
  }, [currentUser]);

  // Escuchar suscripciones en tiempo real desde Firestore + auto-seeding
  useEffect(() => {
    if (!currentUser) {
      setDbSubscriptions([]);
      return;
    }

    const q = query(
      collection(db, 'usuarios', currentUser.uid, 'suscripciones')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          name: data.name || '',
          cost: Number(data.cost || 0),
          dueDate: data.dueDate || '',
          account: data.account || '',
          status: data.status || 'active',
          fechaCreacion: data.fechaCreacion
        });
      });

      if (snapshot.empty) {
        try {
          const subsRef = collection(db, 'usuarios', currentUser.uid, 'suscripciones');
          const sampleSubs = [
            { name: 'Netflix', cost: 44900, dueDate: '2026-07-28', account: 'Visa', status: 'active', fechaCreacion: new Date().toISOString() },
            { name: 'Spotify', cost: 16900, dueDate: '2026-07-15', account: 'Nequi', status: 'active', fechaCreacion: new Date().toISOString() },
            { name: 'OpenAI (ChatGPT)', cost: 85000, dueDate: '2026-07-20', account: 'Visa', status: 'active', fechaCreacion: new Date().toISOString() },
            { name: 'Google One', cost: 7900, dueDate: '2026-07-05', account: 'Visa', status: 'active', fechaCreacion: new Date().toISOString() },
            { name: 'Amazon Prime', cost: 22900, dueDate: '2026-07-12', account: 'Bancolombia', status: 'active', fechaCreacion: new Date().toISOString() }
          ];
          for (const sub of sampleSubs) {
            await addDoc(subsRef, sub);
          }
        } catch (err) {
          console.error("Error al inicializar suscripciones demo:", err);
        }
      } else {
        items.sort((a, b) => new Date(a.fechaCreacion || '').getTime() - new Date(b.fechaCreacion || '').getTime());
        setDbSubscriptions(items);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `usuarios/${currentUser.uid}/suscripciones`);
    });

    return unsubscribe;
  }, [currentUser]);

  // Escuchar preferencias de usuario en tiempo real desde Firestore + auto-seeding
  useEffect(() => {
    if (!currentUser) return;

    const docRef = doc(db, 'usuarios', currentUser.uid, 'configuracion', 'preferencias');

    const unsubscribe = onSnapshot(docRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setUserProfileName(data.name || '');
        setUserProfileCurrency(data.currency || 'COP');
        setUserProfileLanguage(data.language || 'es');
        setUserProfileTheme(data.theme || 'dark');
      } else {
        try {
          // Crear configuraciones por defecto
          await setDoc(docRef, {
            name: currentUser.email ? currentUser.email.split('@')[0] : 'Usuario',
            currency: 'COP',
            language: 'es',
            theme: 'dark',
            fechaActualizacion: new Date().toISOString()
          });
        } catch (err) {
          console.error("Error al inicializar preferencias de usuario:", err);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `usuarios/${currentUser.uid}/configuracion/preferencias`);
    });

    return unsubscribe;
  }, [currentUser]);

  // Manejar Registro / Login en el Demostrador
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError('Por favor complete todos los campos.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      if (authMode === 'register') {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        setAuthSuccess('¡Cuenta registrada exitosamente!');
        // Crear documento del usuario inicial en Firestore
        // No es estrictamente necesario ya que las colecciones se crean dinámicamente,
        // pero valida permisos.
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
        setAuthSuccess('Sesión iniciada con éxito.');
      }
    } catch (err: any) {
      console.error(err);
      let localizedError = 'Ocurrió un error inesperado.';
      if (err.code === 'auth/email-already-in-use') {
        localizedError = 'Este correo electrónico ya está registrado.';
      } else if (err.code === 'auth/weak-password') {
        localizedError = 'La contraseña debe tener al menos 6 caracteres.';
      } else if (err.code === 'auth/invalid-email') {
        localizedError = 'El formato del correo es inválido.';
      } else if (err.code === 'auth/invalid-credential') {
        localizedError = 'Credenciales incorrectas. Verifique su correo y contraseña.';
      }
      setAuthError(localizedError);
    } finally {
      setAuthLoading(false);
    }
  };

  // Iniciar Sesión con Google (Proveedor activo por defecto en set_up_firebase)
  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setAuthSuccess('¡Sesión iniciada con Google con éxito!');
    } catch (err: any) {
      console.error("Error Google Auth:", err);
      let localizedError = 'Ocurrió un error al iniciar sesión con Google.';
      if (err.code === 'auth/popup-blocked') {
        localizedError = 'El navegador bloqueó la ventana emergente de inicio de sesión. Por favor, permítela.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        localizedError = 'La ventana de inicio de sesión fue cerrada por el usuario.';
      }
      setAuthError(localizedError);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAuthEmail('');
      setAuthPassword('');
      setAuthSuccess('');
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  // Crear categoría en Firestore para el usuario activo
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!newCatName.trim()) return;

    setNewCatLoading(true);
    try {
      const catRef = collection(db, 'usuarios', currentUser.uid, 'categorias');
      await addDoc(catRef, {
        name: newCatName.trim(),
        type: newCatType,
        emoji: newCatEmoji,
        fechaCreacion: new Date().toISOString()
      });
      setNewCatName('');
      // Cambiar a un emoji divertido para la siguiente creación
      const emojis = ['🍕', '🍿', '🎸', '🎮', '💡', '🏋️', '📚', '👗', '🎨', '🚕', '🏥', '🥕', '🥩', '🍩', '🥑', '🍿', '🧁', '🍦', '🍩', '🍹', '✈️', '🏝️', '🏕️', '🏡', '💻'];
      setNewCatEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `usuarios/${currentUser.uid}/categorias`);
    } finally {
      setNewCatLoading(false);
    }
  };

  // Escanear recibo / ticket simulado con OCR inteligente
  const handleOcrUpload = async (file: File) => {
    if (!currentUser) return;
    setOcrLoading(true);
    setOcrResult(null);

    // Guardar vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      setOcrPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Simular retraso de procesamiento OCR / modelo inteligente de Gemini
    await new Promise((resolve) => setTimeout(resolve, 1800));

    // Generar un resultado aleatorio pero realista
    const sampleResults = [
      {
        place: "Éxito S.A.",
        date: "2026-07-02",
        value: 42500,
        products: [
          { name: "Combo Hamburguesa Especial", qty: 1, price: 25000 },
          { name: "Gaseosa 350ml", qty: 1, price: 4500 },
          { name: "Porción de Papas Fritas", qty: 1, price: 8000 },
          { name: "Helado de Copa", qty: 1, price: 5000 }
        ]
      },
      {
        place: "D1 Súper Mercados",
        date: "2026-07-02",
        value: 28400,
        products: [
          { name: "Leche Entera 1L", qty: 3, price: 4200 },
          { name: "Pan Tajado Familiar", qty: 1, price: 5800 },
          { name: "Queso Doble Crema", qty: 1, price: 10000 }
        ]
      },
      {
        place: "Estación Terpel",
        date: "2026-07-01",
        value: 65000,
        products: [
          { name: "Combustible Corriente", qty: 1, price: 65000 }
        ]
      }
    ];

    const chosen = sampleResults[Math.floor(Math.random() * sampleResults.length)];
    setOcrResult(chosen);
    setOcrLoading(false);
  };

  // Registrar transacción generada desde el escáner OCR
  const handleRegisterOcrMovement = async (accountId: string) => {
    if (!currentUser || !ocrResult) return;
    if (!accountId) {
      alert("Por favor selecciona una cuenta para registrar el gasto.");
      return;
    }

    const targetAccount = accounts.find(a => a.id === accountId);
    if (!targetAccount) {
      alert("La cuenta seleccionada no existe.");
      return;
    }

    try {
      setOcrLoading(true);
      const nuevoSaldo = targetAccount.saldo - ocrResult.value;

      // 1. Agregar movimiento contable en Firestore
      await addDoc(collection(db, 'usuarios', currentUser.uid, 'movimientos'), {
        monto: ocrResult.value,
        tipo: 'egreso',
        categoria: ocrResult.place.toLowerCase().includes('estación') ? 'Transporte' : 'Alimentación',
        descripcion: `Compra OCR en ${ocrResult.place}`,
        fecha: ocrResult.date,
        fechaCreacion: new Date().toISOString(),
        accountId: accountId,
        cuentaId: accountId,

        // Compatibilidad en inglés
        amount: ocrResult.value,
        type: 'expense',
        category: ocrResult.place.toLowerCase().includes('estación') ? 'Transporte' : 'Alimentación',
        description: `Compra OCR en ${ocrResult.place}`,
        date: new Date(ocrResult.date).toISOString()
      });

      // 2. Actualizar el saldo de la cuenta
      const accRef = doc(db, 'usuarios', currentUser.uid, 'cuentas', accountId);
      await updateDoc(accRef, { saldo: nuevoSaldo });

      alert(`Gasto de $${ocrResult.value.toLocaleString('es-CO')} registrado exitosamente en la cuenta ${targetAccount.nombre}.`);
      
      // Limpiar estados de OCR
      setOcrFile(null);
      setOcrPreviewUrl(null);
      setOcrResult(null);
    } catch (error) {
      console.error("Error al registrar movimiento OCR:", error);
      handleFirestoreError(error, OperationType.WRITE, `usuarios/${currentUser.uid}/movimientos`);
    } finally {
      setOcrLoading(false);
    }
  };


  // Eliminar categoría personalizada de Firestore
  const handleDeleteCategory = async (catId: string) => {
    if (!currentUser) return;
    try {
      const docRef = doc(db, 'usuarios', currentUser.uid, 'categorias', catId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `usuarios/${currentUser.uid}/categorias/${catId}`);
    }
  };

  // Crear presupuesto en Firestore para el usuario activo
  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!newBudgetCategory || !newBudgetLimit.trim()) return;

    const limitNum = parseFloat(newBudgetLimit);
    if (isNaN(limitNum) || limitNum <= 0) return;

    setNewBudgetLoading(true);
    try {
      const budgetRef = collection(db, 'usuarios', currentUser.uid, 'presupuestos');
      await addDoc(budgetRef, {
        category: newBudgetCategory,
        maxAmount: limitNum,
        alertThreshold: parseFloat(newBudgetAlertThreshold) || 95,
        fechaCreacion: new Date().toISOString()
      });
      setNewBudgetCategory('');
      setNewBudgetLimit('');
      setNewBudgetAlertThreshold('95');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `usuarios/${currentUser.uid}/presupuestos`);
    } finally {
      setNewBudgetLoading(false);
    }
  };

  // Eliminar presupuesto personalizado de Firestore
  const handleDeleteBudget = async (budgetId: string) => {
    if (!currentUser) return;
    try {
      const docRef = doc(db, 'usuarios', currentUser.uid, 'presupuestos', budgetId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `usuarios/${currentUser.uid}/presupuestos/${budgetId}`);
    }
  };

  // Crear meta de ahorro en Firestore
  const handleCreateSavingsGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!newGoalName.trim() || !newGoalTarget.trim()) return;

    const targetNum = parseFloat(newGoalTarget);
    const savedNum = parseFloat(newGoalSaved) || 0;

    if (isNaN(targetNum) || targetNum <= 0) return;
    if (isNaN(savedNum) || savedNum < 0) return;

    setNewGoalLoading(true);
    try {
      const goalsRef = collection(db, 'usuarios', currentUser.uid, 'metas');
      await addDoc(goalsRef, {
        name: newGoalName.trim(),
        targetAmount: targetNum,
        currentSaved: savedNum,
        emoji: newGoalEmoji || '💰',
        fechaCreacion: new Date().toISOString()
      });
      setNewGoalName('');
      setNewGoalTarget('');
      setNewGoalSaved('');
      setNewGoalEmoji('💰');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `usuarios/${currentUser.uid}/metas`);
    } finally {
      setNewGoalLoading(false);
    }
  };

  // Actualizar ahorro acumulado de una meta
  const handleUpdateSavingsGoalSaved = async (goalId: string, savedAmountStr: string) => {
    if (!currentUser) return;
    const savedNum = parseFloat(savedAmountStr);
    if (isNaN(savedNum) || savedNum < 0) return;

    setEditingGoalLoading(true);
    try {
      const docRef = doc(db, 'usuarios', currentUser.uid, 'metas', goalId);
      await updateDoc(docRef, {
        currentSaved: savedNum
      });
      setEditingGoalId(null);
      setEditingGoalSaved('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `usuarios/${currentUser.uid}/metas/${goalId}`);
    } finally {
      setEditingGoalLoading(false);
    }
  };

  // Eliminar meta de ahorro de Firestore
  const handleDeleteSavingsGoal = async (goalId: string) => {
    if (!currentUser) return;
    try {
      const docRef = doc(db, 'usuarios', currentUser.uid, 'metas', goalId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `usuarios/${currentUser.uid}/metas/${goalId}`);
    }
  };

  // Calcular días restantes para vencimiento de deuda
  const calculateDaysLeft = (dueDateStr: string): number | null => {
    if (!dueDateStr) return null;
    try {
      const today = new Date('2026-07-02T08:18:18-07:00'); // Hora base de la sesión actual
      const targetDate = new Date(dueDateStr);
      if (isNaN(targetDate.getTime())) return null;
      
      const tStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const tEnd = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      
      const diffTime = tEnd.getTime() - tStart.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  // Dar formato en español para las fechas de vencimiento
  const formatDueDateSpanish = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const day = parseInt(parts[2], 10);
        const monthIndex = parseInt(parts[1], 10) - 1;
        const monthNamesFull = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `${day} ${monthNamesFull[monthIndex]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Crear deudas en Firestore
  const handleCreateDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!newDebtName.trim() || !newDebtBalance.trim() || !newDebtMinPayment.trim() || !newDebtDueDate.trim()) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    const balanceNum = parseFloat(newDebtBalance);
    const minPaymentNum = parseFloat(newDebtMinPayment);

    if (isNaN(balanceNum) || balanceNum <= 0) {
      alert('Por favor ingrese un saldo de deuda válido.');
      return;
    }
    if (isNaN(minPaymentNum) || minPaymentNum <= 0) {
      alert('Por favor ingrese un pago mínimo o cuota válido.');
      return;
    }

    setNewDebtLoading(true);
    try {
      const debtsRef = collection(db, 'usuarios', currentUser.uid, 'deudas');
      await addDoc(debtsRef, {
        name: newDebtName.trim(),
        balance: balanceNum,
        minPayment: minPaymentNum,
        dueDate: newDebtDueDate,
        type: newDebtType,
        fechaCreacion: new Date().toISOString()
      });
      setNewDebtName('');
      setNewDebtBalance('');
      setNewDebtMinPayment('');
      setNewDebtDueDate('');
      setNewDebtType('card');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `usuarios/${currentUser.uid}/deudas`);
    } finally {
      setNewDebtLoading(false);
    }
  };

  // Actualizar datos de una deuda
  const handleUpdateDebt = async (debtId: string) => {
    if (!currentUser) return;
    const balanceNum = parseFloat(editingDebtBalance);
    const minPaymentNum = parseFloat(editingDebtMinPayment);

    if (isNaN(balanceNum) || balanceNum < 0) {
      alert('Por favor ingrese un saldo de deuda válido.');
      return;
    }
    if (isNaN(minPaymentNum) || minPaymentNum < 0) {
      alert('Por favor ingrese un pago o cuota válido.');
      return;
    }

    setEditingDebtLoading(true);
    try {
      const docRef = doc(db, 'usuarios', currentUser.uid, 'deudas', debtId);
      await updateDoc(docRef, {
        balance: balanceNum,
        minPayment: minPaymentNum,
        dueDate: editingDebtDueDate
      });
      setEditingDebtId(null);
      setEditingDebtBalance('');
      setEditingDebtMinPayment('');
      setEditingDebtDueDate('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `usuarios/${currentUser.uid}/deudas/${debtId}`);
    } finally {
      setEditingDebtLoading(false);
    }
  };

  // Eliminar deuda de Firestore
  const handleDeleteDebt = async (debtId: string) => {
    if (!currentUser) return;
    if (!confirm('¿Estás seguro de que deseas eliminar esta deuda?')) return;
    try {
      const docRef = doc(db, 'usuarios', currentUser.uid, 'deudas', debtId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `usuarios/${currentUser.uid}/deudas/${debtId}`);
    }
  };

  // Crear suscripciones en Firestore
  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!newSubName.trim() || !newSubCost.trim() || !newSubDueDate.trim()) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    const costNum = parseFloat(newSubCost);
    if (isNaN(costNum) || costNum <= 0) {
      alert('Por favor ingrese un costo válido para la suscripción.');
      return;
    }

    setNewSubLoading(true);
    try {
      const subsRef = collection(db, 'usuarios', currentUser.uid, 'suscripciones');
      await addDoc(subsRef, {
        name: newSubName.trim(),
        cost: costNum,
        dueDate: newSubDueDate,
        account: newSubAccount.trim() || 'Sin especificar',
        status: newSubStatus,
        fechaCreacion: new Date().toISOString()
      });
      setNewSubName('');
      setNewSubCost('');
      setNewSubDueDate('');
      setNewSubAccount('');
      setNewSubStatus('active');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `usuarios/${currentUser.uid}/suscripciones`);
    } finally {
      setNewSubLoading(false);
    }
  };

  // Actualizar suscripción en Firestore
  const handleUpdateSubscription = async (subId: string) => {
    if (!currentUser) return;
    const costNum = parseFloat(editingSubCost);

    if (isNaN(costNum) || costNum < 0) {
      alert('Por favor ingrese un costo válido.');
      return;
    }

    setEditingSubLoading(true);
    try {
      const docRef = doc(db, 'usuarios', currentUser.uid, 'suscripciones', subId);
      await updateDoc(docRef, {
        cost: costNum,
        dueDate: editingSubDueDate,
        status: editingSubStatus
      });
      setEditingSubId(null);
      setEditingSubCost('');
      setEditingSubDueDate('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `usuarios/${currentUser.uid}/suscripciones/${subId}`);
    } finally {
      setEditingSubLoading(false);
    }
  };

  // Eliminar suscripción de Firestore
  const handleDeleteSubscription = async (subId: string) => {
    if (!currentUser) return;
    if (!confirm('¿Estás seguro de que deseas eliminar esta suscripción?')) return;
    try {
      const docRef = doc(db, 'usuarios', currentUser.uid, 'suscripciones', subId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `usuarios/${currentUser.uid}/suscripciones/${subId}`);
    }
  };

  // Actualizar perfil de usuario en Firestore
  const handleUpdateUserProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!userProfileName.trim()) {
      alert('El nombre de usuario no puede estar vacío.');
      return;
    }

    setUserProfileLoading(true);
    try {
      const docRef = doc(db, 'usuarios', currentUser.uid, 'configuracion', 'preferencias');
      await setDoc(docRef, {
        name: userProfileName.trim(),
        currency: userProfileCurrency,
        language: userProfileLanguage,
        theme: userProfileTheme,
        fechaActualizacion: new Date().toISOString()
      }, { merge: true });
      alert('Perfil y preferencias guardadas exitosamente.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `usuarios/${currentUser.uid}/configuracion/preferencias`);
    } finally {
      setUserProfileLoading(false);
    }
  };

  const isCategoryMatch = (txCategory: string, budgetCategory: string) => {
    const txName = getCategoryDetails(txCategory).name.toLowerCase().trim();
    const budgetName = getCategoryDetails(budgetCategory).name.toLowerCase().trim();
    return txName === budgetName;
  };

  const getMonthlySpendForCategory = (budgetCategory: string) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const yearMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    return transactions
      .filter(tx => {
        const isExpense = tx.type === 'expense' || (tx as any).tipo === 'egreso';
        if (!isExpense) return false;

        const txDateStr = tx.date || (tx as any).fecha || '';
        const isCurrentMonth = txDateStr.startsWith(yearMonthPrefix);
        if (!isCurrentMonth) return false;

        return isCategoryMatch(tx.category || (tx as any).categoria || '', budgetCategory);
      })
      .reduce((sum, tx) => sum + (tx.amount || (tx as any).monto || 0), 0);
  };

  // Agregar transacción en el Demostrador
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!txAmount || isNaN(parseFloat(txAmount)) || parseFloat(txAmount) <= 0) {
      alert('Por favor ingrese un monto válido.');
      return;
    }

    setTxLoading(true);
    try {
      const parsedAmount = parseFloat(txAmount);
      
      // Encontrar la cuenta seleccionada o recurrir a la primera por defecto
      let targetAccountId = txAccountId;
      let targetAccount = accounts.find(a => a.id === targetAccountId);
      
      if (!targetAccount && accounts.length > 0) {
        targetAccount = accounts.find(a => a.tipo === 'credito') || accounts[0];
        targetAccountId = targetAccount.id;
      }

      if (!targetAccount) {
        alert('Debe crear al menos una cuenta para registrar transacciones.');
        setTxLoading(false);
        return;
      }

      const nuevoSaldo = txType === 'income' 
        ? targetAccount.saldo + parsedAmount
        : targetAccount.saldo - parsedAmount;

      // 1. Agregar movimiento contable en Firestore
      await addDoc(collection(db, 'usuarios', currentUser.uid, 'movimientos'), {
        monto: parsedAmount,
        tipo: txType === 'income' ? 'ingreso' : 'egreso',
        categoria: txCategory,
        descripcion: txDescription.trim() || (txType === 'income' ? 'Ingreso General' : 'Gasto General'),
        fecha: new Date().toISOString().split('T')[0],
        fechaCreacion: new Date().toISOString(),
        accountId: targetAccountId,
        cuentaId: targetAccountId,

        // Compatibilidad en inglés
        amount: parsedAmount,
        type: txType,
        category: txCategory,
        description: txDescription.trim() || (txType === 'income' ? 'Ingreso General' : 'Gasto General'),
        date: new Date().toISOString()
      });

      // 2. Actualizar el saldo de la cuenta de origen/destino
      const accRef = doc(db, 'usuarios', currentUser.uid, 'cuentas', targetAccountId);
      await updateDoc(accRef, { saldo: nuevoSaldo });

      // Limpiar formulario
      setTxAmount('');
      setTxDescription('');
    } catch (error) {
      console.error("Error al guardar la transacción:", error);
      handleFirestoreError(error, OperationType.WRITE, `usuarios/${currentUser.uid}/movimientos`);
    } finally {
      setTxLoading(false);
    }
  };

  // Eliminar transacción de Firestore
  const handleDeleteTransaction = async (id: string) => {
    if (!currentUser) return;
    try {
      // 1. Obtener la transacción antes de eliminarla para restaurar el saldo de la cuenta si está asociada
      const txRef = doc(db, 'usuarios', currentUser.uid, 'movimientos', id);
      const txSnap = await getDocFromServer(txRef);
      if (txSnap.exists()) {
        const txData = txSnap.data();
        const accId = txData.accountId || txData.cuentaId;
        const monto = txData.monto !== undefined ? txData.monto : (txData.amount || 0);
        const tipo = txData.tipo !== undefined ? txData.tipo : (txData.type || 'egreso');
        
        if (accId) {
          const accRef = doc(db, 'usuarios', currentUser.uid, 'cuentas', accId);
          const accSnap = await getDocFromServer(accRef);
          if (accSnap.exists()) {
            const accData = accSnap.data();
            // Deshacer la operación
            const nuevoSaldo = (tipo === 'ingreso' || tipo === 'income')
              ? accData.saldo - monto
              : accData.saldo + monto;
            await updateDoc(accRef, { saldo: nuevoSaldo });
          }
        }
      }

      await deleteDoc(doc(db, 'usuarios', currentUser.uid, 'movimientos', id));
    } catch (error) {
      console.error("Error eliminando transacción:", error);
      handleFirestoreError(error, OperationType.DELETE, `usuarios/${currentUser.uid}/movimientos/${id}`);
    }
  };

  // Crear una nueva cuenta en Firestore
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!newAccountName.trim()) {
      alert('Por favor ingrese un nombre de cuenta válido.');
      return;
    }
    const parsedBalance = parseFloat(newAccountBalance) || 0;
    const finalSubtipo = newAccountType === 'deuda' ? 'deudas' : newAccountSubtipo;
    
    setNewAccountLoading(true);
    try {
      const accountsRef = collection(db, 'usuarios', currentUser.uid, 'cuentas');
      const docRef = await addDoc(accountsRef, {
        nombre: newAccountName.trim(),
        tipo: newAccountType,
        subtipo: finalSubtipo,
        saldo: parsedBalance,
        color: newAccountColor,
        icono: newAccountIcon,
        fechaCreacion: new Date().toISOString()
      });
      
      // Registrar transacción de saldo inicial
      if (parsedBalance > 0) {
        await addDoc(collection(db, 'usuarios', currentUser.uid, 'movimientos'), {
          monto: parsedBalance,
          tipo: newAccountType === 'credito' ? 'ingreso' : 'egreso',
          categoria: 'Sueldo',
          descripcion: `Saldo inicial - ${newAccountName}`,
          fecha: new Date().toISOString().split('T')[0],
          fechaCreacion: new Date().toISOString(),
          accountId: docRef.id,
          cuentaId: docRef.id,
          amount: parsedBalance,
          type: newAccountType === 'credito' ? 'income' : 'expense',
          category: 'Sueldo',
          description: `Saldo inicial - ${newAccountName}`,
          date: new Date().toISOString()
        });
      }

      setNewAccountName('');
      setNewAccountBalance('');
      setNewAccountColor('emerald');
      setNewAccountIcon('wallet');
      setNewAccountSubtipo('disponible');
      setShowNewAccountModal(false);
      setSelectedAccountId(docRef.id); // Autoseleccionar la cuenta creada
    } catch (err) {
      console.error("Error creating account:", err);
      handleFirestoreError(err, OperationType.CREATE, `usuarios/${currentUser.uid}/cuentas`);
    } finally {
      setNewAccountLoading(false);
    }
  };

  // Eliminar una cuenta de Firestore
  const handleDeleteAccount = async (accountId: string) => {
    if (!currentUser) return;
    if (!confirm('¿Estás seguro de que deseas eliminar esta cuenta? Los movimientos históricos se conservarán pero la cuenta desaparecerá.')) return;
    try {
      await deleteDoc(doc(db, 'usuarios', currentUser.uid, 'cuentas', accountId));
      if (selectedAccountId === accountId) {
        setSelectedAccountId(null);
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      handleFirestoreError(err, OperationType.DELETE, `usuarios/${currentUser.uid}/cuentas/${accountId}`);
    }
  };

  // Depósito o Retiro en Cuenta seleccionada
  const handleAccountTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedAccountId) {
      alert('Seleccione una cuenta primero.');
      return;
    }
    if (!actTxAmount || isNaN(parseFloat(actTxAmount)) || parseFloat(actTxAmount) <= 0) {
      alert('Por favor ingrese un monto válido.');
      return;
    }

    setActTxLoading(true);
    try {
      const parsedAmount = parseFloat(actTxAmount);
      const targetAccount = accounts.find(a => a.id === selectedAccountId);
      if (!targetAccount) throw new Error("Account not found");

      const nuevoSaldo = actTxType === 'income'
        ? targetAccount.saldo + parsedAmount
        : targetAccount.saldo - parsedAmount;

      // 1. Guardar movimiento
      await addDoc(collection(db, 'usuarios', currentUser.uid, 'movimientos'), {
        monto: parsedAmount,
        tipo: actTxType === 'income' ? 'ingreso' : 'egreso',
        categoria: actTxCategory,
        descripcion: actTxDescription.trim() || (actTxType === 'income' ? 'Depósito' : 'Retiro'),
        fecha: new Date().toISOString().split('T')[0],
        fechaCreacion: new Date().toISOString(),
        accountId: selectedAccountId,
        cuentaId: selectedAccountId,
        amount: parsedAmount,
        type: actTxType,
        category: actTxCategory,
        description: actTxDescription.trim() || (actTxType === 'income' ? 'Depósito' : 'Retiro'),
        date: new Date().toISOString()
      });

      // 2. Actualizar saldo
      const accRef = doc(db, 'usuarios', currentUser.uid, 'cuentas', selectedAccountId);
      await updateDoc(accRef, { saldo: nuevoSaldo });

      // Limpiar campos
      setActTxAmount('');
      setActTxDescription('');
    } catch (err) {
      console.error("Error running account transaction:", err);
      handleFirestoreError(err, OperationType.WRITE, `usuarios/${currentUser.uid}/movimientos`);
    } finally {
      setActTxLoading(false);
    }
  };

  // Transferencia de saldo entre cuentas
  const handleAccountTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedAccountId) {
      alert('Seleccione una cuenta de origen primero.');
      return;
    }
    if (!transferTargetAccountId) {
      alert('Seleccione una cuenta de destino.');
      return;
    }
    if (selectedAccountId === transferTargetAccountId) {
      alert('La cuenta de origen y de destino no pueden ser la misma.');
      return;
    }
    if (!transferAmount || isNaN(parseFloat(transferAmount)) || parseFloat(transferAmount) <= 0) {
      alert('Por favor ingrese un monto válido.');
      return;
    }

    setTransferLoading(true);
    try {
      const parsedAmount = parseFloat(transferAmount);
      const sourceAccount = accounts.find(a => a.id === selectedAccountId);
      const targetAccount = accounts.find(a => a.id === transferTargetAccountId);

      if (!sourceAccount || !targetAccount) {
        throw new Error("Cuentas no encontradas.");
      }

      if (sourceAccount.tipo === 'credito' && sourceAccount.saldo < parsedAmount) {
        if (!confirm(`El saldo de la cuenta de origen ($${sourceAccount.saldo.toFixed(2)}) es menor que el monto a transferir ($${parsedAmount.toFixed(2)}). ¿Desea continuar de todos modos?`)) {
          setTransferLoading(false);
          return;
        }
      }

      const nuevoSaldoOrigen = sourceAccount.saldo - parsedAmount;
      const nuevoSaldoDestino = targetAccount.saldo + parsedAmount;

      const descTransferencia = transferDescription.trim() || `Traspaso de fondos`;

      // 1. Guardar movimiento de egreso en la cuenta de origen
      await addDoc(collection(db, 'usuarios', currentUser.uid, 'movimientos'), {
        monto: parsedAmount,
        tipo: 'egreso',
        categoria: 'Transferencia',
        descripcion: `${descTransferencia} (Enviado a ${targetAccount.nombre})`,
        fecha: new Date().toISOString().split('T')[0],
        fechaCreacion: new Date().toISOString(),
        accountId: selectedAccountId,
        cuentaId: selectedAccountId,
        amount: parsedAmount,
        type: 'expense',
        category: 'Transferencia',
        description: `${descTransferencia} (Enviado a ${targetAccount.nombre})`,
        date: new Date().toISOString()
      });

      // 2. Guardar movimiento de ingreso en la cuenta de destino
      await addDoc(collection(db, 'usuarios', currentUser.uid, 'movimientos'), {
        monto: parsedAmount,
        tipo: 'ingreso',
        categoria: 'Transferencia',
        descripcion: `${descTransferencia} (Recibido de ${sourceAccount.nombre})`,
        fecha: new Date().toISOString().split('T')[0],
        fechaCreacion: new Date().toISOString() + 'Z',
        accountId: transferTargetAccountId,
        cuentaId: transferTargetAccountId,
        amount: parsedAmount,
        type: 'income',
        category: 'Transferencia',
        description: `${descTransferencia} (Recibido de ${sourceAccount.nombre})`,
        date: new Date().toISOString()
      });

      // 3. Actualizar saldos en Firestore
      const sourceRef = doc(db, 'usuarios', currentUser.uid, 'cuentas', selectedAccountId);
      await updateDoc(sourceRef, { saldo: nuevoSaldoOrigen });

      const targetRef = doc(db, 'usuarios', currentUser.uid, 'cuentas', transferTargetAccountId);
      await updateDoc(targetRef, { saldo: nuevoSaldoDestino });

      // Limpiar campos
      setTransferAmount('');
      setTransferTargetAccountId('');
      setTransferDescription('');
      alert('Transferencia realizada con éxito.');
    } catch (err) {
      console.error("Error running account transfer:", err);
      handleFirestoreError(err, OperationType.WRITE, `usuarios/${currentUser.uid}/movimientos`);
    } finally {
      setTransferLoading(false);
    }
  };

  // Registrar un Nuevo Movimiento desde el módulo centralizado de Movimientos
  const handleCreateNewTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Debe iniciar sesión primero.');
      return;
    }
    if (!newTxAmount || isNaN(parseFloat(newTxAmount)) || parseFloat(newTxAmount) <= 0) {
      alert('Por favor, ingrese un monto de valor válido.');
      return;
    }
    if (!newTxAccountId) {
      alert('Por favor, seleccione una cuenta.');
      return;
    }

    setNewTxLoading(true);
    try {
      const parsedAmount = parseFloat(newTxAmount);
      const todayISO = new Date(newTxDate).toISOString();
      const desc = newTxNotes.trim();

      if (newTxType === 'transfer') {
        if (!newTxTargetAccountId) {
          alert('Por favor, seleccione una cuenta de destino.');
          setNewTxLoading(false);
          return;
        }
        if (newTxAccountId === newTxTargetAccountId) {
          alert('La cuenta de origen y de destino no pueden ser la misma.');
          setNewTxLoading(false);
          return;
        }

        const sourceAccount = accounts.find(a => a.id === newTxAccountId);
        const targetAccount = accounts.find(a => a.id === newTxTargetAccountId);

        if (!sourceAccount || !targetAccount) {
          throw new Error("Cuentas no encontradas.");
        }

        if (sourceAccount.tipo === 'credito' && sourceAccount.saldo < parsedAmount) {
          if (!confirm(`El saldo de la cuenta de origen ($${sourceAccount.saldo.toFixed(2)}) es menor que el monto a transferir ($${parsedAmount.toFixed(2)}). ¿Desea continuar de todos modos?`)) {
            setNewTxLoading(false);
            return;
          }
        }

        const nuevoSaldoOrigen = sourceAccount.saldo - parsedAmount;
        const nuevoSaldoDestino = targetAccount.saldo + parsedAmount;
        const descTransferencia = desc || `Traspaso de fondos`;

        // 1. Guardar movimiento de egreso en la cuenta de origen
        await addDoc(collection(db, 'usuarios', currentUser.uid, 'movimientos'), {
          monto: parsedAmount,
          tipo: 'egreso',
          categoria: 'Transferencia',
          descripcion: `${descTransferencia} (Enviado a ${targetAccount.nombre})`,
          fecha: newTxDate,
          fechaCreacion: new Date().toISOString(),
          accountId: newTxAccountId,
          cuentaId: newTxAccountId,
          amount: parsedAmount,
          type: 'expense',
          category: 'Transferencia',
          description: `${descTransferencia} (Enviado a ${targetAccount.nombre})`,
          date: todayISO,
          attachment: newTxAttachment || '',
          adjunto: newTxAttachment || '',
          attachmentName: newTxAttachmentName || ''
        });

        // 2. Guardar movimiento de ingreso en la cuenta de destino
        await addDoc(collection(db, 'usuarios', currentUser.uid, 'movimientos'), {
          monto: parsedAmount,
          tipo: 'ingreso',
          categoria: 'Transferencia',
          descripcion: `${descTransferencia} (Recibido de ${sourceAccount.nombre})`,
          fecha: newTxDate,
          fechaCreacion: new Date().toISOString() + 'Z',
          accountId: newTxTargetAccountId,
          cuentaId: newTxTargetAccountId,
          amount: parsedAmount,
          type: 'income',
          category: 'Transferencia',
          description: `${descTransferencia} (Recibido de ${sourceAccount.nombre})`,
          date: todayISO,
          attachment: newTxAttachment || '',
          adjunto: newTxAttachment || '',
          attachmentName: newTxAttachmentName || ''
        });

        // 3. Actualizar saldos en Firestore
        const sourceRef = doc(db, 'usuarios', currentUser.uid, 'cuentas', newTxAccountId);
        await updateDoc(sourceRef, { saldo: nuevoSaldoOrigen });

        const targetRef = doc(db, 'usuarios', currentUser.uid, 'cuentas', newTxTargetAccountId);
        await updateDoc(targetRef, { saldo: nuevoSaldoDestino });

      } else {
        // Ingreso o Gasto
        const targetAccount = accounts.find(a => a.id === newTxAccountId);
        if (!targetAccount) {
          throw new Error("Cuenta no encontrada.");
        }

        const nuevoSaldo = newTxType === 'income'
          ? targetAccount.saldo + parsedAmount
          : targetAccount.saldo - parsedAmount;

        const finalDesc = desc || (newTxType === 'income' ? 'Ingreso Registrado' : 'Gasto Registrado');

        // Guardar movimiento
        await addDoc(collection(db, 'usuarios', currentUser.uid, 'movimientos'), {
          monto: parsedAmount,
          tipo: newTxType === 'income' ? 'ingreso' : 'egreso',
          categoria: newTxCategory,
          descripcion: finalDesc,
          fecha: newTxDate,
          fechaCreacion: new Date().toISOString(),
          accountId: newTxAccountId,
          cuentaId: newTxAccountId,
          amount: parsedAmount,
          type: newTxType,
          category: newTxCategory,
          description: finalDesc,
          date: todayISO,
          attachment: newTxAttachment || '',
          adjunto: newTxAttachment || '',
          attachmentName: newTxAttachmentName || ''
        });

        // Actualizar saldo
        const accRef = doc(db, 'usuarios', currentUser.uid, 'cuentas', newTxAccountId);
        await updateDoc(accRef, { saldo: nuevoSaldo });
      }

      // Limpiar campos y cerrar modal
      setNewTxAmount('');
      setNewTxNotes('');
      setNewTxAttachment(null);
      setNewTxAttachmentName('');
      setShowNewTxModal(false);
      alert('Movimiento registrado con éxito.');
    } catch (err) {
      console.error("Error al registrar movimiento:", err);
      handleFirestoreError(err, OperationType.WRITE, `usuarios/${currentUser.uid}/movimientos`);
    } finally {
      setNewTxLoading(false);
    }
  };

  // Copiar código al portapapeles
  const handleCopyCode = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Cálculos financieros
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  // Códigos para mostrar en el visor de código de Angular
  const angularCodeFiles: Record<string, string> = {
    config: `// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { routes } from './app.routes';
import { firebaseConfig } from './firebase-config';

export const appConfig: ApplicationConfig = {
  providers: [
    // Proveedor del Enrutador Angular con nuestras rutas registradas
    provideRouter(routes),
    
    // Inicialización del ecosistema Firebase en Angular de manera Standalone
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]
};`,

    routes: `// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth';

/**
 * Configuración de enrutamiento para Contabilid-App.
 * Define la ruta raíz protegida por un AuthGuard que carga MainLayout y sus subrutas hijas.
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    title: 'Iniciar Sesión - Contabilid-App',
    loadComponent: () => import('./components/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    title: 'Registro de Usuario - Contabilid-App',
    loadComponent: () => import('./components/register/register').then(m => m.Register)
  },
  {
    path: '',
    loadComponent: () => import('./components/main-layout/main-layout').then(m => m.MainLayout),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        title: 'Dashboard - Contabilid-App',
        loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'cuentas',
        title: 'Cuentas - Contabilid-App',
        loadComponent: () => import('./components/cuentas/cuentas').then(m => m.Cuentas)
      },
      {
        path: 'consultas',
        title: 'Consultas - Contabilid-App',
        loadComponent: () => import('./components/consultas/consultas').then(m => m.Consultas)
      },
      {
        path: 'usuario',
        title: 'Usuario - Contabilid-App',
        loadComponent: () => import('./components/usuario/usuario').then(m => m.Usuario)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];`,

    service: `// src/app/services/auth.service.ts
import { Injectable, inject, Signal } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Inyección de dependencia utilizando la función inject() recomendada en Angular moderno
  private auth: Auth = inject(Auth);

  // Observable que emite el estado del usuario en tiempo real
  public user$: Observable<User | null> = authState(this.auth);

  // Signal de Angular que expone el usuario actual de forma síncrona y reactiva
  public currentUser: Signal<User | null | undefined> = toSignal(this.user$);

  /**
   * Registra un nuevo usuario en Firebase Auth con correo y contraseña.
   */
  async register(email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error en el registro de AuthService:', error);
      throw error;
    }
  }

  /**
   * Inicia sesión de un usuario existente con correo y contraseña.
   */
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error en el inicio de sesión de AuthService:', error);
      throw error;
    }
  }

  /**
   * Cierra la sesión activa del usuario actual.
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Error al cerrar sesión en AuthService:', error);
      throw error;
    }
  }
}`,

    finance: `// src/app/services/finance.ts
import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  addDoc, 
  query, 
  orderBy, 
  runTransaction 
} from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface Cuenta {
  id?: string;
  nombre: string;
  tipo: 'deuda' | 'credito'; // 'deuda' (p.ej. tarjeta, préstamo) o 'credito' (p.ej. efectivo, banco)
  saldo: number;
  fechaCreacion: string;
}

export interface Categoria {
  id?: string;
  nombre: string;
  tipo: 'ingreso' | 'egreso' | 'ambos';
  color?: string;
  fechaCreacion: string;
}

export interface Movimiento {
  id?: string;
  monto: number;
  tipo: 'ingreso' | 'egreso' | 'pago_deuda';
  categoria: string;
  descripcion: string;
  fecha: string;
  cuentaOrigenId?: string; // Cuenta origen de fondos
  cuentaDestinoDeudaId?: string; // Cuenta de deuda destino del pago
  fechaCreacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);

  /**
   * Obtiene las cuentas en tiempo real filtradas para el usuario autenticado.
   */
  getCuentas(): Observable<Cuenta[]> {
    return authState(this.auth).pipe(
      switchMap(user => {
        if (!user) return of([]);
        const cuentasRef = collection(this.firestore, \`usuarios/\${user.uid}/cuentas\`);
        const q = query(cuentasRef, orderBy('nombre', 'asc'));
        return collectionData(q, { idField: 'id' }) as Observable<Cuenta[]>;
      })
    );
  }

  /**
   * Crea una nueva cuenta (de crédito/ahorro o deuda).
   */
  async crearCuenta(cuenta: Omit<Cuenta, 'id' | 'fechaCreacion'>): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado.');

    const cuentasRef = collection(this.firestore, \`usuarios/\${user.uid}/cuentas\`);
    const nuevaCuenta: Omit<Cuenta, 'id'> = {
      ...cuenta,
      fechaCreacion: new Date().toISOString()
    };
    const docRef = await addDoc(cuentasRef, nuevaCuenta);
    return docRef.id;
  }

  /**
   * Obtiene las categorías personalizadas en tiempo real.
   */
  getCategorias(): Observable<Categoria[]> {
    return authState(this.auth).pipe(
      switchMap(user => {
        if (!user) return of([]);
        const categoriasRef = collection(this.firestore, \`usuarios/\${user.uid}/categorias\`);
        const q = query(categoriasRef, orderBy('nombre', 'asc'));
        return collectionData(q, { idField: 'id' }) as Observable<Categoria[]>;
      })
    );
  }

  /**
   * Crea una nueva categoría.
   */
  async crearCategoria(categoria: Omit<Categoria, 'id' | 'fechaCreacion'>): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado.');

    const categoriasRef = collection(this.firestore, \`usuarios/\${user.uid}/categorias\`);
    const nuevaCategoria: Omit<Categoria, 'id'> = {
      ...categoria,
      fechaCreacion: new Date().toISOString()
    };
    const docRef = await addDoc(categoriasRef, nuevaCategoria);
    return docRef.id;
  }

  /**
   * Obtiene el listado de movimientos en tiempo real ordenados por fecha.
   */
  getMovimientos(): Observable<Movimiento[]> {
    return authState(this.auth).pipe(
      switchMap(user => {
        if (!user) return of([]);
        const movimientosRef = collection(this.firestore, \`usuarios/\${user.uid}/movimientos\`);
        const q = query(movimientosRef, orderBy('fecha', 'desc'));
        return collectionData(q, { idField: 'id' }) as Observable<Movimiento[]>;
      })
    );
  }

  /**
   * Registra un movimiento atómico actualizando saldos correspondientes (ingreso, egreso o pago_deuda).
   */
  async registrarMovimiento(movimiento: Omit<Movimiento, 'id' | 'fechaCreacion'>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado.');

    const uid = user.uid;
    const movimientoConFecha: Omit<Movimiento, 'id'> = {
      ...movimiento,
      fechaCreacion: new Date().toISOString()
    };

    await runTransaction(this.firestore, async (transaction) => {
      const movimientosColRef = collection(this.firestore, \`usuarios/\${uid}/movimientos\`);
      const nuevoMovimientoDocRef = doc(movimientosColRef);

      // 1. Ingreso o Egreso común
      if (movimiento.tipo === 'ingreso' || movimiento.tipo === 'egreso') {
        if (!movimiento.cuentaOrigenId) throw new Error('Se requiere una cuenta.');
        const cuentaRef = doc(this.firestore, \`usuarios/\${uid}/cuentas/\${movimiento.cuentaOrigenId}\`);
        const cuentaSnap = await transaction.get(cuentaRef);
        if (!cuentaSnap.exists()) throw new Error('La cuenta no existe.');

        const saldoActual = cuentaSnap.data()['saldo'] || 0;
        const nuevoSaldo = movimiento.tipo === 'ingreso' 
          ? saldoActual + movimiento.monto 
          : saldoActual - movimiento.monto;
          
        transaction.update(cuentaRef, { saldo: nuevoSaldo });
      }

      // 2. Pago a Deuda: Afecta proporcionalmente a dos cuentas simultáneamente
      if (movimiento.tipo === 'pago_deuda') {
        if (!movimiento.cuentaOrigenId || !movimiento.cuentaDestinoDeudaId) {
          throw new Error('Se requieren las cuentas de origen y de deuda de destino.');
        }

        const cuentaOrigenRef = doc(this.firestore, \`usuarios/\${uid}/cuentas/\${movimiento.cuentaOrigenId}\`);
        const cuentaDeudaRef = doc(this.firestore, \`usuarios/\${uid}/cuentas/\${movimiento.cuentaDestinoDeudaId}\`);

        const [origenSnap, deudaSnap] = await Promise.all([
          transaction.get(cuentaOrigenRef),
          transaction.get(cuentaDeudaRef)
        ]);

        if (!origenSnap.exists() || !deudaSnap.exists()) {
          throw new Error('La cuenta de origen o de deuda de destino no existe.');
        }

        const saldoOrigenActual = origenSnap.data()['saldo'] || 0;
        const saldoDeudaActual = deudaSnap.data()['saldo'] || 0;

        // Se resta el monto pagado de la cuenta de origen (egreso de caja/banco)
        transaction.update(cuentaOrigenRef, { saldo: saldoOrigenActual - movimiento.monto });

        // Se reduce proporcionalmente el balance pendiente de la deuda
        transaction.update(cuentaDeudaRef, { saldo: saldoDeudaActual - movimiento.monto });
      }

      // Graba el movimiento
      transaction.set(nuevoMovimientoDocRef, movimientoConFecha);
    });
  }
}
`,

    transaction: `// src/app/components/transaction-form/transaction-form.ts
import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { FinanceService, Cuenta, Categoria } from '../../services/finance';

@Component({
  selector: 'app-transaction-form',
  imports: [ReactiveFormsModule],
  template: \`
    <div class="w-full max-w-xl mx-auto bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden font-sans">
      <!-- Ambient Lights -->
      <div class="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <!-- Header -->
      <div class="relative z-10 mb-6">
        <h3 class="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Registrar Movimiento
        </h3>
        <p class="text-xs text-slate-400 mt-1">Registra ingresos, egresos y abonos a deudas de forma sincronizada</p>
      </div>

      <!-- Success & Error Alerts -->
      @if (successMessage()) {
        <div class="mb-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-xs text-emerald-400 flex items-start gap-3 relative z-10">
          <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1">
            <p class="font-semibold text-emerald-300">¡Registro exitoso!</p>
            <p class="text-[11px] text-emerald-400/80 mt-0.5">{{ successMessage() }}</p>
          </div>
        </div>
      }

      @if (errorMessage()) {
        <div class="mb-5 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-xs text-red-400 flex items-start gap-3 relative z-10">
          <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1">
            <p class="font-semibold text-red-300">Ha ocurrido un error</p>
            <p class="text-[11px] text-red-400/80 mt-0.5">{{ errorMessage() }}</p>
          </div>
        </div>
      }

      <!-- Form -->
      <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()" class="relative z-10 flex flex-col gap-5">
        
        <!-- Tab Select for Transaction Type -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-400">Tipo de Movimiento</label>
          <div class="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800/80">
            <button
              type="button"
              (click)="setTipo('egreso')"
              [class]="tipoSelected() === 'egreso' 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-semibold shadow-md' 
                : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent'"
              class="py-2 px-3 rounded-xl text-xs transition-all border flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              Egreso
            </button>
            <button
              type="button"
              (click)="setTipo('ingreso')"
              [class]="tipoSelected() === 'ingreso' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold shadow-md' 
                : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent'"
              class="py-2 px-3 rounded-xl text-xs transition-all border flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Ingreso
            </button>
            <button
              type="button"
              (click)="setTipo('pago_deuda')"
              [class]="tipoSelected() === 'pago_deuda' 
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 font-semibold shadow-md' 
                : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent'"
              class="py-2 px-3 rounded-xl text-xs transition-all border flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Pago Deuda
            </button>
          </div>
        </div>

        <!-- Amount Input -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-400" for="monto">Monto de la Transacción</label>
          <div class="relative font-sans">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">$</span>
            <input
              id="monto"
              type="number"
              formControlName="monto"
              placeholder="0.00"
              class="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <!-- Accounts Select Block (Origin) -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-400" for="cuentaOrigenId">
            {{ tipoSelected() === 'pago_deuda' ? 'Cuenta de Origen (Pago de fondos)' : 'Cuenta Asociada' }}
          </label>
          <div class="relative">
            <select
              id="cuentaOrigenId"
              formControlName="cuentaOrigenId"
              class="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled selected>Selecciona una cuenta</option>
              @for (cuenta of cuentasOrigenFiltradas(); track cuenta.id) {
                <option [value]="cuenta.id" class="bg-slate-900 text-white">
                  {{ cuenta.nombre }} (Saldo: $ {{ cuenta.saldo }})
                </option>
              }
            </select>
          </div>
        </div>

        <!-- Debt Destination Account (Only for 'pago_deuda') -->
        @if (tipoSelected() === 'pago_deuda') {
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-400" for="cuentaDestinoDeudaId">Cuenta de Deuda (Abonar a)</label>
            <div class="relative">
              <select
                id="cuentaDestinoDeudaId"
                formControlName="cuentaDestinoDeudaId"
                class="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled selected>Selecciona la cuenta de deuda</option>
                @for (deuda of cuentasDeudaFiltradas(); track deuda.id) {
                  <option [value]="deuda.id" class="bg-slate-900 text-white">
                    {{ deuda.nombre }} (Deuda Pendiente: $ {{ deuda.saldo }})
                  </option>
                }
              </select>
            </div>
          </div>
        }

        <!-- Category Select Block -->
        @if (tipoSelected() !== 'pago_deuda') {
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-400" for="categoria">Categoría</label>
            <div class="relative">
              <select
                id="categoria"
                formControlName="categoria"
                class="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled selected>Selecciona una categoría</option>
                @for (cat of categoriasFiltradas(); track cat.id) {
                  <option [value]="cat.nombre" class="bg-slate-900 text-white">{{ cat.nombre }}</option>
                }
              </select>
            </div>
          </div>
        }

        <!-- Description Input -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-400" for="descripcion">Descripción / Notas</label>
          <input
            id="descripcion"
            type="text"
            formControlName="descripcion"
            placeholder="Súper semanal, abono tarjeta..."
            class="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
          />
        </div>

        <!-- Date Picker -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-400" for="fecha">Fecha del Movimiento</label>
          <input
            id="fecha"
            type="date"
            formControlName="fecha"
            class="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
          />
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          [disabled]="loading() || transactionForm.invalid"
          class="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold py-3.5 px-4 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-[0.98] mt-2"
        >
          @if (loading()) {
            <span>Procesando Transacción...</span>
          } @else {
            <span>Confirmar Movimiento</span>
          }
        </button>
      </form>
    </div>
  \`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionForm {
  private financeService = inject(FinanceService);

  loading = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  tipoSelected = signal<'ingreso' | 'egreso' | 'pago_deuda'>('egreso');

  cuentas = toSignal(this.financeService.getCuentas(), { initialValue: [] });
  categorias = toSignal(this.financeService.getCategorias(), { initialValue: [] });

  cuentasOrigenFiltradas = computed(() => this.cuentas().filter((c: Cuenta) => c.tipo === 'credito'));
  cuentasDeudaFiltradas = computed(() => this.cuentas().filter((c: Cuenta) => c.tipo === 'deuda'));
  categoriasFiltradas = computed(() => {
    const tipo = this.tipoSelected();
    const cats = this.categorias();
    if (tipo === 'ingreso') {
      return cats.filter((c: Categoria) => c.tipo === 'ingreso' || c.tipo === 'ambos');
    } else {
      return cats.filter((c: Categoria) => c.tipo === 'egreso' || c.tipo === 'ambos');
    }
  });

  transactionForm = new FormGroup({
    tipo: new FormControl<'ingreso' | 'egreso' | 'pago_deuda'>('egreso', { nonNullable: true, validators: [Validators.required] }),
    monto: new FormControl<number | null>(null, { nonNullable: true, validators: [Validators.required, Validators.min(0.01)] }),
    cuentaOrigenId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    cuentaDestinoDeudaId: new FormControl(''),
    categoria: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descripcion: new FormControl('', { nonNullable: true }),
    fecha: new FormControl(new Date().toISOString().split('T')[0], { nonNullable: true, validators: [Validators.required] })
  });

  constructor() {
    this.transactionForm.get('tipo')?.valueChanges.subscribe(val => {
      if (val) {
        this.tipoSelected.set(val);
        this.onTipoChange(val);
      }
    });
  }

  setTipo(tipo: 'ingreso' | 'egreso' | 'pago_deuda') {
    this.transactionForm.get('tipo')?.setValue(tipo);
  }

  onTipoChange(tipo: 'ingreso' | 'egreso' | 'pago_deuda') {
    const catCtrl = this.transactionForm.get('categoria');
    const destCtrl = this.transactionForm.get('cuentaDestinoDeudaId');

    if (tipo === 'pago_deuda') {
      catCtrl?.clearValidators();
      catCtrl?.setValue('Pago de Deuda');
      destCtrl?.setValidators([Validators.required]);
    } else {
      catCtrl?.setValidators([Validators.required]);
      if (catCtrl?.value === 'Pago de Deuda') {
        catCtrl.setValue('');
      }
      destCtrl?.clearValidators();
      destCtrl?.setValue('');
    }
    catCtrl?.updateValueAndValidity();
    destCtrl?.updateValueAndValidity();
  }

  async onSubmit(): Promise<void> {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const vals = this.transactionForm.getRawValue();

    try {
      await this.financeService.registrarMovimiento({
        monto: vals.monto!,
        tipo: vals.tipo,
        categoria: vals.categoria,
        descripcion: vals.descripcion,
        fecha: vals.fecha,
        cuentaOrigenId: vals.cuentaOrigenId,
        cuentaDestinoDeudaId: vals.tipo === 'pago_deuda' ? vals.cuentaDestinoDeudaId || undefined : undefined
      });
      this.successMessage.set('Movimiento registrado y saldos actualizados con éxito.');
      this.resetForm();
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Error al guardar el movimiento.');
    } finally {
      this.loading.set(false);
    }
  }

  private resetForm() {
    this.transactionForm.reset({
      tipo: 'egreso',
      monto: null as any,
      cuentaOrigenId: '',
      cuentaDestinoDeudaId: '',
      categoria: '',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0]
    });
    this.tipoSelected.set('egreso');
    this.onTipoChange('egreso');
  }
}
`,

    history: `// src/app/components/transaction-history/transaction-history.ts
import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { FinanceService, Movimiento, Cuenta, Categoria } from '../../services/finance';

@Component({
  selector: 'app-transaction-history',
  imports: [ReactiveFormsModule],
  template: \`
    <div class="w-full max-w-4xl mx-auto bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden font-sans">
      <!-- Background Ambient Glows -->
      <div class="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <!-- Header -->
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-800/60 pb-6">
        <div>
          <h3 class="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Historial de Movimientos
          </h3>
          <p class="text-xs text-slate-400 mt-1">Consulta y filtra tus movimientos en tiempo real</p>
        </div>

        <!-- Quick Stats of Filtered Items -->
        <div class="flex gap-3 text-xs">
          <div class="bg-slate-950/80 border border-slate-800/80 rounded-2xl px-4 py-2 flex flex-col justify-center min-w-[100px]">
            <span class="text-[10px] text-slate-500 font-semibold uppercase">Ingresos</span>
            <span class="text-emerald-400 font-bold text-sm mt-0.5">$ \\{\\{ totalIngresosFiltrados().toLocaleString() \\}}</span>
          </div>
          <div class="bg-slate-950/80 border border-slate-800/80 rounded-2xl px-4 py-2 flex flex-col justify-center min-w-[100px]">
            <span class="text-[10px] text-slate-500 font-semibold uppercase">Egresos</span>
            <span class="text-rose-400 font-bold text-sm mt-0.5">$ \\{\\{ totalEgresosFiltrados().toLocaleString() \\}}</span>
          </div>
          <div class="bg-slate-950/80 border border-slate-800/80 rounded-2xl px-4 py-2 flex flex-col justify-center min-w-[100px]">
            <span class="text-[10px] text-slate-500 font-semibold uppercase">Resultados</span>
            <span class="text-slate-300 font-bold text-sm mt-0.5">\\{\\{ movimientosFiltrados().length \\}}</span>
          </div>
        </div>
      </div>

      <!-- Filters Form -->
      <form [formGroup]="filtersForm" class="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl">
        <!-- Search Input -->
        <div class="md:col-span-4 flex flex-col gap-1.5">
          <label class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider" for="search">Buscar descripción</label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              id="search"
              type="text"
              formControlName="search"
              placeholder="Ej. Súper, Netflix, Nómina..."
              class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <!-- Start Date -->
        <div class="md:col-span-2.5 flex flex-col gap-1.5">
          <label class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider" for="fechaInicio">Desde</label>
          <input
            id="fechaInicio"
            type="date"
            formControlName="fechaInicio"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all [color-scheme:dark]"
          />
        </div>

        <!-- End Date -->
        <div class="md:col-span-2.5 flex flex-col gap-1.5">
          <label class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider" for="fechaFin">Hasta</label>
          <input
            id="fechaFin"
            type="date"
            formControlName="fechaFin"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all [color-scheme:dark]"
          />
        </div>

        <!-- Category Filter -->
        <div class="md:col-span-1.5 flex flex-col gap-1.5">
          <label class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider" for="catFilter">Categoría</label>
          <select
            id="catFilter"
            formControlName="categoria"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
          >
            <option value="">Todas</option>
            <option value="Pago de Deuda">Pago de Deuda</option>
            \\@for (cat of categorias(); track cat.id) {
              <option [value]="cat.nombre">\\{\\{ cat.nombre \\}}</option>
            }
          </select>
        </div>

        <!-- Account Filter -->
        <div class="md:col-span-1.5 flex flex-col gap-1.5">
          <label class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider" for="accountFilter">Cuenta</label>
          <select
            id="accountFilter"
            formControlName="cuentaId"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
          >
            <option value="">Todas</option>
            \\@for (cuenta of cuentas(); track cuenta.id) {
              <option [value]="cuenta.id">\\{\\{ cuenta.nombre \\}}</option>
            }
          </select>
        </div>
      </form>

      <!-- Clear Filters Button -->
      \\@if (isAnyFilterActive()) {
        <div class="relative z-10 flex justify-end mb-4">
          <button
            type="button"
            (click)="resetFilters()"
            class="flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold transition-all hover:underline cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
            </svg>
            Restablecer Filtros (Mes Actual)
          </button>
        </div>
      }

      <!-- Movements Table / Cards -->
      <div class="relative z-10 overflow-hidden border border-slate-800 rounded-2xl bg-slate-950/30">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-800 bg-slate-950/70 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                <th class="py-3.5 px-4">Fecha</th>
                <th class="py-3.5 px-4">Descripción</th>
                <th class="py-3.5 px-4">Categoría</th>
                <th class="py-3.5 px-4">Cuenta(s)</th>
                <th class="py-3.5 px-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/50 text-slate-300 text-xs">
              \\@for (mov of movimientosFiltrados(); track mov.id) {
                <tr class="hover:bg-slate-800/15 transition-all">
                  <td class="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                    \\{\\{ formatDate(mov.fecha) \\}}
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="font-medium text-slate-200">\\{\\{ mov.descripcion || 'Sin descripción' \\}}</div>
                    \\@if (mov.tipo === 'pago_deuda') {
                      <span class="text-[10px] text-blue-400/80 font-medium">Abono a Deuda</span>
                    }
                  </td>
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <span 
                      [class]="mov.tipo === 'ingreso' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' 
                        : mov.tipo === 'egreso' 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/15' 
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/15'"
                      class="px-2.5 py-1 rounded-full text-[10px] font-semibold"
                    >
                      \\{\\{ mov.categoria || 'Sin categoría' \\}}
                    </span>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="flex flex-col gap-0.5 text-[11px]">
                      <div class="flex items-center gap-1">
                        <span class="text-slate-500">Origen:</span>
                        <span class="text-slate-300 font-medium">\\{\\{ getNombreCuenta(mov.cuentaOrigenId) \\}}</span>
                      </div>
                      \\@if (mov.tipo === 'pago_deuda' && mov.cuentaDestinoDeudaId) {
                        <div class="flex items-center gap-1 text-[10px] text-blue-400">
                          <span>Abono a:</span>
                          <span class="font-semibold">\\{\\{ getNombreCuenta(mov.cuentaDestinoDeudaId) \\}}</span>
                        </div>
                      }
                    </div>
                  </td>
                  <td class="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold text-sm">
                    <span [class]="mov.tipo === 'ingreso' ? 'text-emerald-400' : 'text-slate-200'">
                      \\{\\{ mov.tipo === 'ingreso' ? '+' : '-' \\}} $&nbsp;\\{\\{ mov.monto.toLocaleString() \\}}
                    </span>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="py-10 text-center text-slate-500 text-xs">
                    <div class="flex flex-col items-center justify-center gap-2">
                      <svg class="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p class="font-medium">No se encontraron movimientos</p>
                      <p class="text-[11px] text-slate-600">Intenta modificando los filtros del mes actual</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  \`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionHistory {
  private financeService = inject(FinanceService);

  cuentas = toSignal(this.financeService.getCuentas(), { initialValue: [] });
  categorias = toSignal(this.financeService.getCategorias(), { initialValue: [] });
  movimientosAll = toSignal(this.financeService.getMovimientos(), { initialValue: [] });

  filtersForm = new FormGroup({
    search: new FormControl('', { nonNullable: true }),
    fechaInicio: new FormControl(this.getFirstDayOfCurrentMonth(), { nonNullable: true }),
    fechaFin: new FormControl(this.getLastDayOfCurrentMonth(), { nonNullable: true }),
    categoria: new FormControl('', { nonNullable: true }),
    cuentaId: new FormControl('', { nonNullable: true })
  });

  filters = toSignal(this.filtersForm.valueChanges, { 
    initialValue: this.filtersForm.getRawValue() 
  });

  movimientosFiltrados = computed(() => {
    const f = this.filters();
    const movs = this.movimientosAll();

    const querySearch = f.search.trim().toLowerCase();
    const start = f.fechaInicio;
    const end = f.fechaFin;
    const cat = f.categoria;
    const account = f.cuentaId;

    return movs.filter((m: Movimiento) => {
      if (querySearch && !m.descripcion.toLowerCase().includes(querySearch)) {
        return false;
      }
      if (start && m.fecha < start) {
        return false;
      }
      if (end && m.fecha > end) {
        return false;
      }
      if (cat && m.categoria !== cat) {
        return false;
      }
      if (account) {
        const matchesOrigen = m.cuentaOrigenId === account;
        const matchesDestino = m.cuentaDestinoDeudaId === account;
        if (!matchesOrigen && !matchesDestino) {
          return false;
        }
      }
      return true;
    });
  });

  totalIngresosFiltrados = computed(() => {
    return this.movimientosFiltrados()
      .filter((m: Movimiento) => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + m.monto, 0);
  });

  totalEgresosFiltrados = computed(() => {
    return this.movimientosFiltrados()
      .filter((m: Movimiento) => m.tipo === 'egreso' || m.tipo === 'pago_deuda')
      .reduce((sum, m) => sum + m.monto, 0);
  });

  isAnyFilterActive = computed(() => {
    const f = this.filters();
    const defaultStart = this.getFirstDayOfCurrentMonth();
    const defaultEnd = this.getLastDayOfCurrentMonth();

    return !!(
      f.search || 
      f.categoria || 
      f.cuentaId || 
      f.fechaInicio !== defaultStart || 
      f.fechaFin !== defaultEnd
    );
  });

  getNombreCuenta(id?: string): string {
    if (!id) return '-';
    const c = this.cuentas().find((cuenta: Cuenta) => cuenta.id === id);
    return c ? c.nombre : 'Cuenta eliminada';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return parts[2] + '/' + parts[1] + '/' + parts[0];
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  }

  resetFilters(): void {
    this.filtersForm.reset({
      search: '',
      fechaInicio: this.getFirstDayOfCurrentMonth(),
      fechaFin: this.getLastDayOfCurrentMonth(),
      categoria: '',
      cuentaId: ''
    });
  }

  private getFirstDayOfCurrentMonth(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return year + '-' + month + '-01';
  }

  private getLastDayOfCurrentMonth(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const lastDay = new Date(year, month, 0).getDate();
    const monthStr = String(month).padStart(2, '0');
    const dayStr = String(lastDay).padStart(2, '0');
    return year + '-' + monthStr + '-' + dayStr;
  }
}
`,

    login: `// src/app/components/login/login.ts
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  // Formulario Reactivo con Validaciones Estrictas
  loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)]
    })
  });

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    const { email, password } = this.loginForm.getRawValue();

    try {
      await this.authService.login(email, password);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Error al iniciar sesión.');
    } finally {
      this.loading.set(false);
    }
  }
}`,

    register: `// src/app/components/register/register.ts
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl) => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  return password && confirmPassword && password.value === confirmPassword.value ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  // Formulario Reactivo con Validaciones Estrictas y Validación Cruzada
  registerForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)]
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  }, {
    validators: [passwordMatchValidator]
  });

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { email, password } = this.registerForm.getRawValue();

    try {
      await this.authService.register(email, password);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Error al registrarse.');
    } finally {
      this.loading.set(false);
    }
  }
}`,

    guard: `// src/app/guards/auth.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Funcional Guard de Angular (CanActivateFn) que protege rutas en Contabilid-App.
 * Verifica si hay una sesión activa de Firebase Auth y redirige automáticamente.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map((user) => {
      if (user) {
        return true;
      } else {
        return router.createUrlTree(['/login']);
      }
    })
  );
};`,

    dashboard: `// src/app/components/dashboard/dashboard.ts
import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FinanceService, Movimiento, Cuenta } from '../../services/finance';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [BaseChartDirective],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private financeService = inject(FinanceService);

  // Cuentas y movimientos en tiempo real vinculados desde Firestore mediante Signals
  cuentas = toSignal(this.financeService.getCuentas(), { initialValue: [] });
  movimientosAll = toSignal(this.financeService.getMovimientos(), { initialValue: [] });

  mesActualNombre = computed(() => {
    const nombres = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return nombres[new Date().getMonth()] + ' ' + new Date().getFullYear();
  });

  // Balance general (créditos/activos)
  balanceGeneral = computed(() => {
    return this.cuentas()
      .filter((c: Cuenta) => c.tipo === 'credito')
      .reduce((sum, c) => sum + c.saldo, 0);
  });

  // Deudas pendientes acumuladas (pasivos)
  totalDeudas = computed(() => {
    return this.cuentas()
      .filter((c: Cuenta) => c.tipo === 'deuda')
      .reduce((sum, c) => sum + c.saldo, 0);
  });

  // Balance consolidado (patrimonio neto)
  balanceNeto = computed(() => {
    return this.balanceGeneral() - this.totalDeudas();
  });

  // Filtrar movimientos del mes en curso
  movimientosMesActual = computed(() => {
    const movs = this.movimientosAll();
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    return movs.filter((m: Movimiento) => {
      if (!m.fecha) return false;
      const parts = m.fecha.split('-');
      if (parts.length === 3) {
        return parseInt(parts[0], 10) === currentYear && parseInt(parts[1], 10) === currentMonth;
      }
      return false;
    });
  });

  // Comparativa de ingresos y egresos
  totalIngresosMes = computed(() => {
    return this.movimientosMesActual()
      .filter((m: Movimiento) => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + m.monto, 0);
  });

  totalEgresosMes = computed(() => {
    return this.movimientosMesActual()
      .filter((m: Movimiento) => m.tipo === 'egreso' || m.tipo === 'pago_deuda')
      .reduce((sum, m) => sum + m.monto, 0);
  });

  hasGastoMovimientos = computed(() => {
    return this.movimientosMesActual().some((m: Movimiento) => m.tipo === 'egreso' || m.tipo === 'pago_deuda');
  });

  // Agrupación de gastos por categoría
  gastosPorCategoria = computed(() => {
    const gastos = this.movimientosMesActual().filter((m: Movimiento) => m.tipo === 'egreso' || m.tipo === 'pago_deuda');
    const map: Record<string, number> = {};
    gastos.forEach((m: Movimiento) => {
      const cat = m.categoria || 'Sin categoría';
      map[cat] = (map[cat] || 0) + m.monto;
    });
    return map;
  });

  // Datos reactivos de entrada para el gráfico de barras comparativo (Ingresos vs Egresos del mes)
  barChartData = computed<ChartData<'bar'>>(() => {
    return {
      labels: ['Ingresos del Mes', 'Egresos del Mes'],
      datasets: [
        {
          data: [this.totalIngresosMes(), this.totalEgresosMes()],
          backgroundColor: ['rgba(16, 185, 129, 0.25)', 'rgba(244, 63, 94, 0.25)'],
          borderColor: ['#10b981', '#f43f5e'],
          borderWidth: 2,
          borderRadius: 12,
          barThickness: 36
        }
      ]
    };
  });

  // Datos reactivos de entrada para el gráfico de dona (Egresos agrupados por Categoría)
  doughnutChartData = computed<ChartData<'doughnut'>>(() => {
    const map = this.gastosPorCategoria();
    const labels = Object.keys(map);
    const data = Object.values(map);

    const colors = [
      { fill: 'rgba(99, 102, 241, 0.2)', border: '#6366f1' },
      { fill: 'rgba(236, 72, 153, 0.2)', border: '#ec4899' },
      { fill: 'rgba(245, 158, 11, 0.2)', border: '#f59e0b' },
      { fill: 'rgba(59, 130, 246, 0.2)', border: '#3b82f6' }
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: labels.map((_, i) => colors[i % colors.length].fill),
          borderColor: labels.map((_, i) => colors[i % colors.length].border),
          borderWidth: 1.5,
          hoverOffset: 6
        }
      ]
    };
  });

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }
    }
  };

  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { position: 'right', labels: { color: '#cbd5e1', usePointStyle: true } }
    }
  };
}`
  };

    return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-300 relative overflow-hidden">
      
      {/* Mesh Gradient Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/15 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {!currentUser ? (
        /* ACCESO NO AUTENTICADO: VISTA DE INICIO DE SESIÓN COMPACTA Y MODERNA */
        <div className="flex-1 flex items-center justify-center p-4 relative z-10 min-h-screen">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col gap-6"
          >
            <div className="flex flex-col items-center text-center gap-2">
              <img 
                src="/src/assets/images/app_logo_1782999126227.jpg" 
                alt="Contabilid-App Logo" 
                className="w-16 h-16 rounded-2xl shadow-xl shadow-emerald-500/20 object-cover"
                referrerPolicy="no-referrer"
              />
              <h1 className="text-2xl font-black tracking-tight text-white mt-2">Contabilid-App</h1>
              <p className="text-xs text-slate-400">Tu panel inteligente de control financiero y contable</p>
            </div>

            <form onSubmit={handleAuth} className="flex flex-col gap-4">
              <p className="text-xs text-slate-400 leading-relaxed text-center">
                Ingresa con <strong className="text-emerald-400">Google</strong> de forma directa con 1 clic (recomendado), o introduce tu correo y contraseña registrados.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input 
                    type="email"
                    required
                    placeholder="correo@ejemplo.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input 
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 leading-relaxed">
                  {authError}
                </div>
              )}

              {authSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400">
                  {authSuccess}
                </div>
              )}

              <div className="flex gap-3 mt-1">
                <button
                  type="submit"
                  disabled={authLoading}
                  onClick={() => setAuthMode('login')}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  {authLoading && authMode === 'login' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entrar'}
                </button>
                <button
                  type="submit"
                  disabled={authLoading}
                  onClick={() => setAuthMode('register')}
                  className="flex-1 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-xl text-xs border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {authLoading && authMode === 'register' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Registrarse'}
                </button>
              </div>

              <div className="relative flex items-center justify-center my-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <span className="relative px-3 bg-[#0d1425] text-[10px] text-slate-500 font-bold tracking-wider">O INGRESA DIRECTO</span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={authLoading}
                className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Iniciar con Google (1-Clic)
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthEmail('test@demo.com');
                  setAuthPassword('123456');
                  setAuthMode('login');
                }}
                className="w-full bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Cargar Cuenta Demo Rápida
              </button>
            </form>
          </motion.div>
        </div>
      ) : (
        /* VISTA PRINCIPAL CON SIDEBAR LATERAL Y MÓDULOS DE NAVEGACIÓN */
        <div className="flex-1 flex flex-col md:flex-row relative z-10 min-h-screen">
          
          {/* SIDEBAR LATERAL IZQUIERDO */}
          <aside className="w-full md:w-64 lg:w-72 bg-slate-950/40 backdrop-blur-xl border-r border-white/10 flex flex-col shrink-0">
            {/* Cabezal Sidebar */}
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
              <img 
                src="/src/assets/images/app_logo_1782999126227.jpg" 
                alt="Contabilid-App Logo" 
                className="w-9 h-9 rounded-xl shadow-md object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-white leading-tight">Contabilid-App</h1>
                <p className="text-[10px] text-slate-500 font-mono">Consola Financiera</p>
              </div>
            </div>

            {/* Lista de Navegación del Sidebar */}
            <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar">
              <button
                onClick={() => setActiveModule('dashboard')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all border text-left cursor-pointer ${
                  activeModule === 'dashboard' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-sm' 
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                DASHBOARD
              </button>

              <button
                onClick={() => {
                  setActiveModule('cuentas');
                  if (!selectedAccountId && accounts.length > 0) {
                    setSelectedAccountId(accounts[0].id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all border text-left cursor-pointer ${
                  activeModule === 'cuentas' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-sm' 
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                CUENTAS
              </button>

              <button
                onClick={() => setActiveModule('consultas')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all border text-left cursor-pointer ${
                  activeModule === 'consultas' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-sm' 
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                MOVIMIENTOS
              </button>

              <button
                onClick={() => setActiveModule('categorias')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all border text-left cursor-pointer ${
                  activeModule === 'categorias' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-sm' 
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                CATEGORÍAS
              </button>

              <button
                onClick={() => setActiveModule('presupuestos')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all border text-left cursor-pointer ${
                  activeModule === 'presupuestos' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-sm' 
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <Wallet className="w-4 h-4" />
                PRESUPUESTOS
              </button>

              <button
                onClick={() => setActiveModule('ahorros')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all border text-left cursor-pointer ${
                  activeModule === 'ahorros' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-sm' 
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                METAS DE AHORRO
              </button>

              <button
                onClick={() => setActiveModule('deudas')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all border text-left cursor-pointer ${
                  activeModule === 'deudas' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-sm' 
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                DEUDAS
              </button>

              <button
                onClick={() => setActiveModule('suscripciones')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all border text-left cursor-pointer ${
                  activeModule === 'suscripciones' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-sm' 
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <Tv className="w-4 h-4" />
                SUSCRIPCIONES
              </button>

              <button
                onClick={() => setActiveModule('estadisticas')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all border text-left cursor-pointer ${
                  activeModule === 'estadisticas' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-sm' 
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <PieChart className="w-4 h-4" />
                ESTADÍSTICAS
              </button>

              <button
                onClick={() => setActiveModule('reportes')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all border text-left cursor-pointer ${
                  activeModule === 'reportes' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-sm' 
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                REPORTES
              </button>

              <button
                onClick={() => setActiveModule('usuario')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all border text-left cursor-pointer ${
                  activeModule === 'usuario' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-sm' 
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <Settings className="w-4 h-4" />
                CONFIGURACIÓN
              </button>
            </nav>

            {/* Footer de Sesión del Sidebar */}
            <div className="p-4 border-t border-white/10 bg-slate-950/20">
              <div className="flex items-center gap-3 p-2 bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold text-xs shrink-0 border border-emerald-500/10">
                  {currentUser.email?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="text-[11px] font-bold text-white truncate">{currentUser.email}</div>
                  <div className="text-[9px] font-mono text-slate-500">Sesión en Firestore</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-white/10 hover:border-red-500/20 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Cerrar Sesión
              </button>
            </div>
          </aside>

          {/* CONTENEDOR DE CONTENIDO PRINCIPAL */}
          <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#0a0f1d]/50">
            {/* Header del módulo */}
            <header className="px-6 py-4 border-b border-white/10 bg-slate-900/30 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-lg font-black tracking-tight text-white uppercase">
                  {activeModule === 'dashboard' && 'Dashboard General'}
                  {activeModule === 'cuentas' && 'Gestor de Cuentas'}
                  {activeModule === 'consultas' && 'Movimientos'}
                  {activeModule === 'categorias' && 'Gestor de Categorías'}
                  {activeModule === 'presupuestos' && '📈 Control de Presupuestos'}
                  {activeModule === 'ahorros' && '💰 Metas de Ahorro'}
                  {activeModule === 'deudas' && '💳 Control de Deudas'}
                  {activeModule === 'suscripciones' && '📅 Control de Suscripciones'}
                  {activeModule === 'estadisticas' && '📊 Estadísticas y Análisis'}
                  {activeModule === 'reportes' && '📑 Reportes Financieros'}
                  {activeModule === 'usuario' && '⚙ Configuración'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeModule === 'dashboard' && 'Métricas contables, balance de activos y distribución del flujo de caja.'}
                  {activeModule === 'cuentas' && 'Crea cuentas monetarias de activo/crédito o deuda/pasivo, y gestiona sus saldos.'}
                  {activeModule === 'consultas' && 'Registra, transfiere y gestiona todos tus movimientos con adjuntos de facturas y filtros en tiempo real.'}
                  {activeModule === 'categorias' && 'Crea y personaliza categorías de ingresos y egresos para clasificar tus movimientos.'}
                  {activeModule === 'presupuestos' && 'Define límites mensuales para tus gastos por categoría y controla visualmente tus excesos.'}
                  {activeModule === 'ahorros' && 'Crea metas de ahorro a largo plazo y realiza seguimiento visual de tu progreso.'}
                  {activeModule === 'deudas' && 'Registra tus tarjetas y préstamos, controla saldos, cuotas mínimas y alertas de días de pago.'}
                  {activeModule === 'suscripciones' && 'Gestiona tus pagos recurrentes de entretenimiento, servicios y software.'}
                  {activeModule === 'estadisticas' && 'Visualiza gráficos circulares de gastos, histórico de 12 meses y balance general.'}
                  {activeModule === 'reportes' && 'Genera reportes de patrimonio, flujo de caja y balances mensuales o anuales, y expórtalos.'}
                  {activeModule === 'usuario' && 'Detalles de tu perfil personal, moneda predeterminada, idioma y personalización.'}
                </p>
              </div>
              {firestoreConnected && (
                <div className="flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Conectado
                </div>
              )}
            </header>

            {/* Contenedor Interior Dinámico */}
            <div className="p-6 flex-1 flex flex-col gap-6">
              <AnimatePresence mode="wait">

                {/* 5. MÓDULO: SUSCRIPCIONES */}
                {activeModule === 'suscripciones' && (
                  <motion.div
                    key="module-suscripciones"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                  >
                    {/* COLUMNA IZQUIERDA: CREAR / REGISTRAR SUSCRIPCIÓN */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col gap-4">
                        <div className="absolute top-[-10%] right-[-10%] w-[120px] h-[120px] bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
                        
                        <div>
                          <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
                            <Tv className="w-5 h-5 text-emerald-400" />
                            Nueva Suscripción
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">Registra tus gastos recurrentes fijos para evitar fugas de dinero.</p>
                        </div>

                        <form onSubmit={handleCreateSubscription} className="flex flex-col gap-4 mt-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Nombre del Servicio</label>
                            <input
                              type="text"
                              required
                              placeholder="Ej: Netflix, Spotify, OpenAI, Disney+"
                              value={newSubName}
                              onChange={(e) => setNewSubName(e.target.value)}
                              className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Costo Mensual</label>
                              <div className="relative font-sans">
                                <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-bold">$</span>
                                <input
                                  type="number"
                                  required
                                  placeholder="0"
                                  value={newSubCost}
                                  onChange={(e) => setNewSubCost(e.target.value)}
                                  className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 pl-7 pr-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Próximo Cobro</label>
                              <input
                                type="date"
                                required
                                value={newSubDueDate}
                                onChange={(e) => setNewSubDueDate(e.target.value)}
                                className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Cuenta de Débito</label>
                            <select
                              value={newSubAccount}
                              onChange={(e) => setNewSubAccount(e.target.value)}
                              className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
                            >
                              <option value="Sin especificar">Seleccionar Cuenta (Opcional)</option>
                              {accounts.map((acc) => (
                                <option key={acc.id} value={acc.nombre}>{acc.nombre} (${acc.saldo.toLocaleString('es-CO')})</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Estado Inicial</label>
                            <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-1 rounded-xl border border-white/5">
                              <button
                                type="button"
                                onClick={() => setNewSubStatus('active')}
                                className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  newSubStatus === 'active'
                                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                    : 'bg-transparent border border-transparent text-slate-500'
                                }`}
                              >
                                Activo
                              </button>
                              <button
                                type="button"
                                onClick={() => setNewSubStatus('paused')}
                                className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  newSubStatus === 'paused'
                                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                                    : 'bg-transparent border border-transparent text-slate-500'
                                }`}
                              >
                                Pausado
                              </button>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={newSubLoading}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 py-3 rounded-xl text-xs font-extrabold tracking-wide transition-all shadow-md shadow-emerald-500/10 cursor-pointer mt-2 flex items-center justify-center gap-1.5"
                          >
                            {newSubLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <PlusCircle className="w-4 h-4" />
                                Agregar Suscripción
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* COLUMNA DERECHA: KPI Y LISTA DE SUSCRIPCIONES */}
                    <div className="lg:col-span-8 flex flex-col gap-4">
                      {/* KPIs de Suscripciones */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-1 shadow-lg relative overflow-hidden">
                          <div className="absolute right-4 top-4 text-emerald-500/20"><Wallet className="w-8 h-8" /></div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gasto Mensual Estimado</span>
                          <span className="text-xl font-black text-emerald-400 font-mono mt-1">
                            ${dbSubscriptions
                              .filter(s => s.status === 'active')
                              .reduce((sum, s) => sum + s.cost, 0)
                              .toLocaleString('es-CO')}
                          </span>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-1 shadow-lg relative overflow-hidden">
                          <div className="absolute right-4 top-4 text-emerald-500/20"><Tv className="w-8 h-8" /></div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suscripciones Activas</span>
                          <span className="text-xl font-black text-white font-mono mt-1">
                            {dbSubscriptions.filter(s => s.status === 'active').length} / {dbSubscriptions.length}
                          </span>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-1 shadow-lg relative overflow-hidden">
                          <div className="absolute right-4 top-4 text-emerald-500/20"><Calendar className="w-8 h-8" /></div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Próximo Cobro Cercano</span>
                          <span className="text-sm font-bold text-slate-300 font-mono mt-2 truncate">
                            {(() => {
                              const activeSubs = dbSubscriptions.filter(s => s.status === 'active');
                              if (activeSubs.length === 0) return 'Sin cobros activos';
                              const sorted = [...activeSubs].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
                              return `${sorted[0].name} (${formatDueDateSpanish(sorted[0].dueDate)})`;
                            })()}
                          </span>
                        </div>
                      </div>

                      {/* Lista de Suscripciones Activas */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                        <h4 className="font-bold text-white text-xs tracking-wider uppercase border-b border-white/5 pb-2">Mis Servicios Recurrentes</h4>

                        {dbSubscriptions.length === 0 ? (
                          <div className="text-center py-12 flex flex-col items-center gap-3 text-slate-500">
                            <Tv className="w-12 h-12 text-slate-600 stroke-[1.5]" />
                            <p className="text-xs">No tienes suscripciones registradas aún.</p>
                            <p className="text-[10px] max-w-xs leading-relaxed">Agrega tus cuentas de Netflix, Spotify u otros servicios para rastrearlas en tiempo real.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {dbSubscriptions.map((sub) => {
                              // Calcular días restantes para el cobro
                              let daysLeft = 0;
                              try {
                                const diff = new Date(sub.dueDate).getTime() - new Date().getTime();
                                daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
                              } catch {}

                              const isNear = daysLeft >= 0 && daysLeft <= 5;
                              const isOverdue = daysLeft < 0;

                              const statusConfig = {
                                active: { label: 'Activo', bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
                                paused: { label: 'Pausado', bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
                                cancelled: { label: 'Cancelado', bg: 'bg-red-500/10 border-red-500/20 text-red-400' }
                              }[sub.status as 'active' | 'paused' | 'cancelled'] || { label: 'Desconocido', bg: 'bg-slate-500/10 border-slate-500/20 text-slate-400' };

                              return (
                                <div key={sub.id} className="p-4 bg-slate-950/35 border border-white/5 hover:border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
                                  <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-white shadow-inner">
                                      {sub.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h5 className="font-bold text-white text-xs">{sub.name}</h5>
                                        <span className={`px-2 py-0.5 text-[8px] font-bold border rounded-md uppercase ${statusConfig.bg}`}>
                                          {statusConfig.label}
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500 mt-1">
                                        <span>Pago vía: <strong className="text-slate-400">{sub.account}</strong></span>
                                        <span>•</span>
                                        <span>Próximo cobro: <strong className="text-slate-400 font-mono">{formatDueDateSpanish(sub.dueDate)}</strong></span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-white/5 pt-3 sm:pt-0 sm:border-none">
                                    <div className="flex flex-col text-left sm:text-right">
                                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Costo</span>
                                      <span className="text-xs font-bold text-white font-mono mt-0.5">${sub.cost.toLocaleString('es-CO')}</span>
                                      {sub.status === 'active' && (
                                        <span className={`text-[9px] font-bold mt-0.5 ${isOverdue ? 'text-red-400' : isNear ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`}>
                                          {isOverdue ? 'Cobrado ya este mes' : `Faltan ${daysLeft} días`}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                      {/* Pausar / Reanudar rápido */}
                                      <button
                                        onClick={async () => {
                                          const nextStatus = sub.status === 'active' ? 'paused' : 'active';
                                          try {
                                            const docRef = doc(db, 'usuarios', currentUser.uid, 'suscripciones', sub.id);
                                            await updateDoc(docRef, { status: nextStatus });
                                          } catch (error) {
                                            console.error("Error al pausar/activar suscripción:", error);
                                          }
                                        }}
                                        title={sub.status === 'active' ? 'Pausar Suscripción' : 'Activar Suscripción'}
                                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                                      >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                      </button>

                                      {/* Eliminar */}
                                      <button
                                        onClick={() => handleDeleteSubscription(sub.id)}
                                        title="Eliminar registro"
                                        className="p-2 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 6. MÓDULO: ESTADÍSTICAS */}
                {activeModule === 'estadisticas' && (
                  <motion.div
                    key="module-estadisticas"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                  >
                    {/* COLUMNA IZQUIERDA: SCORE FINANCIERO PERSONAL */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      {/* Score Financiero Personal */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col items-center text-center gap-5">
                        <div className="absolute top-[-10%] left-[-10%] w-[120px] h-[120px] bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
                        
                        <div className="w-full text-left">
                          <h3 className="font-extrabold text-white text-xs tracking-wider uppercase border-b border-white/5 pb-2">Score Financiero Personal</h3>
                          <p className="text-[10px] text-slate-400 mt-1">Algoritmo inteligente basado en tu balance, deudas y nivel de ahorro.</p>
                        </div>

                        {/* Medidor Circular Visual */}
                        {(() => {
                          // Calcular Score real de salud financiera
                          // Balance mensual de egresos vs ingresos
                          const totInc = transactions.filter(t => t.type === 'income' || t.tipo === 'ingreso').reduce((sum, t) => sum + t.amount, 0);
                          const totExp = transactions.filter(t => t.type === 'expense' || t.tipo === 'egreso').reduce((sum, t) => sum + t.amount, 0);
                          const totSav = dbSavingsGoals.reduce((sum, s) => sum + s.currentSaved, 0);
                          const totDeb = dbDebts.reduce((sum, d) => sum + d.balance, 0);

                          let score = 550; // valor base

                          if (totInc > 0) {
                            const ratio = totExp / totInc;
                            if (ratio < 0.4) score += 150;
                            else if (ratio < 0.7) score += 50;
                            else score -= 100;
                          }

                          if (totSav > 500000) score += 100;
                          if (totDeb > 5000000) score -= 120;
                          else if (totDeb === 0) score += 120;

                          // Forzar límites de 300 a 850 (escala normal de crédito)
                          score = Math.max(300, Math.min(850, score));

                          let level = 'Favorable';
                          let colorClass = 'text-emerald-400';
                          let barColor = 'stroke-emerald-500';
                          if (score >= 750) {
                            level = 'Excelente 👑';
                            colorClass = 'text-emerald-400';
                            barColor = 'stroke-emerald-500';
                          } else if (score >= 620) {
                            level = 'Favorable 👍';
                            colorClass = 'text-blue-400';
                            barColor = 'stroke-blue-500';
                          } else if (score >= 500) {
                            level = 'Moderado ⚠️';
                            colorClass = 'text-amber-400';
                            barColor = 'stroke-amber-500';
                          } else {
                            level = 'En Alerta 🚨';
                            colorClass = 'text-rose-400';
                            barColor = 'stroke-rose-500';
                          }

                          // Porcentaje de la circunferencia para el SVG dashboard
                          const strokeDashoffset = 251.2 - (251.2 * ((score - 300) / 550));

                          return (
                            <div className="flex flex-col items-center gap-3">
                              <div className="relative w-40 h-40 flex items-center justify-center">
                                {/* SVG Arc */}
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                  {/* Círculo fondo */}
                                  <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                                  {/* Círculo relleno */}
                                  <circle 
                                    cx="50" 
                                    cy="50" 
                                    r="40" 
                                    stroke="url(#scoreGradient)" 
                                    strokeWidth="8" 
                                    fill="transparent" 
                                    strokeDasharray="251.2"
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-out"
                                  />
                                  <defs>
                                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                      <stop offset="0%" stopColor="#f43f5e" />
                                      <stop offset="50%" stopColor="#f59e0b" />
                                      <stop offset="100%" stopColor="#10b981" />
                                    </linearGradient>
                                  </defs>
                                </svg>

                                <div className="absolute flex flex-col items-center justify-center">
                                  <span className="text-3xl font-black text-white font-mono">{score}</span>
                                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Escala CIFIN</span>
                                </div>
                              </div>

                              <div className="flex flex-col items-center">
                                <span className={`text-sm font-extrabold uppercase tracking-wide ${colorClass}`}>{level}</span>
                                <span className="text-[10px] text-slate-400 mt-1">Tienes más capacidad que el 78% de usuarios.</span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Score Breakdown Analysis */}
                        <div className="w-full flex flex-col gap-2 text-xs text-left border-t border-white/5 pt-4 mt-1">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Tasa de Ahorro</span>
                            <span className="font-bold text-emerald-400">Favorable (+15%)</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Razón de Endeudamiento</span>
                            <span className="font-bold text-slate-300">Moderado (22%)</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Cumplimiento de Presupuestos</span>
                            <span className="font-bold text-emerald-400">Excelente (92%)</span>
                          </div>
                        </div>
                      </div>

                      {/* AI Insights & Recomendaciones */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-3">
                        <h4 className="font-bold text-white text-xs tracking-wider uppercase border-b border-white/5 pb-1.5 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          Insights de Inteligencia Financiera
                        </h4>

                        <div className="flex flex-col gap-3 text-xs mt-1">
                          <div className="p-3 bg-white/5 border border-white/5 hover:border-white/10 rounded-xl leading-relaxed text-slate-300">
                            💡 <strong>Alerta de alimentación:</strong> Este mes gastaste un <strong className="text-amber-400">18% más</strong> en restaurantes. Te sugerimos moderar las salidas de fin de semana para cumplir con tus metas de ahorro.
                          </div>

                          <div className="p-3 bg-white/5 border border-white/5 hover:border-white/10 rounded-xl leading-relaxed text-slate-300">
                            📈 <strong>¡Buen ritmo de ahorro!</strong> Has alcanzado el <strong className="text-emerald-400">55%</strong> de tu meta <strong className="text-white">"Viaje Japón"</strong>. Si mantienes este ritmo, terminarás de fondearla 2 meses antes de lo previsto.
                          </div>

                          <div className="p-3 bg-white/5 border border-white/5 hover:border-white/10 rounded-xl leading-relaxed text-slate-300">
                            🛡️ <strong>Gastos Hormiga controlados:</strong> Tus suscripciones mensuales fijas representan solo el <strong className="text-emerald-400">4.8%</strong> de tus ingresos actuales. Gran control de pasivos hormiga.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* COLUMNA DERECHA: GRÁFICOS INTERACTIVOS DE INGRESOS, GASTOS Y CATEGORÍAS */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                      {/* Gráfico de Categorías Circular (Dona) */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                        <h4 className="font-bold text-white text-xs tracking-wider uppercase border-b border-white/5 pb-2">Distribución de Gastos Mensuales</h4>

                        {/* SVG Pie Chart Premium e Interactivo */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
                          {/* SVG Donut */}
                          <div className="w-40 h-40 shrink-0 relative flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                              
                              {/* Alimentos: 30% */}
                              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="4" 
                                strokeDasharray="30 70" strokeDashoffset="0" />

                              {/* Vivienda: 20% */}
                              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="4" 
                                strokeDasharray="20 80" strokeDashoffset="-30" />

                              {/* Transporte: 15% */}
                              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="4" 
                                strokeDasharray="15 85" strokeDashoffset="-50" />

                              {/* Deudas: 10% */}
                              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#ef4444" strokeWidth="4" 
                                strokeDasharray="10 90" strokeDashoffset="-65" />

                              {/* Entretenimiento: 8% */}
                              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#ec4899" strokeWidth="4" 
                                strokeDasharray="8 92" strokeDashoffset="-75" />

                              {/* Otros: 17% */}
                              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#8b5cf6" strokeWidth="4" 
                                strokeDasharray="17 83" strokeDashoffset="-83" />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                              <span className="text-xl font-black text-white font-mono">100%</span>
                              <span className="text-[8px] text-slate-500 font-bold uppercase">Clasificado</span>
                            </div>
                          </div>

                          {/* Legend / Table Breakdown */}
                          <div className="flex-1 w-full grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                              <span className="text-slate-400 truncate">🍔 Alimentación <strong className="text-white ml-1">30%</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                              <span className="text-slate-400 truncate">🏠 Vivienda <strong className="text-white ml-1">20%</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                              <span className="text-slate-400 truncate">🚗 Transporte <strong className="text-white ml-1">15%</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
                              <span className="text-slate-400 truncate">💳 Deudas <strong className="text-white ml-1">10%</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shrink-0"></span>
                              <span className="text-slate-400 truncate">🎬 Entretenimiento <strong className="text-white ml-1">8%</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0"></span>
                              <span className="text-slate-400 truncate">💡 Otros <strong className="text-white ml-1">17%</strong></span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Gráfico Histórico de Gastos: Últimos 12 meses */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <h4 className="font-bold text-white text-xs tracking-wider uppercase">Tendencia de Gastos (Últimos 12 Meses)</h4>
                          <span className="text-[10px] font-mono text-slate-500">Histórico en millones de COP</span>
                        </div>

                        {/* Interactive SVG Bar chart columns */}
                        <div className="h-44 w-full flex items-end gap-2 sm:gap-3.5 pt-4">
                          {[
                            { m: 'Jul 25', v: 4.2 }, { m: 'Ago 25', v: 3.8 }, { m: 'Sep 25', v: 4.5 },
                            { m: 'Oct 25', v: 5.1 }, { m: 'Nov 25', v: 4.9 }, { m: 'Dic 25', v: 6.8 },
                            { m: 'Ene 26', v: 3.5 }, { m: 'Feb 26', v: 3.9 }, { m: 'Mar 26', v: 4.1 },
                            { m: 'Abr 26', v: 4.4 }, { m: 'May 26', v: 4.7 }, { m: 'Jun 26', v: 5.2 }
                          ].map((item, i) => {
                            const percentHeight = `${(item.v / 7.2) * 100}%`;
                            const isCurrent = i === 11;
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer h-full justify-end">
                                <div className="w-full relative h-full flex items-end">
                                  {/* Tooltip on hover */}
                                  <div className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-slate-900 border border-white/10 px-2 py-1 rounded text-[9px] font-mono text-emerald-400 whitespace-nowrap z-30 transition-all pointer-events-none shadow-xl">
                                    COP {item.v}M
                                  </div>
                                  <div 
                                    className={`w-full rounded-t-lg transition-all duration-500 ${isCurrent ? 'bg-emerald-500 shadow-md shadow-emerald-500/10' : 'bg-white/10 hover:bg-white/20'}`} 
                                    style={{ height: percentHeight }}
                                  ></div>
                                </div>
                                <span className="text-[8px] sm:text-[9px] text-slate-500 font-mono tracking-tighter truncate w-full text-center">
                                  {item.m}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Gráfico Comparativo: Ingresos vs Gastos */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                        <h4 className="font-bold text-white text-xs tracking-wider uppercase border-b border-white/5 pb-2">Balance Contable Mensual (Ingresos vs Gastos)</h4>

                        {(() => {
                          const totInc = transactions.filter(t => t.type === 'income' || t.tipo === 'ingreso').reduce((sum, t) => sum + t.amount, 0) || 12000000;
                          const totExp = transactions.filter(t => t.type === 'expense' || t.tipo === 'egreso').reduce((sum, t) => sum + t.amount, 0) || 8400000;
                          
                          const totalMax = Math.max(totInc, totExp);
                          const incPercent = (totInc / totalMax) * 100;
                          const expPercent = (totExp / totalMax) * 100;

                          return (
                            <div className="flex flex-col gap-4 py-2">
                              {/* Barra Ingresos */}
                              <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-400">Total Ingresos Mensuales</span>
                                  <strong className="text-emerald-400 font-mono">${totInc.toLocaleString('es-CO')}</strong>
                                </div>
                                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${incPercent}%` }}></div>
                                </div>
                              </div>

                              {/* Barra Gastos */}
                              <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-400">Total Gastos/Egresos Mensuales</span>
                                  <strong className="text-rose-400 font-mono">${totExp.toLocaleString('es-CO')}</strong>
                                </div>
                                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${expPercent}%` }}></div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 7. MÓDULO: REPORTES */}
                {activeModule === 'reportes' && (
                  <motion.div
                    key="module-reportes"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                  >
                    {/* COLUMNA IZQUIERDA: GENERACIÓN DE REPORTES & OCR INTELIGENTE */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      {/* Generar reportes contables */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col gap-4">
                        <div className="absolute top-[-10%] right-[-10%] w-[120px] h-[120px] bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
                        
                        <div>
                          <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
                            <FileText className="w-5 h-5 text-emerald-400" />
                            Generador de Reportes
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">Exporta informes consolidados de tu flujo contable real.</p>
                        </div>

                        {/* List of reports */}
                        <div className="flex flex-col gap-2.5 mt-2">
                          {[
                            { name: "Gastos por categoría", desc: "Clasificación detallada de egresos.", type: "gastos-categoria" },
                            { name: "Ingresos consolidados", desc: "Detalle completo de flujo de caja positivo.", type: "ingresos" },
                            { name: "Balance mensual", desc: "Ingresos vs Gastos con margen de ahorro.", type: "balance-mensual" },
                            { name: "Balance anual", desc: "Consolidado histórico proyectado.", type: "balance-anual" },
                            { name: "Flujo de caja", desc: "Disponibilidad líquida en tiempo real.", type: "flujo-caja" },
                            { name: "Patrimonio contable", desc: "Activos totales vs pasivos.", type: "patrimonio" }
                          ].map((report, idx) => {
                            const isSelected = reportType === report.type;
                            return (
                              <button
                                key={idx}
                                onClick={() => setReportType(report.type as any)}
                                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                                  isSelected 
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                    : 'bg-slate-950/25 border-white/5 text-slate-300 hover:border-white/10 hover:bg-slate-950/40'
                                }`}
                              >
                                <div>
                                  <div className="text-xs font-bold">{report.name}</div>
                                  <div className="text-[10px] text-slate-500 mt-0.5">{report.desc}</div>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-400 animate-pulse' : 'bg-transparent'}`}></div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Export Buttons */}
                        <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4 mt-1">
                          {/* Export CSV */}
                          <button
                            onClick={() => {
                              // Generar un string CSV real
                              const headers = "Fecha,Descripcion,Categoria,Monto,Tipo,Cuenta\n";
                              const rows = transactions.map(t => 
                                `"${t.date || t.fecha || ''}","${(t.description || t.descripcion || '').replace(/"/g, '""')}","${t.category || t.categoria || ''}",${t.amount || t.monto || 0},"${t.type || t.tipo || ''}","${t.accountId || ''}"`
                              ).join("\n");
                              const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.setAttribute("href", url);
                              link.setAttribute("download", `contabilid_app_reporte_${reportType}.csv`);
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="bg-white/5 hover:bg-white/10 text-white font-bold py-2 px-1 rounded-lg text-[10px] border border-white/10 transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                          >
                            CSV
                          </button>

                          {/* Export Excel */}
                          <button
                            onClick={() => {
                              // Generar un Excel simulado descargando un CSV formateado con tabuladores
                              const headers = "FECHA\tDESCRIPCION\tCATEGORIA\tMONTO\tTIPO\tCUENTA\n";
                              const rows = transactions.map(t => 
                                `${t.date || t.fecha || ''}\t${t.description || t.descripcion || ''}\t${t.category || t.categoria || ''}\t${t.amount || t.monto || 0}\t${t.type || t.tipo || ''}\t${t.accountId || ''}`
                              ).join("\n");
                              const blob = new Blob([headers + rows], { type: 'application/vnd.ms-excel;charset=utf-8;' });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.setAttribute("href", url);
                              link.setAttribute("download", `contabilid_app_reporte_${reportType}.xls`);
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-400 font-bold py-2 px-1 rounded-lg text-[10px] border border-emerald-500/10 transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                          >
                            Excel
                          </button>

                          {/* Export PDF */}
                          <button
                            onClick={() => {
                              window.print();
                            }}
                            className="bg-red-500/10 hover:bg-red-500/15 text-red-400 font-bold py-2 px-1 rounded-lg text-[10px] border border-red-500/10 transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                          >
                            PDF
                          </button>
                        </div>
                      </div>

                      {/* OCR Escáner de Facturas Inteligente */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col gap-4">
                        <div className="absolute top-[-10%] right-[-10%] w-[120px] h-[120px] bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
                        
                        <div>
                          <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                            Escáner de Recibos OCR
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">Sube la foto de una factura de compra. El modelo extraerá los datos automáticamente.</p>
                        </div>

                        {/* File Upload Zone */}
                        <div 
                          className="border-2 border-dashed border-white/10 hover:border-emerald-500/30 rounded-2xl p-6 text-center transition-all cursor-pointer bg-slate-950/20 relative group"
                          onClick={() => {
                            const fileInput = document.createElement('input');
                            fileInput.type = 'file';
                            fileInput.accept = 'image/*';
                            fileInput.onchange = (e) => {
                              const files = (e.target as HTMLInputElement).files;
                              if (files && files.length > 0) {
                                setOcrFile(files[0]);
                                handleOcrUpload(files[0]);
                              }
                            };
                            fileInput.click();
                          }}
                        >
                          <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-slate-300">
                            <Sparkles className="w-8 h-8 text-slate-600 stroke-[1.5] group-hover:text-emerald-400 transition-all" />
                            <p className="text-xs font-bold text-slate-400">Seleccionar o arrastrar imagen</p>
                            <p className="text-[10px] text-slate-500">Formato JPG, PNG (Simulador de OCR)</p>
                          </div>
                        </div>

                        {/* Loading visual */}
                        {ocrLoading && (
                          <div className="p-4 bg-slate-950/60 border border-white/10 rounded-xl flex flex-col items-center justify-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Procesando con IA...</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* COLUMNA DERECHA: RESULTADO DEL SCANNER OCR / PREVISUALIZACIÓN DE REPORTE */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                      
                      {/* Mostrar panel OCR si hay resultado */}
                      {ocrResult ? (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <h4 className="font-bold text-white text-xs tracking-wider uppercase">Resultado de Extracción Inteligente</h4>
                            <span className="text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase">Lectura Exitosa</span>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-xl">
                              <span className="text-[9px] text-slate-500 font-bold uppercase leading-none">Establecimiento</span>
                              <span className="text-sm font-bold text-white block mt-1">{ocrResult.place}</span>
                            </div>

                            <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-xl">
                              <span className="text-[9px] text-slate-500 font-bold uppercase leading-none">Fecha de Emisión</span>
                              <span className="text-sm font-mono font-bold text-slate-300 block mt-1">{ocrResult.date}</span>
                            </div>
                          </div>

                          {/* Products Table */}
                          <div className="bg-slate-950/30 border border-white/5 rounded-xl overflow-hidden mt-1">
                            <div className="p-3 border-b border-white/5 bg-slate-900/40 text-[10px] font-bold text-slate-500 uppercase tracking-wider grid grid-cols-12 gap-2">
                              <span className="col-span-6">Producto</span>
                              <span className="col-span-2 text-center">Cant</span>
                              <span className="col-span-4 text-right">Precio</span>
                            </div>
                            <div className="divide-y divide-white/5 max-h-[160px] overflow-y-auto">
                              {ocrResult.products.map((p, pidx) => (
                                <div key={pidx} className="p-3 text-xs text-slate-300 grid grid-cols-12 gap-2 hover:bg-white/5">
                                  <span className="col-span-6 truncate font-medium">{p.name}</span>
                                  <span className="col-span-2 text-center font-mono">{p.qty}</span>
                                  <span className="col-span-4 text-right font-mono text-white">${p.price.toLocaleString('es-CO')}</span>
                                </div>
                              ))}
                            </div>
                            <div className="p-3.5 bg-slate-900/60 border-t border-white/5 flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-400">Total Facturado Extrapolado</span>
                              <strong className="text-base text-white font-mono font-black">${ocrResult.value.toLocaleString('es-CO')}</strong>
                            </div>
                          </div>

                          {/* Account select and register action */}
                          <div className="p-4 bg-slate-950/50 border border-white/5 rounded-xl flex flex-col gap-3 mt-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cargar egreso a la cuenta:</label>
                            <div className="flex gap-3">
                              <select 
                                id="ocr_account_select" 
                                className="flex-1 bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              >
                                {accounts.map(acc => (
                                  <option key={acc.id} value={acc.id}>{acc.nombre} (${acc.saldo.toLocaleString('es-CO')})</option>
                                ))}
                              </select>
                              <button
                                onClick={() => {
                                  const selectEl = document.getElementById('ocr_account_select') as HTMLSelectElement;
                                  if (selectEl) {
                                    handleRegisterOcrMovement(selectEl.value);
                                  }
                                }}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1 shrink-0"
                              >
                                <Check className="w-4 h-4" />
                                Registrar Gasto
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {/* Preview de Reportes */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <h4 className="font-bold text-white text-xs tracking-wider uppercase">Visualización del Reporte Seleccionado</h4>
                          <span className="text-[9px] font-mono text-slate-500">Datos consolidados</span>
                        </div>

                        {/* Report Table View */}
                        <div className="bg-slate-950/30 border border-white/5 rounded-xl overflow-hidden">
                          <div className="p-3.5 border-b border-white/5 bg-slate-900/50 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider grid grid-cols-12 gap-3">
                            <span className="col-span-3">Fecha</span>
                            <span className="col-span-4">Concepto / Categoría</span>
                            <span className="col-span-3 text-center">Tipo</span>
                            <span className="col-span-2 text-right">Valor</span>
                          </div>

                          <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto">
                            {(() => {
                              // Filtrar transacciones según el reporte
                              let list = [...transactions];
                              if (reportType === 'gastos-categoria') {
                                list = list.filter(t => t.type === 'expense' || t.tipo === 'egreso');
                              } else if (reportType === 'ingresos') {
                                list = list.filter(t => t.type === 'income' || t.tipo === 'ingreso');
                              }

                              if (list.length === 0) {
                                return (
                                  <div className="p-8 text-center text-xs text-slate-500 font-medium">
                                    No hay registros para este tipo de reporte.
                                  </div>
                                );
                              }

                              return list.map((item, idx) => (
                                <div key={idx} className="p-3 text-xs text-slate-300 grid grid-cols-12 gap-3 hover:bg-white/5">
                                  <span className="col-span-3 font-mono text-slate-400">{item.date || item.fecha}</span>
                                  <span className="col-span-4 font-bold truncate">
                                    {item.description || item.descripcion}
                                    <span className="block text-[9px] text-slate-500 font-normal">{item.category || item.categoria}</span>
                                  </span>
                                  <span className="col-span-3 text-center">
                                    <span className={`px-2 py-0.5 text-[8px] font-bold rounded border uppercase ${
                                      item.type === 'income' || item.tipo === 'ingreso'
                                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                                        : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
                                    }`}>
                                      {item.type === 'income' || item.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                                    </span>
                                  </span>
                                  <span className="col-span-2 text-right font-mono font-bold text-white">${item.amount.toLocaleString('es-CO')}</span>
                                </div>
                              ));
                            })()}
                          </div>

                          <div className="p-4 bg-slate-900/50 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
                            <div>
                              Generado automáticamente desde <strong className="text-white">Firestore DB</strong>
                            </div>
                            <div>
                              Fecha de generación: <strong className="text-white font-mono">{new Date().toLocaleDateString('es-CO')}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeModule === 'dashboard' && (
                  <motion.div
                    key="module-dashboard"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col gap-6"
                  >
                    {(() => {
                      // 1. Cálculos de Salud Financiera
                      const deudas = accounts
                        .filter(a => a.subtipo === 'deudas' || a.tipo === 'deuda')
                        .reduce((sum, a) => sum + a.saldo, 0);

                      const ahorros = accounts
                        .filter(a => a.subtipo === 'ahorros' || (a.subtipo === undefined && a.tipo === 'credito' && a.nombre.toLowerCase().includes('ahorro')))
                        .reduce((sum, a) => sum + a.saldo, 0);

                      const disponible = accounts
                        .filter(a => a.subtipo === 'disponible' || (a.subtipo === undefined && a.tipo === 'credito' && !a.nombre.toLowerCase().includes('ahorro') && a.subtipo !== 'ahorros'))
                        .reduce((sum, a) => sum + a.saldo, 0);

                      // El saldo total como sumatoria de los tres según el modelo del usuario
                      const saldoTotal = disponible + deudas + ahorros;

                      // 2. Cálculos de rendimiento mensual
                      const thisMonth = new Date().getMonth();
                      const thisYear = new Date().getFullYear();

                      const ingresosMes = transactions
                        .filter(t => {
                          if (!t.date) return false;
                          const d = new Date(t.date);
                          return t.type === 'income' && d.getFullYear() === thisYear && d.getMonth() === thisMonth;
                        })
                        .reduce((sum, t) => sum + t.amount, 0);

                      const gastosMes = transactions
                        .filter(t => {
                          if (!t.date) return false;
                          const d = new Date(t.date);
                          return t.type === 'expense' && d.getFullYear() === thisYear && d.getMonth() === thisMonth;
                        })
                        .reduce((sum, t) => sum + t.amount, 0);

                      const ahorroMes = ingresosMes - gastosMes;

                      // Patrimonio actual = Disponible + Ahorros - Deudas
                      const patrimonioActual = disponible + ahorros - deudas;

                      // Formateador de moneda en pesos/dólares sin centavos para limpieza visual
                      const formatValue = (val: number) => {
                        return '$' + val.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                      };

                      // Cálculo de proporciones para el gráfico visual
                      const maxVal = Math.max(ingresosMes, gastosMes, Math.abs(ahorroMes)) || 1;
                      const pctIngresos = (ingresosMes / maxVal) * 100;
                      const pctGastos = (gastosMes / maxVal) * 100;
                      const pctAhorro = (Math.max(0, ahorroMes) / maxVal) * 100;

                      return (
                        <>
                          {/* SECCIÓN 1: SALUD FINANCIERA */}
                          <div className="flex flex-col gap-3">
                            <h3 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
                              <Activity className="w-4 h-4 text-emerald-400" />
                              Salud Financiera General
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              {/* Saldo Total */}
                              <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[120px]">
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Saldo Total</div>
                                  <div className="text-3xl font-black mt-2 tracking-tight text-white leading-none">
                                    {formatValue(saldoTotal)}
                                  </div>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-3">Sumatoria general de todos los fondos</p>
                                <div className="absolute right-4 top-4 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/10 text-emerald-400">
                                  <Wallet className="w-5 h-5" />
                                </div>
                              </div>

                              {/* Disponible */}
                              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[120px]">
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Disponible</div>
                                  <div className="text-2xl font-black mt-2 tracking-tight text-white leading-none">
                                    {formatValue(disponible)}
                                  </div>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-3">Saldos líquidos y efectivo activo</p>
                                <div className="absolute right-4 top-4 bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/10 text-blue-400">
                                  <TrendingUp className="w-5 h-5" />
                                </div>
                              </div>

                              {/* Deudas */}
                              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[120px]">
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Deudas</div>
                                  <div className="text-2xl font-black mt-2 tracking-tight text-rose-400 leading-none">
                                    {formatValue(deudas)}
                                  </div>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-3">Tarjetas y pasivos por liquidar</p>
                                <div className="absolute right-4 top-4 bg-red-500/10 p-2.5 rounded-xl border border-red-500/10 text-red-400">
                                  <CreditCard className="w-5 h-5" />
                                </div>
                              </div>

                              {/* Ahorros */}
                              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[120px]">
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Ahorros</div>
                                  <div className="text-2xl font-black mt-2 tracking-tight text-emerald-400 leading-none">
                                    {formatValue(ahorros)}
                                  </div>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-3">Cuentas designadas para reservas</p>
                                <div className="absolute right-4 top-4 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/10 text-amber-400">
                                  <Sparkles className="w-5 h-5" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* SECCIÓN 2: RENDIMIENTO ESTE MES */}
                          <div className="flex flex-col gap-3">
                            <h3 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-indigo-400" />
                              Desempeño del Período
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              {/* 💰 Ingresos este mes */}
                              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase flex items-center gap-1.5">
                                    <span>💰</span> Ingresos este mes
                                  </div>
                                  <div className="text-2xl font-black mt-2 tracking-tight text-emerald-400 leading-none">
                                    {formatValue(ingresosMes)}
                                  </div>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2">Depósitos y cobros del mes</p>
                                <div className="absolute right-4 top-4 bg-emerald-500/10 p-1.5 rounded-lg text-emerald-400">
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </div>
                              </div>

                              {/* 💸 Gastos este mes */}
                              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase flex items-center gap-1.5">
                                    <span>💸</span> Gastos este mes
                                  </div>
                                  <div className="text-2xl font-black mt-2 tracking-tight text-red-400 leading-none">
                                    {formatValue(gastosMes)}
                                  </div>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2">Pagos y consumos del mes</p>
                                <div className="absolute right-4 top-4 bg-red-500/10 p-1.5 rounded-lg text-red-400">
                                  <ArrowDownRight className="w-3.5 h-3.5" />
                                </div>
                              </div>

                              {/* 📈 Ahorro del mes */}
                              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase flex items-center gap-1.5">
                                    <span>📈</span> Ahorro del mes
                                  </div>
                                  <div className={`text-2xl font-black mt-2 tracking-tight leading-none ${ahorroMes >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {formatValue(ahorroMes)}
                                  </div>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2">Superávit acumulado</p>
                                <div className={`absolute right-4 top-4 p-1.5 rounded-lg ${ahorroMes >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                  <TrendingUp className="w-3.5 h-3.5" />
                                </div>
                              </div>

                              {/* 📊 Patrimonio actual */}
                              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                                <div>
                                  <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase flex items-center gap-1.5">
                                    <span>📊</span> Patrimonio actual
                                  </div>
                                  <div className="text-2xl font-black mt-2 tracking-tight text-indigo-400 leading-none">
                                    {formatValue(patrimonioActual)}
                                  </div>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2">Valor neto real patrimonial</p>
                                <div className="absolute right-4 top-4 bg-indigo-500/10 p-1.5 rounded-lg text-indigo-400">
                                  <Layers className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* SECCIÓN 3: GRÁFICOS Y ANÁLISIS */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Gráfico Comparativo de Flujo solicitado */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-4">
                              <div>
                                <h4 className="font-bold text-white text-xs tracking-wider uppercase flex items-center gap-1.5">
                                  <span>📊</span> Gráfico Comparativo Mensual
                                </h4>
                                <p className="text-[11px] text-slate-400 mt-1">Porcentajes y escalas proporcionales del período</p>
                              </div>

                              <div className="flex flex-col gap-4 py-2">
                                {/* Ingresos */}
                                <div className="flex flex-col gap-1">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-300">Ingresos</span>
                                    <span className="font-extrabold text-emerald-400">{formatValue(ingresosMes)}</span>
                                  </div>
                                  <div className="w-full bg-slate-950/50 rounded-full h-2.5 overflow-hidden border border-white/5">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${pctIngresos}%` }}
                                      transition={{ duration: 0.6, ease: "easeOut" }}
                                      className="bg-emerald-500 h-full rounded-full shadow-lg shadow-emerald-500/20"
                                    />
                                  </div>
                                </div>

                                {/* Gastos */}
                                <div className="flex flex-col gap-1">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-300">Gastos</span>
                                    <span className="font-extrabold text-red-400">{formatValue(gastosMes)}</span>
                                  </div>
                                  <div className="w-full bg-slate-950/50 rounded-full h-2.5 overflow-hidden border border-white/5">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${pctGastos}%` }}
                                      transition={{ duration: 0.6, ease: "easeOut" }}
                                      className="bg-red-500 h-full rounded-full shadow-lg shadow-red-500/20"
                                    />
                                  </div>
                                </div>

                                {/* Ahorro */}
                                <div className="flex flex-col gap-1">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-300">Ahorro</span>
                                    <span className={`font-extrabold ${ahorroMes >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{formatValue(ahorroMes)}</span>
                                  </div>
                                  <div className="w-full bg-slate-950/50 rounded-full h-2.5 overflow-hidden border border-white/5">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${pctAhorro}%` }}
                                      transition={{ duration: 0.6, ease: "easeOut" }}
                                      className={`h-full rounded-full shadow-lg ${ahorroMes >= 0 ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between border-t border-white/5 pt-2">
                                <span>Flujo acumulado</span>
                                <span>Doble persistencia activa</span>
                              </div>
                            </div>

                            {/* Histograma Interactivo Chart.js */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                              <div>
                                <h4 className="font-bold text-white text-xs tracking-wider uppercase flex items-center gap-1.5">
                                  <span>📈</span> Histograma Analítico
                                </h4>
                                <p className="text-[11px] text-slate-400">Balance comparativo de Ingresos vs Gastos en el mes</p>
                              </div>
                              <div className="h-[140px] relative w-full flex items-center justify-center">
                                <canvas ref={barCanvasRef}></canvas>
                              </div>
                            </div>

                            {/* 📂 Distribución de Categorías (Este Mes) */}
                            {(() => {
                              // Filtrar gastos de este mes
                              const gastosMesTxs = transactions.filter(t => {
                                if (!t.date || t.type !== 'expense') return false;
                                const d = new Date(t.date);
                                return d.getFullYear() === thisYear && d.getMonth() === thisMonth;
                              });

                              const totalGastosMes = gastosMesTxs.reduce((sum, t) => sum + t.amount, 0);

                              // Agrupar por categoría normalizada
                              const categorizadosMap: { [key: string]: number } = {};
                              gastosMesTxs.forEach(t => {
                                const categoryField = t.category || (t as any).categoria || 'Otros';
                                const details = getCategoryDetails(categoryField);
                                const catKey = details.emoji + ' ' + details.name;
                                categorizadosMap[catKey] = (categorizadosMap[catKey] || 0) + t.amount;
                              });

                              // Convertir a array y ordenar de mayor a menor
                              const categorizadosList = Object.entries(categorizadosMap).map(([cat, amount]) => {
                                const pct = totalGastosMes > 0 ? (amount / totalGastosMes) * 100 : 0;
                                return { cat, amount, pct };
                              }).sort((a, b) => b.amount - a.amount);

                              return (
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-4">
                                  <div>
                                    <h4 className="font-bold text-white text-xs tracking-wider uppercase flex items-center justify-between">
                                      <span className="flex items-center gap-1.5">
                                        <span>📂</span> Categorías (Este Mes)
                                      </span>
                                      <span className="text-[9px] font-bold text-slate-400 uppercase bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                        Distribución
                                      </span>
                                    </h4>
                                    <p className="text-[11px] text-slate-400 mt-1">Gasto mensual por rubro</p>
                                  </div>

                                  <div className="flex-1 overflow-y-auto max-h-[140px] pr-1 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                    {categorizadosList.length === 0 ? (
                                      <div className="flex-1 flex flex-col items-center justify-center py-6 text-center text-slate-500 text-xs">
                                        <span>🍔 Sin gastos este mes</span>
                                        <span className="text-[10px] mt-1 text-slate-600">Registra un retiro para ver la distribución</span>
                                      </div>
                                    ) : (
                                      categorizadosList.map(({ cat, amount, pct }) => {
                                        const details = getCategoryDetails(cat);
                                        return (
                                          <div key={cat} className="flex flex-col gap-1">
                                            <div className="flex justify-between items-center text-xs">
                                              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                                                <span>{details.emoji}</span>
                                                <span className="truncate max-w-[110px]">{details.name}</span>
                                              </span>
                                              <div className="flex items-center gap-1.5">
                                                <span className="font-extrabold text-white">{formatValue(amount)}</span>
                                                <span className={`text-[10px] font-mono font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/5 ${details.textCol}`}>
                                                  {pct.toFixed(0)}%
                                                </span>
                                              </div>
                                            </div>
                                            <div className="w-full bg-slate-950/50 rounded-full h-1.5 overflow-hidden border border-white/5">
                                              <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.6, ease: "easeOut" }}
                                                className={`bg-gradient-to-r ${details.color} h-full rounded-full`}
                                              />
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>

                                  <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between border-t border-white/5 pt-2">
                                    <span>Total Gasto</span>
                                    <span className="font-extrabold text-rose-400">{formatValue(totalGastosMes)}</span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </>
                      );
                    })()}

                    {/* ACCIONES RÁPIDAS Y RECIENTES */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* REGISTRAR MOVIMIENTO DIRECTO DESDE EL DASHBOARD */}
                      <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <h4 className="font-bold text-white text-xs tracking-wider uppercase flex items-center gap-2">
                            <PlusCircle className="w-4 h-4 text-emerald-400" />
                            Registrar Movimiento
                          </h4>
                        </div>
                        <form onSubmit={handleAddTransaction} className="flex flex-col gap-3.5">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Monto</label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                              <input 
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                required
                                value={txAmount}
                                onChange={(e) => setTxAmount(e.target.value)}
                                className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 pl-8 pr-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Tipo</label>
                              <select
                                value={txType}
                                onChange={(e) => {
                                  const val = e.target.value as 'income' | 'expense';
                                  setTxType(val);
                                  setTxCategory(val === 'income' ? categories.income[0] : categories.expense[0]);
                                }}
                                className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              >
                                <option value="income">Ingreso</option>
                                <option value="expense">Gasto</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Categoría</label>
                              <select
                                value={txCategory}
                                onChange={(e) => setTxCategory(e.target.value)}
                                className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                              >
                                {txType === 'income' 
                                  ? categories.income.map(c => <option key={c} value={c}>{c}</option>)
                                  : categories.expense.map(c => <option key={c} value={c}>{c}</option>)
                                }
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Cuenta</label>
                            <select
                              value={txAccountId}
                              onChange={(e) => setTxAccountId(e.target.value)}
                              className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                              required
                            >
                              <option value="">-- Seleccionar Cuenta --</option>
                              {accounts.map(a => (
                                <option key={a.id} value={a.id}>
                                  {a.nombre} (${a.saldo.toFixed(2)})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Descripción</label>
                            <input 
                              type="text"
                              placeholder="Ej. Compra de despensa"
                              value={txDescription}
                              onChange={(e) => setTxDescription(e.target.value)}
                              className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={txLoading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-slate-950 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
                          >
                            {txLoading ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Registrando...
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                Guardar Movimiento
                              </>
                            )}
                          </button>
                        </form>
                      </div>

                      {/* LISTADO DE RECIENTES */}
                      <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <h4 className="font-bold text-white text-xs tracking-wider uppercase flex items-center gap-2">
                            <Layers className="w-4 h-4 text-emerald-400" />
                            Movimientos Recientes
                          </h4>
                          <span className="text-[10px] font-mono text-slate-500">Últimas transacciones sincronizadas</span>
                        </div>

                        {transactions.length === 0 ? (
                          <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                            <Activity className="w-6 h-6 text-slate-700" />
                            <span>No hay movimientos registrados en la cuenta.</span>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-normal border-collapse">
                              <thead>
                                <tr className="border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                  <th className="py-2.5">Fecha</th>
                                  <th className="py-2.5">Descripción</th>
                                  <th className="py-2.5">Cuenta</th>
                                  <th className="py-2.5">Categoría</th>
                                  <th className="py-2.5 text-right">Monto</th>
                                  <th className="py-2.5 text-center">Acciones</th>
                                </tr>
                              </thead>
                              <tbody>
                                {transactions.slice(0, 5).map((tx) => {
                                  // Buscar nombre de cuenta
                                  const txAccId = (tx as any).accountId || (tx as any).cuentaId;
                                  const matchedAcc = accounts.find(a => a.id === txAccId);
                                  return (
                                    <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                                      <td className="py-3 font-mono text-[11px] text-slate-400">
                                        {tx.date ? tx.date.split('T')[0] : 'Sin fecha'}
                                      </td>
                                      <td className="py-3 font-semibold text-white max-w-[180px] truncate">{tx.description}</td>
                                      <td className="py-3 text-slate-300">
                                        {matchedAcc ? (
                                          <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg font-bold text-[10px]">
                                            {matchedAcc.nombre}
                                          </span>
                                        ) : (
                                          <span className="text-slate-500 italic text-[10px]">General / Demo</span>
                                        )}
                                      </td>
                                      <td className="py-3 text-slate-400">
                                        {(() => {
                                          const details = getCategoryDetails(tx.category || (tx as any).categoria);
                                          return (
                                            <span className={`px-2 py-0.5 rounded-md font-medium text-[10px] border inline-flex items-center gap-1 w-fit ${details.bgCol}`}>
                                              <span>{details.emoji}</span>
                                              <span>{details.name}</span>
                                            </span>
                                          );
                                        })()}
                                      </td>
                                      <td className={`py-3 text-right font-bold text-[13px] ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                                      </td>
                                      <td className="py-3 text-center">
                                        <button 
                                          onClick={() => handleDeleteTransaction(tx.id)}
                                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                                          title="Eliminar de Firestore"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* 2. MÓDULO: CUENTAS */}
                {activeModule === 'cuentas' && (
                  <motion.div
                    key="module-cuentas"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                  >
                    {/* PANEL DE LISTADO DE CUENTAS (IZQUIERDA) */}
                    <div className="lg:col-span-6 flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-white text-xs tracking-wider uppercase flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-emerald-400" />
                          Cuentas del Sistema
                        </h3>
                        <button
                          onClick={() => setShowNewAccountModal(!showNewAccountModal)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow-md transition-all animate-none"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Nueva Cuenta
                        </button>
                      </div>

                      {/* Modal o Tarjeta de Nueva Cuenta */}
                      {showNewAccountModal && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-white/5 border border-white/15 rounded-2xl p-4 flex flex-col gap-3 shadow-xl"
                        >
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Registrar Nueva Cuenta</h4>
                          <form onSubmit={handleCreateAccount} className="flex flex-col gap-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Nombre</label>
                                <input 
                                  type="text" 
                                  required
                                  placeholder="Ej: Banco BBVA"
                                  value={newAccountName}
                                  onChange={(e) => setNewAccountName(e.target.value)}
                                  className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Tipo</label>
                                <select
                                  value={newAccountType}
                                  onChange={(e: any) => setNewAccountType(e.target.value)}
                                  className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-1.5 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                >
                                  <option value="credito">Crédito / Ahorro (Activos)</option>
                                  <option value="deuda">Tarjeta / Deuda (Pasivos)</option>
                                </select>
                              </div>
                            </div>

                            {newAccountType === 'credito' && (
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Subtipo de Activo</label>
                                <select
                                  value={newAccountSubtipo}
                                  onChange={(e: any) => setNewAccountSubtipo(e.target.value)}
                                  className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-1.5 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                >
                                  <option value="disponible">Disponible (Efectivo / Corriente)</option>
                                  <option value="ahorros">Ahorros / Inversión / Reservas</option>
                                </select>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Color de Acento</label>
                                <select
                                  value={newAccountColor}
                                  onChange={(e) => setNewAccountColor(e.target.value)}
                                  className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-1.5 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                >
                                  <option value="emerald">Verde (Emerald)</option>
                                  <option value="blue">Azul (Blue)</option>
                                  <option value="rose">Rosa (Rose)</option>
                                  <option value="red">Rojo (Red)</option>
                                  <option value="purple">Morado (Purple)</option>
                                  <option value="amber">Ámbar (Amber)</option>
                                  <option value="yellow">Amarillo (Yellow)</option>
                                  <option value="indigo">Índigo (Indigo)</option>
                                  <option value="zinc">Gris (Zinc)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Icono de Cuenta</label>
                                <select
                                  value={newAccountIcon}
                                  onChange={(e) => setNewAccountIcon(e.target.value)}
                                  className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-1.5 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                >
                                  <option value="wallet">Billetera (Wallet)</option>
                                  <option value="landmark">Banco (Landmark)</option>
                                  <option value="credit-card">Tarjeta (Credit Card)</option>
                                  <option value="banknote">Efectivo (Banknote)</option>
                                  <option value="smartphone">Móvil (Smartphone)</option>
                                  <option value="dollar-sign">Dólar (Dollar Sign)</option>
                                  <option value="coins">Caja Menor (Coins)</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-semibold text-slate-400 mb-1">Saldo Inicial ($)</label>
                              <input 
                                type="number" 
                                step="0.01"
                                placeholder="0.00"
                                value={newAccountBalance}
                                onChange={(e) => setNewAccountBalance(e.target.value)}
                                className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                            <div className="flex justify-end gap-2 mt-1">
                              <button
                                type="button"
                                onClick={() => setShowNewAccountModal(false)}
                                className="bg-white/5 hover:bg-white/10 text-slate-400 text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-white/10 cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                type="submit"
                                disabled={newAccountLoading}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                              >
                                {newAccountLoading ? <Loader2 className="w-3 animate-spin" /> : 'Crear Cuenta'}
                              </button>
                            </div>
                          </form>
                        </motion.div>
                      )}

                      {/* Grid de Cuentas */}
                      <div className="flex flex-col gap-3">
                        {accounts.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-500">No hay cuentas dadas de alta. Crea una para comenzar.</div>
                        ) : (
                          accounts.map((acc) => {
                            const isSelected = selectedAccountId === acc.id;
                            
                            // Obtener estadísticas de ingresos/egresos del mes para este cuenta
                            const thisMonth = new Date().getMonth();
                            const thisYear = new Date().getFullYear();
                            const accTxs = transactions.filter(t => (t as any).accountId === acc.id || (t as any).cuentaId === acc.id);
                            
                            const monthIn = accTxs.filter(t => {
                              if (!t.date) return false;
                              const d = new Date(t.date);
                              return t.type === 'income' && d.getFullYear() === thisYear && d.getMonth() === thisMonth;
                            }).reduce((sum, t) => sum + t.amount, 0);

                            const monthOut = accTxs.filter(t => {
                              if (!t.date) return false;
                              const d = new Date(t.date);
                              return t.type === 'expense' && d.getFullYear() === thisYear && d.getMonth() === thisMonth;
                            }).reduce((sum, t) => sum + t.amount, 0);

                            const lastTx = accTxs.length > 0 ? accTxs[0] : null;
                            const cStyles = getAccountColorStyles(acc.color);

                            return (
                              <div
                                key={acc.id}
                                onClick={() => setSelectedAccountId(acc.id)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 shadow-md relative group overflow-hidden ${
                                  isSelected 
                                    ? `bg-white/10 ${cStyles.border} ${cStyles.glow}` 
                                    : `bg-white/5 border-white/10 hover:${cStyles.border} hover:bg-white/8`
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                   <div className="flex items-center gap-2.5">
                                     <div className={`p-2 rounded-xl text-xs font-extrabold border ${cStyles.bg}`}>
                                       {renderAccountIcon(acc.icono, "w-4.5 h-4.5")}
                                     </div>
                                     <div>
                                       <h4 className="font-bold text-white text-sm">{acc.nombre}</h4>
                                       <span className="text-[9px] font-mono text-slate-400 tracking-wider uppercase">
                                         {acc.subtipo === 'ahorros' ? '🏦 Ahorros' : acc.subtipo === 'disponible' ? '💵 Disponible' : '💳 Deuda / Pasivo'}
                                       </span>
                                     </div>
                                   </div>
                                   <div className="flex items-center gap-1">
                                     <button
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         handleDeleteAccount(acc.id);
                                       }}
                                       className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                       title="Eliminar Cuenta"
                                     >
                                       <Trash2 className="w-3.5 h-3.5" />
                                     </button>
                                   </div>
                                 </div>

                                 {/* Último Movimiento */}
                                 {lastTx ? (
                                   <div className="text-[10px] text-slate-300 bg-slate-950/40 rounded-xl p-2 border border-white/5 flex justify-between items-center">
                                     <div className="flex items-center gap-1.5 truncate">
                                       <span className="text-slate-500 text-[9px] uppercase font-mono">Último mov:</span>
                                       <span className="truncate max-w-[110px] font-medium text-slate-300">
                                         {lastTx.description || lastTx.category}
                                       </span>
                                     </div>
                                     <span className={`font-mono font-bold shrink-0 ${lastTx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                                       {lastTx.type === 'income' ? '+' : '-'}${lastTx.amount.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                                     </span>
                                   </div>
                                 ) : (
                                   <div className="text-[10px] text-slate-500 italic px-2">
                                     Sin movimientos registrados
                                   </div>
                                 )}

                                 <div className="flex justify-between items-end border-t border-white/5 pt-2 mt-1">
                                   <div>
                                     <span className="text-[9px] font-mono text-slate-500 uppercase block leading-none">Saldo Actual</span>
                                     <span className={`text-xl font-extrabold block mt-1 ${acc.tipo === 'credito' ? 'text-white' : 'text-rose-400'}`}>
                                       ${acc.saldo.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                     </span>
                                   </div>

                                   <div className="text-right font-mono text-[9px] text-slate-400 flex flex-col gap-0.5">
                                     <span className="text-emerald-400 leading-none">+{monthIn.toLocaleString('es-ES', { maximumFractionDigits: 0 })} IN</span>
                                     <span className="text-red-400 leading-none">-${monthOut.toLocaleString('es-ES', { maximumFractionDigits: 0 })} OUT</span>
                                   </div>
                                 </div>
                               </div>
                             );
                           })
                        )}
                      </div>
                    </div>

                    {/* OPERACIONES DE LA CUENTA SELECCIONADA (DERECHA) */}
                    <div className="lg:col-span-6 flex flex-col gap-4">
                      {(() => {
                        const selectedAcc = accounts.find(a => a.id === selectedAccountId);
                        if (!selectedAcc) {
                          return (
                            <div className="bg-white/5 border border-white/10 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[400px]">
                              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                                <Wallet className="w-6 h-6" />
                              </div>
                              <h3 className="font-bold text-white text-sm">Gestiona tus Saldos</h3>
                              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                                Selecciona una cuenta de la lista de la izquierda para realizar depósitos, registrar gastos de forma individual o ver sus históricos mensuales.
                              </p>
                            </div>
                          );
                        }

                        // Filtrar movimientos específicos de esta cuenta
                        const accTransactions = transactions.filter(t => (t as any).accountId === selectedAcc.id || (t as any).cuentaId === selectedAcc.id);

                        return (
                          <div className="flex flex-col gap-4">
                            {/* Cabecera Cuenta Seleccionada */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                              <span className="text-[9px] font-mono text-emerald-400 tracking-widest uppercase">CUENTA SELECCIONADA</span>
                              <h3 className="text-xl font-extrabold text-white mt-1">{selectedAcc.nombre}</h3>
                              <div className="flex justify-between items-center mt-4">
                                <div>
                                  <span className="text-[9px] text-slate-400 block uppercase font-semibold">Balance Líquido</span>
                                  <span className={`text-2xl font-black ${selectedAcc.tipo === 'credito' ? 'text-white' : 'text-rose-400'}`}>
                                    ${selectedAcc.saldo.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </div>
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase border ${selectedAcc.tipo === 'credito' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                  {selectedAcc.tipo === 'credito' ? 'Activo' : 'Tarjeta / Pasivo'}
                                </span>
                              </div>
                            </div>

                            {/* Formularios de Entrada / Salida */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
                              <h4 className="font-bold text-white text-xs tracking-wider uppercase border-b border-white/5 pb-2">Registrar Transacción Directa</h4>
                              
                              <form onSubmit={handleAccountTransaction} className="flex flex-col gap-3.5">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[10px] font-semibold text-slate-300 mb-1">Monto ($)</label>
                                    <input 
                                      type="number"
                                      step="0.01"
                                      required
                                      placeholder="0.00"
                                      value={actTxAmount}
                                      onChange={(e) => setActTxAmount(e.target.value)}
                                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-semibold text-slate-300 mb-1">Tipo de Operación</label>
                                    <div className="grid grid-cols-2 gap-1 bg-slate-950/50 p-1 border border-white/5 rounded-xl">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActTxType('income');
                                          setActTxCategory(categories.income[0]);
                                        }}
                                        className={`py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${actTxType === 'income' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                                      >
                                        DEPÓSITO
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActTxType('expense');
                                          setActTxCategory(categories.expense[0]);
                                        }}
                                        className={`py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${actTxType === 'expense' ? 'bg-red-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                                      >
                                        RETIRO
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[10px] font-semibold text-slate-300 mb-1">Categoría</label>
                                    <select
                                      value={actTxCategory}
                                      onChange={(e) => setActTxCategory(e.target.value)}
                                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    >
                                      {actTxType === 'income' 
                                        ? categories.income.map(c => <option key={c} value={c}>{c}</option>)
                                        : categories.expense.map(c => <option key={c} value={c}>{c}</option>)
                                      }
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-semibold text-slate-300 mb-1">Descripción</label>
                                    <input 
                                      type="text"
                                      placeholder="Ej: Depósito en OXXO"
                                      value={actTxDescription}
                                      onChange={(e) => setActTxDescription(e.target.value)}
                                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                  </div>
                                </div>

                                <button
                                  type="submit"
                                  disabled={actTxLoading}
                                  className={`w-full font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg ${
                                    actTxType === 'income' 
                                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/10' 
                                      : 'bg-red-500 hover:bg-red-400 text-slate-950 shadow-red-500/10'
                                  }`}
                                >
                                  {actTxLoading ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <>
                                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                      {actTxType === 'income' ? 'Registrar Depósito' : 'Registrar Retiro'}
                                    </>
                                  )}
                                </button>
                              </form>
                            </div>

                            {/* Transferir Dinero a otra Cuenta */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
                              <h4 className="font-bold text-white text-xs tracking-wider uppercase border-b border-white/5 pb-2">Transferir a otra Cuenta</h4>
                              
                              <form onSubmit={handleAccountTransfer} className="flex flex-col gap-3.5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[10px] font-semibold text-slate-300 mb-1">Monto a Transferir ($)</label>
                                    <input 
                                      type="number"
                                      step="0.01"
                                      required
                                      placeholder="0.00"
                                      value={transferAmount}
                                      onChange={(e) => setTransferAmount(e.target.value)}
                                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-semibold text-slate-300 mb-1">Cuenta de Destino</label>
                                    <select
                                      required
                                      value={transferTargetAccountId}
                                      onChange={(e) => setTransferTargetAccountId(e.target.value)}
                                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    >
                                      <option value="">-- Seleccionar Cuenta --</option>
                                      {accounts
                                        .filter(a => a.id !== selectedAcc.id)
                                        .map(a => (
                                          <option key={a.id} value={a.id}>
                                            {a.nombre} (Saldo: ${a.saldo.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                                          </option>
                                        ))
                                      }
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-300 mb-1">Descripción / Concepto (Opcional)</label>
                                  <input 
                                    type="text"
                                    placeholder="Ej: Traspaso mensual de ahorro"
                                    value={transferDescription}
                                    onChange={(e) => setTransferDescription(e.target.value)}
                                    className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                  />
                                </div>

                                <button
                                  type="submit"
                                  disabled={transferLoading}
                                  className="w-full font-bold py-2.5 rounded-xl text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  {transferLoading ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <>
                                      <ArrowLeftRight className="w-3.5 h-3.5" />
                                      <span>Confirmar Transferencia</span>
                                    </>
                                  )}
                                </button>
                              </form>
                            </div>

                            {/* Historial rápido específico de la cuenta */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col gap-3">
                              <h4 className="font-bold text-white text-xs tracking-wider uppercase border-b border-white/5 pb-2">Historial de {selectedAcc.nombre}</h4>
                              
                              {accTransactions.length === 0 ? (
                                <div className="py-4 text-center text-xs text-slate-500">No hay movimientos registrados para esta cuenta.</div>
                              ) : (
                                <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto">
                                  {accTransactions.map(tx => (
                                    <div key={tx.id} className="flex justify-between items-center p-2 bg-white/5 rounded-xl border border-white/5 text-xs hover:bg-white/8 transition-all">
                                      <div className="flex flex-col">
                                        <span className="font-bold text-white truncate max-w-[150px]">{tx.description}</span>
                                        <span className="text-[9px] text-slate-400 font-mono mt-0.5">{tx.date ? tx.date.split('T')[0] : 'Sin fecha'} • {tx.category}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className={`font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                                          {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                                        </span>
                                        <button 
                                          onClick={() => handleDeleteTransaction(tx.id)}
                                          className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}

                {/* 3. MÓDULO: MOVIMIENTOS (Consultas) */}
                {activeModule === 'consultas' && (
                  <motion.div
                    key="module-consultas"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col gap-6"
                  >
                    {/* ENCABEZADO DE SECCIÓN CON BOTÓN REGISTRAR */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 border border-white/5 rounded-2xl p-5 shadow-lg">
                      <div>
                        <h3 className="text-sm font-black text-white tracking-wider uppercase flex items-center gap-2">
                          <Coins className="w-4 h-4 text-emerald-400" />
                          Gestión Centralizada de Movimientos
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-1">Registra nuevos ingresos, egresos y traspasos con foto de factura y mantén el control total.</p>
                      </div>

                      <button
                        onClick={() => {
                          setNewTxType('expense');
                          setNewTxCategory(categories.expense[0]);
                          setNewTxAmount('');
                          setNewTxNotes('');
                          setNewTxAttachment(null);
                          setNewTxAttachmentName('');
                          setShowNewTxModal(true);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-slate-950 text-xs font-extrabold px-5 py-3 rounded-xl shadow-lg hover:shadow-emerald-500/15 cursor-pointer flex items-center justify-center gap-2 transition-all shrink-0"
                      >
                        <Plus className="w-4 h-4 text-slate-950 stroke-[3px]" />
                        Nuevo Movimiento
                      </button>
                    </div>

                    {/* BARRA DE FILTROS */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
                      <h3 className="font-bold text-white text-xs tracking-wider uppercase flex items-center gap-2">
                        <Filter className="w-4 h-4 text-emerald-400" />
                        Filtros de Búsqueda de Movimientos
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Fecha Desde</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                            <input 
                              type="date"
                              value={queryStartDate}
                              onChange={(e) => setQueryStartDate(e.target.value)}
                              className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Fecha Hasta</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                            <input 
                              type="date"
                              value={queryEndDate}
                              onChange={(e) => setQueryEndDate(e.target.value)}
                              className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Por Cuenta</label>
                          <select
                            value={queryAccountId}
                            onChange={(e) => setQueryAccountId(e.target.value)}
                            className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="ALL">Todas las Cuentas</option>
                            {accounts.map(a => (
                              <option key={a.id} value={a.id}>{a.nombre}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Por Categoría</label>
                          <select
                            value={queryCategory}
                            onChange={(e) => setQueryCategory(e.target.value)}
                            className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="ALL">Todas las Categorías</option>
                            {[...categories.income, ...categories.expense, 'Transferencia'].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Botón de Limpiar Filtros */}
                      <div className="flex justify-end border-t border-white/5 pt-3">
                        <button
                          onClick={() => {
                            setQueryStartDate('');
                            setQueryEndDate('');
                            setQueryAccountId('ALL');
                            setQueryCategory('ALL');
                          }}
                          className="bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl border border-white/10 cursor-pointer flex items-center gap-1.5 transition-all"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Limpiar Todos los Filtros
                        </button>
                      </div>
                    </div>

                    {/* ESTADÍSTICAS DEL FILTRADO */}
                    {(() => {
                      // Aplicar filtros en memoria
                      const matched = transactions.filter(t => {
                        if (queryStartDate && t.date && t.date.split('T')[0] < queryStartDate) return false;
                        if (queryEndDate && t.date && t.date.split('T')[0] > queryEndDate) return false;
                        if (queryAccountId !== 'ALL') {
                          const tAccId = (t as any).accountId || (t as any).cuentaId;
                          if (tAccId !== queryAccountId) return false;
                        }
                        if (queryCategory !== 'ALL' && t.category !== queryCategory) return false;
                        return true;
                      });

                      const inc = matched.filter(t => t.type === 'income' || t.tipo === 'ingreso').reduce((s, t) => s + t.amount, 0);
                      const exp = matched.filter(t => t.type === 'expense' || t.tipo === 'egreso').reduce((s, t) => s + t.amount, 0);
                      const neto = inc - exp;

                      return (
                        <div className="flex flex-col gap-4">
                          {/* KPI Row de Consultas */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 shadow-sm flex justify-between items-center">
                              <div>
                                <span className="text-[9px] font-mono text-emerald-400 block uppercase font-bold">Ingresos Filtrados</span>
                                <span className="text-xl font-black text-emerald-400 mt-1 block">+${inc.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                              <ArrowUpRight className="w-6 h-6 text-emerald-400" />
                            </div>

                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 shadow-sm flex justify-between items-center">
                              <div>
                                <span className="text-[9px] font-mono text-red-400 block uppercase font-bold">Gastos Filtrados</span>
                                <span className="text-xl font-black text-red-400 mt-1 block">-${exp.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                              <ArrowDownRight className="w-6 h-6 text-red-400" />
                            </div>

                            <div className={`border rounded-2xl p-4 shadow-sm flex justify-between items-center ${neto >= 0 ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                              <div>
                                <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold">Balance de Selección</span>
                                <span className="text-xl font-black mt-1 block">${neto.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                              <DollarSign className="w-6 h-6" />
                            </div>
                          </div>

                          {/* TABLA DE RESULTADOS */}
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                              <h4 className="font-bold text-white text-xs tracking-wider uppercase">Resultados de la Consulta</h4>
                              <span className="text-[10px] font-mono text-slate-500">{matched.length} registros coincidentes</span>
                            </div>

                            {matched.length === 0 ? (
                              <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-1.5 justify-center">
                                <Search className="w-6 h-6 text-slate-700" />
                                <span>No se encontraron transacciones que coincidan con los filtros seleccionados.</span>
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs font-normal border-collapse">
                                  <thead>
                                    <tr className="border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                      <th className="py-2.5">Fecha</th>
                                      <th className="py-2.5">Descripción</th>
                                      <th className="py-2.5">Cuenta Origen</th>
                                      <th className="py-2.5">Categoría</th>
                                      <th className="py-2.5 text-center">Adjunto</th>
                                      <th className="py-2.5 text-right">Monto</th>
                                      <th className="py-2.5 text-center">Acciones</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {matched.map((tx) => {
                                      const txAccId = (tx as any).accountId || (tx as any).cuentaId;
                                      const matchedAcc = accounts.find(a => a.id === txAccId);
                                      const hasAttachment = tx.attachment || tx.adjunto;

                                      return (
                                        <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                                          <td className="py-3 font-mono text-[11px] text-slate-400">
                                            {tx.date ? tx.date.split('T')[0] : 'Sin fecha'}
                                          </td>
                                          <td className="py-3 font-semibold text-white max-w-[200px] truncate">{tx.description}</td>
                                          <td className="py-3">
                                            {matchedAcc ? (
                                              <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg font-bold text-[10px] text-slate-300">
                                                {matchedAcc.nombre}
                                              </span>
                                            ) : (
                                              <span className="text-slate-500 italic text-[10px]">General / Demo</span>
                                            )}
                                          </td>
                                          <td className="py-3 text-slate-400">
                                            {(() => {
                                              const details = getCategoryDetails(tx.category || (tx as any).categoria);
                                              return (
                                                <span className={`px-2 py-0.5 rounded-md font-medium text-[10px] border inline-flex items-center gap-1 w-fit ${details.bgCol}`}>
                                                  <span>{details.emoji}</span>
                                                  <span>{details.name}</span>
                                                </span>
                                              );
                                            })()}
                                          </td>
                                          <td className="py-3 text-center">
                                            {hasAttachment ? (
                                              <button
                                                onClick={() => setFullscreenImage(tx.attachment || tx.adjunto || null)}
                                                className="p-1 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-all"
                                                title="Ver factura adjunta"
                                              >
                                                <Paperclip className="w-3 h-3" />
                                                Ver Factura
                                              </button>
                                            ) : (
                                              <span className="text-slate-600 text-[10px] font-mono">-</span>
                                            )}
                                          </td>
                                          <td className={`py-3 text-right font-bold text-[13px] ${tx.type === 'income' || tx.tipo === 'ingreso' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {tx.type === 'income' || tx.tipo === 'ingreso' ? '+' : '-'}${tx.amount.toFixed(2)}
                                          </td>
                                          <td className="py-3 text-center">
                                            <button 
                                              onClick={() => handleDeleteTransaction(tx.id)}
                                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                                              title="Eliminar de Firestore"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                )}

                {/* 4. MÓDULO: USUARIO */}
                {activeModule === 'usuario' && (
                  <motion.div
                    key="module-usuario"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                  >
                    {/* TARJETA DE PERFIL (IZQUIERDA) */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col items-center text-center gap-4 relative overflow-hidden">
                        <div className="absolute top-[-10%] right-[-10%] w-[120px] h-[120px] bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
                        
                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-3xl border-2 border-emerald-500/20 relative shadow-inner">
                          {currentUser.email?.charAt(0).toUpperCase()}
                          <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
                        </div>

                        <div>
                          <h3 className="font-extrabold text-white text-lg tracking-tight">{currentUser.email}</h3>
                          <p className="text-xs text-slate-500 mt-1">Suscripción activa sincronizada con Firestore</p>
                        </div>

                        <div className="w-full flex flex-col gap-2.5 mt-2 text-xs text-left border-t border-white/5 pt-4">
                          <div className="flex justify-between items-center py-1.5">
                            <span className="text-slate-400">Identificador (UID)</span>
                            <span className="font-mono text-[10px] text-white bg-white/5 px-2 py-0.5 rounded-lg border border-white/5 max-w-[150px] truncate" title={currentUser.uid}>
                              {currentUser.uid}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1.5">
                            <span className="text-slate-400">Método de Proveedor</span>
                            <span className="font-bold text-white uppercase text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/10">
                              {currentUser.providerId || 'Correo Electrónico'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1.5">
                            <span className="text-slate-400">Último Acceso</span>
                            <span className="text-white font-mono text-[10px]">
                              {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={handleLogout}
                          className="w-full bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-white/10 hover:border-red-500/20 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar Sesión Activa
                        </button>
                      </div>
                    </div>

                    {/* ESTADÍSTICAS Y KPI DEL PERFIL (DERECHA) */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
                        <h4 className="font-bold text-white text-xs tracking-wider uppercase border-b border-white/5 pb-2">Resumen Financiero del Perfil</h4>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl flex flex-col gap-1">
                            <span className="text-[10px] font-mono text-slate-400 uppercase leading-none">Patrimonio Consolidado</span>
                            {(() => {
                              const general = accounts.filter(a => a.tipo === 'credito').reduce((sum, a) => sum + a.saldo, 0);
                              const deudas = accounts.filter(a => a.tipo === 'deuda').reduce((sum, a) => sum + a.saldo, 0);
                              const neto = general - deudas;
                              return (
                                <span className={`text-xl font-extrabold mt-1.5 block ${neto >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  ${neto.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              );
                            })()}
                          </div>

                          <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl flex flex-col gap-1">
                            <span className="text-[10px] font-mono text-slate-400 uppercase leading-none">Cuentas Registradas</span>
                            <span className="text-xl font-extrabold mt-1.5 block text-white">{accounts.length}</span>
                          </div>

                          <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl flex flex-col gap-1">
                            <span className="text-[10px] font-mono text-slate-400 uppercase leading-none">Total Transacciones</span>
                            <span className="text-xl font-extrabold mt-1.5 block text-white">{transactions.length}</span>
                          </div>

                          <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl flex flex-col gap-1">
                            <span className="text-[10px] font-mono text-slate-400 uppercase leading-none">Ticket Medio</span>
                            {(() => {
                              const totalAmt = transactions.reduce((sum, t) => sum + t.amount, 0);
                              const count = transactions.length;
                              const average = count > 0 ? (totalAmt / count) : 0;
                              return (
                                <span className="text-xl font-extrabold mt-1.5 block text-white">
                                  ${average.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              );
                            })()}
                          </div>
                        </div>

                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-3 mt-2">
                          <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 h-fit shrink-0">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-white">Aislamiento de Datos por UID</h5>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                              Tus datos financieros están totalmente protegidos. Las reglas de seguridad de Firestore (Rules) restringen el acceso a las subcolecciones para que solo tú puedas ver o escribir información vinculada a tu identificador único de usuario.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 5. MÓDULO: CATEGORÍAS */}
                {activeModule === 'categorias' && (
                  <motion.div
                    key="module-categorias"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                  >
                    {/* COLUMNA IZQUIERDA: CREAR CATEGORÍA */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col gap-4">
                        <div className="absolute top-[-10%] right-[-10%] w-[120px] h-[120px] bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
                        
                        <div>
                          <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
                            <PlusCircle className="w-5 h-5 text-emerald-400" />
                            Nueva Categoría
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">Crea una categoría personalizada para clasificar tus movimientos contables.</p>
                        </div>

                        <form onSubmit={handleCreateCategory} className="flex flex-col gap-4 mt-2">
                          {/* Nombre de la Categoría */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Nombre de Categoría</label>
                            <input
                              type="text"
                              required
                              placeholder="Ej: Gimnasio, Restaurantes, Donaciones"
                              value={newCatName}
                              onChange={(e) => setNewCatName(e.target.value)}
                              className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                            />
                          </div>

                          {/* Tipo de Categoría (Ingreso / Egreso) */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Tipo de Flujo</label>
                            <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-1 rounded-xl border border-white/5">
                              <button
                                type="button"
                                onClick={() => setNewCatType('expense')}
                                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  newCatType === 'expense'
                                    ? 'bg-red-500/10 border border-red-500/20 text-red-400 shadow-sm'
                                    : 'bg-transparent border border-transparent text-slate-500 hover:text-slate-300'
                                }`}
                              >
                                📉 Egreso / Gasto
                              </button>
                              <button
                                type="button"
                                onClick={() => setNewCatType('income')}
                                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  newCatType === 'income'
                                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-sm'
                                    : 'bg-transparent border border-transparent text-slate-500 hover:text-slate-300'
                                }`}
                              >
                                📈 Ingreso / Sueldo
                              </button>
                            </div>
                          </div>

                          {/* Selector de Emoji */}
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emoji Representativo</label>
                              <span className="text-[10px] font-mono text-slate-500">Seleccionado: {newCatEmoji}</span>
                            </div>
                            
                            {/* Grid de Emojis Recomendados */}
                            <div className="bg-slate-950/30 border border-white/5 rounded-xl p-3 flex flex-col gap-3">
                              <div className="grid grid-cols-8 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                                {[
                                  '🍔', '🚗', '🏠', '🎬', '🛒', '🏥', '🎓', '✈️',
                                  '🐶', '💼', '💳', '💡', '📱', '🎁', '💰', '📈',
                                  '🛍️', '💻', '💵', '🍕', '🍿', '🎸', '🎮', '🏋️',
                                  '📚', '👗', '🎨', '🚕', '🥕', '🥩', '🍩', '🥑',
                                  '🍹', '🏝️', '🏕️', '🏡', '🚲', '🍿', '🎟️', '💈'
                                ].map((em) => (
                                  <button
                                    key={em}
                                    type="button"
                                    onClick={() => setNewCatEmoji(em)}
                                    className={`aspect-square flex items-center justify-center rounded-lg text-base hover:bg-white/10 transition-all cursor-pointer ${
                                      newCatEmoji === em ? 'bg-emerald-500/20 border border-emerald-500/40 scale-110' : 'bg-transparent border border-transparent'
                                    }`}
                                  >
                                    {em}
                                  </button>
                                ))}
                              </div>

                              <div className="border-t border-white/5 pt-2 flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 shrink-0">¿Otro emoji?</span>
                                <input
                                  type="text"
                                  maxLength={2}
                                  placeholder="Escribe uno"
                                  value={newCatEmoji}
                                  onChange={(e) => setNewCatEmoji(e.target.value)}
                                  className="w-12 text-center bg-slate-950/80 border border-white/10 rounded-lg py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Botón de envío */}
                          <button
                            type="submit"
                            disabled={newCatLoading}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 cursor-pointer mt-2"
                          >
                            {newCatLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4 stroke-[3px]" />
                            )}
                            Crear Categoría Personalizada
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* COLUMNA DERECHA: EXPLORADOR DE CATEGORÍAS */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                      {/* CATEGORÍAS DE EGRESOS / GASTOS */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <h4 className="font-extrabold text-white text-xs tracking-wider uppercase flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-400"></span>
                            Categorías de Egresos / Gastos
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono font-bold">{categories.expense.length} Total</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {categories.expense.map((catStr) => {
                            // Separar el emoji del nombre
                            const match = catStr.match(/^([\u2000-\u32ff\ud83c-\udbff\udf00-\udfff\s]+)?(.+)$/);
                            const emoji = match ? match[1]?.trim() || '📦' : '📦';
                            const name = match ? match[2]?.trim() || catStr : catStr;
                            
                            // Buscar si es de base de datos
                            const dbCat = dbCategories.find(c => c.type === 'expense' && c.name.toLowerCase().trim() === name.toLowerCase().trim());
                            const isSystem = !dbCat;

                            return (
                              <div 
                                key={catStr}
                                className="flex items-center justify-between p-3 bg-slate-950/30 border border-white/5 hover:border-white/10 rounded-xl transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{emoji}</span>
                                  <span className="text-xs font-semibold text-slate-200">{name}</span>
                                </div>
                                <div>
                                  {isSystem ? (
                                    <span className="text-[8px] font-mono font-bold text-slate-600 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                      Sistema
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCategory(dbCat.id)}
                                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                                      title="Eliminar categoría personalizada"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* CATEGORÍAS DE INGRESOS / ENTRADAS */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <h4 className="font-extrabold text-white text-xs tracking-wider uppercase flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            Categorías de Ingresos / Entradas
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono font-bold">{categories.income.length} Total</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {categories.income.map((catStr) => {
                            // Separar el emoji del nombre
                            const match = catStr.match(/^([\u2000-\u32ff\ud83c-\udbff\udf00-\udfff\s]+)?(.+)$/);
                            const emoji = match ? match[1]?.trim() || '💰' : '💰';
                            const name = match ? match[2]?.trim() || catStr : catStr;
                            
                            // Buscar si es de base de datos
                            const dbCat = dbCategories.find(c => c.type === 'income' && c.name.toLowerCase().trim() === name.toLowerCase().trim());
                            const isSystem = !dbCat;

                            return (
                              <div 
                                key={catStr}
                                className="flex items-center justify-between p-3 bg-slate-950/30 border border-white/5 hover:border-white/10 rounded-xl transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{emoji}</span>
                                  <span className="text-xs font-semibold text-slate-200">{name}</span>
                                </div>
                                <div>
                                  {isSystem ? (
                                    <span className="text-[8px] font-mono font-bold text-slate-600 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                      Sistema
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCategory(dbCat.id)}
                                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                                      title="Eliminar categoría personalizada"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 6. MÓDULO: CONTROL DE PRESUPUESTOS */}
                {activeModule === 'presupuestos' && (
                  <motion.div
                    key="module-presupuestos"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                  >
                    {/* COLUMNA IZQUIERDA: CREAR PRESUPUESTO */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col gap-4">
                        <div className="absolute top-[-10%] right-[-10%] w-[120px] h-[120px] bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
                        
                        <div>
                          <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
                            <PlusCircle className="w-5 h-5 text-emerald-400" />
                            Nuevo Presupuesto
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">Asigna un límite de gastos mensual a tus categorías para controlar tus finanzas.</p>
                        </div>

                        <form onSubmit={handleCreateBudget} className="flex flex-col gap-4 mt-2">
                          {/* Categoría */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Categoría de Gasto</label>
                            <select
                              required
                              value={newBudgetCategory}
                              onChange={(e) => setNewBudgetCategory(e.target.value)}
                              className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
                            >
                              <option value="" className="text-slate-500">-- Selecciona una Categoría --</option>
                              {categories.expense.map((catStr) => (
                                <option key={catStr} value={catStr} className="text-slate-950">
                                  {catStr}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Límite Máximo */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Monto Máximo Mensual ($)</label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs font-bold">$</span>
                              <input
                                type="number"
                                required
                                min="1"
                                placeholder="Ej: 900000"
                                value={newBudgetLimit}
                                onChange={(e) => setNewBudgetLimit(e.target.value)}
                                className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 pl-8 pr-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                              />
                            </div>
                          </div>

                          {/* Límite de Alerta (%) */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Porcentaje de Alerta Previa (%)</label>
                            <div className="relative">
                              <input
                                type="number"
                                required
                                min="50"
                                max="100"
                                placeholder="Ej: 95"
                                value={newBudgetAlertThreshold}
                                onChange={(e) => setNewBudgetAlertThreshold(e.target.value)}
                                className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                              />
                              <span className="absolute right-3.5 top-2.5 text-slate-500 text-xs font-bold">%</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                              Cuando tus gastos alcancen este porcentaje, el presupuesto se pintará de <span className="text-yellow-400 font-bold">amarillo</span> para avisarte.
                            </p>
                          </div>

                          {/* Botón de envío */}
                          <button
                            type="submit"
                            disabled={newBudgetLoading}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 cursor-pointer mt-2"
                          >
                            {newBudgetLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4 stroke-[3px]" />
                            )}
                            Crear Control de Presupuesto
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* COLUMNA DERECHA: MONITOREO DE PRESUPUESTOS EN TIEMPO REAL */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <h4 className="font-extrabold text-white text-xs tracking-wider uppercase flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            Presupuestos de Gasto Activos
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono font-bold">{dbBudgets.length} Configurados</span>
                        </div>

                        {dbBudgets.length === 0 ? (
                          <div className="text-center py-10 flex flex-col items-center justify-center gap-2">
                            <Wallet className="w-8 h-8 text-slate-600" />
                            <p className="text-xs text-slate-400 font-medium">No has configurado ningún presupuesto para este mes.</p>
                            <p className="text-[10px] text-slate-600 max-w-[280px]">Elige una categoría de egreso a la izquierda para empezar a monitorear tus topes de consumo.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4">
                            {dbBudgets.map((budget) => {
                              const currentSpend = getMonthlySpendForCategory(budget.category);
                              const maxAmount = budget.maxAmount;
                              const pct = maxAmount > 0 ? (currentSpend / maxAmount) * 100 : 0;
                              const alertThreshold = budget.alertThreshold || 95;

                              // Separar emoji y nombre
                              const match = budget.category.match(/^([\u2000-\u32ff\ud83c-\udbff\udf00-\udfff\s]+)?(.+)$/);
                              const emoji = match ? match[1]?.trim() || '📦' : '📦';
                              const name = match ? match[2]?.trim() || budget.category : budget.category;

                              // Evaluar estados de color según la regla de negocio
                              // > 100% -> Red, "🔴 Presupuesto excedido"
                              // >= alertThreshold% -> Yellow, "Pinta todo en amarillo"
                              // Else -> Normal / Green
                              const isExceeded = currentSpend > maxAmount;
                              const isWarning = !isExceeded && pct >= alertThreshold;

                              let bgClass = "bg-slate-950/30 border-white/5";
                              let progressColor = "bg-emerald-500 shadow-emerald-500/20";
                              let textAccentColor = "text-emerald-400";

                              if (isExceeded) {
                                bgClass = "bg-red-500/10 border-red-500/20";
                                progressColor = "bg-red-500 shadow-red-500/20";
                                textAccentColor = "text-red-400";
                              } else if (isWarning) {
                                bgClass = "bg-yellow-500/10 border-yellow-500/20";
                                progressColor = "bg-yellow-500 shadow-yellow-500/20";
                                textAccentColor = "text-yellow-400";
                              }

                              return (
                                <div 
                                  key={budget.id}
                                  className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col gap-3.5 ${bgClass}`}
                                >
                                  {/* Cabecera del item */}
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                      <span className="text-2xl p-2 bg-slate-950/50 rounded-xl border border-white/5">{emoji}</span>
                                      <div>
                                        <h5 className="text-xs font-black text-white tracking-wide">{name}</h5>
                                        <p className="text-[10px] text-slate-500 mt-0.5">Alertas a partir del {alertThreshold}% de consumo</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {isExceeded && (
                                        <span className="text-[8px] font-black uppercase tracking-wider bg-red-500 text-slate-950 px-2 py-1 rounded-full flex items-center gap-1 shadow-md shadow-red-500/10">
                                          🔴 Presupuesto excedido
                                        </span>
                                      )}
                                      {isWarning && (
                                        <span className="text-[8px] font-black uppercase tracking-wider bg-yellow-400 text-slate-950 px-2 py-1 rounded-full flex items-center gap-1 shadow-md shadow-yellow-400/10">
                                          ⚠️ Umbral Alcanzado ({pct.toFixed(0)}%)
                                        </span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteBudget(budget.id)}
                                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                                        title="Eliminar presupuesto"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Valores de barra y métricas */}
                                  <div className="flex flex-col gap-1.5">
                                    <div className="flex justify-between items-baseline text-xs">
                                      <span className="text-slate-400 text-[11px]">Consumo actual</span>
                                      <div className="font-mono flex items-center gap-1">
                                        <span className={`font-black ${textAccentColor}`}>${currentSpend.toLocaleString('es-CO')}</span>
                                        <span className="text-slate-600 text-[10px]">de</span>
                                        <span className="text-slate-300 font-bold">${maxAmount.toLocaleString('es-CO')}</span>
                                      </div>
                                    </div>

                                    {/* Barra de progreso */}
                                    <div className="w-full h-2.5 bg-slate-950/80 rounded-full overflow-hidden border border-white/5 relative">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(pct, 100)}%` }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className={`h-full rounded-full transition-colors ${progressColor}`}
                                      />
                                    </div>

                                    {/* Detalle porcentual */}
                                    <div className="flex justify-between items-center mt-0.5">
                                      <span className="text-[10px] text-slate-500 font-medium">Consumido del límite</span>
                                      <span className={`text-[11px] font-mono font-black ${textAccentColor}`}>{pct.toFixed(1)}%</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 7. MÓDULO: METAS DE AHORRO */}
                {activeModule === 'ahorros' && (
                  <motion.div
                    key="module-ahorros"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                  >
                    {/* COLUMNA IZQUIERDA: CREAR META */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col gap-4">
                        <div className="absolute top-[-10%] right-[-10%] w-[120px] h-[120px] bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
                        
                        <div>
                          <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
                            <PlusCircle className="w-5 h-5 text-emerald-400" />
                            Nueva Meta de Ahorro
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">Define tus metas de ahorro (viajes, tecnología, fondos de emergencia) y sigue tu progreso.</p>
                        </div>

                        <form onSubmit={handleCreateSavingsGoal} className="flex flex-col gap-4 mt-2">
                          {/* Nombre de la Meta */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Nombre de la Meta</label>
                            <input
                              type="text"
                              required
                              placeholder="Ej: Viaje Japón, Emergencias, Carro Nuevo"
                              value={newGoalName}
                              onChange={(e) => setNewGoalName(e.target.value)}
                              className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                            />
                          </div>

                          {/* Monto Meta */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Monto Meta ($)</label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs font-bold">$</span>
                              <input
                                type="number"
                                required
                                min="1"
                                placeholder="Ej: 15000000"
                                value={newGoalTarget}
                                onChange={(e) => setNewGoalTarget(e.target.value)}
                                className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 pl-8 pr-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                              />
                            </div>
                          </div>

                          {/* Monto Ahorrado Inicial */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Monto Ahorrado Inicial ($)</label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs font-bold">$</span>
                              <input
                                type="number"
                                min="0"
                                placeholder="Ej: 8300000 (Dejar en 0 si empiezas desde cero)"
                                value={newGoalSaved}
                                onChange={(e) => setNewGoalSaved(e.target.value)}
                                className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 pl-8 pr-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                              />
                            </div>
                          </div>

                          {/* Selector de Emoji */}
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emoji Icono</label>
                              <span className="text-[10px] font-mono text-slate-500">Seleccionado: {newGoalEmoji}</span>
                            </div>
                            
                            {/* Grid de Emojis de Ahorro */}
                            <div className="bg-slate-950/30 border border-white/5 rounded-xl p-3 flex flex-col gap-3">
                              <div className="grid grid-cols-8 gap-1.5 max-h-[100px] overflow-y-auto pr-1">
                                {[
                                  '💰', '✈️', '🚨', '🏠', '🚗', '🎓', '💻', '🎮',
                                  '📈', '🏖️', '🎒', '🏍️', '💍', '👶', '🐶', '🍕',
                                  '📱', '🚲', '🛹', '🏕️', '🏡', '🏥', '🎸', '🎁'
                                ].map((em) => (
                                  <button
                                    key={em}
                                    type="button"
                                    onClick={() => setNewGoalEmoji(em)}
                                    className={`aspect-square flex items-center justify-center rounded-lg text-base hover:bg-white/10 transition-all cursor-pointer ${
                                      newGoalEmoji === em ? 'bg-emerald-500/20 border border-emerald-500/40 scale-110' : 'bg-transparent border-transparent'
                                    }`}
                                  >
                                    {em}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Botón de envío */}
                          <button
                            type="submit"
                            disabled={newGoalLoading}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 cursor-pointer mt-2"
                          >
                            {newGoalLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4 stroke-[3px]" />
                            )}
                            Crear Meta de Ahorro
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* COLUMNA DERECHA: SEGUIMIENTO DE METAS EN TIEMPO REAL */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <h4 className="font-extrabold text-white text-xs tracking-wider uppercase flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                            Mis Metas de Ahorro Configuradas
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono font-bold">{dbSavingsGoals.length} Metas</span>
                        </div>

                        {dbSavingsGoals.length === 0 ? (
                          <div className="text-center py-10 flex flex-col items-center justify-center gap-2">
                            <TrendingUp className="w-8 h-8 text-slate-600" />
                            <p className="text-xs text-slate-400 font-medium">No has configurado ninguna meta de ahorro.</p>
                            <p className="text-[10px] text-slate-600 max-w-[280px]">Utiliza el formulario de la izquierda para establecer tus objetivos financieros.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4">
                            {dbSavingsGoals.map((goal) => {
                              const targetAmount = goal.targetAmount;
                              const currentSaved = goal.currentSaved;
                              const pct = targetAmount > 0 ? (currentSaved / targetAmount) * 100 : 0;
                              const isCompleted = currentSaved >= targetAmount;

                              // Paleta de colores e iconografía según progreso
                              let progressColor = "bg-indigo-500 shadow-indigo-500/20";
                              let textAccentColor = "text-indigo-400";
                              let borderHighlight = "border-white/5 hover:border-white/15 bg-slate-950/30";

                              if (isCompleted) {
                                progressColor = "bg-emerald-400 shadow-emerald-400/20 animate-pulse";
                                textAccentColor = "text-emerald-400";
                                borderHighlight = "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/30";
                              } else if (pct >= 80) {
                                progressColor = "bg-teal-400 shadow-teal-400/20";
                                textAccentColor = "text-teal-400";
                              } else if (pct >= 50) {
                                progressColor = "bg-blue-400 shadow-blue-400/20";
                                textAccentColor = "text-blue-400";
                              }

                              return (
                                <div 
                                  key={goal.id}
                                  className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col gap-4 ${borderHighlight}`}
                                >
                                  {/* Cabecera de la meta */}
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                      <span className="text-2xl p-2.5 bg-slate-950/50 rounded-xl border border-white/5 shrink-0">
                                        {goal.emoji}
                                      </span>
                                      <div>
                                        <h5 className="text-xs font-black text-white tracking-wide uppercase">{goal.name}</h5>
                                        <p className="text-[10px] text-slate-500 mt-0.5">Monto Meta: ${targetAmount.toLocaleString('es-CO')}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      {isCompleted ? (
                                        <span className="text-[8px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-1 rounded-full flex items-center gap-1 shadow-md shadow-emerald-500/10">
                                          🎯 ¡Meta Completada!
                                        </span>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingGoalId(editingGoalId === goal.id ? null : goal.id);
                                            setEditingGoalSaved(currentSaved.toString());
                                          }}
                                          className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 transition-all cursor-pointer"
                                        >
                                          {editingGoalId === goal.id ? 'Cancelar' : 'Aportar / Editar'}
                                        </button>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => handleDeleteSavingsGoal(goal.id)}
                                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                                        title="Eliminar meta"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Campo de edición rápida si está seleccionado */}
                                  {editingGoalId === goal.id && (
                                    <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 flex flex-col gap-2.5">
                                      <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monto Ahorrado Actual</span>
                                        <span className="text-[9px] text-slate-500">Ingresa la nueva cifra acumulada</span>
                                      </div>
                                      <div className="flex gap-2">
                                        <div className="relative flex-1">
                                          <span className="absolute left-3 top-2 text-slate-500 text-xs font-bold">$</span>
                                          <input
                                            type="number"
                                            value={editingGoalSaved}
                                            onChange={(e) => setNewGoalSaved(e.target.value)}
                                            className="w-full bg-slate-900 border border-white/10 rounded-lg py-1.5 pl-7 pr-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            placeholder="Nueva cantidad"
                                          />
                                        </div>
                                        <button
                                          type="button"
                                          disabled={editingGoalLoading}
                                          onClick={() => handleUpdateSavingsGoalSaved(goal.id, newGoalSaved)}
                                          className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-500/5"
                                        >
                                          {editingGoalLoading ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          ) : (
                                            'Actualizar'
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Valores y barra de progreso */}
                                  <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-baseline text-xs">
                                      <span className="text-slate-400 text-[11px]">Progreso acumulado</span>
                                      <div className="font-mono flex items-center gap-1">
                                        <span className={`font-black ${textAccentColor}`}>${currentSaved.toLocaleString('es-CO')}</span>
                                        <span className="text-slate-600 text-[10px]">de</span>
                                        <span className="text-slate-300 font-bold">${targetAmount.toLocaleString('es-CO')}</span>
                                      </div>
                                    </div>

                                    {/* Barra de progreso de la meta */}
                                    <div className="w-full h-3 bg-slate-950/80 rounded-full overflow-hidden border border-white/5 relative">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(pct, 100)}%` }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className={`h-full rounded-full transition-colors ${progressColor}`}
                                      />
                                    </div>

                                    {/* Detalle porcentual */}
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] text-slate-500 font-medium">Cumplimiento de meta</span>
                                      <span className={`text-[11px] font-mono font-black ${textAccentColor}`}>{pct.toFixed(1)}%</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeModule === 'deudas' && (
                  <motion.div
                    key="module-deudas"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.25 }}
                    className="p-6 flex flex-col gap-6"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                      {/* COLUMNA FORMULARIO: REGISTRO DE NUEVA OBLIGACIÓN */}
                      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
                          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white tracking-wide">Nueva Obligación</h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">Registra una tarjeta o préstamo</p>
                          </div>
                        </div>

                        <form onSubmit={handleCreateDebt} className="flex flex-col gap-4 mt-2">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-slate-300">Nombre de la deuda</label>
                            <input
                              type="text"
                              required
                              placeholder="Ej. Visa, Préstamo Banco"
                              value={newDebtName}
                              onChange={(e) => setNewDebtName(e.target.value)}
                              className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-slate-300">Saldo pendiente</label>
                            <div className="relative font-sans">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">$</span>
                              <input
                                type="number"
                                required
                                min="1"
                                placeholder="0"
                                value={newDebtBalance}
                                onChange={(e) => setNewDebtBalance(e.target.value)}
                                className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-2 pl-7 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-slate-300">Pago mínimo o cuota mensual</label>
                            <div className="relative font-sans">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">$</span>
                              <input
                                type="number"
                                required
                                min="1"
                                placeholder="0"
                                value={newDebtMinPayment}
                                onChange={(e) => setNewDebtMinPayment(e.target.value)}
                                className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-2 pl-7 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] font-bold text-slate-300">Tipo de deuda</label>
                              <select
                                value={newDebtType}
                                onChange={(e) => setNewDebtType(e.target.value as 'card' | 'loan' | 'other')}
                                className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              >
                                <option value="card">💳 Tarjeta</option>
                                <option value="loan">🏢 Préstamo</option>
                                <option value="other">📄 Otro pasivo</option>
                              </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] font-bold text-slate-300">Próximo vencimiento</label>
                              <input
                                type="date"
                                required
                                value={newDebtDueDate}
                                onChange={(e) => setNewDebtDueDate(e.target.value)}
                                className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-1.5 px-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={newDebtLoading}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10 mt-2"
                          >
                            {newDebtLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                Agregar Obligación
                              </>
                            )}
                          </button>
                        </form>
                      </div>

                      {/* LISTADO DE DEUDAS REGISTRADAS */}
                      <div className="lg:col-span-2 flex flex-col gap-4">
                        <div className="flex justify-between items-center pb-2">
                          <div>
                            <h3 className="text-sm font-bold text-white tracking-wide">Tus Obligaciones Financieras</h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">Control de saldos, cuotas mínimas y recordatorios de pago.</p>
                          </div>
                          <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-white/5">
                            Total: {dbDebts.length}
                          </span>
                        </div>

                        {dbDebts.length === 0 ? (
                          <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-10 text-center flex flex-col items-center gap-3">
                            <CreditCard className="w-10 h-10 text-slate-500 stroke-[1.5]" />
                            <p className="text-xs text-slate-400">No tienes obligaciones registradas.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dbDebts.map((debt) => {
                              const daysLeft = calculateDaysLeft(debt.dueDate);
                              
                              // Configurar indicador de advertencia según la urgencia del pago
                              let warningBg = "bg-slate-950/60 border-white/5";
                              let warningText = "text-slate-400";
                              let alarmStatus = null;

                              if (daysLeft !== null) {
                                if (daysLeft < 0) {
                                  warningBg = "bg-red-500/10 border-red-500/20";
                                  warningText = "text-red-400";
                                  alarmStatus = `🔴 Vencido hace ${Math.abs(daysLeft)} días`;
                                } else if (daysLeft === 0) {
                                  warningBg = "bg-red-500/10 border-red-500/20";
                                  warningText = "text-red-400 font-bold animate-pulse";
                                  alarmStatus = `⚡ Vence hoy`;
                                } else if (daysLeft <= 5) {
                                  warningBg = "bg-amber-500/10 border-amber-500/20";
                                  warningText = "text-amber-400 font-semibold";
                                  alarmStatus = `⚠️ Te faltan ${daysLeft} días para pagar`;
                                } else {
                                  warningBg = "bg-emerald-500/5 border-emerald-500/10";
                                  warningText = "text-emerald-400";
                                  alarmStatus = `📅 Te faltan ${daysLeft} días para pagar`;
                                }
                              }

                              const isEditing = editingDebtId === debt.id;

                              return (
                                <div 
                                  key={debt.id} 
                                  className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden group hover:border-white/15 transition-all"
                                >
                                  {/* Encabezado de la Deuda */}
                                  <div className="flex justify-between items-start gap-2">
                                    <div className="flex items-center gap-2.5">
                                      <div className={`p-2 rounded-xl bg-slate-900 ${
                                        debt.type === 'card' ? 'text-blue-400' : 'text-purple-400'
                                      }`}>
                                        {debt.type === 'card' ? (
                                          <CreditCard className="w-4 h-4" />
                                        ) : (
                                          <Building2 className="w-4 h-4" />
                                        )}
                                      </div>
                                      <div>
                                        <h4 className="text-xs font-bold text-white tracking-wide">{debt.name}</h4>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                                          {debt.type === 'card' ? 'Tarjeta de Crédito' : 'Préstamo / Otro'}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Botones de acción */}
                                    <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => {
                                          if (isEditing) {
                                            setEditingDebtId(null);
                                          } else {
                                            setEditingDebtId(debt.id);
                                            setEditingDebtBalance(String(debt.balance));
                                            setEditingDebtMinPayment(String(debt.minPayment));
                                            setEditingDebtDueDate(debt.dueDate);
                                          }
                                        }}
                                        className="p-1 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                                        title="Editar obligación"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteDebt(debt.id)}
                                        className="p-1 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                                        title="Eliminar"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Indicador Alerta de Pago */}
                                  {alarmStatus && (
                                    <div className={`py-2 px-3.5 rounded-xl border text-center text-xs ${warningBg} ${warningText} flex items-center justify-center gap-2 font-medium`}>
                                      <span>{alarmStatus}</span>
                                    </div>
                                  )}

                                  {/* Datos del Balance */}
                                  {!isEditing ? (
                                    <div className="grid grid-cols-2 gap-2 bg-slate-950/40 border border-white/5 rounded-xl p-3">
                                      <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Saldo Pendiente</span>
                                        <span className="text-sm font-black text-rose-400 font-mono mt-0.5">
                                          ${debt.balance.toLocaleString('es-CO')}
                                        </span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pago Mínimo/Cuota</span>
                                        <span className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                                          ${debt.minPayment.toLocaleString('es-CO')}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col gap-3 bg-slate-950/80 border border-white/10 rounded-xl p-3">
                                      <p className="text-[10px] text-slate-400 font-bold pb-1.5 border-b border-white/5">Editar valores</p>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col gap-1">
                                          <span className="text-[9px] text-slate-400 font-bold">Saldo</span>
                                          <div className="relative font-sans">
                                            <span className="absolute left-2.5 top-1.5 text-slate-500 text-[10px] font-bold">$</span>
                                            <input
                                              type="number"
                                              value={editingDebtBalance}
                                              onChange={(e) => setEditingDebtBalance(e.target.value)}
                                              className="w-full bg-slate-900 border border-white/10 rounded-lg py-1 pl-6 pr-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                          </div>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                          <span className="text-[9px] text-slate-400 font-bold">Cuota/Mínimo</span>
                                          <div className="relative font-sans">
                                            <span className="absolute left-2.5 top-1.5 text-slate-500 text-[10px] font-bold">$</span>
                                            <input
                                              type="number"
                                              value={editingDebtMinPayment}
                                              onChange={(e) => setEditingDebtMinPayment(e.target.value)}
                                              className="w-full bg-slate-900 border border-white/10 rounded-lg py-1 pl-6 pr-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex flex-col gap-1">
                                        <span className="text-[9px] text-slate-400 font-bold">Fecha Vencimiento</span>
                                        <input
                                          type="date"
                                          value={editingDebtDueDate}
                                          onChange={(e) => setEditingDebtDueDate(e.target.value)}
                                          className="w-full bg-slate-900 border border-white/10 rounded-lg py-1 px-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                      </div>

                                      <div className="flex gap-2 mt-1">
                                        <button
                                          type="button"
                                          onClick={() => setEditingDebtId(null)}
                                          className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-lg py-1.5 text-[10px] font-semibold transition-all cursor-pointer border border-white/10"
                                        >
                                          Cancelar
                                        </button>
                                        <button
                                          type="button"
                                          disabled={editingDebtLoading}
                                          onClick={() => handleUpdateDebt(debt.id)}
                                          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg py-1.5 text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                                        >
                                          {editingDebtLoading ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                          ) : (
                                            'Guardar'
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Pie de la tarjeta */}
                                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                                    <span className="font-medium">Fecha de pago programada</span>
                                    <span className="font-bold text-slate-400 font-mono">
                                      {formatDueDateSpanish(debt.dueDate)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* FOOTER GENERAL DE LA APP */}
            <footer className="border-t border-white/5 bg-slate-950/10 py-4 text-center text-[10px] text-slate-600 shrink-0 mt-auto">
              Contabilid-App © 2026 • Diseñado con TypeScript, React y Firebase Firestore
            </footer>
          </main>

          {/* MODAL GLOBAL PARA REGISTRAR NUEVO MOVIMIENTO */}
          <AnimatePresence>
            {showNewTxModal && (
              <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Encabezado del Modal */}
                  <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                    <div>
                      <h4 className="font-black text-white text-sm tracking-wider uppercase flex items-center gap-2">
                        <Plus className="w-4 h-4 text-emerald-400" />
                        Registrar Movimiento
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Ingresa los detalles para registrar un flujo financiero real</p>
                    </div>
                    <button 
                      onClick={() => setShowNewTxModal(false)}
                      className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 rotate-45" />
                    </button>
                  </div>

                  {/* Formulario del Modal */}
                  <form onSubmit={handleCreateNewTx} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    
                    {/* Selector de Tipo (Segmented Control) */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-2 uppercase tracking-wide">Tipo de Movimiento</label>
                      <div className="grid grid-cols-3 gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-white/5">
                        <button
                          type="button"
                          onClick={() => {
                            setNewTxType('expense');
                            setNewTxCategory(categories.expense[0]);
                          }}
                          className={`py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center ${
                            newTxType === 'expense'
                              ? 'bg-red-500/10 border border-red-500/20 text-red-400 shadow-inner'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          Gasto / Egreso
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNewTxType('income');
                            setNewTxCategory(categories.income[0]);
                          }}
                          className={`py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center ${
                            newTxType === 'income'
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-inner'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          Ingreso
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNewTxType('transfer');
                            setNewTxCategory('Transferencia');
                          }}
                          className={`py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center ${
                            newTxType === 'transfer'
                              ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-inner'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          Transferencia
                        </button>
                      </div>
                    </div>

                    {/* Fila: Cuentas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Cuenta Origen / Cuenta */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">
                          {newTxType === 'transfer' ? 'Cuenta de Origen' : 'Cuenta'}
                        </label>
                        <select
                          value={newTxAccountId}
                          onChange={(e) => setNewTxAccountId(e.target.value)}
                          className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                        >
                          {accounts.length === 0 && <option value="">Crear cuenta primero...</option>}
                          {accounts.map(a => (
                            <option key={a.id} value={a.id}>{a.nombre} (${a.saldo.toFixed(2)})</option>
                          ))}
                        </select>
                      </div>

                      {/* Cuenta Destino (solo para Transferencia) */}
                      {newTxType === 'transfer' ? (
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Cuenta de Destino</label>
                          <select
                            value={newTxTargetAccountId}
                            onChange={(e) => setNewTxTargetAccountId(e.target.value)}
                            className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                          >
                            {accounts.length === 0 && <option value="">Crear cuenta primero...</option>}
                            {accounts.map(a => (
                              <option key={a.id} value={a.id}>{a.nombre} (${a.saldo.toFixed(2)})</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        /* Categoría (solo para Ingreso / Gasto) */
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Categoría</label>
                          <select
                            value={newTxCategory}
                            onChange={(e) => setNewTxCategory(e.target.value)}
                            className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                          >
                            {newTxType === 'income' ? (
                              categories.income.map(c => <option key={c} value={c}>{c}</option>)
                            ) : (
                              categories.expense.map(c => <option key={c} value={c}>{c}</option>)
                            )}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Fila: Valor y Fecha */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Monto / Valor ($)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-slate-500 text-xs font-bold">$</span>
                          <input 
                            type="number"
                            step="0.01"
                            required
                            placeholder="0.00"
                            value={newTxAmount}
                            onChange={(e) => setNewTxAmount(e.target.value)}
                            className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 pl-7 pr-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Fecha</label>
                        <input 
                          type="date"
                          required
                          value={newTxDate}
                          onChange={(e) => setNewTxDate(e.target.value)}
                          className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Notas / Descripción */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Notas / Descripción</label>
                      <input 
                        type="text"
                        placeholder={newTxType === 'transfer' ? 'Ej: Traspaso mensual de ahorros' : 'Ej: Compra de supermercado o factura'}
                        value={newTxNotes}
                        onChange={(e) => setNewTxNotes(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Adjunto de factura / Dropzone */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Adjunto (Foto Factura o Recibo)</label>
                      <div className="flex flex-col gap-2">
                        {newTxAttachment ? (
                          <div className="relative w-full aspect-[16/10] bg-slate-950/80 border border-white/10 rounded-xl overflow-hidden group">
                            <img src={newTxAttachment} alt="Adjunto" className="w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2.5 transition-all">
                              <button 
                                type="button"
                                onClick={() => setFullscreenImage(newTxAttachment)}
                                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                type="button" 
                                onClick={() => { setNewTxAttachment(null); setNewTxAttachmentName(''); }}
                                className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-all cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="absolute bottom-2 left-2 right-2 bg-slate-950/95 backdrop-blur px-2.5 py-1.5 rounded-lg text-[9px] text-slate-400 truncate border border-white/5 flex items-center gap-1">
                              <Paperclip className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate">{newTxAttachmentName}</span>
                            </div>
                          </div>
                        ) : (
                          <label className="border border-dashed border-white/15 hover:border-emerald-500/30 bg-slate-950/40 hover:bg-slate-950/60 rounded-xl p-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all">
                            <Paperclip className="w-5 h-5 text-slate-500" />
                            <span className="text-[10px] text-slate-300 font-bold text-center">Subir foto de factura</span>
                            <span className="text-[9px] text-slate-500 font-mono">JPG, PNG (Max 2MB)</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 2 * 1024 * 1024) {
                                    alert('La imagen es demasiado grande. Por favor, suba un archivo menor a 2MB.');
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setNewTxAttachment(reader.result as string);
                                    setNewTxAttachmentName(file.name);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }} 
                              className="hidden" 
                            />
                          </label>
                        )}
                      </div>
                    </div>

                  </form>

                  {/* Acciones del Modal */}
                  <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-3 bg-slate-900/20 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowNewTxModal(false)}
                      className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreateNewTx}
                      disabled={newTxLoading}
                      className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer transition-all"
                    >
                      {newTxLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3px]" />
                          <span>Guardar Movimiento</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* LIGHTBOX DE ADJUNTOS EN FULLSCREEN */}
          <AnimatePresence>
            {fullscreenImage && (
              <div 
                className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4"
                onClick={() => setFullscreenImage(null)}
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img src={fullscreenImage} alt="Factura Completa" className="max-w-full max-h-[75vh] object-contain rounded-xl border border-white/10 shadow-2xl" />
                  <button 
                    onClick={() => setFullscreenImage(null)}
                    className="mt-5 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/10 transition-all cursor-pointer"
                  >
                    Cerrar Vista de Factura
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      )}

    </div>
  );
}
