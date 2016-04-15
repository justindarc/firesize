let { Cc, Ci } = require('chrome');

let simplePrefs = require('sdk/simple-prefs');
let self = require('sdk/self');

let ToggleButton = require('sdk/ui/button/toggle').ToggleButton;
let Panel = require('sdk/panel').Panel;

let ww = Cc["@mozilla.org/embedcomp/window-watcher;1"].getService(Ci.nsIWindowWatcher);

const PANEL_WIDTH = 160;
const PANEL_PADDING = 20;

let button = ToggleButton({
  id: 'firesize-button',
  label: 'Firesize',
  icon: {
    '16': './icon-16.png',
    '32': './icon-32.png',
    '64': './icon-64.png',
    '128': './icon-128.png'
  },
  onChange: function(state) {
    if (!state.checked) {
      return;
    }

    let window = ww.activeWindow;
    let windowSize = window.outerWidth + 'x' + window.outerHeight;
    panel.port.emit('willShow', windowSize);
    panel.show({ position: button });
  }
});

let panel = Panel({
  contentURL: self.data.url('./panel.html'),
  contentScriptFile: self.data.url('./panel.js'),
  contentScriptOptions: {
    sizesPref: simplePrefs.prefs['sizes']
  },
  onHide: function() {
    button.state('window', { checked: false });
  }
});

let init = function() {
  panel.port.on('click', function(size) {
    let window = ww.activeWindow;
    window.resizeTo(size.width, size.height);
    panel.hide();
  });

  panel.port.on('render', function(height) {
    panel.resize(PANEL_WIDTH, height + PANEL_PADDING);
  });

  simplePrefs.on('sizes', function(prefName) {
    panel.port.emit('sizesPref', simplePrefs.prefs['sizes']);
  });
};

init();
