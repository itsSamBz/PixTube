// This exxtension is a video downloader for YouTube.
// Developed by <a href="https://t.me/hax18">Hax18</a>
// You are not allowed to sell this extension.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "download-screenshot") {
      chrome.downloads.download(
          {
              url: request.dataUrl,
              filename: request.filename,
          },
          () => {
              sendResponse({ success: true });
          }
      );
      return true; // Required for async response
  }
});
