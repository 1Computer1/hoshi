const { Command } = require('discord-akairo');
const Reputation = require('../../models/reputations');

class AddRepCommand extends Command {
	constructor() {
		super('addRep', {
			aliases: ['add-rep', 'rep', '++'],
			category: 'reputation',
			channel: 'guild',
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: 'Which user do you want to add reputation to?',
						retry: 'Please provide a valid user.'
					}
				},
				{
					id: 'reason',
					match: 'rest'
				}
			],
			description: {
				content: [
					'Adds reputation to someone.',
					'You can only give one rep to a person.',
					'Reusing this command will simply replace the reason.'
				],
				usage: '<user> [reason...]',
				examples: ['@ABC because he is a cool dude', 'Jim#9327']
			}
		});
	}

	async exec(message, { member, reason }) {
		if (message.author.id === member.id) {
			return message.util.reply('You cannot give reputation to yourself!');
		}

		const blacklist = this.client.settings.get(message.guild, 'blacklist', []);
		if (blacklist.includes(message.author.id)) {
			return message.util.reply('You can\'t use this command because you have been blacklisted.');
		}

		const previous = await Reputation.findOne({
			where: {
				sourceID: message.author.id,
				targetID: member.id,
				guildID: message.guild.id
			}
		});

		if (previous) {
			await Reputation.update({ reason }, {
				where: {
					sourceID: message.author.id,
					targetID: member.id,
					guildID: message.guild.id
				}
			});

			const reply = [];
			if (reason) {
				reply.push(`You have updated your reputation to ${member} with the reason: ${reason}`);
			} else {
				reply.push(`You have updated your reputation to ${member}.`);
			}

			if (previous.reason) {
				reply.push(`This replaced the previous reason: ${previous.reason}`);
			}

			return message.util.reply(reply);
		}

		await Reputation.create({
			reason,
			sourceID: message.author.id,
			targetID: member.id,
			guildID: message.guild.id
		});

		if (reason) {
			return message.util.reply(`You have added reputation to ${member} with the reason: ${reason}`);
		}

		return message.util.reply(`You have added reputation to ${member}.`);
	}
}

module.exports = AddRepCommand;
