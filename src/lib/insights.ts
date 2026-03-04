// ===============================================
// OMEGA Finance Dashboard — Insight Messages
// ===============================================
// Generates context-aware popup messages when the user changes dashboard controls.

import type { InsightMessage, SalaryAllocation, ProjectionResult } from './types';
import { INITIAL_DATA, CONSTANTS, TEM_SAVINGS, formatCurrency } from './constants';
import { calcInterest } from './calculations';

let insightCounter = 0;

function makeInsight(type: InsightMessage['type'], title: string, message: string, duration = 5000): InsightMessage {
  return { id: `insight-${++insightCounter}-${Date.now()}`, type, title, message, duration };
}

// --- Generate insights based on allocation changes ---
export function getSliderInsights(
  monthIdx: number,
  cardId: 'visa' | 'master',
  oldVal: number,
  newVal: number,
  projection: ProjectionResult
): InsightMessage[] {
  const insights: InsightMessage[] = [];
  const diff = newVal - oldVal;
  const monthData = projection.months[monthIdx];
  const monthLabel = monthData.monthStr;

  if (Math.abs(diff) < 5000) return insights;

  // Check if budget is exceeded
  const otherCard = cardId === 'visa' ? 'master' : 'visa';
  const totalAllocated = newVal + (monthData.requiredMinimums[otherCard] || 0);
  const surplus = INITIAL_DATA.sueldo - monthData.gastosFijosTotales - totalAllocated;

  if (surplus < 0) {
    insights.push(makeInsight('warning',
      '⚠️ Sueldo insuficiente',
      `Con esa asignación en ${monthLabel}, te faltan ${formatCurrency(Math.abs(surplus))} para cubrir tus gastos de vida. Vas a necesitar rescatar de ahorros.`
    ));
  } else if (diff > 0) {
    // Paying more → positive impact
    const interestSaved = calcInterest(diff);
    insights.push(makeInsight('success',
      '📉 Buen movimiento',
      `+${formatCurrency(diff)} a ${cardId === 'visa' ? 'Visa' : 'Master'} te evita ~${formatCurrency(interestSaved)}/mes en intereses compuestos.`
    ));
  } else if (diff < 0) {
    // Paying less → warning
    const extraInterest = calcInterest(Math.abs(diff));
    insights.push(makeInsight('info',
      '📊 Menos pago → más interés',
      `Reducir ${formatCurrency(Math.abs(diff))} genera ~${formatCurrency(extraInterest)}/mes de interés extra que se capitaliza.`
    ));
  }

  return insights;
}

// --- Generate insights for MercadoPago expense changes ---
export function getMPInsights(
  monthIdx: number,
  oldVal: number,
  newVal: number
): InsightMessage[] {
  const insights: InsightMessage[] = [];
  const diff = newVal - oldVal;
  if (Math.abs(diff) < 10000) return insights;

  if (diff > 0) {
    insights.push(makeInsight('warning',
      '💸 Más gasto de vida',
      `+${formatCurrency(diff)} de consumo MP reduce tu capacidad de pago de deuda en la misma proporción.`
    ));
  } else {
    insights.push(makeInsight('success',
      '✅ Ahorro inteligente',
      `Reduciste ${formatCurrency(Math.abs(diff))} en consumo MP. Eso libera capacidad para atacar la deuda más rápido.`
    ));
  }

  return insights;
}

// --- Insights for savings rescue activation ---
export function getRescueInsights(
  amount: number,
  savingsAfter: number
): InsightMessage[] {
  const insights: InsightMessage[] = [];
  const monthlyLiving = INITIAL_DATA.gastos.impuestos + INITIAL_DATA.gastos.fijosExtras + 221403;

  if (amount > 0) {
    const interestAvoided = calcInterest(amount);
    insights.push(makeInsight('success',
      '⚡ Inyección de capital',
      `Con ${formatCurrency(amount)} de tus ahorros dejás de pagar ~${formatCurrency(interestAvoided)}/mes en intereses (${((interestAvoided / amount) * 100).toFixed(1)}% de lo inyectado).`
    ));

    // Check if cushion is getting too thin
    if (savingsAfter < monthlyLiving) {
      insights.push(makeInsight('warning',
        '🛡️ Colchón bajo',
        `Tu ahorro quedaría en ${formatCurrency(savingsAfter)}, menor a 1 mes de gastos (${formatCurrency(monthlyLiving)}). Considerá mantener un mínimo de seguridad.`
      ));
    }
  }

  return insights;
}

// --- Insights for hard reset application ---
export function getHardResetInsight(cushion: number, totalPayoff: number): InsightMessage {
  return makeInsight('success',
    '🚀 Hard Reset Aplicado',
    `Se inyectan ${formatCurrency(totalPayoff)} a la deuda manteniendo un colchón de ${formatCurrency(cushion)}. Reconstrucción de capital activada.`,
    7000
  );
}

// --- Savings growth insight (one-time on load) ---
export function getRatioInsight(): InsightMessage {
  const monthlyYield = INITIAL_DATA.ahorro * TEM_SAVINGS;
  const fijos = INITIAL_DATA.gastos.impuestos + INITIAL_DATA.gastos.fijosExtras;
  const surplus = INITIAL_DATA.sueldo - fijos;
  return makeInsight('success',
    '💰 Tu plata trabaja para vos',
    `Tus ahorros de ${formatCurrency(INITIAL_DATA.ahorro)} generan ${formatCurrency(monthlyYield)}/mes en rendimiento (${(TEM_SAVINGS * 100).toFixed(2)}% mensual). Con un sobrante de sueldo de ~${formatCurrency(surplus)}/mes, tus ahorros crecen rápido.`,
    8000
  );
}
