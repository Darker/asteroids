function Spaceship() {
  //var args = Array.prototype.splice.apply(arguments, 0, 0);
  GravityWell.apply(this, arguments);
  // max oeward backward acceleration
  this.f_accel = 0.004;
  //this.f_accel = 1;
  this.f_dir = 0; // only -1, 0, 1 for direction of the engine
  // max Rotation acceleration
  //this.r_accel = 0.0000003;
  this.r_accel = 0.0000005;
  this.r_dir = 0; // only -1, 0, 1 for direction of the engine
  
  // Time when forward engine started heating up
  this.f_started = -1;
  // Time when rotation engine started heating up
  this.r_started = -1;
  
  //this.density = 200;
  //this.calculateRadius();
  //if(this.sprite) {
  //  this.updateSprite();
  //}
}
Spaceship.prototype = Object.create(GravityWell.prototype);
Spaceship.prototype.constructor = Spaceship;
Spaceship.prototype.textureName = "spaceship";

Spaceship.prototype.forwardEngine = function(state) {
  if(state!=0) {
    this.f_started = performance.now();
    this.f_dir = state>0?1:-1;
  }
  else {
    //this.f_started = -1;
    this.f_dir = 0;
  }
}
Spaceship.prototype.rotationEngine = function(state) {
  if(state!=0) {
    this.r_started = performance.now();
    this.r_dir = state>0?1:-1;
  }
  else {
    //this.r_started = -1;
    this.r_dir = 0;
  }
}

Spaceship.prototype.recalculateAcceleration = function() {
  var dt;
  var changed = false;
  
  if(this.f_dir!=0) {
    var direction = this.rotation+Math.PI/2;
    var now = performance.now();
    dt = now-this.f_started;
    var magnitude = Math.min(dt/15000,1)*this.f_accel*this.f_dir;
    //magnitude = this.f_accel*this.f_dir;
    
    
    this.ax = magnitude*Math.cos(direction);
    this.ay = magnitude*Math.sin(direction);
    //console.log("Acceleration forward (dir: "+(direction/Math.PI*180)+"°): ", magnitude, [this.ax, this.ay]);
    
    changed = true;
  }
  else if(this.f_started!=-1) {
    this.f_started = -1;
    this.ax = 0;
    this.ay = 0;
    changed = true;
  }
  
  
  if(this.r_dir!=0) {
    var now = performance.now();
    dt = now-this.r_started;
    var magnitude = (-0.5/(dt+0.5)+1)*this.r_accel*this.r_dir;
    
    this.ar = this.r_accel*this.r_dir;//magnitude;
    changed = true;
  } 
  else if(this.r_started!=-1) {
    this.r_started = -1;
    this.ar = 0;
    changed = true;
  }
  
  return changed;  
}

Spaceship.prototype.shoot = function() {
  var angle = this.rotation+Math.PI/2;
  var obj = new Projectile(this.x-(this.radius+5)*Math.cos(angle), this.y-(this.radius+5)*Math.sin(angle), 1000);
  
  //var speed = -0.1;
  var speed = -0.2;
  var vx = speed*Math.cos(angle);
  var vy = speed*Math.sin(angle);
  this.launchObject(obj, vx, vy);
  
  //var array = obj.saveToArray();
  //console.log("Projectile: ", [obj.x, obj.y], "Ship: ", [this.x, this.y]);
  //worker.postMessage({name:"create", data: array.buffer, constructors:["Projectile"]}, [array.buffer]);   
  this.manager.addObject(obj);
}
Spaceship.prototype.updateTextureScale = function() {
  var size = Math.max(5*this.radius,15);

  this.sprite.scale.set(size/this.sprite.texture.width,size/this.sprite.texture.height);
}