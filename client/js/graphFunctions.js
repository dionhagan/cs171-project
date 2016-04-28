function createElements() {
  var vis = this;

  // Create plot element
  vis.plotElement = this.parentElement.append("div")
    .attr({ class: "subplot"});

  // Create filter tabs
  /*vis.filtersElement = this.parentElement.append("div")
    .attr({
      class:"filters"
    })

  closeFilterElement(vis) */
}

function closeFilterElement(vis) {

  vis.filtersElement.html("")

  var tab = vis.filtersElement.append("div")
    .attr({class:"open-filters"})
    .on("click", function(d) {
      vis.showFilters("college");
      d3.select(this)
        .remove()
    })

  var text = "FILTER";

  for(var i=0;i<text.length;i++) {
      tab.append("span")
        .style("text-align","center")
        .text(text[i])

      tab.append("br")
  }
}

function applyFilter() {
  var vis = this; 

  vis.displayData = vis.data.filter(function(d){

    var collegeFilter = p171.DD.filters[d.collegeID],
        factorFilter = true;

    // Filter out application types
    for (factor in p171.DD.filters) {
      if (typeof p171.DD.filters[factor] == "object") {

        for (var subFactorIndex=0; subFactorIndex<2; subFactorIndex++) {

          var subFactor = p171.data.nomFactors[factor][subFactorIndex];
          var isChecked = p171.DD.filters[factor][subFactor];

          if (!isChecked) {
            if (subFactorIndex==0 && d[factor]==1) {
              factorFilter = false
            } else if (subFactorIndex==1 && d[factor]==-1) {
              factorFilter = false;
            }
          }
        }
      } 
    }

    return collegeFilter && factorFilter;
  });
}

function filterApplicants() {
  var vis = this; 

  if (p171.DD.filters["All"]) {
    for (var college in p171.data.colleges) p171.DD.filters[college] = true;
    vis.collegeFilters.selectAll('rect').attr("opacity",1)
  } 

  vis.currentColleges = [];
  for (var college in p171.DD.filters) {
    if (p171.DD.filters[college]) vis.currentColleges.push(college);
  }

  vis.displayData = vis.data.filter(function(applicant){

    var d = applicant.app

    var collegeFilter = false,
        factorFilter = true;

    // Filter out application types
    for (factor in p171.DD.filters) {
      if (typeof p171.DD.filters[factor] == "object") {

        for (var subFactorIndex=0; subFactorIndex<2; subFactorIndex++) {

          var subFactor = p171.data.nomFactors[factor][subFactorIndex];
          var isChecked = p171.DD.filters[factor][subFactor];

          if (!isChecked) {
            if (subFactorIndex==0 && d[factor]==1) {
              factorFilter = false
            } else if (subFactorIndex==1 && d[factor]==-1) {
              factorFilter = false;
            }
          }
        }
      } 
    }

    // Filter out colleges 
    for (var college in applicant.colleges) {
      if (p171.DD.filters[college]) collegeFilter = true;
    }

    return collegeFilter && factorFilter;
  });
}

function addMainSVG() {
  var vis = this;
  // SVG drawing area
  vis.svg = vis.plotElement.append("svg")
      .attr("width", vis.width + vis.margin.left + vis.margin.right)
      .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .append("g")
      .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

}

function addAxes(xScale, yScale) {
  var vis = this;

  vis.xScale = xScale()
    .range([0, vis.width]);

  vis.yScale = yScale()
    .range([vis.height, 0]);

  vis.xAxisGroup = vis.svg.append("g")
      .attr({
        class: "x-axis axis",
        transform: "translate(0,"+vis.height+")"
      });


  vis.yAxisGroup = vis.svg.append("g")
      .attr({ class: "y-axis axis" })

}

function updateAxes(xDomain, yDomain) {
  var vis = this;

  vis.xScale
    .domain(xDomain)

  vis.yScale
    .domain(yDomain)

  vis.xAxis = d3.svg.axis()
    .scale(vis.xScale)
    .tickSize(0)
    .orient("bottom");

  vis.yAxis = d3.svg.axis()
    .scale(vis.yScale)
    .tickSize(0)
    .orient("left");

  vis.xAxisGroup
    .transition().duration(300)
    .call(vis.xAxis);

  vis.yAxisGroup
    .transition().duration(300)
    .call(vis.yAxis);
}

function addFiltersElement(vis) {
  var filterChoices = vis.filtersElement.append("div")
      .attr({class:"filter-choices"});

  vis.filtersElement.append("div")
    .attr({class:"filters-main"});

  filterChoices.append("div")
    .attr({class:"college-filters"})
    .on("click", function() {
      vis.showFilters("college")
    })
    .text("Colleges");

  filterChoices.append("div") 
    .attr({class:"app-filters"})
    .on("click", function() {
      vis.showFilters("application")
    })
    .text("Applicants");

  filterChoices.append("div") 
    .attr({class:"close-filters"})
    .on("click", function() {
      closeFilterElement(vis)
    })
    .text("x");
}


function showFilters(filterType) {

  var vis = this;

  vis.filtersElement.html("")

  addFiltersElement(vis)
  
  // Create title for filter section
  var filtersElement = vis.filtersElement.select(".filters-main")

  // Create form element to hold checkboxes
  var filters = filtersElement.append("form")
    .attr({
      id: "filters",
      class: "form-horizontal",
      role: "form"
    })

  // Create object in vis to store filter options
  vis.filters = {};

  // Get factors that need to be filtered
  if (filterType == "college") {
    // Create a form group for each college 
    for (collegeName in p171.data.colleges) {

      var formGroup = filters.append("div")
        .attr("class","form-group");

      formGroup.append("label")
        .attr({
          class: "control-label col-sm-1",
          for: collegeName
        })
        .text(collegeName);

      var checkBox = formGroup.append("div")
          .append("input")
            .attr({
              class:"form-control",
              id: collegeName+"-filter",
              value: collegeName,
              type: "checkbox",
            })
            .on("change", function() {
              var checkBox = this;
              var college = checkBox.value;
              p171.DD.filters[college] = p171.DD.filters[college] ? false : true;
              p171.DD.updateSubPlots();
            });

      // check item if item has not been filtered out
      if (p171.DD.filters[collegeName]) checkBox.attr("checked","");

    }
  } else {

    // Get factors that need to be filtered
    var factorsToFilter = Object.keys(p171.data.nomFactors);

    // Create a form group for each application factor 
    for (var factorIndex=0; factorIndex<factorsToFilter.length; factorIndex++) {
      var factor = factorsToFilter[factorIndex];

      filters.append("div")
        .attr("class","filter-label")
        .text(p171.data.labels[factor])
      
      for (var subFactorIndex=0; subFactorIndex<2; subFactorIndex++) {
        var subFactor = p171.data.nomFactors[factor][subFactorIndex];


        // Append form group
        var formGroup = filters.append("div")
          .attr("class","form-group");

        formGroup.append("label")
          .attr({
            class: "control-label col-sm-1",
            for: subFactor
          })
          .text(subFactor);

        var checkBox = formGroup.append("div")
            .append("input")
              .attr({
                class:"form-control",
                id: subFactor.replace(" ","_"),
                value: factor,
                type: "checkbox"
              })
              .on("change", function() {
                var checkBox = this;
                var factor = checkBox.value;
                var subFactor = checkBox.id.replace("_"," ");
                p171.DD.filters[factor][subFactor] = p171.DD.filters[factor][subFactor] ? false: true;
                p171.DD.updateSubPlots();
              });

        if (p171.DD.filters[factor][subFactor]) checkBox.attr("checked","")
      }
    }
  }
}