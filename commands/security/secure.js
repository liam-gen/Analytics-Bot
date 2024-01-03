const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField  } = require('discord.js');
const {GuildScanner} = require("../../classes/GuildScanner")
const JSONdb = require('simple-json-db');
const EmojiManager = require('../../classes/EmojiManager');
const {TranslationManager} = require('../../classes/TranslationManager');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('secure')
		.setDescription('Secure your server automatically')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .setNameLocalizations({
            fr: 'securiser',
        })
        .setDescriptionLocalizations({
            fr: "Sécuriser automatiquement votre serveur",
        })

        .addStringOption(option =>
            option.setName('id')
            .setDescriptionLocalizations({
                fr: "Identifiant de l'analyse",
            })
                .setRequired(true)
                .setDescription("Analysis ID"))
                

        .addBooleanOption(option => 
            option.setName("offline_bots")
            .setNameLocalizations({
                fr: 'bots_hors_ligne',
            })
            .setDescriptionLocalizations({
                fr: "Expluser les bots hors ligne",
            })
            .setDescription("Kick offline bots")
            .setRequired(false))

        .addBooleanOption(option => 
            option.setName("kick_members")
            .setNameLocalizations({
                fr: 'expluser_membres',
            })
            .setDescriptionLocalizations({
                fr: "Expluser les membres avec un score en dessous de 10",
            })
            .setDescription("Explode members with a score below 10")
            .setRequired(false)
        ),

	async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        let translator = new TranslationManager();
        translator.loadFromCmd(interaction)

        let id = interaction.options.getString("id")
        const cache = new JSONdb('cache/analyses.json');

        if(id){
            
            if(cache.has(id) && JSON.parse(cache.get(id))["server"] == interaction.guild.id){
                let data = JSON.parse(cache.get(id));

                let errors = 0;
                let changements = []
                if(data["security"].data.securityLevel < 2)
                            {
                                try{
                                    interaction.guild.setVerificationLevel(2, translator.get("logs"))
                                    changements.push(translator.get("security").replace(/%s/g, data["security"].value))
                                }
                                catch(e){
                                    changements.push(EmojiManager.get("error")+" "+translator.get("security_error").replace(/%s/g, data["security"].value))
                                    errors = 1
                                }
                            }
            
                            // Ajout du mode lent sur les salons
            
                            data["channels"].data.channels.forEach(channel => {
                                try{
                                    let ch = interaction.guild.channels.cache.find(ch => ch.id === channel.id)
                                    ch.setRateLimitPerUser(5, translator.get("logs"))
                                    changements.push(translator.get("slowmode").replace(/%s/g, channel.name))
                                }
                                catch(e){
                                    changements.push(EmojiManager.get("error")+" "+translator.get("slowmode_error").replace(/%s/g, channel.name))
                                    errors = 1
                                }
                            })
            
                            // Faire en sorte de ne plus pouvoir mentionner les roles
            
                            data["roles"].data.roles.forEach(role => {
                                if(role.position < interaction.guild.members.me.roles.highest.position){
                                    let rl = interaction.guild.roles.cache.find(r => r.id === role.id)
                                    rl.setMentionable(false, translator.get("logs"))
                                    changements.push(translator.get("role").replace(/%s/g, role.name))
                                }
                                else{
                                    changements.push(EmojiManager.get("error")+" "+translator.get("role_error").replace(/%s/g, role.name))
                                    errors = 1
                                }
                            })
            
                            // Expluser les bots innactifs
            
                            if(interaction.options.getBoolean("offline_bots"))
                            {
                                data["bots"].data.bots.forEach(bot => {
                                    if(bot.roles.highest.position < interaction.guild.members.me.roles.highest.position){
                                        let bt = interaction.guild.members.cache.find(m => m.id === bot.id)
                                        changements.push(translator.get("kick_bots").replace(/%s/g, bot.displayName));
                                        bt.kick(translator.get("logs"))
                                    }
                                    else{
                                        changements.push(EmojiManager.get("error")+" "+translator.get("kick_bots_no_perms").replace(/%s/g, bot.displayName));
                                        errors = 1
                                    }
                                })
                                
                            }
            
                            if(!errors) cache.delete(id)
            
                            changements = changements.map(changement => "- "+changement)
            
                            const embed = new EmbedBuilder()
                            .setColor(0x0099FF)
                            .setTitle("Analytic's | "+translator.get("title"))
                            .setDescription('```'+(changements.length > 0 ? changements.join("\n") : translator.getMisc("no_changes"))+'```')
                            .setThumbnail('https://i.imgur.com/doQEqty.png')
                            .setTimestamp()
                            .setFooter({ text: translator.get("footer") });
                            
            
                            await interaction.editReply({ embeds: [embed] })

            }
            else{
                interaction.editReply({content: EmojiManager.get("error")+" "+translator.get("id_not_found")+" :/"})
            }
        }
        else{
            interaction.editReply({content: EmojiManager.get("error")+" "+translator.get("id_required")+" :/"})
        }
	},
};