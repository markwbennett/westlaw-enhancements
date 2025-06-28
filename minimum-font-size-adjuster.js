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

    function updateMinFontSize(showNotif = true) {
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

        // Show notification only when requested
        if (showNotif) {
            showNotification(`Minimum font size: ${minFontSize}px`);
        }
    }

    // Track current notification to prevent multiple notifications
    let currentNotification = null;

    function showNotification(message) {
        // Remove any existing notification first
        if (currentNotification && currentNotification.parentNode) {
            currentNotification.parentNode.removeChild(currentNotification);
            currentNotification = null;
        }

        // Ensure document.body exists
        if (!document.body) {
            return;
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 14px !important;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            transition: opacity 0.3s ease;
        `;

        document.body.appendChild(notification);
        currentNotification = notification;

        // Remove after 2.5 seconds
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.style.opacity = '0';
                setTimeout(() => {
                    if (notification && notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                        if (currentNotification === notification) {
                            currentNotification = null;
                        }
                    }
                }, 300);
            }
        }, 2500);
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
        showNotification(`Current minimum font size: ${minFontSize}px for ${currentDomain}`);
    });

    // Apply initial font size when page loads (without notification)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => updateMinFontSize(false));
    } else {
        updateMinFontSize(false);
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
            // Debounce the update (without notification)
            clearTimeout(observer.timeoutId);
            observer.timeoutId = setTimeout(() => updateMinFontSize(false), 500);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();