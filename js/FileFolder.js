document.addEventListener("DOMContentLoaded", () => {
    initMode();
    initEventListeners();
    generateFileFolder();
});

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

function generateFileFolder() {
    const root = document.querySelector(".containerCard");
    let folderIdLocal = sessionStorage.getItem("IdFolder");

    fetch(`http://localhost:5246/api/folder/${folderIdLocal}/documents`)
        .then(response => response.json())
        .then(data => {
            data.Folder.Documents.forEach(element => {
                createFolderCard(element, root);
            });
        })
        .catch(error => {
            if (error.message === 'Failed to fetch') {
                showAlert('Hubo un error al obtener los datos: No se pudo conectar con el servidor.', 'error');
            } else {
                console.log(error);
                showAlert("No ahi archivos creadas", 'warning');
            }
            console.error('Fetch error:', error);
        });
}

function createFolderCard(element, root) {
    var div = document.createElement('div');
    div.className = 'col';
    div.id = `folder-${element.Id}`;

    // Formatear la fecha
    var date = new Date(element.DateCreate);
    var options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    var formattedDate = date.toLocaleDateString('en-US', options);

    div.innerHTML = `
        <div class="card rounded-4 h-100 cardFolder">
            <div class="card-body ps-4">
                <div class="headerOptions d-flex justify-content-between">
                    <i class="bi bi-file-earmark-text-fill mb-5"></i>
                    <i class="bx bx-edit btnEdit" title="Editar Carpeta" type="button" data-bs-toggle="modal" data-bs-target="#EditFolder"></i>
                </div>
                <div class="bodyCard">
                    <h5 class="card-title">${element.Name}</h5>
                    <p class="card-text ">${formattedDate}</p>
                </div>
            </div>
            <div class="card-footer pt-2 pb-1 d-flex justify-content-between align-items-center">
                <p class="card-footerText ps-2">${returnFileSize(element.Size).value} ${element.UnitSize}</p>
                <div class="btn-group d-flex justify-content-center align-items-center">
                    <a type="button" title="Eliminar carpeta" class="text-center">
                        <i class="bi bi-trash2-fill me-3 iconCard iconCardTrash"></i>
                    </a>
                    <a type="button" title="Enviar a favoritos" class="text-center">
                        <i class="bi bi-star-fill me-3 iconCard iconCardStar"></i>
                    </a>
                    <a type="button" title="Marcar como privado" class="text-center">
                        <i class="bi bi-lock-fill me-3 iconCard iconCardLock"></i>
                    </a>
                </div>
            </div>
        </div>
    `;

    // Evento para el botón de edición
    div.querySelector('.btnEdit').addEventListener('click', () => {
        console.log("PRESS");
        sessionStorage.setItem("ID", element.Id);
    });

    // Eventos para los botones (ejemplo: eliminar, favoritos, privado)
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

function deleteFile(fileId) {
    fetch(`http://localhost:5246/api/file/delete/${fileId}`, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => response.json())
        .then(data => {

            console.dir(data);
            document.getElementById(`folder-${fileId}`).remove();
            showAlert(data.Message, 'success');
        })
        .catch(error => {
            showAlert('Error deleting folder', 'error');
            console.log('Error:', error);
        });
}

function addFavourites(fileId) {
    fetch(`http://localhost:5246/api/file/${fileId}/favorite`, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById(`folder-${fileId}`).remove();
            showAlert(data.Message, 'success');
        })
        .catch(error => {
            showAlert('Error adding to favorites', 'error');
            console.error('Error:', error);
        });
}

function addPrivate(fileId) {
    fetch(`http://localhost:5246/api/file/${fileId}/private`, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById(`folder-${fileId}`).remove();
            showAlert(data.Message, 'success');
        })
        .catch(error => {
            showAlert('Error marking as private', 'error');
            console.error('Error:', error);
        });
}
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

        for (const file of curFiles) {
            const listItem = document.createElement("li");
            const para = document.createElement("p");
            if (validFileType(file)) {
                para.textContent = `File name: ${file.name}, File size: ${returnFileSize(file.size).value}.`;
                const image = document.createElement("img");
                image.src = URL.createObjectURL(file);
                image.alt = image.title = file.name;
                image.classList.add("img-fluid");

                listItem.appendChild(image);
                listItem.appendChild(para);
            } else {
                para.textContent = `File name ${file.name}: Not a valid file type. Update your selection.`;
                listItem.appendChild(para);
            }

            list.appendChild(listItem);
        }
    }
}

async function initFileUpload() {
    const root = document.querySelector(".containerCard");
    const selectedRadio = document.querySelector('input[name="statusFolder"]:checked');
    let folderIdLocal = sessionStorage.getItem("IdFolder");

    const fileInput = document.getElementById('file');
    const files = fileInput.files;

    
    if (files.length > 0 && selectedRadio) {
        for (const file of files) {
            
            console.log(file);
            console.log(returnFileSize(file.size).value);
            console.log(file.size);
            console.log(typeof(file.size));

            const formData = {
                name: file.name,
                type: file.type,
                size: file.size,
                unitsize: returnFileSize(file.size).unit,
                status: selectedRadio.value,
                folderId: folderIdLocal
            };

            console.log(formData);

            fetch('http://localhost:5246/api/files', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData),
            })
            .then(response => response.json())
            .then(data => {
                showAlert(data.Message, 'success');
                console.log(data);
                root.innerHTML = '';
                generateFileFolder();
            })
            .catch (error => {
                showAlert(`File upload failed for ${file.name}`, 'error');
                console.error('Error:', error);
            });
        }
        root.innerHTML = '';
        generateFileFolder();
    } else {
        showAlert('Please select a file to upload and an option', 'warning');
    }
}

