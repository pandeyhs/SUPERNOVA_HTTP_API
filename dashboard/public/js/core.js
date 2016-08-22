/**################################################################################
#(C) Copyright Pumpkin, Inc. All Rights Reserved.
#
#This file may be distributed under the terms of the License
#Agreement provided with this software.
#
#THIS FILE IS PROVIDED AS IS WITH NO WARRANTY OF ANY KIND,
#INCLUDING THE WARRANTY OF DESIGN, MERCHANTABILITY AND
#FITNESS FOR A PARTICULAR PURPOSE.
################################################################################**/

/**
*
* This file contains all the calls to the API and can be used as an example payload.
*
*
*/

// Use Chart.js
var app = angular.module("supernova", ["chart.js"]);

app.controller('controller', ['$scope', '$interval', '$http',
  function($scope, $interval, $http) {
    $scope.title = "SUPERNOVA";
  }
]);

//Return the ReST API basepath from the Data factory
app.factory('Data', function(){
  return{
    basePath: "http://" + SNOVA_CONFIG.ip + ":" + SNOVA_CONFIG.port
  }
});

/////////////////////
////////INDEX////////
/////////////////////

// Controller for the Time Card
app.controller('timeController', ['$scope', '$interval', '$http', 'Data',
  function($scope, $interval, $http, Data){

    var d = new Date();
    $scope.time = "00:00:00";

    $interval(function() {
      //Make a GET request to /system
      $http.get(Data.basePath + "/system").then(function(response){
        d = new Date(response.data.time);
        $scope.time = JSU.padZeros(d.getUTCHours(), 2)
          +":"+JSU.padZeros(d.getUTCMinutes(), 2)
          +":"+JSU.padZeros(d.getUTCSeconds(), 2);
      }, function(response){

      });
    }, 100);
  }
]);

//Controller for the Orbit Card
app.controller('orbitController', ['$scope', '$interval', '$http', '$window', 'Data',
  function($scope, $interval, $http, $window, Data){

    $scope.x = -99;
    $scope.y = -99;
    $scope.z = -99;

    $scope.dx = -99;
    $scope.dy = -99;
    $scope.dz = -99;

    $scope.qw = -99
    $scope.qx = -99;
    $scope.qy = -99;
    $scope.qz = -99;

    $scope.submitAttitude = function(){
       var attitude = {
         "eci_qw": $scope.eci_qw,
         "eci_qx": $scope.eci_qx,
         "eci_qy": $scope.eci_qy,
         "eci_qz": $scope.eci_qz
       };

       //Submit a POST request to set the ADCS target Attitude
       $http.post(Data.basePath + "/adcs/attitude", attitude);
    }

    $interval(function() {
      //Make a GET request to /adcs/state
      $http.get(Data.basePath + "/adcs/state", {headers: {'Content-Type': 'json'}}).then(function(response){

        $scope.x = response.data.eci_x_km;
        $scope.y = response.data.eci_y_km;
        $scope.z = response.data.eci_z_km;
        $scope.dx = response.data.eci_dx_kms;
        $scope.dy = response.data.eci_dy_kms;
        $scope.dz = response.data.eci_dz_kms;
        //Convert ECI XYZ to Latitude, Longitude
        var coor = eciToLatLong($scope.x,$scope.y,$scope.z);
        console.log(coor.lattitude);
        $window.lattitude = coor.latitude;
        $window.longitude = coor.longitude;
        $window.altitude = coor.altitude;
      }, function(response){

      });

      //Make a GET request to /adcs/attitude
      $http.get(Data.basePath + "/adcs/attitude").then(function(response){
        $window.qw = response.data.eci_qw;
        $window.qx = response.data.eci_qx;
        $window.qy = response.data.eci_qy;
        $window.qz = response.data.eci_qz;
        $scope.qw = response.data.eci_qw;
        $scope.qx = response.data.eci_qx;
        $scope.qy = response.data.eci_qy;
        $scope.qz = response.data.eci_qz;
      }, function(response){

      });

    }, 3000);
  }
]);

