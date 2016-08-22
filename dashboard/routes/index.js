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

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {view: 'dashboard'});
});

/* GET Dashboard. */
router.get('/dashboard', function(req, res, next) {
  res.render('index', {view: 'dashboard'});
});

/* GET Settings. */
router.get('/settings', function(req, res, next) {
  res.render('index', {view: 'settings'});
});

/* GET C&DH. */
router.get('/c&dhview', function(req, res, next) {
  res.render('index', {view: 'c&dh'});
});

/* GET ADCS. */
router.get('/adcsview', function(req, res, next) {
  res.render('index', {view: 'adcs'});
});

/* GET EPS. */
router.get('/epsview', function(req, res, next) {
  res.render('index', {view: 'eps'});
});

/* GET Radio. */
router.get('/radioview', function(req, res, next) {
  res.render('index', {view: 'radio'});
});




/* Sample Data */

///////////////////////
/* System End points */
///////////////////////
router.get('/system', function(req, res, next) {

  var d = new Date();

  var object = {
    time: d.toISOString(),
    temperature: random(-80,100),
    fault_count: (0, 255)
  }

  res.send(object);
});

router.get('/system/time', function(req, res, next) {

  var d = new Date();

  res.send(d.toISOString());
});

router.get('/system/temperature', function(req, res, next) {
  res.send(random(-80,100));
});

router.get('/system/fault_count', function(req, res, next) {
  res.send(random(0,255));
});

///////////////////////
/*  ADCS End points  */
///////////////////////

router.get('/adcs', function(req, res, next) {

  var d = new Date();

  var randPos =  randomSpherePoint(6600);

  var a = random(0,360);
  var b = random(0,360);
  var h = random(0,360);
  var c1 = Math.cos(h);
  var c2 = Math.cos(a);
  var c3 = Math.cos(b);
  var s1 = Math.sin(h);
  var s2 = Math.sin(a);
  var s3 = Math.sin(b);

  var qx = Math.round((c1*c2*c3 - s1*s2*s3)*100000)/100000;
  var qy = Math.round((s1*s2*c3 + c1*c2*s3)*100000)/100000;
  var qz = Math.round((s1*c2*c3 + c1*s2*s3)*100000)/100000;
  var qw = Math.round((c1*s2*c3 - s1*c2*s3)*100000)/100000;

  var object = {
    command: {
      command_status: random(0,2),
      command_accepted_count: random(0,255),
      command_rejected_count: random(0,255)
    },
    time: (d/1000)-32,
    propogation: {
      attitude: {
        eci_qx: qx,
        eci_qy: qy,
        eci_qz: qz,
        eci_qw: qw
      },
      position: {
        eci_x_km: Math.floor(randPos.x),
        eci_y_km: Math.floor(randPos.y),
        eci_z_km: Math.floor(randPos.z)
      },
      velocity: {
        eci_x_kms: random(15000,28000),
        eci_y_kms: random(15000,28000),
        eci_z_kms: random(0,100)
      }
    },
    reaction_wheel: {
      filtered_speed_1_rpm: 0,
      filtered_speed_2_rpm: 0,
      filtered_speed_3_rpm: 0
    },
    star_tracker: {
      attitude:{
        eci_qx: qx,
        eci_qy: qy,
        eci_qz: qz,
        eci_qw: qw
      },
      status:{
        tracker_attitude_status: random(0,5),
        tracker_rate_attitude_status: 0
      }
    },
    coarse_sun_sensor: {
      sun_body_vector_1: random(0,360),
      sun_body_vector_2: random(0,360),
      sun_body_vector_3: random(0,360),
      status: {
        id: 0,
        text: "GOOD"
      }
    },
    gps: {
      position: {
        eci_x_km: Math.floor(randPos.x),
        eci_y_km: Math.floor(randPos.y),
        eci_z_km: Math.floor(randPos.z)
      },
      velocity: {
        eci_x_kms: random(15000,28000),
        eci_y_kms: random(15000,28000),
        eci_z_kms: random(0,100)
      },
      status: {
        enabled: true,
        valid: true
      }
    }
  }

  res.send(object);
});



router.get('/state', function(req, res, next) {

  var rand =  randomSpherePoint(6600);

  var object = {
    eci_x_km: Math.floor(rand.x),
    eci_y_km: Math.floor(rand.y),
    eci_z_km: Math.floor(rand.z),
    eci_dx_kms: random(0,1000),
    eci_dy_kms: random(0,1000),
    eci_dz_kms:random(0,1000)
  }

  res.send(object);
});

var h = 0;
var a = 0;
var b = 0;

router.get('/attitude', function(req, res, next) {


  a = a+random(0,30)%360;
  b = b+random(0,10)%360;
  var c1 = Math.cos(h);
  var c2 = Math.cos(a);
  var c3 = Math.cos(b);
  var s1 = Math.sin(h);
  var s2 = Math.sin(a);
  var s3 = Math.sin(b);

  var object = {
    eci_qx: Math.round((c1*c2*c3 - s1*s2*s3)*100000)/100000,
    eci_qy: Math.round((s1*s2*c3 + c1*c2*s3)*100000)/100000,
    eci_qz: Math.round((s1*c2*c3 + c1*s2*s3)*100000)/100000,
    eci_qw: Math.round((c1*s2*c3 - s1*c2*s3)*100000)/100000
  }

  res.send(object);
});

