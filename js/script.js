// Añadir un event listener al formulario para manejar la carga del archivo
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
            const workbook = XLSX.read(data, { type: 'binary' }); // Leer el archivo Excel en formato binario
            const sheet = workbook.Sheets[workbook.SheetNames[0]]; // Obtener la primera hoja del archivo

            // Convertir la hoja en un array de objetos
            const rows = XLSX.utils.sheet_to_json(sheet, {
                header: 1, // Utilizar la primera fila como cabecera
                defval: '' // Reemplazar valores `undefined` con cadena vacía
            });

            if (rows.length === 0) {
                showError('El archivo está vacío o no contiene datos legibles.');
                return;
            }

            createTable(rows); // Crear la tabla con los datos extraídos

            // Desmarcar los checkbox por defecto
            document.getElementById('showClaims').checked = false;
            document.getElementById('showAudits').checked = false;


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

    let filteredData = data.slice(1); // Excluir la cabecera

    if (showClaims || showAudits) {
        filteredData = filteredData.filter(row => {
            const isClaim = row[11] && row[11].includes('R'); // Verificar si es una reclamación (columna 11 contiene "R")
            const tRespSeconds = convertToSeconds(row[0]); // T. Resp en segundos (columna 0)
            const tResolSeconds = convertToSeconds(row[1]); // T. Resol en segundos (columna 1)
            const maxTRespSeconds = convertToSeconds(row[4]); // Máximo T. Resp en segundos (columna 4)
            const maxTResolSeconds = convertToSeconds(row[5]); // Máximo T. Resol en segundos (columna 5)

            // Mostrar siempre las reclamaciones si el primer checkbox está activo
            if (showClaims && isClaim) return true;

            // Aplicar criterios de auditoría solo si el segundo checkbox está activo
            if (showAudits) {
                // Excluir filas si los máximos son 0
                if (maxTRespSeconds === 0 || maxTResolSeconds === 0) return false;

                // Verificar si los tiempos exceden los máximos permitidos
                const exceedsMaxResp = tRespSeconds > maxTRespSeconds;
                const exceedsMaxResol = tResolSeconds >= maxTResolSeconds;

                return exceedsMaxResp || exceedsMaxResol; // Cumple el criterio de auditoría
            }

            return false; // Excluir si no cumple ningún criterio
        });
    }

    createTable([data[0], ...filteredData]); // Reconstruir la tabla con los datos filtrados, manteniendo la cabecera
}

// Función para crear la tabla con los datos proporcionados
function createTable(data) {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = ''; // Limpiar resultados previos

    const table = document.createElement('table');
    table.classList.add('results__table');
    table.setAttribute('role', 'table'); // Accesibilidad

    const header = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const columnsToShow = [12, 0, 1, 4, 5, 11]; // Índices de columnas a mostrar
    const timeColumns = [0, 1, 4, 5]; // Columnas que contienen tiempos

    columnsToShow.forEach((colIndex) => {
        const th = document.createElement('th');
        th.textContent = data[0][colIndex] || `Columna ${colIndex + 1}`; // Nombre de columna o índice
        th.setAttribute('scope', 'col'); // Accesibilidad
        headerRow.appendChild(th);

        if (timeColumns.includes(colIndex)) {
            // Añadir columnas adicionales para mostrar valores en segundos
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

            if (colIndex === 12) { // Código de petición (columna 12)
                const link = document.createElement('a');
                link.href = `https://aurora.intranet.humv.es/aurora-ui/index.zul?idPeticionAurora=${row[colIndex]}`;
                link.textContent = row[colIndex];
                link.target = '_blank'; // Abrir en nueva pestaña
                td.appendChild(link);
            } else {
                td.textContent = row[colIndex] || '';
            }

            tr.appendChild(td);

            if (timeColumns.includes(colIndex)) {
                const tdSeconds = document.createElement('td');
                tdSeconds.textContent = convertToSeconds(row[colIndex]); // Mostrar valor en segundos
                tr.appendChild(tdSeconds);
            }
        });

        fragment.appendChild(tr);
    });

    body.appendChild(fragment);
    table.appendChild(body);

    resultContainer.appendChild(table);
    resultContainer.style.display = 'block'; // Mostrar resultados
}

// Función para convertir un tiempo "Xh Ym Zs" a segundos
function convertToSeconds(timeString) {
    if (!timeString) return 0;

    const timeRegex = /(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/; // Regex para horas, minutos y segundos
    const [, hours = 0, minutes = 0, seconds = 0] = timeString.match(timeRegex).map(Number);

    return (hours * 3600) + (minutes * 60) + seconds; // Convertir todo a segundos
}

// Función para mostrar mensajes de error
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message; // Mostrar mensaje de error
    errorMessage.style.display = 'block'; // Asegurarse de que sea visible
}
