local config = require "config"
local Event = require "utils.event"

require "surfaces.caverns"
require "surfaces.overworld"
require "utils.player_elevator"

Event.register("player_created", function(event)

    local player = game.players[event.player_index]

    player.teleport({ 0, 0 }, "overworld")
    player.insert { name = "iron-plate", count = 200 }
    player.insert { name = "copper-plate", count = 200 }
    --player.character_mining_speed_modifier = 100
end)