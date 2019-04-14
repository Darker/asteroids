define([], ()=> {
  var angle360 = 2 * Math.PI;
  function ai(target) {
    // Some docs:
    /*
      both `target` and `this` are of type GravityWell. They have these relevant properties:
      
        x, y     - x and y offset, read-only for the purpose of this algorithm
        vx, vy   - velocities, also read only
        ax, ay   - acceleration - obviously you cannot change acceleration of the target
        rotation - rotation in radians (readonly)
        rotationSpeed - angular velocity (readonly)
        ar       - angular acceleration - change this to start spinning
        
      Some utility methods like `angleTo` can be seen in GravityWell.js
    */

    var angleCurrent = this.rotation/*+Math.PI/2*/;
    
    var angleTo = this.angleTo(target);
    var relativeAngle = minAbs(angleCurrent-angleTo,
                              angleCurrent-angleTo+angle360,
                              angleCurrent-angleTo-angle360);  
    //this.logThrottle("Shortest angle: ", relativeAngle);
    var abs_relativeAngle = Math.abs(relativeAngle);
    if(abs_relativeAngle>0.005) {
      // recalculate ratio to speed
      this.ar = -(relativeAngle)*5e-6;
      // compensate for existing speed
      if(Math.sign(relativeAngle) == Math.sign(this.rotationSpeed)) {
        this.ar -= this.rotationSpeed/5; 
        this.logThrottle("Rotationg in wrong direction.", this.ar, this.rotationSpeed);  
      }
      else {
        this.ar -= this.rotationSpeed*5e-3; 
        this.logThrottle("Rotationg in right direction.", this.ar, this.rotationSpeed);  
      }
      //this.fuel -= 1;
    }
    else {
      if(this.rotationSpeed>1e-5) {
        this.ar -= this.rotationSpeed/3;
       // this.fuel -= this.ar/5;
        this.logThrottle("Braking rotation.", this.ar, this.rotationSpeed);
      }
      else {
        this.logThrottle("Stable, locked on target.", angleTo, angleCurrent, relativeAngle);
      }
    }
    
    // Ensure the rotation acceleration is within limits
    this.ar = this.ar>0? Math.min(this.ar, 1): Math.max(this.ar, -1);
    
    // forward
    /*if(!this.lastLog || performance.now()-this.lastLog>500) {
      console.log(relativeAngle);
      this.lastLog = performance.now();
    }    */
    
    if(abs_relativeAngle<0.5) {
      // Check what the relative velocity is right now
      //var v_rel = [target.vx-this.vx, 
    
      var angleRatio = Math.min(100, 1/(abs_relativeAngle))/100;
      var magnitude = (angleRatio) * 0.000003;
      //this.logThrottle("Accelerating: ", magnitude, abs_relativeAngle, angleRatio, 1/(abs_relativeAngle));
      this.ax = magnitude*Math.cos(angleCurrent);
      this.ay = magnitude*Math.sin(angleCurrent);
    }
  }
  /**
   * Select smallest number under absolute value, but return original
   * value with sign. Eg.:
   * for [5,-2,-10] returns -2 */       
  function minAbs() {
    var minIndex = 0,
        minValue = Number.MAX_VALUE;
    for(var i=0,l=arguments.length; i<l; i++) {
      var absval = Math.abs(arguments[i]);
      if(absval<minValue) {
        minIndex = i;
        minValue = absval;        
      }
    }
    return arguments[minIndex];    
  } 
  return ai;
});