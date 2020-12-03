import Discord from "discord.js"
import Client from "../struct/Client"
import Command from "../struct/Command"
import Roles from "../util/roles"
import truncateString from "../util/truncateString"

export default new Command({
    name: "reload",
    aliases: [],
    description: "Reload a command.",
    permission: Roles.BOT_DEVELOPER,
    usage: "<command>",
    async run(client: Client, message: Discord.Message, args: string) {
        const name = args.split(/ +/)[0]
        const command = client.commands.search(name)
        const handler = client.events.get(name)
        if (!command && !handler) {
            const truncated = truncateString(name, 32, "...")
            return message.channel.send({
                embed: {
                    color: client.config.colors.error,
                    description: `Unknown command or event handler \`${truncated}\`.`
                }
            })
        }

        if (handler) {
            client.events.unregisterOne(name)
            client.events.unloadOne(name)
            await client.events.loadOne(name)
            client.events.registerOne(name)
        } else if (command) {
            client.commands.unloadOne(command.name)
            await client.commands.loadOne(command.name)
        }

        const type = command ? "command" : "event handler"
        message.channel.send({
            embed: {
                color: client.config.colors.success,
                description: `Reloaded ${type} \`${name}\`.`
            }
        })
    }
})