mapdive.ItemEntity = function( _uid, _params ) {
	var uid 	= _uid;
	var params 	= _params;
	var glObject = null;

	var material = new THREE.MeshPhongMaterial({ specular: 0xffffff, shininess:100, map : assetManager.getTextureForStyle("star", _params["style"]),  opacity: 1, transparent:true, emissive:0x787878, color:0xffffff, overdraw: true });
    
    var glObject = params["model"].clone();

    glObject.traverse( function ( child ) {
		if ( child instanceof THREE.Mesh ) {
			child.material = material;
		}
	} );

	glObject.position.x = params["position"]["x"];
    glObject.position.y = params["position"]["y"];
    glObject.position.z = params["position"]["z"];

    glObject.rotation.x = params["rotation"]["x"];
    glObject.rotation.y = params["rotation"]["y"];
    glObject.rotation.z = params["rotation"]["z"];

    glObject.scale.set(params["scale"], params["scale"], params["scale"]);

    var bobOffset = Math.random() * 360;
    var rotationSpeed = randomRange(1.5,2);
    var rotationOffset = randomRange(0, Math.PI * 2);
    var hit = false;
    var hitTime = 0;
    var hitVelocity = 1.3;

	/*********** public stuff ***********/

	var self 	= {};
	
	self.id = uid;
	self.type = "item";

	self.message = function( data ) {

		if(data["hit"]){
			rotationSpeed *= 6;
			if(!hit){
				hit = true;
			}
			hitTime = data["t"];
		}

		if(data["position"]){
			params.position.x = data["position"].x * mapScale;
			params.position.y = data["position"].y;
			params.position.z = data["position"].z * mapScale;

			glObject.position.x = params.position.x;
			glObject.position.y = params.position.y;
			glObject.position.z = params.position.z;
		}

		if(data["rotation"]) {
			params.rotation.x = data["rotation"].x;
			params.rotation.y = data["rotation"].y;
			params.rotation.z = data["rotation"].z;

			glObject.rotation.x = params.rotation.x;
			glObject.rotation.y = params.rotation.y;
			glObject.rotation.z = params.rotation.z;
		}

		if(data["style"]){
			material.map = assetManager.getTextureForStyle("star", data["style"]);
		}
	}


	self.update = function( time ) {

		if(!glObject.visible){
			return;
		}

		if(hit) {
			if(time - hitTime < 1.0){
				var scl = _params["scale"] + ((time - hitTime) * 2);
				glObject.position.y += hitVelocity;
				hitVelocity -= 0.1;
				
				var blink = (time * 24) % 2;
				
				material.opacity = 1 - ((time - hitTime) * blink);
				blink *= 0.8;
				blink += 0.2;
				material.emissive.setRGB(blink,blink,blink);
			} else {
				glObject.visible = false;
				scene.remove(glObject);
			}

			glObject.children[0].rotation.y = _params["rotation"]["y"] + rotationSpeed * time;
		}
		else {
			glObject.position.y = _params["position"]["y"] + Math.sin(toRadians(time * 90 + bobOffset)) * 0.1;
			glObject.children[0].rotation.y = _params["rotation"]["y"] + rotationSpeed * time;
		}		
	}

	self.getObject3d = function() {
		return glObject;
	}

	self.dispose = function() {
		material.dispose();
	}

	return self;
}


