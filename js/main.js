/* Create a scatter plot of 1960 life expectancy (gdp) versus 2013 life expectancy (life_expectancy).
		The variable "data" is accessible to you, as you read it in from data.js
*/
$(function() {
	// Read in prepped_data file
	d3.csv('data/tarantino.csv', function(error, rawData){
		// Variables that should be accesible within the namespace
		var xScale, yScale, histData, barWidth;

        // size of hist bins
        var binsize = 2;

		// Track the sex (male, female) and drinking type (any, binge) in variables
		var movie = 'Reservoir Dogs';

		// Margin: how much space to put in the SVG for axes/titles
		var margin = {
			left:70,
			bottom:100,
			top:50,
			right:50
		};

		// Height/width of the drawing area for data symbols
		var height = 600 - margin.bottom - margin.top;
		var width = $(window).width() * 0.9 - margin.left - margin.right;

	 	// Select SVG to work with, setting width and height (the vis <div> is defined in the index.html file)
		var svg = d3.select('#vis')
			.append('svg')
			.attr('height', 600)
			.attr('width', $(window).width() * 0.9);

		// Append a 'g' element in which to place the rects, shifted down and right from the top left corner
		var g = svg.append('g')
            .attr('transform', 'translate(' +  margin.left + ',' + margin.top + ')')
            .attr('height', height)
            .attr('width', width);

		// Append an xaxis label to your SVG, specifying the 'transform' attribute to position it (don't call the axis function yet)
		var xAxisLabel = svg.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + (height + margin.top) + ')')
			.attr('class', 'axis');

		// Append a yaxis label to your SVG, specifying the 'transform' attribute to position it (don't call the axis function yet)
		var yAxisLabel = svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + margin.left + ',' + (margin.top) + ')');

		// Append text to label the y axis (don't specify the text yet)
		var xAxisText = svg.append('text')
            .attr('transform', 'translate(' + (margin.left + width/2) + ',' + (height + margin.top + 40) + ')')
            .attr('class', 'title');

		// Append text to label the y axis (don't specify the text yet)
		var yAxisText = svg.append('text')
            .attr('transform', 'translate(' + (margin.left - 40) + ',' + (margin.top + height/2) + ') rotate(-90)')
            .attr('class', 'title');

        yAxisText.text('Occurances');
        xAxisText.text('Time (in minutes)');

		// Write a function for setting scales.
		var setScales = function(data) {
            var xMax = d3.max(data, function(d){return +d.startMin}) + 2;
            var yMax = d3.max(data, function(d){return +d.data[0].num > +d.data[1].num ? +d.data[0].num : +d.data[1].num});

			// Define xScale
			xScale  = d3.scale.linear().range([0, width]).domain([0,xMax]);
            

			// Define the yScale: remember to draw from top to bottom!
			yScale = d3.scale.linear().range([height, 0]).domain([0, yMax]);

            barWidth = width / xMax * .9;
		};

		// Function for setting axes
		var setAxes = function() {
			// Define x axis using d3.svg.axis(), assigning the scale as the xScale
			var xAxis = d3.svg.axis()
						.scale(xScale)
						.orient('bottom')
                        .ticks(histData.length);

			// Define y axis using d3.svg.axis(), assigning the scale as the yScale
			var yAxis = d3.svg.axis()
						.scale(yScale)
						.orient('left')
						.tickFormat(d3.format('.2s'));

			// Call xAxis
			xAxisLabel.transition().duration(1500).call(xAxis);

			// Call yAxis
			yAxisLabel.transition().duration(1500).call(yAxis);
		};

		// Write a function to filter down the data to the current sex and type
		var filterData = function() {
			var currData = rawData.filter(function(d) {
				return d.movie == movie;
			});

            var xMax = d3.max(currData, function(d){return +d.minutes_in});
            var numBins = Math.floor(xMax / binsize) + (Math.floor(xMax) % 2) + 1;

            histData = new Array(numBins);
            for (var i = 0; i < numBins; i++) {
                histData[i] = {data: [{type: 'swear', num: 0}, {type: 'death', num: 0}], startMin: i * binsize};
            }

            currData.forEach(function(d) {
                var bin = Math.floor(d.minutes_in / binsize);
                if(d.type == 'word') {
                    histData[bin].data[0].num++;
                } else {
                    histData[bin].data[1].num++;
                }
            });
		};

		// Store the data-join in a function: make sure to set the scales and update the axes in your function.
		var draw = function(data) {
			// Set scales
			setScales(data);

			// Set axes
			setAxes();
            g.selectAll('*').remove();

			// Select all rects and bind data
			var barGroups = g.selectAll('.bar-group').data(data);

            barGroups.selectAll('.swear-bar').remove();

            barGroups.enter().append('g')
                .attr("transform", function(d) { return "translate(" + xScale(d.startMin) + ",0)"; })
                .attr('height', height)
                .attr('width', barWidth * 2)
                .attr('class', 'bar-group');

            var bars = barGroups.selectAll('rect').data(function(d) {return d.data});

            bars.enter().append('rect')
                .attr('x', function(d){return d.type == 'swear' ? barWidth * .05 : barWidth * 1.05;})
                .attr('y', height)
                .attr('height', 0)
                .attr('width', barWidth)
                .attr('class', function(d){return d.type == 'swear' ? 'swear-bar' : 'death-bar';});

            // Use the .exit() and .remove() methods to remove elements that are no longer in the data
            barGroups.exit().remove();
            bars.exit().remove();

            // Transition properties of the update selection
            g.selectAll('rect').transition()
                .duration(1500)
                .delay(function(d,i){return i*10})
                .attr('x', function(d){return d.type == 'swear' ? barWidth * .05 : barWidth * 1.05;})
                .attr('y', function(d){return yScale(d.num); })
                .attr('height', function(d) {return height - yScale(d.num);})
                .attr('width', barWidth);

            // bars.enter().append('rect')
			// 	.attr('x', function(d){return xScale(d.startMin)})
			// 	.attr('y', height)
			// 	.attr('height', 0)
			// 	.attr('width', barWidth)
			//     .attr('class', 'bar')
			// 	.attr('title', function(d) {return d.startMin});
            //
			// // Use the .exit() and .remove() methods to remove elements that are no longer in the data
			// bars.exit().remove();
            //
			// // Transition properties of the update selection
			// bars.transition()
			// 	.duration(1500)
			// 	.delay(function(d,i){return i*50})
			// 	.attr('x', function(d){return xScale(d.startMin)})
			// 	.attr('y', function(d){return yScale(d.swears)})
			// 	.attr('height', function(d) {return height - yScale(d.swears)})
			// 	.attr('width', barWidth)
			// 	.attr('title', function(d) {return d.startMin});
		};

		// Assign a change event
		$("input").on('change', function() {
			// Get value
			movie = $(this).val();

			// Filter data, update chart
			filterData();
			draw(histData);
		});

		// Filter data to the current settings then draw
		filterData();
		draw(histData);
	});
});
