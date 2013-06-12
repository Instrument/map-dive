var mapdive = window.mapdive ? window.mapdive : {};
mapdive.levels = mapdive.levels ? mapdive.levels : {};

mapdive.levels = [];

mapdive.levels.push({"name": "EMPTY", "style" : "default", "description":{"search":"emptiness...","target":"The Void","address":"123 paradox ln","country":"unknown"},"origin":{"position":{"x":75.60899524944264,"y":3885.99642866252,"z":95.84784190055548},"rotation":{"x":0,"y":2.1145623666943605,"z":0}},"entities":[]});

// All other levels are pulled in from separate files //


mapdive.getRandomLevel = function(currentLevelName) {
	var list = [];
	var index = Math.floor(Math.random() * mapdive.levels.length);

	// don't pick the same map for two consecutive dives, and don't pick the empty one.
	while((mapdive.levels[index].name == currentLevelName) || (mapdive.levels[index].name == "EMPTY")){
		index = Math.floor(Math.random() * mapdive.levels.length);
	}
	
	return mapdive.levels[index];
};

mapdive.getLevelByName = function(name){
	for(var i = 0; i < mapdive.levels.length; i++){
		if(mapdive.levels[i].name == name){
			return mapdive.levels[i];
		}
	}
	return null;
}

mapdive.getNextLevel = function(currentLevelName) {
	var activeMaps = [];
	for(var i = 0; i < mapdive.levels.length; i++){
		if(mapdive.levels[i].name != "EMPTY"){
			activeMaps.push(mapdive.levels[i].name);
		}
	}
	console.log(activeMaps);
	for(var i = 0; i < activeMaps.length; i++){
		
		if(activeMaps[i] == currentLevelName){
			if(i < (activeMaps.length - 1) ){
				return mapdive.getLevelByName(activeMaps[i+1]);
			} else {
				return mapdive.getLevelByName(activeMaps[0]);
			}
		}
	}

	return mapdive.getLevelByName("default");
}
