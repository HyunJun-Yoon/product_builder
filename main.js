import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

let classifier;
const imageUpload = document.getElementById('imageUpload');
const previewImage = document.getElementById('previewImage');
const imagePreviewText = document.querySelector('.image-preview p');
const classifyButton = document.getElementById('classifyButton');
const predictionsList = document.getElementById('predictionsList');

// Function to load the AI vs Human Image Detector model
async function loadModel() {
    console.log("Loading AI vs Human Image Detector model...");
    classifyButton.disabled = true; // Disable button while loading
    classifyButton.textContent = "Loading AI Detector Model...";
    try {
        classifier = await pipeline('image-classification', 'Ateeqq/ai-vs-human-image-detector');
        console.log("AI vs Human Image Detector model loaded.");
        classifyButton.disabled = false; // Enable button once loaded
        classifyButton.textContent = "Classify Image";
    } catch (error) {
        console.error("Failed to load model:", error);
        predictionsList.innerHTML = '<li>Error loading AI detector model. Please try again or check your internet connection.</li>';
        classifyButton.textContent = "Error Loading Model";
    }
}

// Function to handle image upload and preview
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block'; // Show the image
            imagePreviewText.style.display = 'none'; // Hide the text
            classifyButton.disabled = false; // Enable classify button
            predictionsList.innerHTML = ''; // Clear previous predictions
        };
        reader.readAsDataURL(file);
    } else {
        previewImage.src = '#';
        previewImage.style.display = 'none'; // Hide the image
        imagePreviewText.style.display = 'block'; // Show the text
        classifyButton.disabled = true; // Disable classify button
        predictionsList.innerHTML = ''; // Clear predictions
    }
});

// Function to classify the image
classifyButton.addEventListener('click', async () => {
    if (!classifier) {
        alert("AI Detector model not loaded yet. Please wait.");
        return;
    }
    if (previewImage.style.display === 'none' || !previewImage.src || previewImage.src === '#') {
        alert("Please upload an image first.");
        return;
    }

    classifyButton.disabled = true;
    classifyButton.textContent = "Detecting AI image...";
    predictionsList.innerHTML = '<li><p>Analyzing image...</p></li>';

    try {
        // Perform classification using the loaded pipeline
        const output = await classifier(previewImage);
        
        // Output structure for 'Ateeqq/ai-vs-human-image-detector' is typically
        // [{ label: 'fake', score: 0.99 }, { label: 'real', score: 0.01 }]
        // or similar. We want to display the top 2.
        displayPredictions(output);
    } catch (error) {
        console.error("Error during classification:", error);
        predictionsList.innerHTML = '<li>Error during AI image detection.</li>';
    } finally {
        classifyButton.disabled = false;
        classifyButton.textContent = "Classify Image";
    }
});

// Function to display predictions
function displayPredictions(predictions) {
    predictionsList.innerHTML = ''; // Clear previous predictions
    if (!predictions || predictions.length === 0) {
        predictionsList.innerHTML = '<li>No clear detection results.</li>';
        return;
    }

    // Sort by score in descending order and take the top ones
    const sortedPredictions = predictions.sort((a, b) => b.score - a.score);

    sortedPredictions.forEach(p => {
        const li = document.createElement('li');
        const labelText = p.label === 'fake' ? 'AI Generated' : (p.label === 'real' ? 'Human Made' : p.label);
        li.innerHTML = `<span>${labelText}</span> <span>${(p.score * 100).toFixed(2)}%</span>`;
        predictionsList.appendChild(li);
    });
}

// Start loading the model when the page loads
loadModel();