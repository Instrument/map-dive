mapdive.sound = (function() {
	
	var audioContext;

	var windSound;
	var gateSound;

	var globalGain;
	var loaded = false;

	function playSound(buffer) {
	if(!loaded){
		return;
	}
	  var source = audioContext.createBufferSource();
	  source.buffer = buffer;
	  source.connect(globalGain);
	  source.noteOn(0);
	}

	function loadBuffer(url, callback){
		var request = new XMLHttpRequest();

		request.open('GET', url, true);
		request.responseType = 'arraybuffer';

		request.onload = function() {
			audioContext.decodeAudioData(request.response,callback);
		};

		request.send();
	}

	function init(){
		// get the audio context
		audioContext = new webkitAudioContext();
		globalGain = audioContext.createGainNode();
		globalGain.connect(audioContext.destination);

		// intantiate the wind sound source
		windSound = audioContext.createBufferSource();
		
		// load sounds
		loadBuffer( "../audio/wind.mp3", function(buffer) {
			windSound.buffer = buffer;
			windSound.connect(globalGain);
			windSound.loop = true;
			windSound.noteOn(0);
		});
		loadBuffer( "../audio/gate.mp3", function(buffer) {
			gateSound = buffer;
		});

		globalGain.gain.value = 1;
	}

	return {

		initialize : function(){
			init();
			loaded = true;
		},
		
		update : function(playerSpeed) {
			if(loaded){
				windSound.playbackRate.value = 1.2 + playerSpeed * 0.25;
  				windSound.gain.value = 0.75 + playerSpeed * 0.25;
  			}
		},

		playGateSound : function() {
			playSound(gateSound);
		},

		playItemSound : function() {
			playSound(gateSound);	
		},

		playBonusSound : function() {
			playSound(gateSound);
		},

		setMute : function(mute) {
			globalGain.gain.value = mute ? 0 : 1;
		}
	}
})();