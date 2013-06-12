var viewStyles = {
    "default" : {
        "sky"    : "#8bd9f9",
        "horizon" : "#cbf0ff",
        "target" : "#fff2bf",
        "gradient" : 0x1a5f73,
        "clouds" : true,
        "style"		: [ { stylers: [ { visibility: "off" } ] },{ featureType: "landscape.man_made", elementType: "geometry.fill", stylers: [ { color: "#e6ebe5" }, { visibility: "on" } ] },{ featureType: "water", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { color: "#2f728c" }, { saturation: -4 }, { lightness: -25 } ] },{ featureType: "road.highway", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { color: "#77d4f1" } ] },{ elementType: "labels", stylers: [ { color: "#808080" }, { lightness: 70 }, { visibility: "off" } ] },{ featureType: "road.arterial", stylers: [ { visibility: "on" }, { color: "#f37582" }, { saturation: -100 } ] },{ featureType: "road.local", elementType: "geometry.fill", stylers: [ { visibility: "on" } ] },{ featureType: "road", elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "poi", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { color: "#84a747" }, { saturation: -10 }, { lightness: 15 } ] },{ featureType: "transit", elementType: "geometry.stroke", stylers: [ { visibility: "on" }, { color: "#c1fc4f" } ] },{ featureType: "landscape.natural", stylers: [ { visibility: "on" }, { color: "#afd972" }, { saturation: -10 } ] },{ featureType: "road.highway", elementType: "geometry.stroke", stylers: [ { visibility: "on" }, { color: "#33a9ce" } ] },{ featureType: "road.arterial", elementType: "geometry.stroke", stylers: [ { visibility: "on" }, { color: "#ac3843" }, { saturation: -100 }, { lightness: 90 } ] },{ featureType: "road.local", elementType: "geometry.stroke", stylers: [ { color: "#a4d3df" }, { visibility: "on" }, { lightness: 20 } ] },{ featureType: "landscape.man_made", elementType: "geometry.stroke", stylers: [ { visibility: "on" }, { color: "#66cceb" } ] } ]
    },
        
    "hobbiton" : {
        "textures" : {
            "gate" : "gates/gate_hobbiton.png"
        },
        "sky"    : "#b5e2ff",
        "horizon" : "#d6efff",
        "target" : "#fff2bf",
        "gradient" : 0xffffff,
        "clouds" : true,
        "style"     : [  {    "featureType": "All",    "elementType": "geometry",    "stylers": [      { "visibility": "off" }    ]  },{    "featureType": "All",    "elementType": "labels",    "stylers": [      { "visibility": "off" }    ]  },{    "featureType": "water",    "elementType": "geometry",    "stylers": [      { "visibility": "on" },      { "hue": "#ff4400" },      { "saturation": 60 },      { "color": "#b3e1ff" }    ]  },{    "featureType": "landscape.natural",    "elementType": "All",    "stylers": [      { "visibility": "on" },      { "color": "#8ab11a" },      { "saturation": -20 },      { "lightness": 20 }    ]  },{    "featureType": "landscape.man_made",    "elementType": "geometry",    "stylers": [      { "visibility": "on" },      { "color": "#337a36" },      { "lightness": 10 },      { "saturation": -20 }    ]  },{    "featureType": "poi",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#5cad44" },      { "lightness": -10 }    ]  },{    "featureType": "transit.line",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "saturation": 30 },      { "color": "#e1f2d3" }    ]  },{    "featureType": "road.local",    "elementType": "geometry",    "stylers": [      { "visibility": "on" },      { "color": "#a3d85c" }    ]  },{    "featureType": "road.local",    "elementType": "geometry.stroke",    "stylers": [      { "color": "#ff7747" },      { "visibility": "off" }    ]  },{    "featureType": "road.arterial",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "lightness": 70 },      { "color": "#fff7b6" }    ]  },{    "featureType": "road.arterial",    "elementType": "geometry.stroke",    "stylers": [      { "color": "#6ad0ff" }    ]  },{    "featureType": "road.highway",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#f0cb71" }    ]  },{    "featureType": "road.highway",    "elementType": "geometry.stroke",    "stylers": [      { "color": "#ff0000" },      { "visibility": "off" },      { "hue": "#ffee00" }    ]  },{    "featureType": "All",    "elementType": "All"  }]
    },


// URBAN STYLES

    "red_roads" : {
        "textures" : {
            "gate" : "gates/gate_urban.png"
        },
        "sky"    : "#7fc8fd",
        "horizon" : "#b9dffb",
        "target" : "#fff2bf",
        "gradient" : 0xffffff,
        "clouds" : true,
        "style"     : [ { stylers: [ { visibility: "off" } ] },{ featureType: "landscape", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { color: "#f2eeea" } ] },{ featureType: "water", elementType: "geometry.fill", stylers: [ { color: "#73b6e6" }, { visibility: "on" }, { saturation: 30 }, { lightness: -10 } ] },{ featureType: "water", elementType: "geometry.stroke", stylers: [ { visibility: "on" }, { lightness: 100 } ] },{ featureType: "road.highway", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { hue: "#ff0000" }, { saturation: -30 } ] },{ elementType: "labels", stylers: [ { color: "#808080" }, { lightness: 70 }, { visibility: "off" } ] },{ featureType: "road.arterial", stylers: [ { visibility: "on" }, { hue: "#ff0000" } ] },{ featureType: "road.arterial", elementType: "geometry.stroke", stylers: [ { color: "#808080" }, { lightness: 70 } ] },{ featureType: "road.local", elementType: "geometry.fill", stylers: [ { hue: "#00ff3c" } ] },{ featureType: "road", elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "poi", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { color: "#c8df9f" } ] },{ featureType: "landscape.natural", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { color: "#b6d087" } ] },{ featureType: "administrative", elementType: "geometry.stroke", stylers: [ { visibility: "on" }, { color: "#ffffff" } ] },{ featureType: "transit", elementType: "geometry.stroke", stylers: [ { visibility: "on" }, { color: "#ffffff" } ] },{ featureType: "transit", elementType: "geometry.stroke", },{ featureType: "road.local", elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "road.local", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { hue: "#ff0000" }, { color: "#666666" }, { lightness: 80 } ] } ]
    },

    "urban" : {
        "textures" : {
            "gate" : "gates/gate_urban.png"
        },
        "sky"    : "#8bd9f9",
        "horizon" : "#cbf0ff",
        "target" : "#fff2bf",
        "gradient" : 0xffffff,
        "clouds" : true,
        "style"     : [ { stylers: [ { visibility: "off" } ] },{ featureType: "landscape.man_made", elementType: "geometry.fill", stylers: [ { color: "#e6ebe5" }, { visibility: "on" } ] },{ featureType: "water", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { color: "#2f728c" }, { saturation: -4 }, { lightness: -25 } ] },{ featureType: "road.highway", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { color: "#77d4f1" } ] },{ elementType: "labels", stylers: [ { color: "#808080" }, { lightness: 70 }, { visibility: "off" } ] },{ featureType: "road.arterial", stylers: [ { visibility: "on" }, { color: "#f37582" }, { saturation: -100 } ] },{ featureType: "road.local", elementType: "geometry.fill", stylers: [ { visibility: "on" } ] },{ featureType: "road", elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "poi", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { color: "#84a747" }, { saturation: -10 }, { lightness: 15 } ] },{ featureType: "transit", elementType: "geometry.stroke", stylers: [ { visibility: "on" }, { color: "#c1fc4f" } ] },{ featureType: "landscape.natural", stylers: [ { visibility: "on" }, { color: "#afd972" }, { saturation: -10 } ] },{ featureType: "road.highway", elementType: "geometry.stroke", stylers: [ { visibility: "on" }, { color: "#33a9ce" } ] },{ featureType: "road.arterial", elementType: "geometry.stroke", stylers: [ { visibility: "on" }, { color: "#ac3843" }, { saturation: -100 }, { lightness: 90 } ] },{ featureType: "road.local", elementType: "geometry.stroke", stylers: [ { color: "#a4d3df" }, { visibility: "on" }, { lightness: 20 } ] },{ featureType: "landscape.man_made", elementType: "geometry.stroke", stylers: [ { visibility: "on" }, { color: "#66cceb" } ] } ]
    },

    "urban_bright" : {
        "textures" : {
            "gate" : "gates/gate_urban.png"
        },
        "sky"    : "#89cdfe",
        "horizon" : "#bce1fd",
        "target" : "#fff2bf",
        "gradient" : 0xffffff,
        "clouds" : true,
        "style"     : [  {    "featureType": "All",    "elementType": "All",    "stylers": [      { "visibility": "off" }    ]  },{    "featureType": "landscape",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#f2eeea" }    ]  },{    "featureType": "water",    "elementType": "geometry.fill",    "stylers": [      { "color": "#73b6e6" },      { "visibility": "on" }    ]  },{    "featureType": "water",    "elementType": "geometry.stroke",    "stylers": [      { "visibility": "on" },      { "lightness": 100 }    ]  },{    "featureType": "road.highway",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "hue": "#ff8800" },      { "lightness": 30 }    ]  },{    "featureType": "All",    "elementType": "labels",    "stylers": [      { "color": "#808080" },      { "lightness": 70 },      { "visibility": "off" }    ]  },{    "featureType": "road.arterial",    "elementType": "All",    "stylers": [      { "visibility": "on" },      { "color": "#ffffff" }    ]  },{    "featureType": "road.arterial",    "elementType": "geometry.stroke",    "stylers": [      { "color": "#808080" },      { "lightness": 70 }    ]  },{    "featureType": "road.local",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#ffffff" }    ]  },{    "featureType": "road.local",    "elementType": "geometry.stroke",    "stylers": [      { "visibility": "on" },      { "color": "#808080" },      { "lightness": 80 }    ]  },{    "featureType": "road",    "elementType": "labels",    "stylers": [      { "visibility": "off" }    ]  },{    "featureType": "poi",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#c8df9f" }    ]  },{    "featureType": "landscape.natural",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#e8e0d8" }    ]  },{    "featureType": "administrative",    "elementType": "geometry.stroke",    "stylers": [      { "visibility": "on" },      { "color": "#ffffff" }    ]  },{    "featureType": "transit",    "elementType": "geometry.stroke",    "stylers": [      { "visibility": "on" },      { "color": "#ffffff" }    ]  },{    "featureType": "transit",    "elementType": "geometry.stroke"  }]
    },

    "world_of_tomorrow" : {
        "textures" : {
            "gate" : "gates/gate_urban.png"
        },
        "sky"    : "#9fe5f1",
        "horizon" : "#cff1f7",
        "target" : "#fff2bf",
        "gradient" : 0xffffff,
        "clouds" : true,
        "style"     : [  {    "featureType": "All",    "elementType": "All",    "stylers": [      { "visibility": "off" }    ]  },{    "featureType": "landscape.man_made",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#def2f6" }    ]  },{    "featureType": "water",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#c6e7ed" },      { "lightness": -20 }    ]  },{    "featureType": "road.highway",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#77d4f1" }    ]  },{    "featureType": "All",    "elementType": "labels",    "stylers": [      { "color": "#808080" },      { "lightness": 70 },      { "visibility": "off" }    ]  },{    "featureType": "road.arterial",    "elementType": "All",    "stylers": [      { "visibility": "on" },      { "color": "#f37582" },      { "saturation": -100 }    ]  },{    "featureType": "road.local",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" }    ]  },{    "featureType": "road",    "elementType": "labels",    "stylers": [      { "visibility": "off" }    ]  },{    "featureType": "poi",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#a9dce6" }    ]  },{    "featureType": "transit",    "elementType": "geometry.stroke",    "stylers": [      { "color": "#c1fc4f" },      { "visibility": "off" }    ]  },{    "featureType": "landscape.natural",    "elementType": "All",    "stylers": [      { "visibility": "on" },      { "saturation": -10 },      { "color": "#ebf0f2" }    ]  },{    "featureType": "road.highway",    "elementType": "geometry.stroke",    "stylers": [      { "visibility": "on" },      { "color": "#33a9ce" }    ]  },{    "featureType": "road.arterial",    "elementType": "geometry.stroke",    "stylers": [      { "visibility": "on" },      { "color": "#a8dae9" },      { "saturation": -20 },      { "lightness": -20 }    ]  },{    "featureType": "road.local",    "elementType": "geometry.stroke",    "stylers": [      { "color": "#a4d3df" },      { "visibility": "on" },      { "lightness": 20 }    ]  },{    "featureType": "landscape.man_made",    "elementType": "geometry.stroke",    "stylers": [      { "visibility": "on" },      { "color": "#66cceb" }    ]  },{    "elementType": "labels",    "stylers": [      { "visibility": "off" }    ]  },{    "elementType": "labels.text",    "stylers": [      { "visibility": "off" }    ]  }]
    },
    "tactile" : {
        "textures" : {
            "gate" : "gates/gate_urban.png"
        },
        "sky"    : "#8bd9f9",
        "horizon" : "#cbf0ff",
        "target" : "#fff2bf",
        "gradient" : 0xffffff,
        "clouds" : true,
        "style" : [{"elementType":"labels","stylers":[{"visibility":"off"}]}]
    },


// FOREST

    "forest" : {
        "textures" : {
            "gate" : "gates/gate_forest.png"
        },
        "sky"    : "#5adeec",
        "horizon" : "#a2f1fa",
        "target" : "#fff2bf",
        "gradient" : 0xffffff,
        "clouds" : true,
        "style"     : [ { stylers: [ { visibility: "off" } ] },{ featureType: "landscape.man_made", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { lightness: 10 }, { color: "#6faa72" } ] },{ featureType: "water", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { color: "#1ba8b7" }, { lightness: -20 } ] },{ featureType: "road.highway", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { saturation: -20 }, { color: "#d9ffff" } ] },{ elementType: "labels", stylers: [ { color: "#808080" }, { lightness: 70 }, { visibility: "off" } ] },{ featureType: "road.arterial", stylers: [ { visibility: "on" }, { color: "#d9ffff" }, { saturation: -20 }, { lightness: -10 } ] },{ featureType: "road.local", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { saturation: -20 }, { lightness: -10 }, { color: "#f1ffd6" } ] },{ featureType: "road", elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "poi", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { color: "#c6f75f" }, { saturation: -40 } ] },{ featureType: "transit", elementType: "geometry.stroke", stylers: [ { visibility: "on" }, { color: "#3a4041" } ] },{ featureType: "landscape.natural", stylers: [ { visibility: "on" }, { color: "#7aa458" }, { lightness: 20 }, { saturation: 10 } ] },{ featureType: "road.highway", elementType: "geometry.stroke", stylers: [ { visibility: "on" }, { saturation: -40 }, { color: "#109cb7" }, { lightness: -30 } ] },{ featureType: "road.arterial", elementType: "geometry.stroke", stylers: [ { visibility: "on" }, { color: "#3a90b4" }, { saturation: -20 } ] },{ featureType: "road.local", elementType: "geometry.stroke", stylers: [ { color: "#92c36a" }, { visibility: "on" }, { lightness: -20 } ] },{ featureType: "landscape.man_made", elementType: "geometry.stroke", stylers: [ { visibility: "on" }, { color: "#b6f75f" } ] },{ elementType: "labels", },{ elementType: "labels", stylers: [ { visibility: "off" } ] } ]
    },
    "medieval" : {
        "textures" : {
            "gate" : "gates/gate_forest.png"
        },
        "sky"    : "#83d2e8",
        "horizon" : "#ace7f8",
        "target" : "#fff2bf",
        "gradient" : 0xffffff,
        "clouds" : true,
        "style"     : [  {    "featureType": "All",    "elementType": "geometry",    "stylers": [      { "visibility": "off" }    ]  },{    "featureType": "All",    "elementType": "labels",    "stylers": [      { "visibility": "off" }    ]  },{    "featureType": "water",    "elementType": "geometry",    "stylers": [      { "visibility": "on" },      { "saturation": -50 },      { "lightness": -20 },      { "color": "#69adc0" }    ]  },{    "featureType": "landscape.natural",    "elementType": "All",    "stylers": [      { "lightness": -50 },      { "visibility": "on" },      { "color": "#2d7536" }    ]  },{    "featureType": "landscape.man_made",    "elementType": "geometry",    "stylers": [      { "visibility": "on" },      { "color": "#12572b" }    ]  },{    "featureType": "poi",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "lightness": -50 },      { "color": "#094b27" }    ]  },{    "featureType": "transit.line",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#c2dce9" },      { "lightness": -10 }    ]  },{    "featureType": "road.local",    "elementType": "geometry",    "stylers": [      { "visibility": "on" },      { "color": "#76ad5c" },      { "saturation": -20 }    ]  },{    "featureType": "road.local",    "elementType": "geometry.stroke",    "stylers": [      { "color": "#00689e" },      { "hue": "#00ffe6" },      { "lightness": 20 },      { "visibility": "off" }    ]  },{    "featureType": "road.arterial",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#989270" }    ]  },{    "featureType": "road.arterial",    "elementType": "geometry.stroke",    "stylers": [      { "hue": "#00ffdd" },      { "lightness": 20 },      { "visibility": "off" },      { "color": "#eee1c4" }    ]  },{    "featureType": "road.highway",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#d0c897" }    ]  },{    "featureType": "road.highway",    "elementType": "geometry.stroke",    "stylers": [      { "visibility": "off" },      { "color": "#92b7c9" }    ]  },{    "featureType": "All",    "elementType": "All"  }]
    },
    "pastoral" : {
        "textures" : {
            "gate" : "gates/gate_forest.png"
        },
        "sky"    : "#90c7de",
        "horizon" : "#b2dff2",
        "target" : "#fff2bf",
        "gradient" : 0xffffff,
        "clouds" : true,
        "style"     : [  {    "featureType": "All",    "elementType": "geometry",    "stylers": [      { "visibility": "off" }    ]  },{    "featureType": "All",    "elementType": "labels",    "stylers": [      { "visibility": "off" }    ]  },{    "featureType": "water",    "elementType": "geometry",    "stylers": [      { "visibility": "on" },      { "saturation": -50 },      { "lightness": -20 },      { "color": "#78a7bb" }    ]  },{    "featureType": "landscape.natural",    "elementType": "All",    "stylers": [      { "lightness": -50 },      { "visibility": "on" },      { "color": "#63763e" }    ]  },{    "featureType": "landscape.man_made",    "elementType": "geometry",    "stylers": [      { "visibility": "on" },      { "color": "#8b924c" }    ]  },{    "featureType": "poi",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "lightness": -50 },      { "color": "#6b7d41" }    ]  },{    "featureType": "transit.line",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#ffd266" }    ]  },{    "featureType": "road.local",    "elementType": "geometry",    "stylers": [      { "visibility": "on" },      { "saturation": -30 },      { "lightness": -50 },      { "color": "#b5af5b" }    ]  },{    "featureType": "road.local",    "elementType": "geometry.stroke",    "stylers": [      { "color": "#00689e" },      { "hue": "#00ffe6" },      { "lightness": 20 },      { "visibility": "off" }    ]  },{    "featureType": "road.arterial",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#eee1c4" }    ]  },{    "featureType": "road.arterial",    "elementType": "geometry.stroke",    "stylers": [      { "hue": "#00ffdd" },      { "lightness": 20 },      { "visibility": "off" },      { "color": "#eee1c4" }    ]  },{    "featureType": "road.highway",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#e8895b" }    ]  },{    "featureType": "road.highway",    "elementType": "geometry.stroke",    "stylers": [      { "color": "#47bede" },      { "visibility": "off" }    ]  },{    "featureType": "All",    "elementType": "All"  }]
    },


