document.addEventListener("DOMContentLoaded", function() {
    const flashcardId = localStorage.getItem('flashcardId');
    const categoryId = localStorage.getItem('categoryId');
    const questionElement = document.getElementById('question');
    const answerElement = document.getElementById('answer');
    const backButton = document.getElementById('back-btn');
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const counterElement = document.getElementById('flashcard-counter');  // Counter element

    let flashcards = [];
    let currentFlashcardIndex = -1; // Default is -1, will be updated later

    if (!flashcardId || !categoryId) {
        console.error('Flashcard ID or Category ID is missing from localStorage!');
        return;
    }

    console.log('Flashcard ID:', flashcardId);
    console.log('Category ID:', categoryId);

    // Initially disable the buttons until flashcards are fetched
    prevButton.disabled = true;
    nextButton.disabled = true;

    // Fetch all flashcards for the category
    fetch(`/api/flashcards/${categoryId}`)
        .then(response => response.json())
        .then(data => {
            flashcards = data;
            console.log('Fetched flashcards:', flashcards);

            // Find the index of the current flashcard by its ID
            currentFlashcardIndex = flashcards.findIndex(fc => fc.id === parseInt(flashcardId));

            if (currentFlashcardIndex !== -1) {
                updateFlashcardDisplay(flashcards[currentFlashcardIndex]);

                // Enable buttons after fetching flashcards
                updateButtonState();
            } else {
                console.error('Flashcard not found!');
            }
        })
        .catch(error => {
            console.error('Error fetching flashcards:', error);
            alert('Error fetching flashcards. Please try again later.');
        });

    // Function to update the displayed flashcard
    function updateFlashcardDisplay(flashcard) {
        console.log('Updating display for flashcard:', flashcard.id); // Log to ensure it's being called
        questionElement.textContent = flashcard.question;
        answerElement.textContent = flashcard.answer;

        // Update the counter display (1-based index)
        counterElement.textContent = `${currentFlashcardIndex + 1}/${flashcards.length}`;
    }

    // Function to update the button state (enable/disable based on the index)
    function updateButtonState() {
        prevButton.disabled = currentFlashcardIndex <= 0; // Disable if it's the first card
        nextButton.disabled = currentFlashcardIndex >= flashcards.length - 1; // Disable if it's the last card
    }

    // Previous button click handler
    prevButton.addEventListener('click', function() {
        console.log('Previous button clicked! Current index:', currentFlashcardIndex);
        if (currentFlashcardIndex > 0) {
            currentFlashcardIndex--;  // Go to the previous flashcard
            console.log('Navigating to flashcard index:', currentFlashcardIndex);
            updateFlashcardDisplay(flashcards[currentFlashcardIndex]);
            updateButtonState(); // Update button state after changing the index
        }
    });

    // Next button click handler
    nextButton.addEventListener('click', function() {
        console.log('Next button clicked! Current index:', currentFlashcardIndex);
        if (currentFlashcardIndex < flashcards.length - 1) {
            currentFlashcardIndex++;  // Go to the next flashcard
            console.log('Navigating to flashcard index:', currentFlashcardIndex);
            updateFlashcardDisplay(flashcards[currentFlashcardIndex]);
            updateButtonState(); // Update button state after changing the index
        }
    });

    // Back button click handler
    backButton.addEventListener('click', function() {
        console.log('Back button clicked');
        window.location.href = 'displayFC.html'; // Redirect back to the flashcards list
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

document.addEventListener("DOMContentLoaded", function () {
    // Map of button IDs to the corresponding image to show
    const imageMap = {
        change: "../FLASHCARDS (UI)/Group 48.png",
        change1: "../FLASHCARDS (UI)/Group 49.png",
        change2: "../FLASHCARDS (UI)/Group 50.png",
        change3: "../FLASHCARDS (UI)/Group 51.png",
        change4: "../FLASHCARDS (UI)/Group 52.png",
    };

    // Reference to the image that needs to change
    const sampleImage = document.getElementById("sample3");

    // Add click event listeners to each button
    Object.keys(imageMap).forEach((buttonId) => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener("click", () => {
                // Update the 'src' of the sample image
                sampleImage.src = imageMap[buttonId];
            });
        }
    });
});

