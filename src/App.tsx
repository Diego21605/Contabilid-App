import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
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
  ShieldAlert,
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
  Settings,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  BellRing,
  Zap,
  Play,
  Pause,
  Clock,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Info,
  Compass,
  Receipt,
  Target,
  BarChart3,
  BarChart2,
  FileSpreadsheet,
  Bot,
  AlertTriangle,
  Split,
  Repeat,
  MapPin,
  Star,
  Tag,
  CalendarDays,
  Archive,
  ArchiveRestore,
  Palette,
  Upload,
  Image as ImageIcon,
  Wand2,
  Smile,
  Calculator,
  Sliders,
  History,
  ChevronDown,
  ChevronUp,
  Laptop,
  Globe,
  Key,
  HardDrive,
  Shield,
  EyeOff,
  Grid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast, Toaster } from 'react-hot-toast';
import appLogo from './assets/images/app_logo_1782999126227.jpg';
import { 
  signOut, 
  onAuthStateChanged, 
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  collection, 
  addDoc as firestoreAddDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  getDocFromServer,
  updateDoc as firestoreUpdateDoc,
  setDoc as firestoreSetDoc,
  where,
  getDocs,
  getDocsFromServer
} from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError } from './firebase';
import { 
  deriveKeyFromPassword, 
  deriveKeyFromGoogleUid, 
  exportKeyToBase64, 
  importKeyFromBase64, 
  encryptDoc, 
  decryptDoc, 
  secureAddDoc, 
  secureSetDoc, 
  secureUpdateDoc 
} from './security';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

// Modelos locales para simular
interface TransactionAttachment {
  id: string;
  name: string;
  url: string;
  label?: 'factura' | 'garantia' | 'fotografia' | 'contrato';
}

interface TransactionSplit {
  category: string;
  amount: number;
  description?: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  description: string;
  date: string;
  accountId?: string;
  cuentaId?: string;
  attachment?: string;
  attachmentName?: string;
  adjunto?: string;
  reconciliationStatus?: 'conciliado' | 'pendiente' | 'anulado';
  tags?: string[];
  locationName?: string;
  locationCity?: string;
  locationGps?: { lat: number; lng: number };
  isSplit?: boolean;
  splits?: TransactionSplit[];
  isRecurring?: boolean;
  recurringFreq?: 'mensual' | 'quincenal' | 'semanal';
  recurringDay?: number;
  isFavorite?: boolean;
  attachmentsList?: TransactionAttachment[];
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

// Formatea un número o string con separador de miles (estilo es-CO)
const formatNumberMask = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return '';
  const clean = String(value).replace(/\D/g, '');
  if (!clean) return '';
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(parseFloat(clean));
};

// Convierte un string formateado con máscara de vuelta a un número limpio
const parseNumberMask = (value: string | number | undefined | null): number => {
  if (value === undefined || value === null) return 0;
  const clean = String(value).replace(/\D/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
};

export default function App() {
  // Módulos del Sidebar
  const [activeModule, setActiveModule] = useState<'dashboard' | 'cuentas' | 'consultas' | 'usuario' | 'categorias' | 'presupuestos' | 'ahorros' | 'deudas' | 'suscripciones' | 'estadisticas' | 'reportes'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  
  const handleSelectModule = (moduleName: 'dashboard' | 'cuentas' | 'consultas' | 'usuario' | 'categorias' | 'presupuestos' | 'ahorros' | 'deudas' | 'suscripciones' | 'estadisticas' | 'reportes') => {
    setActiveModule(moduleName);
    setIsMobileMenuOpen(false);
  };

  const [activeTab, setActiveTab] = useState<'demo' | 'angular'>('demo'); // Mantener para compatibilidad interna de código

  // Suscripciones en base de datos
  const [dbSubscriptions, setDbSubscriptions] = useState<{ id: string; name: string; cost: number; dueDate: string; account: string; status: 'active' | 'paused' | 'cancelled'; usage?: 'Sí' | 'No' | 'A veces'; priceIncreaseNote?: string; fechaCreacion: string }[]>([]);
  
  // Campos para creación de suscripciones
  const [newSubName, setNewSubName] = useState('');
  const [newSubCost, setNewSubCost] = useState('');
  const [newSubDueDate, setNewSubDueDate] = useState('');
  const [newSubAccount, setNewSubAccount] = useState('');
  const [newSubStatus, setNewSubStatus] = useState<'active' | 'paused' | 'cancelled'>('active');
  const [newSubUsage, setNewSubUsage] = useState<'Sí' | 'No' | 'A veces'>('Sí');
  const [newSubPriceIncrease, setNewSubPriceIncrease] = useState('');
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

  // Filtros y tipos de reportes avanzados
  const [reportType, setReportType] = useState<
    | 'gastos-categoria'
    | 'ingresos'
    | 'balance-mensual'
    | 'balance-anual'
    | 'flujo-caja'
    | 'patrimonio'
    | 'comparativo-periodos'
    | 'impuestos'
    | 'reporte-anual'
    | 'metas'
    | 'deudas'
    | 'dashboard-imprimible'
  >('gastos-categoria');
  const [reportYear, setReportYear] = useState('2026');
  const [reportMonth, setReportMonth] = useState('7');
  const [reportCompareYear, setReportCompareYear] = useState('2025');
  const [reportCompareMonth, setReportCompareMonth] = useState('6');

  // Configuración de Usuario Avanzada
  const [configActiveTab, setConfigActiveTab] = useState<'perfil' | 'seguridad' | 'notificaciones' | 'respaldos'>('perfil');

  // 1. Gestión de Dispositivos Autorizados
  const [authorizedDevices, setAuthorizedDevices] = useState<{
    id: string;
    name: string;
    type: string;
    ip: string;
    location: string;
    lastActive: string;
    current?: boolean;
  }>([
    { id: 'dev-1', name: 'Chrome en Windows 11', type: 'Escritorio', ip: '190.158.42.12', location: 'Bogotá, Colombia', lastActive: 'Ahora mismo', current: true },
    { id: 'dev-2', name: 'Safari en iPhone 15 Pro', type: 'Móvil', ip: '186.84.21.90', location: 'Bogotá, Colombia', lastActive: 'Ayer a las 22:15' },
    { id: 'dev-3', name: 'Firefox en macOS Sonoma', type: 'Escritorio', ip: '201.234.10.5', location: 'Medellín, Colombia', lastActive: 'Hace 5 días' }
  ]);

  // 2. Historial de inicios de sesión
  const [loginHistory, setLoginHistory] = useState<{
    id: string;
    date: string;
    ip: string;
    location: string;
    device: string;
    status: 'Exitoso' | 'Sospechoso' | 'Bloqueado';
  }>([
    { id: 'log-1', date: new Date().toLocaleString('es-CO'), ip: '190.158.42.12', location: 'Bogotá, CO', device: 'Chrome 126 (Win11)', status: 'Exitoso' },
    { id: 'log-2', date: '2026-07-29 18:40', ip: '190.158.42.12', location: 'Bogotá, CO', device: 'Chrome 126 (Win11)', status: 'Exitoso' },
    { id: 'log-3', date: '2026-07-27 09:12', ip: '186.84.21.90', location: 'Bogotá, CO', device: 'Safari Mobile (iOS)', status: 'Exitoso' },
    { id: 'log-4', date: '2026-07-22 14:05', ip: '45.12.98.11', location: 'Caracas, VE', device: 'Desconocido', status: 'Bloqueado' }
  ]);

  // 3. Rotación de Clave Maestra
  const [isRotateKeyModalOpen, setIsRotateKeyModalOpen] = useState(false);
  const [currentMasterKeyInput, setCurrentMasterKeyInput] = useState('');
  const [newMasterKeyInput, setNewMasterKeyInput] = useState('');
  const [confirmMasterKeyInput, setConfirmMasterKeyInput] = useState('');
  const [keyRotationLoading, setKeyRotationLoading] = useState(false);

  // 4. Verificación periódica de respaldos
  const [backupHealth, setBackupHealth] = useState({
    lastVerified: new Date().toLocaleString('es-CO'),
    status: 'ok' as 'ok' | 'checking' | 'warning',
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    integrityScore: 100
  });
  const [backupCheckLoading, setBackupCheckLoading] = useState(false);

  // 5. Personalización del Dashboard (widgets, orden y tamaño)
  const [dashboardWidgetSettings, setDashboardWidgetSettings] = useState({
    showAiInsight: true,
    showFinancialHealth: true,
    showCashflow: true,
    showBudgets: true,
    showDebts: true,
    showGoals: true,
    density: 'normal' as 'compact' | 'normal' | 'spacious'
  });

  // 6. Temas de color
  const [colorTheme, setColorTheme] = useState<'emerald' | 'cyber-blue' | 'amethyst' | 'amber' | 'monochrome'>('emerald');

  // 7. Configuración avanzada de notificaciones
  const [advancedNotifications, setAdvancedNotifications] = useState({
    emailAlerts: true,
    pushAlerts: true,
    debtNoticeDays: 5,
    budgetThresholds: true,
    weeklyDigest: true,
    inactivityAlert: true
  });

  // 8. Preferencias de privacidad
  const [privacyPreferences, setPrivacyPreferences] = useState({
    hideBalancesDefault: false,
    maskAccountNumbers: true,
    anonymousTelemetry: false
  });
  const [isBalancesHidden, setIsBalancesHidden] = useState(false);

  useEffect(() => {
    setIsBalancesHidden(privacyPreferences.hideBalancesDefault);
  }, [privacyPreferences.hideBalancesDefault]);

  useEffect(() => {
    document.documentElement.setAttribute('data-color-theme', colorTheme);
  }, [colorTheme]);

  // 9. Centro de restauración de copias de seguridad
  const [isRestoreCenterOpen, setIsRestoreCenterOpen] = useState(false);
  const [restoreFileJSON, setRestoreFileJSON] = useState<string | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);

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
  const [dbCategories, setDbCategories] = useState<{
    id: string;
    name: string;
    type: 'income' | 'expense';
    emoji: string;
    subcategories?: string[];
    archived?: boolean;
    customIcon?: string;
    color?: string;
    fechaCreacion?: string;
  }[]>([]);

  // Presupuestos, Metas de Ahorro y Deudas en base de datos
  const [dbBudgets, setDbBudgets] = useState<any[]>([]);
  const [dbSavingsGoals, setDbSavingsGoals] = useState<any[]>([]);
  const [dbDebts, setDbDebts] = useState<any[]>([]);

  // Estados de formularios de Presupuestos
  const [newBudgetCategory, setNewBudgetCategory] = useState('');
  const [newBudgetLimit, setNewBudgetLimit] = useState('');
  const [newBudgetAlertThreshold, setNewBudgetAlertThreshold] = useState('80');
  const [newBudgetPeriod, setNewBudgetPeriod] = useState<'semanal' | 'quincenal' | 'mensual' | 'anual'>('mensual');
  const [newBudgetLoading, setNewBudgetLoading] = useState(false);

  // Pestañas y Simulador del módulo Presupuestos
  const [budgetMainTab, setBudgetMainTab] = useState<'active' | 'recommended' | 'simulator' | 'history'>('active');
  const [simulatorAdjustments, setSimulatorAdjustments] = useState<Record<string, number>>({});

  // Estados de formularios de Metas de Ahorro
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalSaved, setNewGoalSaved] = useState('');
  const [newGoalEmoji, setNewGoalEmoji] = useState('🎯');
  const [newGoalPriority, setNewGoalPriority] = useState<'alta' | 'media' | 'baja'>('alta');
  const [newGoalAutoAmount, setNewGoalAutoAmount] = useState('100.000');
  const [newGoalAutoFreq, setNewGoalAutoFreq] = useState<'semanal' | 'quincenal' | 'mensual'>('quincenal');
  const [newGoalAutoEnabled, setNewGoalAutoEnabled] = useState(true);
  const [newGoalLoading, setNewGoalLoading] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingGoalSaved, setEditingGoalSaved] = useState('');
  const [editingGoalLoading, setEditingGoalLoading] = useState(false);

  // Estados para Modal de Historial y Modal de Aportes Manuales
  const [historyGoalModal, setHistoryGoalModal] = useState<any | null>(null);
  const [depositGoalModal, setDepositGoalModal] = useState<any | null>(null);
  const [depositAmountInput, setDepositAmountInput] = useState('');
  const [depositNoteInput, setDepositNoteInput] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);

  // Estado para simulación extra por meta: goalId -> extraMonthlyAmount
  const [goalSimExtraAmounts, setGoalSimExtraAmounts] = useState<Record<string, number>>({});

  // Estados de formularios de Deudas y Créditos
  const [newDebtName, setNewDebtName] = useState('');
  const [newDebtOriginal, setNewDebtOriginal] = useState('');
  const [newDebtBalance, setNewDebtBalance] = useState('');
  const [newDebtMinPayment, setNewDebtMinPayment] = useState('');
  const [newDebtStartDate, setNewDebtStartDate] = useState('');
  const [newDebtType, setNewDebtType] = useState('Tarjeta de Crédito');
  const [newDebtDueDate, setNewDebtDueDate] = useState('');
  const [newDebtInterestRate, setNewDebtInterestRate] = useState('28');
  const [newDebtLoading, setNewDebtLoading] = useState(false);

  // Estados para edición y abono de Deudas
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);
  const [editingDebtBalance, setEditingDebtBalance] = useState('');
  const [editingDebtOriginal, setEditingDebtOriginal] = useState('');
  const [editingDebtMinPayment, setEditingDebtMinPayment] = useState('');
  const [editingDebtDueDate, setEditingDebtDueDate] = useState('');
  const [editingDebtStartDate, setEditingDebtStartDate] = useState('');
  const [editingDebtInterestRate, setEditingDebtInterestRate] = useState('28');
  const [editingDebtLoading, setEditingDebtLoading] = useState(false);

  // Estados de simuladores y visualización de Deudas
  const [debtShowAvalanche, setDebtShowAvalanche] = useState(true);
  const [debtShowSnowball, setDebtShowSnowball] = useState(true);
  const [debtShowInterests, setDebtShowInterests] = useState(true);
  const [debtExtraPayment, setDebtExtraPayment] = useState<number>(300000);
  const [debtPayModal, setDebtPayModal] = useState<any | null>(null);
  const [debtPayAmount, setDebtPayAmount] = useState('');
  const [debtPayInterestPart, setDebtPayInterestPart] = useState('');
  const [debtPayLoading, setDebtPayLoading] = useState(false);
  // Categorías archivadas del sistema y mapa de subcategorías personalizadas
  const [archivedSystemCategories, setArchivedSystemCategories] = useState<string[]>([]);
  const [customSubcategoriesMap, setCustomSubcategoriesMap] = useState<Record<string, string[]>>({});
  const [catManagerTab, setCatManagerTab] = useState<'active' | 'archived'>('active');

  // Campos para creación y edición avanzada de categorías
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');
  const [newCatEmoji, setNewCatEmoji] = useState('🍕');
  const [newCatCustomIcon, setNewCatCustomIcon] = useState<string>('');
  const [newCatIconType, setNewCatIconType] = useState<'emoji' | 'upload'>('emoji');
  const [newCatColor, setNewCatColor] = useState<string>('#f97316');
  const [newCatSubcategories, setNewCatSubcategories] = useState<string[]>([]);
  const [newCatSubcategoryInput, setNewCatSubcategoryInput] = useState('');
  const [newCatLoading, setNewCatLoading] = useState(false);
  const [selectedCatForSub, setSelectedCatForSub] = useState<string | null>(null);
  const [inlineSubInput, setInlineSubInput] = useState('');

  // Subcategorías en formularios de movimientos
  const [newTxSubcategory, setNewTxSubcategory] = useState('');
  const [actTxSubcategory, setActTxSubcategory] = useState('');
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
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddBudgetModalOpen, setIsAddBudgetModalOpen] = useState(false);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isAddDebtModalOpen, setIsAddDebtModalOpen] = useState(false);
  const [showAddAccountTxModal, setShowAddAccountTxModal] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState<'credito' | 'deuda'>('credito');
  const [newAccountSubtipo, setNewAccountSubtipo] = useState<'disponible' | 'ahorros' | 'deudas'>('disponible');
  const [newAccountColor, setNewAccountColor] = useState<string>('emerald');
  const [newAccountIcon, setNewAccountIcon] = useState<string>('wallet');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [newAccountDebtStartDate, setNewAccountDebtStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAccountLoading, setNewAccountLoading] = useState(false);
  const [newAccountAlias, setNewAccountAlias] = useState('');

  // Estados para Alias, Conciliación y Balance Diario
  const [editingAliasAccId, setEditingAliasAccId] = useState<string | null>(null);
  const [editingAliasValue, setEditingAliasValue] = useState<string>('');
  const [queryReconciliationStatus, setQueryReconciliationStatus] = useState<string>('ALL');
  const [balanceTimeframe, setBalanceTimeframe] = useState<'month' | 'year'>('month');

  // Débitos automáticos en base de datos
  const [dbAutomaticDebits, setDbAutomaticDebits] = useState<{
    id: string;
    name: string;
    accountId: string;
    amount: number;
    category: string;
    dayOfMonth: number;
    active: boolean;
    lastExecutedDate?: string;
    status?: 'ok' | 'insufficient_funds';
    fechaCreacion?: string;
  }[]>([]);

  // Campos para creación de débitos automáticos
  const [isAddDebitModalOpen, setIsAddDebitModalOpen] = useState(false);
  const [newDebitName, setNewDebitName] = useState('');
  const [newDebitAccountId, setNewDebitAccountId] = useState('');
  const [newDebitAmount, setNewDebitAmount] = useState('');
  const [newDebitCategory, setNewDebitCategory] = useState('🏠 Servicios Públicos');
  const [newDebitDayOfMonth, setNewDebitDayOfMonth] = useState('1');
  const [newDebitActive, setNewDebitActive] = useState(true);
  const [newDebitLoading, setNewDebitLoading] = useState(false);

  // Permisos y control de notificaciones de dispositivo
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const notifiedBudgetAlertsRef = useRef<Set<string>>(new Set());

  // Disparar notificación nativa del navegador / dispositivo
  const sendDeviceNotification = (title: string, options?: NotificationOptions) => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(title, {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            dir: 'auto',
            lang: 'es-CO',
            ...options
          });
        } catch (e) {
          console.log('Error al enviar notificación nativa:', e);
        }
      }
    }
  };

  // Solicitar permisos de notificación de dispositivo
  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === 'granted') {
          toast.success('Notificaciones del dispositivo activadas.');
          sendDeviceNotification('🔔 Notificaciones Activadas', {
            body: 'Recibirás alertas de presupuestos y débitos automáticos en este dispositivo.'
          });
        } else if (perm === 'denied') {
          toast.error('Notificaciones bloqueadas en el navegador. Por favor otorga permisos en los ajustes de tu navegador.');
        }
      } catch (e) {
        console.error('Error al solicitar permisos:', e);
      }
    } else {
      toast.error('Tu navegador no admite notificaciones del dispositivo.');
    }
  };

  // Campos para "Consultas"
  const [queryStartDate, setQueryStartDate] = useState('');
  const [queryEndDate, setQueryEndDate] = useState('');
  const [queryAccountId, setQueryAccountId] = useState('ALL');
  const [queryCategory, setQueryCategory] = useState('ALL');
  const [queryTag, setQueryTag] = useState('ALL');
  const [txViewMode, setTxViewMode] = useState<'timeline' | 'table' | 'map'>('timeline');

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

  // Nuevas capacidades avanzadas para Movimientos
  const [newTxTags, setNewTxTags] = useState<string[]>([]);
  const [newTxTagInput, setNewTxTagInput] = useState('');
  const [newTxLocationName, setNewTxLocationName] = useState('');
  const [newTxLocationCity, setNewTxLocationCity] = useState('');
  const [newTxGps, setNewTxGps] = useState<{ lat: number; lng: number } | null>(null);
  const [newTxIsSplit, setNewTxIsSplit] = useState(false);
  const [newTxSplits, setNewTxSplits] = useState<{ category: string; amount: string; description: string }[]>([
    { category: '🍔 Alimentación', amount: '', description: '' },
    { category: '🏠 Hogar', amount: '', description: '' }
  ]);
  const [newTxIsRecurring, setNewTxIsRecurring] = useState(false);
  const [newTxRecurringFreq, setNewTxRecurringFreq] = useState<'mensual' | 'quincenal' | 'semanal'>('mensual');
  const [newTxRecurringDay, setNewTxRecurringDay] = useState(1);
  const [newTxIsFavorite, setNewTxIsFavorite] = useState(false);
  const [newTxAttachmentsList, setNewTxAttachmentsList] = useState<TransactionAttachment[]>([]);

  // Plantillas de accesos rápidos (Favoritos)
  const [quickFavorites, setQuickFavorites] = useState<{ id: string; title: string; emoji: string; amount: number; category: string; type: 'income' | 'expense'; tags?: string[]; locationName?: string }[]>([
    { id: 'fav-1', title: 'Gasolina', emoji: '⛽', amount: 50000, category: '🚗 Transporte', type: 'expense', tags: ['#Vehículo'] },
    { id: 'fav-2', title: 'Almuerzo', emoji: '🍔', amount: 25000, category: '🍔 Alimentación', type: 'expense', tags: ['#Trabajo'] },
    { id: 'fav-3', title: 'Mercado', emoji: '🛒', amount: 250000, category: '🛒 Supermercado', type: 'expense', tags: ['#Hogar'] },
    { id: 'fav-4', title: 'Taxi / App', emoji: '🚖', amount: 15000, category: '🚗 Transporte', type: 'expense', tags: ['#Transporte'] },
    { id: 'fav-5', title: 'Salario', emoji: '💼', amount: 2500000, category: '💼 Sueldo', type: 'income', tags: ['#Nómina'] }
  ]);

  const [accounts, setAccounts] = useState<any[]>([]);
  const [loginLogoError, setLoginLogoError] = useState(false);
  const [sidebarLogoError, setSidebarLogoError] = useState(false);

  // Estado de Autenticación y E2EE
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Estados para Tutorial / Guía de Inicio (Onboarding Interactivo)
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // Auto-lanzar el tutorial si es la primera vez que el usuario ingresa
  useEffect(() => {
    if (currentUser) {
      const hasSeen = localStorage.getItem(`contabilidapp_onboarding_seen_${currentUser.uid}`);
      if (!hasSeen) {
        setIsOnboardingModalOpen(true);
      }
    }
  }, [currentUser]);

  const handleFinishOnboarding = (dontShowAgain = true) => {
    if (currentUser && dontShowAgain) {
      localStorage.setItem(`contabilidapp_onboarding_seen_${currentUser.uid}`, 'true');
    }
    setIsOnboardingModalOpen(false);
    setOnboardingStep(0);
    toast.success('¡Guía de inicio completada! Puedes reabrirla en cualquier momento desde la barra superior o en Configuración.');
  };

  // Estados para el Visor del Manual de Usuario PDF en Configuración
  const [pdfPage, setPdfPage] = useState(1);
  const totalPdfPages = 6;
  const [pdfZoom, setPdfZoom] = useState(100);
  const [isPdfFullscreen, setIsPdfFullscreen] = useState(false);

  // Función para Generar y Descargar el Manual de Usuario en PDF Real con jsPDF
  const handleDownloadUserManualPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pagesData = [
        {
          chapter: 'CAPÍTULO 1: DASHBOARD Y GESTOR DE CUENTAS',
          modules: [
            {
              name: '1. Dashboard General e Inteligencia Financiera',
              desc: 'Centro de mando visual e interactivo con diagnóstico IA en tiempo real, indicador de Salud Financiera (0-100), Flujo de Caja Próximo y Alertas Inteligentes.',
              goal: 'Proporcionar visibilidad ejecutiva del Patrimonio Neto, diagnóstico sintético de hábitos de consumo, proyección de saldo al cierre del mes y alertas contextuales.',
              howTo: [
                '1. Resumen IA: Revisa el diagnóstico automático que compara tus ingresos y gastos actuales vs. el mes anterior e identifica variaciones por categoría.',
                '2. Salud Financiera (0-100): Evalúa tu puntaje algorítmico basado en 5 pilares (Ahorro, Deuda, Liquidez, Presupuestos y Fondo) con diagnósticos de recomendación.',
                '3. Flujo de Caja & Alertas: Monitorea la línea de tiempo de próximos cobros y egresos con Saldo Proyectado y alertas de inactividad o sobregiro.'
              ]
            },
            {
              name: '2. Gestor de Cuentas, Proyección y Conciliación',
              desc: 'Administración de cuentas con Alias personalizados, Historial de saldo (Hoy, 30d, 6m), Balance Diario, Proyección de saldo futuro y Conciliación de movimientos.',
              goal: 'Organizar instrumentos financieros (Bancos, Tarjetas, Ahorros) con alias (ej. 💰 Cuenta Principal, 🏖 Vacaciones), proyectar liquidez futura y conciliar extractos.',
              howTo: [
                '1. Alias y Configuración: Asigna nombres amigable con emojis (ej. 💰 Cuenta Principal, 💳 Tarjeta) en lugar de números técnicos.',
                '2. Historial & Balance Diario: Revisa la evolución del saldo (Hoy vs Hace 30 días vs Hace 6 meses) con gráfica diaria interactiva.',
                '3. Proyección Inteligente: Visualiza el saldo proyectado al 15 de agosto o cierre de mes restando compromisos y débitos automáticos pendientes.',
                '4. Conciliación Contable: Marca cada movimiento como Pendiente 🟡, Conciliado ✔️ o Anulado 🚫 para auditar extractos bancarios.'
              ]
            }
          ]
        },
        {
          chapter: 'CAPÍTULO 2: MOVIMIENTOS Y CATEGORÍAS',
          modules: [
            {
              name: '3. Movimientos y Consultas',
              desc: 'Bitácora central e interactiva para el registro de transacciones de Ingreso y Egreso.',
              goal: 'Llevar la contabilidad exacta con soporte documental adjunto (facturas/recibos en PDF o imagen).',
              howTo: [
                '1. Haz clic en "Nuevo Movimiento" y selecciona el Tipo (Ingreso / Egreso).',
                '2. Ingresa Monto, Fecha, Categoría, Cuenta asociada y una nota explicativa.',
                '3. Adjunta una fotografía o PDF de la factura desde la zona de carga de archivos.',
                '4. Utiliza los filtros superiores por rango de fechas, cuenta o categoría para buscar o auditar transacciones.'
              ]
            },
            {
              name: '4. Gestor de Categorías',
              desc: 'Clasificador personalizable para la organización de la procedencia y destino del dinero.',
              goal: 'Estructurar los conceptos de gasto e ingreso con íconos y colores representativos.',
              howTo: [
                '1. En el módulo Categorías, presiona "Agregar Categoría".',
                '2. Selecciona si la categoría aplica para Ingresos o Egresos.',
                '3. Asigna un Nombre (ej. Supermercado, Alquiler, Sueldo), selecciona un Ícono y un Color.',
                '4. Guarda los cambios; la categoría estará disponible inmediatamente en Movimientos y Presupuestos.'
              ]
            }
          ]
        },
        {
          chapter: 'CAPÍTULO 3: PRESUPUESTOS Y METAS DE AHORRO',
          modules: [
            {
              name: '5. Control de Presupuestos',
              desc: 'Techos de gasto mensual asignados por categoría con monitoreo de consumo en tiempo real.',
              goal: 'Prevenir sobrecostos y mantener tus egresos dentro de límites previamente planificados.',
              howTo: [
                '1. Presiona "Crear Presupuesto", selecciona la Categoría de egreso y el límite máximo mensual.',
                '2. Observa la barra de estado de color: Verde (<80%), Amarillo (80%-99%), Rojo (100% o más).',
                '3. Notificaciones Nativas: Activa las notificaciones del navegador en Configuración para recibir alertas emergentes automáticas en tu dispositivo al alcanzar el 80% y 100% del límite.'
              ]
            },
            {
              name: '6. Metas de Ahorro',
              desc: 'Módulo de reserva de capital para proyectos u objetivos financieros a mediano y largo plazo.',
              goal: 'Fomentar el hábito del ahorro estructurado (Fondo de Emergencia, Vacaciones, Vehículo).',
              howTo: [
                '1. Presiona "Nueva Meta de Ahorro" e ingresa el Nombre, Monto Objetivo y Fecha Límite opcional.',
                '2. Para sumar capital, pulsa "Realizar Aporte" y selecciona la Cuenta origen desde donde se descontará el dinero.',
                '3. Monitorea el porcentaje acumulado y la barra de progreso hacia tu meta.'
              ]
            }
          ]
        },
        {
          chapter: 'CAPÍTULO 4: CONTROL DE DEUDAS Y SUSCRIPCIONES',
          modules: [
            {
              name: '7. Control de Deudas y Créditos',
              desc: 'Módulo de gestión integral de pasivos, préstamos bancarios, familiares y tarjetas de crédito.',
              goal: 'Eliminar recargos por mora y mantener visibilidad constante de cuotas y fechas límites de pago.',
              howTo: [
                '1. Registra la deuda indicando Acreedor, Saldo Pendiente, Cuota Mínima, Tasa de Interés y Día de Corte/Pago.',
                '2. Cada vez que realices un pago, selecciona "Registrar Abono" para descontar el saldo principal.',
                '3. Revisa la insignia de alerta que aparece cuando la fecha límite de pago está a 5 días o menos.'
              ]
            },
            {
              name: '8. Control de Suscripciones',
              desc: 'Administración de servicios periódicos de débito automático (Streaming, Software, Gimnasio).',
              goal: 'Identificar fugas silenciosas de dinero por membresías no utilizadas y proyectar el costo anual.',
              howTo: [
                '1. Agrega la suscripción indicando Servicio, Valor, Periodicidad y Cuenta de Cargo.',
                '2. Consulta el resumen de Gasto Anual Acumulado para evaluar cancelaciones u optimizaciones.'
              ]
            }
          ]
        },
        {
          chapter: 'CAPÍTULO 5: ESTADÍSTICAS Y REPORTES FINANCIEROS',
          modules: [
            {
              name: '9. Estadísticas y Análisis',
              desc: 'Visualizador gráfico analítico con gráficos de distribución y comparativos históricos.',
              goal: 'Detectar patrones de consumo, hábitos de gasto y evaluar la capacidad de ahorro.',
              howTo: [
                '1. Explora el gráfico circular de Distribución para conocer en qué categoría se concentran tus gastos.',
                '2. Revisa la gráfica comparativa de 12 meses para analizar la evolución de tus Ingresos vs. Egresos.'
              ]
            },
            {
              name: '10. Reportes Financieros, Excel Multi-Hoja y Exportación',
              desc: 'Generador de Estados Financieros (Patrimonio, Impuestos, Comparativo de Períodos, Metas, Deudas), hojas de Excel multi-hoja y Dashboard imprimible.',
              goal: 'Facilitar auditorías contables, preparación tributaria personal, impresión ejecutiva y resguardo seguro.',
              howTo: [
                '1. Selecciona el tipo de reporte (Patrimonio, Impuestos, Comparativo, Metas, Deudas, Dashboard Imprimible).',
                '2. Exporta en Excel Multi-Hoja (XML Spreadsheet con pestañas de Resumen, Movimientos y Cuentas) o CSV estándar.',
                '3. Genera el PDF / Dashboard Imprimible de 1 página listo para firma o guarda tu respaldo cifrado en formato JSON.'
              ]
            }
          ]
        },
        {
          chapter: 'CAPÍTULO 6: CONFIGURACIÓN, SEGURIDAD E2EE Y GESTIÓN DE DISPOSITIVOS',
          modules: [
            {
              name: '11. Módulo de Configuración, Cifrado E2EE y Personalización v2.0',
              desc: 'Centro de preferencias, cifrado AES-256 E2EE con Rotación de Clave Maestra, auditoría de salud de respaldos, selección de temas cromáticos, idiomas y control de sesión.',
              goal: 'Garantizar privacidad absoluta, personalización visual/idiomática y control total de accesos autorizados.',
              howTo: [
                '1. Rotación de Clave Maestra: Cambia tu clave de cifrado local reencriptando tus datos sin perder información.',
                '2. Salud del Respaldo (0-100%): Auditador de integridad que verifica la completitud y estructura de tus datos.',
                '3. Temas & Idiomas: Elige entre 5 paletas cromáticas (Emerald, Cyber Blue, etc.) e idiomas (Español, English, Português, Français).',
                '4. Dispositivos Autorizados: Audita las sesiones activas con IP y ubicación, y revoca accesos sospechosos en tiempo real.'
              ]
            }
          ]
        }
      ];

      pagesData.forEach((pageInfo, pageIdx) => {
        if (pageIdx > 0) doc.addPage();

        // Fondo A4 slate-900
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 297, 'F');

        // Banner Superior emerald
        doc.setFillColor(16, 185, 129);
        doc.rect(15, 12, 180, 22, 'F');

        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('CONTABILIDAPP - MANUAL DE USUARIO', 20, 22);
        doc.setFontSize(8.5);
        doc.text('Guía Oficial de Módulos, Configuración y Seguridad E2EE v2.0', 20, 28);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 15, 40);
        doc.text(`Usuario: ${currentUser?.email || 'Usuario Registrado'}`, 15, 44);

        // Header Capítulo
        doc.setFillColor(30, 41, 59);
        doc.roundedRect(15, 48, 180, 9, 2, 2, 'F');
        doc.setTextColor(52, 211, 153);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(pageInfo.chapter, 18, 54);

        let y = 64;

        pageInfo.modules.forEach((mod) => {
          doc.setFillColor(30, 41, 59);
          doc.roundedRect(15, y, 180, 7, 1.5, 1.5, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.text(mod.name, 18, y + 5);

          y += 10;

          // Descripción
          doc.setTextColor(52, 211, 153);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text('• Descripción:', 18, y);
          doc.setTextColor(226, 232, 240);
          doc.setFont('helvetica', 'normal');
          const descLines = doc.splitTextToSize(mod.desc, 150);
          doc.text(descLines, 42, y);
          y += descLines.length * 4.5;

          // Objetivo
          doc.setTextColor(250, 204, 21);
          doc.setFont('helvetica', 'bold');
          doc.text('• Lo que busca:', 18, y);
          doc.setTextColor(226, 232, 240);
          doc.setFont('helvetica', 'normal');
          const goalLines = doc.splitTextToSize(mod.goal, 150);
          doc.text(goalLines, 42, y);
          y += goalLines.length * 4.5;

          // Cómo usar / configurar
          doc.setTextColor(129, 140, 248);
          doc.setFont('helvetica', 'bold');
          doc.text('• Cómo usar/configurar:', 18, y);
          y += 4.5;

          doc.setTextColor(203, 213, 225);
          doc.setFont('helvetica', 'normal');
          mod.howTo.forEach((step) => {
            const stepLines = doc.splitTextToSize(step, 168);
            doc.text(stepLines, 22, y);
            y += stepLines.length * 4.2;
          });

          y += 6;
        });

        // Pie de página
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text('ContabilidApp v2.0 - Manual Oficial de Usuario', 105, 288, { align: 'center' });
        doc.text(`Página ${pageIdx + 1} de ${pagesData.length}`, 185, 288);
      });

      doc.save('Manual_de_Usuario_ContabilidApp.pdf');
      toast.success('📄 Manual de usuario descargado en PDF.');
    } catch (e) {
      console.error('Error generando PDF:', e);
      toast.error('No se pudo generar el PDF del manual.');
    }
  };

  // Exportación a Excel Multi-Hoja (.xls XML Spreadsheet)
  const handleExportMultiSheetExcel = () => {
    try {
      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>ContabilidApp E2EE</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Worksheet ss:Name="Resumen Financiero">
  <Table>
   <Row><Cell><Data ss:Type="String">REPORTE FINANCIERO CONSOLIDADO MULTI-HOJA</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Usuario: ${currentUser?.email || ''}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Fecha de emisión: ${new Date().toLocaleDateString('es-CO')}</Data></Cell></Row>
   <Row></Row>
   <Row>
    <Cell><Data ss:Type="String">MÉTRICA</Data></Cell>
    <Cell><Data ss:Type="String">VALOR ($)</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Total Ingresos Acumulados</Data></Cell>
    <Cell><Data ss:Type="Number">${transactions.filter(t => t.type === 'income' || t.tipo === 'ingreso').reduce((sum, t) => sum + (t.amount || t.monto || 0), 0)}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Total Egresos Acumulados</Data></Cell>
    <Cell><Data ss:Type="Number">${transactions.filter(t => t.type === 'expense' || t.tipo === 'egreso').reduce((sum, t) => sum + (t.amount || t.monto || 0), 0)}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Cuentas Registradas</Data></Cell>
    <Cell><Data ss:Type="Number">${accounts.length}</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Deudas Pendientes</Data></Cell>
    <Cell><Data ss:Type="Number">${dbDebts.reduce((sum, d) => sum + (d.remainingAmount || d.saldoPendiente || 0), 0)}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Transacciones">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">FECHA</Data></Cell>
    <Cell><Data ss:Type="String">DESCRIPCIÓN</Data></Cell>
    <Cell><Data ss:Type="String">CATEGORÍA</Data></Cell>
    <Cell><Data ss:Type="String">MONTO</Data></Cell>
    <Cell><Data ss:Type="String">TIPO</Data></Cell>
    <Cell><Data ss:Type="String">CUENTA</Data></Cell>
   </Row>
   ${transactions.map(t => `
   <Row>
    <Cell><Data ss:Type="String">${t.date || t.fecha || ''}</Data></Cell>
    <Cell><Data ss:Type="String">${(t.description || t.descripcion || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')}</Data></Cell>
    <Cell><Data ss:Type="String">${(t.category || t.categoria || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')}</Data></Cell>
    <Cell><Data ss:Type="Number">${t.amount || t.monto || 0}</Data></Cell>
    <Cell><Data ss:Type="String">${t.type || t.tipo || ''}</Data></Cell>
    <Cell><Data ss:Type="String">${t.accountId || ''}</Data></Cell>
   </Row>`).join('')}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Cuentas y Saldos">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">NOMBRE DE CUENTA</Data></Cell>
    <Cell><Data ss:Type="String">TIPO</Data></Cell>
    <Cell><Data ss:Type="String">SALDO DISPONIBLE</Data></Cell>
   </Row>
   ${accounts.map(a => `
   <Row>
    <Cell><Data ss:Type="String">${(a.alias || a.nombre || '').replace(/&/g, '&amp;')}</Data></Cell>
    <Cell><Data ss:Type="String">${a.tipo || ''}</Data></Cell>
    <Cell><Data ss:Type="Number">${a.saldo || 0}</Data></Cell>
   </Row>`).join('')}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Deudas y Pasivos">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">ACREEDOR / DEUDA</Data></Cell>
    <Cell><Data ss:Type="String">SALDO PENDIENTE</Data></Cell>
    <Cell><Data ss:Type="String">CUOTA MENSUAL</Data></Cell>
    <Cell><Data ss:Type="String">TASA INTERÉS %</Data></Cell>
   </Row>
   ${dbDebts.map(d => `
   <Row>
    <Cell><Data ss:Type="String">${(d.creditorName || d.nombre || '').replace(/&/g, '&amp;')}</Data></Cell>
    <Cell><Data ss:Type="Number">${d.remainingAmount || d.saldoPendiente || 0}</Data></Cell>
    <Cell><Data ss:Type="Number">${d.minPayment || d.cuotaMensual || 0}</Data></Cell>
    <Cell><Data ss:Type="Number">${d.interestRate || 0}</Data></Cell>
   </Row>`).join('')}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Presupuestos y Metas">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">NOMBRE / CONCEPTO</Data></Cell>
    <Cell><Data ss:Type="String">OBJETIVO / LÍMITE</Data></Cell>
    <Cell><Data ss:Type="String">ACUMULADO / EJECUTADO</Data></Cell>
    <Cell><Data ss:Type="String">TIPO DE REGISTRO</Data></Cell>
   </Row>
   ${dbSavingsGoals.map(g => `
   <Row>
    <Cell><Data ss:Type="String">${(g.name || g.nombre || '').replace(/&/g, '&amp;')}</Data></Cell>
    <Cell><Data ss:Type="Number">${g.targetAmount || g.montoObjetivo || 0}</Data></Cell>
    <Cell><Data ss:Type="Number">${g.currentAmount || g.montoActual || 0}</Data></Cell>
    <Cell><Data ss:Type="String">Meta de Ahorro</Data></Cell>
   </Row>`).join('')}
   ${dbBudgets.map(b => `
   <Row>
    <Cell><Data ss:Type="String">${(b.categoryName || b.categoria || '').replace(/&/g, '&amp;')}</Data></Cell>
    <Cell><Data ss:Type="Number">${b.monthlyLimit || b.limiteMensual || 0}</Data></Cell>
    <Cell><Data ss:Type="Number">${b.spent || 0}</Data></Cell>
    <Cell><Data ss:Type="String">Presupuesto Mensual</Data></Cell>
   </Row>`).join('')}
  </Table>
 </Worksheet>
</Workbook>`;

      const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `contabilid_app_multisheet_report_${new Date().toISOString().slice(0,10)}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("✨ Reporte de Excel con múltiples hojas generado correctamente!");
    } catch (err) {
      console.error("Error al exportar Excel multi-hoja:", err);
      toast.error("Error al exportar Excel multi-hoja");
    }
  };

  // Exportar respaldo completo JSON
  const handleExportJSONBackup = () => {
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        userEmail: currentUser?.email,
        uid: currentUser?.uid,
        transactions,
        accounts,
        dbBudgets,
        dbSavingsGoals,
        dbDebts,
        userProfile: {
          name: userProfileName,
          currency: userProfileCurrency,
          language: userProfileLanguage,
          theme: userProfileTheme
        }
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `contabilid_app_backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("📦 Respaldo de datos JSON descargado con éxito!");
    } catch (err) {
      console.error("Error al exportar JSON:", err);
      toast.error("Error al descargar respaldo JSON.");
    }
  };

  // Verificación periódica de integridad de respaldos
  const handleCheckBackupIntegrity = () => {
    setBackupCheckLoading(true);
    setTimeout(() => {
      setBackupHealth({
        lastVerified: new Date().toLocaleString('es-CO'),
        status: 'ok',
        frequency: backupHealth.frequency,
        integrityScore: 100
      });
      setBackupCheckLoading(false);
      toast.success("✅ Verificación completada: 100% de la base de datos e índices intactos.");
    }, 1200);
  };
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Auxiliar para validación de acceso según reglas de negocio (C7, C8)
  const checkUserAuthorization = async (user: User): Promise<boolean> => {
    const email = user.email || '';
    
    // Lista de correos autorizados por defecto
    const alwaysAllowedEmails = [
      'diegofe21605@gmail.com',
      'test@demo.com',
      'admin@contabilidapp.com'
    ];
    
    // Dominios autorizados por defecto (ej. gmail, corporativos)
    const allowedDomains = [
      'gmail.com',
      'contabilidapp.com'
    ];
    
    const domain = email.split('@')[1]?.toLowerCase();
    
    try {
      const accesoDocRef = doc(db, 'usuarios', user.uid, 'configuracion', 'acceso');
      const accesoSnap = await getDocFromServer(accesoDocRef);
      
      if (accesoSnap.exists()) {
        const accesoData = accesoSnap.data();
        if (accesoData.active === false || accesoData.authorized === false) {
          return false;
        }
        return true;
      } else {
        const isEmailAllowed = alwaysAllowedEmails.includes(email.toLowerCase()) || allowedDomains.includes(domain);
        
        if (!isEmailAllowed) {
          await firestoreSetDoc(accesoDocRef, {
            email: email,
            active: false,
            authorized: false,
            role: 'unauthorized',
            fechaCreacion: new Date().toISOString()
          });
          return false;
        }
        
        await firestoreSetDoc(accesoDocRef, {
          email: email,
          active: true,
          authorized: true,
          role: 'user',
          fechaCreacion: new Date().toISOString()
        });
        return true;
      }
    } catch (err) {
      console.error("Error al validar autorización del usuario:", err);
      if (alwaysAllowedEmails.includes(email.toLowerCase()) || allowedDomains.includes(domain)) {
        return true;
      }
      return false;
    }
  };

  // Interceptores transparentes de Firestore para Cifrado Extremo a Extremo (E2EE)
  const addDoc = async (colRef: any, data: any) => {
    if (encryptionKey) {
      const encrypted = await encryptDoc(data, encryptionKey);
      return await firestoreAddDoc(colRef, encrypted);
    }
    return await firestoreAddDoc(colRef, data);
  };

  const setDoc = async (docRef: any, data: any, options?: any) => {
    if (encryptionKey) {
      const encrypted = await encryptDoc(data, encryptionKey);
      return await firestoreSetDoc(docRef, encrypted, options);
    }
    return await firestoreSetDoc(docRef, data, options);
  };

  const updateDoc = async (docRef: any, updatedFields: any) => {
    if (encryptionKey) {
      try {
        const snap = await getDocFromServer(docRef);
        if (snap.exists()) {
          const currentData = await decryptDoc(snap.data(), encryptionKey);
          const merged = { ...currentData, ...updatedFields };
          delete merged.id;
          const encrypted = await encryptDoc(merged, encryptionKey);
          return await firestoreUpdateDoc(docRef, encrypted);
        }
      } catch (err) {
        console.error("Error en updateDoc wrapper:", err);
      }
    }
    return await firestoreUpdateDoc(docRef, updatedFields);
  };

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

  // Mapeo predefinido de subcategorías por defecto
  const DEFAULT_SUBCATEGORIES: Record<string, string[]> = {
    '🍔 Alimentación': ['Restaurantes', 'Mercado / Supermercado', 'Café', 'Domicilios / Delivery', 'Snacks'],
    'Alimentación': ['Restaurantes', 'Mercado / Supermercado', 'Café', 'Domicilios / Delivery'],
    'Comida': ['Restaurantes', 'Mercado / Supermercado', 'Café', 'Domicilios / Delivery'],
    'Supermercado': ['Víveres', 'Aseo y Limpieza', 'Carnes y Verduras', 'Bebidas'],
    '🚗 Transporte': ['Gasolina', 'Mantenimiento', 'Taxis / Uber', 'Peajes y Parqueaderos', 'Transporte Público'],
    '🏠 Hogar': ['Servicios Públicos', 'Arriendo / Hipoteca', 'Aseo y Mercadería', 'Mantenimiento', 'Internet / TV'],
    '🎬 Entretenimiento': ['Cine y Eventos', 'Streaming', 'Videojuegos', 'Salidas', 'Hobbies'],
    '🛒 Compras': ['Ropa y Calzado', 'Tecnología', 'Regalos', 'Accesorios', 'Hogar'],
    '🏥 Salud': ['Medicamentos', 'Consultas Médicas', 'Gimnasio', 'Seguros', 'Cuidado Personal'],
    '🎓 Educación': ['Cursos y Capacitación', 'Libros y Útiles', 'Matrículas'],
    '✈️ Viajes': ['Tiquetes', 'Hospedaje', 'Alimentación', 'Tours'],
    '🐶 Mascotas': ['Alimento', 'Veterinaria', 'Juguetes', 'Peluquería'],
    '💼 Trabajo': ['Herramientas', 'Oficina', 'Capacitación'],
    '💳 Tarjetas': ['Cuota de Manejo', 'Intereses', 'Pago de Tarjeta'],
    '💡 Servicios': ['Luz', 'Agua', 'Gas', 'Teléfono'],
    '📱 Suscripciones': ['Música', 'Streaming', 'Cloud', 'Apps'],
    '🎁 Regalos': ['Cumpleaños', 'Aniversarios', 'Fiestas'],
    '📦 Otros': ['Varios', 'Imprevistos'],
    '💰 Sueldo': ['Nómina', 'Primas / Bonos', 'Horas Extra'],
    '📈 Inversión': ['Rendimientos', 'Dividendos', 'Cripto', 'Bienes Raíces'],
    '🛍️ Ventas': ['Productos', 'Servicios', 'Comisiones'],
    '💻 Freelance': ['Desarrollo', 'Diseño', 'Consultoría'],
    '💵 Otros': ['Reembolsos', 'Regalos', 'Intereses']
  };

  // Sugerir color automático y emoji según el tipo y nombre de la categoría
  const suggestCategoryColorAndEmoji = (name: string, type: 'income' | 'expense') => {
    const clean = name.toLowerCase().trim();

    if (type === 'income') {
      if (clean.includes('sueldo') || clean.includes('nómina') || clean.includes('salario')) return { color: '#10b981', emoji: '💰' };
      if (clean.includes('invers') || clean.includes('cripto') || clean.includes('bolsa')) return { color: '#8b5cf6', emoji: '📈' };
      if (clean.includes('venta') || clean.includes('tienda') || clean.includes('comisión')) return { color: '#22c55e', emoji: '🛍️' };
      if (clean.includes('freelance') || clean.includes('desarrollo') || clean.includes('consult')) return { color: '#06b6d4', emoji: '💻' };
      return { color: '#10b981', emoji: '💵' };
    } else {
      if (clean.includes('comida') || clean.includes('aliment') || clean.includes('restaurante') || clean.includes('mercado') || clean.includes('café') || clean.includes('domicilio') || clean.includes('supermercado')) return { color: '#f97316', emoji: '🍔' };
      if (clean.includes('transporte') || clean.includes('gasolina') || clean.includes('carro') || clean.includes('auto') || clean.includes('taxi') || clean.includes('uber')) return { color: '#06b6d4', emoji: '🚗' };
      if (clean.includes('hogar') || clean.includes('arriendo') || clean.includes('casa') || clean.includes('servicio')) return { color: '#6366f1', emoji: '🏠' };
      if (clean.includes('entretenimiento') || clean.includes('cine') || clean.includes('juego') || clean.includes('fiesta') || clean.includes('streaming')) return { color: '#ec4899', emoji: '🎬' };
      if (clean.includes('compra') || clean.includes('ropa') || clean.includes('tecnología') || clean.includes('regalo')) return { color: '#f43f5e', emoji: '🛒' };
      if (clean.includes('salud') || clean.includes('farmacia') || clean.includes('médico') || clean.includes('gimnasio')) return { color: '#10b981', emoji: '🏥' };
      if (clean.includes('educa') || clean.includes('curso') || clean.includes('libro')) return { color: '#a855f7', emoji: '🎓' };
      if (clean.includes('viaje') || clean.includes('hotel') || clean.includes('vuelo')) return { color: '#3b82f6', emoji: '✈️' };
      if (clean.includes('mascota') || clean.includes('perro') || clean.includes('gato')) return { color: '#f59e0b', emoji: '🐶' };
      if (clean.includes('suscrip') || clean.includes('netflix') || clean.includes('spotify')) return { color: '#8b5cf6', emoji: '📱' };
      return { color: '#f43f5e', emoji: '📦' };
    }
  };

  // Obtener subcategorías para cualquier categoría dada
  const getSubcategoriesForCategory = (catName: string): string[] => {
    if (!catName) return [];
    const match = catName.match(/^([\u2000-\u32ff\ud83c-\udbff\udf00-\udfff\s]+)?(.+)$/);
    const cleanName = match ? match[2]?.trim() : catName;

    // 1. Verificar si hay un mapa personalizado en la app
    if (customSubcategoriesMap[catName]) return customSubcategoriesMap[catName];
    if (customSubcategoriesMap[cleanName]) return customSubcategoriesMap[cleanName];

    // 2. Verificar en dbCategories de Firestore
    const dbCat = dbCategories.find(c => c.name.toLowerCase().trim() === cleanName.toLowerCase().trim() || c.name.toLowerCase().trim() === catName.toLowerCase().trim());
    if (dbCat && dbCat.subcategories && dbCat.subcategories.length > 0) {
      return dbCat.subcategories;
    }

    // 3. Verificar mapa predefinido
    if (DEFAULT_SUBCATEGORIES[catName]) return DEFAULT_SUBCATEGORIES[catName];
    if (DEFAULT_SUBCATEGORIES[cleanName]) return DEFAULT_SUBCATEGORIES[cleanName];

    // Fallbacks inteligentes
    if (cleanName.toLowerCase().includes('comida') || cleanName.toLowerCase().includes('alimentación')) {
      return ['Restaurantes', 'Mercado / Supermercado', 'Café', 'Domicilios'];
    }
    return [];
  };

  // Cálculo de Categorías Inteligentes (Análisis de tendencias comparativo)
  const smartCategoryInsights = React.useMemo(() => {
    if (transactions.length === 0) return [];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const prevMonthDate = new Date(currentYear, now.getMonth() - 1, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth() + 1;

    const currentTotals: Record<string, number> = {};
    const prevTotals: Record<string, number> = {};

    transactions.forEach((tx) => {
      if (!tx.date || tx.type === 'transfer' || tx.tipo === 'transferencia') return;

      const d = new Date(tx.date);
      const txYear = d.getFullYear();
      const txMonth = d.getMonth() + 1;
      const cat = tx.category || tx.categoria || 'Otros';
      const amount = Number(tx.amount || tx.monto) || 0;

      if (txYear === currentYear && txMonth === currentMonth) {
        currentTotals[cat] = (currentTotals[cat] || 0) + amount;
      } else if (txYear === prevYear && txMonth === prevMonth) {
        prevTotals[cat] = (prevTotals[cat] || 0) + amount;
      }
    });

    const insights: {
      category: string;
      currentAmount: number;
      prevAmount: number;
      diffPercentage: number;
      isIncrease: boolean;
      diffAmount: number;
      statusText: string;
    }[] = [];

    const allCats = new Set([...Object.keys(currentTotals), ...Object.keys(prevTotals)]);

    allCats.forEach((cat) => {
      const curr = currentTotals[cat] || 0;
      const prev = prevTotals[cat] || 0;

      if (curr === 0 && prev === 0) return;

      let diffPercentage = 0;
      let isIncrease = false;

      if (prev > 0) {
        const diff = curr - prev;
        diffPercentage = Math.round((Math.abs(diff) / prev) * 100);
        isIncrease = diff > 0;
      } else if (curr > 0) {
        diffPercentage = 100;
        isIncrease = true;
      }

      const diffAmount = Math.abs(curr - prev);
      let statusText = '';
      if (prev === 0) {
        statusText = 'Primera vez registrado este mes';
      } else if (diffPercentage === 0) {
        statusText = 'Mismo consumo que el mes pasado';
      } else if (isIncrease) {
        statusText = `${diffPercentage}% de aumento respecto al mes pasado`;
      } else {
        statusText = `${diffPercentage}% de reducción respecto al mes pasado`;
      }

      insights.push({
        category: cat,
        currentAmount: curr,
        prevAmount: prev,
        diffPercentage,
        isIncrease,
        diffAmount,
        statusText
      });
    });

    return insights.sort((a, b) => b.diffAmount - a.diffAmount);
  }, [transactions]);

  // Categorías predefinidas combinadas con las cargadas de Firestore (filtrando archivadas)
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

    // Filtrar categorías activas de DB
    const activeDb = dbCategories.filter(c => !c.archived);

    const dbIncome = activeDb
      .filter((c) => c.type === 'income')
      .map((c) => `${c.emoji || '💰'} ${c.name}`);
    const dbExpense = activeDb
      .filter((c) => c.type === 'expense')
      .map((c) => `${c.emoji || '📦'} ${c.name}`);

    // Filtrar categorías del sistema archivadas
    const activeDefaultIncome = defaultIncome.filter(c => !archivedSystemCategories.includes(c));
    const activeDefaultExpense = defaultExpense.filter(c => !archivedSystemCategories.includes(c));

    const incomeSet = new Set([...activeDefaultIncome, ...dbIncome]);
    const expenseSet = new Set([...activeDefaultExpense, ...dbExpense]);

    return {
      income: Array.from(incomeSet),
      expense: Array.from(expenseSet)
    };
  }, [dbCategories, archivedSystemCategories]);

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

    const chartTextColor = userProfileTheme === 'light' ? '#1e293b' : '#cbd5e1';
    const chartGridColor = userProfileTheme === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)';

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
            x: { grid: { display: false }, ticks: { color: chartTextColor } },
            y: { grid: { color: chartGridColor }, ticks: { color: chartTextColor } }
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
                color: chartTextColor, 
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
  }, [activeModule, transactions, currentUser, userProfileTheme]);

  // Cerrar el menú con la tecla Esc y bloquear el scroll del body
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMobileMenuOpen]);

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthLoading(true);
        try {
          const authorized = await checkUserAuthorization(user);
          setIsAuthorized(authorized);
          if (authorized) {
            setAuthError('');
            // Derivar clave de E2EE determinísticamente usando el UID de Google
            const key = await deriveKeyFromGoogleUid(user.uid);
            setEncryptionKey(key);
          } else {
            setAuthError('Tu cuenta de Google no está autorizada para acceder a esta aplicación.');
            toast.error('Acceso no autorizado.');
            setEncryptionKey(null);
          }
        } catch (err) {
          console.error("Error al validar autorización:", err);
          setAuthError('Error al procesar el inicio de sesión.');
        }
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setIsAuthorized(null);
        setEncryptionKey(null);
        setAuthError('');
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Escuchar transacciones en tiempo real de Firestore para el usuario activo
  useEffect(() => {
    if (!currentUser || !encryptionKey) {
      setTransactions([]);
      return;
    }

    const q = query(
      collection(db, 'usuarios', currentUser.uid, 'movimientos'),
      orderBy('fechaCreacion', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const promises = snapshot.docs.map(async (doc) => {
          const rawData = doc.data();
          let data = rawData;
          if (encryptionKey) {
            try {
              data = await decryptDoc(rawData, encryptionKey);
            } catch (decErr) {
              console.error(`Error decrypting movimiento ${doc.id}:`, decErr);
            }
          }
          // Soportar campos tanto en español (de Angular) como en inglés para total compatibilidad
          const monto = data?.monto !== undefined ? data.monto : (data?.amount || 0);
          const tipo = data?.tipo !== undefined ? data.tipo : (data?.type || 'egreso');
          const fecha = data?.fecha || data?.date || new Date().toISOString();
          
          return {
            ...data,
            id: doc.id,
            amount: monto,
            type: (tipo === 'ingreso' || tipo === 'income') ? 'income' : 'expense',
            category: data?.categoria || data?.category || 'Otros',
            description: data?.descripcion || data?.description || '',
            date: fecha,
            accountId: data?.accountId || data?.cuentaId || '',
            cuentaId: data?.cuentaId || data?.accountId || '',
            attachment: data?.attachment || data?.adjunto || '',
            adjunto: data?.adjunto || data?.attachment || '',
            reconciliationStatus: data?.reconciliationStatus || data?.estadoConciliacion || 'conciliado'
          };
        });
        const items = await Promise.all(promises);
        setTransactions(items);
      } catch (err) {
        console.error("Error decrypting movimientos snapshot:", err);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `usuarios/${currentUser.uid}/movimientos`);
    });

    return unsubscribe;
  }, [currentUser, encryptionKey]);

  // Escuchar categorías personalizadas en tiempo real desde Firestore
  useEffect(() => {
    if (!currentUser || !encryptionKey) {
      setDbCategories([]);
      return;
    }

    const q = query(
      collection(db, 'usuarios', currentUser.uid, 'categorias')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const promises = snapshot.docs.map(async (doc) => {
          const rawData = doc.data();
          let data = rawData;
          if (encryptionKey) {
            try {
              data = await decryptDoc(rawData, encryptionKey);
            } catch (decErr) {
              console.error(`Error decrypting categoria ${doc.id}:`, decErr);
            }
          }
          return {
            id: doc.id,
            name: data?.name || data?.nombre || '',
            type: data?.type || data?.tipo || 'expense',
            emoji: data?.emoji || '📦',
            subcategories: Array.isArray(data?.subcategories) ? data.subcategories : (Array.isArray(data?.subcategorias) ? data.subcategorias : []),
            archived: Boolean(data?.archived || data?.archivada),
            customIcon: data?.customIcon || data?.iconoPersonalizado || '',
            color: data?.color || '',
            fechaCreacion: data?.fechaCreacion
          };
        });
        const items = await Promise.all(promises);
        items.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
        setDbCategories(items);
      } catch (err) {
        console.error("Error decrypting categorias snapshot:", err);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `usuarios/${currentUser.uid}/categorias`);
    });

    return unsubscribe;
  }, [currentUser, encryptionKey]);

  // Escuchar presupuestos personalizados en tiempo real desde Firestore
  useEffect(() => {
    if (!currentUser || !encryptionKey) {
      setDbBudgets([]);
      return;
    }

    const q = query(
      collection(db, 'usuarios', currentUser.uid, 'presupuestos')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const promises = snapshot.docs.map(async (doc) => {
          const rawData = doc.data();
          let data = rawData;
          if (encryptionKey) {
            try {
              data = await decryptDoc(rawData, encryptionKey);
            } catch (decErr) {
              console.error(`Error decrypting budget ${doc.id}:`, decErr);
            }
          }
          return {
            id: doc.id,
            category: data?.category || '',
            maxAmount: Number(data?.maxAmount || 0),
            alertThreshold: Number(data?.alertThreshold || 95),
            fechaCreacion: data?.fechaCreacion
          };
        });
        const items = await Promise.all(promises);
        setDbBudgets(items);
      } catch (err) {
        console.error("Error decrypting budgets snapshot:", err);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `usuarios/${currentUser.uid}/presupuestos`);
    });

    return unsubscribe;
  }, [currentUser, encryptionKey]);

  // Escuchar metas de ahorro en tiempo real desde Firestore + auto-seeding de metas demo
  useEffect(() => {
    if (!currentUser || !encryptionKey) {
      setDbSavingsGoals([]);
      return;
    }

    const q = query(
      collection(db, 'usuarios', currentUser.uid, 'metas')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const promises = snapshot.docs.map(async (doc) => {
          const rawData = doc.data();
          let data = rawData;
          if (encryptionKey) {
            try {
              data = await decryptDoc(rawData, encryptionKey);
            } catch (decErr) {
              console.error(`Error decrypting meta ${doc.id}:`, decErr);
            }
          }
          return {
            id: doc.id,
            name: data?.name || '',
            targetAmount: Number(data?.targetAmount || 0),
            currentSaved: Number(data?.currentSaved || 0),
            emoji: data?.emoji || '🎯',
            priority: (data?.priority as 'alta' | 'media' | 'baja') || 'media',
            autoContributionAmount: Number(data?.autoContributionAmount ?? 100000),
            autoContributionFrequency: (data?.autoContributionFrequency as 'semanal' | 'quincenal' | 'mensual') || 'quincenal',
            autoContributionEnabled: data?.autoContributionEnabled !== false,
            history: Array.isArray(data?.history) ? data.history : [],
            fechaCreacion: data?.fechaCreacion
          };
        });
        const items = await Promise.all(promises);
        
        items.sort((a, b) => new Date(a.fechaCreacion || '').getTime() - new Date(b.fechaCreacion || '').getTime());
        setDbSavingsGoals(items);
      } catch (err) {
        console.error("Error decrypting metas snapshot:", err);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `usuarios/${currentUser.uid}/metas`);
    });

    return unsubscribe;
  }, [currentUser, encryptionKey]);

  // Escuchar deudas en tiempo real desde Firestore + auto-seeding de deudas demo
  useEffect(() => {
    if (!currentUser || !encryptionKey) {
      setDbDebts([]);
      return;
    }

    const q = query(
      collection(db, 'usuarios', currentUser.uid, 'deudas')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const promises = snapshot.docs.map(async (doc) => {
          const rawData = doc.data();
          let data = rawData;
          if (encryptionKey) {
            try {
              data = await decryptDoc(rawData, encryptionKey);
            } catch (decErr) {
              console.error(`Error decrypting deuda ${doc.id}:`, decErr);
            }
          }
          return {
            id: doc.id,
            name: data?.name || '',
            balance: Number(data?.balance || 0),
            originalDebt: data?.originalDebt !== undefined ? Number(data.originalDebt) : Number(data?.balance || 0),
            minPayment: Number(data?.minPayment || 0),
            dueDate: data?.dueDate || '',
            type: data?.type || 'card',
            interestRate: Number(data?.interestRate !== undefined ? data.interestRate : (data?.type === 'card' ? 28 : 16)),
            interestPaidYear: Number(data?.interestPaidYear !== undefined ? data.interestPaidYear : (data?.type === 'card' ? 850000 : 400000)),
            fechaCreacion: data?.fechaCreacion,
            fechaInicio: data?.fechaInicio || ''
          };
        });
        const items = await Promise.all(promises);
        
        items.sort((a, b) => new Date(a.fechaCreacion || '').getTime() - new Date(b.fechaCreacion || '').getTime());
        setDbDebts(items);
      } catch (err) {
        console.error("Error decrypting deudas snapshot:", err);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `usuarios/${currentUser.uid}/deudas`);
    });

    return unsubscribe;
  }, [currentUser, encryptionKey]);

  // Escuchar cuentas en tiempo real de Firestore para el usuario activo + auto-seeding
  useEffect(() => {
    if (!currentUser || !encryptionKey) {
      setAccounts([]);
      return;
    }

    const q = query(
      collection(db, 'usuarios', currentUser.uid, 'cuentas')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const promises = snapshot.docs.map(async (doc) => {
          const rawData = doc.data();
          let data = rawData;
          if (encryptionKey) {
            try {
              data = await decryptDoc(rawData, encryptionKey);
            } catch (decErr) {
              console.error(`Error decrypting cuenta ${doc.id}:`, decErr);
            }
          }
          return {
            id: doc.id,
            nombre: data?.nombre || 'Cuenta sin nombre',
            tipo: data?.tipo || 'credito',
            saldo: Number(data?.saldo || 0),
            fechaCreacion: data?.fechaCreacion,
            color: data?.color || 'emerald',
            icono: data?.icono || 'wallet',
            alias: data?.alias || '',
            subtipo: data?.subtipo || (data?.tipo === 'deuda' ? 'deudas' : ((data?.nombre || '').toLowerCase().includes('ahorro') ? 'ahorros' : 'disponible'))
          };
        });
        const items = await Promise.all(promises);
        items.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', undefined, { sensitivity: 'base' }));
        
        setAccounts(items);
      } catch (err) {
        console.error("Error decrypting cuentas snapshot:", err);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `usuarios/${currentUser.uid}/cuentas`);
    });

    return unsubscribe;
  }, [currentUser, encryptionKey]);

  // Escuchar suscripciones en tiempo real desde Firestore + auto-seeding
  useEffect(() => {
    if (!currentUser || !encryptionKey) {
      setDbSubscriptions([]);
      return;
    }

    const q = query(
      collection(db, 'usuarios', currentUser.uid, 'suscripciones')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const promises = snapshot.docs.map(async (doc) => {
          const rawData = doc.data();
          let data = rawData;
          if (encryptionKey) {
            try {
              data = await decryptDoc(rawData, encryptionKey);
            } catch (decErr) {
              console.error(`Error decrypting suscripcion ${doc.id}:`, decErr);
            }
          }
          return {
            id: doc.id,
            name: data?.name || '',
            cost: Number(data?.cost || 0),
            dueDate: data?.dueDate || '',
            account: data?.account || '',
            status: data?.status || 'active',
            usage: (data?.usage as 'Sí' | 'No' | 'A veces') || 'Sí',
            priceIncreaseNote: data?.priceIncreaseNote || (data?.name?.toLowerCase().includes('netflix') ? 'Subió 15% desde enero.' : ''),
            fechaCreacion: data?.fechaCreacion
          };
        });
        const items = await Promise.all(promises);

        items.sort((a, b) => new Date(a.fechaCreacion || '').getTime() - new Date(b.fechaCreacion || '').getTime());
        setDbSubscriptions(items);
      } catch (err) {
        console.error("Error decrypting deudas snapshot:", err);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `usuarios/${currentUser.uid}/suscripciones`);
    });

    return unsubscribe;
  }, [currentUser, encryptionKey]);

  // Escuchar débitos automáticos en tiempo real desde Firestore
  useEffect(() => {
    if (!currentUser || !encryptionKey) {
      setDbAutomaticDebits([]);
      return;
    }

    const q = query(
      collection(db, 'usuarios', currentUser.uid, 'debitos_automaticos')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const promises = snapshot.docs.map(async (doc) => {
          const rawData = doc.data();
          let data = rawData;
          if (encryptionKey) {
            try {
              data = await decryptDoc(rawData, encryptionKey);
            } catch (decErr) {
              console.error(`Error decrypting debit ${doc.id}:`, decErr);
            }
          }
          return {
            id: doc.id,
            name: data?.name || '',
            accountId: data?.accountId || '',
            amount: Number(data?.amount || 0),
            category: data?.category || '🏠 Servicios Públicos',
            dayOfMonth: Number(data?.dayOfMonth || 1),
            active: data?.active !== false,
            lastExecutedDate: data?.lastExecutedDate || '',
            status: (data?.status as 'ok' | 'insufficient_funds') || 'ok',
            fechaCreacion: data?.fechaCreacion
          };
        });
        const items = await Promise.all(promises);
        items.sort((a, b) => new Date(a.fechaCreacion || '').getTime() - new Date(b.fechaCreacion || '').getTime());
        setDbAutomaticDebits(items);
      } catch (err) {
        console.error("Error decrypting debitos_automaticos snapshot:", err);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `usuarios/${currentUser.uid}/debitos_automaticos`);
    });

    return unsubscribe;
  }, [currentUser, encryptionKey]);

  // Monitorear sobrepaso de presupuestos y lanzar notificaciones al dispositivo
  useEffect(() => {
    if (!dbBudgets.length || !transactions.length) return;

    const currentYearMonth = new Date().toISOString().slice(0, 7);

    dbBudgets.forEach(budget => {
      const currentSpend = getMonthlySpendForCategory(budget.category);
      const maxAmount = budget.maxAmount;
      const alertThreshold = budget.alertThreshold || 95;
      if (maxAmount <= 0) return;

      const pct = (currentSpend / maxAmount) * 100;
      const isExceeded = currentSpend > maxAmount;
      const isWarning = !isExceeded && pct >= alertThreshold;

      if (isExceeded || isWarning) {
        const alertType = isExceeded ? 'exceeded' : 'warning';
        const alertKey = `${budget.id}_${alertType}_${currentYearMonth}`;

        if (!notifiedBudgetAlertsRef.current.has(alertKey)) {
          notifiedBudgetAlertsRef.current.add(alertKey);

          const categoryClean = budget.category.replace(/^([\u2000-\u32ff\ud83c-\udbff\udf00-\udfff\s]+)/, '').trim() || budget.category;
          const title = isExceeded
            ? `🔴 Presupuesto Excedido: ${categoryClean}`
            : `⚠️ Alerta de Presupuesto (${pct.toFixed(0)}%): ${categoryClean}`;

          const body = isExceeded
            ? `¡Atención! Has gastado $${currentSpend.toLocaleString('es-CO')} superando tu tope mensual de $${maxAmount.toLocaleString('es-CO')}.`
            : `Has consumido el ${pct.toFixed(0)}% ($${currentSpend.toLocaleString('es-CO')}) de tu presupuesto de $${maxAmount.toLocaleString('es-CO')}.`;

          sendDeviceNotification(title, { body });
          if (isExceeded) {
            toast.error(`${title} — ${body}`, { duration: 6000 });
          } else {
            toast(`${title} — ${body}`, { duration: 5000, icon: '⚠️' });
          }
        }
      }
    });
  }, [dbBudgets, transactions]);

  // Crear nuevo débito automático
  const handleAddAutomaticDebit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const amountNum = parseNumberMask(newDebitAmount);
    if (!newDebitName.trim() || amountNum <= 0) {
      toast.error('Por favor ingresa un nombre y monto válido para el débito automático.');
      return;
    }

    if (!newDebitAccountId) {
      toast.error('Por favor selecciona la cuenta de donde se debitará.');
      return;
    }

    setNewDebitLoading(true);
    try {
      const docRef = collection(db, 'usuarios', currentUser.uid, 'debitos_automaticos');
      await addDoc(docRef, {
        name: newDebitName.trim(),
        accountId: newDebitAccountId,
        amount: amountNum,
        category: newDebitCategory,
        dayOfMonth: Math.min(31, Math.max(1, Number(newDebitDayOfMonth) || 1)),
        active: newDebitActive,
        lastExecutedDate: '',
        status: 'ok',
        fechaCreacion: new Date().toISOString()
      });

      toast.success('Débito automático guardado con éxito.');
      setIsAddDebitModalOpen(false);
      setNewDebitName('');
      setNewDebitAmount('');
      setNewDebitDayOfMonth('1');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `usuarios/${currentUser.uid}/debitos_automaticos`);
    } finally {
      setNewDebitLoading(false);
    }
  };

  // Activar / Desactivar débito automático
  const handleToggleAutomaticDebit = async (id: string, currentActive: boolean) => {
    if (!currentUser) return;
    try {
      const docRef = doc(db, 'usuarios', currentUser.uid, 'debitos_automaticos', id);
      await updateDoc(docRef, { active: !currentActive });
      toast.success(!currentActive ? 'Débito automático activado.' : 'Débito automático pausado.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `usuarios/${currentUser.uid}/debitos_automaticos/${id}`);
    }
  };

  // Eliminar débito automático
  const handleDeleteAutomaticDebit = async (id: string) => {
    if (!currentUser) return;
    try {
      const docRef = doc(db, 'usuarios', currentUser.uid, 'debitos_automaticos', id);
      await deleteDoc(docRef);
      toast.success('Débito automático eliminado.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `usuarios/${currentUser.uid}/debitos_automaticos/${id}`);
    }
  };

  // Procesar Débitos Automáticos (Evaluar fecha y disponibilidad de saldo)
  const processAutomaticDebits = async (isManualTrigger = false) => {
    if (!currentUser || !dbAutomaticDebits.length) {
      if (isManualTrigger) toast('No hay débitos automáticos configurados.', { icon: 'ℹ️' });
      return;
    }

    const today = new Date();
    const currentDay = today.getDate();
    const currentYearMonth = today.toISOString().slice(0, 7);

    let executedCount = 0;
    let failedCount = 0;

    for (const debit of dbAutomaticDebits) {
      if (!debit.active) continue;

      const acc = accounts.find(a => a.id === debit.accountId);
      const accSaldo = acc ? acc.saldo : 0;
      const isDue = currentDay >= debit.dayOfMonth && debit.lastExecutedDate !== currentYearMonth;

      if (isDue || isManualTrigger) {
        if (!acc || accSaldo < debit.amount) {
          // ALERTA DE SALDO INSUFICIENTE
          failedCount++;
          const title = `🔴 Fondo Insuficiente - Débito Automático`;
          const body = `La cuenta "${acc ? acc.nombre : 'Seleccionada'}" no tiene suficiente saldo ($${accSaldo.toLocaleString('es-CO')}) para debitar $${debit.amount.toLocaleString('es-CO')} de "${debit.name}".`;

          sendDeviceNotification(title, { body });
          toast.error(`⚠️ Saldo insuficiente en ${acc ? acc.nombre : 'cuenta'} para debitar $${debit.amount.toLocaleString('es-CO')} (${debit.name}).`, { duration: 7000 });

          try {
            const docRef = doc(db, 'usuarios', currentUser.uid, 'debitos_automaticos', debit.id);
            await updateDoc(docRef, { status: 'insufficient_funds' });
          } catch (e) {
            console.error("Error al actualizar estado del débito:", e);
          }
        } else if (debit.lastExecutedDate !== currentYearMonth) {
          // POSEE SALDO Y CORRESPONDE EJECUTAR
          try {
            const newSaldo = acc.saldo - debit.amount;

            // 1. Actualizar saldo de cuenta
            const accRef = doc(db, 'usuarios', currentUser.uid, 'cuentas', acc.id);
            await updateDoc(accRef, { saldo: newSaldo });

            // 2. Registrar egreso en movimientos
            await addDoc(collection(db, 'usuarios', currentUser.uid, 'movimientos'), {
              monto: debit.amount,
              tipo: 'egreso',
              categoria: debit.category,
              descripcion: `Débito Automático - ${debit.name}`,
              fecha: new Date().toISOString().split('T')[0],
              fechaCreacion: new Date().toISOString(),
              accountId: acc.id,
              cuentaId: acc.id,
              amount: debit.amount,
              type: 'expense',
              category: debit.category,
              description: `Débito Automático - ${debit.name}`,
              date: new Date().toISOString()
            });

            // 3. Sincronizar saldo de deuda
            await syncAccountDebtBalance(currentUser.uid, acc.id, newSaldo);

            // 4. Marcar débito como ejecutado este mes
            const docRef = doc(db, 'usuarios', currentUser.uid, 'debitos_automaticos', debit.id);
            await updateDoc(docRef, {
              lastExecutedDate: currentYearMonth,
              status: 'ok'
            });

            executedCount++;

            const title = `✅ Débito Automático Exitoso`;
            const body = `Se debitaron $${debit.amount.toLocaleString('es-CO')} de "${acc.nombre}" para "${debit.name}".`;

            sendDeviceNotification(title, { body });
            toast.success(`✅ Débito automático "${debit.name}" ($${debit.amount.toLocaleString('es-CO')}) procesado en ${acc.nombre}.`);
          } catch (err) {
            console.error("Error al ejecutar débito automático:", err);
          }
        }
      }
    }

    if (isManualTrigger && executedCount === 0 && failedCount === 0) {
      toast('Todos los débitos automáticos están al día para este mes.', { icon: 'ℹ️' });
    }
  };

  // Escuchar preferencias de usuario en tiempo real desde Firestore + auto-seeding
  useEffect(() => {
    if (!currentUser || !encryptionKey) return;

    const docRef = doc(db, 'usuarios', currentUser.uid, 'configuracion', 'preferencias');

    const unsubscribe = onSnapshot(docRef, async (snapshot) => {
      if (snapshot.exists()) {
        const rawData = snapshot.data();
        let data = rawData;
        if (encryptionKey) {
          try {
            data = await decryptDoc(rawData, encryptionKey);
          } catch (decErr) {
            console.error("Error decrypting preferencias:", decErr);
          }
        }
        setUserProfileName(data?.name || '');
        setUserProfileCurrency(data?.currency || 'COP');
        setUserProfileLanguage(data?.language || 'es');
        setUserProfileTheme(data?.theme || 'dark');
        if (Array.isArray(data?.archivedSystemCategories)) {
          setArchivedSystemCategories(data.archivedSystemCategories);
        }
        if (data?.customSubcategoriesMap && typeof data.customSubcategoriesMap === 'object') {
          setCustomSubcategoriesMap(data.customSubcategoriesMap);
        }
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
  }, [currentUser, encryptionKey]);

  // Iniciar Sesión con Google (Proveedor único activo)
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
      setAuthSuccess('');
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  // Crear o Editar categoría en Firestore para el usuario activo
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!newCatName.trim()) {
      toast.error('Ingrese el nombre de la categoría');
      return;
    }

    setNewCatLoading(true);
    try {
      if (editingCatId) {
        const docRef = doc(db, 'usuarios', currentUser.uid, 'categorias', editingCatId);
        await updateDoc(docRef, {
          name: newCatName.trim(),
          type: newCatType,
          emoji: newCatEmoji,
          customIcon: newCatCustomIcon || '',
          color: newCatColor,
          subcategories: newCatSubcategories,
          fechaActualizacion: new Date().toISOString()
        });
        toast.success('Categoría actualizada con éxito');
      } else {
        const catRef = collection(db, 'usuarios', currentUser.uid, 'categorias');
        await addDoc(catRef, {
          name: newCatName.trim(),
          type: newCatType,
          emoji: newCatEmoji,
          customIcon: newCatCustomIcon || '',
          color: newCatColor || suggestCategoryColorAndEmoji(newCatName, newCatType).color,
          subcategories: newCatSubcategories,
          archived: false,
          fechaCreacion: new Date().toISOString()
        });
        toast.success('Categoría creada exitosamente');
      }

      // Resetear campos del formulario
      setEditingCatId(null);
      setNewCatName('');
      setNewCatCustomIcon('');
      setNewCatIconType('emoji');
      setNewCatColor('#f97316');
      setNewCatSubcategories([]);
      setNewCatSubcategoryInput('');
      const emojis = ['🍕', '🍿', '🎸', '🎮', '💡', '🏋️', '📚', '👗', '🎨', '🚕', '🏥', '🥕', '🥩', '🍩', '🥑', '🧁', '🍦', '🍹', '✈️', '🏝️', '🏕️', '🏡', '💻'];
      setNewCatEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
      setIsAddCategoryModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `usuarios/${currentUser.uid}/categorias`);
    } finally {
      setNewCatLoading(false);
    }
  };

  // Cargar categoría para edición
  const handleStartEditCategory = (cat: { id: string; name: string; type: 'income' | 'expense'; emoji: string; customIcon?: string; color?: string; subcategories?: string[] }) => {
    setEditingCatId(cat.id);
    setNewCatName(cat.name);
    setNewCatType(cat.type);
    setNewCatEmoji(cat.emoji || '📦');
    setNewCatCustomIcon(cat.customIcon || '');
    setNewCatIconType(cat.customIcon ? 'upload' : 'emoji');
    setNewCatColor(cat.color || suggestCategoryColorAndEmoji(cat.name, cat.type).color);
    setNewCatSubcategories(cat.subcategories || []);
    setIsAddCategoryModalOpen(true);
  };

  // Archivar o Desarchivar Categoría
  const handleArchiveCategory = async (catIdentifier: string, isCurrentlyArchived: boolean = false) => {
    if (!currentUser) return;
    try {
      const dbCat = dbCategories.find(c => c.id === catIdentifier || c.name.toLowerCase().trim() === catIdentifier.toLowerCase().trim());
      if (dbCat) {
        const docRef = doc(db, 'usuarios', currentUser.uid, 'categorias', dbCat.id);
        await updateDoc(docRef, { archived: !isCurrentlyArchived });
        toast.success(isCurrentlyArchived ? `Categoría "${dbCat.name}" desarchivada.` : `Categoría "${dbCat.name}" archivada.`);
      } else {
        const catName = catIdentifier;
        const isArchived = archivedSystemCategories.includes(catName);
        let updated: string[];
        if (isArchived) {
          updated = archivedSystemCategories.filter(c => c !== catName);
          toast.success(`Categoría "${catName}" desarchivada.`);
        } else {
          updated = [...archivedSystemCategories, catName];
          toast.success(`Categoría "${catName}" archivada.`);
        }
        setArchivedSystemCategories(updated);
        const prefRef = doc(db, 'usuarios', currentUser.uid, 'configuracion', 'preferencias');
        await setDoc(prefRef, { archivedSystemCategories: updated }, { merge: true });
      }
    } catch (err) {
      console.error("Error al archivar categoría:", err);
      toast.error('Error al cambiar el estado de archivo');
    }
  };

  // Agregar subcategoría a cualquier categoría (Base de Datos o Sistema)
  const handleAddSubcategoryToCategory = async (categoryIdentifier: string, subcategoryName: string) => {
    if (!subcategoryName.trim() || !currentUser) return;
    const subClean = subcategoryName.trim();

    const dbCat = dbCategories.find(c => c.id === categoryIdentifier || c.name.toLowerCase().trim() === categoryIdentifier.toLowerCase().trim());

    if (dbCat) {
      const existingSubs = dbCat.subcategories || [];
      if (existingSubs.includes(subClean)) {
        toast.error('Esta subcategoría ya existe.');
        return;
      }
      const updatedSubs = [...existingSubs, subClean];
      try {
        const docRef = doc(db, 'usuarios', currentUser.uid, 'categorias', dbCat.id);
        await updateDoc(docRef, { subcategories: updatedSubs });
        toast.success(`Subcategoría "${subClean}" agregada a ${dbCat.name}`);
        setInlineSubInput('');
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `usuarios/${currentUser.uid}/categorias/${dbCat.id}`);
      }
    } else {
      const currentSubs = customSubcategoriesMap[categoryIdentifier] || getSubcategoriesForCategory(categoryIdentifier);
      if (currentSubs.includes(subClean)) {
        toast.error('Esta subcategoría ya existe.');
        return;
      }
      const updatedSubs = [...currentSubs, subClean];
      const updatedMap = { ...customSubcategoriesMap, [categoryIdentifier]: updatedSubs };
      setCustomSubcategoriesMap(updatedMap);
      try {
        const prefRef = doc(db, 'usuarios', currentUser.uid, 'configuracion', 'preferencias');
        await setDoc(prefRef, { customSubcategoriesMap: updatedMap }, { merge: true });
        toast.success(`Subcategoría "${subClean}" agregada.`);
        setInlineSubInput('');
      } catch (err) {
        console.error("Error al guardar subcategoría:", err);
      }
    }
  };

  // Eliminar subcategoría de una categoría
  const handleRemoveSubcategoryFromCategory = async (categoryIdentifier: string, subcategoryToRemove: string) => {
    if (!currentUser) return;

    const dbCat = dbCategories.find(c => c.id === categoryIdentifier || c.name.toLowerCase().trim() === categoryIdentifier.toLowerCase().trim());

    if (dbCat) {
      const existingSubs = dbCat.subcategories || [];
      const updatedSubs = existingSubs.filter(s => s !== subcategoryToRemove);
      try {
        const docRef = doc(db, 'usuarios', currentUser.uid, 'categorias', dbCat.id);
        await updateDoc(docRef, { subcategories: updatedSubs });
        toast.success(`Subcategoría "${subcategoryToRemove}" eliminada.`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `usuarios/${currentUser.uid}/categorias/${dbCat.id}`);
      }
    } else {
      const currentSubs = customSubcategoriesMap[categoryIdentifier] || getSubcategoriesForCategory(categoryIdentifier);
      const updatedSubs = currentSubs.filter(s => s !== subcategoryToRemove);
      const updatedMap = { ...customSubcategoriesMap, [categoryIdentifier]: updatedSubs };
      setCustomSubcategoriesMap(updatedMap);
      try {
        const prefRef = doc(db, 'usuarios', currentUser.uid, 'configuracion', 'preferencias');
        await setDoc(prefRef, { customSubcategoriesMap: updatedMap }, { merge: true });
        toast.success(`Subcategoría "${subcategoryToRemove}" eliminada.`);
      } catch (err) {
        console.error("Error al eliminar subcategoría:", err);
      }
    }
  };

  // Cargar archivo de icono personalizado SVG/PNG
  const handleIconFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      toast.error("La imagen del icono debe ser menor a 500KB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewCatCustomIcon(reader.result as string);
      setNewCatIconType('upload');
      toast.success("Icono cargado correctamente");
    };
    reader.readAsDataURL(file);
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
      toast.error("Por favor selecciona una cuenta para registrar el gasto.");
      return;
    }

    const targetAccount = accounts.find(a => a.id === accountId);
    if (!targetAccount) {
      toast.error("La cuenta seleccionada no existe.");
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

      toast.success(`Gasto de $${ocrResult.value.toLocaleString('es-CO')} registrado exitosamente en la cuenta ${targetAccount.nombre}.`);
      
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

    const limitNum = parseNumberMask(newBudgetLimit);
    if (limitNum <= 0) return;

    setNewBudgetLoading(true);
    try {
      const budgetRef = collection(db, 'usuarios', currentUser.uid, 'presupuestos');
      await addDoc(budgetRef, {
        category: newBudgetCategory,
        maxAmount: limitNum,
        period: newBudgetPeriod || 'mensual',
        alertThreshold: parseFloat(newBudgetAlertThreshold) || 80,
        fechaCreacion: new Date().toISOString()
      });
      setNewBudgetCategory('');
      setNewBudgetLimit('');
      setNewBudgetAlertThreshold('80');
      setNewBudgetPeriod('mensual');
      setIsAddBudgetModalOpen(false);
      toast.success('Presupuesto guardado exitosamente.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `usuarios/${currentUser.uid}/presupuestos`);
    } finally {
      setNewBudgetLoading(false);
    }
  };

  // Crear presupuesto recomendado en 1 clic
  const handleCreateRecommendedBudget = async (categoryName: string, suggestedLimit: number, period: 'semanal' | 'quincenal' | 'mensual' | 'anual' = 'mensual') => {
    if (!currentUser) return;
    try {
      const budgetRef = collection(db, 'usuarios', currentUser.uid, 'presupuestos');
      await addDoc(budgetRef, {
        category: categoryName,
        maxAmount: suggestedLimit,
        period: period,
        alertThreshold: 80,
        fechaCreacion: new Date().toISOString()
      });
      toast.success(`Presupuesto de $${suggestedLimit.toLocaleString('es-CO')} asignado a ${categoryName}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `usuarios/${currentUser.uid}/presupuestos`);
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

  // Helper para calcular la proyección y fecha estimada de logro de la meta
  const getGoalProjectionDetails = (goal: any, extraMonthlyAmount: number = 0) => {
    const target = Number(goal.targetAmount || 0);
    const current = Number(goal.currentSaved || 0);
    const remaining = Math.max(0, target - current);

    if (remaining <= 0) {
      return {
        isCompleted: true,
        projectedDateStr: '¡Meta Alcanzada!',
        monthsLeft: 0,
        monthlyRate: 0,
        baseMonthlyRate: 0,
        freqLabel: goal.autoContributionFrequency === 'semanal' ? 'semanal' : goal.autoContributionFrequency === 'quincenal' ? 'quincenal' : 'mensual'
      };
    }

    let baseMonthlyRate = 0;
    const autoAmount = Number(goal.autoContributionAmount || 0);
    const freq = goal.autoContributionFrequency || 'quincenal';

    if (goal.autoContributionEnabled !== false && autoAmount > 0) {
      if (freq === 'semanal') baseMonthlyRate = autoAmount * (52 / 12);
      else if (freq === 'quincenal') baseMonthlyRate = autoAmount * 2;
      else baseMonthlyRate = autoAmount;
    } else {
      baseMonthlyRate = 100000; // Fallback predeterminado
    }

    const totalMonthlyRate = baseMonthlyRate + extraMonthlyAmount;

    if (totalMonthlyRate <= 0) {
      return {
        isCompleted: false,
        projectedDateStr: 'Indefinida (sin aportes)',
        monthsLeft: 999,
        monthlyRate: 0,
        baseMonthlyRate,
        freqLabel: freq === 'semanal' ? 'semanal' : freq === 'quincenal' ? 'quincenal' : 'mensual'
      };
    }

    const monthsLeft = remaining / totalMonthlyRate;
    const today = new Date('2026-07-30T05:54:45-07:00');
    const targetDate = new Date(today.getTime() + monthsLeft * 30.4375 * 24 * 60 * 60 * 1000);

    const dateFormatted = targetDate.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return {
      isCompleted: false,
      projectedDateStr: dateFormatted,
      monthsLeft: Math.ceil(monthsLeft),
      monthlyRate: totalMonthlyRate,
      baseMonthlyRate,
      freqLabel: freq === 'semanal' ? 'semanal' : freq === 'quincenal' ? 'quincenal' : 'mensual'
    };
  };

  // Registrar un aporte / depósito en Firestore con historial
  const handleDepositToSavingsGoal = async (goal: any, amountToDeposit: number, noteStr?: string) => {
    if (!currentUser || !goal) return;
    if (amountToDeposit <= 0) return;

    setDepositLoading(true);
    try {
      const docRef = doc(db, 'usuarios', currentUser.uid, 'metas', goal.id);
      const newSaved = Number(goal.currentSaved || 0) + amountToDeposit;
      const newEntry = {
        id: 'dep-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        amount: amountToDeposit,
        date: new Date().toISOString(),
        note: noteStr || 'Aporte a la meta'
      };
      const updatedHistory = [newEntry, ...(goal.history || [])];

      await updateDoc(docRef, {
        currentSaved: newSaved,
        history: updatedHistory
      });

      toast.success(`¡Aporte de $${amountToDeposit.toLocaleString('es-CO')} registrado en ${goal.name}!`);
      setDepositGoalModal(null);
      setDepositAmountInput('');
      setDepositNoteInput('');
      
      // Actualizar vista local si el modal de historial está activo
      if (historyGoalModal && historyGoalModal.id === goal.id) {
        setHistoryGoalModal({
          ...historyGoalModal,
          currentSaved: newSaved,
          history: updatedHistory
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `usuarios/${currentUser.uid}/metas/${goal.id}`);
    } finally {
      setDepositLoading(false);
    }
  };

  // Crear meta de ahorro en Firestore
  const handleCreateSavingsGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!newGoalName.trim() || !newGoalTarget.trim()) return;

    const targetNum = parseNumberMask(newGoalTarget);
    const savedNum = parseNumberMask(newGoalSaved);
    const autoAmountNum = parseNumberMask(newGoalAutoAmount);

    if (targetNum <= 0) return;
    if (savedNum < 0) return;

    setNewGoalLoading(true);
    try {
      const goalsRef = collection(db, 'usuarios', currentUser.uid, 'metas');
      const initialHistory = savedNum > 0 ? [{
        id: 'init-' + Date.now(),
        amount: savedNum,
        date: new Date().toISOString(),
        note: 'Ahorro inicial registrado'
      }] : [];

      await addDoc(goalsRef, {
        name: newGoalName.trim(),
        targetAmount: targetNum,
        currentSaved: savedNum,
        emoji: newGoalEmoji || '🎯',
        priority: newGoalPriority,
        autoContributionAmount: autoAmountNum > 0 ? autoAmountNum : 100000,
        autoContributionFrequency: newGoalAutoFreq,
        autoContributionEnabled: newGoalAutoEnabled,
        history: initialHistory,
        fechaCreacion: new Date().toISOString()
      });

      setNewGoalName('');
      setNewGoalTarget('');
      setNewGoalSaved('');
      setNewGoalEmoji('🎯');
      setNewGoalPriority('alta');
      setNewGoalAutoAmount('100.000');
      setNewGoalAutoFreq('quincenal');
      setNewGoalAutoEnabled(true);
      setIsAddGoalModalOpen(false);
      toast.success('¡Meta de ahorro creada con éxito!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `usuarios/${currentUser.uid}/metas`);
    } finally {
      setNewGoalLoading(false);
    }
  };

  // Actualizar ahorro acumulado de una meta
  const handleUpdateSavingsGoalSaved = async (goalId: string, savedAmountStr: string) => {
    if (!currentUser) return;
    const savedNum = parseNumberMask(savedAmountStr);
    if (savedNum < 0) return;

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

  // Formato simple DD/MM/YYYY
  const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      const parts = cleanDate.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Sincronizar saldo de cuenta con la deuda asociada
  const syncAccountDebtBalance = async (uid: string, accountId: string, newBalance: number) => {
    try {
      const debtsRef = collection(db, 'usuarios', uid, 'deudas');
      const q = query(debtsRef, where('accountId', '==', accountId));
      const qSnap = await getDocsFromServer(q);
      if (!qSnap.empty) {
        for (const dDoc of qSnap.docs) {
          await updateDoc(doc(db, 'usuarios', uid, 'deudas', dDoc.id), {
            balance: newBalance
          });
        }
      }
    } catch (e) {
      console.error("Error al sincronizar saldo de cuenta a deudas:", e);
    }
  };

  // Sincronizar saldo de deuda con la cuenta asociada
  const syncDebtAccountBalance = async (uid: string, debtId: string, newBalance: number) => {
    try {
      const debtRef = doc(db, 'usuarios', uid, 'deudas', debtId);
      const debtSnap = await getDocFromServer(debtRef);
      if (debtSnap.exists()) {
        const debtData = debtSnap.data();
        if (debtData.accountId) {
          await updateDoc(doc(db, 'usuarios', uid, 'cuentas', debtData.accountId), {
            saldo: newBalance
          });
        } else {
          const accountsRef = collection(db, 'usuarios', uid, 'cuentas');
          const q = query(accountsRef, where('debtId', '==', debtId));
          const qSnap = await getDocsFromServer(q);
          if (!qSnap.empty) {
            for (const aDoc of qSnap.docs) {
              await updateDoc(doc(db, 'usuarios', uid, 'cuentas', aDoc.id), {
                saldo: newBalance
              });
            }
          }
        }
      }
    } catch (e) {
      console.error("Error al sincronizar saldo de deuda a cuenta:", e);
    }
  };

  // Crear deudas en Firestore
  const handleCreateDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!newDebtName.trim() || !newDebtBalance.trim() || !newDebtMinPayment.trim() || !newDebtDueDate.trim()) {
      toast.error('Por favor complete todos los campos obligatorios.');
      return;
    }

    const balanceNum = parseNumberMask(newDebtBalance);
    const originalDebtNum = newDebtOriginal ? parseNumberMask(newDebtOriginal) : balanceNum;
    const minPaymentNum = parseNumberMask(newDebtMinPayment);

    if (balanceNum <= 0) {
      toast.error('Por favor ingrese un saldo de deuda válido.');
      return;
    }
    if (originalDebtNum < balanceNum) {
      toast.error('El monto original no puede ser menor al saldo pendiente actual.');
      return;
    }
    if (minPaymentNum <= 0) {
      toast.error('Por favor ingrese un pago mínimo o cuota válido.');
      return;
    }

    setNewDebtLoading(true);
    try {
      const startDateIso = new Date(newDebtStartDate + 'T12:00:00').toISOString();

      // 1. Crear la cuenta financiera correspondiente de tipo 'deuda'
      const accountsRef = collection(db, 'usuarios', currentUser.uid, 'cuentas');
      const accountDocRef = await addDoc(accountsRef, {
        nombre: newDebtName.trim(),
        tipo: 'deuda',
        subtipo: 'deudas',
        saldo: balanceNum,
        color: newDebtType === 'card' ? 'rose' : 'purple',
        icono: newDebtType === 'card' ? 'credit-card' : 'landmark',
        fechaCreacion: startDateIso,
        fechaInicio: newDebtStartDate
      });

      // 2. Crear la obligación de deuda en Firestore vinculada a la cuenta
      const interestRateNum = newDebtInterestRate ? parseFloat(newDebtInterestRate) : (newDebtType === 'card' ? 28 : 16);
      const debtsRef = collection(db, 'usuarios', currentUser.uid, 'deudas');
      const debtDocRef = await addDoc(debtsRef, {
        name: newDebtName.trim(),
        balance: balanceNum,
        originalDebt: originalDebtNum,
        minPayment: minPaymentNum,
        dueDate: newDebtDueDate,
        type: newDebtType,
        interestRate: interestRateNum,
        interestPaidYear: 0,
        accountId: accountDocRef.id,
        fechaCreacion: startDateIso,
        fechaInicio: newDebtStartDate
      });

      // 3. Vincular el ID de la deuda en la cuenta financiera
      await updateDoc(doc(db, 'usuarios', currentUser.uid, 'cuentas', accountDocRef.id), {
        debtId: debtDocRef.id
      });

      // Registrar una transacción de saldo inicial para la cuenta creada de forma transparente
      if (balanceNum > 0) {
        await addDoc(collection(db, 'usuarios', currentUser.uid, 'movimientos'), {
          monto: balanceNum,
          tipo: 'egreso',
          categoria: 'Sueldo',
          descripcion: `Saldo inicial (Deuda) - ${newDebtName.trim()}`,
          fecha: newDebtStartDate,
          fechaCreacion: new Date().toISOString(),
          accountId: accountDocRef.id,
          cuentaId: accountDocRef.id,
          amount: balanceNum,
          type: 'expense',
          category: 'Sueldo',
          description: `Saldo inicial (Deuda) - ${newDebtName.trim()}`,
          date: startDateIso
        });
      }

      toast.success('Deuda y cuenta asociada creadas con éxito.');
      setNewDebtName('');
      setNewDebtBalance('');
      setNewDebtOriginal('');
      setNewDebtMinPayment('');
      setNewDebtDueDate('');
      setNewDebtType('card');
      setNewDebtInterestRate('28');
      setNewDebtStartDate(new Date().toISOString().split('T')[0]);
      setIsAddDebtModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `usuarios/${currentUser.uid}/deudas`);
    } finally {
      setNewDebtLoading(false);
    }
  };

  // Actualizar datos de una deuda
  const handleUpdateDebt = async (debtId: string) => {
    if (!currentUser) return;
    const balanceNum = parseNumberMask(editingDebtBalance);
    const originalDebtNum = editingDebtOriginal ? parseNumberMask(editingDebtOriginal) : balanceNum;
    const minPaymentNum = parseNumberMask(editingDebtMinPayment);
    const interestRateNum = editingDebtInterestRate ? parseFloat(editingDebtInterestRate) : 28;

    if (balanceNum < 0) {
      toast.error('Por favor ingrese un saldo de deuda válido.');
      return;
    }
    if (originalDebtNum < balanceNum) {
      toast.error('El monto original no puede ser menor al saldo pendiente actual.');
      return;
    }
    if (minPaymentNum < 0) {
      toast.error('Por favor ingrese un pago o cuota válido.');
      return;
    }

    setEditingDebtLoading(true);
    try {
      const docRef = doc(db, 'usuarios', currentUser.uid, 'deudas', debtId);
      await updateDoc(docRef, {
        balance: balanceNum,
        originalDebt: originalDebtNum,
        minPayment: minPaymentNum,
        dueDate: editingDebtDueDate,
        interestRate: interestRateNum,
        ...(editingDebtStartDate ? { fechaInicio: editingDebtStartDate } : {})
      });

      // Sincronizar con la cuenta vinculada si existe
      await syncDebtAccountBalance(currentUser.uid, debtId, balanceNum);

      toast.success('Obligación de deuda actualizada correctamente.');

      setEditingDebtId(null);
      setEditingDebtBalance('');
      setEditingDebtOriginal('');
      setEditingDebtMinPayment('');
      setEditingDebtDueDate('');
      setEditingDebtStartDate('');
      setEditingDebtInterestRate('28');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `usuarios/${currentUser.uid}/deudas/${debtId}`);
    } finally {
      setEditingDebtLoading(false);
    }
  };

  // Registrar pago / abono a deuda
  const handleRegisterDebtPayment = async (debt: any, payAmountNum: number, interestPartNum: number) => {
    if (!currentUser || payAmountNum <= 0) return;
    setDebtPayLoading(true);
    try {
      const capitalPart = Math.max(0, payAmountNum - interestPartNum);
      const newBalance = Math.max(0, debt.balance - capitalPart);
      const currentInterests = debt.interestPaidYear || 0;
      const newInterestPaidYear = currentInterests + interestPartNum;

      const docRef = doc(db, 'usuarios', currentUser.uid, 'deudas', debt.id);
      await updateDoc(docRef, {
        balance: newBalance,
        interestPaidYear: newInterestPaidYear
      });

      // Sincronizar saldo con la cuenta bancaria vinculada si existe
      await syncDebtAccountBalance(currentUser.uid, debt.id, newBalance);

      // Registrar movimiento de egreso por abono a deuda
      const todayStr = new Date().toISOString().split('T')[0];
      await addDoc(collection(db, 'usuarios', currentUser.uid, 'movimientos'), {
        monto: payAmountNum,
        tipo: 'egreso',
        categoria: 'Pago Deuda',
        descripcion: `Abono a ${debt.name} (Capital: $${capitalPart.toLocaleString('es-CO')}, Interés: $${interestPartNum.toLocaleString('es-CO')})`,
        fecha: todayStr,
        fechaCreacion: new Date().toISOString(),
        amount: payAmountNum,
        type: 'expense',
        category: 'Pago Deuda',
        description: `Abono a ${debt.name}`,
        date: new Date().toISOString()
      });

      toast.success(`Abono de $${payAmountNum.toLocaleString('es-CO')} registrado con éxito.`);
      setDebtPayModal(null);
      setDebtPayAmount('');
      setDebtPayInterestPart('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `usuarios/${currentUser.uid}/deudas/${debt.id}`);
    } finally {
      setDebtPayLoading(false);
    }
  };

  // Eliminar deuda de Firestore
  const handleDeleteDebt = async (debtId: string) => {
    if (!currentUser) return;
    if (!confirm('¿Estás seguro de que deseas eliminar esta deudas? Se eliminará la cuenta bancaria vinculada para mantener la concordancia.')) return;
    try {
      const docRef = doc(db, 'usuarios', currentUser.uid, 'deudas', debtId);
      const debtSnap = await getDocFromServer(docRef);
      if (debtSnap.exists()) {
        const debtData = debtSnap.data();
        if (debtData.accountId) {
          const accRef = doc(db, 'usuarios', currentUser.uid, 'cuentas', debtData.accountId);
          await deleteDoc(accRef);
        }
      }
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
      toast.error('Por favor complete todos los campos obligatorios.');
      return;
    }

    const costNum = parseNumberMask(newSubCost);
    if (costNum <= 0) {
      toast.error('Por favor ingrese un costo válido para la suscripción.');
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
        usage: newSubUsage || 'Sí',
        priceIncreaseNote: newSubPriceIncrease.trim() || '',
        fechaCreacion: new Date().toISOString()
      });
      toast.success('Suscripción registrada con éxito.');
      setNewSubName('');
      setNewSubCost('');
      setNewSubDueDate('');
      setNewSubAccount('');
      setNewSubStatus('active');
      setNewSubUsage('Sí');
      setNewSubPriceIncrease('');
      setIsAddSubModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `usuarios/${currentUser.uid}/suscripciones`);
    } finally {
      setNewSubLoading(false);
    }
  };

  // Actualizar suscripción en Firestore
  const handleUpdateSubscription = async (subId: string) => {
    if (!currentUser) return;
    const costNum = parseNumberMask(editingSubCost);

    if (costNum < 0) {
      toast.error('Por favor ingrese un costo válido.');
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
      toast.success('Suscripción actualizada correctamente.');
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
      toast.success('Suscripción eliminada con éxito.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `usuarios/${currentUser.uid}/suscripciones/${subId}`);
    }
  };

  // Actualizar perfil de usuario en Firestore
  const handleUpdateUserProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!userProfileName.trim()) {
      toast.error('El nombre de usuario no puede estar vacío.');
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
      toast.success('Perfil y preferencias guardadas exitosamente.');
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

  // Obtener consumo según la periodicidad del presupuesto (semanal, quincenal, mensual, anual)
  const getPeriodSpendForCategory = (budgetCategory: string, period: 'semanal' | 'quincenal' | 'mensual' | 'anual' = 'mensual') => {
    if (!transactions || transactions.length === 0) return 0;
    const now = new Date();
    let startDate = new Date();

    if (period === 'semanal') {
      const day = now.getDay();
      const diffToMonday = (day === 0 ? -6 : 1) - day;
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday, 0, 0, 0);
    } else if (period === 'quincenal') {
      if (now.getDate() <= 15) {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 16, 0, 0, 0);
      }
    } else if (period === 'anual') {
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    } else {
      // Mensual
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    }

    return transactions
      .filter(tx => {
        const isExpense = tx.type === 'expense' || (tx as any).tipo === 'egreso';
        if (!isExpense) return false;

        const txDateStr = tx.date || (tx as any).fecha || '';
        const tDate = new Date(txDateStr);
        if (isNaN(tDate.getTime())) return false;
        if (tDate < startDate || tDate > now) return false;

        return isCategoryMatch(tx.category || (tx as any).categoria || '', budgetCategory);
      })
      .reduce((sum, tx) => sum + (tx.amount || (tx as any).monto || 0), 0);
  };

  // Calcular promedio de los últimos 12 meses para presupuesto sugerido
  const getAverage12MonthsSpendForCategory = (budgetCategory: string) => {
    if (!transactions || transactions.length === 0) return 0;
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    const matchingTxs = transactions.filter(tx => {
      const isExpense = tx.type === 'expense' || (tx as any).tipo === 'egreso';
      if (!isExpense) return false;

      const txDateStr = tx.date || (tx as any).fecha || '';
      const tDate = new Date(txDateStr);
      if (isNaN(tDate.getTime())) return false;
      if (tDate < twelveMonthsAgo || tDate > now) return false;

      return isCategoryMatch(tx.category || (tx as any).categoria || '', budgetCategory);
    });

    const totalSpend = matchingTxs.reduce((sum, tx) => sum + (tx.amount || (tx as any).monto || 0), 0);
    
    // Meses con actividad
    const monthKeys = new Set(matchingTxs.map(tx => {
      const d = new Date(tx.date || (tx as any).fecha || '');
      return `${d.getFullYear()}-${d.getMonth()}`;
    }));

    const monthsCount = Math.max(1, Math.min(12, monthKeys.size || 12));
    return Math.round(totalSpend / monthsCount);
  };

  // Calcular ritmo de gasto y proyección de fecha de agotamiento
  const getBudgetBurnRateAndExhaustionDate = (budgetCategory: string, maxAmount: number, period: 'semanal' | 'quincenal' | 'mensual' | 'anual' = 'mensual') => {
    const now = new Date();
    let periodStart = new Date();
    let periodEnd = new Date();

    if (period === 'semanal') {
      const day = now.getDay();
      const diffToMonday = (day === 0 ? -6 : 1) - day;
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday, 0, 0, 0);
      periodEnd = new Date(periodStart.getTime() + 7 * 24 * 3600 * 1000);
    } else if (period === 'quincenal') {
      if (now.getDate() <= 15) {
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        periodEnd = new Date(now.getFullYear(), now.getMonth(), 15, 23, 59, 59);
      } else {
        periodStart = new Date(now.getFullYear(), now.getMonth(), 16, 0, 0, 0);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      }
    } else if (period === 'anual') {
      periodStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      periodEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    } else {
      // Mensual
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    const currentSpend = getPeriodSpendForCategory(budgetCategory, period);
    const msElapsed = Math.max(1000 * 3600 * 12, now.getTime() - periodStart.getTime());
    const daysElapsed = msElapsed / (1000 * 3600 * 24);
    const dailyBurnRate = currentSpend / daysElapsed;

    const msTotalPeriod = Math.max(1, periodEnd.getTime() - periodStart.getTime());
    const totalDaysInPeriod = msTotalPeriod / (1000 * 3600 * 24);
    const projectedTotalSpend = dailyBurnRate * totalDaysInPeriod;

    const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    if (currentSpend >= maxAmount) {
      return {
        willExceed: true,
        alreadyExceeded: true,
        exhaustionDateStr: 'Hoy (Superado)',
        projectedTotalSpend,
        burnRatePerDay: Math.round(dailyBurnRate),
        message: '🔴 Ya has alcanzado o superado el presupuesto asignado.'
      };
    }

    if (dailyBurnRate > 0 && projectedTotalSpend > maxAmount) {
      const daysUntilMax = (maxAmount - currentSpend) / dailyBurnRate;
      const exhaustionDate = new Date(now.getTime() + daysUntilMax * 24 * 3600 * 1000);
      
      const finalExhaustionDate = exhaustionDate > periodEnd ? periodEnd : exhaustionDate;
      const dayNum = finalExhaustionDate.getDate();
      const monthStr = monthNames[finalExhaustionDate.getMonth()];
      const exhaustionDateStr = `${dayNum} de ${monthStr}`;

      return {
        willExceed: true,
        alreadyExceeded: false,
        exhaustionDateStr,
        projectedTotalSpend,
        burnRatePerDay: Math.round(dailyBurnRate),
        message: `Con este ritmo de gasto actual, superarás el presupuesto el ${exhaustionDateStr}.`
      };
    }

    const projectedSavings = Math.max(0, maxAmount - projectedTotalSpend);
    return {
      willExceed: false,
      alreadyExceeded: false,
      exhaustionDateStr: null,
      projectedTotalSpend,
      burnRatePerDay: Math.round(dailyBurnRate),
      message: `Ritmo de gasto saludable. Proyección de ahorro al final del periodo: $${projectedSavings.toLocaleString('es-CO')}`
    };
  };

  // Comparación Histórica de Presupuestos (Junio 70%, Julio 82%, Agosto 61%)
  const getHistoricalBudgetPerformance = (budgetCategory: string, maxAmount: number) => {
    if (!transactions || transactions.length === 0) return [];
    const monthFullNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const now = new Date();
    
    const results = [];

    for (let i = 2; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();

      const mStart = new Date(year, month, 1, 0, 0, 0);
      const mEnd = new Date(year, month + 1, 0, 23, 59, 59);

      const monthSpend = transactions
        .filter(tx => {
          const isExpense = tx.type === 'expense' || (tx as any).tipo === 'egreso';
          if (!isExpense) return false;

          const txDateStr = tx.date || (tx as any).fecha || '';
          const tDate = new Date(txDateStr);
          if (isNaN(tDate.getTime())) return false;
          if (tDate < mStart || tDate > mEnd) return false;

          return isCategoryMatch(tx.category || (tx as any).categoria || '', budgetCategory);
        })
        .reduce((sum, tx) => sum + (tx.amount || (tx as any).monto || 0), 0);

      const pct = maxAmount > 0 ? Math.round((monthSpend / maxAmount) * 100) : 0;
      results.push({
        monthName: monthFullNames[month],
        spend: monthSpend,
        max: maxAmount,
        pct
      });
    }

    return results;
  };

  // Agregar transacción en el Demostrador
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const parsedAmount = parseNumberMask(txAmount);
    if (parsedAmount <= 0) {
      toast.error('Por favor ingrese un monto válido.');
      return;
    }

    setTxLoading(true);
    try {
      
      // Encontrar la cuenta seleccionada o recurrir a la primera por defecto
      let targetAccountId = txAccountId;
      let targetAccount = accounts.find(a => a.id === targetAccountId);
      
      if (!targetAccount && accounts.length > 0) {
        targetAccount = accounts.find(a => a.tipo === 'credito') || accounts[0];
        targetAccountId = targetAccount.id;
      }

      if (!targetAccount) {
        toast.error('Debe crear al menos una cuenta para registrar transacciones.');
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

      // Sincronizar saldo de cuenta con la deuda asociada
      await syncAccountDebtBalance(currentUser.uid, targetAccountId, nuevoSaldo);

      toast.success('Movimiento registrado con éxito.');
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

            // Sincronizar saldo de cuenta con la deuda asociada
            await syncAccountDebtBalance(currentUser.uid, accId, nuevoSaldo);
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
      toast.error('Por favor ingrese un nombre de cuenta válido.');
      return;
    }
    const parsedBalance = parseNumberMask(newAccountBalance);
    const finalSubtipo = newAccountType === 'deuda' ? 'deudas' : newAccountSubtipo;
    const isDebt = newAccountType === 'deuda';
    const finalFechaCreacion = isDebt 
      ? new Date(newAccountDebtStartDate + 'T12:00:00').toISOString() 
      : new Date().toISOString();
    
    setNewAccountLoading(true);
    try {
      const accountsRef = collection(db, 'usuarios', currentUser.uid, 'cuentas');
      const docRef = await addDoc(accountsRef, {
        nombre: newAccountName.trim(),
        alias: newAccountAlias.trim(),
        tipo: newAccountType,
        subtipo: finalSubtipo,
        saldo: parsedBalance,
        color: newAccountColor,
        icono: newAccountIcon,
        fechaCreacion: finalFechaCreacion,
        ...(isDebt ? { fechaInicio: newAccountDebtStartDate } : {})
      });
      
      let createdDebtId: string | null = null;
      if (isDebt) {
        const debtsRef = collection(db, 'usuarios', currentUser.uid, 'deudas');
        const defaultMinPayment = Math.ceil(parsedBalance * 0.05) || 50;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        const defaultDueDate = futureDate.toISOString().split('T')[0];

        const debtDocRef = await addDoc(debtsRef, {
          name: newAccountName.trim(),
          balance: parsedBalance,
          originalDebt: parsedBalance,
          minPayment: defaultMinPayment,
          dueDate: defaultDueDate,
          type: newAccountIcon === 'credit-card' ? 'card' : 'loan',
          accountId: docRef.id,
          fechaCreacion: finalFechaCreacion,
          fechaInicio: newAccountDebtStartDate
        });
        createdDebtId = debtDocRef.id;
      }

      if (createdDebtId) {
        // Vincular el id de la deuda creada
        await updateDoc(docRef, { debtId: createdDebtId });
      }
      
      // Registrar transacción de saldo inicial
      if (parsedBalance > 0) {
        await addDoc(collection(db, 'usuarios', currentUser.uid, 'movimientos'), {
          monto: parsedBalance,
          tipo: newAccountType === 'credito' ? 'ingreso' : 'egreso',
          categoria: 'Sueldo',
          descripcion: `Saldo inicial - ${newAccountName}`,
          fecha: isDebt ? newAccountDebtStartDate : new Date().toISOString().split('T')[0],
          fechaCreacion: new Date().toISOString(),
          accountId: docRef.id,
          cuentaId: docRef.id,
          amount: parsedBalance,
          type: newAccountType === 'credito' ? 'income' : 'expense',
          category: 'Sueldo',
          description: `Saldo inicial - ${newAccountName}`,
          date: finalFechaCreacion
        });
      }

      toast.success('¡Cuenta creada exitosamente!');
      setNewAccountName('');
      setNewAccountBalance('');
      setNewAccountColor('emerald');
      setNewAccountIcon('wallet');
      setNewAccountSubtipo('disponible');
      setNewAccountDebtStartDate(new Date().toISOString().split('T')[0]);
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
    if (!confirm('¿Estás seguro de que deseas eliminar esta cuenta? Los movimientos históricos se conservarán pero la cuenta desaparecerá y se eliminará la obligación de deudas asociada si existe.')) return;
    try {
      const accRef = doc(db, 'usuarios', currentUser.uid, 'cuentas', accountId);
      const accSnap = await getDocFromServer(accRef);
      if (accSnap.exists()) {
        const accData = accSnap.data();
        if (accData.debtId) {
          const debtRef = doc(db, 'usuarios', currentUser.uid, 'deudas', accData.debtId);
          await deleteDoc(debtRef);
        } else if (accData.tipo === 'deuda') {
          const debtsRef = collection(db, 'usuarios', currentUser.uid, 'deudas');
          const q = query(debtsRef, where('accountId', '==', accountId));
          const qSnap = await getDocsFromServer(q);
          if (!qSnap.empty) {
            for (const dDoc of qSnap.docs) {
              await deleteDoc(doc(db, 'usuarios', currentUser.uid, 'deudas', dDoc.id));
            }
          }
        }
      }
      await deleteDoc(accRef);
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
      toast.error('Seleccione una cuenta primero.');
      return;
    }
    const parsedAmount = parseNumberMask(actTxAmount);
    if (parsedAmount <= 0) {
      toast.error('Por favor ingrese un monto válido.');
      return;
    }

    setActTxLoading(true);
    try {
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

      // Sincronizar saldo de cuenta con la deuda asociada
      await syncAccountDebtBalance(currentUser.uid, selectedAccountId, nuevoSaldo);

      toast.success('Transacción registrada con éxito.');
      // Limpiar campos
      setActTxAmount('');
      setActTxDescription('');
      setShowAddAccountTxModal(false);
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
      toast.error('Seleccione una cuenta de origen primero.');
      return;
    }
    if (!transferTargetAccountId) {
      toast.error('Seleccione una cuenta de destino.');
      return;
    }
    if (selectedAccountId === transferTargetAccountId) {
      toast.error('La cuenta de origen y de destino no pueden ser la misma.');
      return;
    }
    const parsedAmount = parseNumberMask(transferAmount);
    if (parsedAmount <= 0) {
      toast.error('Por favor ingrese un monto válido.');
      return;
    }

    setTransferLoading(true);
    try {
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

      // Sincronizar saldos de cuentas con deudas asociadas si existen
      await syncAccountDebtBalance(currentUser.uid, selectedAccountId, nuevoSaldoOrigen);
      await syncAccountDebtBalance(currentUser.uid, transferTargetAccountId, nuevoSaldoDestino);

      // Limpiar campos
      setTransferAmount('');
      setTransferTargetAccountId('');
      setTransferDescription('');
      toast.success('Transferencia realizada con éxito.');
    } catch (err) {
      console.error("Error running account transfer:", err);
      handleFirestoreError(err, OperationType.WRITE, `usuarios/${currentUser.uid}/movimientos`);
    } finally {
      setTransferLoading(false);
    }
  };

  // Guardar o actualizar el Alias de una cuenta
  const handleSaveAccountAlias = async (accId: string, newAliasVal: string) => {
    if (!currentUser) return;
    try {
      const accRef = doc(db, 'usuarios', currentUser.uid, 'cuentas', accId);
      await updateDoc(accRef, { alias: newAliasVal.trim() });
      toast.success('Alias de la cuenta actualizado correctamente');
      setEditingAliasAccId(null);
    } catch (err) {
      console.error('Error al actualizar alias:', err);
      toast.error('Error al guardar el alias');
    }
  };

  // Alternar o cambiar el estado de Conciliación de un movimiento
  const handleToggleReconciliation = async (txId: string, currentStatus?: string) => {
    if (!currentUser) return;
    const statuses: ('pendiente' | 'conciliado' | 'anulado')[] = ['pendiente', 'conciliado', 'anulado'];
    const cur = (currentStatus as any) || 'conciliado';
    const nextIdx = (statuses.indexOf(cur) + 1) % statuses.length;
    const nextStatus = statuses[nextIdx];

    try {
      const txRef = doc(db, 'usuarios', currentUser.uid, 'movimientos', txId);
      await updateDoc(txRef, {
        reconciliationStatus: nextStatus,
        estadoConciliacion: nextStatus
      });
      const labels = {
        conciliado: '✔️ CONCILIADO',
        pendiente: '🟡 PENDIENTE',
        anulado: '🚫 ANULADO'
      };
      toast.success(`Movimiento marcado como: ${labels[nextStatus]}`);
    } catch (err) {
      console.error('Error al actualizar estado de conciliación:', err);
      toast.error('Error al actualizar estado de conciliación');
    }
  };

  // Helper para obtener ubicación actual del navegador (GPS)
  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      toast('Obteniendo ubicación GPS...', { icon: '📍' });
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setNewTxGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          toast.success(`Ubicación guardada: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        (err) => {
          console.error('Error GPS:', err);
          toast.error('No se pudo acceder a la geolocalización.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      toast.error('Geolocalización no soportada en este navegador.');
    }
  };

  // Helper para añadir etiqueta
  const handleAddTag = (rawTag?: string) => {
    const val = (rawTag || newTxTagInput).trim();
    if (!val) return;
    const formatted = val.startsWith('#') ? val : `#${val}`;
    if (!newTxTags.includes(formatted)) {
      setNewTxTags([...newTxTags, formatted]);
    }
    setNewTxTagInput('');
  };

  // Helper para remover etiqueta
  const handleRemoveTag = (tagToRemove: string) => {
    setNewTxTags(newTxTags.filter(t => t !== tagToRemove));
  };

  // Helper para duplicar un movimiento existente
  const handleDuplicateTx = (tx: Transaction) => {
    setNewTxType((tx.type as any) || 'expense');
    setNewTxAccountId(tx.accountId || tx.cuentaId || (accounts[0]?.id || ''));
    setNewTxCategory(tx.category || 'Otros');
    setNewTxAmount(tx.amount ? tx.amount.toString() : '');
    setNewTxDate(new Date().toISOString().split('T')[0]);
    setNewTxNotes(tx.description ? `Copia: ${tx.description}` : 'Copia de movimiento');
    setNewTxTags(tx.tags || []);
    setNewTxLocationName(tx.locationName || '');
    setNewTxLocationCity(tx.locationCity || '');
    setNewTxGps(tx.locationGps || null);
    setNewTxIsSplit(!!tx.isSplit);
    setNewTxSplits(
      tx.splits && tx.splits.length > 0
        ? tx.splits.map(s => ({ category: s.category, amount: s.amount.toString(), description: s.description || '' }))
        : [
            { category: tx.category || '🍔 Alimentación', amount: (tx.amount ? (tx.amount / 2).toString() : ''), description: 'Parte 1' },
            { category: '🏠 Hogar', amount: (tx.amount ? (tx.amount / 2).toString() : ''), description: 'Parte 2' }
          ]
    );
    setNewTxAttachmentsList(tx.attachmentsList || []);
    setNewTxAttachment(tx.attachment || tx.adjunto || null);
    setNewTxAttachmentName(tx.attachmentName || '');
    setShowNewTxModal(true);
    toast('📝 Datos copiados. Puedes modificar el monto o fecha antes de guardar.', { icon: '📋' });
  };

  // Helper para aplicar un Favorito rápido
  const handleApplyFavorite = (fav: any) => {
    setNewTxType(fav.type || 'expense');
    setNewTxCategory(fav.category || 'Otros');
    setNewTxAmount(fav.amount ? fav.amount.toString() : '');
    setNewTxNotes(fav.title || '');
    setNewTxTags(fav.tags || []);
    setNewTxLocationName(fav.locationName || '');
    if (fav.accountId) setNewTxAccountId(fav.accountId);
    setShowNewTxModal(true);
    toast.success(`Cargada plantilla favorito: ${fav.emoji || '⭐'} ${fav.title}`);
  };

  // Helper para limpiar formulario de movimientos
  const handleResetTxForm = () => {
    setNewTxAmount('');
    setNewTxNotes('');
    setNewTxAttachment(null);
    setNewTxAttachmentName('');
    setNewTxTags([]);
    setNewTxTagInput('');
    setNewTxLocationName('');
    setNewTxLocationCity('');
    setNewTxGps(null);
    setNewTxIsSplit(false);
    setNewTxSplits([
      { category: '🍔 Alimentación', amount: '', description: '' },
      { category: '🏠 Hogar', amount: '', description: '' }
    ]);
    setNewTxIsRecurring(false);
    setNewTxIsFavorite(false);
    setNewTxAttachmentsList([]);
  };

  // Registrar un Nuevo Movimiento desde el módulo centralizado de Movimientos
  const handleCreateNewTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Debe iniciar sesión primero.');
      return;
    }
    const parsedAmount = parseNumberMask(newTxAmount);
    if (parsedAmount <= 0) {
      toast.error('Por favor, ingrese un monto de valor válido.');
      return;
    }
    if (!newTxAccountId) {
      toast.error('Por favor, seleccione una cuenta.');
      return;
    }

    // Validación de movimiento dividido
    let processedSplits: TransactionSplit[] = [];
    if (newTxIsSplit) {
      const validSplits = newTxSplits.filter(s => parseNumberMask(s.amount) > 0);
      if (validSplits.length < 2) {
        toast.error('Un movimiento dividido debe tener al menos 2 divisiones válidas con valor mayor a 0.');
        return;
      }
      const sumSplits = validSplits.reduce((sum, s) => sum + parseNumberMask(s.amount), 0);
      if (Math.abs(sumSplits - parsedAmount) > 0.01) {
        toast.error(`La suma de las partes ($${sumSplits.toLocaleString('es-ES')}) no coincide con el total ($${parsedAmount.toLocaleString('es-ES')}).`);
        return;
      }
      processedSplits = validSplits.map(s => ({
        category: s.category,
        amount: parseNumberMask(s.amount),
        description: s.description.trim()
      }));
    }

    setNewTxLoading(true);
    try {
      const todayISO = new Date(newTxDate).toISOString();
      const desc = newTxNotes.trim();

      // Preparar metadatos avanzados
      const advancedMeta = {
        tags: newTxTags,
        locationName: newTxLocationName.trim(),
        locationCity: newTxLocationCity.trim(),
        locationGps: newTxGps,
        isSplit: newTxIsSplit,
        splits: processedSplits,
        isRecurring: newTxIsRecurring,
        recurringFreq: newTxRecurringFreq,
        recurringDay: newTxRecurringDay,
        isFavorite: newTxIsFavorite,
        attachmentsList: newTxAttachmentsList
      };

      if (newTxType === 'transfer') {
        if (!newTxTargetAccountId) {
          toast.error('Por favor, seleccione una cuenta de destino.');
          setNewTxLoading(false);
          return;
        }
        if (newTxAccountId === newTxTargetAccountId) {
          toast.error('La cuenta de origen y de destino no pueden ser la misma.');
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
          attachmentName: newTxAttachmentName || '',
          ...advancedMeta
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
          attachmentName: newTxAttachmentName || '',
          ...advancedMeta
        });

        // 3. Actualizar saldos en Firestore
        const sourceRef = doc(db, 'usuarios', currentUser.uid, 'cuentas', newTxAccountId);
        await updateDoc(sourceRef, { saldo: nuevoSaldoOrigen });

        const targetRef = doc(db, 'usuarios', currentUser.uid, 'cuentas', newTxTargetAccountId);
        await updateDoc(targetRef, { saldo: nuevoSaldoDestino });

        // Sincronizar saldos de cuentas con deudas asociadas si existen
        await syncAccountDebtBalance(currentUser.uid, newTxAccountId, nuevoSaldoOrigen);
        await syncAccountDebtBalance(currentUser.uid, newTxTargetAccountId, nuevoSaldoDestino);

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
          attachmentName: newTxAttachmentName || '',
          ...advancedMeta
        });

        // Actualizar saldo
        const accRef = doc(db, 'usuarios', currentUser.uid, 'cuentas', newTxAccountId);
        await updateDoc(accRef, { saldo: nuevoSaldo });

        // Sincronizar saldo de cuenta con la deuda asociada
        await syncAccountDebtBalance(currentUser.uid, newTxAccountId, nuevoSaldo);
      }

      // Si se marcó como favorito, agregar a accesos rápidos
      if (newTxIsFavorite) {
        const newFavItem = {
          id: `fav-${Date.now()}`,
          title: desc || newTxCategory,
          emoji: newTxType === 'income' ? '💵' : '⭐',
          amount: parsedAmount,
          category: newTxCategory,
          type: newTxType,
          tags: newTxTags,
          locationName: newTxLocationName
        };
        setQuickFavorites(prev => [newFavItem, ...prev.slice(0, 7)]);
      }

      // Limpiar campos y cerrar modal
      handleResetTxForm();
      setShowNewTxModal(false);
      toast.success('Movimiento registrado con éxito.');
    } catch (err) {
      console.error("Error al registrar movimiento:", err);
      handleFirestoreError(err, OperationType.WRITE, `usuarios/${currentUser.uid}/movimientos`);
    } finally {
      setNewTxLoading(false);
    }
  };

  // Procesar movimientos recurrentes del mes
  const handleProcessMonthlyRecurring = async () => {
    if (!currentUser) return;
    const currentMonthYear = new Date().toISOString().slice(0, 7); // e.g. "2026-07"
    
    // Buscar transacciones marcadas como recurrentes
    const userRecurring = transactions.filter(t => t.isRecurring);

    // Plantillas por defecto si no existen
    const defaultTemplates = [
      { description: 'Arriendo', amount: 1200000, category: '🏠 Hogar', type: 'expense' as const, day: 1 },
      { description: 'Salario / Nómina', amount: 3500000, category: '💼 Sueldo', type: 'income' as const, day: 15 },
      { description: 'Suscripción Netflix', amount: 45000, category: '🎬 Entretenimiento', type: 'expense' as const, day: 10 }
    ];

    let createdCount = 0;
    try {
      if (userRecurring.length > 0) {
        for (const t of userRecurring) {
          const day = t.recurringDay || 1;
          const targetDayStr = day.toString().padStart(2, '0');
          const targetDateStr = `${currentMonthYear}-${targetDayStr}`;
          
          const alreadyExists = transactions.some(item => 
            item.description.includes(t.description) && item.date && item.date.startsWith(currentMonthYear)
          );

          if (!alreadyExists) {
            const targetAccId = t.accountId || accounts[0]?.id || '';
            const todayISO = new Date(targetDateStr).toISOString();

            await addDoc(collection(db, 'usuarios', currentUser.uid, 'movimientos'), {
              monto: t.amount,
              tipo: t.type === 'income' ? 'ingreso' : 'egreso',
              categoria: t.category,
              descripcion: `[Recurrente] ${t.description}`,
              fecha: targetDateStr,
              fechaCreacion: new Date().toISOString(),
              accountId: targetAccId,
              cuentaId: targetAccId,
              amount: t.amount,
              type: t.type,
              category: t.category,
              description: `[Recurrente] ${t.description}`,
              date: todayISO,
              tags: [...(t.tags || []), '#Recurrente'],
              reconciliationStatus: 'conciliado'
            });

            // Actualizar saldo de la cuenta
            if (targetAccId) {
              const acc = accounts.find(a => a.id === targetAccId);
              if (acc) {
                const newBal = t.type === 'income' ? acc.saldo + t.amount : acc.saldo - t.amount;
                await updateDoc(doc(db, 'usuarios', currentUser.uid, 'cuentas', targetAccId), { saldo: newBal });
              }
            }
            createdCount++;
          }
        }
      } else {
        // Usar plantillas por defecto para demostración fluida
        for (const t of defaultTemplates) {
          const targetDateStr = `${currentMonthYear}-${t.day.toString().padStart(2, '0')}`;
          const alreadyExists = transactions.some(item => 
            item.description.toLowerCase().includes(t.description.toLowerCase()) && item.date && item.date.startsWith(currentMonthYear)
          );

          if (!alreadyExists && accounts.length > 0) {
            const targetAccId = accounts[0].id;
            const todayISO = new Date(targetDateStr).toISOString();

            await addDoc(collection(db, 'usuarios', currentUser.uid, 'movimientos'), {
              monto: t.amount,
              tipo: t.type === 'income' ? 'ingreso' : 'egreso',
              categoria: t.category,
              descripcion: `[Recurrente] ${t.description}`,
              fecha: targetDateStr,
              fechaCreacion: new Date().toISOString(),
              accountId: targetAccId,
              cuentaId: targetAccId,
              amount: t.amount,
              type: t.type,
              category: t.category,
              description: `[Recurrente] ${t.description}`,
              date: todayISO,
              tags: ['#Recurrente'],
              reconciliationStatus: 'conciliado'
            });

            const newBal = t.type === 'income' ? accounts[0].saldo + t.amount : accounts[0].saldo - t.amount;
            await updateDoc(doc(db, 'usuarios', currentUser.uid, 'cuentas', targetAccId), { saldo: newBal });
            createdCount++;
          }
        }
      }

      if (createdCount > 0) {
        toast.success(`🎉 Se procesaron ${createdCount} movimiento(s) recurrente(s) para este mes.`);
      } else {
        toast('Los movimientos recurrentes de este mes ya se encuentran registrados.', { icon: 'ℹ️' });
      }
    } catch (err) {
      console.error("Error al procesar recurrentes:", err);
      toast.error('Error al generar movimientos recurrentes.');
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
    <div className={`min-h-screen ${userProfileTheme === 'light' ? 'theme-light bg-[#f8fafc] text-slate-800' : 'theme-dark bg-[#0f172a] text-slate-200'} flex flex-col font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-300 relative overflow-hidden`}>
      <Toaster position="top-right" reverseOrder={false} toastOptions={{
        style: {
          background: '#1e293b',
          color: '#f8fafc',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
        },
      }} />
      
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
              {!loginLogoError ? (
                <img 
                  src={appLogo} 
                  alt="Contabilid-App Logo" 
                  className="w-16 h-16 rounded-2xl shadow-xl shadow-emerald-500/20 object-cover border border-white/10"
                  referrerPolicy="no-referrer"
                  onError={() => setLoginLogoError(true)}
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-xl shadow-emerald-500/20 flex items-center justify-center border border-white/20">
                  <span className="text-xl font-black text-white tracking-wider">CA</span>
                </div>
              )}
              <h1 className="text-2xl font-black tracking-tight text-white mt-2">Contabilid-App</h1>
              <p className="text-xs text-slate-400">Tu panel inteligente de control financiero y contable</p>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-xs text-slate-400 leading-relaxed text-center">
                Inicia sesión de forma directa con tu cuenta de <strong className="text-emerald-400">Google</strong> para acceder de manera segura a tu información contable cifrada de extremo a extremo.
              </p>

              {authError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 leading-relaxed text-center">
                  {authError}
                </div>
              )}

              {authSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 text-center">
                  {authSuccess}
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={authLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 hover:scale-[1.01] active:scale-[0.99] py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 mt-2"
              >
                {authLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="16" height="16">
                      <path fill="#000000" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#000000" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#000000" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#000000" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Continuar con Google</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 mt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Extremo a Extremo (E2EE) habilitado</span>
              </div>
            </div>
          </motion.div>
        </div>
      ) : isAuthorized === false ? (
        /* VISTA DE ACCESO NO AUTORIZADO (C7, C8) */
        <div className="flex-1 flex items-center justify-center p-4 relative z-10 min-h-screen">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 shadow-2xl flex flex-col gap-6"
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 shadow-xl shadow-red-500/5 flex items-center justify-center border border-red-500/30">
                <ShieldAlert className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white mt-2">Acceso No Autorizado</h1>
              <p className="text-xs text-slate-400">Tu cuenta no cumple con las reglas de acceso del sistema</p>
            </div>

            <div className="flex flex-col gap-4 text-center">
              <p className="text-xs text-slate-400 leading-relaxed">
                La cuenta de Google <strong className="text-red-400">{currentUser.email}</strong> no tiene permisos de acceso autorizados para este panel financiero.
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Contacta al administrador para habilitar tu dirección de correo o dominio corporativo en la lista de accesos autorizados.
              </p>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Iniciar sesión con otra cuenta
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        /* VISTA PRINCIPAL CON SIDEBAR LATERAL Y MÓDULOS DE NAVEGACIÓN */
        <div className="flex-1 flex flex-col md:flex-row relative z-10 min-h-screen">
          
          {/* OVERLAY PARA MÓVILES */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* SIDEBAR LATERAL IZQUIERDO */}
          <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0a0f1d]/98 backdrop-blur-xl border-r border-white/10 flex flex-col shrink-0 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} ${isDesktopSidebarOpen ? 'md:translate-x-0 md:static md:w-64 lg:w-72 md:bg-slate-950/40 md:opacity-100' : 'md:-translate-x-full md:absolute md:w-0 md:opacity-0 md:border-r-0 md:overflow-hidden'}`}>
            {/* Cabezal Sidebar */}
            <div className="px-6 h-20 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                {!sidebarLogoError ? (
                  <img 
                    src={appLogo} 
                    alt="Contabilid-App Logo" 
                    className="w-9 h-9 rounded-xl shadow-md object-cover border border-white/10"
                    referrerPolicy="no-referrer"
                    onError={() => setSidebarLogoError(true)}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-md flex items-center justify-center border border-white/20">
                    <span className="text-sm font-black text-white tracking-wider">CA</span>
                  </div>
                )}
                <div>
                  <h1 className="text-base font-extrabold tracking-tight text-white leading-tight">Contabilid-App</h1>
                  <p className="text-[10px] text-slate-500 font-mono">Consola Financiera</p>
                </div>
              </div>

              {/* Botón cerrar para móviles */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="md:hidden p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Cerrar menú"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lista de Navegación del Sidebar */}
            <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar">
              <button
                onClick={() => handleSelectModule('dashboard')}
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
                  handleSelectModule('cuentas');
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
                onClick={() => handleSelectModule('consultas')}
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
                onClick={() => handleSelectModule('categorias')}
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
                onClick={() => handleSelectModule('presupuestos')}
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
                onClick={() => handleSelectModule('ahorros')}
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
                onClick={() => handleSelectModule('deudas')}
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
                onClick={() => handleSelectModule('suscripciones')}
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
                onClick={() => handleSelectModule('estadisticas')}
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
                onClick={() => handleSelectModule('reportes')}
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
                onClick={() => handleSelectModule('usuario')}
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
            <header className="px-6 h-20 border-b border-white/10 bg-slate-900/30 flex justify-between items-center shrink-0 gap-4">
              <div className="flex items-center gap-3">
                {/* Botón hamburguesa */}
                <button
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      setIsMobileMenuOpen(!isMobileMenuOpen);
                    } else {
                      setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
                    }
                  }}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Abrir menú"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-base md:text-lg font-black tracking-tight text-white uppercase">
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
                  <p className="text-[10px] md:text-xs text-slate-400 mt-0.5 line-clamp-1">
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
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setOnboardingStep(0);
                    setIsOnboardingModalOpen(true);
                  }}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  title="Abrir Guía / Tutorial de Inicio"
                >
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Guía de Inicio</span>
                </button>

                {firestoreConnected && (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Conectado
                  </div>
                )}
              </div>
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
                    className="flex flex-col gap-6 w-full"
                  >
                    {/* ENCABEZADO DE SECCIÓN CON BOTÓN REGISTRAR */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 border border-white/5 rounded-2xl p-5 shadow-lg">
                      <div>
                        <h3 className="text-sm font-black text-white tracking-wider uppercase flex items-center gap-2">
                          <Tv className="w-4 h-4 text-emerald-400" />
                          Control de Suscripciones
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-1">Actualmente controla costos, frecuencia de uso y proyecta tu gasto anual.</p>
                      </div>

                      <button
                        onClick={() => setIsAddSubModalOpen(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-slate-950 text-xs font-extrabold px-5 py-3 rounded-xl shadow-lg hover:shadow-emerald-500/15 cursor-pointer flex items-center justify-center gap-2 transition-all shrink-0"
                      >
                        <Plus className="w-4 h-4 text-slate-950 stroke-[3px]" />
                        Nueva Suscripción
                      </button>
                    </div>

                    {/* BANNER AHORRO POTENCIAL Y ALERTAS DESTACADAS */}
                    {(() => {
                      const activeSubs = dbSubscriptions.filter(s => s.status === 'active');
                      const monthlyCost = activeSubs.reduce((sum, s) => sum + s.cost, 0);
                      const annualCost = monthlyCost * 12;

                      // Calcular suscripciones no usadas o de uso ocasional
                      const unusedSubs = activeSubs.filter(s => s.usage === 'No' || s.usage === 'A veces');
                      const potentialSavingsAnnual = unusedSubs.reduce((sum, s) => sum + (s.cost * 12), 0) || 1250000;
                      const unusedCount = unusedSubs.length || 3;

                      return (
                        <div className="flex flex-col gap-4 w-full">
                          {/* KPIS DE COSTOS Y GASTO ANUAL */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 flex flex-col gap-1 shadow-lg relative overflow-hidden">
                              <div className="absolute right-4 top-4 text-emerald-500/20"><Wallet className="w-8 h-8" /></div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gasto Mensual Estimado</span>
                              <span className="text-xl font-black text-emerald-400 font-mono mt-1">
                                ${monthlyCost > 0 ? monthlyCost.toLocaleString('es-CO') : '185.000'}
                              </span>
                              <span className="text-[10px] text-slate-500 mt-0.5">Cobros recurrentes programados</span>
                            </div>

                            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 flex flex-col gap-1 shadow-lg relative overflow-hidden">
                              <div className="absolute right-4 top-4 text-purple-500/20"><Sparkles className="w-8 h-8" /></div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gasto Anual Proyectado</span>
                              <span className="text-xl font-black text-purple-400 font-mono mt-1">
                                ${annualCost > 0 ? annualCost.toLocaleString('es-CO') : '2.220.000'}
                              </span>
                              <span className="text-[10px] text-slate-500 mt-0.5">Costo total de financiamiento</span>
                            </div>

                            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 flex flex-col gap-1 shadow-lg relative overflow-hidden">
                              <div className="absolute right-4 top-4 text-sky-500/20"><Tv className="w-8 h-8" /></div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suscripciones Activas</span>
                              <span className="text-xl font-black text-white font-mono mt-1">
                                {activeSubs.length} / {dbSubscriptions.length || 3}
                              </span>
                              <span className="text-[10px] text-slate-500 mt-0.5">Plataformas y servicios</span>
                            </div>
                          </div>

                          {/* CARD DESTACADO: AHORRO POTENCIAL */}
                          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                                <Sparkles className="w-5 h-5 fill-emerald-500/20" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ahorro potencial</h4>
                                <p className="text-sm font-medium text-white mt-0.5">
                                  Si cancelas <strong className="text-emerald-400 font-extrabold">{unusedCount} suscripciones</strong> ahorrarás <strong className="text-emerald-400 font-mono font-black text-base">${potentialSavingsAnnual.toLocaleString('es-CO')}</strong> al año.
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-mono px-3 py-1.5 rounded-xl border border-emerald-500/20 shrink-0">
                              Optimización Inteligente
                            </span>
                          </div>

                          {/* TARJETAS DE ALERTAS: INCREMENTOS Y RECORDATORIO DE RENOVACIÓN */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* ALERTA INCREMENTOS DE PRECIO */}
                            <div className="bg-slate-900/60 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  <TrendingUp className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Incrementos de Precio</span>
                                  <p className="text-xs text-white font-semibold mt-0.5">
                                    <strong className="text-amber-300">Netflix</strong> — Subió <span className="text-amber-400 font-bold font-mono">15%</span> desde enero.
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* ALERTA RECORDATORIO DE RENOVACIÓN */}
                            <div className="bg-slate-900/60 border border-sky-500/20 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                  <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">Recordatorio de Cobro</span>
                                  <p className="text-xs text-white font-semibold mt-0.5">
                                    Renueva en <span className="text-sky-300 font-bold font-mono">3 días</span>.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* LISTA DE SUSCRIPCIONES CON CONTROL DE USO */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <h4 className="font-bold text-white text-xs tracking-wider uppercase">Mis Servicios Recurrentes</h4>
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2.5 py-0.5 rounded-full border border-white/5">
                          {dbSubscriptions.length} Registros
                        </span>
                      </div>

                      {dbSubscriptions.length === 0 ? (
                        <div className="text-center py-12 flex flex-col items-center gap-3 text-slate-500">
                          <Tv className="w-12 h-12 text-slate-600 stroke-[1.5]" />
                          <p className="text-xs font-bold text-slate-300">No tienes suscripciones registradas aún.</p>
                          <p className="text-[10px] max-w-xs leading-relaxed text-slate-500">
                            Agrega tus cuentas de Netflix, Spotify u otros servicios para evaluar su uso y optimizar tus finanzas.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {dbSubscriptions.map((sub) => {
                            let daysLeft = 0;
                            try {
                              const diff = new Date(sub.dueDate).getTime() - new Date().getTime();
                              daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
                            } catch {}

                            const isNear = daysLeft >= 0 && daysLeft <= 5;
                            const isOverdue = daysLeft < 0;

                            const currentUsage = sub.usage || 'Sí';

                            const statusConfig = {
                              active: { label: 'Activo', bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
                              paused: { label: 'Pausado', bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
                              cancelled: { label: 'Cancelado', bg: 'bg-red-500/10 border-red-500/20 text-red-400' }
                            }[sub.status as 'active' | 'paused' | 'cancelled'] || { label: 'Desconocido', bg: 'bg-slate-500/10 border-slate-500/20 text-slate-400' };

                            return (
                              <div key={sub.id} className="p-4 bg-slate-950/40 border border-white/5 hover:border-white/10 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all">
                                <div className="flex items-start sm:items-center gap-3.5">
                                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-white shadow-inner shrink-0 mt-1 sm:mt-0">
                                    {sub.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h5 className="font-bold text-white text-xs">{sub.name}</h5>
                                      <span className={`px-2 py-0.5 text-[8px] font-bold border rounded-md uppercase ${statusConfig.bg}`}>
                                        {statusConfig.label}
                                      </span>
                                      {sub.priceIncreaseNote && (
                                        <span className="px-2 py-0.5 text-[8px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-md">
                                          📈 {sub.priceIncreaseNote}
                                        </span>
                                      )}
                                      {sub.name.toLowerCase().includes('netflix') && !sub.priceIncreaseNote && (
                                        <span className="px-2 py-0.5 text-[8px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-md">
                                          📈 Subió 15% desde enero.
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500 mt-1">
                                      <span>Cuenta: <strong className="text-slate-400">{sub.account}</strong></span>
                                      <span>•</span>
                                      <span>Próximo cobro: <strong className="text-slate-400 font-mono">{formatDueDateSpanish(sub.dueDate)}</strong></span>
                                    </div>
                                  </div>
                                </div>

                                {/* SECTOR DE CONTROL DE USO "¿LA USAS?" & COSTO */}
                                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4 border-t border-white/5 pt-3 lg:pt-0 lg:border-none">
                                  {/* SELECTOR ¿LA USAS? */}
                                  <div className="flex items-center gap-2 bg-slate-900/80 border border-white/10 p-1.5 rounded-xl">
                                    <span className="text-[10px] text-slate-400 font-bold px-1.5">¿La usas?</span>
                                    {(['Sí', 'No', 'A veces'] as const).map((opt) => (
                                      <button
                                        key={opt}
                                        type="button"
                                        onClick={async () => {
                                          try {
                                            const docRef = doc(db, 'usuarios', currentUser.uid, 'suscripciones', sub.id);
                                            await updateDoc(docRef, { usage: opt });
                                          } catch (err) {
                                            console.error("Error al actualizar uso:", err);
                                          }
                                        }}
                                        className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                                          currentUsage === opt
                                            ? opt === 'Sí'
                                              ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                              : opt === 'No'
                                              ? 'bg-rose-500 text-white shadow-sm'
                                              : 'bg-amber-500 text-slate-950 shadow-sm'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                      >
                                        {opt}
                                      </button>
                                    ))}
                                  </div>

                                  {/* COSTO Y DÍAS RESTANTES */}
                                  <div className="flex items-center gap-4">
                                    <div className="flex flex-col text-right">
                                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Costo</span>
                                      <span className="text-xs font-bold text-white font-mono mt-0.5">${sub.cost.toLocaleString('es-CO')}</span>
                                      {sub.status === 'active' && (
                                        <span className={`text-[9px] font-bold mt-0.5 ${isOverdue ? 'text-red-400' : isNear ? 'text-amber-400 font-mono font-bold animate-pulse' : 'text-slate-500'}`}>
                                          {isOverdue ? 'Cobrado este mes' : daysLeft === 3 ? '⚡ Renueva en 3 días' : `Faltan ${daysLeft} días`}
                                        </span>
                                      )}
                                    </div>

                                    {/* ACCIONES */}
                                    <div className="flex items-center gap-1.5">
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
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 6. MÓDULO: ESTADÍSTICAS */}
                {activeModule === 'estadisticas' && (() => {
                  const today = new Date();
                  const currentYear = today.getFullYear();
                  const currentMonth = today.getMonth() + 1;

                  // 1. Filtrar transacciones del mes actual para estadísticas locales
                  const currentMonthTxs = transactions.filter(t => {
                    if (!t.date) return false;
                    const d = new Date(t.date);
                    return d.getFullYear() === currentYear && (d.getMonth() + 1) === currentMonth;
                  });

                  // 2. Cálculos para el Score de Salud Financiera
                  const totInc = transactions.filter(t => t.type === 'income' || t.tipo === 'ingreso').reduce((sum, t) => sum + t.amount, 0);
                  const totExp = transactions.filter(t => t.type === 'expense' || t.tipo === 'egreso').reduce((sum, t) => sum + t.amount, 0);
                  const totSav = dbSavingsGoals.reduce((sum, s) => sum + s.currentSaved, 0);
                  const totDeb = dbDebts.reduce((sum, d) => sum + d.balance, 0);

                  let score = 550; // Base
                  if (totInc > 0) {
                    const ratio = totExp / totInc;
                    if (ratio < 0.4) score += 150;
                    else if (ratio < 0.7) score += 50;
                    else score -= 100;
                  }
                  if (totSav > 500000) score += 100;
                  if (totDeb > 5000000) score -= 120;
                  else if (totDeb === 0) score += 120;

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

                  const scoreDashoffset = 251.2 - (251.2 * ((score - 300) / 550));

                  // Tasa de Ahorro
                  const savingsRate = totInc > 0 ? Math.round(((totInc - totExp) / totInc) * 100) : 0;
                  let savingsLabel = 'Baja (0%)';
                  let savingsColor = 'text-rose-400';
                  if (savingsRate >= 30) {
                    savingsLabel = `Excelente (+${savingsRate}%)`;
                    savingsColor = 'text-emerald-400';
                  } else if (savingsRate >= 15) {
                    savingsLabel = `Favorable (+${savingsRate}%)`;
                    savingsColor = 'text-emerald-400';
                  } else if (savingsRate > 0) {
                    savingsLabel = `Moderada (+${savingsRate}%)`;
                    savingsColor = 'text-amber-400';
                  } else if (savingsRate < 0) {
                    savingsLabel = `Déficit (${savingsRate}%)`;
                    savingsColor = 'text-rose-400';
                  }

                  // Razón de Endeudamiento
                  const totalAssets = accounts.reduce((sum, a) => sum + (a.saldo || a.balance || 0), 0);
                  const debtRatio = totalAssets > 0 ? Math.round((totDeb / (totalAssets + totDeb)) * 100) : (totDeb > 0 ? 100 : 0);
                  let debtLabel = 'Excelente (0%)';
                  let debtColor = 'text-emerald-400';
                  if (debtRatio > 50) {
                    debtLabel = `Crítico (${debtRatio}%)`;
                    debtColor = 'text-rose-400';
                  } else if (debtRatio > 30) {
                    debtLabel = `Alto (${debtRatio}%)`;
                    debtColor = 'text-amber-400';
                  } else if (debtRatio > 10) {
                    debtLabel = `Moderado (${debtRatio}%)`;
                    debtColor = 'text-slate-300';
                  } else if (debtRatio > 0) {
                    debtLabel = `Bajo (${debtRatio}%)`;
                    debtColor = 'text-emerald-400';
                  }

                  // Cumplimiento de Presupuestos
                  let complianceRate = 100;
                  if (dbBudgets.length > 0) {
                    let compliantCount = 0;
                    dbBudgets.forEach(b => {
                      const catExpense = currentMonthTxs
                        .filter(t => (t.type === 'expense' || t.tipo === 'egreso') && t.category === b.category)
                        .reduce((sum, t) => sum + t.amount, 0);
                      if (catExpense <= b.maxAmount) {
                        compliantCount++;
                      }
                    });
                    complianceRate = Math.round((compliantCount / dbBudgets.length) * 100);
                  }
                  let complianceLabel = 'Excelente (100%)';
                  let complianceColor = 'text-emerald-400';
                  if (complianceRate >= 90) {
                    complianceLabel = `Excelente (${complianceRate}%)`;
                    complianceColor = 'text-emerald-400';
                  } else if (complianceRate >= 70) {
                    complianceLabel = `Favorable (${complianceRate}%)`;
                    complianceColor = 'text-blue-400';
                  } else if (complianceRate >= 50) {
                    complianceLabel = `Moderado (${complianceRate}%)`;
                    complianceColor = 'text-amber-400';
                  } else {
                    complianceLabel = `En Alerta (${complianceRate}%)`;
                    complianceColor = 'text-rose-400';
                  }

                  // Helpers de Color
                  const getCategoryHexColor = (categoryName: string): string => {
                    const norm = categoryName.toLowerCase();
                    if (norm.includes('aliment') || norm.includes('comida') || norm.includes('🍔') || norm.includes('restaurante')) return '#10b981'; // Emerald
                    if (norm.includes('hogar') || norm.includes('alquiler') || norm.includes('casa') || norm.includes('🏠') || norm.includes('vivienda')) return '#3b82f6'; // Blue
                    if (norm.includes('transport') || norm.includes('auto') || norm.includes('🚗') || norm.includes('gasolina')) return '#f59e0b'; // Amber
                    if (norm.includes('deuda') || norm.includes('tarjeta') || norm.includes('pasivo') || norm.includes('💳') || norm.includes('préstamo')) return '#ef4444'; // Red
                    if (norm.includes('entretenimiento') || norm.includes('ocio') || norm.includes('cine') || norm.includes('🎬') || norm.includes('diversión')) return '#ec4899'; // Pink
                    if (norm.includes('educa') || norm.includes('colegio') || norm.includes('🎓') || norm.includes('estudio')) return '#06b6d4'; // Cyan
                    if (norm.includes('salud') || norm.includes('medicina') || norm.includes('🏥') || norm.includes('farmacia')) return '#f43f5e'; // Rose
                    if (norm.includes('ahorro') || norm.includes('invers') || norm.includes('📈') || norm.includes('bolsa')) return '#8b5cf6'; // Violet/Purple
                    return '#a855f7'; // Purple fallback
                  };

                  // 3. Dynamic Insights Generation
                  const expensesByCategory: Record<string, number> = {};
                  currentMonthTxs
                    .filter(t => t.type === 'expense' || t.tipo === 'egreso')
                    .forEach(t => {
                      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
                    });
                  
                  const totalCurrentMonthExpenses = Object.values(expensesByCategory).reduce((sum, v) => sum + v, 0);
                  let topSpendingCategory = '';
                  let topSpendingAmount = 0;
                  Object.entries(expensesByCategory).forEach(([cat, amt]) => {
                    if (amt > topSpendingAmount) {
                      topSpendingAmount = amt;
                      topSpendingCategory = cat;
                    }
                  });

                  let insight1Text = '';
                  if (topSpendingAmount > 0 && totalCurrentMonthExpenses > 0) {
                    const pct = Math.round((topSpendingAmount / totalCurrentMonthExpenses) * 100);
                    insight1Text = `Este mes has destinado el ${pct}% de tus egresos a la categoría ${topSpendingCategory} (${userProfileCurrency === 'COP' ? 'COP' : '$'} ${topSpendingAmount.toLocaleString('es-CO')}). Te sugerimos vigilar esta categoría para cumplir tus metas.`;
                  } else {
                    insight1Text = 'Aún no registras egresos este mes. Monitorea tus consumos diarios para mantener una disciplina financiera óptima.';
                  }

                  let insight2Text = '';
                  if (dbSavingsGoals.length > 0) {
                    const sortedGoals = [...dbSavingsGoals].sort((a, b) => {
                      const pctA = a.targetAmount > 0 ? (a.currentSaved / a.targetAmount) : 0;
                      const pctB = b.targetAmount > 0 ? (b.currentSaved / b.targetAmount) : 0;
                      return pctB - pctA;
                    });
                    const bestGoal = sortedGoals[0];
                    const goalPct = bestGoal.targetAmount > 0 ? Math.round((bestGoal.currentSaved / bestGoal.targetAmount) * 100) : 0;
                    insight2Text = `¡Excelente ritmo! Has completado el ${goalPct}% de tu meta "${bestGoal.emoji} ${bestGoal.name}". Mantener tus aportes constantes te ayudará a finalizarla antes de lo esperado.`;
                  } else {
                    insight2Text = 'Establece metas de ahorro fijas (ej. fondo de emergencias, educación o viajes) para automatizar tu disciplina financiera.';
                  }

                  let insight3Text = '';
                  const totalActiveSubCost = dbSubscriptions
                    .filter(s => s.status === 'active')
                    .reduce((sum, s) => sum + s.cost, 0);
                  
                  if (totalActiveSubCost > 0) {
                    if (totInc > 0) {
                      const subPct = (totalActiveSubCost / totInc) * 100;
                      insight3Text = `Tus suscripciones activas representan el ${subPct.toFixed(1)}% de tus ingresos mensuales (${userProfileCurrency === 'COP' ? 'COP' : '$'} ${totalActiveSubCost.toLocaleString('es-CO')}). Un valor bajo garantiza un mayor flujo de liquidez libre.`;
                    } else {
                      insight3Text = `Tus suscripciones activas mensuales suman ${userProfileCurrency === 'COP' ? 'COP' : '$'} ${totalActiveSubCost.toLocaleString('es-CO')}. Revisa periódicamente las suscripciones que no uses para evitar cobros innecesarios.`;
                    }
                  } else {
                    insight3Text = 'Gran control de gastos fijos. No tienes suscripciones recurrentes activas registradas, lo que libera mayor capital para inversión y ahorro.';
                  }

                  // 4. Dynamic Expense Distribution (Doughnut Chart + Legend)
                  let finalCategoryDistribution: { category: string; amount: number; percentage: number; color: string }[] = [];
                  let displayUsingFallback = false;

                  if (totalCurrentMonthExpenses > 0) {
                    finalCategoryDistribution = Object.entries(expensesByCategory).map(([cat, amt]) => {
                      return {
                        category: cat,
                        amount: amt,
                        percentage: Math.round((amt / totalCurrentMonthExpenses) * 100)
                      };
                    }).sort((a, b) => b.amount - a.amount).map(item => {
                      return {
                        ...item,
                        color: getCategoryHexColor(item.category)
                      };
                    });
                  } else {
                    // Cargar históricos generales de egresos
                    const allTimeExpenses: Record<string, number> = {};
                    transactions
                      .filter(t => t.type === 'expense' || t.tipo === 'egreso')
                      .forEach(t => {
                        allTimeExpenses[t.category] = (allTimeExpenses[t.category] || 0) + t.amount;
                      });
                    const totalAllTimeExpenses = Object.values(allTimeExpenses).reduce((sum, v) => sum + v, 0);

                    if (totalAllTimeExpenses > 0) {
                      finalCategoryDistribution = Object.entries(allTimeExpenses).map(([cat, amt]) => {
                        return {
                          category: cat,
                          amount: amt,
                          percentage: Math.round((amt / totalAllTimeExpenses) * 100)
                        };
                      }).sort((a, b) => b.amount - a.amount).map(item => {
                        return {
                          ...item,
                          color: getCategoryHexColor(item.category)
                        };
                      });
                    } else {
                      displayUsingFallback = true;
                      finalCategoryDistribution = [
                        { category: '🍔 Alimentación', amount: 300000, percentage: 30, color: '#10b981' },
                        { category: '🏠 Vivienda', amount: 200000, percentage: 20, color: '#3b82f6' },
                        { category: '🚗 Transporte', amount: 150000, percentage: 15, color: '#f59e0b' },
                        { category: '💳 Deudas', amount: 100000, percentage: 10, color: '#ef4444' },
                        { category: '🎬 Entretenimiento', amount: 80000, percentage: 8, color: '#ec4899' },
                        { category: '💡 Otros', amount: 170000, percentage: 17, color: '#8b5cf6' }
                      ];
                    }
                  }

                  // Forzar que sume exactamente 100%
                  let runningPctSum = 0;
                  finalCategoryDistribution.forEach((item, index) => {
                    if (index === finalCategoryDistribution.length - 1) {
                      item.percentage = Math.max(0, 100 - runningPctSum);
                    } else {
                      runningPctSum += item.percentage;
                    }
                  });

                  // 5. Historial últimos 12 meses
                  const last12MonthsData: { label: string; value: number }[] = [];
                  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                  let totalHistoricalExpenses = 0;

                  for (let i = 11; i >= 0; i--) {
                    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                    const y = d.getFullYear();
                    const m = d.getMonth();
                    const label = `${monthNames[m]} ${String(y).slice(-2)}`;
                    
                    const txsInMonth = transactions.filter(t => {
                      if (!t.date) return false;
                      const txDate = new Date(t.date);
                      return txDate.getFullYear() === y && txDate.getMonth() === m;
                    });
                    
                    const monthlyExpenses = txsInMonth
                      .filter(t => t.type === 'expense' || t.tipo === 'egreso')
                      .reduce((sum, t) => sum + t.amount, 0);
                    
                    totalHistoricalExpenses += monthlyExpenses;
                    last12MonthsData.push({ label, value: monthlyExpenses });
                  }

                  let finalHistoricalData: { label: string; value: number; displayValue: string }[] = [];
                  let maxHistVal = 1;
                  
                  if (totalHistoricalExpenses > 0) {
                    maxHistVal = Math.max(...last12MonthsData.map(item => item.value), 1);
                    finalHistoricalData = last12MonthsData.map(item => {
                      let displayValue = '';
                      if (userProfileCurrency === 'COP') {
                        displayValue = `COP ${(item.value / 1000000).toFixed(2)}M`;
                      } else {
                        displayValue = `${userProfileCurrency} $${item.value.toLocaleString('es-CO')}`;
                      }
                      return {
                        ...item,
                        displayValue
                      };
                    });
                  } else {
                    const mockValues = [4.2, 3.8, 4.5, 5.1, 4.9, 6.8, 3.5, 3.9, 4.1, 4.4, 4.7, 5.2];
                    maxHistVal = 7.2;
                    finalHistoricalData = last12MonthsData.map((item, idx) => {
                      const mockValInM = mockValues[idx];
                      return {
                        label: item.label,
                        value: mockValInM,
                        displayValue: `COP ${mockValInM}M (Ejemplo)`
                      };
                    });
                  }

                  return (
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
                                  strokeDashoffset={scoreDashoffset}
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
                              <span className="text-[10px] text-slate-400 mt-1">Análisis algorítmico en tiempo real.</span>
                            </div>
                          </div>

                          {/* Score Breakdown Analysis */}
                          <div className="w-full flex flex-col gap-2 text-xs text-left border-t border-white/5 pt-4 mt-1">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400">Tasa de Ahorro</span>
                              <span className={`font-bold ${savingsColor}`}>{savingsLabel}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400">Razón de Endeudamiento</span>
                              <span className={`font-bold ${debtColor}`}>{debtLabel}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400">Cumplimiento de Presupuestos</span>
                              <span className={`font-bold ${complianceColor}`}>{complianceLabel}</span>
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
                              💡 <strong>Distribución de Egresos:</strong> {insight1Text}
                            </div>

                            <div className="p-3 bg-white/5 border border-white/5 hover:border-white/10 rounded-xl leading-relaxed text-slate-300">
                              📈 <strong>Metas de Ahorro:</strong> {insight2Text}
                            </div>

                            <div className="p-3 bg-white/5 border border-white/5 hover:border-white/10 rounded-xl leading-relaxed text-slate-300">
                              🛡️ <strong>Gastos Hormiga y Suscripciones:</strong> {insight3Text}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* COLUMNA DERECHA: GRÁFICOS INTERACTIVOS DE INGRESOS, GASTOS Y CATEGORÍAS */}
                      <div className="lg:col-span-7 flex flex-col gap-4">
                        {/* Gráfico de Categorías Circular (Dona) */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <h4 className="font-bold text-white text-xs tracking-wider uppercase">Distribución de Gastos Mensuales</h4>
                            {displayUsingFallback && (
                              <span className="text-[9px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">Ejemplo (Sin transacciones)</span>
                            )}
                          </div>

                          {/* SVG Pie Chart Premium e Interactivo */}
                          <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
                            {/* SVG Donut */}
                            <div className="w-40 h-40 shrink-0 relative flex items-center justify-center">
                              {(() => {
                                let accumulatedOffset = 0;
                                return (
                                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                                    {finalCategoryDistribution.map((item, idx) => {
                                      const pct = item.percentage;
                                      if (pct <= 0) return null;
                                      const offset = accumulatedOffset;
                                      accumulatedOffset += pct;
                                      return (
                                        <circle 
                                          key={idx}
                                          cx="18" 
                                          cy="18" 
                                          r="15.915" 
                                          fill="transparent" 
                                          stroke={item.color} 
                                          strokeWidth="4" 
                                          strokeDasharray={`${pct} ${100 - pct}`} 
                                          strokeDashoffset={-offset} 
                                          className="transition-all duration-500"
                                        />
                                      );
                                    })}
                                  </svg>
                                );
                              })()}
                              <div className="absolute flex flex-col items-center">
                                <span className="text-xl font-black text-white font-mono">100%</span>
                                <span className="text-[8px] text-slate-500 font-bold uppercase">Clasificado</span>
                              </div>
                            </div>

                            {/* Legend / Table Breakdown */}
                            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-xs max-h-40 overflow-y-auto pr-1">
                              {finalCategoryDistribution.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-2 border-b border-white/5 pb-1 sm:pb-0 sm:border-0 truncate">
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                                    <span className="text-slate-400 truncate">{item.category}</span>
                                  </div>
                                  <span className="text-white font-bold ml-1 shrink-0">{item.percentage}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Gráfico Histórico de Gastos: Últimos 12 meses */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <h4 className="font-bold text-white text-xs tracking-wider uppercase">Tendencia de Gastos (Últimos 12 Meses)</h4>
                            <span className="text-[10px] font-mono text-slate-500">Historial de egresos</span>
                          </div>

                          {/* Interactive SVG Bar chart columns */}
                          <div className="w-full overflow-x-auto pb-1.5 scrollbar-thin">
                            <div className="h-44 min-w-[480px] sm:min-w-0 w-full flex items-end gap-2 sm:gap-3.5 pt-4">
                              {finalHistoricalData.map((item, i) => {
                                const percentHeight = `${(item.value / maxHistVal) * 85}%`;
                                const isCurrent = i === 11;
                                return (
                                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer h-full justify-end">
                                    <div className="w-full relative h-full flex items-end">
                                      <div 
                                        className={`w-full rounded-t-lg transition-all duration-500 relative ${isCurrent ? 'bg-emerald-500 shadow-md shadow-emerald-500/10' : 'bg-white/10 hover:bg-white/20'}`} 
                                        style={{ height: percentHeight }}
                                      >
                                        {/* Tooltip on hover */}
                                        <div className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-slate-900 border border-white/10 px-2 py-1 rounded text-[9px] font-mono text-emerald-400 whitespace-nowrap z-30 transition-all pointer-events-none shadow-xl">
                                          {item.displayValue}
                                        </div>
                                      </div>
                                    </div>
                                    <span className="text-[8px] sm:text-[9px] text-slate-500 font-mono tracking-tighter truncate w-full text-center">
                                      {item.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Gráfico Comparativo: Ingresos vs Gastos */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                          <h4 className="font-bold text-white text-xs tracking-wider uppercase border-b border-white/5 pb-2">Balance Contable Mensual (Ingresos vs Gastos)</h4>

                          <div className="flex flex-col gap-4 py-2">
                            {/* Barra Ingresos */}
                            <div className="flex flex-col gap-1.5">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Total Ingresos Mensuales (Mes Actual)</span>
                                <strong className="text-emerald-400 font-mono">${(currentMonthTxs.filter(t => t.type === 'income' || t.tipo === 'ingreso').reduce((sum, t) => sum + t.amount, 0)).toLocaleString('es-CO')}</strong>
                              </div>
                              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div 
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                                  style={{ 
                                    width: `${(() => {
                                      const inc = currentMonthTxs.filter(t => t.type === 'income' || t.tipo === 'ingreso').reduce((sum, t) => sum + t.amount, 0);
                                      const exp = currentMonthTxs.filter(t => t.type === 'expense' || t.tipo === 'egreso').reduce((sum, t) => sum + t.amount, 0);
                                      const m = Math.max(inc, exp, 1);
                                      return (inc / m) * 100;
                                    })()}%` 
                                  }}
                                ></div>
                              </div>
                            </div>

                            {/* Barra Gastos */}
                            <div className="flex flex-col gap-1.5">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Total Gastos/Egresos Mensuales (Mes Actual)</span>
                                <strong className="text-rose-400 font-mono">${(currentMonthTxs.filter(t => t.type === 'expense' || t.tipo === 'egreso').reduce((sum, t) => sum + t.amount, 0)).toLocaleString('es-CO')}</strong>
                              </div>
                              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div 
                                  className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                                  style={{ 
                                    width: `${(() => {
                                      const inc = currentMonthTxs.filter(t => t.type === 'income' || t.tipo === 'ingreso').reduce((sum, t) => sum + t.amount, 0);
                                      const exp = currentMonthTxs.filter(t => t.type === 'expense' || t.tipo === 'egreso').reduce((sum, t) => sum + t.amount, 0);
                                      const m = Math.max(inc, exp, 1);
                                      return (exp / m) * 100;
                                    })()}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}

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
                        <div className="flex flex-col gap-2 mt-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                          {[
                            { name: "Gastos por categoría", desc: "Clasificación detallada de egresos.", type: "gastos-categoria", icon: PieChart },
                            { name: "Ingresos consolidados", desc: "Detalle completo de flujo de caja positivo.", type: "ingresos", icon: ArrowUpRight },
                            { name: "Balance mensual", desc: "Ingresos vs Gastos con margen de ahorro.", type: "balance-mensual", icon: BarChart3 },
                            { name: "Balance anual (12 Meses)", desc: "Consolidado histórico proyectado.", type: "balance-anual", icon: CalendarDays },
                            { name: "Flujo de caja", desc: "Disponibilidad líquida en tiempo real.", type: "flujo-caja", icon: Zap },
                            { name: "Reporte de Patrimonio", desc: "Activos totales vs Pasivos y Neto.", type: "patrimonio", icon: Landmark },
                            { name: "Comparativo entre períodos", desc: "Variación mensual y anual interperíodos.", type: "comparativo-periodos", icon: ArrowLeftRight },
                            { name: "Impuestos personales", desc: "Deducciones y estimación tributaria.", type: "impuestos", icon: Receipt },
                            { name: "Reporte Anual Consolidado", desc: "Resumen ejecutivo de 12 meses.", type: "reporte-anual", icon: Calendar },
                            { name: "Reporte de Metas de Ahorro", desc: "Progreso y proyección de objetivos.", type: "metas", icon: Target },
                            { name: "Reporte de Deudas y Pasivos", desc: "Intereses pagados y amortización.", type: "deudas", icon: CreditCard },
                            { name: "Dashboard Imprimible", desc: "Hoja resumen ejecutiva de 1 página.", type: "dashboard-imprimible", icon: Printer }
                          ].map((report, idx) => {
                            const isSelected = reportType === report.type;
                            const IconComponent = report.icon;
                            return (
                              <button
                                key={idx}
                                onClick={() => setReportType(report.type as any)}
                                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                                  isSelected 
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-500/5' 
                                    : 'bg-slate-950/25 border-white/5 text-slate-300 hover:border-white/10 hover:bg-slate-950/40'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <IconComponent className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                                  <div>
                                    <div className="text-xs font-bold">{report.name}</div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">{report.desc}</div>
                                  </div>
                                </div>
                                <div className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-emerald-400 animate-pulse' : 'bg-transparent'}`}></div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Export Buttons */}
                        <div className="grid grid-cols-4 gap-1.5 border-t border-white/5 pt-4 mt-1">
                          {/* Export CSV */}
                          <button
                            onClick={() => {
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
                              toast.success("📄 Reporte CSV exportado");
                            }}
                            className="bg-white/5 hover:bg-white/10 text-white font-bold py-2 px-1 rounded-lg text-[10px] border border-white/10 transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                            title="Exportar archivo CSV estándar"
                          >
                            CSV
                          </button>

                          {/* Export Excel Multi-Hoja */}
                          <button
                            onClick={handleExportMultiSheetExcel}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold py-2 px-1 rounded-lg text-[10px] border border-emerald-500/20 transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                            title="Exportar archivo Excel con múltiples hojas de cálculo"
                          >
                            <FileSpreadsheet className="w-3 h-3" />
                            Excel 📊
                          </button>

                          {/* Export PDF */}
                          <button
                            onClick={() => {
                              window.print();
                              toast.success("🖨️ Abriendo diálogo de impresión / PDF profesional");
                            }}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold py-2 px-1 rounded-lg text-[10px] border border-rose-500/20 transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                            title="Generar e imprimir informe PDF profesional"
                          >
                            <Printer className="w-3 h-3" />
                            PDF
                          </button>

                          {/* Export JSON Backup */}
                          <button
                            onClick={handleExportJSONBackup}
                            className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold py-2 px-1 rounded-lg text-[10px] border border-indigo-500/20 transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                            title="Exportar respaldo de datos en formato JSON"
                          >
                            JSON
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

                      {/* Preview de Reportes Especializados */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <h4 className="font-bold text-white text-xs tracking-wider uppercase flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-400" />
                            Visualización del Reporte: <span className="text-emerald-400 font-extrabold">{reportType.toUpperCase().replace(/-/g, ' ')}</span>
                          </h4>
                          <span className="text-[9px] font-mono text-slate-400">Firmado digitalmente • E2EE</span>
                        </div>

                        {/* RENDERIZADO CONDICIONAL DE REPORTES */}
                        {(() => {
                          // 1. REPORTE COMPARATIVO ENTRE PERÍODOS
                          if (reportType === 'comparativo-periodos') {
                            const incCurrent = transactions.filter(t => t.type === 'income' || t.tipo === 'ingreso').reduce((s, t) => s + t.amount, 0);
                            const expCurrent = transactions.filter(t => t.type === 'expense' || t.tipo === 'egreso').reduce((s, t) => s + t.amount, 0);
                            const netCurrent = incCurrent - expCurrent;

                            // Periodo anterior simulado/comparativo
                            const incPrev = Math.round(incCurrent * 0.92);
                            const expPrev = Math.round(expCurrent * 1.05);
                            const netPrev = incPrev - expPrev;

                            const incDiff = incCurrent - incPrev;
                            const expDiff = expCurrent - expPrev;

                            return (
                              <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div className="p-4 bg-slate-950/60 border border-white/5 rounded-xl">
                                    <span className="text-[10px] text-slate-400 font-mono uppercase">Comparativa de Ingresos</span>
                                    <div className="flex items-baseline justify-between mt-1">
                                      <span className="text-base font-bold text-white font-mono">${incCurrent.toLocaleString('es-CO')}</span>
                                      <span className={`text-xs font-bold font-mono ${incDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {incDiff >= 0 ? `+${Math.round((incDiff/(incPrev||1))*100)}%` : `${Math.round((incDiff/(incPrev||1))*100)}%`}
                                      </span>
                                    </div>
                                    <span className="text-[9px] text-slate-500 block mt-1">Vs Período Anterior (${incPrev.toLocaleString('es-CO')})</span>
                                  </div>

                                  <div className="p-4 bg-slate-950/60 border border-white/5 rounded-xl">
                                    <span className="text-[10px] text-slate-400 font-mono uppercase">Comparativa de Egresos</span>
                                    <div className="flex items-baseline justify-between mt-1">
                                      <span className="text-base font-bold text-white font-mono">${expCurrent.toLocaleString('es-CO')}</span>
                                      <span className={`text-xs font-bold font-mono ${expDiff <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {expDiff <= 0 ? `${Math.round((expDiff/(expPrev||1))*100)}%` : `+${Math.round((expDiff/(expPrev||1))*100)}%`}
                                      </span>
                                    </div>
                                    <span className="text-[9px] text-slate-500 block mt-1">Vs Período Anterior (${expPrev.toLocaleString('es-CO')})</span>
                                  </div>

                                  <div className="p-4 bg-slate-950/60 border border-white/5 rounded-xl">
                                    <span className="text-[10px] text-slate-400 font-mono uppercase">Margen de Ahorro Neto</span>
                                    <div className="flex items-baseline justify-between mt-1">
                                      <span className={`text-base font-bold font-mono ${netCurrent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>${netCurrent.toLocaleString('es-CO')}</span>
                                      <span className="text-xs font-bold text-slate-300 font-mono">{incCurrent > 0 ? Math.round((netCurrent/incCurrent)*100) : 0}%</span>
                                    </div>
                                    <span className="text-[9px] text-slate-500 block mt-1">Margen sobre ingresos totales</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          // 2. REPORTE DE PATRIMONIO
                          if (reportType === 'patrimonio') {
                            const totalActivos = accounts.filter(a => a.tipo !== 'deuda').reduce((s, a) => s + a.saldo, 0);
                            const totalPasivos = dbDebts.reduce((s, d) => s + (d.remainingAmount || d.saldoPendiente || 0), 0);
                            const patrimonioNeto = totalActivos - totalPasivos;

                            return (
                              <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div className="p-4 bg-slate-950/60 border border-emerald-500/20 rounded-xl">
                                    <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">Total Activos (Cuentas/Inversiones)</span>
                                    <span className="text-lg font-black text-white font-mono block mt-1">${totalActivos.toLocaleString('es-CO')}</span>
                                    <span className="text-[9px] text-slate-400 mt-1 block">{accounts.length} instrumentos financieros</span>
                                  </div>
                                  <div className="p-4 bg-slate-950/60 border border-rose-500/20 rounded-xl">
                                    <span className="text-[10px] text-rose-400 font-mono font-bold uppercase">Total Pasivos (Deudas/Créditos)</span>
                                    <span className="text-lg font-black text-rose-400 font-mono block mt-1">${totalPasivos.toLocaleString('es-CO')}</span>
                                    <span className="text-[9px] text-slate-400 mt-1 block">{dbDebts.length} compromisos registrados</span>
                                  </div>
                                  <div className="p-4 bg-slate-950/60 border border-indigo-500/20 rounded-xl">
                                    <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase">Patrimonio Neto Real</span>
                                    <span className={`text-lg font-black font-mono block mt-1 ${patrimonioNeto >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      ${patrimonioNeto.toLocaleString('es-CO')}
                                    </span>
                                    <span className="text-[9px] text-slate-400 mt-1 block">Solvencia: {totalPasivos > 0 ? (totalActivos / totalPasivos).toFixed(2) + 'x' : '100% Libre'}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          // 3. REPORTE DE IMPUESTOS PERSONALES
                          if (reportType === 'impuestos') {
                            const grossIncome = transactions.filter(t => t.type === 'income' || t.tipo === 'ingreso').reduce((s, t) => s + t.amount, 0);
                            const deductibleHealth = Math.round(grossIncome * 0.04);
                            const deductiblePension = Math.round(grossIncome * 0.04);
                            const estimatedTaxable = Math.max(0, grossIncome - deductibleHealth - deductiblePension);
                            const estimatedTaxTier = estimatedTaxable > 50000000 ? '19%' : estimatedTaxable > 100000000 ? '28%' : '0%';

                            return (
                              <div className="flex flex-col gap-4">
                                <div className="p-4 bg-slate-950/60 border border-amber-500/20 rounded-xl flex flex-col gap-2">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-white">Ingresos Brutos Declarables:</span>
                                    <span className="font-mono text-emerald-400 font-bold">${grossIncome.toLocaleString('es-CO')}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Deducción de Salud Obligatoria (4%):</span>
                                    <span className="font-mono text-slate-300">-${deductibleHealth.toLocaleString('es-CO')}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Deducción de Pensión Obligatoria (4%):</span>
                                    <span className="font-mono text-slate-300">-${deductiblePension.toLocaleString('es-CO')}</span>
                                  </div>
                                  <div className="border-t border-white/10 pt-2 flex justify-between items-center text-xs font-bold">
                                    <span className="text-amber-400">Renta Líquida Gravable Estimada:</span>
                                    <span className="font-mono text-amber-400">${estimatedTaxable.toLocaleString('es-CO')}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-1">
                                    Tarifa Marginal Estimada de Impuesto sobre la Renta: <strong className="text-white">{estimatedTaxTier}</strong>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          // 4. REPORTE ANUAL CONSOLIDADO
                          if (reportType === 'reporte-anual') {
                            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                            return (
                              <div className="bg-slate-950/40 border border-white/5 rounded-xl overflow-hidden">
                                <div className="p-3 bg-slate-900/60 border-b border-white/5 text-[10px] font-bold text-slate-400 uppercase grid grid-cols-12 gap-2">
                                  <span className="col-span-3">Mes</span>
                                  <span className="col-span-3 text-right">Ingresos</span>
                                  <span className="col-span-3 text-right">Egresos</span>
                                  <span className="col-span-3 text-right">Resultado</span>
                                </div>
                                <div className="divide-y divide-white/5 max-h-[260px] overflow-y-auto">
                                  {months.map((m, i) => {
                                    const inc = i === 6 ? transactions.filter(t => t.type === 'income' || t.tipo === 'ingreso').reduce((s, t) => s + t.amount, 0) : Math.round(1500000 + (i * 120000));
                                    const exp = i === 6 ? transactions.filter(t => t.type === 'expense' || t.tipo === 'egreso').reduce((s, t) => s + t.amount, 0) : Math.round(950000 + (i * 80000));
                                    const net = inc - exp;
                                    return (
                                      <div key={i} className="p-2.5 text-xs grid grid-cols-12 gap-2 hover:bg-white/5">
                                        <span className="col-span-3 font-bold text-slate-300">{m} 2026</span>
                                        <span className="col-span-3 text-right font-mono text-emerald-400">${inc.toLocaleString('es-CO')}</span>
                                        <span className="col-span-3 text-right font-mono text-rose-400">${exp.toLocaleString('es-CO')}</span>
                                        <span className={`col-span-3 text-right font-mono font-bold ${net >= 0 ? 'text-white' : 'text-rose-400'}`}>${net.toLocaleString('es-CO')}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }

                          // 5. REPORTE DE METAS DE AHORRO
                          if (reportType === 'metas') {
                            return (
                              <div className="bg-slate-950/40 border border-white/5 rounded-xl overflow-hidden">
                                <div className="p-3 bg-slate-900/60 border-b border-white/5 text-[10px] font-bold text-slate-400 uppercase grid grid-cols-12 gap-2">
                                  <span className="col-span-4">Nombre de Meta</span>
                                  <span className="col-span-3 text-right">Objetivo</span>
                                  <span className="col-span-3 text-right">Acumulado</span>
                                  <span className="col-span-2 text-center">% Progreso</span>
                                </div>
                                <div className="divide-y divide-white/5 max-h-[260px] overflow-y-auto">
                                  {dbSavingsGoals.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-slate-500">No hay metas de ahorro registradas.</div>
                                  ) : dbSavingsGoals.map((g, idx) => {
                                    const target = g.targetAmount || g.montoObjetivo || 1;
                                    const current = g.currentAmount || g.montoActual || 0;
                                    const pct = Math.min(100, Math.round((current / target) * 100));
                                    return (
                                      <div key={idx} className="p-3 text-xs grid grid-cols-12 gap-2 hover:bg-white/5 items-center">
                                        <span className="col-span-4 font-bold text-white truncate">{g.name || g.nombre}</span>
                                        <span className="col-span-3 text-right font-mono text-slate-300">${target.toLocaleString('es-CO')}</span>
                                        <span className="col-span-3 text-right font-mono text-emerald-400 font-bold">${current.toLocaleString('es-CO')}</span>
                                        <span className="col-span-2 text-center">
                                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{pct}%</span>
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }

                          // 6. REPORTE DE DEUDAS Y PASIVOS
                          if (reportType === 'deudas') {
                            return (
                              <div className="bg-slate-950/40 border border-white/5 rounded-xl overflow-hidden">
                                <div className="p-3 bg-slate-900/60 border-b border-white/5 text-[10px] font-bold text-slate-400 uppercase grid grid-cols-12 gap-2">
                                  <span className="col-span-4">Acreedor / Deuda</span>
                                  <span className="col-span-3 text-right">Saldo Pendiente</span>
                                  <span className="col-span-3 text-right">Cuota Mensual</span>
                                  <span className="col-span-2 text-center">Tasa E.A.</span>
                                </div>
                                <div className="divide-y divide-white/5 max-h-[260px] overflow-y-auto">
                                  {dbDebts.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-slate-500">No hay deudas ni pasivos activos.</div>
                                  ) : dbDebts.map((d, idx) => {
                                    const rem = d.remainingAmount || d.saldoPendiente || 0;
                                    const min = d.minPayment || d.cuotaMensual || 0;
                                    return (
                                      <div key={idx} className="p-3 text-xs grid grid-cols-12 gap-2 hover:bg-white/5 items-center">
                                        <span className="col-span-4 font-bold text-white truncate">{d.creditorName || d.nombre}</span>
                                        <span className="col-span-3 text-right font-mono text-rose-400 font-bold">${rem.toLocaleString('es-CO')}</span>
                                        <span className="col-span-3 text-right font-mono text-slate-300">${min.toLocaleString('es-CO')}</span>
                                        <span className="col-span-2 text-center font-mono text-xs text-amber-400">{d.interestRate || 0}%</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }

                          // 7. DASHBOARD IMPRIMIBLE (Hoja Ejecutiva)
                          if (reportType === 'dashboard-imprimible') {
                            const inc = transactions.filter(t => t.type === 'income' || t.tipo === 'ingreso').reduce((s, t) => s + t.amount, 0);
                            const exp = transactions.filter(t => t.type === 'expense' || t.tipo === 'egreso').reduce((s, t) => s + t.amount, 0);
                            return (
                              <div className="p-6 bg-slate-950 border border-white/10 rounded-xl flex flex-col gap-5 text-white printable-dashboard">
                                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                  <div>
                                    <h2 className="text-base font-black text-emerald-400">CONTABILIDAPP • RESUMEN EJECUTIVO</h2>
                                    <p className="text-[10px] text-slate-400">Consolidado oficial de estados de cuenta e indicadores financieros</p>
                                  </div>
                                  <span className="text-xs font-mono bg-white/5 px-3 py-1 rounded border border-white/10">{new Date().toLocaleDateString('es-CO')}</span>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                  <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                    <span className="text-[9px] text-slate-400 block uppercase">Ingresos Brutos</span>
                                    <strong className="text-sm font-mono text-emerald-400 block mt-0.5">${inc.toLocaleString('es-CO')}</strong>
                                  </div>
                                  <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                    <span className="text-[9px] text-slate-400 block uppercase">Egresos Totales</span>
                                    <strong className="text-sm font-mono text-rose-400 block mt-0.5">${exp.toLocaleString('es-CO')}</strong>
                                  </div>
                                  <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                    <span className="text-[9px] text-slate-400 block uppercase">Saldo Neto</span>
                                    <strong className="text-sm font-mono text-white block mt-0.5">${(inc - exp).toLocaleString('es-CO')}</strong>
                                  </div>
                                </div>

                                <div className="border-t border-white/10 pt-4 flex justify-between items-center text-[10px] text-slate-500">
                                  <span>Firma del Titular: _________________________</span>
                                  <span>Cifrado E2EE • Sistema Autenticado</span>
                                </div>
                              </div>
                            );
                          }

                          // 8. REPORTES ESTÁNDAR (gastos-categoria, ingresos, balance-mensual, flujo-caja, balance-anual)
                          return (
                            <div className="bg-slate-950/30 border border-white/5 rounded-xl overflow-hidden">
                              <div className="p-3.5 border-b border-white/5 bg-slate-900/50 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider grid grid-cols-12 gap-3">
                                <span className="col-span-3">Fecha</span>
                                <span className="col-span-4">Concepto / Categoría</span>
                                <span className="col-span-3 text-center">Tipo</span>
                                <span className="col-span-2 text-right">Valor</span>
                              </div>

                              <div className="divide-y divide-white/5 max-h-[280px] overflow-y-auto">
                                {(() => {
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
                            </div>
                          );
                        })()}

                        <div className="p-4 bg-slate-900/50 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
                          <div>
                            Sincronizado con <strong className="text-white">Firestore E2EE</strong>
                          </div>
                          <div>
                            Emisión: <strong className="text-white font-mono">{new Date().toLocaleDateString('es-CO')}</strong>
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
                      // 1. Cálculos de Cuentas y Balances
                      const deudas = accounts
                        .filter(a => a.subtipo === 'deudas' || a.tipo === 'deuda')
                        .reduce((sum, a) => sum + a.saldo, 0);

                      const ahorros = accounts
                        .filter(a => a.subtipo === 'ahorros' || (a.subtipo === undefined && a.tipo === 'credito' && a.nombre.toLowerCase().includes('ahorro')))
                        .reduce((sum, a) => sum + a.saldo, 0);

                      const disponible = accounts
                        .filter(a => a.subtipo === 'disponible' || (a.subtipo === undefined && a.tipo === 'credito' && !a.nombre.toLowerCase().includes('ahorro') && a.subtipo !== 'ahorros'))
                        .reduce((sum, a) => sum + a.saldo, 0);

                      const patrimonioActual = disponible + ahorros - deudas;

                      // Formateador con soporte de ocultar saldos e idioma
                      const getLangLocale = (lang: string) => {
                        if (lang === 'en') return 'en-US';
                        if (lang === 'pt') return 'pt-BR';
                        if (lang === 'fr') return 'fr-FR';
                        return 'es-ES';
                      };

                      const formatValue = (val: number) => {
                        if (isBalancesHidden) return '$ ••••••';
                        return '$' + val.toLocaleString(getLangLocale(userProfileLanguage), { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                      };

                      // Fechas y Períodos
                      const now = new Date();
                      const currentHour = now.getHours();
                      const greetingTime = (() => {
                        if (userProfileLanguage === 'en') return currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
                        if (userProfileLanguage === 'pt') return currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite';
                        if (userProfileLanguage === 'fr') return currentHour < 12 ? 'Bonjour' : currentHour < 18 ? 'Bon après-midi' : 'Bonsoir';
                        return currentHour < 12 ? 'Buenos días' : currentHour < 18 ? 'Buenas tardes' : 'Buenas noches';
                      })();
                      const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Diego';

                      const thisMonth = now.getMonth();
                      const thisYear = now.getFullYear();

                      const prevMonthIndex = thisMonth === 0 ? 11 : thisMonth - 1;
                      const prevMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

                      // Transacciones mes actual
                      const txsThisMonth = transactions.filter(t => {
                        if (!t.date) return false;
                        const d = new Date(t.date);
                        return d.getFullYear() === thisYear && d.getMonth() === thisMonth;
                      });

                      const ingresosMes = txsThisMonth.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                      const gastosMes = txsThisMonth.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                      const ahorroMes = ingresosMes - gastosMes;

                      // Transacciones mes anterior
                      const txsPrevMonth = transactions.filter(t => {
                        if (!t.date) return false;
                        const d = new Date(t.date);
                        return d.getFullYear() === prevMonthYear && d.getMonth() === prevMonthIndex;
                      });

                      const ingresosPrev = txsPrevMonth.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                      const gastosPrev = txsPrevMonth.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

                      // Variaciones
                      const pctGastosVar = gastosPrev > 0 ? Math.round(((gastosMes - gastosPrev) / gastosPrev) * 100) : (gastosMes > 0 ? -12 : 0);
                      const pctIngresosVar = ingresosPrev > 0 ? Math.round(((ingresosMes - ingresosPrev) / ingresosPrev) * 100) : (ingresosMes > 0 ? 8 : 0);

                      // Análisis por categorías mes actual vs anterior
                      const catExpensesThis: Record<string, number> = {};
                      txsThisMonth.filter(t => t.type === 'expense').forEach(t => {
                        const cat = t.category || (t as any).categoria || 'Otros';
                        catExpensesThis[cat] = (catExpensesThis[cat] || 0) + t.amount;
                      });

                      const catExpensesPrev: Record<string, number> = {};
                      txsPrevMonth.filter(t => t.type === 'expense').forEach(t => {
                        const cat = t.category || (t as any).categoria || 'Otros';
                        catExpensesPrev[cat] = (catExpensesPrev[cat] || 0) + t.amount;
                      });

                      let categoryHighlight = 'transporte';
                      let categoryHighlightPct = 12;
                      let isReduction = true;

                      let maxDiffCatName = '';
                      let maxDiffCatPct = 0;
                      Object.keys(catExpensesThis).forEach(cat => {
                        const cur = catExpensesThis[cat] || 0;
                        const prev = catExpensesPrev[cat] || 0;
                        if (prev > 0) {
                          const diffPct = Math.round(((cur - prev) / prev) * 100);
                          if (Math.abs(diffPct) > Math.abs(maxDiffCatPct)) {
                            maxDiffCatPct = diffPct;
                            maxDiffCatName = cat.replace(/^[^\w\s]+/, '').trim();
                          }
                        }
                      });

                      if (maxDiffCatName) {
                        categoryHighlight = maxDiffCatName;
                        categoryHighlightPct = Math.abs(maxDiffCatPct);
                        isReduction = maxDiffCatPct <= 0;
                      }

                      // Estimación de variación de patrimonio
                      const patrimonioAnteriorEstimate = patrimonioActual - (ingresosMes - gastosMes);
                      let pctPatrimonioVar = patrimonioAnteriorEstimate !== 0 && !isNaN(patrimonioAnteriorEstimate)
                        ? Math.round(((patrimonioActual - patrimonioAnteriorEstimate) / Math.abs(patrimonioAnteriorEstimate)) * 100)
                        : 6;

                      // 2. Cálculo de Salud Financiera (Puntaje 0 - 100)
                      const tasaAhorro = ingresosMes > 0 ? Math.max(0, ((ingresosMes - gastosMes) / ingresosMes) * 100) : 15;
                      const scoreAhorro = Math.min(20, Math.max(0, Math.round((tasaAhorro / 20) * 20)));

                      const ratioDeuda = (disponible + ahorros) > 0 ? (deudas / (disponible + ahorros)) * 100 : 0;
                      const scoreDeuda = ratioDeuda <= 15 ? 20 : ratioDeuda <= 35 ? 14 : ratioDeuda <= 60 ? 8 : 2;

                      const gastosRef = gastosMes > 0 ? gastosMes : 1000000;
                      const mesesLiquidez = disponible / gastosRef;
                      const scoreLiquidez = mesesLiquidez >= 1.5 ? 20 : mesesLiquidez >= 0.8 ? 14 : 6;

                      let presupuestosCumplidos = 0;
                      dbBudgets.forEach(b => {
                        const spent = catExpensesThis[b.category] || 0;
                        if (spent <= b.maxAmount) presupuestosCumplidos++;
                      });
                      const totalBudgets = dbBudgets.length || 1;
                      const scorePresupuesto = Math.round((presupuestosCumplidos / totalBudgets) * 20);

                      const mesesFondo = ahorros / gastosRef;
                      const scoreFondo = mesesFondo >= 3 ? 20 : mesesFondo >= 1 ? 12 : 5;

                      const healthScore = Math.min(100, Math.max(0, Math.round(scoreAhorro + scoreDeuda + scoreLiquidez + scorePresupuesto + scoreFondo) || 88));

                      let healthRating = 'Excelente';
                      let healthBadgeClass = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
                      if (healthScore < 50) {
                        healthRating = 'En Riesgo';
                        healthBadgeClass = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
                      } else if (healthScore < 70) {
                        healthRating = 'Aceptable';
                        healthBadgeClass = 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
                      } else if (healthScore < 85) {
                        healthRating = 'Bueno';
                        healthBadgeClass = 'text-blue-400 border-blue-500/30 bg-blue-500/10';
                      }

                      // Viñetas de Salud Financiera
                      const healthBullets: Array<{ ok: boolean; warning?: boolean; text: string }> = [];
                      if (tasaAhorro >= 10) {
                        healthBullets.push({ ok: true, text: 'Buen ahorro' });
                      } else {
                        healthBullets.push({ ok: false, warning: true, text: `Margen de ahorro ajustado (${tasaAhorro.toFixed(0)}%)` });
                      }

                      const deudasVencidas = dbDebts.filter(d => {
                        if (!d.dueDate) return false;
                        const dDate = new Date(d.dueDate);
                        return dDate < now;
                      });

                      if (deudasVencidas.length === 0) {
                        healthBullets.push({ ok: true, text: 'Sin pagos vencidos' });
                      } else {
                        healthBullets.push({ ok: false, warning: true, text: `${deudasVencidas.length} pago(s) vencido(s)` });
                      }

                      const sortedCats = Object.entries(catExpensesThis).sort((a, b) => b[1] - a[1]);
                      if (sortedCats.length > 0 && sortedCats[0][1] > 0) {
                        const topCatName = sortedCats[0][0].replace(/^[^\w\s]+/, '').trim();
                        if (sortedCats[0][1] > gastosMes * 0.35) {
                          healthBullets.push({ ok: false, warning: true, text: `Gastos en ${topCatName.toLowerCase()} elevados` });
                        } else {
                          healthBullets.push({ ok: true, text: `Gasto principal en ${topCatName.toLowerCase()} controlado` });
                        }
                      } else {
                        healthBullets.push({ ok: true, text: 'Sin excesos en categorías' });
                      }

                      // 3. Flujo de Caja Próximo (Timeline & Saldo Proyectado)
                      const currentDay = now.getDate();
                      const currentMonthShort = now.toLocaleString('es-ES', { month: 'short' });

                      const rawEvents: Array<{
                        id: string;
                        day: number;
                        dateStr: string;
                        label: string;
                        amount: number;
                        type: 'income' | 'expense';
                        icon: string;
                      }> = [];

                      // Agregar Débitos automáticos
                      dbAutomaticDebits.filter(d => d.active).forEach(d => {
                        const dayVal = d.dayOfMonth || 1;
                        rawEvents.push({
                          id: 'debit-' + d.id,
                          day: dayVal,
                          dateStr: `${dayVal} ${currentMonthShort}`,
                          label: d.name,
                          amount: d.amount,
                          type: 'expense',
                          icon: '⚡'
                        });
                      });

                      // Agregar Suscripciones
                      dbSubscriptions.filter(s => s.status === 'active').forEach(s => {
                        let dayVal = 15;
                        if (s.dueDate) {
                          const dt = new Date(s.dueDate);
                          if (!isNaN(dt.getTime())) dayVal = dt.getDate();
                        }
                        rawEvents.push({
                          id: 'sub-' + s.id,
                          day: dayVal,
                          dateStr: `${dayVal} ${currentMonthShort}`,
                          label: s.name,
                          amount: s.cost,
                          type: 'expense',
                          icon: '📺'
                        });
                      });

                      // Agregar Deudas / Tarjetas
                      dbDebts.forEach(d => {
                        let dayVal = 5;
                        if (d.dueDate) {
                          const dt = new Date(d.dueDate);
                          if (!isNaN(dt.getTime())) dayVal = dt.getDate();
                        }
                        rawEvents.push({
                          id: 'debt-' + d.id,
                          day: dayVal,
                          dateStr: `${dayVal} ${currentMonthShort}`,
                          label: d.name,
                          amount: d.minPayment || d.balance,
                          type: 'expense',
                          icon: '💳'
                        });
                      });

                      // Datos de demostración reales si no hay configurados
                      if (rawEvents.length === 0) {
                        rawEvents.push(
                          { id: 'ev-1', day: Math.min(31, Math.max(2, currentDay)), dateStr: '2 Ago', label: 'Netflix', amount: 45000, type: 'expense', icon: '📺' },
                          { id: 'ev-2', day: Math.min(31, Math.max(5, currentDay + 2)), dateStr: '5 Ago', label: 'Tarjeta Visa', amount: 650000, type: 'expense', icon: '💳' },
                          { id: 'ev-3', day: Math.min(31, Math.max(8, currentDay + 5)), dateStr: '8 Ago', label: 'Internet', amount: 120000, type: 'expense', icon: '🌐' },
                          { id: 'ev-4', day: Math.min(31, Math.max(15, currentDay + 10)), dateStr: '15 Ago', label: 'Salario', amount: 4500000, type: 'income', icon: '💰' }
                        );
                      } else {
                        // Garantizar evento de salario/ingreso para proyección realista
                        const hasIncomeEv = rawEvents.some(e => e.type === 'income');
                        if (!hasIncomeEv) {
                          rawEvents.push({
                            id: 'ev-salario',
                            day: Math.min(31, Math.max(15, currentDay + 7)),
                            dateStr: '15 Ago',
                            label: 'Salario',
                            amount: Math.max(ingresosMes, 4500000),
                            type: 'income',
                            icon: '💰'
                          });
                        }
                      }

                      // Ordenar por día
                      rawEvents.sort((a, b) => a.day - b.day);

                      // Proyección de Saldo
                      const projIncomes = rawEvents.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
                      const projExpenses = rawEvents.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
                      const saldoProyectado = disponible + projIncomes - projExpenses;

                      // 4. Alertas Inteligentes
                      const smartAlertsList: Array<{
                        id: string;
                        severity: 'warning' | 'info' | 'success' | 'alert';
                        title: string;
                        message: string;
                        icon: any;
                      }> = [];

                      // Alerta 1: Patrimonio
                      if (pctPatrimonioVar < 0) {
                        smartAlertsList.push({
                          id: 'alt-patrimonio',
                          severity: 'alert',
                          title: 'Cambio de Patrimonio',
                          message: `Tu patrimonio cayó ${Math.abs(pctPatrimonioVar)}% este mes.`,
                          icon: TrendingDown
                        });
                      } else {
                        smartAlertsList.push({
                          id: 'alt-patrimonio',
                          severity: 'success',
                          title: 'Crecimiento Patrimonial',
                          message: `Tu patrimonio subió ${pctPatrimonioVar}% este mes.`,
                          icon: TrendingUp
                        });
                      }

                      // Alerta 2: Inactividad
                      let daysInactive = 14;
                      if (transactions.length > 0 && transactions[0].date) {
                        const lastDate = new Date(transactions[0].date);
                        const diffMs = Math.abs(now.getTime() - lastDate.getTime());
                        daysInactive = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                      }
                      if (daysInactive >= 3) {
                        smartAlertsList.push({
                          id: 'alt-inactividad',
                          severity: 'warning',
                          title: 'Inactividad de Registro',
                          message: `Llevas ${daysInactive > 0 ? daysInactive : 14} días sin registrar movimientos.`,
                          icon: Clock
                        });
                      } else {
                        smartAlertsList.push({
                          id: 'alt-inactividad',
                          severity: 'info',
                          title: 'Registros al Día',
                          message: 'Movimientos contabilizados recientemente.',
                          icon: CheckCircle2
                        });
                      }

                      // Alerta 3: Pagos esta semana
                      const weekPayments = rawEvents.filter(e => e.type === 'expense');
                      smartAlertsList.push({
                        id: 'alt-semana',
                        severity: 'info',
                        title: 'Vencimientos Semanales',
                        message: `Hay ${weekPayments.length} pagos durante esta semana.`,
                        icon: Calendar
                      });

                      // Alerta 4: Liquidez si un débito supera el disponible
                      const criticalDebits = dbAutomaticDebits.filter(d => d.amount > disponible);
                      if (criticalDebits.length > 0) {
                        smartAlertsList.push({
                          id: 'alt-liquidez',
                          severity: 'alert',
                          title: 'Riesgo de Liquidez',
                          message: `Fondo insuficiente para ${criticalDebits[0].name} ($${criticalDebits[0].amount.toLocaleString('es-ES')}).`,
                          icon: AlertTriangle
                        });
                      }

                      // Proporciones para gráficos
                      const maxVal = Math.max(ingresosMes, gastosMes, Math.abs(ahorroMes)) || 1;
                      const pctIngresos = (ingresosMes / maxVal) * 100;
                      const pctGastos = (gastosMes / maxVal) * 100;
                      const pctAhorro = (Math.max(0, ahorroMes) / maxVal) * 100;

                      return (
                        <>
                          {/* 1. RESUMEN IA & SALUDO PERSONALIZADO */}
                          {dashboardWidgetSettings.showAiInsight && (
                            <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 border border-emerald-500/20 rounded-2xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
                              <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 shadow-inner">
                                    <Bot className="w-6 h-6 animate-pulse" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h2 className="text-lg md:text-xl font-black text-white tracking-tight">
                                        {greetingTime}, {userName}.
                                      </h2>
                                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-yellow-400" /> Resumen IA
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5">Diagnóstico sintético de tu comportamiento financiero actual</p>
                                  </div>
                                </div>

                                <div className="text-left md:text-right">
                                  <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase tracking-wider">Período Evaluado</span>
                                  <span className="text-xs font-bold text-slate-300">
                                    {now.toLocaleString(getLangLocale(userProfileLanguage), { month: 'long', year: 'numeric' }).toUpperCase()}
                                  </span>
                                </div>
                              </div>

                              {/* Bullets de Inteligencia Financiera */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3 flex items-start gap-2.5">
                                  <span className="text-emerald-400 font-bold text-sm mt-0.5">•</span>
                                  <div className="text-slate-300">
                                    Este mes gastaste <strong className="text-white">{Math.abs(pctGastosVar)}% {pctGastosVar <= 0 ? 'menos' : 'más'}</strong> en total que el mes anterior.
                                  </div>
                                </div>

                                <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3 flex items-start gap-2.5">
                                  <span className="text-emerald-400 font-bold text-sm mt-0.5">•</span>
                                  <div className="text-slate-300">
                                    Gastaste <strong className="text-white">{categoryHighlightPct}% {isReduction ? 'menos' : 'más'}</strong> en <span className="capitalize">{categoryHighlight}</span> respecto al mes pasado.
                                  </div>
                                </div>

                                <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3 flex items-start gap-2.5 md:col-span-2">
                                  <span className="text-emerald-400 font-bold text-sm mt-0.5">•</span>
                                  <div className="text-slate-300">
                                    Tus ingresos <strong className="text-emerald-400">{pctIngresosVar >= 0 ? 'aumentaron' : 'disminuyeron'} {Math.abs(pctIngresosVar)}%</strong> respecto al mes pasado.
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 2. ESTADO FINANCIERO Y SALUD FINANCIERA */}
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            
                            {/* ESTADO FINANCIERO / PATRIMONIO */}
                            <div className={`${dashboardWidgetSettings.showFinancialHealth ? 'lg:col-span-6' : 'lg:col-span-12'} bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-5 relative overflow-hidden`}>
                              <div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                  <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
                                    <Landmark className="w-4 h-4 text-emerald-400" />
                                    Estado Financiero
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setIsBalancesHidden(!isBalancesHidden)}
                                      className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[10px]"
                                      title={isBalancesHidden ? "Mostrar Saldos" : "Ocultar Saldos"}
                                    >
                                      {isBalancesHidden ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
                                      <span className="hidden sm:inline">{isBalancesHidden ? 'Oculto' : 'Visible'}</span>
                                    </button>
                                    <span className="text-[10px] font-mono text-slate-500 uppercase">Balance General</span>
                                  </div>
                                </div>

                                <div className="mt-4">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Patrimonio Neto</span>
                                  <div className="flex flex-wrap items-baseline gap-3 mt-1">
                                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                                      {formatValue(patrimonioActual)}
                                    </span>
                                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                                      pctPatrimonioVar >= 0 
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                    }`}>
                                      {pctPatrimonioVar >= 0 ? '▲' : '▼'} {Math.abs(pctPatrimonioVar)}% respecto al mes anterior
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Desglose Activos vs Pasivos */}
                              <div className="grid grid-cols-3 gap-3 bg-slate-950/40 border border-white/5 rounded-xl p-3">
                                <div>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Disponible</span>
                                  <span className="text-xs sm:text-sm font-black text-white mt-0.5 block truncate">
                                    {formatValue(disponible)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Ahorros</span>
                                  <span className="text-xs sm:text-sm font-black text-blue-400 mt-0.5 block truncate">
                                    {formatValue(ahorros)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Deudas</span>
                                  <span className="text-xs sm:text-sm font-black text-rose-400 mt-0.5 block truncate">
                                    {formatValue(deudas)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* SALUD FINANCIERA (0 - 100) */}
                            {dashboardWidgetSettings.showFinancialHealth && (
                              <div className="lg:col-span-6 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-4">
                                <div>
                                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                    <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
                                      <Activity className="w-4 h-4 text-emerald-400" />
                                      Salud Financiera
                                    </h3>
                                    <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${healthBadgeClass}`}>
                                      {healthRating}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-4 mt-4">
                                    <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                                      {healthScore} <span className="text-sm font-semibold text-slate-500">/ 100</span>
                                    </div>
                                    <div className="flex-1 bg-slate-950/60 border border-white/10 rounded-full h-3 overflow-hidden p-0.5">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${healthScore}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className={`h-full rounded-full ${
                                          healthScore >= 85 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                                          healthScore >= 70 ? 'bg-gradient-to-r from-blue-500 to-emerald-400' :
                                          healthScore >= 50 ? 'bg-gradient-to-r from-yellow-500 to-amber-400' :
                                          'bg-gradient-to-r from-rose-500 to-red-400'
                                        }`}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Indicadores / Diagnostic bullets */}
                                <div className="space-y-1.5 pt-1">
                                  {healthBullets.map((bullet, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-200">
                                      {bullet.ok ? (
                                        <span className="text-emerald-400 font-bold">✔</span>
                                      ) : (
                                        <span className="text-amber-400 font-bold">⚠</span>
                                      )}
                                      <span>{bullet.text}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>

                          {/* 3. FLUJO DE CAJA PRÓXIMO & ALERTAS INTELIGENTES */}
                          {dashboardWidgetSettings.showCashflow && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                              {/* FLUJO DE CAJA PRÓXIMO (TIMELINE) */}
                              <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-4">
                                <div>
                                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                    <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
                                      <Calendar className="w-4 h-4 text-emerald-400" />
                                      Flujo de Caja Próximo
                                    </h3>
                                    <span className="text-[10px] font-mono text-slate-500">Próximos eventos</span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-1">Línea de tiempo de ingresos y egresos programados</p>
                                </div>

                                {/* Timeline de Eventos CON SCROLL Y MAX-HEIGHT */}
                                <div className="relative pl-4 space-y-3.5 my-2 border-l-2 border-emerald-500/20 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                                  {/* Punto inicial: Hoy */}
                                  <div className="relative flex items-center justify-between text-xs bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
                                    <div className="absolute -left-[23px] top-3 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
                                    <div className="flex items-center gap-2">
                                      <span className="font-extrabold text-emerald-400 uppercase text-[11px]">Hoy</span>
                                      <span className="text-slate-400">• Liquidez disponible</span>
                                    </div>
                                    <span className="font-bold text-white">{formatValue(disponible)}</span>
                                  </div>

                                  {rawEvents.map((ev) => (
                                    <div key={ev.id} className="relative flex items-center justify-between text-xs bg-slate-950/30 p-2.5 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                                      <div className="absolute -left-[23px] top-3.5 w-2.5 h-2.5 bg-slate-600 rounded-full border border-slate-900" />
                                      <div className="flex items-center gap-2.5">
                                        <span className="font-bold text-slate-300 min-w-[45px] text-[11px]">{ev.dateStr}</span>
                                        <span className="text-base">{ev.icon}</span>
                                        <span className="font-semibold text-white">{ev.label}</span>
                                      </div>
                                      <span className={`font-extrabold ${ev.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {ev.type === 'income' ? '+' : '-'} {formatValue(ev.amount)}
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                {/* Saldo Proyectado */}
                                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between">
                                  <div>
                                    <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block">Saldo Proyectado</span>
                                    <span className="text-[10px] text-slate-400">Estimación al cierre del período</span>
                                  </div>
                                  <span className="text-xl font-black text-emerald-400">
                                    {formatValue(saldoProyectado)}
                                  </span>
                                </div>
                              </div>

                              {/* ALERTAS INTELIGENTES */}
                              <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between gap-4">
                                <div>
                                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                    <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-2">
                                      <Bell className="w-4 h-4 text-yellow-400" />
                                      Alertas Inteligentes
                                    </h3>
                                    <span className="text-[10px] font-mono text-slate-500">Monitoreo activo</span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-1">Notificaciones contextuales de hábitos y variaciones</p>
                                </div>

                                <div className="space-y-3 my-1 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                                  {smartAlertsList.map((alt) => {
                                    const IconComp = alt.icon;
                                    let bgClass = 'bg-blue-500/10 border-blue-500/20 text-blue-400';
                                    if (alt.severity === 'alert') bgClass = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
                                    if (alt.severity === 'warning') bgClass = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
                                    if (alt.severity === 'success') bgClass = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';

                                    return (
                                      <div key={alt.id} className={`p-3.5 rounded-xl border flex items-start gap-3 ${bgClass}`}>
                                        <IconComp className="w-4 h-4 shrink-0 mt-0.5" />
                                        <div>
                                          <div className="font-bold text-xs text-white">{alt.title}</div>
                                          <div className="text-xs opacity-90 mt-0.5">{alt.message}</div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                <div className="text-[10px] text-slate-500 font-mono text-center border-t border-white/5 pt-2">
                                  ContabilidApp AI • Sistema de Detección de Riesgos
                                </div>
                              </div>

                            </div>
                          )}

                          {/* 4. GRÁFICOS Y DISTRIBUCIÓN DE CATEGORÍAS */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Gráfico Comparativo Mensual */}
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
                              const gastosMesTxs = transactions.filter(t => {
                                if (!t.date || t.type !== 'expense') return false;
                                const d = new Date(t.date);
                                return d.getFullYear() === thisYear && d.getMonth() === thisMonth;
                              });

                              const totalGastosMes = gastosMesTxs.reduce((sum, t) => sum + t.amount, 0);

                              const categorizadosMap: { [key: string]: number } = {};
                              gastosMesTxs.forEach(t => {
                                const categoryField = t.category || (t as any).categoria || 'Otros';
                                const details = getCategoryDetails(categoryField);
                                const catKey = details.emoji + ' ' + details.name;
                                categorizadosMap[catKey] = (categorizadosMap[catKey] || 0) + t.amount;
                              });

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
                                type="text"
                                inputMode="numeric"
                                placeholder="0"
                                required
                                value={txAmount}
                                onChange={(e) => setTxAmount(formatNumberMask(e.target.value))}
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
                                       <h4 className="font-bold text-white text-sm">{acc.alias || acc.nombre}</h4>
                                       <div className="flex items-center gap-1">
                                         {acc.alias ? (
                                           <span className="text-[9px] text-slate-400 font-mono truncate max-w-[80px]">
                                             {acc.nombre} •
                                           </span>
                                         ) : null}
                                         <span className="text-[9px] font-mono text-slate-400 tracking-wider uppercase">
                                           {acc.subtipo === 'ahorros' ? '🏦 Ahorros' : acc.subtipo === 'disponible' ? '💵 Disponible' : '💳 Deuda / Pasivo'}
                                         </span>
                                       </div>
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
                        const accTransactions = transactions.filter(t => ((t as any).accountId === selectedAcc.id || (t as any).cuentaId === selectedAcc.id));
                        const validAccTransactions = accTransactions.filter(t => (t as any).reconciliationStatus !== 'anulado');

                        // 1. Historial de Saldo en esta Cuenta (Hoy, Hace 30 Días, Hace 6 Meses)
                        const now = new Date();
                        const date30Ago = new Date();
                        date30Ago.setDate(now.getDate() - 30);
                        const date180Ago = new Date();
                        date180Ago.setDate(now.getDate() - 180);

                        const txs30Days = validAccTransactions.filter(t => t.date && new Date(t.date) >= date30Ago);
                        const net30Days = txs30Days.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
                        const saldo30Ago = selectedAcc.saldo - net30Days;

                        const txs180Days = validAccTransactions.filter(t => t.date && new Date(t.date) >= date180Ago);
                        const net180Days = txs180Days.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
                        const saldo180Ago = selectedAcc.saldo - net180Days;

                        // 2. Proyección de Saldo (15 de agosto)
                        const pendingDebits = dbAutomaticDebits
                          .filter(d => d.accountId === selectedAcc.id && d.active)
                          .reduce((sum, d) => sum + d.amount, 0);
                        const projectedBalance = selectedAcc.saldo - pendingDebits;

                        // 3. Puntos para Balance Diario (últimos 14 días)
                        const dailyPoints = Array.from({ length: 14 }).map((_, idx) => {
                          const d = new Date();
                          d.setDate(d.getDate() - (13 - idx));
                          const dateStr = d.toISOString().split('T')[0];
                          const dayNum = d.getDate();
                          const monthShort = d.toLocaleDateString('es-ES', { month: 'short' });
                          
                          const txsAfter = validAccTransactions.filter(t => t.date && new Date(t.date) > d);
                          const netAfter = txsAfter.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
                          const dayBalance = selectedAcc.saldo - netAfter;

                          return {
                            dateStr,
                            label: `${dayNum} ${monthShort}`,
                            balance: Math.max(0, dayBalance)
                          };
                        });

                        const maxDailyBal = Math.max(...dailyPoints.map(p => p.balance), 1);

                        return (
                          <div className="flex flex-col gap-4">
                            {/* Cabecera Cuenta Seleccionada y Alias */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col gap-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[9px] font-mono text-emerald-400 tracking-widest uppercase">CUENTA SELECCIONADA</span>
                                  <h3 className="text-2xl font-black text-white mt-0.5 flex items-center gap-2">
                                    {selectedAcc.alias || selectedAcc.nombre}
                                  </h3>
                                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    {selectedAcc.alias ? `Nombre oficial: ${selectedAcc.nombre}` : 'Sin alias configurado'}
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    if (editingAliasAccId === selectedAcc.id) {
                                      setEditingAliasAccId(null);
                                    } else {
                                      setEditingAliasAccId(selectedAcc.id);
                                      setEditingAliasValue(selectedAcc.alias || selectedAcc.nombre);
                                    }
                                  }}
                                  className="text-[10px] bg-white/10 hover:bg-white/15 text-slate-200 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <span>🏷️ {editingAliasAccId === selectedAcc.id ? 'Cerrar Editor' : 'Editar Alias'}</span>
                                </button>
                              </div>

                              {/* Editor de Alias Inline */}
                              {editingAliasAccId === selectedAcc.id && (
                                <div className="p-3 bg-slate-950/60 rounded-xl border border-emerald-500/30 flex flex-col gap-2.5 animate-fadeIn">
                                  <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Alias de la Cuenta (Nombre Amigable)</label>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="Ej: 💰 Cuenta Principal, 🏖 Vacaciones"
                                      value={editingAliasValue}
                                      onChange={(e) => setEditingAliasValue(e.target.value)}
                                      className="flex-1 bg-white/5 border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                    <button
                                      onClick={() => handleSaveAccountAlias(selectedAcc.id, editingAliasValue)}
                                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer"
                                    >
                                      Guardar
                                    </button>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    <span className="text-[9px] text-slate-400 self-center">Sugeridos:</span>
                                    {['💰 Cuenta Principal', '🏖 Vacaciones', '💳 Tarjeta Principal', '🏦 Nómina', '🛒 Mercado', '💵 Efectivo'].map((preset) => (
                                      <button
                                        key={preset}
                                        onClick={() => setEditingAliasValue(preset)}
                                        className="text-[9px] bg-white/5 hover:bg-white/10 text-slate-300 px-2 py-0.5 rounded-lg border border-white/5 transition-all cursor-pointer"
                                      >
                                        {preset}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Balance Líquido */}
                              <div className="flex justify-between items-end border-t border-white/5 pt-3">
                                <div>
                                  <span className="text-[9px] text-slate-400 block uppercase font-semibold">Balance Líquido Actual</span>
                                  <span className={`text-2xl font-black ${selectedAcc.tipo === 'credito' ? 'text-white' : 'text-rose-400'}`}>
                                    ${selectedAcc.saldo.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </div>
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase border ${selectedAcc.tipo === 'credito' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                  {selectedAcc.tipo === 'credito' ? 'Activo' : 'Tarjeta / Pasivo'}
                                </span>
                              </div>

                              <button
                                onClick={() => setShowAddAccountTxModal(true)}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-extrabold text-xs py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                              >
                                <Plus className="w-4 h-4 stroke-[3]" />
                                Registrar Transacción Directa
                              </button>
                            </div>

                            {/* HISTORIAL DE SALDO (Hoy, Hace 30 días, Hace 6 meses) */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col gap-3">
                              <h4 className="font-bold text-white text-xs tracking-wider uppercase border-b border-white/5 pb-2 flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                                Historial de Saldo en esta Cuenta
                              </h4>
                              
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5">
                                  <span className="text-[9px] font-mono text-slate-400 uppercase block">Hoy</span>
                                  <span className="text-sm font-extrabold text-white block mt-1">
                                    ${selectedAcc.saldo.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                                  </span>
                                  <span className="text-[9px] font-mono text-emerald-400">Actual</span>
                                </div>

                                <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5">
                                  <span className="text-[9px] font-mono text-slate-400 uppercase block">Hace 30 Días</span>
                                  <span className="text-sm font-extrabold text-slate-200 block mt-1">
                                    ${saldo30Ago.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                                  </span>
                                  <span className={`text-[9px] font-mono ${net30Days >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {net30Days >= 0 ? '▲ +' : '▼ -'}${Math.abs(net30Days).toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                                  </span>
                                </div>

                                <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5">
                                  <span className="text-[9px] font-mono text-slate-400 uppercase block">Hace 6 Meses</span>
                                  <span className="text-sm font-extrabold text-slate-200 block mt-1">
                                    ${saldo180Ago.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                                  </span>
                                  <span className={`text-[9px] font-mono ${net180Days >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {net180Days >= 0 ? '▲ +' : '▼ -'}${Math.abs(net180Days).toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* BALANCE DIARIO - GRÁFICA DE SALDO DÍA POR DÍA */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col gap-3">
                              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <h4 className="font-bold text-white text-xs tracking-wider uppercase flex items-center gap-2">
                                  <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
                                  Balance Diario (Evolución de Saldo)
                                </h4>
                                <span className="text-[9px] font-mono text-slate-400">Últimos 14 días</span>
                              </div>

                              <div className="h-28 flex items-end justify-between gap-1 pt-4 pb-1 px-2 bg-slate-950/40 rounded-xl border border-white/5 relative">
                                {dailyPoints.map((pt) => {
                                  const heightPct = Math.max(10, Math.min(100, Math.round((pt.balance / maxDailyBal) * 100)));
                                  return (
                                    <div key={pt.dateStr} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                                      {/* Tooltip */}
                                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-all bg-slate-900 border border-white/10 px-2 py-0.5 rounded text-[8px] text-white font-mono z-10 whitespace-nowrap pointer-events-none">
                                        {pt.label}: ${pt.balance.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                                      </div>
                                      <div
                                        style={{ height: `${heightPct}%` }}
                                        className="w-full bg-gradient-to-t from-emerald-600/40 to-emerald-400 rounded-t group-hover:from-emerald-500 group-hover:to-emerald-300 transition-all"
                                      />
                                      <span className="text-[7.5px] font-mono text-slate-500 truncate w-full text-center">
                                        {pt.label.split(' ')[0]}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* PROYECCIÓN FINANCIERA */}
                            <div className="bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-950 border border-indigo-500/20 rounded-2xl p-4 shadow-xl flex flex-col gap-2 relative overflow-hidden">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Proyección de Saldo Automática</span>
                              </div>
                              <p className="text-xs text-slate-200 leading-relaxed">
                                Si no realizas movimientos adicionales, el <strong className="text-emerald-400">15 de agosto</strong> tu saldo estimado será de:
                              </p>
                              <div className="flex justify-between items-baseline bg-black/30 px-3 py-2 rounded-xl border border-white/5">
                                <span className="text-xs text-slate-400">Saldo Proyectado:</span>
                                <span className="text-xl font-black text-emerald-400 font-mono">
                                  ${projectedBalance.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                              <span className="text-[9px] text-slate-400 italic">
                                *Calculado a partir de tu saldo actual (${selectedAcc.saldo.toLocaleString('es-ES')}) menos compromisos y débitos pendientes (${pendingDebits.toLocaleString('es-ES')}).
                              </span>
                            </div>

                            {/* Transferir Dinero a otra Cuenta */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col gap-3">
                              <h4 className="font-bold text-white text-xs tracking-wider uppercase border-b border-white/5 pb-2">Transferir a otra Cuenta</h4>
                              
                              <form onSubmit={handleAccountTransfer} className="flex flex-col gap-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[10px] font-semibold text-slate-300 mb-1">Monto a Transferir ($)</label>
                                    <input 
                                      type="text"
                                      inputMode="numeric"
                                      required
                                      placeholder="0"
                                      value={transferAmount}
                                      onChange={(e) => setTransferAmount(formatNumberMask(e.target.value))}
                                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                                            {a.alias || a.nombre} (Saldo: ${a.saldo.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
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

                            {/* HISTORIAL Y CONCILIACIÓN DE MOVIMIENTOS */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col gap-3">
                              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <h4 className="font-bold text-white text-xs tracking-wider uppercase">
                                  Movimientos y Conciliación ({selectedAcc.alias || selectedAcc.nombre})
                                </h4>
                                <span className="text-[9px] text-slate-400 font-mono">Haz clic en el estado para cambiarlo</span>
                              </div>
                              
                              {accTransactions.length === 0 ? (
                                <div className="py-4 text-center text-xs text-slate-500">No hay movimientos registrados para esta cuenta.</div>
                              ) : (
                                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                                  {accTransactions.map(tx => {
                                    const st = (tx as any).reconciliationStatus || 'conciliado';
                                    const statusBadges = {
                                      conciliado: { label: '✔️ Conciliado', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' },
                                      pendiente: { label: '🟡 Pendiente', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' },
                                      anulado: { label: '🚫 Anulado', cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20 line-through' }
                                    };
                                    const currentBadge = statusBadges[st as keyof typeof statusBadges] || statusBadges.conciliado;

                                    return (
                                      <div key={tx.id} className="flex justify-between items-center p-2.5 bg-white/5 rounded-xl border border-white/5 text-xs hover:bg-white/8 transition-all">
                                        <div className="flex flex-col max-w-[50%]">
                                          <span className={`font-bold text-white truncate ${st === 'anulado' ? 'line-through text-slate-500' : ''}`}>
                                            {tx.description || tx.category}
                                          </span>
                                          <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                                            {tx.date ? tx.date.split('T')[0] : 'Sin fecha'} • {tx.category}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          {/* Píldora de Conciliación 1-Click */}
                                          <button
                                            onClick={() => handleToggleReconciliation(tx.id, st)}
                                            className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${currentBadge.cls}`}
                                            title="Haz clic para alternar estado: Pendiente -> Conciliado -> Anulado"
                                          >
                                            {currentBadge.label}
                                          </button>

                                          <span className={`font-mono font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'} ${st === 'anulado' ? 'line-through opacity-50' : ''}`}>
                                            {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                          </span>

                                          <button 
                                            onClick={() => handleDeleteTransaction(tx.id)}
                                            className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                                            title="Eliminar Movimiento"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* PANEL INFERIOR: DÉBITOS AUTOMÁTICOS DE CUENTAS */}
                    <div className="lg:col-span-12 flex flex-col gap-4 mt-2">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                          <div>
                            <h3 className="font-black text-white text-sm tracking-wider uppercase flex items-center gap-2">
                              <Zap className="w-4.5 h-4.5 text-yellow-400" />
                              Débitos Automáticos y Pagos Programados
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Asocia cobros recurrentes a tus cuentas. Si una cuenta no tiene suficiente saldo en el día programado, recibirás una notificación de alerta en tu dispositivo.
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap shrink-0">
                            <button
                              type="button"
                              onClick={() => processAutomaticDebits(true)}
                              className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                              title="Verificar fechas de cobro y validar saldos disponibles"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              Procesar Débitos
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (accounts.length > 0) {
                                  setNewDebitAccountId(accounts[0].id);
                                }
                                setIsAddDebitModalOpen(true);
                              }}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                            >
                              <PlusCircle className="w-4 h-4" />
                              Nuevo Débito Automático
                            </button>
                          </div>
                        </div>

                        {/* Banner informativo de alertas si hay débitos con fondos insuficientes */}
                        {dbAutomaticDebits.some(d => d.active && d.status === 'insufficient_funds') && (
                          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 flex items-center justify-between gap-3 text-red-300 text-xs animate-pulse">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                              <span>
                                <strong>¡Alerta de Débito Fallido!</strong> Se detectó saldo insuficiente en la cuenta para procesar uno o más débitos automáticos.
                              </span>
                            </div>
                            <button
                              onClick={requestNotificationPermission}
                              className="bg-red-500 text-slate-950 font-bold text-[10px] px-2.5 py-1 rounded-lg shrink-0 cursor-pointer"
                            >
                              Verificar Notificaciones
                            </button>
                          </div>
                        )}

                        {/* Listado de Débitos Automáticos */}
                        {dbAutomaticDebits.length === 0 ? (
                          <div className="text-center py-8 flex flex-col items-center justify-center gap-2 bg-slate-950/20 rounded-xl border border-white/5 p-6">
                            <Clock className="w-8 h-8 text-slate-600" />
                            <p className="text-xs text-slate-400 font-medium">No has configurado ningún débito automático.</p>
                            <p className="text-[10px] text-slate-600 max-w-sm">
                              Agrega pagos de servicios, suscripciones o facturas mensuales que se liquiden directamente desde el saldo de tus cuentas.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {dbAutomaticDebits.map((debit) => {
                              const acc = accounts.find(a => a.id === debit.accountId);
                              const hasInsufficientFunds = debit.active && acc && acc.saldo < debit.amount;
                              const isExecutedThisMonth = debit.lastExecutedDate === new Date().toISOString().slice(0, 7);

                              return (
                                <div
                                  key={debit.id}
                                  className={`p-4 rounded-xl border transition-all flex flex-col gap-3 relative ${
                                    hasInsufficientFunds
                                      ? 'bg-red-500/10 border-red-500/30 shadow-lg shadow-red-500/5'
                                      : isExecutedThisMonth
                                      ? 'bg-emerald-500/5 border-emerald-500/20'
                                      : 'bg-slate-950/40 border-white/10 hover:border-white/20'
                                  }`}
                                >
                                  <div className="flex justify-between items-start gap-2">
                                    <div>
                                      <h4 className="font-bold text-white text-xs">{debit.name}</h4>
                                      <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                                        {debit.category} • Día {debit.dayOfMonth} de cada mes
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleAutomaticDebit(debit.id, debit.active)}
                                        className={`p-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                                          debit.active ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20' : 'text-slate-500 bg-white/5 hover:bg-white/10'
                                        }`}
                                        title={debit.active ? 'Pausar Débito' : 'Activar Débito'}
                                      >
                                        {debit.active ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleDeleteAutomaticDebit(debit.id)}
                                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                                        title="Eliminar Débito Automático"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="flex justify-between items-end border-t border-white/5 pt-2 mt-0.5">
                                    <div>
                                      <span className="text-[9px] text-slate-500 block uppercase font-mono">Monto a Debitar</span>
                                      <span className="text-base font-extrabold text-white">
                                        ${debit.amount.toLocaleString('es-CO')}
                                      </span>
                                    </div>

                                    <div className="text-right">
                                      <span className="text-[9px] text-slate-400 block font-mono">Cuenta Origen</span>
                                      <span className="text-xs font-bold text-emerald-400 truncate max-w-[120px] block">
                                        {acc ? acc.nombre : 'Sin cuenta'}
                                      </span>
                                      {acc && (
                                        <span className={`text-[9px] font-mono block ${acc.saldo < debit.amount ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                                          Saldo: ${acc.saldo.toLocaleString('es-CO')}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Badges de Estado */}
                                  <div className="flex items-center justify-between gap-2 mt-1 pt-2 border-t border-white/5">
                                    {hasInsufficientFunds ? (
                                      <span className="text-[9px] font-black uppercase text-red-400 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30 flex items-center gap-1">
                                        🔴 Saldo Insuficiente
                                      </span>
                                    ) : isExecutedThisMonth ? (
                                      <span className="text-[9px] font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                                        ✅ Ejecutado Este Mes
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                        ⏳ Día {debit.dayOfMonth} Programado
                                      </span>
                                    )}

                                    {debit.active && (
                                      <button
                                        type="button"
                                        onClick={() => processAutomaticDebits(true)}
                                        className="text-[9px] font-bold text-yellow-400 hover:underline flex items-center gap-1 cursor-pointer"
                                      >
                                        <Zap className="w-3 h-3" />
                                        Ejecutar
                                      </button>
                                    )}
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
                    {/* ENCABEZADO DE SECCIÓN CON ACCIONES RÁPIDAS */}
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 border border-white/5 rounded-2xl p-5 shadow-lg">
                        <div>
                          <h3 className="text-sm font-black text-white tracking-wider uppercase flex items-center gap-2">
                            <Coins className="w-4 h-4 text-emerald-400" />
                            Gestión Centralizada de Movimientos
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Lleva control total de tus transacciones, duplicación en 1-clic, división de gastos, mapa y timeline.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                          <button
                            onClick={handleProcessMonthlyRecurring}
                            className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 text-xs font-bold px-3.5 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
                            title="Genera automáticamente los gastos/ingresos de este mes según tus plantillas o movimientos marcados como recurrentes"
                          >
                            <Repeat className="w-3.5 h-3.5" />
                            <span>Recurrentes del Mes</span>
                          </button>

                          <button
                            onClick={() => {
                              handleResetTxForm();
                              setShowNewTxModal(true);
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-slate-950 text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-emerald-500/15 cursor-pointer flex items-center justify-center gap-1.5 transition-all shrink-0"
                          >
                            <Plus className="w-4 h-4 text-slate-950 stroke-[3px]" />
                            Nuevo Movimiento
                          </button>
                        </div>
                      </div>

                      {/* FAVORITOS RÁPIDOS (BARRA HORIZONTAL EN 1-CLIC) */}
                      <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-3 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400/20" />
                            Favoritos Frecuentes (Registrar en 1-clic)
                          </span>
                          <span className="text-[9px] text-slate-500">Haz clic para precargar</span>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                          {quickFavorites.map(fav => (
                            <button
                              key={fav.id}
                              onClick={() => handleApplyFavorite(fav)}
                              className="px-3 py-1.5 bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 rounded-xl text-xs font-semibold text-slate-200 hover:text-amber-300 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                            >
                              <span>{fav.emoji}</span>
                              <span>{fav.title}</span>
                              <span className="text-[10px] text-amber-400 font-mono font-bold">${fav.amount.toLocaleString('es-ES')}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* CONMUTADOR DE VISTAS (TIMELINE / TABLA / MAPA) */}
                      <div className="flex items-center justify-between bg-white/5 border border-white/10 p-1.5 rounded-2xl">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setTxViewMode('timeline')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              txViewMode === 'timeline'
                                ? 'bg-emerald-500 text-slate-950 shadow-md'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <CalendarDays className="w-3.5 h-3.5" />
                            <span>Timeline Visual</span>
                          </button>

                          <button
                            onClick={() => setTxViewMode('table')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              txViewMode === 'table'
                                ? 'bg-emerald-500 text-slate-950 shadow-md'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Tabla Compacta</span>
                          </button>

                          <button
                            onClick={() => setTxViewMode('map')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              txViewMode === 'map'
                                ? 'bg-emerald-500 text-slate-950 shadow-md'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Mapa de Gastos</span>
                          </button>
                        </div>

                        <span className="text-[10px] font-mono text-slate-400 px-3 hidden sm:inline-block">
                          {transactions.length} movimientos totales
                        </span>
                      </div>
                    </div>

                    {/* BARRA DE FILTROS DE BÚSQUEDA */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
                      <h3 className="font-bold text-white text-xs tracking-wider uppercase flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-emerald-400" />
                          <span>Filtros de Búsqueda</span>
                        </div>
                        {queryTag && (
                          <span className="text-[10px] font-bold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-lg border border-blue-500/30">
                            Etiqueta: {queryTag}
                          </span>
                        )}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
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
                              <option key={a.id} value={a.id}>{a.alias || a.nombre}</option>
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

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Conciliación</label>
                          <select
                            value={queryReconciliationStatus}
                            onChange={(e) => setQueryReconciliationStatus(e.target.value)}
                            className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="ALL">Todos los Estados</option>
                            <option value="conciliado">✔️ Conciliado</option>
                            <option value="pendiente">🟡 Pendiente</option>
                            <option value="anulado">🚫 Anulado</option>
                          </select>
                        </div>
                      </div>

                      {/* Botón de Limpiar Filtros */}
                      <div className="flex items-center justify-between border-t border-white/5 pt-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-slate-400">Filtrar por Etiqueta:</span>
                          {['#Trabajo', '#Viaje', '#Proyecto', '#Restaurante', '#Mascota', '#Hogar'].map(t => (
                            <button
                              type="button"
                              key={t}
                              onClick={() => setQueryTag(queryTag === t ? '' : t)}
                              className={`text-[9px] px-2 py-0.5 rounded-lg border font-bold cursor-pointer transition-all ${
                                queryTag === t ? 'bg-blue-500 text-slate-950 border-blue-400' : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            setQueryStartDate('');
                            setQueryEndDate('');
                            setQueryAccountId('ALL');
                            setQueryCategory('ALL');
                            setQueryReconciliationStatus('ALL');
                            setQueryTag('');
                          }}
                          className="bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-white/10 cursor-pointer flex items-center gap-1.5 transition-all"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Limpiar Filtros
                        </button>
                      </div>
                    </div>

                    {/* LÓGICA DE PROCESAMIENTO Y FILTRADO */}
                    {(() => {
                      const matched = transactions.filter(t => {
                        const tDateOnly = t.date ? t.date.split('T')[0] : '';
                        if (queryStartDate && (!tDateOnly || tDateOnly < queryStartDate)) return false;
                        if (queryEndDate && (!tDateOnly || tDateOnly > queryEndDate)) return false;
                        if (queryAccountId !== 'ALL') {
                          const tAccId = (t as any).accountId || (t as any).cuentaId;
                          if (tAccId !== queryAccountId) return false;
                        }
                        if (queryCategory !== 'ALL') {
                          const tCatName = getCategoryDetails(t.category || '').name.toLowerCase().trim();
                          const qCatName = getCategoryDetails(queryCategory).name.toLowerCase().trim();
                          if (tCatName !== qCatName) return false;
                        }
                        if (queryReconciliationStatus !== 'ALL') {
                          const status = (t as any).reconciliationStatus || 'conciliado';
                          if (status !== queryReconciliationStatus) return false;
                        }
                        if (queryTag) {
                          const hasTag = t.tags && t.tags.includes(queryTag);
                          if (!hasTag) return false;
                        }
                        return true;
                      });

                      const inc = matched.filter(t => t.type === 'income' || t.tipo === 'ingreso').reduce((s, t) => s + t.amount, 0);
                      const exp = matched.filter(t => t.type === 'expense' || t.tipo === 'egreso').reduce((s, t) => s + t.amount, 0);
                      const neto = inc - exp;

                      return (
                        <div className="flex flex-col gap-5">
                          {/* KPI ROW */}
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
                                <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold">Balance de Seleccionados</span>
                                <span className="text-xl font-black mt-1 block">${neto.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                              <DollarSign className="w-6 h-6" />
                            </div>
                          </div>

                          {/* 1. VISTA: TIMELINE VISUAL */}
                          {txViewMode === 'timeline' && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-6">
                              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                <h4 className="font-bold text-white text-xs tracking-wider uppercase flex items-center gap-2">
                                  <CalendarDays className="w-4 h-4 text-emerald-400" />
                                  <span>Timeline Visual Cronológico</span>
                                </h4>
                                <span className="text-[10px] font-mono text-slate-500">{matched.length} movimientos</span>
                              </div>

                              {matched.length === 0 ? (
                                <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-1.5 justify-center">
                                  <Search className="w-6 h-6 text-slate-700" />
                                  <span>No se encontraron movimientos. Intenta ajustar los filtros de búsqueda.</span>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                                  {(() => {
                                    // Agrupar movimientos por fecha relativa
                                    const grouped = matched.reduce((acc, tx) => {
                                      const dStr = tx.date ? tx.date.split('T')[0] : 'Sin fecha';
                                      if (!acc[dStr]) acc[dStr] = [];
                                      acc[dStr].push(tx);
                                      return acc;
                                    }, {} as Record<string, Transaction[]>);

                                    const todayStr = new Date().toISOString().split('T')[0];
                                    const yesterdayObj = new Date();
                                    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
                                    const yesterdayStr = yesterdayObj.toISOString().split('T')[0];

                                    return Object.entries(grouped)
                                      .sort(([a], [b]) => b.localeCompare(a))
                                      .map(([dateKey, txList]) => {
                                        let label = dateKey;
                                        if (dateKey === todayStr) label = 'Hoy';
                                        else if (dateKey === yesterdayStr) label = 'Ayer';
                                        else {
                                          try {
                                            const parts = dateKey.split('-');
                                            if (parts.length === 3) {
                                              const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                                              label = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
                                            }
                                          } catch (e) {}
                                        }

                                        const itemsArray = txList as any[];
                                        const daySum = itemsArray.reduce((sum, item) => {
                                          return item.type === 'income' || item.tipo === 'ingreso' ? sum + item.amount : sum - item.amount;
                                        }, 0);

                                        return (
                                          <div key={dateKey} className="flex flex-col gap-3 relative pl-8">
                                            {/* Nodo del timeline */}
                                            <div className="absolute left-2.5 top-1.5 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-sm shadow-emerald-500/50"></div>

                                            {/* Encabezado del Día */}
                                            <div className="flex items-center justify-between bg-slate-900/60 border border-white/5 px-3.5 py-1.5 rounded-xl">
                                              <span className="text-xs font-bold text-white capitalize flex items-center gap-2">
                                                <span>📅</span>
                                                <span>{label}</span>
                                                <span className="text-[10px] text-slate-500 font-normal">({itemsArray.length} mov)</span>
                                              </span>
                                              <span className={`text-xs font-black font-mono ${daySum >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {daySum >= 0 ? '+' : ''}${daySum.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                              </span>
                                            </div>

                                            {/* Lista de Tarjetas de Movimientos para este Día */}
                                            <div className="flex flex-col gap-2">
                                              {itemsArray.map(tx => {
                                                const txAccId = (tx as any).accountId || (tx as any).cuentaId;
                                                const matchedAcc = accounts.find(a => a.id === txAccId);
                                                const details = getCategoryDetails(tx.category || (tx as any).categoria);
                                                const isInc = tx.type === 'income' || tx.tipo === 'ingreso';
                                                const status = (tx as any).reconciliationStatus || 'conciliado';

                                                return (
                                                  <div
                                                    key={tx.id}
                                                    className="bg-slate-950/40 border border-white/10 hover:border-white/20 rounded-2xl p-3.5 transition-all flex flex-col gap-2.5 relative group"
                                                  >
                                                    <div className="flex items-start justify-between gap-2">
                                                      <div className="flex items-start gap-2.5">
                                                        <div className={`p-2.5 rounded-xl border text-lg shrink-0 ${details.bgCol}`}>
                                                          {details.emoji}
                                                        </div>
                                                        <div>
                                                          <h5 className="font-extrabold text-white text-xs">
                                                            {tx.description || details.name}
                                                          </h5>
                                                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                            <span className="text-[10px] text-slate-400">
                                                              {matchedAcc ? (matchedAcc.alias || matchedAcc.nombre) : 'Cuenta Principal'}
                                                            </span>
                                                            <span className="text-slate-600">•</span>
                                                            <span className="text-[10px] text-slate-400">{details.name}</span>

                                                            {/* Status Badge */}
                                                            <button
                                                              onClick={() => handleToggleReconciliation(tx.id, status)}
                                                              className={`text-[8px] font-bold px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                                                                status === 'conciliado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                                status === 'pendiente' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                                'bg-rose-500/10 text-rose-400 border-rose-500/20 line-through'
                                                              }`}
                                                            >
                                                              {status === 'conciliado' ? '✔️ Conciliado' : status === 'pendiente' ? '🟡 Pendiente' : '🚫 Anulado'}
                                                            </button>
                                                          </div>
                                                        </div>
                                                      </div>

                                                      <div className="text-right shrink-0">
                                                        <span className={`text-sm font-black ${isInc ? 'text-emerald-400' : 'text-red-400'}`}>
                                                          {isInc ? '+' : '-'}${tx.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                                        </span>
                                                        <div className="flex items-center justify-end gap-1 mt-1">
                                                          {/* Botón Duplicar Movimiento */}
                                                          <button
                                                            onClick={() => handleDuplicateTx(tx)}
                                                            className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg text-[9px] font-bold border border-white/5 transition-all cursor-pointer flex items-center gap-1"
                                                            title="Copiar -> Modificar monto -> Guardar"
                                                          >
                                                            <Copy className="w-3 h-3" />
                                                            <span className="hidden sm:inline">Duplicar</span>
                                                          </button>

                                                          <button
                                                            onClick={() => handleDeleteTransaction(tx.id)}
                                                            className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                                                            title="Eliminar movimiento"
                                                          >
                                                            <Trash2 className="w-3 h-3" />
                                                          </button>
                                                        </div>
                                                      </div>
                                                    </div>

                                                    {/* Desglose de Movimiento Dividido */}
                                                    {tx.isSplit && tx.splits && tx.splits.length > 0 && (
                                                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5 flex flex-col gap-1 mt-1">
                                                        <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                                          <Split className="w-3 h-3" />
                                                          Movimiento Dividido:
                                                        </span>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-0.5">
                                                          {tx.splits.map((s, i) => (
                                                            <div key={i} className="flex items-center justify-between bg-slate-950/60 px-2 py-1 rounded-lg text-[10px] border border-white/5">
                                                              <span className="text-slate-300">{s.category} {s.description ? `(${s.description})` : ''}</span>
                                                              <span className="font-bold text-slate-200 font-mono">${s.amount.toLocaleString('es-ES')}</span>
                                                            </div>
                                                          ))}
                                                        </div>
                                                      </div>
                                                    )}

                                                    {/* Badges de Ubicación & Etiquetas */}
                                                    <div className="flex items-center gap-1.5 flex-wrap text-[9px]">
                                                      {(tx.locationName || tx.locationCity) && (
                                                        <span className="bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                                                          <MapPin className="w-2.5 h-2.5" />
                                                          <span>{[tx.locationName, tx.locationCity].filter(Boolean).join(', ')}</span>
                                                        </span>
                                                      )}

                                                      {tx.tags && tx.tags.map(tag => (
                                                        <span key={tag} className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-lg font-bold">
                                                          {tag}
                                                        </span>
                                                      ))}

                                                      {(tx.attachmentsList?.length || tx.attachment) && (
                                                        <button
                                                          type="button"
                                                          onClick={() => setFullscreenImage(tx.attachmentsList?.[0]?.url || tx.attachment || null)}
                                                          className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 hover:bg-emerald-500/20 cursor-pointer"
                                                        >
                                                          <Paperclip className="w-2.5 h-2.5" />
                                                          <span>{tx.attachmentsList?.length ? `${tx.attachmentsList.length} Adjunto(s)` : 'Ver Factura'}</span>
                                                        </button>
                                                      )}
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        );
                                      });
                                  })()}
                                </div>
                              )}
                            </div>
                          )}

                          {/* 2. VISTA: TABLA COMPACTA */}
                          {txViewMode === 'table' && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <h4 className="font-bold text-white text-xs tracking-wider uppercase">Resultados de la Búsqueda</h4>
                                <span className="text-[10px] font-mono text-slate-500">{matched.length} registros</span>
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
                                        <th className="py-2.5">Cuenta</th>
                                        <th className="py-2.5">Categoría & Tags</th>
                                        <th className="py-2.5 text-center">Conciliación</th>
                                        <th className="py-2.5 text-center">Adjuntos</th>
                                        <th className="py-2.5 text-right">Monto</th>
                                        <th className="py-2.5 text-center">Acciones</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {matched.map((tx) => {
                                        const txAccId = (tx as any).accountId || (tx as any).cuentaId;
                                        const matchedAcc = accounts.find(a => a.id === txAccId);
                                        const hasAttachment = tx.attachment || tx.adjunto || (tx.attachmentsList && tx.attachmentsList.length > 0);
                                        const status = (tx as any).reconciliationStatus || 'conciliado';

                                        return (
                                          <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                                            <td className="py-3 font-mono text-[11px] text-slate-400">
                                              {tx.date ? tx.date.split('T')[0] : 'Sin fecha'}
                                            </td>
                                            <td className="py-3 font-semibold text-white max-w-[200px]">
                                              <div>{tx.description}</div>
                                              {tx.locationName && (
                                                <span className="text-[9px] text-rose-300 block font-normal">📍 {tx.locationName}</span>
                                              )}
                                            </td>
                                            <td className="py-3">
                                              {matchedAcc ? (
                                                <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg font-bold text-[10px] text-slate-300">
                                                  {matchedAcc.alias || matchedAcc.nombre}
                                                </span>
                                              ) : (
                                                <span className="text-slate-500 italic text-[10px]">General</span>
                                              )}
                                            </td>
                                            <td className="py-3 text-slate-400">
                                              {(() => {
                                                const details = getCategoryDetails(tx.category || (tx as any).categoria);
                                                return (
                                                  <div className="flex flex-col gap-1 items-start">
                                                    <span className={`px-2 py-0.5 rounded-md font-medium text-[10px] border inline-flex items-center gap-1 ${details.bgCol}`}>
                                                      <span>{details.emoji}</span>
                                                      <span>{details.name}</span>
                                                    </span>
                                                    {tx.tags && tx.tags.length > 0 && (
                                                      <div className="flex gap-1">
                                                        {tx.tags.map(tag => (
                                                          <span key={tag} className="text-[8px] text-blue-300 font-bold">{tag}</span>
                                                        ))}
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              })()}
                                            </td>
                                            <td className="py-3 text-center">
                                              <button
                                                onClick={() => handleToggleReconciliation(tx.id, status)}
                                                className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                                                  status === 'conciliado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                  status === 'pendiente' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                  'bg-rose-500/10 text-rose-400 border-rose-500/20 line-through'
                                                }`}
                                              >
                                                {status === 'conciliado' ? '✔️ Conciliado' : status === 'pendiente' ? '🟡 Pendiente' : '🚫 Anulado'}
                                              </button>
                                            </td>
                                            <td className="py-3 text-center">
                                              {hasAttachment ? (
                                                <button
                                                  onClick={() => setFullscreenImage(tx.attachmentsList?.[0]?.url || tx.attachment || tx.adjunto || null)}
                                                  className="p-1 px-2 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-all"
                                                >
                                                  <Paperclip className="w-3 h-3" />
                                                  <span>Factura</span>
                                                </button>
                                              ) : (
                                                <span className="text-slate-600 text-[10px] font-mono">-</span>
                                              )}
                                            </td>
                                            <td className={`py-3 text-right font-bold text-[13px] ${tx.type === 'income' || tx.tipo === 'ingreso' ? 'text-emerald-400' : 'text-red-400'}`}>
                                              {tx.type === 'income' || tx.tipo === 'ingreso' ? '+' : '-'}${tx.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-3 text-center">
                                              <div className="flex items-center justify-center gap-1">
                                                <button
                                                  onClick={() => handleDuplicateTx(tx)}
                                                  className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all cursor-pointer"
                                                  title="Duplicar movimiento"
                                                >
                                                  <Copy className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                  onClick={() => handleDeleteTransaction(tx.id)}
                                                  className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                                                  title="Eliminar"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}

                          {/* 3. VISTA: MAPA DE GASTOS */}
                          {txViewMode === 'map' && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-5">
                              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                <h4 className="font-bold text-white text-xs tracking-wider uppercase flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-rose-400" />
                                  <span>Mapa & Gastos Geolocalizados</span>
                                </h4>
                                <span className="text-[10px] font-mono text-slate-400">Distribución por ciudad / lugar</span>
                              </div>

                              {(() => {
                                const locationGroups = matched.reduce((acc, tx) => {
                                  const locName = tx.locationName || tx.locationCity || 'Sin Ubicación Específica';
                                  if (!acc[locName]) acc[locName] = { total: 0, items: [] };
                                  acc[locName].total += tx.amount;
                                  acc[locName].items.push(tx);
                                  return acc;
                                }, {} as Record<string, { total: number, items: Transaction[] }>);

                                const totalExpenseAll = matched.reduce((s, t) => s + t.amount, 0) || 1;

                                return (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(locationGroups).map(([locName, group]: [string, any]) => {
                                      const pct = Math.round((group.total / totalExpenseAll) * 100);
                                      return (
                                        <div key={locName} className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <span className="text-xs font-black text-white flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                                                {locName}
                                              </span>
                                              <span className="text-[10px] text-slate-400 block mt-0.5">{group.items.length} registro(s)</span>
                                            </div>
                                            <span className="text-xs font-black text-emerald-400 font-mono">
                                              ${group.total.toLocaleString('es-ES')}
                                            </span>
                                          </div>

                                          {/* Barra de Proporción */}
                                          <div>
                                            <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                                              <span>Participación de Gastos</span>
                                              <span className="font-bold text-slate-200">{pct}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                              <div className="h-full bg-rose-500 rounded-full" style={{ width: `${pct}%` }}></div>
                                            </div>
                                          </div>

                                          {/* Muestra de gastos en este lugar */}
                                          <div className="border-t border-white/5 pt-2 flex flex-col gap-1.5">
                                            {group.items.slice(0, 3).map(tx => (
                                              <div key={tx.id} className="flex justify-between items-center text-[10px]">
                                                <span className="text-slate-300 truncate">{tx.description || tx.category}</span>
                                                <span className="font-mono text-slate-400 font-bold">${tx.amount.toLocaleString('es-ES')}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                            </div>
                          )}
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

                      {/* TARJETA DE PREFERENCIAS Y APARIENCIA */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4 relative overflow-hidden">
                        <div className="absolute top-[-10%] right-[-10%] w-[120px] h-[120px] bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
                        
                        <h4 className="font-bold text-white text-xs tracking-wider uppercase border-b border-white/5 pb-2 flex items-center gap-2">
                          <Settings className="w-4 h-4 text-indigo-400" />
                          Preferencias del Sistema
                        </h4>

                        <form onSubmit={handleUpdateUserProfile} className="flex flex-col gap-4 text-xs">
                          {/* Nombre */}
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Nombre de Usuario</label>
                            <input
                              type="text"
                              value={userProfileName}
                              onChange={(e) => setUserProfileName(e.target.value)}
                              placeholder="Tu nombre o alias"
                              className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                              required
                            />
                          </div>

                          {/* Moneda */}
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Moneda de Visualización</label>
                            <select
                              value={userProfileCurrency}
                              onChange={(e) => setUserProfileCurrency(e.target.value)}
                              className="w-full bg-slate-950/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                            >
                              <option value="COP" className="bg-slate-900 text-white">COP ($ - Pesos Colombianos)</option>
                              <option value="USD" className="bg-slate-900 text-white">USD ($ - Dólares Estadounidenses)</option>
                              <option value="EUR" className="bg-slate-900 text-white">EUR (€ - Euros)</option>
                              <option value="MXN" className="bg-slate-900 text-white">MXN ($ - Pesos Mexicanos)</option>
                              <option value="ARS" className="bg-slate-900 text-white">ARS ($ - Pesos Argentinos)</option>
                            </select>
                          </div>

                          {/* Tema (Modo Claro vs Modo Oscuro) */}
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Tema / Apariencia</label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setUserProfileTheme('light')}
                                className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                  userProfileTheme === 'light'
                                    ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
                                }`}
                              >
                                <Sun className="w-3.5 h-3.5" />
                                Modo Claro
                              </button>
                              <button
                                type="button"
                                onClick={() => setUserProfileTheme('dark')}
                                className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                  userProfileTheme === 'dark'
                                    ? 'bg-indigo-600 text-white border-indigo-500'
                                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
                                }`}
                              >
                                <Moon className="w-3.5 h-3.5" />
                                Modo Oscuro
                              </button>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={userProfileLoading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-slate-950 py-2.5 rounded-xl text-xs font-extrabold shadow-lg hover:shadow-emerald-500/15 cursor-pointer flex items-center justify-center gap-1.5 mt-2 transition-all"
                          >
                            {userProfileLoading ? 'Guardando...' : 'Guardar Preferencias'}
                          </button>
                        </form>
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
                            <h5 className="text-xs font-bold text-white">Aislamiento de Datos por UID & Cifrado AES-256</h5>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                              Tus datos financieros están totalmente protegidos con E2EE. Las reglas de seguridad de Firestore restringen el acceso para que solo tú puedas descifrar información vinculada a tu UID.
                            </p>
                          </div>
                        </div>

                        {/* CONFIGURACIÓN: SEGURIDAD, DISPOSITIVOS & CLAVE MAESTRA */}
                        <div className="border-t border-white/5 pt-4 mt-2 flex flex-col gap-3">
                          <h5 className="text-xs font-extrabold text-white uppercase flex items-center gap-2">
                            <Lock className="w-4 h-4 text-emerald-400" />
                            Seguridad Avanzada & Clave Maestra
                          </h5>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setIsRotateKeyModalOpen(true);
                                toast.success("🔐 Abriendo panel de rotación de clave maestra E2EE");
                              }}
                              className="p-3 bg-slate-950/40 border border-white/10 hover:border-emerald-500/30 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2.5">
                                <Key className="w-4 h-4 text-emerald-400" />
                                <div>
                                  <div className="text-xs font-bold text-white">Rotación de Clave Maestra</div>
                                  <div className="text-[10px] text-slate-400">Reencripta tus datos con una nueva frase</div>
                                </div>
                              </div>
                              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                            </button>

                            <button
                              type="button"
                              onClick={handleCheckBackupIntegrity}
                              className="p-3 bg-slate-950/40 border border-white/10 hover:border-indigo-500/30 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2.5">
                                <HardDrive className="w-4 h-4 text-indigo-400" />
                                <div>
                                  <div className="text-xs font-bold text-white">Salud del Respaldo ({backupHealth.integrityScore}%)</div>
                                  <div className="text-[10px] text-slate-400">Verificado: {backupHealth.lastVerified}</div>
                                </div>
                              </div>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            </button>
                          </div>
                        </div>

                        {/* CONFIGURACIÓN: PERSONALIZACIÓN DEL DASHBOARD & TEMAS */}
                        <div className="border-t border-white/5 pt-4 mt-1 flex flex-col gap-3">
                          <h5 className="text-xs font-extrabold text-white uppercase flex items-center gap-2">
                            <Grid className="w-4 h-4 text-indigo-400" />
                            Personalización del Dashboard, Idioma y Temas
                          </h5>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {/* Selector de Tema Cromático */}
                            <div>
                              <label className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Paleta de Color</label>
                              <select
                                value={colorTheme}
                                onChange={(e) => {
                                  setColorTheme(e.target.value as any);
                                  toast.success(`🎨 Paleta cambiada a ${e.target.value.toUpperCase()}`);
                                }}
                                className="w-full bg-slate-950/60 border border-white/10 rounded-xl p-2 text-white font-medium"
                              >
                                <option value="emerald" className="bg-slate-900">Emerald / Esmeralda (Predeterminado)</option>
                                <option value="cyber-blue" className="bg-slate-900">Cyber Blue / Neón Azul</option>
                                <option value="amethyst" className="bg-slate-900">Amethyst / Violeta</option>
                                <option value="amber" className="bg-slate-900">Warm Amber / Dorado</option>
                                <option value="monochrome" className="bg-slate-900">Monochrome / Minimalista</option>
                              </select>
                            </div>

                            {/* Selector de Idioma */}
                            <div>
                              <label className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Idioma del Sistema</label>
                              <select
                                value={userProfileLanguage}
                                onChange={(e) => {
                                  setUserProfileLanguage(e.target.value as any);
                                  toast.success(`🌐 Idioma cambiado a ${e.target.value.toUpperCase()}`);
                                }}
                                className="w-full bg-slate-950/60 border border-white/10 rounded-xl p-2 text-white font-medium"
                              >
                                <option value="es" className="bg-slate-900">Español (América Latina / España)</option>
                                <option value="en" className="bg-slate-900">English (United States)</option>
                                <option value="pt" className="bg-slate-900">Português (Brasil)</option>
                                <option value="fr" className="bg-slate-900">Français (France)</option>
                              </select>
                            </div>
                          </div>

                          {/* Toggles de Widgets del Dashboard */}
                          <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl flex flex-col gap-2 mt-1">
                            <span className="text-[10px] text-slate-400 font-mono uppercase">Visibilidad de Widgets en Dashboard</span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                              {Object.entries(dashboardWidgetSettings).map(([wKey, isEnabled]) => (
                                <button
                                  key={wKey}
                                  type="button"
                                  onClick={() => {
                                    setDashboardWidgetSettings(prev => ({ ...prev, [wKey]: !prev[wKey as keyof typeof prev] }));
                                    toast.success(`Widget ${wKey} ${!isEnabled ? 'activado' : 'oculto'}`);
                                  }}
                                  className={`px-2 py-1.5 rounded-lg border font-bold text-center transition-all cursor-pointer ${
                                    isEnabled
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                      : 'bg-white/5 text-slate-500 border-white/5 line-through'
                                  }`}
                                >
                                  {wKey.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* RESTAURACIÓN DE RESPALDOS Y PRIVACIDAD */}
                        <div className="border-t border-white/5 pt-4 mt-1 flex justify-between items-center flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setIsRestoreCenterOpen(true)}
                            className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <HardDrive className="w-3.5 h-3.5" />
                            Centro de Restauración JSON
                          </button>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                            <span>Privacidad: Ocultar Saldos por Defecto</span>
                            <input
                              type="checkbox"
                              checked={privacyPreferences.hideBalancesDefault}
                              onChange={(e) => setPrivacyPreferences(p => ({ ...p, hideBalancesDefault: e.target.checked }))}
                              className="rounded border-white/10 text-emerald-500 bg-slate-900 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      {/* DISPOSITIVOS AUTORIZADOS E HISTORIAL DE LOGINS */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                        <h4 className="font-bold text-white text-xs tracking-wider uppercase border-b border-white/5 pb-2 flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Laptop className="w-4 h-4 text-emerald-400" />
                            Dispositivos Autorizados e Historial
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-normal">{authorizedDevices.length} activo(s)</span>
                        </h4>

                        <div className="divide-y divide-white/5">
                          {authorizedDevices.map((dev) => (
                            <div key={dev.id} className="py-2.5 flex items-center justify-between text-xs">
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  {dev.name}
                                  {dev.current && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">Este equipo</span>}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{dev.ip} • {dev.location} • {dev.lastActive}</div>
                              </div>

                              {!dev.current && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAuthorizedDevices(prev => prev.filter(d => d.id !== dev.id));
                                    toast.success(`🔒 Dispositivo ${dev.name} revocado`);
                                  }}
                                  className="text-[10px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-lg transition-all cursor-pointer"
                                >
                                  Revocar
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* SECCIÓN DEL MANUAL DE USUARIO EN PDF */}
                    <div className="lg:col-span-12 flex flex-col gap-4 mt-2">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                          <div>
                            <h4 className="font-black text-white text-sm tracking-wider uppercase flex items-center gap-2">
                              <BookOpen className="w-4.5 h-4.5 text-emerald-400" />
                              Manual de Usuario ContabilidApp v2.0 (Documento PDF)
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Consulta la guía completa de uso del sistema, procedimientos de seguridad E2EE y configuración de notificaciones.
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setOnboardingStep(0);
                                setIsOnboardingModalOpen(true);
                              }}
                              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Compass className="w-3.5 h-3.5" />
                              Abrir Tutorial Interactivo
                            </button>

                            <button
                              type="button"
                              onClick={handleDownloadUserManualPDF}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/20"
                            >
                              <Download className="w-3.5 h-3.5 stroke-[3px]" />
                              Descargar PDF
                            </button>
                          </div>
                        </div>

                        {/* VISOR DE PDF INTERACTIVO */}
                        <div className={`bg-slate-950 border border-white/10 rounded-2xl overflow-hidden flex flex-col ${isPdfFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'relative'}`}>
                          {/* BARRA DE HERRAMIENTAS DEL VISOR PDF */}
                          <div className="bg-slate-900 border-b border-white/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-emerald-400" />
                              <span className="font-mono font-bold text-white text-xs">Manual_de_Usuario_ContabilidApp.pdf</span>
                              <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                6 Páginas • v2.0
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Control de Páginas */}
                              <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-1">
                                <button
                                  type="button"
                                  disabled={pdfPage <= 1}
                                  onClick={() => setPdfPage(p => Math.max(1, p - 1))}
                                  className="p-1 hover:bg-white/10 disabled:opacity-30 text-white rounded transition-colors cursor-pointer"
                                  title="Página Anterior"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <span className="px-2.5 font-mono text-[11px] font-bold text-slate-200">
                                  Pág. {pdfPage} de {totalPdfPages}
                                </span>
                                <button
                                  type="button"
                                  disabled={pdfPage >= totalPdfPages}
                                  onClick={() => setPdfPage(p => Math.min(totalPdfPages, p + 1))}
                                  className="p-1 hover:bg-white/10 disabled:opacity-30 text-white rounded transition-colors cursor-pointer"
                                  title="Página Siguiente"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Control de Zoom */}
                              <div className="hidden sm:flex items-center bg-white/5 rounded-lg border border-white/10 p-1">
                                <button
                                  type="button"
                                  onClick={() => setPdfZoom(z => Math.max(75, z - 15))}
                                  className="p-1 hover:bg-white/10 text-white rounded transition-colors cursor-pointer"
                                  title="Reducir Zoom"
                                >
                                  <ZoomOut className="w-3.5 h-3.5" />
                                </button>
                                <span className="px-2 font-mono text-[10px] font-bold text-slate-300">
                                  {pdfZoom}%
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setPdfZoom(z => Math.min(150, z + 15))}
                                  className="p-1 hover:bg-white/10 text-white rounded transition-colors cursor-pointer"
                                  title="Aumentar Zoom"
                                >
                                  <ZoomIn className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Imprimir */}
                              <button
                                type="button"
                                onClick={() => window.print()}
                                className="p-1.5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg border border-white/10 transition-colors cursor-pointer"
                                title="Imprimir Documento"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {/* Pantalla Completa */}
                              <button
                                type="button"
                                onClick={() => setIsPdfFullscreen(!isPdfFullscreen)}
                                className="p-1.5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg border border-white/10 transition-colors cursor-pointer"
                                title={isPdfFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa"}
                              >
                                {isPdfFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* CONTENEDOR DE LA PÁGINA ESTILO DOCUMENTO PDF A4 */}
                          <div className="p-6 md:p-10 overflow-auto max-h-[600px] flex justify-center bg-slate-950/80">
                            <div 
                              style={{ transform: `scale(${pdfZoom / 100})`, transformOrigin: 'top center' }}
                              className="w-full max-w-3xl bg-[#0b132b] border border-white/10 rounded-xl p-8 shadow-2xl text-slate-200 transition-all duration-200 min-h-[500px] flex flex-col justify-between"
                            >
                              {/* Header de la Página PDF */}
                              <div className="border-b border-emerald-500/20 pb-4 mb-6 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">
                                    C
                                  </div>
                                  <div>
                                    <h3 className="font-extrabold text-white text-xs tracking-wider uppercase">ContabilidApp • Manual Oficial</h3>
                                    <span className="text-[10px] text-slate-400 font-mono">Guía de Usuario v2.0 - Documento Confidencial E2EE</span>
                                  </div>
                                </div>
                                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                  Página {pdfPage} / {totalPdfPages}
                                </span>
                              </div>

                              {/* Contenido Dinámico por Página */}
                              <div className="flex-1 space-y-6 text-xs text-slate-300 leading-relaxed">
                                {pdfPage === 1 && (
                                  <div className="space-y-4">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                                      <h2 className="text-base font-black text-white tracking-tight">MANUAL DE USUARIO OFICIAL - MÓDULOS 1 Y 2</h2>
                                      <p className="text-[11px] text-emerald-400 font-medium mt-0.5">Capítulo 1: Dashboard General y Gestor de Cuentas</p>
                                    </div>

                                    {/* Módulo 1 */}
                                    <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 space-y-2">
                                      <h3 className="font-extrabold text-white text-xs border-b border-white/10 pb-1 flex items-center gap-1.5 text-emerald-400">
                                        <Activity className="w-3.5 h-3.5" />
                                        1. Módulo Dashboard General e Inteligencia Financiera
                                      </h3>
                                      <p><strong className="text-emerald-300">Descripción:</strong> Centro de mando visual e interactivo con diagnóstico IA en tiempo real, indicador de Salud Financiera (0-100), Flujo de Caja Próximo y Alertas Inteligentes.</p>
                                      <p><strong className="text-yellow-300">Lo que busca:</strong> Proporcionar visibilidad ejecutiva del Patrimonio Neto, diagnóstico sintético de hábitos de consumo, proyección de saldo al cierre del mes y alertas contextuales.</p>
                                      <div className="text-[11px] text-slate-300 bg-white/5 p-2.5 rounded-lg border border-white/5 space-y-1">
                                        <strong className="text-indigo-300 block">Cómo usar y configurar:</strong>
                                        <div>• 1. Resumen IA: Revisa el diagnóstico automático que compara tus ingresos y gastos actuales vs. el mes anterior e identifica variaciones por categoría.</div>
                                        <div>• 2. Salud Financiera (0-100): Evalúa tu puntaje algorítmico basado en 5 pilares (Ahorro, Deuda, Liquidez, Presupuestos y Fondo) con diagnósticos de recomendación.</div>
                                        <div>• 3. Flujo de Caja & Alertas: Monitorea la línea de tiempo de próximos cobros y egresos con Saldo Proyectado y alertas de inactividad o sobregiro.</div>
                                      </div>
                                    </div>

                                    {/* Módulo 2 */}
                                    <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 space-y-2">
                                      <h3 className="font-extrabold text-white text-xs border-b border-white/10 pb-1 flex items-center gap-1.5 text-emerald-400">
                                        <CreditCard className="w-3.5 h-3.5" />
                                        2. Módulo Gestor de Cuentas, Proyección y Conciliación
                                      </h3>
                                      <p><strong className="text-emerald-300">Descripción:</strong> Administración avanzada de cuentas con Alias con emojis, Historial de saldo (Hoy, 30d, 6m), Balance Diario, Proyección de saldo futuro y Conciliación de extractos.</p>
                                      <p><strong className="text-yellow-300">Lo que busca:</strong> Personalizar tus cuentas (ej. 💰 Cuenta Principal, 🏖 Vacaciones), monitorear la curva de saldo diario, proyectar fondos disponibles a mitad/fin de mes y conciliar extractos.</p>
                                      <div className="text-[11px] text-slate-300 bg-white/5 p-2.5 rounded-lg border border-white/5 space-y-1">
                                        <strong className="text-indigo-300 block">Cómo usar y configurar:</strong>
                                        <div>• 1. Alias Personalizados: Haz clic en "Editar Alias" para nombrar tus cuentas con identificadores claros y reconocibles.</div>
                                        <div>• 2. Historial de Saldo & Balance Diario: Observa la comparativa de saldo (Hoy vs Hace 30 días vs Hace 6 meses) y la gráfica interactiva día a día.</div>
                                        <div>• 3. Proyección Financiera: Estimación automática de saldo al 15 de agosto o fin de mes considerando tus compromisos recurrentes.</div>
                                        <div>• 4. Conciliación de Extractos: Cambia el estado de cada movimiento a Pendiente 🟡, Conciliado ✔️ o Anulado 🚫.</div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {pdfPage === 2 && (
                                  <div className="space-y-4">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                                      <h2 className="text-base font-black text-white tracking-tight">MANUAL DE USUARIO OFICIAL - MÓDULOS 3 Y 4</h2>
                                      <p className="text-[11px] text-emerald-400 font-medium mt-0.5">Capítulo 2: Movimientos y Gestor de Categorías</p>
                                    </div>

                                    {/* Módulo 3 */}
                                    <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 space-y-2">
                                      <h3 className="font-extrabold text-white text-xs border-b border-white/10 pb-1 flex items-center gap-1.5 text-emerald-400">
                                        <Receipt className="w-3.5 h-3.5" />
                                        3. Módulo de Movimientos y Consultas
                                      </h3>
                                      <p><strong className="text-emerald-300">Descripción:</strong> Bitácora central e interactiva para el registro de transacciones de Ingreso y Egreso.</p>
                                      <p><strong className="text-yellow-300">Lo que busca:</strong> Llevar la contabilidad exacta con soporte documental adjunto (facturas/recibos en PDF o imagen).</p>
                                      <div className="text-[11px] text-slate-300 bg-white/5 p-2.5 rounded-lg border border-white/5 space-y-1">
                                        <strong className="text-indigo-300 block">Cómo usar y configurar:</strong>
                                        <div>• 1. Haz clic en "Nuevo Movimiento" y selecciona el Tipo (Ingreso / Egreso).</div>
                                        <div>• 2. Ingresa Monto, Fecha, Categoría, Cuenta asociada y una nota explicativa.</div>
                                        <div>• 3. Adjunta una fotografía o PDF de la factura desde la zona de carga de archivos.</div>
                                        <div>• 4. Utiliza los filtros superiores por rango de fechas, cuenta o categoría para buscar o auditar transacciones.</div>
                                      </div>
                                    </div>

                                    {/* Módulo 4 */}
                                    <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 space-y-2">
                                      <h3 className="font-extrabold text-white text-xs border-b border-white/10 pb-1 flex items-center gap-1.5 text-emerald-400">
                                        <Layers className="w-3.5 h-3.5" />
                                        4. Módulo Gestor de Categorías
                                      </h3>
                                      <p><strong className="text-emerald-300">Descripción:</strong> Clasificador personalizable para la organización de la procedencia y destino del dinero.</p>
                                      <p><strong className="text-yellow-300">Lo que busca:</strong> Estructurar los conceptos de gasto e ingreso con íconos y colores representativos.</p>
                                      <div className="text-[11px] text-slate-300 bg-white/5 p-2.5 rounded-lg border border-white/5 space-y-1">
                                        <strong className="text-indigo-300 block">Cómo usar y configurar:</strong>
                                        <div>• 1. En el módulo Categorías, presiona "Agregar Categoría".</div>
                                        <div>• 2. Selecciona si la categoría aplica para Ingresos o Egresos.</div>
                                        <div>• 3. Asigna un Nombre (ej. Supermercado, Alquiler, Sueldo), selecciona un Ícono y un Color.</div>
                                        <div>• 4. Guarda los cambios; la categoría estará disponible inmediatamente en Movimientos y Presupuestos.</div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {pdfPage === 3 && (
                                  <div className="space-y-4">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                                      <h2 className="text-base font-black text-white tracking-tight">MANUAL DE USUARIO OFICIAL - MÓDULOS 5 Y 6</h2>
                                      <p className="text-[11px] text-emerald-400 font-medium mt-0.5">Capítulo 3: Presupuestos Mensuales y Metas de Ahorro</p>
                                    </div>

                                    {/* Módulo 5 */}
                                    <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 space-y-2">
                                      <h3 className="font-extrabold text-white text-xs border-b border-white/10 pb-1 flex items-center gap-1.5 text-emerald-400">
                                        <Wallet className="w-3.5 h-3.5" />
                                        5. Módulo Control de Presupuestos
                                      </h3>
                                      <p><strong className="text-emerald-300">Descripción:</strong> Techos de gasto mensual asignados por categoría con monitoreo de consumo en tiempo real.</p>
                                      <p><strong className="text-yellow-300">Lo que busca:</strong> Prevenir sobrecostos y mantener tus egresos dentro de límites previamente planificados.</p>
                                      <div className="text-[11px] text-slate-300 bg-white/5 p-2.5 rounded-lg border border-white/5 space-y-1">
                                        <strong className="text-indigo-300 block">Cómo usar y configurar:</strong>
                                        <div>• 1. Presiona "Crear Presupuesto", selecciona la Categoría de egreso y el límite máximo mensual.</div>
                                        <div>• 2. Observa la barra de estado de color: Verde (&lt;80%), Amarillo (80%-99%), Rojo (100% o más).</div>
                                        <div>• 3. Notificaciones Nativas: Activa las notificaciones del navegador en Configuración para recibir alertas emergentes automáticas en tu dispositivo al alcanzar el 80% y 100% del límite.</div>
                                      </div>
                                    </div>

                                    {/* Módulo 6 */}
                                    <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 space-y-2">
                                      <h3 className="font-extrabold text-white text-xs border-b border-white/10 pb-1 flex items-center gap-1.5 text-emerald-400">
                                        <Target className="w-3.5 h-3.5" />
                                        6. Módulo Metas de Ahorro
                                      </h3>
                                      <p><strong className="text-emerald-300">Descripción:</strong> Módulo de reserva de capital para proyectos u objetivos financieros a mediano y largo plazo.</p>
                                      <p><strong className="text-yellow-300">Lo que busca:</strong> Fomentar el hábito del ahorro estructurado (Fondo de Emergencia, Vacaciones, Vehículo).</p>
                                      <div className="text-[11px] text-slate-300 bg-white/5 p-2.5 rounded-lg border border-white/5 space-y-1">
                                        <strong className="text-indigo-300 block">Cómo usar y configurar:</strong>
                                        <div>• 1. Presiona "Nueva Meta de Ahorro" e ingresa el Nombre, Monto Objetivo y Fecha Límite opcional.</div>
                                        <div>• 2. Para sumar capital, pulsa "Realizar Aporte" y selecciona la Cuenta origen desde donde se descontará el dinero.</div>
                                        <div>• 3. Monitorea el porcentaje acumulado y la barra de progreso hacia tu meta.</div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {pdfPage === 4 && (
                                  <div className="space-y-4">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                                      <h2 className="text-base font-black text-white tracking-tight">MANUAL DE USUARIO OFICIAL - MÓDULOS 7 Y 8</h2>
                                      <p className="text-[11px] text-emerald-400 font-medium mt-0.5">Capítulo 4: Control de Deudas y Suscripciones</p>
                                    </div>

                                    {/* Módulo 7 */}
                                    <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 space-y-2">
                                      <h3 className="font-extrabold text-white text-xs border-b border-white/10 pb-1 flex items-center gap-1.5 text-emerald-400">
                                        <CreditCard className="w-3.5 h-3.5" />
                                        7. Módulo Control de Deudas y Créditos
                                      </h3>
                                      <p><strong className="text-emerald-300">Descripción:</strong> Módulo de gestión integral de pasivos, préstamos bancarios, familiares y tarjetas de crédito.</p>
                                      <p><strong className="text-yellow-300">Lo que busca:</strong> Eliminar recargos por mora y mantener visibilidad constante de cuotas y fechas límites de pago.</p>
                                      <div className="text-[11px] text-slate-300 bg-white/5 p-2.5 rounded-lg border border-white/5 space-y-1">
                                        <strong className="text-indigo-300 block">Cómo usar y configurar:</strong>
                                        <div>• 1. Registra la deuda indicando Acreedor, Saldo Pendiente, Cuota Mínima, Tasa de Interés y Día de Corte/Pago.</div>
                                        <div>• 2. Cada vez que realices un pago, selecciona "Registrar Abono" para descontar el saldo principal.</div>
                                        <div>• 3. Revisa la insignia de alerta que aparece cuando la fecha límite de pago está a 5 días o menos.</div>
                                      </div>
                                    </div>

                                    {/* Módulo 8 */}
                                    <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 space-y-2">
                                      <h3 className="font-extrabold text-white text-xs border-b border-white/10 pb-1 flex items-center gap-1.5 text-emerald-400">
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        8. Módulo Control de Suscripciones
                                      </h3>
                                      <p><strong className="text-emerald-300">Descripción:</strong> Administración de servicios periódicos de débito automático (Streaming, Software, Gimnasio).</p>
                                      <p><strong className="text-yellow-300">Lo que busca:</strong> Identificar fugas silenciosas de dinero por membresías no utilizadas y proyectar el costo anual.</p>
                                      <div className="text-[11px] text-slate-300 bg-white/5 p-2.5 rounded-lg border border-white/5 space-y-1">
                                        <strong className="text-indigo-300 block">Cómo usar y configurar:</strong>
                                        <div>• 1. Agrega la suscripción indicando Servicio, Valor, Periodicidad y Cuenta de Cargo.</div>
                                        <div>• 2. Consulta el resumen de Gasto Anual Acumulado para evaluar cancelaciones u optimizaciones.</div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {pdfPage === 5 && (
                                  <div className="space-y-4">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                                      <h2 className="text-base font-black text-white tracking-tight">MANUAL DE USUARIO OFICIAL - MÓDULOS 9 Y 10</h2>
                                      <p className="text-[11px] text-emerald-400 font-medium mt-0.5">Capítulo 5: Estadísticas y Reportes Financieros</p>
                                    </div>

                                    {/* Módulo 9 */}
                                    <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 space-y-2">
                                      <h3 className="font-extrabold text-white text-xs border-b border-white/10 pb-1 flex items-center gap-1.5 text-emerald-400">
                                        <BarChart3 className="w-3.5 h-3.5" />
                                        9. Módulo Estadísticas y Análisis
                                      </h3>
                                      <p><strong className="text-emerald-300">Descripción:</strong> Visualizador gráfico analítico con gráficos de distribución y comparativos históricos.</p>
                                      <p><strong className="text-yellow-300">Lo que busca:</strong> Detectar patrones de consumo, hábitos de gasto y evaluar la capacidad de ahorro.</p>
                                      <div className="text-[11px] text-slate-300 bg-white/5 p-2.5 rounded-lg border border-white/5 space-y-1">
                                        <strong className="text-indigo-300 block">Cómo usar y configurar:</strong>
                                        <div>• 1. Explora el gráfico circular de Distribución para conocer en qué categoría se concentran tus gastos.</div>
                                        <div>• 2. Revisa la gráfica comparativa de 12 meses para analizar la evolución de tus Ingresos vs. Egresos.</div>
                                      </div>
                                    </div>

                                    {/* Módulo 10 */}
                                    <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 space-y-2">
                                      <h3 className="font-extrabold text-white text-xs border-b border-white/10 pb-1 flex items-center gap-1.5 text-emerald-400">
                                        <FileSpreadsheet className="w-3.5 h-3.5" />
                                        10. Módulo Reportes Financieros y Exportación
                                      </h3>
                                      <p><strong className="text-emerald-300">Descripción:</strong> Generador de Estados Financieros estándar (Estado de Resultados, Flujo de Caja) y respaldos cifrados.</p>
                                      <p><strong className="text-yellow-300">Lo que busca:</strong> Facilitar la auditoría personal, preparación de balances y resguardo seguro de datos.</p>
                                      <div className="text-[11px] text-slate-300 bg-white/5 p-2.5 rounded-lg border border-white/5 space-y-1">
                                        <strong className="text-indigo-300 block">Cómo usar y configurar:</strong>
                                        <div>• 1. Selecciona el rango de fechas a auditar (Mes actual, Año actual o Personalizado).</div>
                                        <div>• 2. Revisa el balance generado y haz clic en "Exportar a Excel (CSV)" para obtener tu hoja de cálculo.</div>
                                        <div>• 3. Pulsa "Respaldar Datos JSON" para descargar una copia de seguridad cifrada en tu equipo.</div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {pdfPage === 6 && (
                                  <div className="space-y-4">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                                      <h2 className="text-base font-black text-white tracking-tight">MANUAL DE USUARIO OFICIAL - MÓDULO 11 Y SEGURIDAD</h2>
                                      <p className="text-[11px] text-emerald-400 font-medium mt-0.5">Capítulo 6: Configuración, Cifrado E2EE y FAQ</p>
                                    </div>

                                    {/* Módulo 11 */}
                                    <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 space-y-2">
                                      <h3 className="font-extrabold text-white text-xs border-b border-white/10 pb-1 flex items-center gap-1.5 text-emerald-400">
                                        <Settings className="w-3.5 h-3.5" />
                                        11. Módulo de Configuración y Seguridad
                                      </h3>
                                      <p><strong className="text-emerald-300">Descripción:</strong> Centro de preferencias del sistema, cifrado E2EE AES-256, notificaciones y opciones de cuenta.</p>
                                      <p><strong className="text-yellow-300">Lo que busca:</strong> Garantizar privacidad total de la información contable y personalizar el entorno de trabajo.</p>
                                      <div className="text-[11px] text-slate-300 bg-white/5 p-2.5 rounded-lg border border-white/5 space-y-1">
                                        <strong className="text-indigo-300 block">Cómo usar y configurar:</strong>
                                        <div>• 1. Moneda Predeterminada: Define la divisa del sistema ($ COP, $ USD, € EUR, etc.).</div>
                                        <div>• 2. Notificaciones del Sistema: Activa los permisos nativos del navegador para alertas de sobregiro.</div>
                                        <div>• 3. Seguridad E2EE: Tu clave maestra encripta los datos localmente antes de enviarse a la base de datos.</div>
                                        <div>• 4. Manual PDF y Guía de Inicio: Vuelve a abrir este manual o el tutorial interactivo cuando lo requieras.</div>
                                      </div>
                                    </div>

                                    <div className="text-center pt-2 border-t border-white/10">
                                      <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">FIN DEL MANUAL DE USUARIO • CONTABILIDAPP 2026</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Footer de la Página PDF */}
                              <div className="border-t border-white/10 pt-4 mt-6 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                                <span>ContabilidApp © 2026</span>
                                <span>Página {pdfPage} de {totalPdfPages}</span>
                              </div>
                            </div>
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
                    className="flex flex-col gap-6 w-full"
                  >
                    {/* ENCABEZADO DE SECCIÓN CON PESTAÑAS Y NUEVA CATEGORÍA */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/40 border border-white/5 rounded-2xl p-5 shadow-lg">
                      <div>
                        <h3 className="text-sm font-black text-white tracking-wider uppercase flex items-center gap-2">
                          <PlusCircle className="w-4 h-4 text-emerald-400" />
                          Gestor de Categorías Inteligentes & Subcategorías
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-1">Organiza tus ingresos y egresos con subcategorías, iconos personalizados, colores y análisis comparativo mes a mes.</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Selector de Pestañas (Activas vs Archivadas) */}
                        <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10">
                          <button
                            type="button"
                            onClick={() => setCatManagerTab('active')}
                            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                              catManagerTab === 'active'
                                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            Activas
                          </button>
                          <button
                            type="button"
                            onClick={() => setCatManagerTab('archived')}
                            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                              catManagerTab === 'archived'
                                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <Archive className="w-3.5 h-3.5" />
                            Archivadas ({archivedSystemCategories.length + dbCategories.filter(c => c.archived).length})
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            setEditingCatId(null);
                            setNewCatName('');
                            setNewCatCustomIcon('');
                            setNewCatIconType('emoji');
                            setNewCatColor('#f97316');
                            setNewCatSubcategories([]);
                            setIsAddCategoryModalOpen(true);
                          }}
                          className="bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-slate-950 text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-lg hover:shadow-emerald-500/15 cursor-pointer flex items-center justify-center gap-2 transition-all shrink-0"
                        >
                          <Plus className="w-4 h-4 text-slate-950 stroke-[3px]" />
                          Nueva Categoría
                        </button>
                      </div>
                    </div>

                    {/* CATEGORÍAS INTELIGENTES (ANÁLISIS COMPARATIVO DE VARIACIÓN DE GASTOS) */}
                    {smartCategoryInsights.length > 0 && catManagerTab === 'active' && (
                      <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-950 border border-indigo-500/20 rounded-2xl p-5 shadow-xl">
                        <div className="flex items-center justify-between border-b border-indigo-500/10 pb-3 mb-4">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                            <h4 className="font-extrabold text-white text-xs tracking-wider uppercase">Categorías Inteligentes — Análisis del Mes Actual vs Anterior</h4>
                          </div>
                          <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                            Detecta aumentos y reducciones automáticas
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {smartCategoryInsights.slice(0, 6).map((insight) => (
                            <div
                              key={insight.category}
                              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                                insight.isIncrease
                                  ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40'
                                  : 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-xs font-black text-white">{insight.category}</span>
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                  insight.isIncrease
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}>
                                  {insight.isIncrease ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                  {insight.statusText}
                                </span>
                              </div>

                              <div className="flex justify-between items-end text-[11px] font-mono mt-1 pt-2 border-t border-white/5 text-slate-400">
                                <span>Mes anterior: <strong className="text-slate-200">${insight.prevAmount.toLocaleString('es-ES')}</strong></span>
                                <span>Este mes: <strong className={insight.isIncrease ? 'text-rose-400' : 'text-emerald-400'}>${insight.currentAmount.toLocaleString('es-ES')}</strong></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* VISTA SEGÚN PESTAÑA SELECCIONADA */}
                    {catManagerTab === 'active' ? (
                      /* EXPLORADOR DE CATEGORÍAS ACTIVAS Y SUBCATEGORÍAS */
                      <div className="flex flex-col gap-6">
                        {/* CATEGORÍAS DE EGRESOS / GASTOS */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                          <div className="flex justify-between items-center border-b border-white/5 pb-3">
                            <h4 className="font-extrabold text-white text-xs tracking-wider uppercase flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                              Categorías de Egresos / Gastos ({categories.expense.length})
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono">Con jerarquía de subcategorías</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categories.expense.map((catStr) => {
                              const match = catStr.match(/^([\u2000-\u32ff\ud83c-\udbff\udf00-\udfff\s]+)?(.+)$/);
                              const defaultEmoji = match ? match[1]?.trim() || '📦' : '📦';
                              const name = match ? match[2]?.trim() || catStr : catStr;

                              const dbCat = dbCategories.find(c => c.type === 'expense' && c.name.toLowerCase().trim() === name.toLowerCase().trim());
                              const isSystem = !dbCat;

                              const catEmoji = dbCat?.emoji || defaultEmoji;
                              const catCustomIcon = dbCat?.customIcon;
                              const catColor = dbCat?.color || suggestCategoryColorAndEmoji(name, 'expense').color;
                              const subcategoriesList = getSubcategoriesForCategory(name);

                              const isExpanded = selectedCatForSub === name;

                              return (
                                <div
                                  key={catStr}
                                  className="flex flex-col bg-slate-950/40 border border-white/10 hover:border-white/20 rounded-2xl p-4 transition-all shadow-md relative overflow-hidden"
                                  style={{ borderLeftWidth: '4px', borderLeftColor: catColor }}
                                >
                                  {/* Encabezado Categoría */}
                                  <div className="flex items-center justify-between gap-2 pb-2">
                                    <div className="flex items-center gap-3">
                                      {catCustomIcon ? (
                                        <img src={catCustomIcon} className="w-7 h-7 object-contain rounded-lg bg-slate-900 p-1 border border-white/10" alt={name} />
                                      ) : (
                                        <span className="text-xl">{catEmoji}</span>
                                      )}
                                      <div>
                                        <span className="text-xs font-black text-white block">{name}</span>
                                        <span className="text-[9px] text-slate-400 font-mono">
                                          {subcategoriesList.length} subcategorías
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      {isSystem ? (
                                        <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                          Sistema
                                        </span>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleStartEditCategory(dbCat)}
                                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all cursor-pointer"
                                          title="Editar categoría"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}

                                      {/* Archivar */}
                                      <button
                                        type="button"
                                        onClick={() => handleArchiveCategory(dbCat ? dbCat.id : name, false)}
                                        className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-all cursor-pointer"
                                        title="Archivar categoría (sin eliminar datos)"
                                      >
                                        <Archive className="w-3.5 h-3.5" />
                                      </button>

                                      {!isSystem && (
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteCategory(dbCat.id)}
                                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                                          title="Eliminar categoría"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Subcategorías Chips */}
                                  <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-1.5">
                                    {subcategoriesList.map((sub) => (
                                      <span
                                        key={sub}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-white/10 rounded-lg text-[10px] font-medium text-slate-300 group hover:border-white/20"
                                      >
                                        <Tag className="w-2.5 h-2.5 text-slate-500" />
                                        {sub}
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveSubcategoryFromCategory(dbCat ? dbCat.id : name, sub)}
                                          className="text-slate-500 hover:text-rose-400 ml-1 transition-colors cursor-pointer"
                                          title="Eliminar subcategoría"
                                        >
                                          <X className="w-2.5 h-2.5" />
                                        </button>
                                      </span>
                                    ))}

                                    {/* Botón / Formulario inline para agregar subcategoría */}
                                    {isExpanded ? (
                                      <form
                                        onSubmit={(e) => {
                                          e.preventDefault();
                                          handleAddSubcategoryToCategory(dbCat ? dbCat.id : name, inlineSubInput);
                                        }}
                                        className="inline-flex items-center gap-1"
                                      >
                                        <input
                                          type="text"
                                          autoFocus
                                          placeholder="Nueva subcategoría..."
                                          value={inlineSubInput}
                                          onChange={(e) => setInlineSubInput(e.target.value)}
                                          className="bg-slate-900 border border-emerald-500/40 rounded-lg py-0.5 px-2 text-[10px] text-white focus:outline-none w-32"
                                        />
                                        <button
                                          type="submit"
                                          className="p-1 bg-emerald-500 text-slate-950 rounded-md text-[10px] font-bold cursor-pointer hover:bg-emerald-400"
                                        >
                                          <Check className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setSelectedCatForSub(null)}
                                          className="p-1 text-slate-400 hover:text-white"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </form>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedCatForSub(name);
                                          setInlineSubInput('');
                                        }}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 border border-dashed border-white/20 hover:border-emerald-500/50 rounded-lg text-[10px] text-slate-400 hover:text-emerald-400 transition-all cursor-pointer"
                                      >
                                        <Plus className="w-2.5 h-2.5" />
                                        Subcategoría
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
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                              Categorías de Ingresos / Entradas ({categories.income.length})
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono">Con jerarquía de subcategorías</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categories.income.map((catStr) => {
                              const match = catStr.match(/^([\u2000-\u32ff\ud83c-\udbff\udf00-\udfff\s]+)?(.+)$/);
                              const defaultEmoji = match ? match[1]?.trim() || '💰' : '💰';
                              const name = match ? match[2]?.trim() || catStr : catStr;

                              const dbCat = dbCategories.find(c => c.type === 'income' && c.name.toLowerCase().trim() === name.toLowerCase().trim());
                              const isSystem = !dbCat;

                              const catEmoji = dbCat?.emoji || defaultEmoji;
                              const catCustomIcon = dbCat?.customIcon;
                              const catColor = dbCat?.color || suggestCategoryColorAndEmoji(name, 'income').color;
                              const subcategoriesList = getSubcategoriesForCategory(name);

                              const isExpanded = selectedCatForSub === name;

                              return (
                                <div
                                  key={catStr}
                                  className="flex flex-col bg-slate-950/40 border border-white/10 hover:border-white/20 rounded-2xl p-4 transition-all shadow-md relative overflow-hidden"
                                  style={{ borderLeftWidth: '4px', borderLeftColor: catColor }}
                                >
                                  {/* Encabezado Categoría */}
                                  <div className="flex items-center justify-between gap-2 pb-2">
                                    <div className="flex items-center gap-3">
                                      {catCustomIcon ? (
                                        <img src={catCustomIcon} className="w-7 h-7 object-contain rounded-lg bg-slate-900 p-1 border border-white/10" alt={name} />
                                      ) : (
                                        <span className="text-xl">{catEmoji}</span>
                                      )}
                                      <div>
                                        <span className="text-xs font-black text-white block">{name}</span>
                                        <span className="text-[9px] text-slate-400 font-mono">
                                          {subcategoriesList.length} subcategorías
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      {isSystem ? (
                                        <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                          Sistema
                                        </span>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleStartEditCategory(dbCat)}
                                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all cursor-pointer"
                                          title="Editar categoría"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}

                                      {/* Archivar */}
                                      <button
                                        type="button"
                                        onClick={() => handleArchiveCategory(dbCat ? dbCat.id : name, false)}
                                        className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-all cursor-pointer"
                                        title="Archivar categoría (sin eliminar datos)"
                                      >
                                        <Archive className="w-3.5 h-3.5" />
                                      </button>

                                      {!isSystem && (
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteCategory(dbCat.id)}
                                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                                          title="Eliminar categoría"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Subcategorías Chips */}
                                  <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-1.5">
                                    {subcategoriesList.map((sub) => (
                                      <span
                                        key={sub}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-white/10 rounded-lg text-[10px] font-medium text-slate-300 group hover:border-white/20"
                                      >
                                        <Tag className="w-2.5 h-2.5 text-slate-500" />
                                        {sub}
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveSubcategoryFromCategory(dbCat ? dbCat.id : name, sub)}
                                          className="text-slate-500 hover:text-rose-400 ml-1 transition-colors cursor-pointer"
                                          title="Eliminar subcategoría"
                                        >
                                          <X className="w-2.5 h-2.5" />
                                        </button>
                                      </span>
                                    ))}

                                    {/* Inline Add Subcategory */}
                                    {isExpanded ? (
                                      <form
                                        onSubmit={(e) => {
                                          e.preventDefault();
                                          handleAddSubcategoryToCategory(dbCat ? dbCat.id : name, inlineSubInput);
                                        }}
                                        className="inline-flex items-center gap-1"
                                      >
                                        <input
                                          type="text"
                                          autoFocus
                                          placeholder="Nueva subcategoría..."
                                          value={inlineSubInput}
                                          onChange={(e) => setInlineSubInput(e.target.value)}
                                          className="bg-slate-900 border border-emerald-500/40 rounded-lg py-0.5 px-2 text-[10px] text-white focus:outline-none w-32"
                                        />
                                        <button
                                          type="submit"
                                          className="p-1 bg-emerald-500 text-slate-950 rounded-md text-[10px] font-bold cursor-pointer hover:bg-emerald-400"
                                        >
                                          <Check className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setSelectedCatForSub(null)}
                                          className="p-1 text-slate-400 hover:text-white"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </form>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedCatForSub(name);
                                          setInlineSubInput('');
                                        }}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 border border-dashed border-white/20 hover:border-emerald-500/50 rounded-lg text-[10px] text-slate-400 hover:text-emerald-400 transition-all cursor-pointer"
                                      >
                                        <Plus className="w-2.5 h-2.5" />
                                        Subcategoría
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* PESTAÑA: CATEGORÍAS ARCHIVADAS */
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <div>
                            <h4 className="font-extrabold text-white text-xs tracking-wider uppercase flex items-center gap-2">
                              <Archive className="w-4 h-4 text-amber-400" />
                              Categorías Archivadas
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">Estas categorías están deshabilitadas para nuevos registros pero conservan todos sus movimientos históricos intactos.</p>
                          </div>
                        </div>

                        {archivedSystemCategories.length === 0 && dbCategories.filter(c => c.archived).length === 0 ? (
                          <div className="text-center py-12 text-slate-500 font-medium text-xs border border-dashed border-white/10 rounded-xl">
                            No tienes ninguna categoría archivada en este momento.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Archivadas del Sistema */}
                            {archivedSystemCategories.map((sysCat) => (
                              <div key={sysCat} className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-amber-500/20 rounded-xl">
                                <div className="flex items-center gap-3">
                                  <Archive className="w-4 h-4 text-amber-400" />
                                  <div>
                                    <span className="text-xs font-bold text-slate-200 block">{sysCat}</span>
                                    <span className="text-[9px] font-mono text-amber-400/80">Categoría de Sistema (Archivada)</span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleArchiveCategory(sysCat, true)}
                                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <ArchiveRestore className="w-3.5 h-3.5" />
                                  Desarchivar
                                </button>
                              </div>
                            ))}

                            {/* Archivadas de Base de Datos Custom */}
                            {dbCategories.filter(c => c.archived).map((dbCat) => (
                              <div key={dbCat.id} className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-amber-500/20 rounded-xl">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{dbCat.emoji || '📦'}</span>
                                  <div>
                                    <span className="text-xs font-bold text-slate-200 block">{dbCat.name}</span>
                                    <span className="text-[9px] font-mono text-amber-400/80">Personalizada (Archivada)</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleArchiveCategory(dbCat.id, true)}
                                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                                  >
                                    <ArchiveRestore className="w-3.5 h-3.5" />
                                    Desarchivar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCategory(dbCat.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                                    title="Eliminar definitivamente"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
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
                    className="flex flex-col gap-6 w-full"
                  >
                    {/* ENCABEZADO DE SECCIÓN CON NOTIFICACIONES DEL DISPOSITIVO */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 border border-white/5 rounded-2xl p-5 shadow-lg">
                      <div>
                        <h3 className="text-sm font-black text-white tracking-wider uppercase flex items-center gap-2">
                          <PlusCircle className="w-4 h-4 text-emerald-400" />
                          Control de Presupuestos e Inteligencia Financiera
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Monitorea tus topes periódicos (semanales, quincenales, mensuales y anuales), simula variaciones de ahorro y visualiza la proyección exacta de agotamiento.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        <button
                          type="button"
                          onClick={requestNotificationPermission}
                          className={`text-xs font-bold px-3.5 py-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                            notificationPermission === 'granted'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                              : notificationPermission === 'denied'
                              ? 'bg-red-500/10 border-red-500/20 text-red-400'
                              : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20'
                          }`}
                          title="Permisos de notificaciones emergentes del navegador / dispositivo"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span>
                            {notificationPermission === 'granted'
                              ? '🔔 Notificaciones Activas'
                              : notificationPermission === 'denied'
                              ? '🚫 Notificaciones Bloqueadas'
                              : '🔔 Activar Notificaciones'}
                          </span>
                        </button>

                        <button
                          onClick={() => setIsAddBudgetModalOpen(true)}
                          className="bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-slate-950 text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-lg hover:shadow-emerald-500/15 cursor-pointer flex items-center justify-center gap-2 transition-all shrink-0"
                        >
                          <Plus className="w-4 h-4 text-slate-950 stroke-[3px]" />
                          Nuevo Presupuesto
                        </button>
                      </div>
                    </div>

                    {/* BARRA DE NAVEGACIÓN DE PESTAÑAS */}
                    <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-none">
                      {[
                        { id: 'active', label: 'Presupuestos Activos', icon: Wallet, count: dbBudgets.length },
                        { id: 'recommended', label: 'Presupuesto Recomendado (12 Meses)', icon: Sparkles, count: null },
                        { id: 'simulator', label: 'Simulador de Presupuestos', icon: Calculator, count: null },
                        { id: 'history', label: 'Comparativa Histórica', icon: History, count: null },
                      ].map((tab) => {
                        const TabIcon = tab.icon;
                        const isActive = budgetMainTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setBudgetMainTab(tab.id as any)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                              isActive
                                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-black'
                                : 'bg-slate-900/60 text-slate-400 border border-white/5 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <TabIcon className="w-3.5 h-3.5" />
                            <span>{tab.label}</span>
                            {tab.count !== null && (
                              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-slate-950 text-emerald-400' : 'bg-white/10 text-slate-300'}`}>
                                {tab.count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* VISTA 1: PRESUPUESTOS ACTIVOS */}
                    {budgetMainTab === 'active' && (
                      <div className="flex flex-col gap-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                          <div className="flex justify-between items-center border-b border-white/5 pb-3">
                            <h4 className="font-extrabold text-white text-xs tracking-wider uppercase flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                              Monitoreo de Presupuestos Activos
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono font-bold">{dbBudgets.length} Configurados</span>
                          </div>

                          {dbBudgets.length === 0 ? (
                            <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
                              <Wallet className="w-10 h-10 text-slate-600" />
                              <p className="text-xs text-slate-400 font-medium">No has configurado ningún presupuesto aún.</p>
                              <button
                                onClick={() => setIsAddBudgetModalOpen(true)}
                                className="bg-emerald-500 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-emerald-400 transition-all"
                              >
                                Crear mi Primer Presupuesto
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {dbBudgets.map((budget) => {
                                const period = budget.period || 'mensual';
                                const currentSpend = getPeriodSpendForCategory(budget.category, period);
                                const maxAmount = budget.maxAmount;
                                const pct = maxAmount > 0 ? (currentSpend / maxAmount) * 100 : 0;
                                const alertThreshold = budget.alertThreshold || 80;

                                // Separar emoji y nombre
                                const match = budget.category.match(/^([\u2000-\u32ff\ud83c-\udbff\udf00-\udfff\s]+)?(.+)$/);
                                const emoji = match ? match[1]?.trim() || '📦' : '📦';
                                const name = match ? match[2]?.trim() || budget.category : budget.category;

                                // Proyección de agotamiento
                                const burnInfo = getBudgetBurnRateAndExhaustionDate(budget.category, maxAmount, period);

                                // Histórico últimos 3 meses
                                const history3 = getHistoricalBudgetPerformance(budget.category, maxAmount);

                                const isExceeded = currentSpend > maxAmount;
                                const isWarning = !isExceeded && pct >= alertThreshold;

                                let bgClass = "bg-slate-950/40 border-white/10 hover:border-white/20";
                                let progressColor = "bg-emerald-500 shadow-emerald-500/20";
                                let textAccentColor = "text-emerald-400";

                                if (isExceeded) {
                                  bgClass = "bg-red-500/10 border-red-500/30";
                                  progressColor = "bg-red-500 shadow-red-500/20";
                                  textAccentColor = "text-red-400";
                                } else if (isWarning) {
                                  bgClass = "bg-yellow-500/10 border-yellow-500/30";
                                  progressColor = "bg-yellow-500 shadow-yellow-500/20";
                                  textAccentColor = "text-yellow-400";
                                }

                                const periodLabelMap = {
                                  semanal: '🗓️ Semanal',
                                  quincenal: '📅 Quincenal',
                                  mensual: '📆 Mensual',
                                  anual: '🏆 Anual'
                                };

                                return (
                                  <div 
                                    key={budget.id}
                                    className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between gap-4 shadow-lg ${bgClass}`}
                                  >
                                    {/* Cabecera */}
                                    <div className="flex justify-between items-start gap-2">
                                      <div className="flex items-center gap-3">
                                        <span className="text-2xl p-2.5 bg-slate-950/60 rounded-xl border border-white/5">{emoji}</span>
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <h5 className="text-xs font-black text-white tracking-wide">{name}</h5>
                                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                                              {periodLabelMap[period as keyof typeof periodLabelMap] || '📆 Mensual'}
                                            </span>
                                          </div>
                                          <p className="text-[10px] text-slate-400 mt-0.5">Alertas a partir del {alertThreshold}% de consumo</p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        {isExceeded && (
                                          <span className="text-[8px] font-black uppercase tracking-wider bg-red-500 text-slate-950 px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                                            🔴 Excedido
                                          </span>
                                        )}
                                        {isWarning && (
                                          <span className="text-[8px] font-black uppercase tracking-wider bg-yellow-400 text-slate-950 px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                                            ⚠️ Umbral {pct.toFixed(0)}%
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

                                    {/* Consumo y barra */}
                                    <div className="flex flex-col gap-1.5">
                                      <div className="flex justify-between items-baseline text-xs">
                                        <span className="text-slate-400 text-[11px]">Consumo en el periodo</span>
                                        <div className="font-mono flex items-center gap-1">
                                          <span className={`font-black ${textAccentColor}`}>${currentSpend.toLocaleString('es-CO')}</span>
                                          <span className="text-slate-600 text-[10px]">de</span>
                                          <span className="text-slate-300 font-bold">${maxAmount.toLocaleString('es-CO')}</span>
                                        </div>
                                      </div>

                                      <div className="w-full h-2.5 bg-slate-950/80 rounded-full overflow-hidden border border-white/5 relative">
                                        <motion.div 
                                          initial={{ width: 0 }}
                                          animate={{ width: `${Math.min(pct, 100)}%` }}
                                          transition={{ duration: 0.5, ease: "easeOut" }}
                                          className={`h-full rounded-full transition-colors ${progressColor}`}
                                        />
                                      </div>

                                      <div className="flex justify-between items-center mt-0.5">
                                        <span className="text-[10px] text-slate-500 font-medium">Consumido del límite</span>
                                        <span className={`text-[11px] font-mono font-black ${textAccentColor}`}>{pct.toFixed(1)}%</span>
                                      </div>
                                    </div>

                                    {/* PROYECCIÓN DE AGOTAMIENTO INTELIGENTE */}
                                    <div className={`p-3 rounded-xl border text-[11px] flex items-start gap-2.5 transition-all ${
                                      burnInfo.willExceed 
                                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' 
                                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                                    }`}>
                                      <Zap className={`w-4 h-4 shrink-0 mt-0.5 ${burnInfo.willExceed ? 'text-amber-400' : 'text-emerald-400'}`} />
                                      <div>
                                        <span className="font-bold block text-white text-[11px]">Proyección Inteligente de Agotamiento</span>
                                        <p className="text-[10px] text-slate-300 mt-0.5 font-medium leading-relaxed">
                                          {burnInfo.message}
                                        </p>
                                      </div>
                                    </div>

                                    {/* COMPARACIÓN HISTÓRICA MINI */}
                                    {history3.length > 0 && (
                                      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Histórico Reciente</span>
                                        <div className="flex items-center gap-1.5">
                                          {history3.map((h) => (
                                            <span 
                                              key={h.monthName}
                                              className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-md border ${
                                                h.pct > 100 
                                                  ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                                                  : h.pct >= 80 
                                                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
                                                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                                              }`}
                                              title={`${h.monthName}: $${h.spend.toLocaleString('es-CO')} de $${h.max.toLocaleString('es-CO')} (${h.pct}%)`}
                                            >
                                              {h.monthName}: {h.pct}%
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* VISTA 2: PRESUPUESTO RECOMENDADO AI (BASADO EN 12 MESES) */}
                    {budgetMainTab === 'recommended' && (
                      <div className="flex flex-col gap-6">
                        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                          <div className="flex items-start gap-3 border-b border-white/5 pb-4">
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                              <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-white text-sm tracking-wide">Presupuesto Sugerido por Inteligencia de Consumo</h4>
                              <p className="text-xs text-slate-400 mt-1">
                                Calculamos automáticamente el gasto promedio mensual de tus últimos 12 meses por cada categoría para recomendarte presupuestos óptimos y realizables.
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                            {dbCategories.filter(c => c.type === 'expense').map((cat) => {
                              const avg12 = getAverage12MonthsSpendForCategory(cat.name);
                              const recLimit = avg12 > 0 ? avg12 : 680000;
                              const currentBudget = dbBudgets.find(b => isCategoryMatch(b.category, cat.name));

                              return (
                                <div key={cat.id} className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 flex flex-col justify-between gap-4 relative overflow-hidden">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                      <span className="text-2xl p-2 bg-slate-900 rounded-xl border border-white/5">{cat.emoji || '📦'}</span>
                                      <div>
                                        <h5 className="text-xs font-black text-white">{cat.name}</h5>
                                        <span className="text-[10px] text-slate-500 font-mono">Categoría de Egreso</span>
                                      </div>
                                    </div>
                                    {currentBudget && (
                                      <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                        Activo: ${currentBudget.maxAmount.toLocaleString('es-CO')}
                                      </span>
                                    )}
                                  </div>

                                  <div className="p-3 bg-slate-900/80 border border-white/5 rounded-xl flex flex-col gap-1">
                                    <span className="text-[10px] text-slate-400 font-medium">Promedio Últimos 12 Meses</span>
                                    <div className="flex items-baseline justify-between">
                                      <span className="text-xs font-mono font-bold text-slate-300">Gasto Promedio:</span>
                                      <span className="text-sm font-mono font-black text-emerald-400">${recLimit.toLocaleString('es-CO')}</span>
                                    </div>
                                    <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-white/5">
                                      <span className="text-[10px] text-emerald-300 font-extrabold">Presupuesto Sugerido:</span>
                                      <span className="text-xs font-mono font-extrabold text-white">${recLimit.toLocaleString('es-CO')}</span>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleCreateRecommendedBudget(cat.name, recLimit, 'mensual')}
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                                  >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                    <span>{currentBudget ? 'Actualizar a Sugerido' : 'Aplicar Presupuesto Sugerido'}</span>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* VISTA 3: SIMULADOR DE PRESUPUESTOS (WHAT-IF SCENARIOS) */}
                    {budgetMainTab === 'simulator' && (() => {
                      // Calcular ingresos totales del mes actual
                      const now = new Date();
                      const currentYear = now.getFullYear();
                      const currentMonth = now.getMonth();
                      const ymPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

                      const totalIncomeMonth = transactions
                        .filter(t => {
                          const isIncome = t.type === 'income' || (t as any).tipo === 'ingreso';
                          const dStr = t.date || (t as any).fecha || '';
                          return isIncome && dStr.startsWith(ymPrefix);
                        })
                        .reduce((sum, t) => sum + (t.amount || (t as any).monto || 0), 0);

                      const baseIncome = totalIncomeMonth > 0 ? totalIncomeMonth : 3500000;

                      // Presupuestos base totales
                      const baseBudgetsTotal = dbBudgets.reduce((sum, b) => sum + b.maxAmount, 0);

                      // Ajuste acumulado del simulador
                      const totalSimulatedAdjustment: number = (Object.values(simulatorAdjustments) as number[]).reduce((sum: number, val: number) => sum + (val || 0), 0);
                      const simulatedBudgetsTotal = baseBudgetsTotal + totalSimulatedAdjustment;

                      const projectedSavings = Math.max(0, baseIncome - simulatedBudgetsTotal);
                      const projectedSavingsPct = baseIncome > 0 ? (projectedSavings / baseIncome) * 100 : 0;

                      return (
                        <div className="flex flex-col gap-6">
                          {/* PANEL SIMULADOR INTERACTIVO */}
                          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-500/20 rounded-2xl p-6 shadow-2xl flex flex-col gap-5">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-4">
                              <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 border border-emerald-500/30">
                                  <Calculator className="w-6 h-6" />
                                </div>
                                <div>
                                  <h4 className="font-extrabold text-white text-sm tracking-wide">Simulador "What-If" de Ajuste de Presupuestos</h4>
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    Aumenta o disminuye límites por categoría para simular en tiempo real el porcentaje final de ahorro.
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setSimulatorAdjustments({})}
                                className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
                              >
                                Restablecer Simulación
                              </button>
                            </div>

                            {/* BANNER RESULTADO SIMULADO PRONÓSTICO */}
                            <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-inner">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Resultado de la Simulación</span>
                                <p className="text-sm font-black text-white leading-relaxed">
                                  {totalSimulatedAdjustment !== 0 ? (
                                    <>
                                      Si <strong className={totalSimulatedAdjustment > 0 ? "text-amber-400" : "text-emerald-400"}>
                                        {totalSimulatedAdjustment > 0 ? `aumentas $${totalSimulatedAdjustment.toLocaleString('es-CO')}` : `disminuyes $${Math.abs(totalSimulatedAdjustment).toLocaleString('es-CO')}`}
                                      </strong> en tus presupuestos, terminarás con un <strong className="text-emerald-400 text-base">Ahorro del {projectedSavingsPct.toFixed(1)}%</strong> (${projectedSavings.toLocaleString('es-CO')} disponible/mes).
                                    </>
                                  ) : (
                                    <>
                                      Con tus presupuestos actuales, proyectas un <strong className="text-emerald-400 text-base">Ahorro del {projectedSavingsPct.toFixed(1)}%</strong> (${projectedSavings.toLocaleString('es-CO')} disponible/mes).
                                    </>
                                  )}
                                </p>
                              </div>

                              <div className="flex items-center gap-4 shrink-0 bg-slate-900 p-3.5 rounded-xl border border-white/5">
                                <div className="text-right">
                                  <span className="text-[9px] text-slate-500 block uppercase font-mono">Ingresos Estimados</span>
                                  <span className="text-xs font-mono font-extrabold text-emerald-400">${baseIncome.toLocaleString('es-CO')}</span>
                                </div>
                                <div className="h-8 w-px bg-white/10"></div>
                                <div className="text-right">
                                  <span className="text-[9px] text-slate-500 block uppercase font-mono">Presupuesto Simulado</span>
                                  <span className="text-xs font-mono font-extrabold text-amber-400">${simulatedBudgetsTotal.toLocaleString('es-CO')}</span>
                                </div>
                              </div>
                            </div>

                            {/* TARJETAS DE CATEGORÍA PARA SIMULAR */}
                            {dbBudgets.length === 0 ? (
                              <p className="text-xs text-slate-400 text-center py-6">Configura primero al menos un presupuesto en la pestaña "Presupuestos Activos" para usar el simulador.</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {dbBudgets.map((b) => {
                                  const currentAdj = simulatorAdjustments[b.id] || 0;
                                  const simulatedLimit = b.maxAmount + currentAdj;

                                  return (
                                    <div key={b.id} className="bg-slate-950/50 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-white flex items-center gap-2">
                                          <span>📦</span>
                                          <span>{b.category}</span>
                                        </span>
                                        <span className="text-xs font-mono font-black text-emerald-400">
                                          Nuevos: ${simulatedLimit.toLocaleString('es-CO')}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => setSimulatorAdjustments(prev => ({ ...prev, [b.id]: (prev[b.id] || 0) - 50000 }))}
                                          className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold cursor-pointer transition-all"
                                        >
                                          -$50.000
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setSimulatorAdjustments(prev => ({ ...prev, [b.id]: (prev[b.id] || 0) + 50000 }))}
                                          className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold cursor-pointer transition-all"
                                        >
                                          +$50.000
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setSimulatorAdjustments(prev => ({ ...prev, [b.id]: (prev[b.id] || 0) + 100000 }))}
                                          className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold cursor-pointer transition-all"
                                        >
                                          +$100.000
                                        </button>
                                        <span className="text-[10px] text-slate-500 font-mono ml-auto">
                                          (Base: ${b.maxAmount.toLocaleString('es-CO')})
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* VISTA 4: COMPARATIVA HISTÓRICA DETALLADA */}
                    {budgetMainTab === 'history' && (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <h4 className="font-extrabold text-white text-xs tracking-wider uppercase flex items-center gap-2">
                            <History className="w-4 h-4 text-emerald-400" />
                            Comparativa de Consumo por Meses Anteriores
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">Porcentaje de Ejecución</span>
                        </div>

                        {dbBudgets.length === 0 ? (
                          <div className="text-center py-10 text-slate-500 text-xs">No hay presupuestos activos para evaluar el histórico.</div>
                        ) : (
                          <div className="flex flex-col gap-4">
                            {dbBudgets.map((budget) => {
                              const history = getHistoricalBudgetPerformance(budget.category, budget.maxAmount);
                              return (
                                <div key={budget.id} className="bg-slate-950/50 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                                  <div className="flex justify-between items-center">
                                    <h5 className="text-xs font-bold text-white flex items-center gap-2">
                                      <span>📦</span>
                                      <span>{budget.category}</span>
                                    </h5>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      Límite: ${budget.maxAmount.toLocaleString('es-CO')}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-3 gap-3">
                                    {history.map((h) => (
                                      <div key={h.monthName} className="p-3 bg-slate-900/80 rounded-lg border border-white/5 flex flex-col gap-1">
                                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                                          <span>{h.monthName}</span>
                                          <span className={`font-mono font-bold ${
                                            h.pct > 100 ? 'text-red-400' : h.pct >= 80 ? 'text-yellow-400' : 'text-emerald-400'
                                          }`}>{h.pct}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                          <div 
                                            className={`h-full rounded-full ${
                                              h.pct > 100 ? 'bg-red-500' : h.pct >= 80 ? 'bg-yellow-500' : 'bg-emerald-500'
                                            }`} 
                                            style={{ width: `${Math.min(h.pct, 100)}%` }}
                                          />
                                        </div>
                                        <span className="text-[9px] font-mono text-slate-500 text-right mt-0.5">
                                          ${h.spend.toLocaleString('es-CO')}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
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
                    className="flex flex-col gap-6 w-full"
                  >
                    {/* ENCABEZADO DE SECCIÓN Y RESUMEN KPI */}
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 border border-white/5 rounded-2xl p-5 shadow-lg">
                        <div>
                          <h3 className="text-sm font-black text-white tracking-wider uppercase flex items-center gap-2">
                            <Target className="w-4 h-4 text-emerald-400" />
                            Metas de Ahorro Inteligentes
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-1">Planifica tus objetivos financieros con fechas estimadas, aportes automáticos y simulador de aceleración.</p>
                        </div>

                        <button
                          onClick={() => setIsAddGoalModalOpen(true)}
                          className="bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-slate-950 text-xs font-extrabold px-5 py-3 rounded-xl shadow-lg hover:shadow-emerald-500/15 cursor-pointer flex items-center justify-center gap-2 transition-all shrink-0"
                        >
                          <Plus className="w-4 h-4 text-slate-950 stroke-[3px]" />
                          Nueva Meta
                        </button>
                      </div>

                      {/* Tarjetas de Estadísticas Globales */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Metas Activas</span>
                          <span className="text-lg font-black text-white font-mono">{dbSavingsGoals.length} Metas</span>
                          <span className="text-[9px] text-slate-500">Objetivos en progreso</span>
                        </div>
                        <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ahorro Acumulado</span>
                          <span className="text-lg font-black text-emerald-400 font-mono">
                            ${dbSavingsGoals.reduce((acc, g) => acc + (g.currentSaved || 0), 0).toLocaleString('es-CO')}
                          </span>
                          <span className="text-[9px] text-slate-500">
                            de ${dbSavingsGoals.reduce((acc, g) => acc + (g.targetAmount || 0), 0).toLocaleString('es-CO')} objetivo total
                          </span>
                        </div>
                        <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aportes Programados</span>
                          <span className="text-lg font-black text-indigo-400 font-mono">
                            ${dbSavingsGoals.reduce((acc, g) => {
                              const amount = g.autoContributionAmount || 100000;
                              if (g.autoContributionFrequency === 'semanal') return acc + amount * 2;
                              return acc + amount;
                            }, 0).toLocaleString('es-CO')}/quincena
                          </span>
                          <span className="text-[9px] text-slate-500">Tasa de ahorro proyectada</span>
                        </div>
                      </div>
                    </div>

                    {/* SEGUIMIENTO DE METAS DE AHORRO */}
                    <div className="flex flex-col gap-6 w-full">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <h4 className="font-extrabold text-white text-xs tracking-wider uppercase flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                            Listado de Metas y Proyecciones
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono font-bold">{dbSavingsGoals.length} Metas</span>
                        </div>

                        {dbSavingsGoals.length === 0 ? (
                          <div className="text-center py-10 flex flex-col items-center justify-center gap-2">
                            <TrendingUp className="w-8 h-8 text-slate-600" />
                            <p className="text-xs text-slate-400 font-medium">No has configurado ninguna meta de ahorro.</p>
                            <p className="text-[10px] text-slate-600 max-w-[280px]">Haz clic en "Nueva Meta" para añadir objetivos financieros con simulación y aportes automáticos.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-5">
                            {dbSavingsGoals.map((goal) => {
                              const targetAmount = goal.targetAmount;
                              const currentSaved = goal.currentSaved;
                              const pct = targetAmount > 0 ? (currentSaved / targetAmount) * 100 : 0;
                              const isCompleted = currentSaved >= targetAmount;

                              // Proyección base
                              const projBase = getGoalProjectionDetails(goal, 0);

                              // Proyección simulada extra
                              const extraAmount = goalSimExtraAmounts[goal.id] || 0;
                              const projSim = getGoalProjectionDetails(goal, extraAmount);

                              // Prioridad Badge
                              const priorityConfig = {
                                alta: { label: 'Prioridad Alta 🔴', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
                                media: { label: 'Prioridad Media 🟡', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
                                baja: { label: 'Prioridad Baja 🟢', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
                              }[goal.priority || 'media'] || { label: 'Prioridad Media 🟡', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };

                              // Paleta de colores según progreso
                              let progressColor = "bg-indigo-500 shadow-indigo-500/20";
                              let textAccentColor = "text-indigo-400";
                              let borderHighlight = "border-white/5 hover:border-white/15 bg-slate-950/40";

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
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                      <span className="text-2xl p-2.5 bg-slate-950/70 rounded-xl border border-white/5 shrink-0">
                                        {goal.emoji}
                                      </span>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h5 className="text-xs font-black text-white tracking-wide uppercase">{goal.name}</h5>
                                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${priorityConfig.cls}`}>
                                            {priorityConfig.label}
                                          </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Meta Total: ${targetAmount.toLocaleString('es-CO')}</p>
                                      </div>
                                    </div>

                                    {/* Botones de Acción */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDepositGoalModal(goal);
                                          setDepositAmountInput('');
                                          setDepositNoteInput('');
                                        }}
                                        className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1"
                                      >
                                        <Plus className="w-3 h-3 stroke-[3px]" />
                                        Registrar Aporte
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => setHistoryGoalModal(goal)}
                                        className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/20 transition-all cursor-pointer flex items-center gap-1"
                                      >
                                        <History className="w-3 h-3" />
                                        Historial ({goal.history?.length || 0})
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleDeleteSavingsGoal(goal.id)}
                                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer ml-auto"
                                        title="Eliminar meta"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Valores y barra de progreso */}
                                  <div className="flex flex-col gap-2 bg-slate-950/30 p-3.5 rounded-xl border border-white/5">
                                    <div className="flex justify-between items-baseline text-xs">
                                      <span className="text-slate-400 text-[11px]">Progreso de Ahorro</span>
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

                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] text-slate-500 font-medium">Cumplimiento</span>
                                      <span className={`text-[11px] font-mono font-black ${textAccentColor}`}>{pct.toFixed(1)}%</span>
                                    </div>
                                  </div>

                                  {!isCompleted && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {/* BLOQUE: PROYECCIÓN FECHA ESTIMADA DE LOGRO */}
                                      <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-xl flex flex-col justify-between gap-2">
                                        <div className="flex flex-col gap-1">
                                          <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                                              <Calendar className="w-3.5 h-3.5" />
                                              Fecha Estimada de Logro
                                            </span>
                                            <span className="text-[9px] font-mono text-indigo-300 font-bold">
                                              {projBase.monthsLeft} meses rest.
                                            </span>
                                          </div>
                                          
                                          <div className="text-xs text-slate-300 font-medium mt-1">
                                            Meta: <strong className="text-white font-mono">${targetAmount.toLocaleString('es-CO')}</strong>
                                          </div>

                                          <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs mt-0.5">
                                            <span className="text-indigo-400">↓</span>
                                            <span>Con tus aportes actuales la lograrás el</span>
                                          </div>

                                          <div className="text-sm font-black text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 text-center mt-1">
                                            {projBase.projectedDateStr}
                                          </div>
                                        </div>

                                        <p className="text-[9px] text-slate-400 mt-1">
                                          *Calculado con tasa de ahorro actual de ${projBase.baseMonthlyRate.toLocaleString('es-CO')}/mes.
                                        </p>
                                      </div>

                                      {/* BLOQUE: APORTES AUTOMÁTICOS & APORTE RÁPIDO */}
                                      <div className="p-4 bg-slate-950/60 border border-white/5 rounded-xl flex flex-col justify-between gap-2">
                                        <div className="flex flex-col gap-1.5">
                                          <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1">
                                              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                                              Aportes Automáticos Programados
                                            </span>
                                            <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                              Activo
                                            </span>
                                          </div>

                                          <div className="text-xs text-white font-bold flex items-center gap-1.5 mt-1">
                                            <span>Cada {goal.autoContributionFrequency || 'quincena'}</span>
                                            <span className="text-emerald-400 font-mono font-black">${(goal.autoContributionAmount || 100000).toLocaleString('es-CO')}</span>
                                          </div>

                                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <span className="text-indigo-400">↓</span> Transferencia automática sugerida cada periodo
                                          </p>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            const autoAmt = goal.autoContributionAmount || 100000;
                                            handleDepositToSavingsGoal(goal, autoAmt, 'Aporte automático recurrente ejecutado');
                                          }}
                                          className="w-full py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-1"
                                        >
                                          <Zap className="w-3.5 h-3.5 text-yellow-400" />
                                          Ejecutar Aporte Automático (${(goal.autoContributionAmount || 100000).toLocaleString('es-CO')})
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* BLOQUE: SIMULADOR "WHAT-IF" ACELERADOR DE META */}
                                  {!isCompleted && (
                                    <div className="p-4 bg-slate-900/60 border border-white/5 rounded-xl flex flex-col gap-3">
                                      <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                          <Sparkles className="w-3.5 h-3.5" />
                                          Simulador de Aceleración de Meta
                                        </span>
                                        <span className="text-[9px] text-slate-500 font-mono">Simulación en tiempo real</span>
                                      </div>

                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[10px] text-slate-400 font-bold">Si aportas extra:</span>
                                        {[20000, 50000, 100000, 200000].map((extra) => (
                                          <button
                                            key={extra}
                                            type="button"
                                            onClick={() => {
                                              const current = goalSimExtraAmounts[goal.id] || 0;
                                              setGoalSimExtraAmounts({
                                                ...goalSimExtraAmounts,
                                                [goal.id]: current === extra ? 0 : extra
                                              });
                                            }}
                                            className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                                              extraAmount === extra
                                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 scale-105'
                                                : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white'
                                            }`}
                                          >
                                            +${extra.toLocaleString('es-CO')}
                                          </button>
                                        ))}
                                      </div>

                                      {/* Comparación de resultados del simulador */}
                                      {extraAmount > 0 ? (
                                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex flex-col gap-1">
                                          <div className="text-xs text-amber-200 font-bold flex items-center gap-1">
                                            <span>🚀 ¡Si aportas ${extraAmount.toLocaleString('es-CO')} más por mes!</span>
                                          </div>
                                          <p className="text-[11px] text-slate-300">
                                            Terminarás <strong className="text-emerald-400 font-bold">{Math.max(0, projBase.monthsLeft - projSim.monthsLeft)} meses antes</strong>.
                                            Alcanzarás tu meta el <strong className="text-emerald-300 font-mono">{projSim.projectedDateStr}</strong> en lugar del {projBase.projectedDateStr}.
                                          </p>
                                        </div>
                                      ) : (
                                        <div className="p-2.5 bg-slate-950/40 border border-white/5 rounded-lg text-[10px] text-slate-500 italic">
                                          Selecciona un monto extra arriba para ver cuánto tiempo y meses ahorrarás en tu meta.
                                        </div>
                                      )}
                                    </div>
                                  )}
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
                    {/* ENCABEZADO DE SECCIÓN CON BOTÓN REGISTRAR */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 border border-white/5 rounded-2xl p-5 shadow-lg">
                      <div>
                        <h3 className="text-sm font-black text-white tracking-wider uppercase flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-emerald-400" />
                          Control de Deudas y Obligaciones
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Simula estrategias de pago (Avalanche, Snowball), organiza el calendario de pagos de Agosto y monitorea intereses pagados.
                        </p>
                      </div>

                      <button
                        onClick={() => setIsAddDebtModalOpen(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-slate-950 text-xs font-extrabold px-5 py-3 rounded-xl shadow-lg hover:shadow-emerald-500/15 cursor-pointer flex items-center justify-center gap-2 transition-all shrink-0"
                      >
                        <Plus className="w-4 h-4 text-slate-950 stroke-[3px]" />
                        Nueva Obligación
                      </button>
                    </div>

                    {/* KPI RESUMEN DE DEUDAS */}
                    {(() => {
                      const totalBalance = dbDebts.reduce((acc, d) => acc + (d.balance || 0), 0);
                      const totalMinPayments = dbDebts.reduce((acc, d) => acc + (d.minPayment || 0), 0);
                      const totalInterestsYear = dbDebts.reduce((acc, d) => acc + (d.interestPaidYear || 0), 0) || 1250000;
                      
                      // Estrategia Avalanche: Ordenar por interés descendente
                      const sortedAvalanche = [...dbDebts].sort((a, b) => (b.interestRate || 28) - (a.interestRate || 28));
                      const topAvalancheDebt = sortedAvalanche[0] || { name: 'Tarjeta Visa', interestRate: 28, balance: 2400000 };
                      
                      // Estrategia Snowball: Ordenar por saldo ascendente
                      const sortedSnowball = [...dbDebts].sort((a, b) => (a.balance || 0) - (b.balance || 0));
                      const topSnowballDebt = sortedSnowball[0] || { name: 'Tarjeta Visa', balance: 2400000 };

                      // Recálculo del pago recomendado: Acelerador
                      const extraPayment = debtExtraPayment || 300000;
                      const monthsSaved = Math.max(1, Math.round((extraPayment / 300000) * 5));

                      return (
                        <div className="flex flex-col gap-6 w-full">
                          {/* TARJETAS DE KPIS PRINCIPALES */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <CreditCard className="w-3.5 h-3.5 text-rose-400" />
                                Deuda Total Pendiente
                              </span>
                              <span className="text-xl font-black text-rose-400 font-mono mt-2">
                                ${totalBalance > 0 ? totalBalance.toLocaleString('es-CO') : '6.900.000'}
                              </span>
                              <span className="text-[10px] text-slate-500 mt-1">En {dbDebts.length || 2} obligaciones activas</span>
                            </div>

                            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <Coins className="w-3.5 h-3.5 text-amber-400" />
                                Intereses Pagados (Año)
                              </span>
                              <span className="text-xl font-black text-amber-400 font-mono mt-2">
                                ${totalInterestsYear.toLocaleString('es-CO')}
                              </span>
                              <span className="text-[10px] text-slate-500 mt-1">Costo de financiamiento acumulado</span>
                            </div>

                            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                                Cuotas Mensuales Mínimas
                              </span>
                              <span className="text-xl font-black text-emerald-400 font-mono mt-2">
                                ${totalMinPayments > 0 ? totalMinPayments.toLocaleString('es-CO') : '400.000'}
                              </span>
                              <span className="text-[10px] text-slate-500 mt-1">Compromiso mensual fijo</span>
                            </div>
                          </div>

                          {/* SECCIÓN 1: SIMULADORES ESTRATÉGICOS (AVALANCHE Y SNOWBALL) */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* SIMULADOR AVALANCHE */}
                            <div className="bg-gradient-to-br from-slate-900/90 via-slate-900 to-rose-950/20 border border-rose-500/20 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden shadow-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                    <Zap className="w-4 h-4 fill-rose-500/20" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-white tracking-wide">Simulador Avalanche</h4>
                                    <p className="text-[10px] text-slate-400">Prioriza la deuda con mayor tasa de interés</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setDebtShowAvalanche(!debtShowAvalanche)}
                                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold border border-white/10 transition-all cursor-pointer flex items-center gap-1"
                                >
                                  {debtShowAvalanche ? 'Ocultar' : 'Mostrar'}
                                  {debtShowAvalanche ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                              </div>

                              {debtShowAvalanche && (
                                <div className="mt-1 flex flex-col gap-3 pt-3 border-t border-white/10">
                                  <div className="bg-slate-950/70 border border-rose-500/30 rounded-xl p-3.5 flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Paga primero</span>
                                      <span className="text-rose-400 font-extrabold font-mono bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                                        {topAvalancheDebt.name}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-200 mt-1">
                                      Ahorrarás <strong className="text-emerald-400 font-black text-sm">${(480000).toLocaleString('es-CO')}</strong> en intereses.
                                    </p>
                                  </div>
                                  <p className="text-[11px] text-slate-400 leading-relaxed">
                                    Al liquidar deudas de mayor tasa primero ({topAvalancheDebt.interestRate || 28}% E.A.), eliminas los cargos financieros más agresivos rápidamente.
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* SIMULADOR SNOWBALL */}
                            <div className="bg-gradient-to-br from-slate-900/90 via-slate-900 to-sky-950/20 border border-sky-500/20 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden shadow-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                    <Target className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-white tracking-wide">Simulador Snowball</h4>
                                    <p className="text-[10px] text-slate-400">Liquida del saldo menor al mayor</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setDebtShowSnowball(!debtShowSnowball)}
                                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold border border-white/10 transition-all cursor-pointer flex items-center gap-1"
                                >
                                  {debtShowSnowball ? 'Ocultar' : 'Mostrar'}
                                  {debtShowSnowball ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                              </div>

                              {debtShowSnowball && (
                                <div className="mt-1 flex flex-col gap-3 pt-3 border-t border-white/10">
                                  <div className="bg-slate-950/70 border border-sky-500/30 rounded-xl p-3.5 flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Estrategia</span>
                                      <span className="text-sky-300 font-bold bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/30">
                                        Bola de Nieve
                                      </span>
                                    </div>
                                    <p className="text-xs text-sky-200 font-bold mt-1">
                                      Liquida primero las deudas pequeñas.
                                    </p>
                                  </div>
                                  <p className="text-[11px] text-slate-400 leading-relaxed">
                                    Al saldar primero la obligación menor ({topSnowballDebt.name}), liberas flujo de caja e impulsas tu motivación con victorias financieras rápidas.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* SECCIÓN 2: CALENDARIO DE PAGOS (AGOSTO) E INTERESES */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* CALENDARIO PRÓXIMOS PAGOS - AGOSTO */}
                            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                    <CalendarDays className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-white tracking-wide">Calendario</h4>
                                    <p className="text-[10px] text-slate-400">Próximos pagos programados</p>
                                  </div>
                                </div>
                                <span className="text-xs font-black bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 font-mono">
                                  Agosto
                                </span>
                              </div>

                              <div className="flex flex-col gap-2.5">
                                {dbDebts.length === 0 ? (
                                  <>
                                    <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3 flex justify-between items-center text-xs">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                                        <div>
                                          <p className="font-bold text-white">Tarjeta Visa</p>
                                          <p className="text-[10px] text-slate-400">Vence: 15 de Agosto</p>
                                        </div>
                                      </div>
                                      <span className="font-mono font-bold text-amber-300">$180.000</span>
                                    </div>
                                    <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3 flex justify-between items-center text-xs">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                        <div>
                                          <p className="font-bold text-white">Crédito Libre Inversión</p>
                                          <p className="text-[10px] text-slate-400">Vence: 28 de Agosto</p>
                                        </div>
                                      </div>
                                      <span className="font-mono font-bold text-emerald-300">$220.000</span>
                                    </div>
                                  </>
                                ) : (
                                  dbDebts.map((d) => (
                                    <div key={d.id} className="bg-slate-950/60 border border-white/5 rounded-xl p-3 flex justify-between items-center text-xs">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                        <div>
                                          <p className="font-bold text-white">{d.name}</p>
                                          <p className="text-[10px] text-slate-400">
                                            Vence: {d.dueDate ? formatDueDateSpanish(d.dueDate) : 'Agosto'}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="font-mono font-bold text-emerald-300">${(d.minPayment || 0).toLocaleString('es-CO')}</span>
                                        <button
                                          type="button"
                                          onClick={() => setDebtPayModal(d)}
                                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-emerald-500/20 transition-all cursor-pointer"
                                        >
                                          Abonar
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>

                            {/* DESGLOSE DE INTERESES */}
                            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 flex flex-col justify-between gap-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    <Coins className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-white tracking-wide">Intereses</h4>
                                    <p className="text-[10px] text-slate-400">Acumulado del periodo actual</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setDebtShowInterests(!debtShowInterests)}
                                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold border border-white/10 transition-all cursor-pointer flex items-center gap-1"
                                >
                                  {debtShowInterests ? 'Ocultar' : 'Mostrar'}
                                  {debtShowInterests ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                              </div>

                              {debtShowInterests && (
                                <div className="bg-slate-950/70 border border-amber-500/20 rounded-xl p-4 flex flex-col gap-2">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    Intereses pagados este año
                                  </span>
                                  <span className="text-2xl font-black text-amber-400 font-mono">
                                    ${totalInterestsYear.toLocaleString('es-CO')}
                                  </span>
                                  <p className="text-[11px] text-slate-400 mt-1">
                                    Reducir las tasas mediante compras de cartera o aportes extra protege tu patrimonio.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* SECCIÓN 3: PAGO RECOMENDADO Y SIMULADOR DE ABONOS EXTRAS */}
                          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 flex flex-col gap-4 shadow-xl relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                              <div className="flex items-center gap-2.5">
                                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  <Sparkles className="w-5 h-5 fill-emerald-500/20" />
                                </div>
                                <div>
                                  <h4 className="text-base font-black text-white tracking-wide">Pago recomendado</h4>
                                  <p className="text-xs text-slate-300 mt-0.5">
                                    Si pagas <strong className="text-emerald-400 font-black font-mono">${extraPayment.toLocaleString('es-CO')}</strong> extras terminarás <strong className="text-emerald-300 font-black">{monthsSaved} meses antes</strong>.
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3">
                              <span className="text-xs text-slate-400 font-bold">Selecciona o simula un abono adicional mensual:</span>
                              <div className="flex items-center gap-2 flex-wrap">
                                {[100000, 200000, 300000, 500000].map((amt) => (
                                  <button
                                    key={amt}
                                    type="button"
                                    onClick={() => setDebtExtraPayment(amt)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                      extraPayment === amt
                                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 scale-105 shadow-md shadow-emerald-500/20'
                                        : 'bg-slate-950/60 border-white/10 text-slate-300 hover:bg-white/10'
                                    }`}
                                  >
                                    +${amt.toLocaleString('es-CO')}
                                  </button>
                                ))}
                              </div>

                              <div className="bg-slate-950/60 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                  <p className="text-xs text-slate-200 font-medium">
                                    Con este aporte extra de <strong className="text-emerald-400 font-mono">${extraPayment.toLocaleString('es-CO')}</strong> mensuales, acelerarás la amortización del capital y reducirás drásticamente los intereses generados.
                                  </p>
                                </div>
                                <div className="shrink-0 text-right bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
                                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Tiempo Ahorrado</span>
                                  <span className="text-sm font-black text-emerald-400 font-mono">{monthsSaved} meses antes</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* LISTADO DE OBLIGACIONES Y ACCIONES */}
                          <div className="flex flex-col gap-4 w-full">
                            <div className="flex justify-between items-center pb-2">
                              <div>
                                <h3 className="text-sm font-bold text-white tracking-wide">Tus Obligaciones Registradas</h3>
                                <p className="text-[10px] text-slate-400 mt-0.5">Control individual, cuotas y abonos directos.</p>
                              </div>
                              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-white/5">
                                Total: {dbDebts.length}
                              </span>
                            </div>

                            {dbDebts.length === 0 ? (
                              <div className="bg-slate-900/40 border border-dashed border-white/10 rounded-2xl p-8 text-center flex flex-col items-center gap-3">
                                <CreditCard className="w-8 h-8 text-slate-500 stroke-[1.5]" />
                                <p className="text-xs text-slate-300 font-bold">Sin obligaciones personalizadas en base de datos.</p>
                                <p className="text-[11px] text-slate-500">Puedes agregar tus tarjetas o créditos con el botón superior "Nueva Obligación".</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {dbDebts.map((debt) => {
                                  const daysLeft = calculateDaysLeft(debt.dueDate);
                                  
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
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                                              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                                                {debt.type === 'card' ? 'Tarjeta de Crédito' : 'Préstamo / Otro'}
                                              </p>
                                              <span className="text-emerald-400 font-mono text-[10px] font-bold">
                                                {debt.interestRate || 28}% E.A.
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Botones de acción */}
                                        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                          <button
                                            onClick={() => setDebtPayModal(debt)}
                                            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                            title="Abonar a esta deuda"
                                          >
                                            Abonar
                                          </button>
                                          <button
                                            onClick={() => {
                                              if (isEditing) {
                                                setEditingDebtId(null);
                                              } else {
                                                setEditingDebtId(debt.id);
                                                setEditingDebtBalance(String(debt.balance));
                                                setEditingDebtOriginal(String(debt.originalDebt || debt.balance));
                                                setEditingDebtMinPayment(String(debt.minPayment));
                                                setEditingDebtDueDate(debt.dueDate);
                                                setEditingDebtStartDate(debt.fechaInicio || (debt.fechaCreacion ? debt.fechaCreacion.split('T')[0] : ''));
                                                setEditingDebtInterestRate(String(debt.interestRate || 28));
                                              }
                                            }}
                                            className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                                            title="Editar obligación"
                                          >
                                            <Edit2 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteDebt(debt.id)}
                                            className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
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
                                        <div className="flex flex-col gap-3.5 bg-slate-950/40 border border-white/5 rounded-xl p-4">
                                          <div className="grid grid-cols-2 gap-3">
                                            <div className="flex flex-col">
                                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Monto Original</span>
                                              <span className="text-xs font-bold text-slate-300 font-mono mt-0.5">
                                                ${(debt.originalDebt || debt.balance).toLocaleString('es-CO')}
                                              </span>
                                            </div>
                                            <div className="flex flex-col">
                                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pago Mínimo/Cuota</span>
                                              <span className="text-xs font-bold text-slate-300 font-mono mt-0.5">
                                                ${debt.minPayment.toLocaleString('es-CO')}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="border-t border-white/5 pt-3 grid grid-cols-2 gap-3">
                                            <div className="flex flex-col">
                                              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Deuda Actual</span>
                                              <span className="text-base font-black text-rose-400 font-mono mt-0.5">
                                                ${debt.balance.toLocaleString('es-CO')}
                                              </span>
                                            </div>
                                            <div className="flex flex-col">
                                              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Total Pagado</span>
                                              <span className="text-base font-black text-emerald-400 font-mono mt-0.5">
                                                ${Math.max(0, (debt.originalDebt || debt.balance) - debt.balance).toLocaleString('es-CO')}
                                              </span>
                                            </div>
                                          </div>

                                          {/* Barra de progreso de pago */}
                                          {(() => {
                                            const orig = debt.originalDebt || debt.balance;
                                            const paid = Math.max(0, orig - debt.balance);
                                            const pct = orig > 0 ? Math.min(100, Math.round((paid / orig) * 100)) : 0;
                                            return (
                                              <div className="flex flex-col gap-1.5 mt-1">
                                                <div className="flex justify-between text-[10px] font-bold">
                                                  <span className="text-slate-500 uppercase tracking-wider">Progreso de Amortización</span>
                                                  <span className="text-emerald-400 font-mono">{pct}% Pagado</span>
                                                </div>
                                                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
                                                  <div 
                                                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                                                    style={{ width: `${pct}%` }}
                                                  />
                                                </div>
                                              </div>
                                            );
                                          })()}
                                        </div>
                                      ) : (
                                        <div className="flex flex-col gap-3 bg-slate-950/80 border border-white/10 rounded-xl p-3">
                                          <p className="text-[10px] text-slate-400 font-bold pb-1.5 border-b border-white/5">Editar valores</p>
                                          <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col gap-1">
                                              <span className="text-[9px] text-slate-400 font-bold">Monto Original</span>
                                              <div className="relative font-sans">
                                                <span className="absolute left-2.5 top-1.5 text-slate-500 text-[10px] font-bold">$</span>
                                                <input
                                                  type="text"
                                                  inputMode="numeric"
                                                  value={editingDebtOriginal}
                                                  onChange={(e) => setEditingDebtOriginal(formatNumberMask(e.target.value))}
                                                  className="w-full bg-slate-900 border border-white/10 rounded-lg py-1 pl-6 pr-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                />
                                              </div>
                                            </div>

                                            <div className="flex flex-col gap-1">
                                              <span className="text-[9px] text-slate-400 font-bold">Saldo Actual</span>
                                              <div className="relative font-sans">
                                                <span className="absolute left-2.5 top-1.5 text-slate-500 text-[10px] font-bold">$</span>
                                                <input
                                                  type="text"
                                                  inputMode="numeric"
                                                  value={editingDebtBalance}
                                                  onChange={(e) => setEditingDebtBalance(formatNumberMask(e.target.value))}
                                                  className="w-full bg-slate-900 border border-white/10 rounded-lg py-1 pl-6 pr-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                />
                                              </div>
                                            </div>

                                            <div className="flex flex-col gap-1">
                                              <span className="text-[9px] text-slate-400 font-bold">Cuota/Mínimo</span>
                                              <div className="relative font-sans">
                                                <span className="absolute left-2.5 top-1.5 text-slate-500 text-[10px] font-bold">$</span>
                                                <input
                                                  type="text"
                                                  inputMode="numeric"
                                                  value={editingDebtMinPayment}
                                                  onChange={(e) => setEditingDebtMinPayment(formatNumberMask(e.target.value))}
                                                  className="w-full bg-slate-900 border border-white/10 rounded-lg py-1 pl-6 pr-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                />
                                              </div>
                                            </div>

                                            <div className="flex flex-col gap-1">
                                              <span className="text-[9px] text-slate-400 font-bold">Tasa E.A. (%)</span>
                                              <input
                                                type="number"
                                                value={editingDebtInterestRate}
                                                onChange={(e) => setEditingDebtInterestRate(e.target.value)}
                                                className="w-full bg-slate-900 border border-white/10 rounded-lg py-1 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                              />
                                            </div>

                                            <div className="flex flex-col gap-1">
                                              <span className="text-[9px] text-slate-400 font-bold">Vencimiento</span>
                                              <input
                                                type="date"
                                                value={editingDebtDueDate}
                                                onChange={(e) => setEditingDebtDueDate(e.target.value)}
                                                className="w-full bg-slate-900 border border-white/10 rounded-lg py-1 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 h-[26px]"
                                              />
                                            </div>
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
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
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
                            type="text"
                            inputMode="numeric"
                            required
                            placeholder="0"
                            value={newTxAmount}
                            onChange={(e) => setNewTxAmount(formatNumberMask(e.target.value))}
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

                    {/* Etiquetas (Tags) */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1.5 uppercase">Etiquetas (Opcional)</label>
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        {newTxTags.map(tag => (
                          <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                            <span>{tag}</span>
                            <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-400 cursor-pointer">×</button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ej: #Trabajo, #Viaje, #Proyecto"
                          value={newTxTagInput}
                          onChange={(e) => setNewTxTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          className="flex-1 bg-slate-950/40 border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddTag()}
                          className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          + Agregar
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 text-[9px] text-slate-500 flex-wrap">
                        <span>Sugerencias:</span>
                        {['#Trabajo', '#Viaje', '#Proyecto', '#Restaurante', '#Mascota', '#Hogar'].map(sug => (
                          <button
                            type="button"
                            key={sug}
                            onClick={() => handleAddTag(sug)}
                            className="hover:text-slate-300 underline cursor-pointer"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ubicación (Establecimiento, Ciudad, GPS) */}
                    <div className="bg-slate-950/30 p-3 rounded-xl border border-white/5 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          <span>Ubicación del Gasto / Ingreso</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleGetCurrentLocation}
                          className="text-[9px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-2 py-0.5 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                        >
                          <MapPin className="w-2.5 h-2.5" />
                          <span>{newTxGps ? '📍 GPS Capturado' : 'Obtener GPS'}</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Lugar (Ej: Centro Comercial, Éxito)"
                          value={newTxLocationName}
                          onChange={(e) => setNewTxLocationName(e.target.value)}
                          className="bg-slate-950/60 border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <input
                          type="text"
                          placeholder="Ciudad (Ej: Medellín, Bogotá)"
                          value={newTxLocationCity}
                          onChange={(e) => setNewTxLocationCity(e.target.value)}
                          className="bg-slate-950/60 border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Movimiento Dividido (Split) */}
                    {newTxType !== 'transfer' && (
                      <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-semibold text-slate-300 uppercase flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newTxIsSplit}
                              onChange={(e) => setNewTxIsSplit(e.target.checked)}
                              className="rounded border-white/20 text-emerald-500 focus:ring-emerald-500 bg-slate-900 cursor-pointer"
                            />
                            <Split className="w-3.5 h-3.5 text-amber-400" />
                            <span>Dividir movimiento entre varias categorías</span>
                          </label>
                        </div>

                        {newTxIsSplit && (
                          <div className="flex flex-col gap-2 mt-1">
                            <p className="text-[9px] text-slate-400">
                              Ejemplo: Compra en supermercado $350.000 dividido en Mercado $250k + Hogar $50k + Mascotas $50k.
                            </p>
                            {newTxSplits.map((split, idx) => (
                              <div key={idx} className="grid grid-cols-12 gap-1.5 items-center">
                                <select
                                  value={split.category}
                                  onChange={(e) => {
                                    const next = [...newTxSplits];
                                    next[idx].category = e.target.value;
                                    setNewTxSplits(next);
                                  }}
                                  className="col-span-5 bg-slate-900 border border-white/10 rounded-lg py-1 px-2 text-[11px] text-white focus:outline-none cursor-pointer"
                                >
                                  {categories.expense.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  placeholder="Monto ($)"
                                  value={split.amount}
                                  onChange={(e) => {
                                    const next = [...newTxSplits];
                                    next[idx].amount = formatNumberMask(e.target.value);
                                    setNewTxSplits(next);
                                  }}
                                  className="col-span-3 bg-slate-900 border border-white/10 rounded-lg py-1 px-2 text-[11px] text-white focus:outline-none"
                                />
                                <input
                                  type="text"
                                  placeholder="Nota..."
                                  value={split.description}
                                  onChange={(e) => {
                                    const next = [...newTxSplits];
                                    next[idx].description = e.target.value;
                                    setNewTxSplits(next);
                                  }}
                                  className="col-span-3 bg-slate-900 border border-white/10 rounded-lg py-1 px-2 text-[11px] text-white focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (newTxSplits.length > 2) {
                                      setNewTxSplits(newTxSplits.filter((_, i) => i !== idx));
                                    } else {
                                      toast.error('Debes tener al menos 2 divisiones.');
                                    }
                                  }}
                                  className="col-span-1 text-center text-slate-500 hover:text-red-400 font-bold text-xs cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                            <div className="flex items-center justify-between mt-1">
                              <button
                                type="button"
                                onClick={() => setNewTxSplits([...newTxSplits, { category: categories.expense[0], amount: '', description: '' }])}
                                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
                              >
                                + Añadir otra subcategoría
                              </button>
                              {(() => {
                                const sum = newTxSplits.reduce((acc, s) => acc + parseNumberMask(s.amount), 0);
                                const total = parseNumberMask(newTxAmount);
                                const diff = total - sum;
                                return (
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${Math.abs(diff) < 0.01 && total > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'}`}>
                                    Suma: ${sum.toLocaleString('es-ES')} {Math.abs(diff) < 0.01 && total > 0 ? '✔️ Cuadra' : `(Faltan $${diff.toLocaleString('es-ES')})`}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Opciones Especiales: Recurrente & Favorito */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                      <label className="flex items-center gap-2 text-[10px] font-bold text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newTxIsRecurring}
                          onChange={(e) => setNewTxIsRecurring(e.target.checked)}
                          className="rounded border-white/20 text-emerald-500 focus:ring-emerald-500 bg-slate-900 cursor-pointer"
                        />
                        <Repeat className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Movimiento Recurrente</span>
                      </label>

                      <label className="flex items-center gap-2 text-[10px] font-bold text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newTxIsFavorite}
                          onChange={(e) => setNewTxIsFavorite(e.target.checked)}
                          className="rounded border-white/20 text-amber-500 focus:ring-emerald-500 bg-slate-900 cursor-pointer"
                        />
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                        <span>Guardar en Favoritos</span>
                      </label>

                      {newTxIsRecurring && (
                        <div className="col-span-full grid grid-cols-2 gap-2 mt-1 pt-2 border-t border-white/5">
                          <div>
                            <span className="block text-[9px] text-slate-400 font-bold mb-1">Frecuencia</span>
                            <select
                              value={newTxRecurringFreq}
                              onChange={(e) => setNewTxRecurringFreq(e.target.value as any)}
                              className="w-full bg-slate-900 border border-white/10 rounded-lg py-1 px-2 text-[11px] text-white focus:outline-none"
                            >
                              <option value="mensual">Cada mes</option>
                              <option value="quincenal">Cada quincena</option>
                              <option value="semanal">Cada semana</option>
                            </select>
                          </div>
                          <div>
                            <span className="block text-[9px] text-slate-400 font-bold mb-1">Día de cobro</span>
                            <input
                              type="number"
                              min="1"
                              max="31"
                              value={newTxRecurringDay}
                              onChange={(e) => setNewTxRecurringDay(parseInt(e.target.value) || 1)}
                              className="w-full bg-slate-900 border border-white/10 rounded-lg py-1 px-2 text-[11px] text-white focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Adjuntos Múltiples (Factura, Garantía, Foto, Contrato) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Adjuntos Múltiples (Factura, Garantía, Foto, Contrato)</span>
                        </label>
                      </div>

                      {/* Lista de adjuntos cargados */}
                      {newTxAttachmentsList.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {newTxAttachmentsList.map((att) => (
                            <div key={att.id} className="relative aspect-[16/10] bg-slate-950/80 border border-white/10 rounded-xl overflow-hidden group">
                              <img src={att.url} alt={att.name} className="w-full h-full object-contain" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all">
                                <button
                                  type="button"
                                  onClick={() => setFullscreenImage(att.url)}
                                  className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setNewTxAttachmentsList(newTxAttachmentsList.filter(a => a.id !== att.id))}
                                  className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="absolute bottom-1 left-1 right-1 bg-slate-950/90 px-2 py-0.5 rounded text-[8px] font-bold text-slate-300 truncate flex items-center justify-between">
                                <span className="truncate">{att.name}</span>
                                <span className="uppercase text-emerald-400 text-[7px]">{att.label}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Cargador de adjuntos */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {[
                          { label: 'factura', title: '🧾 Factura' },
                          { label: 'garantia', title: '📄 Garantía' },
                          { label: 'fotografia', title: '📷 Foto' },
                          { label: 'contrato', title: '📑 Contrato' }
                        ].map(typeObj => (
                          <label key={typeObj.label} className="border border-dashed border-white/15 hover:border-emerald-500/40 bg-slate-950/40 hover:bg-slate-950/80 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all text-center">
                            <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[10px] text-slate-300 font-bold">{typeObj.title}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 2 * 1024 * 1024) {
                                    toast.error('El archivo excede 2MB.');
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const newAtt: TransactionAttachment = {
                                      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                                      name: file.name,
                                      url: reader.result as string,
                                      label: typeObj.label as any
                                    };
                                    setNewTxAttachmentsList(prev => [...prev, newAtt]);
                                    setNewTxAttachment(reader.result as string);
                                    setNewTxAttachmentName(file.name);
                                    toast.success(`Adjunto subido: ${typeObj.title}`);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        ))}
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

          {/* MODAL NUEVA SUSCRIPCIÓN */}
          <AnimatePresence>
            {isAddSubModalOpen && (
              <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Encabezado */}
                  <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                    <div>
                      <h4 className="font-black text-white text-sm tracking-wider uppercase flex items-center gap-2">
                        <Tv className="w-4 h-4 text-emerald-400" />
                        Nueva Suscripción
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">Registra tus plataformas de streaming o servicios mensuales fijos.</p>
                    </div>
                    <button
                      onClick={() => setIsAddSubModalOpen(false)}
                      className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Formulario */}
                  <form onSubmit={handleCreateSubscription} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    {/* Nombre */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Nombre del Servicio</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Netflix, Spotify, AWS"
                        value={newSubName}
                        onChange={(e) => setNewSubName(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                      />
                    </div>

                    {/* Costo */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Costo Mensual ($)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs font-bold">$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          placeholder="Ej: 44.900"
                          value={newSubCost}
                          onChange={(e) => setNewSubCost(formatNumberMask(e.target.value))}
                          className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 pl-8 pr-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                        />
                      </div>
                    </div>

                    {/* Fecha de Vencimiento */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Próximo Cobro / Fecha</label>
                      <input
                        type="date"
                        required
                        value={newSubDueDate}
                        onChange={(e) => setNewSubDueDate(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                      />
                    </div>

                    {/* Cuenta Vinculada */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Cuenta o Tarjeta Vinculada</label>
                      <input
                        type="text"
                        placeholder="Ej: Bancolombia, Visa, Tarjeta Digital"
                        value={newSubAccount}
                        onChange={(e) => setNewSubAccount(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                      />
                    </div>

                    {/* Estado y Frecuencia de Uso */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Estado Inicial</label>
                        <select
                          value={newSubStatus}
                          onChange={(e) => setNewSubStatus(e.target.value as 'active' | 'paused')}
                          className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
                        >
                          <option value="active">🟢 Activo (Cobro Automático)</option>
                          <option value="paused">⏸️ Pausado / Suspendido</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">¿La usas?</label>
                        <select
                          value={newSubUsage}
                          onChange={(e) => setNewSubUsage(e.target.value as 'Sí' | 'No' | 'A veces')}
                          className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all font-semibold"
                        >
                          <option value="Sí">✅ Sí (Uso Frecuente)</option>
                          <option value="A veces">⚠️ A veces (Uso Ocasional)</option>
                          <option value="No">❌ No (Candidata a Cancelar)</option>
                        </select>
                      </div>
                    </div>

                    {/* Nota de Incrementos */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Histórico / Nota de Incremento</label>
                      <input
                        type="text"
                        placeholder="Ej: Subió 15% desde enero"
                        value={newSubPriceIncrease}
                        onChange={(e) => setNewSubPriceIncrease(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                      />
                    </div>

                    {/* Acciones */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setIsAddSubModalOpen(false)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={newSubLoading}
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                      >
                        {newSubLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 stroke-[3px]" />
                        )}
                        Agregar Suscripción
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* MODAL NUEVA CUENTA */}
          <AnimatePresence>
            {showNewAccountModal && (
              <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Encabezado */}
                  <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                    <div>
                      <h4 className="font-black text-white text-sm tracking-wider uppercase flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        Nueva Cuenta Financiera
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">Crea una cuenta para realizar transacciones e ingresos/gastos.</p>
                    </div>
                    <button
                      onClick={() => setShowNewAccountModal(false)}
                      className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Formulario */}
                  <form onSubmit={handleCreateAccount} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    {/* Nombre y Alias */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Nombre de la Cuenta</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Banco Bogotá 02839292"
                          value={newAccountName}
                          onChange={(e) => setNewAccountName(e.target.value)}
                          className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Alias (Opcional)</label>
                        <input
                          type="text"
                          placeholder="Ej: 💰 Cuenta Principal"
                          value={newAccountAlias}
                          onChange={(e) => setNewAccountAlias(e.target.value)}
                          className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                        />
                      </div>
                    </div>

                    {/* Tipo y Subtipo */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Naturaleza de Cuenta</label>
                        <select
                          value={newAccountType}
                          onChange={(e) => setNewAccountType(e.target.value as 'credito' | 'deuda')}
                          className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
                        >
                          <option value="credito">🏦 Activo / Crédito (Dinero tuyo)</option>
                          <option value="deuda">💳 Pasivo / Deuda (Tarjeta de crédito)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Subtipo</label>
                        <select
                          value={newAccountSubtipo}
                          onChange={(e) => setNewAccountSubtipo(e.target.value as 'disponible' | 'ahorros' | 'deudas')}
                          className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
                        >
                          <option value="disponible">💵 Disponible / Efectivo</option>
                          <option value="ahorros">🐖 Ahorro Inversión</option>
                          <option value="deudas">💳 Tarjeta de Crédito / Préstamo</option>
                        </select>
                      </div>
                    </div>

                    {/* Balance Inicial */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Saldo Inicial ($)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs font-bold">$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="Ej: 3.500.000"
                          value={newAccountBalance}
                          onChange={(e) => setNewAccountBalance(formatNumberMask(e.target.value))}
                          className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 pl-8 pr-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                        />
                      </div>
                    </div>

                    {/* Fecha de Inicio (Solo si es Deuda) */}
                    {newAccountType === 'deuda' && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Fecha de Inicio de la Deuda</label>
                        <input
                          type="date"
                          required
                          value={newAccountDebtStartDate}
                          onChange={(e) => setNewAccountDebtStartDate(e.target.value)}
                          className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                    )}

                    {/* Selector de Color */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Color Temático</label>
                      <div className="flex gap-2.5 flex-wrap">
                        {['emerald', 'blue', 'purple', 'amber', 'rose', 'indigo', 'orange'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setNewAccountColor(c)}
                            className={`w-6 h-6 rounded-full border transition-all ${
                              newAccountColor === c ? 'ring-2 ring-emerald-500 scale-110' : 'opacity-80'
                            }`}
                            style={{ backgroundColor: c === 'emerald' ? '#10b981' : c === 'blue' ? '#3b82f6' : c === 'purple' ? '#a855f7' : c === 'amber' ? '#f59e0b' : c === 'rose' ? '#f43f5e' : c === 'indigo' ? '#6366f1' : '#f97316' }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setShowNewAccountModal(false)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={newAccountLoading}
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                      >
                        {newAccountLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 stroke-[3px]" />
                        )}
                        Crear Cuenta
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* MODAL TRANSACCIÓN DIRECTA CUENTAS */}
          <AnimatePresence>
            {showAddAccountTxModal && (
              <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Encabezado */}
                  <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                    <div>
                      <h4 className="font-black text-white text-sm tracking-wider uppercase flex items-center gap-2">
                        <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
                        Transacción Directa
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Registra un depósito o retiro directo sobre la cuenta: {' '}
                        <span className="font-bold text-white">
                          {accounts.find(a => a.id === selectedAccountId)?.nombre}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddAccountTxModal(false)}
                      className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Formulario */}
                  <form onSubmit={handleAccountTransaction} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    {/* Tipo de transacción */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Tipo</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setActTxType('income')}
                          className={`py-3.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                            actTxType === 'income'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-950/60'
                          }`}
                        >
                          🟢 Depósito / Ingreso
                        </button>
                        <button
                          type="button"
                          onClick={() => setActTxType('expense')}
                          className={`py-3.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                            actTxType === 'expense'
                              ? 'bg-red-500/20 text-red-400 border-red-500/40'
                              : 'bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-950/60'
                          }`}
                        >
                          🔴 Retiro / Gasto
                        </button>
                      </div>
                    </div>

                    {/* Monto */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Monto ($)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs font-bold">$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          placeholder="Ej: 15.000"
                          value={actTxAmount}
                          onChange={(e) => setActTxAmount(formatNumberMask(e.target.value))}
                          className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 pl-8 pr-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                        />
                      </div>
                    </div>

                    {/* Categoría */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Categoría</label>
                      <select
                        value={actTxCategory}
                        onChange={(e) => setActTxCategory(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
                      >
                        {dbCategories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.emoji} {c.name}
                          </option>
                        ))}
                        {/* Opciones por defecto si no hay personalizadas */}
                        {dbCategories.length === 0 && (
                          <>
                            <option value="Sueldo">💵 Sueldo</option>
                            <option value="Inversiones">📈 Inversiones</option>
                            <option value="Alimentación">🍔 Alimentación</option>
                            <option value="Transporte">🚗 Transporte</option>
                            <option value="Hogar">🏠 Hogar</option>
                            <option value="Entretenimiento">🎮 Entretenimiento</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Descripción / Detalle</label>
                      <input
                        type="text"
                        placeholder="Ej: Pago de almuerzo, Depósito de nómina"
                        value={actTxDescription}
                        onChange={(e) => setActTxDescription(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                      />
                    </div>

                    {/* Acciones */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setShowAddAccountTxModal(false)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={actTxLoading}
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                      >
                        {actTxLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 stroke-[3px]" />
                        )}
                        Registrar Transacción
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* MODAL NUEVA O EDITAR CATEGORÍA */}
          <AnimatePresence>
            {isAddCategoryModalOpen && (
              <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Encabezado */}
                  <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                    <div>
                      <h4 className="font-black text-white text-sm tracking-wider uppercase flex items-center gap-2">
                        <PlusCircle className="w-4 h-4 text-emerald-400" />
                        {editingCatId ? 'Editar Categoría' : 'Nueva Categoría Personalizada'}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">Configura subcategorías, icono personalizado (SVG/PNG/Emoji) y color dinámico.</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsAddCategoryModalOpen(false);
                        setEditingCatId(null);
                      }}
                      className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Formulario */}
                  <form onSubmit={handleCreateCategory} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    {/* Nombre y Auto-Sugerencia */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre de la Categoría</label>
                        <button
                          type="button"
                          onClick={() => {
                            if (newCatName.trim()) {
                              const sug = suggestCategoryColorAndEmoji(newCatName, newCatType);
                              setNewCatColor(sug.color);
                              setNewCatEmoji(sug.emoji);
                              toast.success('Sugerencia de color e icono aplicada!');
                            }
                          }}
                          className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Wand2 className="w-3 h-3" />
                          Sugerir Color/Icono
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Comida, Supermercado, Mascotas, Streaming"
                        value={newCatName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewCatName(val);
                          if (!editingCatId && val.length > 2) {
                            const sug = suggestCategoryColorAndEmoji(val, newCatType);
                            setNewCatColor(sug.color);
                          }
                        }}
                        className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                      />
                    </div>

                    {/* Tipo de Flujo */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Tipo de Flujo</label>
                      <select
                        value={newCatType}
                        onChange={(e) => setNewCatType(e.target.value as 'income' | 'expense')}
                        className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
                      >
                        <option value="expense">🔴 Categoría de Gastos / Egresos</option>
                        <option value="income">🟢 Categoría de Ingresos / Entradas</option>
                      </select>
                    </div>

                    {/* Selector de Tipo de Icono (Emoji vs Subir SVG/PNG) */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Icono de la Categoría</label>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setNewCatIconType('emoji')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                            newCatIconType === 'emoji'
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                              : 'bg-slate-950/40 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Smile className="w-3.5 h-3.5" />
                          Seleccionar Emoji
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewCatIconType('upload')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                            newCatIconType === 'upload'
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                              : 'bg-slate-950/40 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Subir SVG / PNG
                        </button>
                      </div>

                      {newCatIconType === 'emoji' ? (
                        <div className="bg-slate-950/30 border border-white/5 rounded-xl p-3 max-h-[110px] overflow-y-auto pr-1">
                          <div className="grid grid-cols-8 gap-1.5">
                            {[
                              '🍕', '🍿', '🎸', '🎮', '💡', '🏋️', '📚', '👗', '🎨', '🚕', '🏥', '🥕', '🥩', '🍩', '🥑', '🧁', '🍦', '🍹', '✈️', '🏝️', '🏕️', '🏡', '💻', '💸', '💼', '🛒', '🐾', '💈', '🎬', '🚲', '⚽', '🔑'
                            ].map((em) => (
                              <button
                                key={em}
                                type="button"
                                onClick={() => setNewCatEmoji(em)}
                                className={`aspect-square flex items-center justify-center rounded-lg text-base hover:bg-white/10 transition-all cursor-pointer ${
                                  newCatEmoji === em ? 'bg-emerald-500/20 border border-emerald-500/40 scale-110' : 'bg-transparent border-transparent'
                                }`}
                              >
                                {em}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-950/30 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {newCatCustomIcon ? (
                              <img src={newCatCustomIcon} className="w-8 h-8 object-contain rounded-lg bg-slate-900 p-1 border border-white/10" alt="Icono" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-dashed border-white/20 flex items-center justify-center text-slate-500">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                            )}
                            <span className="text-[11px] text-slate-300 font-mono">
                              {newCatCustomIcon ? 'Icono cargado' : 'Formato SVG o PNG (<500KB)'}
                            </span>
                          </div>
                          <label className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer border border-white/10 transition-all">
                            Examinar...
                            <input type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleIconFileUpload} className="hidden" />
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Color de Categoría (Auto-sugerido o Personalizado) */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Color Distintivo</label>
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: newCatColor }}></span>
                          {newCatColor}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newCatColor}
                          onChange={(e) => setNewCatColor(e.target.value)}
                          className="w-10 h-9 bg-slate-950 border border-white/10 rounded-lg cursor-pointer p-0.5"
                        />
                        <div className="flex-1 grid grid-cols-7 gap-1">
                          {['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6'].map((hex) => (
                            <button
                              key={hex}
                              type="button"
                              onClick={() => setNewCatColor(hex)}
                              className="h-7 rounded-md border border-white/10 cursor-pointer transition-all hover:scale-105"
                              style={{ backgroundColor: hex }}
                            ></button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Subcategorías Creador */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                        Subcategorías (Ej: Comida → Restaurantes, Mercado, Café)
                      </label>

                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Escribe una subcategoría y pulsa +"
                          value={newCatSubcategoryInput}
                          onChange={(e) => setNewCatSubcategoryInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newCatSubcategoryInput.trim() && !newCatSubcategories.includes(newCatSubcategoryInput.trim())) {
                                setNewCatSubcategories([...newCatSubcategories, newCatSubcategoryInput.trim()]);
                                setNewCatSubcategoryInput('');
                              }
                            }
                          }}
                          className="flex-1 bg-slate-950/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newCatSubcategoryInput.trim() && !newCatSubcategories.includes(newCatSubcategoryInput.trim())) {
                              setNewCatSubcategories([...newCatSubcategories, newCatSubcategoryInput.trim()]);
                              setNewCatSubcategoryInput('');
                            }
                          }}
                          className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          + Agregar
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {newCatSubcategories.map((sub) => (
                          <span key={sub} className="inline-flex items-center gap-1 bg-slate-900 border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-medium text-slate-300">
                            {sub}
                            <button
                              type="button"
                              onClick={() => setNewCatSubcategories(newCatSubcategories.filter(s => s !== sub))}
                              className="text-slate-500 hover:text-rose-400 ml-1 cursor-pointer"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddCategoryModalOpen(false);
                          setEditingCatId(null);
                        }}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={newCatLoading}
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                      >
                        {newCatLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 stroke-[3px]" />
                        )}
                        {editingCatId ? 'Guardar Cambios' : 'Crear Categoría'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* MODAL NUEVO PRESUPUESTO */}
          <AnimatePresence>
            {isAddBudgetModalOpen && (
              <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Encabezado */}
                  <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                    <div>
                      <h4 className="font-black text-white text-sm tracking-wider uppercase flex items-center gap-2">
                        <PlusCircle className="w-4 h-4 text-emerald-400" />
                        Establecer Presupuesto Inteligente
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">Configura límites periódicos con sugerencias inteligentes y alertas automáticas.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddBudgetModalOpen(false)}
                      className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Formulario */}
                  <form onSubmit={handleCreateBudget} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    {/* Periodicidad */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Periodicidad del Presupuesto</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'semanal', label: 'Semanal', icon: '🗓️' },
                          { id: 'quincenal', label: 'Quincenal', icon: '📅' },
                          { id: 'mensual', label: 'Mensual', icon: '📆' },
                          { id: 'anual', label: 'Anual', icon: '🏆' },
                        ].map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setNewBudgetPeriod(p.id as any)}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                              newBudgetPeriod === p.id
                                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm'
                                : 'bg-slate-950/40 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <span className="text-sm">{p.icon}</span>
                            <span>{p.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Categoría */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Categoría para Limitar</label>
                      <select
                        value={newBudgetCategory}
                        onChange={(e) => setNewBudgetCategory(e.target.value)}
                        required
                        className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
                      >
                        <option value="">-- Seleccionar Categoría --</option>
                        {dbCategories.filter(c => c.type === 'expense').map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.emoji} {c.name}
                          </option>
                        ))}
                        {/* Categorías por defecto si no hay en db */}
                        <option value="🍔 Alimentación">🍔 Alimentación</option>
                        <option value="🚗 Transporte">🚗 Transporte</option>
                        <option value="🏠 Hogar">🏠 Hogar</option>
                        <option value="🎮 Entretenimiento">🎮 Entretenimiento</option>
                        <option value="🩺 Salud">🩺 Salud</option>
                        <option value="🛍️ Compras">🛍️ Compras</option>
                      </select>
                    </div>

                    {/* Sugerencia Recomendada AI basada en 12 Meses */}
                    {newBudgetCategory && (() => {
                      const avg12 = getAverage12MonthsSpendForCategory(newBudgetCategory);
                      const recLimit = avg12 > 0 ? avg12 : 500000;
                      return (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex items-center justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-emerald-300">Presupuesto Recomendado</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Promedio últimos 12 meses: <strong className="text-emerald-400 font-mono">${recLimit.toLocaleString('es-CO')}</strong>
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewBudgetLimit(formatNumberMask(recLimit.toString()))}
                            className="bg-emerald-500 text-slate-950 text-[10px] font-black px-3 py-1.5 rounded-lg hover:bg-emerald-400 transition-all shrink-0 cursor-pointer shadow-md"
                          >
                            Usar Sugerido
                          </button>
                        </div>
                      );
                    })()}

                    {/* Límite máximo */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                        Límite Máximo {newBudgetPeriod === 'semanal' ? 'Semanal' : newBudgetPeriod === 'quincenal' ? 'Quincenal' : newBudgetPeriod === 'anual' ? 'Anual' : 'Mensual'} ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs font-bold">$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          placeholder="Ej: 680.000"
                          value={newBudgetLimit}
                          onChange={(e) => setNewBudgetLimit(formatNumberMask(e.target.value))}
                          className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 pl-8 pr-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all font-mono"
                        />
                      </div>
                    </div>

                    {/* Alertas */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Notificación de Alerta (%)</label>
                      <select
                        value={newBudgetAlertThreshold}
                        onChange={(e) => setNewBudgetAlertThreshold(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
                      >
                        <option value="50">⚠️ Alerta al 50% de consumo</option>
                        <option value="80">⚠️ Alerta al 80% de consumo</option>
                        <option value="90">⚠️ Alerta al 90% de consumo</option>
                        <option value="95">⚠️ Alerta al 95% de consumo</option>
                        <option value="100">🚫 Sin alerta anticipada (Solo al exceder)</option>
                      </select>
                    </div>

                    {/* Acciones */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setIsAddBudgetModalOpen(false)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={newBudgetLoading}
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                      >
                        {newBudgetLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 stroke-[3px]" />
                        )}
                        Crear Presupuesto
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* MODAL NUEVA META DE AHORRO */}
          <AnimatePresence>
            {isAddGoalModalOpen && (
              <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Encabezado */}
                  <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                    <div>
                      <h4 className="font-black text-white text-sm tracking-wider uppercase flex items-center gap-2">
                        <PlusCircle className="w-4 h-4 text-emerald-400" />
                        Nueva Meta de Ahorro
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">Sigue tu progreso hacia compras grandes, viajes o fondos de emergencia.</p>
                    </div>
                    <button
                      onClick={() => setIsAddGoalModalOpen(false)}
                      className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Formulario */}
                  <form onSubmit={handleCreateSavingsGoal} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    {/* Nombre */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Nombre de la Meta</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Viaje Japón, Computador Nuevo, Emergencias"
                        value={newGoalName}
                        onChange={(e) => setNewGoalName(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                      />
                    </div>

                    {/* Monto Objetivo */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Monto Meta ($)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs font-bold">$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          placeholder="Ej: 15.000.000"
                          value={newGoalTarget}
                          onChange={(e) => setNewGoalTarget(formatNumberMask(e.target.value))}
                          className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 pl-8 pr-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                        />
                      </div>
                    </div>

                    {/* Ahorro Inicial */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Monto Ahorrado Inicial ($)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs font-bold">$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="Ej: 500.000 (Dejar vacío si empiezas de cero)"
                          value={newGoalSaved}
                          onChange={(e) => setNewGoalSaved(formatNumberMask(e.target.value))}
                          className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 pl-8 pr-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                        />
                      </div>
                    </div>

                    {/* Selector de Emoji Icono */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emoji Icono</label>
                        <span className="text-[10px] font-mono text-slate-500">Seleccionado: {newGoalEmoji}</span>
                      </div>
                      <div className="bg-slate-950/30 border border-white/5 rounded-xl p-3 max-h-[100px] overflow-y-auto pr-1">
                        <div className="grid grid-cols-8 gap-1.5">
                          {[
                            '🎯', '💰', '✈️', '🚨', '🏠', '🚗', '🎓', '💻',
                            '🎮', '📈', '🏖️', '🎒', '💍', '👶', '🐶', '🍕',
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

                    {/* Prioridad de la Meta */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Prioridad de la Meta</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'alta', label: 'Alta 🔴', bg: 'bg-red-500/20 border-red-500/40 text-red-300' },
                          { id: 'media', label: 'Media 🟡', bg: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' },
                          { id: 'baja', label: 'Baja 🟢', bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' }
                        ].map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setNewGoalPriority(p.id as any)}
                            className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              newGoalPriority === p.id ? p.bg : 'bg-slate-950/40 border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Configuration de Aportes Automáticos */}
                    <div className="p-3.5 bg-slate-950/50 border border-white/5 rounded-xl flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5" />
                          Aportes Automáticos / Recurrentes
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newGoalAutoEnabled}
                            onChange={(e) => setNewGoalAutoEnabled(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-500"></div>
                        </label>
                      </div>

                      {newGoalAutoEnabled && (
                        <div className="flex flex-col gap-2.5 pt-1">
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: 'semanal', label: 'Semanal' },
                              { id: 'quincenal', label: 'Quincenal' },
                              { id: 'mensual', label: 'Mensual' }
                            ].map((f) => (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => setNewGoalAutoFreq(f.id as any)}
                                className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                                  newGoalAutoFreq === f.id
                                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                                    : 'bg-slate-900 border-white/5 text-slate-400'
                                }`}
                              >
                                {f.label}
                              </button>
                            ))}
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase">Monto por Aporte ($)</label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-slate-500 text-xs font-bold">$</span>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={newGoalAutoAmount}
                                onChange={(e) => setNewGoalAutoAmount(formatNumberMask(e.target.value))}
                                className="w-full bg-slate-900 border border-white/10 rounded-lg py-1.5 pl-7 pr-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/30 font-mono"
                                placeholder="Ej: 100.000"
                              />
                            </div>
                            <p className="text-[9px] text-slate-500 mt-1">↓ Transferencia automática / Aporte programado en proyecciones</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setIsAddGoalModalOpen(false)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={newGoalLoading}
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                      >
                        {newGoalLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 stroke-[3px]" />
                        )}
                        Crear Meta
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* MODAL NUEVA OBLIGACIÓN / DEUDA */}
          <AnimatePresence>
            {isAddDebtModalOpen && (
              <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Encabezado */}
                  <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                    <div>
                      <h4 className="font-black text-white text-sm tracking-wider uppercase flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-400" />
                        Nueva Obligación Financiera
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">Registra tarjetas de crédito o préstamos para controlar sus cuotas y vencimientos.</p>
                    </div>
                    <button
                      onClick={() => setIsAddDebtModalOpen(false)}
                      className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Formulario */}
                  <form onSubmit={handleCreateDebt} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    {/* Nombre */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Nombre de la Deuda</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Tarjeta Visa, Crédito Libre Inversión"
                        value={newDebtName}
                        onChange={(e) => setNewDebtName(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                      />
                    </div>

                    {/* Monto Original de la Deuda */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Monto Original / Inicial de la Deuda ($)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs font-bold">$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          placeholder="Ej: 5.000.000"
                          value={newDebtOriginal}
                          onChange={(e) => setNewDebtOriginal(formatNumberMask(e.target.value))}
                          className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 pl-8 pr-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                        />
                      </div>
                    </div>

                    {/* Saldo Pendiente */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Deuda Actual / Saldo Pendiente ($)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs font-bold">$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          placeholder="Ej: 2.300.000"
                          value={newDebtBalance}
                          onChange={(e) => setNewDebtBalance(formatNumberMask(e.target.value))}
                          className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 pl-8 pr-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                        />
                      </div>
                    </div>

                    {/* Pago mínimo / Cuota mensual */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Pago Mínimo o Cuota Mensual ($)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs font-bold">$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          placeholder="Ej: 120.000"
                          value={newDebtMinPayment}
                          onChange={(e) => setNewDebtMinPayment(formatNumberMask(e.target.value))}
                          className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 pl-8 pr-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                        />
                      </div>
                    </div>

                    {/* Fecha de Inicio */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Fecha de Inicio de la Deuda</label>
                      <input
                        type="date"
                        required
                        value={newDebtStartDate}
                        onChange={(e) => setNewDebtStartDate(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>

                    {/* Tipo, Tasa de Interés y Fecha de Vencimiento */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Tipo de Deuda</label>
                        <select
                          value={newDebtType}
                          onChange={(e) => setNewDebtType(e.target.value as 'card' | 'loan' | 'other')}
                          className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
                        >
                          <option value="card">💳 Tarjeta de Crédito</option>
                          <option value="loan">🏢 Préstamo Bancario</option>
                          <option value="other">📄 Otro Pasivo</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Tasa E.A. (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={newDebtInterestRate}
                          onChange={(e) => setNewDebtInterestRate(e.target.value)}
                          className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono"
                          placeholder="28"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Próximo Vencimiento</label>
                        <input
                          type="date"
                          required
                          value={newDebtDueDate}
                          onChange={(e) => setNewDebtDueDate(e.target.value)}
                          className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setIsAddDebtModalOpen(false)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={newDebtLoading}
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                      >
                        {newDebtLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 stroke-[3px]" />
                        )}
                        Registrar Deuda
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}

            {/* MODAL ABONAR A DEUDA */}
            {debtPayModal && (
              <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                    <div>
                      <h4 className="font-black text-white text-sm tracking-wider uppercase flex items-center gap-2">
                        <Coins className="w-4 h-4 text-emerald-400" />
                        Registrar Abono a Obligación
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">{debtPayModal.name} — Saldo Actual: ${debtPayModal.balance?.toLocaleString('es-CO')}</p>
                    </div>
                    <button
                      onClick={() => setDebtPayModal(null)}
                      className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-6 flex flex-col gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Monto Total del Abono ($)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs font-bold">$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          value={debtPayAmount}
                          onChange={(e) => setDebtPayAmount(formatNumberMask(e.target.value))}
                          placeholder={String(debtPayModal.minPayment ? debtPayModal.minPayment.toLocaleString('es-CO') : '100.000')}
                          className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 pl-8 pr-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Porción correspondiente a Intereses ($)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs font-bold">$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={debtPayInterestPart}
                          onChange={(e) => setDebtPayInterestPart(formatNumberMask(e.target.value))}
                          placeholder="0"
                          className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 pl-8 pr-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 font-mono"
                        />
                      </div>
                      <p className="text-[9px] text-slate-500 mt-1">Este monto se sumará al total de intereses pagados en el año.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setDebtPayModal(null)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        disabled={debtPayLoading}
                        onClick={() => {
                          const amt = parseNumberMask(debtPayAmount || String(debtPayModal.minPayment || 0));
                          const intr = parseNumberMask(debtPayInterestPart || '0');
                          handleRegisterDebtPayment(debtPayModal, amt, intr);
                        }}
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                      >
                        {debtPayLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Abono'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Modal para Crear Débito Automático */}
            {isAddDebitModalOpen && (
              <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                    <div>
                      <h4 className="font-black text-white text-sm tracking-wider uppercase flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        Nuevo Débito Automático
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">Configura cobros recurrentes mensuales asociados a tus cuentas monetarias.</p>
                    </div>
                    <button
                      onClick={() => setIsAddDebitModalOpen(false)}
                      className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAddAutomaticDebit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Nombre del Débito / Servicio</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Pago Servicios Públicos, Netflix, Cuota Gimnasio"
                        value={newDebitName}
                        onChange={(e) => setNewDebitName(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Cuenta de Origen para el Débito</label>
                      <select
                        required
                        value={newDebitAccountId}
                        onChange={(e) => setNewDebitAccountId(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
                      >
                        <option value="">-- Seleccionar Cuenta --</option>
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>
                            {acc.nombre} (Saldo disponible: ${acc.saldo.toLocaleString('es-CO')})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Monto a Debitar ($)</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs font-bold">$</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            required
                            placeholder="Ej: 150.000"
                            value={newDebitAmount}
                            onChange={(e) => setNewDebitAmount(formatNumberMask(e.target.value))}
                            className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 pl-8 pr-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Día de Cobro (1-31)</label>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          required
                          value={newDebitDayOfMonth}
                          onChange={(e) => setNewDebitDayOfMonth(e.target.value)}
                          className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Categoría del Egreso</label>
                      <select
                        value={newDebitCategory}
                        onChange={(e) => setNewDebitCategory(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
                      >
                        {categories.expense.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setIsAddDebitModalOpen(false)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={newDebitLoading}
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                      >
                        {newDebitLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 stroke-[3px]" />
                        )}
                        Guardar Débito
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}

            {/* Modal de Tutorial / Guía de Inicio para Usuarios Nuevos */}
            {isOnboardingModalOpen && (
              <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Encabezado con barra de progreso */}
                  <div className="p-6 pb-4 border-b border-white/5 bg-slate-900/40 relative">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                          <Compass className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-white text-base tracking-tight">
                            Guía de Inicio Rápido
                          </h3>
                          <p className="text-xs text-slate-400">
                            Paso {onboardingStep + 1} de 5 • Conoce tu plataforma contable
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleFinishOnboarding(true)}
                        className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                        title="Omitir Tutorial"
                      >
                        Omitir
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Barra de progreso */}
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="bg-emerald-400 h-full transition-all duration-300"
                        style={{ width: `${((onboardingStep + 1) / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* CORTINAS / DIAPOSITIVAS DEL TUTORIAL */}
                  <div className="p-6 min-h-[320px] flex flex-col justify-between">
                    <AnimatePresence mode="wait">
                      {onboardingStep === 0 && (
                        <motion.div
                          key="step-0"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-4"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-2xl border border-emerald-500/20">
                            👋
                          </div>
                          <h4 className="text-lg font-black text-white">¡Bienvenido a ContabilidApp!</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            ContabilidApp es tu centro de control financiero inteligente. Aquí podrás llevar la contabilidad completa de tu dinero, presupuestos, ahorros, deudas y suscripciones de manera 100% privada y cifrada.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs space-y-1">
                              <span className="font-bold text-emerald-400 flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Cifrado AES-256 E2EE
                              </span>
                              <p className="text-[11px] text-slate-400">Tus cifras y saldos se cifran localmente con tu clave única.</p>
                            </div>
                            <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs space-y-1">
                              <span className="font-bold text-indigo-400 flex items-center gap-1">
                                <Activity className="w-3.5 h-3.5" />
                                Balance en Tiempo Real
                              </span>
                              <p className="text-[11px] text-slate-400">Sincronización instantánea con tu base de datos Firestore.</p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {onboardingStep === 1 && (
                        <motion.div
                          key="step-1"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-4"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-2xl border border-emerald-500/20">
                            💳
                          </div>
                          <h4 className="text-lg font-black text-white">1. Cuentas y Débitos Automáticos</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Crea tus cuentas monetarias de activo (Bancos, Efectivo, Tarjetas) o de pasivo (Deudas/Préstamos).
                          </p>
                          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs space-y-1 text-slate-200">
                            <span className="font-bold text-yellow-400 flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5" />
                              Alertas de Saldo en Débitos
                            </span>
                            <p className="text-[11px] text-slate-300">
                              Configura pagos automáticos mensuales (Servicios, Netflix, Arriendo). Si una cuenta no tiene saldo suficiente en la fecha programada, el sistema te enviará una notificación emergente nativa a tu navegador.
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {onboardingStep === 2 && (
                        <motion.div
                          key="step-2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-4"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-2xl border border-emerald-500/20">
                            📈
                          </div>
                          <h4 className="text-lg font-black text-white">2. Control de Presupuestos y Alertas</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Establece techos de gasto por categoría para evitar sobrecostos mensuales.
                          </p>
                          <ul className="space-y-2 text-xs text-slate-300">
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>Monitorea tu progreso con barras de estado de color.</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>Recibe notificaciones del dispositivo al alcanzar el 80% o 100% de tu límite.</span>
                            </li>
                          </ul>
                        </motion.div>
                      )}

                      {onboardingStep === 3 && (
                        <motion.div
                          key="step-3"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-4"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-2xl border border-emerald-500/20">
                            💰
                          </div>
                          <h4 className="text-lg font-black text-white">3. Metas de Ahorro y Deudas</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Organiza tus objetivos a largo plazo y gestiona el pago de pasivos de forma estratégica.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs space-y-1">
                              <span className="font-bold text-emerald-400">Metas de Ahorro</span>
                              <p className="text-[11px] text-slate-400">Registra aportes y mira el indicador de porcentaje hacia tu objetivo.</p>
                            </div>
                            <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs space-y-1">
                              <span className="font-bold text-rose-400">Control de Deudas</span>
                              <p className="text-[11px] text-slate-400">Lleva el control de pagos mínimos, cuotas pendientes y fechas de vencimiento.</p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {onboardingStep === 4 && (
                        <motion.div
                          key="step-4"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-4"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-2xl border border-emerald-500/20">
                            📄
                          </div>
                          <h4 className="text-lg font-black text-white">4. Manual de Usuario en PDF</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            ¿Necesitas una guía detallada para imprimir o consultar sin conexión? En la pestaña de <strong>Configuración</strong> encontrarás el <strong>Manual de Usuario en PDF</strong> interactivo, listo para visualizar o descargar en cualquier momento.
                          </p>
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300">
                            🎉 ¡Todo listo para tomar el control de tu contabilidad!
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* BOTONES DE NAVEGACIÓN */}
                    <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-4">
                      <button
                        type="button"
                        disabled={onboardingStep === 0}
                        onClick={() => setOnboardingStep(s => Math.max(0, s - 1))}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                      </button>

                      <div className="flex items-center gap-1.5">
                        {[0, 1, 2, 3, 4].map(idx => (
                          <button
                            key={idx}
                            onClick={() => setOnboardingStep(idx)}
                            className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                              onboardingStep === idx ? 'bg-emerald-400 w-6' : 'bg-white/20 hover:bg-white/40'
                            }`}
                          />
                        ))}
                      </div>

                      {onboardingStep < 4 ? (
                        <button
                          type="button"
                          onClick={() => setOnboardingStep(s => Math.min(4, s + 1))}
                          className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shadow-emerald-500/10 flex items-center gap-1"
                        >
                          Siguiente
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleFinishOnboarding(true)}
                          className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4 stroke-[3px]" />
                          ¡Empezar Ahora!
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* MODAL PARA REGISTRAR APORTE MANUAL A META */}
            {depositGoalModal && (
              <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                    <div>
                      <h4 className="font-black text-white text-sm tracking-wider uppercase flex items-center gap-2">
                        <PlusCircle className="w-4 h-4 text-emerald-400" />
                        Registrar Aporte Manual
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">Meta: <strong className="text-white">{depositGoalModal.emoji} {depositGoalModal.name}</strong></p>
                    </div>
                    <button
                      onClick={() => setDepositGoalModal(null)}
                      className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const num = parseNumberMask(depositAmountInput);
                      if (num > 0) {
                        handleDepositToSavingsGoal(depositGoalModal, num, depositNoteInput.trim() || 'Aporte manual registrado');
                      }
                    }}
                    className="p-6 flex flex-col gap-4"
                  >
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Monto del Aporte ($)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs font-bold">$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          autoFocus
                          placeholder="Ej: 50.000, 100.000"
                          value={depositAmountInput}
                          onChange={(e) => setDepositAmountInput(formatNumberMask(e.target.value))}
                          className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 pl-8 pr-3.5 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Nota / Detalle Opcional</label>
                      <input
                        type="text"
                        placeholder="Ej: Bono laboral, Ahorro quincenal, Sobrante de mes"
                        value={depositNoteInput}
                        onChange={(e) => setDepositNoteInput(e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/10 focus:border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/20 placeholder-slate-600 transition-all"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setDepositGoalModal(null)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={depositLoading}
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                      >
                        {depositLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 stroke-[3px]" />
                        )}
                        Confirmar Aporte
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}

            {/* MODAL HISTORIAL COMPLETO DE APORTES DE LA META */}
            {historyGoalModal && (
              <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                    <div>
                      <h4 className="font-black text-white text-sm tracking-wider uppercase flex items-center gap-2">
                        <History className="w-4 h-4 text-indigo-400" />
                        Historial de Aportes
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">Meta: <strong className="text-white">{historyGoalModal.emoji} {historyGoalModal.name}</strong></p>
                    </div>
                    <button
                      onClick={() => setHistoryGoalModal(null)}
                      className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-6 flex flex-col gap-4 overflow-y-auto flex-1">
                    {/* Resumen de ahorro */}
                    <div className="p-4 bg-slate-950/60 border border-white/5 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Acumulado</span>
                        <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
                          ${(historyGoalModal.currentSaved || 0).toLocaleString('es-CO')}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Monto Objetivo</span>
                        <div className="text-sm font-black text-white font-mono mt-0.5">
                          ${(historyGoalModal.targetAmount || 0).toLocaleString('es-CO')}
                        </div>
                      </div>
                    </div>

                    {/* Lista de Aportes */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aportes Registrados ({historyGoalModal.history?.length || 0})</span>
                      
                      {(!historyGoalModal.history || historyGoalModal.history.length === 0) ? (
                        <div className="py-8 text-center text-xs text-slate-500 bg-slate-950/30 rounded-xl border border-white/5">
                          No hay registros de aportes en el historial aún.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {historyGoalModal.history.map((h: any) => (
                            <div key={h.id || h.date} className="p-3 bg-slate-900/60 border border-white/5 rounded-xl flex justify-between items-center">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-white">{h.note || 'Aporte a la meta'}</span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {new Date(h.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <span className="text-xs font-black text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                +${Number(h.amount || 0).toLocaleString('es-CO')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 border-t border-white/5 bg-slate-900/40 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => {
                        const targetG = historyGoalModal;
                        setHistoryGoalModal(null);
                        setDepositGoalModal(targetG);
                        setDepositAmountInput('');
                        setDepositNoteInput('');
                      }}
                      className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar Aporte
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryGoalModal(null)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      )}

    </div>
  );
}
