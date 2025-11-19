document.addEventListener('DOMContentLoaded', () => {
    console.log("Script loaded successfully");

    // Sidebar functionality
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('#toggle-btn'); // Assuming this button exists in the HTML
    
    // Toggle sidebar open/close
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open'); // Toggle the 'open' class on sidebar
        });
    }

    // Test highlighting navigation links (optional, for active link styling)
    const navLinks = document.querySelectorAll('.sidebar nav a');
    const currentPath = window.location.pathname;
    navLinks.forEach(link => {
        if (currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });

    // Profile picture upload functionality
    const imgDiv = document.querySelector('.profile-pic-div');
    const img = document.querySelector('#photo');
    const file = document.querySelector('#file');
    const uploadBtn = document.querySelector('#uploadBtn');

    imgDiv.addEventListener('mouseenter', () => {
        uploadBtn.style.display = "block";
    });

    imgDiv.addEventListener('mouseleave', () => {
        uploadBtn.style.display = "none";
    });

    file.addEventListener('change', () => {
        const choosedFile = file.files[0];
        if (choosedFile) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                img.setAttribute('src', reader.result);
            });
            reader.readAsDataURL(choosedFile);
        }
    });
});