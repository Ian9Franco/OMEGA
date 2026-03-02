"use client";
import React from 'react';
import { Scale, Zap, Clock, Trophy, Flame, Activity, User, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { INITIAL_DATA, CONSTANTS, TEM_SAVINGS, formatCurrency } from '@/lib/constants';
import { runStrategyA, runStrategyB } from '@/lib/calculations';
import type { MPParsedData, ProjectionResult, SimMonth } from '@/lib/types';
import { Tooltip } from '../Tooltip';

// --- Convert user's projection into SimMonth[] format for comparison ---
function projectToSimMonths(projection: ProjectionResult): { months: SimMonth[]; totalInterest: number; totalYield: number; monthsTo5M: number } {
  const monthNames = ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb'];
  let totalInterest = 0;
  let totalYield = 0;
  let monthsTo5M = -1;

  const months: SimMonth[] = projection.months.map((m, i) => {
    totalInterest += m.interest;
    totalYield += m.savingsYield;
    if (monthsTo5M === -1 && m.savingsEnd >= 5000000 && m.bankDebtEnd <= 0) monthsTo5M = i + 1;
    return {
      month: i,
      label: `${monthNames[i % 12]} ${2026 + Math.floor((i + 2) / 12)}`,
      savings: m.savingsEnd,
      debt: m.bankDebtEnd,
      interestCharged: m.interest,
      yieldEarned: m.savingsYield,
      netWorth: m.savingsEnd - m.bankDebtEnd,
      salaryToDebt: m.bankPaid,
      salaryToSavings: 0,
      cushion: 0,
    };
  });

  // If only 4 months in projection, estimate forward based on last month trends
  if (months.length < 12) {
    const last = months[months.length - 1];
    let savings = last.savings;
    let debt = last.debt;
    for (let i = months.length; i < 24; i++) {
      const y = savings * TEM_SAVINGS;
      savings += y;
      totalYield += y;
      // Assume debt stays if still positive (simplified)
      if (monthsTo5M === -1 && savings >= 5000000 && debt <= 0) monthsTo5M = i + 1;
      months.push({
        month: i,
        label: `${monthNames[i % 12]} ${2026 + Math.floor((i + 2) / 12)}`,
        savings, debt,
        interestCharged: 0, yieldEarned: y,
        netWorth: savings - debt,
        salaryToDebt: 0, salaryToSavings: 0, cushion: 0,
      });
    }
  }

  if (monthsTo5M === -1) monthsTo5M = 24;
  return { months, totalInterest, totalYield, monthsTo5M };
}

export function SimuladorView({ mpData, mercadoPagoGastos, projection }: {
  mpData: MPParsedData | null;
  mercadoPagoGastos: number[];
  projection: ProjectionResult;
}) {
  const stratA = runStrategyA(mpData, mercadoPagoGastos);
  const stratB = runStrategyB(mpData, mercadoPagoGastos);
  const userPlan = projectToSimMonths(projection);

  // Determine which is best
  const plans = [
    { key: 'user', label: 'Tu Plan Actual', months: userPlan.months, m5M: userPlan.monthsTo5M, interest: userPlan.totalInterest, yield: userPlan.totalYield, color: 'accent-blue', icon: <User size={16} /> },
    { key: 'a', label: 'Hard Reset (Pagar con Ahorros)', months: stratA.months, m5M: stratA.monthsTo5M, interest: stratA.totalInterest, yield: stratA.totalYield, color: 'accent-mint', icon: <Zap size={16} /> },
    { key: 'b', label: 'Sin Tocar Ahorros', months: stratB.months, m5M: stratB.monthsTo5M, interest: stratB.totalInterest, yield: stratB.totalYield, color: 'accent-yellow', icon: <Clock size={16} /> },
  ].sort((a, b) => a.m5M - b.m5M);

  const best = plans[0];
  const worst = plans[plans.length - 1];
  const monthsDiff = worst.m5M - best.m5M;
  const interestDiff = worst.interest - best.interest;

  const allValues = [...stratA.months.map(m => m.savings), ...stratB.months.map(m => m.savings), ...userPlan.months.map(m => m.savings)];
  const maxVal = Math.max(...allValues, 5000000);
  const temEffective = CONSTANTS.TEM_DEBT * (1 + CONSTANTS.IVA) + CONSTANTS.IIBB + CONSTANTS.SELLOS;

  return (
    <div className="space-y-6 fade-in">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-2"><Scale size={20} className="text-accent-blue" /> Simulador: Comparación de Estrategias</h2>
      <p className="text-xs text-text-secondary -mt-4">Compará tu configuración actual del Dashboard contra las dos estrategias base. Los datos del Simulador se recalculan cada vez que movés un slider.</p>

      {/* Verdict Card */}
      <div className={`dashboard-card p-6 bg-${best.color}/5 border-${best.color}/20`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl bg-${best.color}/20 flex items-center justify-center shrink-0`}>
            <Trophy size={24} className={`text-${best.color}`} />
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-bold text-${best.color} mb-1`}>
              MEJOR ESTRATEGIA: {best.label}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Llega a $5M + $0 deuda en <strong className={`text-${best.color}`}>{best.m5M} meses</strong>.
              {monthsDiff > 0 && <> Eso es <strong className={`text-${best.color}`}>{monthsDiff} {monthsDiff === 1 ? 'mes' : 'meses'} antes</strong> que la peor opción.</>}
              {interestDiff > 0 && <> Se ahorra <strong className={`text-${best.color}`}>{formatCurrency(interestDiff)}</strong> en intereses vs la alternativa más cara.</>}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="dashboard-card p-4 text-center">
          <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">TEM Deuda (efectiva)</p>
          <p className="text-2xl font-bold text-accent-salmon">{(temEffective * 100).toFixed(1)}%</p>
          <p className="text-[9px] text-text-tertiary mt-1">Int + IVA + IIBB + Sellos</p>
        </div>
        <div className="dashboard-card p-4 text-center">
          <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">TEM Ahorro</p>
          <p className="text-2xl font-bold text-accent-mint">{(TEM_SAVINGS * 100).toFixed(2)}%</p>
          <p className="text-[9px] text-text-tertiary mt-1">{(CONSTANTS.TNA_SAVINGS * 100)}% TNA / 12</p>
        </div>
        <div className="dashboard-card p-4 text-center">
          <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">Pérdida vs Ganancia</p>
          <p className="text-2xl font-bold text-accent-yellow">{(temEffective / TEM_SAVINGS).toFixed(1)}x</p>
          <p className="text-[9px] text-text-tertiary mt-1">La deuda cuesta X veces más</p>
        </div>
        <div className="dashboard-card p-4 text-center">
          <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">Tu Plan vs Hard Reset</p>
          <p className={`text-2xl font-bold ${userPlan.monthsTo5M <= stratA.monthsTo5M ? 'text-accent-mint' : 'text-accent-salmon'}`}>
            {userPlan.monthsTo5M <= stratA.monthsTo5M ? '✅ Igual o mejor' : `+${userPlan.monthsTo5M - stratA.monthsTo5M}m`}
          </p>
          <p className="text-[9px] text-text-tertiary mt-1">Diferencia en meses</p>
        </div>
      </div>

      {/* 3-Way Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan, rank) => (
          <div key={plan.key} className={`dashboard-card p-5 border-l-4 border-l-${plan.color} ${rank === 0 ? `bg-${plan.color}/5` : ''}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-${plan.color}`}>{plan.icon}</span>
              <h3 className={`font-semibold text-${plan.color} text-sm`}>{plan.label}</h3>
              {rank === 0 && <span className="text-[9px] bg-accent-mint/20 text-accent-mint px-1.5 py-0.5 rounded ml-auto">MEJOR</span>}
            </div>
            <div className="space-y-2 text-xs text-text-secondary">
              <div className="flex justify-between"><span>Costo en intereses:</span><span className={plan.interest > best.interest ? 'text-accent-salmon font-semibold' : 'text-accent-mint font-semibold'}>{formatCurrency(plan.interest)}</span></div>
              <div className="flex justify-between"><span>Ganancia de ahorros:</span><span className="text-accent-mint font-semibold">+{formatCurrency(plan.yield)}</span></div>
              <div className="flex justify-between"><span>Plata Ocio / Vida:</span><span className="text-accent-blue font-semibold">~15% de lo que sobra</span></div>
              <div className="flex justify-between border-t border-white/5 pt-2"><span className="font-semibold">🎯 Meta en:</span><span className={`font-bold text-lg text-${plan.color}`}>{plan.m5M} meses</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Net Worth Trajectory Chart — 3 lines */}
      <div className="dashboard-card p-6">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
          Evolución de Tu Dinero (Ahorros Menos Deudas)
        </h3>
        <div className="flex items-end h-[250px] lg:h-[300px] gap-[2px] relative border-b border-l border-white/10 pb-4 pl-6">
          <div className="absolute left-[-2px] top-0 text-[9px] text-text-tertiary">5M</div>
          <div className="absolute left-[-2px] top-1/2 text-[9px] text-text-tertiary">{formatCurrency(maxVal / 2)}</div>
          <div className="absolute left-6 right-0 border-t border-dashed border-accent-mint/30" style={{top: `${(1 - 5000000 / maxVal) * 100}%`}}>
            <span className="text-[8px] text-accent-mint/50 absolute -top-3 right-0">META $5M</span>
          </div>
          {userPlan.months.slice(0, 24).map((mU, i) => {
            const mA = stratA.months[i] || mU;
            const mB = stratB.months[i] || mU;
            
            const savU = mU.savings; const debU = mU.debt; const nwU = Math.max(0, mU.netWorth);
            const savA = mA.savings; const debA = mA.debt; const nwA = Math.max(0, mA.netWorth);
            const savB = mB.savings; const debB = mB.debt; const nwB = Math.max(0, mB.netWorth);
            
            const hNwU = (nwU / maxVal) * 100; const hDebU = (debU / maxVal) * 100;
            const hNwA = (nwA / maxVal) * 100; const hDebA = (debA / maxVal) * 100;
            const hNwB = (nwB / maxVal) * 100; const hDebB = (debB / maxVal) * 100;
            
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-card-bg-light border border-white/10 p-3 rounded text-[9px] w-52 shadow-xl z-20 pointer-events-none">
                  <div className="font-bold text-white mb-2 pb-1 border-b border-white/10">{mU.label}</div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-accent-blue"><span>Tu Plan:</span><div className="text-right"><span>{formatCurrency(nwU)} neto</span><br/><span className="text-[8px] opacity-80">(Ahorro: {formatCurrency(savU)} | Deuda: {formatCurrency(debU)})</span></div></div>
                    <div className="flex justify-between items-center text-accent-mint mt-1"><span>Hard Reset:</span><div className="text-right"><span>{formatCurrency(nwA)} neto</span><br/><span className="text-[8px] opacity-80">(Ahorro: {formatCurrency(savA)} | Deuda: {formatCurrency(debA)})</span></div></div>
                    <div className="flex justify-between items-center text-accent-yellow mt-1"><span>Sin Ahorros:</span><div className="text-right"><span>{formatCurrency(nwB)} neto</span><br/><span className="text-[8px] opacity-80">(Ahorro: {formatCurrency(savB)} | Deuda: {formatCurrency(debB)})</span></div></div>
                  </div>
                </div>
                <div className="flex items-end gap-[1px] w-full h-full">
                  <div className="flex-1 h-full flex flex-col justify-end">
                    <div style={{height: `${hNwU}%`}} className="w-full bg-accent-blue/80 rounded-t-sm transition-all" />
                    {debU > 0 && <div style={{height: `${hDebU}%`}} className="w-full bg-accent-salmon/80 transition-all border-t border-black/20" />}
                  </div>
                  <div className="flex-1 h-full flex flex-col justify-end">
                    <div style={{height: `${hNwA}%`}} className="w-full bg-accent-mint/80 rounded-t-sm transition-all" />
                    {debA > 0 && <div style={{height: `${hDebA}%`}} className="w-full bg-accent-salmon/80 transition-all border-t border-black/20" />}
                  </div>
                  <div className="flex-1 h-full flex flex-col justify-end">
                    <div style={{height: `${hNwB}%`}} className="w-full bg-accent-yellow/80 rounded-t-sm transition-all" />
                    {debB > 0 && <div style={{height: `${hDebB}%`}} className="w-full bg-accent-salmon/80 transition-all border-t border-black/20" />}
                  </div>
                </div>
                {i % 3 === 0 && <span className="text-[8px] text-text-tertiary absolute -bottom-5 w-max">{mU.label.replace(' 2026', '').replace(' 2027', "'")}</span>}
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-6 text-[10px] text-text-secondary pt-6">
          <span className="flex items-center gap-2"><div className="w-3 h-3 bg-accent-blue/80 rounded-sm" /> Tu Plan</span>
          <span className="flex items-center gap-2"><div className="w-3 h-3 bg-accent-mint/80 rounded-sm" /> Hard Reset</span>
          <span className="flex items-center gap-2"><div className="w-3 h-3 bg-accent-yellow/80 rounded-sm" /> Sin Tocar Ahorros</span>
          <span className="flex items-center gap-2 ml-4 border-l border-white/10 pl-6"><div className="w-3 h-3 bg-accent-salmon/80 rounded-sm" /> Deuda (Base)</span>
        </div>
      </div>

      {/* Comparative Table */}
      <div className="dashboard-card p-5">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity size={14} className="text-accent-blue" /> Tabla Mes a Mes — Tu Plan vs Hard Reset
        </h3>
        <div className="overflow-x-auto custom-scroll -mx-2 px-2 pb-2">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="text-text-secondary text-[9px] uppercase tracking-wider font-semibold border-b border-white/10">
                <th className="py-2 pl-2">Mes</th>
                <th className="py-2 text-accent-blue">Tu Ahorro</th>
                <th className="py-2 text-accent-blue">Tu Deuda</th>
                <th className="py-2 text-accent-blue">Tu Int.</th>
                <th className="py-2 border-l border-white/10 pl-3 text-accent-mint">HR Ahorro</th>
                <th className="py-2 text-accent-mint">HR Deuda</th>
                <th className="py-2 text-accent-mint">HR Int.</th>
                <th className="py-2 border-l border-white/10 pl-3 text-accent-yellow">B Ahorro</th>
                <th className="py-2 text-accent-yellow">B Deuda</th>
                <th className="py-2 pr-2 text-right">Δ Tu vs HR</th>
              </tr>
            </thead>
            <tbody className="text-[10px]">
              {userPlan.months.slice(0, 12).map((mU, i) => {
                const mA = stratA.months[i] || mU;
                const mB = stratB.months[i] || mU;
                const delta = mU.netWorth - mA.netWorth;
                return (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-2 pl-2 font-medium text-white">{mU.label}</td>
                    <td className="py-2 text-accent-blue">{formatCurrency(mU.savings)}</td>
                    <td className="py-2">{mU.debt > 0 ? <span className="text-accent-salmon">{formatCurrency(mU.debt)}</span> : <span className="text-accent-mint">$0 ✓</span>}</td>
                    <td className="py-2 text-accent-salmon/70">{mU.interestCharged > 0 ? formatCurrency(mU.interestCharged) : '—'}</td>
                    <td className="py-2 border-l border-white/10 pl-3 text-accent-mint">{formatCurrency(mA.savings)}</td>
                    <td className="py-2">{mA.debt > 0 ? <span className="text-accent-salmon">{formatCurrency(mA.debt)}</span> : <span className="text-accent-mint">$0 ✓</span>}</td>
                    <td className="py-2 text-accent-salmon/70">{mA.interestCharged > 0 ? formatCurrency(mA.interestCharged) : '—'}</td>
                    <td className="py-2 border-l border-white/10 pl-3 text-accent-yellow">{formatCurrency(mB.savings)}</td>
                    <td className="py-2">{mB.debt > 0 ? <span className="text-accent-salmon">{formatCurrency(mB.debt)}</span> : <span className="text-accent-mint">$0 ✓</span>}</td>
                    <td className={`py-2 pr-2 text-right font-semibold ${delta >= 0 ? 'text-accent-mint' : 'text-accent-salmon'}`}>
                      <Tooltip 
                        content={delta >= 0 ? `Tu Plan gana por ${formatCurrency(delta)} porque los intereses que pagás son menores al rendimiento de no tocar esos ahorros, o porque inyectaste lo suficiente para empatar a Hard Reset.` : `Hard Reset te gana por ${formatCurrency(Math.abs(delta))} porque los intereses de deuda que estás pagando en Tu Plan son mucho más caros que la ganancia de esos ahorros.`}
                        position="left"
                      >
                        <span className="cursor-help border-b border-dashed border-current pb-0.5">
                          {delta >= 0 ? '+' : ''}{formatCurrency(delta)}
                        </span>
                      </Tooltip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Salary Roadmap — What to do with your salary */}
      <div className="dashboard-card p-5 border-l-4 border-l-accent-blue">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Zap size={14} className="text-accent-blue" /> Roadmap del Sueldo: ¿Qué Hacer Cada Mes?
        </h3>
        <p className="text-[10px] text-text-tertiary mb-4">Después de pagar tus gastos fijos ({formatCurrency(projection.months[0]?.gastosFijosTotales || 0)}), te va a sobrar {formatCurrency(INITIAL_DATA.sueldo - (projection.months[0]?.gastosFijosTotales || 0))} de tu sueldo este mes. Acá te decimos qué hacer con esa plata que sobra para cada plan.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Hard Reset Roadmap */}
          <div className="bg-accent-mint/5 border border-accent-mint/20 rounded-xl p-4">
            <h4 className="text-xs font-bold text-accent-mint flex items-center gap-2 mb-3"><Zap size={12} /> Si Aplicás Hard Reset</h4>
            <div className="space-y-3 text-[11px]">
              {stratA.months.slice(0, 6).map((m, i) => {
                const surplus = INITIAL_DATA.sueldo - (projection.months[i]?.gastosFijosTotales || 0);
                return (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`text-[9px] font-bold w-12 shrink-0 ${i === 0 ? 'text-accent-mint' : m.debt > 0 ? 'text-accent-salmon' : 'text-accent-mint'}`}>{m.label}</span>
                    <div className="flex-1 text-text-secondary">
                      {m.debt <= 0 ? (
                        <><strong className="text-accent-mint">Deuda $0 ✓</strong> — {formatCurrency(m.salaryToSavings)} → ahorro | <strong className="text-accent-blue">{formatCurrency(m.cushion)} para ocio</strong></>
                      ) : (
                        <>{formatCurrency(m.salaryToDebt)} → deuda | {formatCurrency(m.salaryToSavings)} → ahorro | <strong className="text-accent-blue">{formatCurrency(m.cushion)} para ocio</strong></>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Plan Roadmap */}
          <div className="bg-accent-blue/5 border border-accent-blue/20 rounded-xl p-4">
            <h4 className="text-xs font-bold text-accent-blue flex items-center gap-2 mb-3"><User size={12} /> Tu Plan Actual (Dashboard)</h4>
            <div className="space-y-3 text-[11px]">
              {userPlan.months.slice(0, 6).map((m, i) => {
                const surplus = INITIAL_DATA.sueldo - (projection.months[i]?.gastosFijosTotales || 0);
                const toDebt = m.salaryToDebt;
                const toSavings = Math.max(0, surplus - toDebt);
                return (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`text-[9px] font-bold w-12 shrink-0 ${m.debt > 0 ? 'text-accent-blue' : 'text-accent-mint'}`}>{m.label}</span>
                    <div className="flex-1 text-text-secondary">
                      {m.debt > 0 ? (
                        <>{formatCurrency(toDebt)} → tarjetas | {formatCurrency(toSavings)} → {toSavings > 0 ? 'ahorro' : <strong className="text-accent-salmon">sin sobrante</strong>}</>
                      ) : (
                        <><strong className="text-accent-mint">Deuda $0 ✓</strong> — {formatCurrency(m.salaryToSavings)} → ahorro | <strong className="text-accent-blue">{formatCurrency(m.cushion)} para ocio</strong></>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strategy B Roadmap */}
          <div className="bg-accent-yellow/5 border border-accent-yellow/20 rounded-xl p-4">
            <h4 className="text-xs font-bold text-accent-yellow flex items-center gap-2 mb-3"><Clock size={12} /> Sin Tocar Ahorros</h4>
            <div className="space-y-3 text-[11px]">
              {stratB.months.slice(0, 6).map((m, i) => {
                const surplus = INITIAL_DATA.sueldo - (projection.months[i]?.gastosFijosTotales || 0);
                return (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`text-[9px] font-bold w-12 shrink-0 ${m.debt > 0 ? 'text-accent-yellow' : 'text-accent-mint'}`}>{m.label}</span>
                    <div className="flex-1 text-text-secondary">
                      {m.debt > 0 ? (
                        <>{formatCurrency(m.salaryToDebt)} → tarjetas (<span className="text-accent-salmon">int: {formatCurrency(m.interestCharged)}</span>) | <strong className="text-accent-blue">{formatCurrency(m.cushion)} para ocio</strong></>
                      ) : (
                        <><strong className="text-accent-mint">Libre</strong> — {formatCurrency(m.salaryToSavings)} → ahorro | <strong className="text-accent-blue">{formatCurrency(m.cushion)} para ocio</strong></>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-text-tertiary flex items-center gap-2">
          <Activity size={12} className="text-accent-blue shrink-0" />
          <span><strong className="text-white">Regla de oro:</strong> Una vez que no tengas más deuda, toda la plata que te sobre en el mes ({formatCurrency(INITIAL_DATA.sueldo - (projection.months[0]?.gastosFijosTotales || 0))}) se guarda en tus inversiones en MercadoPago para que siga creciendo con {((TEM_SAVINGS * 12) * 100).toFixed(0)}% TNA hasta que consigas tus 5 millones.</span>
        </div>
      </div>

      {/* Explanation */}
      <div className="dashboard-card p-5 bg-card-bg-light">
        <div className="flex items-start gap-3">
          <Flame size={18} className="text-accent-salmon shrink-0 mt-0.5" />
          <div className="text-xs text-text-secondary space-y-1">
            <p><strong className="text-white">¿Por qué el Hard Reset suele ganar?</strong></p>
            <p>Tu deuda tiene un costo por los intereses e impuestos de <strong className="text-accent-salmon">~{(temEffective * 100).toFixed(1)}% mensual</strong>,
            mientras que la plata que tenés guardada solo te da una ganancia de <strong className="text-accent-mint">~{(TEM_SAVINGS * 100).toFixed(2)}% mensual</strong>.
            Por cada peso de deuda que no pagás, perdés <strong className="text-white">{(temEffective / TEM_SAVINGS).toFixed(1)} veces</strong> más plata
            de lo que te está generando ese mismo peso ahorrado.</p>
            <p className="text-accent-blue">💡 <strong>Ajustá los sliders en el Dashboard</strong> y volvé acá — los números de &quot;Tu Plan Actual&quot; se recalculan automáticamente.</p>
          </div>
        </div>
      </div>
      {/* Strategy Guide: When to use which */}
      <div className="dashboard-card p-6">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-3">
          Guía de Decisión: ¿Cuándo te conviene cada estrategia?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-4">
            <h4 className="text-accent-mint font-bold flex items-center gap-2"><Zap size={16} /> Hard Reset (Usar Ahorros)</h4>
            <div className="bg-accent-mint/5 border border-accent-mint/20 rounded-lg p-4 text-xs text-text-secondary space-y-3">
              <p className="flex gap-2"><CheckCircle2 size={14} className="text-accent-mint shrink-0 mt-0.5" /> <strong>Cuándo usarla:</strong> En tu situación actual ({formatCurrency(INITIAL_DATA.ahorro)} ahorrados vs {formatCurrency(INITIAL_DATA.deudas.reduce((a, b) => a + b.amount, 0))} de deuda), esta es casi 100% seguro la mejor opción matemática siempre.</p>
              <p className="flex gap-2"><Info size={14} className="text-accent-blue shrink-0 mt-0.5" /> <strong>Por qué:</strong> No tiene sentido tener plata guardada ganando {(TEM_SAVINGS * 100).toFixed(2)}% mensual mientras el banco te cobra ~{(temEffective * 100).toFixed(1)}% por la tarjeta. Vas a llegar a los $5 Millones mucho más rápido si primero matás la deuda y después invertís todo tu sueldo libre limpio.</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-accent-blue font-bold flex items-center gap-2"><User size={16} /> Tu Plan Actual (Dashboard)</h4>
            <div className="bg-accent-blue/5 border border-accent-blue/20 rounded-lg p-4 text-xs text-text-secondary space-y-3">
              <p className="flex gap-2"><CheckCircle2 size={14} className="text-accent-blue shrink-0 mt-0.5" /> <strong>Cuándo usarla:</strong> Si necesitás liquidez URGENTE. Por ejemplo, si los {formatCurrency(INITIAL_DATA.ahorro)} que tenés ahorrados los necesitás sí o sí enteros la semana que viene para una emergencia médica o una seña de alquiler inminente.</p>
              <p className="flex gap-2"><AlertTriangle size={14} className="text-accent-salmon shrink-0 mt-0.5" /> <strong>Por qué:</strong> A usar el Dashboard (pagando con tu sueldo mes a mes o inyectando solo una partecita) perdés plata a la larga por culpa del interés compuesto de la tarjeta, y retrasás tu meta de los $5M.</p>
            </div>
          </div>

        </div>
      </div>

      {/* Leisure Budget Dedicated Section */}
      <div className="dashboard-card p-6 border-l-4 border-l-accent-blue">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-3 flex items-center gap-2">
          ☕ Presupuesto Mensual para Ocio y Vida Diaria
        </h3>
        <p className="text-xs text-text-secondary mb-4">
          Esta es la plata <strong>100% tuya</strong> que podés gastar en salidas, gustos, o lo que quieras, <em>después</em> de haber pagado todos tus gastos fijos (alquiler, servicios, supermercado) y haber mandado la plata obligatoria a las deudas/ahorros según cada plan.
        </p>
        
        <div className="overflow-x-auto custom-scroll -mx-2 px-2 pb-2">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="text-text-secondary text-[10px] uppercase tracking-wider font-semibold border-b border-white/10">
                <th className="py-2 pl-2">Mes</th>
                <th className="py-2 text-accent-blue">Tu Plan Actual</th>
                <th className="py-2 text-accent-mint">Hard Reset</th>
                <th className="py-2 text-accent-yellow">Sin Ahorros</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {userPlan.months.slice(0, 6).map((mU, i) => {
                const mA = stratA.months[i] || mU;
                const mB = stratB.months[i] || mU;
                
                // For userPlan we didn't calculate explicit cushion initially, so let's derive it similarly if they have surplus, otherwise 0
                const surplusU = INITIAL_DATA.sueldo - (projection.months[i]?.gastosFijosTotales || 0) - mU.salaryToDebt - mU.salaryToSavings;
                const cushionU = mU.debt <= 0 ? Math.round(surplusU * 0.15) : (surplusU > 0 ? Math.round(surplusU) : 0); // User plan doesn't have a formulaic 15% during debt, what's left is zero or all.

                return (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 pl-2 font-medium text-white">{mU.label}</td>
                    <td className="py-3 text-accent-blue font-bold">{cushionU > 0 ? formatCurrency(cushionU) : <span className="text-text-tertiary">Sin ocio ($0)</span>}</td>
                    <td className="py-3 text-accent-mint font-bold">{mA.cushion > 0 ? formatCurrency(mA.cushion) : <span className="text-text-tertiary">Sin ocio ($0)</span>}</td>
                    <td className="py-3 text-accent-yellow font-bold">{mB.cushion > 0 ? formatCurrency(mB.cushion) : <span className="text-text-tertiary">Sin ocio ($0)</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
