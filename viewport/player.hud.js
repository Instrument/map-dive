var PlayerHUD = function() {
  // PUBLIC
  var self = {};
  // PRIVATE
  
  var IDLE = 3;
  var INTRO = 1;
  var DIVE = 2;

  var progressAmount = 0;

  var model;
  var faces;
  var pegManHead;

  var TURTLE = 1;
  var SNEER_RIGHT = 2;
  var SMILE_LEFT = 3;
  var OPEN = 4;
  var TERROR = 5;
  var FROWN = 6;
  
  var hasInited = false;
  var visible = false;
  var smileTime=0;
  var smiling=false;

  var _starCounter;
  var _gateCounter;
  var lastDistanceUpdate = 0;

  var progressBarContext;

  function resetFace(){
    for(var i = 0; i < 6; i++){
      faces.morphTargetInfluences[i] = 0;
    }
  }


  var normalPositionY = -68;

  function initCounters(){
    _starCounter = window.global.instrument.counter($("#score-counter"));
    _gateCounter = window.global.instrument.counter($("#distance-counter"));

    _starCounter.update( 0 );
    _gateCounter.update( 0 );
  }

  self.initialize = function() {
    if (hasInited) return;

    $("#hud-viewport").attr("data-active", "true");
    $("#hud-viewport").css("display", "block");

   
    progressBarContext = document.getElementById("hud-intro").getContext("2d");
    progressBarContext.lineWidth = 28;
    progressBarContext.strokeStyle = '#3669de';
    progressBarContext.lineCap = 'round';

 

    console.log('PlayerHUD init');
    hasInited=true;
    // MATERIALS    
    
      var blackMaterial=new THREE.MeshBasicMaterial({color:0x000000});
      var faceMaterial=new THREE.MeshPhongMaterial({emissive:0x6d5925, color:0xffb412,morphTargets:true});
      var helmetMaterial=new THREE.MeshPhongMaterial({emissive:0x787878,color:0xDEDEDE,specular:0xFFFFFF, shininess:100,map:assetManager.getTexture("helmetHUD")});
      var glassesMaterial=new THREE.MeshPhongMaterial({shininess:280, color:0x000000,specular:0xFFFFFF, opacity:0.85,transparent:true});
    
      // removed compass as per design change.
      // var compassMaterial1=new THREE.MeshLambertMaterial({color:0xFFFFFF,opacity:0.65,transparent:true});
      // var compassMaterial2=new THREE.MeshLambertMaterial({color:0xFF0000,opacity:0.65,transparent:true});
    
    // MODEL
    var face;

    model=assetManager.getModel("pegmanHUD");
    model.traverse( function ( child ) {
      if ( child instanceof THREE.Mesh ) {
        // Dump the default material
        if (child.material) child.material.dispose();
        // Calculate bounding box size and corner positions
        var translateMatrix=new THREE.Matrix4();
        var childSize,childMin,childMax;
        var tx,ty,tz;
        child.geometry.computeBoundingBox();
        child.geometry.computeVertexNormals();  // if ya want phong shading
        childSize=child.geometry.boundingBox.size();
        childMin=child.geometry.boundingBox.min;
        childMax=child.geometry.boundingBox.max;
        // Assign Textures and fix centers
        switch(child.name) {
          case 'GLASSES':
            child.geometry.computeVertexNormals();
            child.material=glassesMaterial;
            break;
          case 'HELMET':
            child.geometry.computeVertexNormals();
            child.material=helmetMaterial;
            break;
          case 'BLACK':
            child.material=blackMaterial;
            break;
        }
        //console.log('child: ',child.name);    
      }
    } );

    
    
    model.scale.set(0.2,0.2,0.2);
    model.position.set(0,-24,0);
    //model.rotation.x=-Math.PI/3;
   
    // MORPH TARGETS    
    faces=assetManager.getModel("pegmanFaces");
    faces.material=faceMaterial;
    faces.geometry.computeVertexNormals();  // for phong shading
    faces.scale.set(0.2,0.2,0.2);
    faces.position.y=-24;
    
    pegManHead = new THREE.Object3D();
    pegManHead.add(faces);
    pegManHead.add(model);

    pegManHead.position.y = normalPositionY;

    HUDscene.add(pegManHead);

    initCounters();
  }

  self.update = function(time) {
    
    if (! hasInited) return;

    var heading = gameState.player.dir[0];
    
    // removed compass as per design changes.
    // model.getObjectByName('peg_head_ui compass_point Pyramid').rotation.z=heading+Math.PI/2;
    // model.getObjectByName('peg_head_ui compass_point Pyramid_1').rotation.z=heading+Math.PI/2;
    
    pegManHead.rotation.x = (Math.sin(time*0.4)*Math.sin(time*(0.28))) * 0.15 - 0.25;
    pegManHead.rotation.y = (Math.sin(time*0.189)*Math.cos(time*0.52)) * 0.15;

    if (smiling) {
      var smilingTime=time - smileTime;
      var factor=0;
      if (smilingTime<1) factor=-smilingTime;
      else if (smilingTime<2) factor=smilingTime-2;
      else { factor=0; smiling=false; }
      faces.morphTargetInfluences[0]=factor;

    } else {
      switch(gameState.state){
        case "dive":
          resetFace();
          faces.morphTargetInfluences[OPEN] = (Math.sin(time*27)+1)*0.25+ gameState.cam.speed *(Math.sin(time*27)*Math.sin(time*(18.5)) + 2)*0.25;
          break;

        case "intro":
            //pegManHead.rotation.x = (Math.sin(time*0.4)*Math.sin(time*(0.28))) * 0.15 - 0.25;
            pegManHead.rotation.x += (Math.sin(time*2.189)*Math.cos(time*0.52)) * 0.15 * progressAmount;
            faces.morphTargetInfluences[SMILE_LEFT] = progressAmount;
          break;

        case "countdown":
          progressAmount *= 0.9;
          faces.morphTargetInfluences[SMILE_LEFT] = progressAmount;
          break;

        case "ending":
          resetFace();
          faces.morphTargetInfluences[0] = -( (Math.sin(time*10)+3) *0.25)
          break;

        case "loose":
          resetFace();
          faces.morphTargetInfluences[0] =( (Math.sin(time*10)+3) *0.25)
          break;
      }
    }
    
    _starCounter.update( gameState.stars );
    _gateCounter.update( gameState.gates );
  }

  self.message = function(data){


    if(data["hud"] == "intro"){
      if(data["start"]){
        visible = true;
        progressBarContext.clearRect(0, 0, 350, 350);
        $("#hud-viewport").animate({"top":0}, function() {
          $("#hud-intro").animate({"opacity":1});
        });
        progressAmount = 0;
        resetFace();
      }

      if(data["progress"]){
        //$("#hud-intro").html(data["progress"]);
        progressBarContext.clearRect(0,0,350,350);
        progressBarContext.beginPath();
        
        progressAmount = data["progress"];

        var start = (Math.PI / 2);
        var amount = Math.PI * Number(data["progress"]);

        progressBarContext.arc(175,175, 147, start+amount, start-amount, true);
        progressBarContext.stroke();
      }

      if(data["hide_progress"]){
        $("#hud-intro").animate({"opacity":0});
        //progressBarContext.clearRect(0,0,300,300);
      }
    }

    if (data["hud"]=="smile") {
        smiling=true;
        smileTime=data["t"]
    }

  }

  self.reset = function() {
    lastDistanceUpdate = 0;
  }

  self.show = function() {
    visible = true;
    $("#hud-viewport").animate({"top":0});
    
    window.setTimeout(function() {
      $("#hud-score").animate({"width" : 955, "left" : 62}, function() {
        $("#distance-container,#score-container").css({"display":"block"});
      });
    }, 1000);
  }

  self.hide = function() {
    visible = false;
    $("#distance-container,#score-container").css({"display":"none"});
    $("#hud-score").animate({"width" : 20, "left" : 540});
    
    $("#hud-viewport").animate({"top":480});
    

  }

  self.type = "player";

  return self;
};
