// === Funciones Principales ===

// Comprobar si el usuario está autenticado y redirigir a la página de inicio de sesión si no lo está
function guardianCheck() {
    const guardianId = localStorage.getItem("token");
    if (guardianId == null || guardianId == undefined) {
        window.location.href = 'Login.html';
    }
}

// Inicializar cuando el contenido del DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", async () => {
    guardianCheck();
    initMode();
    initEventListeners();
    await generateFolder();
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

    // Añadir event listener para el cambio de criterio de filtro
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

// Generar las tarjetas de carpetas
async function generateFolder(sortCriteria) {
    const root = document.querySelector(".containerCard");

    // Obtener el token de autenticación y decodificarlo
    const authToken = localStorage.getItem('token');
    const tokenPayload = parseJwt(authToken);
    const userId = tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

    console.log('Fetching folders for userId:', userId);

    try {
        const response = await fetch(`http://drivenano.somee.com/api/folders/${userId}`);
        const data = await response.json();

        console.log(data);

        // Ordenar las carpetas según el criterio seleccionado
        if (sortCriteria === 'nameAsc') {
            data.Folders.sort((a, b) => a.Name.localeCompare(b.Name));
        } else if (sortCriteria === 'nameDesc') {
            data.Folders.sort((a, b) => b.Name.localeCompare(a.Name));
        }
        // Otros criterios de ordenamiento pueden ser implementados aquí

        console.log('Sorted folders:', data.Folders);

        // Limpiar contenedor antes de agregar las nuevas carpetas ordenadas
        root.innerHTML = '';

        // Crear las tarjetas de carpetas ordenadas
        data.Folders.forEach(element => {
            createFolderCard(element, root);
        });
    } catch (error) {
        if (error.message === 'Failed to fetch') {
            showAlert('Hubo un error al obtener los datos: No se pudo conectar con el servidor.', 'error');
        } else {
            showAlert("No hay carpetas creadas", 'warning');
        }
        console.error('Fetch error:', error);
    }
}

// Manejar el cambio de criterio de ordenamiento
function handleSortCriteriaChange() {
    // Obtener el criterio seleccionado del select
    const sortCriteria = document.getElementById('sortCriteria').value;

    // Llamar a generateFolder con el criterio seleccionado
    generateFolder(sortCriteria);
}

// Manejar cambios en los filtros
function handleFilterChange() {
    generateFolder(document.getElementById('filterCriteria').value);
}

