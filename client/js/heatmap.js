
// Create heatmap object
var Heatmap = function(_parentElement) {
  this.parentElement = d3.select('#'+_parentElement);
  this.initData(p171.data.factorEffect);
  this.initVis();
}

// Initialize heatmap ==================================
Heatmap.prototype.initVis = function() {
  var vis = this; 
  
  vis.isMain = true;
  vis.createElements();
  vis.createDimensions();
  vis.addMainSVG(); 
  vis.createFilters(colleges=true, applicants=false, offset=40);
  vis.tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([0,-10])
    .html(function(d) {
      var html = ""
      html += "<b>"+p171.data.labels[d.factor]+" at "+d.collegeID+"</b></br>"
      html += "<span>  "+ d.effect.toFixed(2)+"</span>"
      return html
    });
  vis.svg.call(vis.tip)
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

  vis.margin = {top:20,right:150, bottom:200,left:50};
  vis.width = (p171.DD.wrapperWidth*1.1) - vis.margin.left - vis.margin.right,
  vis.height = 800 - vis.margin.top - vis.margin.bottom;
};

Heatmap.prototype.addMainSVG = addMainSVG;

Heatmap.prototype.addAxes = addAxes;

Heatmap.prototype.createFilters = createFilters

Heatmap.prototype.createLegend = function() {
  var vis = this;

  var width = 50;

  var legendData = vis.colorScale.range()

  vis.legendElement = vis.svg.append("g")
    .attr({
      id:"heat-map-legend",
      x: vis.width - vis.margin.right
    })

  vis.legendElement.append("text")
    .attr({
      y: vis.height + 150
    })
    .text("Relative effect on college admissions")

  vis.legend = vis.legendElement.selectAll(".legend")
    .data(legendData);

  vis.legend.enter().append("g")

  vis.legend.append("rect")
    .attr({
      x: function(d, i) { return width* i },
      y: vis.height + 150,
    })
    .style({
      width: width+"px",
      height: "30px",
      fill: function(d, i) { return vis.colors[i]; }
    })

  vis.legend.append("text")
    .attr({
      x: function(d, i) { return width * i },
      y: vis.height + 195,
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

  if (vis.isMain) {
    vis.updateCells();
  } else {
    vis.updateBars();
  }
  

}

Heatmap.prototype.updateAxes = function(xDomain, yDomain) {
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

  vis.xAxisGroup
    .selectAll("text")
      .attr({
        transform: function(school) {
          return "rotate(90) translate(60,0)";
        }
      }); 

  vis.yAxisGroup
    .transition().duration(300)
    .call(vis.yAxis);

  vis.yAxisGroup
    .selectAll("text")
      .attr({
        transform: function(d) {
          return "rotate(90) translate(50,20)";
        }
      })
      .text(function(d) { 
        if (d == "Underrepresented Minority") return  "Underrep. Min."
        else if (d == "International Student") return "Intnl Student"
        else return d
      })
}

Heatmap.prototype.updateCells = function(d) {
  var vis = this;

  var yDomain = vis.factorNames.filter(function(d) {
    return d in p171.DD.filters
  })
  .map(function(factorName) {
    return p171.data.labels[factorName];
  })

  var xDomain = vis.collegeNames.filter(function(college) {
    return p171.DD.filters[college];
  });
  vis.yScale = d3.scale.ordinal()
  vis.yScale.rangeRoundBands([vis.height, 0]);
  vis.updateAxes(xDomain, yDomain);

  

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
        return vis.colorScale(d.effect)}
    })
    .on("click", function(d) {
      vis.selectedFactor = d.factor
      vis.createBarGraph()
      vis.isMain = false;
    })
    .on("mouseover", function(d) {
      vis.tip.show(d)
      d3.select(this)
        .attr({
          stroke: "black",
          "stroke-width": 1
        })
    })
    .on("mouseout", function(d) {
      d3.select(this)
        .attr({
          stroke: "white",
          "stroke-width": 0
        })
      vis.tip.hide(d)
    })

  vis.cells.exit().remove();
}

Heatmap.prototype.updateBars = function() {
  var vis = this;



  vis.displayData = vis.data.filter(function(d) {
    return d.factor == vis.selectedFactor && p171.DD.filters[d.collegeID] ;
  })
  .sort(function(a,b) {
    return a.effect < b.effect
  })

  var yDomain = [
    d3.min(vis.displayData, function(d) { return d.effect })*.9,
    d3.max(vis.displayData, function(d) { return d.effect })*1.1
  ]

  var xDomain = vis.displayData.map(function(d) {
    return d.collegeID
  })

  vis.yScale = d3.scale.linear()
    .range([0, vis.height])

  vis.updateAxes(xDomain, yDomain);

  vis.yAxisGroup.selectAll('text')
    .attr({
      transform: "translate(0,0)"
    })

  vis.bars = vis.svg.selectAll(".heat-cell")
    .data(vis.displayData)

  vis.yScale = d3.scale.linear()
    .range([0,vis.width])
    .domain([
      d3.min(vis.displayData, function(d) { return d.effect }) * .9,
      d3.max(vis.displayData, function(d) { return d.effect }) * 1.1
    ])

  vis.yAxis = d3.svg.axis()
    .scale(vis.yScale)
    .tickSize(0)
    .orient("left");

  vis.yAxisGroup
    .call(vis.yAxis)

  vis.bars.enter().append("rect")
    .attr({
    class: "heat-cell",
    fill: "white"
    })

  vis.bars
    .transition().duration(750)
    .attr({ 
      width: vis.xScale.rangeBand() - 5,
      height: function(d) { return vis.yScale(d.effect) },
      x: function(d, i) { return 5+i*vis.xScale.rangeBand() },
      y: function(d) { return vis.height - vis.yScale(d.effect) },
      fill: function(d) { return vis.colorScale(d.effect)},
    })

  vis.bars
  .exit()
  .remove()

  vis.bars
    .on("mouseover", function(d) {
      vis.tip.show(d)
      d3.select(this)
        .attr({
          stroke: "black",
          "stroke-width": 1
        })
    })
    .on("mouseout", function(d) {
      d3.select(this)
        .attr({
          stroke: "white",
          "stroke-width": 0
        })
      vis.tip.hide(d)
    })




}

Heatmap.prototype.createBarGraph = function() {
  var vis = this;

  vis.updateBars();

  var returnTab = vis.svg.append('g')
    .attr("class","back_to_heatmap")

  returnTab.append("rect")
    .attr({
      x: vis.width + vis.margin.left + 25,
      y: vis.height - 20,
      width: 80,
      height: 20,
      fill: "steelblue"
    })
    .on("click", function(d) { 
      vis.isMain = true
      vis.updateVis()

      d3.select(this.parentNode).remove()
    })

  returnTab.append("text")
    .attr({
      x: vis.width + vis.margin.left + 35,
      y: vis.height - 5
    })
    .style("color","white")
    .text("Back")



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
        effect: (factorEffects[i] + 1) / 2
      }
      sample[factor] = (factorEffects[i] + 1) / 2
      vis.data.push(sample);
    }
  }
}




// Wrangle data
Heatmap.prototype.wrangleData = applyFilter;

// 

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


