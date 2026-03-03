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

// Días hasta que te cae el sueldo (promedio 7 del mes)
const DAYS_TO_SALARY = 7;
const DAILY_DEBT_RATE = TEM_DEBT_FULL / 30;
const DAILY_SAVINGS_RATE = TEM_SAVINGS / 30;

type PayMode = 'full_now' | 'min_now_rest_salary' | 'min_only' | 'custom';

interface MonthScenario {
  month: number; // 0=Mar, 1=Apr, 2=May
  label: string;
  totalDue: number;
  minimum: number; // minimum payment
  mpDue: number;
  cardsDue: number;
  fijos: number;
}

// ======================= SCENARIO CALCULATOR =======================
function calcScenario(
  scenario: MonthScenario,
  mode: PayMode,
  customAmount: number,
  savings: number
) {
  const { totalDue, minimum, cardsDue } = scenario;

  let fromSavingsNow = 0;
  let fromSalarySoon = 0;
  let interestAccrued = 0;
  let savingsYieldLost = 0;
  let netCost = 0;

  if (mode === 'full_now') {
    // Pay everything from savings immediately
    fromSavingsNow = totalDue;
    fromSalarySoon = 0;
    interestAccrued = 0;
    savingsYieldLost = fromSavingsNow * DAILY_SAVINGS_RATE * DAYS_TO_SALARY;
    netCost = savingsYieldLost;
  } else if (mode === 'min_now_rest_salary') {
    // Pay minimum from savings now, rest from salary when it arrives
    const rest = Math.max(0, cardsDue - minimum);
    fromSavingsNow = minimum + scenario.fijos + scenario.mpDue;
    fromSalarySoon = rest;
    // Interest on unpaid card balance for DAYS_TO_SALARY days
    interestAccrued = rest * DAILY_DEBT_RATE * DAYS_TO_SALARY;
    savingsYieldLost = minimum * DAILY_SAVINGS_RATE * DAYS_TO_SALARY;
    netCost = interestAccrued + savingsYieldLost;
  } else if (mode === 'min_only') {
    // Pay minimum only from salary, cards keep accruing
    fromSavingsNow = 0;
    fromSalarySoon = minimum + scenario.fijos + scenario.mpDue;
    const unpaid = Math.max(0, cardsDue - minimum);
    interestAccrued = unpaid * DAILY_DEBT_RATE * 30;
    savingsYieldLost = 0;
    netCost = interestAccrued;
  } else {
    // Custom amount from savings
    const paying = Math.min(customAmount, totalDue);
    fromSavingsNow = paying;
    fromSalarySoon = Math.max(0, totalDue - paying);
    const unpaid = Math.max(0, cardsDue - paying);
    interestAccrued = unpaid * DAILY_DEBT_RATE * DAYS_TO_SALARY;
    savingsYieldLost = paying * DAILY_SAVINGS_RATE * DAYS_TO_SALARY;
    netCost = interestAccrued + savingsYieldLost;
  }

  const savingsAfter = savings - fromSavingsNow;
  const savingsYieldMonth = savingsAfter * TEM_SAVINGS;

  return { fromSavingsNow, fromSalarySoon, interestAccrued, savingsYieldLost, netCost, savingsAfter, savingsYieldMonth };
}

