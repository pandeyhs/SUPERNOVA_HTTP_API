# SUPERNOVA UI

----

This directory contains the SUPERNOVA UI Dashboard which provides access to the State of Health Telemetry packet in a visual form.
*Note: using the UI requires Node.js version 4.0 or greater*

----

#Installing node packages

`npm install`

----

#Starting the Server

`npm start -- -ip "192.168.1.70"`

----

#Accessing the Server

Access the server through your chosen browser by navigating to:

`{ip address of host}:{chosen port number}`

For local host with default port number:

`localhost:3000`

----

## Files

 - [public](#/assets)
     - [assets](#/assets)
         - supernova.mtl
         - supernova.obj
     - [css](#/css)
         - fontawesome
             - font-awesome.css
         - [sass](#/sass)
             - fontawesome
             - [style.scss](#/styles.scss)
         - leaflet.css
         - normalize.css
         - skeleton.css
         - style.css
     - [fonts](#/fonts)
         - (Fonts)
     - [js](#/js)
         - images
             - (Map Display Images)
         - [angular-chart.js](http://jtblin.github.io/angular-chart.js/)
         - [angular.js](https://angularjs.org/)
         - [autoresize.js](http://www.jacklmoore.com/autosize/)
         - [babylon.js](http://www.babylonjs.com/)
         - [babylon.obj.js](https://doc.babylonjs.com/extensions/OBJ)
         - [chart.js](http://www.chartjs.org/)
         - [core.js](#/core.js)
         - [download.js](http://danml.com/download.html)
         - [draggabilly.js](http://draggabilly.desandro.com/)
         - [jquery.js](https://jquery.com/download/)
         - [leaflet.js](http://leafletjs.com/)
         - [mbtiles.js](https://github.com/tilemapjp/mbtiles.js/blob/master/Makefile)
         - [packery.js](http://packery.metafizzy.co/)
     - [mbtiles](#/mbtiles)
         - control-room.mbtiles
 - [routes](#/routes)
     - [dashboard.js](#/dashboard.js)
     - [index.js](#/index.js)
     - [settings.js](#settings.js)
 - [views](#/views)
     - [partials](#/partials)
         - [scripts](#/scripts)
             - [chart.ejs](#/chart.ejs)
             - [grid.ejs](#/grid.ejs)
             - [map.ejs](#/map.ejs)
             - [orbit-graphic.ejs](#/orbit-graphic.ejs)
         - [adcs.ejs](#/adcs.ejs)
         - [c&dh.ejs](#/c&dh.ejs)
         - [dashboard.ejs](#/dashboard.ejs)
         - [eps.ejs](#/eps.ejs)
         - [footer.ejs](#/footer.ejs)
         - [head.ejs](#/head.ejs)
         - [header.ejs](#/header.ejs)
         - [radio.ejs](#/radio.ejs)
         - [script.ejs](#/script.ejs)
         - [settings.ejs](#/settings.ejs)
         - [sidebar.ejs](#/sidebar.ejs)
     - [error.ejs](#/error.ejs)
     - [index.ejs](#/index.ejs)
 - [app.js](#/app.js)
 - [package.json](#/package.json)

----

### /public

#### /assets
This folder contains two files, `supernova.mtl` and `supernova.obj` which contain the model of the satellite that is displayed in the orientation card.

#### /css
##### sass
###### stylesscss
This files contains all the styles for the dashboard in sass

#### /fonts
Contains all the fonts required for the UI

#### /js
##### core.js
`core.js` contains all the angular code necessary to run the UI including the examples of the HTTP API.

Here is the code that gets the position from the acds:

```javascript
$http.get(Data.basePath + "/adcs/position").then(function(response){
//do work with data
}
```

#### /mbtiles
Contains the .mbtiles file that contains the offline map for the position view. Generated with tilemill.

### /routes
#### /dashboard.js
This routes the index page.
#### /index.js
This is the server that randomly generates data so that the UI can be tested.
#### /settings.js
This routes the settings page.

----
### /views
Contains all the [EJS](http://www.embeddedjs.com/) templates.
#### /partials
Contains all the templating components
##### /scripts
Contains all the UI scrips
###### chart.ejs
Runs the voltage chart
###### grid.ejs
Controls the card grid and resizing 
###### map.ejs
Runs the map graphic
###### orbit-graphic.ejs
Runs the orbit graphic display
#### adcs.ejs
The ADCS template page
#### c&dh.ejs
The C&DH template page
#### dashboard.ejs
The complete dashboard page
#### eps.ejs
The EPS template page
#### footer.ejs
The footer
#### head.ejs
The `html` `<head>` section where all files are loaded
#### header.ejs
The header
#### radio.ejs
The Radio template page
#### script.ejs
All scripts loaded into one file
#### settings.ejs
The settings template page
##### sidebar.ejs
The sidebar menu

----
### app.js

This file starts and runs the node.js server.

### package.json

Contains of the node dependencies

