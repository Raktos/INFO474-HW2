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
		var type = 'Swears';

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
            var yMax = d3.max(data, function(d){return +d[type]});

			// Define xScale
			xScale  = d3.scale.linear().range([0, width]).domain([0,xMax]);
            

			// Define the yScale: remember to draw from top to bottom!
			yScale = d3.scale.linear().range([height, 0]).domain([0, yMax]);

            barWidth = width / xMax * binsize * .9;
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
						.orient('left');

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
            var numBins = Math.floor(xMax / binsize) + 1;

			// create histogram array
            histData = new Array(numBins);
            for (var i = 0; i < numBins; i++) {
                histData[i] = {Swears: 0, Deaths: 0, startMin: i * binsize};
            }

			// give distribute data to correct property
            currData.forEach(function(d) {
                var bin = Math.floor(d.minutes_in / binsize);
                if(d.type == 'word') {
                    histData[bin].Swears++;
                } else {
                    histData[bin].Deaths++;
                }
            });
		};

		// Store the data-join in a function: make sure to set the scales and update the axes in your function.
		var draw = function(data) {
			// Set scales
			setScales(data);

			// Set axes
			setAxes();

			// Select all rects and bind data
			var bars = g.selectAll('rect').data(data);

            bars.enter().append('rect')
				.attr('x', width)
				.attr('y', height)
				.attr('height', 0)
				.attr('width', barWidth)
				.attr('title', function(d) {return d.startMin});

			// Use the .exit() and .remove() methods to remove elements that are no longer in the data
			bars.exit().remove();

			// Transition properties of the update selection
			bars.transition()
				.duration(1500)
				.delay(function(d,i){return i*5})
				.attr('x', function(d){return xScale(d.startMin) + 0.05 * barWidth})
				.attr('y', function(d){return yScale(d[type])})
				.attr('height', function(d) {return height - yScale(d[type])})
				.attr('width', barWidth)
				.attr('class', function() {return type == 'Swears' ? 'swear-bar' : 'death-bar'})
				.attr('title', function(d) {return d.startMin});
		};

		// Assign a change event
		$(".movie").on('change', function() {
			// Get value
			movie = $(this).val();

			$('#title').text(type + ' in ' + movie);

			// Filter data, update chart
			filterData();
			draw(histData);
		});

		// change event for swear vs death
		$(".type").on('change', function() {
			// Get value
			type = $(this).val();

			$('#title').text(type + ' in ' + movie);

			// Filter data, update chart
			filterData();
			draw(histData);
		});

		// change event for bin size
		$(".bin-size").on('change', function() {
			// Get value
			var val = $(this).val();
			if (val < 1) {
				val = 1;
				$(this).val(1);
			}
			binsize = val;

			// Filter data, update chart
			filterData();
			draw(histData);
		});

		// Filter data to the current settings then draw
		filterData();
		draw(histData);
	});
});
