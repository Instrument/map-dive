var urlParams = {};

var currentLevel = mapdive.getLevelByName("moscone_center");

var assetManager;
var mapManager;

var camera;
var cameraContainer;


// global game state, updated when new messages come in over the socket.
var gameState = {
    "player" : {
        pos : [0,0,0],
        dir : [0,0,0]
    },
    "cam" : {
        pos : [0,0,0],
        speed : 0
    },
    gates:0,
    stars:0
};

var currentBaseStyle = "default";
var currentBonusStyle = "";
var bonusModeActive = false;

var skyLight = null;
var sunLight = null;

// connection to the server.
var socket;

// Three.js scene and renderer
var scene;
var renderer;

// todo: put these in the specific HUD .js file, no need to have this GL context present on every viewport.
var HUDscene;
var HUDrenderer;
var HUDcamera;

// list of active entities.
var entities = [];

// Flipped to true when all the initialization bits are complete.
var engineRunning = false;

// scale factor to transform GL coordinates to google maps coordinates.
var mapScale = (1 << 12);

// the player!!
var player;

// the level landmark
var landmark; 

// The last gate in the level, keep a reference to that specific gate, it's used in the ending sequence for procedural animation.
var lastGate;

// BIG DOME OF SKY!
var skyDome;
var skyDomeUniforms;

// list of HUD items, changes based on viewport index.
var HUDItems = [];

// Camera state, used for procedural time-based camera behaviors.
// TODO: Camera behavior should be handled in the control console and camera position/orientation should be broadcast to the viewports.  
// Handling camera logic on the viewport side is cumbersome.
var cameraState = {
    "previousBehavior" : "",
    "behavior" : "idle-side",
    "behaviorChangeTime" : 0,
    "transitionStart" : 0,
    "transitionDuration" : 0,
	"x" : 40.77799111111109, 
	"y" : 200,
	"z" : 91.65824101821511,
	"target" : new THREE.Vector3(),
    "speed" : 0,
    "orbit" : 0,
    "inclination": 0,
    "distance" : 0,
    "introStartY" : 0,
};


function initializeMap() {
	mapManager = new mapdive.MapManagerCSS({
		"scene" : scene,
		"mapContainerId" : "map-container",
		"cssViewportId" : "css-viewport",
		"screenWidth" : viewportMetrics.width,
		"screenHeight" : viewportMetrics.height,
		"FOV" : viewportMetrics.FOV
	});
}


function initializeWebGL() {

	console.log("Initializing WebGL");

	scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera( viewportMetrics.FOV, viewportMetrics.width / viewportMetrics.height, 1, 100000 );

    // camera is set to origin, rotated on the Y axis according to the viewport offset.	
	camera.position.set(0, 0, 0);
	camera.up.set(1, 0, 0);
    camera.rotation.set(0, (180 + (viewportMetrics.viewIndex * viewportMetrics.viewAngleOffset)) * Math.PI / 180, 0);

    // camera is a child of cameraContainer, so camera container is used as the camera, so the actual camera Y-axis offset is carried along from any
    // rotation/translation of the parent.  This keeps all the viewports in sync.
	cameraContainer = new THREE.Object3D();
	cameraContainer.position.set(0, 0, 0);
	cameraContainer.add(camera);

	scene.add(cameraContainer);


    var vertexShader = document.getElementById( 'vertexShader' ).textContent;
    var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
    skyDomeUniforms = {
        topColor:    { type: "c", value: new THREE.Color( 0xffffff ) },
        bottomColor: { type: "c", value: new THREE.Color( 0x0 ) },
        offset:      { type: "f", value: 0 },
        exponent:    { type: "f", value: 0.18 }
    }
    var skyGeo = new THREE.SphereGeometry( 25000, 24, 16, 0, Math.PI * 2, 0, Math.PI );
    var skyMat = new THREE.ShaderMaterial( { fog: false, vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: skyDomeUniforms, side: THREE.BackSide } );

    skyDome = new THREE.Mesh( skyGeo, skyMat );
    skyDome.position.y = 2500;
    scene.add( skyDome );

    scene.add(new THREE.AmbientLight( 0x505050, 0.01));

    // Add sun light
	sunLight = new THREE.DirectionalLight(0x909090, 1);
	sunLight.castShadows = false;
    sunLight.position.set( -0.7, 1, -0.5);

    sunLight.position.normalize();
    scene.add(sunLight);

    // set up the viewport
	var webGL =  document.getElementById( 'webgl-viewport' );
	renderer = new THREE.WebGLRenderer({
        precision:'highp',
        antialias: true,
        stencil: false,
        premultipliedAlpha: true 
    });
    renderer.sortObjects = false;
	
    renderer.setSize( viewportMetrics.width, viewportMetrics.height );

    webGL.appendChild( renderer.domElement );

    console.log("WebGL Initialized");
}


