"use strict";

function predict(formData) {
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