mapdive.BonusEntity = function( _uid, _params ) {
	var uid 	= _uid;
	var params 	= _params;
	var glObject = null;

	var material = new THREE.MeshPhongMaterial({ specular: 0xffffff, shininess:100, map : (params["texture"]) ? params["texture"] : null,  opacity: 1, transparent:false, emissive:0x909090, color:0xffffff, overdraw: true });
    
    var glObject = params["model"].clone();

    glObject.traverse( function ( child ) {
		if ( child instanceof THREE.Mesh ) {
			child.material = material;
		}
	} );

	glObject.position.x = params["position"]["x"];
    glObject.position.y = params["position"]["y"];
    glObject.position.z = params["position"]["z"];

    var bobOffset = Math.random() * 360;
    var rotationSpeed = new THREE.Vector3(randomRange(0.7,1.2), randomRange(0.7,1.2), randomRange(0.7,1.2));
    var rotationOffset = randomRange(0, Math.PI * 2);
    var hit = false;
    var hitTime = 0;
    var hitVelocity = 1.5;

	/*********** public stuff ***********/

	var self 	= {};
	
	self.id = uid;
	self.type = "bonus";

	self.message = function( data ) {

		if(data["hit"]){

			material.emissive.setRGB(1,1,1);
			rotationSpeed.multiplyScalar(6);
			if(!hit){
				hit = true;
			}
			hitTime = data["t"];
		}

		if(data["position"]){
			params.position.x = data["position"].x * mapScale;
			params.position.y = data["position"].y;
			params.position.z = data["position"].z * mapScale;

			glObject.position.x = params.position.x;
			glObject.position.y = params.position.y;
			glObject.position.z = params.position.z;
		}

		if(data["style"]){
			// bonus items don't change style..	
		}
	}

	self.update = function( time ) {

		if(!glObject.visible){
			return;
		}

		if(hit) {

			if(time - hitTime < 1.0){
				var scl = _params["scale"] * (1 - (time - hitTime));
				var val = (time - hitTime);
				material.emissive.setRGB(val, val, val);
				glObject.scale.set(scl,scl,scl);
			} else {
				glObject.visible = false;
				scene.remove(glObject);
			}

			glObject.children[0].rotation.x = _params["rotation"]["y"] = rotationSpeed.y * time;
			glObject.children[0].rotation.y = _params["rotation"]["x"] = rotationSpeed.x * time;
			glObject.children[0].rotation.z = _params["rotation"]["z"] = rotationSpeed.z * time;
		}
		else {
			glObject.position.y = _params["position"]["y"] + Math.sin(toRadians(time * 90 + bobOffset)) * 0.1;
			glObject.children[0].rotation.x = _params["rotation"]["y"] = rotationSpeed.y * time;
			glObject.children[0].rotation.y = _params["rotation"]["x"] = rotationSpeed.x * time;
			glObject.children[0].rotation.z = _params["rotation"]["z"] = rotationSpeed.z * time;

			var val = 0.6 + Math.sin(time*4 + (_params["position"]["y"] / 4000) * 15) * 0.4;
			material.emissive.setRGB(val,val,val);
		}		
	}

	self.getObject3d = function() {
		return glObject;
	}

	self.dispose = function() {
		material.dispose();
	}

	return self;
}



mapdive.ObjEntity = function( _uid, _params ) {

	var uid 	= _uid;
	var params 	= _params;
	var glObject = null;

	var material = new THREE.MeshPhongMaterial({ emissive:0x0, specular: 0x0, shininess:20, map : (params["textureName"]) ? assetManager.getTexture( params["textureName"] + "_default") : null,  opacity: 1, transparent:false, color: 0xffffff, overdraw: true });
    
    var glObject = params["model"].clone();

    glObject.traverse( function ( child ) {
		if ( child instanceof THREE.Mesh ) {
			child.material = material;
		}
	} );

	glObject.position.x = params["position"]["x"];
    glObject.position.y = params["position"]["y"];
    glObject.position.z = params["position"]["z"];

    glObject.rotation.x = params["rotation"]["x"];
    glObject.rotation.y = params["rotation"]["y"];
    glObject.rotation.z = params["rotation"]["z"];

    glObject.scale.set(params["scale"], params["scale"], params["scale"]);

	/*********** public stuff ***********/

	var self 	= {};
	
	self.type = "obj";
	self.id = uid;

	self.message = function( data ) {
		if(data["position"]){
			params.position.x = data["position"].x * mapScale;
			params.position.y = data["position"].y;
			params.position.z = data["position"].z * mapScale;

			glObject.position.x = params.position.x;
			glObject.position.y = params.position.y;
			glObject.position.z = params.position.z;
		}

		if(data["rotation"]) {
			params.rotation.x = data["rotation"].x;
			params.rotation.y = data["rotation"].y;
			params.rotation.z = data["rotation"].z;

			glObject.rotation.x = params.rotation.x;
			glObject.rotation.y = params.rotation.y;
			glObject.rotation.z = params.rotation.z;
		}
	}

	self.update = function( time ) {
		// noop
	}

	self.getObject3d = function() {
		return glObject;
	}

	self.dispose = function() {
		material.dispose();
	}

	return self;
}


