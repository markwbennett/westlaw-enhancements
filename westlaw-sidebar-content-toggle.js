// ==UserScript==
// @name        Westlaw Sidebar Toggle
// @namespace   Violentmonkey Scripts
// @match       *://*.westlaw.com/*
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_registerMenuCommand
// @version     1.0
// @author      -
// @description Toggle Westlaw sidebar with F2 key to maximize content width
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_KEY = 'westlawSidebarHidden';

    // Get current domain for domain-specific settings
    const currentDomain = window.location.hostname;

    // Load saved sidebar state for this domain
    let sidebarHidden = GM_getValue(`${STORAGE_KEY}_${currentDomain}`, false);

    // Target selectors for the sidebar and main content
    const SIDEBAR_SELECTORS = [
        '#co_rightColumn',                    // Main right column container
        'aside[role="complementary"]',        // Semantic aside element
        '#coid_website_relatedInfoWidgetDiv', // Related info widget
        '#coid_website_recommendedDocuments', // Recommended documents
        '#coid_website_documentToolWidgetDiv', // Document tools
        '.co_relatedinfo_topic_container',
        '.co_recommendedDocumentContainer',
        '[id*="relatedInfo"]',
        '.co_rightRail',
        '.co_sideBar'
    ];

    // Main content selectors that should expand when sidebar is hidden
    const MAIN_CONTENT_SELECTORS = [
        '.co_scrollWrapper',
        '#co_document',
        '.co_document',
        '#coid_website_documentWidgetDiv',
        '.co_mainContent',
        '.co_contentWrapper'
    ];

    let toggleStyleElement = null;

    function updateSidebarVisibility() {
        // Remove existing style if present
        if (toggleStyleElement) {
            toggleStyleElement.remove();
        }

        // Create new style element
        toggleStyleElement = document.createElement('style');
        toggleStyleElement.id = 'westlaw-sidebar-toggle';

        if (sidebarHidden) {
            // Hide sidebar and expand main content
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

                /* Hide the entire right column structure */
                aside[id="co_rightColumn"],
                aside.co_addFocusCorrection[role="complementary"] {
                    display: none !important;
                    visibility: hidden !important;
                    width: 0 !important;
                }

                /* Ensure main content expands properly */
                .co_mainColumn {
                    width: 100% !important;
                    max-width: 100% !important;
                    margin-right: 0 !important;
                }

                /* Hide any right column containers */
                .co_rightColumn,
                .co_rightRailContainer {
                    display: none !important;
                }

                /* Expand document container */
                .co_documentContainer {
                    margin-right: 0 !important;
                    width: 100% !important;
                }

                /* Expand the main content wrapper */
                .co_contentWrapper,
                .co_mainContentWrapper {
                    width: 100% !important;
                    max-width: 100% !important;
                }

                /* Remove any fixed widths that might constrain expansion */
                .co_document,
                .co_scrollWrapper {
                    width: auto !important;
                    max-width: none !important;
                }
            `;
        } else {
            // Show sidebar (reset to default)
            toggleStyleElement.textContent = `
                /* Reset any hidden sidebars */
                ${SIDEBAR_SELECTORS.map(selector => `
                    ${selector} {
                        display: block !important;
                        visibility: visible !important;
                    }
                `).join('\n')}
            `;
        }

        // Inject into head
        (document.head || document.documentElement).appendChild(toggleStyleElement);

        // Save the setting
        GM_setValue(`${STORAGE_KEY}_${currentDomain}`, sidebarHidden);

        // Show notification
        showNotification(sidebarHidden ? 'Sidebar hidden - Content expanded' : 'Sidebar visible - Normal width');
    }

    function toggleSidebar() {
        sidebarHidden = !sidebarHidden;
        updateSidebarVisibility();
    }

    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            background: ${sidebarHidden ? '#2d3748' : '#2b6cb0'};
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 14px !important;
            font-family: Arial, sans-serif !important;
            z-index: 10002;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 1px solid ${sidebarHidden ? '#4a5568' : '#3182ce'};
            transition: opacity 0.3s ease;
            max-width: 250px;
        `;

        document.body.appendChild(notification);

        // Remove after 2 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }

    // Keyboard shortcut - F2 key
    document.addEventListener('keydown', function(e) {
        // F2 key to toggle sidebar
        if (e.key === 'F2' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
            toggleSidebar();
            e.preventDefault();
        }
    });

    // Menu commands
    GM_registerMenuCommand(sidebarHidden ? '👁️ Show Westlaw Sidebar' : '🙈 Hide Westlaw Sidebar', toggleSidebar);

    GM_registerMenuCommand('📏 Toggle Sidebar (F2)', toggleSidebar);

    // Function to apply settings when content loads
    function applySidebarSettings() {
        updateSidebarVisibility();
    }

    // Apply initial settings when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applySidebarSettings);
    } else {
        applySidebarSettings();
    }

    // Reapply when new content is added (for dynamic pages)
    const observer = new MutationObserver(function(mutations) {
        let shouldUpdate = false;
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if sidebar or main content was added
                for (let node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const hasSidebarContent = SIDEBAR_SELECTORS.some(selector => {
                            return node.matches && (node.matches(selector) || node.querySelector(selector));
                        });

                        const hasMainContent = MAIN_CONTENT_SELECTORS.some(selector => {
                            return node.matches && (node.matches(selector) || node.querySelector(selector));
                        });

                        if (hasSidebarContent || hasMainContent) {
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
            observer.timeoutId = setTimeout(applySidebarSettings, 200);
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
    console.log(`Westlaw Sidebar Toggle loaded. Current state: ${sidebarHidden ? 'Hidden' : 'Visible'}. Press F2 to toggle.`);

})();