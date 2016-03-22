"use strict";

function updatePredictionViz(predictions) {
    var outerWidth  = $("#prediction-viz").width(), // resize based on screen width
      outerHeight = outerWidth * p171.aspect, // maintain aspect ratio
      innerWidth  = outerWidth  - p171.margin.left  - p171.margin.right,
      innerHeight = outerHeight - p171.margin.top   - p171.margin.bottom,
      width       = innerWidth  - p171.padding.left - p171.padding.right,
      height      = innerHeight - p171.padding.top  - p171.padding.bottom;


    var svg = d3.select("#prediction-viz").append("svg")
                    .attr("width",  outerWidth)
                    .attr("height", outerHeight)
                  .append("g")
                    .attr("transform","translate("+p171.margin.left+","
                                        + p171.margin.top + ")");

    // scales

    // axes

    // main area
    var g = svg.append("g")
            .attr("transform","translate("+p171.padding.left+","
                                          +p171.padding.top + ")");

    // use p171.predictions
}
