"use client";
import React from 'react';
import { ArrowRightLeft, Clock, Target, Smartphone } from 'lucide-react';
import { INITIAL_DATA, formatCurrency } from '@/lib/constants';
import type { ProjectionResult } from '@/lib/types';

export function FlujoMensualView({ projectionData }: { projectionData: ProjectionResult }) {
  const month0 = projectionData.months[0];
  const totalSueldo = INITIAL_DATA.sueldo;
  const isCrisis = month0.livingCashFlow < 0;
  const currentFixedExps = month0.gastosFijosTotales;

  return (
    <div className="space-y-6 fade-in h-full flex flex-col">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-2"><ArrowRightLeft size={20} className="text-accent-mint" /> Trazabilidad de Sueldo (Mes Actual)</h2>

      <div className="dashboard-card p-6 flex flex-col lg:flex-row items-center gap-8">
        <div className="relative w-48 h-48 shrink-0 flex items-center justify-center rounded-full border-8 border-card-bg-light">
          <div className="absolute inset-0 rounded-full"
            style={{ background: `conic-gradient(#93C5FD 0% ${(month0.bankPaid / totalSueldo)*100}%, transparent ${(month0.bankPaid / totalSueldo)*100}% 100%)` }}></div>
          <div className="absolute inset-0 rounded-full"
            style={{ background: `conic-gradient(transparent 0% ${(month0.bankPaid / totalSueldo)*100}%, #A7F3D0 ${(month0.bankPaid / totalSueldo)*100}% ${((month0.bankPaid + currentFixedExps) / totalSueldo)*100}%, transparent ${((month0.bankPaid + currentFixedExps) / totalSueldo)*100}% 100%)` }}></div>
          <div className="absolute inset-0 rounded-full"
            style={{ background: `conic-gradient(transparent 0% ${((month0.bankPaid + currentFixedExps) / totalSueldo)*100}%, ${isCrisis ? '#FECACA' : '#FEF08A'} ${((month0.bankPaid + currentFixedExps) / totalSueldo)*100}% 100%)` }}></div>
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
            Si necesitás hacer un gasto extra (&quot;Líquido Restante&quot; es chico), metelo en la tarjeta de crédito 1 día después de la fecha de cierre. Eso te da hasta el mes próximo a tasa cero, mientras tus pesos reales rinden 2.1% en tu Ahorro.</div>
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
}
