# Zebar Pure

A minimalist, fully customizable status bar for Zebar and GlazeWM on Windows.

---

## Desktop Overviews

![Zebar Pure Desktop Preview 1](./resources/preview-image-1.png)

![Zebar Pure Desktop Preview 2](./resources/preview-image-2.png)

![Zebar Pure Desktop Preview 3](./resources/preview-image-3.png)

---

## Features & Configuration

### Global Theme & Layout Settings

![Global Settings](./resources/preview-image-6.png)

- **Colors & Transparency**: Choose preset accent colors and background colors, or use custom HEX inputs. Adjust background opacity to achieve the desired bar transparency.
- **3-Section Layout Reordering**: Seamlessly move modules across Left, Center, and Right sections using `◀` and `▶` buttons.
- **GlazeWM Workspaces**: Displays active workspaces, automatically mirroring workspace names, numbers, or custom icons configured in your GlazeWM `config.yaml`.
- **Resource Optimization**: Toggle individual modules on or off. Disabled modules completely skip background polling and network requests.
- **Hover Popups Toggle**: Silence hover information popups with the `Hover Information Popups` checkbox for a distraction-free bar.

---

### Date & Time

![Date & Time Settings](./resources/preview-image-7.png)

- **Quick Switch**: Left-click the date to toggle between Short and Long display modes.
- **Custom Formats**: Right-click to configure Luxon date and time tokens, select language/locale presets (`en-US`, `de`, `fr`, `es`), and insert token chips directly at the cursor position (entering free text is possible).

---

### Media Controller

![Media Controls](./resources/preview-image-8.png)

- **Interactive Playback**: Right-click to access full playback controls (Play/Pause, Skip, Volume), which remain fully functional even if hidden from the top bar.
- **Modular Visibility & Reordering**: Independently show, hide, or rearrange playback buttons and metadata fields (Title, Artist, Album) using `◀` and `▶`.
- **Dynamic Text Scaling**: Set a custom maximum text width or enable `Max Free` mode to dynamically fill available bar space without collisions.

---

### Weather & Location

![Weather Settings](./resources/preview-image-4.png)

- **Web Link**: Left-click to open your configured weather website. E.g. for your own city or work location.
- **City Search & Coordinates**: Right-click to verify city names via Open-Meteo geocoding, enter custom latitude/longitude coordinates, or switch temperature units (°C, °F, Auto).

---

### Live System Metrics

![Live Hover Popovers](./resources/preview-image-5.png)

- **Real-Time Data**: Popovers mirror live values 1:1 with the status bar, including download/upload speeds, CPU usage, RAM usage, and battery charge with power plug status.

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
| **Tiling Mode** | Toggle Horizontal / Vertical layout | — | Layout Mode Info |

---

## How to Install & Use

1. **Install Zebar**: Download and install Zebar from [github.com/glzr-io/zebar](https://github.com/glzr-io/zebar/releases) (or run `winget install glzr-io.zebar` in PowerShell). 
   Zebar can also be installed automatically with [GlazeWM](https://github.com/glzr-io/glazewm) for tiling window management.
2. **Install Zebar Pure**:
   - Right-click the Zebar icon in your Windows taskbar tray.
   - Select **Marketplace**, search for **Zebar Pure**, and click **Install**.
   - *(Alternative manual install: Clone this repo into `%APPDATA%\zebar\downloads\lycoslane.zebar-pure@1.1.0`)*.
3. **Activate & Customize**:
   - Right-click the Zebar tray icon and select **Reload Widgets**.
   - Select <kbd>Widget Packs</kbd> → <kbd>lycoslane.zebar-pure</kbd> → <kbd>minimal</kbd> → <kbd>Run 'default'</kbd>
   - If other widget packs are running simultaneously, right-click the Zebar tray icon, locate any active packs marked with `(1)`, and click them to disable.
   - Right-click the **Workspaces** icon on the left side of the bar to open Global Settings and customize your colors, opacity, and layout.

---

## Credits & License

- Created by **LycosLane**.
- Originally inspired by concepts from `srcthird.frigid-zebar` by Stephen Chryn, re-engineered into Zebar Pure.
- Released under the [Apache-2.0 License](./minimal/LICENSE).
