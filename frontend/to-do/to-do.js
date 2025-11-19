document.addEventListener('DOMContentLoaded', () => {
    console.log("Script loaded successfully");
    const sidebar = document.querySelector('.sidebar');
    const navLinks = document.querySelectorAll('.sidebar nav a');

    // Test highlighting functionality
    const currentPath = window.location.pathname;
    navLinks.forEach(link => {
        if (currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });

    // Test toggle sidebar functionality
    const toggleButton = document.createElement('button');
    toggleButton.textContent = "☰";
    toggleButton.classList.add('toggle-sidebar');
    sidebar.parentNode.insertBefore(toggleButton, sidebar);

    toggleButton.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
});


//for side bar
const toggleBtn = document.getElementById("toggle-btn");
const sidebar = document.querySelector(".sidebar");

toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open"); // Toggle the 'open' class on sidebar
});



const imgDiv = document.querySelector('.profile-pic-div');
const img = document.querySelector('#photo');
const file = document.querySelector('#file');
const uploadBtn = document.querySelector('#uploadBtn');

// Show upload button on mouse enter
imgDiv.addEventListener('mouseenter', function(){
    uploadBtn.style.display = "block";
});

// Hide upload button on mouse leave
imgDiv.addEventListener('mouseleave', function(){
    uploadBtn.style.display = "none";
});

function fetchProfilePic() {
    fetch('/api/user/profile', {
        method: 'GET',
        credentials: 'include',  // Ensure session cookie is sent
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error fetching profile picture');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            img.setAttribute('src', data.profilePicUrl);  // Set the profile picture URL in the image tag
        } else {
            console.error('Failed to fetch profile picture');
        }
    })
    .catch(error => {
        console.error('Error fetching profile picture:', error);
    });
}

// Call the function on page load to display the profile picture if it exists
document.addEventListener('DOMContentLoaded', fetchProfilePic);

// Handle file input change
file.addEventListener('change', function() {
    const choosedFile = this.files[0];

    if (choosedFile) {
        const reader = new FileReader();
        reader.addEventListener('load', function() {
            img.setAttribute('src', reader.result); // Display image preview
        });
        reader.readAsDataURL(choosedFile);

        // Upload the image to the server
        const formData = new FormData();
        formData.append('profile_pic', choosedFile); // Append the selected file

        // Send a POST request to upload the image
        fetch('/upload-profile-pic', {
            method: 'POST',
            body: formData,
            credentials: 'include', // Ensure session cookies are sent
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Profile picture uploaded successfully');
                img.setAttribute('src', data.profilePicUrl); // Update the profile picture with the server's response
            } else {
                console.error('Error uploading profile picture');
                alert('Error uploading profile picture');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error uploading profile picture');
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');

    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Form input fields
        const taskNameInput = document.getElementById('taskName');
        const taskSubjectInput = document.getElementById('taskSubject');
        const dueDateInput = document.getElementById('dueDate');
        const submissionPlatformInput = document.getElementById('submissionPlatform');

        // Get values from the form and trim them
        const taskName = taskNameInput.value.trim();
        const taskSubject = taskSubjectInput.value.trim();
        const dueDate = dueDateInput.value.trim();
        const submissionPlatform = submissionPlatformInput.value.trim();

        // Assume `user_id` is stored in session or localStorage after login
        const userId = localStorage.getItem('user_id'); // Or sessionStorage, depending on how you store the user ID

        // Initialize valid flag for form validation
        let isValid = true;

        // Clear previous error messages
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());

        // Validate Task Name
        if (!taskName) {
            taskNameInput.style.border = '2px solid red';
            const errorMessage = document.createElement('span');
            errorMessage.textContent = 'Task Name is required';
            errorMessage.classList.add('error-message');
            errorMessage.style.color = 'red';
            taskNameInput.parentElement.appendChild(errorMessage);
            isValid = false;
        } else {
            taskNameInput.style.border = '';
        }

        // Validate Task Subject
        if (!taskSubject) {
            taskSubjectInput.style.border = '2px solid red';
            const errorMessage = document.createElement('span');
            errorMessage.textContent = 'Task Subject is required';
            errorMessage.classList.add('error-message');
            errorMessage.style.color = 'red';
            taskSubjectInput.parentElement.appendChild(errorMessage);
            isValid = false;
        } else {
            taskSubjectInput.style.border = '';
        }

        // Validate Due Date
        if (!dueDate) {
            dueDateInput.style.border = '2px solid red';
            const errorMessage = document.createElement('span');
            errorMessage.textContent = 'Due Date is required';
            errorMessage.classList.add('error-message');
            errorMessage.style.color = 'red';
            dueDateInput.parentElement.appendChild(errorMessage);
            isValid = false;
        } else {
            dueDateInput.style.border = '';
        }

        // Proceed if form is valid
        if (isValid) {
            // Prepare task data
            const taskData = {
                task_name: taskName,
                task_subject: taskSubject,
                submission_platform: submissionPlatform,
                due_date: dueDate,
                user_id: userId  // Include user_id here
            };

            // Proceed with adding the task
            fetch('http://localhost:3000/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData)
            })
            .then(response => {
                console.log('Response Status:', response.status);  // Log status code
                if (!response.ok) {
                    return response.text().then(errorText => {
                        console.log('Error Response:', errorText);  // Log response text to see what error it returns
                        throw new Error(errorText);
                    });
                }
                return response.json();  // Parse response as JSON
            })
            .then(data => {
                if (data.message === 'Task added successfully') {
                    taskForm.reset(); // Clear the form fields
                    window.location.href = "http://localhost:3000/addsuccess"; // Use absolute URL for redirection
                } else {
                    alert('Failed to add task. Please try again.');
                }
            })

            .catch(error => {
                console.error('Error adding task:', error);
                alert(`Error occurred while adding task: ${error.message}. Please try again later.`);
            });
        } else {
            alert('Please fill out all required fields (Task Name, Task Subject, and Due Date).');
        }
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
