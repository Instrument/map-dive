mapdive.DiveState = function() {

	var introCloudsVisible = false;
	var gravityMultiplier = 1.2;	
	var self = {};

	self.setActive = function() {
		setCameraMode("chase", 2);
  		
  		viewState.player.trails=1;
  		if(!hideHUD){
  			sendMessage({"hud" : "show"});
  		}
  		introCloudsVisible = true;
	}

	self.update = function( editMode ) {
		var speedMultiplier = 2; // global multiplier for movement speed

		var turnSpeed = 0.03; // max turn speed
		var defaultSpeed = 0.00004;

		var fastSpeedModifier = defaultSpeed;
		var slowSpeedModifier = defaultSpeed / 2;

		if(-controlValues.speed.get() >= 0){
			targetPlayerSpeed = fastSpeedModifier * -controlValues.speed.get() + defaultSpeed;
		} else {
			targetPlayerSpeed = slowSpeedModifier * -controlValues.speed.get() + defaultSpeed;
		}
  
		// TWEEN - todo: refactor this into a common spot, this same code is duplicated in several game state managers.
		if (isTweening) {
			for(var i=0;i<theTweens.length;i++) {
				if (currentTime<=theTweens[i].end) {
					if(currentTime>=theTweens[i].start) {
					  if (theTweens[i].started==false) {
					      theTweens[i].startValue=Number(window[theTweens[i].param].get()); // record start value
					      theTweens[i].endValue=(Number(theTweens[i].value)*Math.PI/180)-theTweens[i].startValue;
					      theTweens[i].started=true; // start the tween
					  }
					  var val=theTweens[i].tweenFunc(0,currentTime-theTweens[i].start,theTweens[i].startValue,theTweens[i].endValue,Number(theTweens[i].duration));
					  window[theTweens[i].param].now(val);
					}
				}
			}
			if (currentTime>=tweenEndTime) {
				isTweening=false;
				for(var i=0;i<theTweens.length;i++) {
					window[theTweens[i].param].clamp();
					theTweens.splice(i,1);
					i--;
				}
			}
		} else {
			playerHeading.add(turnSpeed * controlValues.heading.get());
			playerRoll.set( turnSpeed *  controlValues.heading.get() * 40);  
		}

		targetPlayerSpeed *= speedMultiplier;

		var speedNormalized = (controlValues.speed.get() + 1) / 2;

		fallSpeed = 0.3 + 0.7 * Math.sin( speedNormalized * Math.PI / 2);
		targetPlayerSpeed *= Math.cos( speedNormalized * Math.PI / 2);

		playerPitch.set( Math.atan2(fallSpeed, playerSpeed * WORLD_SCALE) );

		playerSpeed += (targetPlayerSpeed - playerSpeed) * 0.1 + 0.000001;

		viewState.player.speed = playerSpeed;
		viewState.cam.speed = cameraSpeed.get();

		playerPos.x += Math.cos(playerHeading.get()) * playerSpeed;
		playerPos.z += Math.sin(playerHeading.get()) * playerSpeed;


		if(gravityEnabled){
			playerPos.y -= fallSpeed * gravityMultiplier;
		}

		// check for win/loose conditions.
		if((currentState != STATE_EDITOR) && (playerPos.y < endingAltitude)){

			var tmpPlayer = new THREE.Vector3();
			tmpPlayer.x = playerPos.x * WORLD_SCALE;
			tmpPlayer.y = 0;
			tmpPlayer.z = playerPos.z * WORLD_SCALE;

			var tmpDropzone = new THREE.Vector3();
			tmpDropzone.x = dropzonePos.x * WORLD_SCALE;
			tmpDropzone.y = 0;
			tmpDropzone.z = dropzonePos.z * WORLD_SCALE;
			
			setGameState(STATE_LOOSE);
		}

		// hide the cluster of clouds around the starting point (looks bad from a distance)
		if(introCloudsVisible && (playerPos.y < 3600)) {
			sendMessage({"entity" : "top_cloud", "hide" : 1});
			introCloudsVisible = false;
		}

	  	mapdive.sound.update(controlValues.speed.get());

	  	if(bonusModeActive){
	  		if(now() > (bonusModeStartTime + 15)){
	  			bonusModeActive = false;
	  			sendMessage({"bonusmode" : "normal"});
	  		}
	  	}
	}

	return self;
}