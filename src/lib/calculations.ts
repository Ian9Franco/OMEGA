// ===============================================
// OMEGA Finance Dashboard — Calculation Engine
// ===============================================

import type {
  DebtItem, SavingsRescue, SalaryAllocation,
  ProjectionMonth, ProjectionResult, SimMonth, SimResult, MPParsedData
} from './types';
import { INITIAL_DATA, CONSTANTS, TEM_SAVINGS, MONTH_LABELS } from './constants';

// --- Calculate full interest on a debt balance ---
export function calcInterest(amount: number): number {
  if (amount <= 0) return 0;
  const baseInt = amount * CONSTANTS.TEM_DEBT;
  const iva = baseInt * CONSTANTS.IVA;
  const iibb = amount * CONSTANTS.IIBB;
  const subtotal = baseInt + iva + iibb;
  const sellos = (amount + subtotal) * CONSTANTS.SELLOS;
  return baseInt + iva + iibb + sellos;
}

// --- Calculate pure interest loss at Day 0 ---
export function calcPureInterestStart(): number {
  return INITIAL_DATA.deudas.reduce((totalAcc, debt) => totalAcc + calcInterest(debt.amount), 0);
}

// --- Main Projection Engine ---
export function runProjection(
  savingsRescue: SavingsRescue[],
  salaryAllocations: SalaryAllocation[],
  mercadoPagoGastos: number[],
  autoReconstruct: boolean,
  mpData: MPParsedData | null
): ProjectionResult {
  const currentDebts = INITIAL_DATA.deudas.map(d => ({ ...d }));
  let currentSavings = INITIAL_DATA.ahorro;
  let currentSelfDebt = 0;
  let totalInterestPaid = 0;
  let totalYieldEarned = 0;
  const months: ProjectionMonth[] = [];

  const cuotasMensuales = mpData
    ? mpData.cuotasPendientes.reduce((a, c) => a + c.cuotaMensual, 0)
    : 0;

  for (let i = 0; i < 4; i++) {
    const monthYield = currentSavings * TEM_SAVINGS;
    currentSavings += monthYield;
    totalYieldEarned += monthYield;

    let injectionThisMonth = 0;
    let pmtToSelf = 0;
    const currentMonthAllocs = i < 3 ? salaryAllocations[i] : salaryAllocations[2];
    const requiredMinPaymentsThisMonth: Record<string, number> = {};

    // 1. Compound Interest
    let totalMonthInterest = 0;
    let totalMinPaymentRequired = 0;
    const totalDebtBeforeInterest = currentDebts.reduce((acc, d) => acc + d.amount, 0);

    for (const debt of currentDebts) {
      if (debt.amount > 0) {
        const specificInterest = calcInterest(debt.amount);
        const specificMinPayment = specificInterest + (debt.amount * 0.05);
        requiredMinPaymentsThisMonth[debt.id] = Math.min(specificMinPayment, debt.amount + specificInterest);
        debt.amount += specificInterest;
        totalMonthInterest += specificInterest;
        totalMinPaymentRequired += specificMinPayment;
      } else {
        requiredMinPaymentsThisMonth[debt.id] = 0;
      }
    }
    totalInterestPaid += totalMonthInterest;

    // 2. Savings Rescue Injection
    if (i < 3) {
      const rescue = savingsRescue[i];
      if (rescue.active) {
        const totalRequested = rescue.visa + rescue.master;
        const actualInjectionAvailable = Math.min(totalRequested, currentSavings);
        if (actualInjectionAvailable > 0) {
          const visaShare = totalRequested > 0 ? (rescue.visa / totalRequested) : 0;
          const masterShare = totalRequested > 0 ? (rescue.master / totalRequested) : 0;
          const visaInjection = actualInjectionAvailable * visaShare;
          const masterInjection = actualInjectionAvailable * masterShare;
          currentSavings -= actualInjectionAvailable;
          currentSelfDebt += actualInjectionAvailable;
          injectionThisMonth = actualInjectionAvailable;

          let totalUnused = 0;
          const visaDebt = currentDebts.find(d => d.id === 'visa');
          if (visaDebt && visaDebt.amount > 0) {
            const payDown = Math.min(visaInjection, visaDebt.amount);
            visaDebt.amount -= payDown;
            totalUnused += (visaInjection - payDown);
          } else { totalUnused += visaInjection; }

          const masterDebt = currentDebts.find(d => d.id === 'master');
          if (masterDebt && masterDebt.amount > 0) {
            const payDown = Math.min(masterInjection, masterDebt.amount);
            masterDebt.amount -= payDown;
            totalUnused += (masterInjection - payDown);
          } else { totalUnused += masterInjection; }

          if (totalUnused > 0) {
            currentSavings += totalUnused;
            currentSelfDebt -= totalUnused;
            injectionThisMonth -= totalUnused;
          }
        }
      }
    }

    // 3. Salary Allocations
    let totalBankPaid = 0;
    for (const debt of currentDebts) {
      if (debt.amount > 0) {
        const minPayRequired = requiredMinPaymentsThisMonth[debt.id] || 0;
        let askedPayment = currentMonthAllocs[debt.id as keyof SalaryAllocation] || 0;
        askedPayment = Math.max(askedPayment, Math.min(minPayRequired, debt.amount));
        const actualPayment = Math.min(askedPayment, debt.amount);
        debt.amount -= actualPayment;
        totalBankPaid += actualPayment;
      }
    }

    const currentTotalDebt = currentDebts.reduce((acc, d) => acc + d.amount, 0);
    const currentMP = i < 3 ? mercadoPagoGastos[i] : mercadoPagoGastos[2];
    const cuotasThisMonth = i < 2 ? cuotasMensuales : 0;
    const gastosFijosTotalesThisMonth = INITIAL_DATA.gastos.expensas + INITIAL_DATA.gastos.fijosExtras + currentMP + cuotasThisMonth;
    const totalAllocatedToBank = currentMonthAllocs.visa + currentMonthAllocs.master;

    const leftoverReservedBudget = totalAllocatedToBank - totalBankPaid;
    if (leftoverReservedBudget > 0 && currentSelfDebt > 0) {
      pmtToSelf = Math.min(currentSelfDebt, leftoverReservedBudget);
      currentSelfDebt -= pmtToSelf;
      currentSavings += pmtToSelf;
    }

    const surplusLivingBudget = INITIAL_DATA.sueldo - gastosFijosTotalesThisMonth - totalAllocatedToBank;
    if (autoReconstruct && surplusLivingBudget > 0) {
      currentSavings += surplusLivingBudget;
    }

    months.push({
      monthId: i,
      monthStr: i < 3 ? MONTH_LABELS[i] : "Junio 2026 (Proyección)",
      bankDebtStart: totalDebtBeforeInterest,
      debtBreakdown: currentDebts.map(d => ({ ...d })),
      requiredMinimums: requiredMinPaymentsThisMonth,
      injection: injectionThisMonth,
      interest: totalMonthInterest,
      minPayment: totalMinPaymentRequired,
      bankPaid: totalBankPaid,
      savingsYield: monthYield,
      bankDebtEnd: currentTotalDebt,
      selfDebt: currentSelfDebt,
      savingsEnd: currentSavings,
      livingCashFlow: autoReconstruct ? 0 : surplusLivingBudget,
      gastosFijosTotales: gastosFijosTotalesThisMonth,
      mercadoPagoGasto: currentMP
    });
  }

  const finalSavings = currentSavings;
  const finalBankDebt = months[3].bankDebtEnd;
  let monthsToGoal: number | null = null;

  // Extended simulation if goal not met
  if (finalBankDebt > 800000 || finalSavings < 5000000) {
    let simSavings = finalSavings;
    const simDebts = currentDebts.map(d => ({ ...d }));
    let simSelfDebt = currentSelfDebt;
    let c = 0;
    const sAllocs = salaryAllocations[2];

    while (c < 48 && (simDebts.reduce((a, b) => a + b.amount, 0) > 800000 || simSavings < 5000000)) {
      c++;
      simSavings += simSavings * TEM_SAVINGS;
      let tBankPaid = 0;
      for (const debt of simDebts) {
        if (debt.amount > 0) {
          const sInt = calcInterest(debt.amount);
          debt.amount += sInt;
          const asked = sAllocs[debt.id as keyof SalaryAllocation] || 0;
          const actPmt = Math.min(asked, debt.amount);
          debt.amount -= actPmt;
          tBankPaid += actPmt;
        }
      }
      const leftReserve = (sAllocs.visa + sAllocs.master) - tBankPaid;
      if (leftReserve > 0 && simSelfDebt > 0) {
        const pToSelf = Math.min(simSelfDebt, leftReserve);
        simSelfDebt -= pToSelf;
        simSavings += pToSelf;
      }
      if (autoReconstruct) {
        const gFijos = INITIAL_DATA.gastos.expensas + INITIAL_DATA.gastos.fijosExtras + mercadoPagoGastos[2];
        const surplusInSim = INITIAL_DATA.sueldo - gFijos - (sAllocs.visa + sAllocs.master);
        if (surplusInSim > 0) simSavings += surplusInSim;
      }
    }
    if (c < 48) monthsToGoal = c;
  }

  // Ghost projection
  const ghost = runGhostProjection(mercadoPagoGastos);
  const currentMonthsToGoal = monthsToGoal || 4;
  const comparison = {
    interestSaved: Math.max(0, totalInterestPaid - ghost.totalInterest),
    monthsFaster: Math.max(0, currentMonthsToGoal - ghost.monthsTo5M),
    netWealthDiff: (ghost.finalSavings - 0) - (finalSavings - finalBankDebt),
    isOptimal: totalInterestPaid <= ghost.totalInterest + 1000 && (monthsToGoal || 0) <= ghost.monthsTo5M
  };

  return { months, totalInterestPaid, totalYieldEarned, currentSelfDebt, finalBankDebt, finalSavings, monthsToGoal, comparison };
}

