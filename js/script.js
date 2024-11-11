// Añadir un event listener para manejar el evento de envío del formulario
document.getElementById('fileForm').addEventListener('submit', function (event) {
    // Evitar que se recargue la página al enviar el formulario
    event.preventDefault();

    // Obtener el archivo seleccionado por el usuario
    const fileInput = document.getElementById('file1');
    const file = fileInput.files[0];

    // Comprobar si el archivo no ha sido seleccionado
    if (!file) {
        alert('Por favor, selecciona un archivo.');
        return;
    }

    // Crear un lector de archivos para leer el contenido del archivo Excel
    const reader = new FileReader();

    // Al cargar el archivo, ejecutar la función que lo procesará
    reader.onload = function (e) {
        // Obtener los datos del archivo cargado
        const data = e.target.result;

        // Leer el archivo Excel y convertirlo en un objeto de trabajo
        const workbook = XLSX.read(data, { type: 'binary' });

        // Obtener la primera hoja del archivo Excel
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // Convertir la hoja a un array de objetos, pero sin eliminar celdas vacías
        const rows = XLSX.utils.sheet_to_json(sheet, {
            header: 1, // Utiliza la primera fila como cabecera
            defval: '' // Asigna una cadena vacía en lugar de `undefined` para las celdas vacías
        });

        // Llamar a la función para crear la tabla con los datos extraídos
        createTable(rows);
    };

    // Leer el archivo como un array de bytes
    reader.readAsArrayBuffer(file);
});

// Función para crear la tabla con los datos extraídos del archivo Excel
function createTable(data) {
    // Obtener el contenedor donde se va a insertar la tabla
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = ''; // Limpiar cualquier contenido previo

    // Si no hay datos en el archivo, mostrar un mensaje
    if (data.length === 0) {
        resultContainer.innerHTML = '<p>No se encontraron datos en el archivo.</p>';
        resultContainer.style.display = 'block'; // Mostrar el mensaje de error
        return;
    }

    // Crear la tabla
    const table = document.createElement('table');
    table.classList.add('excel-table'); // Añadir clase para los estilos CSS

    // Crear la cabecera de la tabla
    const header = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Definir las columnas que queremos mostrar (índices de columna: 12, 0, 1, 4, 5 y 11)
    const columnsToShow = [12, 0, 1, 4, 5, 11];

    // Añadir las celdas de la cabecera
    columnsToShow.forEach(colIndex => {
        const th = document.createElement('th');
        // Utilizar las claves de la primera fila para obtener los nombres de las columnas
        th.textContent = data[0][colIndex];
        headerRow.appendChild(th);
    });

    // Añadir la fila de cabecera a la tabla
    header.appendChild(headerRow);
    table.appendChild(header);

    // Crear el cuerpo de la tabla
    const body = document.createElement('tbody');

    // Iterar sobre cada fila de datos y crear las celdas correspondientes
    data.slice(1).forEach((row, rowIndex) => {
        const tr = document.createElement('tr');

        // Iterar sobre las columnas seleccionadas para la tabla
        columnsToShow.forEach((colIndex) => {
            const td = document.createElement('td');
            const cellValue = row[colIndex]; // Obtener el valor de la celda

            // Respetar celdas vacías
            td.textContent = cellValue === undefined || cellValue === null ? '' : cellValue;
            tr.appendChild(td); // Añadir la celda a la fila
        });

        // Añadir la fila al cuerpo de la tabla
        body.appendChild(tr);
    });

    // Añadir el cuerpo de la tabla a la tabla
    table.appendChild(body);

    // Añadir la tabla al contenedor de resultados
    resultContainer.appendChild(table);
    resultContainer.style.display = 'block'; // Mostrar la tabla
}
