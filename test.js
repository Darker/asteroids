var width = window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth;

var height = window.innerHeight
|| document.documentElement.clientHeight
|| document.body.clientHeight;

var renderer = PIXI.autoDetectRenderer(width, height,{backgroundColor : 0x0});
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();
stage.interactive = true;
var hud = new PIXI.Container();

// create a texture from an image path
//var texture = PIXI.Texture.fromImage("http://vignette2.wikia.nocookie.net/dumbway2sdie/images/3/3a/Asteroid2.png");
//var texture = PIXI.Texture.fromImage("http://cosmoknights.googlecode.com/svn/trunk/art/asteroids/asteroid.png");
//var texture = PIXI.Texture.fromImage("_assets/p2.jpeg");
var textures = {
  asteroid: PIXI.Texture.fromImage("asteroid.png"),
  spaceship: PIXI.Texture.fromImage("spaceship.png"),
  projectile: PIXI.Texture.fromImage("projectile_circle.png"),
}

var graphics = new PIXI.Graphics();
var zoom = 1;

stage.addChild(graphics);
var spawnOrigin = null;
var spawnSpeed = null;

renderer.view.addEventListener("mousedown", function(e){
  spawnOrigin = this.relativeCoords(e);
  document.activeElement.blur();
  spawnSpeed = [0,0];
});
renderer.view.addEventListener("mouseup", function(e){
  if(spawnOrigin) {
    var obj = new GravityWell((spawnOrigin[0]-renderer.width/2)/stage.scale.x+stage.pivot.x/*+ship.x/stage.scale.x*/, (spawnOrigin[1]-renderer.height/2)/stage.scale.y+stage.pivot.y/*+ship.y/stage.scale.x*/, document.getElementById("mass").value*1, textures.asteroid, stage);
    obj.id = ++MAX_ID;
    objects[obj.id]=obj;
    
    var velocityMod = document.getElementById("velocity").value*1;
    obj.vx = (spawnSpeed[0]/15000)*velocityMod;
    obj.vy = (spawnSpeed[1]/15000)*velocityMod;
    var array = obj.saveToArray();
    worker.postMessage({name:"create", data: array.buffer}, [array.buffer]);
    //console.log(spawnSpeed);
  }
  spawnOrigin = null;
});
renderer.view.addEventListener("mousemove", function(e){
  if(spawnOrigin) {
    spawnSpeed = this.relativeCoords(e);
    spawnSpeed[0]-=spawnOrigin[0];
    spawnSpeed[1]-=spawnOrigin[1];
  }
});

window.addEventListener("keydown", function(e){
  //console.log(e);
  var key = e.keyCode;
  if(key==38) {
    ship.forwardEngine(-1);
  }
  if(key==37 ||key==39) {
    ship.rotationEngine(key==37?-1:1);
  }
  if(key==32 && ship) {
    /*var angle = ship.rotation+Math.PI/2;
    var obj = new Projectile(ship.x-(ship.radius+5)*Math.cos(angle), ship.y-(ship.radius+5)*Math.sin(angle), 1000, projectile, stage);
    obj.id = ++MAX_ID;
    objects[obj.id]=obj;
    
    var speed = -0.1;
    var vx = speed*Math.cos(angle);
    var vy = speed*Math.sin(angle);
    ship.launchObject(obj, vx, vy);
    
    var array = obj.saveToArray();
    console.log("Projectile: ", [obj.x, obj.y], "Ship: ", [ship.x, ship.y]);
    worker.postMessage({name:"create", data: array.buffer, constructors:["Projectile"]}, [array.buffer]);  */ 
    worker.postMessage({name:"action", id: ship.id, actionName: "shoot", args: []});
  }
});


window.addEventListener("keyup", function(e){
  //console.log(e);
  var key = e.keyCode;
  if(key==38) {
    ship.forwardEngine(0);
  }
  if(key==37 ||key==39) {
    ship.rotationEngine(0);
  }
});

