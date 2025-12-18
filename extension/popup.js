document.addEventListener('DOMContentLoaded', () => {
    const scanBtn = document.getElementById('scanBtn');
    const urlInput = document.getElementById('urlInput');
    const resultsArea = document.getElementById('resultsArea');
    const loading = document.getElementById('loading');

    const verdictBox = document.getElementById('verdictBox');
    const verdictText = document.getElementById('verdictText');
    const finalUrl = document.getElementById('finalUrl');
    const serverLoc = document.getElementById('serverLoc');
    const domainAge = document.getElementById('domainAge');
    const scanRatio = document.getElementById('scanRatio');

    const advancedCheck = document.getElementById('advancedCheck');
    const advancedDetails = document.getElementById('advancedDetails');

    scanBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (!url) return;

        performScan(url);
    });

    // Listen for Enter key
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const url = urlInput.value.trim();
            if (url) performScan(url);
        }
    });

    advancedCheck.addEventListener('change', (e) => {
        if (e.target.checked) {
            advancedDetails.classList.remove('hidden');
        } else {
            advancedDetails.classList.add('hidden');
        }
    });

    async function performScan(url) {
        // UI Reset
        resultsArea.classList.add('hidden');
        loading.classList.remove('hidden');
        verdictBox.className = 'verdict-box'; // reset classes

        chrome.runtime.sendMessage({ action: "scanUrl", url: url }, (response) => {
            loading.classList.add('hidden');
            resultsArea.classList.remove('hidden');

            if (response && response.success) {
                const data = response.data;
                // Populate Data
                verdictText.textContent = data.verdict;
                finalUrl.textContent = data.final_url;
                finalUrl.title = data.final_url;

                serverLoc.textContent = data.server_location;
                domainAge.textContent = data.domain_age;
                scanRatio.textContent = data.scan_ratio;

                // Style verdict
                if (data.verdict === 'SAFE') {
                    verdictBox.classList.add('verdict-safe');
                    verdictText.textContent = 'SECURE TARGET';
                } else {
                    verdictBox.classList.add('verdict-danger');
                    verdictText.textContent = 'THREAT DETECTED';
                }
            } else {
                console.error('Error:', response ? response.error : 'Unknown error');
                verdictBox.className = 'verdict-box verdict-danger';
                verdictText.textContent = 'CONNECTION ERROR';
            }
        });
    }
});