// Initialize any UI needed for this viewport.
function initializeHUD() {
    console.log('Initializing HUD');

    // todo: move all of this initialization stuff into the PlayerHUD class.
    HUDscene = new THREE.Scene();
    
    HUDcamera= new THREE.PerspectiveCamera( viewportMetrics.FOV, viewportMetrics.width / viewportMetrics.height, 1, 5000 );
    HUDcamera.position.set(0, 0, 500);

    HUDrenderer  = new THREE.WebGLRenderer({antialias: true});
    HUDrenderer.maxMorphTargets = 6;
    HUDrenderer.setSize( viewportMetrics.width, viewportMetrics.height );

    $('#hud-viewport').append(HUDrenderer.domElement);

    // add some ambient light to the scene
    var light = new THREE.AmbientLight( 0x202020 );
    HUDscene.add( light );

    var directionalLight = new THREE.DirectionalLight(0xa8a8a8);
    directionalLight.castShadows = true;
    directionalLight.position.x = -1;
    directionalLight.position.y = 0.7;
    directionalLight.position.z = 1;
    directionalLight.position.normalize();
    HUDscene.add(directionalLight);

    // Figure out which HUD elements need to be created based on which viewport this is.
    switch(viewportMetrics.viewIndex){
        case 0: // MAIN HUD on the center screen
            HUDItems.push(new HelpTextHUD());
            HUDItems.push(new InstructionsHUD());
            HUDItems.push(new PlayerHUD());
            break;

        case -3: // far right viewport has minimap.
            HUDItems.push( new MiniMapHUD() );
            HUDItems.push( new CopyrightHUD() );
            break;

        case 3: // far left viewport has info panels
            HUDItems.push( new MapInfoHUD() );
            HUDItems.push( new LogoHUD() );
            break;
    }

    // initialize all the HUD items, now that any required ones have been instantiated.
    for(var i = 0; i < HUDItems.length; i++){
        HUDItems[i].initialize();
    }

    // Remove anything that isn't being used by some HUD element, this keeps DOM clean for easier debugging.
    $("#HUD > [data-active='false']").remove();
    console.log("HUD Items initialized");
}


// Update the current camera state.  This includes tweening between the previous camera state and current camera state when needed.
function updateCamera() {

    var cam1 = getCamPosition(cameraState.behavior);

    // if a camera transition is occuring, lerp the camera position and target to perform the transition.
    if( (gameState.t - cameraState.transitionStart) < cameraState.transitionDuration) {
        
        var transitionPercent = 1 - ((gameState.t - cameraState.transitionStart) / cameraState.transitionDuration);
        
        transitionPercent = Easing.easeInOutQuad(0, transitionPercent, 0, 1, 1); // ease the lerp

        var cam2 = getCamPosition(cameraState.previousBehavior);

        // interpolate the cam
        cam1.target.lerp(cam2.target, transitionPercent);
        cam1.position.lerp(cam2.position, transitionPercent);
        
    }

    // update the camera container.
    cameraState.target.copy(cam1.target);
    cameraContainer.position.copy(cam1.position);
    cameraContainer.lookAt(cam1.target);

    cameraState.x = cameraContainer.position.x / mapScale;
    cameraState.z = cameraContainer.position.z / mapScale;
}


// Get camera positions based on camera type.  
// All camera position functions return an object with a "position" and "target" vector.
function getCamPosition( camType ){
    switch(camType){
        case "chase" : 
            return getChaseCamPositions();
            break;

        case "idle" : 
        case "idle-side" : 
        case "idle-above" : 
            return getIdleCamPositions(camType);
            break;

        case "intro_climb":
        case "intro_float":
        case "intro_swoop":
            return getIntroCamPositions(camType);
            break;

        case "closeup" :
            return getCloseupCamPositions();
            break;

        case "editor-persp" : 
        case "editor-top" : 
        case "editor-side" : 
            return getEditorCamPositions(camType);
            break; 

        case "end-player1":
        case "end-landmark1":
        case "end-landmark2":
        case "end-landmark3":
        case "end-player2":
        case "end-loose1":
            return getEndCamPositions(camType);
            break;

        case "countdown":
            return getCountdownCamPositions();
            break;

        default: 
            return getChaseCamPositions();
            break;
    }
}


function getEndCamPositions(type) {

    var target = new THREE.Vector3();
    var position = new THREE.Vector3();
    var offset = new THREE.Vector3();
    
    var orbit = 0;
    var inclination = 0;
    var distanceToTarget = 0;

    var elapsedSeconds = (gameState.t - cameraState.transitionStart);

    switch(type) {
        case 'end-player1': // STOP MOVING CAMERA, FOLLOW PLAYER TOWARDS LANDMARK
            target.copy(player.getPosition());          // look at the player
            position.copy(lastGate.position);
            distanceToTarget = 0;                         // no offset
            break;

        case 'end-landmark2': // SWITCH TO LANDMARK VIEW FROM ABOVE SEEING PLAYER COME IN
            target.copy(landmark.position);             // look at the landmark
            target.y = 100;
            position.copy(player.getPosition());           // position the cam
            position.y = 0;
            orbit = elapsedSeconds * 0.1;
            distanceToTarget = 250 + (elapsedSeconds * 50);
            inclination = Math.PI * 0.25;
            
            break;
        case 'end-landmark1': // LOOKING FLAT AT LANDMARK
            target.copy(player.getPosition());
            position.copy(landmark.position);
            position.y = 280;
            inclination = Math.PI * 0.78;
            orbit = Math.PI*0.5;
            distanceToTarget = 330;
            break;

        case 'end-player2': // PLAYER GOING BACK TO THE CLOUDS
            target.copy(player.getPosition());   // track the player
            position.copy(landmark.position);    // stop the cam where it is
            position.y = 100;
            orbit = 0;
            inclination = Math.PI * 0.5;
            distanceToTarget = 100;
            break;

        case 'end-loose1':
            target.copy(player.getPosition());
            position.copy(player.getPosition());           
            orbit = lapsedSeconds * 0.4;
            distanceToTarget = 150 + (elapsedSeconds * 20);
            inclination = Math.PI * 0.20;
            break;
    }
    
    
    offset.set(
        Math.cos(orbit) * Math.sin(inclination) * distanceToTarget,
        Math.cos(inclination) * distanceToTarget,
        Math.sin(orbit) * Math.sin(inclination) * distanceToTarget
    );
    position.add(offset);

    return {
        "position" : position,
        "target" : target
    };
}


