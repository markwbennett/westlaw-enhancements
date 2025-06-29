// ==UserScript==
// @name        Dark Mode Toggle
// @namespace   Violentmonkey Scripts
// @match       *://*/*
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_registerMenuCommand
// @version     3.0
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
            // Create dark mode styles
            styleElement = document.createElement('style');
            styleElement.id = 'dark-mode-toggle';
            styleElement.textContent = `
                html, body {
                    background-color: #000000 !important;
                    color: #ffffff !important;
                }
                
                * {
                    background-color: #000000 !important;
                    color: #ffffff !important;
                    border-color: #333333 !important;
                }
                
                a, a:visited {
                    color: #66ccff !important;
                }
                
                a:hover {
                    color: #99ddff !important;
                }
                
                input, textarea, select {
                    background-color: #222222 !important;
                    color: #ffffff !important;
                    border: 1px solid #555555 !important;
                }
                
                button {
                    background-color: #333333 !important;
                    color: #ffffff !important;
                    border: 1px solid #555555 !important;
                }
                
                img {
                    opacity: 0.8 !important;
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

})(); 