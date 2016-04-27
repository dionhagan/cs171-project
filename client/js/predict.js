"use strict";

// TODO: make these set of functions into a class

function predictRandom(formData) {
  // start with random values (for now)
  var predictions = [
    {
      "college": "Princeton"
    },
    {
      "college": "Harvard"
    },
    {
      "college": "Yale"
    },
    {
      "college": "Columbia"
    },
    {
      "college": "Stanford"
    },
    {
      "college": "UChicago"
    },
    {
      "college": "MIT"
    },
    {
      "college": "Duke"
    },
    {
      "college": "UPenn"
    },
    {
      "college": "CalTech"
    },
    {
      "college": "JohnsHopkins"
    },
    {
      "college": "Dartmouth"
    },
    {
      "college": "Northwestern"
    },
    {
      "college": "Brown"
    },
    {
      "college": "Cornell"
    },
    {
      "college": "Vanderbilt"
    },
    {
      "college": "WashU"
    },
    {
      "college": "Rice"
    },
    {
      "college": "NotreDame"
    },
    {
      "college": "UCB"
    },
    {
      "college": "Emory"
    },
    {
      "college": "Georgetown"
    },
    {
      "college": "CarnegieMellon"
    },
    {
      "college": "UCLA"
    },
    {
      "college": "USC"
    }
  ];

  for (var i = 0; i < predictions.length; i++) {
    predictions[i].prob = Math.random();
  }
  p171.predictions = predictions;
  setCollegeColors();
}

function setCollegeColors() {
  for (var i = 0; i < p171.predictions.length; i++) {
    switch (p171.predictions[i].college) {
      case "Princeton":
        p171.predictions[i].color = 0xff8f00;
        break;
      case "Harvard":
        p171.predictions[i].color = 0xA41034;
        break;
      case "Yale":
        p171.predictions[i].color = 0x0f4d92;
        break;
      case "Columbia":
        p171.predictions[i].color = 0x9bddff;
        break;
      case "Stanford":
        p171.predictions[i].color = 0x981E32;
        break;
      case "UChicago":
        p171.predictions[i].color = 0x80000;
        break;
      case "MIT":
        p171.predictions[i].color = 0xA31F34;
        break;
      case "Duke":
        p171.predictions[i].color = 0x001A57;
        break;
      case "UPenn":
        p171.predictions[i].color = 0x011f5b;
        break;
      case "CalTech":
        p171.predictions[i].color = 0xFF6E1E;
        break;
      case "JohnsHopkins":
        p171.predictions[i].color = 0x002d72;
        break;
      case "Dartmouth":
        p171.predictions[i].color = 0x00693e;
        break;
      case "Northwestern":
        p171.predictions[i].color = 0x520063;
        break;
      case "Brown":
        p171.predictions[i].color = 0xCC0000;
        break;
      case "Cornell":
        p171.predictions[i].color = 0xB31B1B;
        break;
      case "Vanderbilt":
        p171.predictions[i].color = 0x997F3D;
        break;
      case "WashU":
        p171.predictions[i].color = 0xa51417;
        break;
      case "Rice":
        p171.predictions[i].color = 0x002469;
        break;
      case "NotreDame":
        p171.predictions[i].color = 0x002B5B;
        break;
      case "UCB":
        p171.predictions[i].color = 0x003262;
        break;
      case "Emory":
        p171.predictions[i].color = 0x1b3d75;
        break;
      case "Georgetown":
        p171.predictions[i].color = 0x011e41;
        break;
      case "CarnegieMellon":
        p171.predictions[i].color = 0x900000;
        break;
      case "UCLA":
        p171.predictions[i].color = 0x3284BF;
        break;
      case "USC":
        p171.predictions[i].color = 0x990000;
        break;
      default:
        p171.predictions[i].color = 0x000000;
    }
  }
}


