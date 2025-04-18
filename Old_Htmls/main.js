// Simulate user data storage
const users = [];

// Login functionality
function handleLogin(event) {
    event.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        alert("Login successful!");
        window.location.href = "new1.html"; // redirect to main dashboard
    } else {
        alert("Invalid email or password.");
    }
}

// Registration functionality
function handleRegister(event) {
    event.preventDefault();
    const firstName = document.querySelector('#first-name').value;
    const lastName = document.querySelector('#last-name').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    const confirmPassword = document.querySelector('#confirm-password').value;
    const termsChecked = document.querySelector('#terms').checked;

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    if (!termsChecked) {
        alert("You must agree to the terms.");
        return;
    }

    const newUser = { firstName, lastName, email, password };
    users.push(newUser);
    alert("Registration successful! Please log in.");
    window.location.href = "login.html";
}

// Attach handlers to forms
document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector('.login-form')) {
        document.querySelector('.login-form').addEventListener('submit', handleLogin);
    }
    if (document.querySelector('.register-form')) {
        document.querySelector('.register-form').addEventListener('submit', handleRegister);
    }
});
