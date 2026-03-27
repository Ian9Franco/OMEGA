"use client";
import React, { useState } from 'react';
import {
  BarChart3, Zap, CreditCard, Smartphone, ShoppingBag,
  Home, Wifi, CheckCircle2, AlertTriangle, TrendingUp, Target,
  ChevronDown, ChevronUp, Info, ArrowRight
} from 'lucide-react';
import { INITIAL_DATA, CONSTANTS, TEM_SAVINGS, MP_CREDITS, CUOTAS_TARJETAS_FUTURAS, formatCurrency } from '@/lib/constants';

// ===================== FIXED EXPENSE ITEMS =====================
const GASTOS_FIJOS_ITEMS = [
  { label: 'Impuestos / ARBA / ABL', monto: INITIAL_DATA.gastos.impuestos, icon: '🏛️', tipo: 'obligatorio' },
  { label: 'Internet fibra óptica', monto: INITIAL_DATA.gastos.internet, icon: '📡', tipo: 'necesario' },
  { label: 'Datos móviles', monto: INITIAL_DATA.gastos.datosMoviles, icon: '📶', tipo: 'necesario' },
  { label: 'Comida / Mercado (est.)', monto: INITIAL_DATA.gastos.comida, icon: '🛒', tipo: 'variable' },
  { label: 'Cuota Auricular (1/6)', monto: INITIAL_DATA.gastos.cuotaAuricular, icon: '🎧', tipo: 'cuota' },
];

// ===================== CARD BREAKDOWN =====================
// Mastercard breakdown from master periodo.txt
const MASTER_BREAKDOWN = {
  intereses: 98555.17,
  iva: 20696.59,
  sellos: 5043.66,  // sellos + percepciones
  consumos: [
    { desc: 'HAVANNA (23/02)', monto: 7000.00 },
    { desc: 'OPENPAY*ENVERO 01/03', monto: 16933.34 },
    { desc: 'MERPAGO*KFC', monto: 13500.00 },
    { desc: 'MERPAGO*SBUXESPEJO', monto: 7300.00 },
    { desc: 'PAYU*AR*UBER (x2)', monto: 10299.00 },
    { desc: 'HAVANNA (18/02)', monto: 9200.00 },
    { desc: 'HAUSBROT-RAMOS', monto: 5120.00 },
    { desc: 'MERPAGO*OVALDINAULPAN', monto: 8131.24 },
    { desc: 'PAYU*AR*UBER (x2)', monto: 16661.00 },
    { desc: 'ROCKY RAMOS', monto: 67500.00 },
    { desc: 'MICROSOFT 365', monto: 0 }, // USD
    { desc: 'MERPAGO*SBUXESPEJO', monto: 18955.00 },
    { desc: 'MERPAGO*MERCADOLIBRE 01/06', monto: 2705.27 },
    { desc: 'MERPAGO*MERCADOLIBRE 01/02', monto: 25707.02 },
    { desc: 'MERPAGO*MELI', monto: 18399.00 },
    { desc: 'MERPAGO*NIMAVENTUR 02/02', monto: 12348.12 },
    { desc: 'MERPAGO*STOREARG 02/03', monto: 11935.00 },
    { desc: 'MERPAGO*SBUXESPEJO 02/02', monto: 8147.34 },
    { desc: 'MERPAGO*SBUXESPEJO 02/02', monto: 6597.77 },
    { desc: 'LUXO 03/03', monto: 16000.00 },
    { desc: 'MERPAGO*TOMASSA 03/03', monto: 10036.33 },
  ],
  totalResumen: 424183.12
};

