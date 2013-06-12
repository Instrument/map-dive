var socket;
var map;
var startTime;
var keyboardActive = true;

var playerPos = new THREE.Vector3();
var dropzonePos;
var dropzoneMarker;

var endzoneMarker;
var fallSpeed = 0;

var playerMarker;
var originMarker;

var endingAltitude = 175;

var markers = [];

var playerHeading   = new EasedValue(0.25);
var playerPitch     = new EasedValue(0.15);
var playerRoll      = new EasedValue(0.15);

var isTweening=false;
var tweenStartTime=0;
var tweenEndTime=0;
var theTweens = [];

var bonusModeActive = false;
var bonusModeStartTime = 0;

var WORLD_SCALE = (1 << 12);

var playerSpeed = 0;
var targetPlayerSpeed = 0;
var selectedEntity = null;

var hideHUD = false;
var running = true;
var centerMapOnPlayer = false;
var gravityEnabled = true;

var entities = [];

var messageQueue = [];

var isUserPresent = false;

var geocoder = new google.maps.Geocoder();

var editorMapStyle = [
  {
    "stylers": [
      { "gamma": 0.56 },
      { "saturation": -91 }
    ]
  },{
    "elementType": "labels.icon",
    "stylers": [
      { "visibility": "off" }
    ]
  }
];


var keys = {
  states : [],
  "ESCAPE" : 27,
  "PAGE_UP" : 33,
  "PAGE_DOWN" : 34,
  
  "UP" : 38, 
  "LEFT" : 37,
  "DOWN" : 40,
  "RIGHT" : 39,
  
  "W" : 87,
  "A" : 65,
  "D" : 68,
  "S" : 83,
  "P" : 80,

  "TAB" : 9,
  "SPACE" : 32,
  "DELETE" : 46,
  
  "NUM_1" : 49,
  "NUM_2" : 50,
  "NUM_3" : 51,
  "NUM_4" : 52,
};

// standard game states.
var STATE_IDLE    = "idle";
var STATE_INTRO   = "intro";
var STATE_DIVE    = "dive";
var STATE_ENDING  = "ending";
var STATE_LOOSE   = "loose";

// special states
var STATE_EDITOR = "editor";
var STATE_PAUSED = "paused";

// populated at load time.
var gameStateManagers = {};

var currentTime = 0;
var currentState = STATE_IDLE;
var currentLevel = mapdive.getLevelByName("moscone_center");

var controlScheme = "keyboard";

var lastOSCStatus = "(not connected)";
var bodyTrackingResetTimeout = null;
var trackingLostTimeout = null;
var currentZoomLevel = 12;

var score = {
  "stars" : [0,0],
  "gates" : [0,0]
}

// control values, set from body tracking input.  Normalized to -1 to 1, zero being "centered"
var controlValues = {
  heading : new EasedValue(0.5),
  speed : new EasedValue(0.5)
};

var bodyPose = {
  torso : 0,
  leftArm : 0,
  rightArm : 0
};

var cameraSpeed = new EasedValue(0.06);

var viewState = {
  "t"         : 0, 
  "cam"       : { 
    "target" : [0, 0, 0],
    "speed" : 0
  },
  "player"    : {
    "pos" : [0, 0, 0],
    "dir" : [0, 0, 0],
    "vel" : [0, 0, 0],
    "parachute": 0,
    "trails": 1,
    "leftarm" : 0,
    "rightarm" : 0,
    "bodyangle" : 0
  },
  "stars" : 0,
  "gates" : 0,
  "state" : STATE_IDLE
};


function socketConnected(_socket) {
  socket = _socket;

  socket.on("input", function(data) {
    controlValues.heading.set(data.x);
    controlValues.speed.set(data.y);
  });

  socket.on("osc", function(data) {

    // switch control scheme as soon as we get data..
    controlScheme = "body";
    
    switch(data["status"]) {
      case "tracking" :
        
        isUserPresent=true;
        
        var torsoAngle = Number(data["body"]);

        data["rightarm"] = Number(data["rightarm"]);
        data["leftarm"] = Number(data["leftarm"]);

        var normalizedTorsoAngle = (torsoAngle - (Math.PI / 2)) / (Math.PI / 2); // 0 = vertical, 1 = horizontal to the left, -1 = right
        
        normalizedTorsoAngle *= 2; // double the value, so 45 degrees either way is max, otherwise people would have to lean completely horizontally which is bad for spine bones...

        var heading = normalizedTorsoAngle * -1;
        controlValues.heading.set( constrain(heading, -1, 1) );

        var torsoOffset = torsoAngle - (Math.PI / 2);

        var rightValue = Math.abs(data.rightarm - torsoOffset);
        var leftValue = Math.abs(data.leftarm - torsoOffset);

        var rightValueNormalized = rightValue / (Math.PI / 2);
        var leftValueNormalized = (Math.PI - leftValue) / (Math.PI / 2);

        bodyPose.leftArm = Math.sin(data.leftarm - torsoOffset);
        bodyPose.rightArm =  Math.sin(data.rightarm - torsoOffset);
        
        controlValues.speed.set( constrain( ((rightValueNormalized + leftValueNormalized) - 1) * 1.15, -1, 1) );

        viewState.player.bodyangle = torsoAngle - Math.PI / 2;
        viewState.player.leftarm = data.leftarm;
        viewState.player.rightarm = data.rightarm;

        // start a timer to reset the control values if we don't get tracking data for a little while.
        if(bodyTrackingResetTimeout != null){
          window.clearTimeout(bodyTrackingResetTimeout);
          bodyTrackingResetTimeout = null;
        }

        bodyTrackingResetTimeout = window.setTimeout( function() {
          controlValues.headings.set(0);
          controlValues.speed.set(0);
        }, 250);

        // if waiting for the tracking timeout, stop waiting cause we're tracking again.
        window.clearTimeout(trackingLostTimeout);

      break;
      
      case "no_user":
        isUserPresent = false;
        
        // go idle if nobody is being tracked for a bit.
        window.clearTimeout(trackingLostTimeout);
        trackingLostTimeout = window.setTimeout( function() {
          setGameState(STATE_IDLE);
        }, 2000);
        
      break;

      default:
        lastOSCStatus = "UNKNOWN STATUS - " + data["status"];
      break;
    }
    
    if(data["status"]){
      lastOSCStatus = data["status"];
    }

  });

  initializeMap();
  initializeGame();
}


