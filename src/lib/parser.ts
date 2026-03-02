// ===============================================
// OMEGA Finance Dashboard — MercadoPago Parser
// ===============================================
// Parses both normalized (table) and raw (copypaste) MercadoPago MD files.

import type { MPTransaction, MPParsedData, MPCategoria, MPCuotaPendiente } from './types';
import { CATEGORY_MAPPING } from './constants';

// --- Auto-categorize a transaction description ---
function categorize(desc: string): string {
  const d = desc.toLowerCase();
  if (d.includes('sube')) return 'sube';
  if (d.includes('préstamo') || d.includes('prestamo')) return 'prestamo';
  if (d.includes('transferencia')) return 'transferencia';
  if (d.includes('cobro mercado') || d.includes('cobro mp')) return 'cobro';
  if (d.includes('dean') || d.includes('latte') || d.includes('café') || d.includes('cafe')
    || d.includes('mcdonalds') || d.includes('burger') || d.includes('starbucks')
    || d.includes('rappi') || d.includes('pedidos')) return 'consumo';
  if (d === 'default item') return 'compras';
  if (d.includes('movistar') || d.includes('personal') || d.includes('claro')
    || d.includes('edenor') || d.includes('edesur') || d.includes('metrogas')
    || d.includes('aysa')) return 'servicio';
  return 'otro';
}

// --- Parse NORMALIZED format (markdown table) ---
export function parseNormalized(content: string): MPParsedData {
  const lines = content.split('\n').map(l => l.trim());
  
  // Extract metadata
  let periodo = '';
  let vencimiento = '';
  
  for (const line of lines) {
    if (line.startsWith('periodo:')) periodo = line.replace('periodo:', '').trim();
    if (line.startsWith('vencimiento:')) vencimiento = line.replace('vencimiento:', '').trim();
  }

  // Find table rows (skip header and separator)
  const transactions: MPTransaction[] = [];
  let inTable = false;
  let headerSkipped = 0;
  
  for (const line of lines) {
    if (line.startsWith('|') && line.includes('fecha')) {
      inTable = true;
      headerSkipped = 0;
      continue;
    }
    if (inTable && line.startsWith('|---')) {
      headerSkipped++;
      continue;
    }
    if (inTable && line.startsWith('|')) {
      const cols = line.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 6) {
        transactions.push({
          fecha: cols[0],
          descripcion: cols[1],
          monto: parseFloat(cols[2].replace(/\./g, '').replace(',', '.')),
          cuotaActual: parseInt(cols[3]) || 1,
          totalCuotas: parseInt(cols[4]) || 1,
          categoria: cols[5] || categorize(cols[1])
        });
      }
    } else if (inTable && !line.startsWith('|')) {
      inTable = false;
    }
  }

  return buildParsedData(transactions, periodo, vencimiento);
}

// --- Parse RAW format (copypaste from MercadoPago) ---
export function parseRaw(content: string): MPParsedData {
  const lines = content.split(/\r?\n/);
  const transactions: MPTransaction[] = [];
  
  let i = 0;
  let currentVencimiento = '';

  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Detect vencimiento headers
    if (line.startsWith('Vence ')) {
      currentVencimiento = line;
      i++;
      continue;
    }
    
    // Detect transaction start ("product 1" marker)
    if (line === 'product 1' && i + 1 < lines.length) {
      const descripcion = (lines[i + 1] || '').trim();
      
      // Find "Solicitado el ..." line for date
      let fecha = '';
      let j = i + 2;
      while (j < lines.length && j < i + 5) {
        const checkLine = lines[j].trim();
        if (checkLine.startsWith('Solicitado el ')) {
          fecha = checkLine.replace('Solicitado el ', '');
          break;
        }
        j++;
      }
      
      // Find amount: look for "$" then number on next lines
      let monto = 0;
      j++;
      while (j < lines.length && j < i + 10) {
        const checkLine = lines[j].trim();
        if (checkLine === '$') {
          // Next line has integer part, skip comma line, then decimals
          const intPart = (lines[j + 1] || '').trim().replace(/\./g, '');
          const decPart = (lines[j + 3] || '').trim();
          monto = parseFloat(`${intPart}.${decPart}`) || 0;
          j += 4;
          break;
        }
        j++;
      }

      // Find cuota info
      let cuotaActual = 1;
      let totalCuotas = 1;
      while (j < lines.length && j < i + 15) {
        const checkLine = lines[j].trim();
        const cuotaMatch = checkLine.match(/Cuota (\d+) de (\d+)/);
        if (cuotaMatch) {
          cuotaActual = parseInt(cuotaMatch[1]);
          totalCuotas = parseInt(cuotaMatch[2]);
          i = j + 1;
          break;
        }
        j++;
      }

      if (descripcion && monto > 0) {
        transactions.push({
          fecha,
          descripcion,
          monto,
          cuotaActual,
          totalCuotas,
          categoria: categorize(descripcion)
        });
      }

      i = Math.max(i, j + 1);
      continue;
    }
    
    i++;
  }

  return buildParsedData(transactions, '', currentVencimiento);
}

// --- Build structured data from parsed transactions ---
function buildParsedData(transactions: MPTransaction[], periodo: string, vencimiento: string): MPParsedData {
  // Group by category
  const catGroups: Record<string, { total: number; items: number }> = {};
  
  for (const t of transactions) {
    if (!catGroups[t.categoria]) {
      catGroups[t.categoria] = { total: 0, items: 0 };
    }
    catGroups[t.categoria].total += t.monto;
    catGroups[t.categoria].items++;
  }

  const categorias: MPCategoria[] = Object.entries(catGroups).map(([catId, data]) => {
    const mapping = CATEGORY_MAPPING[catId] || CATEGORY_MAPPING['otro'];
    return {
      id: catId,
      label: mapping.label,
      icon: mapping.icon,
      total: Math.round(data.total),
      items: data.items,
      tipo: mapping.tipo
    };
  });

  // Find pending installments (cuota < totalCuotas)
  const cuotasPendientes: MPCuotaPendiente[] = [];
  for (const t of transactions) {
    if (t.totalCuotas > 1 && t.cuotaActual < t.totalCuotas) {
      cuotasPendientes.push({
        destino: t.descripcion,
        cuotaMensual: Math.round(t.monto),
        restantes: t.totalCuotas - t.cuotaActual
      });
    }
  }

  const totalResumen = Math.round(transactions.reduce((a, t) => a + t.monto, 0));

  // Auto-detect periodo if not provided
  if (!periodo && transactions.length > 0) {
    const months = new Set<string>();
    for (const t of transactions) {
      // Try to extract month from "23 de enero" style dates
      const monthMatch = t.fecha.match(/de\s+(\w+)/);
      if (monthMatch) months.add(monthMatch[1]);
    }
    periodo = [...months].join('-') + ' 2026';
  }

  return {
    periodo: periodo || 'Período no identificado',
    vencimiento: vencimiento || undefined,
    transacciones: transactions,
    categorias,
    cuotasPendientes,
    totalResumen
  };
}

// --- Auto-detect format and parse ---
export function parseMercadoPago(content: string): MPParsedData {
  // If it contains a markdown table with "fecha" header, it's normalized
  if (content.includes('| fecha |')) {
    return parseNormalized(content);
  }
  // Otherwise try raw format
  return parseRaw(content);
}
