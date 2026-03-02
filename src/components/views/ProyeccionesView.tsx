"use client";
import React from 'react';
import { PieChart, Target } from 'lucide-react';
import { INITIAL_DATA, formatCurrency } from '@/lib/constants';
import type { ProjectionResult } from '@/lib/types';

export function ProyeccionesView({ projectionData }: { projectionData: ProjectionResult }) {
  const maxAhorro = Math.max(5000000, ...projectionData.months.map(m => m.savingsEnd));
  const maxDeuda = Math.max(INITIAL_DATA.deudas.reduce((acc, d) => acc + d.amount, 0), ...projectionData.months.map(m => m.bankDebtEnd));
  const upperLimit = Math.max(maxAhorro, maxDeuda);

  return (
    <div className="space-y-6 fade-in h-max flex flex-col">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-2"><PieChart size={20} className="text-accent-yellow" /> Trayectoria hacia Junio 2026</h2>
      <p className="text-xs text-text-secondary mb-4">Gráfico de convergencia del plan diseñado. Las deudas deben desplomarse hacia la marca inferior mientras que el patrimonio líquido se recompone.</p>

      <div className="dashboard-card p-6 flex flex-col pt-12">
        <div className="flex justify-between items-end h-[350px] lg:h-[400px] mb-8 relative border-b border-l border-white/10 pb-4 pl-4">
          <div className="absolute left-[-40px] top-0 text-[9px] text-text-tertiary">5M</div>
          <div className="absolute left-[-40px] top-1/4 text-[9px] text-text-tertiary border-t border-white/5 w-full"></div>
          <div className="absolute left-[-40px] top-2/4 text-[9px] text-text-tertiary border-t border-white/5 w-full">2.5M</div>
          <div className="absolute left-[-40px] top-3/4 text-[9px] text-text-tertiary border-t border-white/5 w-full"></div>

          {[{monthStr: 'Día 0 (Hoy)', savingsEnd: INITIAL_DATA.ahorro, bankDebtEnd: INITIAL_DATA.deudas.reduce((acc, d) => acc + d.amount, 0)}, ...projectionData.months].map((m, idx) => {
            const savingsHeight = (m.savingsEnd / upperLimit) * 100;
            const debtHeight = (m.bankDebtEnd / upperLimit) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-card-bg-light border border-white/10 p-2 rounded text-[10px] w-32 shadow-xl z-10 pointer-events-none">
                  <div className="flex justify-between text-accent-mint mb-1"><span>Ahorro:</span> <span>{formatCurrency(m.savingsEnd)}</span></div>
                  <div className="flex justify-between text-accent-salmon"><span>Deuda:</span> <span>{formatCurrency(m.bankDebtEnd)}</span></div>
                </div>
                <div className="flex items-end gap-1 md:gap-3 w-1/2 h-full z-0 relative">
                  {m.savingsEnd > 0 && <div style={{height: `${savingsHeight}%`}} className="w-full lg:w-1/2 bg-accent-mint/80 rounded-t border border-accent-mint"></div>}
                  {m.bankDebtEnd > 0 && <div style={{height: `${debtHeight}%`}} className="w-full lg:w-1/2 bg-accent-salmon/80 rounded-t border border-accent-salmon"></div>}
                </div>
                <span className="text-[10px] text-text-tertiary absolute -bottom-6 w-max">{m.monthStr.replace(' 2026', '')}</span>
              </div>
            );
          })}
        </div>

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
}
