# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-03-02

### Added

- **Automated MercadoPago Parser**: Backend API (`/api/parse-statement`) to process PDF and Markdown statements.
- **Modular Component Architecture**: Extracted views to `src/components/views/` (Dashboard, MisSaldos, FlujoMensual, Proyecciones, GastosReales, Simulador).
- **Reactive Insights System**: Animated toast notifications that explain the impact of financial adjustments in real-time.
- **Advanced Simulador Roadmap**:
  - Reactive 3-way strategy comparison.
  - Detailed month-by-month salary allocation guide.
  - Interactive stacked bar chart (Debt vs Net Worth).
  - Monthly leisure budget (15% cushion) tracking.
- **Financial Helper Library**: Centralized logic in `src/lib/` for calculations, types, constants, and insights.

### Fixed

- **Monolithic page.tsx**: Reduced from 1805 lines to ~150 lines for better maintainability.
- **misleading (24m) labels**: Clarified goals to "Meta en X meses".
- **Terminology Simplification**: Replaced economic jargon with everyday Spanish terms for better accessibility.

### Changed

- Updated dashboard to be fully reactive, propagating changes to all views instantly.
- Improved sidebar navigation with better icon set.