window.addEventListener("wheel", function(e){
 //console.log(e, (e.detail ? e.detail * (-1) : e.wheelDelta / 120)); 
 var dir = Math.sign(e.deltaY);
 zoom = dir>0?zoom*1.5:zoom/1.5;
 console.log(zoom);
});

var objects = {};
var ship;

function canvasToGameCoords(x, y) {
    return new PIXI.Point((x-renderer.width/2)/stage.scale.x+stage.pivot.x,
                          (y-renderer.height/2)/stage.scale.y+stage.pivot.y);
}
// start animating
animate();
var lastUpdate = -1;
function animate() {
    requestAnimationFrame(animate);
    graphics.clear();
    if(spawnOrigin!=null) {
    graphics.lineStyle(2/stage.scale.x, 0xFF0000);
    var x = (spawnOrigin[0]-renderer.width/2)/stage.scale.x+stage.pivot.x;
    var y = (spawnOrigin[1]-renderer.height/2)/stage.scale.y+stage.pivot.y;


        graphics.moveTo(x-10/stage.scale.x,y);
        graphics.lineTo(x+10/stage.scale.x, y);
        graphics.moveTo(x,y-10/stage.scale.x);
        graphics.lineTo(x, y+10/stage.scale.x);
        if(spawnSpeed!=null) {
          graphics.moveTo(x,y);
          graphics.lineStyle(1/stage.scale.x, 0xFF0000);
          var speedPoint = canvasToGameCoords(spawnSpeed[0]+spawnOrigin[0], spawnSpeed[1]+spawnOrigin[1]);
          graphics.lineTo(speedPoint.x, speedPoint.y);
        } 
    }
    
    if(ship) {
      if(ship.recalculateAcceleration()) {
        var array = ship.savePropertiesToArray(ship.configurations.acceleration);
        worker.postMessage({name:"acceleration", data: array.buffer}, [array.buffer]);
      }
      //stage.position.x = -1*ship.x+renderer.width/2;
      //stage.position.y = -1*ship.y+renderer.height/2;
      stage.position.x = renderer.width/2;
      stage.position.y = renderer.height/2;
      stage.scale.x = zoom;
      stage.scale.y = zoom;
      stage.pivot.x = ship.x;
      stage.pivot.y = ship.y;
    }
    /*graphics.lineStyle(20, 0x33FF00);
    graphics.moveTo(30,30);
    graphics.lineTo(600, 300);
    for(var i=0,l=objects.length; i<l; i++) {
      var obj = objects[i]; 
      graphics.lineStyle(1,0xFFFFFF,1);
      graphics.drawCircle(obj.x, obj.y, obj.radius);
      graphics.endFill();
    }     */     

    // render the container
    renderer.render(stage);
    //renderer.render(hud);
}


/**
  the third argument, mass, must be in kilograms **/


// Creating objects 

var objs = [];
var dd;
objs.push(new GravityWell(400, 300, 1000000000, textures.asteroid, stage));
objs.push(dd = new GravityWell(100, 100, 2000000, textures.asteroid, stage));
//objs.push(dd = new GravityWell(10000000, 10000000, 7.34767309e22, textures.asteroid, stage));
dd.vx = -0.00001;
dd.vy = -0.000001;
//objs.push(ship = new GravityWell(100, 500, 20000, asteroid, stage));
//objs.push(ship = new GravityWell(600, 100, 20000, asteroid, stage));
objs.push(ship = new Spaceship(990, 470, 1000000, textures.spaceship, stage));

