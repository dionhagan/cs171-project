var Histogram = function(_parentElement, _category) {
  this.parentElement = _parentElement;
  this.data = p171.data.raw;
  for (label in p171.data.labels) {
      if (p171.data.labels[label] == _category) this.category = label
    }
  this.createElements();
  this.addSelectors();
  this.wrangleData();
  this.initVis();
}

Histogram.prototype.initVis = function () {
  var vis = this;

  vis.margin = { top: 40, right: 60, bottom: 60, left: 5 };

  vis.width = 800 - vis.margin.left - vis.margin.right,
  vis.height = 600 - vis.margin.top - vis.margin.bottom;

  // SVG drawing area
  vis.svg = vis.plotElement.append("svg")
      .attr("width", vis.width + vis.margin.left + vis.margin.right)
      .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
      .attr("class","histogram")
    .append("g")
      .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  vis.bins = 10;
  
  vis.x = d3.scale.linear()
    .range([0, vis.width]);

  vis.y = d3.scale.linear()
    .range([vis.height, 0]);

  vis.xAxis = vis.svg.append("g")
    .attr({
      class: "x-axis axis",
      transform: "translate(0,"+vis.height+")"
    })

  vis.updateVis();
}

Histogram.prototype.updateVis = function() {
  var vis = this;
  
  vis.wrangleData();

  console.log(vis.displayData)

  var min = Math.min(...vis.displayData);
  var max = Math.max(...vis.displayData);

  vis.x
    .domain([min, max])

  vis.histogramData = d3.layout.histogram()
    .bins(vis.x.ticks(vis.bins))
    (vis.displayData);

  vis.y
    .domain([0, d3.max(vis.histogramData, function(d){ return d.y; })]);

  var xAxis = d3.svg.axis()
    .scale(vis.x)
    .orient("bottom");
  
  vis.bar = vis.svg.selectAll(".bar")
    .data(vis.histogramData)

  var barWidth = (vis.width / vis.histogramData.length)

  vis.bar
    .enter().append("rect")
  
  vis.bar
    .transition().duration(750)
      .attr({
        class: "bar",
        y: function(d) { return vis.y(d.y); },
        x: function(d,i){ return i*barWidth; },
        width: barWidth,
        height: function(d) { return vis.height - vis.y(d.y); },
      });

  vis.bar.exit().remove();  

  vis.labels = vis.svg.selectAll(".labels")
    .data(vis.histogramData)

  vis.labels
    .enter().append("text")
  
  vis.labels
    .transition().duration(750)
    .attr({
      class:"labels",
      y: function(d) { return vis.y(d.y); },
      x: function(d,i){ return (i*barWidth) + (0.4*barWidth); },
      fill: "lightgreen"
    })
    .text(function(d){
      return d.y;
    })

  vis.labels.exit().remove();

  vis.xAxis
    .transition().duration(300)
    .call(xAxis);
}

Histogram.prototype.wrangleData = function() {
  var vis = this;

  var filteredData = vis.data.filter(function(d){

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

    return collegeFilter && factorFilter && d.acceptStatus == 1;
  });


  
  vis.displayData = filteredData.map(function(d) {
    return d[vis.category];
  });

}

Histogram.prototype.addSelectors = function() {
  var vis = this;

  var options = p171.data.mainFactors;


  var selectorLabel = vis.filtersElement.insert("div", ".filter-choices")
    .text("Select a college: ")

  vis.collegeSelector = selectorLabel.append("select")
    .attr({
      id:"college-selector"
    })
    .on('change', function(d) {
      vis.updateVis();
    });

  var colleges = Object.keys(p171.data.colleges);

  for (var collegeIndex=0; collegeIndex<colleges.length; collegeIndex++) {
    var college = colleges[collegeIndex];
    var option = vis.collegeSelector.append("option")
      .attr({
        value:college
      })
      .text(college);
  }

  vis.collegeSelector
    .property('value','All');
}

Histogram.prototype.createElements = function() {
  var vis = this;

  // Create plot element
  vis.plotElement = this.parentElement.append("div")
    .attr({ class: "subplot"});

  // Create filter tabs
  vis.filtersElement = this.parentElement.append("div")
    .attr({class:"filters"})

  var filterChoices = vis.filtersElement.append("div")
    .attr({class:"filter-choices"});

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
    .text("Application");

  vis.filtersElement.append("div")
    .attr({class:"filters-main"});

}

Histogram.prototype.showFilters = showFilters;