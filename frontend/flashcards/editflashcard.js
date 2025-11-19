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
    const file = document.querySelector('#file');
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

    // Handle file upload for profile picture
    file.addEventListener('change', function () {
        const chosenFile = this.files[0];

        if (chosenFile) {
            const reader = new FileReader();
            reader.onload = function () {
                img.setAttribute('src', reader.result); // Display preview
            };
            reader.readAsDataURL(chosenFile);

            // Upload image to the server
            const formData = new FormData();
            formData.append('profile_pic', chosenFile);

            fetch('/upload-profile-pic', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            })
            .then(response => response.json())
            .then(data => {
                if (data.profilePicUrl) {
                    img.setAttribute('src', data.profilePicUrl); // Update profile picture
                    console.log('Profile picture uploaded successfully');
                } else {
                    console.error('Error uploading profile picture');
                    alert('Failed to upload profile picture. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error uploading profile picture:', error);
                alert('An error occurred while uploading the profile picture.');
            });
        }
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Fetch user details and initialize the script
    console.log("DOM Content Loaded, fetching user details...");
    fetchUserDetails();
    initializeScript();
});

function fetchUserDetails() {
    console.log("Fetching user details from /api/user/profile...");
    fetch('/api/user/profile')
        .then(response => response.json())
        .then(data => {
            console.log("API Response:", data);
            const user = data;
            if (user && user.username && user.id) {
                console.log("Username:", user.username, "User ID:", user.id);
                // Update profile info in the DOM (optional)
                document.getElementById('NAME').textContent = user.username;
                document.getElementById('id').textContent = user.id;
            } else {
                console.error("Invalid user data:", user);
                alert("Error: Invalid user data.");
            }
        })
        .catch(error => {
            console.error("Error fetching user details:", error);
            alert("Failed to fetch user details. Please try again later.");
        });
}

function initializeScript() {
    console.log("DOM Content Loaded, initializing script...");

    // Retrieve flashcardId and categoryId from localStorage
    const flashcardId = localStorage.getItem('flashcardId');
    const categoryId = localStorage.getItem('categoryId');
    
    console.log("Retrieved flashcardId from localStorage:", flashcardId);
    console.log("Retrieved categoryId from localStorage:", categoryId);

    // Check if flashcardId or categoryId are undefined or empty
    if (!flashcardId || !categoryId) {
        console.error("Error: Flashcard ID or Category ID is not set in localStorage.");
        alert("Invalid Flashcard ID or Category ID.");
        return;
    }

    // Fetch the flashcard details if both IDs are available
    fetchFlashcardDetails(categoryId, flashcardId);

    // Add event listener for the save button
    const saveButton = document.getElementById('save-flashcard-btn');
    if (saveButton) {
        saveButton.addEventListener('click', function(event) {
            event.preventDefault();
            saveFlashcard(flashcardId, categoryId);
        });
    } else {
        console.error("Error: Save button not found.");
    }
}

function fetchFlashcardDetails(categoryId, flashcardId) {
    // Construct the API endpoint URL
    const url = `/api/flashcards/${categoryId}/${flashcardId}`;
    console.log("Fetching flashcard details from:", url);

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText} (status code: ${response.status})`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Flashcard Details:", data);
            // Handle the flashcard data here (display it in the form)
            populateFlashcardForm(data);
        })
        .catch(error => {
            console.error("Error fetching flashcard:", error);
            alert("Failed to fetch flashcard details. Please try again later.");
        });
}

function populateFlashcardForm(data) {
    // Assuming data contains 'question' and 'answer' properties
    if (data && data.question && data.answer) {
        document.getElementById('flashcard-question').value = data.question;
        document.getElementById('flashcard-answer').value = data.answer;
        console.log("Flashcard form populated.");
    } else {
        console.error("Error: Flashcard data is incomplete.", data);
        alert("Failed to populate flashcard form. Missing question or answer.");
    }
}

function saveFlashcard(flashcardId, categoryId) {
    // Get updated data from the form
    const updatedQuestion = document.getElementById('flashcard-question').value;
    const updatedAnswer = document.getElementById('flashcard-answer').value;

    // Check if both fields are filled out
    if (!updatedQuestion || !updatedAnswer) {
        alert("Please fill in both the question and the answer.");
        return;
    }

    // Prepare data to send to the server
    const updatedFlashcard = {
        question: updatedQuestion,
        answer: updatedAnswer,
    };

    // Construct the API endpoint URL
    const url = `/api/flashcards/${categoryId}/${flashcardId}`;
    console.log("Saving flashcard data to:", url);

    // Send updated flashcard data to the server (PUT request to update the flashcard)
    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFlashcard),
    })
        .then(response => {
            console.log("Response Status:", response.status);
            return response.json();
        })
        .then(data => {
            console.log("Flashcard save response:", data);
            if (data.success) {
                alert("Flashcard updated successfully!");
            } else {
                console.error("Error in saving flashcard:", data.error);
                alert("Failed to save flashcard.");
            }
        })
        .catch(error => {
            console.error("Error saving flashcard:", error);
            alert("Failed to save flashcard. Please try again later.");
        });
}

document.addEventListener("DOMContentLoaded", function() {
    // Fetch user details and initialize the script
    console.log("DOM Content Loaded, fetching user details...");
    fetchUserDetails();
    initializeScript();
    // Add event listeners for the back buttons
    document.getElementById('back-btn').addEventListener('click', function() {
        window.location.href = 'displayfc.html';  // Navigate to displayfc.html
    });
    document.getElementById('back-to-categories-btn').addEventListener('click', function() {
        window.location.href = 'flashcards.html';  // Navigate to flashcards.html
    });
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
