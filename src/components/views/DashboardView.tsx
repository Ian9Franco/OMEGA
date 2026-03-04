"use client";
import React, { useState } from 'react';
import {
  Activity, TrendingDown, TrendingUp, LayoutDashboard, WalletCards,
  Info, Smartphone, CreditCard, CheckCircle2, ShoppingCart, Zap,
  Calculator, ChevronDown, ChevronUp, ArrowRight, AlertTriangle
} from 'lucide-react';
import { Tooltip } from '@/components/Tooltip';
import { INITIAL_DATA, CONSTANTS, TEM_SAVINGS, MP_CREDITS, formatCurrency } from '@/lib/constants';
import type { ProjectionResult, SavingsRescue, SalaryAllocation, MPParsedData } from '@/lib/types';

// ======================= CONSTANTS =======================
const TEM_DEBT_FULL = CONSTANTS.TEM_DEBT * (1 + CONSTANTS.IVA) + CONSTANTS.IIBB + CONSTANTS.SELLOS;

// ======================= MONTHLY STRATEGY PANEL =======================
// Salary is already deposited. This panel shows the optimal allocation per month.
function MonthlyStrategyPanel({ fijosBase, savings, gastosPersonales, purchases }: {
  fijosBase: number; savings: number; gastosPersonales: number; purchases: PlannedPurchase[];
}) {
  // Calculate installment load from purchases for a given month
  const getPurchaseLoad = (monthIdx: number) => purchases.reduce((acc, p) => {
    if (p.type === 'subscription') return monthIdx >= p.buyMonth ? acc + p.price : acc;
    const cuota = p.price / p.cuotas;
    return (monthIdx >= p.buyMonth && monthIdx < p.buyMonth + p.cuotas) ? acc + cuota : acc;
  }, 0);
  const salary = INITIAL_DATA.sueldo;
  const cardConsumption = INITIAL_DATA.deudas.reduce((a, d) => a + (d.consumption || 0), 0);
  const cuotasTarjetasAbril = 65470.30 + 37165.48;
  const cuotasTarjetasMayo = 17244.56;
  const mpAbril = MP_CREDITS.reduce((a, c) => a + c.cuotaAbril, 0);
  const mpMayo = MP_CREDITS.reduce((a, c) => a + c.cuotaMayo, 0);

  const [openMonth, setOpenMonth] = useState<number>(0);

  // Define months with obligations paid from salary
  const months = [
    { label: 'Marzo 2026', cards: cardConsumption, mp: 0, fijos: fijosBase, note: 'Consumos del mes (ya cobraste sueldo)' },
    { label: 'Abril 2026', cards: cuotasTarjetasAbril, mp: mpAbril, fijos: fijosBase, note: 'Cuotas pendientes tarjetas + MP' },
    { label: 'Mayo 2026', cards: cuotasTarjetasMayo, mp: mpMayo, fijos: fijosBase, note: 'Últimas cuotas' },
    { label: 'Junio 2026+', cards: 0, mp: 0, fijos: fijosBase, note: '¡Sin deudas! Todo al ahorro' },
  ];

  // Running savings projection
  let runningSavings = savings;
  const monthResults = months.map((m, idx) => {
    const purchaseLoad = getPurchaseLoad(idx);
    const totalObligations = m.cards + m.mp + m.fijos + gastosPersonales + purchaseLoad;
    const surplusFromSalary = Math.max(0, salary - totalObligations);
    const deficit = Math.max(0, totalObligations - salary);

    // Strategy A: Pay all from salary, keep savings earning yield
    const yieldA = runningSavings * TEM_SAVINGS;
    const savingsEndA = runningSavings + yieldA + surplusFromSalary;

    // Strategy B: Also use savings to cover deficit or pay extra
    // (only relevant if salary < obligations)
    const savingsUsed = deficit;
    const yieldB = (runningSavings - savingsUsed) * TEM_SAVINGS;
    const savingsEndB = (runningSavings - savingsUsed) + yieldB + Math.max(0, salary - (totalObligations - deficit));

    // Net cost of using savings (lost yield)
    const yieldLostByUsingSavings = savingsUsed * TEM_SAVINGS;

    const result = {
      ...m,
      totalObligations,
      surplusFromSalary,
      deficit,
      yieldEarned: yieldA,
      savingsEnd: savingsEndA,
      yieldLostByUsingSavings,
      savingsEndIfUseSavings: savingsEndB,
      salaryCoversAll: salary >= totalObligations,
    };

    runningSavings = savingsEndA;
    return result;
  });

  return (
    <div className="dashboard-card p-5">
      <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
        <Calculator size={16} className="text-accent-yellow" /> Plan Mensual — Estrategia Óptima
      </h2>
      <p className="text-[10px] text-text-tertiary mb-4">
        Tu sueldo ya fue depositado. Todo se paga con sueldo. Ahorros intactos generando rendimiento.
      </p>

      <div className="space-y-3">
        {monthResults.map((m, idx) => {
          const isOpen = openMonth === idx;
          const isGreen = m.salaryCoversAll;
          const borderColor = idx === 3 ? 'border-accent-mint' : isGreen ? 'border-accent-blue' : 'border-accent-salmon';

          return (
            <div key={idx} className={`border rounded-xl overflow-hidden transition-all ${borderColor} bg-card-bg`}>
              <button
                onClick={() => setOpenMonth(isOpen ? -1 : idx)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white">{m.label}</span>
                  {m.salaryCoversAll ? (
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-accent-mint/10 text-accent-mint">✅ Sueldo cubre todo</span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-accent-salmon/10 text-accent-salmon">⚠️ Déficit</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <div className="text-text-tertiary text-[9px]">Obligaciones</div>
                    <div className="font-bold text-accent-salmon">{formatCurrency(m.totalObligations)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-text-tertiary text-[9px]">Sobrante → ahorro</div>
                    <div className="font-bold text-accent-mint">{formatCurrency(m.surplusFromSalary)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-text-tertiary text-[9px]">Ahorros acumulados</div>
                    <div className="font-bold text-white">{formatCurrency(m.savingsEnd)}</div>
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-text-tertiary" /> : <ChevronDown size={16} className="text-text-tertiary" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-white/5 space-y-4">
                  {/* Salary breakdown */}
                  <div className="pt-3">
                    <div className="text-[9px] text-text-tertiary uppercase tracking-wider font-semibold mb-2">Distribución del sueldo</div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary">💰 Sueldo neto</span>
                        <span className="font-bold text-white">{formatCurrency(salary)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary">🧑 Presupuesto personal</span>
                        <span className="text-accent-yellow">-{formatCurrency(gastosPersonales)}</span>
                      </div>
                      {m.fijos > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary">🏠 Gastos fijos (impuestos, internet, comida, móvil)</span>
                          <span className="text-accent-salmon">-{formatCurrency(m.fijos)}</span>
                        </div>
                      )}
                      {m.cards > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary">💳 Tarjetas ({idx === 0 ? 'consumos' : 'cuotas'})</span>
                          <span className="text-accent-salmon">-{formatCurrency(m.cards)}</span>
                        </div>
                      )}
                      {m.mp > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary">📱 MercadoPago créditos</span>
                          <span className="text-accent-salmon">-{formatCurrency(m.mp)}</span>
                        </div>
                      )}
                      {getPurchaseLoad(idx) > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary">🛒 Cuotas compras</span>
                          <span className="text-accent-blue">-{formatCurrency(getPurchaseLoad(idx))}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center border-t border-white/10 pt-2">
                        <span className="font-bold text-white">Sobrante del sueldo → Ahorros</span>
                        <span className="font-bold text-accent-mint text-sm">{formatCurrency(m.surplusFromSalary)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Savings status */}
                  <div className="bg-dashboard-bg/40 p-3 rounded-xl space-y-2 text-[11px]">
                    <div className="text-[9px] text-text-tertiary uppercase tracking-wider font-semibold">Estado de ahorros</div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Rendimiento del mes ({(TEM_SAVINGS * 100).toFixed(2)}%):</span>
                      <span className="text-accent-mint font-semibold">+{formatCurrency(m.yieldEarned)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Ingreso desde sueldo:</span>
                      <span className="text-accent-blue font-semibold">+{formatCurrency(m.surplusFromSalary)}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-2 font-bold">
                      <span>Total ahorros fin de mes:</span>
                      <span className="text-accent-mint text-sm">{formatCurrency(m.savingsEnd)}</span>
                    </div>
                  </div>

                  {/* Strategy comparison */}
                  {m.salaryCoversAll && (
                    <div className="bg-accent-mint/10 border border-accent-mint/20 rounded-lg p-3 text-[10px] text-accent-mint">
                      <strong>✅ Estrategia óptima:</strong> Pagá todo con sueldo. Tus ahorros quedan intactos generando <strong>+{formatCurrency(m.yieldEarned)}</strong>/mes de rendimiento.
                      {m.yieldLostByUsingSavings > 0 && ` Si usaras ahorros, perderías ${formatCurrency(m.yieldLostByUsingSavings)} en rendimiento.`}
                    </div>
                  )}
                  {!m.salaryCoversAll && (
                    <div className="bg-accent-salmon/10 border border-accent-salmon/20 rounded-lg p-3 text-[10px] text-accent-salmon">
                      <strong>⚠️ Déficit de {formatCurrency(m.deficit)}:</strong> Tu sueldo no alcanza. Necesitás cubrir la diferencia desde ahorros.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/10">
        {monthResults.map((m, idx) => (
          <div key={idx} className="text-center">
            <div className="text-[9px] text-text-tertiary mb-1">{m.label.split(' ')[0]}</div>
            <div className={`text-sm font-bold ${m.savingsEnd >= 5000000 ? 'text-accent-mint' : 'text-white'}`}>
              {formatCurrency(m.savingsEnd)}
            </div>
            <div className="text-[9px] text-accent-blue">+{formatCurrency(m.surplusFromSalary)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ======================= PURCHASE PLANNER =======================
type PlannedPurchase = {
  id: number;
  name: string;
  price: number;       // total price for purchases, monthly cost for subscriptions
  cuotas: number;      // installments for purchases, ignored for subscriptions
  buyMonth: number;    // 0=Mar, 1=Apr, 2=May, 3=Jun, 4=Jul, 5=Ago
  type: 'purchase' | 'subscription';
};

const MONTH_NAMES_SHORT = ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb'];
const MONTH_LABELS_FULL = ['Marzo 2026', 'Abril 2026', 'Mayo 2026', 'Junio 2026', 'Julio 2026', 'Agosto 2026'];

function PurchasePlannerPanel({ fijosBase, savings, gastosPersonales, setGastosPersonales, purchases, setPurchases }: {
  fijosBase: number; savings: number;
  gastosPersonales: number; setGastosPersonales: (v: number) => void;
  purchases: PlannedPurchase[]; setPurchases: (p: PlannedPurchase[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState(800000);
  const [editCuotas, setEditCuotas] = useState(6);
  const [editMonth, setEditMonth] = useState(3);
  const [editType, setEditType] = useState<'purchase' | 'subscription'>('purchase');
  const [nextId, setNextId] = useState(1);

  const salary = INITIAL_DATA.sueldo;
  const cardConsumption = INITIAL_DATA.deudas.reduce((a, d) => a + (d.consumption || 0), 0);
  const cuotasTarjetasAbril = 65470.30 + 37165.48;
  const cuotasTarjetasMayo = 17244.56;
  const mpAbril = MP_CREDITS.reduce((a, c) => a + c.cuotaAbril, 0);
  const mpMayo = MP_CREDITS.reduce((a, c) => a + c.cuotaMayo, 0);

  // Base obligations by month (index 0 = March)
  const baseObligations = [
    cardConsumption + fijosBase,
    cuotasTarjetasAbril + mpAbril + fijosBase,
    cuotasTarjetasMayo + mpMayo + fijosBase,
    fijosBase, fijosBase, fijosBase, fijosBase, fijosBase,
    fijosBase, fijosBase, fijosBase, fijosBase,
  ];

  // Calculate installment load from purchases for each month
  const getInstallmentLoad = (monthIdx: number): number => {
    return purchases.reduce((acc, p) => {
      if (p.type === 'subscription') return monthIdx >= p.buyMonth ? acc + p.price : acc;
      const cuotaMensual = p.price / p.cuotas;
      return (monthIdx >= p.buyMonth && monthIdx < p.buyMonth + p.cuotas) ? acc + cuotaMensual : acc;
    }, 0);
  };

  // Project savings over 12 months: with and without purchases
  const projMonths = 12;
  const projection: { label: string; without: number; with: number; installmentLoad: number }[] = [];
  let sWithout = savings;
  let sWith = savings;

  for (let i = 0; i < projMonths; i++) {
    const base = baseObligations[Math.min(i, baseObligations.length - 1)];
    const installmentLoad = getInstallmentLoad(i);
    const surplusWithout = Math.max(0, salary - base - gastosPersonales);
    const surplusWith = Math.max(0, salary - base - gastosPersonales - installmentLoad);

    sWithout += sWithout * TEM_SAVINGS + surplusWithout;
    sWith += sWith * TEM_SAVINGS + surplusWith;

    projection.push({
      label: `${MONTH_NAMES_SHORT[i % 12]} ${2026 + Math.floor((i + 2) / 12)}`,
      without: sWithout,
      with: sWith,
      installmentLoad,
    });
  }

  const reached5MWithout = projection.findIndex(m => m.without >= 5000000);
  const reached5MWith = projection.findIndex(m => m.with >= 5000000);
  const delay = reached5MWith >= 0 && reached5MWithout >= 0
    ? reached5MWith - reached5MWithout
    : reached5MWith < 0 && reached5MWithout >= 0
    ? projMonths - reached5MWithout
    : 0;

  const totalPurchasesCost = purchases.reduce((a, p) => a + (p.type === 'subscription' ? p.price * 12 : p.price), 0);

  const openNewForm = () => {
    setEditingId(null); setEditName(''); setEditPrice(800000); setEditCuotas(6); setEditMonth(3); setEditType('purchase'); setShowForm(true);
  };
  const openEditForm = (p: PlannedPurchase) => {
    setEditingId(p.id); setEditName(p.name); setEditPrice(p.price); setEditCuotas(p.cuotas); setEditMonth(p.buyMonth); setEditType(p.type); setShowForm(true);
  };
  const savePurchase = () => {
    if (!editName.trim()) return;
    const item: PlannedPurchase = { id: editingId ?? nextId, name: editName, price: editPrice, cuotas: editType === 'subscription' ? 1 : editCuotas, buyMonth: editMonth, type: editType };
    if (editingId !== null) { setPurchases(purchases.map(p => p.id === editingId ? item : p)); }
    else { setPurchases([...purchases, item]); setNextId(nextId + 1); }
    setShowForm(false); setEditingId(null);
  };
  const removePurchase = (id: number) => {
    setPurchases(purchases.filter(p => p.id !== id));
    if (editingId === id) { setShowForm(false); setEditingId(null); }
  };

  // Recommendation engine — find best month for a purchase based on available surplus
  const getRecommendation = (): string | null => {
    if (!showForm || editType !== 'purchase' || !editName.trim()) return null;
    const cuotaTest = editPrice / (editType === 'purchase' ? editCuotas : 1);
    // Check surplus at each possible month
    const surplusByMonth = MONTH_LABELS_FULL.map((_, mi) => {
      const base = baseObligations[Math.min(mi, baseObligations.length - 1)];
      const existingLoad = getInstallmentLoad(mi);
      return salary - base - gastosPersonales - existingLoad - cuotaTest;
    });
    const bestMonth = surplusByMonth.reduce((best, s, i) => s > surplusByMonth[best] ? i : best, 0);
    if (bestMonth !== editMonth && surplusByMonth[bestMonth] > surplusByMonth[editMonth] + 20000) {
      return `💡 Tip: En ${MONTH_LABELS_FULL[bestMonth]} tenés ${formatCurrency(surplusByMonth[bestMonth] - surplusByMonth[editMonth])} más de margen. Conviene mover la compra ahí para no ajustarte.`;
    }
    if (editMonth <= 2 && surplusByMonth[editMonth] < 50000) {
      return `⚠️ En ${MONTH_LABELS_FULL[editMonth]} tu margen queda en solo ${formatCurrency(Math.max(0, surplusByMonth[editMonth]))}. Considerá postergar a ${MONTH_LABELS_FULL[Math.min(bestMonth, 5)]}.`;
    }
    return null;
  };

  const recommendation = getRecommendation();

  return (
    <div className="dashboard-card p-5">
      <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
        <ShoppingCart size={16} className="text-accent-blue" /> Planificador de Compras & Servicios
      </h2>
      <p className="text-[10px] text-text-tertiary mb-4">
        Agregá compras en cuotas o servicios fijos mensuales (gym, streaming, etc.) y ve el impacto total.
      </p>

      {/* Personal budget slider */}
      <div className="bg-dashboard-bg/40 p-3 rounded-xl mb-4 border border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-text-secondary uppercase font-semibold tracking-wider">Presupuesto personal mensual</span>
          <span className="text-sm font-bold text-accent-yellow">{formatCurrency(gastosPersonales)}</span>
        </div>
        <input type="range" min={50000} max={350000} step={5000} value={gastosPersonales}
          onChange={e => setGastosPersonales(Number(e.target.value))}
          className="w-full accent-accent-yellow h-1.5 bg-card-bg rounded-lg appearance-none cursor-pointer" />
        <div className="flex justify-between text-[9px] text-text-tertiary mt-1">
          <span>$50k</span><span>$350k</span>
        </div>
      </div>

      {/* Items list */}
      {purchases.length > 0 && (
        <div className="space-y-2 mb-4">
          {purchases.map(p => (
            <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${editingId === p.id ? 'bg-accent-blue/5 border-accent-blue/30' : 'bg-card-bg-light border-white/10'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold" style={{ background: p.type === 'subscription' ? 'rgba(168,85,247,0.15)' : 'rgba(56,189,248,0.15)', color: p.type === 'subscription' ? '#a855f7' : '#38bdf8' }}>
                    {p.type === 'subscription' ? '🔄 Servicio' : '🛒 Compra'}
                  </span>
                  <span className="text-xs font-semibold text-white">{p.name}</span>
                  <span className="text-[9px] bg-accent-blue/10 text-accent-blue px-1.5 py-0.5 rounded">
                    {p.type === 'subscription' ? `Desde ${MONTH_LABELS_FULL[p.buyMonth]}` : MONTH_LABELS_FULL[p.buyMonth]}
                  </span>
                </div>
                <div className="text-[10px] text-text-tertiary mt-0.5">
                  {p.type === 'subscription'
                    ? `${formatCurrency(p.price)}/mes — fijo mensual`
                    : `${formatCurrency(p.price)} en ${p.cuotas}x de ${formatCurrency(p.price / p.cuotas)}/mes`}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEditForm(p)} className="text-text-tertiary hover:text-accent-blue transition-colors p-1.5 rounded-lg hover:bg-accent-blue/10 text-[11px]">✏️</button>
                <button onClick={() => removePurchase(p.id)} className="text-text-tertiary hover:text-accent-salmon transition-colors p-1.5 rounded-lg hover:bg-accent-salmon/10 text-[11px]">✕</button>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center text-[10px] text-text-secondary pt-1 px-1">
            <span>Costo total anual: <strong className="text-white">{formatCurrency(totalPurchasesCost)}</strong></span>
            <span>Carga mensual actual: <strong className="text-accent-salmon">{formatCurrency(getInstallmentLoad(0))}</strong></span>
          </div>
        </div>
      )}

      {/* Add/Edit form */}
      {showForm ? (
        <div className="bg-dashboard-bg/40 p-4 rounded-xl border border-accent-blue/30 mb-4 space-y-3">
          <div className="text-[10px] text-accent-blue uppercase font-semibold tracking-wider">
            {editingId !== null ? '✏️ Editar item' : '+ Nuevo item'}
          </div>

          {/* Type selector */}
          <div className="flex gap-2">
            <button onClick={() => setEditType('purchase')}
              className={`flex-1 py-2 rounded-lg text-[10px] font-semibold border transition-all ${editType === 'purchase' ? 'bg-accent-blue/20 border-accent-blue text-accent-blue' : 'bg-card-bg border-white/10 text-text-secondary hover:border-white/30'}`}>
              🛒 Compra en cuotas
            </button>
            <button onClick={() => setEditType('subscription')}
              className={`flex-1 py-2 rounded-lg text-[10px] font-semibold border transition-all ${editType === 'subscription' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-card-bg border-white/10 text-text-secondary hover:border-white/30'}`}>
              🔄 Servicio mensual
            </button>
          </div>

          <div>
            <label className="text-[10px] text-text-secondary block mb-1">Nombre</label>
            <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
              placeholder={editType === 'subscription' ? 'Ej: Gym, Netflix, Spotify...' : 'Ej: iPhone 16, Zapatillas...'}
              className="w-full bg-card-bg border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-tertiary focus:border-accent-blue focus:outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-text-secondary block mb-1">{editType === 'subscription' ? 'Costo mensual' : 'Precio total'}</label>
              <input type="number" value={editPrice} onChange={e => setEditPrice(Number(e.target.value))} min={1000} step={1000}
                className="w-full bg-card-bg border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-accent-blue focus:outline-none" />
            </div>

            {editType === 'purchase' && (
              <div>
                <label className="text-[10px] text-text-secondary block mb-1">Cuotas s/interés</label>
                <div className="flex gap-1">
                  {[1, 3, 6, 9, 12].map(n => (
                    <button key={n} onClick={() => setEditCuotas(n)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all border ${editCuotas === n ? 'bg-accent-blue text-white border-accent-blue' : 'bg-card-bg border-white/10 text-text-secondary hover:border-white/30'}`}>
                      {n}x
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] text-text-secondary block mb-1">{editType === 'subscription' ? '¿Desde cuándo?' : '¿Cuándo?'}</label>
              <select value={editMonth} onChange={e => setEditMonth(Number(e.target.value))}
                className="w-full bg-card-bg border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-accent-blue focus:outline-none">
                {MONTH_LABELS_FULL.map((ml, i) => (
                  <option key={i} value={i}>{ml}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-[10px] text-text-tertiary">
            {editType === 'subscription'
              ? <>Costo fijo: <strong className="text-white">{formatCurrency(editPrice)}</strong>/mes (permanente desde {MONTH_LABELS_FULL[editMonth]})</>
              : <>Cuota: <strong className="text-white">{formatCurrency(editPrice / editCuotas)}</strong>/mes durante {editCuotas} {editCuotas === 1 ? 'mes' : 'meses'}</>}
          </div>

          {/* Smart recommendation */}
          {recommendation && (
            <div className="p-3 rounded-lg border border-accent-yellow/30 bg-accent-yellow/10 text-[10px] text-accent-yellow">
              {recommendation}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={savePurchase} disabled={!editName.trim()}
              className="px-4 py-2 bg-accent-blue text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed">
              {editingId !== null ? 'Guardar cambios' : 'Agregar'}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }}
              className="px-4 py-2 bg-card-bg border border-white/10 text-text-secondary text-xs rounded-lg hover:border-white/30 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button onClick={openNewForm}
          className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-xs text-text-secondary hover:border-accent-blue/50 hover:text-accent-blue transition-all mb-4 flex items-center justify-center gap-2">
          <span className="text-lg">+</span> Agregar compra o servicio
        </button>
      )}

      {/* Impact summary */}
      {purchases.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="dashboard-card-light p-4 rounded-xl border border-white/10">
              <div className="text-[10px] text-text-tertiary uppercase font-semibold tracking-wider mb-2">Impacto en meta $5M</div>
              <div className={`text-xl font-bold mb-1 ${delay <= 0 ? 'text-accent-mint' : delay <= 2 ? 'text-accent-yellow' : 'text-accent-salmon'}`}>
                {delay <= 0 ? 'Sin impacto' : `+${delay} ${delay === 1 ? 'mes' : 'meses'}`}
              </div>
              <div className="text-[10px] text-text-secondary">
                {delay <= 0 ? 'Las compras no afectan tu meta' : `Llegarías a $5M ${delay} ${delay === 1 ? 'mes' : 'meses'} más tarde`}
              </div>
            </div>

            <div className="dashboard-card-light p-4 rounded-xl border border-white/10">
              <div className="text-[10px] text-text-tertiary uppercase font-semibold tracking-wider mb-2">Diferencia a 12 meses</div>
              <div className="text-xl font-bold text-accent-salmon mb-1">
                -{formatCurrency(Math.max(0, (projection[projMonths - 1]?.without || 0) - (projection[projMonths - 1]?.with || 0)))}
              </div>
              <div className="text-[10px] text-text-secondary">Menos ahorro acumulado por las compras</div>
            </div>

            <div className="dashboard-card-light p-4 rounded-xl border border-white/10">
              <div className="text-[10px] text-text-tertiary uppercase font-semibold tracking-wider mb-2">Carga mensual máxima</div>
              <div className="text-xl font-bold text-accent-blue mb-1">
                {formatCurrency(Math.max(...Array.from({ length: projMonths }, (_, i) => getInstallmentLoad(i))))}
              </div>
              <div className="text-[10px] text-text-secondary">Cuotas de compras en el mes pico</div>
            </div>
          </div>

          {/* Comparison table */}
          <div className="overflow-x-auto custom-scroll">
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="text-text-secondary text-[9px] uppercase tracking-wider border-b border-white/10">
                  <th className="py-2 pl-2">Mes</th>
                  <th className="py-2">Cuotas compras</th>
                  <th className="py-2">Sin compras</th>
                  <th className="py-2">Con compras</th>
                  <th className="py-2 text-right pr-2">Diferencia</th>
                </tr>
              </thead>
              <tbody className="text-[11px]">
                {projection.map((m, i) => {
                  const diff = m.without - m.with;
                  return (
                    <tr key={i} className={`border-b border-white/5 hover:bg-white/5 ${m.with >= 5000000 ? 'bg-accent-mint/5' : ''}`}>
                      <td className="py-2 pl-2 text-white font-medium">{m.label}</td>
                      <td className="py-2">
                        {m.installmentLoad > 0
                          ? <span className="text-accent-salmon">{formatCurrency(m.installmentLoad)}</span>
                          : <span className="text-text-tertiary">—</span>}
                      </td>
                      <td className={`py-2 ${m.without >= 5000000 ? 'text-accent-mint font-semibold' : ''}`}>
                        {formatCurrency(m.without)} {m.without >= 5000000 && '✅'}
                      </td>
                      <td className={`py-2 ${m.with >= 5000000 ? 'text-accent-mint font-semibold' : ''}`}>
                        {formatCurrency(m.with)} {m.with >= 5000000 && '✅'}
                      </td>
                      <td className={`py-2 text-right pr-2 ${diff > 0 ? 'text-accent-salmon' : 'text-text-tertiary'}`}>
                        {diff > 100 ? `-${formatCurrency(diff)}` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Empty state */}
      {purchases.length === 0 && (
        <div className="text-center py-6 text-text-tertiary text-xs">
          <ShoppingCart size={24} className="mx-auto mb-2 opacity-30" />
          Agregá compras para ver cómo impactan tu camino a $5M
        </div>
      )}
    </div>
  );
}

// ======================= MAIN DASHBOARD =======================
type DashboardProps = {
  projection: ProjectionResult;
  pureInterestStart: number;
  salaryAllocations: SalaryAllocation[];
  savingsRescue: SavingsRescue[];
  mercadoPagoGastos: number[];
  autoReconstruct: boolean;
  mpData: MPParsedData | null;
  onUpdateAllocation: (monthIdx: number, cardId: 'visa' | 'master', val: number) => void;
  onUpdateMercadoPago: (idx: number, val: number) => void;
  onUpdateSavingsRescue: (idx: number, field: string, val: string | number | boolean) => void;
  onSetAutoReconstruct: (v: boolean) => void;
  onApplyHardReset: () => void;
};

export function DashboardView({
  projection, pureInterestStart, salaryAllocations, savingsRescue,
  mercadoPagoGastos, autoReconstruct, mpData,
  onUpdateAllocation, onUpdateMercadoPago, onUpdateSavingsRescue,
  onSetAutoReconstruct, onApplyHardReset
}: DashboardProps) {
  const cuotasMensuales = mpData ? mpData.cuotasPendientes.reduce((a: number, c: {cuotaMensual: number}) => a + c.cuotaMensual, 0) : 0;
  const fijosBase = INITIAL_DATA.gastos.impuestos + INITIAL_DATA.gastos.fijosExtras;
  const savings = INITIAL_DATA.ahorro;

  // Shared state for both panels
  const [gastosPersonales, setGastosPersonales] = useState(120000);
  const [purchases, setPurchases] = useState<PlannedPurchase[]>([]);

  return (
    <div className="fade-in space-y-4">

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="dashboard-card p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
            <Activity size={14} className="text-accent-salmon" />
            Intereses que te cobra el banco
            <Tooltip content="Lo que el banco te cobra cada mes solamente por tener deuda. Es plata tirada."><Info size={12} className="text-text-tertiary hover:text-white" /></Tooltip>
          </div>
          <div className="text-2xl font-bold text-white mb-1.5">{formatCurrency(pureInterestStart)}</div>
          <div className="flex items-center gap-1.5 text-[10px] text-accent-salmon bg-accent-salmon/10 w-max px-2 py-0.5 rounded"><TrendingDown size={12} /> Plata que perdés cada mes</div>
        </div>

        <div className="dashboard-card p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
            <TrendingUp size={14} className="text-accent-mint" />
            Lo que generan tus ahorros
            <Tooltip content={`Cuánto crecen tus ${formatCurrency(savings)} este mes con el rendimiento del 26.3% anual.`}><Info size={12} className="text-text-tertiary hover:text-white" /></Tooltip>
          </div>
          <div className="text-2xl font-bold text-white mb-1.5">{formatCurrency(savings * TEM_SAVINGS)}</div>
          <div className="flex items-center gap-1.5 text-[10px] text-accent-mint bg-accent-mint/10 w-max px-2 py-0.5 rounded">Ganancia pasiva mensual</div>
        </div>

        <div className="dashboard-card p-4 flex flex-col justify-between bg-card-bg-light">
          <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
            <WalletCards size={14} className="text-accent-yellow" />
            Ahorros actuales
          </div>
          <div className="text-2xl font-bold text-accent-yellow mb-1.5">{formatCurrency(savings)}</div>
          <div className="text-[10px] text-text-tertiary">Post-reset · Se reconstruye con sueldo</div>
        </div>

        <div className="dashboard-card p-4 flex flex-col justify-between bg-card-bg-light">
          <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
            <LayoutDashboard size={14} className="text-accent-blue" />
            Gastos fijos del mes
          </div>
          <div className="text-2xl text-accent-blue font-bold mb-1.5">{formatCurrency(fijosBase)}</div>
          <div className="space-y-0.5 text-[9px] text-text-tertiary">
            <div className="flex justify-between"><span>Impuestos</span><span>{formatCurrency(INITIAL_DATA.gastos.impuestos)}</span></div>
            <div className="flex justify-between"><span>Servicios & Comida</span><span>{formatCurrency(INITIAL_DATA.gastos.fijosExtras)}</span></div>
          </div>
        </div>
      </div>

      {/* Reset Status Banner */}
      <div className="dashboard-card p-4 bg-accent-mint/5 border-accent-mint/20 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-mint/10 rounded-lg"><CheckCircle2 size={20} className="text-accent-mint" /></div>
          <div>
            <h3 className="font-semibold text-accent-mint text-sm">✅ Sueldo depositado — Estrategia activa</h3>
            <p className="text-[10px] text-text-secondary">Tu sueldo ya fue depositado. Pagás todo con sueldo, tus ahorros siguen creciendo intactos.</p>
          </div>
        </div>
        <div className="text-right text-[10px] text-text-tertiary">
          <div>Sueldo disponible: <strong className="text-accent-blue">{formatCurrency(INITIAL_DATA.sueldo)}</strong></div>
          <div>Ahorros protegidos: <strong className="text-accent-mint">{formatCurrency(INITIAL_DATA.ahorro)}</strong></div>
        </div>
      </div>

      {/* Monthly Strategy Panel */}
      <MonthlyStrategyPanel fijosBase={fijosBase} savings={savings} gastosPersonales={gastosPersonales} purchases={purchases} />

      {/* Purchase Planner */}
      <PurchasePlannerPanel fijosBase={fijosBase} savings={savings} gastosPersonales={gastosPersonales} setGastosPersonales={setGastosPersonales} purchases={purchases} setPurchases={setPurchases} />

      {/* Summary Card */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="xl:col-span-3 dashboard-card p-5">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Resumen mes a mes</h2>
          <div className="overflow-x-auto custom-scroll -mx-2 px-2 pb-2">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="text-text-secondary text-[10px] uppercase tracking-wider font-semibold border-b border-white/10">
                  <th className="py-3 pl-2 font-medium">Mes</th>
                  <th className="py-3 font-medium"><Tooltip content="Plata que sacás de tus ahorros para pagar deuda."><span className="border-b border-dashed border-text-tertiary pb-0.5 cursor-help">Pagado con ahorros</span></Tooltip></th>
                  <th className="py-3 font-medium"><Tooltip content="Intereses e impuestos que te cobra el banco por la deuda."><span className="border-b border-dashed border-text-tertiary pb-0.5 cursor-help">Intereses</span></Tooltip></th>
                  <th className="py-3 font-medium text-accent-blue">Pagado con sueldo</th>
                  <th className="py-3 font-medium">Deuda por tarjeta</th>
                  <th className="py-3 font-medium pr-2 text-right">Tus ahorros</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {projection.months.map((m, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 text-white font-medium pl-2">{m.monthStr}</td>
                    <td className="py-3"><span className="bg-accent-mint/10 text-accent-mint px-2 py-1 rounded text-[10px]">{formatCurrency(m.injection)}</span></td>
                    <td className="py-3 text-accent-salmon/90">+{formatCurrency(m.interest)}</td>
                    <td className="py-3 font-medium text-white">-{formatCurrency(m.bankPaid)}</td>
                    <td className="py-3 px-1">
                      <div className="flex gap-2 min-w-max">
                        {m.debtBreakdown.map(d => (
                          <div key={d.id} className="flex gap-1.5 items-center bg-card-bg px-2 py-1 rounded text-[10px] text-text-secondary border border-white/5">
                            {d.type === 'app' ? <Smartphone size={10} className="text-accent-blue" /> : <CreditCard size={10} className="text-red-400" />}
                            <span className={`${d.amount === 0 ? 'text-text-tertiary line-through' : 'font-semibold text-white'}`}>{formatCurrency(d.amount)}</span>
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

        <div className="dashboard-card p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold mb-4">Resumen</h2>
            <div className="dashboard-card-light p-3 rounded-xl mb-3 border border-white/5">
              <div className="text-[10px] text-text-secondary mb-1">Ahorros en Junio</div>
              <div className="text-xl font-bold text-accent-yellow mb-0.5">{formatCurrency(INITIAL_DATA.ahorro - projection.currentSelfDebt)}</div>
              <div className="text-[10px] text-text-tertiary">Empezaste con: {formatCurrency(INITIAL_DATA.ahorro)}</div>
            </div>
            <div className="dashboard-card-light p-3 rounded-xl">
              <div className="text-[10px] text-text-secondary mb-2 border-b border-white/5 pb-1">Balance</div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs"><span className="text-accent-salmon">Intereses pagados:</span><span className="font-medium">-{formatCurrency(projection.totalInterestPaid)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-accent-mint">Ganancia ahorros:</span><span className="font-medium">+{formatCurrency(projection.totalYieldEarned)}</span></div>
              </div>
            </div>
          </div>
          {projection.monthsToGoal !== null ? (
            <div className="w-full bg-accent-salmon/10 text-accent-salmon border border-accent-salmon/20 font-medium py-3 rounded-xl text-center text-xs mt-4 flex flex-col gap-1 items-center">
              <span>Para llegar a la meta:</span><b className="text-sm">Faltan {projection.monthsToGoal} meses más</b>
            </div>
          ) : (
            <button className="w-full bg-accent-yellow text-card-bg font-bold py-3 rounded-xl text-xs mt-4 hover:opacity-90 transition-opacity tracking-wide uppercase shadow-lg shadow-accent-yellow/20">
              Objetivo Cumplido ✅
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
