'use strict';

var configFile = 'config/config.js';

// Config loader
var script = document.createElement('script');
script.setAttribute('type', 'text/javascript');
script.setAttribute('src', configFile + '?d=' + Date.now());
document.getElementsByTagName("head")[0].appendChild(script);
