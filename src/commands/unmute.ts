import Client from "../struct/Client"
import Message from "../struct/discord/Message"
import Args from "../struct/Args"
import TimedPunishment from "../entities/TimedPunishment"
import ActionLog from "../entities/ActionLog"
import Command from "../struct/Command"
import Roles from "../util/roles"

export default new Command({
    name: "unmute",
    aliases: [],
    description: "Unmute a member.",
    permission: [Roles.HELPER, Roles.MODERATOR],
    usage: "<member> <reason>",
    async run(this: Command, client: Client, message: Message, args: Args) {
        const user = await args.consumeUser()

        if (!user)
            return message.channel.sendError(
                user === undefined
                    ? "You must provide a user to unmute!"
                    : "Couldn't find that user."
            )

        const reason = args.consumeRest()
        if (!reason) return message.channel.sendError("You must provide a reason!")

        const member = message.guild.member(user)
        if (!member) return message.channel.sendError("The user is not in the server!")

        const mute = await TimedPunishment.findOne({
            where: { member: user.id, type: "mute" }
        })
        if (!mute) return message.channel.sendError("The user is not muted!")

        await mute.undo(client)
        await mute.remove()

        const log = new ActionLog()
        log.action = "unmute"
        log.member = user.id
        log.executor = message.author.id
        log.reason = reason
        log.channel = message.channel.id
        log.message = message.id
        await log.save()

        message.channel.sendSuccess(`Unmuted ${user} (**#${log.id}**).`)
    }
})