var mapdive = window.mapdive ? window.mapdive : {};


function initializeSocket( _clientType, _callback ) {
    var script = document.createElement("script");
    script.setAttribute("src", WEBSOCKET_SERVER_ADDRESS + "/socket.io/socket.io.js");
    script.addEventListener('load', function () {

    	var _socket = io.connect(WEBSOCKET_SERVER_ADDRESS);
		
		_socket.on("connect", function() {
		   	_socket.emit("status", {"type" : _clientType}); 

		    if(typeof(_callback) == "function"){
           		_callback(_socket);
        	}
		});

        _socket.on("disconnect", function(){
            alert("Socket disconnected.");
        });
       
    }, false);
    document.body.appendChild(script);
}


function toRadians(val) {
	return Math.PI * val / 180;
}

function toDegrees(rads) {
    return rads * (180 / Math.PI);
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function constrain(value, min, max) {
    return Math.max(min, Math.min(value, max));
}


function EasedValue(factor){
    var currentValue = 0;
    var targetValue = 0;
    var easingFactor = factor || 0.5;

    return {
        // we use this for tweens to override the easing
        "now" : function(val) { 
            targetValue=currentValue=val;
        },

        "set" : function(val) {
            targetValue = val;
        },
        "get" : function() {
            return currentValue;
        },
        // use this for angle based easing.
        "wrap": function(){
            while(currentValue>Math.PI) currentValue-=Math.PI*2;
            while(currentValue<-Math.PI) currentValue+=Math.PI*2; 
            
            if(currentValue - targetValue > Math.PI){
                currentValue -= 2*Math.PI;
            } else if(currentValue - targetValue < -Math.PI){
                currentValue += 2*Math.PI;
            }
        },
        "setEase": function(fac) {
            easingFactor=fac;
        },
        "update" : function() {
            currentValue += (targetValue - currentValue) * easingFactor; 
        },

        "add" : function(val){
            targetValue += val;
        },
        // we use this after tween ends to renormalize
        "clamp": function() {
            while(currentValue>Math.PI) currentValue-=Math.PI*2;
            while(currentValue<-Math.PI) currentValue+=Math.PI*2; 
        },
        "debug" : function() {
            return "cur: " + currentValue + ", target: " + targetValue;
        }
    };
}