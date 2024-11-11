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
    reader.onload = function (e) {
        // Obtener los datos del archivo cargado
        const data = e.target.result;

        // Leer el archivo Excel y convertirlo en un objeto de trabajo
        const workbook = XLSX.read(data, { type: 'binary' });

        // Obtener la primera hoja del archivo Excel
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // Convertir la hoja a un array de objetos (cada objeto es una fila de datos)
        const rows = XLSX.utils.sheet_to_row_object_array(sheet);

        // Llamar a la función para crear la tabla con los datos
        createTable(rows);
    };
    // Leer el archivo como un array de bytes
    reader.readAsArrayBuffer(file);
});

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
    table.classList.add('excel-table'); // Añadir clase para los estilos

    // Crear la cabecera de la tabla: solo mostrar algunas columnas específicas
    const header = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Definir las columnas que queremos mostrar (índices de columna: 1ª, 2ª, 5ª y 6ª)
    const columnsToShow = [0, 1, 4, 5];

    // Añadir una columna extra para el número de fila
    const thIndex = document.createElement('th');
    thIndex.textContent = 'Nº';
    headerRow.appendChild(thIndex);

    // Iterar sobre las columnas que queremos mostrar y crear las celdas de cabecera
    columnsToShow.forEach(colIndex => {
        const th = document.createElement('th');
        // Utilizar las claves de la primera fila para obtener los nombres de las columnas
        th.textContent = Object.keys(data[0])[colIndex];
        headerRow.appendChild(th);
    });

    // Añadir la fila de cabecera a la tabla
    header.appendChild(headerRow);
    table.appendChild(header);

    // Crear el cuerpo de la tabla
    const body = document.createElement('tbody');

    // Iterar sobre cada fila de datos y crear las celdas correspondientes
    data.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');

        // Añadir la columna con el número de fila
        const tdIndex = document.createElement('td');
        tdIndex.textContent = rowIndex + 1; // El número de fila empieza desde 1
        tr.appendChild(tdIndex);

        // Variable para saber si se debe mostrar la fila
        let showRow = true;

        // Iterar solo sobre las columnas que queremos mostrar
        columnsToShow.forEach(colIndex => {
            const td = document.createElement('td');

            // Obtener el valor de la celda correspondiente en la fila
            let cellValue = row[Object.keys(row)[colIndex]];

            // Si el valor está en las columnas 5ª o 6ª, procesarlo para extraer los números
            if (colIndex === 4 || colIndex === 5) {
                // Extraer los números de la cadena en formato "xxxh yym zzs"
                const regex = /(\d+)h (\d+)m (\d+)s/;
                const match = cellValue.match(regex);

                if (match) {
                    // Extraer las horas, minutos y segundos
                    const hours = parseInt(match[1], 10);
                    const minutes = parseInt(match[2], 10);
                    const seconds = parseInt(match[3], 10);

                    // Calcular el total de segundos
                    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
                    cellValue = totalSeconds; // Asignar el total de segundos como el valor de la celda
                } else {
                    // Si no coincide con el formato esperado, dejar la celda vacía
                    cellValue = ''; // Puedes poner un valor como 'Formato incorrecto' si lo prefieres
                }
            }

            // Si el valor de la celda está vacío y es una de las columnas de segundos, no mostrar la fila
            if ((colIndex === 4 || colIndex === 5) && (cellValue === '' || cellValue === undefined || cellValue === null)) {
                showRow = false; // No mostrar la fila
            }

            // Si el valor es vacío (undefined, null o cadena vacía), asignamos una celda vacía
            td.textContent = (cellValue === undefined || cellValue === null || cellValue === '') ? '' : cellValue;

            // Añadir la celda a la fila
            tr.appendChild(td);
        });

        // Si la fila tiene los valores válidos, añadirla al cuerpo de la tabla
        if (showRow) {
            body.appendChild(tr);
        }
    });

    // Añadir el cuerpo de la tabla a la tabla
    table.appendChild(body);

    // Añadir la tabla al contenedor de resultados
    resultContainer.appendChild(table);
    resultContainer.style.display = 'block'; // Mostrar la tabla
}
