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

function goBackToCategories() {
    window.location.href = 'displayFC.html';
}


document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM Content Loaded, fetching user details...");

    // Fetch user details (simulate with your real API logic)
    fetch('/api/user/profile')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const { username, id: userId } = data;
                console.log('Username:', username, 'User ID:', userId);
                window.userId = userId;  // Store userId globally
            }
        })
        .catch(error => {
            console.error('Error fetching user profile:', error);
        });

    // Retrieve categoryId from localStorage
    const categoryId = localStorage.getItem('categoryId');
    if (!categoryId) {
        alert("Category ID not found. Please select a category first.");
        return;
    }

    console.log("Retrieved categoryId from localStorage:", categoryId);

    const flashcardFormContent = document.getElementById('flashcard-form-content');
    let currentIndex = 0;

    // Get all flashcards
    const getAllFlashcards = () => flashcardFormContent.querySelectorAll('.flashcard-entry');

    // Show a specific flashcard based on index
    const showFlashcard = (index) => {
        const flashcards = getAllFlashcards();
        flashcards.forEach((card, i) => {
            card.style.display = i === index ? 'block' : 'none'; // Show the card at the given index
        });

        // Update the counter
        updateCounter(index, flashcards.length);
    };

    // Update the counter (current slide / total slides)
    const updateCounter = (currentIndex, totalFlashcards) => {
        const counterElement = document.getElementById('flashcard-counter');
        counterElement.textContent = `${currentIndex + 1}/${totalFlashcards}`;
    };

    // Add a new flashcard entry
    const addFlashcard = () => {
        const newFlashcardEntry = document.createElement('div');
        newFlashcardEntry.classList.add('flashcard-entry');
        newFlashcardEntry.innerHTML = `
            <input type="text" class="question" placeholder="Enter your question">
            <textarea class="answer" placeholder="Enter the answer"></textarea>
        `;
        flashcardFormContent.insertBefore(newFlashcardEntry, document.getElementById('form-navigation-buttons'));
        return newFlashcardEntry;
    };

    // Handle Previous button
    document.getElementById("prev-flashcard-btn").addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            showFlashcard(currentIndex);
        }
    });

    // Handle Next button
    document.getElementById("next-flashcard-btn").addEventListener("click", () => {
        const flashcards = getAllFlashcards();

        // If at the last flashcard, add a new one
        if (currentIndex === flashcards.length - 1) {
            addFlashcard();
        }

        // Move to the next flashcard
        currentIndex++;
        showFlashcard(currentIndex);
    });

    // Flashcard form submission
    flashcardFormContent.addEventListener("submit", function (event) {
        event.preventDefault();

        const flashcards = [];
        const questions = flashcardFormContent.querySelectorAll('.question');
        const answers = flashcardFormContent.querySelectorAll('.answer');

        // Collect and validate the flashcard data
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i].value.trim();
            const answer = answers[i].value.trim();

            // Skip empty flashcards
            if (!question && !answer) {
                continue;
            }

            // If either question or answer is empty, ask the user to complete it before submitting
            if (!question || !answer) {
                alert('Please fill in both question and answer for each flashcard.');
                return;
            }

            // Add the valid flashcard to the list
            flashcards.push({ categoryId, question, answer, userId: window.userId });
        }

        if (flashcards.length === 0) {
            alert('Redirecting...');
            return;
        }

        console.log("Flashcards to submit:", flashcards);

        // Submit flashcards to the backend
        fetch('http://localhost:3000/api/add-flashcards', { // Update with the correct backend URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ flashcards })
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text); });
                }
                return response.json();
            })
            .then(data => {
                console.log('Flashcards added successfully:', data);
                if (data.message) {
                    alert(data.message);
                }

                // Redirect after success
                window.location.href = 'displayFC.html';
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error: ' + error.message);
            });
    });

    // Show the first flashcard initially
    showFlashcard(currentIndex);
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