function getEditorCamPositions(type) {

    var offsets = {
        "editor-top" : [1, 50, 0],
        "editor-persp" : [55, 65, 0],
        "editor-side" : [50, 0, toRadians(90)]
    };

    var target = new THREE.Vector3();
    var position = new THREE.Vector3();

    var heading = gameState.player.dir[0] + offsets[type][2];
   
    position.x = player.getPosition().x - (Math.cos(heading) * offsets[type][0]);
    position.y = player.getPosition().y + offsets[type][1];
    position.z = player.getPosition().z - (Math.sin(heading) * offsets[type][0]);
    
  
    target.x = player.getPosition().x;
    target.y = player.getPosition().y;
    target.z = player.getPosition().z;

    return {
        "position" : position,
        "target" : target
    };
}


function getIntroCamPositions(camType){

    var target = new THREE.Vector3();
    var position = new THREE.Vector3();

    var heading = gameState.player.dir[0];
    var roll = gameState.player.dir[2];
    var updateTime = gameState.t*1000;
    
    var distanceToPlayer = (Math.sin(updateTime * 0.00025) * Math.sin(updateTime*0.00014+2) * 6) + 25;
    distanceToPlayer += 80;


    switch(camType){
        case "intro_climb":
            position.x = player.getPosition().x - (Math.cos(heading) * distanceToPlayer);
            position.y = cameraState.introStartY;
            position.z = player.getPosition().z - (Math.sin(heading) * distanceToPlayer);
        break;

        case "intro_float":
            position.x = (currentLevel.origin.position.x * mapScale) - (Math.cos(currentLevel.origin.rotation.y) * distanceToPlayer);
            position.y = 4000;
            position.z = (currentLevel.origin.position.z * mapScale) - (Math.sin(currentLevel.origin.rotation.y) * distanceToPlayer);
        break;

        case "intro_swoop":
            position.x = (currentLevel.origin.position.x * mapScale) - (Math.cos(currentLevel.origin.rotation.y) * (distanceToPlayer / 2.5));
            position.y = 4110;
            position.z = (currentLevel.origin.position.z * mapScale) - (Math.sin(currentLevel.origin.rotation.y) * (distanceToPlayer / 2.5));
        break;
    }
    
  
    target.x = player.getPosition().x;
    target.y = player.getPosition().y;
    target.z = player.getPosition().z;

    return {
        "position" : position,
        "target" : target
    };
}


function getCloseupCamPositions() {

    var target = new THREE.Vector3();
    var position = new THREE.Vector3();

    var heading = gameState.player.dir[0];
    var roll = gameState.player.dir[2];
    var updateTime = gameState.t*1000;
    
    var distanceToPlayer = (Math.sin(updateTime * 0.00025) * Math.sin(updateTime*0.00014+2) * 6) + 25;
    distanceToPlayer += 20;

    position.x = player.getPosition().x - (Math.cos(heading) * distanceToPlayer);
    position.y = player.getPosition().y + 5 + Math.sin(updateTime * 0.00025) * Math.sin(updateTime*0.00014+2) ;
    position.z = player.getPosition().z - (Math.sin(heading) * distanceToPlayer);
    
  
    target.x = player.getPosition().x;
    target.y = player.getPosition().y;
    target.z = player.getPosition().z;

    return {
        "position" : position,
        "target" : target
    };
}


function getChaseCamPositions() {

    var target = new THREE.Vector3();
    var position = new THREE.Vector3();


    var heading=gameState.player.dir[0];
    var roll=gameState.player.dir[2];
    var updateTime=gameState.t*1000;
    
    var distanceToPlayer = (Math.sin(updateTime*0.00025) * Math.sin(updateTime*0.00014+2) * 25) + 80;
    distanceToPlayer += 35;
    
    distanceToPlayer += (gameState.cam.speed * 30);

    var speedAngle = toRadians(65 + 11 * gameState.cam.speed);

    var wobbleAmount = 0.4;

    position.x = player.getPosition().x - (Math.cos(heading) * distanceToPlayer) * Math.cos(speedAngle) + (Math.sin(updateTime*0.0011) * Math.sin(updateTime*0.0001+1) * distanceToPlayer * 0.05 * wobbleAmount);
    position.y = player.getPosition().y + (Math.sin(speedAngle) * distanceToPlayer * 1.1) + (Math.sin(updateTime*0.0004)*Math.sin(updateTime*0.0002+2)*distanceToPlayer*0.2*wobbleAmount);
    position.z = player.getPosition().z - (Math.sin(heading) * distanceToPlayer) * Math.cos(speedAngle) + (Math.sin(updateTime*0.00013)*Math.sin(updateTime*0.0001+3)*distanceToPlayer*0.05*wobbleAmount);   

    target.x = player.getPosition().x + (Math.sin(updateTime*0.0013+2)*Math.sin(updateTime*0.00017+3)*distanceToPlayer*0.025) * 0.35 * wobbleAmount;
    target.y = player.getPosition().y + (Math.sin(updateTime*0.0023+1)*Math.sin(updateTime*0.00013+2)*distanceToPlayer*0.025) * 0.5 * wobbleAmount;
    target.z = player.getPosition().z + (Math.sin(updateTime*0.0017+4)*Math.sin(updateTime*0.00011+1)*distanceToPlayer*0.025) * 0.5 * wobbleAmount;
    
    return {
        "position" : position,
        "target" : target
    };
}


