// ===============================================
// OMEGA Finance Dashboard — Constants & Config
// ===============================================

import type { InitialData, FinancialConstants } from './types';

export const INITIAL_DATA: InitialData = {
  sueldo: 800000,
  ahorro: 4909900 + 50000, // Ahorros + 50k débito
  deudas: [
    { id: 'visa', name: 'Visa Gold', amount: 1516149.80, type: 'card', order: 2 },
    { id: 'master', name: 'Mastercard Gold', amount: 1890708.24, type: 'card', order: 3 }
  ],
  gastos: {
    expensas: 45000,
    movistarMovil: 10400,
    movistarWifi: 36200,
    get fijosExtras() { return this.movistarMovil + this.movistarWifi; }
  }
};

export const CONSTANTS: FinancialConstants = {
  TEM_DEBT: 0.0709,
  TNA_SAVINGS: 0.263,
  IVA: 0.21,
  SELLOS: 0.012,
  IIBB: 0.02
};

export const TEM_SAVINGS = CONSTANTS.TNA_SAVINGS / 12;

export const MONTH_LABELS = ["Marzo 2026", "Abril 2026", "Mayo 2026"];

export const CATEGORY_MAPPING: Record<string, { label: string; icon: string; tipo: 'necesario' | 'obligatorio' | 'discrecional' | 'variable' | 'ingreso' }> = {
  'sube': { label: 'Transporte (SUBE)', icon: 'bus', tipo: 'necesario' },
  'transporte': { label: 'Transporte', icon: 'bus', tipo: 'necesario' },
  'prestamo': { label: 'Préstamos Personales', icon: 'handcoins', tipo: 'obligatorio' },
  'consumo': { label: 'Consumo (Comida/Café)', icon: 'shoppingbag', tipo: 'discrecional' },
  'compras': { label: 'Compras Generales', icon: 'shoppingbag', tipo: 'discrecional' },
  'transferencia': { label: 'Transferencias', icon: 'send', tipo: 'variable' },
  'cobro': { label: 'Cobro MercadoPago', icon: 'banknote', tipo: 'ingreso' },
  'servicio': { label: 'Servicios', icon: 'banknote', tipo: 'necesario' },
  'otro': { label: 'Otros', icon: 'shoppingbag', tipo: 'discrecional' },
};

export const TIPO_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  necesario: { text: 'text-accent-blue', bg: 'bg-accent-blue/10', border: 'border-accent-blue/20' },
  obligatorio: { text: 'text-accent-salmon', bg: 'bg-accent-salmon/10', border: 'border-accent-salmon/20' },
  discrecional: { text: 'text-accent-yellow', bg: 'bg-accent-yellow/10', border: 'border-accent-yellow/20' },
  variable: { text: 'text-text-secondary', bg: 'bg-white/5', border: 'border-white/10' },
  ingreso: { text: 'text-accent-mint', bg: 'bg-accent-mint/10', border: 'border-accent-mint/20' },
};

export const formatCurrency = (val: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(Math.round(val));
