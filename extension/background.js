// Function to perform the scan
async function performUrlScan(url) {
    try {
        const response = await fetch('http://https://link-auth-api-289522255962.us-central1.run.app/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        });
        return await response.json();
    } catch (err) {
        console.error('Scan failed:', err);
        throw err;
    }
}

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "scanLink",
        title: "Scan this link for threats",
        contexts: ["link"]
    });
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scanUrl") {
        performUrlScan(message.url)
            .then(data => sendResponse({ success: true, data: data }))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true; // Keep channel open for async response
    }
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "scanLink" && info.linkUrl) {
        performUrlScan(info.linkUrl)
            .then(data => {
                let symbol = data.verdict === 'SAFE' ? '✅' : '🚫';
                let message = `Verdict: ${data.verdict}\nDestination: ${data.final_url}`;

                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: (msg) => { alert(msg); },
                    args: [`[Link Forensics] \n${symbol} ${data.verdict}\n${message}`]
                });
            })
            .catch(err => {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: (msg) => { alert(msg); },
                    args: [`Server Connection Failed\nIs the backend running?`]
                });
            });
    }
});
