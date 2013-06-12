mapdive.AssetManager = function() {

	var textures = {};
	var textureList = [];
	
	var models = {};
	var modelList = [];
	var modelJSONList=[];

	var pendingAssets = 0;

	var loadedTextures = 0;
	var totalTextures = 0;

	var loadedModels = 0;
	var totalModels = 0;

	var callbackFunc;
	
	var assetLoaded = function() {
		pendingAssets--;
		if(pendingAssets <= 0){
			console.log("AssetManager: all assets loaded.");
			if(typeof(callbackFunc) == "function"){
				callbackFunc();
			}
		}
	}

	var loadTexture = function(id, path) {

		for(var itm in textures){
			if(textures[itm].sourceFile == path){
				textures[id] = textures[itm];
				console.log(++loadedTextures + "/" + totalTextures + ": already loaded:" + path);
				assetLoaded();
				return;
			}
		}

		textures[id] = THREE.ImageUtils.loadTexture(path, {}, function(event) {
       	 	console.log(++loadedTextures + "/" + totalTextures + ": " + path);
        	assetLoaded();
        });
    }

    var loadModel = function(id, path) {
		var objLoader = new THREE.OBJLoader();

    	
    	objLoader.addEventListener( 'load', function ( event ) {   		
	        models[id] = event.content;
	        assetLoaded();
	    });

   		objLoader.load( path );   
    }

    var loadJSONModel= function (id,path) {
		var jsonLoader = new THREE.JSONLoader();
      
        jsonLoader.load( path, function(geometry,materials) {

        	//console.log("JSON Model loaded: "+path);
        	models[id]=new THREE.Mesh(geometry,materials);
        	assetLoaded();
        } );
    }

	/*********** public stuff ***********/

	var self = {};

	self.addTexture = function( id, path ) {
		totalTextures++;
		textureList.push({"id" : id, "path" : path});
	}

	self.addModel = function( id, path ) {
		totalModels++;
		modelList.push({"id" : id, "path" : path});
	}

	self.addJSONModel= function(id, path) {
		totalModels++;
		modelJSONList.push({"id": id, "path": path });
	}
	
	self.loadAssets = function( _callback ) {

		console.log("AssetManager: loading assets.");

		if(typeof(_callback) == "function") {
			callbackFunc = _callback;
		}

		pendingAssets = textureList.length + modelList.length + modelJSONList.length;

		for(var i = 0; i < textureList.length; i++){
			loadTexture(textureList[i].id, textureList[i].path);
		}
		
		for(var i = 0; i < modelList.length; i++){
			loadModel(modelList[i].id, modelList[i].path);
		}

		for(var i = 0; i < modelJSONList.length; i++){
			loadJSONModel(modelJSONList[i].id, modelJSONList[i].path);
		}
	}

	self.getTexture = function(id) {
		if(textures[id]){
			return textures[id];
		} else {
			console.error("AssetManager - MISSING TEXTURE REQUESTED " + id);
			return textures["TEXTURE_MISSING"];
		}
	}

	self.getModel = function(id) {
		if(!models[id]){
			console.error("AssetManager - MISSING MODEL REQUESTED " + id);
			return null;
		}

		return models[id];
	}

	self.getTextureForStyle = function(objectType, styleName) {
		if(textures[objectType + "_" + styleName]){
			return self.getTexture(objectType + "_" + styleName);
		} else {
			// if the style-specific texture is missing, return the default.
			return self.getTexture(objectType + "_default");
		}
	}

	return self;
}