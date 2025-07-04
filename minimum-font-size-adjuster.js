// ==UserScript==
// @name        Minimum Font Size Adjuster
// @namespace   Violentmonkey Scripts
// @match       *://*/*
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_registerMenuCommand
// @version     1.0
// @author      -
// @description Adjust minimum font size on any website with Ctrl+Plus/Minus, preserves settings
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_KEY = 'minFontSize';
    const DEFAULT_MIN_SIZE = 18; // Default minimum font size in pixels

    // Get current domain for domain-specific settings
    const currentDomain = window.location.hostname;

    // Load saved minimum font size for this domain
    let minFontSize = GM_getValue(`${STORAGE_KEY}_${currentDomain}`, DEFAULT_MIN_SIZE);

    // Create and inject CSS
    let styleElement = null;

    function updateMinFontSize() {
        // Remove existing style if present
        if (styleElement) {
            styleElement.remove();
        }

        // Create new style element
        styleElement = document.createElement('style');
        styleElement.textContent = `
            * {
                font-size: max(${minFontSize}px, 1em) !important;
            }

            /* Special handling for elements that commonly have small text */
            small, .small, .text-sm, .caption, .footnote {
                font-size: max(${Math.max(minFontSize - 2, 8)}px, 0.9em) !important;
            }

            /* Prevent breaking layouts */
            input, button, select, textarea {
                font-size: max(${Math.max(minFontSize - 1, 10)}px, 0.95em) !important;
            }
        `;

        // Inject into head
        (document.head || document.documentElement).appendChild(styleElement);

        // Save the setting
        GM_setValue(`${STORAGE_KEY}_${currentDomain}`, minFontSize);
    }



    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Don't trigger when typing in form fields
        if (document.activeElement.tagName !== 'INPUT' &&
            document.activeElement.tagName !== 'TEXTAREA' &&
            !document.activeElement.isContentEditable) {

            // Increase minimum font size (Ctrl + Plus/Equal)
            if ((e.key === '+' || e.key === '=') && e.ctrlKey && !e.altKey && !e.shiftKey) {
                minFontSize = Math.min(minFontSize + 1, 30); // Max 30px
                updateMinFontSize();
                e.preventDefault();
            }

            // Decrease minimum font size (Ctrl + Minus)
            if (e.key === '-' && e.ctrlKey && !e.altKey && !e.shiftKey) {
                minFontSize = Math.max(minFontSize - 1, 8); // Min 8px
                updateMinFontSize();
                e.preventDefault();
            }

            // Reset to default (Ctrl + 0)
            if (e.key === '0' && e.ctrlKey && !e.altKey && !e.shiftKey) {
                minFontSize = DEFAULT_MIN_SIZE;
                updateMinFontSize();
                e.preventDefault();
            }
        }
    });

    // Menu commands for manual adjustment
    GM_registerMenuCommand('Increase Min Font Size', () => {
        minFontSize = Math.min(minFontSize + 1, 30);
        updateMinFontSize();
    });

    GM_registerMenuCommand('Decrease Min Font Size', () => {
        minFontSize = Math.max(minFontSize - 1, 8);
        updateMinFontSize();
    });

    GM_registerMenuCommand('Reset Min Font Size', () => {
        minFontSize = DEFAULT_MIN_SIZE;
        updateMinFontSize();
    });

    GM_registerMenuCommand(`Current: ${minFontSize}px`, () => {
        console.log(`Current minimum font size: ${minFontSize}px for ${currentDomain}`);
    });

    // Apply initial font size when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateMinFontSize);
    } else {
        updateMinFontSize();
    }

    // Reapply when new content is added (for dynamic pages)
    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if significant content was added
                for (let node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE &&
                        (node.tagName === 'DIV' || node.tagName === 'SECTION' ||
                         node.tagName === 'ARTICLE' || node.tagName === 'P')) {
                        shouldUpdate = true;
                        break;
                    }
                }
            }
        });

        if (shouldUpdate) {
            // Debounce the update
            clearTimeout(observer.timeoutId);
            observer.timeoutId = setTimeout(updateMinFontSize, 500);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();