mapdive.MapManagerGL = function( _config ) {
	
	var tiles = {};
	var textures = {};
	var geometries = {};
	var materials = {};
	var tileList = [];
	var textureList = [];

	var gMap;
	var mapLoaded = false;
	 
	var worldSize = (1 << 20);
	var tileSize;

	var scene = _config["scene"];
	var $tileContainer = $("#" + _config["mapContainerId"]);
	$tileContainer.css({"left" : -$tileContainer.width() });

    var portland = new google.maps.LatLng(45.52594, -122.65595);
    
    var mapOptions = {
      center: portland,
      zoom: 12,
      disableDefaultUI: true,
      mapTypeId: "default",
      draggable : false,
      scrollwheel : true
    };

	gMap = new google.maps.Map(document.getElementById(_config["mapContainerId"]), mapOptions);


    for(var key in viewStyles) {
        gMap.mapTypes.set(key, viewStyles[key].mapstyle);
    }

	var removeTileAt = function(i) {
		scene.remove(tileList[i]);
		var key = tileList[i].key;
		tileList.splice(i,1);
		textureList.splice(i,1);
		materials[key].dispose();
		textures[key].dispose();
		delete materials[key];
		delete textures[key];
		delete tiles[key];
	}

	var clearAllTiles = function() {
		for(var i=0; i<tileList.length; i++) removeTileAt(i--);
	}

	var parseMapTiles = function() {

		var mapZoom=Number(gMap.getZoom());
		// mark all the tiles for deletion
		for(var i=0; i<tileList.length; i++) {
			tileList[i].isUsed=false;
		}

		// parse all image tags in the google map container
		$tileContainer.find("img").each( function() {
			var src = $(this).attr('src');
			var matches = [];
			if (matches = src.match(/x=([0-9.-]+).*?&y=([0-9.-]+).*?&z=([0-9.-]+)/)) { // we have a google maps tile
				var key = src; // unique key is tile URL to allow two tiles at same position for transitions
				var key2 = matches[1]+','+matches[2]+','+matches[3]; // secondary non-unique key is x,y,z tile coordinate
				
				var x = Number(matches[1]); // tile x
				var y = Number(matches[2]); // tile y
				var z = Number(matches[3]); // tile z
				
				var tileSize = worldSize / (1 << z);
							
				if (textures[key]==undefined) { // new texture? load it
					textures[key]=THREE.ImageUtils.loadTexture( src, null, onTextureLoaded,onTextureError );				
					textures[key].key = key;
					textures[key].key2 = key2;
				} 
				if (tiles[key]==undefined) { // new tile, create and position it
					materials[key]=new THREE.MeshBasicMaterial({map:textures[key],opacity:1,transparent:true});
					geometries[key]=new THREE.PlaneGeometry( tileSize, tileSize );
					geometries[key].dynamic=false;
					tiles[key] = new THREE.Mesh(geometries[key],materials[key]);
					tiles[key].key=key;
					tiles[key].key2=key2;
					tiles[key].position.set(x * tileSize + tileSize/2, 0, y * tileSize + tileSize/2);
					tiles[key].rotation.x = -Math.PI / 2;

					tiles[key].frustumCulled=true;
					tiles[key].matrixAutoUpdate=false;
					tiles[key].rotationAutoUpdate=false;
					tiles[key].updateMatrix();
					tiles[key].updateMatrixWorld();

					tileList.push(tiles[key]);
					scene.add(tiles[key]);
				}
				
				//if (z!=mapZoom && tiles[key].isHiding!=true) {
					//tiles[key].isHiding=true;
					//TweenLite.to(materials[key],0.5,{opacity:0});
				//}
				 		
				tiles[key].isUsed = true; // old or new, this tile is in use
			}
		});

		// remove unused tiles and textures
		for(var i=0; i<tileList.length; i++) {
			if (tileList[i].isUsed == false) {
				removeTileAt(i--);
			}
		}
	}


	var onMapChanged = function(event) {
		//setCameraFromMap();
	}

	var onMapReady = function(event) {
		console.log("Map ready");
		//if (firstTime) { setCameraFromMap(); firstTime=false; render(); }
	}

	var onTextureLoaded = function(texture) {
		//console.log('texture loaded '+tile.key);
		//tiles[texture.key].rotation.x=Math.PI/2;
		//TweenLite.to(tiles[texture.key].rotation,0.5,{x:-Math.PI/2});
		/*TweenLite.to(materials[texture.key],0.5,{opacity:1});
		
		for(var i=0;i<tileList.length;i++) {
			if (tileList[i].key2==texture.key2 && tileList[i].key!=texture.key) {
				TweenLite.to(materials[tileList[i].key],0.5,{opacity:0});
			}
		}*/
	}



	
	function setMapZoom(z, cam) {
		altitude = 1 << (22 - z);
		distance = altitude;
	//	camera.position.y = altitude;
		gMap.setZoom(z);
		//scene.fog = new THREE.Fog(0xcceeff, altitude*1.8, altitude * 2);
	}

	function onTextureError(texture) {
		console.log('texture load error '+texture.key);	
	}

	google.maps.event.addListener(gMap, "tilesloaded", onMapReady);
    google.maps.event.addListener(gMap, "maptypeid_changed", onMapChanged);
    google.maps.event.addListener(gMap, "zoom_changed", onMapChanged);

	var self = {};

	self.update = function(camState) {
		if(gMap.getProjection() == null){
			return;
		} else {
			//console.log(tileList.length );
		}
		
		var scale = worldSize / 256;
		var distance = 1024 / scale;
	
		
		/*
		gMap.setCenter(gMap.getProjection().fromPointToLatLng(new google.maps.Point(
			camState.x,
			camState.z
		)));
		*/
		
		gMap.setCenter(gMap.getProjection().fromPointToLatLng(new google.maps.Point(
			(camState.x + Math.cos(camState.heading) * distance),
			(camState.z + Math.sin(camState.heading) * distance)
		)));
		

		parseMapTiles();
	}

	self.setStyle = function(styleId){
		gMap.setMapTypeId(styleId);
	}

	console.log("GL Map manager ready");
	return self;
}