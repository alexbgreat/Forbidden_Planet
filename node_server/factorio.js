"use strict";

module.exports = class Server {
  constructor(opts) {

    this.process = undefined
    this.options = Object.assign({
      launch: {
        path: '/opt/factorio/bin/x64/factorio',
        latest: '--start-server-load-latest',
        new: '--start-server-load-scenario',
        name: 'forbidden_planet',
        config: '/opt/factorio/scenarios/forbidden_planet/server-settings.json'
      },
    }, opts)
  }

  start(param = "latest") {
    return new Promise((resolve, reject) => {
      if (!param) reject("no start param")
      const { options } = this
      switch (param) {
        case "new":
          this.process = spawn(options.launch.path, [options.launch.new, options.launch.name, "--server-settings", options.launch.config])
          this._set_triggers(this.process)
          break;
        case "latest":
          this.process = spawn(options.launch.path, [options.launch.latest, "--server-settings", options.launch.config])
          this._set_triggers(this.process)
          break;
        default:
          reject("unknown param");
      }
      resolve("started")
    })
  }

  stop() {
    return new Promise((resolve, reject) => {
      if (!this.process) {
        // messageEmbedded("bananas", "Error", "Server is currently not running", 0xff0000)
        reject("server not running")
        return
      }
      this.process.kill('SIGHUP')
      resolve("stopped")
    })
  }

  online_players() {
    if (!this.process) {
      return false
    }
    this.process.stdin.write(`/silent-command log("[ONLINE] " ..#game.connected_players)\n`)
    return true
  }

  restart() { }

  message(user, text) {
    if (!this.process) {
      return false
    }
    this.process.stdin.write(`/silent-command game.print("[Discord] ${user}: ${text}", { r = 0.4, g = 0.6, b = 1})\n`)
    return true
  }

  _set_triggers(factorio_process) {
    factorio_process.stdout.on("data", process_data);
    factorio_process.on('close', (code) => {
      event.trigger("stop")
    });
    
    factorio_process.on('error', (err) => {
      console.log('Failed to start sub_process.');
    });
    
    process.on('SIGINT', async () => {
      console.log("Caught interrupt signal");
      factorio_process.kill('SIGHUP')
      this.process = undefined
      setTimeout(() => process.exit(), 1000)
    });
        
  }

  process_data(data) {
    console.log(`${data}`)
    const filters = {
      "error": /.*?Error(.*?)/,
      "started": /.*?ServerMultiplayerManager.cpp:705: Matching server connection resumed.*?/,
      "chat_message": /.*\[CHAT\]\s?(.*)/,
      "join": /.*?\[JOIN\]\s?(.*?)/,
      "leave": /.*?\[LEAVE\]\s?(.*?)/,
      "online_players": /.*?Script log.*?\[ONLINE\]\s?(\d+)/
    }
    var match;
    for( var key in filters){
      var temp
      if (temp = filters[key].exec(`${data}`)) {
        match = [key,temp];
      }
    }
    if(!match) return;
    switch (match[0]) {
      case "error":
        console.log(match[1])
        event.trigger("error",match[1])
        //messageEmbedded("bananas", "Error", statusMessages.error.replace('__ERROR__', error[1]), 0xff0000)
        break;
      case "started":
        event.trigger("started")
        break;
      case "chat_message":
        console.log("Chat Message");
        event.trigger("chat_message",match[1])
        break;
      case "join":
        const user = match[1].split(" ")[0]
        event.trigger("player_join", user)
        //joinOrLeaveMessage("bananas", user, "joined")
        break;
      case "leave":
        //const user = leave[1].split(" ")[0]
        //event.trigger("player_leave", user)
      //joinOrLeaveMessage("bananas", user, "left")
      case "online_players":
        console.log("online")
        //messageEmbedded("bananas", "Status", statusMessages.online.replace('__ONLINE__', online[1]), 0x0000ff)
        break;
    }
  }
}
