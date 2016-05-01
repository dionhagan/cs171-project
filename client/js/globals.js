// globals
"use strict";

var p171 = {}; // global namespace

p171.margin          = {top: 60, right: 20, bottom: 60, left: 60};
p171.padding         = {top: 20, right: 0, bottom: 100, left: 40};
p171.aspect         = 1.1; // charts will be 10% taller than wide

// Store user data from cookies
p171.user = {};

var convertFormVar = {
  sat:"admissionstest",
  gpa:"GPA",
  apnum:"AP",
  apave: "averageAP",
  sat2ave: "SATsubject",
  hs: "schooltype",
  gender: "Female",
  race: "MinorityRace",
  college: "collegeID"
}

if ("user" in localStorage) {
  var userInput = localStorage.user.split(",")
  for (var i=0; i<userInput.length; i++) {
    var factor = userInput[i].split(":")[0];
    var value = userInput[i].split(":")[1];
    p171.user[convertFormVar[factor]] = !isNaN(value) ? +value : value;
  }
}

// Create an object for website text
p171.text = {};

// Store data set globally
p171.data = {};

// Normalization values
p171.normalize = {};

queue()
    .defer(d3.csv, "data/collegelist.csv")
    .defer(d3.csv, "data/collegedata_unnormalized.csv")
    .defer(d3.csv, "data/collegedata_normalized.csv")
    .defer(d3.json, "data/feature_effect.json")
    .defer(d3.json, "data/factors.json")
    .defer(d3.json, "text/drilldowntext.json")
    .defer(d3.csv,"data/normalize_means.csv")
    .defer(d3.csv,"data/normalize_stds.csv")
    .await(storeData)

function storeData(err, collegeList, appData, appDataNorm, factorImportance, factorEffect, drillDownText,normalizeMeans, normalizeStds) {
  // Get text for drill down page
  p171.text.drillDown = drillDownText;
  addDrillDownText();

  // Store data from csv files
  p171.data.normalized = appDataNorm;
  p171.data.raw = appData;
  p171.data.colleges = {};
  p171.data.factorImportance = factorImportance;
  p171.data.factorEffect = factorEffect;

  // Collect data for each college
  for (var collegeIndex=0; collegeIndex<collegeList.length; collegeIndex++) {
    var collegeInfo = collegeList[collegeIndex];
    collegeInfo.ivy = (collegeList[collegeIndex].ivy == "1");
    collegeInfo.region = parseInt(collegeList[collegeIndex].region) || 0;
    p171.data.colleges[collegeInfo.name] = collegeInfo;
  }

  var quantFactors = [
    "AP",
    "averageAP",
    "GPA",
    "GPA_w",
    "SATsubject",
    "admissionstest",
  ];

  var nomFactors = {
    "sports": ["Played Sports", "Didn't Play Sports"],
    "schooltype": ["Public", "Private"],
    "outofstate": ["Out of State", "Local"],
    "international": ["International","Domestic"],
    "female": ["Female", "Male"],
    "earlyAppl": ["Applied Early", "Didn't Apply Early"],
    "alumni": ["Has Legacy", "No Legacy"],
    "MinorityRace": ["Is Racial Minority","Isn't Racial Minority"]
  };

  p171.data.labels = {
    "admissionstest": "ACT/SAT score",
    "acceptrate": "College acceptance rate",
    "GPA": "GPA",
    "GPA_w": "Weighted GPA",
    "averageAP": "Average AP score",
    "size": "College size",
    "AP": "# AP exams taken",
    "SATsubject": "# SAT subject tests taken",
    "female": "Gender / Female",
    "schooltype": "Private High School",
    "MinorityRace": "Underrepresented Minority",
    "earlyAppl": "Early Application",
    "outofstate": "Out of State",
    "public": "Public College",
    "alumni": "Legacy",
    "international": "International Student",
    "sports": "Varsity Sports"
    }

  p171.data.quantFactors = quantFactors;
  p171.data.nomFactors = nomFactors;
  p171.data.mainFactors = quantFactors.concat(Object.keys(nomFactors));

  p171.data.colleges['All'] = {};

  for (var sampleIndex=0; sampleIndex<appData.length; sampleIndex++) {
    var sample = appData[sampleIndex];
    var college = sample.collegeID;

    for (var factorIndex=0; factorIndex<p171.data.mainFactors.length; factorIndex++) {

      var factor = p171.data.mainFactors[factorIndex];
      var collegeInfo = p171.data.colleges[college];
      var value = +sample[factor];
      appData[sampleIndex][factor] = value;
      if (!(factor in collegeInfo)) p171.data.colleges[college][factor] = [];

      if (!(factor in p171.data.colleges['All'])) p171.data.colleges['All'][factor] = [];

      if (!isNaN(value)) {
        p171.data.colleges[college][factor].push(value);
        p171.data.colleges['All'][factor].push(value);
      }
    }
  }

  var applicants = {};

  p171.data.raw.forEach(function(d) {
    if (d.studentID in applicants) {
      applicants[d.studentID].app = d
      applicants[d.studentID].colleges[d.collegeID] = {}
      applicants[d.studentID].colleges[d.collegeID].accepted = d.acceptStatus
      applicants[d.studentID].colleges[d.collegeID].appliedEarly = d.earlyAppl
    } else {
      applicants[d.studentID] = {}
      applicants[d.studentID].app = {} 
      applicants[d.studentID].colleges = {}
    }
  })

  p171.data.applicants = []
  for (var a in applicants) {
    p171.data.applicants.push(applicants[a])
  }

  p171.normalize.means = normalizeMeans[0];
  p171.normalize.stds  = normalizeStds[0];

  createVis();
}

function createVis() {
  //p171.featureImportanceVis = new FeatureImportanceVis("feature-importance-vis");
  //p171.hist = new Histogram("distribution");
  //p171.scatter = new Scatter("scatter-plot");

  // Determine which visualization to display based on the page
  if (window.location.pathname.indexOf("howitworks") >= 0) {
    p171.DD = new DrillDownController("feature-importance-vis");
    p171.DD.heatmap = new Heatmap("college_breakdown");
    p171.DD.scatter = new Scatter("comparison");

  } else {
    predictRandom();
    p171.lineChart = new InteractiveVis('chart-area');
    //p171.innovation3d = new Innovation3d('three-area');
  }
}
