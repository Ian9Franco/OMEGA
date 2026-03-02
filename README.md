# OMEGA: Simulador Financiero Integral 📈

Esta aplicación es un potente simulador financiero y gestor de gastos personales (Single Page Application) desarrollado en Next.js. El objetivo principal de **OMEGA** es proyectar trayectorias de deudas (tarjetas de crédito, préstamos) y activos líquidos (ahorros e inversiones) frente a hábitos de consumo dinámicos, calculando el interés compuesto mensualmente y mostrando el camino óptimo hacia la libertad financiera.

- **Arquitectura Modular Única**: Código refactorizado para mantenibilidad, separando lógica de cálculo (`lib/calculations`), tipos (`lib/types`) y vistas de componentes.
- **Parser Automático de Resúmenes (PDF/MD)**: Importación automática de gastos de MercadoPago mediante una API que procesa archivos PDF o Markdown normalizados, eliminando la carga manual.
- **Simulador de Estrategias Reactivo**: Comparación instantánea entre 3 caminos: Tu Plan (personalizado), Hard Reset (pago con ahorros) y Sin Tocar Ahorros.
- **Roadmap del Sueldo & Presupuesto Ocio**: Guía mes a mes que te indica exactamente cuánto destinar a deudas, cuánto a reconstruir tu ahorro y cuánto tienes disponible para ocio libre.
- **Insights Inteligentes**: Sistema de notificaciones (popups) que te avisan en tiempo real el impacto de tus ajustes ("Si hacés esto, liquidás la deuda X meses antes").
- **Visualización de Evolución Real**: Gráficos apilados que muestran cómo tu deuda se reduce físicamente mes a mes hasta convertirse en patrimonio neto.
- **Responsive PWA**: Diseño _mobile-first_ ultra compacto utilizando `text-xs` y escalas ajustadas, con un Sidebar colapsable nativo.

## Stack Tecnológico 💻

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Librería UI**: [React](https://reactjs.org/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Iconografía**: [Lucide React](https://lucide.dev/)

## Instalación y Arranque 🛠️

Para ejecutar el simulador en tu máquina local:

1. Clona el repositorio:

   ```bash
   git clone https://github.com/Ian9Franco/OMEGA.git
   cd OMEGA
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Levanta el servidor de desarrollo:

   ```bash
   npm run dev
   ```

4. Abre `http://localhost:3000` en tu navegador.

## Licencia 📄

Desarrollado de manera privada. Prohibida su distribución no autorizada sin consentimiento del autor original.
