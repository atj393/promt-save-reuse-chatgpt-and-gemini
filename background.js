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
    }, 300); // Adjust the timeout duration as needed
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
    // Save the current input value to local storage for ChatGPT
    chrome.storage.local.set({ [url]: inputField.value.trim() }, () => {
      console.log("Input text saved for ChatGPT.");
    });
  } else if (inputFieldGemini && inputField.innerText.trim()) {
    // Save the current input value to local storage for Gemini
    chrome.storage.local.set({ [url]: inputField.innerText.trim() }, () => {
      console.log("Input text saved for Gemini.");
    });
  } else {
    // Retrieve saved text from local storage and insert into the input field
    chrome.storage.local.get([url], (result) => {
      if (result[url]) {
        if (inputFieldChatGPT) {
          inputField.value = result[url];
        } else if (inputFieldGemini) {
          inputField.innerText = result[url];
        }
        console.log("Input text retrieved.");
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

  // Retrieve saved text from local storage and append it to the input field with an empty line before
  chrome.storage.local.get([url], (result) => {
    if (result[url]) {
      if (inputFieldChatGPT) {
        inputField.value += `\n\n${result[url]}`;
        // Trigger an input event to simulate user interaction and expand the field
        const event = new Event("input", { bubbles: true });
        inputField.dispatchEvent(event);
      } else if (inputFieldGemini) {
        inputField.innerHTML += `<p><br></p><p>${result[url]}</p>`;
        // Trigger an input event to simulate user interaction and expand the field
        const event = new Event("input", { bubbles: true });
        inputField.dispatchEvent(event);
      }
      console.log("Input text appended with an empty line.");
    }
  });
}
