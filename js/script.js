/**
 * Convierte una cadena de fecha en formato "DD/MM/YYYY HH:MM:SS" a un objeto Date.
 * @param {string} dateString - La cadena de fecha en formato "DD/MM/YYYY HH:MM:SS".
 * @returns {Date|null} - Un objeto Date correspondiente a la cadena o null si el formato es inválido.
 */
function parseDate(dateString) {
    if (!dateString) return null; // Retornar null si no hay cadena
    const [datePart, timePart] = dateString.split(' '); // Dividir en fecha y hora
    const [day, month, year] = datePart.split('/').map(Number); // Obtener día, mes, año
    const [hours, minutes, seconds] = timePart.split(':').map(Number); // Obtener horas, minutos, segundos
    return new Date(year, month - 1, day, hours, minutes, seconds); // Crear objeto Date
}

/**
 * Event listener para manejar el envío del formulario.
 * Lee los archivos seleccionados, procesa sus hojas y muestra los datos.
 */
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

    let date1 = null, date2 = null;

    // Procesar el primer archivo
    reader1.onload = function (e) {
        const data1 = e.target.result;
        const workbook1 = XLSX.read(data1, { type: 'binary' });
        const sheet2_1 = workbook1.Sheets[workbook1.SheetNames[1]]; // Segunda hoja del primer archivo
        date1 = sheet2_1 && sheet2_1['B22'] ? parseDate(sheet2_1['B22'].v) : null; // Leer fecha

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
                date2 = sheet2_2 && sheet2_2['B22'] ? parseDate(sheet2_2['B22'].v) : null; // Leer fecha

                const rows2 = XLSX.utils.sheet_to_json(workbook2.Sheets[workbook2.SheetNames[0]], { header: 1, defval: '' });

                if (rows2.length === 0) {
                    showError('El segundo archivo está vacío o no contiene datos legibles.');
                    return;
                }

                // Mostrar datos del archivo más reciente
                enableFiltersAndShowTable(date1 > date2 || !date2 ? rows1 : rows2);
            };

            reader2.readAsArrayBuffer(file2);
        } else {
            enableFiltersAndShowTable(rows1); // Solo un archivo seleccionado
        }
    };

    reader1.readAsArrayBuffer(file1);
});

/**
 * Event listeners para habilitar/deshabilitar el botón Comparar cuando ambos archivos están seleccionados.
 */
document.getElementById('file1').addEventListener('change', checkFiles);
document.getElementById('file2').addEventListener('change', checkFiles);

/**
 * Habilita o deshabilita el botón Comparar dependiendo de si ambos archivos están seleccionados.
 */
function checkFiles() {
    const file1 = document.getElementById('file1').files[0];
    const file2 = document.getElementById('file2').files[0];
    const compareButton = document.getElementById('compareButton');

    if (file1 && file2) {
        compareButton.style.display = 'block'; // Mostrar el botón
        compareButton.disabled = false; // Habilitar el botón
    } else {
        compareButton.style.display = 'none'; // Ocultar el botón
        compareButton.disabled = true; // Deshabilitar el botón
    }
}

/**
 * Event listener para manejar la lógica de comparación entre los archivos seleccionados.
 * Compara las fechas de ambos archivos y muestra un alert si son iguales o diferentes.
 */
document.getElementById('compareButton').addEventListener('click', function () {
    const file1 = document.getElementById('file1').files[0];
    const file2 = document.getElementById('file2').files[0];

    if (!file1 || !file2) {
        alert('Selecciona dos archivos para comparar.');
        return;
    }

    const reader1 = new FileReader();
    const reader2 = new FileReader();

    let date1 = null, date2 = null;

    reader1.onload = function (e) {
        const data1 = e.target.result;
        const workbook1 = XLSX.read(data1, { type: 'binary' });
        const sheet2_1 = workbook1.Sheets[workbook1.SheetNames[1]];
        date1 = sheet2_1 && sheet2_1['B22'] ? parseDate(sheet2_1['B22'].v) : null;

        reader2.onload = function (e) {
            const data2 = e.target.result;
            const workbook2 = XLSX.read(data2, { type: 'binary' });
            const sheet2_2 = workbook2.Sheets[workbook2.SheetNames[1]];
            date2 = sheet2_2 && sheet2_2['B22'] ? parseDate(sheet2_2['B22'].v) : null;

            if (date1 && date2 && date1.getTime() === date2.getTime()) {
                alert('Ambos archivos tienen la misma fecha. No se realizará ninguna acción.');
            } else {
                alert('Las fechas son diferentes.');
            }
        };

        reader2.readAsArrayBuffer(file2);
    };

    reader1.readAsArrayBuffer(file1);
});

/**
 * Muestra un mensaje de error en el contenedor designado.
 * @param {string} message - Mensaje de error a mostrar.
 */
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message; // Mostrar mensaje de error
    errorMessage.style.display = 'block'; // Asegurar visibilidad del mensaje
}

/**
 * Habilita los filtros y muestra la tabla con los datos procesados.
 * @param {Array} data - Datos de la hoja de cálculo.
 */
function enableFiltersAndShowTable(data) {
    document.getElementById('filterOptions').style.display = 'block'; // Mostrar filtros
    document.getElementById('showClaims').checked = false; // Desmarcar filtros
    document.getElementById('showAudits').checked = false;

    document.getElementById('showClaims').addEventListener('change', () => filterTable(data));
    document.getElementById('showAudits').addEventListener('change', () => filterTable(data));

    filterTable(data); // Mostrar tabla sin filtrar inicialmente
}

// Función para filtrar la tabla
function filterTable(data) {
    const showClaims = document.getElementById('showClaims').checked;
    const showAudits = document.getElementById('showAudits').checked;
    let filteredData = data.slice(1); // Excluir cabecera

    if (showClaims || showAudits) {
        filteredData = filteredData.filter(row => {
            const isClaim = row[11] && row[11].includes('R');
            const tRespSeconds = convertToSeconds(row[0]);
            const tResolSeconds = convertToSeconds(row[1]);
            const maxTRespSeconds = convertToSeconds(row[4]);
            const maxTResolSeconds = convertToSeconds(row[5]);

            if (showClaims && isClaim) return true;

            if (showAudits) {
                if (maxTRespSeconds === 0 || maxTResolSeconds === 0) return false;
                return tRespSeconds > maxTRespSeconds || tResolSeconds >= maxTResolSeconds;
            }

            return false;
        });
    }

    createTable([data[0], ...filteredData]);
}

/**
 * Crea y muestra una tabla con los datos proporcionados.
 * @param {Array} data - Datos de la hoja de cálculo.
 */
function createTable(data) {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = ''; // Limpiar resultados previos

    const table = document.createElement('table');
    table.classList.add('results__table');
    table.setAttribute('role', 'table');

    const header = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const columnsToShow = [12, 0, 1, 4, 5, 11, 14];
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

/**
 * Convierte un tiempo en formato "Xh Ym Zs" a segundos.
 * @param {string} timeString - Cadena de tiempo en formato "Xh Ym Zs".
 * @returns {number} - Tiempo total en segundos.
 */
function convertToSeconds(timeString) {
    if (!timeString) return 0;
    const timeRegex = /(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/;
    const match = timeString.match(timeRegex);

    if (!match) return 0;

    const [, hours = 0, minutes = 0, seconds = 0] = match.map(val => (val ? Number(val) : 0));

    return (hours * 3600) + (minutes * 60) + seconds;
}
