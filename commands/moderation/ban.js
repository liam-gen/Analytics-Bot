const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField  } = require('discord.js');
const EmojiManager = require("../../classes/EmojiManager")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
        .setDescriptionLocalizations({
            fr: 'Bannir un utilisateur du serveur',
        })
		.setDescription('Ban a user from the server')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers)
        .addUserOption(option =>
            option.setName('utilisateur')
                .setRequired(true)
                .setDescription('Membre à bannir')),

	async execute(interaction) {
        let start = Date.now();
        await interaction.deferReply({ ephemeral: true });

        interaction.editReply({content: EmojiManager.get("error")+" Cette commande est encore en cours de création :/"})

        /* TODO : Option > Ajouter à la blacklist */
	},
};