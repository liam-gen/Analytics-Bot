const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField  } = require('discord.js');
const EmojiManager = require("../../classes/EmojiManager")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('analyse')
		.setDescription('Analyse la sécurité du serveur')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addRoleOption(option =>
            option.setName('role_membre')
                .setRequired(false)
                .setDescription('Rôle de membre (par defaut: everyone)')),

	async execute(interaction) {
        let start = Date.now();
        await interaction.deferReply({ ephemeral: true });

        let score = 0;
        let steps = 4;

        let securityLevel = interaction.guild.verificationLevel;
        let isLevelSecure = securityLevel >= 2;
        score += isLevelSecure ? 1 : 0;

        let levels = ["Faible", "Moyen", "Elevé", "Maximum"]

        let memberRole = interaction.options.getRole("role_membre") ? interaction.options.getRole("role_membre") : interaction.guild.roles.everyone;

        let channels = interaction.guild.channels.cache.filter(channel => {
            const canSpeak = memberRole.permissionsIn(channel).has(PermissionsBitField.Flags.SendMessages);
            const canView = memberRole.permissionsIn(channel).has(PermissionsBitField.Flags.ViewChannel);

            return channel.type == 0 && channel.rateLimitPerUser == 0 && canSpeak && canView;
        });
        let isChannelsSecure = channels.size == 0;
        score += isChannelsSecure ? 1 : 0;

        let roles = interaction.guild.roles.cache.filter(role => role.mentionable == true);
        let isRolesSecure = roles.size == 0;
        score += isRolesSecure ? 1 : 0;

        let bots = interaction.guild.members.cache.filter(member => member.user.bot && !(member.presence ? member.presence.status : false));
        let isBotsSecure = bots.size == 0;
        score += isBotsSecure ? 1 : 0;

        const exampleEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("Analytic's | Analyse complète")
        .setThumbnail('https://i.imgur.com/doQEqty.png')
        .addFields(
            { name: (isLevelSecure ? EmojiManager.get("success") : EmojiManager.get("danger"))+' Niveau de sécurité', value: "```"+levels[securityLevel-1]+"```" },
            { name: (isChannelsSecure ? EmojiManager.get("success") : EmojiManager.get("warning"))+' Salons dans lequels le spam est possible', value: isChannelsSecure ? "```Aucun salon où le spam est possible.```" : channels.map(channel => "<#"+channel.id+">").join(", ") },
            { name: (isRolesSecure ? EmojiManager.get("success") : EmojiManager.get("warning"))+' Rôles mentionnables', value: isRolesSecure ? "```Aucun rôle mentionnable.```" : roles.map(role => "<@&"+role.id+">").join(", ") },
            { name: (isBotsSecure ? EmojiManager.get("success") : EmojiManager.get("warning"))+' Robots hors-ligne', value: isBotsSecure ? "```Aucun robot hors-ligne.```" : bots.map(bot => "<@"+bot.id+">").join(", ") },
            { name: (score == steps ?EmojiManager.get("success") : ( score > steps/2 ? EmojiManager.get("warning") : EmojiManager.get("danger")))+' Score', value: "```"+score+"/"+steps+(score == steps ? " 🎉" :"")+"```" },
        )
        .setTimestamp()
        .setFooter({ text: 'Analyse en '+((Date.now() - start)/1000).toFixed(2)+"s"});

        await interaction.editReply({ embeds: [exampleEmbed] })
	},
};