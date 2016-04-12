define(['GravityWell', "Projectile", "Spaceship"], function(GravityWell, Projectile, Spaceship) {
//SRC_START
  function bounce(objectA, objectB) {  
    var avx = objectA.vx;
    var avy = objectA.vy;
    var bvx = objectB.vx;
    var bvy = objectB.vy;
    
    var am = objectA.mass;
    var bm = objectB.mass;
    var amassdiff = am-bm;
    var bmassdiff = -amassdiff;
    var masssum = am+bm;
  
    var Cr = 0.75;
    
    function the_a_formula(u_a, u_b) {
      return (Cr * bm *(u_b-u_a)+am*u_a+bm*u_b) / masssum;
    }
    function the_b_formula(u_a, u_b) {
      return (Cr * am *(u_a-u_b)+am*u_a+bm*u_b) / masssum;
    }
  
    objectA.vx = the_a_formula(avx, bvx);
    objectA.vy = the_a_formula(avy, bvy);
    objectB.vx = the_b_formula(avx, bvx);
    objectB.vy = the_b_formula(avy, bvy);
  }
  // http://c2.com/cgi/wiki?DotProductInManyProgrammingLanguages
  // not used actually
  function dotproduct(a,b) {
    var n = 0, lim = Math.min(a.length,b.length);
    for (var i = 0; i < lim; i++)
      n += a[i] * b[i];
    return n;
  }
//SRC_END
  return bounce;
})