# Visual Timer Chrome/Firefox Extension

<p align="center">
  <img src="icon128.png" alt="Visual Timer Icon" width="128" height="128">
</p>

A Chrome extension that provides a visual time-tracking overlay that changes color over time, helping you stay aware of time passing while working on tasks.

## Features

- Visual color-changing overlay that transitions through different colors (Blue → Green → Purple → Red)
- Adjustable overlay opacity (1-100%)
- Customizable time settings (up to 24 hours)
- Show/hide time display
- Pause and reset functionality
- Works on all websites
- Special compatibility with YouTube
- Settings sync across Chrome instances
- Automatic pause during system idle

## Version History

### v1.3 (Current)
- Added adjustable opacity control
- Added opacity sync across Chrome instances
- Added tooltip for opacity percentage
- Improved settings persistence

### v1.0
- Initial release
- Basic timer functionality
- Color transitions
- YouTube compatibility

## Installation

### Chrome
1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" in the top left
5. Select the folder containing the extension files

### Firefox
1. Clone this repository or download the source code
2. Rename `manifest-ff.json` to `manifest.json` (make sure to backup the original Chrome manifest if needed)
3. Open Firefox and navigate to `about:debugging`
4. Click on "This Firefox" in the left sidebar
5. Click "Load Temporary Add-on"
6. Navigate to your extension folder and select the `manifest.json` file

Note: Firefox extensions loaded this way are temporary and will be removed when Firefox is closed. For permanent installation, the extension needs to be signed by Mozilla.

## Usage

### Basic Setup

1. Click the Visual Timer icon in your Chrome toolbar to open the settings popup
2. The extension is enabled by default with a 2-hour timer
3. The overlay will start blue and gradually transition through green and purple to red when the set time is reached

### Settings

#### Timer Controls
- **Enable Visual Timer**: Toggle the overlay on/off for all websites
- **Show Time Display**: Toggle the visibility of the time counter
- **Time Until Red**: Set the total duration before the overlay turns red
  - Hours: 0-24
  - Minutes: 0-59
- **Overlay Opacity**: Adjust the transparency of the color overlay (1-100%)

#### Control Buttons
- **Reset Timer**: Restart the timer from 0 and reset the color to blue
- **Pause/Resume**: Temporarily stop/start the timer

### Color Stages

The overlay transitions through four distinct colors:
1. Blue (Start)
2. Green (33% of set time)
3. Purple (66% of set time)
4. Red (100% of set time)

### YouTube Compatibility

When using YouTube, the extension automatically adjusts its overlay to:
- Keep video controls accessible
- Maintain video player visibility
- Use a screen blend mode for better color visibility

## Tips

- Use the time display toggle to reduce distractions while keeping the color indicator
- Reset the timer when starting a new task
- Pause the timer during breaks
- The extension automatically pauses when your system is idle
- The settings are synchronized across your Chrome profile
- The overlay works independently on each tab
- Use the opacity slider to find the perfect balance between visibility and non-intrusiveness
- Your opacity settings will sync across all your Chrome instances

## Technical Details

- Built with vanilla JavaScript
- Uses Chrome Extension Manifest V3
- Utilizes Chrome's storage, alarms, idle, and tabs APIs
- Lightweight with minimal performance impact

## Permissions

The extension requires the following permissions:
- `storage`: Save your settings and timer state
- `alarms`: Update the timer every second
- `idle`: Detect system idle state
- `tabs`: Apply the overlay to web pages

## Troubleshooting

### Common Issues

1. **Timer Not Appearing or Extension not working**
   - Try toggling the "Enable Visual Timer" switch off and on again
   - Refresh the webpage you're trying to use the timer on
   - Make sure you've granted all necessary permissions

2. **Time Display Not Showing**
   - Toggle the "Show Time Display" switch off and then on
   - Check if "Enable Visual Timer" is turned on, as the time display requires the timer to be enabled

3. **Settings Not Syncing**
   - Make sure you're signed into your browser
   - Try closing and reopening your browser
   - Check if you have sync enabled in your browser settings

If these steps don't resolve your issue, please don't hesitate to:
1. [Create a new issue](https://github.com/yourusername/visual-timer/issues/new) with details about:
   - Your browser and version
   - Steps to reproduce the problem
   - What you expected to happen
   - What actually happened
2. Include any error messages from the browser's developer console (F12)

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.