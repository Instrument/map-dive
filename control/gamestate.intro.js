mapdive.IntroState = function() {
	

	// this should be refactored, it's duplicated a few times throughout the code.
	function updateTweens() {
		if(isTweening){
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
		}
	}

	var self = {};

	var CLIMBING_START = 0;
	var CLIMBING_END = 5;
	var FLOATING = 1;
	var CHOOSE_DIVE = 3;
	var STARTING = 2;
	var LEAD_IN = 4;


	var yVelocity = 0;
	var state = LEAD_IN;
	var climbStartTime = 0;
	var floatStartTime = 0;

	
	var tweenStartTime = 0;

	var leadInStartTime = 0;
	var climbStartTime = 0;
	var floatTime = 0;
	var instructionsVisible = false;

	var firstGateHit = false;

	self.setActive = function(previewMode) {
		sendMessage( {mapzoom : "on"} );
		
		firstGateHit = false;
		instructionsVisible = false;

		playerHeading.set( currentLevel.origin.rotation.y);
		playerRoll.set(0);
		
		viewState.player.parachute = 0;
		viewState.player.trails=0;

		yVelocity = 0;

       	setCameraMode("closeup", 2);
		state = LEAD_IN;

		climbStartTime = now();
		leadInStartTime = now();

		sendMessage({"hud" : "hide"});

		sendMessage({"entity" : "top_cloud", "hide" : 1});
		
		// do a spin as he starts flying up into the air
		var endVal = playerRoll.get() * 180/Math.PI - 360;
		startTween([
          {"tween":"roll", "value":endVal, "delay":"1", "ease":"easeInOutQuad", "duration":"1.5"}
        ]);
	}


	self.update = function() {
		switch(state){

			case LEAD_IN:

				playerRoll.set(Math.PI);
				playerPitch.set(-Math.PI / 2);

				if(!instructionsVisible && (now() - leadInStartTime > 0.25)){

					sendMessage({"hud" : "show_instructions"});
					instructionsVisible = true;
				}

				if(now() - leadInStartTime > 2){
					state = CLIMBING_START;
					climbStartTime = now();
					setCameraMode("intro_climb", 1);
				}
			break;

			case CLIMBING_START:
				
				playerPitch.set(toRadians(-100));
				playerRoll.set(0);

				// blast off into the air.
				playerPos.y += (2000 - playerPos.y) * 0.015;

				playerHeading.set( currentLevel.origin.rotation.y );
				
				if(now() - climbStartTime > 1.55){
					currentLevel = mapdive.getNextLevel(currentLevel.name);
					loadLevel(currentLevel.name);

					playerPos.x = currentLevel.origin.position.x;
					playerPos.z = currentLevel.origin.position.z;
					playerPos.y = 3930;

					setCameraMode("intro_float", 0);
					climbStartTime = now();

					playerPos.x = currentLevel.origin.position.x;
					playerPos.z = currentLevel.origin.position.z;

					// still facing the camera.
					playerHeading.set( currentLevel.origin.rotation.y );

					state = CLIMBING_END;
				}
			break;

			case CLIMBING_END:

				playerPos.y += ((4000 + Math.sin(now()) * 4) - playerPos.y) * 0.025;

				if(now() - climbStartTime > 2) {
					floatTime = now();
					state = FLOATING;
					sendMessage({"hud" : "intro_search", "search" : currentLevel.description.search});
				}
			break;

			case FLOATING:

				playerPos.y += (4000 - playerPos.y) * 0.002;

				if(now() - floatTime > 1) {
					sendMessage({"hud" : "hide_instructions"});
					viewState.player.trails = 1;
				}

				if(now() - floatTime > 2) {
					state = STARTING;
					var endVal = playerRoll.get() * 180/Math.PI - 360;
					startTween([
			          {"tween":"roll","value":endVal,"delay":"0","ease":"easeInOutQuad","duration":"2"},
			          {"tween":"pitch","value":70,"delay":"0","ease":"easeInOutQuad","duration":"1"}
			        ]);
					tweenStartTime = now();
					
					setCameraMode("intro_swoop", 2);
					playerHeading.set( currentLevel.origin.rotation.y );
				}

				// start player motion
				if(now() - floatTime > 1.5){
					yVelocity += 0.015;
					playerPos.y += yVelocity;
					playerPos.x += Math.cos(currentLevel.origin.rotation.y ) * 0.0000325;
					playerPos.z += Math.sin(currentLevel.origin.rotation.y ) * 0.0000325;
				}

			break;

			case STARTING:
				if(now() - tweenStartTime < 0.25){
					yVelocity += 0.0125;
				} else {
					yVelocity -= 0.015;
				}
			
				playerPos.y += yVelocity;
				playerPos.x += Math.cos(currentLevel.origin.rotation.y ) * 0.0000325;
				playerPos.z += Math.sin(currentLevel.origin.rotation.y ) * 0.0000325;

				// start game as soon as tweens are complete.
				if (now() - tweenStartTime > 2.5) {
					setGameState(STATE_DIVE);
					playerRoll.wrap();
					playerRoll.clamp();
				}
			break;
		}
		updateTweens();
	}

	return self;
}