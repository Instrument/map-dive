mapdive.MapManagerCSS = function( _config ) {

	// how far must the map plane move before the map center point is updated?
	var MAP_UPDATE_THRESHOLD = 128;

	// number of MS to delay between re-centering the map, and moving the map plane.
	var MAP_UPDATE_DELAY = 3;
	
	// Shader to do fake distance fog over the ground plane.  Just draws a radial gradient from 100% transparent to 100% opaque, color is set based on map style.
	var fogShader = {

	  uniforms: {
	  	"altitudeColor" : {type: "v3", value: new THREE.Vector3(0.858, 0.964, 1)},
	    "color" : {type: "v3", value: new THREE.Vector3(1, 0, 0)},
	  },

	  vertexShader: [

	    "varying vec2 vUv;",
	    
	    "void main() {",

	      "vUv = uv;",
	      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

	    "}"

	  ].join("\n"),

	  fragmentShader: [

	    "varying vec2 vUv;",
	    "uniform vec3 altitudeColor;",
	    "uniform vec3 color;",

	    "void main() {",
	      "float f = distance(vUv, vec2(0.5, 0.5)) * 2.0;",
	      "float fadeStart = 0.50;",
	      "float fadeStop = 0.8;",
	      "if(f >= fadeStart){",
	      "	 f = mix(0.0, 1.0, (f-fadeStart) * (1.0 / (fadeStop-fadeStart)));",
	      "	 f = pow(f, 2.5);",
	      "} else {",
	      "	 f = 0.0;",
	      "}",

	      "gl_FragColor = vec4(color, 1.0) * clamp(f, 0.0, 1.0);",
	    "}"

	  ].join("\n")
	};

	var zoomEnabled = true;

	var gMap;
	
	var fogFar = 1;
	var fogNear = 0;

	var mapOffsetX = 0;
	var mapOffsetY = 0;

	var dropzoneMarker;
	var dropzoneMarkerFill = "#ffffff";
	
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

	gMap = new google.maps.Map(document.getElementById(_config["mapContainerId"]), mapOptions);

	var targetOptions = {
      strokeWeight: 0,
      fillColor: "#00ff00",
      fillOpacity: 0.3,
      map: gMap,
      radius: 2250
    };

    dropzoneMarker = new google.maps.Circle(targetOptions);

	// set up the list of possible view styles.
    for(var key in viewStyles) {
        gMap.mapTypes.set(key, viewStyles[key].mapstyle);
    }
	
	var cssRenderer = new THREE.CSS3DRenderer();

    cssRenderer.setSize(_config["screenWidth"], _config["screenHeight"]);
    cssRenderer.setFOV(_config["FOV"]);
    document.getElementById(_config["cssViewportId"]).appendChild(cssRenderer.domElement);

    google.maps.event.addListener(gMap, "projection_changed", function() {
    	mapManager.setTarget(dropzonePosition.x, dropzonePosition.y);
    });

    // Create the object to hold the live google map view
    mapObject = new THREE.CSS3DObject(document.getElementById(_config["mapContainerId"]));
    mapObject.position.set(0, 0, 0);
    mapObject.rotation.set(-Math.PI / 2, 0, 0);
    mapObject.frustumCulled = false;
	
	mapObject.scale.set(0.25, 0.25, 0.25); // double the map size (looks ok, further view distance without a big performance hit.)
	
	scene.add( mapObject );

	
	// Add the transparent "fog" object
	var fogMaterial = new THREE.ShaderMaterial(fogShader);
	fogMaterial.fog = false;

    var fogGeometry = new THREE.PlaneGeometry( 2048+MAP_UPDATE_THRESHOLD, 2048+MAP_UPDATE_THRESHOLD );
	var fogPlane = new THREE.Mesh(fogGeometry,fogMaterial);
	
	fogPlane.scale.set(1,1,1);
	
	scene.add(fogPlane);

	fogPlane.rotation.set(-Math.PI / 2, 0, 0);

    

	var lastpx = 0;
	var lastpy = 0;

	var copyrightText = "";

	// ***** PUBLIC STUFF *****

	var self = {};


	self.getCopyright = function () {
		var txt = $('#map-container').text();
		txt = txt.replace(/Map Data(.+?)-.+/,"$1");
		return txt;
	}


	self.update = function(camState) {

		// don't try to render if the map isn't ready..
		if(gMap.getProjection() == null){
			return;
		} 

		var scale = (1 << gMap.getZoom());
	
		gameState.player.latLng = gMap.getProjection().fromPointToLatLng( new google.maps.Point( gameState.player.pos[0], gameState.player.pos[2]) ) ;

		var pxCoords = new google.maps.Point(camState.x * scale, camState.z * scale);

		// only move the center point of the map when we've drifted at least 256 units since the previous map center.
		// If we update the map center on every frame it tends to jitter since map movements only happen in whole pixels.
		if( (Math.abs(mapOffsetX - pxCoords.x) >= MAP_UPDATE_THRESHOLD) || (Math.abs(mapOffsetY - pxCoords.y) >= MAP_UPDATE_THRESHOLD) ) {
			
			mapOffsetX = pxCoords.x; 
			mapOffsetY = pxCoords.y;
	
			var newCenter = gMap.getProjection().fromPointToLatLng( new google.maps.Point(camState.x, camState.z) );
			gMap.setCenter( newCenter );

			var mapPoint = new google.maps.Point(camState.x, camState.z);
			
	// ** HACK **
			// the map.setCenter() method doesn't update the view immediately (probably due to the animated scrolling behavior)
			// as a result, the 3d css layer will be out of sync with the map tiles for a frame or two unless we wait to move the map for a
			// couple of milliseconds.  Without this timeout the ground plane will often appear to flicker whenever the center changes.
			window.setTimeout(function() {
				mapObject.position.x = (mapPoint.x * mapScale);
				mapObject.position.z = (mapPoint.y * mapScale);
				mapObject.position.y = 0;
			}, MAP_UPDATE_DELAY);
	// ** END HACK **

		}
		
		// Fog plane is always centered under the camera to cover the corners of the map plane.
		fogPlane.position.x = (camState.x * mapScale);
		fogPlane.position.z = (camState.z * mapScale);
	}


	self.render = function() {
		cssRenderer.render(scene, camera);
	}

	self.setZoomLevel = function(zoom) {
		if(zoomEnabled && (currentZoomLevel != zoom)){
			
			var baseZoomLevel = 12;
			var delta = baseZoomLevel - zoom;
			
			gMap.setZoom(zoom);

			mapObject.position.set(0, 0, 0);
			var scl = Math.pow(2, delta);
			
			fogFar = 768 * scl;
			fogNear = fogFar * 0.99;
			
			mapObject.scale.set(scl, scl, scl);
			fogPlane.scale.set(scl, scl, scl);			

			currentZoomLevel = zoom;
		}
		return mapObject.scale.x;
	}

	self.setTarget = function(x, y){
		if(dropzoneMarker){
			dropzoneMarker.setMap(null);
		}

		if(gMap.getProjection()){
			var latlng = gMap.getProjection().fromPointToLatLng( new google.maps.Point(x, y) )
			var targetOptions = {
			  center: latlng,
		      strokeWeight: 0,
		      fillColor: "#00ff00",
		      fillOpacity: 0.5,
		      map: gMap,
		      radius: 3030 * Math.cos(toRadians(latlng.lat())) // circle radius needs to be adjusted by latitude so it'll match the GL coordinate space, otherwise it's tiny at the equator and huge at the poles.
		    };

		    dropzoneMarker = new google.maps.Circle(targetOptions);
		}

		dropzonePosition = {"x": x, "y": y};
	}

	self.setZoomEnabled = function(enabled){
		zoomEnabled = enabled;
	}

	self.setStyle = function(styleId, style){

		dropzoneMarkerFill = style["target"];

		if(dropzoneMarker){
			dropzoneMarker.setOptions({"fillColor" : dropzoneMarkerFill});
		}

		gMap.setMapTypeId(styleId);

		// convert from hex color to RBG for shader.
		var hex = parseInt( style.horizon.substring(1,7), 16 );
		
		var r = (hex & 0xff0000) >> 16;
		var g = (hex & 0x00ff00) >> 8;
		var b = (hex & 0x0000ff);

		fogShader.uniforms['color'].value.set(r / 256, g / 256, b / 256);
	}

	console.log("CSS Map manager ready");

	return self;
}