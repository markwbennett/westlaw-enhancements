// ==UserScript==
// @name        Readability Enhancer
// @namespace   Violentmonkey Scripts
// @match       *://*/*
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_registerMenuCommand
// @version     2.0
// @author      -
// @description Simple readability controls: background color, text color, text size, and line height
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_KEY = 'readabilitySettings';
    const currentDomain = window.location.hostname;

    // Default settings
    const DEFAULT_SETTINGS = {
        backgroundEnabled: false,
        textColorEnabled: false,
        textSizeEnabled: false,
        lineHeightEnabled: false,
        backgroundColor: '#ffffff',
        textColor: '#333333',
        textSize: 16,
        lineHeight: 1.5
    };

    // Load saved settings for this domain
    let settings = GM_getValue(`${STORAGE_KEY}_${currentDomain}`, DEFAULT_SETTINGS);

    let styleElement = null;

    function applyStyles() {
        // Remove existing style if present
        if (styleElement) {
            styleElement.remove();
        }

        // Create new style element
        styleElement = document.createElement('style');
        styleElement.id = 'readability-enhancer';
        
        let css = '';

        // Apply background color if enabled
        if (settings.backgroundEnabled) {
            css += `
                html, body {
                    background-color: ${settings.backgroundColor} !important;
                }
            `;
        }

        // Apply text color if enabled
        if (settings.textColorEnabled) {
            css += `
                body, p, div, span, h1, h2, h3, h4, h5, h6, li, td, th, a, label, input, textarea, select {
                    color: ${settings.textColor} !important;
                }
            `;
        }

        // Apply text size if enabled
        if (settings.textSizeEnabled) {
            css += `
                body, p, div, span, li, td, th, label, input, textarea, select {
                    font-size: ${settings.textSize}px !important;
                }
            `;
        }

        // Apply line height if enabled
        if (settings.lineHeightEnabled) {
            css += `
                body, p, div, span, li, td, th {
                    line-height: ${settings.lineHeight} !important;
                }
            `;
        }

        styleElement.textContent = css;

        // Inject styles if any are enabled
        if (css) {
            (document.head || document.documentElement).appendChild(styleElement);
        }
    }

    function saveSettings() {
        GM_setValue(`${STORAGE_KEY}_${currentDomain}`, settings);
    }

    function showStatus() {
        const status = [];
        if (settings.backgroundEnabled) status.push(`BG: ${settings.backgroundColor}`);
        if (settings.textColorEnabled) status.push(`Text: ${settings.textColor}`);
        if (settings.textSizeEnabled) status.push(`Size: ${settings.textSize}px`);
        if (settings.lineHeightEnabled) status.push(`Line: ${settings.lineHeight}`);
        
        console.log(`Readability: ${status.length ? status.join(' | ') : 'All disabled'}`);
    }

    // Control functions
    function toggleBackground() {
        settings.backgroundEnabled = !settings.backgroundEnabled;
        saveSettings();
        applyStyles();
        showStatus();
    }

    function toggleTextColor() {
        settings.textColorEnabled = !settings.textColorEnabled;
        saveSettings();
        applyStyles();
        showStatus();
    }

    function toggleTextSize() {
        settings.textSizeEnabled = !settings.textSizeEnabled;
        saveSettings();
        applyStyles();
        showStatus();
    }

    function toggleLineHeight() {
        settings.lineHeightEnabled = !settings.lineHeightEnabled;
        saveSettings();
        applyStyles();
        showStatus();
    }

    // Slider functions
    function adjustTextSize(delta) {
        settings.textSize = Math.max(8, Math.min(48, settings.textSize + delta));
        saveSettings();
        applyStyles();
        showStatus();
    }

    function adjustLineHeight(delta) {
        settings.lineHeight = Math.max(1.0, Math.min(3.0, parseFloat((settings.lineHeight + delta).toFixed(1))));
        saveSettings();
        applyStyles();
        showStatus();
    }

    function cycleBackgroundColor() {
        const colors = ['#ffffff', '#f8f9fa', '#e9ecef', '#1a1a1a', '#2d3748', '#000000'];
        const currentIndex = colors.indexOf(settings.backgroundColor);
        const nextIndex = (currentIndex + 1) % colors.length;
        settings.backgroundColor = colors[nextIndex];
        saveSettings();
        applyStyles();
        showStatus();
    }

    function cycleTextColor() {
        const colors = ['#333333', '#000000', '#2c3e50', '#ffffff', '#e8e8e8', '#f8f9fa'];
        const currentIndex = colors.indexOf(settings.textColor);
        const nextIndex = (currentIndex + 1) % colors.length;
        settings.textColor = colors[nextIndex];
        saveSettings();
        applyStyles();
        showStatus();
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (document.activeElement.tagName !== 'INPUT' &&
            document.activeElement.tagName !== 'TEXTAREA' &&
            !document.activeElement.isContentEditable) {

            // Toggle switches
            if (e.key === '1' && e.altKey && !e.ctrlKey && !e.shiftKey) {
                toggleBackground();
                e.preventDefault();
            }

            if (e.key === '2' && e.altKey && !e.ctrlKey && !e.shiftKey) {
                toggleTextColor();
                e.preventDefault();
            }

            if (e.key === '3' && e.altKey && !e.ctrlKey && !e.shiftKey) {
                toggleTextSize();
                e.preventDefault();
            }

            if (e.key === '4' && e.altKey && !e.ctrlKey && !e.shiftKey) {
                toggleLineHeight();
                e.preventDefault();
            }

            // Color cycling
            if (e.key === 'b' && e.altKey && !e.ctrlKey && !e.shiftKey) {
                cycleBackgroundColor();
                e.preventDefault();
            }

            if (e.key === 't' && e.altKey && !e.ctrlKey && !e.shiftKey) {
                cycleTextColor();
                e.preventDefault();
            }

            // Text size sliders
            if ((e.key === '+' || e.key === '=') && e.altKey && !e.ctrlKey && !e.shiftKey) {
                adjustTextSize(1);
                e.preventDefault();
            }

            if (e.key === '-' && e.altKey && !e.ctrlKey && !e.shiftKey) {
                adjustTextSize(-1);
                e.preventDefault();
            }

            // Line height sliders
            if (e.key === 'ArrowUp' && e.altKey && !e.ctrlKey && !e.shiftKey) {
                adjustLineHeight(0.1);
                e.preventDefault();
            }

            if (e.key === 'ArrowDown' && e.altKey && !e.ctrlKey && !e.shiftKey) {
                adjustLineHeight(-0.1);
                e.preventDefault();
            }
        }
    });

    // Menu commands
    GM_registerMenuCommand('🎨 Toggle Background Color', toggleBackground);
    GM_registerMenuCommand('🔄 Cycle Background Colors', cycleBackgroundColor);
    GM_registerMenuCommand('📝 Toggle Text Color', toggleTextColor);
    GM_registerMenuCommand('🔄 Cycle Text Colors', cycleTextColor);
    GM_registerMenuCommand('📏 Toggle Text Size', toggleTextSize);
    GM_registerMenuCommand('➕ Increase Text Size', () => adjustTextSize(1));
    GM_registerMenuCommand('➖ Decrease Text Size', () => adjustTextSize(-1));
    GM_registerMenuCommand('📐 Toggle Line Height', toggleLineHeight);
    GM_registerMenuCommand('⬆️ Increase Line Height', () => adjustLineHeight(0.1));
    GM_registerMenuCommand('⬇️ Decrease Line Height', () => adjustLineHeight(-0.1));
    GM_registerMenuCommand('🔧 Reset All', () => {
        settings = { ...DEFAULT_SETTINGS };
        saveSettings();
        applyStyles();
        showStatus();
    });

    // Initialize
    function init() {
        applyStyles();
        showStatus();
        console.log('Readability Enhancer loaded. Shortcuts: Alt+1-4 (toggles), Alt+B/T (colors), Alt+±/↑↓ (sliders)');
    }

    // Wait for page to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(); 