mapdive.MapManagerCSS = function( _config ) {
	
	// Shader to do fake distance fog over the ground plane
	var fogShader = {

	  uniforms: {
	    "color" : {type: "v3", value: new THREE.Vector3(1, 0, 0)},
	    "near" : {type: "f", value: 1750.0},
		"far" : {type: "f", value: 2060.0}
	  },

	  vertexShader: [

	    "varying vec2 vUv;",
	    "varying vec4 camera_pos;",

	    "void main() {",

	      "vUv = uv;",
	      "camera_pos = modelViewMatrix * vec4( position, 1.0 );",
	      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

	    "}"

	  ].join("\n"),

	  fragmentShader: [

	    "varying vec2 vUv;",
		"varying vec4 camera_pos;",
	    "uniform vec3 color;",
	    "uniform float near;",
	    "uniform float far;",

	    "void main() {",
	      "float f = distance(vUv, vec2(0.5, 0.5)) * 3.25;",
	      "f = pow(f, 9.5);",
	      "gl_FragColor = vec4(color, 1) * clamp(f, 0.0, 1.0);",
	    "}"

	  ].join("\n")
	};

	var mapObjectHigh;

	var gMap;
	var gMapHigh;
	
	var fogFar = 1;
	var fogNear = 0;

	var mapOffsetX = 0;
	var mapOffsetY = 0;

	var dropzoneMarker;
	
	var scene = _config["scene"];
	
    var portland = new google.maps.LatLng(45.52594, -122.65595);
    var currentZoomLevel = 14;

    var dropzonePosition = {x:0,y:0};
    
    var mapOptions = {
      center: portland,
      zoom: 14,
      disableDefaultUI: true,
      animatedZoom: false,
      mapTypeId: "default",
      draggable : false,
      scrollwheel : false,
      optimized: false
    };

	gMap = new google.maps.Map(document.getElementById("map-layer-low"), mapOptions);

	mapOptions.zoom = 15;
	gMapHigh = new google.maps.Map(document.getElementById("map-layer-high"), mapOptions);

	var targetOptions = {
      strokeColor: "#00ff00",
      strokeOpacity: 0.4,
      strokeWeight: 1,
      fillColor: "#00ff00",
      fillOpacity: 0.15,
      map: gMap,
      //center: portland,
      radius: 2250
    };

    dropzoneMarker = new google.maps.Circle(targetOptions);

	// set up the list of possible view styles.
    for(var key in viewStyles) {
        gMap.mapTypes.set(key, viewStyles[key].mapstyle);
        gMapHigh.mapTypes.set(key, viewStyles[key].mapstyle);
    }
	
	var cssRenderer = new THREE.CSS3DRenderer();

    cssRenderer.setSize(_config["screenWidth"], _config["screenHeight"]);
    cssRenderer.setFOV(_config["FOV"]);
    document.getElementById(_config["cssViewportId"]).appendChild(cssRenderer.domElement);

    google.maps.event.addListener(gMap, "projection_changed", function() {
    	mapManager.setTarget(dropzonePosition.x, dropzonePosition.y);
    });

    // Create the object to hold the live google map view
    mapObject = new THREE.CSS3DObject(document.getElementById("map-layer-low"));//_config["mapContainerId"]));
   // mapObject = new THREE.CSS3DObject(document.getElementById("test-container"));
    mapObject.position.set(0, 0, 0);
    mapObject.rotation.set(-Math.PI / 2, 0, 0);
    mapObject.frustumCulled = false;
	
	mapObject.scale.set(0.125, 0.125, 0.125); // double the map size (looks ok, further view distance without a big performance hit.)
	
	scene.add( mapObject );


	mapObjectHigh = new THREE.CSS3DObject(document.getElementById("map-layer-high"));//_config["mapContainerId"]));
   // mapObject = new THREE.CSS3DObject(document.getElementById("test-container"));
    mapObjectHigh.position.set(0, 0.1, 0);
    mapObjectHigh.rotation.set(-Math.PI / 2, 0, 0);
    mapObjectHigh.frustumCulled = false;
	
	mapObjectHigh.scale.set(0.0625, 0.0625, 0.0625); // double the map size (looks ok, further view distance without a big performance hit.)

	scene.add(mapObjectHigh);
	// Add the transparent "fog" object
	var fogMaterial = new THREE.ShaderMaterial(fogShader);
	fogMaterial.fog = false;

    var fogGeometry = new THREE.PlaneGeometry( 2560, 2560 );
	var fogPlane = new THREE.Mesh(fogGeometry,fogMaterial);
	
	fogPlane.scale.set(1,1,1);
	
	//scene.add(fogPlane);

	fogPlane.rotation.set(-Math.PI / 2, 0, 0);

    

	var lastpx = 0;
	var lastpy = 0;


	// ***** PUBLIC STUFF *****

	var self = {};

	self.getCopyright=function () {
		var txt=$('#map-container').text();
		txt=txt.replace(/Map Data(.+?)-.+/,"$1");
		return(txt);
	}

	self.update = function(camState) {
		// don't try to render if the map isn't ready..
		if(gMap.getProjection() == null){
			return;
		}

		var scale = (1 << gMapHigh.getZoom());
		//var scaleHigh = (1 << gMapHigh.getZoom());

	
		gameState.player.latLng = gMap.getProjection().fromPointToLatLng( new google.maps.Point( gameState.player.pos[0], gameState.player.pos[2]) ) ;

		var pxCoords = new google.maps.Point(camState.x * scale, camState.z * scale);

		// only move the center point of the map when we've drifted at least 256 units since the previous map center.
		// If we update the map center on every frame it tends to jitter since map movements only happen in whole pixels.
		if( (Math.abs(mapOffsetX - pxCoords.x) >= 128) || (Math.abs(mapOffsetY - pxCoords.y) >= 128) ) {
			
			mapOffsetX = pxCoords.x; 
			mapOffsetY = pxCoords.y;
	
			var newCenter = gMap.getProjection().fromPointToLatLng( new google.maps.Point(camState.x, camState.z) );
			gMap.setCenter( newCenter );
			gMapHigh.setCenter(newCenter);

			var mapPoint = new google.maps.Point(camState.x, camState.z);

			mapObject.position.x = (mapPoint.x * mapScale);
			mapObject.position.z = (mapPoint.y * mapScale);
			mapObject.position.y = 0;

			mapObjectHigh.position.x = mapObject.position.x;
			mapObjectHigh.position.z = mapObject.position.z;
		}
		
		// Fog plane is always centered under the camera to cover the edges of the map plane.
		fogPlane.position.x = (camState.x * mapScale);
		fogPlane.position.z = (camState.z * mapScale);
	}


	self.render = function() {

		fogShader.uniforms['far'].value = (fogFar / 2) + (player.getPosition().y / mapObject.scale.x);
		fogShader.uniforms['near'].value = (fogNear / 2) + (player.getPosition().y / mapObject.scale.x);

		cssRenderer.render(scene, camera);

		dropzoneMarker.fillOpacity = Math.sin(gameState.t);
	}

	self.setZoomLevel = function(zoom) {
		if(currentZoomLevel != zoom){
			
			//$("#css-viewport").css("-webkit-filter", "blur(" + ((15 - (zoom))) + "px)");

			console.log(zoom - 12);

			var baseZoomLevel = 12;
			var delta = baseZoomLevel - zoom;
			console.log("Zoom! " + zoom);
			
			gMap.setZoom(zoom);
			gMapHigh.setZoom(zoom+2);


			//mapObject.position.set(0, 0, 0);

			var scl = Math.pow(2, delta);
			var scl2 = Math.pow(2, delta-2);
			
			fogFar = 768 * scl;
			fogNear = fogFar * 0.99;
			
			mapObject.scale.set(scl, scl, scl);
			mapObjectHigh.scale.set(scl2,scl2,scl2);

			fogPlane.scale.set(scl, scl, scl);

			var fogDistance = Math.sqrt( (player.getPosition().y * player.getPosition().y) + (1024*1024*scl) );
			
			scene.fog.near = fogDistance * 0.90;
			scene.fog.far = fogDistance;

			currentZoomLevel = zoom;
		}
	}

	self.setTarget = function(x, y){
		if(gMap.getProjection()){
			console.log(x, y);//gMap.getProjection().fromPointToLatLng(x, y));
			dropzoneMarker.setCenter( gMap.getProjection().fromPointToLatLng( new google.maps.Point(x, y) ) );
		}
		dropzonePosition = {"x":x, "y":y};
	}

	self.setStyle = function(styleId, style){

		gMap.setMapTypeId(styleId);
		gMapHigh.setMapTypeId("tron");

		scene.fog.color.set( style.sky );

		// convert from hex color to RBG for shader.
		var hex = parseInt( style.sky.substring(1,7), 16 );
		
		var r = (hex & 0xff0000) >> 16;
		var g = (hex & 0x00ff00) >> 8;
		var b = (hex & 0x0000ff);

		fogShader.uniforms['color'].value.set(r / 256, g / 256, b / 256);
	}

	console.log("CSS Map manager ready");

	return self;
}