function getIdleCamPositions(camType) {

    var target = new THREE.Vector3();
    var position = new THREE.Vector3();

    var heading=gameState.player.dir[0];
    var roll=gameState.player.dir[2];
    var updateTime=gameState.t*1000;
    var wobbleAmount = 0.35;
    var distanceToPlayer = 40;

    switch(camType){
        case "idle":
            distanceToPlayer = (Math.sin(updateTime*0.00025) * Math.sin(updateTime*0.00014+2) * 60) + 140;

            var speedAngle = toRadians(30 + 30 * (Math.cos(updateTime*0.000125) * Math.sin(updateTime*0.00002+2)));

            position.x = player.getPosition().x - (Math.cos(heading) * distanceToPlayer) * Math.cos(speedAngle) + (Math.sin(updateTime*0.0011) * Math.sin(updateTime*0.0001+1) * distanceToPlayer * 0.05 * wobbleAmount);
            position.y = player.getPosition().y + (Math.sin(speedAngle) * distanceToPlayer * 1.1) + (Math.sin(updateTime*0.0004)*Math.sin(updateTime*0.0002+2)*distanceToPlayer*0.2*wobbleAmount);
            position.z = player.getPosition().z - (Math.sin(heading) * distanceToPlayer) * Math.cos(speedAngle) + (Math.sin(updateTime*0.00013)*Math.sin(updateTime*0.0001+3)*distanceToPlayer*0.05*wobbleAmount);   
        break;

        case "idle-above":
            var wobbleAmount = 0.55;
            distanceToPlayer = (Math.sin(updateTime*0.00025) * Math.sin(updateTime*0.00014+2) * 80) + 350;
            var speedAngle = toRadians(65 + 10 * (Math.cos(updateTime*0.000125) * Math.sin(updateTime*0.00002+2)));

            position.x = player.getPosition().x - (Math.cos(heading) * distanceToPlayer) * Math.cos(speedAngle) + (Math.sin(updateTime*0.0011) * Math.sin(updateTime*0.0001+1) * distanceToPlayer * 0.05 * wobbleAmount);
            position.y = player.getPosition().y + (Math.sin(speedAngle) * distanceToPlayer * 1.1) + (Math.sin(updateTime*0.0004)*Math.sin(updateTime*0.0002+2)*distanceToPlayer*0.2*wobbleAmount);
            position.z = player.getPosition().z - (Math.sin(heading) * distanceToPlayer) * Math.cos(speedAngle) + (Math.sin(updateTime*0.00013)*Math.sin(updateTime*0.0001+3)*distanceToPlayer*0.05*wobbleAmount);   
        break;

        case "idle-side":
            var wobbleAmount = 0.40;
            distanceToPlayer = (Math.sin(updateTime*0.00025) * Math.sin(updateTime*0.00014+2) * 40) + 70;
            var speedAngle = toRadians(40 + 20 * (Math.cos(updateTime*0.000125) * Math.sin(updateTime*0.00002+2)));

            heading += Math.PI / 2;

            position.x = player.getPosition().x - (Math.cos(heading) * distanceToPlayer) * Math.cos(speedAngle) + (Math.sin(updateTime*0.0011) * Math.sin(updateTime*0.0001+1) * distanceToPlayer * 0.05 * wobbleAmount);
            position.y = player.getPosition().y + (Math.sin(speedAngle) * distanceToPlayer * 1.1) + (Math.sin(updateTime*0.0004)*Math.sin(updateTime*0.0002+2)*distanceToPlayer*0.2*wobbleAmount);
            position.z = player.getPosition().z - (Math.sin(heading) * distanceToPlayer) * Math.cos(speedAngle) + (Math.sin(updateTime*0.00013)*Math.sin(updateTime*0.0001+3)*distanceToPlayer*0.05*wobbleAmount);   
        break;
    }
   
    target.x = player.getPosition().x + (Math.sin(updateTime*0.0013+2)*Math.sin(updateTime*0.00017+3)*distanceToPlayer*0.025) * 0.35 * wobbleAmount;
    target.y = player.getPosition().y + (Math.sin(updateTime*0.0023+1)*Math.sin(updateTime*0.00013+2)*distanceToPlayer*0.025) * 0.5 * wobbleAmount;
    target.z = player.getPosition().z + (Math.sin(updateTime*0.0017+4)*Math.sin(updateTime*0.00011+1)*distanceToPlayer*0.025) * 0.5 * wobbleAmount;
    
    return {
        "position" : position,
        "target" : target
    };
}


function getCountdownCamPositions() {

    var target = new THREE.Vector3();
    var position = new THREE.Vector3();


    var heading=gameState.player.dir[0];
    var roll=gameState.player.dir[2];
    var updateTime=gameState.t * 1000;
    
    var distanceToPlayer = (Math.sin(updateTime*0.00025) * 25 * Math.sin(updateTime*0.00014+2)) + 40;
    
    distanceToPlayer += (gameState.cam.speed * 40);

    var speedAngle = toRadians(30);

    var wobbleAmount = 1.5;
    var wobbleSpeed = 0.9;

    updateTime *= wobbleSpeed;
    
    position.x = player.getPosition().x - (Math.cos(heading) * distanceToPlayer) * Math.cos(speedAngle) + (Math.sin(updateTime*0.0011) * Math.sin(updateTime*0.0001+1) * distanceToPlayer * 0.05 * wobbleAmount);
    position.y = player.getPosition().y + (Math.sin(speedAngle) * distanceToPlayer * 1.1) + (Math.sin(updateTime*0.0004)*Math.sin(updateTime*0.0002+2)*distanceToPlayer*0.2*wobbleAmount);
    position.z = player.getPosition().z - (Math.sin(heading) * distanceToPlayer) * Math.cos(speedAngle) + (Math.sin(updateTime*0.00013)*Math.sin(updateTime*0.0001+3)*distanceToPlayer*0.05*wobbleAmount);


    target.x = player.getPosition().x + (Math.sin(updateTime*0.0013+2)*Math.sin(updateTime*0.00017+3)*distanceToPlayer*0.025) * 0.35 * wobbleAmount;
    target.y = player.getPosition().y + (Math.sin(updateTime*0.0023+1)*Math.sin(updateTime*0.00013+2)*distanceToPlayer*0.025) * 0.5 * wobbleAmount;
    target.z = player.getPosition().z + (Math.sin(updateTime*0.0017+4)*Math.sin(updateTime*0.00011+1)*distanceToPlayer*0.025) * 0.5 * wobbleAmount;
    
    return {
        "position" : position,
        "target" : target
    };
}


