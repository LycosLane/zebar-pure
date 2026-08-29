# Zebar Pure

The ultimate minimalist, distraction-free **Windows RICE status bar** for Zebar and GlazeWM. Built with React and TypeScript using native Zebar APIs.

## Preview

![Zebar Pure Preview 1](./resources/preview-image-1.png)
![Zebar Pure Preview 2](./resources/preview-image-2.png)
![Zebar Pure Preview 3](./resources/preview-image-3.png)
![Zebar Pure Preview 4](./resources/preview-image-4.png)

## Highlights & Features

- **The Ultimate Windows RICE Status Bar**: Engineered for clean, aesthetic desktop setups with pixel-perfect typography, standard 24px flex alignment, and frameless flat glyphs.
- **Theme Accent & Complementary Dark Background Colors**:
  - Soft pastel accent presets (*Lavender*, *Sky*, *Mint*, *Rose*, *Amber*) + custom HEX color picker.
  - 5 matching dark complementary background presets (*Dark Slate*, *Midnight Navy*, *Dark Aubergine*, *Dark Forest*, *Dark Sapphire*) + custom HEX color picker.
- **Dynamic Transparency & Opacity Slider**: Smooth bar opacity control (0% fully transparent to 100% solid) with an instant **`[ Reset ]`** button back to 100% transparent.
- **Seamless 3-Section Layout Reordering**: Easily move modules across **Left**, **Center**, and **Right** bar positions using intuitive `[◀]` / `[▶]` buttons with automatic section boundary crossing.
- **Resource-Saving Module Visibility**: Toggle any module on or off in Global Settings. Disabled modules completely skip background polling, network calls, and timers (0% CPU/network waste).
- **Consolidated Media Applet**: Reorder media controls (`⏮`, `⏯`, `⏭`, `🔉`, `🔊`) and text sub-components (`Title`, `Artist`, `Album`) with `[◀]` / `[▶]`. Features dynamic free-space scaling with one-click `Max Free` mode for zero collision on any display resolution (720p to 8K).
- **Real-Time Dynamic Popover Sizing**: Automatically calculates actual DOM height (`getBoundingClientRect`) to size the Tauri window dynamically with zero cut-offs or scrollbars.
- **Adaptive Popover Alignment**: Popovers automatically align left (`left: 0`), center (`left: 50%`), or right (`right: 0`) depending on section placement to prevent off-screen clipping.
- **Global Hover Information Popups Toggle**: Simple `[x] Hover Information Popups` switch in Global Settings to completely silence hover popups for ultra-clean, distraction-free setups.
- **Custom Date & Time Settings**: Short and Long date format toggling via Left-Click. Customize Luxon tokens, locale/language presets (`en-US`, `de`, `fr`, `es`), and insert tokens at cursor position.
- **Network Layout Modes & Live Traffic**: Right-click Network to toggle between Fixed Width and Dynamic Width. Live download and upload speeds are mirrored 1:1 in the hover popover.
- **Battery Status & Offline Resilience**: Granular 10-step battery icons, low-power alerts (Orange <15%, Red <5%), and offline weather fallbacks (`-°C` without false sunny icons).

## Quick Controls & Shortcuts

| Applet | Left Click | Right Click | Hover Action |
| :--- | :--- | :--- | :--- |
| **Workspaces** | Switch workspace | Open Zebar Pure Global Settings | Workspaces Info Popover |
| **Date & Time** | Toggle Short / Long Date Format | Open Date & Time Settings | Date & Time Info Popover |
| **Media Title / Text** | Focus playing application | Open Media Controls & Settings | Media Session Info Popover |
| **Network** | Open Windows Network Settings | Toggle Fixed / Dynamic Width | Live In/Out Traffic Details |
| **CPU / Memory** | Open Task Manager | Swap CPU / RAM display order | CPU & RAM Usage Details |
| **Battery** | Open Windows Power Settings | Toggle percentage text display | Battery Level & Charging State |
| **Weather** | Open weather website | Open Weather & City Settings | Weather Status & Location |
| **Tiling Mode** | Toggle Horizontal / Vertical layout | — | Layout Mode Info Popover |

## Installation & Customization

1. Install via the Zebar Marketplace or copy the package into your Zebar directory:
   `%APPDATA%\zebar\downloads\lycoslane.zebar-pure@1.1.0`
2. Open **Zebar Pure Global Settings** by **Right-Clicking the Workspaces applet**.
3. Customize your colors, background opacity, module arrangement, and preferences.

## License

Open source under the Apache-2.0 License.