mapdive.LandmarkEntity = function( _uid, _params ) {


	var uid 	= _uid;
	var params 	= _params;
	var glObject = null;

	var material = new THREE.MeshLambertMaterial({ emissive:0x606060, specular: 0x0, shininess:20, map : assetManager.getTextureForStyle("dropzone", params["style"]),  opacity: 1, transparent:false, color: 0xffffff, overdraw: true });
	var baseMaterial = new THREE.MeshLambertMaterial({ emissive:0x606060, specular: 0x0, shininess:20, map : assetManager.getTextureForStyle("base", params["style"]),  opacity: 1, transparent:false, color: 0xffffff, overdraw: true });
    
    var glObject = new THREE.Object3D();

    var landmarkObject = params["model"].clone();

    landmarkObject.position.y = 9.04; // height of base obj, this is hard coded based on the OBJ

    var baseObject = assetManager.getModel("landmark_base").clone();
    baseObject.position.y = 0;
    baseObject.material = baseMaterial;
    
    glObject.add(baseObject);
    glObject.add(landmarkObject);

    landmarkObject.traverse( function ( child ) {
		if ( child instanceof THREE.Mesh ) {
			child.material = material;
		}
	} );

	baseObject.traverse( function ( child ) {
		if ( child instanceof THREE.Mesh ) {
			child.material = baseMaterial;
		}
	} );

	glObject.position.x = params["position"]["x"];
    glObject.position.y = params["position"]["y"];
    glObject.position.z = params["position"]["z"];

    glObject.rotation.x = params["rotation"]["x"];
    glObject.rotation.y = params["rotation"]["y"];
    glObject.rotation.z = params["rotation"]["z"];

    glObject.scale.set(params["scale"], params["scale"], params["scale"]);

	/*********** public stuff ***********/

	var self 	= {};
	
	self.type = "landmark";
	self.id = uid;

	self.message = function( data ) {
		if(data["position"]){
			params.position.x = data["position"].x * mapScale;
			params.position.y = data["position"].y;
			params.position.z = data["position"].z * mapScale;

			glObject.position.x = params.position.x;
			glObject.position.y = params.position.y;
			glObject.position.z = params.position.z;
		}

		if(data["rotation"]) {
			params.rotation.x = data["rotation"].x;
			params.rotation.y = data["rotation"].y;
			params.rotation.z = data["rotation"].z;

			glObject.rotation.x = params.rotation.x;
			glObject.rotation.y = params.rotation.y;
			glObject.rotation.z = params.rotation.z;
		}

		if(data["style"]) {
			material.map = assetManager.getTextureForStyle("dropzone", data["style"]);
			baseMaterial.map = assetManager.getTextureForStyle("base", data["style"]);
		}
	}

	self.update = function( time ) {
		// noop
	}

	self.getObject3d = function() {
		return glObject;
	}

	self.dispose = function() {
		material.dispose();
	}

	return self;
}