//Controller for the Power Card
app.controller('powerController', ['$scope', '$interval', '$http', 'Data',
  function($scope, $interval, $http, Data){

    //POST to /system/reset
    $scope.reset = function(){
      $.post( Data.basePath+'/system/reset', "type=SYS_REBOOT", function(data){
        console.log(data);
      });
    }

    $scope.voltage;
    $scope.current;
    $scope.lowPower = false;

    $scope.resetArr;

    $scope.powerStyle = {color:'black'};


    //Initialise chart labels as empty array
    $scope.labels = ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""];
    $scope.series = ['Series A', 'Series B'];
    //Initialize data as 0s
    $scope.data = [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ];
    $scope.onClick = function (points, evt) {
      console.log(points, evt);
    };
    $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
    $scope.colors = ['#45b7cd', '#ff6384', '#ff8e72'];
    $scope.options = {
      pointRadius: 1,
      animation: false,
      scales: {
        yAxes: [
          {
            id: 'y-axis-1',
            type: 'linear',
            display: true,
            position: 'left',
            ticks: {
                suggestedMin: 0,    // minimum will be 0, unless there is a lower value.
                // OR //
                max: 14   // minimum value will be 0.
            }
          },
          {
            id: 'y-axis-2',
            type: 'linear',
            display: true,
            position: 'right',
            ticks: {
                suggestedMin: 0,    // minimum will be 0, unless there is a lower value.
                // OR //
                max: 10000   // minimum value will be 0.
            }
          }
        ]
      }
    };

    $interval(function() {
      $http.get(Data.basePath + "/eps/voltage").then(function(response){
        $scope.voltage = response.data.battery;
      }, function(response){

      });

      $http.get(Data.basePath + "/eps/current").then(function(response){
        $scope.current = response.data.battery;
      }, function(response){

      });

      var d = new Date();

      if($scope.labels.length > 50){
        $scope.labels = $scope.labels.slice($scope.labels.length-50);
        $scope.data[0] = $scope.data[0].slice($scope.data[0].length-50);
        $scope.data[1] = $scope.data[1].slice($scope.data[1].length-50);
      }

      $scope.labels.push(d.toLocaleTimeString());
      $scope.data[0].push($scope.voltage);
      $scope.data[1].push($scope.current);
    }, 5000);
  }
]);

/////////////////////
////////C&DH/////////
/////////////////////

app.controller('cdhFaultController', ['$scope', '$interval', '$http', 'Data',
  function($scope, $interval, $http, Data){
    $scope.systemFaultCount = 0;

    $interval(function() {
      $http.get(Data.basePath + "/system").then(function(response){
        $scope.systemFaultCount = response.data.fault_count;
      }, function(response){

      });
    }, 1000);
  }
]);

app.controller('tempController', ['$scope', '$interval', '$http', 'Data',
  function($scope, $interval, $http, Data){
    $scope.tempMC = 0;

    $interval(function() {
      $http.get(Data.basePath + "/system").then(function(response){
        $scope.tempMC = response.data.temperature;
      }, function(response){

      });
    }, 1000);
  }
]);

/////////////////////
////////ADACS////////
/////////////////////

//Sets all the ADCS Page cards
app.controller('adcsController', ['$scope', '$interval', '$http', 'Data',
  function($scope, $interval, $http, Data){

    $scope.adcs_status;
    $scope.adcs_time;

    $scope.propagation_attitude;
    $scope.propagation_position;
    $scope.propagation_velocity;

    $scope.gps_status;
    $scope.gps_velocity;
    $scope.gps_position;

    $scope.star_tracker_status;
    $scope.star_tracker_attitude;

    $scope.coarse_sun_sensor;

    $scope.gps;

    $interval(function() {
      //Call to /adcs
      $http.get(Data.basePath + "/adcs").then(function(response){
        $scope.adcs_status = response.data;
      }, function(response){
      });

      //Call to /adcs/coarse_sun_sensor
      $http.get(Data.basePath + "/adcs/coarse_sun_sensor").then(function(response){
        $scope.coarse_sun_sensor = response.data;
      }, function(response){
      });

      //Call to /adcs/gps
      $http.get(Data.basePath + "/adcs/gps").then(function(response){
        $scope.gps_status = response.data;
      }, function(response){
      });

      //Call to /adcs/gps/state
      $http.get(Data.basePath + "/adcs/gps/state").then(function(response){
        $scope.gps_velocity = response.data;
      }, function(response){
      });

      //Call to /adcs/star_tracker
      $http.get(Data.basePath + "/adcs/star_tracker").then(function(response){
        $scope.star_tracker_status = response.data;
      }, function(response){
      });

      //Call to /adcs/star_tracker/attitude
      $http.get(Data.basePath + "/adcs/star_tracker/attitude").then(function(response){
        $scope.star_tracker_attitude = response.data;
      }, function(response){
      });

      //Call to /adcs/propagator/attitude
      $http.get(Data.basePath + "/adcs/propagator/attitude").then(function(response){
        $scope.propagation_attitude = response.data;
        console.log(response.data);
      }, function(response){
      });

      //Call to /adcs/propagator/state
      $http.get(Data.basePath + "/adcs/propagator/state").then(function(response){
        $scope.propagation_velocity = response.data;
      }, function(response){
      });

    }, 5000);
  }
]);

