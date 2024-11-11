// Añadir un event listener para manejar el evento de envío del formulario
document.getElementById('fileForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Evitar recarga de página

    // Obtener los archivos seleccionados
    const fileInput = document.getElementById('file1');
    const file = fileInput.files[0];

    if (!file) {
        showError('Por favor, selecciona un archivo.');
        return;
    }

    // Validar que el archivo sea un Excel
    if (!file.name.match(/\.(xls|xlsx)$/)) {
        showError('El archivo seleccionado no es válido. Solo se permiten archivos .xls o .xlsx.');
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];

            const rows = XLSX.utils.sheet_to_json(sheet, {
                header: 1,
                defval: '' // Asignar valores vacíos si faltan
            });

            if (rows.length === 0) {
                showError('El archivo está vacío o no contiene datos legibles.');
                return;
            }

            createTable(rows);
        } catch (error) {
            showError('Ocurrió un error al procesar el archivo. Asegúrate de que el formato sea correcto.');
            console.error(error);
        }
    };

    reader.onerror = function () {
        showError('Ocurrió un error al leer el archivo. Inténtalo de nuevo.');
    };

    reader.readAsArrayBuffer(file);
});

// Mostrar mensajes de error de manera uniforme
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Función para crear la tabla con los datos extraídos del archivo Excel
function createTable(data) {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = ''; // Limpiar cualquier contenido previo

    const table = document.createElement('table');
    table.classList.add('excel-table');
    table.setAttribute('role', 'table');

    // Crear la cabecera de la tabla
    const header = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const columnsToShow = [12, 3, 0, 1, 4, 5, 11, 15];

    columnsToShow.forEach((colIndex) => {
        const th = document.createElement('th');
        th.textContent = data[0][colIndex] || `Columna ${colIndex + 1}`;
        th.setAttribute('scope', 'col'); // Accesibilidad
        headerRow.appendChild(th);
    });

    header.appendChild(headerRow);
    table.appendChild(header);

    // Crear el cuerpo de la tabla usando DocumentFragment para eficiencia
    const body = document.createElement('tbody');
    const fragment = document.createDocumentFragment();

    data.slice(1).forEach((row) => {
        const tr = document.createElement('tr');

        columnsToShow.forEach((colIndex) => {
            const td = document.createElement('td');
            const cellValue = row[colIndex] === undefined ? '' : row[colIndex];
            td.textContent = cellValue;

            // Resaltar celdas vacías (opcional)
            if (cellValue === '') {
                td.classList.add('empty-cell');
            }

            tr.appendChild(td);
        });

        fragment.appendChild(tr);
    });

    body.appendChild(fragment);
    table.appendChild(body);

    resultContainer.appendChild(table);
    resultContainer.style.display = 'block'; // Mostrar resultados
}
