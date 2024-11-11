// Añadir un event listener al formulario para manejar la carga del archivo
document.getElementById('fileForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario (recarga de página)

    const fileInput = document.getElementById('file1');
    const file = fileInput.files[0];

    if (!file) {
        showError('Por favor, selecciona un archivo.'); // Mostrar error si no se selecciona un archivo
        return;
    }

    const reader = new FileReader();

    // Manejar la carga del archivo
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
                showError('El archivo está vacío o no contiene datos legibles.'); // Mostrar error si no hay datos
                return;
            }

            createTable(rows); // Crear la tabla con los datos extraídos

            // Mostrar los checkbox de filtrado después de cargar la tabla
            document.getElementById('filterOptions').style.display = 'block';

            // Añadir eventos a los checkbox para filtrar la tabla en tiempo real
            document.getElementById('showClaims').addEventListener('change', () => filterTable(rows));
            document.getElementById('showAudits').addEventListener('change', () => filterTable(rows));

        } catch (error) {
            showError('Ocurrió un error al procesar el archivo.'); // Mostrar error en caso de fallo
            console.error(error);
        }
    };

    reader.readAsArrayBuffer(file); // Leer el archivo como un array de bytes
});

// Función para filtrar la tabla basada en las opciones seleccionadas
function filterTable(data) {
    const showClaims = document.getElementById('showClaims').checked; // Verificar si el checkbox "Mostrar solo reclamaciones" está marcado
    const showAudits = document.getElementById('showAudits').checked; // Verificar si el checkbox "Mostrar solo solicitudes susceptibles de auditoría" está marcado

    // Inicializar datos filtrados (excluyendo la cabecera)
    let filteredData = data.slice(1);

    if (showClaims) {
        // Filtrar filas donde la columna 11 contiene "R"
        filteredData = filteredData.filter(row => row[11] && row[11].includes('R'));
    }

    if (showAudits) {
        // Filtrar filas donde la columna 6 tiene el valor "Susceptible de Auditoría"
        filteredData = filteredData.filter(row => row[6] === 'Susceptible de Auditoría');
    }

    // Reconstruir la tabla con los datos filtrados
    createTable([data[0], ...filteredData]); // Mantener la cabecera original
}

// Función para crear la tabla con los datos proporcionados
function createTable(data) {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = ''; // Limpiar cualquier contenido previo

    const table = document.createElement('table');
    table.classList.add('excel-table'); // Añadir clase CSS para estilos
    table.setAttribute('role', 'table'); // Atributo de accesibilidad

    // Crear la cabecera de la tabla
    const header = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const columnsToShow = [12, 3, 0, 1, 4, 5, 11, 15]; // Índices de columnas que se mostrarán
    const timeColumns = [0, 1, 4, 5]; // Columnas que contienen valores de tiempo

    columnsToShow.forEach((colIndex) => {
        const th = document.createElement('th');
        th.textContent = data[0][colIndex] || `Columna ${colIndex + 1}`; // Nombre de columna o índice
        th.setAttribute('scope', 'col'); // Atributo de accesibilidad
        headerRow.appendChild(th);

        if (timeColumns.includes(colIndex)) {
            // Añadir una columna adicional para mostrar valores en segundos
            const thSeconds = document.createElement('th');
            thSeconds.textContent = `${data[0][colIndex]} (Segundos)`;
            thSeconds.setAttribute('scope', 'col');
            headerRow.appendChild(thSeconds);
        }
    });

    header.appendChild(headerRow);
    table.appendChild(header);

    // Crear el cuerpo de la tabla
    const body = document.createElement('tbody');
    const fragment = document.createDocumentFragment();

    data.slice(1).forEach((row) => {
        const tr = document.createElement('tr');

        columnsToShow.forEach((colIndex) => {
            const td = document.createElement('td');
            td.textContent = row[colIndex] || ''; // Mostrar valor o cadena vacía si no existe
            tr.appendChild(td);

            if (timeColumns.includes(colIndex)) {
                const tdSeconds = document.createElement('td');
                tdSeconds.textContent = convertToSeconds(row[colIndex]); // Convertir valores de tiempo a segundos
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

// Función para convertir un tiempo en formato "Xh Ym Zs" a segundos
function convertToSeconds(timeString) {
    if (!timeString) return 0; // Retornar 0 si el valor es nulo o vacío

    const timeRegex = /(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/; // Expresión regular para extraer horas, minutos y segundos
    const [, hours = 0, minutes = 0, seconds = 0] = timeString.match(timeRegex).map(Number); // Mapear valores a números

    return (hours * 3600) + (minutes * 60) + seconds; // Calcular el total en segundos
}

// Función para mostrar mensajes de error en la interfaz
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message; // Mostrar el mensaje de error
    errorMessage.style.display = 'block'; // Asegurarse de que el mensaje es visible
}
