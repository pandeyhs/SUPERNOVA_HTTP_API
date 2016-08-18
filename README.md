# HTTP API

----
## Overview

The ReST API allows the access of key telemetry and some satellite control through familiar HTTP calls.

----
## Public API

See http_api/swagger/swagger.io

The contents of this file can be run through the [Swagger Editor](http://editor.swagger.io/#/)
to get a formatted API document.

----

## Installation:

From the top level folder:

```
sudo make install
```

This will install the application and start the HTTP server automatically after
boot, provided the Linux OS is running systemd.

To uninstall
```
sudo make uninstall
```

HTTP requests are served over localhost:9000.

----
## Usage

The API can be accessed on `0.0.0.0:9000`.

### node.js

Here is an example call to get the position from the GPS. 

```javascript
var http = require('http');

http.get({
    host: '0.0.0.0',
    port:9000
    path: '/adcs/gps/state'
}, function(response) {
    var body = '';
    response.on('data', function(d) {
        body += d;
    });
    response.on('end', function() {
        var parsed = JSON.parse(body);
        var eci_x_km = parsed.eci_x_km;
        var eci_y_km = parsed.eci_y_km;
        var eci_z_km = parsed.eci_z_km;
        var eci_dx_kms = parsed.eci_dx_kms;
        var eci_dy_kms = parsed.eci_dy_kms;
        var eci_dz_kms = parsed.eci_dz_kms;
        var time = parsed.time
    });
});
```


### python

Here is an example call to get the battery voltage data from the eps:

```python
import requests

r = requests.get("0.0.0.0:9000/adcs/")
data = r.content
voltage = content.voltage
```

----

## Organization

The API is defined by the swagger spec file located at `swagger/swagger.yaml` according to the [Swagger specification](http://swagger.io). The fuctions run by the api are defined in `controllers/default_controller.py`. The fuction is specified by the `operationId` variable. For example, `operationId: "controllers.default_controller.adcs_get"` refers to `adcs_get()` in `default_controller.py` in the `controllers` directory.

When `app.py` is run, two threads are initiated in daemon mode, the [connexion](https://pypi.python.org/pypi/connexion) ([flask]()http://flask.pocoo.org/) server on `0.0.0.0:9000` and the core service manager. The flask server is run through [Flask-Cors](https://pypi.python.org/pypi/Flask-Cors) to allow for cross origin requests. The core service managers registers the telemetry recieved callback and runs the socket server. When the `telem_callback` is called, the telemetry object is written to the `telem_data.json` file for access from `default_controller.py` through a call to `app.read_telem_data()`.

---

## Starting the Server

If systemd is not being used to start the server automatically, it can be started manually with the following commands:
```
cd /opt/http_api
python http_api.py
```

---

### Logging debug data

```
python http_api.py log
```

Do not use this for deployed applications, log files can grow indefinitely.

To remove all log files, run:

```
rm -rf /opt/http_api/logs
```

----

### Graphical UI Example

A UI interface to the Bus is provided in examples/ui that commands and pulls
data from the Bus over HTTP. See examples/ui/README.md for more information
about the UI.

For more about the HTTP interface, see [docs/http_api.md](docs/http_api.md)...

---

## Release History
* v0.1

*Copyright 2016 Pumpkin Inc.*
