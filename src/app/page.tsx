"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Settings, Menu } from 'lucide-react';

// --- Lib ---
import type { SavingsRescue, SalaryAllocation, InsightMessage, MPParsedData } from '@/lib/types';
import { INITIAL_DATA, MONTH_LABELS, formatCurrency } from '@/lib/constants';
import { runProjection, calcPureInterestStart, computeOptimalHardReset, computeSmartMPDefaults } from '@/lib/calculations';
import { getSliderInsights, getMPInsights, getRescueInsights, getHardResetInsight, getRatioInsight } from '@/lib/insights';

// --- Components ---
import { Sidebar } from '@/components/Sidebar';
import { InsightPopupContainer } from '@/components/InsightPopup';
import { MisSaldosView } from '@/components/views/MisSaldosView';
import { FlujoMensualView } from '@/components/views/FlujoMensualView';
import { ProyeccionesView } from '@/components/views/ProyeccionesView';
import { GastosRealesView } from '@/components/views/GastosRealesView';
import { SimuladorView } from '@/components/views/SimuladorView';
import { DashboardView } from '@/components/views/DashboardView';

export default function Home() {
  // --- Navigation ---
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- Financial State ---
  const [savingsRescue, setSavingsRescue] = useState<SavingsRescue[]>([
    { active: false, visa: 0, master: 0 },
    { active: false, visa: 0, master: 0 },
    { active: false, visa: 0, master: 0 }
  ]);
  const [mercadoPagoGastos, setMercadoPagoGastos] = useState<number[]>([221403, 221403, 221403]);
  const [autoReconstruct, setAutoReconstruct] = useState(false);
  const [salaryAllocations, setSalaryAllocations] = useState<SalaryAllocation[]>([
    { visa: 100000, master: 100000 },
    { visa: 100000, master: 100000 },
    { visa: 100000, master: 100000 }
  ]);

  // --- Parsed MercadoPago Data ---
  const [mpData, setMpData] = useState<MPParsedData | null>(null);

  // --- Insight Popups ---
  const [insights, setInsights] = useState<InsightMessage[]>([]);

  const addInsights = useCallback((newInsights: InsightMessage[]) => {
    setInsights(prev => [...prev, ...newInsights]);
  }, []);

  const dismissInsight = useCallback((id: string) => {
    setInsights(prev => prev.filter(i => i.id !== id));
  }, []);

  // --- Load MercadoPago data on mount and set smart defaults ---
  useEffect(() => {
    fetch('/api/parse-statement')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const parsed: MPParsedData = {
            periodo: data.periodo,
            vencimiento: data.vencimiento,
            transacciones: data.transacciones,
            categorias: data.categorias,
            cuotasPendientes: data.cuotasPendientes,
            totalResumen: data.totalResumen
          };
          setMpData(parsed);
          // Auto-set MP estimates: March=actual, April=recurring only, May=lower
          const smartDefaults = computeSmartMPDefaults(parsed);
          setMercadoPagoGastos(smartDefaults);
        }
      })
      .catch(() => { /* Fallback to static defaults if API fails */ });

    // Show initial ratio insight
    const timer = setTimeout(() => addInsights([getRatioInsight()]), 2000);
    return () => clearTimeout(timer);
  }, [addInsights]);

  // --- Update Handlers (with insight generation) ---
  const updateSavingsRescue = (idx: number, field: string, val: string | number | boolean) => {
    const next = [...savingsRescue];
    next[idx] = { ...next[idx], [field]: val };
    setSavingsRescue(next);

    if (field === 'active' && val === true) {
      // Will fire insights when actual amounts are set
    } else if (field === 'visa' || field === 'master') {
      const totalRescue = next[idx].visa + next[idx].master;
      const savingsAfter = INITIAL_DATA.ahorro - totalRescue;
      addInsights(getRescueInsights(totalRescue, savingsAfter));
    }
  };

  const updateMercadoPago = (idx: number, val: number) => {
    const oldVal = mercadoPagoGastos[idx];
    const next = [...mercadoPagoGastos];
    next[idx] = val;
    setMercadoPagoGastos(next);
    addInsights(getMPInsights(idx, oldVal, val));
  };

  const updateAllocation = (monthIdx: number, cardId: 'visa' | 'master', val: number) => {
    const oldVal = salaryAllocations[monthIdx][cardId];
    const next = [...salaryAllocations];
    next[monthIdx] = { ...next[monthIdx], [cardId]: val };
    setSalaryAllocations(next);
    // Generate insight after projection recalculates
    setTimeout(() => {
      const proj = runProjection(savingsRescue, next, mercadoPagoGastos, autoReconstruct, mpData);
      addInsights(getSliderInsights(monthIdx, cardId, oldVal, val, proj));
    }, 50);
  };

  const applyHardReset = () => {
    const { rescue, allocations } = computeOptimalHardReset(mercadoPagoGastos, mpData);
    setSavingsRescue(rescue);
    setSalaryAllocations(allocations);
    setAutoReconstruct(true);

    const totalPayoff = rescue[0].visa + rescue[0].master;
    const monthlyLiving = INITIAL_DATA.gastos.impuestos + INITIAL_DATA.gastos.fijosExtras + mercadoPagoGastos[0];
    const cushion = INITIAL_DATA.ahorro - totalPayoff;
    addInsights([getHardResetInsight(cushion, totalPayoff)]);
  };

  // --- Projection Engine (recalculates on any state change) ---
  const projection = useMemo(() =>
    runProjection(savingsRescue, salaryAllocations, mercadoPagoGastos, autoReconstruct, mpData),
    [savingsRescue, salaryAllocations, mercadoPagoGastos, autoReconstruct, mpData]
  );

  const pureInterestStart = useMemo(() => calcPureInterestStart(), []);

  // --- View Router ---
  const renderActiveView = () => {
    switch (activeView) {
      case 'saldos': return <MisSaldosView pureInterestStart={pureInterestStart} />;
      case 'flujo': return <FlujoMensualView projectionData={projection} />;
      case 'proyecciones': return <ProyeccionesView projectionData={projection} />;
      case 'gastos': return <GastosRealesView mpData={mpData} />;
      case 'simulador': return <SimuladorView mpData={mpData} mercadoPagoGastos={mercadoPagoGastos} projection={projection} />;
      case 'dashboard':
      default:
        return (
          <DashboardView
            projection={projection}
            pureInterestStart={pureInterestStart}
            salaryAllocations={salaryAllocations}
            savingsRescue={savingsRescue}
            mercadoPagoGastos={mercadoPagoGastos}
            autoReconstruct={autoReconstruct}
            mpData={mpData}
            onUpdateAllocation={updateAllocation}
            onUpdateMercadoPago={updateMercadoPago}
            onUpdateSavingsRescue={updateSavingsRescue}
            onSetAutoReconstruct={setAutoReconstruct}
            onApplyHardReset={applyHardReset}
          />
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-dashboard-bg text-text-primary px-2 py-3 md:px-4 text-[0.8rem] md:text-xs relative">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="flex-1 overflow-y-auto custom-scroll lg:pl-6 pb-6 w-full">
        <header className="flex justify-between items-center mb-6 mt-1 lg:mt-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-1.5 mr-1 bg-card-bg rounded-lg border border-white/10 text-text-secondary hover:text-white">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold mb-0.5">Finance Dashboard.</h1>
              <p className="text-text-secondary text-[10px] md:text-xs">Optimiza tu estrategia de repago y recupero de ahorros.</p>
            </div>
          </div>
          <div className="hidden md:flex gap-2">
            <button className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-text-secondary cursor-not-allowed opacity-50">
              <Settings size={14} />
            </button>
            <button className="px-4 py-1.5 rounded-full bg-card-bg text-text-secondary border border-white/5 font-semibold text-xs cursor-not-allowed opacity-50">
              Exportar Plan
            </button>
          </div>
        </header>
        {renderActiveView()}
      </main>

      {/* Insight Popups */}
      <InsightPopupContainer insights={insights} onDismiss={dismissInsight} />
    </div>
  );
}
