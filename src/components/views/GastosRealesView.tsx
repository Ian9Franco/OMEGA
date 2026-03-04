"use client";
import React from 'react';
import { BarChart3, TrendingDown, TrendingUp, Clock, AlertTriangle, Bus, HandCoins, ShoppingBag, Send, Banknote, Wifi, Phone } from 'lucide-react';
import { INITIAL_DATA, formatCurrency, TIPO_COLORS } from '@/lib/constants';
import type { MPParsedData } from '@/lib/types';

const categoryIcons: Record<string, React.ReactNode> = {
  bus: <Bus size={16} />, handcoins: <HandCoins size={16} />,
  shoppingbag: <ShoppingBag size={16} />, send: <Send size={16} />,
  banknote: <Banknote size={16} />,
};

export function GastosRealesView({ mpData }: { mpData: MPParsedData | null }) {
  // Fallback data if parser hasn't loaded yet
  const categorias = mpData?.categorias || [];
  const cuotasPendientes = mpData?.cuotasPendientes || [];
  const totalResumen = mpData?.totalResumen || 0;
  const periodo = mpData?.periodo || 'Cargando...';
  const cuotasMensuales = cuotasPendientes.reduce((a, c) => a + c.cuotaMensual, 0);
  const gastoNecesario = categorias.filter(c => c.tipo === 'necesario' || c.tipo === 'obligatorio').reduce((a, c) => a + c.total, 0);
  const gastoDiscrecional = categorias.filter(c => c.tipo === 'discrecional').reduce((a, c) => a + c.total, 0);
  const gastoVariable = categorias.filter(c => c.tipo === 'variable' || c.tipo === 'ingreso').reduce((a, c) => a + c.total, 0);

  return (
    <div className="space-y-6 fade-in">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-2"><BarChart3 size={20} className="text-accent-yellow" /> Radiografía de Gastos Reales</h2>
      <p className="text-xs text-text-secondary -mt-4">Análisis basado en tu resumen de MercadoPago ({periodo}) y servicios fijos confirmados.</p>

      {cuotasPendientes.length > 0 && (
        <div className="dashboard-card p-5 bg-accent-salmon/5 border-accent-salmon/20">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle size={18} className="text-accent-salmon shrink-0 mt-0.5" />
            <div><h3 className="font-semibold text-accent-salmon text-sm">Cuotas Pendientes MercadoPago</h3>
              <p className="text-[10px] text-text-secondary">Estas cuotas impactan tu flujo los próximos meses (+{formatCurrency(cuotasMensuales)}/mes).</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cuotasPendientes.map((c, i) => (
              <div key={i} className="dashboard-card-light p-3 flex justify-between items-center">
                <div><p className="text-xs font-medium text-white">{c.destino}</p>
                  <p className="text-[10px] text-text-tertiary">{c.restantes} cuotas restantes</p></div>
                <span className="text-accent-salmon font-bold text-sm">{formatCurrency(c.cuotaMensual)}/mes</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dashboard-card p-5">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
          <Landmark size={14} className="text-accent-blue" /> Obligaciones Fijas Mensuales
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
          <div className="dashboard-card-light p-3"><p className="text-[10px] text-text-secondary">Impuestos</p><p className="text-xl font-bold text-white">{formatCurrency(INITIAL_DATA.gastos.impuestos)}</p></div>
          <div className="dashboard-card-light p-3"><p className="text-[10px] text-text-secondary flex items-center gap-1"><Wifi size={8} /> Internet</p><p className="text-xl font-bold text-white">{formatCurrency(INITIAL_DATA.gastos.internet)}</p></div>
          <div className="dashboard-card-light p-3"><p className="text-[10px] text-text-secondary flex items-center gap-1"><Phone size={8} /> Móvil</p><p className="text-xl font-bold text-white">{formatCurrency(INITIAL_DATA.gastos.datosMoviles)}</p></div>
          <div className="dashboard-card-light p-3"><p className="text-[10px] text-text-secondary flex items-center gap-1"><ShoppingBag size={8} /> Comida</p><p className="text-xl font-bold text-white">{formatCurrency(INITIAL_DATA.gastos.comida)}</p></div>
          <div className="dashboard-card-light p-3 bg-accent-salmon/5 border border-accent-salmon/20"><p className="text-[10px] text-accent-salmon">Total Fijos</p><p className="text-xl font-bold text-accent-salmon">{formatCurrency(INITIAL_DATA.gastos.impuestos + INITIAL_DATA.gastos.fijosExtras)}</p></div>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden">
          <div style={{width: `${(INITIAL_DATA.gastos.impuestos / (INITIAL_DATA.gastos.impuestos + INITIAL_DATA.gastos.fijosExtras)) * 100}%`}} className="bg-accent-blue h-full"></div>
          <div style={{width: `${(INITIAL_DATA.gastos.internet / (INITIAL_DATA.gastos.impuestos + INITIAL_DATA.gastos.fijosExtras)) * 100}%`}} className="bg-purple-500 h-full"></div>
          <div style={{width: `${(INITIAL_DATA.gastos.datosMoviles / (INITIAL_DATA.gastos.impuestos + INITIAL_DATA.gastos.fijosExtras)) * 100}%`}} className="bg-accent-mint h-full"></div>
          <div style={{width: `${(INITIAL_DATA.gastos.comida / (INITIAL_DATA.gastos.impuestos + INITIAL_DATA.gastos.fijosExtras)) * 100}%`}} className="bg-accent-yellow h-full"></div>
        </div>
        <div className="flex gap-4 mt-2 text-[9px] text-text-tertiary flex-wrap">
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-accent-blue rounded-full"></div> Impuestos ({((INITIAL_DATA.gastos.impuestos / (INITIAL_DATA.gastos.impuestos + INITIAL_DATA.gastos.fijosExtras)) * 100).toFixed(0)}%)</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-purple-500 rounded-full"></div> Internet ({((INITIAL_DATA.gastos.internet / (INITIAL_DATA.gastos.impuestos + INITIAL_DATA.gastos.fijosExtras)) * 100).toFixed(0)}%)</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-accent-mint rounded-full"></div> Móvil ({((INITIAL_DATA.gastos.datosMoviles / (INITIAL_DATA.gastos.impuestos + INITIAL_DATA.gastos.fijosExtras)) * 100).toFixed(0)}%)</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-accent-yellow rounded-full"></div> Comida ({((INITIAL_DATA.gastos.comida / (INITIAL_DATA.gastos.impuestos + INITIAL_DATA.gastos.fijosExtras)) * 100).toFixed(0)}%)</span>
        </div>
      </div>

      {categorias.length > 0 && (
        <div className="dashboard-card p-5">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
              <Smartphone size={14} className="text-accent-mint" /> Desglose Resumen MercadoPago
            </h3>
            <div className="text-right"><p className="text-[10px] text-text-tertiary">Total Período</p><p className="text-lg font-bold text-white">{formatCurrency(totalResumen)}</p></div>
          </div>
          <p className="text-[10px] text-text-tertiary mb-4">{periodo} — {categorias.reduce((a, c) => a + c.items, 0)} transacciones</p>
          <div className="space-y-3">
            {categorias.map(cat => {
              const colors = TIPO_COLORS[cat.tipo] || TIPO_COLORS['variable'];
              return (
                <div key={cat.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center ${colors.text} shrink-0`}>
                    {categoryIcons[cat.icon] || <ShoppingBag size={16} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-xs font-medium text-white">{cat.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} ${colors.border} border`}>{cat.tipo}</span>
                        <span className="text-sm font-bold text-white">{formatCurrency(cat.total)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-card-bg rounded-full overflow-hidden">
                        <div style={{width: `${(cat.total / totalResumen) * 100}%`}} className={`h-full rounded-full ${colors.text.replace('text-', 'bg-')}`}></div>
                      </div>
                      <span className="text-[9px] text-text-tertiary w-8 text-right">{((cat.total / totalResumen) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="dashboard-card-light p-5 border-l-2 border-l-accent-blue">
          <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-2">Gasto Necesario + Obligatorio</p>
          <p className="text-2xl font-bold text-accent-blue">{formatCurrency(gastoNecesario)}</p>
          <p className="text-[10px] text-text-tertiary mt-1">Transporte + Préstamos — no se puede reducir</p>
        </div>
        <div className="dashboard-card-light p-5 border-l-2 border-l-accent-yellow">
          <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-2">Gasto Discrecional</p>
          <p className="text-2xl font-bold text-accent-yellow">{formatCurrency(gastoDiscrecional)}</p>
          <p className="text-[10px] text-text-tertiary mt-1">Consumo + Compras — se puede optimizar</p>
        </div>
        <div className="dashboard-card-light p-5 border-l-2 border-l-white/20">
          <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-2">Variable (Transferencias)</p>
          <p className="text-2xl font-bold text-text-secondary">{formatCurrency(gastoVariable)}</p>
          <p className="text-[10px] text-text-tertiary mt-1">Transferencias, cobros — contexto personal</p>
        </div>
      </div>

      <div className="dashboard-card p-5 bg-card-bg-light">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingDown size={14} className="text-accent-mint" /> Impacto en Estrategia de Pago
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-text-secondary">
          <div className="space-y-2">
            <p>Si reducís <strong className="text-accent-yellow">50%</strong> del gasto discrecional:</p>
            <ul className="space-y-1 text-[11px]">
              <li className="flex items-center gap-2"><TrendingDown size={12} className="text-accent-mint" /> Liberás <strong className="text-accent-mint">{formatCurrency(gastoDiscrecional * 0.5)}</strong> extra por mes para deuda</li>
              <li className="flex items-center gap-2"><Clock size={12} className="text-accent-mint" /> Podrías alcanzar la meta ~1 mes antes</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p>Las <strong className="text-accent-salmon">cuotas pendientes</strong> compromen tu flujo:</p>
            <ul className="space-y-1 text-[11px]">
              <li className="flex items-center gap-2"><AlertTriangle size={12} className="text-accent-salmon" /> Mar-Abr: <strong className="text-accent-salmon">+{formatCurrency(cuotasMensuales)}</strong> de gasto obligatorio extra</li>
              <li className="flex items-center gap-2"><TrendingUp size={12} className="text-accent-mint" /> Mayo: se liberan, ganás <strong className="text-accent-mint">{formatCurrency(cuotasMensuales)}</strong> de capacidad</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Need to import Smartphone/Landmark since used above
import { Smartphone, Landmark } from 'lucide-react';
