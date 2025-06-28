// ==UserScript==
// @name        Readability Enhancer
// @namespace   Violentmonkey Scripts
// @match       *://*/*
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_registerMenuCommand
// @version     1.0
// @author      -
// @description Apply best practices for readability: optimal fonts, colors, spacing, and layout
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_KEY = 'readabilitySettings';
    const currentDomain = window.location.hostname;

    // Default readability settings based on research and best practices
    const DEFAULT_SETTINGS = {
        enabled: false,
        fontSize: 18,           // 16-18px optimal for reading
        lineHeight: 1.6,        // 1.4-1.6 optimal line spacing
        maxWidth: 70,           // 45-75 characters per line optimal
        fontFamily: 'system',   // System fonts for familiarity
        colorScheme: 'auto',    // auto, light, dark, sepia
        letterSpacing: 0,       // Slight letter spacing can help
        wordSpacing: 0,         // Normal word spacing
        paragraphSpacing: 1.2   // Space between paragraphs
    };

    // Load saved settings for this domain
    let settings = GM_getValue(`${STORAGE_KEY}_${currentDomain}`, DEFAULT_SETTINGS);

    // Font stacks optimized for readability
    const FONT_FAMILIES = {
        system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        serif: 'Georgia, "Times New Roman", Times, serif',
        sansSerif: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        openDyslexic: '"OpenDyslexic", "Comic Sans MS", cursive', // Dyslexia-friendly
        mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace'
    };

    // Color schemes optimized for readability
    const COLOR_SCHEMES = {
        light: {
            background: '#ffffff',
            text: '#2c3e50',
            accent: '#3498db',
            border: '#ecf0f1'
        },
        dark: {
            background: '#1a1a1a',
            text: '#e8e8e8',
            accent: '#64b5f6',
            border: '#333333'
        },
        sepia: {
            background: '#f7f3e9',
            text: '#5c4b37',
            accent: '#8b4513',
            border: '#d4c4a8'
        },
        highContrast: {
            background: '#000000',
            text: '#ffffff',
            accent: '#ffff00',
            border: '#ffffff'
        }
    };

    let styleElement = null;

    function applyReadabilityStyles() {
        if (!settings.enabled) {
            if (styleElement) {
                styleElement.remove();
                styleElement = null;
            }
            return;
        }

        // Remove existing style if present
        if (styleElement) {
            styleElement.remove();
        }

        // Determine color scheme
        let colorScheme;
        if (settings.colorScheme === 'auto') {
            // Detect system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            colorScheme = COLOR_SCHEMES[prefersDark ? 'dark' : 'light'];
        } else {
            colorScheme = COLOR_SCHEMES[settings.colorScheme];
        }

        // Create comprehensive readability styles
        styleElement = document.createElement('style');
        styleElement.id = 'readability-enhancer';
        styleElement.textContent = `
            /* Reset and base styles for readability */
            html {
                font-size: ${settings.fontSize}px !important;
                line-height: ${settings.lineHeight} !important;
                font-family: ${FONT_FAMILIES[settings.fontFamily]} !important;
                background-color: ${colorScheme.background} !important;
                color: ${colorScheme.text} !important;
                letter-spacing: ${settings.letterSpacing}px !important;
                word-spacing: ${settings.wordSpacing}px !important;
            }

            body {
                background-color: ${colorScheme.background} !important;
                color: ${colorScheme.text} !important;
                font-family: inherit !important;
                line-height: inherit !important;
                margin: 0 !important;
                padding: 20px !important;
                max-width: none !important;
            }

            /* Content width optimization for reading */
            article,
            main,
            .content,
            .post-content,
            .entry-content,
            .article-content,
            [role="main"] {
                max-width: ${settings.maxWidth}ch !important;
                margin-left: auto !important;
                margin-right: auto !important;
                padding: 0 20px !important;
            }

            /* Typography improvements */
            h1, h2, h3, h4, h5, h6 {
                color: ${colorScheme.text} !important;
                font-family: inherit !important;
                line-height: 1.3 !important;
                margin-top: ${settings.paragraphSpacing * 1.5}em !important;
                margin-bottom: ${settings.paragraphSpacing * 0.5}em !important;
                font-weight: 600 !important;
            }

            h1 { font-size: 2em !important; }
            h2 { font-size: 1.75em !important; }
            h3 { font-size: 1.5em !important; }
            h4 { font-size: 1.25em !important; }
            h5 { font-size: 1.1em !important; }
            h6 { font-size: 1em !important; }

            p, div, span, li {
                color: ${colorScheme.text} !important;
                font-family: inherit !important;
                line-height: inherit !important;
                font-size: inherit !important;
            }

            p {
                margin-bottom: ${settings.paragraphSpacing}em !important;
                margin-top: 0 !important;
                text-align: left !important;
            }

            /* List improvements */
            ul, ol {
                margin: ${settings.paragraphSpacing}em 0 !important;
                padding-left: 2em !important;
            }

            li {
                margin-bottom: 0.5em !important;
            }

            /* Link styling for accessibility */
            a {
                color: ${colorScheme.accent} !important;
                text-decoration: underline !important;
                text-decoration-thickness: 1px !important;
                text-underline-offset: 2px !important;
            }

            a:hover, a:focus {
                text-decoration-thickness: 2px !important;
                outline: 2px solid ${colorScheme.accent} !important;
                outline-offset: 2px !important;
            }

            /* Code and preformatted text */
            code, pre {
                font-family: ${FONT_FAMILIES.mono} !important;
                background-color: ${colorScheme.border} !important;
                color: ${colorScheme.text} !important;
                border-radius: 4px !important;
            }

            code {
                padding: 2px 4px !important;
                font-size: 0.9em !important;
            }

            pre {
                padding: 1em !important;
                margin: ${settings.paragraphSpacing}em 0 !important;
                overflow-x: auto !important;
                line-height: 1.4 !important;
            }

            /* Table improvements */
            table {
                border-collapse: collapse !important;
                width: 100% !important;
                margin: ${settings.paragraphSpacing}em 0 !important;
            }

            th, td {
                border: 1px solid ${colorScheme.border} !important;
                padding: 8px 12px !important;
                text-align: left !important;
                color: ${colorScheme.text} !important;
            }

            th {
                background-color: ${colorScheme.border} !important;
                font-weight: 600 !important;
            }

            /* Form improvements */
            input, textarea, select, button {
                font-family: inherit !important;
                font-size: inherit !important;
                line-height: inherit !important;
                color: ${colorScheme.text} !important;
                background-color: ${colorScheme.background} !important;
                border: 2px solid ${colorScheme.border} !important;
                border-radius: 4px !important;
                padding: 8px 12px !important;
            }

            button {
                background-color: ${colorScheme.accent} !important;
                color: ${colorScheme.background} !important;
                cursor: pointer !important;
                border: none !important;
            }

            button:hover, button:focus {
                opacity: 0.9 !important;
                outline: 2px solid ${colorScheme.accent} !important;
                outline-offset: 2px !important;
            }

            /* Image improvements */
            img {
                max-width: 100% !important;
                height: auto !important;
                border-radius: 4px !important;
                margin: ${settings.paragraphSpacing}em 0 !important;
            }

            /* Blockquote styling */
            blockquote {
                border-left: 4px solid ${colorScheme.accent} !important;
                margin: ${settings.paragraphSpacing}em 0 !important;
                padding: 1em 1.5em !important;
                background-color: ${colorScheme.border} !important;
                color: ${colorScheme.text} !important;
                font-style: italic !important;
            }

            /* Remove distracting elements */
            .ad, .ads, .advertisement, .sidebar, .related-posts,
            [class*="ad-"], [id*="ad-"], [class*="ads-"], [id*="ads-"] {
                display: none !important;
            }

            /* Focus improvements for accessibility */
            *:focus {
                outline: 2px solid ${colorScheme.accent} !important;
                outline-offset: 2px !important;
            }

            /* Print styles */
            @media print {
                * {
                    background: white !important;
                    color: black !important;
                }
            }

            /* Responsive adjustments */
            @media (max-width: 768px) {
                body {
                    padding: 15px !important;
                }
                
                article, main, .content, .post-content, .entry-content, .article-content, [role="main"] {
                    padding: 0 10px !important;
                }
            }
        `;

        // Inject styles
        (document.head || document.documentElement).appendChild(styleElement);
    }

    // Toggle readability mode
    function toggleReadability() {
        settings.enabled = !settings.enabled;
        saveSettings();
        applyReadabilityStyles();
        showStatus();
    }

    // Cycle through color schemes
    function cycleColorScheme() {
        const schemes = ['auto', 'light', 'dark', 'sepia', 'highContrast'];
        const currentIndex = schemes.indexOf(settings.colorScheme);
        const nextIndex = (currentIndex + 1) % schemes.length;
        settings.colorScheme = schemes[nextIndex];
        saveSettings();
        applyReadabilityStyles();
        showStatus();
    }

    // Cycle through font families
    function cycleFontFamily() {
        const fonts = ['system', 'serif', 'sansSerif', 'openDyslexic', 'mono'];
        const currentIndex = fonts.indexOf(settings.fontFamily);
        const nextIndex = (currentIndex + 1) % fonts.length;
        settings.fontFamily = fonts[nextIndex];
        saveSettings();
        applyReadabilityStyles();
        showStatus();
    }

    // Adjust font size
    function adjustFontSize(delta) {
        settings.fontSize = Math.max(12, Math.min(32, settings.fontSize + delta));
        saveSettings();
        applyReadabilityStyles();
        showStatus();
    }

    // Adjust line height
    function adjustLineHeight(delta) {
        settings.lineHeight = Math.max(1.2, Math.min(2.0, settings.lineHeight + delta));
        saveSettings();
        applyReadabilityStyles();
        showStatus();
    }

    // Adjust content width
    function adjustWidth(delta) {
        settings.maxWidth = Math.max(45, Math.min(100, settings.maxWidth + delta));
        saveSettings();
        applyReadabilityStyles();
        showStatus();
    }

    // Save settings
    function saveSettings() {
        GM_setValue(`${STORAGE_KEY}_${currentDomain}`, settings);
    }

    // Show current status
    function showStatus() {
        const status = settings.enabled ? 'ON' : 'OFF';
        const fontName = settings.fontFamily.charAt(0).toUpperCase() + settings.fontFamily.slice(1);
        const schemeName = settings.colorScheme.charAt(0).toUpperCase() + settings.colorScheme.slice(1);
        
        console.log(`Readability: ${status} | Font: ${fontName} | Colors: ${schemeName} | Size: ${settings.fontSize}px | Width: ${settings.maxWidth}ch`);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (document.activeElement.tagName !== 'INPUT' &&
            document.activeElement.tagName !== 'TEXTAREA' &&
            !document.activeElement.isContentEditable) {

            // Toggle readability (Alt + R)
            if (e.key === 'r' && e.altKey && !e.ctrlKey && !e.shiftKey) {
                toggleReadability();
                e.preventDefault();
            }

            // Cycle color scheme (Alt + C)
            if (e.key === 'c' && e.altKey && !e.ctrlKey && !e.shiftKey) {
                cycleColorScheme();
                e.preventDefault();
            }

            // Cycle font family (Alt + F)
            if (e.key === 'f' && e.altKey && !e.ctrlKey && !e.shiftKey) {
                cycleFontFamily();
                e.preventDefault();
            }

            // Font size adjustments (Alt + Plus/Minus)
            if ((e.key === '+' || e.key === '=') && e.altKey && !e.ctrlKey && !e.shiftKey) {
                adjustFontSize(1);
                e.preventDefault();
            }

            if (e.key === '-' && e.altKey && !e.ctrlKey && !e.shiftKey) {
                adjustFontSize(-1);
                e.preventDefault();
            }

            // Line height adjustments (Alt + Shift + Plus/Minus)
            if ((e.key === '+' || e.key === '=') && e.altKey && !e.ctrlKey && e.shiftKey) {
                adjustLineHeight(0.1);
                e.preventDefault();
            }

            if (e.key === '-' && e.altKey && !e.ctrlKey && e.shiftKey) {
                adjustLineHeight(-0.1);
                e.preventDefault();
            }

            // Width adjustments (Alt + Left/Right)
            if (e.key === 'ArrowLeft' && e.altKey && !e.ctrlKey && !e.shiftKey) {
                adjustWidth(-5);
                e.preventDefault();
            }

            if (e.key === 'ArrowRight' && e.altKey && !e.ctrlKey && !e.shiftKey) {
                adjustWidth(5);
                e.preventDefault();
            }
        }
    });

    // Menu commands
    GM_registerMenuCommand('🔄 Toggle Readability Mode', toggleReadability);
    GM_registerMenuCommand('🎨 Cycle Color Scheme', cycleColorScheme);
    GM_registerMenuCommand('🔤 Cycle Font Family', cycleFontFamily);
    GM_registerMenuCommand('➕ Increase Font Size', () => adjustFontSize(1));
    GM_registerMenuCommand('➖ Decrease Font Size', () => adjustFontSize(-1));
    GM_registerMenuCommand('📏 Increase Line Height', () => adjustLineHeight(0.1));
    GM_registerMenuCommand('📐 Decrease Line Height', () => adjustLineHeight(-0.1));
    GM_registerMenuCommand('↔️ Increase Width', () => adjustWidth(5));
    GM_registerMenuCommand('↕️ Decrease Width', () => adjustWidth(-5));
    GM_registerMenuCommand('🔧 Reset to Defaults', () => {
        settings = { ...DEFAULT_SETTINGS };
        saveSettings();
        applyReadabilityStyles();
        showStatus();
    });

    // Auto-detect system color scheme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (settings.colorScheme === 'auto') {
                applyReadabilityStyles();
            }
        });
    }

    // Initialize
    function init() {
        // Apply styles if enabled
        if (settings.enabled) {
            applyReadabilityStyles();
        }
        
        // Show initial status
        showStatus();
    }

    // Wait for page to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Reapply styles when new content is added
    const observer = new MutationObserver(function(mutations) {
        if (settings.enabled) {
            let shouldReapply = false;
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    for (let node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE &&
                            (node.tagName === 'ARTICLE' || node.tagName === 'MAIN' ||
                             node.classList.contains('content') || node.classList.contains('post'))) {
                            shouldReapply = true;
                            break;
                        }
                    }
                }
            });

            if (shouldReapply) {
                clearTimeout(observer.timeoutId);
                observer.timeoutId = setTimeout(() => {
                    applyReadabilityStyles();
                }, 500);
            }
        }
    });

    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    console.log('Readability Enhancer loaded. Press Alt+R to toggle, Alt+C for colors, Alt+F for fonts.');

})(); 