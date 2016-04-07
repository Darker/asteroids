importScripts("GravityWell.js");
importScripts("Spaceship.js");
importScripts("Projectile.js");

importScripts("ObjectManager.js");

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
    for(var i=0,l=objects.length; i<l; i++) {
      var obj = objects[i]; 
      
      if(obj.mass<=0) {
        destroyObject(i);
        continue;
      }
      // noclip means object can pass through other objs
      //if(obj.noclip && now-obj.noclip<0)
      //  continue;
      for(var j=i+1,l=objects.length; j<l; j++) {
        
        var obj2 = objects[j];
        if(obj2.mass<=0) {
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
          var a = obj.acceleration(distSq, obj2.mass);
          if(a!=0) {
            a *= dt;
            var angle = obj.angleTo(obj2);
            obj.accelerate(angle, a);
            objects[j].accelerate(angle+Math.PI, a);
          }
        }
        else {
          // Consume or split an object
          var hitVelocity = [obj.vx-obj2.vx, obj.vy-obj2.vy];
          var hitVelocityMagSq = hitVelocity[0]*hitVelocity[0]+hitVelocity[1]*hitVelocity[1];
          //console.log("Hit velocity squared: ", hitVelocityMagSq, " Mass: ", obj2.mass*obj2.mass/100000000000);
          // hitVelocityMagSq>obj2.mass*obj2.mass/100000000000 && obj2.mass>800
          if(hitVelocityMagSq>0.00005 && !(obj2 instanceof Projectile)) {
          
            // Object's relative velocity is reduced by the impact
            // deeper the objects are stuck, the harder slow down
            var impact_area = Math.max((radiusSum-dist)/(radiusSum),0.1);
            obj.vx -= hitVelocity[0]*impact_area;
            obj.vy -= hitVelocity[1]*impact_area;
            
            obj2.vx += hitVelocity[0]*impact_area;
            obj2.vy += hitVelocity[1]*impact_area;
            
            //console.log("Impact area: ", impact_area);
            //destroyObject(i, objects, obj2);
            //l--;j--;//i--;
            
            //var hitVelocity = Math.sqrt(hitVelocityMagSq);
            
            //var randomSpawns = 2; //Math.ceil(Math.random()*3+3);
            //var mass = obj2.mass/randomSpawns;
            
            //console.log("Spawns: ", randomSpawns);
            
            var collision = [obj.x-obj2.x, obj.y-obj2.y];
            var radiusRatio = obj.radius/(radiusSum)+1;
            
            var collisionPoint = [(obj.x+obj2.x)/radiusRatio, (obj.y+obj2.y)/radiusRatio];
            var distance = Math.sqrt(collision[0]*collision[0] + collision[1]*collision[1]);
            
            collision[0] /= distance;
            collision[1] /= distance;
            
            var aci = obj.vx* collision[0] + obj.vy* collision[1]; 
            var bci = obj2.vx*collision[0] + obj2.vy*collision[1]; 
            
            var totalMass = obj.mass + obj2.mass;
            
            var acf = bci * obj2.mass/totalMass;
            var bcf = aci * obj.mass/totalMass;
            
            //obj.vx =
            var v1 = [(acf-aci) * collision[0], (acf-aci) * collision[1]]; 
            var v2 = [(bcf-bci) * collision[0], (bcf-bci) * collision[1]];
            //console.log(v);       

            
            // bounce velocity
            obj.vx += v1[0];
            obj.vy += v1[1];
            obj2.vx += v2[0];
            obj2.vy += v2[1];
            
            function destroyInPieces(object, velocity, index) {
              destroyObject(index, objects, object);
              /*l--;j--;
              if(object==obj) {
                i--;
              }     */
            
              var numPieces = 2;
              var massPerPiece = object.mass/numPieces;
              velocity[0] *= 0.8;
              velocity[1] *= 0.8;
              for(var n=0; n<numPieces && n<10; n++) {
              //+/*(Math.random()*10)*velocity[0]*/
                var obj = spawnObject(object.vx+(Math.random()*2*object.radius-object.radius), object.vy+(Math.random()*2*object.radius-object.radius), massPerPiece, object.vx+velocity[0], object.vy+velocity[1]);
                //obj.noclip = 50*speedRatio;
              }
            }
            /*
            if(hitVelocityMagSq>obj.mass/100000000000) {
              if(obj2.mass/obj.mass>100) {
                obj.consume(obj2);
                destroyObject(j, objects, obj2);
                l--;j--;
              }
              else {
                destroyInPieces(obj, v1, i);
              }
            }
            if(hitVelocityMagSq>obj2.mass/100000000000) {
              destroyInPieces(obj2, v2, j);
            }   
            */
          }
          else {
            var larger = obj.mass>obj2.mass?obj:obj2;
            var smaller = obj==larger?obj2:obj;
            // Mass transfer
              // not yet
            //console.log(obj, "consumes", obj2);
            if(obj instanceof Spaceship) {
              obj2.consume(obj);
              destroyObject(i);
            } else {
              obj.consume(obj2);
              destroyObject(j);
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
      object.move(dt);
      if(sendObjects) {
        object.saveToArray(i*GravityWell.SAVE_DATA_LENGTH, sendObjects);
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
            var obj = ctors? new global[ctors[i/GravityWell.SAVE_DATA_LENGTH]]():new GravityWell();
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
    default:
      console.error("Unknown message:", e.data.name);
  }
  if(!running && objectMan.array.length>0) {
    runSimulation();
    RandomAsteroid(objectMan);
  }
});

function RandomAsteroid(manager) {
  function randomize() {
    if(manager.array.length<500) {
      var obj = new GravityWell(Math.random()*5000-2500, Math.random()*5000-2500, Math.random()*1000000+10000);
      obj.vx = (-1*obj.x)/Math.abs(obj.x*300)+Math.random()*0.001;
      obj.vy = (-1*obj.y)/Math.abs(obj.y*300)+Math.random()*0.001;
      //obj.id = ++MAX_ID;
      manager.addObject(obj);
      setTimeout(randomize, Math.round(Math.random()*1000)+500);
    }
    else
      setTimeout(randomize, Math.round(Math.random()*3000)+1000);
    //obj.saveToArray(0, array);
    //target.postMessage({name:"create", data: array.buffer}, [array.buffer]);
    //objects[obj.id] = obj;
    
  }
  randomize();
}

