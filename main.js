import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

let classifier;
let alertModelNotLoadedMsg, alertUploadImageFirstMsg, loadingModelMsg, analyzingImageMsg,
    errorLoadingModelMsg, errorDetectingImageMsg, noDetectionResultsMsg, aiGeneratedMsg, humanMadeMsg;

const translations = {
    ko: {
        h1: 'AI 이미지 판별기',
        uploadAreaP1: '여기에 이미지를 드래그 앤 드롭하거나, 클릭하여 파일을 선택하세요',
        uploadAreaP2: '(.jpg, .png, .webp 등)',
        imagePreviewP: '시작하려면 이미지를 업로드하세요.',
        classifyButton: 'AI 판별하기',
        h2: '판별 결과',
        alertModelNotLoaded: 'AI 판별 모델이 아직 로드되지 않았습니다. 잠시 기다려 주세요.',
        alertUploadImageFirst: '먼저 이미지를 업로드해 주세요.',
        loadingModel: 'AI 판별 모델 로드 중...',
        analyzingImage: '이미지 분석 중...',
        errorLoadingModel: 'AI 판별 모델 로드 오류.',
        errorDetectingImage: 'AI 이미지 판별 중 오류 발생.',
        noDetectionResults: '명확한 판별 결과가 없습니다.',
        aiGenerated: 'AI 생성',
        humanMade: '사람 제작',
    },
    en: {
        h1: 'AI Image Detector',
        uploadAreaP1: 'Drag & Drop your image here, or click to select file',
        uploadAreaP2: '(.jpg, .png, .webp, etc.)',
        imagePreviewP: 'Upload an image to get started.',
        classifyButton: 'Detect AI',
        h2: 'Detection Results',
        alertModelNotLoaded: 'AI Detector model not loaded yet. Please wait.',
        alertUploadImageFirst: 'Please upload an image first.',
        loadingModel: 'Loading AI Detector Model...',
        analyzingImage: 'Analyzing image...',
        errorLoadingModel: 'Error loading AI detector model.',
        errorDetectingImage: 'Error during AI image detection.',
        noDetectionResults: 'No clear detection results.',
        aiGenerated: 'AI Generated',
        humanMade: 'Human Made',
    }
};

let currentLang = localStorage.getItem('lang') || 'ko'; // Default to Korean

// All DOM-related operations should be inside DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const previewImage = document.getElementById('previewImage');
    const imagePreviewText = document.querySelector('.image-preview p');
    const classifyButton = document.getElementById('classifyButton');
    const predictionsList = document.getElementById('predictionsList');
    const langToggleKo = document.getElementById('langToggleKo');
    const langToggleEn = document.getElementById('langToggleEn');

    const uiElements = {
        h1: document.querySelector('h1'),
        uploadAreaP1: document.querySelector('.upload-area p:first-of-type'),
        uploadAreaP2: document.querySelector('.upload-area p:last-of-type'),
        imagePreviewP: document.querySelector('.image-preview p'),
        classifyButton: classifyButton,
        h2: document.querySelector('.results h2'),
        predictionsList: predictionsList, // Used for innerHTML changes
    };

    function updateUI(lang) {
        uiElements.h1.textContent = translations[lang].h1;
        uiElements.uploadAreaP1.textContent = translations[lang].uploadAreaP1;
        uiElements.uploadAreaP2.textContent = translations[lang].uploadAreaP2;
        uiElements.imagePreviewP.textContent = translations[lang].imagePreviewP;
        uiElements.classifyButton.textContent = translations[lang].classifyButton;
        uiElements.h2.textContent = translations[lang].h2;

        // Update alert messages used in functions
        alertModelNotLoadedMsg = translations[lang].alertModelNotLoaded;
        alertUploadImageFirstMsg = translations[lang].alertUploadImageFirst;
        loadingModelMsg = translations[lang].loadingModel;
        analyzingImageMsg = translations[lang].analyzingImage;
        errorLoadingModelMsg = translations[lang].errorLoadingModel;
        errorDetectingImageMsg = translations[lang].errorDetectingImage;
        noDetectionResultsMsg = translations[lang].noDetectionResults;
        aiGeneratedMsg = translations[lang].aiGenerated;
        humanMadeMsg = translations[lang].humanMade;

        // Update active state of language buttons
        if (langToggleKo) langToggleKo.classList.remove('active');
        if (langToggleEn) langToggleEn.classList.remove('active');

        if (lang === 'ko') {
            if (langToggleKo) langToggleKo.classList.add('active');
        } else {
            if (langToggleEn) langToggleEn.classList.add('active');
        }
        currentLang = lang;
        localStorage.setItem('lang', lang);
    }

    // Function to load the AI vs Human Image Detector model
    async function loadModel() {
        console.log(loadingModelMsg);
        classifyButton.disabled = true; // Disable button while loading
        classifyButton.textContent = loadingModelMsg;
        try {
            classifier = await pipeline('image-classification', 'Ateeqq/ai-vs-human-image-detector');
            console.log("AI vs Human Image Detector model loaded.");
            classifyButton.disabled = false; // Enable button once loaded
            classifyButton.textContent = translations[currentLang].classifyButton;
        } catch (error) {
            console.error(errorLoadingModelMsg, error);
            predictionsList.innerHTML = `<li>${errorLoadingModelMsg}</li>`;
            classifyButton.textContent = errorLoadingModelMsg;
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
            alert(alertModelNotLoadedMsg);
            return;
        }
        if (previewImage.style.display === 'none' || !previewImage.src || previewImage.src === '#') {
            alert(alertUploadImageFirstMsg);
            return;
        }

        classifyButton.disabled = true;
        classifyButton.textContent = analyzingImageMsg;
        predictionsList.innerHTML = `<li><p>${analyzingImageMsg}</p></li>`;

        try {
            const output = await classifier(previewImage);
            displayPredictions(output);
        } catch (error) {
            console.error(errorDetectingImageMsg, error);
            predictionsList.innerHTML = `<li>${errorDetectingImageMsg}</li>`;
        } finally {
            classifyButton.disabled = false;
            classifyButton.textContent = translations[currentLang].classifyButton;
        }
    });

    // Function to display predictions
    function displayPredictions(predictions) {
        predictionsList.innerHTML = ''; // Clear previous predictions
        if (!predictions || predictions.length === 0) {
            predictionsList.innerHTML = `<li>${noDetectionResultsMsg}</li>`;
            return;
        }

        const sortedPredictions = predictions.sort((a, b) => b.score - a.score);

        sortedPredictions.forEach(p => {
            const li = document.createElement('li');
            let labelText = p.label;
            if (p.label.toLowerCase().includes('fake')) {
                labelText = aiGeneratedMsg;
            } else if (p.label.toLowerCase().includes('real')) {
                labelText = humanMadeMsg;
            }
            li.innerHTML = `<span>${labelText}</span> <span>${(p.score * 100).toFixed(2)}%</span>`;
            predictionsList.appendChild(li);
        });
    }

    // Add event listeners for language toggle buttons
    if (langToggleKo) langToggleKo.addEventListener('click', () => updateUI('ko'));
    if (langToggleEn) langToggleEn.addEventListener('click', () => updateUI('en'));

    // Initialize UI with the current language preference
    updateUI(currentLang);
    // Start loading the model when the page loads
    loadModel();
});