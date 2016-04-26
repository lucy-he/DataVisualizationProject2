// generate the svg and x/y axis
var width = 1000;
var height = 680;
var padding = 50;
var svg = d3.select("#causes").append("svg").attr("width", width)
	.attr("height",height).style("background-color","lightgrey");
var xScale = d3.scale.linear().domain([1880, 2013]).range([2*padding, width-padding]);
var yScale = d3.scale.linear().domain([-1,1]).range([height-padding, 2*padding]);

var xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickFormat("");

var yAxis = d3.svg.axis().scale(yScale).orient("left");

svg.append("g").attr("transform", "translate(0,"+(2*padding+(height-3*padding)/2)+")")
.attr("class", "axis").call(xAxis).selectAll("line").remove();

svg.append("g").attr("transform", "translate("+ 2*padding + ",0)")
.attr("class", "axis").call(yAxis);

svg.append("text").attr("x",width/4).attr("y",30).attr("font-size",20).attr("font-weight","bold").text("Factors that may be warming the world (1880-2005)");
svg.append("text").attr("x",2*padding-20).attr("y",2*padding-20).text("(°F) Hotter");
svg.append("text").attr("x",2*padding-20).attr("y",650).text("(°F) Cooler");
svg.append("text").attr("x",5).attr("y",height/2).text("1880-1910");
svg.append("text").attr("x",5).attr("y",height/2+15).text("Average");

// vorronoi function
var voronoi = d3.geom.voronoi()
    .x(function(d) { return xScale(d.year); })
    .y(function(d) { return yScale(d.val); })
    .clipExtent([[0, 0], [width, height]]);

//load data from csv

var totalData;
var aveGreenHouseGas = 0;
var aveOfOrbitalChange = 0;
var aveOfOzne = 0;
var aveOfSolar = 0;
var aveOfVolcanic = 0;
var numberOfYears = 30;

var greenHouseGasValues=[];//1880-2005
var Orbital_changesValues = [];
var OzoneValues = [];
var SolarValues = [];
var VolcanicValues = [];

var tempratureYearlyValues = [];//1880-2013
var tempratureAvgValues = [];//1882-2012

// var baseValueOfGreenHouseGas;
// var baseValueOfOrbitalChange;
// var baseValueOfOzne;
// var baseValueOfSolar;
// var baseValueOfVolcanic;

// var baseValueTempratureYearly;
// var baseValueTempratureFiveMean;

