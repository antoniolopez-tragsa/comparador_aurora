// === Persistencia de última incidencia leída (columna row[12]) ===
const LAST_READ_KEY = 'ultimaIncidenciaAurora';

function getLastRead() {
    try { return localStorage.getItem(LAST_READ_KEY) || null; } catch { return null; }
}

function setLastRead(id) {
    try { localStorage.setItem(LAST_READ_KEY, id); } catch { }
    updateLastReadUI();
}

function clearLastRead() {
    try { localStorage.removeItem(LAST_READ_KEY); } catch { }
    updateLastReadUI();
    const table = document.getElementById('results__table');
    if (table) table.querySelectorAll('tr.row-last-read').forEach(tr => tr.classList.remove('row-last-read'));
}

function updateLastReadUI() {
    const indicator = document.getElementById('lastReadIndicator');
    const valueEl = document.getElementById('lastReadValue');
    const last = getLastRead();
    if (!indicator || !valueEl) return;
    if (last) { indicator.hidden = false; valueEl.textContent = last; }
    else { indicator.hidden = true; valueEl.textContent = '—'; }
}

function highlightLastReadInTable() {
    const last = getLastRead();
    const table = document.getElementById('results__table');
    if (!table || !last) return;
    table.querySelectorAll('tr.row-last-read').forEach(tr => tr.classList.remove('row-last-read'));
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(tr => {
        const firstCell = tr.querySelector('td a, td');
        if (firstCell && firstCell.textContent?.trim() === last) tr.classList.add('row-last-read');
    });
}

function scrollToLastRead() {
    const table = document.getElementById('results__table');
    const last = getLastRead();
    if (!table || !last) return;
    const tr = Array.from(table.querySelectorAll('tbody tr')).find(tr => {
        const firstCell = tr.querySelector('td a, td');
        return firstCell && firstCell.textContent?.trim() === last;
    });
    if (tr) { tr.scrollIntoView({ behavior: 'smooth', block: 'center' }); tr.classList.add('row-last-read'); }
}

document.addEventListener('DOMContentLoaded', () => {
    updateLastReadUI();
    const btnClear = document.getElementById('clearLastRead');
    const btnScroll = document.getElementById('scrollLastRead');
    if (btnClear) btnClear.addEventListener('click', clearLastRead);
    if (btnScroll) btnScroll.addEventListener('click', scrollToLastRead);
});
/**
 * Convierte una cadena de fecha en formato 'DD/MM/YYYY HH:MM:SS' a un objeto Date.
 * @param {string} dateString - La cadena de fecha en formato 'DD/MM/YYYY HH:MM:SS'.
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
    const file1 = fileInput1.files[0]; // Primer archivo seleccionado

    if (!file1) {
        showError('Por favor, selecciona un archivo.'); // Mostrar error si no hay primer archivo
        return;
    }

    const reader1 = new FileReader();

    // Procesar el primer archivo
    reader1.onload = function (e) {
        try {
            const data1 = e.target.result;
            const workbook1 = XLSX.read(data1, { type: 'binary' });
            const sheet2_1 = workbook1.Sheets[workbook1.SheetNames[1]]; // Segunda hoja del primer archivo
            date1 = sheet2_1 && sheet2_1['B22'] ? parseDate(sheet2_1['B22'].v) : null; // Leer fecha
            const rows1 = XLSX.utils.sheet_to_json(workbook1.Sheets[workbook1.SheetNames[0]], { header: 1, defval: '' });

            if (rows1.length === 0) {
                showError('El primer archivo está vacío o no contiene datos legibles.');
                return;
            }

            enableFiltersAndShowTable(rows1); // Solo un archivo seleccionado
        } catch (err) {
            console.error(err);
            showError('Ocurrió un error al procesar el archivo.');
        }
    };

    reader1.readAsArrayBuffer(file1);
});

// Vincular la función `checkFiles` a los eventos de cambio en los campos de archivo
document.getElementById('file1').addEventListener('change', checkFiles);

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
 * Muestra un mensaje de error en el contenedor designado.
 * @param {string} message - Mensaje de error a mostrar.
 */
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';

    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000); // Ocultar después de 5 segundos
}