function initializeGame() {
  gameStateManagers[STATE_INTRO]      = new mapdive.IntroState();
  gameStateManagers[STATE_IDLE]       = new mapdive.IdleState();
  gameStateManagers[STATE_DIVE]       = new mapdive.DiveState();
  gameStateManagers[STATE_ENDING]     = new mapdive.EndingState();
  gameStateManagers[STATE_LOOSE]      = new mapdive.LooseState();
  gameStateManagers[STATE_PAUSED]     = new mapdive.PausedState();
  gameStateManagers[STATE_EDITOR]     = new mapdive.EditorState();
}


function setGameState(stateName){
  viewState.oldstate=viewState.state;
  viewState.state = stateName;
  gameStateManagers[ stateName ].setActive();
  currentState = stateName;
}


function startNewGame(){
  setGameState( STATE_INTRO );
}


function initializeMap() {
  
  var portland = new google.maps.LatLng(45.52594, -122.65595);

  var mapOptions = {
    center: portland,
    zoom: 12,
    disableDefaultUI: true,
    mapTypeId: "editor"
  };

  map = new google.maps.Map(document.getElementById("map"), mapOptions);

  map.mapTypes.set("editor", new google.maps.StyledMapType( editorMapStyle, {name : "editor"} ));

  // create various markers when the map is ready
  google.maps.event.addListener(map, "projection_changed", function() {

    playerMarker = new google.maps.Marker({
      map: map,
      icon: { 
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale:4,
        rotation:90
      },
      draggable: false
    });

    // Shows where the dive course starts.
    originMarker = new google.maps.Marker({
      map: map,
      icon: getMarkerIcon({"type" : "origin"}),
      draggable: true
    });

    // A huge circular marker to give a general guideline for starting positions (this radius is a comfortable distance to start from)
    // This overlay only shows up when the dive origin marker is being dragged.
    dropzoneMarker = new google.maps.Circle({
      strokeWeight: 0,
      fillColor: "#00ff00",
      fillOpacity: 0.2,
      map: map,
      radius: 41250,
      visible:false
    });

    // the target zone circle.
    endzoneMarker = new google.maps.Circle({
      strokeWeight: 0,
      fillColor: "#ffff00",
      fillOpacity: 0.5,
      map: map,
      radius: 3030
    });

    google.maps.event.addListener(originMarker, "dragstart", function(evt) {
      
      for(var i = 0; i < entities.length; i++){
        
        if(entities[i].type == "dropzone"){
          
          var latlng = getEntityLatLng(entities[i]) 
          
          dropzoneMarker.setCenter( latlng );
          dropzoneMarker.setOptions({visible:true});
          dropzoneMarker.setRadius( 41250 * Math.cos(toRadians(latlng.lat())));
        }
      }

    });

    google.maps.event.addListener(originMarker, "dragend", function(evt) {
      dropzoneMarker.setOptions({visible:false});
    });

    google.maps.event.addListener(originMarker, "drag", function(evt) {

      var newPt = map.getProjection().fromLatLngToPoint( this.getPosition() );
      currentLevel.origin.position.x = newPt.x;
      currentLevel.origin.position.y = currentLevel.origin.position.y;
      currentLevel.origin.position.z = newPt.y;
    });

    // only update the player position every 100 ms, no need for per-frame updates.
    window.setInterval( function() {
      if(centerMapOnPlayer){
        map.setCenter( playerMarker.getPosition() );
      }
      playerMarker.setPosition( map.getProjection().fromPointToLatLng( new google.maps.Point( viewState.player.pos[0], viewState.player.pos[2])));
    }, 50);

    loadLevel(currentLevel.name);
    playerPos.x = currentLevel.origin.position.x;
    playerPos.z = currentLevel.origin.position.z;
    render();
  });
}

function setLevel( levelName ){
  $("#chooseLevel").val(levelName);
  loadLevel(levelName);
}


function vetToLatLng( vec ) {
  return map.getProjection().fromPointToLatLng( new google.maps.Point(vec.x, vec.z) );
}