// Visa breakdown from visa periodo.txt
const VISA_BREAKDOWN = {
  intereses: 81581.32,
  iva: 17716.72,
  sellos: 4137.23,  // sellos + afip 30% + percepciones
  consumos: [
    { desc: 'MERPAGO*YANYANG (22/02)', monto: 14582.74 },
    { desc: 'MERPAGO*CECLARCOLPON', monto: 35841.65 },
    { desc: 'GOOGLE *Google O (USD)', monto: 0 },
    { desc: 'BBVA SEGUROS (x2)', monto: 33383.84 },
    { desc: 'MERPAGO*YANYANG (07/02)', monto: 14871.61 },
    { desc: 'MERPAGO*MARIASOLEDADANIAS', monto: 2781.74 },
    { desc: 'DLO*DIDI', monto: 5900.00 },
    { desc: 'MERPAGO*HAVANNA', monto: 11000.00 },
    { desc: 'MERPAGO*YANYANG (05/02)', monto: 2781.74 },
    { desc: 'CULTIVARTE ALMACEN', monto: 11300.00 },
    { desc: 'DEAN AND DENNYS 02/03', monto: 3832.28 },
    { desc: 'MERPAGO*MERCADOLIBRE 05/06', monto: 33333.16 },
  ],
  totalResumen: 273063.23
};

// ===================== STRATEGY CALCULATOR =====================
function calcStrategy(masterPago: number, visaPago: number) {
  const fijosBase = INITIAL_DATA.gastos.impuestos + INITIAL_DATA.gastos.fijosExtras;
  const auricular = INITIAL_DATA.gastos.cuotaAuricular;
  const mpTotal = MP_CREDITS.reduce((a, c) => a + c.cuotaAbril, 0);
  const sueldo = INITIAL_DATA.sueldo;

  const totalGastos = fijosBase + auricular + mpTotal + masterPago + visaPago;
  const liquidoRestante = sueldo - totalGastos;

  // Remaining card debt after payment (what accrues interest next month)
  const masterRestante = Math.max(0, MASTER_BREAKDOWN.totalResumen - masterPago);
  const visaRestante = Math.max(0, VISA_BREAKDOWN.totalResumen - visaPago);

  // Calculate next month's interest on unpaid balance
  const interestNext = (masterRestante + visaRestante) * CONSTANTS.TEM_DEBT * (1 + CONSTANTS.IVA) + (masterRestante + visaRestante) * (CONSTANTS.IIBB + CONSTANTS.SELLOS);

  // Impact on savings goal: each $1 of interest = $1 less savings
  // Savings yield this month
  const yieldEarned = INITIAL_DATA.ahorro * TEM_SAVINGS;

  // Net position after April
  const savingsEndApr = INITIAL_DATA.ahorro + yieldEarned + Math.max(0, liquidoRestante);

  return {
    masterPago, visaPago, totalGastos, liquidoRestante,
    masterRestante, visaRestante, interestNext, yieldEarned, savingsEndApr
  };
}