// DESERT

    "canyon" : {
        "textures" : {
            "gate" : "gates/gate_desert.png"
        },
        "sky"    : "#dddaff",
        "horizon" : "#ffc5c5",
        "target" : "#fffcc7",
        "gradient" : 0xfffff2,
        "clouds" : false,
        "style"  : [{"featureType":"All","elementType":"All","stylers":[{"visibility":"off"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#ef8746"},{"saturation":-20}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#1b483d"},{"lightness":10},{"saturation":-30}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#ffddc7"}]},{"featureType":"All","elementType":"labels","stylers":[{"color":"#808080"},{"lightness":70},{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"All","stylers":[{"visibility":"on"},{"color":"#c299c3"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"lightness":20},{"color":"#ffdeca"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#af583c"},{"visibility":"on"}]},{"featureType":"transit","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#3a4041"}]},{"featureType":"landscape.natural","elementType":"All","stylers":[{"visibility":"on"},{"color":"#cd4604"},{"lightness":2},{"saturation":-40}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#c7824a"},{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#966bb9"},{"visibility":"off"}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"color":"#a4d3df"},{"lightness":-60},{"saturation":-40},{"visibility":"off"}]},{"featureType":"landscape.man_made","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#66cceb"}]},{"featureType":"All","elementType":"All"},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#ffddc7"}]},{"stylers":[{"saturation":-50},{"gamma":1.32}]}]
    },
    "desert" : {
        "textures" : {
            "gate" : "gates/gate_desert.png"
        },
        "sky"    : "#5ab8c7",
        "horizon" : "#71d3e2",
        "target" : "#fff2bf",
        "gradient" : 0xffffff,
        "clouds" : true,
        "style"     : [ { stylers: [ { visibility: "off" } ] },{ featureType: "landscape.man_made", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { color: "#d0bc9d" } ] },{ featureType: "water", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { color: "#57c4d4" }, { lightness: -40 }, { saturation: -30 } ] },{ featureType: "road.highway", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { saturation: -20 }, { color: "#8c8275" } ] },{ elementType: "labels", stylers: [ { color: "#808080" }, { lightness: 70 }, { visibility: "off" } ] },{ featureType: "road.arterial", stylers: [ { visibility: "on" }, { color: "#675845" } ] },{ featureType: "road.local", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { color: "#efecdb" }, { lightness: -5 } ] },{ featureType: "road", elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "poi", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { saturation: -20 }, { color: "#b2a186" } ] },{ featureType: "transit", elementType: "geometry.stroke", stylers: [ { visibility: "on" }, { color: "#3a4041" } ] },{ featureType: "landscape.natural", stylers: [ { visibility: "on" }, { lightness: 10 }, { color: "#e4ceac" } ] },{ featureType: "road.highway", elementType: "geometry.stroke", stylers: [ { color: "#c7824a" }, { visibility: "off" } ] },{ featureType: "road.arterial", elementType: "geometry.stroke", stylers: [ { color: "#966bb9" }, { visibility: "off" } ] },{ featureType: "road.local", elementType: "geometry.stroke", stylers: [ { color: "#a4d3df" }, { lightness: -60 }, { saturation: -40 }, { visibility: "off" } ] },{ featureType: "landscape.man_made", elementType: "geometry.stroke", stylers: [ { visibility: "on" }, { color: "#66cceb" } ] },{ } ]
    },
    "utah" : {
        "textures" : {
            "gate" : "gates/gate_desert.png"
        },
        "sky"    : "#83c5c7",
        "horizon" : "#fff7f1",
        "target" : "#fff2bf",
        "gradient" : 0xffffff,
        "clouds" : true,
        "style"     : [  {    "featureType": "All",    "elementType": "All",    "stylers": [      { "visibility": "off" }    ]  },{    "featureType": "landscape.man_made",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#f78f4d" },      { "lightness": 30 },      { "saturation": -50 }    ]  },{    "featureType": "water",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "lightness": -40 },      { "saturation": -30 },      { "color": "#325b55" }    ]  },{    "featureType": "road.highway",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "saturation": -20 },      { "color": "#8c8275" }    ]  },{    "featureType": "All",    "elementType": "labels",    "stylers": [      { "color": "#808080" },      { "lightness": 70 },      { "visibility": "off" }    ]  },{    "featureType": "road.arterial",    "elementType": "All",    "stylers": [      { "visibility": "on" },      { "color": "#c299c3" }    ]  },{    "featureType": "road.local",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "lightness": 20 },      { "color": "#ffdeca" }    ]  },{    "featureType": "road",    "elementType": "labels",    "stylers": [      { "visibility": "off" }    ]  },{    "featureType": "poi",    "elementType": "geometry.fill",    "stylers": [      { "color": "#af583c" },      { "visibility": "on" },      { "lightness": 40 }    ]  },{    "featureType": "transit",    "elementType": "geometry.stroke",    "stylers": [      { "visibility": "on" },      { "color": "#3a4041" }    ]  },{    "featureType": "landscape.natural",    "elementType": "All",    "stylers": [      { "visibility": "on" },      { "color": "#f5c19c" },      { "lightness": 30 },      { "saturation": -30 }    ]  },{    "featureType": "road.highway",    "elementType": "geometry.stroke",    "stylers": [      { "color": "#c7824a" },      { "visibility": "off" }    ]  },{    "featureType": "road.arterial",    "elementType": "geometry.stroke",    "stylers": [      { "color": "#966bb9" },      { "visibility": "off" }    ]  },{    "featureType": "road.local",    "elementType": "geometry.stroke",    "stylers": [      { "color": "#a4d3df" },      { "lightness": -60 },      { "saturation": -40 },      { "visibility": "off" }    ]  },{    "featureType": "landscape.man_made",    "elementType": "geometry.stroke",    "stylers": [      { "visibility": "on" },      { "color": "#66cceb" }    ]  },{    "featureType": "All",    "elementType": "All"  },{    "featureType": "road.highway",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#d56b80" }    ]  }]
    },


    "burningman" : {
        "textures" : {
            "gate" : "gates/gate_burningman.png",
            "star" : "stars/star_burningman.png"
        },
        "sky"    : "#171425",
        "horizon" : "#25003c",
        "target" : "#d7ff8c",
        "gradient" : 0xf0ffc3,
        "clouds" : true,
        "style"     : [ { elementType: "geometry", stylers: [ { visibility: "off" } ] },{ elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "water", elementType: "geometry", stylers: [ { visibility: "on" }, { color: "#2b0633" }, { lightness: -30 }, { saturation: -40 } ] },{ featureType: "landscape.natural", stylers: [ { visibility: "on" }, { color: "#251f42" }, { lightness: -40 }, { saturation: -20 } ] },{ featureType: "landscape.man_made", elementType: "geometry", stylers: [ { visibility: "on" }, { color: "#4e007e" } ] },{ featureType: "poi", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { color: "#3700fb" }, { saturation: -30 } ] },{ featureType: "transit.line", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { color: "#ff0a89" } ] },{ featureType: "road.local", elementType: "geometry", stylers: [ { visibility: "on" }, { color: "#f2deff" } ] },{ featureType: "road.local", elementType: "geometry.stroke", stylers: [ { color: "#ae22ff" }, { visibility: "on" } ] },{ featureType: "road.arterial", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { lightness: 40 }, { color: "#d5ff8b" } ] },{ featureType: "road.arterial", elementType: "geometry.stroke", stylers: [ { visibility: "on" }, { color: "#1fb3a8" } ] },{ featureType: "road.highway", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { color: "#f88eff" } ] },{ featureType: "road.highway", elementType: "geometry.stroke", stylers: [ { visibility: "on" }, { color: "#b21e21" } ] },{ } ]
    },


    /*
    // template

    "" : {
        "sky"    : "#",
        "horizon" : "#",
        "target" : "#",
        "gradient" : 0x000000,
        "clouds" : true,
        "style"     : 
    },

    */

