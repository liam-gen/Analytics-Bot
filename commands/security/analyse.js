const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField  } = require('discord.js');
const EmojiManager = require("../../classes/EmojiManager")
const {GuildScanner} = require("../../classes/GuildScanner")
const {TranslationManager} = require("../../classes/TranslationManager")
const JSONdb = require('simple-json-db');
const cache = new JSONdb('cache/analyses.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('analyse')
		.setDescription('Analyse la sécurité du serveur')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addRoleOption(option =>
            option.setName('member_role')
                .setNameLocalizations({
                    fr: 'role_membre',
                })
                .setDescriptionLocalizations({
                    fr: "Rôle de membre (par defaut: everyone)",
                })
                .setRequired(false)
                .setDescription('Members role')),

	async execute(interaction) {
        let translator = new TranslationManager()
        translator.loadFromCmd(interaction)

        let start = Date.now();
        await interaction.deferReply({ ephemeral: true });

        let id = makeid(8)

        let scanner = new GuildScanner(interaction.guild, interaction.locale);

        let infos = {
            "security": { name: translator.get("security"), value: EmojiManager.get("loading")+" "+translator.getMisc("loading")+"..." },
            "channels": { name: translator.get("channels"), value: EmojiManager.get("loading")+" "+translator.getMisc("loading")+"..." },
            "roles": { name: translator.get("roles"), value: EmojiManager.get("loading")+" "+translator.getMisc("loading")+"..." },
            "bots": { name: translator.get("bots"), value: EmojiManager.get("loading")+" "+translator.getMisc("loading")+"..." },
            "users": { name: translator.get("users"), value: EmojiManager.get("loading")+" "+translator.getMisc("loading")+"..." },
        };

        function getResults(data){
            infos[data.type].value = (data.result ? EmojiManager.get(data.result)+" " : "")+data.value+" `("+data.points+" points)`";
            editEmbed(interaction, infos, scanner.getScore(), start, id, translator)

            let results = scanner.results;
            results["server"] = interaction.guild.id;
            results["date"] = Date.now();
            cache.set(id, JSON.stringify(results));
        }

        scanner.scannLevel().then(getResults)

        scanner.scannChannels(interaction.options.getRole("member_role") ? interaction.options.getRole("member_role") : interaction.guild.roles.everyone).then(getResults)

        scanner.scannBots().then(getResults)

        scanner.scannRoles().then(getResults)

        scanner.scannUsers().then(getResults)
	},
};

async function editEmbed(interaction, infos, score, start=0, id="", translator){
    let embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("Analytic's | "+translator.get("title"))
        .setDescription('```Score : ' + score +'/25\nIdentifiant : '+id+'```')
        .setThumbnail("https://i.imgur.com/doQEqty.png")
        .setTimestamp()
        .setFooter({ text: translator.get("time")+" : "+((Date.now() - start)/1000).toFixed(2)+"s" })
        Object.values(infos).forEach(v => {
            embed.addFields(
                { name: v.name, value: v.value },
            )
        })
        

    await interaction.editReply({ embeds: [embed] })
}

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}