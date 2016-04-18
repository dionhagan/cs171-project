"use strict";

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
}

function predict() {

  // TODO: call webservice or JavaScript Random Forest

  //console.log(formData);

  // url template for webservice request src
  var url = "http://ws.chanceme.info/predict?admissionstest={TEST}&AP={AP}&averageAP={APAVE}&SATsubject={SAT2}&GPA={GPA}&schooltype={HS}&intendedgradyear=2017&female={GENDER}&MinorityRace=0&international=0&sports=0&earlyAppl=0&alumni=0&outofstate=0&acceptrate=0.151&size=6621&public=0&finAidPct=0&instatePct=0";

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

    //console.log(gpaValue);
    //console.log(apnum.property("value"));

    // Construct New URL
    var result_url = url.replace("{TEST}", admissionstest)
      .replace("{GPA}", gpaValue)
      .replace("{AP}", apnum.property("value"))
      .replace("{APAVE}", apaveValue)
      .replace("{SAT2}", sat2aveValue)
      .replace("{HS}", hs.property("value"))
      .replace("{GENDER}", gender.property("value"));
    //.replace("{RACE}", race.value);
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
      console.log("web service returned");
      p171.lineChart.wrangleData();
    }
  }
}
