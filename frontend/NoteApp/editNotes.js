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
    fetchUserDetails(); // Fetch user details and load notes

    function fetchUserDetails() {
        fetch("/api/user/profile")
            .then(response => response.json())
            .then(data => {
                console.log("API Response:", data);
                const user_id = data.id;
                console.log("Username:", data.username, "User ID:", user_id);
                sessionStorage.setItem("user_id", user_id);
                document.getElementById("NAME").textContent = data.username; // Set username in UI
                loadNotes(user_id); // Load notes after user is fetched
            })
            .catch(error => {
                console.error("Error fetching user details:", error);
            });
    }

    // Save or update notes
    function saveNotes(noteData) {
        console.log("Saving note with data:", noteData);
        let url = noteData.noteId ? `/api/notes/editNote/${noteData.noteId}` : '/api/notes/saveNotes';
        let method = noteData.noteId ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteData),
        })
        .then(response => response.json())
        .then(result => {
            console.log("Response Status:", result.success ? '200' : 'Error');
            console.log("API Response:", result);
            if (result.success) {
                loadNotes(sessionStorage.getItem("user_id")); // Reload notes after saving
            } else {
                console.error("Save successfully:", result.message);
                alert(result.message);
            }
        })
        .catch(error => console.error("Error saving note:", error));
    }

    // Note history stack
    let historyStack = [];
    let historyIndex = -1;

    // Save the current state of a note in history
    function saveHistory(note) {
        // When saving new data, remove redo history
        if (historyIndex < historyStack.length - 1) {
            historyStack = historyStack.slice(0, historyIndex + 1); 
        }
        historyStack.push({ 
            title: note.querySelector(".title").value.trim(), 
            content: note.querySelector(".content").innerHTML.trim() 
        });
        historyIndex++;
    }

    function undo(note) {
        if (historyIndex > 0) {
            historyIndex--;
            const historyState = historyStack[historyIndex];
            note.querySelector(".title").value = historyState.title;
            note.querySelector(".content").innerHTML = historyState.content;
        }
    }

    function redo(note) {
        if (historyIndex < historyStack.length - 1) {
            historyIndex++;
            const historyState = historyStack[historyIndex];
            note.querySelector(".title").value = historyState.title;
            note.querySelector(".content").innerHTML = historyState.content;
        }
    }

    function addNoteUI(text = "", title = "", noteId = "") {
        // First, check if there's already an existing note.
        const existingNote = document.querySelector(`.note[data-id='${noteId}']`);
      
        // If the note already exists, update its title and content
        if (existingNote) {
            existingNote.querySelector(".title").value = title;
            existingNote.querySelector(".content").innerHTML = text;
            return;
        }
    
        // If no existing note is found, create a new one
        const note = document.createElement("div");
        note.classList.add("note");
        note.dataset.id = noteId; // Set the note's ID for future updates
    
        // Set styles for the note container
        note.style.position = 'fixed';
        note.style.top = '50%'; // Center vertically
        note.style.left = '50%'; // Center horizontally
        note.style.transform = 'translate(-50%, -50%)'; // Center using transform
        note.style.overflow = 'auto'; // Allow scrolling if content overflows
        note.style.backgroundColor = '#ffcccb'; // Light pink background color
        note.style.borderRadius = '10px'; // Optional rounded corners for aesthetics
        note.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'; // Optional shadow for depth
        note.style.padding = '20px'; // Add padding inside the container
        note.style.width = 'clamp(200px, 90%, 800px)'; // Responsive width: min 600px, max 1200px
        note.style.maxHeight = '120vh'; // Limit height to 80% of the viewport
        note.style.minHeight = '400px'; // Ensure a minimum height
    
        // Add content to the note
        note.innerHTML = `
            <div class="icons" style="background-color: pink; padding: 10px; margin-bottom: 20px; display: flex; justify-content: flex-end; gap: 10px;">
                <i class="save fas fa-save" style="color:red; cursor: pointer; font-size: 20px;"></i>
                <i class="undo fas fa-undo" style="color:blue; cursor: pointer; font-size: 20px;"></i>
                <i class="redo fas fa-redo" style="color:green; cursor: pointer; font-size: 20px;"></i>
            </div>
            <div class="title-div" style="margin-bottom: 20px;">
                <textarea class="title" placeholder="Write the title ..." style="color: black; width: 100%; height: 40px; padding: 10px; font-size: 18px; border: 1px solid #ddd; border-radius: 5px;">${title}</textarea>
            </div>
            <div class="content" contenteditable="true" placeholder="Note down your thoughts ..." style="color: black; width: 100%; min-height: 200px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; background-color: #fff;">
                ${text}
            </div>
            <div class="format-buttons" style="background-color: pink; padding: 10px; margin-top: 30px; display: flex; justify-content: space-between; gap: 10px;">
                <button class="bold" style="background-color: pink; border: none; cursor: pointer;">B</button>
                <button class="italic" style="background-color: pink; border: none; cursor: pointer;">I</button>
                <button class="underline" style="background-color: pink; border: none; cursor: pointer;">U</button>
                <button class="strikethrough" style="background-color: pink; border: none; cursor: pointer;">S</button>
                <button class="bullet" style="background-color: pink; border: none; cursor: pointer;">•</button>
                <button class="add-image" style="background-color: pink; border: none; cursor: pointer;">Add Image</button>
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
    
        // Add text formatting listeners
        addTextFormattingListeners(note);
    
        // Handle image upload functionality
        handleImageUpload(note);
    
        // Handle undo/redo functionality
        handleUndoRedo(note);
    
        addEnterKeyFunctionality(note);
    
        // Append the newly created note to the page
        document.getElementById("main").appendChild(note);
    }
        
    function addTextFormattingListeners(note) {
        const buttons = {
            bold: note.querySelector('.bold'),
            italic: note.querySelector('.italic'),
            underline: note.querySelector('.underline'),
            strikethrough: note.querySelector('.strikethrough'),
            bullet: note.querySelector('.bullet')
        };

        // Apply formatting for text formatting buttons
        buttons.bold.addEventListener('click', () => applyFormatting('bold'));
        buttons.italic.addEventListener('click', () => applyFormatting('italic'));
        buttons.underline.addEventListener('click', () => applyFormatting('underline'));
        buttons.strikethrough.addEventListener('click', () => applyFormatting('strikeThrough'));
        buttons.bullet.addEventListener('click', () => applyFormatting('insertUnorderedList'));
    }

    function applyFormatting(command, value = null) {
        document.execCommand(command, false, value);
    }

    function addEnterKeyFunctionality(note) {
        const contentDiv = note.querySelector('.content');
    
        contentDiv.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                if (event.shiftKey) {
                    // Prevent the default behavior for Shift+Enter
                    event.preventDefault();
    
                    // Insert a line break (<br>)
                    const selection = window.getSelection();
                    if (selection && selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        const br = document.createElement('br');
                        range.insertNode(br);
    
                        // Move the cursor after the <br>
                        const newRange = document.createRange();
                        newRange.setStartAfter(br);
                        newRange.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(newRange);
                    }
                } else {
                    // Allow the browser's default behavior for Enter (new paragraph)
                    console.log('Enter key pressed for new paragraph');
                }
            }
        });
    }
    
    
    function handleImageUpload(note) {
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
                    note.querySelector('.content').appendChild(image);
                    enableImageResize(image); // Enable image resizing
                };
                reader.readAsDataURL(chosenFile);
            }
        });
    }

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

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', () => {
                    isResizing = false;
                    document.removeEventListener('mousemove', onMouseMove);
                });
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

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', () => {
                    isDragging = false;
                    document.removeEventListener('mousemove', onMouseMove);
                });
            }
        });

        image.style.position = 'absolute';
        image.style.cursor = 'move';
    }

    function handleNoteActions(note) {
        const saveButton = note.querySelector(".save");
        const delBtn = note.querySelector(".trash");

        saveButton.addEventListener("click", function () {
            const title = note.querySelector(".title").value.trim();
            const content = note.querySelector(".content").innerHTML.trim();
            const user_id = sessionStorage.getItem("user_id");

            if (!title || !content) {
                console.error("Title and content are required.");
                return;
            }

            const noteData = { title, content, user_id, noteId: note.dataset.id || null };
            saveNotes(noteData);
        });

        delBtn.addEventListener("click", function () {
            const noteId = note.dataset.id;
            if (noteId) {
                deleteNote(noteId);  // Implement deleteNote function
            } else {
                note.remove();  // Remove note if no ID
            }
        });
    }

    function handleUndoRedo(note) {
        const undoButton = note.querySelector('.undo');
        const redoButton = note.querySelector('.redo');

        undoButton.addEventListener('click', function () {
            undo(note);
        });

        redoButton.addEventListener('click', function () {
            redo(note);
        });

        note.querySelector('.title').addEventListener('input', function () {
            saveHistory(note);
        });

        note.querySelector('.content').addEventListener('input', function () {
            saveHistory(note);
        });
    }

    function deleteNote(noteId) {
        fetch(`/api/notes/deleteNote/${noteId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        })
        .then(response => response.json())
        .then(result => {
            console.log("Delete Response:", result);
            if (result.success) {
                // Remove note from the UI after successful deletion
                const note = document.querySelector(`.note[data-id='${noteId}']`);
                if (note) note.remove();
            } else {
                console.error("Delete failed:", result.message);
            }
        })
        .catch(error => console.error("Error deleting note:", error));
    }

    function loadNotes(user_id) {
        const notes_id = localStorage.getItem("noteId");
        console.log("Retrieved noteId from localStorage:", notes_id); // Log the noteId
    
        if (notes_id) {
            console.log("Fetching specific note with notes_id:", notes_id);
    
            fetch(`/api/notes/getNoteById/${user_id}/${notes_id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error fetching note: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success && data.note) {
                    addNoteUI(data.note.content, data.note.title, data.note.note_id);
                } else {
                    console.log("No specific note found or access denied.");
                    displayNoNotesMessage(true);
                }
            })
            .catch(error => {
                console.error("Error fetching specific note:", error);
                displayNoNotesMessage(true);
            });
        } else {
            console.log("No noteId found in localStorage, fetching all notes...");
    
            // Fetch all notes for the user if no specific noteId is set
            fetch(`/api/notes/getNotes/${user_id}`)
                .then(response => response.json())
                .then(data => {
                    console.log("Fetched all notes data:", data); // Log the response for all notes
                    if (data.success && data.notes.length > 0) {
                        // Loop through each note and add it to the UI
                        data.notes.forEach(note => addNoteUI(note.content, note.title, note.notes_id)); // Use notes_id in the API response
                    } else {
                        displayNoNotesMessage(true); // Display message if no notes found
                    }
                })
                .catch(error => {
                    console.error("Error fetching notes:", error);
                    displayNoNotesMessage(true); // Display message if there's an error fetching the notes
                });
        }
    }
            
    function displayNoNotesMessage(isVisible) {
        const noNotesMessage = document.querySelector(".no-notes-message");
        if (noNotesMessage) {
            noNotesMessage.style.display = isVisible ? 'block' : 'none';
        }
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