// --- Ghost Projection (Hard Reset baseline) ---
function runGhostProjection(mercadoPagoGastos: number[]) {
  const gDebts = INITIAL_DATA.deudas.map(d => ({ ...d }));
  let gSavings = INITIAL_DATA.ahorro;
  let gTotalInterest = 0;
  const totalDebtNow = gDebts.reduce((a, b) => a + b.amount, 0);
  const payoff = Math.min(totalDebtNow, gSavings);
  gSavings -= payoff;
  let rem = payoff;
  for (const d of gDebts) { const p = Math.min(rem, d.amount); d.amount -= p; rem -= p; }

  let gMonths = 0;
  while (gMonths < 60 && (gDebts.reduce((a, b) => a + b.amount, 0) > 0 || gSavings < 5000000)) {
    gMonths++;
    gSavings += gSavings * TEM_SAVINGS;
    for (const d of gDebts) {
      if (d.amount > 0) {
        const finalInt = calcInterest(d.amount);
        d.amount += finalInt;
        gTotalInterest += finalInt;
        const maxPmt = INITIAL_DATA.sueldo - (INITIAL_DATA.gastos.expensas + INITIAL_DATA.gastos.fijosExtras + mercadoPagoGastos[2]);
        d.amount -= Math.min(maxPmt, d.amount);
      }
    }
    const debits = gDebts.reduce((a, b) => a + b.amount, 0);
    if (debits === 0) {
      const fijos = INITIAL_DATA.gastos.expensas + INITIAL_DATA.gastos.fijosExtras + mercadoPagoGastos[2];
      gSavings += (INITIAL_DATA.sueldo - fijos);
    }
  }
  return { totalInterest: gTotalInterest, monthsTo5M: gMonths, finalSavings: gSavings };
}

