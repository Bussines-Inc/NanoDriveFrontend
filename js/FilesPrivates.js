// Comprobar si el usuario está autenticado y redirigir a la página de inicio de sesión si no lo está
function guardianCheck() {
    const guardianId = localStorage.getItem("token");
    if (guardianId == null || guardianId == undefined) {
        window.location.href = 'Login.html';
    }
}

// Inicializar cuando el contenido del DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    guardianCheck();
    initMode();
    initEventListeners();
    generateFile();
    initFilters();
});

// Inicializar el modo (claro/oscuro) basado en la configuración guardada en localStorage
function initMode() {
    const body = document.querySelector('body');
    const modeText = body.querySelector(".mode-text");

    // Si el modo oscuro está habilitado en localStorage, aplicarlo
    if (localStorage.getItem("dark-mode") === "enabled") {
        body.classList.add("dark");
        modeText.innerText = "Light mode";
    } else {
        body.classList.remove("dark");
        modeText.innerText = "Dark mode";
    }
}

// Inicializar los event listeners para los botones y elementos interactivos
function initEventListeners() {
    const body = document.querySelector('body');
    const sidebar = body.querySelector('nav');
    const toggle = body.querySelector(".toggle");
    const searchBtn = body.querySelector(".search-box");
    const modeSwitch = body.querySelector(".toggle-switch");
    const modeText = body.querySelector(".mode-text");

    // Toggle para abrir/cerrar la barra lateral
    toggle.addEventListener("click", () => {
        sidebar.classList.toggle("close");
    });

    // Abrir la barra lateral al hacer clic en el botón de búsqueda
    searchBtn.addEventListener("click", () => {
        sidebar.classList.remove("close");
    });

    // Cambiar el modo (claro/oscuro) al hacer clic en el interruptor
    modeSwitch.addEventListener("click", () => {
        toggleDarkMode(body, modeText);
    });
}

// Inicializar los filtros y configurar los eventos para manejar cambios en los filtros
function initFilters() {
    document.getElementById('filterCriteria').addEventListener('change', handleFilterChange);
}

// Cambiar el modo oscuro/claro y guardar la configuración en localStorage
function toggleDarkMode(body, modeText) {
    body.classList.toggle("dark");

    if (body.classList.contains("dark")) {
        modeText.innerText = "Light mode";
        localStorage.setItem("dark-mode", "enabled");
    } else {
        modeText.innerText = "Dark mode";
        localStorage.setItem("dark-mode", "disabled");
    }
}

// Generar las tarjetas de archivos
function generateFile(sortCriteria) {
    const root = document.querySelector(".containerCard");

    // Obtener el token de autenticación y decodificarlo
    const authToken = localStorage.getItem('token');
    const tokenPayload = parseJwt(authToken);
    const userId = tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

    console.log('Fetching files for userId:', userId);

    // Hacer una solicitud para obtener los archivos del usuario
    fetch(`http://localhost:5246/api/files/private/${userId}}?page=1&pageSize=200`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Ordenar los archivos según el criterio seleccionado
            if (sortCriteria === 'nameAsc') {
                data.Documents.sort((a, b) => a.Name.localeCompare(b.Name));
            } else if (sortCriteria === 'nameDesc') {
                data.Documents.sort((a, b) => b.Name.localeCompare(a.Name));
            } else if (sortCriteria === 'dateAsc') {
                data.Documents.sort((a, b) => new Date(a.DateCreate) - new Date(b.DateCreate));
            } else if (sortCriteria === 'dateDesc') {
                data.Documents.sort((a, b) => new Date(b.DateCreate) - new Date(a.DateCreate));
            }

            console.log('Sorted files:', data.Documents);

            // Limpiar contenedor antes de agregar los nuevos archivos ordenados
            root.innerHTML = '';

            // Crear las tarjetas de archivos ordenados
            data.Documents.forEach(element => {
                createFileCard(element, root);
            });
        })
        .catch(error => {
            if (error.message === 'Failed to fetch') {
                showAlert('Hubo un error al obtener los datos: No se pudo conectar con el servidor.', 'error');
            } else {
                showAlert("No hay archivos creados", 'warning');
            }
            console.error('Fetch error:', error);
        });
}

// Manejar el cambio de criterio de ordenamiento
function handleSortCriteriaChange() {
    // Obtener el criterio seleccionado del select
    const sortCriteria = document.getElementById('sortCriteria').value;

    // Llamar a generateFile con el criterio seleccionado
    generateFile(sortCriteria);
}