// ===================== STRATEGY CARD =====================
function StrategyCard({
  title, tag, tagColor, borderColor, strategy, isRecommended, description
}: {
  title: string; tag: string; tagColor: string; borderColor: string;
  strategy: ReturnType<typeof calcStrategy>;
  isRecommended?: boolean;
  description: string;
}) {
  return (
    <div className={`rounded-2xl border-2 ${borderColor} bg-card-bg overflow-hidden relative`}>
      {isRecommended && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-mint via-accent-blue to-accent-mint" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-white text-sm">{title}</h3>
            <p className="text-[10px] text-text-tertiary mt-0.5">{description}</p>
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${tagColor}`}>{tag}</span>
        </div>

        <div className="space-y-2 text-[11px]">
          <div className="flex justify-between">
            <span className="text-text-secondary">Pago Master</span>
            <span className="text-white font-semibold">{formatCurrency(strategy.masterPago)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Pago Visa</span>
            <span className="text-white font-semibold">{formatCurrency(strategy.visaPago)}</span>
          </div>
          <div className="flex justify-between border-t border-white/5 pt-2">
            <span className="text-text-secondary">Total tarjetas</span>
            <span className="text-accent-salmon font-semibold">{formatCurrency(strategy.masterPago + strategy.visaPago)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Deuda restante</span>
            <span className={`font-semibold ${strategy.masterRestante + strategy.visaRestante > 0 ? 'text-accent-yellow' : 'text-accent-mint'}`}>
              {formatCurrency(strategy.masterRestante + strategy.visaRestante)}
            </span>
          </div>

          <div className="bg-dashboard-bg/60 rounded-xl p-3 space-y-1.5 mt-3">
            <div className="flex justify-between">
              <span className="text-text-tertiary">Interés que pagás en Mayo</span>
              <span className={`font-semibold ${strategy.interestNext > 0 ? 'text-accent-salmon' : 'text-accent-mint'}`}>
                {strategy.interestNext > 0 ? `+${formatCurrency(strategy.interestNext)}` : '$0'}
              </span>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-1.5">
              <span className="text-text-secondary font-medium">Líquido restante</span>
              <span className={`font-bold text-sm ${strategy.liquidoRestante >= 0 ? 'text-accent-mint' : 'text-accent-salmon'}`}>
                {formatCurrency(strategy.liquidoRestante)}
              </span>
            </div>
          </div>
        </div>

        {isRecommended && (
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-accent-mint bg-accent-mint/10 rounded-lg px-3 py-2">
            <CheckCircle2 size={12} />
            <span>Estrategia óptima para tu meta de $5M</span>
          </div>
        )}
        {!isRecommended && strategy.interestNext > 50000 && (
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-accent-yellow bg-accent-yellow/10 rounded-lg px-3 py-2">
            <AlertTriangle size={12} />
            <span>Generás {formatCurrency(strategy.interestNext)} de interés para Mayo</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ===================== EXPENSE SECTION =====================
function ExpenseSection({ title, icon, total, children, defaultOpen = false }: {
  title: string; icon: React.ReactNode; total: number; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/8 rounded-xl overflow-hidden bg-card-bg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-text-secondary">{icon}</span>
          <span className="font-semibold text-white text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-accent-salmon font-bold text-sm">{formatCurrency(total)}</span>
          {open ? <ChevronUp size={14} className="text-text-tertiary" /> : <ChevronDown size={14} className="text-text-tertiary" />}
        </div>
      </button>
      {open && (
        <div className="border-t border-white/5 px-4 pb-3 pt-3 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}

function ExpenseItem({ label, monto, badge, badgeColor }: {
  label: string; monto: number; badge?: string; badgeColor?: string;
}) {
  if (monto === 0) return null;
  return (
    <div className="flex items-center justify-between text-[11px] py-1 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-text-secondary">{label}</span>
        {badge && (
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${badgeColor || 'bg-white/10 text-text-tertiary'}`}>
            {badge}
          </span>
        )}
      </div>
      <span className="text-white font-medium">{formatCurrency(monto)}</span>
    </div>
  );
}

