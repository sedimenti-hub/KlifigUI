# Klipper Configurator - Localization & Translation Guide

This directory contains the localization files for **Klipper Configurator** (Mainsail WebUI extension).

## File Structure

- **`en.json`**: The **English Master Matrix**. This is the reference template containing every UI key, label, button, modal text, toast notification, and parameter tooltip.
- **`it.json`**: Italian translation.
- **`de.json`**: German translation.
- **`fr.json`**: French translation.
- **`es.json`**: Spanish translation.

Each file has the following schema:
```json
{
  "_meta": {
    "code": "en",
    "name": "English",
    "flag": "🇬🇧",
    "description": "Language description"
  },
  "ui": {
    "nav.settings": "Settings",
    "tab.kinematics": "Kinematics & Printer",
    "card.general_params": "General Klipper Parameters",
    "btn.save_connect": "Save & Connect",
    "modal.settings_title": "Settings & Mainsail Theme",
    "toast.saved_success": "File {file} saved successfully! (Backup created)"
  },
  "labels": {
    "printer-kinematics": "Main Kinematics Type:",
    "stepper-step-pin": "Step Pin:"
  },
  "tooltips": {
    "printer-kinematics": {
      "param": "kinematics",
      "title": "Main Kinematics Type",
      "desc": "Defines the mechanical structure of the printer...",
      "tip": "Ender 3/Prusa: cartesian | Voron 2.4/Trident/Bambu: corexy | Delta: delta"
    }
  }
}
```

## How to Customize or Add a New Language

1. Copy `en.json` to `<your-lang-code>.json` (e.g. `pt.json` for Portuguese, `pl.json` for Polish, `ja.json` for Japanese).
2. Translate the values under `ui`, `labels`, and `tooltips`.
3. Save the file into both `locales/` and `dist/locales/`.
4. Register the language code and flag in `SUPPORTED_LANGUAGES` in `dist/js/i18n.js`.
5. The application will automatically fetch and apply the translations in real time or when synchronized with Mainsail!
