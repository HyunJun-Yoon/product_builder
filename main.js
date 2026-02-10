document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generate-lotto');
    const numBallsInput = document.getElementById('num-balls');
    const maxRangeInput = document.getElementById('max-range');
    const lottoNumbersDiv = document.getElementById('lotto-numbers');
    const themeToggleButton = document.getElementById('theme-toggle');
    const body = document.body;

    // Apply saved theme on load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.add(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // If no saved theme, check system preference
        body.classList.add('dark-mode');
    }

    themeToggleButton.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const currentTheme = body.classList.contains('dark-mode') ? 'dark-mode' : '';
        localStorage.setItem('theme', currentTheme);
    });

    generateButton.addEventListener('click', () => {
        const numBalls = parseInt(numBallsInput.value);
        const maxRange = parseInt(maxRangeInput.value);

        if (isNaN(numBalls) || isNaN(maxRange) || numBalls <= 0 || maxRange <= 0 || numBalls > maxRange) {
            lottoNumbersDiv.innerHTML = '<p class="error">Please enter valid numbers. Number of balls cannot exceed max range.</p>';
            return;
        }

        const lottoNumbers = generateLottoNumbers(numBalls, maxRange);
        displayLottoNumbers(lottoNumbers, lottoNumbersDiv);
    });

    function generateLottoNumbers(count, max) {
        const numbers = new Set();
        while (numbers.size < count) {
            const randomNumber = Math.floor(Math.random() * max) + 1;
            numbers.add(randomNumber);
        }
        return Array.from(numbers).sort((a, b) => a - b);
    }

    function displayLottoNumbers(numbers, displayElement) {
        displayElement.innerHTML = ''; // Clear previous numbers
        if (numbers.length === 0) {
            displayElement.innerHTML = '<p>No numbers generated.</p>';
            return;
        }

        const ul = document.createElement('ul');
        numbers.forEach(number => {
            const li = document.createElement('li');
            li.textContent = number;
            ul.appendChild(li);
        });
        displayElement.appendChild(ul);
    }

    // Contact Form Logic
    const form = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (form) { // Check if form exists on the page
        form.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            const formData = new FormData(form);

            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    formStatus.textContent = 'Thanks for your submission!';
                    formStatus.className = 'success';
                    form.reset(); // Clear the form
                } else {
                    const data = await response.json();
                    if (data.errors) {
                        formStatus.textContent = data.errors.map(error => error.message).join(', ');
                    } else {
                        formStatus.textContent = 'Oops! There was a problem submitting your form.';
                    }
                    formStatus.className = 'error';
                }
            } catch (error) {
                formStatus.textContent = 'Oops! An error occurred. Please try again later.';
                formStatus.className = 'error';
                console.error('Form submission error:', error);
            }
        });
    }
});
