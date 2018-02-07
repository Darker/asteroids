           
              // Object's relative velocity is reduced by the impact
              // deeper the objects are stuck, the harder slow down
              var impact_area = Math.max((radiusSum-dist)/(radiusSum),0.1);
              obj.vx -= hitVelocity[0]*impact_area;
              obj.vy -= hitVelocity[1]*impact_area;
              
              obj2.vx += hitVelocity[0]*impact_area;
              obj2.vy += hitVelocity[1]*impact_area;
              
              //console.log("Impact area: ", impact_area);
              //destroyObject(i, objects, obj2);
              //l--;j--;//i--;
              
              //var hitVelocity = Math.sqrt(hitVelocityMagSq);
              
              //var randomSpawns = 2; //Math.ceil(Math.random()*3+3);
              //var mass = obj2.mass/randomSpawns;
              
              //console.log("Spawns: ", randomSpawns);
              
              var collision = [obj.x-obj2.x, obj.y-obj2.y];
              var radiusRatio = obj.radius/(radiusSum)+1;
              
              var collisionPoint = [(obj.x+obj2.x)/radiusRatio, (obj.y+obj2.y)/radiusRatio];
              var distance = Math.sqrt(collision[0]*collision[0] + collision[1]*collision[1]);
              
              collision[0] /= distance;
              collision[1] /= distance;
              
              var aci = obj.vx* collision[0] + obj.vy* collision[1]; 
              var bci = obj2.vx*collision[0] + obj2.vy*collision[1]; 
              
              var totalMass = obj.mass + obj2.mass;
              
              var acf = bci * obj2.mass/totalMass;
              var bcf = aci * obj.mass/totalMass;
              
              //obj.vx =
              var v1 = [(acf-aci) * collision[0], (acf-aci) * collision[1]]; 
              var v2 = [(bcf-bci) * collision[0], (bcf-bci) * collision[1]];
              //console.log(v);       
  
              
              // bounce velocity
              obj.vx += v1[0];
              obj.vy += v1[1];
              obj2.vx += v2[0];
              obj2.vy += v2[1];
              
              function destroyInPieces(object, velocity, index) {
                destroyObject(index, objects, object);
                /*l--;j--;
                if(object==obj) {
                  i--;
                }     */
              
                var numPieces = 2;
                var massPerPiece = object.mass/numPieces;
                velocity[0] *= 0.8;
                velocity[1] *= 0.8;
                for(var n=0; n<numPieces && n<10; n++) {
                //+/*(Math.random()*10)*velocity[0]*/
                  var obj = spawnObject(object.vx+(Math.random()*2*object.radius-object.radius), object.vy+(Math.random()*2*object.radius-object.radius), massPerPiece, object.vx+velocity[0], object.vy+velocity[1]);
                  //obj.noclip = 50*speedRatio;
                }
              }
              /*
              if(hitVelocityMagSq>obj.mass/100000000000) {
                if(obj2.mass/obj.mass>100) {
                  obj.consume(obj2);
                  destroyObject(j, objects, obj2);
                  l--;j--;
                }
                else {
                  destroyInPieces(obj, v1, i);
                }
              }
              if(hitVelocityMagSq>obj2.mass/100000000000) {
                destroyInPieces(obj2, v2, j);
              }   
              */