mapdive.GateEntity = function( _uid, _params ){

	var hit = false;
	var hitTime = 0;
	var uid 	= _uid;
	var params 	= _params;

	var material = new THREE.MeshLambertMaterial({  
		emissive: 0x606060, 
		map : _params["end_gate"] ? assetManager.getTexture("gate_start") : assetManager.getTextureForStyle("gate", _params["style"]),  
		color: 0xffffff
	});
  
    var meshObj = params["model"].clone();

    meshObj.traverse( function ( child ) {
		if ( child instanceof THREE.Mesh ) {
			child.material = material;
		}
	} );

    var glObject = new THREE.Object3D();

	glObject.position.x = params["position"]["x"];
    glObject.position.y = params["position"]["y"];
    glObject.position.z = params["position"]["z"];

    glObject.rotation.y = params["rotation"]["y"];

    // gates are tilted so they make more of a coheasive tunnel.  It's difficult to see the path if they're perpendicular or parallel to the ground.
    meshObj.rotation.x = toRadians(-70);


    glObject.add(meshObj);

    glObject.scale.set(params["scale"], params["scale"], params["scale"]);

    var bobOffset = Math.random() * 360;
    var rotationSpeed = randomRange(0.20, 0.7);
    if(Math.random() > 0.5){
    	rotationSpeed *= -1;
    }
    var currentRotationSpeed = rotationSpeed;
    var fadeStartTime = 0;
 	
	/*********** public stuff ***********/

	var self 	= {};

	self.id = uid;
	self.type = "gate";
	
	self.message = function( data ) {
		if(data["hit"]){
			material.color.set(0,0,0);
			if(!hit){
				hit = true;
				hitTime = data["t"];
			}
			currentRotationSpeed = 10;
		}

		if(data["position"]){
			params.position.x = data["position"].x * mapScale;
			params.position.y = data["position"].y;
			params.position.z = data["position"].z * mapScale;

			glObject.position.x = params.position.x;
			glObject.position.y = params.position.y;
			glObject.position.z = params.position.z;
		}

		if(data["rotation"]) {
			params.rotation.x = data["rotation"].x;
			params.rotation.y = data["rotation"].y;
			params.rotation.z = data["rotation"].z;
			glObject.rotation.y = params.rotation.y;		
		}

		if(data["style"]){

			// add any special bonus mode behaviors in here..
			switch(data["style"]){
				case "scifi" :
				case "burningman" :
				case "scifi" :
				case "8bit" :
				case "raver" :
				case "revolutions" :
				case "terminal" :
				case "volcano" :
				case "night":
					currentRotationSpeed = rotationSpeed * 5;
					break;
				
				default:
					material.color.setStyle("#ffffff");
					material.emissive.setStyle("#606060");
					currentRotationSpeed = rotationSpeed;
					break;
			}

			// gates need some special treatment here since the end gate has a different texture.
			if(params["end_gate"] && !bonusModeActive){
				material.map = assetManager.getTexture("gate_start");
			} else {
				material.map = assetManager.getTextureForStyle("gate", data["style"]);
			}
			
		}
	}

	self.update = function( time ) {

		if(hit) {
			// scale the gate up for half a second after being hit.
			if(time - hitTime < 0.5){
				var percent = ((time - hitTime) * 2);
				var scl = _params["scale"] + percent*2;
			
				glObject.children[0].rotation.z = _params["rotation"]["z"] + currentRotationSpeed * time;
				glObject.scale.set(scl, scl, scl);
				
				material.emissive.setRGB(percent,percent,percent);

			} else {
				material.opacity = 0.0;
				if(glObject.visible){
					glObject.visible = false;
					glObject.traverse( function ( child ) {
						if ( child instanceof THREE.Mesh ) {
							child.visible = false;
						}
					});
				} 
			}
		}
		else 
		{
			if(bonusModeActive){
				switch(currentBonusStyle){
					case "scifi" :
					case "burningman" :
					case "scifi" :
					case "8bit" :
					case "revolutions" :
					case "terminal" :
					case "volcano" :
						var val = 1 * Math.sin(time*20 + (_params["position"]["y"] / 4000) * 15);
						val = Math.max(0.1, val);
						material.emissive.setRGB(val,val,val);
						break;

					case "night":
						var val = 0.4 + Math.sin(time*3 + (_params["position"]["y"] / 4000) * 15) * 0.4;
						val = Math.max(0.1, val);
						material.emissive.setRGB(val,val,val);
						break;

					case "raver" :
						var hue = (time*4) % 1;
						var lightness = Math.sin(time*5 + (_params["position"]["y"] / 4000) * 15)
						material.emissive.setHSL(hue, lightness, 0.5);
						material.color.setHSL(hue, lightness, 0.5);
						break;
					}
			}

			glObject.position.y = _params["position"]["y"] + Math.sin(toRadians(time * 90 + bobOffset)) * 0.1;
			glObject.children[0].rotation.z = _params["rotation"]["z"] + currentRotationSpeed * time;

			if(glObject.visible){
				material.opacity = Math.min(1, (time - fadeStartTime));
			}
		}
	}

	self.getObject3d = function() {
		return glObject;
	}

	self.dispose = function() {
		material.dispose();
	}

	return self;
}