/**
 * Muestra los datos y habilita el fieldset.
 * @param {Array} data - Datos a mostrar.
 */
function enableFiltersAndShowTable(data) {
    enableFieldset(); // Habilitar fieldset
    const filters = ['showClaims', 'showAudits', 'showPending'];

    filters.forEach(id => {
        const checkbox = document.getElementById(id);
        checkbox.checked = false;

        // Reemplaza los event listeners para evitar duplicados
        checkbox.replaceWith(checkbox.cloneNode(true));
        const newCheckbox = document.getElementById(id);
        newCheckbox.addEventListener('change', () => filterTable(data));
    });

    document.getElementById('filterOptions').style.display = 'block';
    document.getElementById('clearButton').style.display = 'block';

    filterTable(data);
}

// Función para filtrar la tabla
function filterTable(data) {
    const showClaims = document.getElementById('showClaims').checked;
    const showAudits = document.getElementById('showAudits').checked;
    const showPending = document.getElementById('showPending').checked;

    let filteredData = new Set(); // Usamos un Set para evitar duplicados

    if (showClaims) {
        data.slice(1).forEach(row => {
            const isClaim = row[11] && row[11].includes('R');
            if (isClaim) {
                filteredData.add(row);
            }
        });
    }

    if (showAudits) {
        data.slice(1).forEach(row => {
            const tRespSeconds = convertToSeconds(row[0]);
            const tResolSeconds = convertToSeconds(row[1]);
            const maxTRespSeconds = convertToSeconds(row[4]);
            const maxTResolSeconds = convertToSeconds(row[5]);

            const auditCondition = maxTRespSeconds > 0 && maxTResolSeconds > 0 &&
                (tRespSeconds > maxTRespSeconds || tResolSeconds >= maxTResolSeconds);

            if (auditCondition) {
                filteredData.add(row);
            }
        });
    }

    if (showPending) {
        data.slice(1).forEach(row => {
            const timeCol49Seconds = convertToSeconds(row[48]); // Columna 49 (índice 48)

            if (timeCol49Seconds > 0) {
                filteredData.add(row);
            }
        });
    }

    // Si no hay filtros aplicados, mostrar todos los datos.
    if (!showClaims && !showAudits && !showPending) {
        filteredData = new Set(data.slice(1)); // Todos los datos sin filtros
    }

    createTable([data[0], ...Array.from(filteredData)]); // Convertimos el Set a Array para crear la tabla
}

/**
 * Función que devuelve la categoría correspondiente al carácter dado.
 *
 * @param {string} char - El carácter que representa una categoría.
 * @returns {string} - La categoría correspondiente o el propio carácter si no coincide con ninguna categoría.
 */
