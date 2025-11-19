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
    const addFlashcardBtn = document.getElementById('add-flashcard-btn');
    const backBtn = document.getElementById('back-btn');
    const flashcardsList = document.getElementById('flashcards-list');
    const noFlashcardsMessage = document.getElementById('no-flashcards-message');
    const flashcardCountDisplay = document.getElementById('flashcard-count'); // The element where the count will be displayed

    // Get the categoryId from localStorage
    const categoryId = localStorage.getItem('categoryId');
    console.log('Retrieved categoryId from localStorage:', categoryId);

    if (!categoryId) {
        console.error('No category ID found in localStorage!');
        return;
    }
    
    // Fetch flashcards for the selected category
    fetch(`/api/flashcards/${categoryId}`)
        .then(response => response.json())
        .then(flashcards => {
            console.log('Fetched flashcards:', flashcards);
    
            let flashcardCount = 0;
    
            // Handle case if no flashcards
            if (flashcards.length === 0) {
                noFlashcardsMessage.style.display = 'block'; // Show "No flashcards" message
            } else {
                noFlashcardsMessage.style.display = 'none'; // Hide "No flashcards" message
    
                // Loop through the flashcards and append them to the list
                flashcards.forEach(flashcard => {
                    console.log('Flashcard:', flashcard);  // Log each flashcard to debug
    
                    // Increment the count for each flashcard
                    flashcardCount++;
    
// Assuming you have a container element for the flashcards with the id 'flashcards-list' (or any other name you use)
const flashcardsList = document.getElementById('flashcards-list');

// Set the container to use grid layout (This can also be done via CSS, but we can do it in JS if needed)
flashcardsList.style.display = 'grid'; // Use grid layout
flashcardsList.style.gridTemplateColumns = 'repeat(4, 1fr)'; // Create 4 columns per row
flashcardsList.style.gap = '20px'; // Space between flashcards

// Create the flashcard element
const flashcardElement = document.createElement('div');
flashcardElement.classList.add('flashcard-item');
flashcardElement.innerHTML = `
    <div class="flashcard-question">
        <span class="question-text">Q: ${flashcard.question}</span>
        <div class="flashcard-buttons">
            <!-- Edit Button -->
            <button class="edit-icon" data-flashcard-id="${flashcard.id}">
                <img src="images/edit.png" alt="Edit" style="width: 20px; height: 20px;" />
            </button>
            <!-- Delete Button -->
            <button class="delete-icon" data-flashcard-id="${flashcard.id}">
                <img src="images/delete.png" alt="Delete" style="width: 20px; height: 20px;" />
            </button>
        </div>
    </div>
    <div class="flashcard-answer">
        A: <span class="answer-text">${flashcard.answer}</span>
    </div>
`;

// Apply styles to the question and answer text directly in JS
const questionText = flashcardElement.querySelector('.question-text');
questionText.style.fontSize = '24px'; // Increase font size
questionText.style.fontWeight = 'bold'; // Make the question bold
questionText.style.marginBottom = '8px'; // Add space below the question

const answerText = flashcardElement.querySelector('.flashcard-answer');
answerText.style.marginTop = '12px'; // Add space between question and answer

// Set fixed height and width for flashcard element
flashcardElement.style.maxHeight = '150px'; // Set a maximum height
flashcardElement.style.overflow = 'hidden'; // Hide overflow if content exceeds max height
flashcardElement.style.width = '250px'; // Set a fixed width for the flashcard container

// Add margin-top to push the flashcards down (only if you need extra space)
flashcardElement.style.marginTop = '60px'; // Adjust this value if needed

// Append the flashcard to the list
flashcardsList.appendChild(flashcardElement);

                    // Add click event listener to make the flashcard clickable and redirect
                    flashcardElement.addEventListener('click', (event) => {
                        event.stopPropagation(); // Prevent any unintended propagation
                        const flashcardId = flashcard.id; // Get flashcard ID
                        console.log('Redirecting to flip flashcard for ID:', flashcardId);
    
                        if (flashcardId) {
                            localStorage.setItem('flashcardId', flashcardId);  // Store flashcardId in localStorage
                            window.location.href = 'flipFC.html';  // Redirect to flipFC.html
                        } else {
                            console.error('Flashcard ID is missing!');
                        }
                    });
    
                    // Add click event listener to the Edit image
                    const editButton = flashcardElement.querySelector('.edit-icon');
                    editButton.addEventListener('click', (event) => {
                        event.stopPropagation(); // Prevent flashcard click from triggering
                        const flashcardId = flashcard.id; // Get flashcard ID
                        console.log('Editing Flashcard ID:', flashcardId);  // Debugging log
                        if (flashcardId) {
                            localStorage.setItem('flashcardId', flashcardId);  // Store flashcardId in localStorage
                            window.location.href = 'editflashcard.html';  // Redirect to editflashcard.html
                        } else {
                            console.error('Flashcard ID is missing!');
                        }
                    });
    
                    // Add click event listener to the Delete image
                    const deleteButton = flashcardElement.querySelector('.delete-icon');
                    deleteButton.addEventListener('click', (event) => {
                        event.stopPropagation(); // Prevent flashcard click from triggering
                        const flashcardId = flashcard.id; // Get flashcard ID
                        console.log('Deleting Flashcard ID:', flashcardId);  // Debugging log
                        if (flashcardId) {
                            // Make an API request to delete the flashcard
                            fetch(`/api/flashcards/delete/${flashcardId}`, {
                                method: 'DELETE',
                            })
                                .then(response => response.json())
                                .then(data => {
                                    console.log('Flashcard deleted:', data);
                                    flashcardElement.remove();  // Remove the flashcard from the UI
                                })
                                .catch(error => {
                                    console.error('Error deleting flashcard:', error);
                                });
                        } else {
                            console.error('Flashcard ID is missing!');
                        }
                    });
                });
            }
    
            // Store the final flashcard count in localStorage for the specific category
            localStorage.setItem(`flashcardCount_${categoryId}`, flashcardCount);
            console.log(`Flashcard count for category ${categoryId} stored in localStorage:`, flashcardCount);
    
            // Display the flashcard count in the provided element
            if (flashcardCountDisplay) {
                flashcardCountDisplay.textContent = `Flashcards: ${flashcardCount || 0}`;
            }
        })
        .catch(error => {
            console.error('Error fetching flashcards:', error);
            flashcardsList.innerHTML = '<p>Error fetching flashcards. Please try again later.</p>';
        });
    
    // Add click event listener to make the flashcard clickable and redirect
    addFlashcardBtn.addEventListener('click', function() {
        console.log('Add Flashcard button clicked');
        localStorage.setItem('categoryId', categoryId);
        window.location.href = 'addflashcard.html';
    });
    
    // Handle "Back" button click
    backBtn.addEventListener('click', function() {
        console.log('Back button clicked');
        window.location.href = 'flashcards.html';
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
