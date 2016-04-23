
// Create heatmap object
var Heatmap = function(_parentElement) {
  this.parentElement = d3.select('#'+_parentElement);
  this.initData(p171.data.factorEffect);
  this.initVis();
}

// Initialize heatmap ==================================
Heatmap.prototype.initVis = function(first_argument) {
  var vis = this; 
  
  vis.createElements();
  vis.createDimensions();
  vis.addMainSVG(); 
  vis.addAxes(d3.scale.ordinal, d3.scale.ordinal);
  vis.xScale.rangeRoundBands([0, vis.width]);
  vis.yScale.rangeRoundBands([vis.height, 0]);
  vis.createCells();
  vis.updateVis();
};

Heatmap.prototype.createElements = createElements;

Heatmap.prototype.createDimensions = function() {
  var vis = this;

  vis.margin = {top:20,right:20,bottom:60,left:60};
  vis.width = 800 - vis.margin.left - vis.margin.right,
  vis.height = 600 - vis.margin.top - vis.margin.bottom;
};

Heatmap.prototype.addMainSVG = addMainSVG;

Heatmap.prototype.addAxes = addAxes;

Heatmap.prototype.createCells = function() {
  var vis = this;

  vis.cells = vis.svg.selectAll(".heat-cell")
    .on("click", function(d) {
      console.log(d);
    })
}

Heatmap.prototype.showFilters = showFilters;

// Update heatmap ==================================
Heatmap.prototype.updateVis = function() {
  var vis = this; 

  vis.wrangleData();

  var yDomain = vis.factorNames.filter(function(factor) {
    return p171.DD.filters[factor];
  })

  var xDomain = vis.collegeNames.filter(function(college) {
    return p171.DD.filters[college];
  });

  vis.updateAxes(xDomain, yDomain);

  vis.updateCells();

}

Heatmap.prototype.updateAxes = updateAxes;

Heatmap.prototype.updateCells = function(d) {
  var vis = this;

  vis.cells = vis.svg.selectAll(".heat-cell")
    .data(vis.displayData)

  vis.cells
    .enter().append("rect")
      .attr({class: "heat-cell"});
  
  vis.cells 
    .attr({
      x: function(d) { return vis.xScale(d.collegeID); },
      y: function(d) { return vis.yScale(d.factor); },
      width: vis.xScale.rangeBand() - 5,
      height: vis.yScale.rangeBand() - 5,
      fill: function(d) {
        if (d.effect > 0) return 'blue';
        else return 'yellow';
      }
    })

  vis.cells.exit().remove();
}

Heatmap.prototype.initData = function(data) {
  var vis = this;

  vis.data = [];
  vis.factorNames = [];
  vis.collegeNames = []

  for (factor in data) {
    var colleges = data[factor].names;
    var factorEffects = data[factor].vals;
    vis.factorNames.push(factor);
    
    if (vis.collegeNames.length == 0) vis.collegeNames = colleges;

    for (var i=0;i<colleges.length;i++) {
      var sample = {
        collegeID: colleges[i],
        factor: factor,
        effect: factorEffects[i]
      }
      sample[factor] = factorEffects[i]
      vis.data.push(sample);
    }
  }
}
// Wrangle data
Heatmap.prototype.wrangleData = applyFilter;

  function initCalibration(){
    d3.select('[role="calibration"] [role="example"]').select('svg')
      .selectAll('rect').data(colorCalibration).enter()
    .append('rect')
      .attr('width',cellSize)
      .attr('height',cellSize)
      .attr('x',function(d,i){
        return i*itemSize;
      })
      .attr('fill',function(d){
        return d;
      });

    //bind click event
    d3.selectAll('[role="calibration"] [name="displayType"]').on('click',function(){
      renderColor();
    });
  }

  function renderColor(){
    var renderByCount = document.getElementsByName('displayType')[0].checked;

    rect
      .filter(function(d){
        return (d.value['PM2.5']>=0);
      })
      .transition()
      .delay(function(d){      
        return (dayFormat(d.date)-dayOffset)*15;
      })
      .duration(500)
      .attrTween('fill',function(d,i,a){
        //choose color dynamicly      
        var colorIndex = d3.scale.quantize()
          .range([0,1,2,3,4,5])
          .domain((renderByCount?[0,500]:dailyValueExtent[d.day]));

        return d3.interpolate(a,colorCalibration[colorIndex(d.value['PM2.5'])]);
      });
  }


