document.getElementById('login-btn').addEventListener('click', async function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5246/login', {
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
        }
        else if (data.Message === 'Email or Password must not be empty')
            {
                const errorMessage = data.Message || 'Email or Password must not be empty';
                document.getElementById('error-message').textContent = errorMessage;
            } 
        else {
            const errorMessage = data.Message || 'User or password incorrect';
            document.getElementById('error-message').textContent = errorMessage;
            console.error('Login error:', errorMessage);
        }
    } catch (error) {
        console.error('Login error:', error); // Imprime el objeto completo de error
        document.getElementById('error-message').textContent = 'Failed to connect to the server';
    }
});



