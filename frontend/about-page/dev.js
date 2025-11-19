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


//for next slide
document.getElementById("toggle-arrow").addEventListener("click", function () {
    const aboutSection = document.querySelector(".about");
    const developersSection = document.querySelector(".developers");

    if (aboutSection.style.display !== "none") {
        aboutSection.style.display = "none";
        developersSection.style.display = "block";
        document.getElementById('toggle-arrow').style.display = 'none';  // Hide the next button
        document.getElementById('back').style.display = 'block';  // Show the back button
    } else {
        aboutSection.style.display = "block";
        developersSection.style.display = "none";
        document.getElementById('toggle-arrow').style.display = 'block';  // Show the next button
        document.getElementById('back').style.display = 'none';  // Hide the back button
    }
});

document.getElementById('back').addEventListener('click', function() {
    const aboutSection = document.querySelector('.about');
    aboutSection.style.display = 'block';
    document.querySelector('.developers').style.display = 'none';  // Hide the developers section
    this.style.display = 'none';  // Hide the back button
    document.getElementById('toggle-arrow').style.display = 'block';  // Show the next button
});

document.addEventListener('DOMContentLoaded', () => {
    const toggleArrow = document.getElementById('toggle-arrow');
    const backBtn = document.getElementById('back');
    const developersSection = document.querySelector('.developers');
    const teamSection = document.querySelector('.team');

    // Ensure the "developers" and "team" sections are hidden on page load
    developersSection.style.display = 'none';
    teamSection.style.display = 'none';
    toggleArrow.style.display = 'flex'; // Show the toggle button
    backBtn.style.display = 'none'; // Hide the back button

    // Show the "developers" and "team" sections
    toggleArrow.addEventListener('click', () => {
        developersSection.style.display = 'flex';
        teamSection.style.display = 'flex';
        toggleArrow.style.display = 'none'; // Hide the toggle button
        backBtn.style.display = 'flex'; // Show the back button
    });

    // Hide the "developers" and "team" sections
    backBtn.addEventListener('click', () => {
        developersSection.style.display = 'none';
        teamSection.style.display = 'none';
        toggleArrow.style.display = 'flex'; // Show the toggle button
        backBtn.style.display = 'none'; // Hide the back button
    });
});