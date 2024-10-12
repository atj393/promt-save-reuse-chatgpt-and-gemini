// Load saved settings when the options page is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    applyTheme(); // Apply the theme when the page is loaded
});

// Load settings from storage
function loadSettings() {
    chrome.storage.local.get(['autoSave', 'customCommand', 'theme'], (result) => {
        document.getElementById('auto-save').checked = result.autoSave || false;
        document.getElementById('custom-command').value = result.customCommand || '';
        document.getElementById('theme').value = result.theme || 'light';

        applyTheme(); // Apply the saved theme
    });
}

// Save settings when the form is submitted
document.getElementById('options-form').addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent form submission

    const autoSave = document.getElementById('auto-save').checked;
    const customCommand = document.getElementById('custom-command').value;
    const theme = document.getElementById('theme').value;

    // Save settings to storage
    chrome.storage.local.set({ autoSave, customCommand, theme }, () => {
        alert('Settings saved!');
        applyTheme(); // Apply the selected theme after saving
    });
});

// Function to apply the selected theme
function applyTheme() {
    const body = document.body;
    const theme = document.getElementById('theme').value;

    // Check if the theme is dark, then add or remove the 'dark-mode' class
    if (theme === 'dark') {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
    }
}

// Load auto-save preference
document.addEventListener("DOMContentLoaded", () => {
    const autoSaveCheckbox = document.getElementById("auto-save");

    // Load user preference from storage
    chrome.storage.local.get(["autoSaveEnabled"], (result) => {
        autoSaveCheckbox.checked = result.autoSaveEnabled || false; // Default to false
    });

    // Save preference on change
    autoSaveCheckbox.addEventListener("change", () => {
        chrome.storage.local.set({ autoSaveEnabled: autoSaveCheckbox.checked }, () => {
            console.log("Auto-save preference saved:", autoSaveCheckbox.checked);
        });
    });
});
