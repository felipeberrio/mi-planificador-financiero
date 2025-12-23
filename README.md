# FinPlan Pro - Documentación Oficial (v42.0)

**FinPlan Pro** es una aplicación web progresiva (PWA) de gestión financiera personal, diseñada con un enfoque en la experiencia de usuario (UX), inteligencia predictiva y almacenamiento local seguro.

---

## 🚀 Características Principales (Core Features)

### 1. Sistema de Almacenamiento
* **Persistencia Local:** Todos los datos (ingresos, gastos, metas, etc.) se guardan en el `localStorage` del navegador. No requiere base de datos externa ni internet.
* **Auto-Migración:** El sistema detecta si la versión de los datos es antigua y añade automáticamente las nuevas estructuras (ej. bloques de presupuestos o metas) sin borrar información previa.

### 2. Personalización Visual (Theming)
* **Modo Oscuro/Claro:** Botón dedicado (Sol/Luna) que cambia toda la paleta de colores (textos, fondos, bordes y gráficas).
* **Selector de Temas:** 5 colores de acento (Azul, Violeta, Verde, Rojo, Rosa) que cambian el color principal de la marca, botones y gráficas.
* **Marca de Agua:** Un icono de billetera sutil de fondo que reacciona al tema elegido.

---

## 📱 Estructura de la Aplicación

### A. Encabezado (Header)
1.  **Selectores de Fecha Rápidos:** Menú desplegable para elegir MES y AÑO rápidamente.
2.  **Rango de Fechas Personalizado:** Inputs `Desde` y `Hasta` para análisis específicos.
3.  **Botón Reset:** Una flecha circular para reiniciar el filtro al mes actual.
4.  **Controles de Tema:** Selector de color y toggle de Modo Oscuro.

### B. Panel Superior (Dashboard)
1.  **Patrimonio Neto Real:** Tarjeta grande que calcula `(Total Ingresos - Total Gastos)` de todas las cuentas históricas.
2.  **Mis Cuentas (Wallets):**
    * **Tipos de cuenta:** Efectivo, Banco, Crédito.
    * **Lógica de Crédito:** Muestra "Deuda Actual" en rojo y una barra de progreso verde indicando el "Cupo Disponible".
    * **Gestión:** Botón `+` para crear cuentas. Botón `⚙️` para editar y `🗑️` (Papelera) para borrar (con confirmación de seguridad).

---

### C. Columna Izquierda (Bloques Móviles)
*Esta columna permite reordenar los bloques usando las flechas ↑ ↓ en la esquina superior derecha de cada tarjeta.*

#### 1. Bloque de Registro (Formulario)
* **✨ Magic Input (IA Local):** Campo de texto inteligente.
    * *Funcionalidad:* Escribe frases como "Cena en McDonalds $50 con tarjeta".
    * *Detección:* Identifica automáticamente Monto, Categoría y Wallet.
* **Pestañas Gasto/Ingreso:** Cambia el contexto del formulario.
* **Campos Manuales:** Fecha, Cuenta, Categoría (Editable), Concepto, Monto, Notas (Textarea).
* **Alertas Inteligentes (Smart Alert):** Si intentas registrar un gasto que te dejaría sin liquidez para cubrir gastos fijos futuros, aparece una alerta visual.
* **Feedback Sensorial:** Vibración (móvil) y sonido sutil al guardar.

#### 2. Bloque de Metas (Goals)
* **Visualización:** Barra de progreso que muestra cuánto has ahorrado vs el objetivo.
* **Acciones:**
    * Botón `+` (Lápiz): Editar la meta.
    * Botón `+ Fondos`: Sumar dinero rápidamente a esa meta.
    * Botón `Papelera`: Eliminar meta.

#### 3. Bloque de Presupuestos (Budgets - Fase 2)
* **Función:** Define un límite mensual por categoría.
* **Visualización:** Barra de progreso que cambia de color (Violeta -> Rojo) si te acercas al límite.
* **Cuenta Regresiva:** Indica cuántos días faltan para que se reinicie el presupuesto (fin de mes).

#### 4. Bloque de Categorías
* **Gestión:** Añadir nuevas categorías personalizadas.
* **Edición:** Botón de lápiz para renombrar categorías existentes (actualiza todos los movimientos antiguos).

#### 5. Bloque de Programados (Recurring)
* **Función:** Lista de gastos fijos (ej. Renta, Netflix).
* **Acción Rápida:** Botón `->` para copiar ese gasto al formulario principal y registrarlo hoy.

---

### D. Columna Derecha (Análisis y Datos)

#### 1. Gráfico de Distribución (Pie Chart)
* **Visualización:** Gráfico de torta con los gastos del periodo.
* **Interactividad:**
    * Muestra el porcentaje `%` sobre cada sección.
    * **Click-to-Filter:** Al hacer clic en una sección (ej. Comida), la lista de movimientos de abajo se filtra solo por esa categoría.

#### 2. Línea de Tiempo (Predictive Timeline)
* **Eje X:** Muestra las fechas de forma elegante (ej. "23 Dic").
* **Línea Sólida:** Muestra el balance histórico real.
* **Línea Punteada (Futuro):** Proyecta el balance hasta fin de mes considerando los gastos recurrentes pendientes.

#### 3. Historial General
* **Buscador:** Filtra por nombre o notas en tiempo real.
* **Filtros Avanzados:**
    * Por Wallet específica.
    * Por Categoría específica (Ingreso, Gasto, etc.).
    * Ordenamiento (Recientes, Antiguos, Monto Mayor).
* **Lista de Movimientos:**
    * Muestra icono (Flecha arriba/abajo), Categoría, Nombre, Wallet y Fecha.
    * **Acciones:** Editar (carga los datos en el formulario), Duplicar, Borrar.

---

## 🛠️ Detalles Técnicos
* **Framework:** React (Vite).
* **Librerías:**
    * `recharts`: Para las gráficas.
    * `lucide-react`: Para los iconos.
    * `tailwindcss`: Para los estilos.
* **Estado:** Gestionado con `useState`, `useEffect` y `useMemo` para optimización de cálculos pesados.

---

## ⚠️ Guía de Mantenimiento (No Romper)
Al actualizar el código, verificar siempre:
1.  **No borrar el `useEffect` de inicialización de `leftOrder`:** Es el que evita la pantalla blanca al migrar versiones.
2.  **Mantener la función `trendData` con el bucle `for...of`:** Usar `.map` directo aquí causa errores de mutación en las gráficas.
3.  **Magic Input:** Depende de las variables `wallets` y `categories` para funcionar, no desconectar esas referencias.