// ======================= PAYMENT SCENARIO PANEL =======================
function PaymentScenarioPanel({ fijosBase, savings }: { fijosBase: number; savings: number }) {
  const cuotasMasterAbril = 65470.30;
  const cuotasVisaAbril = 37165.48;
  const cuotasTarjetasMayo = 17244.56;
  const mpAbril = MP_CREDITS.reduce((a, c) => a + c.cuotaAbril, 0);
  const mpMayo = MP_CREDITS.reduce((a, c) => a + c.cuotaMayo, 0);
  const cardConsumption = INITIAL_DATA.deudas.reduce((a, d) => a + (d.consumption || 0), 0);
  const visaMin = INITIAL_DATA.deudas.find(d => d.id === 'visa')?.consumption || 0;
  const masterMin = INITIAL_DATA.deudas.find(d => d.id === 'master')?.consumption || 0;
  const marzoMin = visaMin * 0.05 + masterMin * 0.05; // ~5% min payment

  const months: MonthScenario[] = [
    { month: 0, label: 'Marzo 2026', totalDue: cardConsumption + fijosBase, minimum: marzoMin, cardsDue: cardConsumption, mpDue: 0, fijos: fijosBase },
    { month: 1, label: 'Abril 2026', totalDue: cuotasMasterAbril + cuotasVisaAbril + mpAbril + fijosBase, minimum: (cuotasMasterAbril + cuotasVisaAbril) * 0.05, cardsDue: cuotasMasterAbril + cuotasVisaAbril, mpDue: mpAbril, fijos: fijosBase },
    { month: 2, label: 'Mayo 2026', totalDue: cuotasTarjetasMayo + mpMayo + fijosBase, minimum: cuotasTarjetasMayo * 0.05, cardsDue: cuotasTarjetasMayo, mpDue: mpMayo, fijos: fijosBase },
  ];

  const [modes, setModes] = useState<PayMode[]>(['full_now', 'full_now', 'full_now']);
  const [customs, setCustoms] = useState<number[]>([cardConsumption, cuotasMasterAbril + cuotasVisaAbril, cuotasTarjetasMayo]);
  const [openMonth, setOpenMonth] = useState<number>(0);

  const modeOptions: { value: PayMode; icon: string; label: string; desc: string }[] = [
    { value: 'full_now', icon: '💸', label: 'Pago total ahora', desc: 'Pagás todo desde ahorros hoy' },
    { value: 'min_now_rest_salary', icon: '🕐', label: 'Mínimo ahora + resto con sueldo', desc: 'Pagás el mínimo con ahorros, el resto cuando cobrás' },
    { value: 'min_only', icon: '💰', label: 'Solo el mínimo', desc: 'Dejás el resto en ahorros (genera interés deuda)' },
    { value: 'custom', icon: '⚡', label: 'Custom', desc: 'Elegís exactamente cuánto pagar' },
  ];

  const modeColors: Record<PayMode, string> = {
    full_now: 'border-accent-mint text-accent-mint',
    min_now_rest_salary: 'border-accent-blue text-accent-blue',
    min_only: 'border-accent-yellow text-accent-yellow',
    custom: 'border-accent-salmon text-accent-salmon',
  };

  let runningSavings = savings;

  return (
    <div className="dashboard-card p-5">
      <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
        <Calculator size={16} className="text-accent-yellow" /> Simulador de Escenarios de Pago
      </h2>
      <p className="text-[10px] text-text-tertiary mb-4">Elegí cómo querés pagar cada mes y ve el impacto en tiempo real.</p>

      <div className="space-y-3">
        {months.map((m, idx) => {
          const result = calcScenario(m, modes[idx], customs[idx], runningSavings);
          const savingsForThisMonth = runningSavings;
          runningSavings = result.savingsAfter;
          const isOpen = openMonth === idx;
          const colorClass = modeColors[modes[idx]];
          const isNegativeSavings = result.savingsAfter < 0;

          return (
            <div key={idx} className={`border rounded-xl overflow-hidden transition-all ${colorClass.split(' ')[0]} bg-card-bg`}>
              {/* Month header */}
              <button
                onClick={() => setOpenMonth(isOpen ? -1 : idx)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white">{m.label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold bg-current/10 ${colorClass.split(' ')[1]}`}>
                    {modeOptions.find(o => o.value === modes[idx])?.icon} {modeOptions.find(o => o.value === modes[idx])?.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <div className="text-text-tertiary text-[9px]">Total a pagar</div>
                    <div className="font-bold text-white">{formatCurrency(m.totalDue)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-text-tertiary text-[9px]">Ahorros post-pago</div>
                    <div className={`font-bold ${isNegativeSavings ? 'text-accent-salmon' : 'text-accent-mint'}`}>{formatCurrency(result.savingsAfter)}</div>
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-text-tertiary" /> : <ChevronDown size={16} className="text-text-tertiary" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-white/5 space-y-4">
                  {/* Mode selector */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-3">
                    {modeOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { const n=[...modes]; n[idx]=opt.value; setModes(n); }}
                        className={`p-2.5 rounded-lg text-left border transition-all ${modes[idx] === opt.value ? modeColors[opt.value] + ' bg-current/10 border-current' : 'border-white/10 text-text-secondary hover:border-white/30'}`}
                      >
                        <div className="text-base mb-1">{opt.icon}</div>
                        <div className="text-[10px] font-semibold leading-tight">{opt.label}</div>
                        <div className="text-[9px] text-text-tertiary mt-0.5 leading-tight">{opt.desc}</div>
                      </button>
                    ))}
                  </div>

                  {/* Custom slider */}
                  {modes[idx] === 'custom' && (
                    <div className="bg-dashboard-bg/50 p-3 rounded-xl border border-white/5">
                      <div className="flex justify-between text-[11px] mb-2">
                        <span className="text-text-secondary">Cuánto pagás con ahorros:</span>
                        <span className="font-bold text-accent-salmon">{formatCurrency(customs[idx])}</span>
                      </div>
                      <input type="range" min={m.minimum} max={m.totalDue} step={5000}
                        value={customs[idx]}
                        onChange={e => { const n=[...customs]; n[idx]=Number(e.target.value); setCustoms(n); }}
                        className="w-full accent-accent-salmon h-1.5 bg-card-bg rounded-lg appearance-none cursor-pointer" />
                      <div className="flex justify-between text-[9px] text-text-tertiary mt-1">
                        <span>Mínimo {formatCurrency(m.minimum)}</span>
                        <span>Total {formatCurrency(m.totalDue)}</span>
                      </div>
                    </div>
                  )}

                  {/* Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {/* Left: flow */}
                    <div className="space-y-2 text-[11px]">
                      <div className="text-[9px] text-text-tertiary uppercase tracking-wider font-semibold">Flujo de plata</div>
                      <div className="flex justify-between"><span className="text-text-secondary">Pagás con ahorros ahora:</span><span className="font-semibold text-accent-salmon">{formatCurrency(result.fromSavingsNow)}</span></div>
                      {result.fromSalarySoon > 0 && <div className="flex justify-between"><span className="text-text-secondary">Pagás con sueldo (5-10/{idx === 0 ? 'Mar' : idx === 1 ? 'Abr' : 'May'}):</span><span className="font-semibold text-accent-blue">{formatCurrency(result.fromSalarySoon)}</span></div>}
                      <div className="flex justify-between border-t border-white/5 pt-2"><span className="text-text-secondary">Ahorros disponibles antes:</span><span className="text-white">{formatCurrency(savingsForThisMonth)}</span></div>
                      <div className="flex justify-between"><span className="font-bold text-text-secondary">Ahorros después:</span><span className={`font-bold ${result.savingsAfter < 0 ? 'text-accent-salmon' : 'text-accent-mint'}`}>{formatCurrency(result.savingsAfter)}</span></div>
                    </div>
                    {/* Right: cost analysis */}
                    <div className="space-y-2 text-[11px] bg-dashboard-bg/40 p-3 rounded-xl">
                      <div className="text-[9px] text-text-tertiary uppercase tracking-wider font-semibold">Análisis de costo</div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Interés deuda acumulada:</span>
                        <span className={result.interestAccrued > 0 ? 'text-accent-salmon font-semibold' : 'text-text-tertiary'}>
                          {result.interestAccrued > 0 ? `+${formatCurrency(result.interestAccrued)}` : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Yield perdido en ahorros:</span>
                        <span className={result.savingsYieldLost > 0 ? 'text-accent-yellow' : 'text-text-tertiary'}>
                          {result.savingsYieldLost > 0 ? `-${formatCurrency(result.savingsYieldLost)}` : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Yield que ganás después:</span>
                        <span className="text-accent-mint">+{formatCurrency(result.savingsYieldMonth)}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-2 font-bold">
                        <span>Costo neto esta decisión:</span>
                        <span className={result.netCost < 500 ? 'text-accent-mint' : result.netCost < 2000 ? 'text-accent-yellow' : 'text-accent-salmon'}>
                          {formatCurrency(result.netCost)}
                        </span>
                      </div>
                      {/* Auto recommendation */}
                      <div className={`mt-2 p-2 rounded text-[10px] ${result.netCost < 500 ? 'bg-accent-mint/10 text-accent-mint' : 'bg-accent-yellow/10 text-accent-yellow'}`}>
                        {modes[idx] === 'full_now' && '✅ Opción más económica a largo plazo. Sin intereses de deuda.'}
                        {modes[idx] === 'min_now_rest_salary' && `⚖️ Equilibrio. Pagás ~${formatCurrency(result.interestAccrued)} de interés por ${DAYS_TO_SALARY} días extra.`}
                        {modes[idx] === 'min_only' && `⚠️ Acumulás ${formatCurrency(result.interestAccrued)}/mes en intereses. Solo válido si necesitás liquidez urgente.`}
                        {modes[idx] === 'custom' && `📊 Pagás ${formatCurrency(customs[idx])}. ${result.interestAccrued > 0 ? `Acumulás ${formatCurrency(result.interestAccrued)} de interés sobre el resto.` : 'Sin intereses.'}`}
                      </div>
                    </div>
                  </div>

                  {/* Alerts */}
                  {isNegativeSavings && (
                    <div className="flex items-center gap-2 bg-accent-salmon/10 border border-accent-salmon/30 rounded-lg p-3 text-[11px] text-accent-salmon">
                      <AlertTriangle size={14} />
                      ¡Atención! Con este escenario tus ahorros quedan negativos. Considerá pagar con sueldo primero.
                    </div>
                  )}
                  {result.fromSavingsNow > savingsForThisMonth * 0.8 && !isNegativeSavings && (
                    <div className="flex items-center gap-2 bg-accent-yellow/10 border border-accent-yellow/20 rounded-lg p-3 text-[11px] text-accent-yellow">
                      <AlertTriangle size={14} />
                      Usás más del 80% de tus ahorros. Asegurate de tener colchón para imprevistos.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
        {months.map((m, idx) => {
          let s = savings;
          for (let i = 0; i <= idx; i++) {
            const r = calcScenario(months[i], modes[i], customs[i], s);
            s = r.savingsAfter;
          }
          return (
            <div key={idx} className="text-center">
              <div className="text-[9px] text-text-tertiary mb-1">Ahorros post {m.label.split(' ')[0]}</div>
              <div className={`text-sm font-bold ${s < 0 ? 'text-accent-salmon' : s < 500000 ? 'text-accent-yellow' : 'text-accent-mint'}`}>{formatCurrency(s)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ======================= SMARTBUY PANEL =======================
function SmartBuyPanel({ fijosBase, savings }: { fijosBase: number; savings: number }) {
  const [price, setPrice] = useState(800000);
  const [cuotas, setCuotas] = useState(6);
  const [buyMonth, setBuyMonth] = useState(0); // 0=now, 1=April, 2=May, 3=June+
  const [showDetail, setShowDetail] = useState(false);

  const monthLabels = ['Ahora (Marzo)', 'Abril 2026', 'Mayo 2026', 'Junio 2026'];
  const cuotaMensual = price / cuotas;

  // Estimate savings at each possible buy month
  const cuotasMasterAbril = 65470.30; const cuotasVisaAbril = 37165.48;
  const mpAbril = MP_CREDITS.reduce((a, c) => a + c.cuotaAbril, 0);
  const cuotasTarjetasMayo = 17244.56;
  const mpMayo = MP_CREDITS.reduce((a, c) => a + c.cuotaMayo, 0);
  const cardConsumption = INITIAL_DATA.deudas.reduce((a, d) => a + (d.consumption || 0), 0);

  const obligacionesByMonth = [
    cardConsumption + fijosBase, // Marzo
    cuotasMasterAbril + cuotasVisaAbril + mpAbril + fijosBase, // Abril
    cuotasTarjetasMayo + mpMayo + fijosBase, // Mayo
    fijosBase, // Junio+
  ];

  // Savings at each month start (assuming full payment each time)
  const savingsByMonthStart: number[] = [savings];
  for (let i = 0; i < 3; i++) {
    const prev = savingsByMonthStart[i];
    const afterYield = prev * (1 + TEM_SAVINGS);
    const surp = Math.max(0, INITIAL_DATA.sueldo - obligacionesByMonth[i]);
    savingsByMonthStart.push(afterYield + surp);
  }

  const savingsAtBuy = savingsByMonthStart[buyMonth];
  const canAffordCash = savingsAtBuy >= price;
  const canAffordInstallment = INITIAL_DATA.sueldo - obligacionesByMonth[Math.min(buyMonth, 3)] - cuotaMensual > 50000;

  // Project savings with and without purchase (6 months forward from buyMonth)
  const projComparison: { label: string; without: number; with: number }[] = [];
  let swithout = savingsAtBuy;
  let swith = savingsAtBuy;
  if (cuotas === 1) swith -= price;

  const futureMonthNames = ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  for (let i = 0; i < 8; i++) {
    swithout += swithout * TEM_SAVINGS + Math.max(0, INITIAL_DATA.sueldo - (i < obligacionesByMonth.length ? obligacionesByMonth[buyMonth + i] || fijosBase : fijosBase));
    swith += swith * TEM_SAVINGS + Math.max(0, INITIAL_DATA.sueldo - (i < obligacionesByMonth.length ? obligacionesByMonth[buyMonth + i] || fijosBase : fijosBase) - (i < cuotas ? cuotaMensual : 0));
    projComparison.push({
      label: futureMonthNames[(buyMonth + i + 1) % 10],
      without: swithout,
      with: swith,
    });
  }

  const reached5MWithout = projComparison.findIndex(m => m.without >= 5000000);
  const reached5MWith = projComparison.findIndex(m => m.with >= 5000000);
  const delay = reached5MWith >= 0 && reached5MWithout >= 0 ? reached5MWith - reached5MWithout : reached5MWith >= 0 ? 0 : -1;

  return (
    <div className="dashboard-card p-5">
      <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
        <ShoppingCart size={16} className="text-accent-blue" /> SmartBuy — ¿Cuándo conviene comprar?
      </h2>
      <p className="text-[10px] text-text-tertiary mb-4">Ingresá lo que querés comprar y ve el impacto en tus ahorros y cuándo sería el mejor momento.</p>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div>
          <label className="text-[10px] text-text-secondary uppercase font-semibold tracking-wider block mb-2">Precio total</label>
          <div className="flex justify-between text-xs mb-1"><span className="text-text-tertiary">$50k</span><span className="text-white font-bold">{formatCurrency(price)}</span><span className="text-text-tertiary">$3M</span></div>
          <input type="range" min={50000} max={3000000} step={25000} value={price}
            onChange={e => setPrice(Number(e.target.value))}
            className="w-full accent-accent-blue h-2 bg-card-bg rounded-lg appearance-none cursor-pointer" />
        </div>
        <div>
          <label className="text-[10px] text-text-secondary uppercase font-semibold tracking-wider block mb-2">Cuotas sin interés</label>
          <div className="flex gap-1.5 flex-wrap">
            {[1, 3, 6, 9, 12].map(n => (
              <button key={n} onClick={() => setCuotas(n)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${cuotas === n ? 'bg-accent-blue text-white border-accent-blue' : 'bg-card-bg border-white/10 text-text-secondary hover:border-white/30'}`}>
                {n}x
              </button>
            ))}
          </div>
          <div className="text-[10px] text-text-tertiary mt-2">Cuota: <strong className="text-white">{formatCurrency(cuotaMensual)}</strong>/mes</div>
        </div>
        <div>
          <label className="text-[10px] text-text-secondary uppercase font-semibold tracking-wider block mb-2">¿Cuándo comprás?</label>
          <div className="space-y-1">
            {monthLabels.map((ml, i) => (
              <button key={i} onClick={() => setBuyMonth(i)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all border ${buyMonth === i ? 'bg-accent-blue/20 border-accent-blue text-white' : 'bg-card-bg border-white/10 text-text-secondary hover:border-white/20'}`}>
                {ml}
                <span className="float-right text-[9px] text-text-tertiary">{formatCurrency(savingsByMonthStart[i])}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className={`dashboard-card-light p-4 rounded-xl border ${canAffordInstallment ? 'border-accent-mint/30 bg-accent-mint/5' : 'border-accent-salmon/30 bg-accent-salmon/5'}`}>
          <div className="text-[10px] text-text-tertiary uppercase font-semibold tracking-wider mb-2">¿Podés pagarlo en cuotas?</div>
          <div className={`text-xl font-bold mb-1 ${canAffordInstallment ? 'text-accent-mint' : 'text-accent-salmon'}`}>
            {canAffordInstallment ? '✅ Sí' : '⚠️ Ajustado'}
          </div>
          <div className="text-[10px] text-text-secondary">
            {cuotaMensual.toFixed(0) === '1' ? 'Cuota única: ' : `${cuotas} cuotas de `}<strong>{formatCurrency(cuotaMensual)}</strong>/mes
          </div>
        </div>
        <div className={`dashboard-card-light p-4 rounded-xl border ${canAffordCash ? 'border-accent-mint/30 bg-accent-mint/5' : 'border-white/10'}`}>
          <div className="text-[10px] text-text-tertiary uppercase font-semibold tracking-wider mb-2">¿Podés pagarlo en efectivo?</div>
          <div className={`text-xl font-bold mb-1 ${canAffordCash ? 'text-accent-mint' : 'text-text-secondary'}`}>
            {canAffordCash ? '✅ Sí' : '❌ No'}
          </div>
          <div className="text-[10px] text-text-secondary">
            Ahorros disponibles: <strong>{formatCurrency(savingsAtBuy)}</strong>
          </div>
        </div>
        <div className="dashboard-card-light p-4 rounded-xl border border-white/10">
          <div className="text-[10px] text-text-tertiary uppercase font-semibold tracking-wider mb-2">Impacto en meta $5M</div>
          <div className={`text-xl font-bold mb-1 ${delay <= 0 ? 'text-accent-mint' : delay <= 2 ? 'text-accent-yellow' : 'text-accent-salmon'}`}>
            {delay < 0 ? 'Sin cambios' : delay === 0 ? 'Sin impacto' : `+${delay} ${delay === 1 ? 'mes' : 'meses'}`}
          </div>
          <div className="text-[10px] text-text-secondary">
            {delay <= 0 ? 'La compra no afecta tu meta' : `Llegarías a $5M ${delay} ${delay === 1 ? 'mes' : 'meses'} más tarde`}
          </div>
        </div>
      </div>

      {/* Recommendation banner */}
      <div className={`p-4 rounded-xl border mb-4 text-xs ${buyMonth >= 3 && canAffordInstallment ? 'bg-accent-mint/10 border-accent-mint/30 text-accent-mint' : buyMonth <= 1 && !canAffordInstallment ? 'bg-accent-salmon/10 border-accent-salmon/30 text-accent-salmon' : 'bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow'}`}>
        <strong>Recomendación: </strong>
        {buyMonth >= 3 && canAffordInstallment ? `Junio es el mejor momento. Sin cuotas de tarjetas ni MP, podés absorber la cuota de ${formatCurrency(cuotaMensual)}/mes sin problema.` :
          buyMonth === 0 && !canAffordInstallment ? `Espería a Junio. En Marzo todavía tenés los consumos de tarjetas (~${formatCurrency(cardConsumption)}) y sumar ${formatCurrency(cuotaMensual)}/mes puede complicarte.` :
          buyMonth === 1 && !canAffordInstallment ? `En Abril todavía pagás cuotas de tarjetas y MP (~${formatCurrency(cuotasMasterAbril + cuotasVisaAbril + mpAbril)}). Considerar postergar.` :
          `Podés comprarlo en ${monthLabels[buyMonth]}. Cuota de ${formatCurrency(cuotaMensual)}/mes. Revisá que te quede liquidez suficiente.`}
      </div>

      {/* Chart comparison */}
      <button onClick={() => setShowDetail(!showDetail)} className="text-[11px] text-text-secondary hover:text-white flex items-center gap-1 mb-3 transition-colors">
        {showDetail ? <ChevronUp size={12} /> : <ChevronDown size={12} />} {showDetail ? 'Ocultar' : 'Ver'} proyección con vs sin compra
      </button>

      {showDetail && (
        <div className="overflow-x-auto custom-scroll">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="text-text-secondary text-[9px] uppercase tracking-wider border-b border-white/10">
                <th className="py-2 pl-2">Mes</th>
                <th className="py-2">Sin compra</th>
                <th className="py-2">Con compra ({cuotas}x)</th>
                <th className="py-2 text-right pr-2">Diferencia</th>
              </tr>
            </thead>
            <tbody className="text-[11px]">
              {projComparison.map((m, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 pl-2 text-white font-medium">{m.label}</td>
                  <td className={`py-2 ${m.without >= 5000000 ? 'text-accent-mint font-semibold' : ''}`}>{formatCurrency(m.without)} {m.without >= 5000000 && '✅'}</td>
                  <td className={`py-2 ${m.with >= 5000000 ? 'text-accent-mint font-semibold' : ''}`}>{formatCurrency(m.with)} {m.with >= 5000000 && '✅'}</td>
                  <td className={`py-2 text-right pr-2 ${m.without - m.with > 0 ? 'text-accent-salmon' : 'text-text-tertiary'}`}>
                    {m.without !== m.with ? `-${formatCurrency(m.without - m.with)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
  const fijosBase = INITIAL_DATA.gastos.expensas + INITIAL_DATA.gastos.fijosExtras;
  const savings = INITIAL_DATA.ahorro;

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
            <div className="flex justify-between"><span>Expensas</span><span>{formatCurrency(INITIAL_DATA.gastos.expensas)}</span></div>
            <div className="flex justify-between"><span>Movistar</span><span>{formatCurrency(INITIAL_DATA.gastos.fijosExtras)}</span></div>
          </div>
        </div>
      </div>

      {/* Reset Status Banner */}
      <div className="dashboard-card p-4 bg-accent-mint/5 border-accent-mint/20 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-mint/10 rounded-lg"><CheckCircle2 size={20} className="text-accent-mint" /></div>
          <div>
            <h3 className="font-semibold text-accent-mint text-sm">✅ Reset completado — Deuda de tarjetas eliminada</h3>
            <p className="text-[10px] text-text-secondary">Pagaste la deuda con tus ahorros. Ahora tu sueldo va a reconstruir tus inversiones y pagar los consumos del mes.</p>
          </div>
        </div>
        <div className="text-right text-[10px] text-text-tertiary">
          <div>Ahorros actuales: <strong className="text-accent-mint">{formatCurrency(INITIAL_DATA.ahorro)}</strong></div>
          <div>Consumos pendientes: <strong className="text-accent-blue">{formatCurrency(INITIAL_DATA.deudas.reduce((a, d) => a + (d.consumption || 0), 0))}</strong></div>
        </div>
      </div>

      {/* Payment Scenario Simulator */}
      <PaymentScenarioPanel fijosBase={fijosBase} savings={savings} />

      {/* SmartBuy */}
      <SmartBuyPanel fijosBase={fijosBase} savings={savings} />

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
