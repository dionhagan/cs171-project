var FeatureImportanceVis = function(_parentElement) {
  this.parentElement = d3.select("#" + _parentElement);
  this.text = p171.text.drillDown;
  this.initVis();  
}


FeatureImportanceVis.prototype.initVis = function() {
  var vis = this;

  // Create dimensions for the visualization based on current window size
  vis.margin = {top: 60, right: 120, bottom: 60, left: 220};
  vis.width = window.innerWidth - vis.margin.left - vis.margin.right;
  vis.height = window.innerHeight - vis.margin.top - vis.margin.bottom;

  // SVG drawing area
  vis.svg = vis.parentElement.append("svg")
      .attr("width", window.innerWidth)
      .attr("height", window.innerHeight)
    .append("g")
      .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  // Add title to visualization
  vis.title = vis.svg.append("text")
    .attr({
      class:"vis-title",
      x: -145,
      y: -25 
    })
    .text(vis.text.overall_factors[0]);

  // Create the initial visualization 
  vis.createOverviewVis();

};

FeatureImportanceVis.prototype.createOverviewVis = function() {
  var visObject = this;

  // Defind the current visualization and its namespace
  visObject.currentVis = "overview";
  visObject[visObject.currentVis] = {};
  var vis = visObject[visObject.currentVis];

  // Define the data for the visualization
  vis.data = p171.data.featureImportance.sort(sortFeatureImportanceData);

  // Create the X and Y scale
  vis.x = d3.scale.linear()
    .range([0, visObject.width]).nice()
    .domain([
      d3.min(vis.data, function(feature) { return feature.effect; }),
      d3.max(vis.data, function(feature) { return feature.effect; })
    ]);

  vis.y = d3.scale.linear()
    .range([visObject.height, 0]).nice()
    .domain([0, vis.data.length]);


  // Create bars for graph
  var barHeight = 35;
  var barYPos = function(d, i){ return (barHeight*i)+(i*2); };
  
  var barClass = visObject.currentVis+"-bar";

  vis.barGroups = visObject.svg.selectAll("."+barClass)
    .data(vis.data)
  
  vis.barGroups
    .enter().append("g")
    .attr("class",barClass);
      
  vis.bars = vis.barGroups.append("rect")
      .attr({
        x: 0,
        y: barYPos,
        height: barHeight,
        width: function(feature){ return 0 ;},
        fill: "lightsteelblue",
      })

  // Creat text elements to show the bar values 
  vis.barGroups.append("text")
    .attr({
      x: function(d){ return 0 },
      y: function(d,i){ return barYPos(d,i) + 20; },
      fill: 'steelblue',
      class: "effect-values"
    })
    .text(function(d){ return Math.round(d.effect*10000)/100+"%"; })

  // Create labels for each factor
  vis.labels = vis.barGroups.append("g")
    .attr("class","bar-label");

  vis.labels
    .append("rect")
      .attr({
        x: -200,
        y: barYPos,
        height: barHeight,
        width: 200,
        fill: 'steelblue',
        id: function(d) { return d.name; }
      })
      .on("click", function(d) { console.log(d)})

  vis.labels
    .append("text")
      .attr({
        fill:'white',
        x:-200,
        y: function(d,i) { return (barHeight*i)+(i*2)+20; }
      })
      .text(function(d){ return d.name; });


  // Create transitions for vis elements 
  vis.bars
    .transition().duration(1500)
    .attr("width", function(feature){ return vis.x(feature.effect); })

  vis.barGroups.select(".effect-values")
    .transition().duration(1500)
    .attr("x", function(feature) { 
      var pos = vis.x(feature.effect);
      return vis.x(feature.effect) > 50 ? pos - 55: 0;
    });

  // Create interaction behaviors for vis elements
  vis.barGroups
    .on("click", function(d) {
      var selectedFactor = d3.select(this)
        .attr({
          class:"selected-factor"
        })
/*
      selectedFactor.select("g.bar-label")
        .transition().duration(1000)
        .attr({
          transform: function(d,i) {
            var yPos = -d3.select(this).select("rect").attr('y');
            return "translate(0,"+(yPos-50)+")";
          }
        })

      selectedFactor.select("rect")
        .transition().duration(1000)
        .attr({
          x: visObject.width,
          width: 0
        })
        .remove()

      selectedFactor.select("text")
        .remove();

      var otherBarGroups = visObject.svg.selectAll('g.overview-bar')
      
      otherBarGroups.select("text")
        .remove();

      otherBarGroups.select("rect")
        .transition().duration(750)
        .attr({ width:0 })
        .remove();

     otherBarGroups.select("g.bar-label rect")
        .transition().duration(750)
        .attr({width:0, x:0})
        .remove();
*/
      // Adjust the height of the canvas
      visObject.height += 500;
      visObject.svg
        .attr({
          height: visObject.height,
        });


    });

}

FeatureImportanceVis.prototype.switchVis = function(first_argument) {
  var vis = this;


};

function sortFeatureImportanceData(a,b) {
  if (a.effect > b.effect)
    return -1;
  else if (a.effect < b.effect)
    return 1;
  else 
    return 0;
}