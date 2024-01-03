const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField  } = require('discord.js');
const EmojiManager = require("../../classes/EmojiManager")
const fs = require('node:fs');
const path = require('node:path');

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
        .setNameLocalizations({
            fr: 'aide',
        })
        .setDescriptionLocalizations({
            fr: 'Menu des commandes du bot',
        })
		.setDescription("Bot commands menu")
        .addStringOption(option =>
            option.setName('category')
                .setNameLocalizations({
                    fr: 'catégorie',
                })
                .setDescription('Category to display')
                .setDescriptionLocalizations({
                    fr: "Catégorie à afficher",
                })
                .setRequired(false)
                .addChoices(
                    { name: 'Misc', value: 'misc' },
                    { name: 'Security', value: 'security' },
                    { name: 'Moderation', value: 'moderation' },
                ))
            .addStringOption(option =>
                option.setName('command')
                    .setNameLocalizations({
                        fr: 'commande',
                    })
                    .setDescription('Command to display')
                    .setDescriptionLocalizations({
                        fr: "Commande à afficher",
                    })
                    .setRequired(false)),

	async execute(interaction) {
        let start = Date.now();
        await interaction.deferReply();

        const helpEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("Page d'aide")
        .setTimestamp()
        .setFooter({ text: "Copyrights 2023 | Analytic's"});

        let category = interaction.options.getString('category')
        let command = interaction.options.getString('command')

        if(!category && !command) {

            let helpCmd = interaction.client.commands.get("help").data;
            let helpName = helpCmd.name_localizations && interaction.locale in helpCmd.name_localizations && interaction.locale != "en" ? helpCmd.name_localizations[interaction.locale] : helpCmd.name
            let optionName = helpCmd.options[0].name_localizations && interaction.locale in helpCmd.options[0].name_localizations && interaction.locale != "en" ? helpCmd.options[0].name_localizations[interaction.locale] : helpCmd.options[0].name
            const folderPath = path.join(__dirname, '../../commands/');
            const commandFolders = fs.readdirSync(folderPath);
            for (const folder of commandFolders) {
                    helpEmbed.addFields({ name: capitalizeFirstLetter(folder), value: '`/'+helpName+" "+optionName+":"+capitalizeFirstLetter(folder)+"`" })
            }

            return interaction.editReply({embeds: [helpEmbed]})
        }

        

        if(category)
        {
            const filesPath = path.join(__dirname, '../../commands/'+category);
            const commandFolders = fs.readdirSync(filesPath);
            for (const file of commandFolders) {

                    const filePath = path.join(filesPath, file);
                    const command = require(filePath);
                    console.log(command.data)
                    console.log(interaction.locale)

                    //let description = interaction.locale && option.description_localizations[interaction.locale] == "en" ? option.name : option.description_localizations[interaction.locale]

                    let args = "";
                    command.data.options.forEach(option => {

                        let name =  option.name_localizations && interaction.locale in option.name_localizations && interaction.locale != "en" ? option.name_localizations[interaction.locale] : option.name
                        

                        switch(option.type){
                            // String
                            case 3:
                                args += " `'"+name+"'"+(option.required ? "*" : "")+"` "
                                break;
                            // User
                            case 6:
                                args += " `<@"+name+">"+(option.required ? "*" : "")+"` "
                                break;
                            // Boolean
                            case 5:
                                args += " `"+name+(option.required ? "*" : "")+"?` "
                                break;
                            // Role
                            case 8:
                                args += " `<@&"+name+">"+(option.required ? "*" : "")+"` "
                                break;
                        }
                    })
                    helpEmbed.setDescription("**Informations**:\n`*` : obligatoire\n`'abc'` : Chaine de caractères\n`<@abc>` : Utilisateur\n`<@&abc>` : Role\n`abc?` : Oui ou non\n\n**Commandes :**\n")
                    helpEmbed.addFields({ name: '/'+command.data.name+args, value: command.data.description })
                }
        }

        else if(command){

            let cmd = interaction.client.commands.get(command);

            if(!cmd) return interaction.editReply({content: EmojiManager.get("error")+" Impossible de trouver cette commande"})

            helpEmbed.setDescription("**Nom**: "+cmd.data.name+"\n**Description**: "+cmd.data.description)

            cmd.data.options.forEach(option => {
                let description = option.description_localizations && interaction.locale in option.description_localizations && interaction.locale != "en" ? option.description_localizations[interaction.locale] : option.description

                    let name =  option.name_localizations && interaction.locale in option.name_localizations && interaction.locale != "en" ? option.name_localizations[interaction.locale] : option.name
                    let args = "";

                    switch(option.type){
                        // String
                        case 3:
                            args += " `"+name+" : Chaine de caractères"+(option.required ? " | Requis" : "")+"` "
                            break;
                        // User
                        case 6:
                            args += " `"+name+" : Utilisateur"+(option.required ? " | Requis" : "")+"` "
                            break;
                        // Boolean
                        case 5:
                            args += " `"+name+" : Oui ou non"+(option.required ? " | Requis" : "")+"` "
                            break;
                        // Role
                        case 8:
                            args += " `"+name+" : Rôle"+(option.required ? " | Requis" : "")+"` "
                            break;
                    }
                    helpEmbed.addFields({ name: args, value: description })
                })
                
        }

        

        interaction.editReply({embeds: [helpEmbed]})
	},
};