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
});


async function fetchTasks() {
    try {
        const response = await fetch('http://localhost:3000/api/tasks');
        const tasks = await response.json();

        // Get references to the task lists
        const assignedList = document.getElementById('assigned');
        const finishedList = document.getElementById('finished');
        const missingList = document.getElementById('missing');

        // Clear existing tasks in all lists
        assignedList.innerHTML = '';
        finishedList.innerHTML = '';
        missingList.innerHTML = '';

        // Check if there are tasks
        if (tasks.length === 0) {
            const statusMessage = document.getElementById('status-message');
            statusMessage.style.display = 'block';  // Show the status message
            statusMessage.textContent = 'No tasks to show. You may now start your productive journey by adding a task!';  // Set the message

        } else {
            // Sort tasks by priority (highest to lowest)
            tasks.sort((taskA, taskB) => {
                const dueDateA = new Date(taskA.due_date);
                const dueDateB = new Date(taskB.due_date);
                const now = new Date();
                const timeDiffA = dueDateA - now;
                const timeDiffB = dueDateB - now;

                // Calculate priority for both tasks
                const priorityA = getTaskPriority(timeDiffA, taskA.due_date);
                const priorityB = getTaskPriority(timeDiffB, taskB.due_date);

                return priorityA - priorityB; // Sort by priority (ascending)
            });

           // Helper function to format date as mm/dd/yy
    function formatDate(date) {
    const options = { year: '2-digit', month: '2-digit', day: '2-digit' };
    return new Date(date).toLocaleDateString('en-US', options);
}

tasks.forEach(task => {
    console.log('Task:', task);  // Log entire task object for debugging

    const li = document.createElement('li');
    
    // Determine task priority based on due date
    const dueDate = new Date(task.due_date);
    const now = new Date();
    const timeDiff = dueDate - now;
    const hoursDiff = timeDiff / (1000 * 3600);  // Convert to hours

    let priorityColor = ''; // Default color
    if (hoursDiff <= 24) {
        priorityColor = 'red'; // High priority (due within 24 hours)
    } else if (hoursDiff <= 72) {
        priorityColor = 'orange'; // Medium priority (due within 3 days)
    } else if (hoursDiff > 72 || !task.due_date) {
        priorityColor = 'yellow'; // Low priority (due in more than 3 days or no due date)
    }

    // Set task background color based on priority
    li.style.backgroundColor = priorityColor;

    // Create checkbox image
    const checkboxImage = document.createElement('img');
    checkboxImage.src = 'images/checkbox.png';  // Path to your checkbox.png
    checkboxImage.alt = 'Checkbox';
    checkboxImage.classList.add('checkbox');
    checkboxImage.style.borderColor = priorityColor; // Set border color to match priority color
    
    // Create task info
    const taskText = document.createElement('span');
    taskText.classList.add('task-text');

    // Format due date to mm/dd/yy
    const formattedDueDate = formatDate(task.due_date);
    taskText.textContent = `${task.task_name} - ${task.task_subject} (Due: ${formattedDueDate})`;

    // Create edit icon
    const editIcon = document.createElement('img');
    editIcon.src = 'images/edit.png'; // Path to your edit icon
    editIcon.alt = 'Edit';
    editIcon.classList.add('edit-icon');
    editIcon.style.cursor = 'pointer'; // Make it clickable

    // Add event listener for redirection to edit page with task_id
    editIcon.addEventListener('click', function() {
        window.location.href = `edit.html?task_id=${task.task_id}`;
    });

    // Create delete icon
    const deleteIcon = document.createElement('img');
    deleteIcon.src = 'images/delete.png';  // Path to your delete.png
    deleteIcon.alt = 'Delete';
    deleteIcon.classList.add('delete-icon');
    deleteIcon.setAttribute('data-task-id', task.task_id); // Add the data-task-id attribute

    deleteIcon.addEventListener('click', async function() {
        const taskId = task.task_id;  // Get the task ID

    try {
        const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorText = await response.text();  // Get the error response text
            throw new Error(errorText || 'Failed to delete task');
        }

        const result = await response.json();
        alert(result.message);  // Show success message

        // Remove the task from the UI
        li.remove();  // Remove the task list item

        // Update task counts
        updateTaskCounts();

    } catch (error) {
        alert(`Error: ${error.message}`);
        console.error(error);  // Log error for debugging
    }
});

    // Get platform URL directly from the task's submission_platform field
    const platformUrl = task.submission_platform ? task.submission_platform : 'https://www.example.com';  // Fallback to a default URL if not present

    // Get platform icon based on submission_platform keywords
    const platformIcon = getPlatformIcon(task.submission_platform);

    // Create platform icon image with link
    const platformLink = document.createElement('a');
    platformLink.href = platformUrl;  // Use the submission platform URL from the task
    platformLink.target = '_blank';  // Open the link in a new tab

    const platformIconImg = document.createElement('img');
    platformIconImg.src = `images/${platformIcon}.png`;  // Path to the platform icon image (e.g., google.png, teams.png)
    platformIconImg.alt = task.submission_platform;  // Set the alt text to platform name
    platformIconImg.classList.add('platform-icon');  // Add a class for styling

    // Append the icon to the link
    platformLink.appendChild(platformIconImg);

    // Set checkbox state based on task status
    if (task.status === 'finished') {
        checkboxImage.classList.add('checked');
        taskText.style.textDecoration = 'line-through'; // Mark task as completed
        finishedList.appendChild(li); // Move to finished list
    } else if (new Date(task.due_date) < new Date() && task.status !== 'finished') {
        missingList.appendChild(li); // Move to missing list if overdue
    } else {
        assignedList.appendChild(li); // Move to assigned list
    }

// Add event listener to toggle task completion when checkbox is clicked
checkboxImage.addEventListener('click', function() {
    if (checkboxImage.classList.contains('checked')) {
        // Unmark task and determine the correct list
        taskText.style.textDecoration = 'none'; // Remove strike-through from task text
        checkboxImage.classList.remove('checked');  // Remove checked class from checkbox
        taskText.classList.remove('finished'); // Remove finished class from task text

        // Check if the task is overdue
        if (new Date(task.due_date) < new Date()) {
            missingList.appendChild(li); // Move to missing list if overdue
        } else {
            assignedList.appendChild(li); // Otherwise, move to assigned list
        }

        // Update task status to "assigned"
        updateTaskStatus(task.task_id, 'assigned', task.submission_platform);
    } else {
        // Mark task as completed and move to finished list
        taskText.style.textDecoration = 'line-through'; // Strike-through task text
        checkboxImage.classList.add('checked');  // Add checked class to checkbox
        taskText.classList.add('finished'); // Add finished class to task text
        finishedList.appendChild(li); // Move to finished list

        // Update task status to "finished"
        updateTaskStatus(task.task_id, 'finished', task.submission_platform);
    }

    // Update task counts whenever the status changes
    updateTaskCounts();
});


    // Append checkbox image first, followed by platform link, task text, edit icon, and delete icon
    li.appendChild(checkboxImage);  // Append checkbox first
    li.appendChild(platformLink);  // Then append the platform link with the icon
    li.appendChild(taskText);  // Then append the task text
    li.appendChild(editIcon);  // Append edit icon
    li.appendChild(deleteIcon);  // Append delete icon

    // Add the task to the appropriate list based on its status
    if (task.status === 'finished') {
        finishedList.appendChild(li);
    } else if (new Date(task.due_date) < new Date() && task.status !== 'finished') {
        missingList.appendChild(li);
    } else {
        assignedList.appendChild(li);
    }
});

// Helper function to map platform names to icon names
function getPlatformIcon(platform) {
    const platformLower = platform ? platform.toLowerCase() : '';

    if (platformLower.includes('google')) {
        return 'google';  // Matches Google and uses google.png
    } else if (platformLower.includes('teams')) {
        return 'teams';   // Matches Teams and uses teams.png
    } else if (platformLower.includes('canvas')) {
        return 'canvas';  // Matches Canvas and uses canvas.png
    } else {
        return 'heart';   // Default to heart.png if no match
    }
}

// Helper function to format date to mm/dd/yy
function formatDate(date) {
    const d = new Date(date);
    const month = d.getMonth() + 1;  // Months are zero-based, so we add 1
    const day = d.getDate();
    const year = d.getFullYear().toString().slice(-2);  // Get last 2 digits of the year
    return `${month}/${day}/${year}`;
}

        }

        // Update task counts after the tasks are loaded
        updateTaskCounts();

    } catch (error) {
        console.error('Error fetching tasks:', error);
        const statusMessage = document.getElementById('status-message');
        statusMessage.style.display = 'block';
        statusMessage.textContent = 'Failed to load tasks. Please try again later.';
    }
}


