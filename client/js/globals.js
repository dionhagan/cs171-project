// globals

var p171 = {}; // global namespace

p171.margin          = {top: 20, right: 0, bottom: 20, left: 20};
p171.padding         = {top: 20, right: 0, bottom: 100, left: 40};
p171.aspect         = 1.1; // charts will be 10% taller than wide

// Store data set globally
queue()
    .defer(d3.csv, "data/college_data.csv")
    .defer(d3.csv, "data/collegelist.csv")
    .await(storeData);

function storeData(err, collegeData, collegeList) {
  p171.data = collegeData;
  p171.colleges = {};
  for (var i=0; i<collegeList.length; i++) {
    var college = collegeList[i];
    p171.colleges[college.name] = college;
  }
  // TODO: populate drop down list of colleges from this data (currently hard coded)

}
