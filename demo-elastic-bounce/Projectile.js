define(["GravityWell"], function(GravityWell) {
  function Projectile() {
    //var args = Array.prototype.splice.apply(arguments, 0, 0);
    GravityWell.apply(this, arguments);
    // max oeward backward acceleration
    this.mass = 10000;
    this.calculateRadius();
    this.evaporationSpeed = 0.5;
    this.created = performance.now();
    //this.density = 200;
    //this.calculateRadius();
    //if(this.sprite) {
    //  this.updateSprite();
    //}
  }
  Projectile.prototype = Object.create(GravityWell.prototype);
  Projectile.prototype.constructor = Projectile;
  Projectile.prototype.textureName = "projectile";
  
  Projectile.prototype.isProjectile = true;
  Projectile.prototype.move = function(dt) {
    GravityWell.prototype.move.apply(this,arguments);
    this.mass -= this.evaporationSpeed*dt;
    this.calculateRadius();
  }
  Projectile.prototype.updateTextureScale = function() {
    this.sprite.scale.set(6*this.radius/this.sprite.texture.width,6*(this.radius/this.sprite.texture.height));
  }
  return Projectile;  
});