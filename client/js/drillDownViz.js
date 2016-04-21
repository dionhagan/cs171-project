// Add drilldown text to elements
function addDrillDownText() {
  for (section in p171.text.drillDown) {
    var title = p171.text.drillDown[section][0];
    var content = p171.text.drillDown[section][1];
    var sectionElement = d3.select('#'+section)

    sectionElement.append("h2")
      .text(title)

    sectionElement.append("div")
      .html(content)
  }
}
  

var DrillDownController = function(_parentElement) {
  this.parentElement = d3.select('#'+_parentElement);
  this.data = p171.data.factorImportance.sort(sortFeatureImportanceData);
  this.factors = {};
  for (var i=0;i<this.data.length;i++) this.factors[this.data[i].name] = {};
  this.initFilters();
  this.initVis();
};

DrillDownController.prototype.initFilters = function() {
  var DD = this;

  DD.filters = {}; 

  for (collegeName in p171.data.colleges) {
    if (collegeName !== "Harvard") DD.filters[collegeName] = false;
  } 

  // Get factors that need to be filtered
  var factorsToFilter = Object.keys(p171.data.nomFactors);

  // Create a form group for each application factor 
  for (var factorIndex=0; factorIndex<factorsToFilter.length; factorIndex++) {
    var factor = factorsToFilter[factorIndex];

    DD.filters[factor] = {}
    
    for (var subFactorIndex=0; subFactorIndex<2; subFactorIndex++) {
        var subFactor = p171.data.nomFactors[factor][subFactorIndex];
        DD.filters[factor][subFactor] = true;
    }
  }
};

// Create initial vizualization
DrillDownController.prototype.initVis = function() {
  var DD = this;

  // Create dimensions for the visualization based on current window size
  DD.margin = {top: 60, right: 20, bottom: 60, left: 20};
  DD.width = window.innerWidth - DD.margin.left - DD.margin.right;
  DD.height = window.innerHeight - DD.margin.top - DD.margin.bottom;

  // Create the X and Y scale
  DD.xScale = d3.scale.linear()
    .range([0, DD.width - 400]).nice()
    .domain([
      d3.min(DD.data, function(f) { return f.effect; }),
      d3.max(DD.data, function(f) { return f.effect; })
    ]);

  DD.yScale = d3.scale.linear()
    .range([DD.height, 0]).nice()
    .domain([0, DD.data.length]);

  for (var factorIndex=0;factorIndex<DD.data.length;factorIndex++) {
    var factor = DD.data[factorIndex];
    
    // Create container element for each factor 
    var container = DD.parentElement.append("div")
      .attr({
        class: "factor-details",
        id: factor.name.replace(" ","_")
      })

    // Create SVGs for each bar in the visual
    var barSVG = container.append("svg")
      .attr({
        class: "bar-svg"
      })
      .attr("width", DD.width + DD.margin.right - 5)
      .attr("height", DD.height)
      .attr("transform", "translate(0,"+DD.width+")")
      .append("g");
    
    // Create bars and labels for the overview visualization
    DD.factors[factor.name].vis = DD.createBarsAndLabels(factor, barSVG);

    // Create more-details element to hold text and charts for each factor
    var moreDetails = container.append("div")
      .attr({
        class: "more-details row"
      })

    moreDetails.append("div").attr({class: "text"})
    moreDetails.append("div").attr({class: "chart"})
    moreDetails.append("div").attr({class: "filters"})

    DD.factors[factor.name].moreDetails = moreDetails;
  }

};

