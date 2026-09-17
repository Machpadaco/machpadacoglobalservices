document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('home-contact-form');
    const feedbackBox = document.getElementById('form-feedback');
    const submitBtn = document.getElementById('submit-btn');

    if (!contactForm) return;

    // Detect environment
    // Local development → http://localhost:5000
    // Live Render website → https://machpadacoglobalservices-api.onrender.com
    const API_BASE_URL =
        (window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1')
            ? 'http://localhost:5000'
            : 'https://machpadacoglobalservices-api.onrender.com';

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // UI Loading State
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        feedbackBox.style.display = 'none';

        const formData = {
            name: document.getElementById('contact-name').value.trim(),
            email: document.getElementById('contact-email').value.trim(),
            service: document.getElementById('contact-service').value,
            message: document.getElementById('contact-message').value.trim()
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            feedbackBox.style.display = 'block';

            if (response.ok && result.success) {
                feedbackBox.className = 'form-feedback-box success';
                feedbackBox.textContent =
                    result.message ||
                    'Thank you! Your message has been sent.';

                contactForm.reset();
            } else {
                feedbackBox.className = 'form-feedback-box error';
                feedbackBox.textContent =
                    result.message ||
                    'Something went wrong. Please try again.';
            }

        } catch (error) {
            console.error(
                'Contact form submission error:',
                error
            );

            feedbackBox.style.display = 'block';
            feedbackBox.className = 'form-feedback-box error';
            feedbackBox.textContent =
                'Network error. Please check your connection and try again.';

        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    });
});