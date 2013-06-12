var HelpTextHUD = function() {

  var self = {};

  var lastGameState = "";
  
  self.initialize = function() {
    $("#help-text-hud").attr("data-active", "true");
    $("#help-text-hud").css("display", "block");
  }

  self.update = function() {
    
    if(gameState.state != lastGameState){
      
      if(gameState.state == "idle"){
        $("#help-text-hud").css("display", "block");
      }else{
        $("#help-text-hud").css("display", "none");
      }

      lastGameState = gameState.state;
      
    }
  }

  self.show = function() {
  }

  self.hide = function() {
    // don't hide copyright stuff.. it should always be there.
  }

  self.type = "copyright";

  return self;
};