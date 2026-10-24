# Zebar Pure

A minimalist, fully customizable status bar for Zebar and GlazeWM on Windows.

---

## Desktop Overviews

![Zebar Pure Desktop Preview 1](https://raw.githubusercontent.com/LycosLane/zebar-pure/main/resources/preview-image-1.png)

![Zebar Pure Desktop Preview 2](https://raw.githubusercontent.com/LycosLane/zebar-pure/main/resources/preview-image-2.png)

![Zebar Pure Desktop Preview 3](https://raw.githubusercontent.com/LycosLane/zebar-pure/main/resources/preview-image-3.png)

---

## Features & Configuration

### Global Theme & Layout Settings

![Global Settings](https://raw.githubusercontent.com/LycosLane/zebar-pure/main/resources/preview-image-6.png)

- **Colors & Transparency:** Select preset colors or enter custom HEX codes. Adjust background opacity for desired transparency.
- **3-Section Layout:** Move modules across Left, Center, and Right sections using the `◀` and `▶` buttons.
- **GlazeWM Workspaces:** Mirror active workspace names, numbers, or icons configured in your GlazeWM `config.yaml`.
- **Resource Optimization:** Toggle individual modules on or off. Disabled modules skip background polling and network calls.
- **Hover Popups Toggle:** Turn off hover popups using the settings checkbox.

---

### Date & Time

![Date & Time Settings](https://raw.githubusercontent.com/LycosLane/zebar-pure/main/resources/preview-image-7.png)

- **Quick Switch:** Left-click the date to toggle between Short and Long formats.
- **Custom Formats:** Right-click to configure Luxon tokens, pick locale presets (`en-US`, `de`, `fr`, `es`), or type custom text.

---

### Media Controller

![Media Controls](https://raw.githubusercontent.com/LycosLane/zebar-pure/main/resources/preview-image-8.png)

- **Interactive Playback:** Right-click for full playback controls (Play, Pause, Skip, Volume).
- **Module Visibility:** Show, hide, or rearrange playback buttons and metadata using `◀` and `▶`.
- **Dynamic Text Scaling:** Set a maximum text width or enable `Max Free` to fill available bar space.

---

### Weather & Location

![Weather Settings](https://raw.githubusercontent.com/LycosLane/zebar-pure/main/resources/preview-image-4.png)

- **Web Link:** Left-click to open your weather website.
- **City Search & Coordinates:** Right-click to search cities with Open-Meteo, enter coordinates, or select temperature units.

---

### Live System Metrics

![Live Hover Popovers](https://raw.githubusercontent.com/LycosLane/zebar-pure/main/resources/preview-image-5.png)

- **Real-Time Data:** Popovers mirror live values for download/upload speeds, CPU usage, RAM usage, and battery charge.

---

## Quick Controls

| Applet | Left Click | Right Click | Hover Action |
| :--- | :--- | :--- | :--- |
| **Workspaces** | Switch workspace *(mirrored from GlazeWM)* | Open Global Settings | Workspaces Info |
| **Date & Time** | Toggle Short / Long Format | Open Date & Time Settings | Date & Time Info |
| **Media Title** | Focus playing application | Open Media Settings | Media Session Info |
| **Network** | Open Windows Network Settings | Toggle Fixed / Dynamic Width | Live In / Out Traffic |
| **CPU / Memory** | Open Task Manager | Swap CPU / RAM display order | Live CPU & RAM Usage |
| **Battery** | Open Windows Power Settings | Toggle percentage text | Battery Level & State |
| **Weather** | Open weather website *(customizable)* | Open Weather Settings | Weather Status & Location |
| **Tiling Mode** | Toggle Horizontal / Vertical layout | - | Layout Mode Info |

---

## How to Install & Use

1. **Install Zebar:** Download and install Zebar from [github.com/glzr-io/zebar](https://github.com/glzr-io/zebar/releases) or run `winget install glzr-io.zebar`. You can also install it with GlazeWM.
2. **Install Zebar Pure:**
   - Right-click the Zebar icon in your Windows taskbar tray.
   - Select **Marketplace**, search for **Zebar Pure**, and click **Install**.
   - *(Manual option: clone this repo into `%APPDATA%\zebar\downloads\lycoslane.zebar-pure@1.1.2`)*.
3. **Activate & Customize:**
   - Right-click the Zebar tray icon and select **Reload Widgets**.
   - Select <kbd>Widget Packs</kbd> -> <kbd>lycoslane.zebar-pure</kbd> -> <kbd>minimal</kbd> -> <kbd>Run 'default'</kbd>.
   - Disable any other active packs marked with `(1)`.
   - Right-click the **Workspaces** icon on the left to open Global Settings.

---

## Credits

- Created by LycosLane.
- Inspired by concepts from `srcthird.frigid-zebar` by Stephen Chryn.

---

## License

Apache-2.0 License © 2026 LycosLane