// Update all entities.
function updateEntities(data){
    for(var i = 0; i < entities.length; i++){
        entities[i].update( data["t"] );
    }
}


// Unloads all entities.
function unloadCourse(excludeClouds) {
    for(var i = 0; i < entities.length; i++){
        scene.remove( entities[i].getObject3d());
        entities[i].dispose();
    }

    entities = [];
}


// for debugging, get rid of entities by their type
function removeEntitiesByType(type) {
    for(var i = 0; i < entities.length; i++){
        if(entities[i].type == type){
            scene.remove( entities[i].getObject3d());
            entities[i].dispose();
            entities.splice(i,1);
            if(entities.length > 0){
                i--;
            }
        }
    }
}


// Load a dive.
function loadCourse(levelInfo) {

    unloadCourse();

    console.log("Loading new dive: " + levelInfo.name);

    currentLevel = mapdive.getLevelByName(levelInfo["name"]);

    Math.seedrandom('yay.');
    
    // this needs to happen before we do the crowd
    player.initialize();
    var foundLastGate = false;
    
    for(var i = 0; i < currentLevel.entities.length; i++){
    	var entity = currentLevel.entities[i];
        if(entity.type == "gate") {
            var gate = new mapdive.GateEntity(entity.id, {
                "end_gate" : entity.params["last"],
                "model" : assetManager.getModel("gate_" + levelInfo["gateStyle"]),
                "style" : currentBaseStyle,
		    	"position" : {
		    		"x" : (entity.position.x * mapScale), 
		    		"y" : entity.position.y,
		    		"z" : (entity.position.z * mapScale)
		    	},
		    	"rotation" : {
		    		"x" : entity.rotation.x, 
		    		"y" : entity.rotation.y, 
                    "z" : entity.rotation.z
		    	},
		    	"scale" : 1
		    });
		    
            scene.add(gate.getObject3d());
		    entities.push(gate);
            
            if(entity.params["last"]){
                foundLastGate = true;
                lastGate = gate.getObject3d();
            }
        }

        if(entity.type == "landmark") {
            var landmarkParams = mapdive.getLandmarkParams(entity.model);

            var target = new mapdive.LandmarkEntity(entity.id, {
                "modelName" : entity.model,
                "model" : assetManager.getModel(entity.model),
                "style" : currentBaseStyle,
                "position" : {
                    "x" : (entity.position.x * mapScale), 
                    "y" : entity.position.y,
                    "z" : (entity.position.z * mapScale)
                },
                "rotation" : {
                    "x" : 0, 
                    "y" : entity.rotation.y,
                    "z" : 0
                },
                "scale" : 1
            });

            scene.add(target.getObject3d());
            entities.push(target);

            // keep a reference to the landmark object
            landmark = target.getObject3d();

            var landmarkPos = target.getObject3d().position;
            
            var fireworks = new mapdive.FireworksEntity("fireworks", {
                position : landmarkPos, 
                scale : 0.01}
            );

            scene.add(fireworks.getObject3d());
            entities.push(fireworks);

            // Let the map manager know where the new landing zone is.
            mapManager.setTarget( entity.position.x, entity.position.z );
        }

        // stars..
        if(entity.type == "item"){
            var item = new mapdive.ItemEntity(entity.id, {
                "model" : assetManager.getModel("star"),
                "style" : currentBaseStyle,
                "position" : {
                    "x" : (entity.position.x * mapScale), 
                    "y" : entity.position.y,
                    "z" : (entity.position.z * mapScale)
                },
                "rotation" : {
                    "x" : 0, 
                    "y" : 0, 
                    "z" : 0
                },
                "scale" : 1
            });

            scene.add(item.getObject3d());
            entities.push(item);
        }

        // Bonus item
        if(entity.type == "bonus"){

            currentBonusStyle = levelInfo["bonusStyle"];

            var item = new mapdive.BonusEntity(entity.id, {
                "model" : assetManager.getModel("bonus_" + currentBonusStyle),
                "texture" : assetManager.getTexture("bonus_" + currentBonusStyle),
                "position" : {
                    "x" : (entity.position.x * mapScale), 
                    "y" : entity.position.y,
                    "z" : (entity.position.z * mapScale)
                },
                "rotation" : {
                    "x" : 0, 
                    "y" : 0, 
                    "z" : 0
                },
                "scale" : 2
            });

            scene.add(item.getObject3d());
            entities.push(item);
        }
	}

    if (!foundLastGate && gate){
        // if no gate was specifically marked as last, use the last one in the list..
        lastGate = gate.getObject3d();
    }

    player.addTrails();


    var cylinder = new mapdive.CylinderEntity("cylinder", { position:landmark.position, scale:1 });
    scene.add(cylinder.getObject3d());
    entities.push(cylinder);

    
    // mid range clouds
    for(var i = 0; i < 20; i++){
        var r=Math.random()*2000+350;
        var a=Math.random()*Math.PI*2;

        var cloud = new mapdive.BillboardEntity( "cloud"+i, {
            "position" : {"x" : (landmark.position.x + Math.cos(a)*r ) , "y" : randomRange(300, 1500), "z" : (landmark.position.z + Math.sin(a)*r )},
            "texture" : assetManager.getTexture("cloud"),
            "scale" : randomRange(1, 3),
            "opacity" : randomRange(0.55, 0.75)
        } );
       
        scene.add(cloud.getObject3d());
        entities.push(cloud);
    }
    
    
    var distance = randomRange(0,250);
    var originOffsetX = Math.cos(currentLevel.origin.rotation.y);
    var originOffsetZ = Math.sin(currentLevel.origin.rotation.y);

    for(var i = 0; i < 10; i++){
       // add some clouds right around origin point (for intro)

        var r=Math.random()*80+20;
        var a=Math.random()*Math.PI*2;

        var cloud = new mapdive.BillboardEntity( "top_cloud", {
            "position" : {"x" : (originOffsetX + currentLevel.origin.position.x * mapScale + Math.cos(a)*r ) , "y" : randomRange(3950, 4000), "z" : (originOffsetZ + currentLevel.origin.position.z * mapScale + Math.sin(a)*r )},
            "texture" : assetManager.getTexture("cloud"),
            "scale" : randomRange(0.15, 0.25),
            "opacity" : randomRange(0.7, 0.9)
        } );
       
        scene.add(cloud.getObject3d());
        entities.push(cloud);
    }

    var cloud = new mapdive.TransitionCloudEntity( "transition_cloud", {
        "position" : {"x" : (currentLevel.origin.position.x * mapScale + Math.cos(a)*r ) , "y" : 10000, "z" : (currentLevel.origin.position.z * mapScale + Math.sin(a)*r )},
        "texture" : assetManager.getTexture("cloud"),
        "scale" : 4
    } );
    scene.add(cloud.getObject3d());
    entities.push(cloud);
       
    for(var i = 0; i < HUDItems.length; i++){
        if(typeof(HUDItems[i].reset) == "function"){
            HUDItems[i].reset();
        }
    }

    currentBaseStyle = levelInfo["baseStyle"];
    setStyle(levelInfo["baseStyle"]);

    for(var i = 0; i < HUDItems.length; i++) {
        if(typeof(HUDItems[i].setStyle) == "function"){
            HUDItems[i].setStyle(levelInfo["baseStyle"], viewStyles[levelInfo["baseStyle"]]);
        }
    }
}


