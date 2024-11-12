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

// Vincular la función `checkFiles` a los eventos de cambio en los campos de archivo
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

    let data1Rows = [];
    let data2Rows = [];
    let date1Start = null, date1End = null, date1List = null;
    let date2Start = null, date2End = null, date2List = null;

    reader1.onload = function (e) {
        const data1 = e.target.result;
        const workbook1 = XLSX.read(data1, { type: 'binary' });
        const sheet2_1 = workbook1.Sheets[workbook1.SheetNames[1]];

        // Leer fechas del primer archivo
        date1Start = sheet2_1 && sheet2_1['B7'] ? sheet2_1['B7'].v : null;
        date1End = sheet2_1 && sheet2_1['B8'] ? sheet2_1['B8'].v : null;
        date1List = sheet2_1 && sheet2_1['B22'] ? sheet2_1['B22'].v : null;

        const sheet1_1 = workbook1.Sheets[workbook1.SheetNames[0]];
        data1Rows = XLSX.utils.sheet_to_json(sheet1_1, { header: 1, defval: '' }).slice(1); // Excluir cabecera

        reader2.onload = function (e) {
            const data2 = e.target.result;
            const workbook2 = XLSX.read(data2, { type: 'binary' });
            const sheet2_2 = workbook2.Sheets[workbook2.SheetNames[1]];

            // Leer fechas del segundo archivo
            date2Start = sheet2_2 && sheet2_2['B7'] ? sheet2_2['B7'].v : null;
            date2End = sheet2_2 && sheet2_2['B8'] ? sheet2_2['B8'].v : null;
            date2List = sheet2_2 && sheet2_2['B22'] ? sheet2_2['B22'].v : null;

            const sheet1_2 = workbook2.Sheets[workbook2.SheetNames[0]];
            data2Rows = XLSX.utils.sheet_to_json(sheet1_2, { header: 1, defval: '' }).slice(1); // Excluir cabecera

            // Verificar fechas del listado
            if (date1List === date2List) {
                alert('Ambos archivos tienen la misma fecha del listado. No se realizará ninguna acción.');
                return;
            }

            // Verificar fechas de inicio y fin
            if (date1Start !== date2Start || date1End !== date2End) {
                alert(`Las fechas de inicio o fin no coinciden:\n\nArchivo 1:\nInicio: ${date1Start} - Fin: ${date1End}\n\nArchivo 2:\nInicio: ${date2Start} - Fin: ${date2End}`);
                return;
            }

            // Llama a la función de comparación con las fechas incluidas
            compareAndShowCriticidadChanges(data1Rows, data2Rows, date1List, date2List);
        };

        reader2.readAsArrayBuffer(file2);
    };

    reader1.readAsArrayBuffer(file1);
});

/**
 * Compara dos conjuntos de datos y muestra las filas con cambios en la criticidad.
 * @param {Array} data1Rows - Filas del primer archivo.
 * @param {Array} data2Rows - Filas del segundo archivo.
 * @param {string} date1List - Fecha del listado del primer archivo.
 * @param {string} date2List - Fecha del listado del segundo archivo.
 */
function compareAndShowCriticidadChanges(data1Rows, data2Rows, date1List, date2List) {
    const changes = [];

    const mapData1 = new Map(data1Rows.map(row => [row[12], row]));
    const mapData2 = new Map(data2Rows.map(row => [row[12], row]));

    mapData1.forEach((row1, key) => {
        const row2 = mapData2.get(key);

        if (row2 && row1[15] !== row2[15]) {
            changes.push({
                codigo: key,
                criticidad1: row1[15],
                criticidad2: row2[15]
            });
        }
    });

    if (changes.length > 0) {
        alert(`Se encontraron ${changes.length} cambios en la criticidad.`);
        showCriticidadChangesTable(changes, date1List, date2List); // Pasa las fechas
    } else {
        alert('No se encontraron cambios en la criticidad.');
    }
}

/**
 * Oculta el contenedor de resultados de manera inmediata.
 */
function hideResultContainer() {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.style.display = 'none'; // Ocultar inmediatamente
}

/**
 * Oculta el fieldset de filtros de manera inmediata.
 */
function hideFilterOptions() {
    const filterOptions = document.getElementById('filterOptions');
    filterOptions.style.display = 'none'; // Ocultar inmediatamente
}

/**
 * Limpia la tabla de resultados, oculta filtros, resetea los archivos seleccionados
 * y oculta el botón de comparar.
 */
