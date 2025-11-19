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

document.addEventListener('DOMContentLoaded', () => {
    const noFlashcardsMessage = document.getElementById('no-flashcards-message');
    const addCategoryButton = document.getElementById('add-category-button');

    // Add Category Button Click Event
    if (addCategoryButton) {
        addCategoryButton.addEventListener('click', () => {
            console.log('Add Category button clicked'); // Debugging log
            window.location.href = 'addcategory.html';  // Redirect to addcategory.html
        });
    } else {
        console.warn('Add Category button not found.');
    }

    // Function to fetch the flashcard count for a category from localStorage
    const fetchFlashcardCount = (categoryId) => {
        console.log('Fetching flashcard count for category ID:', categoryId);

        // Check if the count for this category is in localStorage
        const storedCount = localStorage.getItem(`flashcardCount_${categoryId}`);
        if (storedCount !== null) {
            console.log(`Using cached flashcard count for category ${categoryId}:`, storedCount);
            return parseInt(storedCount, 10);  // Return the cached count from localStorage
        }

        console.log(`No cached count found for category ${categoryId}. Returning 0.`);
        return 0; // If no count is found, return 0
    };

    const fetchAndDisplayCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            if (!response.ok) {
                throw new Error(`Failed to fetch categories: ${response.statusText}`);
            }
    
            const categories = await response.json();
    
            const categoriesContainer = document.getElementById('categories-container');
            const noFlashcardsMessage = document.getElementById('no-flashcards-message');
    
            if (categories.length === 0) {
                // Show "No Flashcards" message and hide categories container
                noFlashcardsMessage.style.display = 'block';
                categoriesContainer.style.display = 'none';
            } else {
                // Hide "No Flashcards" message and show categories container
                noFlashcardsMessage.style.display = 'none';
                categoriesContainer.style.display = 'block';
    
                // Use CSS Grid to display 4 boxes per line, make them a bit wider
                categoriesContainer.style.display = 'grid';
                categoriesContainer.style.gridTemplateColumns = 'repeat(4, minmax(280px, 1fr))';  // Wider minimum width (280px)
                categoriesContainer.style.gap = '20px';  // Gap between items
                categoriesContainer.style.width = '100%';
                categoriesContainer.style.maxWidth = '1400px';  // Max width of the container
                categoriesContainer.style.margin = '0 auto';
                categoriesContainer.style.padding = '20px';
                categoriesContainer.style.boxSizing = 'border-box';
    
                // Clear previous categories and populate new ones
                categoriesContainer.innerHTML = ''; 
                for (const category of categories) {
                    const categoryItem = document.createElement('div');
                    categoryItem.className = 'category-item';
                    categoryItem.style.padding = '15px';
                    categoryItem.style.backgroundColor = '#FFC0CB';  // Light pink background
                    categoryItem.style.borderRadius = '8px';  // Rounded corners for each category item
                    categoryItem.style.boxShadow = '0px 2px 5px rgba(0, 0, 0, 0.1)';  // Light shadow
                    categoryItem.style.position = 'relative';  // Positioning for the icons
                    categoryItem.style.display = 'flex';
                    categoryItem.style.flexDirection = 'column';  // Ensure vertical stacking of content inside each item
                    categoryItem.style.boxSizing = 'border-box';  // Include padding and border in the width
                    categoryItem.style.fontFamily = '"Arial", sans-serif';  // Modern font family
    
                    // Category name with improved font styling
                    const descriptionHTML = category.category_desc ? `<p style="line-height: 1.3; margin-top: 6px;">${category.category_desc}</p>` : '';
    
                    // Fetch the flashcard count for this category using the new fetchFlashcardCount function
                    let flashcardCount = await fetchFlashcardCount(category.id);  // Assuming this function returns a promise
    
                    // Add category content to the item
                    categoryItem.innerHTML = `
                        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 6px; line-height: 1.4; color: #333;">${category.name}</h3> 
                        ${descriptionHTML}
                        <p style="line-height: 1.3; margin-top: 6px; color: #333;">${flashcardCount} Flashcards</p> <!-- Display the flashcard count -->
                        <img src="images/edit.png" alt="Edit" class="edit-category-btn" style="cursor: pointer; width: 18px; height: 18px; position: absolute; top: 10px; right: 30px;"/>
                        <img src="images/delete.png" alt="Delete" class="delete-category-btn" style="cursor: pointer; width: 18px; height: 18px; position: absolute; top: 10px; right: 10px;"/>
                    `;
    
                    // Add click event listener to each category item
                    categoryItem.addEventListener('click', () => {
                        localStorage.setItem('categoryId', category.id);
                        console.log('Category ID stored in localStorage:', category.id);  // Debugging log
                        window.location.href = 'displayFC.html';  // Redirect to displayFC.html
                    });
    
                    // Add click event listener to the Edit image
                    const editButton = categoryItem.querySelector('.edit-category-btn');
                    editButton.addEventListener('click', (event) => {
                        event.stopPropagation();  // Prevent category click from triggering
                        localStorage.setItem('categoryId', category.id);
                        console.log('Editing Category ID:', category.id);  // Debugging log
                        window.location.href = 'editcategory.html';  // Redirect to editcategory.html
                    });
    
                    // Add click event listener to the Delete image
                    const deleteButton = categoryItem.querySelector('.delete-category-btn');
                    deleteButton.addEventListener('click', (event) => {
                        event.stopPropagation();  // Prevent category click from triggering
                        const categoryId = category.id;
                        console.log('Deleting Category ID:', categoryId);  // Debugging log
                        
                        // Make an API request to delete the category
                        fetch(`/api/categories/delete/${categoryId}`, {
                            method: 'DELETE',
                        })
                        .then(response => response.json())
                        .then(data => {
                            console.log('Category deleted:', data);
                            categoryItem.remove();  // Remove the category from the UI
                        })
                        .catch(error => {
                            console.error('Error deleting category:', error);
                        });
                    });
    
                    categoriesContainer.appendChild(categoryItem);
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            noFlashcardsMessage.style.display = 'block';
            noFlashcardsMessage.textContent = 'Failed to load categories. Please try again later.';
        }
    };
            // Fetch and display categories on page load
    fetchAndDisplayCategories();
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
