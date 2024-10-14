let clickTimeout;

// Listens for a click on the extension icon
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

// Sets up context menu items when the extension is installed
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

// Handles clicks on context menu items
chrome.contextMenus.onClicked.addListener((info) => {
  switch (info.menuItemId) {
    case "clearData":
      chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError) {
          console.error("Error clearing storage:", chrome.runtime.lastError);
        } else {
          console.log("All saved data cleared.");
        }
      });
      break;

    case "navigateGitHub":
      chrome.tabs.create({
        url: "https://github.com/atj393/promt-save-reuse-chatgpt-and-gemini/wiki/Prompt-Save-Reuse:-ChatGPT-&-Gemini-%E2%80%90-User-Guide",
      });
      break;

    case "creator":
      chrome.tabs.create({
        url: "https://www.linkedin.com/in/atj393/",
      });
      break;

    default:
      console.warn("Unhandled menu item:", info.menuItemId);
  }
});

// Handles the action when the extension icon is single-clicked
function handleSingleClick(tab) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: toggleInputStorage,
  });
}

// Handles the action when the extension icon is double-clicked
function handleDoubleClick(tab) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: appendStoredText,
  });
}

// Toggles the input storage functionality
function toggleInputStorage() {
  const inputFieldChatGPT =
    document.querySelector(".ProseMirror[contenteditable='true']") ||
    document.querySelector("#prompt-textarea");
  const inputFieldGemini = document.querySelector('.ql-editor[contenteditable="true"]');
  const inputField = inputFieldChatGPT || inputFieldGemini;
  const url = window.location.href;

  if (!inputField) return;

  if (inputField.innerText.trim()) {
    chrome.storage.local.set({ [url]: inputField.innerText.trim() }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error saving data:", chrome.runtime.lastError);
      }
    });
  } else {
    chrome.storage.local.get([url], (result) => {
      if (result[url]) {
        inputField.innerText = result[url];
      }
    });
  }
}

// Appends the stored text from local storage to the current content of the input field
function appendStoredText() {
  const inputFieldChatGPT =
    document.querySelector(".ProseMirror[contenteditable='true']") ||
    document.querySelector("#prompt-textarea");
  const inputFieldGemini = document.querySelector('.ql-editor[contenteditable="true"]');
  const inputField = inputFieldChatGPT || inputFieldGemini;
  const url = window.location.href;

  if (!inputField) return;

  chrome.storage.local.get([url], (result) => {
    if (result[url]) {
      if (inputFieldChatGPT) {
        inputField.innerText += `\n\n${result[url]}`;
      } else if (inputFieldGemini) {
        inputField.innerHTML += `<p><br></p><p>${result[url]}</p>`;
      }
      const event = new Event("input", { bubbles: true });
      inputField.dispatchEvent(event);
    }
  });
}
