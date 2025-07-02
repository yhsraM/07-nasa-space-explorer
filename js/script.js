// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// NASA API key (replace 'DEMO_KEY' with your own key for more requests)
const apiKey = 'DEMO_KEY';

// Get references to the button and gallery
const button = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

// Fun space facts array
const spaceFacts = [
  "Did you know? A day on Venus is longer than a year on Venus!",
  "Did you know? Neutron stars can spin at a rate of 600 rotations per second!",
  "Did you know? There are more trees on Earth than stars in the Milky Way.",
  "Did you know? One million Earths could fit inside the Sun!",
  "Did you know? Space is completely silent because there is no air to carry sound.",
  "Did you know? The footprints on the Moon will be there for millions of years.",
  "Did you know? Jupiter has 95 known moons!",
  "Did you know? The hottest planet in our solar system is Venus.",
  "Did you know? The International Space Station travels at 28,000 km/h (17,500 mph).",
  "Did you know? Saturn could float in water because it is mostly made of gas!"
];

// Pick a random fact and display it in the alert
const factText = document.getElementById('space-fact-text');
if (factText) {
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  factText.textContent = spaceFacts[randomIndex];
}

// Listen for button click
button.addEventListener('click', () => {
  // Show the Bootstrap loading modal while fetching images
  // This uses Bootstrap's Modal class (make sure Bootstrap JS is loaded)
  const loadingModalElement = document.getElementById('loadingModal');
  // Create a Bootstrap modal instance
  const loadingModal = new bootstrap.Modal(loadingModalElement);
  loadingModal.show();
  // Get the selected dates
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Check if both dates are selected
  if (!startDate || !endDate) {
    alert('Please select both start and end dates.');
    return;
  }

  // Build the API URL
  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

  // Fetch data from NASA API
  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Clear the gallery
      gallery.innerHTML = '';

      // Loop through each image and add to the gallery using Bootstrap grid
      data.forEach(item => {
        // Create a Bootstrap column div
        const col = document.createElement('div');
        col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';

        // Create a Bootstrap card
        const card = document.createElement('div');
        card.className = 'card h-100 shadow-sm gallery-item';

        // Card body for title and info
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        // Title
        const caption = document.createElement('h6');
        caption.className = 'card-title';
        caption.textContent = item.title;

        // NASA APOD info: date (show on card), explanation (only in modal)
        const date = document.createElement('p');
        date.className = 'card-subtitle mb-2 text-muted';
        date.textContent = `Date: ${item.date}`;

        cardBody.appendChild(caption);
        cardBody.appendChild(date);

        // Handle images
        if (item.media_type === 'image') {
          // Image element
          const img = document.createElement('img');
          img.src = item.url;
          img.alt = item.title;
          img.className = 'card-img-top';
          img.style.cursor = 'pointer';
          card.appendChild(img);

          // Add click event to open modal with image details
          card.addEventListener('click', () => {
            document.getElementById('modalImage').src = item.hdurl || item.url;
            document.getElementById('modalImage').alt = item.title;
            document.getElementById('modalTitle').textContent = item.title;
            document.getElementById('modalDate').textContent = `Date: ${item.date}`;
            document.getElementById('modalExplanation').textContent = item.explanation;
            const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
            imageModal.show();
          });
        }
        // Handle videos (e.g., YouTube)
        else if (item.media_type === 'video') {
          // Add NASA logo as a visual for video cards
          const logo = document.createElement('img');
          logo.src = 'img/nasa-worm-logo.png';
          logo.alt = 'NASA Logo';
          logo.style.width = '100%';
          logo.style.maxHeight = '120px';
          logo.style.objectFit = 'contain';
          logo.style.marginBottom = '10px';
          card.appendChild(logo);

          // Try to embed YouTube videos, otherwise show a link
          let videoEmbed = null;
          if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
            // Extract YouTube video ID
            let videoId = '';
            const ytMatch = item.url.match(/(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
            if (ytMatch && ytMatch[1]) {
              videoId = ytMatch[1];
            }
            if (videoId) {
              videoEmbed = document.createElement('div');
              videoEmbed.innerHTML = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:8px;"></iframe></div>`;
            }
          }
          if (videoEmbed) {
            card.appendChild(videoEmbed);
          } else {
            // Fallback: show a clear clickable link
            const link = document.createElement('a');
            link.href = item.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'btn btn-primary mt-2';
            link.textContent = 'Watch Video';
            card.appendChild(link);
          }
        }

        card.appendChild(cardBody);
        col.appendChild(card);
        gallery.appendChild(col);
      });

      // If no images found
      if (gallery.innerHTML === '') {
        gallery.innerHTML = '<p>No images found for this date range.</p>';
      }
      // Hide the modal after loading is done
      loadingModal.hide();
    })
    .catch(error => {
      // Show error message
      gallery.innerHTML = `<p>Sorry, something went wrong: ${error.message}</p>`;
      // Hide the modal if there's an error
      loadingModal.hide();
    });
});
