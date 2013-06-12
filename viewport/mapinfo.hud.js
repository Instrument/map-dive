var MapInfoHUD = function() {

  var $locationLabel;
  var $altitudeLabel;

  var altitudeLabelElement;
  var locationLabelElement;

  var currentSearchTerm = "";

  var visible = false;

  function degToHMS( angle, isLatitude ) {

    var degrees = Math.floor(angle);
    var minutes = Math.abs(degrees - angle) * 60;
    var minutesInt = Math.floor(minutes);
    var seconds = Math.floor((minutes - minutesInt) * 60);

    var letter = "";

    if(isLatitude){
      letter = (angle > 0) ? "N" : "S";
    } else {
      letter = (angle > 0) ? "E" : "W";
    }

    return letter + " " + Math.abs(degrees) + "&deg; " + minutesInt + "' " + seconds + "\"";
  }

  function formatNumber( num ){

    if (num >= 1000){
      var thousands = Math.floor(num * 0.001);
      var hundreds = Math.floor(num - (thousands * 1000));
      if(hundreds < 10){
        hundreds = "00" + hundreds;
      }else if(hundreds < 100){
        hundreds = "0" + hundreds;
      }
      return thousands + "," + hundreds;
    }
    return num;
  }

  function showResults() {

    // stop blinking the cursor.
    
    $("#mapinfo-search-term").html(currentLevel.description.search);

    // show the detail panes.
    $("#mapinfo-target-name").html(currentLevel.description.target);
    $("#mapinfo-target-address").html(currentLevel.description.address);
    $("#mapinfo-target-country").html(currentLevel.description.country);

    // start off-screen
    $("#mapinfo-location,#mapinfo-target").css({"display": "block", "left": -1080});
    $("#mapinfo-search").css({"display": "block"});
    
    // stagger the revealing animations.
    $("#mapinfo-search").animate({"top":85}, function() {
      $("#mapinfo-target").animate({"left": 62}, function() {
        $("#mapinfo-location").animate({"left": 62});
      });
    });
  }


  var self = {};
  
  self.initialize = function() {
    $("#mapinfo-search,#mapinfo-target,#mapinfo-location").attr("data-active", "true");
    $locationLabel = $("#mapinfo-latlng");
    $altitudeLabel = $("#mapinfo-altitude");

    altitudeLabelElement = document.getElementById("mapinfo-altitude");
    locationLabelElement = document.getElementById("mapinfo-latlng");

    $("#mapinfo-search-term").html("&nbsp;");
  }

  self.update = function() {
    
    if(!visible){
      return;
    }

    // update latitude/longitude display
    if(gameState.player.latLng) {     
      locationLabelElement.innerHTML = degToHMS(gameState.player.latLng.lat(), true) + "&nbsp;&nbsp;&nbsp;" + degToHMS(gameState.player.latLng.lng(), false); 
      altitudeLabelElement.innerHTML = formatNumber( Math.round(gameState.player.pos[1] * 5)) + " ft";
    }
    
  }

  self.message = function(data){
    if(data["hud"] == "intro_results"){
      showResults();
    }
  }

  self.show = function() {
    if(!visible){
      visible = true;
      showResults();
    }
  }

  self.hide = function() {
    visible = false;
    $("#mapinfo-location,#mapinfo-target").animate({"left": -1080});
    $("#mapinfo-search").animate({"top":-200});
  }

  self.type = "mapinfo";

  return self;
};