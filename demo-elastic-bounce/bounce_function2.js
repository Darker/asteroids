// Do not change the function name or it won't work!
// All changes are saved in localStorage["bounce_function"] instantly
// to reset the editor to default, use `delete localStorage["bounce_function"]`.
function bounce(a, b) {  
  var avx = a.vx;
  var avy = a.vy;
  var bvx = b.vx;
  var bvy = b.vy;
  
  var av = {x: avx, y: avy};
  var bv = {x: bvx, y: bvy};
  
  var am = a.mass;
  var bm = b.mass;
  var amassdiff = am-bm;
  var bmassdiff = -amassdiff;
  var masssum = am+bm;
  
  var impulse = vector_normalize({x: a.x-b.x, y: a.y-b.y});
  
  console.log("impulse: ", impulse);
  var x1, v1x, v1y;
  x1 = vector_dot(impulse, av);
  v1x = vector_multiply_scalar(impulse, x1);
  v1y = vector_subtract(av, v1x);
  
  console.log("x1, v1x, v1y: ", x1, v1x, v1y);
  
  var x2, v2x, v2y;
  impulse = vector_multiply_scalar(impulse, -1);
  x2 = vector_dot(impulse, bv);
  v2x = vector_multiply_scalar(impulse, x2);
  v2y = vector_subtract(av, v2x);
  
  
  
  var Cr = 0.99999;
  
  function the_a_formula(v1x, v2x, v1y) {
    return v1x*amassdiff/masssum + v2x*(2*bm)/masssum + v1y;
  }
  function the_b_formula(v1x, v2x, v2y) {
    return v1x*(2*am)/masssum + v2x*(amassdiff)/masssum + v2y;
  }
  
  a.vx = the_a_formula(v1x.x, v2x.x, v1y.x);
  a.vy = the_a_formula(v1x.y, v2x.y, v1y.y);
  b.vx = the_b_formula(v1x.x, v2x.x, v2y.x);
  b.vy = the_b_formula(v1x.y, v2x.y, v2y.y);
  console.log("After collision: ", [a.vx, a.vy], [b.vx, b.vy]);
}
// http://c2.com/cgi/wiki?DotProductInManyProgrammingLanguages
// not used actually
function vector_dot(a,b) {
  var n = 0;//,// lim = Math.min(a.length,b.length);
  n += a.x * b.x;
  n += a.y * b.y;
  return n;
}
function vector_normalize(a) {
  var len = Math.sqrt(a.x*a.x + a.y*a.y);
  return {x:a.x/len, y: a.y/len};
}
/**
 * Cross product **/
function vector_multiply(a, b) {
  return {x: a.x*b.x, y: a.y*b.y};
}

function vector_multiply_scalar(a, scalar) {
  return {x: a.x*scalar, y: a.y*scalar};
}

function vector_subtract(a, b) {
  return {x: a.x-b.x, y: a.y-b.y};
}

