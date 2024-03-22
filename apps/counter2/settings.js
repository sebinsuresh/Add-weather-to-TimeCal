(function (back) {
    var FILE = "counter2.json";
    defaults={
        counter0:12,
        counter1:0,
        max0:12,
        max1:0,
        buzz: true,
        colortext: true,
    };
    settings = Object.assign(defaults, require('Storage').readJSON(FILE, true) || {});

    function writeSettings() {
        require('Storage').writeJSON(FILE, settings);
    }

    menu = {
        "": { "title": "Counter2" },
        "< Back": () => back(),
        'Default C1': {
            value: settings[0],
            min: -99, max: 99,
            onchange: v => {
                settings.max0 = v;
                writeSettings();
            }
        },
        'Default C2': {
            value: settings[2],
            min: -99, max: 99,
            onchange: v => {
                settings.max1 = v;
                writeSettings();
            }
        },
        'Color Text': {
            value: settings[colortext],
            format: v => v?"Text":"Background",            
            onchange: v => {
                settings.colortext = v;
                writeSettings();
            }
        },
        'Vibrate': {
            value: settings.buzz,
            onchange: v => {
                settings.buzz = v;
                writeSettings();
            }
        }
    };
    // Show the menu
    E.showMenu(menu);
});