function loadLevel(name) {

  if(name != null){
    currentLevel = mapdive.getLevelByName(name);
  } else {
    currentLevel = mapdive.getNextLevel(currentLevel.name);
  }

  $("#chooseLevel").val(currentLevel.name);

  $("#searchTerm").val(currentLevel.description.search);
  $("#targetName").val(currentLevel.description.target);
  $("#targetAddress").val(currentLevel.description.address);
  $("#targetCountry").val(currentLevel.description.country);

  $("#levelName").val(currentLevel.name);

  $("#mapStyle").val( currentLevel.style );

  map.setCenter(vetToLatLng(currentLevel.origin.position) );

  originMarker.setPosition( vetToLatLng(currentLevel.origin.position) );

  originMarker.getIcon().rotation = toDegrees( currentLevel.origin.rotation.y ) + 90;
  originMarker.setIcon( originMarker.getIcon() );

  for(var i = 0; i < markers.length; i++){
    markers[i].setMap(null);
  }

  markers = [];
  entities = [];

  score.stars = [0,0];
  score.gates = [0,0];

  for(var i = 0; i < currentLevel.entities.length; i++){

    // get total number of gates and stars for this map.
    if(currentLevel.entities[i].type == "gate"){
      score.gates[1]++;
    }
    if(currentLevel.entities[i].type == "item"){
      score.stars[1]++;
    }

    addEntity( currentLevel.entities[i] );

    if(currentLevel.entities[i].type == "dropzone"){
      var dz = currentLevel.entities[i].position;
      dropzonePos = new THREE.Vector3( dz.x, dz.y, dz.z );
      dropzoneMarker.setCenter( getEntityLatLng(currentLevel.entities[i]) );
    }
    if(currentLevel.entities[i].type == "landmark"){
      $("#landmarkObj").val( currentLevel.entities[i].model );
      var latlng = getEntityLatLng(currentLevel.entities[i]);
      endzoneMarker.setCenter( latlng );
      endzoneMarker.setRadius( 3030 * Math.cos(toRadians(latlng.lat())));
    }
  }

  updateEditorUI();
  refreshEntityList();

  var bonusList = ["burningman", "8bit", "night", "raver", "revolutions", "scifi", "terminal", "volcano"];
  var bonus = bonusList[Math.floor( randomRange(0, bonusList.length))];

  if(currentLevel.name == "burning man"){
    bonus = "burningman";
  }

  var baseStyles = mapdive.styleGroups[currentLevel.style];

  var baseStyle = baseStyles[Math.floor( randomRange(0, baseStyles.length))];
  var gateStyle = gateStyle;

  sendMessage({ 
    "level" : {
      "name" : currentLevel.name, 
      "gateStyle" : Math.floor(randomRange(0, 9)), 
      "baseStyle" : baseStyle, 
      "bonusStyle" : bonus }
    });
}


function getMarkerIcon(data){

  var options = {
    scale: 1,
    rotation: data.rotation ? toDegrees(-data.rotation.y) : 0,
    fillColor: "#0000ff",
    fillOpacity: 0.45
  };

  switch(data.type){

    case "gate" :
      options.path = "M -10,-3 L -5,-3 L 0,-10 L 5,-3 L 10,-3 L 10,3 L -10,3 z";
      options.fillColor = "#ff2e05";
      break;

    case "origin":
      options.path = "M -5,10 L 0,-10 L 5,10 z";
      options.fillColor = "#ffff00";
      break;

    case "item":
      options.path = "M -5,5 L 0,-5 L 5,5 z";
      options.fillColor = "#fff600";
      break;

    case "hazard":
      options.path = "M -4,-4 L 4,-4 L 4,4 L-4,4 z";
      options.fillColor = "#ff0000";
      break;

    case "bonus":
      options.path = "M -8,0 L 0,-8 L 8,0 L0,8 z";
      options.fillColor = "#1375e3";
      break;

    case "landmark":
      options.path = "M -10,10 L 0,-10 L 10,10 z";
      options.fillColor = "#ffff00";
      break;

    case "dropzone":
    default:
      options.path = "M -15,-15 L 15,-15 L 15,15 L -15,15 z";
      break;

  }

  return options;
}


function addEntity( data ) {
  
  var entityMarker = new google.maps.Marker({
    draggable :true,
    map : map,
    icon: getMarkerIcon(data),
    position : map.getProjection().fromPointToLatLng(new google.maps.Point( data.position.x, data.position.z ))
  });
  entityMarker.set("normalColor", entityMarker.getIcon().fillColor);
  markers.push(entityMarker);

  google.maps.event.addListener(entityMarker, "mousedown", function() {
    deselectEntities();
    selectedEntity = this.entity;
    this.entity.selected = true;

    updateEditorUI();
  });

  google.maps.event.addListener(entityMarker, "drag", function() {
    var newPt = map.getProjection().fromLatLngToPoint( this.getPosition() );
    this.entity.position.set( newPt.x, this.entity.position.y, newPt.y );

    if(this.entity.type == "landmark"){
      endzoneMarker.setCenter( this.getPosition() );
      endzoneMarker.setRadius( 3030 * Math.cos(toRadians(this.getPosition().lat())));
    }

    sendMessage({"entity" : this.entity.id, "position" : {
      x : newPt.x,
      y : this.entity.position.y,
      z : newPt.y
    }});
  });

  var newEntity = {
    id : data.id,
    type : data.type,
    hit : false,
    selected : false,
    marker: entityMarker,
    position : new THREE.Vector3( data.position.x, data.position.y, data.position.z),
    rotation : new THREE.Vector3( data.rotation.x, data.rotation.y, data.rotation.z),
    params : data.params
  };

  entities.push( newEntity );

  entityMarker.set("entity", entities[entities.length - 1]);
}


function render() {
  
  if(running){

    playerHeading.update();
    playerRoll.update();
    playerPitch.update();

    updateInput();
    updateGameState();
    updateViewState();
  }

  sendUpdate();
  showDebug();

  requestAnimationFrame(render);
}