// ===================== MAYO PREVIEW =====================
function MayoPreview() {
  const masterCuotas = 78696.98;
  const visaCelular = 183333.25;
  const mpMayo = MP_CREDITS.reduce((a, c) => a + c.cuotaMayo, 0);
  const auricular = INITIAL_DATA.gastos.cuotaAuricular;
  const fijosBase = INITIAL_DATA.gastos.impuestos + INITIAL_DATA.gastos.fijosExtras;
  const total = masterCuotas + visaCelular + mpMayo + auricular + fijosBase;

  return (
    <div className="dashboard-card p-5">
      <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
        <ArrowRight size={16} className="text-accent-blue" /> Preview Mayo 2026
      </h2>
      <p className="text-[10px] text-text-tertiary mb-4">
        Cuotas que entran desde el próximo resumen (26/04). Son compromisos fijos ineludibles.
      </p>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-[11px] px-3 py-2.5 bg-accent-salmon/10 rounded-xl border border-accent-salmon/20">
          <span className="text-white font-semibold">📱 Celular (Visa) — 2/12</span>
          <span className="text-accent-salmon font-bold">{formatCurrency(visaCelular)}</span>
        </div>
        <div className="flex justify-between items-center text-[11px] px-3 py-2.5 bg-card-bg-light rounded-xl border border-white/8">
          <span className="text-text-secondary">💳 Cuotas Mastercard pendientes</span>
          <span className="text-white font-medium">{formatCurrency(masterCuotas)}</span>
        </div>
        <div className="flex justify-between items-center text-[11px] px-3 py-2.5 bg-card-bg-light rounded-xl border border-white/8">
          <span className="text-text-secondary">📱 MP créditos continuables</span>
          <span className="text-white font-medium">{formatCurrency(mpMayo)}</span>
        </div>
        <div className="flex justify-between items-center text-[11px] px-3 py-2.5 bg-card-bg-light rounded-xl border border-white/8">
          <span className="text-text-secondary">🎧 Auricular (2/6)</span>
          <span className="text-white font-medium">{formatCurrency(auricular)}</span>
        </div>
        <div className="flex justify-between items-center text-[11px] px-3 py-2.5 bg-card-bg-light rounded-xl border border-white/8">
          <span className="text-text-secondary">🏠 Gastos fijos (impuestos + servicios)</span>
          <span className="text-white font-medium">{formatCurrency(fijosBase)}</span>
        </div>
        <div className="flex justify-between items-center text-[11px] px-3 py-2.5 bg-dashboard-bg rounded-xl border border-white/10 mt-1">
          <span className="text-white font-bold">Total compromisos fijos Mayo</span>
          <span className="text-accent-yellow font-bold text-sm">{formatCurrency(total)}</span>
        </div>
        <p className="text-[10px] text-text-tertiary text-center pt-1">
          💡 Tu sueldo neto es {formatCurrency(INITIAL_DATA.sueldo)} · Sobrante estimado para Mayo:{' '}
          <strong className={`${INITIAL_DATA.sueldo - total > 0 ? 'text-accent-mint' : 'text-accent-salmon'}`}>
            {formatCurrency(INITIAL_DATA.sueldo - total)}
          </strong>
        </p>
      </div>
    </div>
  );
}

