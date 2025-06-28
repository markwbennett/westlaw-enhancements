// ==UserScript==
// @name        Westlaw Navigation Shortcuts
// @namespace   Violentmonkey Scripts
// @match       *://*.westlaw.com/*
// @grant       none
// @version     1.1
// @author      -
// @description Press 'n'/right arrow for next term, left arrow for previous term, up arrow to jump to top, return to copy with reference
// ==/UserScript==
(function() {
    'use strict';
    document.addEventListener('keydown', function(e) {
        // Don't trigger when typing in form fields
        if (document.activeElement.tagName !== 'INPUT' &&
            document.activeElement.tagName !== 'TEXTAREA' &&
            !document.activeElement.isContentEditable) {

            // Next term navigation
            if ((e.key === 'n' || e.key === 'ArrowRight') && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                const button = document.getElementById('co_documentFooterSearchTermNavigationNext');
                if (button && button.getAttribute('aria-disabled') !== 'true') {
                    button.click();
                    e.preventDefault();
                }
            }

            // Previous term navigation
            if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                const button = document.getElementById('co_documentFooterSearchTermNavigationPrevious');
                if (button && button.getAttribute('aria-disabled') !== 'true') {
                    button.click();
                    e.preventDefault();
                }
            }

            // Jump to top
            if (e.key === 'ArrowUp' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                window.scrollTo(0, 0);
                e.preventDefault();
            }

            // Copy with reference and auto-switch to notes
            if (e.key === 'Enter' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                const button = document.querySelector('button.co_copyWithRefLabel');
                if (button) {
                    button.click();
                    e.preventDefault();

                    // Wait a moment for the copy operation to complete, then switch to notes
                    setTimeout(() => {
                        switchToNotesFile();
                    }, 500);
                }
            }
        }
    });

    // Function to open persistent blob-based notepad
    function switchToNotesFile() {
        // Check if we already have a notes tab open
        const existingTab = findExistingNotesTab();

        if (existingTab) {
            existingTab.focus();
        } else {
            // Create a new persistent blob notepad
            createPersistentNotepad();
        }

        showSwitchNotification();
    }

    function findExistingNotesTab() {
        try {
            // Try to find existing tab by window name
            const notesWindow = window.open('', 'westlawNotesBlob');
            if (notesWindow && notesWindow.document && notesWindow.document.title.includes('Westlaw Notes')) {
                return notesWindow;
            }
        } catch (e) {
            // Security restrictions
        }
        return null;
    }

    function createPersistentNotepad() {
        // Create the persistent notes HTML
        const notesHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Westlaw Notes</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48cmVjdCB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgZmlsbD0nI2Y5NzMxNicvPjx0ZXh0IHg9JzUwJyB5PSc3MCcgZm9udC1mYW1pbHk9J0FyaWFsLHNhbnMtc2VyaWYnIGZvbnQtc2l6ZT0nNjAnIGZvbnQtd2VpZ2h0PSdib2xkJyBmaWxsPScjMjU2M2ViJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJz5XPC90ZXh0Pjwvc3ZnPg==">
            <link rel="shortcut icon" type="image/svg+xml" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48cmVjdCB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgZmlsbD0nI2Y5NzMxNicvPjx0ZXh0IHg9JzUwJyB5PSc3MCcgZm9udC1mYW1pbHk9J0FyaWFsLHNhbnMtc2VyaWYnIGZvbnQtc2l6ZT0nNjAnIGZvbnQtd2VpZ2h0PSdib2xkJyBmaWxsPScjMjU2M2ViJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJz5XPC90ZXh0Pjwvc3ZnPg==">
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                    margin: 0; padding: 20px; background: #f8f9fa;
                }
                .container { max-width: 1000px; margin: 0 auto; }
                .header {
                    background: white; padding: 20px; border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;
                }
                .header h1 { margin: 0 0 10px 0; color: #2c5282; font-size: 24px; }
                .instructions {
                    background: #e6f3ff; padding: 15px; border-radius: 6px;
                    border-left: 4px solid #3182ce; margin-bottom: 20px;
                }
                kbd {
                    background: #f1f3f4; padding: 2px 6px; border-radius: 3px;
                    font-family: monospace; font-size: 12px; border: 1px solid #ccc;
                }
                #noteArea {
                    width: 100%; height: 70vh; padding: 20px; font-size: 16px;
                    border: 2px solid #e2e8f0; border-radius: 8px; background: white;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                    line-height: 1.6; resize: vertical; outline: none;
                    transition: border-color 0.2s ease; box-sizing: border-box;
                    overflow-y: auto; white-space: pre-wrap;
                }
                #noteArea:focus { border-color: #3182ce; }
                #noteArea blockquote {
                    border-left: 4px solid #3182ce;
                    margin: 16px 0;
                    padding: 12px 16px;
                    background: #f8f9fa;
                    font-style: italic;
                    color: #4a5568;
                    border-radius: 0 4px 4px 0;
                }
                #noteArea:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    font-style: italic;
                }
                #noteArea:focus:before {
                    content: none;
                }
                .footer {
                    margin-top: 15px; padding: 15px; background: white;
                    border-radius: 8px; text-align: center; color: #666;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .status {
                    position: fixed; top: 20px; right: 20px;
                    background: #48bb78; color: white; padding: 10px 15px;
                    border-radius: 6px; font-size: 14px; opacity: 0;
                    transition: opacity 0.3s ease; z-index: 1000;
                }
                .status.show { opacity: 1; }
                .controls {
                    margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap;
                    align-items: center;
                }
                .btn {
                    padding: 8px 16px; background: #3182ce; color: white;
                    border: none; border-radius: 4px; cursor: pointer;
                    font-size: 14px; transition: background 0.2s ease;
                }
                .btn:hover { background: #2c5282; }
                .btn.secondary { background: #718096; }
                .btn.secondary:hover { background: #4a5568; }
                .stats {
                    background: white; padding: 10px 15px; border-radius: 6px;
                    font-size: 14px; color: #666; margin-bottom: 10px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Westlaw Notes</h1>
                    <div>Persistent research notepad</div>
                </div>

                <div class="instructions">
                    <strong>Ready to paste!</strong> Press <kbd>Ctrl+V</kbd> (or <kbd>Cmd+V</kbd> on Mac) to paste your copied Westlaw content.
                    <br>Text is automatically formatted: content before triple newlines becomes HTML blockquotes.
                    <br>Your notes auto-save as you type. Use <kbd>Ctrl+S</kbd> to manually save.
                </div>

                <div class="controls">
                    <button class="btn secondary" onclick="clearNotes()">Clear All</button>
                    <button class="btn secondary" onclick="exportNotes()">Export</button>
                </div>

                <div class="stats">
                    <span id="wordCount">0 words</span> •
                    <span id="charCount">0 characters</span> •
                    <span id="lastSaved">Not saved yet</span>
                </div>

                <div id="noteArea" contenteditable="true" data-placeholder="Paste your Westlaw content here and add your notes..."></div>

                <div class="footer">
                    Notes are automatically saved to this browser session.
                    <br><small>This tab persists as long as you keep it open.</small>
                </div>
            </div>

            <div id="status" class="status">Auto-saved!</div>

            <script>
                const noteArea = document.getElementById('noteArea');
                const status = document.getElementById('status');
                const wordCount = document.getElementById('wordCount');
                const charCount = document.getElementById('charCount');
                const lastSaved = document.getElementById('lastSaved');

                // Load saved content from localStorage
                noteArea.innerHTML = localStorage.getItem('westlawBlobNotes') || '';
                updateStats();

                function processWestlawText(text) {
                    const parts = text.split('\\n\\n\\n');
                    let processedText = '';

                    if (parts.length > 1) {
                        const quotedContent = parts[0].trim();
                        const remainingContent = parts.slice(1).join('\\n\\n').trim();

                        if (quotedContent && remainingContent) {
                            processedText = \`<blockquote>\${quotedContent}</blockquote><p>\${remainingContent}</p>\`;
                        } else if (quotedContent) {
                            processedText = \`<blockquote>\${quotedContent}</blockquote>\`;
                        } else if (remainingContent) {
                            processedText = \`<p>\${remainingContent}</p>\`;
                        }
                    } else {
                        const cleanedText = text.replace(/\\n{3,}/g, '\\n\\n').trim();
                        if (cleanedText) {
                            processedText = \`<p>\${cleanedText}</p>\`;
                        }
                    }

                    return processedText;
                }

                // Enhanced paste handling
                noteArea.addEventListener('paste', function(e) {
                    e.preventDefault();

                    const clipboardData = e.clipboardData || window.clipboardData;
                    let pastedText = clipboardData.getData('text');
                    const processedText = processWestlawText(pastedText);

                    const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        range.deleteContents();

                        const div = document.createElement('div');
                        div.innerHTML = processedText;
                        const fragment = document.createDocumentFragment();

                        while (div.firstChild) {
                            fragment.appendChild(div.firstChild);
                        }

                        range.insertNode(fragment);
                        range.collapse(false);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }

                    updateStats();
                    saveNotes();
                });

                // Auto-save functionality
                let saveTimeout;
                noteArea.addEventListener('input', function() {
                    updateStats();
                    clearTimeout(saveTimeout);
                    saveTimeout = setTimeout(saveNotes, 1000);
                });

                function saveNotes() {
                    localStorage.setItem('westlawBlobNotes', noteArea.innerHTML);
                    showSaveStatus();
                    updateLastSaved();
                }

                function updateStats() {
                    const text = noteArea.textContent || noteArea.innerText || '';
                    const words = text.trim() ? text.trim().split(/\\s+/).length : 0;
                    const chars = text.length;

                    wordCount.textContent = \`\${words} words\`;
                    charCount.textContent = \`\${chars} characters\`;
                }

                function updateLastSaved() {
                    const now = new Date();
                    lastSaved.textContent = \`Last saved: \${now.toLocaleTimeString()}\`;
                }

                function showSaveStatus() {
                    status.classList.add('show');
                    setTimeout(() => {
                        status.classList.remove('show');
                    }, 2000);
                }

                function clearNotes() {
                    if (confirm('Are you sure you want to clear all notes? This cannot be undone.')) {
                        noteArea.innerHTML = '';
                        localStorage.removeItem('westlawBlobNotes');
                        updateStats();
                        lastSaved.textContent = 'Notes cleared';
                    }
                }

                function exportNotes() {
                    const content = noteArea.textContent || noteArea.innerText || '';
                    if (!content.trim()) {
                        alert('No notes to export!');
                        return;
                    }

                    const blob = new Blob([content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = \`westlaw-notes-\${new Date().toISOString().split('T')[0]}.txt\`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }

                // Keyboard shortcuts
                noteArea.addEventListener('keydown', function(e) {
                    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                        e.preventDefault();
                        saveNotes();
                    }
                });

                // Auto-save when leaving page
                window.addEventListener('beforeunload', function() {
                    localStorage.setItem('westlawBlobNotes', noteArea.innerHTML);
                });

                // Focus the text area
                noteArea.focus();

                // Position cursor at end
                const range = document.createRange();
                const selection = window.getSelection();
                range.selectNodeContents(noteArea);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);

                if (noteArea.innerHTML.trim()) {
                    lastSaved.textContent = 'Previously saved notes loaded';
                }
            </script>
        </body>
        </html>
        `;

        // Create blob and open in named window
        const blob = new Blob([notesHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const notesTab = window.open(url, 'westlawNotesBlob');

        if (notesTab) {
            notesTab.focus();
        }
    }

    function showSwitchNotification() {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div><strong>✅ Content copied to clipboard!</strong></div>
            <div style="font-size: 12px; margin-top: 8px; line-height: 1.4;">
                <strong>Next steps:</strong><br>
                1. Click your pinned Westlaw Notes tab<br>
                2. Press <kbd style="background:#fff2;padding:1px 4px;border-radius:2px">Ctrl+V</kbd> (or <kbd style="background:#fff2;padding:1px 4px;border-radius:2px">⌘+V</kbd>) to paste<br>
                3. Content will auto-format with blockquotes!
            </div>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2563eb;
            color: white;
            padding: 15px 18px;
            border-radius: 8px;
            font-size: 14px !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif !important;
            z-index: 10004;
            box-shadow: 0 4px 20px rgba(0,0,0,0.25);
            border: 1px solid #1d4ed8;
            transition: opacity 0.3s ease;
            max-width: 320px;
            line-height: 1.3;
        `;

        document.body.appendChild(notification);

        // Remove after 6 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 6000);
    }
})();