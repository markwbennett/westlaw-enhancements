// ==UserScript==
// @name        Westlaw Margin Adjuster
// @namespace   Violentmonkey Scripts
// @match       *://*.westlaw.com/*
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_registerMenuCommand
// @version     1.0
// @author      -
// @description Adjust left/right margins of Westlaw content with Shift+Arrow keys for perfect symmetry
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_KEY_LEFT = 'westlawLeftMargin';
    const STORAGE_KEY_RIGHT = 'westlawRightMargin';
    const DEFAULT_LEFT_MARGIN = 50;   // Default left margin in pixels
    const DEFAULT_RIGHT_MARGIN = 50;  // Default right margin in pixels
    const ADJUSTMENT_STEP = 10;       // Pixels to adjust per keypress

    // Get current domain for domain-specific settings
    const currentDomain = window.location.hostname;

    // Load saved margins for this domain
    let leftMargin = GM_getValue(`${STORAGE_KEY_LEFT}_${currentDomain}`, DEFAULT_LEFT_MARGIN);
    let rightMargin = GM_getValue(`${STORAGE_KEY_RIGHT}_${currentDomain}`, DEFAULT_RIGHT_MARGIN);

    // Target selectors for main content - prioritizing co_scrollWrapper
    const MAIN_CONTENT_SELECTORS = [
        '.co_scrollWrapper'  // Primary target - this is the main content wrapper
    ];

    // Secondary selectors for fallback targeting
    const SECONDARY_SELECTORS = [
        '#co_document',
        '.co_document',
        '#coid_website_documentWidgetDiv'
    ];

    let marginStyleElement = null;

    function updateMargins() {
        // Remove existing style if present
        if (marginStyleElement) {
            marginStyleElement.remove();
        }

        // Create new style element
        marginStyleElement = document.createElement('style');
        marginStyleElement.id = 'westlaw-margin-adjuster';

        // Build CSS rules focusing on co_scrollWrapper
        const marginRules = `
            .co_scrollWrapper {
                margin-left: ${leftMargin}px !important;
                margin-right: ${rightMargin}px !important;
                padding-left: 0 !important;
                padding-right: 0 !important;
                box-sizing: border-box !important;
            }
        `;

        // Fallback rules for other elements if needed
        const fallbackRules = SECONDARY_SELECTORS.map(selector => `
            ${selector} {
                margin-left: ${leftMargin}px !important;
                margin-right: ${rightMargin}px !important;
            }
        `).join('\n');

        marginStyleElement.textContent = `
            ${marginRules}
            ${fallbackRules}

            /* Ensure child elements don't override margins */
            .co_scrollWrapper > * {
                margin-left: 0 !important;
                margin-right: 0 !important;
            }

            /* Maintain proper spacing for content within scrollWrapper */
            .co_scrollWrapper .co_document,
            .co_scrollWrapper .co_contentBlock {
                margin-left: 0 !important;
                margin-right: 0 !important;
                padding-left: 0 !important;
                padding-right: 0 !important;
            }
        `;

        // Inject into head
        (document.head || document.documentElement).appendChild(marginStyleElement);

        // Save the settings
        GM_setValue(`${STORAGE_KEY_LEFT}_${currentDomain}`, leftMargin);
        GM_setValue(`${STORAGE_KEY_RIGHT}_${currentDomain}`, rightMargin);

        // Show notification
        showNotification(`Margins: Left ${leftMargin}px | Right ${rightMargin}px`);
    }

    function setSymmetricalMargins() {
        const averageMargin = Math.round((leftMargin + rightMargin) / 2);
        leftMargin = averageMargin;
        rightMargin = averageMargin;
        updateMargins();
    }

    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #2d3748;
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 14px !important;
            font-family: Arial, sans-serif !important;
            z-index: 10003;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 1px solid #4a5568;
            transition: opacity 0.3s ease;
            max-width: 280px;
            text-align: center;
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

            // Increase left margin (Shift + Left Arrow)
            if (e.key === 'ArrowLeft' && e.shiftKey && !e.ctrlKey && !e.altKey) {
                leftMargin = Math.min(leftMargin + ADJUSTMENT_STEP, 300); // Max 300px
                updateMargins();
                e.preventDefault();
            }

            // Decrease left margin (Shift + Right Arrow)
            if (e.key === 'ArrowRight' && e.shiftKey && !e.ctrlKey && !e.altKey) {
                leftMargin = Math.max(leftMargin - ADJUSTMENT_STEP, 0); // Min 0px
                updateMargins();
                e.preventDefault();
            }

            // Increase right margin (Shift + Up Arrow)
            if (e.key === 'ArrowUp' && e.shiftKey && !e.ctrlKey && !e.altKey) {
                rightMargin = Math.min(rightMargin + ADJUSTMENT_STEP, 300); // Max 300px
                updateMargins();
                e.preventDefault();
            }

            // Decrease right margin (Shift + Down Arrow)
            if (e.key === 'ArrowDown' && e.shiftKey && !e.ctrlKey && !e.altKey) {
                rightMargin = Math.max(rightMargin - ADJUSTMENT_STEP, 0); // Min 0px
                updateMargins();
                e.preventDefault();
            }

            // Increase both margins simultaneously (Shift + Plus/Equal)
            if ((e.key === '+' || e.key === '=') && e.shiftKey && !e.ctrlKey && !e.altKey) {
                leftMargin = Math.min(leftMargin + ADJUSTMENT_STEP, 300);
                rightMargin = Math.min(rightMargin + ADJUSTMENT_STEP, 300);
                updateMargins();
                e.preventDefault();
            }

            // Decrease both margins simultaneously (Shift + Minus)
            if (e.key === '-' && e.shiftKey && !e.ctrlKey && !e.altKey) {
                leftMargin = Math.max(leftMargin - ADJUSTMENT_STEP, 0);
                rightMargin = Math.max(rightMargin - ADJUSTMENT_STEP, 0);
                updateMargins();
                e.preventDefault();
            }

            // Make margins symmetrical (Shift + S)
            if (e.key === 'S' && e.shiftKey && !e.ctrlKey && !e.altKey) {
                setSymmetricalMargins();
                e.preventDefault();
            }

            // Reset to defaults (Shift + R)
            if (e.key === 'R' && e.shiftKey && !e.ctrlKey && !e.altKey) {
                leftMargin = DEFAULT_LEFT_MARGIN;
                rightMargin = DEFAULT_RIGHT_MARGIN;
                updateMargins();
                e.preventDefault();
            }
        }
    });

    // Menu commands for manual adjustment
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

    GM_registerMenuCommand('📏 Increase Both Margins', () => {
        leftMargin = Math.min(leftMargin + ADJUSTMENT_STEP, 300);
        rightMargin = Math.min(rightMargin + ADJUSTMENT_STEP, 300);
        updateMargins();
    });

    GM_registerMenuCommand('📐 Decrease Both Margins', () => {
        leftMargin = Math.max(leftMargin - ADJUSTMENT_STEP, 0);
        rightMargin = Math.max(rightMargin - ADJUSTMENT_STEP, 0);
        updateMargins();
    });

    GM_registerMenuCommand('🔄 Make Margins Symmetrical', setSymmetricalMargins);

    GM_registerMenuCommand('🔧 Reset to Default Margins', () => {
        leftMargin = DEFAULT_LEFT_MARGIN;
        rightMargin = DEFAULT_RIGHT_MARGIN;
        updateMargins();
    });

    GM_registerMenuCommand(`📏 Current: L${leftMargin}px | R${rightMargin}px`, () => {
        showNotification(`Current margins: Left ${leftMargin}px | Right ${rightMargin}px for ${currentDomain}`);
    });

    // Function to apply margins when content loads
    function applyMargins() {
        updateMargins();
    }

    // Apply initial margins when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyMargins);
    } else {
        applyMargins();
    }

    // Reapply when new content is added (for dynamic pages)
    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if main content was added
                for (let node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const hasMainContent = node.matches && (
                            node.matches('.co_scrollWrapper') ||
                            node.querySelector('.co_scrollWrapper') ||
                            SECONDARY_SELECTORS.some(selector =>
                                node.matches(selector) || node.querySelector(selector)
                            )
                        );

                        if (hasMainContent) {
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
            observer.timeoutId = setTimeout(applyMargins, 200);
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
    console.log(`Westlaw Margin Adjuster loaded. Current: L${leftMargin}px | R${rightMargin}px. Use Shift+Arrows to adjust.`);

})();