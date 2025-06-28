// ==UserScript==
// @name        Westlaw Combined Enhancements
// @namespace   Violentmonkey Scripts
// @match       *://*.westlaw.com/*
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_registerMenuCommand
// @version     1.0
// @author      -
// @description Combined Westlaw enhancements: font size, margins, navigation shortcuts, and sidebar toggle
// ==/UserScript==

(function() {
    'use strict';

    // ===========================================
    // FONT SIZE ADJUSTER MODULE
    // ===========================================
    const FONT_STORAGE_KEY = 'westlawDivFontSize';
    const DEFAULT_FONT_SIZE = 18;
    const currentDomain = window.location.hostname;

    const TARGET_SELECTORS = [
        '.co_scrollWrapper',
        '#co_document',
        '.co_document',
        '.co_contentBlock',
        '#coid_website_documentWidgetDiv',
        '.co_paragraph',
        '.co_headnote'
    ];

    let divFontSize = GM_getValue(`${FONT_STORAGE_KEY}_${currentDomain}`, DEFAULT_FONT_SIZE);
    let divStyleElement = null;

    function updateDivFontSize() {
        if (divStyleElement) {
            divStyleElement.remove();
        }

        divStyleElement = document.createElement('style');
        divStyleElement.id = 'westlaw-div-font-adjuster';

        const cssRules = TARGET_SELECTORS.map(selector => {
            return `
                ${selector} {
                    font-size: ${divFontSize}px !important;
                }

                ${selector} * {
                    font-size: inherit !important;
                }

                ${selector} .co_footnoteReference,
                ${selector} .co_citatorFlagText,
                ${selector} small,
                ${selector} .small {
                    font-size: ${Math.max(divFontSize - 2, 12)}px !important;
                }

                ${selector} h1 {
                    font-size: ${divFontSize + 6}px !important;
                }

                ${selector} h2 {
                    font-size: ${divFontSize + 4}px !important;
                }

                ${selector} h3 {
                    font-size: ${divFontSize + 2}px !important;
                }

                ${selector} button,
                ${selector} input,
                ${selector} select {
                    font-size: ${Math.max(divFontSize - 1, 14)}px !important;
                }
            `;
        }).join('\n');

        divStyleElement.textContent = cssRules;
        (document.head || document.documentElement).appendChild(divStyleElement);

        GM_setValue(`${FONT_STORAGE_KEY}_${currentDomain}`, divFontSize);
        showNotification(`Font size: ${divFontSize}px`, 'font');
    }

    // ===========================================
    // MARGIN ADJUSTER MODULE
    // ===========================================
    const MARGIN_STORAGE_KEY_LEFT = 'westlawLeftMargin';
    const MARGIN_STORAGE_KEY_RIGHT = 'westlawRightMargin';
    const DEFAULT_LEFT_MARGIN = 50;
    const DEFAULT_RIGHT_MARGIN = 50;
    const ADJUSTMENT_STEP = 10;

    let leftMargin = GM_getValue(`${MARGIN_STORAGE_KEY_LEFT}_${currentDomain}`, DEFAULT_LEFT_MARGIN);
    let rightMargin = GM_getValue(`${MARGIN_STORAGE_KEY_RIGHT}_${currentDomain}`, DEFAULT_RIGHT_MARGIN);
    let marginStyleElement = null;

    function updateMargins() {
        if (marginStyleElement) {
            marginStyleElement.remove();
        }

        marginStyleElement = document.createElement('style');
        marginStyleElement.id = 'westlaw-margin-adjuster';

        const marginRules = `
            .co_scrollWrapper {
                margin-left: ${leftMargin}px !important;
                margin-right: ${rightMargin}px !important;
                padding-left: 0 !important;
                padding-right: 0 !important;
                box-sizing: border-box !important;
            }

            #co_document,
            .co_document,
            #coid_website_documentWidgetDiv {
                margin-left: ${leftMargin}px !important;
                margin-right: ${rightMargin}px !important;
            }

            .co_scrollWrapper > * {
                margin-left: 0 !important;
                margin-right: 0 !important;
            }

            .co_scrollWrapper .co_document,
            .co_scrollWrapper .co_contentBlock {
                margin-left: 0 !important;
                margin-right: 0 !important;
                padding-left: 0 !important;
                padding-right: 0 !important;
            }
        `;

        marginStyleElement.textContent = marginRules;
        (document.head || document.documentElement).appendChild(marginStyleElement);

        GM_setValue(`${MARGIN_STORAGE_KEY_LEFT}_${currentDomain}`, leftMargin);
        GM_setValue(`${MARGIN_STORAGE_KEY_RIGHT}_${currentDomain}`, rightMargin);
        showNotification(`Margins: L${leftMargin}px | R${rightMargin}px`, 'margin');
    }

    function setSymmetricalMargins() {
        const averageMargin = Math.round((leftMargin + rightMargin) / 2);
        leftMargin = averageMargin;
        rightMargin = averageMargin;
        updateMargins();
    }

    // ===========================================
    // SIDEBAR TOGGLE MODULE
    // ===========================================
    const SIDEBAR_STORAGE_KEY = 'westlawSidebarHidden';

    const SIDEBAR_SELECTORS = [
        '#co_rightColumn',
        'aside[role="complementary"]',
        '#coid_website_relatedInfoWidgetDiv',
        '#coid_website_recommendedDocuments',
        '#coid_website_documentToolWidgetDiv',
        '.co_relatedinfo_topic_container',
        '.co_recommendedDocumentContainer',
        '[id*="relatedInfo"]',
        '.co_rightRail',
        '.co_sideBar'
    ];

    const MAIN_CONTENT_SELECTORS = [
        '.co_scrollWrapper',
        '#co_document',
        '.co_document',
        '#coid_website_documentWidgetDiv',
        '.co_mainContent',
        '.co_contentWrapper'
    ];

    let sidebarHidden = GM_getValue(`${SIDEBAR_STORAGE_KEY}_${currentDomain}`, false);
    let toggleStyleElement = null;

    function updateSidebarVisibility() {
        if (toggleStyleElement) {
            toggleStyleElement.remove();
        }

        toggleStyleElement = document.createElement('style');
        toggleStyleElement.id = 'westlaw-sidebar-toggle';

        if (sidebarHidden) {
            const hideRules = SIDEBAR_SELECTORS.map(selector => `
                ${selector} {
                    display: none !important;
                    visibility: hidden !important;
                    width: 0 !important;
                    max-width: 0 !important;
                    overflow: hidden !important;
                }
            `).join('\n');

            const expandRules = MAIN_CONTENT_SELECTORS.map(selector => `
                ${selector} {
                    max-width: 100% !important;
                    width: 100% !important;
                    margin-right: 0 !important;
                    padding-right: 20px !important;
                }
            `).join('\n');

            toggleStyleElement.textContent = `
                ${hideRules}
                ${expandRules}

                aside[id="co_rightColumn"],
                aside.co_addFocusCorrection[role="complementary"] {
                    display: none !important;
                    visibility: hidden !important;
                    width: 0 !important;
                }

                .co_mainColumn {
                    width: 100% !important;
                    max-width: 100% !important;
                    margin-right: 0 !important;
                }

                .co_rightColumn,
                .co_rightRailContainer {
                    display: none !important;
                }

                .co_documentContainer {
                    margin-right: 0 !important;
                    width: 100% !important;
                }

                .co_contentWrapper,
                .co_mainContentWrapper {
                    width: 100% !important;
                    max-width: 100% !important;
                }

                .co_document,
                .co_scrollWrapper {
                    width: auto !important;
                    max-width: none !important;
                }
            `;
        } else {
            toggleStyleElement.textContent = `
                ${SIDEBAR_SELECTORS.map(selector => `
                    ${selector} {
                        display: block !important;
                        visibility: visible !important;
                    }
                `).join('\n')}
            `;
        }

        (document.head || document.documentElement).appendChild(toggleStyleElement);
        GM_setValue(`${SIDEBAR_STORAGE_KEY}_${currentDomain}`, sidebarHidden);
        showNotification(sidebarHidden ? 'Sidebar hidden' : 'Sidebar visible', 'sidebar');
    }

    function toggleSidebar() {
        sidebarHidden = !sidebarHidden;
        updateSidebarVisibility();
    }

    // ===========================================
    // NAVIGATION SHORTCUTS MODULE
    // ===========================================
    function switchToNotesFile() {
        const existingTab = findExistingNotesTab();

        if (existingTab) {
            existingTab.focus();
        } else {
            createPersistentNotepad();
        }

        showSwitchNotification();
    }

    function findExistingNotesTab() {
        try {
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
        const notesHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Westlaw Notes</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48cmVjdCB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgZmlsbD0nI2Y5NzMxNicvPjx0ZXh0IHg9JzUwJyB5PSc3MCcgZm9udC1mYW1pbHk9J0FyaWFsLHNhbnMtc2VyaWYnIGZvbnQtc2l6ZT0nNjAnIGZvbnQtd2VpZ2h0PSdib2xkJyBmaWxsPScjMjU2M2ViJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJz5XPC90ZXh0Pjwvc3ZnPg==">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
                .container { max-width: 1000px; margin: 0 auto; }
                .header { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
                .header h1 { margin: 0 0 10px 0; color: #2c5282; font-size: 24px; }
                .instructions { background: #e6f3ff; padding: 15px; border-radius: 6px; border-left: 4px solid #3182ce; margin-bottom: 20px; }
                kbd { background: #f1f3f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 12px; border: 1px solid #ccc; }
                #noteArea { width: 100%; height: 70vh; padding: 20px; font-size: 16px; border: 2px solid #e2e8f0; border-radius: 8px; background: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; resize: vertical; outline: none; transition: border-color 0.2s ease; box-sizing: border-box; overflow-y: auto; white-space: pre-wrap; }
                #noteArea:focus { border-color: #3182ce; }
                #noteArea blockquote { border-left: 4px solid #3182ce; margin: 16px 0; padding: 12px 16px; background: #f8f9fa; font-style: italic; color: #4a5568; border-radius: 0 4px 4px 0; }
                #noteArea:empty:before { content: attr(data-placeholder); color: #9ca3af; font-style: italic; }
                #noteArea:focus:before { content: none; }
                .footer { margin-top: 15px; padding: 15px; background: white; border-radius: 8px; text-align: center; color: #666; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .status { position: fixed; top: 20px; right: 20px; background: #48bb78; color: white; padding: 10px 15px; border-radius: 6px; font-size: 14px; opacity: 0; transition: opacity 0.3s ease; z-index: 1000; }
                .status.show { opacity: 1; }
                .controls { margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
                .btn { padding: 8px 16px; background: #3182ce; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; transition: background 0.2s ease; }
                .btn:hover { background: #2c5282; }
                .btn.secondary { background: #718096; }
                .btn.secondary:hover { background: #4a5568; }
                .stats { background: white; padding: 10px 15px; border-radius: 6px; font-size: 14px; color: #666; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
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

                noteArea.addEventListener('keydown', function(e) {
                    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                        e.preventDefault();
                        saveNotes();
                    }
                });

                window.addEventListener('beforeunload', function() {
                    localStorage.setItem('westlawBlobNotes', noteArea.innerHTML);
                });

                noteArea.focus();

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

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 6000);
    }

    // ===========================================
    // SHARED NOTIFICATION SYSTEM
    // ===========================================
    function showNotification(message, type) {
        const positions = {
            font: { top: '20px', zIndex: 10001 },
            margin: { top: '80px', zIndex: 10003 },
            sidebar: { top: '140px', zIndex: 10002 }
        };

        const colors = {
            font: { bg: '#1a365d', border: '#2c5282' },
            margin: { bg: '#2d3748', border: '#4a5568' },
            sidebar: { bg: sidebarHidden ? '#2d3748' : '#2b6cb0', border: sidebarHidden ? '#4a5568' : '#3182ce' }
        };

        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: ${positions[type].top};
            right: 20px;
            background: ${colors[type].bg};
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 14px !important;
            font-family: Arial, sans-serif !important;
            z-index: ${positions[type].zIndex};
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 1px solid ${colors[type].border};
            transition: opacity 0.3s ease;
            max-width: 280px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2500);
    }

    // ===========================================
    // KEYBOARD SHORTCUTS
    // ===========================================
    document.addEventListener('keydown', function(e) {
        if (document.activeElement.tagName !== 'INPUT' &&
            document.activeElement.tagName !== 'TEXTAREA' &&
            !document.activeElement.isContentEditable) {

            // Font size shortcuts (Alt + Plus/Minus/0)
            if ((e.key === '+' || e.key === '=') && e.altKey && !e.ctrlKey && !e.shiftKey) {
                divFontSize = Math.min(divFontSize + 1, 36);
                updateDivFontSize();
                e.preventDefault();
            }

            if (e.key === '-' && e.altKey && !e.ctrlKey && !e.shiftKey) {
                divFontSize = Math.max(divFontSize - 1, 10);
                updateDivFontSize();
                e.preventDefault();
            }

            if (e.key === '0' && e.altKey && !e.ctrlKey && !e.shiftKey) {
                divFontSize = DEFAULT_FONT_SIZE;
                updateDivFontSize();
                e.preventDefault();
            }

            // Margin shortcuts (Shift + Arrow keys)
            if (e.key === 'ArrowLeft' && e.shiftKey && !e.ctrlKey && !e.altKey) {
                leftMargin = Math.min(leftMargin + ADJUSTMENT_STEP, 300);
                updateMargins();
                e.preventDefault();
            }

            if (e.key === 'ArrowRight' && e.shiftKey && !e.ctrlKey && !e.altKey) {
                leftMargin = Math.max(leftMargin - ADJUSTMENT_STEP, 0);
                updateMargins();
                e.preventDefault();
            }

            if (e.key === 'ArrowUp' && e.shiftKey && !e.ctrlKey && !e.altKey) {
                rightMargin = Math.min(rightMargin + ADJUSTMENT_STEP, 300);
                updateMargins();
                e.preventDefault();
            }

            if (e.key === 'ArrowDown' && e.shiftKey && !e.ctrlKey && !e.altKey) {
                rightMargin = Math.max(rightMargin - ADJUSTMENT_STEP, 0);
                updateMargins();
                e.preventDefault();
            }

            if ((e.key === '+' || e.key === '=') && e.shiftKey && !e.ctrlKey && !e.altKey) {
                leftMargin = Math.min(leftMargin + ADJUSTMENT_STEP, 300);
                rightMargin = Math.min(rightMargin + ADJUSTMENT_STEP, 300);
                updateMargins();
                e.preventDefault();
            }

            if (e.key === '-' && e.shiftKey && !e.ctrlKey && !e.altKey) {
                leftMargin = Math.max(leftMargin - ADJUSTMENT_STEP, 0);
                rightMargin = Math.max(rightMargin - ADJUSTMENT_STEP, 0);
                updateMargins();
                e.preventDefault();
            }

            if (e.key === 'S' && e.shiftKey && !e.ctrlKey && !e.altKey) {
                setSymmetricalMargins();
                e.preventDefault();
            }

            if (e.key === 'R' && e.shiftKey && !e.ctrlKey && !e.altKey) {
                leftMargin = DEFAULT_LEFT_MARGIN;
                rightMargin = DEFAULT_RIGHT_MARGIN;
                updateMargins();
                e.preventDefault();
            }

            // Sidebar toggle (F2)
            if (e.key === 'F2' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                toggleSidebar();
                e.preventDefault();
            }

            // Navigation shortcuts
            if ((e.key === 'n' || e.key === 'ArrowRight') && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                const button = document.getElementById('co_documentFooterSearchTermNavigationNext');
                if (button && button.getAttribute('aria-disabled') !== 'true') {
                    button.click();
                    e.preventDefault();
                }
            }

            if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                const button = document.getElementById('co_documentFooterSearchTermNavigationPrevious');
                if (button && button.getAttribute('aria-disabled') !== 'true') {
                    button.click();
                    e.preventDefault();
                }
            }

            if (e.key === 'ArrowUp' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                window.scrollTo(0, 0);
                e.preventDefault();
            }

            if (e.key === 'Enter' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                const button = document.querySelector('button.co_copyWithRefLabel');
                if (button) {
                    button.click();
                    e.preventDefault();

                    setTimeout(() => {
                        switchToNotesFile();
                    }, 500);
                }
            }
        }
    });

    // ===========================================
    // MENU COMMANDS
    // ===========================================
    // Font size commands
    GM_registerMenuCommand('⬆️ Increase Font Size', () => {
        divFontSize = Math.min(divFontSize + 1, 36);
        updateDivFontSize();
    });

    GM_registerMenuCommand('⬇️ Decrease Font Size', () => {
        divFontSize = Math.max(divFontSize - 1, 10);
        updateDivFontSize();
    });

    GM_registerMenuCommand('🔄 Reset Font Size', () => {
        divFontSize = DEFAULT_FONT_SIZE;
        updateDivFontSize();
    });

    // Margin commands
    GM_registerMenuCommand('⬅️ Increase Left Margin', () => {
        leftMargin = Math.min(leftMargin + ADJUSTMENT_STEP, 300);
        updateMargins();
    });

    GM_registerMenuCommand('➡️ Decrease Left Margin', () => {
        leftMargin = Math.max(leftMargin - ADJUSTMENT_STEP, 0);
        updateMargins();
    });

    GM_registerMenuCommand('⬆️ Increase Right Margin', () => {
        rightMargin = Math.min(rightMargin + ADJUSTMENT_STEP, 300);
        updateMargins();
    });

    GM_registerMenuCommand('⬇️ Decrease Right Margin', () => {
        rightMargin = Math.max(rightMargin - ADJUSTMENT_STEP, 0);
        updateMargins();
    });

    GM_registerMenuCommand('🔄 Make Margins Symmetrical', setSymmetricalMargins);

    GM_registerMenuCommand('🔧 Reset Margins', () => {
        leftMargin = DEFAULT_LEFT_MARGIN;
        rightMargin = DEFAULT_RIGHT_MARGIN;
        updateMargins();
    });

    // Sidebar command
    GM_registerMenuCommand(sidebarHidden ? '👁️ Show Sidebar' : '🙈 Hide Sidebar', toggleSidebar);

    // Status commands
    GM_registerMenuCommand(`📏 Font: ${divFontSize}px | Margins: L${leftMargin}px R${rightMargin}px | Sidebar: ${sidebarHidden ? 'Hidden' : 'Visible'}`, () => {
        showNotification(`Font: ${divFontSize}px | Margins: L${leftMargin}px R${rightMargin}px | Sidebar: ${sidebarHidden ? 'Hidden' : 'Visible'}`, 'font');
    });

    // ===========================================
    // INITIALIZATION
    // ===========================================
    function applyAllSettings() {
        updateDivFontSize();
        updateMargins();
        updateSidebarVisibility();
    }

    function applyWithDelay() {
        applyAllSettings();
        setTimeout(applyAllSettings, 500);
        setTimeout(applyAllSettings, 1500);
    }

    // Apply initial settings when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyWithDelay);
    } else {
        applyWithDelay();
    }

    // Observe changes for dynamic content
    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (let node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const hasTargetContent = TARGET_SELECTORS.some(selector => {
                            return node.matches && (node.matches(selector) || node.querySelector(selector));
                        });

                        const hasSidebarContent = SIDEBAR_SELECTORS.some(selector => {
                            return node.matches && (node.matches(selector) || node.querySelector(selector));
                        });

                        if (hasTargetContent || hasSidebarContent) {
                            shouldUpdate = true;
                            break;
                        }
                    }
                }
            }
        });

        if (shouldUpdate) {
            clearTimeout(observer.timeoutId);
            observer.timeoutId = setTimeout(applyAllSettings, 300);
        }
    });

    // Observe changes to the document body
    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    console.log('Westlaw Combined Enhancements loaded. Use Alt+Plus/Minus (font), Shift+Arrows (margins), F2 (sidebar), n/arrows (nav), Enter (copy).');

})();