// Create bars and labels for the overview visualization
DrillDownController.prototype.createBarsAndLabels = function(factor, svg) {
  var DD = this;

  // Define characteristics of each bar
  var barHeight = DD.height / DD.data.length
      barYPos = function(d, i){ return (barHeight*i)+(i*2); },
      barClass = "factor-bar";

  // Create bars for vis
  var barGroup = svg.selectAll("."+barClass)
    .data([factor]);
  
  barGroup
    .enter().append("g")
    .attr({
      class: barClass,
      id: factor.name
    });
      
  var bars = barGroup.append("rect")
      .attr({
        x: 200,
        y: 0,
        height: barHeight,
        width: function(feature){ return 0 ;},
        fill: "lightsteelblue",
      });
  
  // Creat text elements to show the bar values 
  var valueLabel = barGroup.append("text")
    .attr({
      x: 0,
      y: 20,
      fill: 'steelblue',
      class: "effect-values"
    })
    .text(function(d){ return Math.round(d.effect*10000)/100+"%"; })

  // Create labels for each factor
  var labels = barGroup.append("g")
    .attr("class","bar-label");

  labels
    .append("rect")
      .attr({
        x: 0,
        y: 0,
        height: barHeight,
        width: 200,
        fill: 'steelblue',
        id: function(d) { return d.name; }
      })

  labels
    .append("text")
      .attr({
        fill:'white',
        x: 0,
        y: 20
      })
      .text(function(d){ return d.name; });

  // Create transitions for vis elements 
  bars
    .transition().duration(1500)
    .attr("width", function(feature){ return DD.xScale(feature.effect); })

  barGroup.select(".effect-values")
    .transition().duration(1500)
    .attr("x", function(feature) { 
      var pos = 200+DD.xScale(feature.effect);
      return pos > 250 ? pos - 55: 200;
    });

  // Create interaction behaviors for vis elements
  barGroup
    .on("click", function(d) {
      for (factor in DD.factors) {
        var moreDetailsSection = DD.factors[factor].moreDetails
        moreDetailsSection.select(".text")
          .text("")
        moreDetailsSection.select(".chart")
          .html("")
      }
      DD.createMoreDetails(this);
    });

  return {
    svg: svg,
    barGroup: barGroup,
    bars: bars,
    labels: labels,
    valueLable: valueLabel
  };
};


// Create more-details section for a given factor
DrillDownController.prototype.createMoreDetails = function(element) {
  var DD = this;

  var selectedFactor = d3.select(element);

  var factorID = selectedFactor.property("id"),
      factor = DD.factors[factorID];

  var chartElement = factor.moreDetails.select(".chart"),
      textElement = factor.moreDetails.select(".text");

  var charts = {}
  for (label in p171.data.labels) { 
    if (p171.data.labels[label] == factorID) {
      charts = drillDownCharts[label];
    }
  }

  if (chartElement.html() == "") {
    // Create initial visualization
    factor.vis.subPlot = new charts[Object.keys(charts)[0]](chartElement, factorID);
    
    // Add text to describe the data
    textElement
      .html(p171.text.drillDown.overall_factors[1])

    if (Object.keys(charts).length > 1) {
      // Create buttons to change the visualization
      for (chartType in charts) {
        textElement.append("div")
          .attr({
            class:"select-chart-type",
            id:chartType
          })
          .text(chartType)
          .on("click", function(d) {
            var chartID = d3.select(this).property("id");
            chartElement.html("");
            factor.vis.subPlot = new charts[chartID](chartElement, factorID)
          })
      }
    }
  }
}



DrillDownController.prototype.updateSubPlots = function() {
  var DD = this; 

  for (factorID in DD.factors) {
    var factorVis = DD.factors[factorID].vis;
    if ("subPlot" in factorVis) factorVis.subPlot.updateVis();
  }
}


var drillDownCharts = {
    "admissionstest": {
      Distribution: Histogram,
      Scatter: Scatter
    },
    "acceptrate": {},
    "GPA": {
      Distribution: Histogram,
      Scatter: Scatter
    },
    "averageAP": {
      Distribution: Histogram,
      Scatter: Scatter
    },
    "size": {},
    "AP": {
      Distribution: Histogram
    },
    "SATsubject": {
      Distribution: Histogram
    },
    "female": {
      Effect: EffectGraph
    },
    "schooltype":  {
      Distirbution: Histogram
    },
    "MinorityRace": {
      Effect: EffectGraph
    },
    "earlyAppl": {
      Effect: EffectGraph
    },
    "outofstate": {
    },
    "public": {},
    "alumni": {},
    "international": {
      Effect: EffectGraph
    },
    "sports": {
      Effect: EffectGraph
    }
}


