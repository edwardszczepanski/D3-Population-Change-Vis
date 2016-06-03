$(function() {
	init(2010);
});

var init = function (year) {
	console.log(year);
	HashMap = function(){
		this._dict = [];
	}
	HashMap.prototype._get = function(key){
		for(var i=0, couplet; couplet = this._dict[i]; i++){
			if(couplet[0] === key){
				return couplet;
			}
		}
	}
	HashMap.prototype.put = function(key, value){
		var couplet = this._get(key);
		if(couplet){
			couplet[1] = value;
		}else{
			this._dict.push([key, value]);
		}
		return this; // for chaining
	}
	HashMap.prototype.get = function(key){
		var couplet = this._get(key);
		if(couplet){
			return couplet[1];
		}
	}

	var color = {}; // unique object instance
	var shape = {}; // unique object instance
	var map = new HashMap();

	//var locationInput = "venue_postal_cd_sgmt_1";
	//var sizeInput = "tickets_purchased_qty";
	//var colorInput = "delivery_type_cd";
	var locationInput = "NAME";
	var sizeInput = "CENSUS2010POP";

	var unitsPerPixel = 5;

	var innerWidth  = 800;
	var innerHeight = 345;
	var margin = { left: 150, top: 150, right: 150, bottom: 150 };


	var svg = d3.select("body").append("svg")
	.attr("width",  innerWidth + margin.left + margin.right)
	.attr("height", innerHeight + margin.top + margin.bottom);

	var g = svg.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var xScale = d3.scale.linear().range([0, innerWidth]);
	var yScale = d3.scale.linear().range([innerHeight, 0]);
	var rScale = d3.scale.sqrt();

	function render(data){

		xScale.domain([-124.85, -66.80]);
		yScale.domain([24.40, 49.38]);

		rScale.domain([0, d3.max(data, function (d){
			//return d["tickets_purchased_qty"];
			return d["CENSUS2010POP"];
		})]);

		var unitsMax = rScale.domain()[1];
		var rMin = 0;
		var rMax = Math.sqrt(unitsMax / (unitsPerPixel * Math.PI));
		rScale.range([rMin, rMax]);

		var circles = g.selectAll("circle").data(data);
		circles.enter().append("circle");
		circles
		.attr("cx", function (d){
			if (map.get(d[locationInput]) != null) {
				if (isNaN(+map.get(d[locationInput])[0])){
					return -100;
				} else {
					return +map.get(d[locationInput])[0];
				}
			} else {
				var localCheck = getCoordinates(d[locationInput]);
				if (localCheck[2] == "OK") {
					map.put(d[locationInput], [+xScale(+localCheck[0]),
					yScale(+localCheck[1])]);
					return map.get(d[locationInput])[0];
				} else {
					map.put(d[locationInput], null);
				}
			}
		})
		.attr("cy", function (d){
			if (map.get(d[locationInput]) != null) {
				if (isNaN(+map.get(d[locationInput])[1])){
					return -100;
				} else {
					return +map.get(d[locationInput])[1];
				}
			} else {
				console.log("Something done went wrong");
			}
		})
		.attr("r",  function (d){
			if (isNaN(+rScale(d[sizeInput]))){
				return 0;
			} else {
				return rScale(d[sizeInput]);
			}
		})
		.attr("id", function (d){ return d["NAME"] + ", " + d["CENSUS2010POP"]; })
		.attr("fill", function (d) {
			//return picker(d[colorInput]);
			return "blue";
		})
		.attr("stroke", "none");
		circles.exit().remove();
	}

	function type(d){
		d.trans_face_val_amt = +d.trans_face_val_amt;
		return d;
	}

	function getCoordinates(input) {
		var strUrl = "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyBHPWGDrjRFk59k_FYuiujNmJo4APmKxqk&address=" + input, strReturn;

		jQuery.ajax({
			url: strUrl,
			success: function(html) {
				strReturn = html;
			},
			async:false
		});

		return [strReturn.results[0].geometry.location.lng, strReturn.results[0].geometry.location.lat, strReturn.status];
	}

	d3.csv("small.csv", type, render);
}
