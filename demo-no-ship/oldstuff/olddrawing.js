    var width = window.innerWidth;
    var height = window.innerHeight;
    
    var renderer = PIXI.autoDetectRenderer(width, height,{backgroundColor : 0x0});  
    window.addEventListener("resize", function() {
      renderer.resize(width = window.innerWidth, height = window.innerHeight);
    });
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