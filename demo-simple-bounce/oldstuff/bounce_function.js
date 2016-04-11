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
  
    
  
    objectA.vx = (avx * amassdiff + (2 * bm * bvx)) / masssum;
    objectA.vy = (avy * amassdiff + (2 * bm * bvy)) / masssum;
    objectB.vx = (bvx * bmassdiff + (2 * am * avx)) / masssum;
    objectB.vy = (bvy * bmassdiff + (2 * am * avy)) / masssum;
    
    objectA.x += objectA.vx;//
    objectA.y += objectA.vy;
    objectB.x += objectB.vx;
    objectB.y += objectB.vy;
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