function initFolderUpload() {
    const root = document.querySelector(".containerCard");
    const folderName = document.getElementById("foldername").value;
    const selectedRadio = document.querySelector('input[name="statusFolder"]:checked');
    const event = new Date().toISOString();
    let folderIdLocal = sessionStorage.getItem("IdFolder");

    if (folderName && selectedRadio) {
        const formData = {
            name: folderName,
            dateCreate: event,
            status: selectedRadio.value,
            parentFolder_Id: folderIdLocal,
            userId: 1 // Actualiza esto según sea necesario
        };

        fetch('http://localhost:5246/api/folder', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData),
        })
            .then(response => response.json())
            .then(data => {
                console.log(data.Message);
                if (data.StatusCode == 201) {
                    showAlert(data.Message, 'success');
                }

                if (data.StatusCode != 201) {
                    showAlert(data.Message, 'warning');
                }
                console.log(data);
                root.innerHTML = '';
                generateFileFolder();
            })
            .catch(error => {
                showAlert(data.Message, 'error');
                console.error('Error:', error);
            });
    }
    else if (!folderName && !selectedRadio) {
        showAlert('Folder name cannot be empty and status option', 'warning');
    }
    else if (!folderName) {
        showAlert('Folder name cannot be empty', 'warning');
    }
    else if (!selectedRadio) {
        showAlert('Please select a status option', 'warning');
    }
    else {
        showAlert('Please enter a folder name and select an option', 'warning');
    }
}


function initFolderUpdate() {
    const root = document.querySelector(".containerCard");
    const folderNameElement = document.querySelector(".foldername");
    const folderName = folderNameElement ? folderNameElement.value : '';
    const selectedRadio = document.querySelector('input[name="statusFolder"]:checked');
    const event = new Date().toISOString();
    let folderIdLocal = sessionStorage.getItem("ID");


    if (folderName && selectedRadio) {

        const formData = {
            Name: folderName.toString(),
            DateCreate: event,
            Status: selectedRadio.value,
            UserId: 1
        };

        fetch(`http://localhost:5246/api/folder/${folderIdLocal}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        })
            .then(response => response.json())
            .then(data => {
                console.dir(data);
                if (data.StatusCode == 200) {
                    showAlert(data.Message, 'success');
                    root.innerHTML = '';
                    generateFileFolder();
                }
                if (data.StatusCode == 409) {
                    showAlert(data.Message, 'warning');
                }
                console.dir(data);
            })
            .catch(error => {
                showAlert(`Folder update failed: ${error.message}`, 'error');
            });
    }
    else if (!folderIdLocal) {
        showAlert('No folder selected to update', 'warning');
    }
    else if (!folderName && !selectedRadio) {
        showAlert('Folder name cannot be empty and status option', 'warning');
    }
    else if (!folderName) {
        showAlert('Folder name cannot be empty', 'warning');
    }
    else if (!selectedRadio) {
        showAlert('Please select a status option', 'warning');
    }
    else {
        showAlert('Please enter a folder name and select an option', 'warning');
    }
}

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

    $('.alert').removeClass('success warning error').addClass(alertClass);
    $('.msg').text(message);
    $('.alert').addClass("show");
    $('.alert').removeClass("hide");
    $('.alert').addClass("showAlert");
    setTimeout(function () {
        $('.alert').removeClass("show");
        $('.alert').addClass("hide");
    }, 5000);
}

$('.close-btn').click(function () {
    $('.alert').removeClass("show");
    $('.alert').addClass("hide");
});


function validFileType(file) {
    const fileTypes = [
        // Imágenes
        "image/apng",
        "image/bmp",
        "image/gif",
        "image/jpeg",
        "image/pjpeg",
        "image/png",
        "image/svg+xml",
        "image/tiff",
        "image/webp",
        "image/x-icon",
        // Documentos
        "application/pdf",
        "application/msword", // .doc
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "application/vnd.ms-excel", // .xls
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-powerpoint", // .ppt
        "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
        "text/plain",
        "text/csv",
        "text/html",
        "application/rtf",
        // Audio
        "audio/midi",
        "audio/mpeg",
        "audio/webm",
        "audio/ogg",
        "audio/wav",
        "audio/aac",
        // Video
        "video/webm",
        "video/ogg",
        "video/mp4",
        "video/x-msvideo",
        // Otros
        "application/zip",
        "application/x-rar-compressed",
        "application/x-7z-compressed",
        "application/x-tar",
        "application/x-bzip",
        "application/x-bzip2",
        "application/java-archive", // .jar
    ];    

    return fileTypes.includes(file.type);
}

function returnFileSize(number) {
    if (number < 1024) {
        return { value: number, unit: 'bytes' };
    } else if (number >= 1024 && number < 1048576) {
        return { value: (number / 1024).toFixed(1), unit: 'KB' };
    } else if (number >= 1048576) {
        return { value: (number / 1048576).toFixed(1), unit: 'MB' };
    }
}

