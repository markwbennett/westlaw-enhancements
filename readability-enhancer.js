// ==UserScript==
// @name        Readability Enhancer
// @namespace   Violentmonkey Scripts
// @match       *://*/*
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_registerMenuCommand
// @version     2.1
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
        lineHeight: 1.5,
        panelVisible: true
    };

    // Load saved settings for this domain
    let settings = GM_getValue(`${STORAGE_KEY}_${currentDomain}`, DEFAULT_SETTINGS);

    let styleElement = null;
    let controlPanel = null;

    function createControlPanel() {
        // Remove existing panel if present
        if (controlPanel) {
            controlPanel.remove();
        }

        // Create panel container
        controlPanel = document.createElement('div');
        controlPanel.id = 'readability-control-panel';
        controlPanel.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #fff;
                border: 2px solid #ccc;
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                font-size: 14px;
                z-index: 999999;
                min-width: 280px;
                max-width: 320px;
                user-select: none;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                    <h3 style="margin: 0; font-size: 16px; color: #333;">Readability Controls</h3>
                    <button id="toggle-panel" style="
                        background: none;
                        border: none;
                        font-size: 18px;
                        cursor: pointer;
                        padding: 2px 6px;
                        border-radius: 3px;
                        color: #666;
                    ">−</button>
                </div>
                
                <div id="panel-content">
                    <!-- Background Color -->
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <label style="font-weight: 500; color: #333;">Background Color</label>
                            <label style="position: relative; display: inline-block; width: 44px; height: 24px;">
                                <input type="checkbox" id="bg-toggle" style="opacity: 0; width: 0; height: 0;">
                                <span style="
                                    position: absolute;
                                    cursor: pointer;
                                    top: 0;
                                    left: 0;
                                    right: 0;
                                    bottom: 0;
                                    background-color: #ccc;
                                    transition: .4s;
                                    border-radius: 24px;
                                ">
                                    <span style="
                                        position: absolute;
                                        content: '';
                                        height: 18px;
                                        width: 18px;
                                        left: 3px;
                                        bottom: 3px;
                                        background-color: white;
                                        transition: .4s;
                                        border-radius: 50%;
                                    "></span>
                                </span>
                            </label>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <input type="color" id="bg-color" value="${settings.backgroundColor}" style="
                                width: 40px;
                                height: 30px;
                                border: 1px solid #ccc;
                                border-radius: 4px;
                                cursor: pointer;
                            ">
                            <button id="bg-cycle" style="
                                padding: 6px 12px;
                                border: 1px solid #ccc;
                                border-radius: 4px;
                                background: #f8f9fa;
                                cursor: pointer;
                                font-size: 12px;
                            ">Cycle</button>
                        </div>
                    </div>

                    <!-- Text Color -->
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <label style="font-weight: 500; color: #333;">Text Color</label>
                            <label style="position: relative; display: inline-block; width: 44px; height: 24px;">
                                <input type="checkbox" id="text-toggle" style="opacity: 0; width: 0; height: 0;">
                                <span style="
                                    position: absolute;
                                    cursor: pointer;
                                    top: 0;
                                    left: 0;
                                    right: 0;
                                    bottom: 0;
                                    background-color: #ccc;
                                    transition: .4s;
                                    border-radius: 24px;
                                ">
                                    <span style="
                                        position: absolute;
                                        content: '';
                                        height: 18px;
                                        width: 18px;
                                        left: 3px;
                                        bottom: 3px;
                                        background-color: white;
                                        transition: .4s;
                                        border-radius: 50%;
                                    "></span>
                                </span>
                            </label>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <input type="color" id="text-color" value="${settings.textColor}" style="
                                width: 40px;
                                height: 30px;
                                border: 1px solid #ccc;
                                border-radius: 4px;
                                cursor: pointer;
                            ">
                            <button id="text-cycle" style="
                                padding: 6px 12px;
                                border: 1px solid #ccc;
                                border-radius: 4px;
                                background: #f8f9fa;
                                cursor: pointer;
                                font-size: 12px;
                            ">Cycle</button>
                        </div>
                    </div>

                    <!-- Text Size -->
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <label style="font-weight: 500; color: #333;">Text Size</label>
                            <label style="position: relative; display: inline-block; width: 44px; height: 24px;">
                                <input type="checkbox" id="size-toggle" style="opacity: 0; width: 0; height: 0;">
                                <span style="
                                    position: absolute;
                                    cursor: pointer;
                                    top: 0;
                                    left: 0;
                                    right: 0;
                                    bottom: 0;
                                    background-color: #ccc;
                                    transition: .4s;
                                    border-radius: 24px;
                                ">
                                    <span style="
                                        position: absolute;
                                        content: '';
                                        height: 18px;
                                        width: 18px;
                                        left: 3px;
                                        bottom: 3px;
                                        background-color: white;
                                        transition: .4s;
                                        border-radius: 50%;
                                    "></span>
                                </span>
                            </label>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <input type="range" id="size-slider" min="8" max="48" value="${settings.textSize}" style="
                                flex: 1;
                                height: 6px;
                                border-radius: 3px;
                                background: #ddd;
                                outline: none;
                                cursor: pointer;
                            ">
                            <span id="size-value" style="
                                min-width: 35px;
                                text-align: center;
                                font-size: 12px;
                                color: #666;
                            ">${settings.textSize}px</span>
                        </div>
                    </div>

                    <!-- Line Height -->
                    <div style="margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <label style="font-weight: 500; color: #333;">Line Height</label>
                            <label style="position: relative; display: inline-block; width: 44px; height: 24px;">
                                <input type="checkbox" id="line-toggle" style="opacity: 0; width: 0; height: 0;">
                                <span style="
                                    position: absolute;
                                    cursor: pointer;
                                    top: 0;
                                    left: 0;
                                    right: 0;
                                    bottom: 0;
                                    background-color: #ccc;
                                    transition: .4s;
                                    border-radius: 24px;
                                ">
                                    <span style="
                                        position: absolute;
                                        content: '';
                                        height: 18px;
                                        width: 18px;
                                        left: 3px;
                                        bottom: 3px;
                                        background-color: white;
                                        transition: .4s;
                                        border-radius: 50%;
                                    "></span>
                                </span>
                            </label>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <input type="range" id="line-slider" min="1.0" max="3.0" step="0.1" value="${settings.lineHeight}" style="
                                flex: 1;
                                height: 6px;
                                border-radius: 3px;
                                background: #ddd;
                                outline: none;
                                cursor: pointer;
                            ">
                            <span id="line-value" style="
                                min-width: 30px;
                                text-align: center;
                                font-size: 12px;
                                color: #666;
                            ">${settings.lineHeight}</span>
                        </div>
                    </div>

                    <!-- Reset Button -->
                    <button id="reset-all" style="
                        width: 100%;
                        padding: 8px 12px;
                        border: 1px solid #dc3545;
                        border-radius: 4px;
                        background: #fff;
                        color: #dc3545;
                        cursor: pointer;
                        font-size: 12px;
                        margin-top: 10px;
                    ">Reset All</button>
                </div>
            </div>
        `;

        // Add to page
        document.body.appendChild(controlPanel);

        // Update toggle states
        updateToggleStates();

        // Add event listeners
        setupEventListeners();
    }

    function updateToggleStates() {
        if (!controlPanel) return;

        // Update toggle switches
        const bgToggle = controlPanel.querySelector('#bg-toggle');
        const textToggle = controlPanel.querySelector('#text-toggle');
        const sizeToggle = controlPanel.querySelector('#size-toggle');
        const lineToggle = controlPanel.querySelector('#line-toggle');

        if (bgToggle) {
            bgToggle.checked = settings.backgroundEnabled;
            updateToggleAppearance(bgToggle, settings.backgroundEnabled);
        }
        if (textToggle) {
            textToggle.checked = settings.textColorEnabled;
            updateToggleAppearance(textToggle, settings.textColorEnabled);
        }
        if (sizeToggle) {
            sizeToggle.checked = settings.textSizeEnabled;
            updateToggleAppearance(sizeToggle, settings.textSizeEnabled);
        }
        if (lineToggle) {
            lineToggle.checked = settings.lineHeightEnabled;
            updateToggleAppearance(lineToggle, settings.lineHeightEnabled);
        }

        // Update color inputs
        const bgColor = controlPanel.querySelector('#bg-color');
        const textColor = controlPanel.querySelector('#text-color');
        if (bgColor) bgColor.value = settings.backgroundColor;
        if (textColor) textColor.value = settings.textColor;

        // Update sliders
        const sizeSlider = controlPanel.querySelector('#size-slider');
        const lineSlider = controlPanel.querySelector('#line-slider');
        const sizeValue = controlPanel.querySelector('#size-value');
        const lineValue = controlPanel.querySelector('#line-value');
        
        if (sizeSlider) sizeSlider.value = settings.textSize;
        if (lineSlider) lineSlider.value = settings.lineHeight;
        if (sizeValue) sizeValue.textContent = settings.textSize + 'px';
        if (lineValue) lineValue.textContent = settings.lineHeight;
    }

    function updateToggleAppearance(toggle, isEnabled) {
        const slider = toggle.nextElementSibling;
        const knob = slider.querySelector('span');
        
        if (isEnabled) {
            slider.style.backgroundColor = '#2196F3';
            knob.style.transform = 'translateX(20px)';
        } else {
            slider.style.backgroundColor = '#ccc';
            knob.style.transform = 'translateX(0px)';
        }
    }

    function setupEventListeners() {
        if (!controlPanel) return;

        // Panel toggle
        const toggleBtn = controlPanel.querySelector('#toggle-panel');
        const panelContent = controlPanel.querySelector('#panel-content');
        if (toggleBtn && panelContent) {
            toggleBtn.addEventListener('click', () => {
                const isVisible = panelContent.style.display !== 'none';
                panelContent.style.display = isVisible ? 'none' : 'block';
                toggleBtn.textContent = isVisible ? '+' : '−';
                settings.panelVisible = !isVisible;
                saveSettings();
            });
            
            if (!settings.panelVisible) {
                panelContent.style.display = 'none';
                toggleBtn.textContent = '+';
            }
        }

        // Toggle switches
        const bgToggle = controlPanel.querySelector('#bg-toggle');
        const textToggle = controlPanel.querySelector('#text-toggle');
        const sizeToggle = controlPanel.querySelector('#size-toggle');
        const lineToggle = controlPanel.querySelector('#line-toggle');

        if (bgToggle) {
            bgToggle.addEventListener('change', () => {
                settings.backgroundEnabled = bgToggle.checked;
                updateToggleAppearance(bgToggle, settings.backgroundEnabled);
                saveSettings();
                applyStyles();
            });
        }

        if (textToggle) {
            textToggle.addEventListener('change', () => {
                settings.textColorEnabled = textToggle.checked;
                updateToggleAppearance(textToggle, settings.textColorEnabled);
                saveSettings();
                applyStyles();
            });
        }

        if (sizeToggle) {
            sizeToggle.addEventListener('change', () => {
                settings.textSizeEnabled = sizeToggle.checked;
                updateToggleAppearance(sizeToggle, settings.textSizeEnabled);
                saveSettings();
                applyStyles();
            });
        }

        if (lineToggle) {
            lineToggle.addEventListener('change', () => {
                settings.lineHeightEnabled = lineToggle.checked;
                updateToggleAppearance(lineToggle, settings.lineHeightEnabled);
                saveSettings();
                applyStyles();
            });
        }

        // Color inputs
        const bgColor = controlPanel.querySelector('#bg-color');
        const textColor = controlPanel.querySelector('#text-color');

        if (bgColor) {
            bgColor.addEventListener('input', () => {
                settings.backgroundColor = bgColor.value;
                saveSettings();
                applyStyles();
            });
        }

        if (textColor) {
            textColor.addEventListener('input', () => {
                settings.textColor = textColor.value;
                saveSettings();
                applyStyles();
            });
        }

        // Cycle buttons
        const bgCycle = controlPanel.querySelector('#bg-cycle');
        const textCycle = controlPanel.querySelector('#text-cycle');

        if (bgCycle) {
            bgCycle.addEventListener('click', () => {
                cycleBackgroundColor();
                updateToggleStates();
            });
        }

        if (textCycle) {
            textCycle.addEventListener('click', () => {
                cycleTextColor();
                updateToggleStates();
            });
        }

        // Sliders
        const sizeSlider = controlPanel.querySelector('#size-slider');
        const lineSlider = controlPanel.querySelector('#line-slider');
        const sizeValue = controlPanel.querySelector('#size-value');
        const lineValue = controlPanel.querySelector('#line-value');

        if (sizeSlider && sizeValue) {
            sizeSlider.addEventListener('input', () => {
                settings.textSize = parseInt(sizeSlider.value);
                sizeValue.textContent = settings.textSize + 'px';
                saveSettings();
                applyStyles();
            });
        }

        if (lineSlider && lineValue) {
            lineSlider.addEventListener('input', () => {
                settings.lineHeight = parseFloat(lineSlider.value);
                lineValue.textContent = settings.lineHeight;
                saveSettings();
                applyStyles();
            });
        }

        // Reset button
        const resetBtn = controlPanel.querySelector('#reset-all');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                settings = { ...DEFAULT_SETTINGS };
                saveSettings();
                applyStyles();
                updateToggleStates();
            });
        }
    }

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
        updateToggleStates();
        showStatus();
    }

    function toggleTextColor() {
        settings.textColorEnabled = !settings.textColorEnabled;
        saveSettings();
        applyStyles();
        updateToggleStates();
        showStatus();
    }

    function toggleTextSize() {
        settings.textSizeEnabled = !settings.textSizeEnabled;
        saveSettings();
        applyStyles();
        updateToggleStates();
        showStatus();
    }

    function toggleLineHeight() {
        settings.lineHeightEnabled = !settings.lineHeightEnabled;
        saveSettings();
        applyStyles();
        updateToggleStates();
        showStatus();
    }

    // Slider functions
    function adjustTextSize(delta) {
        settings.textSize = Math.max(8, Math.min(48, settings.textSize + delta));
        saveSettings();
        applyStyles();
        updateToggleStates();
        showStatus();
    }

    function adjustLineHeight(delta) {
        settings.lineHeight = Math.max(1.0, Math.min(3.0, parseFloat((settings.lineHeight + delta).toFixed(1))));
        saveSettings();
        applyStyles();
        updateToggleStates();
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
        updateToggleStates();
        showStatus();
    });

    // Initialize
    function init() {
        createControlPanel();
        applyStyles();
        showStatus();
        console.log('Readability Enhancer loaded with visible controls in top-right corner.');
    }

    // Wait for page to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(); 