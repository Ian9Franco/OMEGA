"use client";
import React from 'react';
import {
  Activity, TrendingDown, TrendingUp, LayoutDashboard, WalletCards,
  Info, Target, Zap, Clock, Smartphone, CreditCard, Settings, Menu
} from 'lucide-react';
import { Tooltip } from '@/components/Tooltip';
import { INITIAL_DATA, MONTH_LABELS, formatCurrency } from '@/lib/constants';
import type { ProjectionResult, SavingsRescue, SalaryAllocation, MPParsedData } from '@/lib/types';

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
  const cuotasMensuales = mpData ? mpData.cuotasPendientes.reduce((a, c) => a + c.cuotaMensual, 0) : 0;

  return (
    <div className="fade-in">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="dashboard-card p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
            <Activity size={14} className="text-accent-salmon" />
            Pérdida Pura Mensual
            <Tooltip content="Monto que el banco te cobra HOY solo por intereses mensuales e impuestos sin achicar el capital."><Info size={12} className="text-text-tertiary hover:text-white" /></Tooltip>
          </div>
          <div className="text-2xl font-bold text-white mb-1.5">{formatCurrency(pureInterestStart)}</div>
          <div className="flex items-center gap-1.5 text-[10px] text-accent-salmon bg-accent-salmon/10 w-max px-2 py-0.5 rounded"><TrendingDown size={12} /> Fuga de capital por deuda</div>
        </div>

        <div className="dashboard-card p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
            <TrendingUp size={14} className="text-accent-mint" />
            Base Yield (Ahorros)
            <Tooltip content="Crecimiento orgánico de tus ahorros este mes asumiendo 26.3% TNA."><Info size={12} className="text-text-tertiary hover:text-white" /></Tooltip>
          </div>
          <div className="text-2xl font-bold text-white mb-1.5">{formatCurrency(projection.months[0].savingsYield)}</div>
          <div className="flex items-center gap-1.5 text-[10px] text-accent-mint bg-accent-mint/10 w-max px-2 py-0.5 rounded">Rendimiento a favor pasivo</div>
        </div>

        <div className="dashboard-card p-4 flex flex-col justify-between bg-card-bg-light">
          <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
            <div className="flex items-center gap-2"><LayoutDashboard size={14} className="text-accent-yellow" /> Target: Deuda Junio</div>
          </div>
          <div className={`text-2xl font-bold mb-1.5 ${projection.months[2].bankDebtEnd <= 800000 ? 'text-accent-mint' : 'text-accent-salmon'}`}>
            {formatCurrency(projection.months[2].bankDebtEnd)}
            <span className="text-[10px] text-text-tertiary ml-2 font-normal">{'<'} {formatCurrency(800000)}</span>
          </div>
          <div className="flex h-1.5 rounded-full overflow-hidden w-full bg-card-bg mt-1">
            {projection.months[2].debtBreakdown.map((debt, i) => {
              const total = projection.months[2].bankDebtEnd;
              if (total === 0 || debt.amount === 0) return null;
              return (
                <Tooltip key={i} content={`${debt.name}: ${formatCurrency(debt.amount)}`}>
                  <div style={{width: `${(debt.amount/total)*100}%`}} className={`h-full border-r border-dashboard-bg ${debt.type === 'app' ? 'bg-accent-blue' : 'bg-red-400'}`}></div>
                </Tooltip>
              );
            })}
          </div>
        </div>

        <div className="dashboard-card p-4 flex flex-col justify-between bg-card-bg-light border-accent-salmon/10 border">
          <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
            <WalletCards size={14} className="text-accent-blue" />
            Obligación de Vida Fija
            <Tooltip content={`Expensas: ${formatCurrency(INITIAL_DATA.gastos.expensas)} | Movistar: ${formatCurrency(INITIAL_DATA.gastos.fijosExtras)} | Cuotas MP: ${formatCurrency(cuotasMensuales)} | MP Vida: ${formatCurrency(mercadoPagoGastos[0])}`}>
              <Info size={12} className="text-text-tertiary hover:text-white" />
            </Tooltip>
          </div>
          <div className="text-2xl text-accent-blue font-bold mb-1.5">{formatCurrency(projection.months[0].gastosFijosTotales)}</div>
          <div className="space-y-0.5 text-[10px] text-text-tertiary border-t border-white/5 pt-1.5">
            <div className="flex justify-between"><span>Expensas</span><span>{formatCurrency(INITIAL_DATA.gastos.expensas)}</span></div>
            <div className="flex justify-between"><span>Movistar</span><span>{formatCurrency(INITIAL_DATA.gastos.fijosExtras)}</span></div>
            <div className="flex justify-between"><span>MP Vida</span><span>{formatCurrency(mercadoPagoGastos[0])}</span></div>
            {cuotasMensuales > 0 && <div className="flex justify-between text-accent-salmon"><span>Cuotas MP</span><span>{formatCurrency(cuotasMensuales)}</span></div>}
            <div className="flex justify-between font-semibold text-white border-t border-white/5 pt-1 mt-1">
              <span>Max. P/Deuda:</span>
              <span>{formatCurrency(INITIAL_DATA.sueldo - projection.months[0].gastosFijosTotales)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hard Reset Toggle + Banner */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-4">
        <div className="xl:col-span-12 dashboard-card p-4 bg-accent-blue/5 border-accent-blue/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-blue/10 rounded-lg"><TrendingUp size={20} className="text-accent-blue" /></div>
            <div>
              <h3 className="font-semibold text-white text-sm">Estrategia: Reconstrucción de Capital (Hard Reset)</h3>
              <p className="text-[10px] text-text-secondary">Automatiza el ahorro del sueldo sobrante una vez eliminada la deuda para recuperar tus $5M más rápido.</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={autoReconstruct} onChange={(e) => onSetAutoReconstruct(e.target.checked)} />
            <div className="w-11 h-6 bg-card-bg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-blue"></div>
          </label>
        </div>

        {!projection.comparison.isOptimal && (
          <div className="xl:col-span-12 bg-accent-mint/10 border border-accent-mint/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 fade-in">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent-mint/20 flex items-center justify-center text-accent-mint shrink-0"><Target size={20} /></div>
              <div>
                <h3 className="text-accent-mint font-bold text-sm">¡Hay un Plan Superador disponible!</h3>
                <p className="text-[11px] text-text-secondary leading-tight mt-0.5">
                  Con el <span className="text-white font-semibold">Plan Reset</span> ahorrarías <span className="text-accent-mint font-bold">{formatCurrency(projection.comparison.interestSaved)}</span> en intereses
                  {projection.comparison.monthsFaster > 0 && <span> y llegarías <span className="text-accent-mint font-bold">{projection.comparison.monthsFaster} meses antes</span> a tu meta</span>}.
                  <br /><span className="text-white font-semibold">Tendrías {formatCurrency(projection.comparison.netWealthDiff)} más de Riqueza Real</span> en Junio.
                </p>
              </div>
            </div>
            <button onClick={onApplyHardReset} className="px-4 py-2 bg-accent-mint text-dashboard-bg text-xs font-bold rounded-xl hover:bg-white transition-all flex items-center gap-2 shadow-lg shadow-accent-mint/10">
              <Zap size={14} fill="currentColor" /> APLICAR HARD RESET
            </button>
          </div>
        )}

        {/* Monthly Config */}
        <div className="xl:col-span-9 dashboard-card p-5 bg-accent-mint/5 border-accent-mint/20">
          <h2 className="text-base font-semibold text-accent-mint flex items-center gap-2 mb-4">Control de Flujo Estratégico Detallado</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map(mIdx => {
              const monthData = projection.months[mIdx];
              const allocs = salaryAllocations[mIdx];
              const maxAvailable = INITIAL_DATA.sueldo - monthData.gastosFijosTotales;
              const totalAllocated = allocs.visa + allocs.master;
              const isBudgetExceeded = (maxAvailable - totalAllocated) < 0;

              return (
                <div key={mIdx} className="dashboard-card-light p-4 flex flex-col">
                  <h3 className="font-medium text-white mb-3 flex justify-between items-center text-xs border-b border-white/5 pb-2">{MONTH_LABELS[mIdx]}</h3>

                  <div className="mt-4 pb-3 border-b border-white/5 space-y-4">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1 font-semibold">
                        <span className="text-text-secondary flex items-center gap-1"><Smartphone size={12} className="text-accent-mint" /> Estimado Mercado Pago (Vida)</span>
                        <span className="text-accent-mint">{formatCurrency(mercadoPagoGastos[mIdx])}</span>
                      </div>
                      <input type="range" min={0} max={600000} step="1000" value={mercadoPagoGastos[mIdx]} onChange={(e) => onUpdateMercadoPago(mIdx, Number(e.target.value))} className="w-full accent-accent-mint h-1.5 bg-card-bg rounded-lg appearance-none cursor-pointer" />
                      <div className="text-[9px] text-text-tertiary mt-1">Gasto de vida fluctuante que querés presupuestar para este mes.</div>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1">
                    {(['visa', 'master'] as const).map(cardId => (
                      <div key={cardId}>
                        <div className="flex justify-between text-[10px] mb-1 mt-4">
                          <span className="text-text-secondary flex items-center gap-1"><CreditCard size={10} className="text-red-400" /> Pago {cardId === 'visa' ? 'Visa' : 'Mastercard'}</span>
                          <span className="font-semibold text-white">{formatCurrency(allocs[cardId])}</span>
                        </div>
                        <input type="range" min={Math.round(monthData.requiredMinimums[cardId] || 0)} max={maxAvailable} step="5000"
                          value={Math.max(allocs[cardId], monthData.requiredMinimums[cardId] || 0)}
                          onChange={(e) => onUpdateAllocation(mIdx, cardId, Number(e.target.value))}
                          className="w-full accent-white h-1 bg-card-bg rounded-lg appearance-none cursor-pointer" />
                        <div className="text-[9px] text-text-tertiary mt-1">Mínimo legal: {formatCurrency(monthData.requiredMinimums[cardId] || 0)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 space-y-3">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-text-secondary">Usar Apalancamiento con Ahorros</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={savingsRescue[mIdx].active} onChange={(e) => onUpdateSavingsRescue(mIdx, 'active', e.target.checked)} />
                        <div className="w-9 h-5 bg-card-bg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-mint"></div>
                      </label>
                    </div>
                    {savingsRescue[mIdx].active && (
                      <div className="bg-dashboard-bg/50 p-3 rounded-xl border border-white/5 space-y-4 fade-in">
                        {(['visa', 'master'] as const).map(cardId => (
                          <div key={cardId}>
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className="text-text-secondary flex items-center gap-1"><CreditCard size={10} className="text-red-400" /> A {cardId === 'visa' ? 'Visa' : 'Mastercard'}</span>
                              <span className="font-semibold text-accent-mint">{formatCurrency(savingsRescue[mIdx][cardId])}</span>
                            </div>
                            <input type="range" min="0" max="2000000" step="10000"
                              value={savingsRescue[mIdx][cardId]}
                              onChange={(e) => onUpdateSavingsRescue(mIdx, cardId, Number(e.target.value))}
                              className="w-full h-1 accent-accent-mint bg-card-bg rounded-lg appearance-none cursor-pointer" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 bg-dashboard-bg/30 -mx-4 px-4 pb-3">
                    <div className="space-y-1.5 mb-3 border-b border-white/5 pb-3">
                      <div className="flex justify-between items-center text-[10px]"><span className="text-text-secondary">Sueldo Base Inicial</span><span className="text-white font-medium">{formatCurrency(INITIAL_DATA.sueldo)}</span></div>
                      <div className="flex justify-between items-center text-[10px]"><span className="text-accent-mint/80">(-) Vida/MP + Fijos</span><span className="text-accent-mint/80">-{formatCurrency(monthData.gastosFijosTotales)}</span></div>
                      <div className="flex justify-between items-center text-[10px]"><span className="text-white/80">(-) Deuda Tarjetas</span><span className="text-white/80">-{formatCurrency(totalAllocated)}</span></div>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-text-tertiary flex items-center gap-1 font-bold">
                        Sueldo Libre en Mano
                        <Tooltip content="Monto final FÍSICO que te queda en la cuenta en este mes."><Info size={12} className="cursor-help" /></Tooltip>
                      </span>
                      <span className={`font-bold ${isBudgetExceeded ? 'text-accent-salmon bg-accent-salmon/20 px-1.5 py-0.5 rounded border border-accent-salmon/30' : 'text-accent-mint'}`}>
                        {formatCurrency(monthData.livingCashFlow)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Summary */}
        <div className="xl:col-span-3 dashboard-card p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">Resumen Recalculado</h2>
            <div className="dashboard-card-light p-3 rounded-xl mb-3 border border-white/5">
              <div className="text-[10px] text-text-secondary mb-1">Ahorro Re-constituido (Junio)</div>
              <div className="text-xl font-bold text-accent-yellow mb-0.5">{formatCurrency(INITIAL_DATA.ahorro - projection.currentSelfDebt)}</div>
              <div className="text-[10px] text-text-tertiary">Obj: {formatCurrency(INITIAL_DATA.ahorro)}</div>
            </div>
            <div className="dashboard-card-light p-3 rounded-xl">
              <div className="text-[10px] text-text-secondary mb-2 border-b border-white/5 pb-1">Balance Consolidado</div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs"><span className="text-accent-salmon">Total Intereses:</span><span className="font-medium">-{formatCurrency(projection.totalInterestPaid)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-accent-mint">Yield Capital:</span><span className="font-medium">+{formatCurrency(projection.totalYieldEarned)}</span></div>
              </div>
            </div>
          </div>
          {projection.monthsToGoal !== null ? (
            <div className="w-full bg-accent-salmon/10 text-accent-salmon border border-accent-salmon/20 font-medium py-3 rounded-xl text-center text-xs mt-4 tracking-wide fade-in flex flex-col gap-1 items-center">
              <Clock size={16} /><span>Para lograr meta:</span><b className="text-sm">Faltarían {projection.monthsToGoal} meses extra</b>
            </div>
          ) : (
            <button className="w-full bg-accent-yellow text-card-bg font-bold py-3 rounded-xl text-xs mt-4 hover:opacity-90 transition-opacity tracking-wide uppercase shadow-lg shadow-accent-yellow/20">
              Objetivo Cumplido ✅
            </button>
          )}
        </div>
      </div>

      {/* Timeline Table */}
      <div className="dashboard-card p-5">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          Libro Mayor Modificado (Proyectado)
          <Tooltip content="Auditoría mensual completa. Los intereses se capitalizan sobre el saldo de la deuda cada mes."><Info size={14} className="text-text-tertiary hover:text-white" /></Tooltip>
        </h2>
        <div className="overflow-x-auto custom-scroll -mx-2 px-2 pb-2">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="text-text-secondary text-[10px] uppercase tracking-wider font-semibold border-b border-white/10">
                <th className="py-3 font-medium pl-2">Periodo</th>
                <th className="py-3 font-medium"><Tooltip content="Traspaso extraordinario del capital guardado hacia el pago de deuda."><span className="border-b border-dashed border-text-tertiary pb-0.5 cursor-help">Inyecc Ahorro</span></Tooltip></th>
                <th className="py-3 font-medium"><Tooltip content="Penalidad cobrada por mantener deuda (TEM/IVA/Sellos/IIBB). Compone al capital."><span className="border-b border-dashed border-text-tertiary pb-0.5 cursor-help">Cargo Extra</span></Tooltip></th>
                <th className="py-3 font-medium text-accent-blue">Asignación Base Salario</th>
                <th className="py-3 font-medium">Saldos Retenidos por Acreedor</th>
                <th className="py-3 font-medium pr-2 text-right">Patrimonio Fijo</th>
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
