let clickTimeout;

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
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "clearData") {
    chrome.storage.local.clear(() => {});
  } else if (info.menuItemId === "navigateGitHub") {
    chrome.tabs.create({
      url: "https://github.com/atj393/promt-save-reuse-chatgpt-and-gemini/wiki/Prompt-Save-Reuse:-ChatGPT-&-Gemini-%E2%80%90-User-Guide",
    });
  }
});

function handleSingleClick(tab) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: toggleInputStorage,
  });
}

function handleDoubleClick(tab) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: appendStoredText,
  });
}

function toggleInputStorage() {
  const inputFieldChatGPT = document.querySelector("input, textarea");
  const inputFieldGemini = document.querySelector(
    '.ql-editor[contenteditable="true"]'
  );
  const inputField = inputFieldChatGPT || inputFieldGemini;
  const url = window.location.href;

  if (!inputField) return;

  if (inputFieldChatGPT && inputField.value.trim()) {
    chrome.storage.local.set({ [url]: inputField.value.trim() }, () => {});
  } else if (inputFieldGemini && inputField.innerText.trim()) {
    chrome.storage.local.set({ [url]: inputField.innerText.trim() }, () => {});
  } else {
    chrome.storage.local.get([url], (result) => {
      if (result[url]) {
        if (inputFieldChatGPT) {
          inputField.value = result[url];
        } else if (inputFieldGemini) {
          inputField.innerText = result[url];
        }
      }
    });
  }
}

function appendStoredText() {
  const inputFieldChatGPT = document.querySelector("input, textarea");
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
