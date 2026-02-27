"use client";

import { useState, useMemo } from 'react';
import { 
    LayoutDashboard, 
    WalletCards,
    ArrowRightLeft,
    PieChart,
    Settings,
    HelpCircle,
    Info,
    TrendingDown,
    Activity,
    Landmark,
    CreditCard,
    Smartphone,
    TrendingUp,
    ShieldAlert,
    Clock,
    Target,
    Menu,
    X
} from 'lucide-react';

const INITIAL_DATA = {
  sueldo: 800000,
  ahorro: 4909900,
  deudas: [
      { id: 'visa', name: 'Visa Gold', amount: 1243086.57, type: 'card', order: 2 },
      { id: 'master', name: 'Mastercard Gold', amount: 1466525.12, type: 'card', order: 3 }
  ],
  gastos: {
      expensas: 45000,
      fijosExtras: 23597
  }
};

const CONSTANTS = {
  TEM_DEBT: 0.0709, 
  TNA_SAVINGS: 0.263, 
  IVA: 0.21,
  SELLOS: 0.012,
  IIBB: 0.02
};

const TEM_SAVINGS = CONSTANTS.TNA_SAVINGS / 12;

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(Math.round(val));

const Tooltip = ({ children, content }: { children: React.ReactNode, content: string | React.ReactNode }) => (
    <div className="relative inline-flex items-center tooltip-trigger cursor-help group/tooltip">
        {children}
        <div className="tooltip-content absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-card-bg-light border border-white/10 rounded-xl text-xs text-text-secondary shadow-xl z-50 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity">
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-card-bg-light"></div>
        </div>
    </div>
);

// --- Sub-Views Components ---

