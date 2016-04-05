"use strict";

function predict(formData) {

  // TODO: call webservice or JavaScript Random Forest
  console.log(formData);

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

      means = meanData;
      stds = stdData;

      // standardize values
      formData.apave = (formData.apave - means.averageAP) / stds.averageAP;
      formData.gpa = (formData.gpa - means.GPA) / stds.GPA;
      formData.sat2ave = (formData.sat2ave - means.SATsubject) / stds.SATsubject;

      // calculate standard admissions test score
      var admissionstest;

      // take largest score and standardize
      if (formData.act == 0 && formData.sat == 0) {
        admissionstest = 0;
      }
      else if (formData.act != 0 && formData.sat == 0) {
        admissionstest = (formData.sat - means.admissionstest) / std.admissionstest;
      }
      else if (formData.act == 0 && formData.sat != 0) {
        admissionstest = (act2sat[formData.act] - means.admissionstest) / std.admissionstest;
      }
      else {
        if (formData.sat > act2sat[formData.act]) {
          admissionstest = (formData.sat - means.admissionstest) / std.admissionstest;
        }
        else {
          admissionstest = (act2sat[formData.act] - means.admissionstest) / std.admissionstest;
        }
      }

      // update script src url w/ new values

      var new_src = BASE_URL + 

      $('#predictions').attr('src', new_src)

    });
  });

  console.log(preds);

  return preds;
}
