"use client";
import React from 'react';
import { WalletCards, Activity, ShieldAlert, Smartphone, CreditCard } from 'lucide-react';
import { INITIAL_DATA, CONSTANTS, TEM_SAVINGS, formatCurrency } from '@/lib/constants';

export function MisSaldosView({ pureInterestStart }: { pureInterestStart: number }) {
  const totalDebt = INITIAL_DATA.deudas.reduce((acc, d) => acc + d.amount, 0);

  return (
    <div className="space-y-6 fade-in h-full flex flex-col">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-2"><WalletCards size={20} className="text-accent-blue" /> Fotografía Financiera (Día 0)</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <div className="dashboard-card p-6 border-l-4 border-l-accent-salmon flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm text-text-secondary uppercase tracking-wider font-semibold">Tus Pasivos (Total Resúmenes)</h3>
                <div className="text-4xl font-bold text-white mt-1">{formatCurrency(INITIAL_DATA.deudas.reduce((acc, d) => acc + d.amount + (d.consumption || 0), 0))}</div>
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
                <div key={i} style={{width: `${((d.amount + (d.consumption || 0))/INITIAL_DATA.deudas.reduce((acc, d) => acc + d.amount + (d.consumption || 0), 0))*100}%`}} className={`h-full border-r border-dashboard-bg ${d.type === 'app' ? 'bg-accent-blue' : 'bg-red-400'}`}></div>
              ))}
            </div>
            <span className="text-xs text-text-secondary">Dos (2) Tarjetas</span>
          </div>
        </div>
      </div>

      <h3 className="text-sm uppercase tracking-wider font-semibold text-text-secondary mt-4">Detalle de Obligaciones</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 pb-4">
        {INITIAL_DATA.deudas.map(debt => {
          const consumption = debt.consumption || 0;
          const consolidatedDebt = debt.amount;
          const totalToPay = consolidatedDebt + consumption;
          
          const baseInt = consolidatedDebt * CONSTANTS.TEM_DEBT;
          const iva = baseInt * CONSTANTS.IVA;
          const iibb = consolidatedDebt * CONSTANTS.IIBB;
          const subtotal = baseInt + iva + iibb;
          const sellos = (consolidatedDebt + subtotal) * CONSTANTS.SELLOS;
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
              
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] text-text-secondary uppercase mb-1">Total a Pagar (Resumen)</div>
                  <div className="text-2xl font-bold">{formatCurrency(totalToPay)}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-dashboard-bg/50 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] text-text-secondary mb-1">Deuda Consolidada</p>
                    <p className="text-sm font-semibold text-white">{formatCurrency(consolidatedDebt)}</p>
                  </div>
                  <div className="bg-dashboard-bg/50 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] text-text-secondary mb-1">Consumo del Mes</p>
                    <p className="text-sm font-semibold text-accent-mint">{formatCurrency(consumption)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2 text-xs border-t border-white/5 pt-4">
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Interés s/Deuda (TEM 7.09%)</span>
                  <span className="text-accent-salmon">+{formatCurrency(baseInt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">IVA + Sellos + IIBB</span>
                  <span className="text-accent-salmon">+{formatCurrency(iva + sellos + iibb)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-white/5 pt-2 mt-2">
                  <span className="text-text-secondary">Pérdida Pura C/Mes</span>
                  <span className="text-accent-salmon">-{formatCurrency(pureLoss)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