// ===================== MAIN VIEW =====================
export function GastosEstrategiaView() {
  const fijosBase = INITIAL_DATA.gastos.impuestos + INITIAL_DATA.gastos.fijosExtras;
  const auricular = INITIAL_DATA.gastos.cuotaAuricular;
  const mpTotal = MP_CREDITS.reduce((a, c) => a + c.cuotaAbril, 0);
  const sueldo = INITIAL_DATA.sueldo;

  const masterTotal = MASTER_BREAKDOWN.intereses + MASTER_BREAKDOWN.iva + MASTER_BREAKDOWN.sellos + MASTER_BREAKDOWN.consumos.reduce((a, c) => a + c.monto, 0);
  const visaTotal = VISA_BREAKDOWN.intereses + VISA_BREAKDOWN.iva + VISA_BREAKDOWN.sellos + VISA_BREAKDOWN.consumos.reduce((a, c) => a + c.monto, 0);

  // Minimum payment: interest + taxes + 5% of principal
  const masterMin = Math.round(MASTER_BREAKDOWN.intereses + MASTER_BREAKDOWN.iva + MASTER_BREAKDOWN.sellos + MASTER_BREAKDOWN.totalResumen * 0.05);
  const visaMin = Math.round(VISA_BREAKDOWN.intereses + VISA_BREAKDOWN.iva + VISA_BREAKDOWN.sellos + VISA_BREAKDOWN.totalResumen * 0.05);

  // Partial: 50% of total
  const masterMed = Math.round(MASTER_BREAKDOWN.totalResumen * 0.5);
  const visaMed = Math.round(VISA_BREAKDOWN.totalResumen * 0.5);

  // Full
  const masterFull = MASTER_BREAKDOWN.totalResumen;
  const visaFull = VISA_BREAKDOWN.totalResumen;

  const stratMin = calcStrategy(masterMin, visaMin);
  const stratMed = calcStrategy(masterMed, visaMed);
  const stratFull = calcStrategy(masterFull, visaFull);

  // MP grouped
  const mpGrupos = [
    { label: 'Préstamos personales', items: MP_CREDITS.filter(c => c.destino.toLowerCase().includes('préstamo') || c.destino.toLowerCase().includes('prestamo')) },
    { label: 'Transferencias a amigos', items: MP_CREDITS.filter(c => c.destino.toLowerCase().includes('transferencia')) },
    { label: 'Consumos y otros', items: MP_CREDITS.filter(c => !c.destino.toLowerCase().includes('transferencia') && !c.destino.toLowerCase().includes('préstamo') && !c.destino.toLowerCase().includes('prestamo')) },
  ];

  return (
    <div className="fade-in space-y-5">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-0.5">
          <BarChart3 size={20} className="text-accent-blue" /> Estrategia de Gastos — Abril 2026
        </h2>
        <p className="text-[11px] text-text-tertiary">
          Sueldo cobrado el 1/4 · Resumen de tarjetas cerrado el 26/03 · Vencimiento aprox. 4/4
        </p>
      </div>

      {/* Salary overview banner */}
      <div className="dashboard-card p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-accent-blue/10 to-transparent border-accent-blue/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-blue/10 rounded-lg">
            <TrendingUp size={18} className="text-accent-blue" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Sueldo cobrado el 1° de Abril</div>
            <div className="text-[10px] text-text-secondary">Con este ingreso cubrís el cierre del 26/03 y los gastos de Abril</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-accent-blue">{formatCurrency(sueldo)}</div>
          <div className="text-[10px] text-text-tertiary">Neto mensual</div>
        </div>
      </div>

      {/* === EXPENSE BREAKDOWN === */}
      <div className="dashboard-card p-5">
        <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
          <ShoppingBag size={16} className="text-accent-yellow" /> Desglose Completo de Gastos de Abril
        </h2>
        <p className="text-[10px] text-text-tertiary mb-4">
          Cada peso que sale de tu sueldo este mes, organizado por categoría.
        </p>

        <div className="space-y-2">
          {/* Fijos */}
          <ExpenseSection
            title="Gastos Fijos del Hogar"
            icon={<Home size={15} />}
            total={fijosBase + auricular}
            defaultOpen={true}
          >
            {GASTOS_FIJOS_ITEMS.map((g, i) => (
              <ExpenseItem key={i} label={g.icon + ' ' + g.label} monto={g.monto}
                badge={g.tipo === 'cuota' ? 'Cuota 1/6' : undefined}
                badgeColor={g.tipo === 'cuota' ? 'bg-accent-yellow/20 text-accent-yellow' : undefined}
              />
            ))}
          </ExpenseSection>

          {/* Mastercard */}
          <ExpenseSection
            title="Mastercard — Resumen Cerrado 26/03"
            icon={<CreditCard size={15} className="text-red-400" />}
            total={MASTER_BREAKDOWN.totalResumen}
          >
            <div className="text-[9px] text-text-tertiary uppercase tracking-wider mb-2">Intereses y Cargos Bancarios (Evitable si pagabas antes)</div>
            <ExpenseItem label="🏦 Intereses por refinanciación" monto={MASTER_BREAKDOWN.intereses} badge="Costo Puro" badgeColor="bg-accent-salmon/20 text-accent-salmon" />
            <ExpenseItem label="🧾 IVA s/ intereses (21%)" monto={MASTER_BREAKDOWN.iva} />
            <ExpenseItem label="📋 Sellos + Percepciones IIBB" monto={MASTER_BREAKDOWN.sellos} />
            <div className="text-[9px] text-text-tertiary uppercase tracking-wider mt-3 mb-2">Tus Consumos del Período</div>
            {MASTER_BREAKDOWN.consumos.map((c, i) => (
              <ExpenseItem key={i} label={c.desc} monto={c.monto} />
            ))}
          </ExpenseSection>

          {/* Visa */}
          <ExpenseSection
            title="Visa — Resumen Cerrado 26/03"
            icon={<CreditCard size={15} className="text-blue-400" />}
            total={VISA_BREAKDOWN.totalResumen}
          >
            <div className="text-[9px] text-text-tertiary uppercase tracking-wider mb-2">Intereses y Cargos Bancarios</div>
            <ExpenseItem label="🏦 Intereses por refinanciación" monto={VISA_BREAKDOWN.intereses} badge="Costo Puro" badgeColor="bg-accent-salmon/20 text-accent-salmon" />
            <ExpenseItem label="🧾 IVA s/ intereses (21%) + Dig." monto={VISA_BREAKDOWN.iva} />
            <ExpenseItem label="📋 Sellos + AFIP RG5617 + IIBB" monto={VISA_BREAKDOWN.sellos} />
            <div className="text-[9px] text-text-tertiary uppercase tracking-wider mt-3 mb-2">Tus Consumos del Período</div>
            {VISA_BREAKDOWN.consumos.map((c, i) => (
              <ExpenseItem key={i} label={c.desc} monto={c.monto} />
            ))}
          </ExpenseSection>

          {/* MP */}
          <ExpenseSection
            title="Mercado Crédito — Vencimiento 01/04"
            icon={<Smartphone size={15} className="text-accent-blue" />}
            total={mpTotal}
          >
            {mpGrupos.map((grupo, gi) => grupo.items.length > 0 && (
              <div key={gi}>
                <div className="text-[9px] text-text-tertiary uppercase tracking-wider mt-2 mb-1.5">{grupo.label}</div>
                {grupo.items.map((item, ii) => (
                  <div key={ii} className="flex items-center justify-between text-[11px] py-1 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-text-secondary truncate">{item.destino}</span>
                      <span className="text-[9px] text-text-tertiary flex-shrink-0">{item.cuotaInfo}</span>
                    </div>
                    <span className="text-white font-medium ml-2">{formatCurrency(item.cuotaAbril)}</span>
                  </div>
                ))}
              </div>
            ))}
            <div className="flex justify-between font-bold border-t border-white/10 pt-2 mt-2 text-[11px]">
              <span className="text-text-secondary">Total MP Abril</span>
              <span className="text-white">{formatCurrency(mpTotal)}</span>
            </div>
          </ExpenseSection>
        </div>

        {/* Total summary */}
        <div className="mt-4 bg-dashboard-bg rounded-xl p-4 border border-white/8">
          <div className="text-[9px] text-text-tertiary uppercase tracking-wider mb-3">Resumen de Obligaciones Totales de Abril</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
            <div>
              <div className="text-text-tertiary mb-0.5">Gastos Fijos</div>
              <div className="text-white font-semibold">{formatCurrency(fijosBase + auricular)}</div>
            </div>
            <div>
              <div className="text-text-tertiary mb-0.5">Tarjetas (total)</div>
              <div className="text-accent-salmon font-semibold">{formatCurrency(MASTER_BREAKDOWN.totalResumen + VISA_BREAKDOWN.totalResumen)}</div>
            </div>
            <div>
              <div className="text-text-tertiary mb-0.5">Mercado Crédito</div>
              <div className="text-accent-blue font-semibold">{formatCurrency(mpTotal)}</div>
            </div>
            <div>
              <div className="text-text-tertiary mb-0.5">Sueldo disponible</div>
              <div className={`font-bold text-sm ${sueldo - (fijosBase + auricular + MASTER_BREAKDOWN.totalResumen + VISA_BREAKDOWN.totalResumen + mpTotal) < 0 ? 'text-accent-salmon' : 'text-accent-mint'}`}>
                {formatCurrency(sueldo - fijosBase - auricular - MASTER_BREAKDOWN.totalResumen - VISA_BREAKDOWN.totalResumen - mpTotal)}
              </div>
            </div>
          </div>
          <div className="mt-3 p-2 bg-accent-yellow/10 border border-accent-yellow/20 rounded-lg text-[10px] text-accent-yellow flex items-start gap-2">
            <Info size={12} className="mt-0.5 flex-shrink-0" />
            <span>
              Si pagás ambas tarjetas al <strong>100%</strong>, el sueldo no alcanza. Por eso existe la estrategia de pagar solo los mínimos o pago parcial — pero cada peso de deuda que queda genera interés del <strong>7.09% TEM</strong>.
            </span>
          </div>
        </div>
      </div>

      {/* === STRATEGY COMPARATOR === */}
      <div className="dashboard-card p-5">
        <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
          <Target size={16} className="text-accent-mint" /> Comparador de Estrategias de Pago
        </h2>
        <p className="text-[10px] text-text-tertiary mb-4">
          Analizá cómo cada forma de pagar las tarjetas impacta en tu liquidez y en la meta de $5M.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <StrategyCard
            title="Pago Mínimo"
            tag="⚠️ Riesgo"
            tagColor="bg-accent-salmon/20 text-accent-salmon"
            borderColor="border-accent-salmon/30"
            strategy={stratMin}
            description="Solo cubrís intereses + 5% del capital. Mucho líquido, pero deuda que crece."
          />
          <StrategyCard
            title="Pago Parcial (50%)"
            tag="🔶 Balance"
            tagColor="bg-accent-yellow/20 text-accent-yellow"
            borderColor="border-accent-yellow/30"
            strategy={stratMed}
            description="Reducís bastante la deuda y el interés de Mayo, sin quedar en cero."
          />
          <StrategyCard
            title="Pago Total"
            tag="✅ Óptimo"
            tagColor="bg-accent-mint/20 text-accent-mint"
            borderColor="border-accent-mint/40"
            strategy={stratFull}
            isRecommended={stratFull.liquidoRestante > 0}
            description="Cortás el ciclo de intereses para siempre. Si el sueldo alcanza, es la mejor decisión."
          />
        </div>

        {/* Recommendation reasoning */}
        <div className="bg-dashboard-bg/60 rounded-xl p-4 border border-white/8 text-[11px] space-y-2">
          <div className="text-[9px] text-text-tertiary uppercase tracking-wider font-semibold mb-2">💡 Lógica de la Recomendación</div>
          <div className="flex items-start gap-2">
            <span className="text-accent-salmon mt-0.5">⚠️</span>
            <span className="text-text-secondary">
              <strong className="text-white">Pago mínimo:</strong> Pagas {formatCurrency(masterMin + visaMin)} pero dejás deuda de {formatCurrency(stratMin.masterRestante + stratMin.visaRestante)} que acumula <strong className="text-accent-salmon">{formatCurrency(Math.round(stratMin.interestNext))}</strong> de interés adicional en Mayo. El ciclo se retroalimenta.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-accent-yellow mt-0.5">🔶</span>
            <span className="text-text-secondary">
              <strong className="text-white">Pago parcial:</strong> Reducís el interés de Mayo a {formatCurrency(Math.round(stratMed.interestNext))} y te quedás con {formatCurrency(stratMed.liquidoRestante)} líquido. Es un buen balance si querés dormir tranquilo.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-accent-mint mt-0.5">✅</span>
            <span className="text-text-secondary">
              <strong className="text-white">Pago total:</strong>{' '}
              {stratFull.liquidoRestante >= 0
                ? `Te sobran ${formatCurrency(stratFull.liquidoRestante)} después de pagar todo. En Mayo ya no pagás interés y todo el sobrante del sueldo va al ahorro.`
                : `Hay un déficit de ${formatCurrency(Math.abs(stratFull.liquidoRestante))} para pagar todo. Necesitás complementar con ahorros, pero es una inversión que te devuelve ${formatCurrency(Math.round(stratMin.interestNext))} en interés evitado.`
              }
            </span>
          </div>
        </div>
      </div>

      {/* === MAYO PREVIEW === */}
      <MayoPreview />
    </div>
  );
}
