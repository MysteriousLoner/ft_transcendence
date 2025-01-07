// Google Translate Initialization
function googleTranslateElementInit() {
    console.log("Google Translate initialized");

    // Initialize Google Translate
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,zh-CN,ms',
        autoDisplay: false
    }, 'google_translate_element');

    // Use a delay to ensure Google Translate has fully initialized and added elements to the page
    setTimeout(function() {
        var translateElement = document.getElementById('google_translate_element');

    }, 1500); // Wait 1.5 second to allow Google Translate to render its elements
}

// Language Change Functions
function translate_eng() {
    console.log("English button clicked");
    changeLanguage('en');
}

function translate_chi() {
    console.log("Chinese button clicked");
    changeLanguage('zh-CN');
}

function translate_mly() {
    console.log("Malay button clicked");
    changeLanguage('ms');
}

// Generic Language Change Logic
function changeLanguage(lang) {
    console.log(`Changing language to: ${lang}`);

    // Wait for Google Translate to fully initialize
    setTimeout(function() {
        const googleTranslateCombo = document.querySelector('select.goog-te-combo');
        
        if (googleTranslateCombo) {
            console.log("Dropdown found. Changing language...");
            googleTranslateCombo.value = lang;  // Set the language
            googleTranslateCombo.dispatchEvent(new Event('change')); // Trigger the change event
        } else {
            console.error("Google Translate dropdown not found!");
        }
    }, 1500); // Increased delay of 1.5 seconds
}
