const { Client, RichEmbed } = require('discord.js');
const Event = require('event.js');
const Server = require('factorio.js');

const client = new Client();
const Server = new Server();

const auth = require('./auth')

const escapeString = message => {

  let escaped = message.replace(/\n/g, "")
  escaped = escaped.replace(/(["'\\])/g, "\\$1")
  return escaped
}


const event = new Event()

client.login(auth.token);


const messageEmbedded = (channelName, title, message, color = 0xff0000) => {

  const bananas = client.channels.find(channel => channel.name === channelName)
  if (!bananas) return

  const embed = new RichEmbed()
    .setTimestamp()
    .setTitle(`**${title}**`)
    .setColor(color)
    .setDescription(message)
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
    usage: "!start latest"
  },
  stop: {
    params: "",
    info: "stops the server",
    usage: "!stop"
  },
  restart: {
    params: "*<**new** | **latest**>* *default:* **latest**",
    info: "restarts the server",
    usage: "!restart"
  }
}
const printHelp = (channelName) => {
  const bananas = client.channels.find(channel => channel.name === channelName)
  if (!bananas) return


  let string = ""

  for (let [name, value] of Object.entries(commands)) {
    string += `**!${name}** ${value.params}\n\t↳ ${value.info}\n\t↳ Usage: \`${value.usage}\`\n\n`
  }
  messageEmbedded("bananas", "Commands", string, 0xaa55ff)

}


const statusMessages = {
  start: `Server was **Started** by __USER__`,
  stop: `Server was **Stopped** by __USER__`,
  restart: `Server was **Restarted** by __USER__`,
  update: `Server was **Updated** to __VERSION__ by __USER__`,
  online: `Players **Online** __ONLINE__`,
  error: `\`\`\`__ERROR__\`\`\``
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

const server = new Server()


client.on('message', async message => {

  if (message.author.bot) return
  if(message.type != "DEFAULT") return
  if(message.channel.name !== "bananas") return
  const messageAuthor = message.author.username



  if (message.content.startsWith('!')) {
    if (message.content.startsWith('!help'))
      printHelp("bananas")

    if (!message.member.roles.find(r => (r.name === "Administrator" || r.name === "Moderator"))) {
      message.reply("You don't have permissions to run that command :(")
      return
    }

    const param = message.content.split(/\s/g)[1]
    if (message.content.startsWith('!online')) {
      server.online_players()
    } else if (message.content.startsWith('!start')) {

      event.register("started", () => {
        messageEmbedded("bananas", "Status", statusMessages.start.replace('__USER__', messageAuthor), 0x00ff00)
      })

      await server.start("new")
      
    } else if (message.content.startsWith('!stop')) {

      await server.stop()
      event.register("stop", () => {
        messageEmbedded("bananas", "Status", statusMessages.stop.replace('__USER__', messageAuthor), 0xff0000)
      })

      
    } else if (message.content.startsWith('!restart')) {
      messageEmbedded("bananas", "Status", statusMessages.restart.replace('__USER__', messageAuthor), 0xffff00)
    }
  } else {
    
    const text = escapeString(message.cleanContent)
    server.message(message.author.username,text)

  }
})