mapdive.CylinderEntity = function( _uid, _params ) {

	var uid 	= _uid;
	var params 	= _params;
	var glObject;
	var isRunning=true;

	var cylinder_vs=[
		"uniform float time;",
		"varying vec2 vUv;",
		"void main() {",
		"	vUv=uv;",
		"	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
		"	gl_Position = projectionMatrix * mvPosition;",
		"}"
	].join("\n");

	var cylinder_fs=[
		"uniform float time;",
		"varying vec2 vUv;",
		"uniform vec3 color;",
		"void main() {",
		"	gl_FragColor = vec4(color,max(0.0,(0.25-vUv.y*vUv.y))*abs(sin(vUv.y*10.0-time*10.0)));",
		"}"
	].join("\n");

	var uniforms = {time: { type: "f", value: 0.0 }, color: {type: "v3", value: new THREE.Vector3(0, 0, 0)} };

	var material=new THREE.ShaderMaterial({
		uniforms: uniforms,
		attributes: {},
		vertexShader: cylinder_vs,
		fragmentShader: cylinder_fs,
		blending:THREE.AdditiveBlending,
		depthTest:true,
		side: THREE.DoubleSide,
		depthWrite:false,
		transparent:true
	});



    var geometry=new THREE.CylinderGeometry(120,80,80,36,1,true);


    glObject=new THREE.Mesh(geometry,material);

	glObject.position.x = params["position"]["x"];
    glObject.position.y = 40; // always have this locked to the ground plane.
    glObject.position.z = params["position"]["z"];
    glObject.scale.set(params["scale"], params["scale"], params["scale"]);

	var self 	= {};

	self.id = uid;
	self.type = "cylinder";

	self.message = function(data){
		if(data["style"]){
			var c = new THREE.Color( data["params"]["gradient"] );
			//console.log("SETTING UNIFORM" + c.r);
			uniforms.color.value.set(c.r, c.g, c.b);
		}
		if(data.run==true) { glObject.visible=true; isRunning=true; }
		else if(data.run==false && data.run!=undefined) { glObject.visible=false; isRunning=false; }
	}

	self.update = function( time ) {
		if (! isRunning) return;
		uniforms.time.value=time;
	}

	self.getObject3d = function() {
		return glObject;
	}

	self.dispose = function() {

	}

	return self;
}


mapdive.TransitionCloudEntity = function( _uid, _params ) {
	var uid 	= _uid;
	var params 	= _params;
	var glObject;
	var state=0;
	var fadeStartTime=0;
	
	var material = new THREE.MeshBasicMaterial({ 
		opacity: 0, transparent:true,
		color: 0xffffff,  
		//blending: THREE.AdditiveBlending,
		depthTest:false, depthWrite:false, 
		map : params["texture"],
		fog: false
	});
   	var tmp_geometry = new THREE.PlaneGeometry( 256, 256, 0, 0);

    glObject = new THREE.Mesh(tmp_geometry, material);

	glObject.position.x = params["position"]["x"];
    glObject.position.y = params["position"]["y"];
    glObject.position.z = params["position"]["z"];

	glObject.scale.set(params["scale"], params["scale"], params["scale"]);
	glObject.frustumCulling=false;
    glObject.rotation.x = toRadians(-90);
    glObject.visible=false;

    /*********** public stuff ***********/

	var self 	= {};

	self.id = uid;
	self.type = "transitioncloud";
	
	self.message = function(data){
		if (data.state=='fadein') { // handle the transition clouds
			glObject.visible=true;	
			//glObject.material.opacity=0;
			state=1;
			fadeStartTime=data.t;
		} else if (data.state=='fadeout') {
			glObject.visible=true;	
			//glObject.material.opacity=1;
			state=2;
			fadeStartTime=data.t;
		} 
	}

	self.update = function( time ) {
		if (state==1) {
			var alpha=Math.min(1,time-fadeStartTime)
			glObject.material.opacity=alpha;
			if (alpha==1) isTransitioning=true;
		}
		else if (state==2) {
			isTransitioning=false;
			glObject.material.opacity=Math.max(0,1-(time-fadeStartTime));
		}
		var pos=cameraContainer.position.clone();
		var dir=player.getPosition().clone();
		dir.sub(pos);
		dir.normalize();
		dir.multiplyScalar(3);
		pos.add(dir);
		glObject.position.copy(pos);	

		glObject.lookAt( cameraContainer.position );
	}

	self.getObject3d = function() {
		return glObject;
	}

	self.dispose = function() {
		material.dispose();
	}

	return self;
}


