# Visor de Listados de Incidencias en AURORA
Este proyecto es una aplicación web estática que permite visualizar listados de incidencias en el sistema AURORA. Ofrece funcionalidades para cargar y analizar archivos de Excel, aplicar filtros específicos y resaltar información relevante de las incidencias.

## Características Principales
* **Carga de Archivos Excel**:
  * Soporte para la carga de un único archivo `.xls`.
  * Procesamiento automático de las hojas relevantes dentro del archivo.

* **Visualización de Datos**:
  * Muestra los datos del archivo en una tabla interactiva.
  * Las filas incluyen enlaces clicables para acceder a más detalles.

* **Filtros Dinámicos**:
  * Filtro de reclamaciones.
  * Filtro de solicitudes susceptibles de auditoría.
  * Filtro de incidencias que hayan estado en espera.

* **Exportación a Excel**:
  * Permite exportar los resultados visualizados a un archivo Excel para su análisis posterior.

* **Última Incidencia Leída**:
  * Guarda en el navegador la última incidencia seleccionada mediante `localStorage`.
  * Muestra un indicador visual con botones para **Ir a la fila** y **Borrar la marca**.
  * Resalta automáticamente la fila guardada al recargar la página.

## Estructura del Proyecto
* `index.html`: Página principal que contiene la estructura básica de la aplicación.
* `css/`: Carpeta con los archivos de estilos CSS para el diseño de la interfaz.
* `js/`: Carpeta con los scripts JavaScript que implementan la funcionalidad.
* `img/`: Directorio con las imágenes utilizadas en la interfaz de usuario.

## Tecnologías Utilizadas
* **HTML5**: Estructura de la aplicación.
* **CSS3**: Diseño y presentación visual.
* **JavaScript**: Interactividad y manipulación de datos.
* **Biblioteca Externa**:
  * [SheetJS](https://sheetjs.com/): Para la lectura y tratamiento de archivos Excel en el navegador.

## Instrucciones de Uso
1. **Carga del Archivo**
   * Abre la aplicación en tu navegador web.
   * Usa el botón “Seleccionar archivo” para cargar un archivo `.xls` desde tu sistema local.

2. **Visualización y Filtrado**
   * Una vez cargado, los datos se mostrarán en una tabla interactiva.
   * Activa o desactiva los filtros disponibles según tus necesidades.

3. **Gestión de la Última Incidencia Leída**
   * Al hacer clic en una incidencia (columna *Código petición*), se guarda automáticamente como la última leída.
   * Puedes usar los botones del indicador para volver a esa fila o eliminar la marca.

4. **Exportación de Resultados**
   * Utiliza el botón de exportar para guardar la tabla en formato Excel.

## Consideraciones
* Asegúrate de que el archivo `.xls` tenga el formato esperado (columnas y hojas utilizadas por el sistema AURORA).
* La aplicación se ejecuta completamente en el navegador, sin necesidad de servidor.

## Licencia
Este proyecto está bajo la licencia MIT. Consulta el archivo `LICENSE` para más información.

## Contacto
Para más información o consultas, visita el repositorio en GitHub:
[https://github.com/antoniolopez-tragsa/comparador_aurora](https://github.com/antoniolopez-tragsa/comparador_aurora)