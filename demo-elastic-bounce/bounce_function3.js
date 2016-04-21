define(['GravityWell', "Projectile", "Spaceship"], function(GravityWell, Projectile, Spaceship) {
//SRC_START
  var cos = Math.cos;
  var sin = Math.sin;
  var atan2 = Math.atan2;
  var sqrt = Math.sqrt;
  var HALF_PI = Math.PI/2;

  function bounce(objectA, objectB) {  
    var avx = objectA.vx;
    var avy = objectA.vy;
    var bvx = objectB.vx;
    var bvy = objectB.vy;
    
    var av_angle = atan2(avy, avx);
    var bv_angle = atan2(bvy, bvx);
    
    var av_size = sqrt(avx*avx + avy*avy);
    var bv_size = sqrt(bvx*bvx + bvy*bvy);
    
    var contact_angle = objectA.angleTo(objectB);
    
    var am = objectA.mass;
    var bm = objectB.mass;
    var amassdiff = am-bm;
    var bmassdiff = -amassdiff;
    var masssum = am+bm;
                        
    var Cr = 0.99999;
    
    function the_x_formula(v1, v2, angle1, angle2, m2, massdiff) {
      return 
        ( 
          ( 
            v1 * cos(angle1-contact_angle) * (massdiff)
            + 
            2*m2*v2*cos(angle2-contact_angle)
          )
          /
          (masssum) 
        )
        *
        cos(contact_angle)
        +
        v1*sin(angle1-contact_angle)*cos(contact_angle + HALF_PI); 
    }
    function the_y_formula(v1, v2, angle1, angle2, m2, massdiff) {
      return 
        ( 
          ( 
            v1 * cos(angle1-contact_angle) * (massdiff)
            + 
            2*m2*v2*cos(angle2-contact_angle)
          )
          /
          (masssum) 
        )
        *
        sin(contact_angle)
        +
        v1*sin(angle1-contact_angle)*sin(contact_angle + HALF_PI); 
    }
  
    objectA.vx = the_x_formula(av_size, bv_size, av_angle, bv_angle, bm, amassdiff);
    objectA.vy = the_y_formula(av_size, bv_size, av_angle, bv_angle, bm, amassdiff);
    objectB.vx = the_x_formula(bv_size, av_size, bv_angle, av_angle, am, bmassdiff);
    objectB.vy = the_y_formula(bv_size, av_size, bv_angle, av_angle, am, bmassdiff);
  }
//SRC_END
  return bounce;
})