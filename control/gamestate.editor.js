mapdive.EditorState = function() {
	
	var self = {};
	var editModeMovement = "fly";
	

	self.setActive = function() {
	}

	self.update = function() {
		if(editModeMovement == "fly") {

			var turnSpeed 		= 0.03; // max turn speed
			var movementSpeed 	= 0.0005;

			if(keys.states[keys.W]){
				movementSpeed *= 10;
			}
			  
			playerHeading.add( turnSpeed * controlValues.heading.get() );
			playerRoll.set( turnSpeed * controlValues.heading.get() * 100);

			playerSpeed = controlValues.speed.get() * movementSpeed;
			  
			viewState.player.speed = playerSpeed;
			viewState.cam.speed = cameraSpeed.get();
			
			playerPos.x += Math.cos(playerHeading.get()) * playerSpeed;
			playerPos.z += Math.sin(playerHeading.get()) * playerSpeed;

		} else {
			// if we're simulating dive mode, hand off to dive state manager to run the game control logic.
			gameStateManagers[STATE_DIVE].update();
		}
		
		$("#playerCoords").html("Player coords:<br>" + playerPos.x.toFixed(3) + "(x)<br>" + playerPos.y.toFixed(3) + "(y)<br>" + playerPos.z.toFixed(3) + "(z)");
	}

	return self;
}