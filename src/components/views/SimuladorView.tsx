"use client";
import React, { useState } from 'react';
import { CheckCircle2, Wallet, TrendingUp, Smartphone, CreditCard, Flame, SlidersHorizontal } from 'lucide-react';
import { INITIAL_DATA, CONSTANTS, TEM_SAVINGS, MP_CREDITS, formatCurrency } from '@/lib/constants';
import type { MPParsedData, ProjectionResult } from '@/lib/types';

export function SimuladorView({ mpData, mercadoPagoGastos, projection }: {
  mpData: MPParsedData | null;
  mercadoPagoGastos: number[];
  projection: ProjectionResult;
}) {
  const [gastosPersonales, setGastosPersonales] = useState(120000);
  // Current reality
  const totalConsumption = INITIAL_DATA.deudas.reduce((a, d) => a + (d.consumption || 0), 0);
  const totalDebtPaid = 3085133; // historic: Visa $1.383.706 + Master $1.701.427
  const mpPaidFromSavings = 221404;
  const totalFromSavings = totalDebtPaid + mpPaidFromSavings;

  // Cuotas pendientes tarjetas (from PDFs)
  const cuotasTarjetasAbril = 65470.30 + 37165.48;
  const cuotasTarjetasMayo = 17244.56;

  // MP credits
  const mpAbril = MP_CREDITS.reduce((a, c) => a + c.cuotaAbril, 0);
  const mpMayo = MP_CREDITS.reduce((a, c) => a + c.cuotaMayo, 0);

  const fijosBase = INITIAL_DATA.gastos.impuestos + INITIAL_DATA.gastos.fijosExtras;

  // ========== Single projection: how savings grow from now ==========
  const projMonths: { label: string; savings: number; obligations: number; personal: number; toSavings: number }[] = [];
  let savings = INITIAL_DATA.ahorro;
  const monthNames = ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb'];
  let monthsTo5M = -1;

  for (let i = 0; i < 24; i++) {
    const label = `${monthNames[i % 12]} ${2026 + Math.floor((i + 2) / 12)}`;

    // Savings yield
    const yld = savings * TEM_SAVINGS;
    savings += yld;

    // Obligations for this month
    let obligations = fijosBase;
    if (i === 0) {
      obligations += totalConsumption;
    } else if (i === 1) {
      obligations += cuotasTarjetasAbril + mpAbril;
    } else if (i === 2) {
      obligations += cuotasTarjetasMayo + mpMayo;
    }

    const surplus = Math.max(0, INITIAL_DATA.sueldo - obligations - gastosPersonales);
    savings += surplus;

    if (monthsTo5M === -1 && savings >= 5000000) monthsTo5M = i + 1;

    projMonths.push({ label, savings, obligations, personal: gastosPersonales, toSavings: surplus });
  }
  if (monthsTo5M === -1) monthsTo5M = 24;

  const maxVal = Math.max(...projMonths.map(m => m.savings), 5500000);

  return (
    <div className="space-y-6 fade-in">

      {/* ========== SECTION 1: Lo que ya hiciste ========== */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><CheckCircle2 size={20} className="text-accent-mint" /> Lo que ya hiciste</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="dashboard-card p-5 border-l-4 border-l-accent-mint">
            <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">Deuda de tarjetas eliminada</p>
            <p className="text-2xl font-bold text-accent-mint">{formatCurrency(totalDebtPaid)}</p>
            <p className="text-[10px] text-text-tertiary mt-1">Pagado desde tus ahorros</p>
          </div>
          <div className="dashboard-card p-5 border-l-4 border-l-accent-blue">
            <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">MercadoPago pagado</p>
            <p className="text-2xl font-bold text-accent-blue">{formatCurrency(mpPaidFromSavings)}</p>
            <p className="text-[10px] text-text-tertiary mt-1">Pagado desde ahorros</p>
          </div>
          <div className="dashboard-card p-5 border-l-4 border-l-accent-yellow">
            <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">Ahorros actuales</p>
            <p className="text-2xl font-bold text-accent-yellow">{formatCurrency(INITIAL_DATA.ahorro)}</p>
            <p className="text-[10px] text-text-tertiary mt-1">Se reconstruyen con tu sueldo</p>
          </div>
        </div>

        <div className="dashboard-card-light p-4 text-xs text-text-secondary">
          <p>Sacaste <strong className="text-white">{formatCurrency(totalFromSavings)}</strong> de tus ahorros para eliminar la deuda y pagar MercadoPago. Ahora tu objetivo es <strong className="text-accent-mint">reconstruir tus ahorros hasta $5.000.000</strong> usando tu sueldo mensual.</p>
        </div>
      </div>

      {/* ========== SECTION 2: Qué tenés que pagar ========== */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><Wallet size={20} className="text-accent-blue" /> Qué tenés que pagar</h2>

        {/* MARZO */}
        <div className="dashboard-card p-5 mb-4 border-l-4 border-l-accent-blue">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white flex items-center gap-2"><span className="bg-accent-blue/20 text-accent-blue px-2 py-0.5 rounded text-[10px] font-bold">SUELDO DEPOSITADO</span> Marzo 2026</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-text-secondary text-[10px] uppercase tracking-wider font-semibold border-b border-white/10">
                  <th className="py-2 pl-2">Concepto</th>
                  <th className="py-2">Monto</th>
                  <th className="py-2 text-right pr-2">¿De dónde sale?</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {INITIAL_DATA.deudas.map(d => (
                  <tr key={d.id} className="border-b border-white/5">
                    <td className="py-3 pl-2 font-medium text-white flex items-center gap-2"><CreditCard size={12} className="text-red-400" /> {d.name} (consumos del mes)</td>
                    <td className="py-3">{formatCurrency(d.consumption || 0)}</td>
                    <td className="py-3 text-right pr-2"><span className="bg-accent-blue/10 text-accent-blue px-2 py-0.5 rounded text-[10px]">Sueldo</span></td>
                  </tr>
                ))}
                <tr className="border-b border-white/5">
                  <td className="py-3 pl-2 text-text-tertiary">Gastos fijos (impuestos + servicios + comida)</td>
                  <td className="py-3">{formatCurrency(fijosBase)}</td>
                  <td className="py-3 text-right pr-2"><span className="bg-accent-blue/10 text-accent-blue px-2 py-0.5 rounded text-[10px]">Sueldo</span></td>
                </tr>
                <tr className="border-t border-white/10 font-bold">
                  <td className="py-3 pl-2 text-white">Total Marzo</td>
                  <td className="py-3 text-accent-salmon">{formatCurrency(totalConsumption + fijosBase)}</td>
                  <td className="py-3 text-right pr-2 text-accent-mint font-semibold">Sobrante → ahorro: {formatCurrency(INITIAL_DATA.sueldo - totalConsumption - fijosBase)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-3 bg-accent-mint/10 border border-accent-mint/20 rounded-lg p-3 text-[11px] text-accent-mint">
            <strong>✅ Estrategia óptima:</strong> Pagás todo con sueldo ({formatCurrency(INITIAL_DATA.sueldo)}). Tus ahorros de {formatCurrency(INITIAL_DATA.ahorro)} quedan intactos generando rendimiento.
          </div>
        </div>

        {/* ABRIL */}
        <div className="dashboard-card p-5 mb-4 border-l-4 border-l-accent-blue">
          <h3 className="font-bold text-white mb-3">Abril 2026 — Vence 9 de abril</h3>
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-text-secondary text-[10px] uppercase tracking-wider font-semibold border-b border-white/10">
                  <th className="py-2 pl-2">Concepto</th>
                  <th className="py-2">Monto</th>
                  <th className="py-2 text-right pr-2">Sale de</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b border-white/5">
                  <td className="py-2 pl-2 text-white flex items-center gap-2"><CreditCard size={12} className="text-red-400" /> Cuotas Mastercard</td>
                  <td className="py-2">{formatCurrency(65470.30)}</td>
                  <td className="py-2 text-right pr-2"><span className="bg-accent-blue/10 text-accent-blue px-2 py-0.5 rounded text-[10px]">Sueldo</span></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pl-2 text-white flex items-center gap-2"><CreditCard size={12} className="text-red-400" /> Cuotas Visa</td>
                  <td className="py-2">{formatCurrency(37165.48)}</td>
                  <td className="py-2 text-right pr-2"><span className="bg-accent-blue/10 text-accent-blue px-2 py-0.5 rounded text-[10px]">Sueldo</span></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pl-2 text-white flex items-center gap-2"><Smartphone size={12} className="text-accent-blue" /> Créditos MercadoPago (11 cuotas)</td>
                  <td className="py-2">{formatCurrency(mpAbril)}</td>
                  <td className="py-2 text-right pr-2"><span className="bg-accent-blue/10 text-accent-blue px-2 py-0.5 rounded text-[10px]">Sueldo</span></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pl-2 text-text-tertiary">Gastos fijos (impuestos + servicios + comida)</td>
                  <td className="py-2">{formatCurrency(fijosBase)}</td>
                  <td className="py-2 text-right pr-2"><span className="bg-white/5 text-text-tertiary px-2 py-0.5 rounded text-[10px]">Sueldo</span></td>
                </tr>
                <tr className="border-t border-white/10 font-bold">
                  <td className="py-3 pl-2 text-white">Total obligaciones Abril</td>
                  <td className="py-3 text-accent-salmon">{formatCurrency(cuotasTarjetasAbril + mpAbril + fijosBase)}</td>
                  <td className="py-3 text-right pr-2 text-accent-mint font-semibold">Sobrante → ahorro: {formatCurrency(INITIAL_DATA.sueldo - cuotasTarjetasAbril - mpAbril - fijosBase)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* MAYO */}
        <div className="dashboard-card p-5 mb-4 border-l-4 border-l-accent-mint">
          <h3 className="font-bold text-white mb-3">Mayo 2026 — Últimas cuotas</h3>
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-text-secondary text-[10px] uppercase tracking-wider font-semibold border-b border-white/10">
                  <th className="py-2 pl-2">Concepto</th>
                  <th className="py-2">Monto</th>
                  <th className="py-2 text-right pr-2">Sale de</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b border-white/5">
                  <td className="py-2 pl-2 text-white">Últimas cuotas tarjetas</td>
                  <td className="py-2">{formatCurrency(cuotasTarjetasMayo)}</td>
                  <td className="py-2 text-right pr-2"><span className="bg-accent-blue/10 text-accent-blue px-2 py-0.5 rounded text-[10px]">Sueldo</span></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pl-2 text-white">Últimas cuotas MP (Rabo + Avramo)</td>
                  <td className="py-2">{formatCurrency(mpMayo)}</td>
                  <td className="py-2 text-right pr-2"><span className="bg-accent-blue/10 text-accent-blue px-2 py-0.5 rounded text-[10px]">Sueldo</span></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pl-2 text-text-tertiary">Gastos fijos</td>
                  <td className="py-2">{formatCurrency(fijosBase)}</td>
                  <td className="py-2 text-right pr-2"><span className="bg-white/5 text-text-tertiary px-2 py-0.5 rounded text-[10px]">Sueldo</span></td>
                </tr>
                <tr className="border-t border-white/10 font-bold">
                  <td className="py-3 pl-2 text-white">Total obligaciones Mayo</td>
                  <td className="py-3 text-accent-salmon">{formatCurrency(cuotasTarjetasMayo + mpMayo + fijosBase)}</td>
                  <td className="py-3 text-right pr-2 text-accent-mint font-semibold">Sobrante → ahorro: {formatCurrency(INITIAL_DATA.sueldo - cuotasTarjetasMayo - mpMayo - fijosBase)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* JUNIO+ */}
        <div className="dashboard-card p-5 mb-4 border-l-4 border-l-accent-mint bg-accent-mint/5">
          <h3 className="font-bold text-accent-mint mb-2">Junio 2026 en adelante — ¡Sin deudas!</h3>
          <p className="text-xs text-text-secondary">A partir de junio no tenés más cuotas. Tu sueldo de <strong className="text-white">{formatCurrency(INITIAL_DATA.sueldo)}</strong> menos fijos ({formatCurrency(fijosBase)}) y tu presupuesto personal (<strong className="text-accent-yellow">{formatCurrency(gastosPersonales)}</strong>) te deja <strong className="text-accent-mint">{formatCurrency(INITIAL_DATA.sueldo - fijosBase - gastosPersonales)}</strong> para ahorrar cada mes. Podés ajustar el slider de arriba para ver cómo cambia tu proyección.</p>
        </div>
      </div>

      {/* ========== MP Credits Detail ========== */}
      <div className="dashboard-card p-5">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <Smartphone size={14} className="text-accent-blue" /> Detalle créditos MercadoPago (11 activos)
        </h3>
        <div className="overflow-x-auto custom-scroll">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="text-text-secondary text-[9px] uppercase tracking-wider font-semibold border-b border-white/10">
                <th className="py-2 pl-2">Destino</th>
                <th className="py-2">Pendiente</th>
                <th className="py-2">Cuota Abril</th>
                <th className="py-2">Cuota Mayo</th>
                <th className="py-2 pr-2 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="text-[11px]">
              {MP_CREDITS.map(c => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2 pl-2 font-medium text-white">{c.destino}</td>
                  <td className="py-2 text-text-secondary">{formatCurrency(c.pendiente)}</td>
                  <td className="py-2 text-accent-blue">{formatCurrency(c.cuotaAbril)}</td>
                  <td className="py-2">{c.cuotaMayo > 0 ? <span className="text-accent-yellow">{formatCurrency(c.cuotaMayo)}</span> : <span className="text-accent-mint">—</span>}</td>
                  <td className="py-2 pr-2 text-right"><span className="text-[9px] bg-card-bg px-1.5 py-0.5 rounded text-text-tertiary">{c.cuotaInfo}</span></td>
                </tr>
              ))}
              <tr className="border-t border-white/10 font-bold text-xs">
                <td className="py-2 pl-2 text-white">TOTAL</td>
                <td className="py-2">{formatCurrency(MP_CREDITS.reduce((a, c) => a + c.pendiente, 0))}</td>
                <td className="py-2 text-accent-blue">{formatCurrency(mpAbril)}</td>
                <td className="py-2 text-accent-yellow">{formatCurrency(mpMayo)}</td>
                <td className="py-2 pr-2 text-right text-accent-mint">11 créditos</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== SECTION 3: Proyección ========== */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-2"><TrendingUp size={20} className="text-accent-mint" /> ¿Cuándo llegás a $5 millones?</h2>
        
        {/* Personal spending slider */}
        <div className="dashboard-card p-5 mb-4 border-l-4 border-l-accent-yellow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-accent-yellow" />
              <span className="text-sm font-semibold text-white">Tu presupuesto mensual personal</span>
            </div>
            <span className="text-xl font-bold text-accent-yellow">{formatCurrency(gastosPersonales)}</span>
          </div>
          <input
            type="range" min={50000} max={350000} step={5000}
            value={gastosPersonales}
            onChange={e => setGastosPersonales(Number(e.target.value))}
            className="w-full accent-accent-yellow h-2 bg-card-bg rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-text-tertiary mt-1">
            <span>$50k (ajustado)</span>
            <span className="text-text-secondary">Comida, salidas, transporte, imprevistos</span>
            <span>$350k (holgado)</span>
          </div>
          <div className="mt-3 flex justify-between text-[10px] border-t border-white/5 pt-3">
            <div><span className="text-text-tertiary">Sueldo:</span> <span className="text-white">{formatCurrency(INITIAL_DATA.sueldo)}</span></div>
            <div><span className="text-text-tertiary">Obligaciones (Jun+):</span> <span className="text-accent-salmon">{formatCurrency(fijosBase)}</span></div>
            <div><span className="text-text-tertiary">Personal:</span> <span className="text-accent-yellow">{formatCurrency(gastosPersonales)}</span></div>
            <div><span className="text-text-tertiary">Al ahorro:</span> <span className={`font-bold ${INITIAL_DATA.sueldo - fijosBase - gastosPersonales > 0 ? 'text-accent-mint' : 'text-accent-salmon'}`}>{formatCurrency(INITIAL_DATA.sueldo - fijosBase - gastosPersonales)}</span></div>
          </div>
        </div>

        <p className="text-xs text-text-tertiary mb-4">Proyección basada en tus ahorros actuales de {formatCurrency(INITIAL_DATA.ahorro)}, con {formatCurrency(gastosPersonales)}/mes para vos y el resto al ahorro.</p>

        {/* Milestone */}
        <div className="dashboard-card p-5 mb-4 bg-accent-mint/5 border-accent-mint/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-mint/20 flex items-center justify-center shrink-0">
              <TrendingUp size={24} className="text-accent-mint" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-accent-mint">Llegás a $5 millones en {monthsTo5M} meses</h3>
              <p className="text-xs text-text-secondary">
                Eso es en <strong className="text-white">{projMonths[monthsTo5M - 1]?.label || 'N/A'}</strong>.
                {monthsTo5M <= 6 && <span className="text-accent-mint"> ¡Muy rápido!</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Chart: single line savings growth */}
        <div className="dashboard-card p-6">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Crecimiento de tus ahorros
          </h3>
          <div className="flex items-end h-[250px] lg:h-[300px] gap-[2px] relative border-b border-l border-white/10 pb-4 pl-8">
            <div className="absolute left-0 top-0 text-[9px] text-text-tertiary">5M</div>
            <div className="absolute left-0 top-1/2 text-[9px] text-text-tertiary">{formatCurrency(maxVal / 2)}</div>
            <div className="absolute left-8 right-0 border-t border-dashed border-accent-mint/30" style={{top: `${(1 - 5000000 / maxVal) * 100}%`}}>
              <span className="text-[8px] text-accent-mint/50 absolute -top-3 right-0">META $5M</span>
            </div>
            {projMonths.slice(0, 24).map((m, i) => {
              const h = (m.savings / maxVal) * 100;
              const reached = m.savings >= 5000000;

              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-card-bg-light border border-white/10 p-3 rounded text-[9px] w-48 shadow-xl z-20 pointer-events-none">
                    <div className="font-bold text-white mb-1">{m.label}</div>
                    <div className="flex justify-between"><span className="text-text-secondary">Ahorros:</span><span className="text-accent-mint font-semibold">{formatCurrency(m.savings)}</span></div>
                    <div className="flex justify-between"><span className="text-text-secondary">Obligaciones:</span><span className="text-accent-salmon">{formatCurrency(m.obligations)}</span></div>
                    <div className="flex justify-between"><span className="text-text-secondary">Al ahorro:</span><span className="text-accent-blue">{formatCurrency(m.toSavings)}</span></div>
                  </div>
                  <div
                    style={{height: `${h}%`}}
                    className={`w-full rounded-t-sm transition-all ${reached ? 'bg-accent-mint/90' : 'bg-accent-blue/80'}`}
                  />
                  {i % 3 === 0 && <span className="text-[8px] text-text-tertiary absolute -bottom-5 w-max">{m.label.replace(' 2026', '').replace(' 2027', "'")}</span>}
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-6 text-[10px] text-text-secondary pt-6">
            <span className="flex items-center gap-2"><div className="w-3 h-3 bg-accent-blue/80 rounded-sm" /> Ahorros creciendo</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 bg-accent-mint/90 rounded-sm" /> Meta alcanzada</span>
          </div>
        </div>

        {/* Month-by-month detail */}
        <div className="dashboard-card p-5 mt-4">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Detalle mes a mes</h3>
          <div className="overflow-x-auto custom-scroll">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="text-text-secondary text-[9px] uppercase tracking-wider font-semibold border-b border-white/10">
                  <th className="py-2 pl-2">Mes</th>
                  <th className="py-2">Obligaciones</th>
                  <th className="py-2">Al ahorro</th>
                  <th className="py-2 text-right pr-2">Ahorro total</th>
                </tr>
              </thead>
              <tbody className="text-[11px]">
                {projMonths.slice(0, 12).map((m, i) => (
                  <tr key={i} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${m.savings >= 5000000 ? 'bg-accent-mint/5' : ''}`}>
                    <td className="py-2 pl-2 font-medium text-white">{m.label}</td>
                    <td className="py-2 text-accent-salmon">{formatCurrency(m.obligations)}</td>
                    <td className="py-2 text-accent-blue">+{formatCurrency(m.toSavings)}</td>
                    <td className={`py-2 text-right pr-2 font-semibold ${m.savings >= 5000000 ? 'text-accent-mint' : 'text-white'}`}>
                      {formatCurrency(m.savings)} {m.savings >= 5000000 && '✅'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========== Context ========== */}
      <div className="dashboard-card p-5 bg-card-bg-light">
        <div className="flex items-start gap-3">
          <Flame size={18} className="text-accent-salmon shrink-0 mt-0.5" />
          <div className="text-xs text-text-secondary space-y-1">
            <p><strong className="text-white">¿Por qué este camino es el más rápido?</strong></p>
            <p>Al haber eliminado la deuda de tarjetas, dejás de perder <strong className="text-accent-salmon">~{((CONSTANTS.TEM_DEBT * (1 + CONSTANTS.IVA) + CONSTANTS.IIBB + CONSTANTS.SELLOS) * 100).toFixed(1)}% mensual</strong> en intereses, y todo tu sueldo sobrante va directo a reconstruir ahorros que crecen con <strong className="text-accent-mint">~{(TEM_SAVINGS * 100).toFixed(2)}% mensual</strong>.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