function showDebug() {

  var str = "";
  
  str += "Game State:<br>" + currentState + "<hr>";
  str += "Player Position:<br>" + viewState.player.pos.join("<br>") + "<hr>";
  str += "Player Arms:<br>Left: " + bodyPose.leftArm + "<br>Right: " + bodyPose.rightArm + "<hr>";
  str += "Last OSC Status: " + lastOSCStatus + "<hr>";
  str += "Viewport offset: " + viewportMetrics["viewAngleOffset"] + "<hr>";
  str += "Player Speed: " + targetPlayerSpeed + "<hr>";
  str += "Fall Speed: " + fallSpeed + "<hr>";
  
  $("#debug").html(str);

  // rotate the player icon on the map view.
  playerMarker.getIcon().rotation = (playerHeading.get() / Math.PI * 180) + 90;
  playerMarker.setIcon( playerMarker.getIcon() );
  

  // update the control indicator thingy
  $("#controlValueIndicator").css({
    "left" : ((controlValues.heading.get() * 50) + 50) + "%",
    "top" : ((controlValues.speed.get() * 50) + 50) + "%",
  });
}



function updateInput() {

  if(controlScheme == "keyboard") {

    // max dive/turn rate when using keyboard.
    var keyboardMax = 0.85;

    if( keys.states[keys.UP] ){
      controlValues.speed.set(keyboardMax);
    } else if(keys.states[keys.DOWN]){
      controlValues.speed.set(-keyboardMax);
    } else {
      controlValues.speed.set(0);
    }

    if( keys.states[keys.LEFT] ) {
      controlValues.heading.set(-keyboardMax)
    } else if( keys.states[keys.RIGHT] ) {
      controlValues.heading.set(keyboardMax);
    } else{
      controlValues.heading.set(0);
    }

    if(keys.states[keys.PAGE_UP]) {
      playerPos.y += 1;
    }

    if(keys.states[keys.PAGE_DOWN]) {
      playerPos.y -= 1;
    }

    if(keys.states[keys.A]){
      bodyPose.leftArm = 0.25;
      viewState.player.leftarm = -Math.PI / 2;
    } else {
      bodyPose.leftArm = -1;
      viewState.player.leftarm = Math.PI;
    }
    if(keys.states[keys.D]){
      bodyPose.rightArm = 0.25;
      viewState.player.rightarm = Math.PI / 2;
    } else {
      bodyPose.rightArm = -1;
      viewState.player.rightarm = -Math.PI;
    }
  }

  controlValues.speed.update();
  controlValues.heading.update();

  cameraSpeed.set( controlValues.speed.get() );
  cameraSpeed.update();
}


/* tween format: 
[
  {"tween":"roll","value":"360","delay":"0","ease":"Power4.easeInOut","duration":"2"},
  {"tween":"roll","value":"0","delay":"2","ease":"Power4.easeInOut","duration":"2"}
]  
*/

function startTween(definition) {
  tweenStartTime=currentTime;
  for (var i=0; i<definition.length; i++) {
    theTweens.push(definition[i]);
  }
  for(var i=0;i<theTweens.length;i++) {
    theTweens[i].start=Number(theTweens[i].delay)+currentTime; // tween start time
    theTweens[i].end=theTweens[i].start+Number(theTweens[i].duration); // tween end time
    theTweens[i].started=false;
    switch(theTweens[i].tween) {
      case 'roll': theTweens[i].param="playerRoll"; break;
      case 'pitch': theTweens[i].param="playerPitch"; break;
      case 'heading': theTweens[i].param="playerHeading"; break;
    }
    if (theTweens[i].end>tweenEndTime) {
      tweenEndTime=theTweens[i].end; // end of last tween    
    }
    theTweens[i].tweenFunc=window.Easing[theTweens[i].ease];
  }
  isTweening=true;
}


function sendMessage(data) {
  messageQueue.push(data);
}


function updateGameState() {
  gameStateManagers[currentState].update();

  if(currentState == STATE_DIVE){
    updateEntities();
  }  
}

function updateEntities() {

  var playerPosNorm = new THREE.Vector3();
  var tmpEntityPos = new THREE.Vector3();
  playerPosNorm.copy(playerPos);
  
  playerPosNorm.x *= WORLD_SCALE;
  playerPosNorm.z *= WORLD_SCALE;

  for(var i = 0; i < entities.length; i++){
    var entity = entities[i];

    if((entity.type == "item") || (entity.type == "gate") || (entity.type == "bonus")) {
      
      tmpEntityPos.copy(entity.position);

      tmpEntityPos.x *= WORLD_SCALE;
      tmpEntityPos.z *= WORLD_SCALE;

      entity._dst = tmpEntityPos.distanceTo(playerPosNorm);
      
      // check to see if any gates have been hit.
      if((entity.type == "gate") && !entity.hit && (entity._dst < 12)){
        sendMessage({"entity" : entity.id, "hit" : true, "t" : viewState["t"]});
        sendMessage({"hud" : "gate_hit", "x" : entity.position.x, "z" : entity.position.z});
        mapdive.sound.playGateSound();
        endVal = playerPitch.get()*180/Math.PI-360;
        startTween([
          {"tween":"pitch","value":endVal,"delay":"0","ease":"easeInOutExpo","duration":"0.7"}
        ]);
        
        entity.hit = true;
        score.gates[0]++;
        sendMessage({"hud" : "smile", "t" : viewState["t"]});

        // trigger the ending when they hit the last gate.
        if(entity.params["last"]){
          setGameState(STATE_ENDING);
        }
      }

      // check to see if any stars have been hit
      if((entity.type == "item") && !entity.hit && (entity._dst < 7)){
        sendMessage({"entity" : entity.id, "hit" : true, "t" : viewState["t"]});
        mapdive.sound.playItemSound();
        endVal=playerRoll.get()*180/Math.PI+360;
        startTween([
          {"tween":"roll","value":endVal,"delay":"0","ease":"easeInOutQuad","duration":"0.5"}
        ]);
        entity.hit = true;
        score.stars[0]++;
        sendMessage({"hud" : "smile", "t" : viewState["t"]});
      }

      // check to see if the bonus item has been hit
      if((entity.type == "bonus") && !entity.hit && (entity._dst < 10)){
        console.log("BONUS MODE");
        sendMessage({"entity" : entity.id, "hit" : true, "t" : viewState["t"]});
        sendMessage({"bonusmode" : "bonus"});
        mapdive.sound.playBonusSound();
        bonusModeActive = true;
        bonusModeStartTime = now();
        entity.hit = true;
      }
    }
  }

}

