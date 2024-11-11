// Añadir un event listener al formulario
document.getElementById('fileForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Evitar recarga de página

    const fileInput = document.getElementById('file1');
    const file = fileInput.files[0];

    if (!file) {
        showError('Por favor, selecciona un archivo.'); // Mostrar error si no se selecciona un archivo
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];

            const rows = XLSX.utils.sheet_to_json(sheet, {
                header: 1, // Utilizar la primera fila como cabecera
                defval: '' // Reemplazar valores `undefined` con cadena vacía
            });

            if (rows.length === 0) {
                showError('El archivo está vacío o no contiene datos legibles.');
                return;
            }

            createTable(rows); // Crear la tabla con los datos extraídos

            // Mostrar el fieldset con los filtros después de cargar la tabla
            document.getElementById('filterOptions').style.display = 'block';

            // Añadir eventos a los checkbox para filtrar la tabla en tiempo real
            document.getElementById('showClaims').addEventListener('change', () => filterTable(rows));
            document.getElementById('showAudits').addEventListener('change', () => filterTable(rows));

        } catch (error) {
            showError('Ocurrió un error al procesar el archivo.');
            console.error(error);
        }
    };

    reader.readAsArrayBuffer(file); // Leer el archivo como un array de bytes
});

// Función para filtrar la tabla basada en las opciones seleccionadas
function filterTable(data) {
    const showClaims = document.getElementById('showClaims').checked;
    const showAudits = document.getElementById('showAudits').checked;

    let filteredData = data.slice(1); // Filas sin cabecera

    if (showClaims) {
        filteredData = filteredData.filter(row => row[11] && row[11].includes('R')); // Filtrar por "R" en columna 11
    }

    if (showAudits) {
        filteredData = filteredData.filter(row => row[6] === 'Susceptible de Auditoría'); // Filtrar por "Susceptible de Auditoría" en columna 6
    }

    createTable([data[0], ...filteredData]); // Reconstruir la tabla con los datos filtrados
}

// Función para crear la tabla con los datos
function createTable(data) {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = ''; // Limpiar resultados previos

    const table = document.createElement('table');
    table.classList.add('results__table');
    table.setAttribute('role', 'table');

    const header = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const columnsToShow = [12, 3, 0, 1, 4, 5, 11, 15];
    const timeColumns = [0, 1, 4, 5];

    columnsToShow.forEach((colIndex) => {
        const th = document.createElement('th');
        th.textContent = data[0][colIndex] || `Columna ${colIndex + 1}`;
        th.setAttribute('scope', 'col');
        headerRow.appendChild(th);

        if (timeColumns.includes(colIndex)) {
            const thSeconds = document.createElement('th');
            thSeconds.textContent = `${data[0][colIndex]} (Segundos)`;
            thSeconds.setAttribute('scope', 'col');
            headerRow.appendChild(thSeconds);
        }
    });

    header.appendChild(headerRow);
    table.appendChild(header);

    const body = document.createElement('tbody');
    const fragment = document.createDocumentFragment();

    data.slice(1).forEach((row) => {
        const tr = document.createElement('tr');

        columnsToShow.forEach((colIndex) => {
            const td = document.createElement('td');
            td.textContent = row[colIndex] || '';
            tr.appendChild(td);

            if (timeColumns.includes(colIndex)) {
                const tdSeconds = document.createElement('td');
                tdSeconds.textContent = convertToSeconds(row[colIndex]);
                tr.appendChild(tdSeconds);
            }
        });

        fragment.appendChild(tr);
    });

    body.appendChild(fragment);
    table.appendChild(body);

    resultContainer.appendChild(table);
    resultContainer.style.display = 'block';
}

// Función para convertir "Xh Ym Zs" a segundos
function convertToSeconds(timeString) {
    if (!timeString) return 0;

    const timeRegex = /(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/;
    const [, hours = 0, minutes = 0, seconds = 0] = timeString.match(timeRegex).map(Number);

    return (hours * 3600) + (minutes * 60) + seconds;
}

// Función para mostrar mensajes de error
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}
