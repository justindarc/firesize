var windowUtils = require('sdk/window/utils');
var simplePrefs = require('sdk/simple-prefs');
var self = require('sdk/self');

var ToggleButton = require('sdk/ui/button/toggle').ToggleButton;
var Panel = require('sdk/panel').Panel;

const PANEL_WIDTH = 160;
const PANEL_PADDING = 20;

var button = ToggleButton({
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

    var window = windowUtils.getFocusedWindow();
    var windowSize = window.outerWidth + 'x' + window.outerHeight;
    panel.port.emit('willShow', windowSize);
    panel.show({ position: button });
  }
});

var panel = Panel({
  contentURL: self.data.url('./panel.html'),
  contentScriptFile: self.data.url('./panel.js'),
  contentScriptOptions: {
    sizesPref: simplePrefs.prefs['sizes']
  },
  onHide: function() {
    button.state('window', { checked: false });
  }
});

var init = function() {
  panel.port.on('click', function(size) {
    var window = windowUtils.getFocusedWindow();
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
