// ===============================================
// OMEGA Finance Dashboard — Constants & Config
// ===============================================

import type { InitialData, FinancialConstants, MPCredit } from './types';

export const INITIAL_DATA: InitialData = {
  sueldo: 800000,
  ahorro: 1650094, // Post-reset: pagó deudas $3.085.133 + MP $221.404
  deudas: [
    { id: 'visa', name: 'Visa Gold', amount: 132443.80, consumption: 132443.80, type: 'card', order: 2 },
    { id: 'master', name: 'Mastercard Gold', amount: 189281.24, consumption: 189281.24, type: 'card', order: 3 }
  ],
  gastos: {
    expensas: 45000,
    movistarMovil: 10400,
    movistarWifi: 36200,
    get fijosExtras() { return this.movistarMovil + this.movistarWifi; }
  }
};

export const MP_CREDITS: MPCredit[] = [
  { id: 1,  destino: 'Ezequiel Rabo',        pendiente: 10703.52, cuotaAbril: 5351.76,  cuotaMayo: 5351.76,  cuotaInfo: '2 de 3' },
  { id: 2,  destino: 'José Luis Avramo',      pendiente: 23785.60, cuotaAbril: 11892.80, cuotaMayo: 11892.80, cuotaInfo: '2 de 3' },
  { id: 3,  destino: 'Jazmín Barcos Danni',   pendiente: 17386.85, cuotaAbril: 17386.85, cuotaMayo: 0,        cuotaInfo: '1 de 1' },
  { id: 4,  destino: 'Cobro MercadoPago',     pendiente: 21681.87, cuotaAbril: 21681.87, cuotaMayo: 0,        cuotaInfo: '1 de 1' },
  { id: 5,  destino: 'Préstamo Personal',     pendiente: 11432.11, cuotaAbril: 11432.11, cuotaMayo: 0,        cuotaInfo: '1 de 1' },
  { id: 6,  destino: 'Préstamo Personal',     pendiente: 2286.42,  cuotaAbril: 2286.42,  cuotaMayo: 0,        cuotaInfo: '1 de 1' },
  { id: 7,  destino: 'Ian Franco Pontorno',   pendiente: 19068.76, cuotaAbril: 19068.76, cuotaMayo: 0,        cuotaInfo: '1 de 1' },
  { id: 8,  destino: 'SUBE',                  pendiente: 2270.51,  cuotaAbril: 2270.51,  cuotaMayo: 0,        cuotaInfo: '1 de 1' },
  { id: 9,  destino: 'Ian Franco Pontorno',   pendiente: 12033.70, cuotaAbril: 12033.70, cuotaMayo: 0,        cuotaInfo: '1 de 1' },
  { id: 10, destino: 'Huadi Yan',             pendiente: 15498.50, cuotaAbril: 15498.50, cuotaMayo: 0,        cuotaInfo: '1 de 1' },
  { id: 11, destino: 'Préstamo Personal',     pendiente: 5636.48,  cuotaAbril: 5636.48,  cuotaMayo: 0,        cuotaInfo: '1 de 1' },
];

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
