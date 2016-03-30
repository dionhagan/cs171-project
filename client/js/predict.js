"use strict";

var BASE_URL = "http://ws.chanceme.info/predict?admissionstest=0.976899206&AP=7&averageAP=1.06733864&SATsubject=0.324271565&GPA=-0.187109979&schooltype=0&intendedgradyear=2017&female=1&MinorityRace=0&international=0&sports=0&earlyAppl=0&alumni=0&outofstate=0&acceptrate=0.151&size=6621&public=0&finAidPct=0&instatePct=0&callback=getJSON";

console.log(jsonData);

function predict(formData) {
  // TODO: call webservice or JavaScript Random Forest
  console.log(formData);
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
