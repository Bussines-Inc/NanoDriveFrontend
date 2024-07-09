// === Funciones Principales ===

// Inicializar cuando el contenido del DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", async () => {
    initMode();
    initEventListeners();
    initFilters();
    await generateFileFolder();
});

// Inicializar el modo (claro/oscuro) basado en la configuración guardada en localStorage
function initMode() {
    const body = document.querySelector('body');
    const modeText = body.querySelector(".mode-text");

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

    toggle.addEventListener("click", () => {
        sidebar.classList.toggle("close");
    });

    searchBtn.addEventListener("click", () => {
        sidebar.classList.remove("close");
    });

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

// Generar las tarjetas de archivos dentro de la carpeta seleccionada
async function generateFileFolder() {
    const root = document.querySelector(".containerCard");
    const folderIdLocal = sessionStorage.getItem("IdFolder");
    root.innerHTML = ''; // Limpiar el contenido antes de regenerar

    try {
        const response = await fetch(`http://drivenano.somee.com/api/folder/${folderIdLocal}/documents`);
        const data = await response.json();
        if (data.Folder && data.Folder.Documents && data.Folder.Documents.length > 0) {
            const files = data.Folder.Documents;
            applyFilters(files, root);
        } else {
            showAlert("No hay archivos creados", 'warning');
        }
    } catch (error) {
        if (error.message === 'Failed to fetch') {
            showAlert('Hubo un error al obtener los datos: No se pudo conectar con el servidor.', 'error');
        } else {
            console.error(error);
            showAlert("No hay archivos creados", 'warning');
        }
    }
}

// === Funciones Secundarias ===

// Manejar cambios en los filtros
function handleFilterChange() {
    generateFileFolder();
}

// Aplicar los filtros seleccionados a la lista de archivos
function applyFilters(files, root) {
    const filterCriteria = document.getElementById('filterCriteria').value;
    const filteredFiles = filterFiles(files, filterCriteria);

    root.innerHTML = '';
    filteredFiles.forEach(element => {
        createFileCard(element, root);
    });
}

// Filtrar archivos según el criterio seleccionado
function filterFiles(files, criteria) {
    switch (criteria) {
        case 'nameAsc':
            return files.sort((a, b) => a.Name.localeCompare(b.Name));
        case 'nameDesc':
            return files.sort((a, b) => b.Name.localeCompare(a.Name));
        case 'dateAsc':
            return files.sort((a, b) => new Date(a.DateCreate) - new Date(b.DateCreate));
        case 'dateDesc':
            return files.sort((a, b) => new Date(b.DateCreate) - new Date(a.DateCreate));
        default:
            return files;
    }
}

// Crear una tarjeta de archivo y añadirla al contenedor raíz
function createFileCard(element, root) {
    const div = document.createElement('div');
    div.className = 'col';
    div.id = `folder-${element.Id}`;

    const date = new Date(element.DateCreate);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    const formattedDate = date.toLocaleDateString('en-US', options);

    div.innerHTML = `
        <div class="card rounded-4 h-100 cardFolder">
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
                <p class="card-footerText ps-2">${returnFileSize(element.Size).value} ${returnFileSize(element.Size).unit}</p>
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
                    <a type="button" title="Descargar archivo" class="text-center">
                        <i class="bi bi-file-earmark-arrow-down-fill me-3 iconCard iconCardDownload"></i>
                    </a>
                </div>
            </div>
        </div>
    `;

    div.querySelector('.btnEdit').addEventListener('click', () => {
        sessionStorage.setItem("ID", element.Id);
        document.getElementById("fileNameEdit").value = element.Name;
        selectRadio(element.Status);
    });

    div.querySelector('.iconCardTrash').addEventListener('click', () => {
        deleteFile(element.Id);
    });

    div.querySelector('.iconCardStar').addEventListener('click', () => {
        addFavourites(element.Id);
    });

    div.querySelector('.iconCardLock').addEventListener('click', () => {
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
async function deleteFile(fileId) {
    try {
        const response = await fetch(`http://drivenano.somee.com/api/file/delete/${fileId}`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        document.getElementById(`folder-${fileId}`).remove();
        showAlert(data.Message, 'success');
    } catch (error) {
        showAlert('Error deleting file', 'error');
        console.error('Error:', error);
    }
}

// Añadir un archivo a favoritos
async function addFavourites(fileId) {
    try {
        const response = await fetch(`http://drivenano.somee.com/api/file/${fileId}/favorite`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        document.getElementById(`folder-${fileId}`).remove();
        showAlert(data.Message, 'success');
    } catch (error) {
        showAlert('Error adding to favorites', 'error');
        console.error('Error:', error);
    }
}

// Marcar un archivo como privado
async function addPrivate(fileId) {
    try {
        const response = await fetch(`http://drivenano.somee.com/api/file/${fileId}/private`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        document.getElementById(`folder-${fileId}`).remove();
        showAlert(data.Message, 'success');
    } catch (error) {
        showAlert('Error marking as private', 'error');
        console.error('Error:', error);
    }
}

// Vista previa de los archivos seleccionados para subir
document.getElementById('file').addEventListener('change', previewFiles);

function previewFiles() {
    const fileInput = document.getElementById('file');
    const preview = document.querySelector(".preview");
    const curFiles = fileInput.files;

    while (preview.firstChild) {
        preview.removeChild(preview.firstChild);
    }

    if (curFiles.length === 0) {
        const para = document.createElement("p");
        para.textContent = "No files currently selected for upload";
        preview.appendChild(para);
    } else {
        const list = document.createElement("ol");
        preview.appendChild(list);

        Array.from(curFiles).forEach((file, index) => {
            const listItem = document.createElement("li");
            const para = document.createElement("p");

            if (validFileType(file)) {
                para.textContent = `File name: ${file.name}, File size: ${returnFileSize(file.size).value} ${returnFileSize(file.size).unit}.`;

                const image = document.createElement("img");
                image.src = URL.createObjectURL(file);
                image.alt = image.title = file.name;
                image.classList.add("img-fluid");

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.classList.add("btn", "btn-danger");

                deleteButton.addEventListener('click', () => {
                    listItem.remove();
                    removeFileFromInput(index);
                });

                listItem.appendChild(deleteButton);
                listItem.appendChild(image);
                listItem.appendChild(para);
            } else {
                para.textContent = `File name ${file.name}: Not a valid file type. Update your selection.`;
                listItem.appendChild(para);
            }

            list.appendChild(listItem);
        });
    }
}

// Eliminar un archivo del input de selección
function removeFileFromInput(index) {
    const fileInput = document.getElementById('file');
    const dt = new DataTransfer();
    const curFiles = fileInput.files;

    Array.from(curFiles).forEach((file, i) => {
        if (index !== i) {
            dt.items.add(file);
        }
    });

    fileInput.files = dt.files;
}

// Subir archivos seleccionados
async function initFileUpload() {
    const root = document.querySelector(".containerCard");
    const selectedRadio = document.querySelector('input[name="statusFolder"]:checked');
    const folderIdLocal = sessionStorage.getItem("IdFolder");
    const fileInput = document.getElementById('file');
    const files = fileInput.files;

    if (files.length > 0 && selectedRadio) {
        for (const file of files) {
            const formData = {
                name: file.name,
                type: file.type,
                size: file.size,
                unitsize: returnFileSize(file.size).unit,
                status: selectedRadio.value,
                folderId: folderIdLocal
            };

            try {
                const response = await fetch('http://drivenano.somee.com/api/files', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData),
                });
                const data = await response.json();

                if (response.ok) {
                    showAlert(data.Message, 'success');
                } else {
                    showAlert(`File upload failed for ${file.name}: ${data.Message}`, 'error');
                }
            } catch (error) {
                showAlert(`File upload failed for ${file.name}: ${error.message}`, 'error');
            }
        }
        root.innerHTML = " ";
        generateFileFolder();
    } else {
        showAlert('Please select a file to upload and an option', 'warning');
    }
}

// Subir una nueva carpeta
async function initFolderUpload() {
    const root = document.querySelector(".containerCard");
    const folderName = document.getElementById("foldername").value;
    const selectedRadio = document.querySelector('input[name="statusFolder"]:checked');
    const event = new Date().toISOString();
    const folderIdLocal = sessionStorage.getItem("IdFolder");
    const userId = tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    root.innerHTML = '';

    if (folderName && selectedRadio) {
        const formData = {
            name: folderName,
            dateCreate: event,
            status: selectedRadio.value,
            parentFolder_Id: folderIdLocal,
            userId: userId
        };

        try {
            const response = await fetch('http://drivenano.somee.com/api/folder', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();

            if (data.StatusCode == 201) {
                $('#drangAndDropFile').modal('hide');
                showAlert(data.Message, 'success');
            } else {
                showAlert(data.Message, 'warning');
            }
            await generateFileFolder();
        } catch (error) {
            showAlert(`Error creating folder: ${error.message}`, 'error');
        }
    } else {
        showAlert('Please enter a folder name and select an option', 'warning');
    }
}

// Actualizar una carpeta existente
async function initFileFolderUpdate() {
    const root = document.querySelector(".containerCard");
    const folderNameElement = document.querySelector(".foldername");
    const folderName = folderNameElement ? folderNameElement.value : '';
    const selectedRadio = document.querySelector('input[name="statusFolder"]:checked');
    const event = new Date().toISOString();
    const folderIdLocal = sessionStorage.getItem("ID");
    root.innerHTML = '';

    if (folderName && selectedRadio) {
        const formData = {
            Name: folderName.toString(),
            DateCreate: event,
            Status: selectedRadio.value,
        };

        try {
            const response = await fetch(`http://drivenano.somee.com/api/file/${folderIdLocal}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();

            if (data.StatusCode == 200) {
                $('#EditFile').modal('hide');
                showAlert(data.Message, 'success');
                await generateFileFolder();
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

    setTimeout(() => {
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

// Verificar si el tipo de archivo es válido
function validFileType(file) {
    const fileTypes = [
        "image/apng", "image/bmp", "image/gif", "image/jpeg", "image/pjpeg", "image/png", 
        "image/svg+xml", "image/tiff", "image/webp", "image/x-icon", "application/pdf", 
        "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
        "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
        "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", 
        "text/plain", "text/csv", "text/html", "application/rtf", "audio/midi", "audio/mpeg", 
        "audio/webm", "audio/ogg", "audio/wav", "audio/aac", "video/webm", "video/ogg", 
        "video/mp4", "video/x-msvideo", "application/zip", "application/x-rar-compressed", 
        "application/x-7z-compressed", "application/x-tar", "application/x-bzip", "application/x-bzip2", 
        "application/java-archive"
    ];
    return fileTypes.includes(file.type);
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