function padZeros(number, digits){
  var str = ""+number;
  while(str.length < 2){
    str = "0" + str;
  }
  return str;
}

function updateViewState() {

  // combine star and gate scores and totals to reduce data that's sent each frame.
  // TODO: only send star/gate info as a message when values change.
  viewState.stars = (score.stars[0] * 100) + score.stars[1];
  viewState.gates = (score.gates[0] * 100) + score.gates[1];

  viewState.player.pos[0] = playerPos.x;
  viewState.player.pos[1] = playerPos.y;
  viewState.player.pos[2] = playerPos.z;

  viewState.player.dir[0] = playerHeading.get();
  viewState.player.dir[1] = playerPitch.get();
  viewState.player.dir[2] = playerRoll.get();
  
  viewState.player.vel[0] = Math.cos(playerHeading.get()) * playerSpeed;
  viewState.player.vel[1] = - 0.5;
  viewState.player.vel[2] = Math.sin(playerHeading.get()) * playerSpeed;

  viewState.control = [ controlValues.speed.get(), controlValues.heading.get() ];

  var t = new Date().getTime() * 0.001;
  viewState["t"] = t - startTime;
  currentTime = t - startTime;
}


function sendUpdate() {
  var packet = {
    "state" : viewState
  };
  if(messageQueue.length > 0){
    packet.messages = messageQueue;
  }
  socket.emit('viewstate', packet );
  messageQueue = [];
}

function setCameraMode(modeName, transitionTime){
  sendMessage({"camera" : modeName, "duration" : transitionTime});
}


function makeToggleButton(id, callback) {
  $("#" + id).on("click", function() {
    var res = callback();
    if(res){
      $(this).addClass("active");
    } else{
      $(this).removeClass("active");
    }
  })
}

function setEditModeEnabled(enabled){
  if(enabled){
    $("#editor").css({"display":"block"});
    $("#debug").css({"display":"none"});
    setGameState(STATE_EDITOR);
  }else{
    $("#editor").css({"display":"none"});
    $("#debug").css({"display":"block"});
    setGameState(STATE_IDLE);
  }
}

function deselectEntities() {
  $("#entityList").val(null);
  for(var i = 0; i < entities.length; i++){
    entities[i].selected = false;
  }
}

function updateEditorUI(){
  if(selectedEntity != null){
    
    $("#editor-info").html( "Type:" + selectedEntity.type + ", ID:" + selectedEntity.id);
    $("#editor-altitude").val( selectedEntity.position.y);
    $("#editor-angle").val( toDegrees(selectedEntity.rotation.y));
    $("#entityList").val( selectedEntity.id );
  }

  for(var i = 0; i < entities.length; i++){

    if(entities[i].selected){
      entities[i].marker.getIcon().fillColor = "#ff0000";
      entities[i].marker.getIcon().rotation = toDegrees(-entities[i].rotation.y);
      entities[i].marker.setIcon( entities[i].marker.getIcon() );
    } else {
      entities[i].marker.getIcon().fillColor = entities[i].marker.get("normalColor");
      entities[i].marker.getIcon().rotation = toDegrees(-entities[i].rotation.y);
      entities[i].marker.setIcon( entities[i].marker.getIcon() );
    }
 
  }
}


function refreshEntityList(){
  $("#entityList").empty();

  for(var i = 0; i < entities.length; i++){
    var opt = document.createElement("option");
    
    $(opt).attr("value", entities[i].id);
    $(opt).html(entities[i].id + ": " + entities[i].type);
    $("#entityList").append(opt);
  }
}


function setSelectedEntity(entity){
  for(var i = 0; i < entities.length; i++){
    entities[i].selected = false;
  }
  selectedEntity = entity;
  entity.selected = true;  
}


function sendEntityInfo(entity){
  sendMessage( {"entity" : entity.id, 
    "position" : {
      x : entity.position.x,
      y : entity.position.y,
      z : entity.position.z
    },
    "rotation" : {
      x : entity.rotation.x,
      y : entity.rotation.y,
      z : entity.rotation.z
    }});
}


