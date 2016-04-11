"use strict";

function predict(formData) {

  // TODO: call webservice or JavaScript Random Forest

  //console.log(formData);

  // base url for webservice request src
  var BASE_URL = "http://ws.chanceme.info/predict?"

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

      // standardize values
      formData.apave = (formData.apave - +means.averageAP) / +stds.averageAP;
      formData.gpa = (formData.gpa - +means.GPA) / +stds.GPA;
      formData.sat2ave = (formData.sat2ave - +means.SATsubject) / +stds.SATsubject;

      // calculate standard admissions test score
      var admissionstest;

      // take largest score and standardize
      if (formData.act == 0 && formData.sat == 0) {
        admissionstest = 0;
      }
      else if (formData.act != 0 && formData.sat == 0) {
        admissionstest = (formData.sat - means.admissionstest) / stds.admissionstest;
      }
      else if (formData.act == 0 && formData.sat != 0) {
        admissionstest = (act2sat[formData.act] - means.admissionstest) / stds.admissionstest;
      }
      else {
        if (formData.sat > act2sat[formData.act]) {
          admissionstest = (formData.sat - means.admissionstest) / stds.admissionstest;
        }
        else {
          admissionstest = (act2sat[formData.act] - means.admissionstest) / stds.admissionstest;
        }
      }

      //console.log("formData: ");
      //console.log(formData);

      // build new request url
      var new_src = BASE_URL + 
                    "admissionstest=" + admissionstest + "&" +
                    "AP=" + formData.apnum + "&" +
                    "averageAP=" + formData.apave + "&" +
                    "SATsubject=" + formData.sat2ave + "&" + 
                    "GPA=" + formData.gpa + "&" +
                    "schooltype=" + formData.hs + "&" +
                    "intendedgradyear=2017&" +
                    "female=" + formData.gender + "&" +
                    "MinorityRace=0&" +
                    "international=0&" +
                    "sports=0&" +
                    "earlyAppl=0&" +
                    "alumni=0&" +
                    "outofstate=0&" +
                    "acceptrate=0.151&" +
                    "size=6621&" +
                    "public=0&" +
                    "finAidPct=0&" +
                    "instatePct=0&" +
                    "callback=getJSON";

      //console.log("new_src: ");
      console.log(new_src);

      // update src
      $("#predictions").attr("src", new_src);

    });
  });

  console.log(preds);

  return preds;
}