// Manejar cambios en los filtros
function handleFilterChange() {
    generateFile(document.getElementById('filterCriteria').value);
}

// Crear una tarjeta de archivo y añadirla al contenedor raíz
function createFileCard(element, root) {
    const div = document.createElement('div');
    div.className = 'col';
    div.id = `file-${element.Id}`;

    // Formatear la fecha
    const date = new Date(element.DateCreate);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    const formattedDate = date.toLocaleDateString('en-US', options);

    div.innerHTML = `
        <div class="card rounded-4 h-100 cardFile">
            <div class="card-body ps-4">
                <div class="headerOptions d-flex justify-content-between">
                    <i class="bi bi-file-earmark-text-fill mb-5"></i>
                    <i class="bx bx-edit btnEdit" title="Editar Archivo" type="button" data-bs-toggle="modal" data-bs-target="#EditFile"></i>
                </div>
                <div class="bodyCard">
                    <h5 class="card-title">${element.Name}</h5>
                    <p class="card-text ">${formattedDate}</p>
                </div>
            </div>
            <div class="card-footer pt-2 pb-1 d-flex justify-content-between align-items-center">
                <p class="card-footerText ps-2">${returnFileSize(element.Size).value} ${element.UnitSize}</p>
                <div class="btn-group d-flex justify-content-center align-items-center">
                    <a type="button" title="Eliminar archivo" class="text-center">
                        <i class="bi bi-trash2-fill me-3 iconCard iconCardTrash"></i>
                    </a>
                    <a type="button" title="Enviar a favoritos" class="text-center">
                        <i class="bi bi-star-fill me-3 iconCard iconCardStar"></i>
                    </a>
                    <a type="button" title="Marcar como privado" class="text-center">
                        <i class="bi bi-lock-fill me-3 iconCard iconCardLock"></i>
                    </a>
                    <a type="button" title="Marcar como privado" class="text-center">
                        <i class="bi bi-file-earmark-arrow-down-fill me-3 iconCard iconCardDownload"></i>
                    </a>
                </div>
            </div>
        </div>
    `;

    // Evento para la tarjeta de archivo
    div.querySelector('.cardFile').addEventListener('click', () => {
        console.log("Archivo clicado");
        sessionStorage.setItem("IdFile", element.Id);
        // Redireccionar o realizar alguna acción
    });

    // Evento para el botón de edición
    div.querySelector('.btnEdit').addEventListener('click', (event) => {
        event.stopPropagation(); // Detener la propagación del evento click
        document.getElementById("fileNameEdit").value = element.Name;
        sessionStorage.setItem("FileID", element.Id);
        console.log(element);
        selectRadio(element.Status);
    });

    // Eventos para los botones (ejemplo: eliminar, favoritos, privado)
    div.querySelector('.iconCardTrash').addEventListener('click', (event) => {
        event.stopPropagation(); // Detener la propagación del evento click
        deleteFile(element.Id);
    });

    div.querySelector('.iconCardStar').addEventListener('click', (event) => {
        event.stopPropagation(); // Detener la propagación del evento click
        addFavorites(element.Id);
    });

    div.querySelector('.iconCardLock').addEventListener('click', (event) => {
        event.stopPropagation(); // Detener la propagación del evento click
        addPrivate(element.Id);
    });

    root.appendChild(div);
}

// Función para seleccionar el radio button correcto basado en el estado
function selectRadio(status) {
    const radios = document.querySelectorAll('input[name="statusFolder"]');
    radios.forEach(radio => {
        radio.checked = (radio.value === status);
    });
}

// Eliminar un archivo
function deleteFile(fileId) {
    fetch(`http://localhost:5246/api/file/delete/${fileId}`, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById(`file-${fileId}`).remove();
        showAlert(data.Message, 'success');
        root.innerHTML = '';
        generateFile();
    })
    .catch(error => {
        showAlert('Error deleting file', 'error');
        console.error('Error:', error);
    });
}

// Añadir un archivo a favoritos
function addFavorites(fileId) {
    fetch(`http://localhost:5246/api/file/${fileId}/private`, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById(`folder-${folderId}`).remove();
        showAlert(data.Message, 'success');
    })
    .catch(error => {
        showAlert('Error adding to favorites', 'error');
        console.error('Error:', error);
    });
}

