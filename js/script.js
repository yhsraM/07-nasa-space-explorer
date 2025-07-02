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
        // Only show images (not videos)
        if (item.media_type === 'image') {
          // Create a Bootstrap column div
          const col = document.createElement('div');
          col.className = 'col-12 col-sm-6 col-md-4 col-lg-3';

          // Create a Bootstrap card
          const card = document.createElement('div');
          card.className = 'card h-100 shadow-sm';

          // Image element
          const img = document.createElement('img');
          img.src = item.url;
          img.alt = item.title;
          img.className = 'card-img-top';
          img.style.cursor = 'pointer';

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
          // Do NOT add explanation to the card, only show in modal
          card.appendChild(img);
          card.appendChild(cardBody);
          col.appendChild(card);

          // Add to gallery
          gallery.appendChild(col);

          // Add click event to open modal with image details
          card.addEventListener('click', () => {
            // Set modal content
            document.getElementById('modalImage').src = item.hdurl || item.url;
            document.getElementById('modalImage').alt = item.title;
            document.getElementById('modalTitle').textContent = item.title;
            document.getElementById('modalDate').textContent = `Date: ${item.date}`;
            document.getElementById('modalExplanation').textContent = item.explanation;
            // Show the modal
            const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
            imageModal.show();
          });
        }
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
