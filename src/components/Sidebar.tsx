"use client";
import React from 'react';
import {
  LayoutDashboard, WalletCards, ArrowRightLeft, PieChart,
  BarChart3, Scale, Landmark, X, Menu
} from 'lucide-react';

type NavItem = { id: string; label: string; icon: React.ReactNode; color?: string };

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} />, color: 'text-accent-mint' },
  { id: 'saldos', label: 'Mis Saldos', icon: <WalletCards size={16} />, color: 'text-accent-mint' },
  { id: 'flujo', label: 'Flujo Mensual', icon: <ArrowRightLeft size={16} />, color: 'text-accent-mint' },
  { id: 'proyecciones', label: 'Proyecciones', icon: <PieChart size={16} />, color: 'text-accent-mint' },
  { id: 'gastos', label: 'Gastos Reales', icon: <BarChart3 size={16} />, color: 'text-accent-yellow' },
  { id: 'simulador', label: 'Simulador', icon: <Scale size={16} />, color: 'text-accent-blue' },
];

export function Sidebar({
  activeView,
  setActiveView,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}: {
  activeView: string;
  setActiveView: (v: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (v: boolean) => void;
}) {
  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-dashboard-bg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-56 flex flex-col pt-6 lg:pt-0 pr-4 lg:border-r border-white/5 h-full ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-8 px-5 lg:px-3">
          <div className="flex items-center gap-3 font-bold text-lg">
            <div className="w-7 h-7 rounded-lg bg-accent-mint flex items-center justify-center text-dashboard-bg">
              <Landmark size={16} />
            </div>
            OMEGA
          </div>
          <button className="lg:hidden text-text-secondary hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1.5 flex-1 text-sm px-2 lg:px-0">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors w-full text-left ${activeView === item.id ? `bg-card-bg ${item.color}` : 'text-text-secondary hover:text-white'}`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto px-3">
          <div className="flex items-center gap-3 py-2">
            <div className="w-8 h-8 rounded-full bg-card-bg-light border border-white/10 overflow-hidden">
              <div className="w-full h-full bg-accent-yellow/20 flex justify-center items-end pt-1">
                <div className="w-4 h-4 rounded-full bg-accent-yellow/80"></div>
              </div>
            </div>
            <div>
              <p className="font-semibold text-xs">Usuario</p>
              <p className="text-[10px] text-text-tertiary">@finanzas</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