// Function to calculate the priority (lower value means higher priority)
function getTaskPriority(timeDiff, dueDate) {
    const hoursDiff = timeDiff / (1000 * 3600);  // Convert to hours
    if (hoursDiff <= 24) {
        return 1; // High priority
    } else if (hoursDiff <= 72) {
        return 2; // Medium priority
    } else if (hoursDiff > 72 || !dueDate) {
        return 3; // Low priority
    }
    return 3; // Default to low priority if no due date
}

// Update the task counts (for Assigned, Finished, Missing)
function updateTaskCounts() {
    const assignedList = document.getElementById('assigned');
    const finishedList = document.getElementById('finished');
    const missingList = document.getElementById('missing');
    
    const assignedCount = assignedList.getElementsByTagName('li').length;
    const finishedCount = finishedList.getElementsByTagName('li').length;
    const missingCount = missingList.getElementsByTagName('li').length;

    document.getElementById('assigned-count').textContent = assignedCount;
    document.getElementById('finished-count').textContent = finishedCount;
    document.getElementById('missing-count').textContent = missingCount;
}

async function updateTaskStatus(taskId, newStatus, submissionPlatform) {
    try {
        console.log("Updating Task ID:", taskId, "Status:", newStatus, "Submission Platform:", submissionPlatform);  // Log values to check if they're correct
        
        const response = await fetch('http://localhost:3000/api/tasks/update-status', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                task_id: taskId,  // Ensure task_id is correctly sent
                status: newStatus,  // Ensure status is correctly sent
                submission_platform: submissionPlatform  // Ensure submission_platform is correctly sent
            })
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log('Task status updated:', result.message);
        } else {
            console.error('Failed to update task status:', result.message);
        }
    } catch (error) {
        console.error('Error updating task status:', error);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const finishedBtn = document.getElementById('finishedBtn');
    const assignedBtn = document.getElementById('assignedBtn');
    const missingBtn = document.getElementById('missingBtn');
    const assignedList = document.getElementById('assigned');
    const finishedList = document.getElementById('finished');
    const missingList = document.getElementById('missing');

    // Event listeners for filter buttons
    finishedBtn.addEventListener('click', function () {
        finishedList.style.display = 'block';
        assignedList.style.display = 'none';
        missingList.style.display = 'none';
    });

    assignedBtn.addEventListener('click', function () {
        assignedList.style.display = 'block';
        finishedList.style.display = 'none';
        missingList.style.display = 'none';
    });

    missingBtn.addEventListener('click', function () {
        missingList.style.display = 'block';
        assignedList.style.display = 'none';
        finishedList.style.display = 'none';
    });

    // Fetch tasks when the page loads
    fetchTasks();

    // Function to delete the task
async function deleteTask() {
    try {
        // Use the correct endpoint without "/delete/"
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            throw new Error(errorData.message || 'Failed to delete task');
        }

        const result = await response.json();
        alert(result.message); // Show success message
        window.location.href = '/tasks'; // Redirect to tasks list page after deletion
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Error deleting task. Please try again.');
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
