importScripts("require.js");
requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: '.',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        "socket.io": [
            "//cdn.socket.io/socket.io-1.3.7",
            "socket.io.backup"
        ]
    },
    waitSeconds: 20   
});


requirejs(["GravityWell", "Spaceship", "Projectile", "Rocket", "ObjectManager", "bounce_function"],
(GravityWell, Spaceship, Projectile, Rocket, ObjectManager, bounce_function)=> {
  var global_ctors = {
      GravityWell: GravityWell, Spaceship: Spaceship, Projectile: Projectile, Rocket:Rocket
  };
    
  var last = performance.now();
  var lastUpdate = 0;
  var framerate = 30;
  var objectMan = new ObjectManager(self);
  var running = false;
  
  var speedRatio = 5000;
  
  
  
  function runSimulation() {
    running = true;
    setInterval(function() {
      var now = performance.now();
      var dt = ((now - last)*speedRatio)/1000;
      last = now;
      var destroy;
      var objects = objectMan.array;
      var doGravity = GravityWell.prototype.G!=0;
      for(var i=0,l=objects.length; i<l; ++i) {
        var obj = objects[i]; 
        if(!obj)
          continue;
        if(obj.mass<=0) {
          destroyObject(i);
          continue;
        }
        // noclip means object can pass through other objs
        //if(obj.noclip && now-obj.noclip<0)
        //  continue;
        for(var j=i+1,l=objects.length; j<l; ++j) {
          
          var obj2 = objects[j];
          if(!obj2 || obj2.mass<=0) {
            continue;
          }
          // noclip means object can pass through other objs
          //if(now-obj2.noclip<0)
          //  continue;
            
          var distSq = obj.distSq(obj2);
          var radiusSum = obj2.radius+obj.radius;
          var massProduct = obj.mass * obj2.mass;
          if(distSq > massProduct*100)
            continue;
          
          var dist = Math.sqrt(distSq);
          if(dist > radiusSum) {
            if(doGravity) {
              var a = obj.acceleration(distSq, obj2.mass);
              if(a!=0) {
                a *= dt;
                var angle = obj.angleTo(obj2);
                obj.accelerate(angle, a);
                objects[j].accelerate(angle+Math.PI, a);
              }
            }
          }
          else {
            // Consume or split an object
            var hitVelocity = [obj.vx-obj2.vx, obj.vy-obj2.vy];
            var hitVelocityMagSq = hitVelocity[0]*hitVelocity[0]+hitVelocity[1]*hitVelocity[1];
            var sizeRatio = obj.mass/obj2.mass;
            //console.log("Hit velocity squared: ", hitVelocityMagSq, " Mass: ", obj2.mass*obj2.mass/100000000000);
            // hitVelocityMagSq>obj2.mass*obj2.mass/100000000000 && obj2.mass>800
            if((sizeRatio>0.01 && sizeRatio<100) && hitVelocityMagSq>0.0000005 && !(obj2 instanceof Projectile) && !(obj2 instanceof Rocket)) {
              bounce_function(obj, obj2);
            }
            else {
              var larger = obj.mass>obj2.mass?obj:obj2;
              var smaller = obj==larger?obj2:obj;
              var index = obj==larger?j:i;
              // Mass transfer
                // not yet
              //console.log(obj, "consumes", obj2);
              if(larger instanceof Spaceship) {
                smaller.consume(larger);
                destroyObject(larger==obj?i:j);
              } else {
                larger.consume(smaller);
                destroyObject(index);
              }
              //l--;j--;
            } 
          }
        }
      }
      function destroyObject(index) {
        if(!destroy)
          destroy = [];
        destroy.push(index);
      }
      function spawnObject(x,y,mass,vx,vy) {
        var obj = new GravityWell(x,y,mass);
        obj.vx = vx;
        obj.vy = vy;
        //var array = obj.saveToArray();
        //console.log("[WORKER] Created: ", array);
        //self.postMessage({name:"create", data:array.buffer}, [array.buffer]);
        objectMan.addObject(obj);
        return obj;
      }
      
      var sendObjects = null;
      if(performance.now()-lastUpdate>framerate) {
        sendObjects = new Float64Array(objects.length*GravityWell.SAVE_DATA_LENGTH);
        lastUpdate = performance.now();
      } 
  
      for(var i=0,l=objects.length; i<l; i++) {
        var object = objects[i];
        if(object) {
          object.move(dt);
          if(sendObjects) {
            object.saveToArray(i*GravityWell.SAVE_DATA_LENGTH, sendObjects);
          }
        }
      }
      
      if(sendObjects && sendObjects.length>0) {
        self.postMessage({name:"update", data: sendObjects.buffer}, [sendObjects.buffer]);
      }
      
      if(destroy) {
        //var array = new Uint32Array(destroy);
        //console.log("[WORKER->MAIN] Destroy: ",destroy);
        //self.postMessage({name:"destroy", data: array.buffer}, [array.buffer]);
        objectMan.destroyObjects(destroy);
      }
      
     
    }, 5);
  }
  
  var MAX_ID = 0;
  
  var global = self;
  self.addEventListener("message", function(e) {
    var data = e.data.data;
    switch(e.data.name) {
      case "create" : 
          var array = new Float64Array(data);
          var ctors = e.data.constructors;
          //console.log("[MAIN->WORKER] Create objects ", array);
          for(var i=0,l=array.length; i<l; i+=GravityWell.SAVE_DATA_LENGTH) {
              //var obj = new GravityWell();
              var obj = ctors? new global_ctors[ctors[i/GravityWell.SAVE_DATA_LENGTH]]():new GravityWell();
              obj.loadFromArray(i, array); 
              //console.log("[MAIN->WORKER] Create object ",obj);
              //objects.push(obj);
              //MAX_ID = obj.id;
              objectMan.receiveObject(obj);
          }
      break;
      case "speed" : 
          if(typeof data=="number" && data>0) {
            speedRatio = data;
          }
      break;
      case "acceleration" : 
          var array = new Float64Array(data);
          //console.log("Acceleration", array);
          for(var i=0,l=array.length; i<l; i+=3) {
              var id = array[i];
              var obj = objectMan.byId[id];
              /*for(var n=0, nl=objects.length; n<nl; n++) {
                if(objects[n].id==id) {
                  obj = objects[n];
                  break;
                }
              }    */
              if(obj) {
                obj.loadPropertiesFromArray(obj.configurations.acceleration_no_id, i+1, array); 
                //console.log("[MAIN->WORKER] Update acceleration "+obj, obj.configurations.acceleration, array);
              }
          }
      break;
      case "action" : 
          var args = e.data.args;
          var obj = objectMan.byId[e.data.id];
          console.log("Action ",e.data.actionName, "(", args,")");
          if(obj) {
            obj[e.data.actionName].apply(obj, args);
          }
      break;
      case "g-constant" : 
          GravityWell.prototype.G = data;
          console.log("Setting G to: ", data);
      break;
      case "bounce-fn" :
          //console.log("Evaluating code: ", "(()=>{\n"+e.data.fn+"\n  return bounce;\n})()"); 
          bounce_function = eval("(()=>{\n"+e.data.fn+"\n  return bounce;\n})()");
          console.log("Bounce function updated.");
      break;
      default:
        console.error("Unknown message:", e.data.name);
    }
    if(!running && objectMan.array.length>0) {
      runSimulation();
      //RandomAsteroid(objectMan);
    }
  });
  
  function RandomAsteroid(manager) {
    var largestBody = null;
    var largestBodyMass = 0;
    var largestBodyTime = 0;
    var spawnx = 0;
    var spawny = 0;
    function randomize() {
      if(manager.array.length<400) {
        if(largestBody) {
          spawnx = largestBody.x;
          spawny = largestBody.y;
        }
      
        var obj = new GravityWell(spawnx+Math.random()*5000-2500, spawny+Math.random()*5000-2500, Math.random()*1000000+10000);
        obj.vx = (-1*obj.x)/Math.abs(obj.x*300);
        obj.vy = (-1*obj.y)/Math.abs(obj.y*300);
        if(largestBody) {
          var velocity = obj.orbitalVelocityCartesian(largestBody);
          obj.vx = velocity.vx;
          obj.vy = velocity.vy;
        }
        
        //obj.id = ++MAX_ID;
        manager.addObject(obj);
        setTimeout(randomize, Math.round(Math.random()*1000)+500);
      }
      else
        setTimeout(randomize, Math.round(Math.random()*3000)+1000);
      var t = performance.now()
        
      if(largestBody == null || t-largestBodyTime>10000) {
        var ar = manager.array;
        largestBodyTime = t;
        for(var i=0,l=ar.length; i<l; ++i) {
          var b = ar[i];
          var m = b.mass;
          if(m > largestBodyMass) {
            largestBodyMass = m;
            largestBody = b;
          }
        }
      }  
      //obj.saveToArray(0, array);
      //target.postMessage({name:"create", data: array.buffer}, [array.buffer]);
      //objects[obj.id] = obj;
      
    }
    randomize();
  }
  self.postMessage({name:"ready"});
});