// --- Simulador: Strategy A (pay with savings, salary → rebuild aggressively) ---
// Monthly cushion = 15% of surplus stays liquid for day-to-day life.
// The rest goes straight to savings to hit $5M ASAP.
export function runStrategyA(mpData: MPParsedData | null, mercadoPagoGastos: number[]): SimResult {
  const debts = INITIAL_DATA.deudas.map(d => ({ ...d }));
  let savings = INITIAL_DATA.ahorro;
  let totalInterest = 0;
  let totalYield = 0;
  const months: SimMonth[] = [];
  const totalDebtNow = debts.reduce((a, b) => a + b.amount, 0);
  const payoff = Math.min(totalDebtNow, savings);
  savings -= payoff;
  let left = payoff;
  for (const d of debts) { const p = Math.min(left, d.amount); d.amount -= p; left -= p; }

  const fijosBase = INITIAL_DATA.gastos.expensas + INITIAL_DATA.gastos.fijosExtras;
  const cuotasMensuales = mpData ? mpData.cuotasPendientes.reduce((a, c) => a + c.cuotaMensual, 0) : 0;
  let monthsTo5M = -1;
  const monthNames = ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb'];

  // Cushion ratio: keep 15% of surplus liquid for daily life comfort
  const CUSHION_RATIO = 0.15;

  for (let i = 0; i < 24; i++) {
    const mpEst = mercadoPagoGastos[Math.min(i, mercadoPagoGastos.length - 1)] || 221403;
    const cuotas = i < 2 ? cuotasMensuales : 0;
    const fijos = fijosBase + mpEst + cuotas;
    const y = savings * TEM_SAVINGS; savings += y; totalYield += y;
    let intMonth = 0;
    for (const d of debts) {
      if (d.amount > 0) { const fi = calcInterest(d.amount); d.amount += fi; intMonth += fi; totalInterest += fi; }
    }
    const surplus = Math.max(0, INITIAL_DATA.sueldo - fijos);
    let sTD = 0, sTS = 0, cushion = 0;
    const debtRem = debts.reduce((a, b) => a + b.amount, 0);
    if (debtRem > 0) {
      sTD = Math.min(surplus, debtRem);
      let remaining = sTD;
      for (const d of debts) { if (d.amount > 0 && remaining > 0) { const p = Math.min(remaining, d.amount); d.amount -= p; remaining -= p; } }
      const afterDebt = Math.max(0, surplus - sTD);
      cushion = Math.round(afterDebt * CUSHION_RATIO);
      sTS = afterDebt - cushion;
    } else {
      // No debt: split surplus into savings + monthly cushion
      cushion = Math.round(surplus * CUSHION_RATIO);
      sTS = surplus - cushion;
    }
    savings += sTS;
    const td = debts.reduce((a, b) => a + b.amount, 0);
    if (monthsTo5M === -1 && savings >= 5000000) monthsTo5M = i + 1;
    months.push({ month: i, label: `${monthNames[i % 12]} ${2026 + Math.floor((i + 2) / 12)}`, savings, debt: td, interestCharged: intMonth, yieldEarned: y, netWorth: savings - td, salaryToDebt: sTD, salaryToSavings: sTS, cushion });
  }
  if (monthsTo5M === -1) monthsTo5M = 24;
  return { months, totalInterest, totalYield, monthsTo5M };
}

