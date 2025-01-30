document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        convertBtn: document.getElementById('convert-btn'),
        clearBtn: document.getElementById('clear-btn'),
        copyBtn: document.getElementById('copy-btn'),
        shareBtn: document.getElementById('share-btn'),
        inputText: document.getElementById('input-text'),
        resultThread: document.getElementById('result-thread'),
        greentextResult: document.getElementById('greentext-result'),
        timestamp: document.querySelector('.timestamp'),
        themeSwitch: document.getElementById('theme-switch'),
        charCount: document.getElementById('char-count'),
        postId: document.getElementById('post-id'),
        toastContainer: document.getElementById('toast-container'),
        historyContainer: document.getElementById('history-container'),
        clearHistoryBtn: document.getElementById('clear-history-btn'),
        twitterButton: document.querySelector('.twitter-button')
    };

    // Constants
    const MAX_HISTORY_ITEMS = 10;
    const TYPING_SPEED = 30;

    // Helper Functions
    const generatePostId = () => Math.floor(Math.random() * 900000000) + 100000000;

    const updateTimestamp = () => {
        const now = new Date();
        elements.timestamp.textContent = now.toLocaleString([], {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const updateTwitterShare = (greentext) => {
        if (elements.twitterButton) {
            const shareText = encodeURIComponent('Check out this greentext I generated!');
            const shareUrl = encodeURIComponent(window.location.href);
            elements.twitterButton.href = `https://twitter.com/share?url=${shareUrl}&text=${shareText}`;
        }
    };

    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        elements.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    const updateCharCount = () => {
        const count = elements.inputText.value.length;
        elements.charCount.textContent = count;
        
        if (count > 900) {
            elements.charCount.classList.add('near-limit');
        } else {
            elements.charCount.classList.remove('near-limit');
        }
    };

    const typeText = async (text) => {
        elements.greentextResult.innerHTML = '';
        const lines = text.split('\n').filter(line => line.trim());
        
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex].trim();
            if (line) {
                const lineDiv = document.createElement('div');
                lineDiv.className = 'line';
                elements.greentextResult.appendChild(lineDiv);

                for (let charIndex = 0; charIndex < line.length; charIndex++) {
                    lineDiv.textContent += line[charIndex];
                    await new Promise(resolve => setTimeout(resolve, TYPING_SPEED));
                }
            }
        }

        elements.copyBtn.disabled = false;
        elements.shareBtn.disabled = false;
    };

    // History Management
    const loadHistory = () => {
        try {
            const history = JSON.parse(localStorage.getItem('greentextHistory') || '[]');
            updateHistoryDisplay(history);
        } catch (error) {
            console.error('Error loading history:', error);
            localStorage.removeItem('greentextHistory');
            updateHistoryDisplay([]);
        }
    };

    const saveToHistory = (input, greentext) => {
        if (!input || !greentext) return;

        try {
            const history = JSON.parse(localStorage.getItem('greentextHistory') || '[]');
            
            history.unshift({
                id: Date.now(),
                timestamp: new Date().toISOString(),
                input: input.trim(),
                greentext: greentext.trim()
            });

            if (history.length > MAX_HISTORY_ITEMS) {
                history.pop();
            }

            localStorage.setItem('greentextHistory', JSON.stringify(history));
            updateHistoryDisplay(history);
        } catch (error) {
            console.error('Error saving to history:', error);
            showToast('Failed to save to history', 'error');
        }
    };

    const updateHistoryDisplay = (history) => {
        if (!Array.isArray(history) || !history.length) {
            elements.historyContainer.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-history"></i>
                    <p>No history yet</p>
                </div>
            `;
            return;
        }

        elements.historyContainer.innerHTML = history.map(item => {
            const firstLine = item.greentext && typeof item.greentext === 'string'
                ? item.greentext.split('\n')[0] || 'Empty greentext'
                : 'Invalid greentext';

            return `
                <div class="history-item" data-id="${item.id}">
                    <div class="history-item-header">
                        <span>${new Date(item.timestamp).toLocaleString()}</span>
                        <button class="delete-history-item" data-id="${item.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="history-item-preview">
                        ${firstLine}
                    </div>
                </div>
            `;
        }).join('');
    };

    const clearHistory = () => {
        if (confirm('Are you sure you want to clear all history?')) {
            localStorage.removeItem('greentextHistory');
            loadHistory();
            showToast('History cleared successfully');
        }
    };

    const handleHistoryItemClick = (e) => {
        const historyItem = e.target.closest('.history-item');
        if (!historyItem) return;

        if (e.target.closest('.delete-history-item')) {
            const id = e.target.closest('.delete-history-item').dataset.id;
            deleteHistoryItem(id);
            return;
        }

        const history = JSON.parse(localStorage.getItem('greentextHistory') || '[]');
        const item = history.find(i => i.id === parseInt(historyItem.dataset.id));
        
        if (item) {
            elements.resultThread.classList.remove('hidden');
            elements.postId.textContent = generatePostId();
            updateTimestamp();
            elements.inputText.value = item.input;
            updateCharCount();
            typeText(item.greentext);
            updateTwitterShare(item.greentext);
        }
    };

    const deleteHistoryItem = (id) => {
        try {
            const history = JSON.parse(localStorage.getItem('greentextHistory') || '[]');
            const newHistory = history.filter(item => item.id !== parseInt(id));
            localStorage.setItem('greentextHistory', JSON.stringify(newHistory));
            updateHistoryDisplay(newHistory);
            showToast('Item removed from history');
        } catch (error) {
            console.error('Error deleting history item:', error);
            showToast('Failed to delete item', 'error');
        }
    };

    // Event Handlers
    const handleConversion = async () => {
        const text = elements.inputText.value.trim();
        
        if (!text) {
            showToast('Please enter some text.', 'error');
            return;
        }

        try {
            const loadingIndicator = elements.convertBtn.querySelector('.loading-indicator');
            loadingIndicator.classList.remove('hidden');
            elements.convertBtn.disabled = true;
            elements.copyBtn.disabled = true;
            elements.shareBtn.disabled = true;

            const response = await fetch('/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            elements.resultThread.classList.remove('hidden');
            elements.postId.textContent = generatePostId();
            updateTimestamp();
            await typeText(data.greentext);
            saveToHistory(text, data.greentext);
            updateTwitterShare(data.greentext);

            // Scroll to result
            elements.resultThread.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            const loadingIndicator = elements.convertBtn.querySelector('.loading-indicator');
            loadingIndicator.classList.add('hidden');
            elements.convertBtn.disabled = false;
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(elements.greentextResult.textContent);
            showToast('Copied to clipboard!');
        } catch (error) {
            showToast('Failed to copy text.', 'error');
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Greentext Story',
                    text: elements.greentextResult.textContent
                });
                showToast('Shared successfully!');
            } catch (error) {
                if (error.name !== 'AbortError') {
                    showToast('Failed to share.', 'error');
                }
            }
        } else {
            handleCopy();
        }
    };

    const handleClear = () => {
        elements.inputText.value = '';
        elements.resultThread.classList.add('hidden');
        elements.charCount.textContent = '0';
        updateCharCount();
    };

    const handleThemeToggle = () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' 
            ? 'light' 
            : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    // Event Listeners
    const initializeEventListeners = () => {
        elements.convertBtn.addEventListener('click', handleConversion);
        elements.clearBtn.addEventListener('click', handleClear);
        elements.copyBtn.addEventListener('click', handleCopy);
        elements.shareBtn.addEventListener('click', handleShare);
        elements.themeSwitch.addEventListener('click', handleThemeToggle);
        elements.inputText.addEventListener('input', updateCharCount);
        elements.clearHistoryBtn.addEventListener('click', clearHistory);
        elements.historyContainer.addEventListener('click', handleHistoryItemClick);

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleConversion();
            }
        });
    };

    // Initialize
    const init = () => {
        try {
            // Set initial theme
            const savedTheme = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', savedTheme);
            
            // Initialize character counter
            updateCharCount();
            
            // Load history
            loadHistory();

            // Initialize event listeners
            initializeEventListeners();

        } catch (error) {
            console.error('Initialization error:', error);
            showToast('Failed to initialize application', 'error');
        }
    };

    // Initialize the application
    init();
});