// Render the scene.  This is called when "viewstate" messages come in from the server.
function render() {
	if(engineRunning) {
		
        renderer.render( scene, camera );
		
		mapManager.update(cameraState);

        if (cameraState.behavior.indexOf('end')==0) {
            mapManager.setZoomLevel(12);
        }
        else if (cameraState.behavior.indexOf('idle')==0) {
            mapManager.setZoomLevel(11);   
        }
        else mapManager.setZoomLevel(getZoomLevelForAltitude(cameraContainer.position.y));
		
        mapManager.render();

        HUDrenderer.render(HUDscene, HUDcamera);
       
        for(var i = 0; i < HUDItems.length; i++){
           HUDItems[i].update(gameState.t);
        }
        requestAnimationFrame(render);
	}
}


// set the current view style (map style, sky color, etc)
function setStyle(name){
    console.log("Setting game style: " + name);
	
    $("#css-viewport").animate({"backgroundColor" : viewStyles[name].horizon});
	
    skyDomeUniforms.topColor.value.setStyle(viewStyles[name].sky);
    skyDomeUniforms.bottomColor.value.setStyle(viewStyles[name].horizon);

    if(viewStyles[name].lights){
        sunLight.color.setStyle(viewStyles[name].lights.sun);
        skyLight.groundColor.setStyle(viewStyles[name].lights.ground);
        skyLight.color.setStyle(viewStyles[name].lights.sky);
    }

    player.setStyle(name, viewStyles[name]);
	
    mapManager.setStyle(name, viewStyles[name]);

    for(var i = 0; i < HUDItems.length; i++) {
        if(typeof(HUDItems[i].setStyle) == "function"){
            HUDItems[i].setStyle(name, viewStyles[name]);
        }
    }

    for(var i = 0; i < entities.length; i++) {
        entities[i].message( {"style" : name, "params" : viewStyles[name] } );
    }
}


// parse url parameters, currently only used for view offset.
function loadURLParams() {
    var hashString = window.location.hash;
    
    if(hashString != "") {
        hashString = hashString.replace("#", "");
        hashPairs = hashString.split("&");

        for(var i = 0; i < hashPairs.length; i++){
            var parts = hashPairs[i].split("=");
            urlParams[parts[0]] = parts[1];
        }
    }

    viewportMetrics["viewIndex"] = urlParams["viewOffset"] ? parseInt(urlParams["viewOffset"], 10) : 0;
    console.log("Loaded URL parameters");
}


