// ===============================================
// OMEGA Finance Dashboard — Type Definitions
// ===============================================

export type DebtItem = {
  id: string;
  name: string;
  amount: number;
  type: 'card' | 'app';
  order: number;
};

export type GastosConfig = {
  expensas: number;
  movistarMovil: number;
  movistarWifi: number;
  readonly fijosExtras: number;
};

export type InitialData = {
  sueldo: number;
  ahorro: number;
  deudas: DebtItem[];
  gastos: GastosConfig;
};

export type FinancialConstants = {
  TEM_DEBT: number;
  TNA_SAVINGS: number;
  IVA: number;
  SELLOS: number;
  IIBB: number;
};

// --- MercadoPago Parsed Data ---

export type MPTransaction = {
  fecha: string;
  descripcion: string;
  monto: number;
  cuotaActual: number;
  totalCuotas: number;
  categoria: string;
};

export type MPCategoria = {
  id: string;
  label: string;
  icon: string;
  total: number;
  items: number;
  tipo: 'necesario' | 'obligatorio' | 'discrecional' | 'variable' | 'ingreso';
};

export type MPCuotaPendiente = {
  destino: string;
  cuotaMensual: number;
  restantes: number;
};

export type MPParsedData = {
  periodo: string;
  vencimiento?: string;
  transacciones: MPTransaction[];
  categorias: MPCategoria[];
  cuotasPendientes: MPCuotaPendiente[];
  totalResumen: number;
};

// --- Projection Engine ---

export type SavingsRescue = {
  active: boolean;
  visa: number;
  master: number;
};

export type SalaryAllocation = {
  visa: number;
  master: number;
};

export type ProjectionMonth = {
  monthId: number;
  monthStr: string;
  bankDebtStart: number;
  debtBreakdown: DebtItem[];
  requiredMinimums: Record<string, number>;
  injection: number;
  interest: number;
  minPayment: number;
  bankPaid: number;
  savingsYield: number;
  bankDebtEnd: number;
  selfDebt: number;
  savingsEnd: number;
  livingCashFlow: number;
  gastosFijosTotales: number;
  mercadoPagoGasto: number;
};

export type ProjectionResult = {
  months: ProjectionMonth[];
  totalInterestPaid: number;
  totalYieldEarned: number;
  currentSelfDebt: number;
  finalBankDebt: number;
  finalSavings: number;
  monthsToGoal: number | null;
  comparison: StrategyComparison;
};

export type StrategyComparison = {
  interestSaved: number;
  monthsFaster: number;
  netWealthDiff: number;
  isOptimal: boolean;
};

export type SimMonth = {
  month: number;
  label: string;
  savings: number;
  debt: number;
  interestCharged: number;
  yieldEarned: number;
  netWorth: number;
  salaryToDebt: number;
  salaryToSavings: number;
  cushion: number;
};

export type SimResult = {
  months: SimMonth[];
  totalInterest: number;
  totalYield: number;
  monthsTo5M: number;
};

// --- Insight Popups ---

export type InsightType = 'info' | 'warning' | 'success';

export type InsightMessage = {
  id: string;
  type: InsightType;
  title: string;
  message: string;
  duration?: number;
};

// --- App State ---

export type AppState = {
  activeView: string;
  savingsRescue: SavingsRescue[];
  mercadoPagoGastos: number[];
  salaryAllocations: SalaryAllocation[];
  autoReconstruct: boolean;
  mpData: MPParsedData | null;
};