/////////////////////
/////////EPS/////////
/////////////////////

app.controller('epsController', ['$scope', '$interval', '$http', 'Data',
  function($scope, $interval, $http, Data){
    $scope.status;

    $scope.battery;

    $scope.bcr;

    $scope.battery;

    $scope.current;

    $interval(function() {
      //Call to /eps
      $http.get(Data.basePath + "/eps").then(function(response){
        $scope.status = response.data;
      }, function(response){

      });

      //Call to /eps/battery
      $http.get(Data.basePath + "/eps/battery").then(function(response){
        $scope.battery = response.data;
      }, function(response){

      });

      //Call to /eps/bcr
      $http.get(Data.basePath + "/eps/bcr").then(function(response){
        $scope.bcr = response.data;
      }, function(response){

      });

      //Call to /eps/voltage
      $http.get(Data.basePath + "/eps/voltage").then(function(response){
        $scope.voltage = response.data;
      }, function(response){

      });

      //Call to /eps/current
      $http.get(Data.basePath + "/eps/current").then(function(response){
        $scope.current = response.data;
      }, function(response){

      });


    }, 1000);
  }
]);

/////////////////////
///////FILTERS///////
/////////////////////

app.filter('yesNo', function() {
    return function(input) {
        return input ? 'Yes' : 'No';
    }
});

app.filter('resetColor', function() {
    return function(input) {
        return input ? '{color: "#d9534f",background: "#f2dede"}' : '{color:"#5cb85c",background:"#dff0d8"}';
    }
});

//from satellite-js lib
function eciToLatLong(x,y,z){
  var now = new Date();

  var gmst = gstimeFromDate(
        now.getUTCFullYear(),
        now.getUTCMonth() + 1, // Note, this function requires months in range 1-12.
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds()
    );
  /*var X = (x * Math.cos(gmst))    + (y * Math.sin(gmst));
  var Y = (x * (-Math.sin(gmst))) + (y * Math.cos(gmst));
  var Z =  z;
  return { x : X, y : Y, z : Z };*/


  var a   = 6378.137;
  var b   = 6356.7523142;
  var R   = Math.sqrt( (x * x) + (y * y) );
  var f   = (a - b)/a;
  var e2  = ((2*f) - (f*f));
  var longitude = Math.atan2(y, x) - gmst;
  var kmax = 20;
  var k = 0;
  var latitude = Math.atan2(z,
                            Math.sqrt(x * x +
                                      y * y));
  var C;
  while (k < kmax){
    C = 1 / Math.sqrt( 1 - e2*(Math.sin(latitude)*Math.sin(latitude)) );
    latitude = Math.atan2 (z + (a*C*e2*Math.sin(latitude)), R);
    k += 1;
  }
  var height = (R/Math.cos(latitude)) - (a*C);
  console.log([x,y,z,longitude,latitude]);
  return { longitude : degToLong(longitude), latitude : degToLat(latitude), altitude : height };
}

function gstimeFromDate(year, mon, day, hr, minute, sec) {
  return gstime(jday(year, mon, day, hr, minute, sec));
}

function gstime(jdut1){
  var tut1 = (jdut1 - 2451545.0) / 36525.0;
  var temp = -6.2e-6* tut1 * tut1 * tut1 + 0.093104 * tut1 * tut1 +
      (876600.0*3600 + 8640184.812866) * tut1 + 67310.54841;  //#  sec
  temp = (temp * (Math.PI / 180.0) / 240.0) % (Math.PI * 2.0); // 360/86400 = 1/240, to deg, to rad

  //  ------------------------ check quadrants ---------------------
  if (temp < 0.0){
    temp += (Math.PI * 2.0);
  }
  return temp;
}

function jday(year, mon, day, hr, minute, sec) {
  return (367.0 * year -
          Math.floor((7 * (year + Math.floor((mon + 9) / 12.0))) * 0.25) +
          Math.floor( 275 * mon / 9.0 ) +
          day + 1721013.5 +
          ((sec / 60.0 + minute) / 60.0 + hr) / 24.0  //  ut in days
          //#  - 0.5*sgn(100.0*year + mon - 190002.5) + 0.5;
         );
}

function degToLat(radians){
  if (radians > Math.PI/2 || radians < (-Math.PI/2)){
    return 'Err';
  }
  var degrees = (radians/Math.PI*180);
  if (degrees < 0){
    degrees = degrees;
  }
  else{
    degrees = degrees;
  }
  return degrees;
}

function degToLong(radians){
  var degrees = (radians/Math.PI*180) % (360);
  if (degrees > 180){
    degrees = 360 - degrees;
  }
  else if (degrees < -180){
    degrees = 360 + degrees;
  }
  return degrees;
}
