var DrillDownController = function(_parentElement) {
  this.parentElement = d3.select('#'+_parentElement);
  this.data = p171.data.featureImportance.sort(sortFeatureImportanceData);
  this.factors = {};
  for (var i=0;i<this.data.length;i++) this.factors[this.data[i].name] = {};
  this.initVis();
};

// Create initial vizualization
DrillDownController.prototype.initVis = function() {
  var DD = this;

  // Create dimensions for the visualization based on current window size
  DD.margin = {top: 60, right: 315, bottom: 60, left: 220};
  DD.width = window.innerWidth - DD.margin.left - DD.margin.right;
  DD.height = 40 - DD.margin.top - DD.margin.bottom;

  // Create the X and Y scale
  DD.xScale = d3.scale.linear()
    .range([0, DD.width]).nice()
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
      .attr("height", DD.Height)
      .attr("transform", "translate(0,"+DD.width+")")
      .append("g");
    
    console.log(factor.name);
    // Create bars and labels for the overview visualization
    DD.factors[factor.name].vis = DD.createBarsAndLabels(factor, barSVG);

    // Create more-details element to hold text and charts for each factor
    var moreDetails = container.append("div")
      .attr({
        class: "more-details row"
      })

    moreDetails.append("div").attr({class: "col-md-3 text"})
    moreDetails.append("div").attr({class: "col-md-7 chart"})

    DD.factors[factor.name].moreDetails = moreDetails;
  }

};

// Create bars and labels for the overview visualization
DrillDownController.prototype.createBarsAndLabels = function(factor, svg) {
  var DD = this;

  // Define characteristics of each bar
  var barHeight = 35,
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
        x: 300,
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
        x: 100,
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
        x: 100,
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
      var pos = 300+DD.xScale(feature.effect);
      return pos > 350 ? pos - 55: 300;
    });

  // Create interaction behaviors for vis elements
  barGroup
    .on("click", function(d) {
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

// Add interaction behavior for bars and labels
// Create bars for graph


// Create more-details section for a given factor
DrillDownController.prototype.createMoreDetails = function(element) {
  var DD = this;

  var selectedFactor = d3.select(element);

  var factorID = selectedFactor.property("id")
  console.log('factor ' +factorID)
  console.log(DD.factors)
  var factor = DD.factors[factorID]
  console.log(factorID)

  var chartElement = factor.moreDetails.select(".chart");

  if (chartElement.html() == "") {
    // Create initial visualization
    factor.vis.subPlot = new Histogram(chartElement);
    
    // Add text to describe the data
    factor.moreDetails.select(".text")
      .html(p171.text.drillDown.overall_factors[1])

    // Create buttons to change the visualization 

  }

}


// Close more-details section 

// Open more-details section

// Remove chart from element