mapdive.BillboardEntity = function( _uid, _params ) {

	var uid 	= _uid;
	var params 	= _params;
	var glObject;

	
	var zRotate = randomRange(0,2*Math.PI);
	var zRotateSpeed = randomRange(-0.025, 0.025);
	var opacity = (_params["opacity"] !== null) ? _params["opacity"] : randomRange(0.5, 0.75);

	var material = new THREE.MeshBasicMaterial({ 
		opacity: opacity, transparent:true,
		color: 0xffffff,  
		//blending: THREE.AdditiveBlending,
		depthTest:true, depthWrite:false, 
		map : params["texture"],
		fog: false
	});
   	var tmp_geometry = new THREE.PlaneGeometry( 256, 256, 0, 0);

    glObject = new THREE.Mesh(tmp_geometry, material);

	glObject.position.x = params["position"]["x"];
    glObject.position.y = params["position"]["y"];
    glObject.position.z = params["position"]["z"];

    glObject.rotation.z = randomRange(0, 2 * Math.PI);

    glObject.scale.set(params["scale"], params["scale"], params["scale"]);
	
	glObject.rotation.x = toRadians(-90);
	
	/*********** public stuff ***********/

	var self 	= {};

	self.id = uid;
	self.type = "billboard";
	
	self.message = function(data){
		if(data["style"]){
			if(data["params"]["clouds"]){
				glObject.visible = true;
			} else {
				glObject.visible = false;
			}
		}

		if(data["hide"]) {
			console.log("Hiding clouds.");
			glObject.visible = false;
		}
	}

	self.update = function( time ) {
		if(!glObject.visible){
			return;
		}

		var dst = cameraContainer.position.distanceTo(glObject.position);
		var fadeStart = 100;
		var fadeStop = 50;
		
		if(dst < fadeStart){
			var fadeDist = fadeStart - fadeStop;
			
			dst = Math.max(0, dst - fadeStop);

			material.opacity = (dst / fadeDist) * opacity;
			//var c = dst/400;
			//material.color.setRGB(c, c, 1 );
		}
		glObject.lookAt( cameraContainer.position );
		glObject.rotation.z = (time * zRotateSpeed) + zRotate;
	}

	self.getObject3d = function() {
		return glObject;
	}

	self.dispose = function() {
		material.dispose();
	}

	return self;
}


