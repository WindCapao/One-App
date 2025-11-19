document.addEventListener("DOMContentLoaded", () => {
    const signUpForm = document.getElementById('signupform');
    const signUpButton = document.getElementById("submitBtn");
    const checkbox = document.getElementById("agreement");

    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value.trim();

        if (!username || !email || !password) {
            alert("Please fill in all fields");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();
            console.log("Response from backend:", data);

            if (response.ok && data.message === 'User registered successfully') {
                alert('Signup successful! Redirecting to login page...');
                window.location.href = "/sign%20in/login.html";  
            } else {
                alert(`Signup failed: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while signing up. Please try again.');
        }
    });

    signUpButton.disabled = true;

    checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
            signUpButton.disabled = false;
            signUpButton.style.background = "green";
        } else {
            signUpButton.disabled = true;
            signUpButton.style.background = "gray";
        }
    });
});



let eyeicon = document.getElementById("eyeicon");
let password = document.getElementById("password");

// Prevent the password input from losing focus when clicking the eye icon
eyeicon.addEventListener("mousedown", (event) => {
    event.preventDefault(); // Prevent default behavior that causes blur
});

// Toggle password visibility when clicking the eye icon
eyeicon.onclick = function () {
    if (password.type === "password") {
        password.type = "text";  // Show the password
        eyeicon.src = "/pictures/showpass.png";  // Change icon to 'show'
    } else {
        password.type = "password";  // Hide the password
        eyeicon.src = "/pictures/hidepass.png";  // Change icon to 'hide'
    }
};

// Show the eye icon when the password input is focused
password.addEventListener("focus", () => {
    eyeicon.style.opacity = "1";  // Make the icon visible
});

// Hide the eye icon when the password input loses focus
password.addEventListener("blur", () => {
    // Add a slight delay to allow the click event on the eye icon to process
    setTimeout(() => {
        if (document.activeElement !== password) { // Check if password field is still focused
            eyeicon.style.opacity = "0";  // Hide the icon
        }
    }, 100);
});
