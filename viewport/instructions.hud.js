var InstructionsHUD = function() {

  var self = {};

  var visible = false;
  var fading = false;
  var fadeTime = 0;

  var $image = null;
  
  self.initialize = function() {
    $image = $("#hud-instructions");
    $image.attr("data-active", "true");
    $image.css("display", "none");
  }

  self.message = function(data){
    if(data["hud"] == "show_instructions") {
      visible = true;
      fading = true;
      fadeTime = gameState["t"];
      $image.css({"display" : "block", "opacity" : 0});
    }

    if(data["hud"] == "hide_instructions"){
      visible = false;
      fading = true;
      fadeTime = gameState["t"];
    }


  }

  self.update = function() {
    if(fading){

      var t = (gameState["t"] - fadeTime) * 2;

      if (t > 1){
        fading = false;
        if(!visible){
          $image.css({"display" : "none"});
        }
        t = 1;
      }

      if(!visible){
        $image.css({"opacity" : 1 - t});
      } else {
        $image.css({"opacity" : t});
      }
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