function initEditorUI(){

  // load landmark lists.
  for(var i = 0; i < mapdive.landmarks.length; i++){
    var opt = document.createElement("option");
    $(opt).attr("value", mapdive.landmarks[i].name);
    $(opt).html(mapdive.landmarks[i].name);
    $("#landmarkObj").append(opt);
  }

  // Load map styles
  for(var itm in mapdive.styleGroups){
    var opt = document.createElement("option");
    $(opt).attr("value", itm);
    $(opt).html(itm);
    $("#mapStyle").append(opt);
  }  

  $("#altitude").on("change", function(){
    playerPos.y = Number($(this).val());
  })

  $("#editor-alignplayer").on("click", function() {
    if(selectedEntity != null){

      selectedEntity.position.x = playerPos.x;
      selectedEntity.position.y = playerPos.y;
      selectedEntity.position.z = playerPos.z;

      selectedEntity.rotation.y = -playerHeading.get() - (Math.PI / 2);

      selectedEntity.marker.setPosition( map.getProjection().fromPointToLatLng( new google.maps.Point(playerPos.x, playerPos.z)));
      selectedEntity.marker.getIcon().rotation = toDegrees(playerHeading.get()) + 90;
      selectedEntity.marker.setIcon(selectedEntity.marker.getIcon());

      sendEntityInfo(selectedEntity);

      updateEditorUI();
    }
  });

  $("#updateOrigin").on("click", function() {
    currentLevel.origin.position.x = playerPos.x;
    currentLevel.origin.position.y = playerPos.y;
    currentLevel.origin.position.z = playerPos.z;

    currentLevel.origin.rotation.y = playerHeading.get();

    originMarker.setPosition( vetToLatLng(currentLevel.origin.position) );
    originMarker.getIcon().rotation = toDegrees( playerHeading.get() ) + 90;
    originMarker.setIcon(originMarker.getIcon());
  });

  $("#moveToOrigin").on("click", function() {
    playerPos.x = currentLevel.origin.position.x;
    playerPos.y = currentLevel.origin.position.y;
    playerPos.z = currentLevel.origin.position.z;
    playerHeading.set(currentLevel.origin.rotation.y);
  })

  $("#searchButton").on("click", function(){
    findLocation();
  });

  $("#searchLatLng").on("click", function() {
    gotoLatLng();
  });
  
  
  $("#editor-altitude").on("change", function(){
    if(selectedEntity != null){
      selectedEntity.position.y = Number($(this).val());
      sendEntityInfo(selectedEntity);
      updateEditorUI();
    }
  });

  $("#editor-angle").on("change", function() {
    if(selectedEntity != null){
      selectedEntity.rotation.y = toRadians(Number($(this).val()));
      sendEntityInfo(selectedEntity);
      updateEditorUI();
    }
  });

  // Select entities based on entity list box.
  $("#entityList").on("change", function() {

    var id = $("#entityList").val();

    for(var i = 0; i < entities.length; i++){
      if(entities[i].id == id){
        setSelectedEntity(entities[i]);
        break;
      }
    }

    updateEditorUI();
  });

  // double-click an entity in the entity list to center the view on that entity.
  $("#entityList").on("dblclick", function() {

    var id = $("#entityList").val();

    for(var i = 0; i < entities.length; i++){
      if(entities[i].id == id){
        setSelectedEntity(entities[i]);
        break;
      }
    }

    updateEditorUI();
    map.setCenter( getEntityLatLng(selectedEntity) );
  });


  $("#addEntityButton").on("click", function() {
    addEntityAtPlayer();
  });

  $(window).on("keydown", function(e){

    if(currentState == STATE_EDITOR && keyboardActive) {

      // Space bar
      if(e.keyCode == keys.SPACE) { 
        addEntityAtPlayer();
      }

      // Tab
      if(e.keyCode == keys.TAB){
        editModeMovement = (editModeMovement == "fly") ? "dive" : "fly";
      }

      // 1
      if(e.keyCode == keys.NUM_1){
        setCameraMode("chase", 0.25);
      }
      // 2
      if(e.keyCode == keys.NUM_2){
        setCameraMode("editor-persp", 0.25);
      }
      // 3
      if(e.keyCode == keys.NUM_3){
        setCameraMode("editor-top", 0.25);
      }
      // 4
      if(e.keyCode == keys.NUM_4){
        setCameraMode("editor-side", 0.25);
      }

      // delete
      if(e.keyCode == keys.DELETE){
        deleteSelectedEntity();
      }
    }

    if(keyboardActive && (e.keyCode == keys.P)){
      running = !running;
    }

  });


  // toggle keyboard input to keep annoying behavior from happening when you're trying to type..
  $("#editor > input,#levelInfo > fieldset > input").focus( function() {
    keyboardActive = false;
  });
  $("#editor > input,#levelInfo > fieldset > input").on("blur", function() {
    keyboardActive = true;
  });

  $("#saveLevel").on("click", saveCurrentLevel);
}


