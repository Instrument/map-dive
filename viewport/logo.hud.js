var LogoHUD = function() {

  var self = {};
  
  self.initialize = function() {
    $("#mapinfo-logo").attr("data-active", "true");
    $("#mapinfo-logo").css("display", "block");
  }

  self.update = function() {
  }

  self.show = function() {
  }

  self.hide = function() {
    // don't hide logo.. it should always be there.
  }

  self.type = "logo";

  return self;
};