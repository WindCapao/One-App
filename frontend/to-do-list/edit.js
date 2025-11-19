// Get task_id from URL query parameters (consolidated)
const urlParams = new URLSearchParams(window.location.search);
const taskId = urlParams.get('task_id');

if (!taskId) {
    console.error('No task ID provided');
    alert('No task ID provided.');
    window.location.href = '/tasks'; // Redirect to tasks list if no task_id
} else {
    console.log('Task ID:', taskId);  // Use the task ID to fetch task details for editing
}

// Function to fetch task details from the API
async function fetchTaskDetails() {
    try {
        // Fetch task details from the API
        const response = await fetch(`/api/tasks/${taskId}`);
        if (!response.ok) {
            throw new Error('Error fetching task data');
        }

        const task = await response.json();
        console.log('Task:', task); // Debugging: Check the fetched task

        // Check if task exists
        if (!task || !task.task_name) {
            alert('Task not found.');
            return;
        }

        // Format the due_date to 'yyyy-MM-dd' format
        const dueDate = new Date(task.due_date);
        const formattedDueDate = dueDate.toISOString().split('T')[0]; // Extracts 'yyyy-MM-dd' from ISO string

        // Populate the form with task data
        document.getElementById('task_name').value = task.task_name || '';
        document.getElementById('task_subject').value = task.task_subject || '';
        document.getElementById('due_date').value = formattedDueDate || ''; // Set formatted date
        document.getElementById('submission_platform').value = task.submission_platform || ''; // Ensure it's included
    } catch (error) {
        console.error(error);
        alert('Failed to load task details. Please try again.');
    }
}

// Call the fetchTaskDetails function to load the task details
fetchTaskDetails();

document.getElementById('edit-task-form').addEventListener('submit', async function (event) {
    event.preventDefault();  // Prevent default form submission

    const updatedTask = {
        task_name: document.getElementById('task_name').value || null,
        task_subject: document.getElementById('task_subject').value || null,
        due_date: document.getElementById('due_date').value || null,
        submission_platform: document.getElementById('submission_platform').value || "",
    };

    // Check if data is properly collected
    console.log('Updated Task Data:', updatedTask);

    try {
        const response = await fetch(`/api/tasks/edit/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTask),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            throw new Error(errorData.message || 'Failed to update task');
        }

        const result = await response.json();
        alert(result.message);  // Show success message
        window.location.href = 'http://localhost:3000/To-do-list/to-do-list.html';  // Redirect back to the tasks list page
    } catch (error) {
        console.error('Error updating task:', error);
        alert('Error updating task. Please try again.');
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
