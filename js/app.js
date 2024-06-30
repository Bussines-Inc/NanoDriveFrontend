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

    window.onclick = function (event) {
        closeDropdownOnClickOutside(event);
    };
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
    var root = document.querySelector(".containerCard");
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
        showAlert("Carpeta eliminada exitosamente", 'success');
    })
    .catch(error => {
        showAlert("Hubo un error al eliminar la carpeta. Por favor, intenta nuevamente.", 'error');
        console.error("Hubo un error al obtener los datos:", error);
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
        showAlert("Carpeta añadida a favoritos", 'success');
    })
    .catch(error => {
        showAlert("Hubo un error al añadir la carpeta a favoritos. Por favor, intenta nuevamente.", 'error');
        console.error("Hubo un error al obtener los datos:", error);
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
        showAlert(data.Message, 'success');
    })
    .catch(data => {
        showAlert(data.Message, 'error');
    });
}

function initFileUpload() {
    const fileInput = document.getElementById('file');
    const uploadBtn = document.getElementById('uploadBtn');

    uploadBtn.addEventListener('click', () => {
        const file = fileInput.files[0];

        if (file) {
            console.log(file);
            console.log(file.name);
            console.log(file.size);
            console.log(file.type);
            console.log('Your file description here');

            // fetch('http://localhost:5246/folder', {
            //     method: 'POST',
            //     body: formData,
            // })
            // .then(response => response.json())
            // .then(data => {
            //     showAlert('File uploaded successfully', 'success');
            // })
            // .catch(error => {
            //     showAlert('File upload failed', 'error');
            //     console.error('Error:', error);
            // });
        } else {
            showAlert('Please select a file to upload', 'warning');
        }
    });
}

function showAlert(message, type) {
    var alertClass = '';
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
