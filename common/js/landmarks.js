mapdive.landmarks = [
    {
        "name" : "burj_al_arab",
        "model" : "models/landmarks/burj_al_arab.obj",
        "texture" : "radial"
    },
    {
        "name" : "burning_man",
        "model" : "models/landmarks/burning_man.obj",
        "texture" : "radial"
    },
    {
        "name" : "eiffel_tower",
        "model" : "models/landmarks/eiffel_tower.obj",
        "texture" : "radial"
    },
    {
        "name" : "mt_kilimanjaro",
        "model" : "models/landmarks/mt_kilimanjaro.obj",
        "texture" : "radial"
    },
    {
        "name" : "pyramids",
        "model" : "models/landmarks/pyramids.obj",
        "texture" : "radial"
    },
    {
        "name" : "rio_corcovado",
        "model" : "models/landmarks/rio_corcovado.obj",
        "texture" : "radial"
    },
    {
        "name" : "statue_of_liberty",
        "model" : "models/landmarks/statue_of_liberty.obj",
        "texture" : "radial"
    },
    {
        "name" : "sydney_opera_house",
        "model" : "models/landmarks/sydney_opera_house.obj",
        "texture" : "radial"
    },
    {
        "name" : "taj_mahal",
        "model" : "models/landmarks/taj_mahal.obj",
        "texture" : "radial"
    },
    {
        "name" : "the_one_ring",
        "model" : "models/landmarks/the_one_ring.obj",
        "texture" : "radial"
    },
    {
        "name" : "viking_ship",
        "model" : "models/landmarks/viking_ship.obj",
        "texture" : "radial"
    },
    {
        "name" : "st_basils",
        "model" : "models/landmarks/saint_basils_cathedral.obj",
        "texture" : "radial"
    },
    {
        "name" : "moscone_center",
        "model" : "models/landmarks/moscone_center.obj",
        "texture" : "radial"  
    }
];

mapdive.getLandmarkParams = function(name){
    for(var i = 0; i < mapdive.landmarks.length; i++){
        if(mapdive.landmarks[i].name == name){
            return mapdive.landmarks[i];
        }
    }
}