var CopyrightHUD = function() {

  var $copyLabel;

  var self = {};
  
  self.initialize = function() {
    $("#mapinfo-copyright").attr("data-active", "true");
    $("#mapinfo-copyright").css("display", "block");
    $copyLabel = $("#map-info-copytext");
  }

  self.update = function() {
    $copyLabel.html( mapManager.getCopyright() );    
  }

  self.show = function() {
  }

  self.hide = function() {
    // don't hide copyright stuff.. it should always be there.
  }

  self.type = "copyright";

  return self;
};