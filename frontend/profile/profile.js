document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded, fetching user details...");

    // Sidebar functionality
    const sidebar = document.querySelector('.sidebar');
    const navLinks = document.querySelectorAll('.sidebar nav a');
    const currentPath = window.location.pathname;

    // Highlight active link based on the current URL
    navLinks.forEach(link => {
        if (currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });

    // Toggle sidebar button - added dynamically
    const toggleButton = document.createElement('button');
    toggleButton.textContent = "☰";
    toggleButton.classList.add('toggle-sidebar');
    sidebar.parentNode.insertBefore(toggleButton, sidebar);

    // Sidebar toggle event for both the button and the existing toggle button
    toggleButton.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    const toggleBtn = document.getElementById("toggle-btn");
    toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });

    // Profile picture handling
    const imgDiv = document.querySelector('.profile-pic-div');
    const img = document.querySelector('#photo');
    const uploadBtn = document.querySelector('#uploadBtn');

    // Show/hide upload button on hover
    imgDiv.addEventListener('mouseenter', () => {
        uploadBtn.style.display = 'block';
    });

    imgDiv.addEventListener('mouseleave', () => {
        uploadBtn.style.display = 'none';
    });

    // Fetch user details function
    function fetchUserDetails() {
        console.log("Fetching user details from /api/user/profile...");
        fetch('/api/user/profile', {
            method: 'GET',
            credentials: 'include',  // Ensure the credentials (cookies or session) are sent with the request
        })
        .then(response => {
            console.log('Response Status:', response.status);  // Log the response status
            if (!response.ok) {
                throw new Error('Error fetching user details');
            }
            return response.json();
        })
        .then(data => {
            console.log('API Response:', data);  // Log the response data

            // Update the profile picture
            const profilePicUrl = data.profilePicUrl || '/images/default-profile-pic.jpg';
            img.setAttribute('src', profilePicUrl);

            // If no username or id is found, set a fallback message
            const username = data.username || 'Guest'; // Check if username is available in the response
            const userId = data.id || 'N/A'; // Check if userId is available in the response

            console.log(`Username: ${username}, User ID: ${userId}`);

            // Display the username and ID in the HTML
            const nameElement = document.getElementById('NAME');
            const idElement = document.getElementById('id');

            if (nameElement) {
                nameElement.textContent = `${username}`;
            } else {
                console.error('Element with id "NAME" not found.');
            }

            if (idElement) {
                idElement.textContent = `ID: ${userId}`;
            } else {
                console.error('Element with id "id" not found.');
            }
        })
        .catch(error => {
            console.error('Error fetching user details:', error);
            const nameElement = document.getElementById('NAME');
            const idElement = document.getElementById('id');

            if (nameElement) {
                nameElement.textContent = 'Username: Not available';
            }

            if (idElement) {
                idElement.textContent = 'ID: Not available';
            }

            // Set a default profile picture if an error occurs
            img.setAttribute('src', '/images/default-profile-pic.jpg');
        });
    }

    // Initialize user details
    fetchUserDetails();

    // Logout functionality
    const logoutButton = document.getElementById('logout-btn');
    logoutButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                alert('You have successfully logged out.');
                window.location.href = '/sign%20in/login.html'; // Redirect to login page
            } else {
                alert('Failed to log out. Please try again.');
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('An error occurred during logout. Please try again later.');
        }
    });

    // Reminder Variables
    let reminderTime = localStorage.getItem("reminderTime") || null;
    let reminderPopup = document.getElementById("reminder-popup");
    let closePopupBtn = document.getElementById("close-popup");

    // Audio for reminder sound
    const reminderSound = new Audio("../sounds/reminder-sound.wav");

    // Update current time every second and check reminder
    function updateCurrentTime() {
        const now = new Date();
        const formattedTime = now.toLocaleTimeString("en-US", { hour12: false }).slice(0, 5); // HH:mm format
        checkReminder(formattedTime);
    }

    // Check if the current time matches the reminder time
    function checkReminder(currentTime) {
        if (reminderTime && currentTime === reminderTime) {
            triggerReminder();
            reminderTime = null; // Clear reminder to prevent repeated triggers
            localStorage.removeItem("reminderTime"); // Remove the reminder time from localStorage
        }
    }

    // Trigger the reminder popup and sound
    function triggerReminder() {
        reminderPopup.style.display = "block";

        // Play the reminder sound
        try {
            reminderSound.play().then(() => {
                console.log("Reminder sound played successfully.");
            }).catch((error) => {
                console.error("Error playing sound:", error);
            });
        } catch (error) {
            console.error("Sound play error:", error);
        }

        // Show browser notification (if permission granted)
        if (Notification.permission === "granted") {
            new Notification("Reminder", {
                body: "Your reminder is now triggered!",
                icon: "https://www.example.com/notification-icon.png", // Optional, replace with your custom icon
            });
        }
    }

    // Close the reminder popup
    closePopupBtn.addEventListener("click", function () {
        reminderPopup.style.display = "none"; // Hide the modal

        // Stop the reminder sound
        reminderSound.pause(); // Pause the audio
        reminderSound.currentTime = 0; // Reset playback position to the start
    });

    // Start the clock and check reminder every second
    setInterval(updateCurrentTime, 1000);

    // Request notification permission if not granted
    if (Notification.permission !== "granted") {
        Notification.requestPermission().then(function (permission) {
            console.log("Notification permission:", permission);
        });
    }

    // Check for reminder on page load
    window.onload = function () {
        if (reminderTime) {
            // Wait for the matching time, don't trigger reminder on page load
        }
    };
});

