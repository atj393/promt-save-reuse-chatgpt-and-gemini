chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: toggleInputStorage,
  });
});

function toggleInputStorage() {
  const inputField = document.querySelector("input, textarea"); // Adjust selector based on the actual input field
  const url = window.location.href;

  if (!inputField) return;

  if (inputField.value.trim()) {
    // Save the current input value to local storage
    chrome.storage.local.set({ [url]: inputField.value.trim() }, () => {
      console.log("Input text saved.");
    });
  } else {
    // Retrieve saved text from local storage and insert into input field
    chrome.storage.local.get([url], (result) => {
      if (result[url]) {
        inputField.value = result[url];
        console.log("Input text retrieved.");
      }
    });
  }
}