function getCategoryByFirstChar(char) {
    switch (char) {
        case 'I':
            return 'Incidencia';
        case 'S':
            return 'Solicitud';
        case 'R':
            return 'Reclamación';
        case 'A':
            return 'Agradecimiento / Sugerencia';
        case 'P':
            return 'Petición';
        case 'V':
            return 'Inspección visual';
        default:
            return char;
    }
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
    table.setAttribute('id', 'results__table');
    table.setAttribute('role', 'table');

    const header = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const columnsToShow = [12, 0, 4, 1, 5, 48, 11, 14];
    const timeColumns = [0, 4, 1, 5, 48];

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

    const sortedData = data.slice(1).sort((a, b) => parseFloat(b[12]) - parseFloat(a[12]));
    sortedData.forEach((row) => {
        const tr = document.createElement('tr');

        // Si está Finalizada, que salga en cursiva
        if (row[13] === 'Finalizada') {
            tr.classList.add('italic');
        }

        // Si no contiene 'HUMV' en la columna 4 (índice 3), que salga en negrita
        if (row[3] && !row[3].toString().includes('HUMV')) {
            tr.classList.add('bold');
        }

        columnsToShow.forEach((colIndex) => {
            const td = document.createElement('td');

            if (colIndex === 11) {
                td.textContent = getCategoryByFirstChar(row[colIndex]) || '';
            } else if (colIndex === 12) {
                const link = document.createElement('a');
                link.href = `https://aurora.intranet.humv.es/aurora-ui/index.zul?idPeticionAurora=${row[colIndex]}`;
                link.setAttribute('title', row[16]); // Que salga la descripción cuando pasas el ratón por encima
                link.textContent = row[colIndex];
                link.target = '_blank';
                // Guardar también con clic medio o Ctrl/Cmd+clic
                const saveLastRead = () => {
                    const id = link.textContent?.trim();
                    if (id) setLastRead(id);
                };
                link.addEventListener('click', () => saveLastRead());
                link.addEventListener('auxclick', (e) => { if (e.button === 1) saveLastRead(); });
                link.addEventListener('mouseup', (e) => { if (e.button === 1) saveLastRead(); });
                link.addEventListener('contextmenu', () => saveLastRead());
                link.addEventListener('mouseup', (e) => { if (e.button === 2) saveLastRead(); });
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

    // Crear el botón en el DOM
    const excelButton = document.createElement('button');
    excelButton.id = 'exportarExcel';
    excelButton.type = 'button';
    excelButton.innerHTML = 'Exportar a '; // Texto del botón

    // Crear la imagen y añadirla al botón
    const excelImage = document.createElement('img');
    excelImage.id = 'imagen-excel';
    excelImage.src = 'img/excel.png';
    excelImage.alt = 'Excel';
    excelButton.appendChild(excelImage);

    resultContainer.appendChild(excelButton);
    resultContainer.appendChild(table);
    resultContainer.style.display = 'block';
    updateLastReadUI();
    highlightLastReadInTable();
}

/**
 * Convierte un tiempo en formato 'Xh Ym Zs' a segundos.
 * @param {string} timeString - Cadena de tiempo en formato 'Xh Ym Zs'.
 * @returns {number} - Tiempo total en segundos.
 */
function convertToSeconds(timeString) {
    if (!timeString || typeof timeString !== 'string') return 0;
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

// Añade un evento al botón de exportar para generar y descargar un archivo Excel
document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'exportarExcel') {
        exportToExcel();
    }
});

// Función que exporta los datos de la tabla a un archivo Excel
function exportToExcel() {
    // Obtén los datos de la tabla
    const table = document.getElementById('results__table');
    if (!table) {
        alert('La tabla no existe');
        return;
    }

    // Clonar la tabla para procesarla sin afectar el DOM original
    const clonedTable = table.cloneNode(true);

    // Eliminar los enlaces y mantener solo el texto
    const links = clonedTable.querySelectorAll('a');
    links.forEach(link => {
        const text = link.textContent || link.innerText;
        const parent = link.parentElement;
        parent.replaceChild(document.createTextNode(text), link);
    });

    try {
        // Convierte la tabla HTML modificada a una hoja de Excel
        const ws = XLSX.utils.table_to_sheet(clonedTable);

        // Crea un nuevo libro de trabajo
        const wb = XLSX.utils.book_new();

        // Añade la hoja al libro de trabajo
        XLSX.utils.book_append_sheet(wb, ws, 'AURORA');

        // Genera el archivo Excel y dispara la descarga con la fecha actual
        const now = new Date();
        const formattedDate = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
        XLSX.writeFile(wb, `aurora_${formattedDate}.xlsx`);
    } catch (error) {
        console.error('Error al exportar la tabla:', error);
        alert('Ocurrió un error al exportar la tabla');
    }
}