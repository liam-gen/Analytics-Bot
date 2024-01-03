const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField  } = require('discord.js');
const {GuildScanner} = require("../../classes/GuildScanner")
const JSONdb = require('simple-json-db');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('secure')
		.setDescription('Sécuriser automatiquement votre serveur serveur')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addStringOption(option =>
            option.setName('id')
                .setRequired(false)
                .setDescription("Identifiant de l'analyse"))
        .addRoleOption(option =>
            option.setName('role_membre')
                .setRequired(false)
                .setDescription('Rôle de membre (par defaut: everyone)'))
        .addBooleanOption(option => 
            option.setName("offline_bots")
            .setDescription("Expluser les bots hors ligne")
            .setRequired(false))
        .addBooleanOption(option => 
            option.setName("kick_members")
            .setDescription("Expluser les membres avec un score en dessous de 10")
            .setRequired(false)
        ),

	async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        

        let securityLevel = interaction.guild.verificationLevel;
        let levels = ["Faible", "Moyen", "Elevé", "Maximum"];
        if(securityLevel < 2)
        {
            try{
                interaction.guild.setVerificationLevel(2, "Ajustement automatique by Analytic's")
                changements.push("Changement du niveau de sécurité de "+levels[securityLevel - 1]+" vers Moyen")
            }
            catch(e){
                changements.push("ERREUR lors du changement du niveau de sécurité de "+levels[securityLevel - 1]+" vers Moyen")
            }
        }

        let memberRole = interaction.options.getRole("role_membre") ? interaction.options.getRole("role_membre") : interaction.guild.roles.everyone;

        let channels = interaction.guild.channels.cache.filter(channel => {
            const canSpeak = memberRole.permissionsIn(channel).has(PermissionsBitField.Flags.SendMessages);
            const canView = memberRole.permissionsIn(channel).has(PermissionsBitField.Flags.ViewChannel);

            return channel.type == 0 && channel.rateLimitPerUser == 0 && canSpeak && canView;
        });
        
        channels.each(channel => {
            try{
                channel.setRateLimitPerUser(5, "Ajustement automatique by Analytic's")
                changements.push("Ajout d'un mode lent pour #"+channel.name)
            }
            catch(e){
                changements.push("ERREUR lors de l'ajout d'un mode lent pour #"+channel.name)
            }
        })

        let roles = interaction.guild.roles.cache.filter(role => role.mentionable == true);
        roles.each(role => {
            if(role.position < interaction.guild.members.me.roles.highest.position){
                role.setMentionable(false, "Ajustement automatique by Analytic's")
                changements.push("Correction du rôle @"+role.name)
            }
            else{
                changements.push("Je n'ai pas la permission de modifier le rôle @"+role.name)
            }
        })

        let bots = interaction.guild.members.cache.filter(member => member.user.bot && !(member.presence ? member.presence.status : false));
        if(interaction.options.getBoolean("offline_bots"))
        {

            bots.each(bot => {
                if(bot.roles.highest.position < interaction.guild.members.me.roles.highest.position){
                    changements.push("Explusion du bot innactif @"+bot.displayName);
                    bot.kick("Ajustement automatique by Analytic's")
                }
                else{
                    changements.push("Je n'ai pas la permission d'expluser @"+bot.displayName);
                }
            })
            
        }

        

        changements = changements.map(changement => "- "+changement)

        const exampleEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("Analytic's | Sécurisation complète")
        .setDescription('```'+(changements.length > 0 ? changements.join("\n") : "Aucun changement")+'```')
        .setThumbnail('https://i.imgur.com/doQEqty.png')
        .setTimestamp()
        .setFooter({ text: "Serveur sécurisé par Analytic's", iconURL: 'https://i.imgur.com/AfFp7pu.png' });
		

        await interaction.editReply({ embeds: [exampleEmbed] })
	},
};