// Crear una tarjeta de carpeta y añadirla al contenedor raíz
function createFolderCard(element, root) {
    const div = document.createElement('div');
    div.className = 'col';
    div.id = `folder-${element.Id}`;

    div.innerHTML = `
        <div class="card rounded-4 h-100 cardFolder">
            <div class="card-body ps-4">
                <div class="headerOptions d-flex justify-content-between">
                    <i class='bi bi-folder-fill mb-5'></i>
                    <i class="bx bx-edit btnEdit" title="Editar Carpeta" type="button" data-bs-toggle="modal" data-bs-target="#EditFolder"></i>
                </div>
                <div class="bodyCard">
                    <h5 class="card-title">${element.Name}</h5>
                    <p class="card-text ">${element.CountFiles} files</p>
                </div>
            </div>
            <div class="card-footer pt-2 pb-1 d-flex justify-content-between align-items-center">
                <p class="card-footerText ps-2">${returnFileSize(element.Size).value} ${element.UnitSize}</p>
                <div class="btn-group d-flex justify-content-center align-items-center">
                    <a type="button" title="Eliminar carpeta" class="text-center">
                        <i class="bi bi-trash2-fill me-3 iconCard iconCardTrash"></i>
                    </a>
                    <a type="button" title="Marcar como privado" class="text-center">
                        <i class="bi bi-file-earmark-arrow-down-fill me-3 iconCard iconCardLock"></i>
                    </a>
                </div>
            </div>
        </div>
    `;

    // Evento para la tarjeta de carpeta
    div.querySelector('.cardFolder').addEventListener('click', () => {
        console.log("Carpeta clicada");
        sessionStorage.setItem("IdFolder", element.Id);
        window.location.href = '../NanoDriveFrontend/FileFolder.html';
    });

    // Evento para el botón de edición
    div.querySelector('.btnEdit').addEventListener('click', (event) => {
        event.stopPropagation(); // Detener la propagación del evento click
        document.getElementById("foldernameEdit").value = element.Name;
        sessionStorage.setItem("ID", element.Id);
        selectRadio(element.Status);
    });

    // Eventos para los botones (ejemplo: eliminar, favoritos, privado)
    div.querySelector('.iconCardTrash').addEventListener('click', (event) => {
        event.stopPropagation(); // Detener la propagación del evento click
        deleteFolder(element.Id);
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

// Eliminar una carpeta
async function deleteFolder(folderId) {
    try {
        const response = await fetch(`http://drivenano.somee.com/api/folder/${folderId}/delete`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        document.getElementById(`folder-${folderId}`).remove();
        showAlert(data.Message, 'success');
    } catch (error) {
        showAlert('Error deleting folder', 'error');
        console.error('Error:', error);
    }
}

// Añadir una carpeta a favoritos
async function addFavourites(folderId) {
    try {
        const response = await fetch(`http://drivenano.somee.com/api/folder/${folderId}/favourite`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        document.getElementById(`folder-${folderId}`).remove();
        showAlert(data.Message, 'success');
    } catch (error) {
        showAlert('Error adding to favorites', 'error');
        console.error('Error:', error);
    }
}

// Marcar una carpeta como privada
async function addPrivate(folderId) {
    try {
        const response = await fetch(`http://drivenano.somee.com/api/folder/${folderId}/private`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        document.getElementById(`folder-${folderId}`).remove();
        showAlert(data.Message, 'success');
    } catch (error) {
        showAlert('Error marking as private', 'error');
        console.error('Error:', error);
    }
}

// Subir una nueva carpeta
async function initFolderUpload() {
    const root = document.querySelector(".containerCard");
    const folderName = document.getElementById("foldername").value;
    const selectedRadio = document.querySelector('input[name="statusFolder"]:checked');
    const userId = tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    const event = new Date().toISOString();
    console.log(userId);

    if (folderName && selectedRadio) {
        const formData = {
            name: folderName,
            dateCreate: event,
            status: selectedRadio.value,
            userId: userId // Actualiza esto según sea necesario
        };

        try {
            const response = await fetch(`http://drivenano.somee.com/api/folder/${userId}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            console.log(data.Message);
            if (data.StatusCode == 201) {
                $('#drangAndDropFile').modal('hide');
                showAlert(data.Message, 'success');
            } else {
                showAlert(data.Message, 'warning');
            }
            root.innerHTML = '';
            await generateFolder();
        } catch (error) {
            showAlert(error.message, 'error');
            console.error('Error:', error);
        }
    } else {
        showAlert('Please enter a folder name and select an option', 'warning');
    }
}

// Actualizar una carpeta existente
async function initFolderUpdate() {
    const root = document.querySelector(".containerCard");
    const folderNameElement = document.querySelector(".foldername");
    const folderName = folderNameElement ? folderNameElement.value : '';
    const selectedRadio = document.querySelector('input[name="statusFolder"]:checked');
    const event = new Date().toISOString();
    const userId = tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    let folderIdLocal = sessionStorage.getItem("IdFolder");

    if (folderName && selectedRadio) {
        const formData = {
            Name: folderName.toString(),
            DateCreate: event,
            Status: selectedRadio.value,
            UserId: userId
        };

        try {
            const response = await fetch(`http://drivenano.somee.com/api/folder/${folderIdLocal}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            console.dir(data);
            if (data.StatusCode == 200) {
                $('#EditFolder').modal('hide');
                showAlert(data.Message, 'success');
                root.innerHTML = '';
                await generateFolder();
            } else {
                showAlert(data.Message, 'warning');
            }
        } catch (error) {
            showAlert(`Folder update failed: ${error.message}`, 'error');
        }
    } else {
        showAlert('Please enter a folder name and select an option', 'warning');
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
    localStorage.removeItem('token');
    console.log('Logged out');
    window.location.href = 'Login.html'; // Redirigir a la página de inicio de sesión después de cerrar sesión
}

// Asignar la función de cierre de sesión al botón de cierre de sesión
document.getElementById('logout').onclick = logout;

console.log(document.getElementById('logout'));
