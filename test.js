requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: '.',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        jquery: [
            '//code.jquery.com/jquery-2.1.4.min',
            //If the CDN location fails, load from this location
            'jquery'
        ],
        "socket.io": [
            "//cdn.socket.io/socket.io-1.3.7",
            "socket.io.backup"
        ],
        codemirror: [
            "//cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4"
        ]
    },
    waitSeconds: 20   
});

requirejs.onError = function(error) {
  if(error.requireModules)
    error.requireModules.forEach(function(name) {
      //Create basename in case this was an URL
      name.replace(/^.*[/]/, "");
      // Debug
      console.warn("Module failed to load: ", name);
      //notifyInit(name, false);
      // Find the loading node (they are hardcoded) and 
      // if it exists mark it as failed
      var element = document.getElementById("loading_"+name);
      if(element) {
        element.className+=" failed";
      }
    });
  else
    console.error("Unexpected requirejs onError callback: ", error);
}

var deps = ['ObjectDrawer', 'GravityWell', 'Spaceship', 'Projectile'];

requirejs(deps, (ObjectDrawer, GravityWell, Spaceship, Projectile)=>{
    var global_ctors = {
      GravityWell: GravityWell, Spaceship: Spaceship, Projectile: Projectile
    };

    var DRAWER = new ObjectDrawer();
    DRAWER.createScreen();
    DRAWER.drawLoop();

    var spawnOrigin = null;
    var spawnSpeed = null;
    
    var dragOriginalPoint = null;
    
    
    DRAWER.renderer.view.addEventListener("mousedown", function(e){
      spawnOrigin = this.relativeCoords(e);
      if(document.activeElement && document.activeElement.blur)
        document.activeElement.blur();
      if(e.button==0) {
        spawnSpeed = [0,0];
      }
      else if(e.button==2) {
        e.preventDefault();
        dragOriginalPoint = DRAWER.focusPoint||{x:0, y:0};
      }
    });
    DRAWER.renderer.view.addEventListener("mouseup", function(e){
      // If draging map, do njot spawn anything
      if(!dragOriginalPoint) {
        if(spawnOrigin) {
          var obj = new GravityWell((spawnOrigin[0]-DRAWER.renderer.width/2)/DRAWER.stage.scale.x+DRAWER.stage.pivot.x/*+ship.x/DRAWER.stage.scale.x*/, (spawnOrigin[1]-DRAWER.renderer.height/2)/DRAWER.stage.scale.y+DRAWER.stage.pivot.y/*+ship.y/DRAWER.stage.scale.x*/, document.getElementById("mass").value*1, ObjectDrawer.textures.asteroid, DRAWER.stage);
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
      }
      if(dragOriginalPoint) {
        e.preventDefault();
        e.cancelBubble = true;
        // Always disable draging mode
        dragOriginalPoint = null;
        return false;
      }
    });
    DRAWER.renderer.view.addEventListener("contextmenu", function(e){
        e.preventDefault();
    }, false);
    DRAWER.renderer.view.addEventListener("mousemove", function(e){
      if(dragOriginalPoint) {
        var coords = this.relativeCoords(e);
        DRAWER.focusPoint = new ObjectDrawer.FocusPoint(
            dragOriginalPoint.x-(coords[0]-spawnOrigin[0]),
            dragOriginalPoint.y-(coords[1]-spawnOrigin[1])
        );
      }
      else if(spawnOrigin) {
        spawnSpeed = this.relativeCoords(e);
        spawnSpeed[0]-=spawnOrigin[0];
        spawnSpeed[1]-=spawnOrigin[1];
      }
    });
    DRAWER.renderer.view.addEventListener("mouseout", function(e){
      dragOriginalPoint = null;
    });
    var graphics = new ObjectDrawer.PIXI.Graphics();
    DRAWER.stage.addChild(graphics);
    DRAWER.onDraw = function() {
        graphics.clear();
        if(spawnOrigin!=null) {
            var stage = this.stage;
            var scale = this.stage.scale;
            
            graphics.lineStyle(2/stage.scale.x, 0xFF0000);
            var x = (spawnOrigin[0]-this.renderer.width/2)/stage.scale.x+stage.pivot.x;
            var y = (spawnOrigin[1]-this.renderer.height/2)/stage.scale.y+stage.pivot.y;
    
            graphics.moveTo(x-10/scale.x,y);
            graphics.lineTo(x+10/scale.x, y);
            graphics.moveTo(x,y-10/scale.x);
            graphics.lineTo(x, y+10/scale.x);
            if(spawnSpeed!=null) {
              graphics.moveTo(x,y);
              graphics.lineStyle(1/stage.scale.x, 0xFF0000);
              var speedPoint = canvasToGameCoords(spawnSpeed[0]+spawnOrigin[0], spawnSpeed[1]+spawnOrigin[1]);
              graphics.lineTo(speedPoint.x, speedPoint.y);
            } 
        }
    }
    window.addEventListener("keydown", function(e) {
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
        var obj = new Projectile(ship.x-(ship.radius+5)*Math.cos(angle), ship.y-(ship.radius+5)*Math.sin(angle), 1000, projectile, DRAWER.stage);
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
     DRAWER.zoom = dir>0?DRAWER.zoom*1.5:DRAWER.zoom/1.5;
     //console.log(DRAWER.zoom);
    });
    
    var objects = {};
    var ship;
    
    function canvasToGameCoords(x, y) {
        return new PIXI.Point((x-DRAWER.renderer.width/2)/DRAWER.stage.scale.x+DRAWER.stage.pivot.x,
                              (y-DRAWER.renderer.height/2)/DRAWER.stage.scale.y+DRAWER.stage.pivot.y);
    }

    
    
    // Creating objects 
    var objs = [];
    var dd;
    //objs.push(new GravityWell(400, 300, 1000000000, ObjectDrawer.textures.asteroid, DRAWER.stage));
    //objs.push(dd = new GravityWell(100, 100, 2000000, ObjectDrawer.textures.asteroid, DRAWER.stage));
    //objs.push(dd = new GravityWell(10000000, 10000000, 7.34767309e22, textures.asteroid, DRAWER.stage));
    //dd.vx = -0.00001;
    //dd.vy = -0.000001;
    //objs.push(ship = new GravityWell(100, 500, 20000, asteroid, DRAWER.stage));
    //objs.push(ship = new GravityWell(600, 100, 20000, asteroid, DRAWER.stage));
    //objs.push(ship = new Spaceship(990, 470, 1000000, ObjectDrawer.textures.spaceship, DRAWER.stage));
    //DRAWER.focusPoint = new ObjectDrawer.FocusPointObject(ship);
    
    window.createShip = function() {
      if(!ship) {
        var focus = DRAWER.focusPoint || {x:0, y:0};
        
        ship = new Spaceship(focus.x, focus.y, 1000000, ObjectDrawer.textures.spaceship, DRAWER.stage);
        ship.id = ++MAX_ID;
        objects[ship.id]=ship;
        
        var array = ship.saveToArray();
        worker.postMessage({name:"create", data: array.buffer, constructors: ["Spaceship"]}, [array.buffer]);
        
        DRAWER.focusPoint = new ObjectDrawer.FocusPointObject(ship);
        return ship;
      }
      else {
        throw new Error("Ship already exists!");
      }
    }
    
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
                var obj = new GravityWell(0, 0, 0, texture, DRAWER.stage);
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
                var ctor = ctors?global_ctors[ctors[i/GravityWell.SAVE_DATA_LENGTH]]:GravityWell;
                if(ctors) {
                  texture = ctor.prototype.textureName;
                }
                
                var obj = new ctor(0, 0, 0, ObjectDrawer.textures[texture], DRAWER.stage);
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
        case "ready" : 
            var data = new Float64Array(Object.getOwnPropertyNames(objects).length*GravityWell.SAVE_DATA_LENGTH);
            var constructors = [];
            var offset = 0;
            for(var i in objects) {
              objects[i].saveToArray(offset, data);
              constructors.push(objects[i].constructor.name);
              offset += GravityWell.SAVE_DATA_LENGTH;
            }       
            worker.postMessage({name:"create", data: data.buffer, constructors:constructors}, [data.buffer]);
            // Editable constants
            document.getElementById("speedRatio").addEventListener("change", function() {
              worker.postMessage({name: "speed", data: this.value*1});
            });
            worker.postMessage({name: "speed", data: document.getElementById("speedRatio").value*1});
            
            document.getElementById("g_const").addEventListener("change", function() {
              worker.postMessage({name: "g-constant", data: this.value*1});
            });
            worker.postMessage({name: "g-constant", data: document.getElementById("g_const").value*1});
            // fire event to window scope
            window.dispatchEvent(new CustomEvent('simulation-started', {detail: {worker:worker}}));
        break;
        default:
          console.error("Unknown message:", e.data.name);
      }
    });
    
    
    /*var values = objects.values();
    var data = new Float64Array(values.length*7);
    for(var i=0; i<values.length; i++) {
      var offset = i*7;
      values[i].saveToArray(offset, data);
    }        */
    function localSimulation() {
      if(ship && ship.recalculateAcceleration()) {
        var array = ship.savePropertiesToArray(ship.configurations.acceleration);
        worker.postMessage({name:"acceleration", data: array.buffer}, [array.buffer]);
      }
    }
    setInterval(localSimulation, 50);
    
    window.addEventListener("bounce-fn-changed", (e)=>{
      worker.postMessage({name:"bounce-fn", fn: e.detail.fn});
    });
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
});

/*
  [
        "//cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/codemirror.js",
        "//cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/mode/javascript/javascript.js",
        "//cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/addon/comment/continuecomment.js",
        "//cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/addon/edit/matchbrackets.js",
        "//cdnjs.cloudflare.com/ajax/libs/codemirror/5.13.4/addon/comment/comment.js"
  ],
*/

/*
  [
        "codemirror/codemirror",
        "codemirror/mode/javascript/javascript",
        "codemirror/addon/comment/continuecomment",
        "codemirror/addon/edit/matchbrackets",
        "codemirror/addon/comment/comment"
  ],
  */
/*require(
  [
        "codemirror/codemirror",
        "codemirror/mode/javascript/javascript",
        "codemirror/addon/comment/continuecomment",
        "codemirror/addon/edit/matchbrackets",
        "codemirror/addon/comment/comment"
  ],
  (CodeMirror)=>{
        var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
          lineNumbers: true,
          matchBrackets: true,
          continueComments: "Enter",
          extraKeys: {"Ctrl-Q": "toggleComment"}
        });
  }
);  */