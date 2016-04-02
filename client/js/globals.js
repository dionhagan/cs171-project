// globals

var p171 = {}; // global namespace

p171.margin          = {top: 60, right: 20, bottom: 60, left: 60};
p171.padding         = {top: 20, right: 0, bottom: 100, left: 40};
p171.aspect         = 1.1; // charts will be 10% taller than wide

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

  var mainCategories = [
    "AP",
    "averageAP",
    "GPA",
    "GPA_w",
    "MinorityGender",
    "MinorityRace",
    "SATsubject",
    "acceptStatus",
    "admissionstest",
    "alumni"
  ];
  
  p171.data.mainCategories = mainCategories;

  p171.data.colleges['All'] = {};

  for (var sampleIndex=0; sampleIndex<appData.length; sampleIndex++) {
    var sample = appData[sampleIndex];
    var college = sample.collegeID;

    for (var categoryIndex=0; categoryIndex<mainCategories.length; categoryIndex++) {
      var category = mainCategories[categoryIndex];
      var collegeInfo = p171.data.colleges[college];
      var value = +sample[category];

      if (!(category in collegeInfo)) p171.data.colleges[college][category] = [];

      if (!(category in p171.data.colleges['All'])) p171.data.colleges['All'][category] = [];

      if (!isNaN(value)) {
        p171.data.colleges[college][category].push(value);
        p171.data.colleges['All'][category].push(value);
      }
    }
  }

  createVis();
}

function createVis() {
  //p171.hist = new Histogram("histograms");
  p171.scatter = new Scatter("scatter");
}