// BONUS STYLES //

    "scifi" : {
        "textures" : {
            "base" : "landmarks/base_scifi.png",
            "dropzone" : "landmarks/dropzone_scifi.png",
            "gate" : "gates/gate_scifi.png",
            "star" : "stars/star_scifi.png"
        },
        "sky" : "#06131a",
        "horizon" : "#081d2b",
        "target" : "#21e2ff",
        "gradient" : 0xbce8f5,
        "clouds" : false,
        "style" : [  {    "featureType": "All",    "elementType": "geometry",    "stylers": [      { "visibility": "off" }    ]  },{    "featureType": "All",    "elementType": "labels",    "stylers": [      { "visibility": "off" }    ]  },{    "featureType": "water",    "elementType": "geometry",    "stylers": [      { "visibility": "on" },      { "color": "#0d1a2a" },      { "saturation": -50 },      { "lightness": -20 }    ]  },{    "featureType": "landscape.natural",    "elementType": "All",    "stylers": [      { "visibility": "on" },      { "color": "#1f4761" },      { "lightness": -50 }    ]  },{    "featureType": "landscape.man_made",    "elementType": "geometry",    "stylers": [      { "visibility": "on" },      { "color": "#123247" }    ]  },{    "featureType": "poi",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#3885b7" },      { "lightness": -50 }    ]  },{    "featureType": "transit.line",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#5adbff" }    ]  },{    "featureType": "road.local",    "elementType": "geometry",    "stylers": [      { "visibility": "on" },      { "color": "#b7fbff" },      { "saturation": -30 },      { "lightness": -50 }    ]  },{    "featureType": "road.local",    "elementType": "geometry.stroke",    "stylers": [      { "visibility": "on" },      { "color": "#00689e" },      { "hue": "#00ffe6" },      { "lightness": 20 }    ]  },{    "featureType": "road.arterial",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#00ecff" },      { "saturation": 40 },      { "lightness": 40 }    ]  },{    "featureType": "road.arterial",    "elementType": "geometry.stroke",    "stylers": [      { "visibility": "on" },      { "color": "#6ad0ff" },      { "hue": "#00ffdd" },      { "lightness": 20 }    ]  },{    "featureType": "road.highway",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#ffffff" }    ]  },{    "featureType": "road.highway",    "elementType": "geometry.stroke",    "stylers": [      { "visibility": "on" },      { "color": "#47bede" }    ]  },{    "featureType": "All",    "elementType": "All"  }]
    },

    "volcano" : {
        "textures" : {
            "base" : "landmarks/base_volcano.png",
            "dropzone" : "landmarks/dropzone_volcano.png",
            "gate" : "gates/gate_volcano.png",
            "star" : "stars/star_volcano.png"
        },
        "sky" : "#430102",
        "horizon" : "#2a0002",
        "target" : "#ff8400",
        "gradient" : 0xfd0000,
        "clouds" : false,
        "style" : [ { elementType: "geometry", stylers: [ { visibility: "off" } ] },{ elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "water", elementType: "geometry", stylers: [ { visibility: "on" }, { color: "#ff0000" }, { saturation: -10 }, { lightness: -90 } ] },{ featureType: "landscape.natural", stylers: [ { saturation: 80 }, { visibility: "on" }, { lightness: 20 }, { color: "#a51b00" } ] },{ featureType: "landscape.man_made", elementType: "geometry", stylers: [ { visibility: "on" }, { color: "#3c0000" }, { lightness: -30 } ] },{ featureType: "poi", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { color: "#ff5400" } ] },{ featureType: "transit.line", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { color: "#ff0000" } ] },{ featureType: "road.local", elementType: "geometry", stylers: [ { visibility: "on" }, { color: "#ff0000" } ] },{ featureType: "road.local", elementType: "geometry.stroke", stylers: [ { visibility: "on" } ] },{ featureType: "road.arterial", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { lightness: 70 }, { color: "#ff0000" } ] },{ featureType: "road.arterial", elementType: "geometry.stroke", stylers: [ { color: "#6ad0ff" } ] },{ featureType: "road.highway", elementType: "geometry.fill", stylers: [ { visibility: "on" }, { saturation: -50 }, { color: "#ff0000" } ] },{ featureType: "road.highway", elementType: "geometry.stroke", stylers: [ { color: "#ff0000" }, { visibility: "on" } ] },{ } ]
    },

    "8bit" : {
        "textures" : {
            "base" : "landmarks/base_8bit.png",
            "dropzone" : "landmarks/dropzone_8bit.png",
            "gate" : "gates/gate_8bit.png",
            "star" : "stars/star_8bit.png"
        },
        "sky" : "#3e99ff",
        "horizon" : "#9ccbff",
        "target" : "#fff8ac",
        "gradient" : 0xfff696,
        "clouds" : false,
        "style" : [  {    "featureType": "All",    "elementType": "geometry",    "stylers": [      { "visibility": "off" }    ]  },{    "featureType": "All",    "elementType": "labels",    "stylers": [      { "visibility": "off" }    ]  },{    "featureType": "water",    "elementType": "geometry",    "stylers": [      { "visibility": "on" },      { "saturation": -50 },      { "lightness": -20 },      { "color": "#0b79f4" }    ]  },{    "featureType": "landscape.natural",    "elementType": "All",    "stylers": [      { "visibility": "on" },      { "lightness": -50 },      { "color": "#8ffe47" }    ]  },{    "featureType": "landscape.man_made",    "elementType": "geometry",    "stylers": [      { "visibility": "on" },      { "color": "#309434" },      { "lightness": 20 },      { "saturation": 20 }    ]  },{    "featureType": "poi",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#35e238" }    ]  },{    "featureType": "transit.line",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#5adbff" },      { "lightness": 20 }    ]  },{    "featureType": "road.local",    "elementType": "geometry",    "stylers": [      { "visibility": "on" },      { "color": "#93ef56" },      { "lightness": 40 }    ]  },{    "featureType": "road.local",    "elementType": "geometry.stroke",    "stylers": [      { "color": "#00689e" },      { "visibility": "off" }    ]  },{    "featureType": "road.arterial",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#f8a435" }    ]  },{    "featureType": "road.arterial",    "elementType": "geometry.stroke",    "stylers": [      { "color": "#6ad0ff" },      { "visibility": "off" }    ]  },{    "featureType": "road.highway",    "elementType": "geometry.fill",    "stylers": [      { "visibility": "on" },      { "color": "#ffe327" }    ]  },{    "featureType": "road.highway",    "elementType": "geometry.stroke",    "stylers": [      { "color": "#47bede" },      { "visibility": "off" }    ]  },{    "featureType": "All",    "elementType": "All"  },{    "elementType": "labels.text",    "stylers": [      { "visibility": "off" }    ]  },{  }]
    },

    "night" : {
        "textures" : {
            "base" : "landmarks/base_night.png",
            "dropzone" : "landmarks/dropzone_night.png",
            "gate" : "gates/gate_night.png",
            "star" : "stars/star_night.png"
        },
        "sky" : "#06131a",
        "horizon" : "#081d2b",
        "target" : "#ffedae",
        "gradient" : 0xffe38e,
        "clouds" : false,
        "style" : [{"featureType":"All","elementType":"All","stylers":[{"visibility":"off"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"lightness":10},{"visibility":"on"},{"color":"#0a2a37"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#0f475e"},{"lightness":-80}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"saturation":-20},{"color":"#fff8d9"}]},{"featureType":"All","elementType":"labels","stylers":[{"color":"#808080"},{"lightness":70},{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#fff6d6"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"saturation":-20},{"lightness":-10},{"color":"#ffefb9"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"saturation":-40},{"lightness":5},{"visibility":"on"},{"color":"#0d1b21"}]},{"featureType":"transit","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#3a4041"}]},{"featureType":"landscape.natural","elementType":"All","stylers":[{"lightness":20},{"saturation":10},{"visibility":"on"},{"color":"#122f3b"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"saturation":-40},{"lightness":-30},{"color":"#ffd34b"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#f35d14"},{"lightness":10},{"saturation":-20}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"lightness":-20},{"color":"#eb862c"}]},{"featureType":"landscape.man_made","elementType":"geometry.stroke","stylers":[{"color":"#06171e"},{"visibility":"on"}]},{"featureType":"All","elementType":"labels"},{"featureType":"All","elementType":"labels","stylers":[{"visibility":"off"}]}]
    },

    "revolutions" : {
        "textures" : {
            "base" : "landmarks/base_revolutions.png",
            "dropzone" : "landmarks/dropzone_revolutions.png",
            "gate" : "gates/gate_revolutions.png",
            "star" : "stars/star_revolutions.png"
        },
        "sky" : "#15414c",
        "horizon" : "#2e949a",
        "target" : "#00fff6",
        "gradient" : 0x62f9ff,
        "clouds" : false,
        "style" : [{"featureType":"All","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"All","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"geometry","stylers":[{"visibility":"on"},{"hue":"#ff4400"},{"saturation":60},{"color":"#1e2223"}]},{"featureType":"landscape.natural","elementType":"All","stylers":[{"visibility":"on"},{"saturation":-20},{"lightness":20},{"color":"#0b5443"}]},{"featureType":"landscape.man_made","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#254049"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#1d7161"}]},{"featureType":"transit.line","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"saturation":30},{"color":"#17181a"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#0c919c"},{"saturation":40},{"hue":"#00ffc4"}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"color":"#ff7747"},{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"lightness":70},{"color":"#42a7b3"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#6ad0ff"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#e3f2ef"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"visibility":"off"},{"hue":"#ffee00"},{"color":"#36e0b7"}]},{"featureType":"All","elementType":"All"}]
    }, 

    "raver" : {
        "textures" : {
            "base" : "landmarks/base_raver.png",
            "dropzone" : "landmarks/dropzone_raver.png",
            "gate" : "gates/gate_raver.png",
            "star" : "stars/star_raver.png"
        },
        "sky" : "#391b54",
        "horizon" : "#791578",
        "target" : "#00ff5a",
        "gradient" : 0x00ff59,
        "clouds" : false,
        "style" : [{"featureType":"All","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"All","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"All","stylers":[{"color":"#ff0000"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#00ff30"}]},{"featureType":"road.arterial","elementType":"All","stylers":[{"color":"#ff00d2"}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#e4ff01"}]},{"featureType":"landscape.man_made","elementType":"geometry","stylers":[{"visibility":"off"},{"color":"#b4002f"}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"visibility":"off"},{"color":"#fff600"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#dcdcdc"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"transit.station.airport","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"#00baff"}]}]
    },

    "terminal" : {
        "textures" : {
            "base" : "landmarks/base_terminal.png",
            "dropzone" : "landmarks/dropzone_terminal.png",
            "gate" : "gates/gate_terminal.png",
            "star" : "stars/star_terminal.png"
        },
        "sky" : "#001409",
        "horizon" : "#07312a",
        "target" : "#55ffcd",
        "gradient" : 0xe0fff6,
        "clouds" : false,
        "style" : [{"featureType":"All","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"All","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#00230f"}]},{"featureType":"road.arterial","elementType":"All","stylers":[{"color":"#affecd"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#7aee96"},{"saturation":80},{"lightness":30}]},{"featureType":"road.arterial","elementType":"All","stylers":[{"color":"#006457"}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#001409"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#00f1b0"}]},{"featureType":"landscape.man_made","elementType":"geometry","stylers":[{"color":"#cf4e4e"}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#00cf97"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"transit.station.airport","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"#0cff96"},{"lightness":-70},{"saturation":-30}]}]
    },
    

};

// Group styles into buckets for per-dive styles but with some variation.
// Add map styles as needed..
mapdive.styleGroups = {
    "default" : ["default"],
    "desert" : ["desert", "canyon"],
    "forest" : ["forest", "medieval", "pastoral"],
    "urban" : ["tactile", "urban", "urban_bright", "red_roads", "world_of_tomorrow"],
    "hobbiton" : ["hobbiton"]
};


function loadMapStyles() {
	for(var itm in viewStyles) {
		viewStyles[itm].mapstyle = new google.maps.StyledMapType( viewStyles[itm].style, {name : itm} );
	}
    console.log("Loaded map styles");
}