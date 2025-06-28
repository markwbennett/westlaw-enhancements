// ==UserScript==
// @name        Westlaw Div-Specific Font Size Adjuster
// @namespace   Violentmonkey Scripts
// @match       *://*.westlaw.com/*
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_registerMenuCommand
// @version     1.0
// @author      -
// @description Adjust font size within specific divs on Westlaw pages using Alt+Plus/Minus, preserves settings
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_KEY = 'westlawDivFontSize';
    const DEFAULT_FONT_SIZE = 18; // Default font size in pixels

    // Get current domain for domain-specific settings
    const currentDomain = window.location.hostname;

    // Target div selectors - these are the main content divs on Westlaw
    const TARGET_SELECTORS = [
        '.co_scrollWrapper',           // Main content wrapper
        '#co_document',                // Document content
        '.co_document',                // Alternative document selector
        '.co_contentBlock',            // Content blocks
        '#coid_website_documentWidgetDiv', // Document widget
        '.co_paragraph',               // Paragraphs
        '.co_headnote'                 // Headnotes
    ];

    // Load saved font size for this domain
    let divFontSize = GM_getValue(`${STORAGE_KEY}_${currentDomain}`, DEFAULT_FONT_SIZE);

    // Create and inject CSS for targeted divs
    let divStyleElement = null;

    function updateDivFontSize() {
        // Remove existing style if present
        if (divStyleElement) {
            divStyleElement.remove();
        }

        // Create new style element for div-specific styling
        divStyleElement = document.createElement('style');
        divStyleElement.id = 'westlaw-div-font-adjuster';

        // Build CSS rules for target selectors
        const cssRules = TARGET_SELECTORS.map(selector => {
            return `
                ${selector} {
                    font-size: ${divFontSize}px !important;
                }

                ${selector} * {
                    font-size: inherit !important;
                }

                /* Maintain relative sizing for smaller elements */
                ${selector} .co_footnoteReference,
                ${selector} .co_citatorFlagText,
                ${selector} small,
                ${selector} .small {
                    font-size: ${Math.max(divFontSize - 2, 12)}px !important;
                }

                /* Maintain larger sizing for headings */
                ${selector} h1 {
                    font-size: ${divFontSize + 6}px !important;
                }

                ${selector} h2 {
                    font-size: ${divFontSize + 4}px !important;
                }

                ${selector} h3 {
                    font-size: ${divFontSize + 2}px !important;
                }

                /* Keep UI elements slightly smaller */
                ${selector} button,
                ${selector} input,
                ${selector} select {
                    font-size: ${Math.max(divFontSize - 1, 14)}px !important;
                }
            `;
        }).join('\n');

        divStyleElement.textContent = cssRules;

        // Inject into head
        (document.head || document.documentElement).appendChild(divStyleElement);

        // Save the setting
        GM_setValue(`${STORAGE_KEY}_${currentDomain}`, divFontSize);

        // Show notification
        showNotification(`Westlaw content font size: ${divFontSize}px`);
    }

    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1a365d;
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 14px !important;
            font-family: Arial, sans-serif !important;
            z-index: 10001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 1px solid #2c5282;
            transition: opacity 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove after 2.5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2500);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Don't trigger when typing in form fields
        if (document.activeElement.tagName !== 'INPUT' &&
            document.activeElement.tagName !== 'TEXTAREA' &&
            !document.activeElement.isContentEditable) {

            // Increase div font size (Alt + Plus/Equal)
            if ((e.key === '+' || e.key === '=') && e.altKey && !e.ctrlKey && !e.shiftKey) {
                divFontSize = Math.min(divFontSize + 1, 36); // Max 36px
                updateDivFontSize();
                e.preventDefault();
            }

            // Decrease div font size (Alt + Minus)
            if (e.key === '-' && e.altKey && !e.ctrlKey && !e.shiftKey) {
                divFontSize = Math.max(divFontSize - 1, 10); // Min 10px
                updateDivFontSize();
                e.preventDefault();
            }

            // Reset to default (Alt + 0)
            if (e.key === '0' && e.altKey && !e.ctrlKey && !e.shiftKey) {
                divFontSize = DEFAULT_FONT_SIZE;
                updateDivFontSize();
                e.preventDefault();
            }
        }
    });

    // Menu commands for manual adjustment
    GM_registerMenuCommand('⬆️ Increase Westlaw Content Font', () => {
        divFontSize = Math.min(divFontSize + 1, 36);
        updateDivFontSize();
    });

    GM_registerMenuCommand('⬇️ Decrease Westlaw Content Font', () => {
        divFontSize = Math.max(divFontSize - 1, 10);
        updateDivFontSize();
    });

    GM_registerMenuCommand('🔄 Reset Westlaw Content Font', () => {
        divFontSize = DEFAULT_FONT_SIZE;
        updateDivFontSize();
    });

    GM_registerMenuCommand(`📏 Current: ${divFontSize}px (Westlaw Content)`, () => {
        showNotification(`Current Westlaw content font size: ${divFontSize}px for ${currentDomain}`);
    });

    // Function to apply font size when new content loads
    function applyFontSizeWithDelay() {
        // Apply immediately
        updateDivFontSize();

        // Also apply after a short delay to catch dynamically loaded content
        setTimeout(updateDivFontSize, 500);
        setTimeout(updateDivFontSize, 1500);
    }

    // Apply initial font size when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyFontSizeWithDelay);
    } else {
        applyFontSizeWithDelay();
    }

    // Reapply when new content is added (for dynamic pages)
    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if significant Westlaw content was added
                for (let node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node or its children match our target selectors
                        const hasTargetContent = TARGET_SELECTORS.some(selector => {
                            return node.matches && (node.matches(selector) || node.querySelector(selector));
                        });

                        if (hasTargetContent) {
                            shouldUpdate = true;
                            break;
                        }
                    }
                }
            }
        });

        if (shouldUpdate) {
            // Debounce the update
            clearTimeout(observer.timeoutId);
            observer.timeoutId = setTimeout(updateDivFontSize, 300);
        }
    });

    // Observe changes to the document body
    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        // If body isn't ready yet, wait for it
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    // Show initial status
    console.log(`Westlaw Div Font Adjuster loaded. Current size: ${divFontSize}px. Use Alt+Plus/Minus to adjust.`);

})();// ==UserScript==
// @name        New script westlaw.com
// @namespace   Violentmonkey Scripts
// @match       https://1.next.westlaw.com/Link/Document/FullText*
// @grant       none
// @version     1.0
// @author      -
// @description 6/28/2025, 12:18:31 PM
// ==/UserScript==
