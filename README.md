# OMEGA: Simulador Financiero Integral 📈

Esta aplicación es un potente simulador financiero y gestor de gastos personales (Single Page Application) desarrollado en Next.js. El objetivo principal de **OMEGA** es proyectar trayectorias de deudas (tarjetas de crédito, préstamos) y activos líquidos (ahorros e inversiones) frente a hábitos de consumo dinámicos, calculando el interés compuesto mensualmente y mostrando el camino óptimo hacia la libertad financiera.

## Características Principales 🚀

- **Proyecciones Precisas con Interés Compuesto**: Calcula exactamente cómo impactan las tasas (TEM + IVA + Sellos + IIBB) en tu capital si decides refinanciar o hacer pagos parciales.
- **Control de Inyecciones Granulares ("Rescates")**: Asigna rescates de ahorros pasivos a deudas específicas (Visa, Mastercard, etc.) con selectores precisos, permitiendo apalancar múltiples tarjetas en el mismo mes.
- **Límites de Presupuesto Dinámicos**: Los controles de pago de deuda están restringidos matemáticamente por el capital disponible (`Sueldo - Gastos Fijos - Gasto de Vida`).
- **Vista de Flujo Mensual en Tiempo Real**: Visualizaciones con gráficos de torta dinámicos calculados vía CSS puro. Muestra qué porción del sueldo alimenta las deudas, sobrevive o se pierde.
- **Motor Predictivo Oculto**: Si las proyecciones a 3-4 meses de la vista principal no alcanzan la meta de reducción de deuda, un algoritmo oculto simulará la estrategia elegida indefinidamente, advirtiéndote cuántos "Meses Extra" te faltan verdaderamente.
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