for(var i=0; i<objs.length; i++) {
  objects[objs[i].id] = objs[i];
}
//ship.accelerate(Math.atan2(-ship.y+0, -ship.x+0), 50000);
//ship.vx = 0.0005;
//ship.vy = 0.00000003;
var MAX_ID = 5;
var worker = new Worker("simulator.js");
var global = window;
worker.addEventListener("message", function(e) {
  var data = e.data.data;
  switch(e.data.name) {
    case "create" : 
        /*var array = new Float64Array(data);
        console.log("[MAIN] Create ",array);
        for(var i=0,l=array.length; i<l; i+=GravityWell.SAVE_DATA_LENGTH) {
            var obj = new GravityWell(0, 0, 0, texture, stage);
            obj.id = array[i];
            obj.loadFromArray(i, array);
            console.log("[MAIN] Create ",obj, );
            objects[obj.id] = obj;
            MAX_ID = obj.id;
        }           */
        var array = new Float64Array(data);
        var ctors = e.data.constructors;
        //console.log("[MAIN->WORKER] Create objects ", array);
        for(var i=0,l=array.length; i<l; i+=GravityWell.SAVE_DATA_LENGTH) {
            //var obj = new GravityWell();
            var texture = "asteroid";
            var ctor = ctors?global[ctors[i/GravityWell.SAVE_DATA_LENGTH]]:GravityWell;
            if(ctors) {
              texture = ctor.prototype.textureName;
            }
            
            var obj = new ctor(0, 0, 0, textures[texture], stage);
            obj.id = array[i];
            obj.loadFromArray(i, array);
            console.log("[MAIN] Create ",obj, texture, ctor);
            objects[obj.id] = obj;
            MAX_ID = obj.id;
        }
    break;
    case "destroy" :     
        var array = new Uint32Array(data);      
        console.log("[MAIN] Destroy: ",array);
        for(var i=0,l=array.length; i<l; i++) {
          var obj = objects[array[i]]; 
          obj.destroy();
          delete objects[array[i]];
        }
    break;
    case "update" : 
        var array = new Float64Array(data);
        for(var i=0,l=array.length; i<l; i+=GravityWell.SAVE_DATA_LENGTH) {
          var obj = objects[array[i]];
          try {
            obj.loadFromArray(i, array);  
          }
          catch(e) {
            //worker.terminate();
            //console.error("Invalid object requested: ", i);
            //throw e;
            continue;
          }
        }   
        //console.log("Update ", array.length, " items.");
    break;
    default:
      console.error("Unknown message:", e.data.name);
  }
});

document.getElementById("speedRatio").addEventListener("change", function() {
  worker.postMessage({name: "speed", data: this.value*1});
});
worker.postMessage({name: "speed", data: document.getElementById("speedRatio").value*1});

/*var values = objects.values();
var data = new Float64Array(values.length*7);
for(var i=0; i<values.length; i++) {
  var offset = i*7;
  values[i].saveToArray(offset, data);
}        */


var data = new Float64Array(Object.getOwnPropertyNames(objects).length*GravityWell.SAVE_DATA_LENGTH);
var constructors = [];
var offset = 0;
for(var i in objects) {
  objects[i].saveToArray(offset, data);
  constructors.push(objects[i].constructor.name);
  offset += GravityWell.SAVE_DATA_LENGTH;
}       
worker.postMessage({name:"create", data: data.buffer, constructors:constructors}, [data.buffer]);

//RandomAsteroid(worker);
/* Returns pixel coordinates according to the pixel that's under the mouse cursor**/
HTMLCanvasElement.prototype.relativeCoords = function(event) {
  var x,y;
  //This is the current screen rectangle of canvas
  var rect = this.getBoundingClientRect();
  var top = rect.top;
  var bottom = rect.bottom;
  var left = rect.left;
  var right = rect.right;
  //Recalculate mouse offsets to relative offsets
  x = event.clientX - left;
  y = event.clientY - top;
  //Also recalculate offsets of canvas is stretched
  var width = right - left;
  //I use this to reduce number of calculations for images that have normal size 
  if(this.width!=width) {
    var height = bottom - top;
    //changes coordinates by ratio
    x = x*(this.width/width);
    y = y*(this.height/height);
  } 
  //Return as an array
  return [x,y];
}

function UniqueIdGenerator(prefix) {
  var id = 0;
  if(typeof prefix != "string")
    prefix = "";
  Object.defineProperty(this, "id", {
      get: () => {return prefix+(++id);},
      enumerable: true,
      configurable: false
    }
  );
}