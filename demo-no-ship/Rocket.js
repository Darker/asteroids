define(["GravityWell", "RocketAIBasic"], function(GravityWell, RocketAI) {
  function Rocket(x,y,mass,texture, stage, target) {
    //var args = Array.prototype.splice.apply(arguments, 0, 0);
    GravityWell.apply(this, arguments);
    // max oeward backward acceleration
    this.mass = 1000;
    this.fuel = 500000;
    this.calculateRadius();
    this.created = performance.now();
    
    this.target = target;// || {x: 0, y:0};
    //this.density = 200;
    //this.calculateRadius();
    //if(this.sprite) {
    //  this.updateSprite();
    //}
  }
  Rocket.prototype = Object.create(GravityWell.prototype);
  Rocket.prototype.constructor = Rocket;
  Rocket.prototype.textureName = "rocket";
  
  Rocket.prototype.isRocket = true;
  Rocket.prototype.move = function(dt) {
    var angle360 = 2*Math.PI;
    
    if(!this.target && this.manager) {
      //this.target = this.manager.array[0];
      var ar = this.manager.array;
      var l = ar.length;
      var threshold = Math.PI/2.6;
      var angleCurrent = this.rotation;
      while(l-->0) {
        var item = ar[l];
        if(item && !(item instanceof Rocket) && this.distSq(item)<1e5) {
          console.log(item, this.distSq(item));
          var angleTo = this.angleTo(item);
          if(Math.min(Math.abs(angleCurrent-angleTo), 
                      Math.abs(angleCurrent-angleTo+angle360),
                      Math.abs(angleCurrent-angleTo-angle360))<threshold) {
                      
             this.target = item;
             break;         
          }
        }
      }
      if(this.target)
        console.log("Locked on ", this.target);
    }
    var target = this.target;
    this.ar = 0;
    this.ax = 0
    this.ay = 0;
    if(this.fuel>0 && target) {
      // rotation
      this.navAI(target);
    }
    else {
      console.error("No target or no fuel!");
      //if(this.manager) {
      //  this.manager.destroyObject(this);
      //}
    }
  
    GravityWell.prototype.move.apply(this,arguments);
  }
  Rocket.prototype.navAI = function() {};
  if(typeof RocketAI=="function") {
    Rocket.prototype.navAI = RocketAI;
  }
  Rocket.prototype.consume = function(obj) {
    console.log(this.constructor.name+"#"+this.id+" destroyed "+obj.constructor.name+"#"+obj.id);
    obj.mass = 0;
    this.mass = 0;
  }
  Rocket.prototype.updateTextureScale = function() {
    var ratio = this.sprite.texture.width/this.sprite.texture.height;
    this.sprite.scale.set(0.05, 0.05);
  }
  

  return Rocket;  
});