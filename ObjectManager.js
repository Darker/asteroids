define(["Spaceship"], function(Spaceship) {
  function ObjectManager(remote) {
    this.MAX_ID = 0;
    this.array = [];
    this.byId = {};
    this.remote = remote;
  }
  /**
   * Accepts an array of aray indexes where objects should bedeleted. Returns array of IDs of deleted objects**/
  ObjectManager.prototype.destroyObjects = function(indexes) {
    var ids = [];
    var array = this.array;
    var byId = this.byId;
    for(var i=0,l=indexes.length; i<l; i++) {
      var obj = array[indexes[i]];
      array[indexes[i]] = null;
      //array.splice(indexes[i], 1);
      delete byId[obj.id];
      ids.push(obj.id);
      obj.destroy();
    }
    var array = new Uint32Array(ids);
    //console.log("[WORKER->MAIN] Destroy: ",destroy);
    this.remote.postMessage({name:"destroy", data: array.buffer}, [array.buffer]);
    return ids;
  }
  /*ObjectManager.prototype.destroyObject = function(obj) {
    var index = this.array.indexOf(obj);
    if(index!=-1) {
      delete this.byId[obj.id];
      this.array.splice(index, 1);    
      obj.destroy();
    }
  }    */
  /** Creates new object and pushes it into remote target **/
  ObjectManager.prototype.addObject = function(obj) {
    obj.id = ++this.MAX_ID;
    obj.manager = this;
    this.byId[obj.id] = obj;
    this.array.push(obj);
    var array = obj.saveToArray();
    this.remote.postMessage({name:"create", data: array.buffer, constructors:[obj.constructor.name]}, [array.buffer]);
  }
  /** Assumes an object was received from remote target and adds it to local database **/
  ObjectManager.prototype.receiveObject = function(obj) {
    this.MAX_ID = obj.id;
    obj.manager = this;
    this.byId[obj.id] = obj;
    this.array.push(obj);
    if(obj instanceof Spaceship) {
      console.log("Ship ID: ", obj.id);
    }
  }
  
  return ObjectManager;
});