// Marcar un archivo como privado
function addPrivate(fileId) {
    fetch(`http://localhost:5246/api/file/${fileId}/private`, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById(`folder-${folderId}`).remove();
        showAlert(data.Message, 'success');
    })
    .catch(error => {
        showAlert('Error marking as private', 'error');
        console.error('Error:', error);
    });
}

// Subir un nuevo archivo
function initFileUpload() {
    const root = document.querySelector(".containerCard");
    const fileInput = document.getElementById("file");
    const files = fileInput.files;
    const selectedRadio = document.querySelector('input[name="statusFolder"]:checked');
    const event = new Date().toISOString();
    const userId = tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    root.innerHTML = '';

    if (files.length > 0 && selectedRadio) {
        const formData = new FormData();
        for (const file of files) {
            formData.append('files', file);
        }
        formData.append('status', selectedRadio.value);
        formData.append('userId', userId);

        fetch('http://localhost:5246/api/files', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.StatusCode === 201) {
                $('#drangAndDropFile').modal('hide');
                showAlert(data.Message, 'success');
            } else {
                showAlert(data.Message, 'warning');
            }
            root.innerHTML = '';
            generateFile();
        })
        .catch(error => {
            showAlert('Error uploading file', 'error');
            console.error('Error:', error);
        });
    } else {
        showAlert('Please select files and a status option', 'warning');
    }
}

// Actualizar un archivo existente
function initFileUpdate() {
    console.log("PRESS");
    const root = document.querySelector(".containerCard");
    const fileNameElement = document.querySelector(".fileName");
    const fileName = fileNameElement ? fileNameElement.value : '';
    const selectedRadio = document.querySelector('input[name="statusFolder"]:checked');
    const event = new Date().toISOString();
    const userId = tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    const FolderId = sessionStorage.getItem("FileID")
    if (fileName && selectedRadio) {
        const formData = {
            Name: fileName.toString(),
            DateCreate: event,
            Status: selectedRadio.value,
        };

        fetch(`http://localhost:5246/api/file/${FolderId}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.StatusCode === 200) {
                $('#EditFile').modal('hide');
                showAlert(data.Message, 'success');
                root.innerHTML = '';
                generateFile();
            } else if (data.StatusCode === 409) {
                showAlert(data.Message, 'warning');
            }
        })
        .catch(error => {
            showAlert(`File update failed: ${error.message}`, 'error');
        });
    } else {
            console.log(fileName);
    console.log(selectRadio.value);
        showAlert('Please enter a file name and select an option', 'warning');
    }
}

// Mostrar una alerta en la interfaz
function showAlert(message, type) {
    let alertClass = '';
    switch (type) {
        case 'success':
            alertClass = 'success';
            break;
        case 'warning':
            alertClass = 'warning';
            break;
        case 'error':
            alertClass = 'error';
            break;
        default:
            alertClass = 'warning';
    }

    const alertBox = document.querySelector('.alert');
    const msgBox = document.querySelector('.msg');

    alertBox.classList.remove('success', 'warning', 'error');
    alertBox.classList.add(alertClass);
    msgBox.textContent = message;
    alertBox.classList.add("show");
    alertBox.classList.remove("hide");
    alertBox.classList.add("showAlert");

    setTimeout(function () {
        alertBox.classList.remove("show");
        alertBox.classList.add("hide");
    }, 5000);
}

// Cerrar la alerta cuando se hace clic en el botón de cierre
document.querySelector('.close-btn').addEventListener('click', function () {
    const alertBox = document.querySelector('.alert');
    alertBox.classList.remove("show");
    alertBox.classList.add("hide");
});

// Decodificar el token JWT
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// Obtener el token de autenticación de localStorage y decodificarlo
const authToken = localStorage.getItem('token');
const tokenPayload = parseJwt(authToken);

// El userId está en "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
const userId = tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

console.log(userId);

// Función de cierre de sesión
function logout() {
    localStorage.removeItem("token");
    window.location.href = 'Login.html';
}

// Formatear el tamaño del archivo para mostrarlo en una unidad legible
function returnFileSize(number) {
    if (number < 1024) {
        return { value: number, unit: 'bytes' };
    } else if (number >= 1024 && number < 1048576) {
        return { value: (number / 1024).toFixed(1), unit: 'KB' };
    } else if (number >= 1048576) {
        return { value: (number / 1048576).toFixed(1), unit: 'MB' };
    }
}