// --- Simulador: Strategy B (keep savings, pay from salary) ---
export function runStrategyB(mpData: MPParsedData | null, mercadoPagoGastos: number[]): SimResult {
  const debts = INITIAL_DATA.deudas.map(d => ({ ...d }));
  let savings = INITIAL_DATA.ahorro;
  let totalInterest = 0;
  let totalYield = 0;
  const months: SimMonth[] = [];
  const fijosBase = INITIAL_DATA.gastos.expensas + INITIAL_DATA.gastos.fijosExtras;
  const cuotasMensuales = mpData ? mpData.cuotasPendientes.reduce((a, c) => a + c.cuotaMensual, 0) : 0;
  let monthsTo5M = -1;
  const monthNames = ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb'];
  const CUSHION_RATIO = 0.15;

  for (let i = 0; i < 24; i++) {
    const mpEst = mercadoPagoGastos[Math.min(i, mercadoPagoGastos.length - 1)] || 221403;
    const cuotas = i < 2 ? cuotasMensuales : 0;
    const fijos = fijosBase + mpEst + cuotas;
    const y = savings * TEM_SAVINGS; savings += y; totalYield += y;
    let intMonth = 0;
    for (const d of debts) {
      if (d.amount > 0) { const fi = calcInterest(d.amount); d.amount += fi; intMonth += fi; totalInterest += fi; }
    }
    const surplus = Math.max(0, INITIAL_DATA.sueldo - fijos);
    let sTD = 0, sTS = 0, cushion = 0;
    const debtRem = debts.reduce((a, b) => a + b.amount, 0);
    if (debtRem > 0 && surplus > 0) {
      const canPay = Math.min(surplus, debtRem);
      let remaining = canPay;
      for (const d of debts) { if (d.amount > 0 && remaining > 0) { const p = Math.min(remaining, d.amount); d.amount -= p; remaining -= p; } }
      sTD = canPay - remaining;
      const afterDebt = Math.max(0, surplus - sTD);
      cushion = Math.round(afterDebt * CUSHION_RATIO);
      sTS = afterDebt - cushion;
    } else if (surplus > 0) {
      cushion = Math.round(surplus * CUSHION_RATIO);
      sTS = surplus - cushion;
    }
    savings += sTS;
    const td = debts.reduce((a, b) => a + b.amount, 0);
    if (monthsTo5M === -1 && savings >= 5000000 && td <= 0) monthsTo5M = i + 1;
    months.push({ month: i, label: `${monthNames[i % 12]} ${2026 + Math.floor((i + 2) / 12)}`, savings, debt: td, interestCharged: intMonth, yieldEarned: y, netWorth: savings - td, salaryToDebt: sTD, salaryToSavings: sTS, cushion });
  }
  if (monthsTo5M === -1) monthsTo5M = 24;
  return { months, totalInterest, totalYield, monthsTo5M };
}

