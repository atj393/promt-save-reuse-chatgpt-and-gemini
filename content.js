/**
 * This script manages the behavior of an extension that allows users to save and reuse prompts
 * within input fields on web pages like ChatGPT and Gemini. It handles single and double click
 * events to either paste previously saved content into an input field or append additional text.
 * The script also ensures the cursor is placed at the end of the inserted text and adjusts the
 * input field to display all content.
 *
 * The script works by:
 * - Listening for click events on the input field.
 * - Handling single and double clicks differently to insert or append content.
 * - Saving the current input field text to local storage for reuse.
 * - Managing the cursor position and content display within the input field.
 */

document.addEventListener("DOMContentLoaded", () => {
  const inputFieldChatGPT =
    document.querySelector(".ProseMirror[contenteditable='true']") ||
    document.querySelector("#prompt-textarea");
  const inputFieldGemini = document.querySelector(
    '.ql-editor[contenteditable="true"]'
  );
  const inputField = inputFieldChatGPT || inputFieldGemini;

  if (inputField) {
    let clickTimeout;

    inputField.addEventListener("click", (event) => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
        handleDoubleClick(inputField);
      } else {
        clickTimeout = setTimeout(() => {
          handleSingleClick(inputField);
          clickTimeout = null;
        }, 300);
      }
    });

    inputField.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      chrome.runtime.sendMessage({ action: "showContextMenu" });
    });
  }
});

/**
 * Handles the single click event by retrieving the saved text from local storage
 * and inserting it into the input field. If no saved text is found, it saves the
 * current input field text to local storage.
 *
 * @param {HTMLElement} inputField - The input field element where the text will be inserted.
 */
function handleSingleClick(inputField) {
  const url = window.location.href;

  chrome.storage.local.get([url], (result) => {
    if (result[url]) {
      insertText(inputField, result[url]);
      moveCursorToEnd(inputField);
    } else {
      saveCurrentInput(inputField, url);
    }
  });
}

/**
 * Handles the double click event by appending the saved text from local storage
 * to the current content of the input field.
 *
 * @param {HTMLElement} inputField - The input field element where the text will be appended.
 */
function handleDoubleClick(inputField) {
  const url = window.location.href;

  chrome.storage.local.get([url], (result) => {
    if (result[url]) {
      appendText(inputField, result[url]);
    }
  });
}

/**
 * Saves the current text of the input field to local storage using the URL as the key.
 *
 * @param {HTMLElement} inputField - The input field element whose text will be saved.
 * @param {string} url - The URL of the current page, used as the key in local storage.
 */
function saveCurrentInput(inputField, url) {
  const text =
    inputField.tagName === "TEXTAREA" || inputField.tagName === "INPUT"
      ? inputField.value
      : inputField.innerText;

  chrome.storage.local.set({ [url]: text });
}

/**
 * Inserts the given text into the input field, replacing any existing content.
 * For textareas, it ensures proper formatting by adding new lines.
 *
 * @param {HTMLElement} inputField - The input field element where the text will be inserted.
 * @param {string} text - The text to insert into the input field.
 */
function insertText(inputField, text) {
  if (inputField.tagName === "TEXTAREA" || inputField.tagName === "INPUT") {
    inputField.value = `${text}\n\n`;
  } else {
    inputField.innerHTML = `<p>${text}</p><p><br></p>`;
  }
}

/**
 * Appends the given text to the current content of the input field.
 * For textareas, it ensures proper formatting by adding new lines.
 *
 * @param{HTMLElement}inputField - The input field element where the text will be appended.  
 * @param {string} text - The text to append to the input field.
 */
function appendText(inputField, text) {
  if (inputField.tagName === "TEXTAREA" || inputField.tagName === "INPUT") {
    inputField.value += `\n\n${text}`;
  } else {
    inputField.innerHTML += `<p><br></p><p>${text}</p>`;
  }
}

/**
 * Moves the cursor to the end of the content in the input field.
 * This ensures that any newly inserted text is visible and the user can continue typing at the end.
 *
 * @param {HTMLElement} inputField - The input field element where the cursor will be moved.
 */
function moveCursorToEnd(inputField) {
  if (inputField.tagName === "TEXTAREA" || inputField.tagName === "INPUT") {
    inputField.focus();
    inputField.setSelectionRange(
      inputField.value.length,
      inputField.value.length
    );
  } else {
    setCaretToEnd(inputField);
  }
}

/**
 * Sets the caret (cursor) to the end of the content within a contenteditable element.
 * This is useful for ensuring the user can continue typing at the end of the inserted content.
 *
 * @param {HTMLElement} element - The contenteditable element where the caret will be positioned.
 */
function setCaretToEnd(element) {
  const range = document.createRange();
  const selection = window.getSelection();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
  element.focus();
}