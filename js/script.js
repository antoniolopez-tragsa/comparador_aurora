// Obtén referencias a los elementos del formulario y de la interfaz
const fileForm = document.getElementById('fileForm');
const file1Input = document.getElementById('file1');
const file2Input = document.getElementById('file2');
const errorMessage = document.getElementById('errorMessage');
const resultContainer = document.getElementById('resultContainer');

// Escuchar el evento de envío del formulario
fileForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Evita el envío del formulario

    // Obtener los archivos seleccionados
    const file1 = file1Input.files[0];
    const file2 = file2Input.files[0];

    // Validar que ambos archivos estén seleccionados y sean del tipo .xls
    if (!file1 || !file2 || !file1.name.endsWith('.xls') || !file2.name.endsWith('.xls')) {
        errorMessage.style.display = 'block'; // Mostrar el mensaje de error
        errorMessage.textContent = 'Error: Por favor, cargue dos archivos .xls válidos.';
        resultContainer.style.display = 'none'; // Ocultar los resultados si hubiera alguno
        return; // Detener la ejecución si la validación falla
    }

    // Ocultar el mensaje de error si la validación es exitosa
    errorMessage.style.display = 'none';

    // Aquí puedes agregar la lógica de procesamiento de los archivos


    // Simulación de procesamiento de archivos para fines de demostración
    // (Reemplaza este bloque con la lógica de comparación real)
    const resultContent = `
        <h2>Resultados de la comparación</h2>
        <p>Primer fichero: ${file1.name}</p>
    `;

    // Mostrar el resultado en el contenedor de resultados
    resultContainer.innerHTML = resultContent;
    resultContainer.style.display = 'block';
});