d3.csv("factors.csv", function (error, data){

	totalData = data;
	baseValueOfGreenHouseGas = data[0].Greenhouse_gases;
	baseValueOfOrbitalChange = data[0].Orbital_changes;
	baseValueOfOzne = data[0].Ozone;
	baseValueOfSolar = data[0].Solar;
	baseValueOfVolcanic = data[0].Volcanic;

	for(var i = 0; i<=numberOfYears; i++){
		aveGreenHouseGas += parseFloat(data[i].Greenhouse_gases);
		aveOfOrbitalChange += parseFloat(data[i].Orbital_changes);
		aveOfOzne += parseFloat(data[i].Ozone);
		aveOfSolar += parseFloat(data[i].Solar);
		aveOfVolcanic += parseFloat(data[i].Volcanic);
	}
	aveGreenHouseGas = aveGreenHouseGas/(numberOfYears+1);
	aveOfOrbitalChange = aveOfOrbitalChange/(numberOfYears+1);
	aveOfOzne = aveOfOzne/(numberOfYears+1);
	aveOfSolar = aveOfSolar/(numberOfYears+1);
	aveOfVolcanic = aveOfVolcanic/(numberOfYears+1);

	data.forEach(function (line) {
		var year = parseInt(line.year);
		var greenHouseGasObj = {"year":year,"val":parseFloat(line.Greenhouse_gases)-aveGreenHouseGas};
		greenHouseGasValues.push(greenHouseGasObj);

		var Orbital_changesObj = {
			"year":year, "val":parseFloat(line.Orbital_changes)- aveOfOrbitalChange
		};
		Orbital_changesValues.push( Orbital_changesObj );

		var OzoneObj = {
			"year":year, "val":parseFloat(line.Ozone) - aveOfOzne
		};
		OzoneValues.push( OzoneObj);

		var SolarObj = {
			"year":year, "val":parseFloat(line.Solar) - aveOfSolar
		};
		SolarValues.push(SolarObj);

		var VolcanicObj = {
			"year":year, "val":parseFloat(line.Volcanic) - aveOfVolcanic
		};
		VolcanicValues.push(VolcanicObj);
	});

	d3.csv("Temperature.csv", function (error, data){
		
		//generate array of objects for futrue data processing
		data.forEach( function (line) {
			console.log(line);
			var year = parseInt(line.year);
			var tempratureYearlyObj = {
				"year":year, "val":parseFloat(line.Annual_Mean)
			};
			tempratureYearlyValues.push( tempratureYearlyObj);

			var tempratureAvgObj = {
				"year":year, "val": parseFloat(line.five_year_Mean)
			};
			tempratureAvgValues.push(tempratureAvgObj);
		});

		var line = d3.svg.line()
		.interpolate("basis").x(function (d) {
		return xScale(d.year);} ).y(function (d) { return yScale(d.val); });

		// array of objects: name, array of values
		var factors = [{"name":"Green House Gas", "values":greenHouseGasValues,"color":"green", "lineID":"greenHouseGas"},
		{"name":"Orbital Changes","values":Orbital_changesValues,"color":"white", "lineID":"orbitalChanges"},
		{"name":"Ozone","values":OzoneValues,"color":"blue","lineID":"Ozone"},
		{"name":"Solar", "values":SolarValues,"color":"red","lineID":"Solar"},
		{"name":"Volcanic","values":VolcanicValues,"color":"black","lineID":"Volcanic"}, 
		{"name":"Temprature ","values":tempratureYearlyValues, "color":"yellow","lineID":"Temprature"}];

		//generate path
		svg.append("g").selectAll("path").data(factors)
	    .enter().append("path").attr("class","outline line").attr("id",function (d) {return d.lineID;})
	      	.attr("d", function(d) { 
	      		
	      		//add path id to each point

		      	d.values.forEach( function(dd){
		      		dd.line = d.lineID; 
		      	});
		      	return line(d.values); 
	      	}).attr("stroke",function (d){return d.color});

	    //generate legend for each line
	    
	    factors.forEach(function (d, i){
	    	svg.append("line").attr("x1", 120).attr("y1", 2*padding+20*(i+1))
	    .attr("x2",220).attr("y2",2*padding+20*(i+1)).attr("stroke",d.color).attr("stroke-width",3);
	    	svg.append("text").attr("x",240).attr("y",2*padding+20*(i+1)).text(d.name).attr("fill",d.color).attr("font-size",18);
	    })

	    //generate the info board of cur point

		var focus = svg.append("g")
	    .attr("transform", "translate(-100,-100)")
	    .attr("class", "focus");

		focus.append("circle").attr("r", 5).attr("fill","red");
		focus.append("rect").attr("width",120).attr("height",60).attr("fill","white").attr("opacity",0.8).attr("transform","translate(-40,15)");
		focus.append("text").attr("id","yearLabel").attr("transform","translate(-30,35)");
		focus.append("text").attr("id","valueLabel").attr("transform","translate(-30,60)");

		// building to voronoi path group
		
		var voronoiGroup = svg.append("g").attr("class", "voronoi");
		voronoiGroup.selectAll("path")
	      .data(voronoi(d3.nest()
	      	.key(function(d) { return xScale(d.year)+","+yScale(d.val); })  
	          .rollup(function(v) { return v[0]; }) 
	          .entries(d3.merge(factors.map(function (d) {
	          	return d.values;
	          })))
	          .map(function(d) { return d.values; })))
	      .enter().append("path")
	      .attr("d", function (d) {
	      	return "M"+d.join("L")+"Z";
	      })
	      .datum(function(d) { return d.point; }).on("mouseover", mouseover).on("mouseout", mouseout);

        function mouseover(d) {
        	var id = "#"+d.line;
        	d3.selectAll("path.line").classed("fade",true);
		    d3.select(id).classed("fade",false);
		    d3.select("#Temprature").classed("fade", false);
		    focus.attr("transform", "translate(" + xScale(d.year) + "," + yScale(d.val) + ")");
		    focus.select("text#yearLabel").text("year:"+d.year); 
		    focus.select("text#valueLabel").text("value:"+d.val.toFixed(2)+" °F");  
		}

		function mouseout (d) {
			var id = "#"+d.line;
			d3.selectAll(id).classed("fade",true);
			d3.selectAll("path.line").classed("fade",false);
			focus.attr("transform", "translate(-100,-100)");
		}
	});	
});