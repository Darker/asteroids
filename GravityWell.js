if(typeof define!="function") {
  var global = self;
  self.define = function(nope, stuff) {
    global.GravityWell = stuff();
  };
}

define([], function() {
  var idS = new UniqueIdGenerator();
  function GravityWell(x,y,mass,texture, stage) {
    // Radians
    this.rotation = 0;
    // Radians/s
    this.rotationSpeed = 0;
    // Rotation acceleration
    this.ar = 0;
    
    this.x = x;
    this.y = y;
    
    this.vx = 0;
    this.vy = 0;
    
    this.ax = 0;
    this.ay = 0;
    
    this.mass = mass;
    this.density = 2650;
    this.calculateRadius();
    
    
    
    this.id = idS.id;
  
    if(texture) {
      this.sprite = new PIXI.Sprite(texture);
      this.updateTextureScale = this.updateTextureScale.bind(this);
      stage.addChild(this.sprite);
      this.updateSprite();
    }
  }
  
  GravityWell.prototype.G = 6.674e-11;
  GravityWell.prototype.hasGravity = true;
  GravityWell.prototype.textureName = "asteroid";
  GravityWell.prototype.acceleration = function(distanceSq, mass) {
    if(distanceSq instanceof GravityWell) {
      mass = distanceSq.mass;
      radius = distanceSq.radius;
      distanceSq = (this.x-distanceSq.x)*(this.x-distanceSq.x)+(this.y-distanceSq.y)*(this.y-distanceSq.y);
    }
    if(distanceSq > 0)
      return (this.G*this.mass*mass) / distanceSq;
    else
      return 0;
  }
  GravityWell.prototype.angleTo = function(object) {
    return Math.atan2(-this.y+object.y, -this.x+object.x);
  }      
  GravityWell.prototype.distSq = function(object) {
    return (this.x-object.x)*(this.x-object.x)+(this.y-object.y)*(this.y-object.y)
  }  
  GravityWell.prototype.accelerate = function(direction, magnitude) {
    var deltaV = magnitude/this.mass;
    
    this.vx += deltaV*Math.cos(direction);
    this.vy += deltaV*Math.sin(direction);
    
    //this.sprite.rotation = direction+Math.PI/2;
  }
  GravityWell.prototype.consume = function(object) {
    if(object.isProjectile) {
      this.mass -= 10000000;
      this.vx += object.vx/(this.mass);
      this.vy += object.vy/(this.mass);
      if(this.isProjectile && object.mass>0) {
        object.consume(this);
      }
    }
    else {
      var total = object.mass+this.mass;
      var thisratio = this.mass/total;
      var objectratio = object.mass/total;
      this.vx = object.vx*objectratio + this.vx*thisratio;
      this.vy = object.vy*objectratio + this.vy*thisratio;
      this.x = object.x*objectratio + this.x*thisratio;
      this.y = object.y*objectratio + this.y*thisratio;
      this.mass = total;
    }
    this.calculateRadius();
    //this.updateSprite();
  }
  /** Gives the given object velocity that is combination of this objects velicoty and the requested vector **/
  /** This method assumes the objects toutch and that the launch direction goes away from this object **/ 
  GravityWell.prototype.launchObject = function(object, vx, vy) {
    object.vx = this.vx + vx;
    object.vy = this.vy + vy;
  }
  GravityWell.prototype.calculateRadius = function() {
    this.radius = Math.cbrt((3*this.mass)/(Math.PI*4*this.density));
    if(this.sprite)
      this.updateTextureScale();
  }
  GravityWell.prototype.move = function(dt) {
    // If acceleration

    this.vx += this.ax*dt;
    this.vy += this.ay*dt;
    
    this.rotationSpeed += this.ar*dt;
    if(this.ar==0 && this.rotationSpeed!=0)
      this.rotationSpeed -= 0.03*this.rotationSpeed;
      //this.rotationSpeed = 0;
    //this.rotationSpeed -= 0.000002*Math.sign(this.rotationSpeed);
  
  
    this.x += this.vx*dt;
    this.y += this.vy*dt;
    this.rotation += this.rotationSpeed*dt;
  
    if(this.sprite) {
      this.sprite.position.x = this.x;
      this.sprite.position.y = this.y;
      this.sprite.rotation = this.rotation;
    }
  }
  /*GravityWell.prototype.rotate = function(dt) {
    this.rotation += this.rotationSpeed*dt;
  
    if(this.sprite) {
      this.sprite.rotation = this.rotation;
    }
  }    */
  
  GravityWell.SAVE_DATA_LENGTH = 9-1;
  GravityWell.prototype.saveToArray = function(offset, array) {
     if(typeof offset=="undefined") {
       offset = 0;
     }
     if(typeof array=="undefined") {
       array = new Float64Array(GravityWell.SAVE_DATA_LENGTH);
     }
  
     array[offset] = this.id;
     array[offset+1] = this.mass;
     array[offset+2] = this.radius;
     array[offset+3] = this.x;
     array[offset+4] = this.y;
     array[offset+5] = this.vx;
     array[offset+6] = this.vy;
     array[offset+7] = this.rotation;
     //array[offset+8] = this.rotationSpeed;
     return array;
  }
  GravityWell.prototype.loadFromArray = function(offset, array) {
     this.id = array[offset];
     this.mass = array[offset+1];
     this.radius = array[offset+2];
     this.x = array[offset+3];
     this.y = array[offset+4];
     this.vx = array[offset+5];
     this.vy = array[offset+6];
     
     this.rotation = array[offset+7];
     
     if(typeof this.rotation!="number") {
       console.log("ERROR: ",offset, array);
       throw new Error("ble");
     }
     //this.rotationSpeed = array[offset+8];
     
     if(this.sprite)
       this.updateSprite();
  }
  GravityWell.prototype.savePropertiesToArray = function(properties, offset, array) {
     if(typeof offset=="undefined") {
       offset = 0;
     }
     if(typeof array=="undefined") {
       array = new Float64Array(properties.length);
     }
  
     for(var i=0,l=properties.length; i<l; i++) {
       array[offset+i] = this[properties[i]];
     }
     return array;
  }
  GravityWell.prototype.loadPropertiesFromArray = function(properties, offset, array) {
     var ar_len = array.length;
     for(var i=0,l=properties.length; i<l && i+offset<ar_len; i++) {
       this[properties[i]] = array[offset+i];
     }
     if(this.sprite)
       this.updateSprite();
  }
  GravityWell.prototype.configurations = {
    acceleration: ["id", "ax", "ay", "ar"],
    acceleration_no_id: ["ax", "ay", "ar"],
  }
  GravityWell.prototype.updateSprite = function() {
    if(this.sprite) {
      this.sprite.rotation = this.rotation;
      this.sprite.position.x = this.x;
      this.sprite.position.y = this.y;
      // center the sprite's anchor point
      this.sprite.anchor.x = 0.5;
      this.sprite.anchor.y = 0.5;
      if(this.sprite.texture.valid)
        this.updateTextureScale();
      else
        this.sprite.texture.on("update", this.updateTextureScale);
    }
  }
  GravityWell.prototype.destroy = function() {
    if(this.sprite) {
      this.sprite.texture.removeListener("update", this.updateTextureScale);
      if(this.sprite.parent)
        this.sprite.parent.removeChild(this.sprite);
    }
  }
  GravityWell.prototype.updateTextureScale = function() {
    this.sprite.scale.set(2*this.radius/this.sprite.texture.width,2*(this.radius/this.sprite.texture.height));
  }
  GravityWell.prototype.toString = function() {
    return JSON.stringify(this);
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

  return GravityWell;
});