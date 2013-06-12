mapdive.Player = function( _config ) {
	
	// PRIVATE 
	var scene = _config["scene"];
    var player;
    var leftArmAngle = 0;
    var rightArmAngle = 0;
    var armLength = 0;
    var leftTrailGeo, rightTrailGeo, leftTrail, rightTrail;
    var numTrailSegments = 50;
    var counter = 0;

    var hasInited = false;
    var hasTrails = false;
    
    var useParticles = false;
 
    var parachute;
    
    var helmetMaterial; 
	var headMaterial; 
	var pegmanMaterial; 
	var backpackMaterial;
	var trailMaterial; 
	

	// PUBLIC
	var self = {};

    self.setStyle = function(styleName, styleParams){
    	var pegmanStyles = ["8bit", "burningman", "night", "raver", "revolutions", "scifi", "terminal", "volcano"];
    	var baseName = "default";
    	for(var i = 0; i < pegmanStyles.length; i++){
    		if(pegmanStyles[i] == styleName){
    			baseName = styleName;
    			break;
    		}
    	}

		helmetMaterial.map 		= assetManager.getTexture("helmet_" + baseName); 
		headMaterial.map 		= assetManager.getTexture("head_" + baseName); 
		pegmanMaterial.map 		= assetManager.getTexture("body_" + baseName); 
		backpackMaterial.map 	= assetManager.getTexture("backpack_" + baseName);

		trailMaterial.color.setStyle(styleParams["target"]);
    }

	self.initialize = function() {

		if (hasInited) return; // Don't init twice, it screws things, if something in the player really needs to be reset, put it above this...

		helmetMaterial 		= new THREE.MeshPhongMaterial({emissive:0x666666, color:0xFFFFFF, map:assetManager.getTexture("helmet_default")}); 
	    headMaterial 		= new THREE.MeshLambertMaterial({emissive:0x2b2200, color:0xFFFFFF , map:assetManager.getTexture("head_default")}); 
	    pegmanMaterial 		= new THREE.MeshLambertMaterial({emissive:0x505050, color:0xFFFFFF, map:assetManager.getTexture("body_default")}); 
	    backpackMaterial 	= new THREE.MeshLambertMaterial({emissive:0x666666, color:0xFFFFFF, map:assetManager.getTexture("backpack_default")}); 
	    
	    var glassesMaterial = new THREE.MeshPhongMaterial({shininess:280,specular:0xffffff,transparent:true,opacity:0.85, color:0x000000}); 

		var object = assetManager.getModel("pegman");

		trailMaterial = new THREE.MeshBasicMaterial({
			color:0xffffff,
			side:THREE.DoubleSide,
			opacity:0.35,
			transparent:true,
			depthWrite:false,
			depthTest:true,
			renderDepth:2
		});

		leftTrailGeo = new THREE.Geometry();
		rightTrailGeo = new THREE.Geometry();
		leftTrail = new THREE.Ribbon(leftTrailGeo, trailMaterial);
		rightTrail = new THREE.Ribbon(rightTrailGeo, trailMaterial);

		for(var i = 0; i < numTrailSegments; i++) { 	// you need to create all the vertices you need before rendering the object
			leftTrailGeo.vertices.push(new THREE.Vector3());
			rightTrailGeo.vertices.push(new THREE.Vector3());
		}
		
		// PARSE THE MODEL
		var cx,cy,cz; // center of the torso

	    object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
			
				var translateMatrix = new THREE.Matrix4();
				var childSize, childMin, childMax;
				var tx, ty, tz;
				
				// Calculate bounding box size and corner positions
				child.geometry.computeBoundingBox();
				
				childSize = child.geometry.boundingBox.size();
				childMin = child.geometry.boundingBox.min;
				childMax = child.geometry.boundingBox.max;

				if (child.material) child.material.dispose();

				// Reposition all the geometry so the rotation center of each child is how we want it, assign textures							
				switch(child.name) {
					case 'HELMET':
						child.geometry.computeVertexNormals();
						child.material = helmetMaterial;
						break;
					case 'GLASSES':
						child.geometry.computeVertexNormals();
						child.material = glassesMaterial;
						break;
					case 'BACKPACK':
						child.material = backpackMaterial;
						break;						
					case 'HEAD':
						child.geometry.computeVertexNormals();
						child.material = headMaterial;
						break;									
					case 'CHEST':
						child.material = pegmanMaterial;
						// store the center point of the chest for use later.
						cx = childMin.x + childSize.x / 2;
						cy = childMin.y + childSize.y / 2;
						cz = childMin.z + childSize.z / 2;
						break;
					case 'ARM_Left':
						armLength = childSize.y;
						child.material = pegmanMaterial;
						tx = -childMin.x - childSize.x / 2;
						ty = -childMax.y;
						tz = -childMin.z - childSize.z / 2;
						translateMatrix.makeTranslation(tx, ty, tz);
						child.geometry.applyMatrix(translateMatrix);
						child.position.set(-tx, -ty, -tz);		
						break;
					case 'ARM_Right':
						child.material = pegmanMaterial;								
						tx = -childMin.x - childSize.x / 2;
						ty = -childMax.y;
						tz = -childMin.z - childSize.z / 2;
						translateMatrix.makeTranslation(tx, ty, tz);
						child.geometry.applyMatrix(translateMatrix);
						child.position.set(-tx, -ty, -tz);
						break;
					case 'Leg_Left':
						child.material = pegmanMaterial;								
						tx = -childMin.x;
						ty = -childMax.y;
						tz = -childMin.z;
						translateMatrix.makeTranslation(tx, ty, tz);
						child.geometry.applyMatrix(translateMatrix);
						child.position.set(-tx, -ty, -tz);						
						break;
					case 'Leg_Right':
						child.material = pegmanMaterial;	
						tx = -childMin.x;
						ty = -childMax.y;
						tz = -childMax.z;
						translateMatrix.makeTranslation(tx, ty, tz);
						child.geometry.applyMatrix(translateMatrix);
						child.position.set(-tx, -ty, -tz);		
						break;
				}
			}
		} );

		// Adjust all the pegman parts so the center of the chest is the origin (so he rotates around his middle)
		var correction = new THREE.Vector3(-cx, -cy, -cz);
		object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.position.add(correction);
			}	
		});

		// PARACHUTE
		parachute = assetManager.getModel("parachute");
		var parachuteMaterial = new THREE.MeshPhongMaterial({
			side: THREE.DoubleSide, 
			color: 0xffffff, 
			emissive: 0x585858, 
			map: assetManager.getTexture('parachute')
		});

		var wiresMaterial = new THREE.MeshBasicMaterial({
			side: THREE.DoubleSide, 
			color: 0x000000, 
			transparent: true, 
			opacity: 0.1
		});

		parachute.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				console.log('parsing ',child.name);		
				switch(child.name) {
					case 'CANOPY':
						child.geometry.computeVertexNormals();
						child.material = parachuteMaterial;
						break;
					case 'WIRES':
						child.material = wiresMaterial;
						break;
				}
			}
		});
		parachute.name = 'parachute';
		parachute.position.set(0, 0, 1);

		player = new THREE.Object3D();
		object.rotation.x = -Math.PI / 2;			// orient the model for the game
		object.rotation.y = Math.PI / 2;			// any change in pitch should be done on object, roll and heading done on player to avoid gimbal bugs
		object.scale.set(0.0075, 0.0075, 0.0075);
		player.parts = object;
		player.add(object);
		
		scene.add( player );
		
		hasInited = true;
	}

	self.addTrails = function() {
		if (hasTrails) return;
		hasTrails = true;
		scene.add(leftTrail);					// the trails need to be in world coordinates
		scene.add(rightTrail);         
	}

	// ANIMATE THE PEGMAN
	self.update=function(data) {
		
		var t = data.t * 1000;
		var _leftArmAngle = data.player.leftarm;
		var _rightArmAngle = data.player.rightarm;
		var _bodyAngle = data.player.bodyangle;
		var parachuteOpenTime = data.player.parachute;
		
		// ARMS
		if (isNaN(_leftArmAngle) || _leftArmAngle==undefined || _leftArmAngle==null || _leftArmAngle==0) { 
			// if not tracking, move the arms on sine wave series
			var armSpread=Math.sin(t*0.0025)*0.1*Math.PI*Math.sin(t*0.0014+2)*Math.sin(t*0.001+1)*Math.sin(t*0.0034+1.4)+0.1*Math.PI;
			
			player.parts.getObjectByName('ARM_Right').rotation.x = armSpread;
			player.parts.getObjectByName('ARM_Left').rotation.x =- armSpread;
			
			leftArmAngle = armSpread;
			rightArmAngle =- armSpread;
		} else {
			// tracking the arms: animate them
			var leftTarget=-_leftArmAngle-Math.PI/2+_bodyAngle; // normal range is now 0->PI/2 and -2 1/2 PI -> -PI
			while (leftTarget<0) leftTarget+=Math.PI*2; // we're now in 0 to PI range	
			if (leftTarget>1.5*Math.PI) leftTarget=0;	// clip 
			else if (leftTarget>Math.PI) leftTarget=Math.PI;
			// right
			var rightTarget=-_rightArmAngle-Math.PI/2+_bodyAngle;		
			while (rightTarget>0) rightTarget-=Math.PI*2; // should be in 0 to -PI *2 range 
			if (rightTarget<-1.5*Math.PI) rightTarget=0; // clip
			else if (rightTarget<-Math.PI) rightTarget=-Math.PI;

			// interpolate values
			leftArmAngle += (leftTarget-leftArmAngle) * 0.1;
			rightArmAngle += (rightTarget-rightArmAngle) * 0.1;
			
			player.parts.getObjectByName('ARM_Left').rotation.x =- leftArmAngle;
			player.parts.getObjectByName('ARM_Right').rotation.x =- rightArmAngle;
		}
		
		// LEGS: move the legs on sinewave series
		var legAngle = Math.sin(t*0.0013)*Math.PI*0.05*Math.sin(t*0.0021+1)+Math.PI*0.05;
		var legAngle2 = Math.sin(t*0.0018)*Math.PI*0.05*Math.sin(t*0.0023+1)+Math.PI*0.05;
		var legSpread = Math.sin(t*0.002)*Math.PI*0.05*Math.sin(t*0.0031+1)*Math.sin(t*0.001+3)*Math.sin(t*0.004+1.7)+Math.PI*0.05;

 		player.parts.getObjectByName('Leg_Left').rotation.z = legAngle;
		player.parts.getObjectByName('Leg_Right').rotation.z = legAngle2;
		player.parts.getObjectByName('Leg_Left').rotation.x =- legSpread;
		player.parts.getObjectByName('Leg_Right').rotation.x = legSpread;
		
		if (useParticles || (counter % 2 == 0)) { // only do ribbon every other frame, so it's longer / smoother

			// calculate the position of the hands and update the trails
			var leftHand = new THREE.Vector3();
			var rightHand = new THREE.Vector3();
			var l = armLength * 0.8;
			var a = 0;
			
			if (!useParticles && ((counter % 4) == 0)) {
				a = 0.1; // offset arm length every other ribbon frame so we have a ribbon and not a line
			}
			
			if (data.player.trails == 1) {
				leftHand.copy(player.parts.getObjectByName('ARM_Left').position);
				leftHand.y -= Math.cos(-leftArmAngle-a)*l;
				leftHand.z -= Math.sin(-leftArmAngle-a)*l;
				player.parts.localToWorld(leftHand);
				
				rightHand.copy(player.parts.getObjectByName('ARM_Right').position);
				rightHand.y -= Math.cos(-rightArmAngle-a)*l;
				rightHand.z -= Math.sin(-rightArmAngle-a)*l;
				player.parts.localToWorld(rightHand);
				
				// now we are removing the first vertice and adding last vertice in world coordinates
				leftTrailGeo.vertices.shift(); leftTrailGeo.vertices.push(leftHand); leftTrailGeo.verticesNeedUpdate=true;
				rightTrailGeo.vertices.shift();	rightTrailGeo.vertices.push(rightHand);	rightTrailGeo.verticesNeedUpdate=true;
				
				leftTrail.visible=true;
				rightTrail.visible=true;
			} else {
				leftTrail.visible=false;
				rightTrail.visible=false;
			}
		}

		// ANIMATE THE PARACHUTE
		if (data.player.parachute != 0) {
			// add the para if not there yet
			if (!player.getObjectByName('parachute')) player.add(parachute);

			var pTime = data.t - data.player.parachute; // time since we opened
			
			if (pTime < 2) {
				// first two seconds, bounce that parachute open
				var s = Easing.easeOutBounce(0,pTime,0,1.5,2);
				parachute.scale.set(s,s,s);
			} else {
				// then just wobble a little
				var s = Math.sin(t*0.0015)*Math.sin(t*0.0024+2)*0.1+1.5;
				parachute.scale.set(s,s,s);
			}
		} else {
			// remove the para
			if (player.getObjectByName('parachute')) player.remove(parachute);
		}	
		counter++;	
	}

	
	self.getPosition = function() {
		return player.position;
	}


	self.getRotation = function() {
		return player.rotation;
	}
	

	self.setPitch = function(angle) {
		player.parts.rotation.x = angle;
	}


	self.setRoll = function(angle) {
		player.parts.rotation.y = angle+Math.PI;
	}


	self.setHeading = function(angle){
		player.rotation.y = angle;
	}


	return self;
}