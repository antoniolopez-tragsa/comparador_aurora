# **Comparador de Listados de Incidencias en AURORA**

Este proyecto es una aplicación web estática que permite comparar listados de incidencias en el sistema **AURORA**. Ofrece funcionalidades para cargar y visualizar archivos de Excel, aplicar filtros específicos y comparar datos entre diferentes listados para identificar cambios críticos.

## **Características Principales**
- **Carga de Archivos Excel**:
  - Soporte para la carga de uno o dos archivos `.xls`.
  - Procesamiento de múltiples hojas dentro de los archivos.
- **Visualización de Datos**:
  - Muestra los datos relevantes del archivo seleccionado en una tabla interactiva.
  - Las filas incluyen enlaces clicables para acceder a más detalles.
- **Filtros Dinámicos**:
  - Filtro de reclamaciones.
  - Filtro de solicitudes susceptibles de auditoría.
- **Comparación de Archivos**:
  - Identifica cambios en la criticidad de incidencias.
  - Muestra únicamente las filas donde se han detectado diferencias.
  - Comparación basada en fechas específicas y datos clave.
- **Acciones Adicionales**:
  - Botón de "Limpiar" para resetear los datos cargados, la tabla de resultados y ocultar controles.
  - Deshabilita automáticamente botones y filtros cuando no son necesarios.

## **Tecnologías Utilizadas**
- **HTML5**: Estructura semántica del sitio.
- **CSS3**: Diseño responsivo y estilización.
  - Variables CSS para fácil personalización.
  - Transiciones suaves en botones y elementos interactivos.
- **JavaScript**: Lógica dinámica del sitio.
  - Uso de [SheetJS](https://github.com/SheetJS/sheetjs) para el procesamiento de archivos Excel.
  - Manipulación del DOM para mostrar tablas, filtros y mensajes.

## **Estructura del Proyecto**
```
├── css/
│   └── styles.css       # Estilos principales del sitio
├── img/
│   └── favicon.ico      # Ícono del sitio
├── js/
│   └── script.js        # Lógica de la aplicación
├── index.html           # Página principal
├── README.md            # Documentación del proyecto
```

## **Instrucciones de Uso**
1. **Clonar el Repositorio**:
   ```bash
   git clone https://github.com/antoniolopez-tragsa/comparador-aurora.git
   ```
2. **Abrir el archivo `index.html`** en tu navegador preferido.

3. **Cargar Archivos**:
   - Selecciona uno o dos archivos `.xls`.
   - Haz clic en "Visualizar" para mostrar los datos.
   - Si se cargan dos archivos, habilita el botón "Comparar" para identificar cambios entre ellos.

4. **Filtrar Resultados**:
   - Marca las casillas "Mostrar reclamaciones" o "Mostrar solicitudes susceptibles de auditoría" para aplicar los filtros.

5. **Limpiar Resultados**:
   - Utiliza el botón "Limpiar" para resetear la aplicación y cargar nuevos archivos.

## **Consideraciones**
- **Formato de los Archivos**:
  - La aplicación asume que los archivos contienen:
    - Datos en la primera hoja.
    - Fechas relevantes (inicio, fin, y listado) en la segunda hoja (`B7`, `B8`, `B22`).
- **Requisitos**:
  - Navegador compatible con ES6+ y soporte para File API.

## **Contribuciones**
¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar la aplicación o encuentras errores, sigue estos pasos:

1. **Fork** este repositorio.
2. Crea una nueva rama con tu mejora:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. Realiza tus cambios y haz un commit:
   ```bash
   git commit -m "Añadida nueva funcionalidad"
   ```
4. Envía un Pull Request.

## **Licencia**
Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.
