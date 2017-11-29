define(['pixi'], function(PIXI) {
  function ObjectDrawer() {
     this.width = this.height = 300;
     this.fitScreen = this.fitScreen.bind(this);
     this.drawLoop = this.drawLoop.bind(this);
     this._zoom = 1;
  }
  
  ObjectDrawer.prototype.constructor = ObjectDrawer;
  ObjectDrawer.PIXI = PIXI;
  ObjectDrawer.prototype.createScreen = function() {
    this.fitScreen();
    this.renderer = PIXI.autoDetectRenderer(this.width, this.height,{backgroundColor : 0x0});  
    window.addEventListener("resize", this.fitScreen);
    document.body.appendChild(this.renderer.view);
    
    // create the root of the scene graph
    this.stage = new PIXI.Container();
    this.stage.interactive = true;
    //this.hud = new PIXI.Container();
    
    this.hud_graphics = new PIXI.Graphics();
    this.stage.addChild(this.hud_graphics);
    // call again to align stage properly
    this.fitScreen();
  }
  ObjectDrawer.prototype.fitScreen = function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    if(this.renderer) {
        this.renderer.resize(this.width = window.innerWidth, this.width = window.innerHeight);
        if(this.stage) {
            this.stage.position.x = this.renderer.width/2;
            this.stage.position.y = this.renderer.height/2;
        }
    }
  }
  ObjectDrawer.prototype.drawLoop = function() {
    if(this.focusPoint) {
      this.stage.pivot.x = this.focusPoint.x;
      this.stage.pivot.y = this.focusPoint.y;
    }
    if(this.onDraw) {
      this.onDraw();
    }
    this.renderer.render(this.stage);
    requestAnimationFrame(this.drawLoop);
  }
  
  Object.defineProperty(ObjectDrawer.prototype, "zoom", {
    get:function( ){return this._zoom;},
    set:function(x){
      this._zoom = x;
      if(this.stage) {
        this.stage.scale.x = x;
        this.stage.scale.y = x;
      }
    }
  });
  
  
  ObjectDrawer.textures = {
    asteroid: PIXI.Texture.fromImage("asteroid.png"),
    spaceship: PIXI.Texture.fromImage("spaceship.png"),
    projectile: PIXI.Texture.fromImage("projectile_circle.png"),
    rocket:  PIXI.Texture.fromImage("rocket.png"),
  }
  
  ObjectDrawer.FocusPoint = function(x, y) {
    if(typeof x=="object" && x.x) {
      y = x.y;
      x = x.x;    
    }
    this.x = x;
    this.y = y;
  }
  ObjectDrawer.FocusPointObject = function(object) {
    this.object = object;
  }
  Object.defineProperty(ObjectDrawer.FocusPointObject.prototype, "x", {
    get:function( ){return this.object.x;},
  });
  Object.defineProperty(ObjectDrawer.FocusPointObject.prototype, "y", {
    get:function( ){return this.object.y;},
  });
  
  return ObjectDrawer;
});