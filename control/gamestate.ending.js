mapdive.EndingState = function() {
	
	var self = {};
  	var sequence = 0;
  	var seqTime = 0;
  	var orbitTime = 0;
  	//var lastDistanceToLandMark;

  	var PLAYER_TRACKING=0;
  	var PLAYER_TANGENT=1;
  	var PLAYER_ORBITING=2;
  	var PLAYER_ORBITING2=3
  	var PLAYER_ASCENDING=4;
  	var PLAYER_ENDDONE=5;

  	var targetAngle = 0;
  	var targetRadius = 0.1;
  	var orbitDirection = 1;

  	var targetPlayerPos = new THREE.Vector3();
  	var landmarkPosition = new THREE.Vector3();

  	var playerTargetMarker = new google.maps.Marker({
      map: map,
      icon: { 
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        rotation:90
      },
      draggable: false
    });

  	function doPlayerOrbit(){

  		var  angle = targetAngle + ((viewState.t - orbitTime) * toRadians(51));

  		var radiusOffset = targetRadius + (Math.sin(viewState.t*0.2123) * Math.cos(viewState.t * 0.34566)) * 0.007;
  		var tx = landmarkPosition.x + (Math.cos(angle) * radiusOffset);
		var tz = landmarkPosition.z + (Math.sin(angle) * radiusOffset);

		var tangentHeading = Math.atan2(landmarkPosition.z - playerPos.z, landmarkPosition.x - playerPos.x) - Math.PI / 2;

		playerHeading.set(tangentHeading);
		playerHeading.wrap();
	  	
		targetPlayerPos.set(tx, 50 + (Math.sin(viewState.t*0.41123) * Math.cos(viewState.t * 0.3766)) * 20, tz);
		
		playerPitch.set( toRadians( Math.max(-20, Math.min(20, (playerPos.y - targetPlayerPos.y) * 3 ) )));

		playerTargetMarker.setPosition( map.getProjection().fromPointToLatLng( new google.maps.Point(targetPlayerPos.x, targetPlayerPos.z)));

		playerPos.lerp( targetPlayerPos, 0.08 );
  	}


	self.setActive = function() {
		sendMessage( { entity: "cylinder", run:false  } );
		sendMessage( { entity: "fireworks", run:true  } );
		//sendMessage( { entity: "confetti", run:false  } );
		//sendMessage( { entity: "crowd", run:true  } );
		sendMessage( {mapzoom : "off"} );

		sequence = PLAYER_ORBITING;
		orbitTime = viewState.t;
		seqTime=viewState.t;
		//console.log('Start Ending Seq 0');
		
		//setCameraMode("idle-side", 1.5);
		setCameraMode("end-player1", 2);

		//playerTarget.copy( landmark.position );
		var lastGatePosition = new THREE.Vector3();

		// find the last gate and landmark.
		for(var i = 0; i < entities.length; i++){
			if(entities[i].type == "gate" && entities[i].params["last"]){
				lastGatePosition.x = entities[i].position.x;
				lastGatePosition.z = entities[i].position.z;
				lastGatePosition.y = 0;
			}

			if(entities[i].type == "landmark"){
				landmarkPosition.x = entities[i].position.x;
				landmarkPosition.z = entities[i].position.z;
				landmarkPosition.y = 0;
			}
		}

		targetAngle = Math.atan2(landmarkPosition.z - playerPos.z, landmarkPosition.x - playerPos.x) + Math.PI;
		

		targetRadius = 0.018;
		console.log("target angle:" + targetAngle + ", targetRadius:" + targetRadius);

		
		playerPitch.set(0);
		playerRoll.set(0);
	}


	self.update = function() {

	  var minDistanceToLandmark=50; 

	  var heading = playerHeading.get();

	  // STEER TOWARDS THE LANDMARK AND AROUND IT
	  /*
	  var toLandMarkVector=new THREE.Vector3();
	  toLandMarkVector.subVectors(dropzonePos,playerPos);   
	  toLandMarkVector.y=0; // ignore altitude component
	  toLandMarkVector.multiplyScalar(WORLD_SCALE); // to gl coordinates   

	  var distanceToLandMark=toLandMarkVector.length();
	  var headingToLandMark=Math.atan2(toLandMarkVector.z,toLandMarkVector.x);
	  var headingDelta=0;

	  var angleToLandMark=(headingToLandMark-heading);
	  while (angleToLandMark<-Math.PI) angleToLandMark+=Math.PI*2;
	  while (angleToLandMark>Math.PI) angleToLandMark-=Math.PI*2;

	   // when tracking, wrap things around to match atan2 -PI to PI format	          
	  if (sequence==PLAYER_TRACKING) { 
	    while (heading<-Math.PI) heading+=Math.PI*2;
	    while (heading>Math.PI) heading-=Math.PI*2;
	  } else {
	  	// when orbiting wrap positive to we're always turning the same way
	    if (headingToLandMark<0) headingToLandMark+=Math.PI*2; 
	  }	  


	  if (sequence==PLAYER_TRACKING && ( distanceToLandMark<minDistanceToLandmark || (viewState.t-seqTime)>3)  ) { 
	  //if (sequence==PLAYER_TRACKING && ( (viewState.t-seqTime)>2)  ) { 
	    // player was tracking, got in range, turn away to get tangential
	    sequence=PLAYER_TANGENT;
	    setCameraMode("end-landmark1", 0);
	  }
	  else if (sequence==PLAYER_TANGENT && ( Math.abs(angleToLandMark)>Math.PI*0.45  )) {
	  //else if (sequence==PLAYER_TANGENT && ( distanceToLandMark>=minDistanceToLandmark )) {
	    sequence=PLAYER_ORBITING;
	    seqTime=viewState.t;
	  }
	  else if (sequence==PLAYER_ORBITING && viewState.t-seqTime>7) {
	    sequence=PLAYER_ORBITING2;
	    seqTime=viewState.t;
	    setCameraMode("end-landmark2", 0);
	    
	  }*/

	  if(sequence == PLAYER_ORBITING){

	  	doPlayerOrbit();

		if(viewState.t - seqTime > 8){
	    	sequence=PLAYER_ORBITING2;
	  	  	seqTime=viewState.t;
	   		setCameraMode("end-landmark2", 0);
		}

	  } else if (sequence==PLAYER_ORBITING2){
		
		doPlayerOrbit();

	  	if(viewState.t-seqTime>8) {
		    sequence=PLAYER_ASCENDING;
		    ascentSpeed=0;
		    seqTime=viewState.t;
		    setCameraMode("end-player2", 0);
		    sendMessage( { entity: "fireworks", run:false  } );
		}
	  }
	  else if (sequence == PLAYER_ASCENDING && viewState.t-seqTime>4) {
	    // END OF FLYING UP SEQUENCE
	    sequence=PLAYER_ENDDONE;
	    sendMessage( { entity: "transition_cloud", state:'fadein' } );
	    seqTime=viewState.t;
	    //if (isUserPresent) startNewGame();
	    //else setGameState(STATE_IDLE);
	  }
	  else if (sequence==PLAYER_ENDDONE && viewState.t-seqTime>1) {
	  	setGameState(STATE_IDLE);
	    return;
	  }



	  //if (sequence==PLAYER_TRACKING) headingDelta=headingToLandMark-heading;
	  //else if (sequence==PLAYER_TANGENT) headingDelta=-2.5; // turn away to start the orbit when heading on
	  //else headingDelta=Math.min(Math.abs(headingToLandMark-heading),2.5); // turn the other way once tangential

	  if (sequence<PLAYER_ASCENDING) {
	  	/*
	  	playerPitch.setEase(0.03);
	    playerRoll.set(headingDelta*0.25);
	    playerHeading.add(headingDelta*0.01);
	    playerPitch.set(0);

	    playerPos.x+=Math.cos(playerHeading.get())*playerSpeed;
	    playerPos.y+=(70-playerPos.y)*0.03;
	    playerPos.z+=Math.sin(playerHeading.get())*playerSpeed;
	    playerSpeed+=(0.0005-playerSpeed)*0.03;
	    */

	  } else {
	  	playerPitch.setEase(0.03);
	    playerPitch.set(-Math.PI/2);
	    playerPos.x+=Math.cos(playerHeading.get())*playerSpeed;
	    playerPos.y=Math.min(1500,playerPos.y+ascentSpeed);
	    playerPos.z+=Math.sin(playerHeading.get())*playerSpeed;
	    if (ascentSpeed<2) ascentSpeed+=0.1;
	    playerSpeed+=(0.000-playerSpeed)*0.03;
	  }

	  
	}

	return self;
}
