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
    // Function to save or update notes
    function saveNotes(noteData) {
        console.log("Saving note with data:", noteData);

        let url = '/api/notes/saveNotes';
        let method = 'POST';

        // If the note has an ID, it's an update, so use PUT
        if (noteData.noteId) {
            url = `/api/notes/editNote/${noteData.noteId}`;
            method = 'PUT';
        }

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteData),
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                console.log(result.message);
                // Just reload the page after saving the note
                window.location.reload();
            } else {
                console.error("Save failed:", result.message);
                alert(result.message);
            }
        })
        .catch(error => {
            console.error("Error saving note:", error);
        });
    }

// Add or update note function (only one note input area at a time)
const addNote = (text = "", title = "", noteId = "") => {
    const note = document.createElement("div");
    note.classList.add("note");
    note.dataset.id = noteId;  // Set the note's ID for updates
    note.style.width = '800px';  // Increased width for a slightly wider container
    note.style.height = '400px'; // Keeping the height the same
    note.style.position = 'fixed';
    note.style.top = '50%';  // Center vertically
    note.style.left = '50%'; // Center horizontally
    note.style.transform = 'translate(-50%, -50%)'; // Center the container
    note.style.overflow = 'auto'; // Allow scrolling if the content overflows
    note.style.backgroundColor = '#ffcccb'; // Light pink background color

    // Initially hide the title and content
    note.innerHTML = `
        <div class="icons" style="background-color: pink; padding: 10px; margin-bottom: 20px;">
            <i class="save fas fa-save" style="color:red; margin-right: 10px;"></i>
            <i class="undo fas fa-undo" style="color:blue; margin-right: 10px;"></i>
            <i class="redo fas fa-redo" style="color:green;"></i>
        </div>
        <div class="title-div">
            <textarea class="title" placeholder="Write the title ..." style="color: black;">${title}</textarea>
        </div>
        <div class="content" contenteditable="true" placeholder="Note down your thoughts ..." style="color: black;">${text}</div>
        <div class="format-buttons" style="background-color: pink; padding: 10px; margin-top: 50px;">
            <button class="bold" style="background-color: pink;">B</button>
            <button class="italic" style="background-color: pink;">I</button>
            <button class="underline" style="background-color: pink;">U</button>
            <button class="strikethrough" style="background-color: pink;">S</button>
            <button class="bullet" style="background-color: pink;">•</button>
            <button class="add-image" style="background-color: pink;">Add Image</button>
            <input type="file" class="image-upload" accept="image/*" style="display:none;">
        </div>
    `;

        // Save button functionality to handle save/update
        const saveButton = note.querySelector(".save");
        saveButton.addEventListener("click", function () {
            const title = note.querySelector(".title").value.trim();
            const content = note.querySelector(".content").innerHTML.trim();
            const user_id = sessionStorage.getItem("user_id");

            if (!title || !content) {
                console.error("Title and content are required.");
                return;
            }

            const noteData = {
                title,
                content,
                user_id,
                noteId: note.dataset.id || null // Use noteId for updates
            };

            saveNotes(noteData);  // Trigger the saveNotes function

            // Once saved, display the title and content
            note.querySelector(".title-div").style.display = 'block';
            note.querySelector(".content").style.display = 'block';
            window.location.href = 'displayNotes.html';
        });

        // Undo/Redo functionality
        const undoButton = note.querySelector('.undo');
        const redoButton = note.querySelector('.redo');
        let undoStack = [];
        let redoStack = [];

        // Save the current content to the undo stack
        function saveState() {
            const content = note.querySelector(".content").innerHTML.trim();
            undoStack.push(content);
            redoStack = [];  // Clear redo stack on new change
        }

        // Save the initial state when the note is created
        saveState();

        // Undo functionality
        undoButton.addEventListener('click', () => {
            if (undoStack.length > 1) {
                const lastState = undoStack.pop();
                redoStack.push(lastState); // Push last state to redo stack
                const prevState = undoStack[undoStack.length - 1];
                note.querySelector(".content").innerHTML = prevState;
            }
        });

        // Redo functionality
        redoButton.addEventListener('click', () => {
            if (redoStack.length > 0) {
                const lastUndoneState = redoStack.pop();
                undoStack.push(lastUndoneState); // Push last undone state to undo stack
                note.querySelector(".content").innerHTML = lastUndoneState;
            }
        });

        // Event listener to track content changes and save states
        const contentDiv = note.querySelector(".content");
        contentDiv.addEventListener("input", function () {
            saveState();  // Save state on any content change
        });

        // Helper function to apply formatting
        function applyFormatting(command, value = null) {
            document.execCommand(command, false, value);
        }

        // Text formatting buttons functionality
        const boldButton = note.querySelector('.bold');
        const italicButton = note.querySelector('.italic');
        const underlineButton = note.querySelector('.underline');
        const strikethroughButton = note.querySelector('.strikethrough');
        const bulletButton = note.querySelector('.bullet');

        boldButton.addEventListener('click', () => applyFormatting('bold'));
        italicButton.addEventListener('click', () => applyFormatting('italic'));
        underlineButton.addEventListener('click', () => applyFormatting('underline'));
        strikethroughButton.addEventListener('click', () => applyFormatting('strikeThrough'));
        bulletButton.addEventListener('click', () => applyFormatting('insertUnorderedList'));

        // Image upload functionality
        const addImageButton = note.querySelector('.add-image');
        const imageUpload = note.querySelector('.image-upload');

        addImageButton.addEventListener('click', function () {
            imageUpload.click();
        });

        imageUpload.addEventListener('change', function () {
            const chosenFile = this.files[0];
            if (chosenFile) {
                const reader = new FileReader();
                reader.onload = function () {
                    const image = document.createElement('img');
                    image.src = reader.result;
                    image.classList.add('resizable');
                    image.style.float = 'left';
                    const content = note.querySelector('.content');
                    content.appendChild(image);
                    enableImageResize(image); // Enable image resizing and dragging
                };
                reader.readAsDataURL(chosenFile);
            }
        });

        function enableImageResize(image) {
            let isResizing = false;
            let isDragging = false;
            let initialMouseX, initialMouseY, initialWidth, initialHeight, initialLeft, initialTop;

            image.addEventListener('mousedown', function (e) {
                if (e.offsetX >= image.width - 10 && e.offsetY >= image.height - 10) {
                    isResizing = true;
                    initialWidth = image.width;
                    initialHeight = image.height;
                    initialMouseX = e.clientX;
                    initialMouseY = e.clientY;

                    function onMouseMove(e) {
                        if (isResizing) {
                            const dx = e.clientX - initialMouseX;
                            const dy = e.clientY - initialMouseY;
                            image.style.width = `${initialWidth + dx}px`;
                            image.style.height = `${initialHeight + dy}px`;
                        }
                    }

                    function onMouseUp() {
                        isResizing = false;
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                    }

                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                } else {
                    isDragging = true;
                    initialMouseX = e.clientX;
                    initialMouseY = e.clientY;
                    initialLeft = image.offsetLeft;
                    initialTop = image.offsetTop;

                    function onMouseMove(e) {
                        if (isDragging) {
                            const dx = e.clientX - initialMouseX;
                            const dy = e.clientY - initialMouseY;
                            image.style.left = `${initialLeft + dx}px`;
                            image.style.top = `${initialTop + dy}px`;
                        }
                    }

                    function onMouseUp() {
                        isDragging = false;
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                    }

                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                }
            });
        }

        document.getElementById("main").appendChild(note);
    }

    // Fetch user details
    fetch("/api/user/profile")
        .then(response => response.json())
        .then(data => {
            const user_id = data.id;
            sessionStorage.setItem("user_id", user_id);
            // Directly load notes after fetching user details
            addNote(); // Adds an empty note for the logged-in user
        })
        .catch(error => {
            console.error("Error fetching user details:", error);
        });

    // Add Event Listener for Add Button to create new notes
    const addBtn = document.querySelector("#addBtn");
    addBtn.addEventListener("click", function () {
        addNote(); // Adds an empty note
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
