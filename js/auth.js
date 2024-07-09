document.getElementById('login-btn').addEventListener('click', async function() {
    const emailElement = document.getElementById('email');
    const passwordElement = document.getElementById('password');
    const errorMessageElement = document.getElementById('error-message');

    if (!emailElement || !passwordElement || !errorMessageElement) {
        console.error('One or more required elements are missing from the DOM');
        return;
    }

    const email = emailElement.value;
    const password = passwordElement.value;

    try {
        const response = await fetch('http://drivenano.somee.com/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        console.log(response);
        if (data.StatusCode === 200) {
            // Login successful, handle token and redirect or update UI
            localStorage.setItem('token', data.Token);
            window.location.href = 'Index.html'; // Redirigir al dashboard después del inicio de sesión
            console.log('Login successful');
        } else {
            const errorMessage = data.Message || 'User or password incorrect';
            errorMessageElement.textContent = errorMessage;
            console.error('Login error:', errorMessage);
        }
    } catch (error) {
        console.error('Login error:', error); // Imprime el objeto completo de error
        errorMessageElement.textContent = 'Failed to connect to the server';
    }
});
