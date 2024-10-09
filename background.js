let clickTimeout;

/**
 * Listens for a click on the extension icon and distinguishes between single and double clicks.
 * A single click triggers the handleSingleClick function, while a double click triggers handleDoubleClick.
 *
 * @param {chrome.tabs.Tab} tab - The current active tab where the action is performed.
 */
chrome.action.onClicked.addListener((tab) => {
  if (clickTimeout) {
    clearTimeout(clickTimeout);
    clickTimeout = null;
    handleDoubleClick(tab);
  } else {
    clickTimeout = setTimeout(() => {
      handleSingleClick(tab);
      clickTimeout = null;
    }, 300);
  }
});

/**
 * Sets up context menu items when the extension is installed.
 * These menu items allow the user to clear saved data, navigate to a GitHub page, or view the creator's profile.
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "clearData",
    title: "Clear All Saved Data",
    contexts: ["action"],
  });

  chrome.contextMenus.create({
    id: "navigateGitHub",
    title: "How to use?",
    contexts: ["action"],
  });

  chrome.contextMenus.create({
    id: "creator",
    title: "Goto Developer Profile",
    contexts: ["action"],
  });
});

/**
 * Handles clicks on context menu items by performing actions such as clearing saved data
 * or opening specific URLs.
 *
 * @param {chrome.contextMenus.OnClickData} info - Information about the context menu click event.
 */
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "clearData") {
    chrome.storage.local.clear(() => {});
  } else if (info.menuItemId === "navigateGitHub") {
    chrome.tabs.create({
      url: "https://github.com/atj393/promt-save-reuse-chatgpt-and-gemini/wiki/Prompt-Save-Reuse:-ChatGPT-&-Gemini-%E2%80%90-User-Guide",
    });
  } else if (info.menuItemId === "creator") {
    chrome.tabs.create({
      url: "https://www.linkedin.com/in/atj393/",
    });
  }
});

/**
 * Handles the action when the extension icon is single-clicked.
 * It injects a script into the active tab that either saves the current input or
 * retrieves and inserts saved text into the input field.
 *
 * @param {chrome.tabs.Tab} tab - The current active tab where the action is performed.
 */
function handleSingleClick(tab) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: toggleInputStorage,
  });
}

/**
 * Handles the action when the extension icon is double-clicked.
 * It injects a script into the active tab that appends the saved text to the existing content in the input field.
 *
 * @param {chrome.tabs.Tab} tab - The current active tab where the action is performed.
 */
function handleDoubleClick(tab) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: appendStoredText,
  });
}

/**
 * Toggles the input storage functionality by either saving the current input field text
 * to local storage or retrieving and inserting saved text into the input field.
 *
 * This function is injected into the active tab and interacts directly with the DOM of the page.
 */
function toggleInputStorage() {
  const inputFieldChatGPT = document.querySelector("#prompt-textarea");
  const inputFieldGemini = document.querySelector('.ql-editor');
  const inputField = inputFieldChatGPT || inputFieldGemini;
  const url = window.location.href;

  if (!inputField) return;

  if (inputField) {
    if(inputField && inputField.innerText.trim()){
      chrome.storage.local.set({ [url]: inputField.innerText.trim() }, () => {});
    } else {
      chrome.storage.local.get([url], (result) => {
        if (result[url] == undefined) {
          alert("Empty Input Field. Please type something in the search bar.");
        } else {
          inputField.innerText = result[url];
        }
      });
    }
  }
}

/**
 * Appends the stored text from local storage to the current content of the input field.
 * It ensures that the input field content is updated and triggers an input event to reflect changes.
 *
 * This function is injected into the active tab and interacts directly with the DOM of the page.
 */
function appendStoredText() {
  const inputFieldChatGPT = document.querySelector("#prompt-textarea");
  const inputFieldGemini = document.querySelector(
    '.ql-editor[contenteditable="true"]'
  );
  const inputField = inputFieldChatGPT || inputFieldGemini;
  const url = window.location.href;

  if (!inputField) return;

  chrome.storage.local.get([url], (result) => {
    if (result[url]) {
      if (inputFieldChatGPT) {
        inputField.value += `\n\n${result[url]}`;
        const event = new Event("input", { bubbles: true });
        inputField.dispatchEvent(event);
      } else if (inputFieldGemini) {
        inputField.innerHTML += `<p><br></p><p>${result[url]}</p>`;
        const event = new Event("input", { bubbles: true });
        inputField.dispatchEvent(event);
      }
    }
  });
}
