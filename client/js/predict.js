"use strict";

function predict() {
  // TODO: call webservice or JavaScript Random Forest

  // XXX: mock prediction generator. Remove later.
  var predictions = [
    {"college": "Princeton"},
    {"college": "Harvard"},
    {"college": "Yale"},
    {"college": "Columbia"},
    {"college": "Stanford"},
    {"college": "UChicago"},
    {"college": "MIT"},
    {"college": "Duke"},
    {"college": "UPenn"},
    {"college": "CalTech"},
    {"college": "JohnsHopkins"},
    {"college": "Dartmouth"},
    {"college": "Northwestern"},
    {"college": "Brown"},
    {"college": "Cornell"},
    {"college": "Vanderbilt"},
    {"college": "WashU"},
    {"college": "Rice"},
    {"college": "NotreDame"},
    {"college": "UCB"},
    {"college": "Emory"},
    {"college": "Georgetown"},
    {"college": "CarnegieMellon"},
    {"college": "UCLA"},
    {"college": "USC"}
  ];

  for (var i = 0; i < predictions.length; i++) {
    predictions[i].prob = Math.random();
  }
  return predictions;
}

function predict2() {

  // TODO: call webservice or JavaScript Random Forest

  //console.log(formData);

  // url template for webservice request src
  var url = "http://ws.chanceme.info/predict?admissionstest={TEST}&AP={AP}&averageAP={APAVE}&SATsubject={SAT2}&GPA={GPA}&schooltype={HS}&intendedgradyear=2017&female={GENDER}&MinorityRace=0&international=0&sports=0&earlyAppl=0&alumni=0&outofstate=0&acceptrate=0.151&size=6621&public=0&finAidPct=0&instatePct=0";

  // object to convert ACT to SAT scores
  var act2sat = {"36": 1600, "35": 1560, "34": 1510, "33": 1460, 
               "32": 1420, "31": 1380, "30": 1340, "29": 1300, 
               "28": 1260, "27": 1220, "26": 1190, "25": 1150, 
               "24": 1110, "23": 1070, "22": 1030, "21": 990, 
               "20": 950, "19": 910, "18": 870, "17": 830, "16": 790, 
               "15": 740, "14": 690, "13": 640, "12": 590, "11": 530}

  // means and standard deviations for standardizable values
  var means, stds;

  d3.csv('../client/data/normalize_means.csv', function(meanData) {
    d3.csv('../client/data/normalize_stds.csv', function(stdData) {

      means = meanData[0];
      stds = stdData[0];

      // calculate standard admissions test score
      var admissionstest;

      var newurl;
      var xhr = new XMLHttpRequest();

      // Get form selections
      var sat = d3.select('#sat');
      var act = d3.select('#act');
      var gpa = d3.select('#gpa');
      var apave = d3.select('#ave_ap');
      var apnum = d3.select('#apnum');
      var sat2ave = d3.select('#num_sat');
      var hs = d3.select('#hs');
      var gender = d3.select('#gender');
      var race = d3.select('#race');

      // Standardize values and construct new URL
      function getNewURL(){

        // Standardize SAT/ACT
        // take larger score and standardize
        if (act.property("value") == 0 && sat.property("value") == 0) {
          admissionstest = 0;
        }
        else if (sat.property("value") != 0 && act.property("value") == 0) {
          admissionstest = (sat.property("value") - means.admissionstest) / stds.admissionstest;
        }
        else if (sat.property("value") == 0 && act.property("value") != 0) {
          admissionstest = (act2sat[act.property("value")] - means.admissionstest) / stds.admissionstest;
        }
        else {
          if (sat.property("value") > act2sat[act.property("value")]) {
            admissionstest = (sat.property("value") - means.admissionstest) / stds.admissionstest;
          }
          else {
            admissionstest = (act2sat[act.property("value")] - means.admissionstest) / stds.admissionstest;
          }
        }

        // Standardize GPA, Average AP, and SAT2
        var gpaValue = (gpa.property("value") - means.GPA) / stds.GPA;
        var apaveValue = (apave.property("value") - means.averageAP) / stds.averageAP;
        var sat2aveValue = (sat2ave.property("value") - means.SATsubject) / stds.SATsubject;

        // Construct New URL
        var result_url = url.replace("{TEST}", admissionstest)
                            .replace("{GPA}", gpaValue)
                            .replace("{AP}", apnum.value)
                            .replace("{APAVE}", apaveValue)
                            .replace("{SAT2}", sat2aveValue)
                            .replace("{HS}", hs.value)
                            .replace("{GENDER}", gender.value);
                            //.replace("{RACE}", race.value);
        return result_url;
      }

      // Make Webservice Requests
      function makeRequest() {
        newurl = getNewURL();
        document.getElementById("result").innerHTML = "calling to webservice...<br>"+newurl;
        xhr.open("GET", newurl);
        xhr.send();
      }

      // Add Event Listeners to sliders

      // sat.on("change", makeRequest());
      // act.on("change", makeRequest());
      // gpa.on("change", makeRequest());
      // apave.on("change", makeRequest());
      // apnum.on("change", makeRequest());
      // sat2ave.on("change", makeRequest());



      // sat.addEventListener("change", makeRequest(), false);
      // act.addEventListener("change", makeRequest(), false);
      // gpa.addEventListener("change", makeRequest(), false);
      // apave.addEventListener("change", makeRequest(), false);
      // apnum.addEventListener("change", makeRequest(), false);
      // sat2ave.addEventListener("change", makeRequest(), false);
      // hs.addEventListener("change", makeRequest(), false);
      // gender.addEventListener("change", makeRequest(), false);

      // Fetch JSON
      xhr.onreadystatechange=function(){
        if (this.readyState==4 && this.status==200){
          var predictions = JSON.parse(this.response).preds;
          var str = "";
          for (var i = 0; i < predictions.length; i++) {
            str += predictions[i].college + ": " + predictions[i].prob + "<br>\n";
          }
          document.getElementById("result").innerHTML = str;
          return predictions;
        } else if (this.readyState != 1) {
          document.getElementById("result").innerHTML =
            "Ready state: "+this.readyState+" Status: "+this.status;
        }
      }
    });
  });
}
