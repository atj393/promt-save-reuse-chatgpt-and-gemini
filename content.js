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

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

function findInputField() {
  return (
    document.querySelector(".ProseMirror[contenteditable='true']") ||
    document.querySelector("#prompt-textarea") ||
    document.querySelector('.ql-editor[contenteditable="true"]') ||
    document.querySelector('#ask-input[contenteditable="true"]') ||
    document.querySelector("textarea.w-full.bg-transparent") ||
    document.querySelector('textarea[placeholder="Message DeepSeek"]')
  );
}

function attachListeners(inputField) {
  let clickTimeout;

  inputField.addEventListener(
    "click",
    debounce((event) => {
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
    }, 100)
  );

  inputField.addEventListener(
    "contextmenu",
    debounce((event) => {
      event.preventDefault();
      chrome.runtime.sendMessage({ action: "showContextMenu" });
    }, 100)
  );
}

function initWithObserver() {
  const existing = findInputField();
  if (existing) {
    attachListeners(existing);
    return;
  }

  const observer = new MutationObserver(() => {
    const inputField = findInputField();
    if (inputField) {
      observer.disconnect();
      attachListeners(inputField);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

document.addEventListener("DOMContentLoaded", initWithObserver);

/**
 * Handles the single click event by retrieving the saved text from local storage
 * and inserting it into the input field. If no saved text is found, it saves the
 * current input field text to local storage.
 *
 * @param {HTMLElement} inputField - The input field element where the text will be inserted.
 */
function handleSingleClick(inputField) {
  const url = window.location.href;
  const currentText =
    inputField.tagName === "TEXTAREA" || inputField.tagName === "INPUT"
      ? inputField.value.trim()
      : inputField.innerText.trim();

  if (currentText) {
    saveCurrentInput(inputField, url);
  } else {
    chrome.storage.sync.get([url], (result) => {
      if (result[url]) {
        insertText(inputField, result[url]);
        moveCursorToEnd(inputField);
      }
    });
  }
}

/**
 * Handles the double click event by appending the saved text from local storage
 * to the current content of the input field.
 *
 * @param {HTMLElement} inputField - The input field element where the text will be appended.
 */
function handleDoubleClick(inputField) {
  const url = window.location.href;

  chrome.storage.sync.get([url], (result) => {
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

  chrome.storage.sync.set({ [url]: text });
}

/**
 * Inserts the given text into the input field, replacing any existing content.
 * For textareas, it ensures proper formatting by adding new lines.
 *
 * @param {HTMLElement} inputField - The input field element where the text will be inserted.
 * @param {string} text - The text to insert into the input field.
 */
function setNativeValue(inputField, text) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
  nativeInputValueSetter.call(inputField, text);
  inputField.dispatchEvent(new Event("input", { bubbles: true }));
}

function insertTextLexical(inputField, text) {
  inputField.focus();
  document.execCommand("selectAll", false, null);
  document.execCommand("insertText", false, text);
}

function insertText(inputField, text) {
  if (inputField.tagName === "TEXTAREA" || inputField.tagName === "INPUT") {
    setNativeValue(inputField, `${text}\n\n`);
  } else if (inputField.dataset.lexicalEditor === "true") {
    insertTextLexical(inputField, text);
  } else {
    inputField.innerHTML = `<p>${text}</p><p><br></p>`;
    inputField.dispatchEvent(new Event("input", { bubbles: true }));
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
    setNativeValue(inputField, inputField.value + `\n\n${text}`);
  } else if (inputField.dataset.lexicalEditor === "true") {
    inputField.focus();
    const sel = window.getSelection();
    sel.selectAllChildren(inputField);
    sel.collapseToEnd();
    document.execCommand("insertText", false, `\n\n${text}`);
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
