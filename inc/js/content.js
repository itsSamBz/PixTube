// This exxtension is a video downloader for YouTube.
// Developed by <a href="https://t.me/hax18">Hax18</a>
// You are not allowed to sell this extension.

function addScreenshotButtons() {
  if (!window.location.pathname.includes("/watch")) return;

  // Create and add first button if it doesn't exist
  if (!document.querySelector(".screenshot-btn")) {
      const button1 = document.createElement("button");
      button1.className = "screenshot-btn";
      button1.title = "Take Screenshot (Press P)";
      button1.textContent = "Screenshot";

      const topControls = document.querySelector(".top-level-buttons");
      if (topControls) {
          topControls.prepend(button1);
      }
  }

  // Create and add second button if it doesn't exist
  if (!document.querySelector(".screenshot-btn-player")) {
      const button2 = document.createElement("button");
      button2.className = "screenshot-btn-player ytp-button";
      button2.title = "Take Screenshot (Press P)";

      const playerControls = document.querySelector(".ytp-right-controls");
      if (playerControls) {
          playerControls.prepend(button2);
      }
  }

  let isProcessingScreenshot = false;

  async function takeScreenshot() {
      if (isProcessingScreenshot) return;
      isProcessingScreenshot = true;

      try {
          const video = document.querySelector("video");
          if (!video) return;

          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const dataUrl = canvas.toDataURL("image/png");
          const blob = await fetch(dataUrl).then((r) => r.blob());

          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          const filename = `ytb-screenshot-${timestamp}.png`;

          chrome.runtime.sendMessage(
              {
                  type: "download-screenshot",
                  dataUrl: dataUrl,
                  filename: filename,
              },
              (response) => {
                  if (response?.success) {
                      showNotification("Screenshot saved!");
                  }
              }
          );

          try {
              const clipboardItem = new ClipboardItem({ "image/png": blob });
              await navigator.clipboard.write([clipboardItem]);
          } catch (err) {
              console.error("Failed to copy to clipboard:", err);
          }
      } finally {
          setTimeout(() => {
              isProcessingScreenshot = false;
          }, 500);
      }
  }

  // Add click handlers to both buttons
  const button1 = document.querySelector(".screenshot-btn");
  const button2 = document.querySelector(".screenshot-btn-player");

  if (button1) button1.addEventListener("click", takeScreenshot);
  if (button2) button2.addEventListener("click", takeScreenshot);

  // Keyboard shortcuts
  if (!window.screenshotKeyHandlerAdded) {
      window.screenshotKeyHandlerAdded = true;
      document.addEventListener("keydown", (e) => {
          const activeElement = document.activeElement;
          const isInput = activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA" || activeElement.isContentEditable;

          if (!isInput) {
              if (e.key.toLowerCase() === "p" && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
                  e.preventDefault();
                  takeScreenshot();
              }
          }
      });
  }
}
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "screenshot-notification";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
      notification.remove();
  }, 3000);
}

function initialize() {
  const existingButtons = document.querySelectorAll(".screenshot-btn, .screenshot-btn-player");
  existingButtons.forEach((button) => button.remove());
  addScreenshotButtons();
}

if (document.readyState === "complete") {
  initialize();
} else {
  window.addEventListener("load", initialize);
}

const observer = new MutationObserver(() => {
  const currentTime = Date.now();
  if (currentTime - lastObservedTime > DEBOUNCE_TIME) {
      lastObservedTime = currentTime;

      if (!document.querySelector(".screenshot-btn")) {
          addScreenshotButtons();
      }
  }
});

let lastObservedTime = 0;
const DEBOUNCE_TIME = 1000;

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
