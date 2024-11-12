// Añadir un event listener al formulario para manejar la carga de archivos
document.getElementById('fileForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Evitar recarga de página

    const fileInput1 = document.getElementById('file1');
    const fileInput2 = document.getElementById('file2');
    const file1 = fileInput1.files[0]; // Primer archivo seleccionado
    const file2 = fileInput2.files[0]; // Segundo archivo seleccionado

    if (!file1) {
        showError('Por favor, selecciona al menos el primer archivo.'); // Mostrar error si no hay primer archivo
        return;
    }

    const reader1 = new FileReader();
    const reader2 = file2 ? new FileReader() : null; // Leer el segundo archivo si está presente

    let date1 = null, date2 = null; // Variables para almacenar fechas

    // Función para convertir una cadena de fecha en formato "DD/MM/YYYY HH:MM:SS" a un objeto Date
    function parseDate(dateString) {
        if (!dateString) return null;
        const [datePart, timePart] = dateString.split(' '); // Dividir en fecha y hora
        const [day, month, year] = datePart.split('/').map(Number); // Obtener día, mes, año
        const [hours, minutes, seconds] = timePart.split(':').map(Number); // Obtener horas, minutos, segundos
        return new Date(year, month - 1, day, hours, minutes, seconds); // Crear objeto Date
    }

    // Procesar el primer archivo
    reader1.onload = function (e) {
        const data1 = e.target.result;
        const workbook1 = XLSX.read(data1, { type: 'binary' });
        const sheet2_1 = workbook1.Sheets[workbook1.SheetNames[1]]; // Segunda hoja del primer archivo

        // Obtener la fecha de la celda B22 y convertirla a un objeto Date
        date1 = sheet2_1 && sheet2_1['B22'] ? parseDate(sheet2_1['B22'].v) : null;

        const rows1 = XLSX.utils.sheet_to_json(workbook1.Sheets[workbook1.SheetNames[0]], { header: 1, defval: '' });

        if (rows1.length === 0) {
            showError('El primer archivo está vacío o no contiene datos legibles.');
            return;
        }

        if (reader2) {
            // Procesar el segundo archivo si está presente
            reader2.onload = function (e) {
                const data2 = e.target.result;
                const workbook2 = XLSX.read(data2, { type: 'binary' });
                const sheet2_2 = workbook2.Sheets[workbook2.SheetNames[1]]; // Segunda hoja del segundo archivo

                // Obtener la fecha de la celda B22 y convertirla a un objeto Date
                date2 = sheet2_2 && sheet2_2['B22'] ? parseDate(sheet2_2['B22'].v) : null;

                const rows2 = XLSX.utils.sheet_to_json(workbook2.Sheets[workbook2.SheetNames[0]], { header: 1, defval: '' });

                if (rows2.length === 0) {
                    showError('El segundo archivo está vacío o no contiene datos legibles.');
                    return;
                }

                // Comparar fechas
                if (date1 && date2 && date1.getTime() === date2.getTime()) {
                    alert('Ambos archivos tienen la misma fecha. Se procesará el primer archivo.');
                    enableFiltersAndShowTable(rows1); // Fechas iguales: tratar como el mismo archivo
                } else if (date1 > date2 || !date2) {
                    alert('El primer archivo es más reciente y se procesará.');
                    enableFiltersAndShowTable(rows1); // Fecha 1 más reciente o fecha 2 no disponible
                } else {
                    alert('El segundo archivo es más reciente y se procesará.');
                    enableFiltersAndShowTable(rows2); // Fecha 2 más reciente
                }
            };

            reader2.readAsArrayBuffer(file2);
        } else {
            enableFiltersAndShowTable(rows1); // Solo un archivo seleccionado
        }
    };

    reader1.readAsArrayBuffer(file1);
});

// Función para mostrar errores
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message; // Mostrar mensaje de error
    errorMessage.style.display = 'block'; // Asegurar visibilidad del mensaje
}

// Función para habilitar filtros y mostrar la tabla
function enableFiltersAndShowTable(data) {
    document.getElementById('filterOptions').style.display = 'block'; // Mostrar filtros
    document.getElementById('showClaims').checked = false; // Desmarcar filtros
    document.getElementById('showAudits').checked = false;

    document.getElementById('showClaims').addEventListener('change', () => filterTable(data));
    document.getElementById('showAudits').addEventListener('change', () => filterTable(data));

    filterTable(data); // Mostrar tabla sin filtrar inicialmente
}

// Función para filtrar la tabla según las opciones seleccionadas
function filterTable(data) {
    const showClaims = document.getElementById('showClaims').checked;
    const showAudits = document.getElementById('showAudits').checked;
    let filteredData = data.slice(1); // Excluir cabecera

    if (showClaims || showAudits) {
        filteredData = filteredData.filter(row => {
            const isClaim = row[11] && row[11].includes('R'); // Reclamación
            const tRespSeconds = convertToSeconds(row[0]); // Tiempo de Respuesta
            const tResolSeconds = convertToSeconds(row[1]); // Tiempo de Resolución
            const maxTRespSeconds = convertToSeconds(row[4]); // Máximo T. Resp
            const maxTResolSeconds = convertToSeconds(row[5]); // Máximo T. Resol

            if (showClaims && isClaim) return true; // Mostrar reclamaciones

            if (showAudits) {
                if (maxTRespSeconds === 0 || maxTResolSeconds === 0) return false; // Excluir si máximos son 0
                const exceedsMaxResp = tRespSeconds > maxTRespSeconds;
                const exceedsMaxResol = tResolSeconds >= maxTResolSeconds;
                return exceedsMaxResp || exceedsMaxResol; // Cumple criterio de auditoría
            }

            return false;
        });
    }

    createTable([data[0], ...filteredData]); // Reconstruir la tabla
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

    // Añadir la columna 14 (Criticidad) a las columnas que se mostrarán
    const columnsToShow = [12, 0, 1, 4, 5, 11, 14]; // Añadida la columna 14
    const timeColumns = [0, 1, 4, 5]; // Columnas que contienen tiempos

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

            if (colIndex === 12) {
                const link = document.createElement('a');
                link.href = `https://aurora.intranet.humv.es/aurora-ui/index.zul?idPeticionAurora=${row[colIndex]}`;
                link.textContent = row[colIndex];
                link.target = '_blank';
                td.appendChild(link);
            } else {
                td.textContent = row[colIndex] || '';
            }

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


// Función para convertir un tiempo "Xh Ym Zs" a segundos
function convertToSeconds(timeString) {
    if (!timeString) return 0; // Retorna 0 si la cadena está vacía o es null/undefined

    const timeRegex = /(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/; // Regex para horas, minutos y segundos
    const match = timeString.match(timeRegex);

    if (!match) return 0; // Retorna 0 si el formato no coincide con el esperado

    const [, hours = 0, minutes = 0, seconds = 0] = match.map(val => (val ? Number(val) : 0)); // Asegurar valores numéricos

    return (hours * 3600) + (minutes * 60) + seconds; // Convertir a segundos
}