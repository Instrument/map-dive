var MiniMapHUD = function() {

  var minimap;
  var $playerDirection = $("#minimap-icon");

  var playerPath = [];
  var pathPolyline;

  var self = {};
  var lastTime = 0;
  var trailLength = 130;
  var lastPlayerX = 0;
  var initializing = true;
  var visible = false;

  var landmarkMarker;

  var markers = [];

  var centerOnPlayer = false;

  var lastPoint = new THREE.Vector3();

  function showMap() {
    if(!visible){
      playerPath = [];
      visible = true;
      $("#mini-map-container").css({"display":"block", "left":1090} );
      $("#mini-map-container").animate({"left":62});

      var latLng = minimap.getProjection().fromPointToLatLng( new google.maps.Point( landmark.position.x / mapScale, landmark.position.z / mapScale) );

      playerMarker = new google.maps.Marker({
        map: minimap,
        position: latLng,
        animation: google.maps.Animation.DROP,
        draggable: false
      });

      minimap.panTo(latLng);

      centerOnPlayer = false;

      window.setTimeout(panToPlayer, 2000);
    }
  }

  function panToPlayer() {
    var latLng = minimap.getProjection().fromPointToLatLng( new google.maps.Point(gameState.player.pos[0], gameState.player.pos[2]) );

    minimap.panTo(latLng);

    window.setTimeout(function() {
      centerOnPlayer = true;  
      $playerDirection.css("display", "block");
      minimap.setZoom(12);
    }, 500);


  }


  self.initialize = function() {

      $("#mini-map-container").attr("data-active", "true");

      $("#mini-map-container").css("display", "block");
      $("#mini-map-container").css("visibility", "hidden");

      $("#hud-about").attr("data-active", "true");
      
      var mapOptions = {
        zoom: 11,
        disableDefaultUI: true,
        mapTypeId: "default",
        draggable : false,
        scrollwheel : false,
        backgroundColor: "#ffffff"
      };

      minimap = new google.maps.Map( document.getElementById("mini-map"), mapOptions );
      
      var labelStroke = {
        "elementType": "labels.text.stroke",
        "stylers": [
          { "visibility": "on" },
          { "color": "#edf1f7" }
        ]
      };
      var labelFill = {
        "elementType": "labels.text.fill",
        "stylers": [
          { "visibility": "on" },
          { "color": "#0f100e" }
        ]
      };

      google.maps.event.addListener(minimap, "idle", function() {
        if(initializing){
          initializing = false;
          $("#mini-map-container").css({"display":"none", "visibility":"visible"});
        }
      });

      // set up the list of possible view styles.
      for(var key in viewStyles) {

        var clonedStyle = JSON.parse(JSON.stringify(viewStyles[key].style));

        clonedStyle.push(labelFill);
        clonedStyle.push(labelStroke);

        minimap.mapTypes.set(key, new google.maps.StyledMapType( clonedStyle, {name : key} ));
      }

      pathPolyline = new google.maps.Polyline({
        map:minimap,
        path: [],
        strokeColor: "#001bff",
        strokeOpacity: 0.75,
        strokeWeight: 6
      });
  }

  self.setStyle = function(styleName, styleParams){
    pathPolyline.setOptions({strokeColor : styleParams["target"]});
    minimap.setMapTypeId(styleName);
  }

  self.update = function() {
    if(!visible) {
      return;
    }

    if(centerOnPlayer){

      // Figure out if the player has turned left or right.
      if(lastPlayerX > gameState.player.pos[0]){
        $playerDirection.addClass("left");
      } else if (lastPlayerX < gameState.player.pos[0]){
        $playerDirection.removeClass("left");
      }
      
      // don't bother keeping track of changes in altitude.
      lastPoint.y = gameState.player.pos[1];

      minimap.panTo( gameState.player.latLng );

      // plot points based on distance, not every frame.
      if(lastPoint.distanceTo( player.getPosition()) > 4){

        playerPath.push(minimap.getCenter());

        // pop off the last point if the list of points has maxed out.      
        if(playerPath.length > trailLength) {
          playerPath = playerPath.splice(1, playerPath.length-1);
        }

        pathPolyline.setPath(playerPath);
        lastTime = gameState.t;

        lastPoint.copy(player.getPosition());
      }
      lastPlayerX = gameState.player.pos[0];
    }
  }

  self.message = function(data){
    if(data["hud"] == "intro_results"){
      showMap();
    }

    if(data["hud"] == "gate_hit"){
      markers.push( new google.maps.Marker({
        map: minimap,
        position: minimap.getProjection().fromPointToLatLng(new google.maps.Point(data["x"], data["z"])),
        animation: google.maps.Animation.DROP,
        draggable: false
      }));
    }
  }

  self.show = function() {
    showMap();
  }

  self.hide = function() {
    visible = false;
    centerOnPlayer = false
    for(var i = 0; i < markers.length; i++){
      markers[i].setMap(null);
    }
    markers = [];
    $playerDirection.css("display", "none");
    $("#mini-map-container").animate({"left":1090}, function() {
      $("#mini-map-container").css({"display":"none"} );
    });
    //$("#mini-map-container").css("display", "none");
  }

  self.type = "minimap";

  return self;
};