// --- Smart Hard Reset: Compute optimal allocations ---
// Keeps a 1-month safety cushion, pays off highest-interest debt first,
// distributes remaining savings optimally across months.
// After debt is gone → salary surplus goes to autoReconstruct (no manual allocation needed).
export function computeOptimalHardReset(
  mercadoPagoGastos: number[],
  mpData: MPParsedData | null
): { rescue: SavingsRescue[]; allocations: SalaryAllocation[] } {
  const cuotasMensuales = mpData
    ? mpData.cuotasPendientes.reduce((a, c) => a + c.cuotaMensual, 0)
    : 0;

  // Safety cushion = 1 month of living expenses
  const monthlyLiving = INITIAL_DATA.gastos.expensas + INITIAL_DATA.gastos.fijosExtras
    + mercadoPagoGastos[0] + cuotasMensuales;
  const safetyCushion = monthlyLiving * 1.2; // 20% buffer over 1 month

  const availableSavings = Math.max(0, INITIAL_DATA.ahorro - safetyCushion);
  const visaDebt = INITIAL_DATA.deudas.find(d => d.id === 'visa')?.amount || 0;
  const masterDebt = INITIAL_DATA.deudas.find(d => d.id === 'master')?.amount || 0;
  const totalDebt = visaDebt + masterDebt;

  // Pay as much as possible from savings in month 0
  const injectionMonth0 = Math.min(availableSavings, totalDebt);
  const debtFullyPaid = injectionMonth0 >= totalDebt;

  // Distribute proportionally by debt size (pay bigger debt more)
  let visaPay0 = 0, masterPay0 = 0;
  if (totalDebt > 0) {
    visaPay0 = Math.min(visaDebt, injectionMonth0 * (visaDebt / totalDebt));
    masterPay0 = Math.min(masterDebt, injectionMonth0 * (masterDebt / totalDebt));
    const excess = injectionMonth0 - visaPay0 - masterPay0;
    if (excess > 0) {
      if (masterDebt - masterPay0 > visaDebt - visaPay0) masterPay0 += excess;
      else visaPay0 += excess;
    }
  }

  const rescue: SavingsRescue[] = [
    { active: injectionMonth0 > 0, visa: Math.round(visaPay0), master: Math.round(masterPay0) },
    { active: false, visa: 0, master: 0 },
    { active: false, visa: 0, master: 0 }
  ];

  // If debt is fully paid by savings → salary = 0 allocation, surplus goes to autoReconstruct
  // If debt remains → salary surplus goes to remaining debt
  let allocations: SalaryAllocation[];

  if (debtFullyPaid) {
    // No debt left → all salary surplus feeds autoReconstruct to rebuild $5M
    allocations = [
      { visa: 0, master: 0 },
      { visa: 0, master: 0 },
      { visa: 0, master: 0 }
    ];
  } else {
    const visaRemaining = Math.max(0, visaDebt - visaPay0);
    const masterRemaining = Math.max(0, masterDebt - masterPay0);
    const visaIntM1 = calcInterest(visaRemaining);
    const masterIntM1 = calcInterest(masterRemaining);
    const visaTotalM1 = visaRemaining + visaIntM1;
    const masterTotalM1 = masterRemaining + masterIntM1;
    const salarySurplus = Math.max(0, INITIAL_DATA.sueldo - monthlyLiving);
    const totalRemaining = visaTotalM1 + masterTotalM1;
    const visaAllocM1 = totalRemaining > 0 ? Math.min(visaTotalM1, salarySurplus * (visaTotalM1 / totalRemaining)) : 0;
    const masterAllocM1 = totalRemaining > 0 ? Math.min(masterTotalM1, salarySurplus - visaAllocM1) : 0;

    allocations = [
      { visa: Math.round(Math.max(visaAllocM1, 0)), master: Math.round(Math.max(masterAllocM1, 0)) },
      { visa: Math.round(Math.max(visaAllocM1, 0)), master: Math.round(Math.max(masterAllocM1, 0)) },
      { visa: 0, master: 0 }
    ];
  }

  return { rescue, allocations };
}

// --- Compute smart MercadoPago defaults from parsed data ---
// March = total resumen, April = only recurring cuotas (not one-time), May = less
export function computeSmartMPDefaults(mpData: MPParsedData): number[] {
  const totalResumen = mpData.totalResumen;

  // April estimate: only items that are multi-cuota (will recur)
  // Plus a base discretionary estimate (food, transport, etc. that repeats)
  const recurringCuotas = mpData.cuotasPendientes.reduce((a, c) => a + c.cuotaMensual, 0);
  const baseDiscretionary = mpData.categorias
    .filter(c => c.tipo === 'necesario' || c.tipo === 'discrecional')
    .reduce((a, c) => a + c.total, 0);

  // March = what we already spent (actual data)
  const march = totalResumen;
  // April = recurring cuotas + ~estimated discretionary (assume similar pattern)
  const april = recurringCuotas + Math.round(baseDiscretionary * 0.8);
  // May = cuotas might end, discretionary stays
  const may = Math.round(baseDiscretionary * 0.8);

  return [march, april, may];
}
