# Comparador de Listados de Incidencias en AURORA

Este proyecto es una aplicación web estática que permite comparar listados de incidencias en el sistema AURORA. Ofrece funcionalidades para cargar y visualizar archivos de Excel, aplicar filtros específicos y comparar datos entre diferentes listados para identificar cambios críticos.

## Características Principales

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
  - Identifica cambios en la criticidad de las incidencias entre dos listados.
  - Resalta las diferencias encontradas para una fácil identificación.
- **Exportación a Excel**:
  - Permite exportar los resultados de la comparación a un archivo Excel para su análisis posterior.

## Estructura del Proyecto

- `index.html`: Página principal que contiene la estructura básica de la aplicación.
- `css/`: Carpeta que contiene los archivos de estilos CSS para el diseño de la aplicación.
- `js/`: Carpeta que incluye los scripts JavaScript necesarios para la funcionalidad de la aplicación.
- `img/`: Directorio destinado a las imágenes utilizadas en la interfaz de usuario.

## Tecnologías Utilizadas

- **HTML5**: Para la estructura de la página web.
- **CSS3**: Para el diseño y la presentación visual.
- **JavaScript**: Para la interactividad y la manipulación de datos.
- **Bibliotecas Externas**:
  - [SheetJS](https://sheetjs.com/): Para la manipulación y lectura de archivos Excel en el navegador.

## Instrucciones de Uso

1. **Carga de Archivos**:
   - Abre la aplicación en tu navegador web.
   - Utiliza el botón "Seleccionar archivo" para cargar uno o dos archivos `.xls` desde tu sistema local.
2. **Visualización y Filtrado**:
   - Una vez cargados los archivos, los datos se mostrarán en una tabla interactiva.
   - Aplica los filtros disponibles para refinar la visualización según tus necesidades.
3. **Comparación de Listados**:
   - Si has cargado dos archivos, la aplicación comparará automáticamente las incidencias entre ambos.
   - Las diferencias en la criticidad se resaltarán para facilitar su identificación.
4. **Exportación de Resultados**:
   - Después de la comparación, puedes exportar los resultados a un archivo Excel para guardarlos o analizarlos posteriormente.

## Consideraciones

- Asegúrate de que los archivos `.xls` que deseas comparar tengan un formato coherente y que las hojas correspondientes contengan las columnas necesarias para una comparación efectiva.
- La aplicación está diseñada para funcionar completamente en el lado del cliente, por lo que no se requiere una configuración de servidor.

## Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.

## Contacto

Para más información o consultas, puedes visitar el repositorio en GitHub: [https://github.com/antoniolopez-tragsa/comparador_aurora](https://github.com/antoniolopez-tragsa/comparador_aurora)


## Nueva Funcionalidad: Última Incidencia Leída

- **Persistencia en LocalStorage**: al hacer clic en una incidencia (columna Código petición, `row[12]`), la aplicación guarda ese código como la última leída en el navegador.
- **Indicador visual**: aparece un recuadro encima de la tabla que muestra la última incidencia seleccionada, con dos botones:
  - **Ir a fila**: desplaza y resalta la fila correspondiente en la tabla.
  - **Borrar**: elimina la marca y oculta el indicador.
- **Resaltado en tabla**: la fila guardada se resalta automáticamente al cargar o refrescar los datos.
- **Estilos mejorados**: integración visual con los colores principales de la aplicación, con fondo suave, sombra ligera y gradientes para el resaltado.
