# Visual Timer Chrome Extension

A Chrome extension that provides a visual time-tracking overlay that changes color over time, helping you stay aware of time passing while working on tasks.

## Features

- Visual color-changing overlay that transitions through different colors (Blue → Green → Purple → Red)
- Customizable time settings (up to 24 hours)
- Show/hide time display
- Pause and reset functionality
- Works on all websites
- Special compatibility with YouTube
- Low opacity overlay that doesn't interfere with content
- Automatic pause during system idle

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" in the top left
5. Select the folder containing the extension files

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

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.