document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById("loginForm");
    const errorMessage = document.getElementById("errorMessage");

    // Form fields
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // Error message styling
    const showError = (message) => {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";  // Display error message
    };

    // Hide error message
    const hideError = () => {
        errorMessage.textContent = "";
        errorMessage.style.display = "none";  // Hide error message
    };

    // Handle form submission
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Initialize valid flag
        let isValid = true;
        hideError();  // Hide any previous error messages

        // Validate Username
        if (!username) {
            usernameInput.style.border = '2px solid red';
            isValid = false;
        } else {
            usernameInput.style.border = '';
        }

        // Validate Password
        if (!password) {
            passwordInput.style.border = '2px solid red';
            isValid = false;
        } else {
            passwordInput.style.border = '';
        }

        // If inputs are valid, proceed with login request
        if (isValid) {
            try {
                const loginData = { username, password };

                const response = await fetch("/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(loginData)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    // Optionally redirect to another page if login is successful
                    window.location.href = "./intro/intro.html"; // Uncomment this line to redirect
                } else {
                    // Show the error message from backend if login failed
                    showError(result.message || "Login failed.");
                }
            } catch (error) {
                console.error("Error during login:", error);
                showError("An unexpected error occurred.");
            }
        } else {
            showError("Please fill in both username and password.");
        }
    });

    // Password visibility toggle
    let eyeicon = document.getElementById("eyeicon");

    eyeicon.onclick = function() {
        if (passwordInput.type === "password") {
            passwordInput.type = "text"; 
            eyeicon.src = "/pictures/showpass.png";
        } else {
            passwordInput.type = "password";
            eyeicon.src = "/pictures/Hidepass.png";
        }
    };

    // Show the eye icon when the password field is focused
    passwordInput.addEventListener("focus", () => {
        eyeicon.style.visibility = "visible";
    });

    // Hide the eye icon when the password field is blurred
    passwordInput.addEventListener("blur", () => {
        eyeicon.style.visibility = "hidden";
    });

    // Hide error message when user starts typing
    usernameInput.addEventListener("input", hideError);
    passwordInput.addEventListener("input", hideError);
});