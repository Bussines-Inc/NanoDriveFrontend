document.addEventListener("DOMContentLoaded", () => {
    initMode();
    initEventListeners();
    generateFolder();
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

function generateFolder() {
    const root = document.querySelector(".containerCard");

    fetch(`http://localhost:5246/api/folders?pageNumber=${1}&pageSize=${20}`)
        .then(response => response.json())
        .then(data => {
            data.Folders.forEach(element => {
                createFolderCard(element, root);
            });
        })
        .catch(error => {
            console.error("Hubo un error al obtener los datos:", error);
        });
}

function createFolderCard(element, root) {
    var div = document.createElement('div');
    div.className = 'col';
    div.id = `folder-${element.Id}`;
    div.innerHTML = `
        <div class="card rounded-4 h-100">
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
                <p class="card-footerText ps-2">0T</p>
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
        sessionStorage.setItem("ID", element.Id)
    });
    // Eventos para los botones (ejemplo: eliminar, favoritos, privado)
    div.querySelector('.iconCardTrash').addEventListener('click', () => {
        deleteFolder(element.Id);
    });

    div.querySelector('.iconCardStar').addEventListener('click', () => {
        addFavourites(element.Id);
    });

    div.querySelector('.iconCardLock').addEventListener('click', () => {
        addPrivate(element.Id);
    });

    root.appendChild(div);
}


function deleteFolder(folderId) {
    fetch(`http://localhost:5246/api/folder/${folderId}/delete`, {
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
        showAlert('Error deleting folder', 'error');
        console.error('Error:', error);
    });
}

function addFavourites(folderId) {
    fetch(`http://localhost:5246/api/folder/${folderId}/favourite`, {
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

function addPrivate(folderId) {
    fetch(`http://localhost:5246/api/folder/${folderId}/private`, {
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

function initFileUpload() {
    const root = document.querySelector(".containerCard");
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];
    const selectedRadio = document.querySelector('input[name="statusFolder"]:checked');

    if (file && selectedRadio) {
        const formData = {
            name: file.name,
            type: file.type,
            size: file.size.toString(),
            status: selectedRadio.value,
            folderId: 154 // Update this as needed
        };

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
            root.innerHTML = ' ';
            generateFolder();
        })
        .catch(error => {
            showAlert('File upload failed', 'error');
            console.error('Error:', error);
        });
    } else {
        showAlert('Please select a file to upload and an option', 'warning');
    }
}

function initFolderUpload() {
    const root = document.querySelector(".containerCard");
    const folderName = document.getElementById("foldername").value;
    const selectedRadio = document.querySelector('input[name="statusFolder"]:checked');
    const event = new Date().toISOString();

    if (folderName && selectedRadio) {
        const formData = {
            name: folderName,
            dateCreate: event,
            status: selectedRadio.value,
            // parentFolder_Id: 68,
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
            showAlert(data.Message, 'success');
            console.log(data);
            root.innerHTML = '';
            generateFolder();
        })
        .catch(error => {
            showAlert(data.Message, 'error');
            console.error('Error:', error);
        });
    } else {
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

    if (!folderName) {
        showAlert('Please enter a folder name', 'warning');
        return;
    }

    if (!selectedRadio) {
        showAlert('Please select a folder status', 'warning');
        return;
    }

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
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.Name.join(', '));
            });
        }
        return response.json();
    })
    .then(data => {
        showAlert(data.Message, 'success');
        console.dir(data);
        root.innerHTML = '';
        generateFolder();
    })
    .catch(error => {
        showAlert(`Folder update failed: ${error.message}`, 'error');
    });
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
