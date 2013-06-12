var SearchHUD = function() {

  var $locationLabel;
  var $altitudeLabel;

  var currentSearchTerm = "";

  var visible = false;
  var typeSearchIndex = 0;
  var typeInterval = null;

  var caretVisible = true;
  var caretBlinkInterval = null;
  var blinkStopTimeout = null;
  var detailRevealTimeout = null;
  var startTypingTimeout = null;
  var nextCharacterTimeout = null;

  // some randomness.  HUD stuff can't use Math.random() or it'll cause viewports with HUD's to loose sync with the rest due to seedrandom.
  var typeDelays = [137,86,91,190,113,105,182,174,95,194,198,81,106,175];
  var delayIndex = 0;
  
  function degToHMS( angle, isLatitude ) {

    var degrees = Math.floor(angle);
    var minutes = Math.abs(degrees - angle) * 60;
    var minutesInt = Math.floor(minutes);
    var seconds = Math.floor((minutes - minutesInt) * 60);

    var letter = "";

    if(isLatitude){
      letter = (angle > 0) ? "N" : "S";
    } else {
      letter = (angle > 0) ? "E" : "W";
    }

    return letter + " " + Math.abs(degrees) + "&deg; " + minutesInt + "' " + seconds + "\"";
  }

  function show() {
    if(!visible){
      visible = true;
      $("#mapinfo-search").css({"display":"block"});
      $("#mapinfo-search").animate({"top": 85}, function() {
        $("#intro-cancel,#intro-confirm").animate({"opacity" : 1});
      });
    }
  }

  function startTypeSequence() {
    if(!visible){
      return;
    }

    $("#mapinfo-search-term").html("&nbsp;");

    typeSearchIndex = 0;
    
    window.clearTimeout(nextCharacterTimeout);
    startTypingTimeout = window.setTimeout( typeSearch, 500);
    window.clearInterval(caretBlinkInterval);
    caretBlinkInterval = window.setInterval( blinkCaret, 150);
  }

  function typeSearch(){

    if(!visible){
      return;
    }

    if(typeSearchIndex < currentSearchTerm.length) {
      typeSearchIndex++;
      
      $("#mapinfo-search-term").html(currentSearchTerm.substring(0,typeSearchIndex) + "|");
      
      window.clearInterval(caretBlinkInterval);
      caretBlinkInterval = window.setInterval( blinkCaret, 150);

      nextCharacterTimeout = window.setTimeout( typeSearch, typeDelays[delayIndex++] * 0.5);
      if(delayIndex>=typeDelays.length){
        delayIndex = 0;
      }
    }
  }


  function blinkCaret() {
    caretVisible = !caretVisible;
    var txt = currentSearchTerm.substring(0,typeSearchIndex) + (caretVisible ? "|" : "&nbsp;");
    $("#mapinfo-search-term").html(txt);
  }

  function hide() {
    visible = false;
    window.clearInterval(caretBlinkInterval);
    window.clearTimeout(detailRevealTimeout);
    window.clearTimeout(blinkStopTimeout);
    window.clearTimeout(startTypingTimeout);
    currentSearchTerm = "";
    $("#mapinfo-search").animate({"top": -200});
    $("#intro-cancel,#intro-confirm").animate({"opacity" : 0});
  }

  var self = {};
  
  self.initialize = function() {
    $("#mapinfo-search,#intro-search").attr("data-active", "true");
    $("#mapinfo-search-term").html("&nbsp;");
     $("#intro-cancel,#intro-confirm").css("opacity", 0);
  }

  self.update = function() {
    
    if(!visible){
      return;
    }
  }
  
  self.message = function(data){

    if(data["hud"] == "intro_search"){
      // New search term
      show();
      //if(currentSearchTerm != ""){
        currentSearchTerm = data["search"];
        startTypeSequence();
      //}

    }

    if(data["hud"] == "intro_status") {

        // $("#intro-cancel-icon").css("opacity", 0.7 + data["cancel"] * 0.3);
        // $("#intro-confirm-icon").css("opacity", 0.7 + data["confirm"] * 0.3);

        
        var cancelScale = (0.7 + data["cancel"] * 0.3);
        var confirmScale = (0.7 + data["confirm"] * 0.3);
        $("#intro-cancel-icon").css("transform", "scale(" + cancelScale + ", " + cancelScale + ")" );
        $("#intro-confirm-icon").css("transform", "scale(" + confirmScale + ", " + confirmScale + ")" );

        $("#intro-cancel-hand,#intro-confirm-hand").css("opacity", 1);//data["hands"]);
    }

    if(data["hud"] == "intro_confirm"){
        $("#intro-cancel,#intro-confirm").animate({"opacity" : 0});
    }

    /*if(data["hud"] == "intro_search"){
      visible = true;
      currentSearchTerm = currentLevel.description.search;
      startRevealSequence();
    }*/

    if(data["hud"] == "intro_results"){
      console.log("HIDING SEARCH BOX");
      hide();
    }
  }

  self.show = function() {
   // show();
  }

  self.hide = function() {
    hide();
  }

  self.type = "mapinfo";

  return self;
};