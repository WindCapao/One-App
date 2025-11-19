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
});

// DOM Elements
let startBtn = document.getElementById("start");
let stopBtn = document.getElementById("stop");
let resetBtn = document.getElementById("reset");
let reminderTimeInput = document.getElementById("reminder-time");
let reminderPopup = document.getElementById("reminder-popup");
let closePopupBtn = document.getElementById("close-popup");
let currentTimeDisplay = document.getElementById("current-time");
let setReminderBtn = document.getElementById("set-reminder");
let reminderMsg = document.getElementById("reminder-msg");

// Stopwatch Variables
let hour = 0;
let minute = 0;
let second = 0;
let count = 0;

let timer = false;
let stopwatchInterval;

// Reminder Variables
let reminderTime = localStorage.getItem("reminderTime") || null; // Retrieve reminder time from localStorage
const reminderSound = new Audio("../sounds/reminder-sound.wav");

// Fetch saved start time from localStorage and update in real-time
window.onload = function () {
    const savedData = localStorage.getItem("stopwatchData");
    if (savedData) {
        const data = JSON.parse(savedData);
        const now = new Date();
        const elapsedTime = Math.floor((now - new Date(data.startTime)) / 10); // Milliseconds to 10ms units

        // Convert elapsed time to hours, minutes, seconds, and counts
        hour = Math.floor(elapsedTime / 360000);
        minute = Math.floor((elapsedTime % 360000) / 6000);
        second = Math.floor((elapsedTime % 6000) / 100);
        count = elapsedTime % 100;

        updateDisplay();
        timer = true; // Continue the timer if the start time exists
        startStopwatch();
    }

    // If there's a reminder time, show the reminder message
    if (reminderTime) {
        reminderMsg.textContent = `Reminder set for ${reminderTime}.`;
        reminderMsg.style.color = "green";
        reminderMsg.style.display = "block";
    }
};

// Start the stopwatch
startBtn.addEventListener("click", function () {
    if (!timer) {
        timer = true;

        if (!stopwatchInterval) {
            const now = new Date().toISOString();

            // Save the start time in localStorage
            localStorage.setItem("stopwatchData", JSON.stringify({ startTime: now }));
        }

        startStopwatch();
    }
});

// Stop the stopwatch
stopBtn.addEventListener("click", function () {
    timer = false;
    stopStopwatch();

    // Remove the saved start time from localStorage when stopwatch is stopped
    localStorage.removeItem("stopwatchData");
});

// Reset the stopwatch
resetBtn.addEventListener("click", function () {
    timer = false;
    stopStopwatch();

    hour = 0;
    minute = 0;
    second = 0;
    count = 0;
    updateDisplay();

    // Clear the saved stopwatch data from localStorage
    localStorage.removeItem("stopwatchData");
});

// Start the stopwatch logic
function startStopwatch() {
    if (!stopwatchInterval) {
        stopwatchInterval = setInterval(() => {
            if (timer) {
                count++;

                if (count === 100) {
                    second++;
                    count = 0;
                }

                if (second === 60) {
                    minute++;
                    second = 0;
                }

                if (minute === 60) {
                    hour++;
                    minute = 0;
                }

                updateDisplay();
            }
        }, 10);
    }
}

// Stop the stopwatch logic
function stopStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
}

// Update the stopwatch display
function updateDisplay() {
    document.getElementById("hr").innerText = pad(hour);
    document.getElementById("min").innerText = pad(minute);
    document.getElementById("sec").innerText = pad(second);
}

// Add leading zero if number < 10
function pad(num) {
    return num < 10 ? "0" + num : num;
}

// Display current time and update every second
function updateCurrentTime() {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString("en-US", { hour12: false }).slice(0, 5); // HH:mm format
    currentTimeDisplay.textContent = formattedTime;

    // Check if current time matches reminder time
    checkReminder(formattedTime);
}

// Set reminder logic
setReminderBtn.addEventListener("click", function () {
    const selectedTime = reminderTimeInput.value;
    if (selectedTime) {
        reminderTime = selectedTime;
        reminderMsg.textContent = `Reminder set for ${selectedTime}.`;
        reminderMsg.style.color = "green";
        reminderMsg.style.display = "block"; // Show the reminder message

        // Save reminder time to localStorage
        localStorage.setItem("reminderTime", selectedTime);
    } else {
        reminderMsg.textContent = "Please select a valid time.";
        reminderMsg.style.color = "red";
        reminderMsg.style.display = "block"; // Show the reminder message
    }
});

// Check if the current time matches the reminder time
function checkReminder(currentTime) {
    if (reminderTime && currentTime === reminderTime) {
        triggerReminder();
        reminderTime = null; // Clear reminder to prevent repeated triggers
        reminderMsg.textContent = ""; // Clear the reminder message
        reminderMsg.style.display = "none"; // Hide the reminder message after trigger

        // Remove the reminder time from localStorage
        localStorage.removeItem("reminderTime");
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