document.getElementById('clearButton').addEventListener('click', function () {
    // Ocultar contenedor de resultados y filtros
    hideResultContainer();
    hideFilterOptions();

    // Limpiar campos de archivos
    document.getElementById('file1').value = '';
    document.getElementById('file2').value = '';

    // Ocultar y deshabilitar el botón Comparar
    const compareButton = document.getElementById('compareButton');
    compareButton.style.display = 'none';
    compareButton.disabled = true;
});

/**
 * Muestra los cambios en la criticidad en una tabla.
 * @param {Array} changes - Cambios detectados.
 * @param {string} date1List - Fecha de listado del primer archivo.
 * @param {string} date2List - Fecha de listado del segundo archivo.
 */
function showCriticidadChangesTable(changes, date1List, date2List) {
    const resultContainer = document.getElementById('resultContainer');
    const clearButton = document.getElementById('clearButton');

    resultContainer.innerHTML = ''; // Limpiar resultados previos

    const table = document.createElement('table');
    table.classList.add('results__table');
    table.setAttribute('role', 'table');

    // Crear cabecera de la tabla con fechas personalizadas
    const header = document.createElement('thead');
    const headerRow = document.createElement('tr');
    [
        'Código petición',
        `Criticidad Archivo 1 (${date1List || 'Sin Fecha'})`,
        `Criticidad Archivo 2 (${date2List || 'Sin Fecha'})`
    ].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        th.setAttribute('scope', 'col');
        headerRow.appendChild(th);
    });
    header.appendChild(headerRow);
    table.appendChild(header);

    // Crear cuerpo de la tabla
    const body = document.createElement('tbody');
    changes.forEach(change => {
        const tr = document.createElement('tr');

        // Celda con enlace para el Código
        const tdCodigo = document.createElement('td');
        const link = document.createElement('a');
        link.href = `https://aurora.intranet.humv.es/aurora-ui/index.zul?idPeticionAurora=${change.codigo}`;
        link.textContent = change.codigo;
        link.target = '_blank';
        tdCodigo.appendChild(link);
        tr.appendChild(tdCodigo);

        // Celda para Criticidad Archivo 1
        const tdCrit1 = document.createElement('td');
        tdCrit1.textContent = change.criticidad1;
        tr.appendChild(tdCrit1);

        // Celda para Criticidad Archivo 2
        const tdCrit2 = document.createElement('td');
        tdCrit2.textContent = change.criticidad2;
        tr.appendChild(tdCrit2);

        body.appendChild(tr);
    });

    table.appendChild(body);
    resultContainer.appendChild(table);
    resultContainer.style.display = 'block'; // Mostrar tabla
    clearButton.style.display = 'block'; // Mostrar botón limpiar
}

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
 * Muestra los datos y habilita el fieldset.
 * @param {Array} data - Datos a mostrar.
 */
function enableFiltersAndShowTable(data) {
    enableFieldset(); // Habilitar fieldset
    document.getElementById('filterOptions').style.display = 'block';
    document.getElementById('showClaims').checked = false;
    document.getElementById('showAudits').checked = false;

    document.getElementById('showClaims').addEventListener('change', () => filterTable(data));
    document.getElementById('showAudits').addEventListener('change', () => filterTable(data));

    // Mostrar el botón limpiar
    document.getElementById('clearButton').style.display = 'block';

    filterTable(data); // Mostrar tabla
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

/**
 * Deshabilita el fieldset de filtros.
 */
function disableFieldset() {
    document.getElementById('filterOptions').disabled = true;
    document.getElementById('filterOptions').style.display = 'none'; // Ocultar el fieldset
}

/**
 * Habilita el fieldset de filtros.
 */
function enableFieldset() {
    document.getElementById('filterOptions').disabled = false;
    document.getElementById('filterOptions').style.display = 'block'; // Mostrar el fieldset
}

/**
 * Muestra los datos y habilita el fieldset.
 * @param {Array} data - Datos a mostrar.
 */
function enableFiltersAndShowTable(data) {
    enableFieldset(); // Habilitar fieldset
    document.getElementById('filterOptions').style.display = 'block';
    document.getElementById('showClaims').checked = false;
    document.getElementById('showAudits').checked = false;

    document.getElementById('showClaims').addEventListener('change', () => filterTable(data));
    document.getElementById('showAudits').addEventListener('change', () => filterTable(data));

    filterTable(data); // Mostrar tabla
}

/**
 * Comparar archivos.
 */
document.getElementById('compareButton').addEventListener('click', function () {
    const file1 = document.getElementById('file1').files[0];
    const file2 = document.getElementById('file2').files[0];

    if (!file1 || !file2) {
        alert('Selecciona dos archivos para comparar.');
        return;
    }

    disableFieldset(); // Deshabilitar fieldset al comparar
});