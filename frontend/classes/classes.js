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

// Example function to fetch classes from the server and display them
async function fetchClasses() {
    const response = await fetch('/api/classes'); // Replace with the actual endpoint to get the classes
    const classes = await response.json();

    const classesListDiv = document.getElementById('classes-list');
    classesListDiv.innerHTML = ''; // Clear existing list

    classes.forEach(cls => {
        const classItem = document.createElement('div');
        classItem.classList.add('class-item');
        classItem.innerHTML = `
            <h3>${cls.name}</h3>
            <p>${cls.description}</p>
            <a href="${cls.link}" target="_blank">Go to Class</a>
        `;
        classesListDiv.appendChild(classItem);
    });
}

// Call fetchClasses when the page loads
window.onload = fetchClasses;

// Example function for adding a new class (you can replace it with your own functionality)
function addClass() {
    window.location.href = '../add-class/add-class.html'; // Replace with the page to add a class
}