mapdive.FireworksEntity = function(_uid,_params) {

	var uid 	= _uid;
	var params 	= _params;
	var glObject;
	
	var isRunning=false;

	var rockets=[];
	var numRockets=10;
	var partPerRocket=100;
	var numFireworks=numRockets*partPerRocket;

	var velocities=[];
	var gravity=new THREE.Vector3(0,-2,0);
	var areaSize=100;	// the area to spawn fireworks from
	var areaHalf=areaSize/2;

	var launchVelocityBase=250;
	var launchVelocityRange=50;
	var explodeVelocity=100;

	var launchTime=99; // in update frames
	var explodeTime=99;
	var resetTime=99;


	var fireworks_vs=[
		"attribute float size;",
		"attribute vec4 customColor;",
		"varying vec4 vColor;",
		"void main() {",
		"	vColor = customColor;",
		"	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
		"	gl_PointSize = size * ( 300.0 / length( mvPosition.xyz ) );",
		"	gl_Position = projectionMatrix * mvPosition;",
		"}"
	].join("\n");

	var fireworks_fs=[
		"uniform sampler2D texture;",
		"varying vec4 vColor;",
		"void main() {",
		"	gl_FragColor = vColor * texture2D( texture, gl_PointCoord );",
		"}"
	].join("\n");

	var shaderAttributes={ 	size: {type: 'f', value: []},
						customColor: { type: 'v4', value: [] } };

	var fireworksMaterial=new THREE.ShaderMaterial({
		uniforms: {	texture:   { type: "t", value: assetManager.getTexture("particle") } },
		attributes: shaderAttributes,
		vertexShader: fireworks_vs,
		fragmentShader: fireworks_fs,
		blending:THREE.NormalBlending,
		depthTest:true,
		depthWrite:false,
		transparent:true
	});

	var fireworksGeometry= new THREE.Geometry();
	var fireworksColors=shaderAttributes.customColor.value;
	var fireworksSizes=shaderAttributes.size.value;
	
	for (var i=0; i<numFireworks; i++) {
		fireworksGeometry.vertices.push(new THREE.Vector3(0,0,0));
		velocities.push(new THREE.Vector3(0,0,0));
	}
	fireworksGeometry.dynamic=true;
	
	glObject=new THREE.ParticleSystem(fireworksGeometry,fireworksMaterial);

	for (var i=0; i<numFireworks; i++) {
		fireworksColors[i]=new THREE.Vector4(1,1,1,1);
		fireworksSizes[i]=24;
	}

	glObject.position.x = params["position"]["x"];
    glObject.position.y = params["position"]["y"];
    glObject.position.z = params["position"]["z"];

    glObject.scale.set(params["scale"], params["scale"], params["scale"]);

	for (var i=0; i<numRockets; i++) {
		rockets.push({
			pos: new THREE.Vector3(Math.random()*areaSize-areaHalf,0,Math.random()*areaSize-areaHalf),
			vel:new THREE.Vector3(0,launchVelocityBase,0) ,
			phase:0,
			delay:Math.random()*120,
			type:1 
		});
		var col=new THREE.Color();	col.setHSL(Math.random(),1,0.5);
		for (var j=i*partPerRocket;j<(i+1)*partPerRocket; j++) { 
			shaderAttributes.customColor.value[j].x=col.r;
			shaderAttributes.customColor.value[j].y=col.g;
			shaderAttributes.customColor.value[j].z=col.b;
			shaderAttributes.customColor.value[j].w=0;
		}
	}

	glObject.visible=false;
	console.log('Fireworks inited '+numFireworks);
	
	/*********** public stuff ***********/

	var self 	= {};

	self.id = uid;
	self.type = "fireworks";

	self.update = function( time ) {
		
		if (! isRunning) return;

		for (var i=0; i<numRockets; i++) {
			
			rockets[i].delay--;
			
			// timer has expired, switch phase
			if (rockets[i].delay<=0) { 			
				switch(rockets[i].phase) {
					case 0: 					// we were waiting, now launch
						rockets[i].phase=1;
						rockets[i].delay=launchTime;
						for (var j=i*partPerRocket;j<(i+1)*partPerRocket; j++) { 
							shaderAttributes.customColor.value[j].w=0;
						}
						break;
					case 1: 					// we were launching, now explode
						rockets[i].phase=2;
						rockets[i].delay=explodeTime;
						for (var j=i*partPerRocket;j<(i+1)*partPerRocket; j++) { 
							glObject.geometry.vertices[j].copy(rockets[i].pos);
							var a1=Math.random()*Math.PI*2;
							var a2=Math.random()*Math.PI*2;
							var rad=100;
							var explodeVector=new THREE.Vector3(rad*Math.cos(a1)*Math.sin(a2),rad*Math.cos(a2),rad*Math.sin(a1)*Math.sin(a2));
							velocities[j].copy(rockets[i].vel);
							velocities[j].add(explodeVector);
							shaderAttributes.customColor.value[j].w=1;

						}
						break;
					case 2: 					// we were exploding, now reset
						rockets[i].phase=0;
						rockets[i].delay=resetTime;
						var col=new THREE.Color();
						col.setHSL(Math.random(),1,0.3);
						for (var j=i*partPerRocket;j<(i+1)*partPerRocket; j++) { 
							shaderAttributes.customColor.value[j].x=col.r;
							shaderAttributes.customColor.value[j].y=col.g;
							shaderAttributes.customColor.value[j].z=col.b;
						}
						rockets[i].pos.set(Math.random()*areaSize-areaHalf,0,Math.random()*areaSize-areaHalf);
						rockets[i].vel.set(0,Math.random()*launchVelocityRange+launchVelocityBase,0); 
						break;
				}
			}
			
			// process current phase
			switch(rockets[i].phase) {
				case 1: // going up with trail
					rockets[i].pos.add(rockets[i].vel);
					rockets[i].vel.add(gravity);
					rockets[i].vel.add(new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5));
					var current=i*partPerRocket+rockets[i].delay;
					glObject.geometry.vertices[current].copy(rockets[i].pos);
					shaderAttributes.customColor.value[current].w=1;
					var alpha=1;
					for (var j=current;j<(i+1)*partPerRocket; j++) {
						shaderAttributes.customColor.value[j].w=alpha;
						alpha-=0.1;

					}
					break;
				case 2: // exploding
					for (var j=i*partPerRocket;j<(i+1)*partPerRocket; j++) { 
						glObject.geometry.vertices[j].add(velocities[j]);
						velocities[j].add(gravity);
						velocities[j].add(new THREE.Vector3(Math.random()*0.1,Math.random()*0.1,Math.random()*0.1));
						shaderAttributes.customColor.value[j].w=((rockets[i].delay-1)/100);
					}
					break;
			}
		}
		
		shaderAttributes.customColor.needsUpdate = true;
		glObject.geometry.verticesNeedUpdate=true;		
	}

	self.message = function( data ) {
		
		//console.log('Fireworks msg ',data);
		if (data.run==true) { isRunning=true; glObject.visible=true; }
		else { isRunning=false; glObject.visible=false; }

	}

	self.getObject3d = function() {
		return glObject;
	}

	self.dispose = function() {
		fireworksMaterial.dispose();
		fireworksGeometry.dispose();
	}

	return self;
}


