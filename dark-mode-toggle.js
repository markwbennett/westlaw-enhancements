// ==UserScript==
// @name        Dark Mode Toggle
// @namespace   Violentmonkey Scripts
// @match       *://*/*
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_registerMenuCommand
// @version     3.1
// @author      -
// @description Toggle dark mode: light text on black background
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_KEY = 'darkModeEnabled';
    const currentDomain = window.location.hostname;

    // Load saved setting for this domain
    let darkModeEnabled = GM_getValue(`${STORAGE_KEY}_${currentDomain}`, false);

    let styleElement = null;

    function applyDarkMode() {
        // Remove existing style if present
        if (styleElement) {
            styleElement.remove();
            styleElement = null;
        }

        if (darkModeEnabled) {
            // Create comprehensive dark mode styles
            styleElement = document.createElement('style');
            styleElement.id = 'dark-mode-toggle';
            styleElement.textContent = `
                /* Force all elements to dark mode */
                *, *::before, *::after {
                    background-color: #000000 !important;
                    background-image: none !important;
                    color: #ffffff !important;
                    border-color: #333333 !important;
                    box-shadow: none !important;
                    text-shadow: none !important;
                }
                
                /* Root elements */
                html, body {
                    background: #000000 !important;
                    color: #ffffff !important;
                }
                
                /* Text elements */
                p, div, span, h1, h2, h3, h4, h5, h6, li, td, th, 
                label, legend, caption, figcaption, blockquote, pre, code,
                article, section, aside, header, footer, main, nav,
                address, time, mark, small, strong, em, b, i, u, s,
                sub, sup, del, ins, abbr, dfn, kbd, samp, var, cite, q {
                    color: #ffffff !important;
                    background-color: #000000 !important;
                    background-image: none !important;
                }
                
                /* Links */
                a, a:link, a:visited {
                    color: #66ccff !important;
                    background-color: #000000 !important;
                }
                
                a:hover, a:focus, a:active {
                    color: #99ddff !important;
                    background-color: #111111 !important;
                }
                
                /* Form elements */
                input, textarea, select, option, optgroup {
                    background-color: #222222 !important;
                    color: #ffffff !important;
                    border: 1px solid #555555 !important;
                }
                
                input[type="text"], input[type="password"], input[type="email"],
                input[type="search"], input[type="url"], input[type="tel"],
                input[type="number"], input[type="date"], input[type="time"],
                input[type="datetime-local"], input[type="month"], input[type="week"] {
                    background-color: #222222 !important;
                    color: #ffffff !important;
                }
                
                /* Buttons */
                button, input[type="button"], input[type="submit"], input[type="reset"] {
                    background-color: #333333 !important;
                    color: #ffffff !important;
                    border: 1px solid #555555 !important;
                }
                
                button:hover, input[type="button"]:hover, 
                input[type="submit"]:hover, input[type="reset"]:hover {
                    background-color: #444444 !important;
                }
                
                /* Tables */
                table, tr, td, th, thead, tbody, tfoot {
                    background-color: #000000 !important;
                    color: #ffffff !important;
                    border-color: #333333 !important;
                }
                
                /* Lists */
                ul, ol, dl, li, dt, dd {
                    background-color: #000000 !important;
                    color: #ffffff !important;
                }
                
                /* Media elements */
                img {
                    opacity: 0.8 !important;
                    background-color: transparent !important;
                }
                
                video, canvas, svg {
                    opacity: 0.9 !important;
                }
                
                /* Common UI elements */
                .header, .footer, .sidebar, .menu, .nav, .navbar,
                .content, .main, .wrapper, .container, .panel, .card,
                .modal, .dialog, .popup, .dropdown, .tooltip {
                    background-color: #000000 !important;
                    color: #ffffff !important;
                    background-image: none !important;
                }
                
                /* Override any inline styles that might interfere */
                [style*="background"], [style*="color"] {
                    background-color: #000000 !important;
                    color: #ffffff !important;
                    background-image: none !important;
                }
                
                /* Special cases for common patterns */
                div[class*="bg-"], span[class*="bg-"], section[class*="bg-"],
                div[class*="background"], span[class*="background"] {
                    background-color: #000000 !important;
                    background-image: none !important;
                }
                
                /* Text color classes */
                [class*="text-"], [class*="color-"] {
                    color: #ffffff !important;
                }
                
                /* Link color classes */
                [class*="link-"], a[class*="text-"], a[class*="color-"] {
                    color: #66ccff !important;
                }
                
                /* Ensure readability for highlighted text */
                ::selection {
                    background-color: #333333 !important;
                    color: #ffffff !important;
                }
                
                ::-moz-selection {
                    background-color: #333333 !important;
                    color: #ffffff !important;
                }
                
                /* Handle pseudo-elements */
                *::before, *::after {
                    color: #ffffff !important;
                    background-color: #000000 !important;
                }
            `;

            // Inject styles
            (document.head || document.documentElement).appendChild(styleElement);
        }
    }

    function toggleDarkMode() {
        darkModeEnabled = !darkModeEnabled;
        GM_setValue(`${STORAGE_KEY}_${currentDomain}`, darkModeEnabled);
        applyDarkMode();
        console.log(`Dark mode: ${darkModeEnabled ? 'ON' : 'OFF'}`);
    }

    // Keyboard shortcut (Alt + D)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'd' && e.altKey && !e.ctrlKey && !e.shiftKey) {
            toggleDarkMode();
            e.preventDefault();
        }
    });

    // Menu command
    GM_registerMenuCommand('🌙 Toggle Dark Mode', toggleDarkMode);

    // Initialize
    function init() {
        applyDarkMode();
        console.log(`Dark Mode Toggle loaded. Press Alt+D to toggle. Current: ${darkModeEnabled ? 'ON' : 'OFF'}`);
    }

    // Wait for page to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Reapply styles when new content is added (for dynamic pages)
    const observer = new MutationObserver(function(mutations) {
        if (darkModeEnabled) {
            // Debounce to avoid excessive reapplication
            clearTimeout(observer.timeoutId);
            observer.timeoutId = setTimeout(() => {
                applyDarkMode();
            }, 100);
        }
    });

    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }

})(); 