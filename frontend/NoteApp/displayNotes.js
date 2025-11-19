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

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM Content Loaded, fetching user details...");
    fetchUserDetails();

    function fetchUserDetails() {
        fetch("/api/user/profile")
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                console.log("User details fetched:", data);
                if (data.success && data.id) {
                    const user_id = data.id;
                    sessionStorage.setItem("user_id", user_id);
                    loadNotes(user_id); // Pass user_id to load notes

                    // Display username
                    document.getElementById("NAME").textContent = data.username;
                } else {
                    console.error("Failed to fetch user details:", data.message);
                }
            })
            .catch(error => {
                console.error("Error fetching user details:", error);
            });
    }

    function loadNotes(user_id) {
        console.log("Loading notes for User ID:", user_id);

        if (!user_id) {
            console.error("User ID is missing. Cannot load notes.");
            return;
        }

        fetch(`/api/notes/getNotes/${user_id}`)  // Ensure the correct URL here
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                console.log("Notes fetched:", data);

                const mainContainer = document.getElementById("main");
                mainContainer.innerHTML = ''; // Clear existing notes

                if (data.success && data.notes.length > 0) {
                    data.notes.forEach(note => {
                        addNote(note.title, note.note_id, note.created_at);
                    });
                    displayNoNotesMessage(false);
                } else {
                    displayNoNotesMessage(true);
                }
            })
            .catch(error => {
                console.error("Error loading notes:", error);
                displayNoNotesMessage(true);
            });
    }

    function addNote(title = "", noteId = "", createdAt = "") {
        const note = document.createElement("div");
        note.classList.add("note");
        note.dataset.id = noteId;
    
        note.innerHTML = `
            <div class="icons">
                <i class="trash fas fa-trash" style="color:yellow"></i>
            </div>
            <div class="title-div">
                <textarea class="title" placeholder="Write the title ..." disabled>${title}</textarea>
            </div>
            <div class="created-at">
                <span>${formatDateTime(createdAt)}</span>
            </div>
        `;
    
        // Adjust styles in JS for title and content spacing
        const titleDiv = note.querySelector(".title-div");
        titleDiv.style.marginBottom = "1px"; // Reduce space between title and content 
        titleDiv.style.left = "-10px"; // Reduce space between title and content 
    
        const createdAtDiv = note.querySelector(".created-at");
        createdAtDiv.style.marginTop = "2px";  // Reduce space between title and date
        createdAtDiv.style.fontSize = "12px"; // Optional: Make the date smaller
        createdAtDiv.style.color = "#888";    // Optional: Lighter color for the date
        createdAtDiv.style.textAlign = "left"; // Align the date to the left
        createdAtDiv.style.position = "relative"; // Make it relative to allow 'left' property to work
        createdAtDiv.style.left = "20px"; // Align the date closer to the left
    
        const titleTextArea = note.querySelector(".title");
        titleTextArea.style.padding = "1px"; // Adjust padding inside the title textarea
    
        // Add event listeners
        note.addEventListener("click", () => handleNoteClick(noteId));
        note.querySelector(".trash").addEventListener("click", (event) => {
            event.stopPropagation(); // Prevent parent click event
            deleteNote(noteId);
        });
    
        // Append the note to the main container
        document.getElementById("main").appendChild(note);
    
        // Apply CSS Grid for layout of notes
        const mainContainer = document.getElementById("main");
        mainContainer.style.display = "grid";
        mainContainer.style.gridTemplateColumns = "repeat(4, 1fr)";  // 4 notes per row
        mainContainer.style.gap = "10px";  // Gap between notes
        mainContainer.style.marginTop = "50px"; // Add top margin to the grid container for spacing
    }
        
    function handleNoteClick(noteId) {
        console.log("Note clicked:", noteId);
        
        // Store the note ID in localStorage (or sessionStorage)
        try {
            localStorage.setItem("noteId", noteId);
            const storedNoteId = localStorage.getItem("noteId");
            if (storedNoteId === noteId) {
                console.log("Note ID stored successfully in localStorage:", storedNoteId);
            } else {
                console.error("Failed to store Note ID in localStorage.");
            }
        } catch (error) {
            console.error("Error while storing Note ID in localStorage:", error);
        }

        // Redirect the user to the editNotes.html page
        window.location.href = 'editNotes.html';
    }

    function deleteNote(noteId) {
        console.log("Deleting note with ID:", noteId);
        const user_id = sessionStorage.getItem("user_id");

        fetch(`/api/notes/deleteNote/${noteId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id }),
        })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                console.log("Delete response:", data);
                if (data.success) {
                    document.querySelector(`.note[data-id='${noteId}']`).remove();
                } else {
                    console.error("Error deleting note:", data.message);
                }
                window.location.href = 'displayNotes.html';
            })
            .catch(error => {
                console.error("Error deleting note:", error);
            });
    }

    function displayNoNotesMessage(show) {
        const noNotesMessage = document.querySelector(".no-notes-message");
        if (noNotesMessage) {
            noNotesMessage.style.display = show ? 'block' : 'none';
        }
    }

    function formatDateTime(dateString) {
        const date = new Date(dateString);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const formattedDate = `${('0' + (date.getMonth() + 1)).slice(-2)}/${
            ('0' + date.getDate()).slice(-2)
        }/${date.getFullYear()}`;

        return `${formattedHours}:${formattedMinutes} ${ampm}, ${formattedDate}`;
    }

    // Event listener for Add Note button
    const addBtn = document.querySelector("#addBtn");
    addBtn.addEventListener("click", function () {
        window.location.href = 'noteapp.html';
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
