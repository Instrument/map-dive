mapdive.LooseState = function() {

	var stateStartTime = 0;
	var self = {};
	var hasSentCloudMsg=false;

	self.setActive = function() {
		sendMessage( {mapzoom : "off"} );
		stateStartTime = now();
		viewState.player.parachute=now();
		viewState.player.trails=0;
		setCameraMode("end-loose1", 4);
		hasSentCloudMsg=false
	}


	self.update = function() {
		playerRoll.set(0);
		playerPitch.set( toRadians(-75) ); // offset from 90 so wires dont go in his head (too much :)
		playerPos.y -= 0.01; // fall really slow

		var elapsed=now() - stateStartTime;

		if(elapsed > 8){
			setGameState(STATE_IDLE);
			//if (isUserPresent) startNewGame(); else setGameState(STATE_IDLE); // alt to fix cam transition
		}
		else if (elapsed>7 && hasSentCloudMsg==false) {
			sendMessage( { entity: "transition_cloud", state:'fadein' } );
			hasSentCloudMsg=true
		}
		
	}

	return self;
}