var v = 0;
var inc = true;

router.get('/power', function(req, res, next){

  if(inc){
    if( v < 12)
      v += random(0,10)/10;
    else
      inc = false;
  }else{
    if (v > 1)
      v -= random(0,10)/10;
    else
      inc = true;
  }

  var object = {
    low_power_warning: (v < 8),
    bcr_current: random(1000, 10000),
    battery_voltage: v
  }

  res.send(object);
});

router.get('/power/reset', function(req, res, next){
  var object = [
    {
      reset: true,
      reset_time: "2016-6-22T10:00:00-05:00"
    },
    {
      reset: false,
      reset_time: "2016-6-15T10:00:00-05:00"
    },
    {
      reset: true,
      reset_time: "2016-6-06T10:00:00-05:00"
    },
    {
      reset: true,
      reset_time: "2016-5-25T10:00:00-05:00"
    },
    {
      reset: false,
      reset_time: "2016-5-12T10:00:00-05:00"
    },
    {
      reset: true,
      reset_time: "2016-5-02T10:00:00-05:00"
    }
  ];

  res.send(object);
});

router.post('/power/reset', function(req, res, next){
  console.log("QW: "+req.body.eci_qw+"\n"+"QX: "+req.body.eci_qx+"\n"+"QY: "+req.body.eci_qy+"\n"+"QZ: "+req.body.eci_qz+"\n");
});

router.get('/files', function(req, res, next){
  var object = [
    {
      file_id: 41351345,
      creation_time: "2016-6-22T10:00:00-05:00"
    },
    {
      file_id: 1356457234,
      creation_time: "2016-6-15T10:00:00-05:00"
    },
    {
      file_id: 1345568784,
      creation_time: "2016-6-06T10:00:00-05:00"
    },
    {
      file_id: 567445365,
      creation_time: "2016-5-25T10:00:00-05:00"
    },
    {
      file_id: 8947256,
      creation_time: "2016-5-12T10:00:00-05:00"
    },
    {
      file_id: 23454567562,
      creation_time: "2016-5-02T10:00:00-05:00"
    },
    {
      file_id: 41351345,
      creation_time: "2016-6-22T10:00:00-05:00"
    },
    {
      file_id: 1356457234,
      creation_time: "2016-6-15T10:00:00-05:00"
    },
    {
      file_id: 456456,
      creation_time: "2016-6-06T10:00:00-05:00"
    },
    {
      file_id: 12345543,
      creation_time: "2016-5-25T10:00:00-05:00"
    },
    {
      file_id: 899564,
      creation_time: "2016-5-12T10:00:00-05:00"
    },
    {
      file_id: 542345234,
      creation_time: "2016-5-02T10:00:00-05:00"
    }
  ];

  res.send(object);
});

router.get('/files/:id', function(req, res, next){
  var object = " Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quia dolori non voluptas contraria est, sed doloris privatio. Prioris generis est docilitas, memoria; Ad eas enim res ab Epicuro praecepta dantur. Servari enim iustitia nisi a forti viro, nisi a sapiente non potest. Qua igitur re ab deo vincitur, si aeternitate non vincitur? Et quidem iure fortasse, sed tamen non gravissimum est testimonium multitudinis. Sed emolumenta communia esse dicuntur, recte autem facta et peccata non habentur communia. Septem autem illi non suo, sed populorum suffragio omnium nominati sunt. Efficiens dici potest. Sed tu istuc dixti bene Latine, parum plane. Esse enim quam vellet iniquus iustus poterat inpune. Idem iste, inquam, de voluptate quid sentit? Quod quidem iam fit etiam in Academia. Qui-vere falsone, quaerere mittimus-dicitur oculis se privasse; Duo Reges: constructio interrete. Indicant pueri, in quibus ut in speculis natura cernitur. Itaque haec cum illis est dissensio, cum Peripateticis nulla sane. Iam id ipsum absurdum, maximum malum neglegi. Causa autem fuit huc veniendi ut quosdam hinc libros promerem. Si verbum sequimur, primum longius verbum praepositum quam bonum. Quae animi affectio suum cuique tribuens atque hanc, quam dico. Hoc non est positum in nostra actione. Sit enim idem caecus, debilis. Ea possunt paria non esse. Ut in voluptate sit, qui epuletur, in dolore, qui torqueatur. Quid est enim aliud esse versutum? Quod autem magnum dolorem brevem, longinquum levem esse dicitis, id non intellego quale sit. Quem Tiberina descensio festo illo die tanto gaudio affecit, quanto L.";

  res.send(object);
});


function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomSpherePoint(radius){
   var u = Math.random();
   var v = Math.random();
   var theta = 2 * Math.PI * u;
   var phi = Math.acos(2 * v - 1);
   var x = (radius * Math.sin(phi) * Math.cos(theta));
   var y = (radius * Math.sin(phi) * Math.sin(theta));
   var z = (radius * Math.cos(phi));
   return{x:x,y:y,z:z};
}

module.exports = router;
