const { Client, RichEmbed, Attachment  } = require('discord.js');
const fs = require("fs")
const Event = require('event.js');
const Server = require('factorio.js');

const client = new Client();
const server = new Server();

const auth = require('./auth')

const escapeString = message => {

  let escaped = message.replace(/\n/g, "")
  escaped = escaped.replace(/(["'\\])/g, "\\$1")
  return escaped
}


const event = new Event()

client.login(auth.token);

const rawMessage = (channelName, message) => {
  const bananas = client.channels.find(channel => channel.name === channelName)
  if (!bananas) return
  bananas.send(message)
}

const messageEmbedded = (channelName, title, message, color = 0xff0000, attachment) => {

  const bananas = client.channels.find(channel => channel.name === channelName)
  if (!bananas) return

  const embed = new RichEmbed()
    .setTimestamp()
    .setTitle(`**${title}**`)
    .setColor(color)
    .setDescription(message)

  if(attachment)
    bananas.send(embed.attachFile(attachment))
  else
    bananas.send(embed)
}


const joinOrLeaveMessage = (channelName, user, joinOrLeave) => {
  const bananas = client.channels.find(channel => channel.name === channelName)
  if (!bananas) return
  bananas.send(`**⟶ ${user} ${joinOrLeave} the server ⟵**`)
}

const chatMessage = (channelName, user, message) => {
  const bananas = client.channels.find(channel => channel.name === channelName)
  if (!bananas) return

  const msg = `**${user}** *${message}*`
  bananas.send(msg)

}


const commands = {
  start: {
    params: "*<**new** | **latest**>* *default:* **latest**",
    info: "starts the server",
    usage: "!start latest",
    permissions: "@Trusted"
  },
  stop: {
    params: "",
    info: "stops the server",
    usage: "!stop",
    permissions: "@Moderator"
  },
  restart: {
    params: "*<**new** | **latest**>* *default:* **latest**",
    info: "restarts the server",
    usage: "!restart",
    permissions: "@Moderator"
  },
  online: {
    params: "",
    info: "Logs the current online player count",
    usage: "!online",
    permissions: "@Everyone"
  },
  server: {
    params: "",
    info: "List server information",
    usage: "!server",
    permissions: "@Everyone"
  },
  kick: {
    params: "*<**name**>*",
    info: "Kicks a player from the server",
    usage: "!kick Banana",
    permissions: "@Moderator"
  },
  ban: {
    params: "*<**name**>*",
    info: "Bans a player from the server",
    usage: "!ban Banana",
    permissions: "@Moderator"
  },
  unban: {
    params: "*<**name**>*",
    info: "Un-bans a player from the server",
    usage: "!unban Banana",
    permissions: "@Moderator"
  },
  promote: {
    params: "*<**name**>*",
    info: "Promotes a in-game player to *Admin*",
    usage: "!promote Banana",
    permissions: "@Administrator"
  },
  demote: {
    params: "*<**name**>*",
    info: "Demotes a in-game player",
    usage: "!demote Banana",
    permissions: "@Administrator"
  },
}
const printHelp = (channelName) => {
  const bananas = client.channels.find(channel => channel.name === channelName)
  if (!bananas) return


  let string = ""

  for (let [name, value] of Object.entries(commands)) {
    string += `**!${name}** ${value.params}\n\t↳ ${value.info}\n\t↳ Usage: \`${value.usage}\`\n↳Permissions: **${value.permissions}**\n\n`
  }
  messageEmbedded("bananas", "Commands", string, 0xaa55ff)

}


const statusMessages = {
  start: `Server was **Started** by __USER__`,
  stop: `Server was **Stopped** by __USER__`,
  restart: `Server was **Restarted** by __USER__`,
  update: `Server was **Updated** to __VERSION__ by __USER__`,
  online: `Players **Online** __ONLINE__`,
  error: `The server has crashed!\n\`\`\`__ERROR__\`\`\`\n`
}

/*
setTimeout(() => {
  messageEmbedded("announcements",statusMessages.start.replace('__USER__', 'Decu'), 0x00ff00)
  messageEmbedded("announcements",statusMessages.stop.replace('__USER__', 'Decu'), 0xff0000)
  messageEmbedded("announcements",statusMessages.restart.replace('__USER__', 'Decu'), 0xffff00)
  messageEmbedded("announcements",statusMessages.update.replace('__USER__', 'Decu').replace('__VERSION__', '*0.17.49*'), 0xff00ff)
  messageEmbedded("announcements",statusMessages.online.replace('__ONLINE__', 12), 0x0000ff)
}, 1000)


setInterval(() => joinOrLeaveMessage("bananas"), 5000)
setInterval(() => chatMessage("bananas"), 2500)
*/
const { spawn, exec } = require('child_process');
const readline = require('readline');

client.on('message', process_message);

function process_message(message) {

    if (message.author.bot) return
    if(message.type != "DEFAULT") return
    if(message.channel.name !== "bananas") return
    const messageAuthor = message.author.username

    if (message.content.startsWith('!')) {
      if (!message.member.roles.find(r => (r.name === "Administrator" || r.name === "Moderator"))) {
        message.reply("You don't have permissions to run that command :(")
        return
      }
    }
  
    const line = message.content.split(/\s/g)
    const command = line[0]
    const param = line[1]
      
  
      switch(command){
        case '!help':
          printHelp("bananas")
          break;
        case '!online':
          if(!server.online)
            messageEmbedded("bananas", "Error", "Server is currently not running", 0xff0000)
          else
          server.online_players()
          break;
        case '!start':
          event.register("started", () => {
            messageEmbedded("bananas", "Status", statusMessages.start.replace('__USER__', messageAuthor), 0x00ff00)
          });
          await server.start("new")
          break;
        case '!stop':
          event.register("stop", () => {
            messageEmbedded("bananas", "Status", statusMessages.stop.replace('__USER__', messageAuthor), 0xff0000)
          });
          await server.stop()
          break;
        case '!restart':
          MessageEmbedded("bananas", "Status", statusMessages.restart.replace('__USER__', messageAuthor), 0xffff00)
          break;
        default:
          if(!server.online) return
          server.message(message.author.username,text)
          break
      }
} 