const MisSaldosView = ({ pureInterestStart }: { pureInterestStart: number }) => {
    const totalDebt = INITIAL_DATA.deudas.reduce((acc, d) => acc + d.amount, 0);

    return (
        <div className="space-y-6 fade-in h-full flex flex-col">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-2"><WalletCards size={20} className="text-accent-blue" /> Fotografía Financiera (Día 0)</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Assets (Activos) */}
                <div className="dashboard-card p-6 border-l-4 border-l-accent-mint flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-sm text-text-secondary uppercase tracking-wider font-semibold">Tus Activos (Fondo Líquido)</h3>
                                <div className="text-4xl font-bold text-white mt-1">{formatCurrency(INITIAL_DATA.ahorro)}</div>
                            </div>
                            <div className="bg-accent-mint/10 text-accent-mint px-3 py-1 rounded-full text-xs font-bold border border-accent-mint/20">
                                Rendimiento: {CONSTANTS.TNA_SAVINGS * 100}% TNA
                            </div>
                        </div>
                        <p className="text-xs text-text-tertiary border-b border-white/5 pb-4 mb-4">
                            Capital actualmente invertido autogenerando rendimiento mensual previo al pago de cualquier obligación o inyección de capital en el plan de rescate.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-card-bg-light p-3 rounded-xl border border-white/5">
                            <p className="text-[10px] text-text-secondary mb-1">Ganancia x Día Estimada</p>
                            <p className="text-lg font-semibold text-accent-mint">+{formatCurrency((INITIAL_DATA.ahorro * TEM_SAVINGS) / 30)}</p>
                        </div>
                        <div className="bg-card-bg-light p-3 rounded-xl border border-white/5">
                            <p className="text-[10px] text-text-secondary mb-1">Rendimiento Base (Mes)</p>
                            <p className="text-lg font-semibold text-accent-mint">+{formatCurrency(INITIAL_DATA.ahorro * TEM_SAVINGS)}</p>
                        </div>
                    </div>
                </div>

                {/* Liabilities Summary */}
                <div className="dashboard-card p-6 border-l-4 border-l-accent-salmon flex flex-col justify-between">
                     <div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-sm text-text-secondary uppercase tracking-wider font-semibold">Tus Pasivos (Deuda Total)</h3>
                                <div className="text-4xl font-bold text-white mt-1">{formatCurrency(totalDebt)}</div>
                            </div>
                            <div className="bg-accent-salmon/10 text-accent-salmon px-3 py-1 rounded-full text-xs font-bold border border-accent-salmon/20 flex items-center gap-1">
                                <Activity size={12}/> Interés Promedio: {CONSTANTS.TEM_DEBT * 100}% TEM
                            </div>
                        </div>
                        <p className="text-xs text-text-tertiary border-b border-white/5 pb-4 mb-4 flex items-center gap-1">
                           <ShieldAlert size={14} className="text-accent-yellow"/> Esta deuda genera una fuga tributaria + interés puro de <strong className="text-accent-salmon">{formatCurrency(pureInterestStart)}</strong> mensuales.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-card-bg-light h-2 rounded-full overflow-hidden flex">
                            {INITIAL_DATA.deudas.map((d, i) => (
                                <div key={i} style={{width: `${(d.amount/totalDebt)*100}%`}} className={`h-full border-r border-dashboard-bg ${d.type === 'app' ? 'bg-accent-blue' : 'bg-red-400'}`}></div>
                            ))}
                        </div>
                        <span className="text-xs text-text-secondary">Tres (3) Entidades</span>
                    </div>
                </div>
            </div>

            <h3 className="text-sm uppercase tracking-wider font-semibold text-text-secondary mt-4">Detalle de Obligaciones</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 pb-4">
                {INITIAL_DATA.deudas.map(debt => {
                    const baseInt = debt.amount * CONSTANTS.TEM_DEBT;
                    const iva = baseInt * CONSTANTS.IVA;
                    const iibb = debt.amount * CONSTANTS.IIBB;
                    const subtotal = baseInt + iva + iibb;
                    const sellos = (debt.amount + subtotal) * CONSTANTS.SELLOS;
                    const pureLoss = baseInt + iva + iibb + sellos;

                    return (
                        <div key={debt.id} className="dashboard-card-light p-5 relative overflow-hidden group">
                            <div className={`absolute top-0 left-0 w-1 h-full ${debt.type === 'app' ? 'bg-accent-blue' : 'bg-red-400'}`}></div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-2 text-white">
                                    {debt.type === 'app' ? <Smartphone size={18} className="text-accent-blue" /> : <CreditCard size={18} className="text-red-400" />}
                                    <span className="font-semibold">{debt.name}</span>
                                </div>
                                <span className="text-[10px] bg-dashboard-bg px-2 py-1 rounded text-text-tertiary">#ORDEN_{debt.order}</span>
                            </div>
                            <div className="text-2xl font-bold mb-1">{formatCurrency(debt.amount)}</div>
                            
                            <div className="mt-6 space-y-2 text-xs border-t border-white/5 pt-4">
                                <div className="flex justify-between">
                                    <span className="text-text-tertiary">Interés (TEM 7.09%)</span>
                                    <span className="text-accent-salmon">+{formatCurrency(baseInt)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-tertiary">IVA s/int. + Sellos + IIBB</span>
                                    <span className="text-accent-salmon">+{formatCurrency(iva + sellos + iibb)}</span>
                                </div>
                                <div className="flex justify-between font-semibold border-t border-white/5 pt-2 mt-2">
                                    <span className="text-text-secondary">Pérdida Pura C/Mes</span>
                                    <span className="text-accent-salmon">-{formatCurrency(pureLoss)}</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

const FlujoMensualView = ({ projectionData }: { projectionData: any }) => {
    const month0 = projectionData.months[0]; // Marzo 2026 data
    const totalSueldo = INITIAL_DATA.sueldo;
    const isCrisis = month0.livingCashFlow < 0;
    
    // We now use the calculated snapshot of the month's total fixed expenses
    const currentFixedExps = month0.gastosFijosTotales;

    return (
        <div className="space-y-6 fade-in h-full flex flex-col">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-2"><ArrowRightLeft size={20} className="text-accent-mint" /> Trazabilidad de Sueldo (Mes Actual)</h2>
            
            <div className="dashboard-card p-6 flex flex-col lg:flex-row items-center gap-8">
                <div className="relative w-48 h-48 shrink-0 flex items-center justify-center rounded-full border-8 border-card-bg-light">
                    {/* SVG Pie Chart Simulation via Conic Gradient */}
                    <div className="absolute inset-0 rounded-full" 
                         style={{
                             background: `conic-gradient(
                                #93C5FD 0% ${(month0.bankPaid / totalSueldo)*100}%, 
                                transparent ${(month0.bankPaid / totalSueldo)*100}% 100%)`
                         }}></div>
                     <div className="absolute inset-0 rounded-full" 
                         style={{
                             background: `conic-gradient(
                                transparent 0% ${(month0.bankPaid / totalSueldo)*100}%,
                                #A7F3D0 ${(month0.bankPaid / totalSueldo)*100}% ${((month0.bankPaid + currentFixedExps) / totalSueldo)*100}%,
                                transparent ${((month0.bankPaid + currentFixedExps) / totalSueldo)*100}% 100%)`
                         }}></div>
                    <div className="absolute inset-0 rounded-full" 
                         style={{
                             background: `conic-gradient(
                                transparent 0% ${((month0.bankPaid + currentFixedExps) / totalSueldo)*100}%,
                                ${isCrisis ? '#FECACA' : '#FEF08A'} ${((month0.bankPaid + currentFixedExps) / totalSueldo)*100}% 100%)`
                         }}></div>
                    
                    {/* Inner hole */}
                    <div className="absolute inset-3 bg-card-bg rounded-full flex flex-col items-center justify-center">
                        <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest">Ingreso</span>
                        <span className="text-xl font-bold text-white">{formatCurrency(totalSueldo)}</span>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                     <div className="dashboard-card-light p-4 border-l-2 border-l-accent-blue">
                        <h4 className="text-xs text-text-secondary flex justify-between items-center mb-1">
                            Acreedores (Deuda) <span className="font-bold">{((month0.bankPaid / totalSueldo)*100).toFixed(0)}%</span>
                        </h4>
                        <div className="text-xl font-bold text-accent-blue">{formatCurrency(month0.bankPaid)}</div>
                        <p className="text-[10px] text-text-tertiary mt-2">Monto del sueldo absorbido por las tarjetas de crédito para cubrir intereses y capital este mes.</p>
                     </div>
                     <div className="dashboard-card-light p-4 border-l-2 border-l-accent-mint">
                        <h4 className="text-xs text-text-secondary flex justify-between items-center mb-1">
                            Obligación Vida Fija <span className="font-bold">{((currentFixedExps / totalSueldo)*100).toFixed(0)}%</span>
                        </h4>
                        <div className="text-xl font-bold text-accent-mint">{formatCurrency(currentFixedExps)}</div>
                        <p className="text-[10px] text-text-tertiary mt-2">Presupuesto en App MP y Vida (MP Estimado: {formatCurrency(month0.mercadoPagoGasto)}, Fijos: {formatCurrency(INITIAL_DATA.gastos.expensas + INITIAL_DATA.gastos.fijosExtras)}).</p>
                     </div>
                     <div className={`dashboard-card-light p-4 border-l-2 md:col-span-2 ${isCrisis ? 'border-l-accent-salmon' : 'border-l-accent-yellow'}`}>
                        <h4 className="text-xs text-text-secondary flex justify-between items-center mb-1">
                            Líquido Restante / Sobrante <span className="font-bold">{((Math.max(0, month0.livingCashFlow) / totalSueldo)*100).toFixed(0)}%</span>
                        </h4>
                        <div className={`text-2xl font-bold ${isCrisis ? 'text-accent-salmon' : 'text-accent-mint'}`}>{formatCurrency(month0.livingCashFlow)}</div>
                        <p className={`text-[9px] mt-2 ${isCrisis ? 'text-accent-salmon/80' : 'text-text-tertiary'}`}>
                            {isCrisis 
                                ? `PELIGRO: El sueldo no alcanza para la estrategia. Vas a tener que rescatar obligatoriamente ${formatCurrency(Math.abs(month0.livingCashFlow))} de tus ahorros este mes solo para sobrevivir financieramente.` 
                                : `Este dinero te queda libre en el día a día para moverte tranquilamente, o la app asume que se re-invierte en el fondo final.`}
                        </p>
                     </div>
                </div>
            </div>

             <div className="dashboard-card p-6 flex-1">
                <h3 className="text-sm font-semibold mb-4 text-text-secondary">Estrategia Operativa Sugerida</h3>
                <ul className="space-y-4 text-xs text-text-secondary">
                    <li className="flex gap-3">
                        <Clock className="text-accent-blue shrink-0 mt-0.5" size={14} />
                        <div><strong className="text-white block">Posponer Consumo No Vital (Ganar 40 Días)</strong>
                        Si necesitás hacer un gasto extra ("Líquido Restante" es chico), metelo en la tarjeta de crédito 1 día después de la fecha de cierre. Eso te da hasta el mes próximo a tasa cero, mientras tus pesos reales rinden 2.1% en tu Ahorro.</div>
                    </li>
                    <li className="flex gap-3">
                        <Target className="text-accent-mint shrink-0 mt-0.5" size={14} />
                        <div><strong className="text-white block">Objetivo: Nunca pagar el Mínimo real</strong>
                        Pagar el mínimo significa que un gran porcentaje del bloque azul de tu sueldo (Acreedores) se va en humo (taxes/sellos) y no reduce casi nada del capital pasivo.</div>
                    </li>
                </ul>
            </div>
        </div>
    );
};

const ProyeccionesView = ({ projectionData }: { projectionData: { months: { monthStr: string, savingsEnd: number, bankDebtEnd: number }[] } }) => {
    // Determine scale bounds
    const maxAhorro = Math.max(5000000, ...projectionData.months.map((m: { savingsEnd: number }) => m.savingsEnd));
    const maxDeuda = Math.max(INITIAL_DATA.deudas.reduce((acc, d) => acc+d.amount,0), ...projectionData.months.map((m: { bankDebtEnd: number }) => m.bankDebtEnd));
    const upperLimit = Math.max(maxAhorro, maxDeuda);

    return (
        <div className="space-y-6 fade-in h-max flex flex-col">
             <h2 className="text-xl font-bold flex items-center gap-2 mb-2"><PieChart size={20} className="text-accent-yellow" /> Trayectoria hacia Junio 2026</h2>
             <p className="text-xs text-text-secondary mb-4">Gráfico de convergencia del plan diseñado. Las deudas deben desplomarse hacia la marca inferior mientras que el patrimonio líquido se recompone.</p>

             <div className="dashboard-card p-6 flex flex-col pt-12">
                 <div className="flex justify-between items-end h-[350px] lg:h-[400px] mb-8 relative border-b border-l border-white/10 pb-4 pl-4">
                     {/* Y-Axis Markers */}
                     <div className="absolute left-[-40px] top-0 text-[9px] text-text-tertiary">5M</div>
                     <div className="absolute left-[-40px] top-1/4 text-[9px] text-text-tertiary border-t border-white/5 w-full"></div>
                     <div className="absolute left-[-40px] top-2/4 text-[9px] text-text-tertiary border-t border-white/5 w-full">2.5M</div>
                     <div className="absolute left-[-40px] top-3/4 text-[9px] text-text-tertiary border-t border-white/5 w-full"></div>

                     {/* X-Axis Data Bars */}
                     {[ {monthStr: 'Día 0 (Hoy)', savingsEnd: INITIAL_DATA.ahorro, bankDebtEnd: INITIAL_DATA.deudas.reduce((acc, d) => acc+d.amount,0) }, ...projectionData.months].map((m: { monthStr: string, savingsEnd: number, bankDebtEnd: number }, idx: number) => {
                         const savingsHeight = (m.savingsEnd / upperLimit) * 100;
                         const debtHeight = (m.bankDebtEnd / upperLimit) * 100;
                         
                         return (
                             <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                                 {/* Tooltip on hover */}
                                 <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-card-bg-light border border-white/10 p-2 rounded text-[10px] w-32 shadow-xl z-10 pointer-events-none">
                                    <div className="flex justify-between text-accent-mint mb-1"><span>Ahorro:</span> <span>{formatCurrency(m.savingsEnd)}</span></div>
                                    <div className="flex justify-between text-accent-salmon"><span>Deuda:</span> <span>{formatCurrency(m.bankDebtEnd)}</span></div>
                                 </div>

                                 <div className="flex items-end gap-1 md:gap-3 w-1/2 h-full z-0 relative">
                                    {/* Savings Bar */}
                                     {m.savingsEnd > 0 && <div style={{height: `${savingsHeight}%`}} className="w-full lg:w-1/2 bg-accent-mint/80 rounded-t border border-accent-mint"></div>}
                                     {/* Debt Bar */}
                                     {m.bankDebtEnd > 0 && <div style={{height: `${debtHeight}%`}} className="w-full lg:w-1/2 bg-accent-salmon/80 rounded-t border border-accent-salmon"></div>}
                                 </div>
                                 <span className="text-[10px] text-text-tertiary absolute -bottom-6 w-max">{m.monthStr.replace(' 2026', '')}</span>
                             </div>
                         )
                     })}
                 </div>

                 {/* Legend */}
                 <div className="flex justify-center gap-8 text-[10px] md:text-xs text-text-secondary pt-4">
                     <span className="flex items-center gap-2"><div className="w-3 h-3 bg-accent-mint/80 border border-accent-mint rounded-sm"></div> Capital Líquido Constante</span>
                     <span className="flex items-center gap-2"><div className="w-3 h-3 bg-accent-salmon/80 border border-accent-salmon rounded-sm"></div> Obligación Pasiva Acumulativa</span>
                 </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="dashboard-card-light p-4 text-xs">
                     <h4 className="font-semibold text-white mb-2 flex items-center gap-2"><Target size={14} className="text-accent-yellow" /> Rendimiento de la Estrategia vs Objetivo</h4>
                     <p className="text-text-secondary leading-relaxed mb-2">Según tu asignación actual planificada para las próximas 12 semanas:</p>
                     <ul className="space-y-1 list-disc list-inside text-text-tertiary">
                         <li><strong className={projectionData.months[2].savingsEnd >= 5000000 ? 'text-accent-mint' : 'text-accent-salmon'}>Ahorro Final: {formatCurrency(projectionData.months[2].savingsEnd)}</strong> (Meta: 5M)</li>
                         <li><strong className={projectionData.months[2].bankDebtEnd <= 800000 ? 'text-accent-mint' : 'text-accent-salmon'}>Deuda Restante: {formatCurrency(projectionData.months[2].bankDebtEnd)}</strong> (Meta: {'<'}800k)</li>
                     </ul>
                 </div>
                  <div className="dashboard-card-light p-4 text-xs flex justify-center flex-col bg-accent-yellow/5 border border-accent-yellow/20">
                     <h4 className="font-semibold text-accent-yellow mb-2 text-center text-sm">Verdict: {projectionData.months[2].savingsEnd >= 5000000 && projectionData.months[2].bankDebtEnd <= 800000 ? 'OBJETIVO ALCANZADO ✅' : 'AJUSTE REQUERIDO ⚠️'}</h4>
                     <p className="text-text-secondary text-center">Modificá las palancas de inyección de ahorro o sacrificio de sueldo en el Dashboard para corregir esta curva si estás por debajo de la meta.</p>
                 </div>
             </div>
        </div>
    );
};

export default function Home() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const monthLabels = ["Marzo 2026", "Abril 2026", "Mayo 2026"];
  const [savingsRescue, setSavingsRescue] = useState([
      { active: false, visa: 0, master: 0 },
      { active: false, visa: 0, master: 0 },
      { active: false, visa: 0, master: 0 }
  ]);
  const [mercadoPagoGastos, setMercadoPagoGastos] = useState<number[]>([221403, 221403, 221403]);
  
  // Specific allocations per card per month instead of a global slider
  const [salaryAllocations, setSalaryAllocations] = useState([
      { visa: 100000, master: 100000 },
      { visa: 100000, master: 100000 },
      { visa: 100000, master: 100000 }
  ]);

  const updateSavingsRescue = (idx: number, field: string, val: string | number | boolean) => {
    const next = [...savingsRescue];
    next[idx] = { ...next[idx], [field]: val };
    setSavingsRescue(next);
  };

  const updateMercadoPago = (idx: number, val: number) => {
    const next = [...mercadoPagoGastos];
    next[idx] = val;
    setMercadoPagoGastos(next);
  };

  const updateAllocation = (monthIdx: number, cardId: 'visa' | 'master', val: number) => {
    const next = [...salaryAllocations];
    next[monthIdx] = { ...next[monthIdx], [cardId]: val };
    setSalaryAllocations(next);
  };

  const projection = useMemo(() => {
    // Deep copy initial debts to track them individually
    const currentDebts = INITIAL_DATA.deudas.map(d => ({ ...d }));
    let currentSavings = INITIAL_DATA.ahorro;
    let currentSelfDebt = 0;
    
    let totalInterestPaid = 0;
    let totalYieldEarned = 0;
    
    const months = [];
    
    for (let i = 0; i < 4; i++) { 
        const monthYield = currentSavings * TEM_SAVINGS;
        currentSavings += monthYield;
        totalYieldEarned += monthYield;

        let injectionThisMonth = 0;
        let pmtToSelf = 0;
        const currentMonthAllocs = i < 3 ? salaryAllocations[i] : salaryAllocations[2]; 
        
        // Map to hold required minimums for UX extraction later
        const requiredMinPaymentsThisMonth: Record<string, number> = {};

        // 1. Calculate Compound Interest FIRST and add it to the principal balances 
        let totalMonthInterest = 0;
        let totalMinPaymentRequired = 0;
        const totalDebtBeforeInterest = currentDebts.reduce((acc, d) => acc + d.amount, 0);

        for (const debt of currentDebts) {
            if (debt.amount > 0) {
                // Determine interest generated this month on the remaining balance
                const baseInt = debt.amount * CONSTANTS.TEM_DEBT;
                const iva = baseInt * CONSTANTS.IVA;
                const iibb = debt.amount * CONSTANTS.IIBB; 
                let specificInterest = baseInt + iva + iibb;
                const sellos = (debt.amount + specificInterest) * CONSTANTS.SELLOS;
                specificInterest += sellos;

                const specificMinPayment = specificInterest + (debt.amount * 0.05);
                requiredMinPaymentsThisMonth[debt.id] = Math.min(specificMinPayment, debt.amount + specificInterest);

                // CRITICAL FIX: Add interest to the balance (compounding) BEFORE payment
                debt.amount += specificInterest;
                
                totalMonthInterest += specificInterest;
                totalMinPaymentRequired += specificMinPayment;
            } else {
                requiredMinPaymentsThisMonth[debt.id] = 0;
            }
        }
        totalInterestPaid += totalMonthInterest;

        // 2. Execute Savings Rescue Injection (Allows precise injections to both cards)
        if (i < 3) { 
            const rescue = savingsRescue[i];
            if (rescue.active) {
                // Determine how much is requested mapping to current savings cap
                const totalRequested = rescue.visa + rescue.master;
                const actualInjectionAvailable = Math.min(totalRequested, currentSavings);
                
                if (actualInjectionAvailable > 0) {
                     // Distribute the available injection proportionally or exactly
                     const visaShare = totalRequested > 0 ? (rescue.visa / totalRequested) : 0;
                     const masterShare = totalRequested > 0 ? (rescue.master / totalRequested) : 0;
                     
                     const visaInjection = actualInjectionAvailable * visaShare;
                     const masterInjection = actualInjectionAvailable * masterShare;
                     
                     currentSavings -= actualInjectionAvailable;
                     currentSelfDebt += actualInjectionAvailable;
                     injectionThisMonth = actualInjectionAvailable;
                     
                     let totalUnused = 0;
                     
                     const visaDebt = currentDebts.find(d => d.id === 'visa');
                     if (visaDebt && visaDebt.amount > 0) {
                          const payDown = Math.min(visaInjection, visaDebt.amount);
                          visaDebt.amount -= payDown;
                          totalUnused += (visaInjection - payDown);
                     } else {
                          totalUnused += visaInjection;
                     }
                     
                     const masterDebt = currentDebts.find(d => d.id === 'master');
                     if (masterDebt && masterDebt.amount > 0) {
                          const payDown = Math.min(masterInjection, masterDebt.amount);
                          masterDebt.amount -= payDown;
                          totalUnused += (masterInjection - payDown);
                     } else {
                          totalUnused += masterInjection;
                     }
                     
                     // Return unused injection back to savings
                     if (totalUnused > 0) {
                         currentSavings += totalUnused;
                         currentSelfDebt -= totalUnused;
                         injectionThisMonth -= totalUnused;
                     }
                }
            }
        }

        // 3. Execute Specific Salary Allocations
        let totalBankPaid = 0;

        for (const debt of currentDebts) {
            if (debt.amount > 0) {
                // Find the required minimum payment mapped during Interest phase
                const minPayRequired = requiredMinPaymentsThisMonth[debt.id] || 0;
                let askedPaymentThisCard = currentMonthAllocs[debt.id as keyof typeof currentMonthAllocs] || 0;
                
                // FORCE: User cannot pay less than the legal minimum natively, unless they pay the entire debt off
                askedPaymentThisCard = Math.max(askedPaymentThisCard, Math.min(minPayRequired, debt.amount));

                // You can't pay more than the accumulated debt allows
                const actualPaymentThisCard = Math.min(askedPaymentThisCard, debt.amount);
                
                debt.amount -= actualPaymentThisCard;
                totalBankPaid += actualPaymentThisCard;
            }
        }
        
        const currentTotalDebt = currentDebts.reduce((acc, d) => acc + d.amount, 0);

        // Calculate if we have money left over in the budget capable of replenishing the "Self-Debt"
        const currentMP = i < 3 ? mercadoPagoGastos[i] : mercadoPagoGastos[2];
        const gastosFijosTotalesThisMonth = INITIAL_DATA.gastos.expensas + INITIAL_DATA.gastos.fijosExtras + currentMP;
        const totalAllocatedToBank = currentMonthAllocs.visa + currentMonthAllocs.master;
        const leftoverReservedBudget = totalAllocatedToBank - totalBankPaid; // Occurs if the slider was set high but debt was completely erased.

        if (leftoverReservedBudget > 0 && currentSelfDebt > 0) {
            pmtToSelf = Math.min(currentSelfDebt, leftoverReservedBudget);
            currentSelfDebt -= pmtToSelf;
            currentSavings += pmtToSelf; 
        }

        months.push({
            monthId: i,
            monthStr: i < 3 ? monthLabels[i] : "Junio 2026 (Proyección)",
            bankDebtStart: totalDebtBeforeInterest,
            debtBreakdown: currentDebts.map(d => ({...d})), // Capture snapshot of debts this month
            requiredMinimums: requiredMinPaymentsThisMonth, // Keep track of minimum floors for the UI mapping
            injection: injectionThisMonth,
            interest: totalMonthInterest,
            minPayment: totalMinPaymentRequired,
            bankPaid: totalBankPaid,
            savingsYield: monthYield,
            bankDebtEnd: currentTotalDebt,
            selfDebt: currentSelfDebt,
            savingsEnd: currentSavings,
            // CRITICAL FIX: Base living cash flow relies heavily on the constraints fixed above
            livingCashFlow: INITIAL_DATA.sueldo - gastosFijosTotalesThisMonth - totalAllocatedToBank,
            gastosFijosTotales: gastosFijosTotalesThisMonth,
            mercadoPagoGasto: currentMP 
        });
    }

    const finalSavings = currentSavings;
    const finalBankDebt = months[3].bankDebtEnd;
    let monthsToGoal = null;

    // Simulate additional months if goal is not met (Max 48 months to prevent infinite loop)
    if (finalBankDebt > 800000 || finalSavings < 5000000) {
        let simSavings = finalSavings;
        const simDebts = currentDebts.map(d => ({ ...d }));
        let simSelfDebt = currentSelfDebt;
        let c = 0;
        const sAllocs = salaryAllocations[2];

        while (c < 48 && (simDebts.reduce((a, b) => a + b.amount, 0) > 800000 || simSavings < 5000000)) {
            c++;
            simSavings += simSavings * TEM_SAVINGS;

            let tBankPaid = 0;
            for (const debt of simDebts) {
                if (debt.amount > 0) {
                    const bInt = debt.amount * CONSTANTS.TEM_DEBT;
                    const iva = bInt * CONSTANTS.IVA;
                    const iibb = debt.amount * CONSTANTS.IIBB; 
                    let sInt = bInt + iva + iibb;
                    sInt += (debt.amount + sInt) * CONSTANTS.SELLOS;
                    debt.amount += sInt;

                    const asked = sAllocs[debt.id as keyof typeof sAllocs] || 0;
                    const actPmt = Math.min(asked, debt.amount);
                    debt.amount -= actPmt;
                    tBankPaid += actPmt;
                }
            }

            const leftReserve = (sAllocs.visa + sAllocs.master) - tBankPaid;
            if (leftReserve > 0 && simSelfDebt > 0) {
                const pToSelf = Math.min(simSelfDebt, leftReserve);
                simSelfDebt -= pToSelf;
                simSavings += pToSelf;
            }
        }
        if (c < 48) monthsToGoal = c;
    }

    return { months, totalInterestPaid, totalYieldEarned, currentSelfDebt, finalBankDebt, finalSavings, monthsToGoal };
  }, [savingsRescue, salaryAllocations, mercadoPagoGastos, monthLabels]);

  const pureInterestStart = useMemo(() => {
    return INITIAL_DATA.deudas.reduce((totalAcc, debt) => {
        const baseInt = debt.amount * CONSTANTS.TEM_DEBT;
        const iva = baseInt * CONSTANTS.IVA;
        const iibb = debt.amount * CONSTANTS.IIBB;
        const subtotal = baseInt + iva + iibb;
        const sellos = (debt.amount + subtotal) * CONSTANTS.SELLOS;
        return totalAcc + baseInt + iva + iibb + sellos;
    }, 0);
  }, []);

  const renderActiveView = () => {
    switch (activeView) {
        case 'saldos':
            return <MisSaldosView pureInterestStart={pureInterestStart} />;
        case 'flujo':
            return <FlujoMensualView projectionData={projection} />;
        case 'proyecciones':
            return <ProyeccionesView projectionData={projection} />;
        case 'dashboard':
        default:
            return (
                <div className="fade-in">
                    {/* Top Stats Row... remain as before but with accurate constraints */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        
                        <div className="dashboard-card p-4 flex flex-col justify-between">
                            <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
                                <Activity size={14} className="text-accent-salmon" />
                                Pérdida Pura Mensual
                                <Tooltip content="Monto que el banco te cobra HOY solo por intereses mensuales e impuestos sin achicar el capital. La matemática está corregida para integrar este valor a tu capital adeudado cada mes.">
                                    <Info size={12} className="text-text-tertiary hover:text-white" />
                                </Tooltip>
                            </div>
                            <div className="text-2xl font-bold text-white mb-1.5">{formatCurrency(pureInterestStart)}</div>
                            <div className="flex items-center gap-1.5 text-[10px] text-accent-salmon bg-accent-salmon/10 w-max px-2 py-0.5 rounded">
                                <TrendingDown size={12} /> Fuga de capital por deuda
                            </div>
                        </div>

                        <div className="dashboard-card p-4 flex flex-col justify-between">
                            <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
                                <TrendingUp size={14} className="text-accent-mint" />
                                Base Yield (Ahorros)
                                <Tooltip content="Crecimiento orgánico de tus ahorros este mes asumiendo 26.3% TNA. Si inyectás ahorros en la tarjeta, este número bajará el mes siguiente proporcionalmente.">
                                    <Info size={12} className="text-text-tertiary hover:text-white" />
                                </Tooltip>
                            </div>
                            <div className="text-2xl font-bold text-white mb-1.5">{formatCurrency(projection.months[0].savingsYield)}</div>
                            <div className="flex items-center gap-1.5 text-[10px] text-accent-mint bg-accent-mint/10 w-max px-2 py-0.5 rounded">
                                 Rendimiento a favor pasivo
                            </div>
                        </div>

                        <div className="dashboard-card p-4 flex flex-col justify-between bg-card-bg-light">
                            <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
                                <div className="flex items-center gap-2">
                                    <LayoutDashboard size={14} className="text-accent-yellow" />
                                    Target: Deuda Junio
                                </div>
                            </div>
                            <div className={`text-2xl font-bold mb-1.5 ${projection.months[2].bankDebtEnd <= 800000 ? 'text-accent-mint' : 'text-accent-salmon'}`}>
                                {formatCurrency(projection.months[2].bankDebtEnd)}
                                <span className="text-[10px] text-text-tertiary ml-2 font-normal">{"<"} {formatCurrency(800000)}</span>
                            </div>
                            
                            {/* Granular Debt Breakdown Bar */}
                            <div className="flex h-1.5 rounded-full overflow-hidden w-full bg-card-bg mt-1">
                                {projection.months[2].debtBreakdown.map((debt: { name: string; amount: number; type: string; id: string; order: number }, i: number) => {
                                    const total = projection.months[2].bankDebtEnd;
                                    if (total === 0 || debt.amount === 0) return null;
                                    return (
                                        <Tooltip key={i} content={`${debt.name}: ${formatCurrency(debt.amount)}`}>
                                            <div style={{width: `${(debt.amount/total)*100}%`}} className={`h-full border-r border-dashboard-bg ${debt.type === 'app' ? 'bg-accent-blue' : 'bg-red-400'}`}></div>
                                        </Tooltip>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="dashboard-card p-4 flex flex-col justify-between bg-card-bg-light border-accent-salmon/10 border">
                            <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
                                <WalletCards size={14} className="text-accent-blue" />
                                Obligación de Vida Fija Promedio
                                <Tooltip content="Gastos inamovibles restados de tu sueldo base antes de permitirte destinar presupuesto a tus deudas. Calculado en base al Mes 1 (Marzo).">
                                    <Info size={12} className="text-text-tertiary hover:text-white" />
                                </Tooltip>
                            </div>
                            <div className="text-2xl text-accent-blue font-bold mb-1.5">
                                {formatCurrency(INITIAL_DATA.gastos.expensas + INITIAL_DATA.gastos.fijosExtras + mercadoPagoGastos[0])}
                            </div>
                            <div className="text-[10px] text-text-secondary flex justify-between w-full border-t border-white/5 pt-1.5">
                                <span>Max. P/Deuda Disp (Marzo):</span>
                                <span className="text-white font-semibold">{formatCurrency(INITIAL_DATA.sueldo - (INITIAL_DATA.gastos.expensas + INITIAL_DATA.gastos.fijosExtras + mercadoPagoGastos[0]))}</span>
                            </div>
                        </div>

                    </div>

                    {/* Dynamic Controls Layout (RESTYLED FOR 4 SLIDERS) */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-4">
                        
                        {/* Left Box: Monthly Config */}
                        <div className="xl:col-span-9 dashboard-card p-5 bg-accent-mint/5 border-accent-mint/20">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-semibold text-accent-mint flex items-center gap-2">
                                    Control de Flujo Estratégico Detallado
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {[0, 1, 2].map((mIdx) => {
                                    const monthData = projection.months[mIdx];
                                    const allocs = salaryAllocations[mIdx];
                                    const maxAvailableForDebtThisMonth = INITIAL_DATA.sueldo - monthData.gastosFijosTotales;
                                    const totalAllocatedThisMonth = allocs.visa + allocs.master;
                                    const availableBudgetRemaining = maxAvailableForDebtThisMonth - totalAllocatedThisMonth;
                                    const isBudgetExceeded = availableBudgetRemaining < 0;

                                    return (
                                        <div key={mIdx} className="dashboard-card-light p-4 flex flex-col">
                                            <h3 className="font-medium text-white mb-3 flex justify-between items-center text-xs border-b border-white/5 pb-2">
                                                {monthLabels[mIdx]}
                                            </h3>
                                            
                                            {/* Mercado Pago Livings Expense Slider */}
                                            <div className="mt-4 pb-3 border-b border-white/5 space-y-4">
                                                <div>
                                                    <div className="flex justify-between text-[11px] mb-1 font-semibold">
                                                        <span className="text-text-secondary flex items-center gap-1"><Smartphone size={12} className="text-accent-mint"/> Estimado Mercado Pago (Vida)</span>
                                                        <span className="text-accent-mint">{formatCurrency(mercadoPagoGastos[mIdx])}</span>
                                                    </div>
                                                    <input 
                                                        type="range" min={0} max={600000} step="1000" 
                                                        value={mercadoPagoGastos[mIdx]} onChange={(e) => updateMercadoPago(mIdx, Number(e.target.value))}
                                                        className="w-full accent-accent-mint h-1.5 bg-card-bg rounded-lg appearance-none cursor-pointer"
                                                    />
                                                    <div className="text-[9px] text-text-tertiary mt-1">Gasto de vida fluctuante que querés presupuestar para este mes. Modifica cuánto te queda libre para pagar las tarjetas.</div>
                                                </div>
                                            </div>

                                            {/* Specific Debt Sliders */}
                                            <div className="space-y-4 flex-1">
                                                <div>
                                                    <div className="flex justify-between text-[10px] mb-1 mt-4">
                                                        <span className="text-text-secondary flex items-center gap-1"><CreditCard size={10} className="text-red-400"/> Pago Visa</span>
                                                        <span className="font-semibold text-white">{formatCurrency(allocs.visa)}</span>
                                                    </div>
                                                    <input 
                                                        type="range" min={Math.round(monthData.requiredMinimums.visa || 0)} max={maxAvailableForDebtThisMonth} step="5000" 
                                                        value={Math.max(allocs.visa, monthData.requiredMinimums.visa || 0)} onChange={(e) => updateAllocation(mIdx, 'visa', Number(e.target.value))}
                                                        className="w-full accent-white h-1 bg-card-bg rounded-lg appearance-none cursor-pointer"
                                                    />
                                                    <div className="text-[9px] text-text-tertiary mt-1">Mínimo legal: {formatCurrency(monthData.requiredMinimums.visa || 0)}</div>
                                                </div>

                                                <div>
                                                    <div className="flex justify-between text-[10px] mb-1">
                                                        <span className="text-text-secondary flex items-center gap-1"><CreditCard size={10} className="text-red-400"/> Pago Mastercard</span>
                                                        <span className="font-semibold text-white">{formatCurrency(allocs.master)}</span>
                                                    </div>
                                                    <input 
                                                        type="range" min={Math.round(monthData.requiredMinimums.master || 0)} max={maxAvailableForDebtThisMonth} step="5000" 
                                                        value={Math.max(allocs.master, monthData.requiredMinimums.master || 0)} onChange={(e) => updateAllocation(mIdx, 'master', Number(e.target.value))}
                                                        className="w-full accent-white h-1 bg-card-bg rounded-lg appearance-none cursor-pointer"
                                                    />
                                                    <div className="text-[9px] text-text-tertiary mt-1">Mínimo legal: {formatCurrency(monthData.requiredMinimums.master || 0)}</div>
                                                </div>
                                            </div>

                                            {/* Savings Input */}
                                            <div className="mt-4 pt-3 border-t border-white/5 space-y-3">
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="text-text-secondary">Usar Apalancamiento con Ahorros</span>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" className="sr-only peer" checked={savingsRescue[mIdx].active} onChange={(e) => updateSavingsRescue(mIdx, 'active', e.target.checked)} />
                                                        <div className="w-9 h-5 bg-card-bg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-mint"></div>
                                                    </label>
                                                </div>

                                                {savingsRescue[mIdx].active && (
                                                    <div className="bg-dashboard-bg/50 p-3 rounded-xl border border-white/5 space-y-4 fade-in">
                                                        <div>
                                                            <div className="flex justify-between text-[10px] mb-1">
                                                                <span className="text-text-secondary flex items-center gap-1"><CreditCard size={10} className="text-red-400"/> A Visa</span>
                                                                <span className="font-semibold text-accent-mint">{formatCurrency(savingsRescue[mIdx].visa)}</span>
                                                            </div>
                                                            <input 
                                                                type="range" min="0" max="2000000" step="10000" 
                                                                value={savingsRescue[mIdx].visa} onChange={(e) => updateSavingsRescue(mIdx, 'visa', Number(e.target.value))}
                                                                className="w-full h-1 accent-accent-mint bg-card-bg rounded-lg appearance-none cursor-pointer"
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="flex justify-between text-[10px] mb-1">
                                                                <span className="text-text-secondary flex items-center gap-1"><CreditCard size={10} className="text-red-400"/> A Mastercard</span>
                                                                <span className="font-semibold text-accent-mint">{formatCurrency(savingsRescue[mIdx].master)}</span>
                                                            </div>
                                                            <input 
                                                                type="range" min="0" max="2000000" step="10000" 
                                                                value={savingsRescue[mIdx].master} onChange={(e) => updateSavingsRescue(mIdx, 'master', Number(e.target.value))}
                                                                className="w-full h-1 accent-accent-mint bg-card-bg rounded-lg appearance-none cursor-pointer"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Living Cash Flow Calculator */}
                                            <div className={`mt-4 pt-3 border-t border-white/5 bg-dashboard-bg/30 -mx-4 px-4 pb-3`}>
                                                <div className="space-y-1.5 mb-3 border-b border-white/5 pb-3">
                                                    <div className="flex justify-between items-center text-[10px]">
                                                        <span className="text-text-secondary">Sueldo Base Inicial</span>
                                                        <span className="text-white font-medium">{formatCurrency(INITIAL_DATA.sueldo)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[10px]">
                                                        <span className="text-accent-mint/80">(-) Vida/MP + Fijos</span>
                                                        <span className="text-accent-mint/80">-{formatCurrency(monthData.gastosFijosTotales)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[10px]">
                                                        <span className="text-white/80">(-) Deuda Tarjetas</span>
                                                        <span className="text-white/80">-{formatCurrency(totalAllocatedThisMonth)}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex justify-between items-center text-[11px]">
                                                    <span className="text-text-tertiary flex items-center gap-1 font-bold">
                                                        Sueldo Libre en Mano
                                                        <Tooltip content="Monto final FÍSICO que te queda en la cuenta en este mes, después de apartar las expensas, costo de vida y pagar lo que configuraste en las tarjetas. Si el número es rojo, te pasaste, tu plan va a tener que sacar plata del fondo de Ahorro para llegar a fin de mes.">
                                                            <Info size={12} className="cursor-help" />
                                                        </Tooltip>
                                                    </span>
                                                    <span className={`font-bold ${isBudgetExceeded ? 'text-accent-salmon bg-accent-salmon/20 px-1.5 py-0.5 rounded border border-accent-salmon/30' : 'text-accent-mint'}`}>
                                                        {formatCurrency(monthData.livingCashFlow)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Right Box: Goal Overview */}
                        <div className="xl:col-span-3 dashboard-card p-5 flex flex-col justify-between">
                            <div>
                                <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                                    Resumen Recalculado
                                </h2>
                                
                                <div className="dashboard-card-light p-3 rounded-xl mb-3 border border-white/5">
                                    <div className="text-[10px] text-text-secondary mb-1">Ahorro Re-constituido (Junio)</div>
                                    <div className="text-xl font-bold text-accent-yellow mb-0.5">
                                        {formatCurrency(INITIAL_DATA.ahorro - projection.currentSelfDebt)}
                                    </div>
                                    <div className="text-[10px] text-text-tertiary">
                                        Obj: {formatCurrency(INITIAL_DATA.ahorro)}
                                    </div>
                                </div>

                                <div className="dashboard-card-light p-3 rounded-xl">
                                    <div className="text-[10px] text-text-secondary mb-2 border-b border-white/5 pb-1">Balance Consolidado</div>
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-accent-salmon decoration-dotted underline decoration-accent-salmon/50 underline-offset-2">Total Intereses:</span>
                                            <span className="font-medium">-{formatCurrency(projection.totalInterestPaid)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-accent-mint decoration-dotted underline decoration-accent-mint/50 underline-offset-2">Yield Capital:</span>
                                            <span className="font-medium">+{formatCurrency(projection.totalYieldEarned)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {projection.monthsToGoal !== null ? (
                                <div className="w-full bg-accent-salmon/10 text-accent-salmon border border-accent-salmon/20 font-medium py-3 rounded-xl text-center text-xs mt-4 tracking-wide fade-in flex flex-col gap-1 items-center">
                                    <Clock size={16} />
                                    <span>Para lograr meta:</span>
                                    <b className="text-sm">Faltarían {projection.monthsToGoal} meses extra</b>
                                </div>
                            ) : (
                                <button className="w-full bg-accent-yellow text-card-bg font-bold py-3 rounded-xl text-xs mt-4 hover:opacity-90 transition-opacity tracking-wide uppercase shadow-lg shadow-accent-yellow/20">
                                    Objetivo Cumplido ✅
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Detailed Timeline */}
                    <div className="dashboard-card p-5">
                        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                            Libro Mayor Modificado (Proyectado)
                            <Tooltip content="Auditoría mensual completa. Ahora los intereses sumados se capitalizan directamente de vuelta sobre el saldo de la deuda el mes siguiente.">
                                <Info size={14} className="text-text-tertiary hover:text-white" />
                            </Tooltip>
                        </h2>

                        <div className="overflow-x-auto custom-scroll -mx-2 px-2 pb-2">
                            <table className="w-full text-left border-collapse min-w-[950px]">
                                <thead>
                                    <tr className="text-text-secondary text-[10px] uppercase tracking-wider font-semibold border-b border-white/10">
                                        <th className="py-3 font-medium pl-2">Periodo</th>
                                        <th className="py-3 font-medium">
                                            <Tooltip content="Traspaso extraordinario del capital guardado hacia el pago de deuda.">
                                                <span className="border-b border-dashed border-text-tertiary pb-0.5 cursor-help">Inyecc Ahorro</span>
                                            </Tooltip>
                                        </th>
                                        <th className="py-3 font-medium">
                                            <Tooltip content="Penalidad cobrada por mantener deuda (TEM/IVA/Sellos/IIBB). Ahora SUMA y compone al capital.">
                                                <span className="border-b border-dashed border-text-tertiary pb-0.5 cursor-help">Cargo Extra</span>
                                            </Tooltip>
                                        </th>
                                        <th className="py-3 font-medium text-accent-blue">Asignación Base Salario</th>
                                        <th className="py-3 font-medium">Saldos Retenidos por Acreedor</th>
                                        <th className="py-3 font-medium pr-2 text-right">Patrimonio Fijo</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs">
                                    {projection.months.map((m, idx) => (
                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-3 text-white font-medium pl-2">{m.monthStr}</td>
                                            <td className="py-3">
                                                <span className="bg-accent-mint/10 text-accent-mint px-2 py-1 rounded text-[10px]">
                                                    {formatCurrency(m.injection)}
                                                </span>
                                            </td>
                                            <td className="py-3 text-accent-salmon/90">+{formatCurrency(m.interest)}</td>
                                            <td className="py-3 font-medium text-white">-{formatCurrency(m.bankPaid)}</td>
                                            
                                            <td className="py-3 px-1">
                                                <div className="flex gap-2 min-w-max">
                                                    {m.debtBreakdown.map((d: { id: string; name: string; amount: number; type: string; order: number }) => (
                                                        <div key={d.id} className="flex gap-1.5 items-center bg-card-bg px-2 py-1 rounded text-[10px] text-text-secondary border border-white/5">
                                                            {d.type === 'app' ? <Smartphone size={10} className="text-accent-blue"/> : <CreditCard size={10} className="text-red-400"/>}
                                                            <Tooltip content={`Saldo actual total correspondiente a ${d.name}.`}>
                                                                <span className={`${d.amount === 0 ? 'text-text-tertiary line-through' : 'font-semibold text-white'}`}>{formatCurrency(d.amount)}</span>
                                                            </Tooltip>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>

                                            <td className="py-3 font-semibold text-white pr-2 text-right">{formatCurrency(m.savingsEnd)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-dashboard-bg text-text-primary px-2 py-3 md:px-4 text-[0.8rem] md:text-xs relative">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-dashboard-bg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-56 flex flex-col pt-6 lg:pt-0 pr-4 lg:border-r border-white/5 h-full ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-8 px-5 lg:px-3">
            <div className="flex items-center gap-3 font-bold text-lg">
                <div className="w-7 h-7 rounded-lg bg-accent-mint flex items-center justify-center text-dashboard-bg">
                    <Landmark size={16} />
                </div>
                OMEGA 
            </div>
            <button className="lg:hidden text-text-secondary hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={20} />
            </button>
        </div>

        <nav className="flex flex-col gap-1.5 flex-1 text-sm px-2 lg:px-0">
            <button 
                onClick={() => { setActiveView('dashboard'); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors w-full text-left ${activeView === 'dashboard' ? 'bg-card-bg text-accent-mint' : 'text-text-secondary hover:text-white'}`}>
                <LayoutDashboard size={16} />
                <span className="font-medium">Dashboard</span>
            </button>
            <button 
                onClick={() => { setActiveView('saldos'); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors w-full text-left ${activeView === 'saldos' ? 'bg-card-bg text-accent-mint' : 'text-text-secondary hover:text-white'}`}>
                <WalletCards size={16} />
                <span className="font-medium">Mis Saldos</span>
            </button>
            <button 
                onClick={() => { setActiveView('flujo'); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors w-full text-left ${activeView === 'flujo' ? 'bg-card-bg text-accent-mint' : 'text-text-secondary hover:text-white'}`}>
                <ArrowRightLeft size={16} />
                <span className="font-medium">Flujo Mensual</span>
            </button>
            <button 
                 onClick={() => { setActiveView('proyecciones'); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors w-full text-left ${activeView === 'proyecciones' ? 'bg-card-bg text-accent-mint' : 'text-text-secondary hover:text-white'}`}>
                <PieChart size={16} />
                <span className="font-medium">Proyecciones</span>
            </button>
        </nav>

        <div className="mt-auto px-3">
            <div className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full bg-card-bg-light border border-white/10 overflow-hidden">
                    <div className="w-full h-full bg-accent-yellow/20 flex justify-center items-end pt-1">
                        <div className="w-4 h-4 rounded-full bg-accent-yellow/80"></div>
                    </div>
                </div>
                <div>
                    <p className="font-semibold text-xs">Usuario</p>
                    <p className="text-[10px] text-text-tertiary">@finanzas</p>
                </div>
            </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto custom-scroll lg:pl-6 pb-6 w-full">
        
        <header className="flex justify-between items-center mb-6 mt-1 lg:mt-0">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="lg:hidden p-1.5 mr-1 bg-card-bg rounded-lg border border-white/10 text-text-secondary hover:text-white">
                    <Menu size={20} />
                </button>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold mb-0.5">Finance Dashboard.</h1>
                    <p className="text-text-secondary text-[10px] md:text-xs">Optimiza tu estrategia de repago y recupero de ahorros.</p>
                </div>
            </div>
            <div className="hidden md:flex gap-2">
                <button className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-text-secondary cursor-not-allowed opacity-50">
                    <Settings size={14} />
                </button>
                <button className="px-4 py-1.5 rounded-full bg-card-bg text-text-secondary border border-white/5 font-semibold text-xs cursor-not-allowed opacity-50">
                    Exportar Plan
                </button>
            </div>
        </header>

        {renderActiveView()}

      </main>
    </div>
  );
}
