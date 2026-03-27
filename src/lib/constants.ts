// ===============================================
// OMEGA Finance Dashboard — Constants & Config
// ===============================================

import type { InitialData, FinancialConstants, MPCredit } from './types';

export const INITIAL_DATA: InitialData = {
  sueldo: 820733.63,
  ahorro: 1200000,
  cuentasPorCobrar: 750000,
  deudas: [
    { id: 'visa', name: 'Visa Gold', amount: 273063.23, consumption: 273063.23, type: 'card', order: 2 },
    { id: 'master', name: 'Mastercard Gold', amount: 424183.12, consumption: 424183.12, type: 'card', order: 3 }
  ],
  gastos: {
    impuestos: 55000,     // vence el 20 de cada mes
    internet: 37899,      // vence el 14 de cada mes
    datosMoviles: 12000,  // vence el 14 de cada mes
    comida: 72000,        // ~$18k/semana × 4
    cuotaAuricular: 20000,
    get fijosExtras() { return this.internet + this.datosMoviles + this.comida; }
  }
};

export const CUOTAS_TARJETAS_FUTURAS = [
  0,          // Mes 0 (Abril): Ya está dentro de los saldos consolidados iniciales
  299195.71,  // Mes 1 (Mayo)
  216198.53,  // Mes 2 (Junio)
  199265.20,  // Mes 3 (Julio)
  186038.52,  // Mes 4 (Agosto)
  186038.52,  // Mes 5 (Septiembre)
  183333.25,  // Mes 6 (Octubre)
  183333.25,  // Mes 7 (Noviembre)
  183333.25,  // Mes 8 (Diciembre)
  183333.25,  // Mes 9 (Enero 2027)
  183333.25,  // Mes 10 (Febrero 2027)
  183333.25,  // Mes 11 (Marzo 2027)
  183333.25   // Mes 12 (Abril 2027)
];

export const MP_CREDITS: MPCredit[] = [
  { id: 1,  destino: 'Ezequiel Rabo',        pendiente: 10703.52, cuotaAbril: 5351.76,  cuotaMayo: 5351.76,  cuotaInfo: '2 de 3' },
  { id: 2,  destino: 'José Luis Avramo',     pendiente: 23785.60, cuotaAbril: 11892.80, cuotaMayo: 11892.80, cuotaInfo: '2 de 3' },
  { id: 3,  destino: 'Jazmín Barcos Danni',  pendiente: 17386.85, cuotaAbril: 17386.85, cuotaMayo: 0,        cuotaInfo: '1 de 1' },
  { id: 4,  destino: 'COBRO MERCADO PAGO',   pendiente: 21681.87, cuotaAbril: 21681.87, cuotaMayo: 0,        cuotaInfo: '1 de 1' },
  { id: 5,  destino: 'Préstamo personal',    pendiente: 11432.11, cuotaAbril: 11432.11, cuotaMayo: 0,        cuotaInfo: '1 de 1' },
  { id: 6,  destino: 'Préstamo personal',    pendiente: 2286.42,  cuotaAbril: 2286.42,  cuotaMayo: 0,        cuotaInfo: '1 de 1' },
  { id: 7,  destino: 'Transferencia a Ian Franco Pontorno', pendiente: 19068.76, cuotaAbril: 19068.76, cuotaMayo: 0,        cuotaInfo: '1 de 1' },
  { id: 8,  destino: 'SUBE',                 pendiente: 2270.51,  cuotaAbril: 2270.51,  cuotaMayo: 0,        cuotaInfo: '1 de 1' },
  { id: 9,  destino: 'Transferencia a Ian Franco Pontorno', pendiente: 12033.70, cuotaAbril: 12033.70, cuotaMayo: 0,        cuotaInfo: '1 de 1' },
  { id: 10, destino: 'Transferencia a HUADI YAN', pendiente: 15498.50, cuotaAbril: 15498.50, cuotaMayo: 0,        cuotaInfo: '1 de 1' },
  { id: 11, destino: 'Préstamo personal',    pendiente: 5636.48,  cuotaAbril: 5636.48,  cuotaMayo: 0,        cuotaInfo: '1 de 1' },
  { id: 12, destino: 'Transferencia a HUADI YAN', pendiente: 21415.00, cuotaAbril: 21415.00, cuotaMayo: 0,        cuotaInfo: '1 de 1' },
  { id: 13, destino: 'Transferencia a HUADI YAN', pendiente: 5426.30,  cuotaAbril: 5426.30,  cuotaMayo: 0,        cuotaInfo: '1 de 1' },
  { id: 14, destino: 'GRUPO KFC',            pendiente: 8520.75,  cuotaAbril: 8520.75,  cuotaMayo: 0,        cuotaInfo: '1 de 1' },
  { id: 15, destino: 'Magdalena Cabrera',    pendiente: 13523.26, cuotaAbril: 13523.26, cuotaMayo: 0,        cuotaInfo: '1 de 1' },
  { id: 16, destino: 'Transferencia a HUADI YAN', pendiente: 23088.48, cuotaAbril: 23088.48, cuotaMayo: 0,        cuotaInfo: '1 de 1' },
  { id: 17, destino: 'default item',         pendiente: 6633.86,  cuotaAbril: 6633.86,  cuotaMayo: 0,        cuotaInfo: '1 de 1' },
  { id: 18, destino: 'Transferencia a HUADI YAN', pendiente: 34691.82, cuotaAbril: 34691.82, cuotaMayo: 0,        cuotaInfo: '1 de 1' },
  { id: 19, destino: 'Transferencia a HUADI YAN', pendiente: 9462.01,  cuotaAbril: 9462.01,  cuotaMayo: 0,        cuotaInfo: '1 de 1' }
];

export const CONSTANTS: FinancialConstants = {
  TEM_DEBT: 0.0709,
  TNA_SAVINGS: 0.263,
  IVA: 0.21,
  SELLOS: 0.012,
  IIBB: 0.02
};

export const TEM_SAVINGS = CONSTANTS.TNA_SAVINGS / 12;

export const MONTH_LABELS = ["Abril 2026", "Mayo 2026", "Junio 2026"];

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
