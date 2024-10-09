// toggleInputStorage.js

export function toggleInputStorage() {
    const inputFieldChatGPT =
      document.querySelector(".ProseMirror[contenteditable='true']") ||
      document.querySelector("#prompt-textarea");
    const inputFieldGemini = document.querySelector(
      '.ql-editor[contenteditable="true"]'
    );
    const inputField = inputFieldChatGPT || inputFieldGemini;
    const url = window.location.href;
  
    if (!inputField) return;
  
    if (inputFieldChatGPT && inputField.innerText.trim()) {
      chrome.storage.local.set({ [url]: inputField.innerText.trim() }, () => {});
    } else if (inputFieldGemini && inputField.innerText.trim()) {
      chrome.storage.local.set({ [url]: inputField.innerText.trim() }, () => {});
    } else {
      chrome.storage.local.get([url], (result) => {
        if (result[url]) {
          if (inputFieldChatGPT) {
            inputField.innerText = result[url];
          } else if (inputFieldGemini) {
            inputField.innerHTML = result[url];
          }
        }
      });
    }
  }
  
  export function appendStoredText() {
    const inputFieldChatGPT =
      document.querySelector(".ProseMirror[contenteditable='true']") ||
      document.querySelector("#prompt-textarea");
    const inputFieldGemini = document.querySelector(
      '.ql-editor[contenteditable="true"]'
    );
    const inputField = inputFieldChatGPT || inputFieldGemini;
    const url = window.location.href;
  
    if (!inputField) return;
  
    chrome.storage.local.get([url], (result) => {
      if (result[url]) {
        if (inputFieldChatGPT) {
          inputField.innerText += `\n\n ${ result[url] } ` ;
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
  