function saveCurrentLevel() {
  var entityData = [];
    
  var foundDropZone = false;
  var foundLandMark = false;

  var lowestGate = 8000;
  var highestGate = 0;
  var lowestGateIndex = -1;
  var highestGateIndex = -1;

  for(var i = 0; i < entities.length; i++){
    if(entities[i].type == "gate") {
      if(entities[i].position.y < lowestGate) {
        lowestGate = entities[i].position.y;
        lowestGateIndex = i;
      }
      if(entities[i].position.y > highestGate) {
        highestGate = entities[i].position.y;
        highestGateIndex = i;
      }
    }
  }

  for(var i = 0; i < entities.length; i++){
    
    var newEntity = {
      id : entities[i].id,
      type : entities[i].type,
      position : {
        x : entities[i].position.x,
        y : entities[i].position.y,
        z : entities[i].position.z
      },
      rotation : {
        x : entities[i].rotation.x,
        y : entities[i].rotation.y,
        z : entities[i].rotation.z
      },
      params : {}
    };

    // flag the last gate to trigger the end sequence.
    if(i == lowestGateIndex){
      newEntity.params["last"] = true;
    }


    if(entities[i].type == "dropzone"){
      foundDropZone = true;
    }
    if(entities[i].type == "landmark"){
      foundLandMark = true;
      newEntity.model = $("#landmarkObj").val();
    }

    entityData.push(newEntity);
  }

  var errors = [];

  if(!foundDropZone){
    errors.push("You must add a dropzone entity..");
  }

  if(!foundLandMark){
    errors.push("You must add a landmark entity..");
  }

  if( ($("#levelName").val() == "") || ($("#targetName").val() == "") || ($("#targetAddress").val() == "") || ($("#targetCountry").val() == "") || ($("#levelName").val() == "") ) {
    errors.push("All five meta data fields are required..");
  }


  if(errors.length > 0){
    alert("ERROR!!  Please fix these and re-save:\n\n" + errors.join("\n - "));
    return;
  }

  // build the level data into a single object to be stringified later..

  var levelData = {

    "name" : $("#levelName").val(),

    "style" : $("#mapStyle").val(),

    "description":{
      "search" : $("#searchTerm").val(),
      "target" : $("#targetName").val(),
      "address" : $("#targetAddress").val(),
      "country" : $("#targetCountry").val()
    },
    "origin" : currentLevel.origin,
    "entities" : entityData
  };

  var post = {
    "name" : $("#levelName").val(),
    "json" : "mapdive.levels.push(" + JSON.stringify(
      levelData
    ) + ");"
  };

  $.post(WEBSOCKET_SERVER_ADDRESS + "/save-level", post);

  alert("Saved to: /common/levels/" + post["name"] + ".json");
}


function now(){
  return viewState["t"];
}


function deleteSelectedEntity(){
  
  if(selectedEntity != null){
    var entityId = selectedEntity.id;

    selectedEntity.marker.setMap(null);
    
    socket.emit("editor", {"delete" : entityId});

    // find index of the entity based on the id
    var idx = -1;
    for(var i = 0; i < entities.length; i++){
      if(entities[i].id == entityId){
        idx = i;
        break;
      }
    }

    // if it's in the list, remove it.
    if(idx != -1){
      entities.splice(idx, 1);
    }

    // remove the coresponding map marker.
    idx = -1;
    for(var i = 0; i < markers.length; i++){
      if(markers[i].entity.id == entityId){
        idx = i;
        break;
      }
    }
    if(idx != -1){
      markers.splice(idx, 1);
    }
  }

  refreshEntityList();
}


function getAvailableEntityId() {

  var idx = 1;  
  var done = false;
  while(!done) {
    done = true;
    for(var i = 0; i < entities.length; i++) {
      if(entities[i].id == idx){
        idx++;
        done = false;
        break;
      }
    }
  }
  return idx;
}


function getComponentFromGeoResults(addressComponents, component){
  for(var i = 0; i < addressComponents.length; i++){
    for(var n = 0; n < addressComponents[i].types.length; n++){
      if(addressComponents[i].types[n] == component){
        return addressComponents[i].long_name;
      }
    }
  }
  return "";
}


function getTargetNameComponents(components){
  var typeList = ["establishment", "premise", "locality"];
  for(var i = 0; i < typeList.length; i++){
    var text = getComponentFromGeoResults( components, typeList[i]);
    if(text != ""){
      return text;
    }
  }
  return "";
}


function gotoLatLng() {
  var latLngString = $("#search").val();
  var parts = latLngString.split(",");

  if(parts.length == 2){
    var lat = Number(parts[0]);
    var lng = Number(parts[1]);

    var latlng = new google.maps.LatLng(lat,lng);
    map.setCenter(latlng);

    var pt = map.getProjection().fromLatLngToPoint( latlng );

    playerPos.x = pt.x;
    playerPos.z = pt.y;
  }
}


function findLocation() {
  var address = $("#search").val();
    
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
        console.log(results[0]);
        $("#searchTerm").val(address);
        $("#targetName").val(getTargetNameComponents(results[0].address_components));
        $("#targetAddress").val(results[0].formatted_address),
        $("#targetCountry").val( getComponentFromGeoResults(results[0].address_components, "country") );

        var pt = map.getProjection().fromLatLngToPoint( results[0].geometry.location );

        playerPos.x = pt.x;
        playerPos.z = pt.y;

      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
}


function getEntityLatLng( ent ){
  return map.getProjection().fromPointToLatLng( new google.maps.Point(ent.position.x, ent.position.z) );
}


function verifyLevels(){
  for(var i = 0; i < mapdive.levels.length; i++){
    var bonusFound = false;
    var starCount = 0;
    var gateCount = 0;
    for(var e = 0; e < mapdive.levels[i].entities.length; e++){
      var entity = mapdive.levels[i].entities[e];
      if(entity.type == "bonus"){
        bonusFound = true;
      }
      if(entity.type == "gate"){
        gateCount++;
      }
      if(entity.type == "item"){
        starCount++;
      }
    }
    console.log(mapdive.levels[i].name + " | stars:" + starCount + ", gates: " + gateCount + ", bonus: " + bonusFound);
  }
}


