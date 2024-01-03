const { Events } = require('discord.js');
const {CacheManager} = require("../classes/CacheManager")
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {

		let cm = new CacheManager();
		// Vider le cache toutes les heures
		cm.clear()

		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: "Une erreur s'est produite lors de l'éxécution de cette commande", ephemeral: true });
			} else {
				await interaction.reply({ content: "Une erreur s'est produite lors de l'éxécution de cette commande", ephemeral: true });
			}
		}
	},
};