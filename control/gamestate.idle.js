mapdive.IdleState = function() {
	
	var playerY = new EasedValue(0.02);
	var self = {};
	var idleStartTime=0;
	var hasSentCloudMsg=false;
	var nextCameraChange = 0;
	var currentCameraMode = "idle";

	var waveStartTime = 0;
	var waving = false;

	self.setActive = function() {
		waving = false;
		playerPitch.setEase(0.15);
		playerPitch.set(0);
		sendMessage({"hud" : "hide"});
		setCameraMode("idle-side", 2);
  		
  		viewState.player.parachute=0;
  		viewState.player.trails=1;
  		idleStartTime=now();
  		hasSentCloudMsg=false;
  		sendMessage( { entity: "cylinder", run:true } );
  		
  		sendMessage({"hud" : "hide_instructions"});
  		sendMessage( {mapzoom : "on"} );
  		playerY.now(playerPos.y);
  		nextCameraChange = now() + randomRange(10,20);
	}

	self.update = function() {

		var timeInIdle=now()-idleStartTime;
		if (timeInIdle>1 && hasSentCloudMsg==false) {
			sendMessage( { entity: "transition_cloud", state:'fadeout' } );
			hasSentCloudMsg=true;
		}
		
		var turnSpeed = (Math.cos( currentTime ) + Math.sin(currentTime * 1.23) * (Math.cos(currentTime * 2.548) * 0.7 + 0.2)) * 0.005 - 0.001;

		playerHeading.add(turnSpeed);
		playerRoll.set( turnSpeed * 100 );

		playerSpeed = 0.0001;

		var targetY = 1300 + ((Math.sin(now() * 0.05) * 400) + Math.cos( (now() + 1.5482) * 0.2731) * 80) + Math.sin((now() + 2.1287) * 0.4) * 30;

		playerPitch.set( toRadians( Math.max(-35, Math.min(35, (playerPos.y - targetY) * 7 ) )));

		playerY.set(targetY);
		
		playerY.update();
		playerPos.y = playerY.get();

		viewState.player.speed = 0.0001;
		viewState.cam.speed = 0.35 + Math.sin( currentTime * 0.4) * 0.4 * Math.cos(currentTime * 1.235);

		viewState.player.leftarm = 0;
		viewState.player.rightarm = 0;
		viewState.player.bodyangle = -Math.PI / 2;

		playerPos.x += Math.cos(playerHeading.get()) * playerSpeed;
		playerPos.z += Math.sin(playerHeading.get()) * playerSpeed;

		// watch for users waving
		if((bodyPose.leftArm > 0.10) || (bodyPose.rightArm > 0.10)) {

			// if waving is not already happening, note the time.
			if(!waving){
				waveStartTime = now();
				waving = true;
			}else if(now() -  waveStartTime > 0.25){
				// start a new game if waving has been sustained for a bit
				startNewGame();	
			}
		} else {
			// no more waving..
			waving = false;
		}

		// is it time for a new camera angle?
		if(nextCameraChange < now()){
			var modes = ["idle", "idle-above", "idle-side"];
			var cutTime = 0;
			
			if(Math.random() > 0.75){
				cutTime = randomRange(3,6);
			}

			// pick a new mode, no repeats..
			var nextMode = currentCameraMode;
			while(currentCameraMode == nextMode){
				nextMode = modes[Math.floor(randomRange(0,modes.length))]
			}
			currentCameraMode = nextMode;

			setCameraMode(currentCameraMode, cutTime);
			nextCameraChange = now() + randomRange(10,20);
		}

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
			if(Math.random() > 0.997){
				if(Math.random() > 0.5) {
					startTween([{"tween":"roll","value":360,"delay":"0","ease":"easeInOutQuad","duration":"1.75"}]);
				} else {
					startTween([{"tween":"roll","value":-360,"delay":"0","ease":"easeInOutQuad","duration":"1.75"}]);
				}
			}
		}
	}

	return self;
}