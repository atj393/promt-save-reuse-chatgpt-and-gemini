
# Prompt Save Reuse: ChatGPT & Gemini

Enhance your productivity with AI platforms by saving and reusing prompts. This extension allows you to save your input prompts and reuse them effortlessly in ChatGPT and Gemini.

## 🎃 Hacktoberfest 2024 🎃

We are participating in Hacktoberfest 2024! If you’re looking to contribute, we would love your help. Check out the issues labeled with `hacktoberfest` and `good-first-issue` to get started.

- **[View Hacktoberfest Issues](https://github.com/atj393/promt-save-reuse-chatgpt-and-gemini/issues)**

Feel free to fork the repository and submit your pull requests to help us improve the extension.

## Features

- **Single Click**: Save the current text from the input field to the browser's local storage. If there is already saved content for that URL, it will paste that content into the input field.
- **Double Click**: Append the saved text to whatever text is currently in the input field, ensuring efficient reuse of prompts.
- **Right Click**: Access a context menu with options to clear all saved texts and navigate to the GitHub page for the extension.

## How to Use

1. **Single Click**: 
   - If there's text in the input field, it will be saved to the browser's local storage for the current URL.
   - If the input field is empty and there's already saved data associated with the current URL, that data will be retrieved from local storage and inserted into the input field.

2. **Double Click**: 
   - This will always append the saved text from local storage to the input field below the current content, with an empty line before the appended text.

3. **Right Click**:
   - **Clear All Saved Data**: Clears all saved data from the local storage.
   - **Go to GitHub Page**: Navigates to the GitHub page for the extension.

## Installation

### For End Users:
1. Clone or download this repository to your local machine.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" by toggling the switch in the top right corner.
4. Click on "Load unpacked" and select the directory where you cloned/downloaded this repository.

### For Contributors:
1. **Fork** this repository.
2. **Clone** your fork:  
   ```bash
   git clone https://github.com/YOUR-USERNAME/promt-save-reuse-chatgpt-and-gemini.git
   ```
3. Navigate into the project directory:  
   ```bash
   cd promt-save-reuse-chatgpt-and-gemini
   ```
4. Install dependencies if necessary.

5. Load the extension in Chrome for testing:
   - Go to `chrome://extensions/`.
   - Enable "Developer mode".
   - Click on "Load unpacked" and select the project directory.

6. Make changes, test, and create a pull request following the guidelines in the `CONTRIBUTING.md` file.

## Technical Details

### Manifest File
The `manifest.json` file configures the extension, specifying permissions, scripts, and other settings.

### Background Script
Handles the click events on the extension icon and manages context menu actions.

### Content Script
No specific code is required in `content.js` for this functionality as it is managed by the injected functions in the background script.

## Contributing
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a pull request.

Make sure to check out the issues labeled with `good-first-issue` and `hacktoberfest` for beginner-friendly contributions.

## Contact
If you have any questions or want to discuss contributions, feel free to reach out:

- Open an issue on GitHub
- Connect with us on LinkedIn: [Your LinkedIn Profile](#)

## License
Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