function predict() {

  // TODO: call webservice or JavaScript Random Forest

  //console.log(formData);

  // url template for webservice request src
  var url = "http://ws.chanceme.info/predict?admissionstest={TEST}&AP={AP}&averageAP={APAVE}&SATsubject={SAT2}&GPA={GPA}&schooltype={HS}&intendedgradyear=2017&female={GENDER}&MinorityRace={MINOR}&international=0&sports=0&earlyAppl=0&alumni=0&outofstate=0&acceptrate=0.151&size=6621&public=0&finAidPct=0&instatePct=0";

  // object to convert ACT to SAT scores
  var act2sat = {
    "36": 1600,
    "35": 1560,
    "34": 1510,
    "33": 1460,
    "32": 1420,
    "31": 1380,
    "30": 1340,
    "29": 1300,
    "28": 1260,
    "27": 1220,
    "26": 1190,
    "25": 1150,
    "24": 1110,
    "23": 1070,
    "22": 1030,
    "21": 990,
    "20": 950,
    "19": 910,
    "18": 870,
    "17": 830,
    "16": 790,
    "15": 740,
    "14": 690,
    "13": 640,
    "12": 590,
    "11": 530
  }

  // means and standard deviations for standardizable values
  var means, stds;

  means = p171.normalize.means;
  stds = p171.normalize.stds;

  // calculate standard admissions test score
  var admissionstest;

  var newurl;
  var xhr = new XMLHttpRequest();

  // Get form selections
  var sat = d3.select('#sat');
  var act = d3.select('#act');
  var gpa = d3.select('#gpa');
  var apave = d3.select('#ave_ap');
  var apnum = d3.select('#num_ap');
  var sat2ave = d3.select('#num_sat');
  var hs = d3.select('#hs');
  var gender = d3.select('#gender');
  var race = d3.select('#race');

  // Save user input into localStorage
  p171.user = {
    sat: sat.property("value"),
    act: act.property("value"),
    gpa: gpa.property("value"),
    apave: apave.property("value"),
    apnum: apnum.property("value"),
    sat2ave: sat2ave.property("value"),
    hs: hs.property("value"),
    race: race.property("value")
  }

  saveUserData(p171.user);

  // Standardize values and construct new URL
  function getNewURL() {

    // Standardize SAT/ACT
    // take larger score and standardize
    if (act.property("value") == 0 && sat.property("value") == 0) {
      admissionstest = 0;
    } else if (sat.property("value") != 0 && act.property("value") == 0) {
      admissionstest = (sat.property("value") - means.admissionstest) / stds.admissionstest;
    } else if (sat.property("value") == 0 && act.property("value") != 0) {
      admissionstest = (act2sat[act.property("value")] - means.admissionstest) / stds.admissionstest;
    } else {
      if (sat.property("value") > act2sat[act.property("value")]) {
        admissionstest = (sat.property("value") - means.admissionstest) / stds.admissionstest;
      } else {
        admissionstest = (act2sat[act.property("value")] - means.admissionstest) / stds.admissionstest;
      }
    }

    //console.log(gpa.property("value"));

    // Standardize GPA, Average AP, and SAT2
    var gpaValue = (gpa.property("value") - means.GPA) / stds.GPA;
    var apaveValue = (apave.property("value") - means.averageAP) / stds.averageAP;
    var sat2aveValue = (sat2ave.property("value") - means.SATsubject) / stds.SATsubject;
    var minority = 0;
    if (race.property("value") > 1) {
      minority = 1;
    }

    //console.log(gpaValue);
    //console.log(apnum.property("value"));

    // Construct New URL
    var result_url = url.replace("{TEST}", admissionstest)
      .replace("{GPA}", gpaValue)
      .replace("{AP}", apnum.property("value"))
      .replace("{APAVE}", apaveValue)
      .replace("{SAT2}", sat2aveValue)
      .replace("{HS}", hs.property("value"))
      .replace("{GENDER}", gender.property("value"))
      .replace("{MINOR}", minority);
    return result_url;
  }

  // Make Webservice Requests
  newurl = getNewURL();
  console.log(newurl);
  document.getElementById("result").innerHTML = "calling to webservice...<br>" + newurl;
  xhr.open("GET", newurl);
  xhr.send();

  var predictions = {};

  // Fetch JSON
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      p171.predictions = JSON.parse(this.response).preds;
      setCollegeColors();
      console.log("web service returned");
      p171.lineChart.wrangleData();
      p171.innovation3d.wrangleData();
    }
  }
}
