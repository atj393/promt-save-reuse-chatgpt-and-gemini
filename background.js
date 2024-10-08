let clickTimeout;

/**
 * Listener for the extension icon click event. Determines if the click is a single or double click.
 * A single click triggers the `handleSingleClick` function, and a double click triggers `handleDoubleClick`.
 * 
 * - If there's no existing click, it waits 300ms to see if it's a double-click; otherwise, it calls `handleSingleClick`.
 * - If another click happens within 300ms, it clears the timeout and calls `handleDoubleClick`.
 * 
 * @param {chrome.tabs.Tab} tab - The current active tab where the extension icon was clicked.
 */
chrome.action.onClicked.addListener((tab) => {
  if (clickTimeout) {
    clearTimeout(clickTimeout); // Clear timeout for single-click if it's a double-click
    clickTimeout = null;
    handleDoubleClick(tab);     // Trigger double-click action
  } else {
    clickTimeout = setTimeout(() => {
      handleSingleClick(tab);   // Trigger single-click action
      clickTimeout = null;      // Reset click timeout
    }, 300); // 300ms delay to differentiate between single and double clicks
  }
});

/**
 * Listener for when the extension is installed. It sets up context menu items for specific actions:
 * - Clearing saved data
 * - Navigating to a GitHub user guide page
 * - Visiting the developer's LinkedIn profile
 */
chrome.runtime.onInstalled.addListener(() => {
  // Create a context menu item to clear all saved data
  chrome.contextMenus.create({
    id: "clearData",
    title: "Clear All Saved Data",
    contexts: ["action"],
  });

  // Create a context menu item to navigate to the GitHub usage page
  chrome.contextMenus.create({
    id: "navigateGitHub",
    title: "How to use?",
    contexts: ["action"],
  });

  // Create a context menu item to navigate to the developer's LinkedIn profile
  chrome.contextMenus.create({
    id: "creator",
    title: "Goto Developer Profile",
    contexts: ["action"],
  });
});

/**
 * Handles actions when a context menu item is clicked. Depending on the menu item clicked,
 * the function performs different actions:
 * - Clears saved data if "clearData" is selected
 * - Opens a new tab with a specific URL for "navigateGitHub" or "creator"
 * 
 * @param {chrome.contextMenus.OnClickData} info - Object containing details about the clicked menu item.
 */
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "clearData") {
    chrome.storage.local.clear(() => {}); // Clear all local storage data
  } else if (info.menuItemId === "navigateGitHub") {
    // Open the GitHub user guide in a new tab
    chrome.tabs.create({
      url: "https://github.com/atj393/promt-save-reuse-chatgpt-and-gemini/wiki/Prompt-Save-Reuse:-ChatGPT-&-Gemini-%E2%80%90-User-Guide",
    });
  } else if (info.menuItemId === "creator") {
    // Open the developer's LinkedIn profile in a new tab
    chrome.tabs.create({
      url: "https://www.linkedin.com/in/atj393/",
    });
  }
});

/**
 * Function to handle the action when the extension icon is single-clicked.
 * It injects the `toggleInputStorage` function into the active tab to save or retrieve input field text.
 * 
 * @param {chrome.tabs.Tab} tab - The current active tab where the action is performed.
 */
function handleSingleClick(tab) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },     // Specify the tab where the script should be injected
    function: toggleInputStorage,  // Inject the function to handle storage toggling
  });
}

/**
 * Function to handle the action when the extension icon is double-clicked.
 * It injects the `appendStoredText` function into the active tab to append the stored text to the input field.
 * 
 * @param {chrome.tabs.Tab} tab - The current active tab where the action is performed.
 */
function handleDoubleClick(tab) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },    // Specify the tab where the script should be injected
    function: appendStoredText,   // Inject the function to append stored text
  });
}

/**
 * Toggles the input storage by either saving the current input field text to local storage 
 * or retrieving the saved text from local storage and inserting it back into the input field.
 * 
 * - Works with both ChatGPT and Gemini input fields.
 * - If the input field contains text, it saves it; otherwise, it retrieves saved text for the current URL.
 * 
 * This function is injected into the active tab and interacts directly with the DOM.
 */
function toggleInputStorage() {
  const inputFieldChatGPT = document.querySelector("#prompt-textarea");   // ChatGPT input field
  const inputFieldGemini = document.querySelector('.ql-editor[contenteditable="true"]'); // Gemini input field
  const inputField = inputFieldChatGPT || inputFieldGemini;   // Determine which input field is present
  const url = window.location.href;   // Get the current page's URL

  if (!inputField) return;   // Exit if no valid input field is found

  // If the ChatGPT input field has text, save it
  if (inputFieldChatGPT && inputField.value.trim()) {
    chrome.storage.local.set({ [url]: inputField.value.trim() }, () => {});
  }
  // If the Gemini input field has text, save it
  else if (inputFieldGemini && inputField.innerText.trim()) {
    chrome.storage.local.set({ [url]: inputField.innerText.trim() }, () => {});
  }
  // Otherwise, try to retrieve and insert saved text into the input field
  else {
    chrome.storage.local.get([url], (result) => {
      if (result[url]) {
        if (inputFieldChatGPT) {
          inputField.value = result[url];  // Insert saved text into ChatGPT input field
        } else if (inputFieldGemini) {
          inputField.innerHTML = result[url];  // Insert saved text into Gemini input field
        }
      }
    });
  }
}

/**
 * Appends the stored text from local storage to the current content of the input field.
 * 
 * - It retrieves the saved text from local storage for the current URL and appends it to the existing input field content.
 * - This function supports both ChatGPT and Gemini input fields. 
 * This function is injected into the active tab and interacts directly with the DOM.
 */
function appendStoredText() {
  const inputFieldChatGPT = document.querySelector("#prompt-textarea");   // ChatGPT input field
  const inputFieldGemini = document.querySelector('.ql-editor[contenteditable="true"]');  // Gemini input field
  const inputField = inputFieldChatGPT || inputFieldGemini;  // Determine which input field is present
  const url = window.location.href;  // Get the current page's URL

  if (!inputField) return;  // Exit if no valid input field is found

  // Retrieve the stored text from local storage and append it to the input field
  chrome.storage.local.get([url], (result) => {
    if (result[url]) {
      if (inputFieldChatGPT) {
        inputField.value += `\n\n${result[url]}`;  // Append stored text to ChatGPT input field
        const event = new Event("input", { bubbles: true });  // Trigger input event to update the field
        inputField.dispatchEvent(event);
      } else if (inputFieldGemini) {
        inputField.innerHTML += `<p><br></p><p>${result[url]}</p>`;  // Append stored text to Gemini input field
        const event = new Event("input", { bubbles: true });  // Trigger input event to update the field
        inputField.dispatchEvent(event);
      }
    }
  });
}
