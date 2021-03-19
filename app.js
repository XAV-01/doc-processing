/* dependency setup */
process.env.UV_THREADPOOL_SIZE = 128;

var express = require("express");
var bodyParser = require('body-parser');
var log4js = require('log4js');
var logger = log4js.getLogger();
var backendApi = require("./backendApi")


logger.level = 'debug';
logger.debug("launching Example health endpoint");

/* end of dependency setup */

var port = process.env.PORT || 8080;

var app = express();

var MODE = {
  "TEST": 1,
  "Z": 2,
  "OPENSHIFT": 3
}

var CURRENTMODE = MODE.TEST;

var API_URL = ""

app.post('/mode', function(req, res) {
  logger.debug('called the mode endpoint with mode: ' + req.query.mode);
  logger.debug('called the mode endpoint with url: ' + req.query.url);
  CURRENTMODE = req.query.mode;
  API_URL = req.query.url;
  res.send({ "modes": MODE,
    "mode": CURRENTMODE
  });
});

app.get('/mode', function(req, res) {
  res.send({ "modes": MODE,
    "mode": CURRENTMODE
  });
});

app.get('/info', function(req, res) {

  if (req.query.id !== null && req.query.id !== undefined) {
    logger.debug('called the information endpoint: ' + req.query.id || "default user");
  } else {
    logger.debug('called the information endpoint: in-memory data for "ralphd"')
  }

  var patientdata;

  if (CURRENTMODE == MODE.TEST) {
    patientdata = {
      "personal": {
        "name": "Paul Person",
        "age": 38,
        "gender": "Homme",
        "street": "1 rue de la Pax",
        "city": "Paris",
        "zipcode": "75001"
      },
      "medications": ["Vitamine C", "Vitamine C", "Vitamin K"],
      "appointments": ["2021-01-15 1:00 - Dentiste", "2021-02-14 4:00 - Généraliste", "2021-09-30 8:00 - Opthmalmogue"]
    }

    res.send(patientdata);
  } else {

    patientdata = {
      personal: {},
      medications: [],
      appointments: []
    }

    var patientInfo = backendApi.getPatientInfo(API_URL, req.query.id);
    var patientMedications = backendApi.getPatientMedications(API_URL, req.query.id);
    var patientAppointments = backendApi.getPatientAppointments(API_URL, req.query.id);

    patientInfo.then(function(patientInfoResult) {
      patientdata.personal = patientInfoResult;

      patientMedications.then(function(patientMedicationsResult) {
        patientdata.medications = patientMedicationsResult;

        patientAppointments.then(function(patientAppointmentsResult) {
          patientdata.appointments = patientAppointmentsResult;

          res.send(patientdata);
        })
      })
    })
  }

});

app.get('/measurements', function(req, res) {

  logger.debug('called the measurements endpoint for ' + req.query.id);

  var measurements;

  if (CURRENTMODE == MODE.TEST) {

  measurements = {
    smokerstatus: 'Ancien fumeur',
    dia: 88,
    sys: 130,
    bmi: 21,7,
    bmirange: 'normal',
    weight: 72,
    height: 1.82
  }

    res.send(measurements);
  }else{

  var patientMeasurements = backendApi.getPatientMeasurements(API_URL, req.query.id);

  patientMeasurements.then(function(patientMeasurementsResult) {
    measurements = patientMeasurementsResult;
    res.send(measurements);
  })
}

});

app.post('/login', function(req, res) {

  logger.debug('called the login endpoint for ' + req.query.username);

  var patientLogin = backendApi.patientLogin(API_URL, req.query.username, req.query.password);

  console.log(patientLogin)

  patientLogin.then(function(id) {

    console.log(id)
    res.send({
      id: id
    });

  })
})

// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json())

app.listen(port);
logger.debug("Listening on port ", port);