function loadAssets() {

    assetManager = new mapdive.AssetManager();

    // queue up all the assets to be loaded

    assetManager.addModel("pegman",     "models/pegman_w_backpack_01.obj");

    assetManager.addModel("pegmanHUD",  "models/expressions/full_model.obj");

    assetManager.addJSONModel("pegmanFaces",  "models/expressions/expressions.js");

    assetManager.addModel("parachute",           "models/pegman_parachute.obj");

    assetManager.addModel("gate_0",           "models/gates/gate_rhombus_checkered.obj");
    assetManager.addModel("gate_1",           "models/gates/gate_rhombus.obj");
    assetManager.addModel("gate_2",           "models/gates/gate_torus_concave.obj");
    assetManager.addModel("gate_3",           "models/gates/gate_torus_convex_checkered.obj");
    assetManager.addModel("gate_4",           "models/gates/gate_torus.obj");
    assetManager.addModel("gate_5",           "models/gates/gate_tube_fatty_two.obj");
    assetManager.addModel("gate_6",           "models/gates/gate_tube_fatty.obj");
    assetManager.addModel("gate_7",           "models/gates/gate_tunnel_one.obj");
    assetManager.addModel("gate_8",           "models/gates/gate_tunnel_two.obj");


    assetManager.addModel("landmark_base",           "models/landmarks/base.obj");   
    for(var i = 0; i < mapdive.landmarks.length; i++){
        assetManager.addModel(mapdive.landmarks[i]["name"],  mapdive.landmarks[i]["model"]);
    }

    // Load style textures.
    assetManager.addTexture("base_default",    "textures/landmarks/base_default.png");
    assetManager.addTexture("dropzone_default", "textures/landmarks/dropzone_default.png");
    assetManager.addTexture("star_default",  "textures/stars/star_default.png");
    assetManager.addTexture("gate_default","textures/gates/gate_urban.png");
    assetManager.addTexture("gate_start",  "textures/gates/gate_start_end.png");
    
    // loop through all map styles, load any textures that are needed for that specific style
    for(var itm in viewStyles){
        if(viewStyles[itm].textures){

            if(viewStyles[itm].textures.base) {
                assetManager.addTexture("base_" + itm,    "textures/" + viewStyles[itm].textures.base);
            }
            if(viewStyles[itm].textures.dropzone){
                assetManager.addTexture("dropzone_" + itm,    "textures/" + viewStyles[itm].textures.dropzone);
            }
            if(viewStyles[itm].textures.star){
                assetManager.addTexture("star_" + itm,    "textures/" + viewStyles[itm].textures.star);
            }
            if(viewStyles[itm].textures.gate){
                assetManager.addTexture("gate_" + itm,    "textures/" + viewStyles[itm].textures.gate);
            }
        }
    }

    assetManager.addModel("star",           "models/items/star.obj");

    var bonusItems = ["8bit", "burningman", "night", "raver", "revolutions", "scifi", "terminal", "volcano"];
    for(var i = 0; i < bonusItems.length; i++){
       assetManager.addModel("bonus_" + bonusItems[i],    "models/items/bonus_" + bonusItems[i] + ".obj");
       assetManager.addTexture("bonus_" + bonusItems[i],    "textures/bonus/bonus_" + bonusItems[i] + ".png");

       assetManager.addTexture("head_" + bonusItems[i],    "textures/pegman/pegman_" + bonusItems[i] + "_head.png");
       assetManager.addTexture("helmet_" + bonusItems[i],    "textures/pegman/pegman_" + bonusItems[i] + "_helmet.png");
       assetManager.addTexture("body_" + bonusItems[i],    "textures/pegman/pegman_" + bonusItems[i] + "_bodypart.png");
       assetManager.addTexture("backpack_" + bonusItems[i],    "textures/pegman/pegman_" + bonusItems[i] + "_backpack.png");
    }

    assetManager.addTexture("head_default",    "textures/pegman/pegman_default_head.png");
    assetManager.addTexture("helmet_default",    "textures/pegman/pegman_default_helmet.png");
    assetManager.addTexture("body_default",    "textures/pegman/pegman_default_bodypart.png");
    assetManager.addTexture("backpack_default",    "textures/pegman/pegman_default_backpack.png");

    assetManager.addTexture("TEXTURE_MISSING",    "textures/texture_missing.png");

    assetManager.addTexture("cloud",    "images/cloud.png");
    assetManager.addTexture("particle",  "images/particle.png");
    assetManager.addTexture("parachute",  "textures/parachute.png");
    
    assetManager.addTexture("helmetHUD",  "textures/pegman_helmet_hud.png"); // we need it twice, because diff contexts
    
    // start the actual loading process, callback is invoked when everything is done loading
    assetManager.loadAssets( assetsLoaded );
}


// Callback from socket.io
function socketConnected(_socket){
    
    console.log("Socket connected!");

	socket = _socket;

    // messages from the game editor
    socket.on("editor", function(data) {
        
        // Spawn a new entity
        if(data["spawn"]){
            
            var entity = data["spawn"];

            var entityProperties = {
                "style" : "default",
                "position" : {
                    "x" : (entity.position.x * mapScale), 
                    "y" : entity.position.y,
                    "z" : (entity.position.z * mapScale)
                },
                "rotation" : {
                    "x" : entity.rotation.x, 
                    "y" : entity.rotation.y, 
                    "z" : entity.rotation.z
                },
                "scale" : 1
            };

            if(entity.type == "gate"){
                entityProperties["model"] = assetManager.getModel("gate_0");

                var gate = new mapdive.GateEntity(entity.id, entityProperties );
                
                scene.add(gate.getObject3d());
                entities.push(gate);
            }

            if(entity.type == "landmark"){

                entityProperties["model"] = assetManager.getModel(entity.model);
                entityProperties["modelName"] = entity.model;
                
                var obj = new mapdive.LandmarkEntity(entity.id, entityProperties );
                
                scene.add(obj.getObject3d());
                entities.push(obj);
            }

            if(entity.type == "obj"){
                
                entityProperties["model"] = assetManager.getModel(entity.params["obj"]);

                var gate = new mapdive.ObjEntity(entity.id, entityProperties);                    
                
                scene.add(gate.getObject3d());
                entities.push(gate);
            }

            if(entity.type == "item"){
                var item = new mapdive.ItemEntity(entity.id, {
                    "model" : assetManager.getModel("star"),
                    "style" : "default",
                    "position" : {
                        "x" : (entity.position.x * mapScale), 
                        "y" : entity.position.y,
                        "z" : (entity.position.z * mapScale)
                    },
                    "rotation" : {
                        "x" : 0, 
                        "y" : 0, 
                        "z" : 0
                    },
                    "scale" : 1
                });

                scene.add(item.getObject3d());
                entities.push(item);
            }
        }

        // delete an entity.
        if(data["delete"]){
            console.log("delete:" + data["delete"]);
            var idx = -1;
            for(var i = 0; i < entities.length; i++){
                if(entities[i].id == parseInt(data["delete"])) {

                    scene.remove( entities[i].getObject3d());
                    entities[i].dispose();
                    idx = i;
                    break;
                }
            }
            if(idx != -1){
                entities.splice(idx, 1);
            }
        }
    });
    
    // viewstate happens at the framerate of the game (hopefully 60hz)
    socket.on('viewstate', function(data) {
    	
        if(!engineRunning){
            // don't do anything until everything is loaded.
            return;
        }

        // If this update contains any messages, add the timestamp to each one and dispatch it.
        if(data.messages){
            for(var i = 0; i < data.messages.length; i++){
                data.messages[i].t = data.state.t;
                dispatchMessage(data.messages[i]);
            }
        }

        // keep track of the last known state.
    	gameState = data.state;

        // update the player
        player.getPosition().x = Number(gameState.player.pos[0]) * mapScale;
    	player.getPosition().y = Number(gameState.player.pos[1]);
    	player.getPosition().z = Number(gameState.player.pos[2]) * mapScale;

        player.setHeading(Number(-gameState.player.dir[0]-Math.PI/2));
        player.setRoll(gameState.player.dir[2]+Math.PI/2);        
        player.setPitch( -gameState.player.dir[1] - Math.PI / 2 + toRadians(15));
   	
        player.update(gameState);

        // Update the camera position
        updateCamera();
        
        // keep the sky dome centered on the camera.
        skyDome.position.copy(cameraContainer.position);
        skyDome.position.y = 2500;

        // Update all the entities..
		updateEntities(gameState);
    });

    // Socket is now connected, start the render loop
    startRenderLoop();
}


