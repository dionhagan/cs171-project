
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
  vis.colors = colorbrewer.RdBu[11]
  vis.colorScale = d3.scale.quantize()
    .domain([
      d3.min(vis.data, function(d) { return d.effect; }), 
      vis.colors.length - 1,
      d3.max(vis.data, function(d) { return d.effect; }),
    ])
    .range(vis.colors)

  vis.xScale.rangeRoundBands([0, vis.width]);
  vis.yScale.rangeRoundBands([vis.height, 0]);
  vis.createLegend()
  vis.updateVis();
};

Heatmap.prototype.createElements = createElements;

Heatmap.prototype.createDimensions = function() {
  var vis = this;

  vis.margin = {top:20,right:0,bottom:100,left:180};
  vis.width = p171.DD.wrapperWidth - 200 - vis.margin.left - vis.margin.right,
  vis.height = 800 - vis.margin.top - vis.margin.bottom;
};

Heatmap.prototype.addMainSVG = addMainSVG;

Heatmap.prototype.addAxes = addAxes;

Heatmap.prototype.createLegend = function() {
  var vis = this;

  var width = 50;

  var legendData = vis.colorScale.range()
  console.log(legendData)

  vis.legendElement = vis.svg.append("g")
    .attr({
      id:"heat-map-legend",
      x: vis.width - vis.margin.right
    })

  vis.legendElement.append("text")
    .attr({
      y: vis.height + 35
    })
    .text("Legend")

  vis.legend = vis.legendElement.selectAll(".legend")
    .data(legendData);

  vis.legend.enter().append("g")

  vis.legend.append("rect")
    .attr({
      x: function(d, i) { return width* i },
      y: vis.height + 40,
    })
    .style({
      width: width+"px",
      height: "30px",
      fill: function(d, i) { return vis.colors[i]; }
    })

  vis.legend.append("text")
    .attr({
      x: function(d, i) { return width * i },
      y: vis.height + 85,
    })
    .text(function(d, i) {
      var max = vis.colorScale.domain()[1]; 
      var min = vis.colorScale.domain()[0]; 
      var diff = max - min;

      var increment = diff / vis.colorScale.range().length;

      return (min+(increment * i)).toFixed(2)
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
  .map(function(factorName) {
    return p171.data.labels[factorName];
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
      y: function(d) { return vis.yScale(p171.data.labels[d.factor]); },
      width: vis.xScale.rangeBand() - 5,
      height: vis.yScale.rangeBand() - 5,
      fill: function(d) { 
        if(d.factor == "earlyAppl") console.log(d.effect)
        return vis.colorScale(d.effect)}
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

  console.log(vis.data)
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


