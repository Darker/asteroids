    /** objectA and objectB have following properties:
     *   vx, vy - speed in x and y direction
     *   x, y   - position
     *   mass   - masss
     *   radius - diameter, calculated from mass
     *            using average rock density according to wikipedia
   ***/  
  
    // Colision point as seen from B's perspective  
    var collision = [objectA.x-objectB.x, objectA.y-objectB.y];
    var distance = Math.sqrt(collision[0]*collision[0] + collision[1]*collision[1]);
    
    collision[0] /= distance;
    collision[1] /= distance;
    
    var aci = objectA.vx* collision[0] + objectA.vy* collision[1]; 
    var bci = objectB.vx* collision[0] + objectB.vy*collision[1]; 
    
    var totalMass = objectA.mass + objectB.mass;
    // This is what I had to add since the original answer doesn't account for mass
    var acf = bci * objectB.mass/totalMass;
    var bcf = aci * objectA.mass/totalMass;
    
    // I put velocities in arrays in case I wanted to apply more changes
    // I mean I need to apply some changes, but I don't know what changes exactly
    // to make this crap of code work
    var v1 = [(acf-aci) * collision[0], (acf-aci) * collision[1]]; 
    var v2 = [(bcf-bci) * collision[0], (bcf-bci) * collision[1]];     
  
    
    // Addition sure works better than assignment, but I encourage to try it for
    // the lulz
    objectA.vx += v1[0];
    objectA.vy += v1[1];
    objectB.vx += v2[0];
    objectB.vy += v2[1];