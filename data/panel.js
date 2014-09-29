var list = document.getElementById('size-list');
var currentWindowSize;

var clearList = function() {
  list.innerHTML = '';
};

var appendToList = function(size) {
  var item = document.createElement('li');
  var link = document.createElement('a');
  link.dataset.width = size.width;
  link.dataset.height = size.height;
  link.textContent = size.width + 'x' + size.height;
  item.appendChild(link);
  list.appendChild(item);
};

var renderList = function(sizes) {
  clearList();

  sizes.forEach(function(size) {
    appendToList(size);
  });

  updateCurrentWindowSize();

  self.port.emit('render', document.body.offsetHeight);
};

var parseSizesPref = function(sizesPref) {
  var sizeStrings = sizesPref.replace(/\s/g, '').split(',');
  var sizes = sizeStrings.map(function(size) {
    var parts = size.split('x');
    var width = parseInt(parts[0] || '0', 10);
    var height = parseInt(parts[1] || '0', 10);

    if (!width || !height) {
      return null;
    }

    return {
      width: width,
      height: height
    };
  });

  return sizes.filter(function(size) {
    return !!size;
  });
};

var updateCurrentWindowSize = function(windowSize) {
  currentWindowSize = windowSize || currentWindowSize;

  var active = list.querySelector('li.active');
  if (active) {
    active.className = '';
  }

  var links = list.querySelectorAll('a');
  for (var i = links.length - 1, link; i >= 0; i--) {
    if ((link = links[i]).textContent === currentWindowSize) {
      link.parentNode.className = 'active';
      return;
    }
  }
};

var updateSizesPref = function(sizesPref) {
  var sizes = parseSizesPref(sizesPref);
  renderList(sizes);
};

var init = function() {
  list.addEventListener('click', function(evt) {
    self.port.emit('click', evt.target.dataset);
    evt.preventDefault();
  });

  self.port.on('willShow', updateCurrentWindowSize);
  self.port.on('sizesPref', updateSizesPref);

  updateSizesPref(self.options.sizesPref);
};

init();
