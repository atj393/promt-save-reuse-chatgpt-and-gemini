document.addEventListener("DOMContentLoaded", () => {
  const inputField = document.querySelector("input, textarea");

  if (inputField) {
    inputField.addEventListener("click", (event) => {
      if (event.detail === 1) {
        handleSingleClick(inputField);
      } else if (event.detail === 2) {
        handleDoubleClick(inputField);
      }
    });

    inputField.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      chrome.runtime.sendMessage({ action: "showContextMenu" });
    });
  }
});

function handleSingleClick(inputField) {
  const url = window.location.href;
  chrome.storage.local.get([url], (result) => {
    if (result[url]) {
      inputField.value = result[url];
    } else {
      chrome.storage.local.set({ [url]: inputField.value });
    }
  });
}

function handleDoubleClick(inputField) {
  const url = window.location.href;
  chrome.storage.local.get([url], (result) => {
    if (result[url]) {
      inputField.value += result[url];
    }
  });
}
