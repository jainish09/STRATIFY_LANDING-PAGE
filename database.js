/**
 * database.js
 * Handles the Firebase Backend Connection and Form Submissions.
 */

// --- Firebase Initialization ---
// Configuration provided by the user
const firebaseConfig = {
    apiKey: "AIzaSyDDWY7pLUYKKXMbM5ppiyXMgErXGiprd-k",
    authDomain: "stratify-6a696.firebaseapp.com",
    projectId: "stratify-6a696",
    storageBucket: "stratify-6a696.firebasestorage.app",
    messagingSenderId: "950340236076",
    appId: "1:950340236076:web:8c547a2f06b1bb24057289",
    measurementId: "G-1L3RLJWDB2"
};

// Initialize Firebase
if (!firebase.apps.length) {
    const app = firebase.initializeApp(firebaseConfig);
    firebase.analytics(); // Initialize analytics as requested
}
const db = firebase.firestore();
window.db = db; // Make global for other scripts (main.js)

document.addEventListener('DOMContentLoaded', () => {

    const connectForm = document.getElementById('connectForm');
    const otpForm = document.getElementById('otpForm');
    const formView = document.getElementById('formView');
    const otpView = document.getElementById('otpView');
    const successView = document.getElementById('successView');

    // Store variables globally between steps
    let pendingFullName, pendingCompanyName, pendingPersonalEmail, pendingCompanyEmail, pendingPhone;

    if (connectForm && otpForm) {
        // Initialize International Telephone Input
        const phoneInputField = document.querySelector("#phoneNum");
        const phoneInput = window.intlTelInput(phoneInputField, {
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js",
            initialCountry: "in",
            separateDialCode: true,
            preferredCountries: ["in", "us", "uk", "ae"],
        });

        // Handle Form Submission -> Insert Data directly
        connectForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = document.getElementById('mainSubmitBtn');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Submitting...';
            submitBtn.disabled = true;

            // Gather Data
            const fullName = document.getElementById('fullName').value;
            const companyName = document.getElementById('companyName').value;
            const personalEmail = document.getElementById('emailAddr').value;
            const companyEmail = document.getElementById('companyEmail').value;
            const phone = phoneInput.getNumber();

            // Validate Phone Number
            if (!phoneInput.isValidNumber()) {
                alert("Please enter a valid phone number for the selected country.");
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                return;
            }

            // Validate Email Typos
            const emailTypos = /@(gamil\.com|gmal\.com|gmail\.con|gamil\.con|yahoo\.con|yaho\.com|hotmal\.com|hotmai\.com)$/i;
            if (emailTypos.test(personalEmail)) {
                alert("It looks like there is a typo in your personal email address. Please check and try again.");
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                return;
            }
            if (emailTypos.test(companyEmail)) {
                alert("It looks like there is a typo in your company email address. Please check and try again.");
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                return;
            }

            try {
                // Insert the Form Data into Firestore Collection 'connect_requests'
                await db.collection('connect_requests').add({
                    full_name: fullName,
                    company_name: companyName,
                    personal_email: personalEmail,
                    company_email: companyEmail,
                    phone_number: phone,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp() // Optional: add a server-side timestamp
                });

                // Success! Hide main form, show Success UI directly
                formView.style.display = 'none';
                if (otpView) otpView.style.display = 'none';
                successView.style.display = 'block';

            } catch (error) {
                console.error('DB Error:', error);
                alert("Error: " + (error.message || "Database error. Please try again."));

                // Re-enable button on error
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
});
