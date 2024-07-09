async function createaccount() {
    const name = document.getElementById('nameNew').value;
    const userName = document.getElementById('usernameNew').value;
    const email = document.getElementById('emailNew').value;
    const password = document.getElementById('passwordNew').value;

    try {
        const response = await fetch('http://localhost:5246/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, userName, email, password })
        });

        const data = await response.json();
    
        if (data.StatusCode === 201) {
            const goodMessage = 'Account has been created successfully';
            document.getElementById('message').textContent = goodMessage;
            setTimeout(function () {
                document.getElementById('message').textContent = ''; // Limpiar mensaje después de 2 segundos
                window.location.href = 'login.html';
            }, 2000);
        } 
        else if (data.StatusCode === 400) {
            const errorMessage = 'All inputs are required';
            document.getElementById('message').textContent = errorMessage;
            setTimeout(function () {
                document.getElementById('message').textContent = ''; // Limpiar mensaje después de 2 segundos
            }, 2000);
        } 
        else if (data.Message === "Email is already in use") {
            const errorMessage = 'Email is already in use';
            document.getElementById('message').textContent = errorMessage;
            setTimeout(function () {
                document.getElementById('message').textContent = ''; 
                document.getElementById('emailNew').value = '';
            }, 2000);
        }
        else if (data.Message === "Username is already in use")
        {
            const errorMessage = 'Username is already in use';
            document.getElementById('message').textContent = errorMessage;
            setTimeout(function () {
                document.getElementById('message').textContent = ''; 
                document.getElementById('usernameNew').value = ''; 
            }, 2000);
        }
        
        else {
            const errorMessage = data.Message || 'Failed to create account';
            document.getElementById('error-message').textContent = errorMessage;
            console.error('Sing up error:', errorMessage);
        }

    } catch (error) {
        console.error('Sing up error:', error); // Imprime el objeto completo de error
        document.getElementById('error-message').textContent = 'Failed to connect to the server';
    }
};