mapdive.ConfettiEntity = function(_uid,_params) {
	var uid 	= _uid;
	var params 	= _params;
	var glObject;
	
	var isRunning = true;
	
	var numConfetti = 400;
	
	var uniforms={ texture: { type: "t", value: assetManager.getTexture("particle") } , time: { type: "f", value: 0.0 }, "center" : {type: "v3", value: new THREE.Vector3(0, 0, 0)}, };
	var attributes={freq: { type: "f", value: [] }, phase: { type: "f", value: [] } };

	// MODE 0 GOING IN Z, MODE 1 IN Y
	var vertex_shader=[
		"const float WRAP_SIZE = 350.0;",
		"const float WRAP_HALF = 175.0;",
		"uniform float time;",
		"uniform vec3 center;",
		"attribute float freq;",
		"attribute float phase;",
		"varying vec4 vColor;",
		"void main() {",
		"   float v= abs(sin(time*freq+phase))*0.25+0.75;",
		"	vColor = vec4(1.0,1.0,1.0,1.0);",
		"	vec3 cent = vec3(center * 1.65);",
		"	vec4 pos = vec4( mod(position.x-cent.x, WRAP_SIZE) - WRAP_HALF, mod(position.y - cent.y, WRAP_SIZE) - WRAP_HALF, mod(position.z-cent.z, WRAP_SIZE) - WRAP_HALF, 1.0 );",
		"	vec4 mvPosition = modelViewMatrix * pos;",
		"	gl_PointSize = 24.0;",// + clamp(WRAP_SIZE / length(pos),0.0,1.0) * 12.0;",
		"	gl_Position = projectionMatrix * mvPosition;",
		//"	vColor.a = v - (length(pos) / WRAP_HALF );",
		"}"
	].join("\n");

	var fragment_shader=[
		"uniform sampler2D texture;",
		"varying vec4 vColor;",
		"void main() {",
		"	gl_FragColor = vColor * texture2D( texture, gl_PointCoord );",
		"}"
	].join("\n");

	var confettiMaterial=new THREE.ShaderMaterial({
		uniforms: uniforms,
		attributes: attributes,
		vertexShader: vertex_shader,
		fragmentShader: fragment_shader,
		
		depthTest:true,
		depthWrite:false,
		transparent:true
	});

	var confettiGeometry= new THREE.Geometry();
	
	for (var i=0; i<numConfetti; i++) {
		confettiGeometry.vertices.push(new THREE.Vector3(
			Math.random()*350-175,
			Math.random()*350-175,
			Math.random()*350-175
		));
	}
	
	glObject=new THREE.ParticleSystem(confettiGeometry,confettiMaterial);

	for (var i=0; i<numConfetti; i++) {
		attributes.freq.value[i]=Math.random()*1+4;
		attributes.phase.value[i]=Math.random()*Math.PI;
	}
	attributes.freq.needsUpdate=true;
	attributes.phase.needsUpdate=true;

	glObject.position.x = params["position"]["x"];
    glObject.position.y = params["position"]["y"];
    glObject.position.z = params["position"]["z"];
    //glObject.visible=false;
    //glObject.scale.set(params["scale"], params["scale"], params["scale"]);

    console.log('Confetti inited ' + numConfetti);
	
	/*********** public stuff ***********/

	var self 	= {};

	self.id = uid;
	self.type = "confetti";

	self.update = function( time ) {

		if (! isRunning) return;

		uniforms.time.value=time;

		glObject.position.copy(cameraContainer.position);
	//	glObject.rotation.copy(cameraContainer.rotation);
		uniforms.center.value.copy( cameraContainer.position );
	}

	self.message = function( data ) {
		//if (data.run==true) { isRunning=true; glObject.visible=true; }
		//else if (data.run==false && data.run!=undefined) { isRunning=false; glObject.visible=false; }

	}

	self.getObject3d = function() {
		return glObject;
	}

	self.dispose = function() {

	}

	return self;
}


