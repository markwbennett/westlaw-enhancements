# Westlaw Combined Enhancements

A comprehensive userscript that enhances the Westlaw reading experience with customizable typography, layout controls, and navigation shortcuts.

## Features

### Typography Controls
- **Font Size**: Adjust document font size (10-36px)
- **Line Height**: Fine-tune line spacing (1.0-3.0, 0.1 increments)
- Maintains proper scaling for headings and footnotes

### Layout Controls
- **Margins**: Symmetrical left/right margin adjustment
- **Sidebar Toggle**: Hide/show the right sidebar for distraction-free reading
- **Focus Mode**: Hide header and footer elements while keeping navigation functional

### Navigation Shortcuts
- **N** or **Right Arrow**: Next search term
- **Left Arrow**: Previous search term  
- **Up Arrow**: Scroll to top of document
- **Enter**: Copy document with reference and switch to notes

### Persistent Settings
- All settings are saved per domain
- Automatically restored when returning to Westlaw

## Installation

1. Install [Violentmonkey](https://violentmonkey.github.io/) or [Tampermonkey](https://www.tampermonkey.net/)
2. Click [here to install the script](http://localhost:8000/westlaw-chrome-script.js) (requires local server)
3. Or copy the script content and create a new userscript manually

## Usage

### Menu Controls
All controls are accessible through the userscript menu (click the Violentmonkey icon):

- **Font Size**: Increase/Decrease/Reset
- **Line Height**: Increase/Decrease/Reset  
- **Margins**: Increase/Decrease/Reset
- **Sidebar**: Show/Hide toggle
- **Focus Mode**: Toggle header/footer visibility
- **Navigation**: Next/Previous/Top/Copy commands
- **Status**: View current settings

### Keyboard Shortcuts
Navigation shortcuts work when not typing in input fields:

| Key | Action |
|-----|--------|
| `N` or `→` | Next search term |
| `←` | Previous search term |
| `↑` | Scroll to top |
| `Enter` | Copy & switch to notes |

## Notes Integration

The script includes smart notes file switching:
- Automatically switches to existing notes file after copying
- Creates persistent notepad if no notes file exists
- Handles multiple Westlaw tabs intelligently

## Compatibility

- **Browsers**: Chrome, Firefox, Safari, Edge
- **Userscript Managers**: Violentmonkey, Tampermonkey
- **Westlaw**: All document types and interfaces

## Version

Current version: **1.2**

## Support

This script enhances the Westlaw experience without modifying the underlying functionality. All changes are cosmetic and reversible. 