// Theme toggle functionality
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const themeIcon = themeToggle.querySelector('i');
    
    // Check user's preference in localStorage
    const currentTheme = localStorage.getItem('theme');
    
    // If preference exists, apply it
    if (currentTheme === 'light') {
      document.documentElement.classList.add('light-mode');
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
    }
    
    // Toggle theme when button is clicked
    themeToggle.addEventListener('click', function() {
      // Toggle the light-mode class on the root element
      document.documentElement.classList.toggle('light-mode');
      
      // Update the icon
      if (document.documentElement.classList.contains('light-mode')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        localStorage.setItem('theme', 'light');
      } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        localStorage.setItem('theme', 'dark');
      }
    });
  }
});