function addEntityAtPlayer() {

  var newEntity = {
    id : getAvailableEntityId(),
    type : $("#sourceEntities").val(),
    position : {
      x : playerPos.x,
      y : playerPos.y,
      z : playerPos.z
    },
    rotation : {
      x : 0,
      y : -(playerHeading.get()) - toRadians(90),
      z : 0
    }
  };

  if(newEntity.type == "landmark"){
    newEntity.model = $("#landmarkObj").val();
  }

  // always add dropzones and landmarks on the ground
  if((newEntity.type == "landmark") || (newEntity.type == "dropzone")){
    newEntity.position.y = 0;
  }

  addEntity( newEntity );
  refreshEntityList();

  socket.emit("editor", {"spawn" : newEntity});
}


function initControlUI(){
  $("#mapType").on("change", function() {
    sendMessage({"maptype" : $(this).val()} );
  });


  $("#debugControls").on("mousedown", function (evt) {
    if(controlScheme == "keyboard"){
      controlScheme = "body";
      $("#debugControls").css({"background-color" : "#400000"});
    } else {
      controlScheme = "keyboard";
      $("#debugControls").css({"background-color" : "#000000"});
    }
  });

  $("#debugControls").on("mousemove", function (evt) {
    var x = (evt.offsetX / 150 - 0.5) * 2;
    var y = (evt.offsetY / 150 - 0.5) * 2;
    
    controlValues.speed.set(y);
    controlValues.heading.set(x);
    bodyPose.rightArm = -y;
    bodyPose.leftArm = -y;

    viewState.player.leftarm = (Math.PI / 2) + (evt.offsetY / 150) * (Math.PI);
    viewState.player.rightarm = (-(evt.offsetY / 150)) * (Math.PI) - Math.PI / 2;
  });

  $("#debugControls").on("mouseout", function () {
    controlValues.speed.set(0);
    controlValues.heading.set(0);
  });

  makeToggleButton("pauseButton", function() {
    running = !running;
    return !running; 
  });

  makeToggleButton("centerOnPlayer", function() {
    centerMapOnPlayer = !centerMapOnPlayer;
    return centerMapOnPlayer;
  })

  makeToggleButton("hideHUD", function(){
    hideHUD = !hideHUD;

    sendMessage({"hud" : hideHUD ? "hide" : "show"});

    return hideHUD;
  });

  makeToggleButton("disableGravity", function(){ 
    gravityEnabled = !gravityEnabled;
    return !gravityEnabled;
  });


  $("#resetButton").on("click", function() {
    loadLevel(currentLevel.name);

    // HACK: this code is spoofing the "setGameState" behavior to keep the level from auto-advancing    
    viewState.oldstate = viewState.state;
    viewState.state = STATE_INTRO;
    gameStateManagers[STATE_INTRO].setActive(true);
    currentState = STATE_INTRO;
  });

  $("#idleButton").on("click", function() {
    setGameState(STATE_IDLE);
  })


  $("#increaseViewOffset").on("click", function() {
    viewportMetrics["viewAngleOffset"] += 0.05;
    sendMessage({"viewOffset" : viewportMetrics["viewAngleOffset"]});
  });

  $("#decreaseViewOffset").on("click", function() {
    viewportMetrics["viewAngleOffset"] -= 0.05;
    sendMessage({"viewOffset" : viewportMetrics["viewAngleOffset"]});
  })

  $("#resetGalaxyButton").on("dblclick", function() {
    window.location = "http://localhost:81/change.php?query=relaunch&name=Relaunch";
  });

  // load the dive selection list box
  for(var i = 0; i < mapdive.levels.length; i++){
    var opt = document.createElement("option");
    $(opt).attr("value", mapdive.levels[i].name);
    $(opt).html(mapdive.levels[i].name);
    $("#chooseLevel").append(opt);
  }

  $('#gotoWin').click(function() {
    for(var i = 0; i < entities.length; i++){
      if(entities[i].type == "gate" && entities[i].params["last"]){
        // transport the player to the position of the last gate (this will trigger the win condition)
        playerPos.x = entities[i].position.x;
        playerPos.y = entities[i].position.y;
        playerPos.z = entities[i].position.z;
        break;
      }
    }

    setGameState(STATE_DIVE);
  });

  $('#gotoLoose').click(function() {

    for(var i = 0; i < entities.length; i++){
      if(entities[i].type == "gate" && entities[i].params["last"]){
        // transport the player to a spot off to the side of the last gate, they'll fall past the altitude threshold for the dive and will loose.
        playerPos.x = entities[i].position.x + 0.025;
        playerPos.y = entities[i].position.y;
        playerPos.z = entities[i].position.z + 0.025;
      }
    }

    setGameState(STATE_DIVE);
    
  });

  $("#chooseLevel").on("change", function() {
    var level = $("#chooseLevel").val();
    setLevel(level);
  });

  for(var itm in viewStyles){
    var opt = document.createElement("option");
    $(opt).attr("value", itm);
    $(opt).html(itm);
    $("#mapType").append(opt);
  }


  // Global keyboard handling..
  $(window).on("keydown", function(e){

    keys.states[e.keyCode] = true;
    
    if(e.keyCode == keys.ESCAPE){
      
      if(currentState == STATE_EDITOR){
        setEditModeEnabled(false);
      } else {
        setEditModeEnabled(true);
      }
    }

  });

  $(window).on("keyup", function(e){
    keys.states[e.keyCode] = false;
  });

  // clear out the key-state array.
  for(var i = 0; i < 110; i++){
    keys[i] = false;
  }
}


// Initialize Page!
$(document).on("ready", function() {
  
  mapdive.sound.initialize();
  mapdive.sound.setMute(true);

  initEditorUI();
  initControlUI();

  startTime = new Date().getTime() * 0.001;
  
  initializeSocket("controller", socketConnected); 
});