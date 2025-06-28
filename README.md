# Westlaw Enhancement Scripts

Chrome userscripts to enhance the Westlaw experience with improved typography, layout controls, and productivity features.

## Combined Script

The main script `westlaw-combined.js` combines all individual enhancement modules into a single userscript for easy installation and management.

### Features

#### 🔤 Font Size Adjustment
- **Alt + Plus/Equal**: Increase font size
- **Alt + Minus**: Decrease font size
- **Alt + 0**: Reset to default font size (18px)
- Targets main content areas while preserving relative sizing for headings and UI elements
- Settings saved per domain

#### 📏 Margin Control
- **Shift + Left Arrow**: Increase left margin
- **Shift + Right Arrow**: Decrease left margin
- **Shift + Up Arrow**: Increase right margin
- **Shift + Down Arrow**: Decrease right margin
- **Shift + Plus/Equal**: Increase both margins
- **Shift + Minus**: Decrease both margins
- **Shift + S**: Make margins symmetrical
- **Shift + R**: Reset to default margins (50px each)
- Settings saved per domain

#### 👁️ Sidebar Toggle
- **F2**: Toggle sidebar visibility to maximize content width
- Completely hides right column and expands main content area
- Settings saved per domain

#### ⌨️ Navigation Shortcuts
- **N** or **Right Arrow**: Next search term
- **Left Arrow**: Previous search term
- **Up Arrow**: Jump to top of page
- **Enter**: Copy with reference and switch to notes

#### 📝 Integrated Notes System
- Automatically opens persistent notepad when copying content
- Smart text formatting with blockquotes for legal citations
- Auto-save functionality with word/character counts
- Export notes as text files
- Notes persist across browser sessions

### Installation

1. Install a userscript manager like [Violentmonkey](https://violentmonkey.github.io/) or [Tampermonkey](https://www.tampermonkey.net/)
2. Copy the contents of `westlaw-combined.js`
3. Create a new userscript in your manager and paste the code
4. Save and enable the script
5. Navigate to any Westlaw page to start using the enhancements

### Menu Commands

Access additional controls through your userscript manager's menu:
- Font size adjustments
- Margin controls
- Sidebar toggle
- Current settings display

## Individual Scripts

The repository also contains the original individual scripts that were combined:

- `Westlaw-content-font-size.js` - Font size adjustment only
- `westlaw-margin-adjuster.js` - Margin control only
- `westlaw-navigation-shortcuts.js` - Navigation and notes only
- `westlaw-sidebar-content-toggle.js` - Sidebar toggle only
- `minimum-font-size-adjuster.js` - General minimum font size adjuster

## Compatibility

- Works with all Westlaw domains (`*.westlaw.com`)
- Tested with Violentmonkey and Tampermonkey
- Compatible with modern browsers (Chrome, Firefox, Edge, Safari)
- Settings are domain-specific and persist across sessions

## Keyboard Shortcuts Reference

| Function | Shortcut | Description |
|----------|----------|-------------|
| Font Size | Alt + Plus/Minus | Increase/decrease font size |
| Font Reset | Alt + 0 | Reset to default (18px) |
| Left Margin | Shift + Left/Right | Increase/decrease left margin |
| Right Margin | Shift + Up/Down | Increase/decrease right margin |
| Both Margins | Shift + Plus/Minus | Adjust both margins together |
| Symmetrical | Shift + S | Make margins equal |
| Reset Margins | Shift + R | Reset to defaults (50px) |
| Sidebar | F2 | Toggle sidebar visibility |
| Next Term | N or Right Arrow | Navigate to next search term |
| Previous Term | Left Arrow | Navigate to previous search term |
| Top of Page | Up Arrow | Jump to top |
| Copy & Notes | Enter | Copy with reference, open notes |

## License

MIT License - Feel free to modify and distribute. 