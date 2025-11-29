const json5 = require('json5')
const plist = require('plist')
const fs = require('fs')
const path = require('path')

function convert(vscTheme, inputFilePath) {
    // Extract theme name from vscTheme.name, or fall back to filename without extension
    let themeName = vscTheme.name;
    if (!themeName && inputFilePath) {
        themeName = path.basename(inputFilePath, path.extname(inputFilePath));
    }
    if (!themeName) {
        themeName = 'Untitled Theme';
    }

    const tmTheme = {
        name: themeName,
        settings: vscTheme.tokenColors || []
    }

    const defaultSettings = tmTheme.settings.find(setting => !setting.scope);

    if (!defaultSettings) {
        tmTheme.settings.unshift({ settings: {}});
    }

    const tmThemeDefaultSettings = tmTheme.settings[0].settings;
    const vscThemeColors = vscTheme.colors;

    const mapper = new SettingsMapper({tmThemeDefaultSettings, vscThemeColors});
    mapper.addSetting("editorCursor.foreground", "caret");
    mapper.addSetting("editor.selectionBackground", "selection");
    mapper.addSetting("editor.lineHighlightBackground", "lineHighlight");
    mapper.addSetting("editor.foreground", "foreground");
    mapper.addSetting("editor.background", "background");
    mapper.addSetting("editorWhitespace.foreground", "invisibles");
    for (i = 1; i < tmTheme.settings.length; i++) {
       const scope = tmTheme.settings[i].scope
       if (scope) {
           tmTheme.settings[i].scope = scope.toString()
       }
    }
    return tmTheme
}

class SettingsMapper {
    constructor({ tmThemeDefaultSettings, vscThemeColors }) {
        this.tmThemeDefaultSettings = tmThemeDefaultSettings;
        this.vscThemeColors = vscThemeColors;
    }

    addSetting(fromKey, toKey) {
        if (fromKey in this.vscThemeColors) {
            this.tmThemeDefaultSettings[toKey] = this.vscThemeColors[fromKey]
        }
    }
}

const inputFile = process.argv[2]
const outputFile = process.argv[3]
const vscTheme = json5.parse(fs.readFileSync(inputFile, "utf8"))
fs.writeFileSync(outputFile, plist.build(convert(vscTheme, inputFile)))