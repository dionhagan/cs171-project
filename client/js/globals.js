// globals

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

var cookies = document.cookie.split("; ")
for (var i=0; i<cookies.length; i++) {
  var cname = cookies[i].split("=")[0];
  var value = cookies[i].split("=")[1];
  p171.user[convertFormVar[cname]] = !isNaN(value) ? +value : value;
}

// Store data set globally
p171.data = {}; 

queue()
    .defer(d3.csv, "data/collegelist.csv")
    .defer(d3.csv, "data/collegedata_unnormalized.csv")
    .defer(d3.csv, "data/collegedata_normalized.csv")
    .await(storeData);

function storeData(err, collegeList, appData, appDataNorm, callback) {

  // Store data from csv files
  p171.data.normalized = appDataNorm;
  p171.data.raw = appData;
  p171.data.colleges = {};

  // Collect data for each college 
  for (var collegeIndex=0; collegeIndex<collegeList.length; collegeIndex++) {
    var collegeInfo = collegeList[collegeIndex];
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

  createVis();
}

function createVis() {
  //p171.hist = new Histogram("distribution");
  p171.scatter = new Scatter("scatter-plot");
}