// Select DOM elements
const imgDiv = document.querySelector('.profile');
const img = document.querySelector('#pic');
const fileInput = document.querySelector('#file');
const uploadBtn = document.querySelector('#upload');

// Show upload button on mouse enter
imgDiv.addEventListener('mouseenter', () => {
    uploadBtn.style.display = "block";
});

// Hide upload button on mouse leave
imgDiv.addEventListener('mouseleave', () => {
    uploadBtn.style.display = "none";
});

// Default profile picture path
const defaultProfilePic = '/images/default-profile-pic.png'; // Ensure correct path

// Function to fetch and display the user's profile picture
const fetchProfilePic = async () => {
    try {
        // Check if a profile picture URL is stored in localStorage
        const storedProfilePic = localStorage.getItem('profilePicUrl');
        if (storedProfilePic) {
            img.setAttribute('src', storedProfilePic);
            img.setAttribute('alt', 'User Profile Picture');
            return;
        }

        const response = await fetch('/api/user/profile', {
            method: 'GET',
            credentials: 'include', // Include session cookies
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile picture');
        }

        const data = await response.json();
        if (data.success && data.profilePicUrl) {
            // Store the profile picture URL in localStorage
            localStorage.setItem('profilePicUrl', data.profilePicUrl);
            img.setAttribute('src', data.profilePicUrl);
            img.setAttribute('alt', 'User Profile Picture');
        } else {
            console.error('Profile picture data not found, using default image');
            img.setAttribute('src', defaultProfilePic); // Updated default path
            img.setAttribute('alt', 'Default Profile Picture');
        }
    } catch (error) {
        console.error('Error fetching profile picture:', error);
        img.setAttribute('src', defaultProfilePic); // Updated default path
        img.setAttribute('alt', 'Default Profile Picture');
    }
};

// Call the function on page load
window.addEventListener('DOMContentLoaded', fetchProfilePic);

// Handle file input change (file selection)
fileInput.addEventListener('change', () => {
    const selectedFile = fileInput.files[0];

    if (selectedFile) {
        const reader = new FileReader();

        reader.onload = () => {
            const previewSrc = reader.result;
            img.setAttribute('src', previewSrc); // Show preview image immediately
            img.setAttribute('alt', 'Preview Profile Picture');

            // Create FormData for the upload
            const formData = new FormData();
            formData.append('profile_pic', selectedFile);

            // Upload the image to the server
            uploadProfilePic(formData, previewSrc);
        };
        reader.readAsDataURL(selectedFile);
    }
});

// Function to upload the profile picture to the server
const uploadProfilePic = async (formData, previewSrc) => {
    try {
        const response = await fetch('/upload-profile-pic', {
            method: 'POST',
            body: formData,
            credentials: 'include', // Include session cookies
        });

        const data = await response.json();
        if (data.success && data.profilePicUrl) {
            console.log('Profile picture uploaded successfully');
            // Store the updated profile picture URL in localStorage
            localStorage.setItem('profilePicUrl', data.profilePicUrl);
            img.setAttribute('src', data.profilePicUrl); // Update with server response
            img.setAttribute('alt', 'Updated Profile Picture');
            // Optionally, redirect to the profile page after upload
            window.location.href = 'profile.html';
        } else {
            console.error('Error uploading profile picture:', data.message || 'Unknown error');
            alert('Error uploading profile picture');
            img.setAttribute('src', previewSrc); // Retain preview if upload failed
            img.setAttribute('alt', 'Preview Profile Picture');
        }
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        alert('Error uploading profile picture');
        img.setAttribute('src', previewSrc); // Retain preview if an error occurs
        img.setAttribute('alt', 'Preview Profile Picture');
    }
};

const fetchUserProfile = async () => {
    try {
        const response = await fetch('/api/profile/details', {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user profile: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response:', data); // Log the response to check the structure

        if (data.success && data.user) {
            const userName = data.user.name || 'Unknown';
            const userId = data.user.id || 'N/A';

            // Set the name and ID
            const nameElement = document.getElementById('0');
            nameElement.textContent = userName;

            // Dynamically adjust the CSS styles of the name element to make it center-aligned
            nameElement.style.textAlign = 'center'; // Center-align the name
            nameElement.style.marginLeft = '-70px';      // Reset any previous margin if needed
            nameElement.style.paddingLeft = '0';     // No padding
            nameElement.style.fontSize = '30px';     // Adjust font size (optional)

            document.getElementById('main-id').textContent = `ID: ${userId}`;

            // Set the profile picture from the localStorage or default
            const storedProfilePic = localStorage.getItem('profilePicUrl');
            img.src = storedProfilePic || data.user.profilePic || defaultProfilePic;
            img.alt = storedProfilePic ? 'User Profile Picture' : (data.user.profilePic ? 'User Profile Picture' : 'Default Profile Picture');

            // Populate other user details
            document.getElementById('1').textContent = `School: ${data.user.school || 'N/A'}`;
            document.getElementById('2').textContent = `Email: ${data.user.email || 'N/A'}`;
            document.getElementById('3').textContent = `Contact: ${data.user.contact || 'N/A'}`;
        } else {
            throw new Error(data.message || 'Invalid response structure');
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        alert('Error fetching user profile.');
        img.src = defaultProfilePic; // Updated default path
        img.alt = 'Default Profile Picture';
    }
};

// Fetch user profile on page load
document.addEventListener('DOMContentLoaded', fetchUserProfile);