// Dispatch json messages from the control node.  Each update from the socket may contain zero or more messages.
function dispatchMessage(data) { 

    // The level has changed.
    if(data["level"]){
        loadCourse(data["level"]);
    }

    // The map style has changed
    if(data["maptype"]){
        console.log("New map style: " + data["maptype"]);
        setStyle(data["maptype"]);
    }

    // It's bounus time!
    if(data["bonusmode"]){
        if(data["bonusmode"] == "bonus"){
            bonusModeActive = true;
            setStyle(currentBonusStyle);
        } else {
            bonusModeActive = false;
            setStyle(currentBaseStyle);
        }
    }

    // Enable/disable map zoom based on altitude.
    if(data["mapzoom"]){
        mapManager.setZoomEnabled(data["mapzoom"] == "on");
    }

    // Update the viewport offset value.  This is typically only done when configuring the viewports when setting up the game.
    if(data["viewOffset"]){
        viewportMetrics.viewAngleOffset = parseFloat(data["viewOffset"]);
        camera.rotation.set(0, (180 + (viewportMetrics.viewIndex * viewportMetrics.viewAngleOffset)) * Math.PI / 180, 0);
    }

    // HUD related messages.
    if(data["hud"]){
        for(var i = 0; i < HUDItems.length; i++){
            switch(data["hud"]){
                case "show":
                    HUDItems[i].show();
                break;

                case "hide":
                    HUDItems[i].hide();
                break;

                default:
                    // for any message other than show or hide, pass the message on to all HUD objects so they can react if needed.
                    if(typeof(HUDItems[i].message) == "function"){
                        HUDItems[i].message(data);
                    }
                break;
            }
        }
    }

    // Explicitly set the zoom level (this should only happen when altitude based zooming is disabled)
    if(data["zoom"]){
        mapManager.setZoomLevel(Number(data["zoom"]));
    }

    // This message is for an entitiy, loop through all entities and send the message to any with a matching ID.
    if(data["entity"]){
        for(var i = 0; i < entities.length; i++){
            if(entities[i].id == data["entity"]) {
                entities[i].message(data);
            }
        }
    }

    // Set a new camera behavior.
    if(data["camera"]){
        cameraState.transitionStart = data["t"];
        cameraState.previousBehavior = cameraState.behavior;
        cameraState.transitionDuration = Number(data["duration"]);
        cameraState.behavior = data["camera"];

        // Some camera states need to keep track of initial state when changing modes, set that here.
        switch(cameraState.behavior){
            case "intro_climb":
                cameraState.introStartY = player.getPosition().y;
            break;
        }
    }
}


// figure out what map zoom level is best based on a given altitude.
function getZoomLevelForAltitude(altitude) {
	if(altitude > 2048){
        return 10;
	}else if(altitude > 1024){
        return 11;
    }else if(altitude > 512){
        return 12;
    }else if(altitude > 256){
        return 13;
    }else if(altitude > 128){
        return 14;
    }
    return 15;
}


// callback for asset manager, invoked when all assets are loaded.
function assetsLoaded() {
    console.log("====== All Assets Loaded ======");

    player = new mapdive.Player({"scene" : scene});

    // load moscone_center dive by default.
    loadCourse({
      "name" : "moscone_center", 
      "gateStyle" : 0, 
      "baseStyle" : "default", 
      "bonusStyle" : "scifi" 
    });

    initializeHUD();
    initializeSocket( "viewport", socketConnected );
}


// Debugging: show current count of entities by type.
function showStats(){
    $("#init_log").css("display", "block");
    var stats = {};
    for(var i = 0; i < entities.length; i++){
        if(!stats[entities[i].type]){
            stats[entities[i].type] = 0;
        }
        stats[entities[i].type]++;
    }
    var debug = [];
    for(var itm in stats){
        debug.push(itm + ": " + stats[itm]);
    }
    $("#init_log").html(debug.join("<br>"));
}


function startRenderLoop() {
    console.log("====== Initialization Complete - Starting Render Loop ======");

    // hide the initialization log element three seconds after the engine starts up (so you can actually see any important messages..)
    window.setTimeout(function(){
        $("#init_log").css("display","none");
    }, 3000);

    engineRunning = true;
    render();
}


$(document).on("ready", function() {
    Math.seedrandom('yay.');

	loadMapStyles();
	loadURLParams();

    // set viewport elements to the correct size.
    $("#webgl-viewport,#css-viewport").css({"width" : viewportMetrics.width, "height" : viewportMetrics.height });
    
    initializeWebGL();
    initializeMap(); 
	
	// loadAssets triggers a bunch of async loading, callback on complete will finish initialization
    // see "assetsLoaded"
    loadAssets();
});
