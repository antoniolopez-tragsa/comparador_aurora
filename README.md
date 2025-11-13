# Visor de Listados de Incidencias en AURORA
Aplicación web **estática** que permite visualizar y analizar listados de incidencias del sistema **AURORA**.
Ofrece herramientas para cargar archivos de Excel, aplicar filtros específicos y resaltar información relevante directamente desde el navegador.

---

## ✨ Características Principales

### 📂 Carga de Archivos Excel
* Permite cargar un archivo `.xls`.
* Procesa automáticamente las hojas relevantes del documento.

### 📊 Visualización de Datos
* Muestra la información en una **tabla interactiva**.
* Las filas incluyen enlaces clicables que permiten acceder a más detalles.

### 🔍 Filtros Dinámicos
* Filtro de **adjudicatario**.
* Filtro de **reclamaciones**.
* Filtro de **tiempos de respuesta o de resolución máximos**.
* Filtro de **tiempos de respuesta o de resolución máximos superados**.
* Filtro de **incidencias que hayan estado en espera**.
* Filtro de **urgencias o emergencias**.

### 📤 Exportación a Excel
* Exporta los resultados visualizados a un nuevo archivo Excel para análisis posterior.

### 🧭 Última Incidencia Leída
* Guarda en el navegador la última incidencia seleccionada mediante `localStorage`.
* Muestra un indicador con botones para **Ir a la fila**, **Abrir en AURORA** y **Borrar** la marca.
* Resalta automáticamente la fila guardada al recargar la página.

---

## 🧱 Estructura del Proyecto
```
.
├─ index.html          # Página principal de la aplicación
├─ css/
│  └─ styles.css       # Estilos y diseño visual
├─ js/
│  └─ script.js        # Lógica y funcionalidad principal
└─ img/
   ├─ favicon.ico
   ├─ excel.png
   ├─ github-mark-white.svg
   └─ otros recursos gráficos
```

---

## 🧰 Tecnologías Utilizadas
* **HTML5** – estructura de la aplicación
* **CSS3** – diseño y presentación visual
* **JavaScript** – interactividad y manipulación de datos
* **Biblioteca externa:**
  * [SheetJS](https://sheetjs.com/) – lectura y tratamiento de archivos Excel directamente en el navegador

---

## 🚀 Instrucciones de Uso
1. **Cargar el archivo**
   * Abre `index.html` en tu navegador.
   * Usa el botón **“Seleccionar archivo”** para cargar un archivo `.xls` desde tu sistema local.
   * Haz clic en **Visualizar**.

2. **Visualización y filtrado**
   * Los datos se mostrarán en una tabla interactiva.
   * Activa o desactiva los filtros según tus necesidades.

3. **Última incidencia leída**
   * Al hacer clic en una incidencia (columna *Código petición*), se guarda automáticamente como la última leída.
   * Puedes usar los botones del indicador para volver a esa fila o eliminar la marca.

4. **Exportar resultados**
   * Usa el botón **Exportar** para guardar los resultados en formato Excel.

---

## ⚙️ Consideraciones
* Asegúrate de que el archivo `.xls` tenga el formato esperado por el sistema AURORA.
* La aplicación se ejecuta completamente en el navegador: **no necesita servidor ni conexión externa**.
* Todos los datos permanecen en tu equipo, garantizando **privacidad y seguridad**.

---

## 📄 Licencia
Este proyecto está bajo licencia **MIT**.
Consulta el archivo `LICENSE` para más información.

---

## 📬 Contacto
Para más información o consultas, visita el repositorio original:
👉 [https://github.com/antoniolopez-tragsa/comparador_aurora](https://github.com/antoniolopez-tragsa/comparador_aurora)