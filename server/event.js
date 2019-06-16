module.exports = class Event{
    constructor(){
      this.events = {};
    }
  
    register(name, callback){
      this.events[name] = callback;
    }
  
    trigger(name,data){
      console.log(`trigger: ${name}`);
      if(this.events[name])
        this.events[name](data);
    }

    trigger(name){
      console.log(`trigger: ${name}`);
      if(this.events[name])
        this.events[name]();
    }
};

global.event = new module.exports();
