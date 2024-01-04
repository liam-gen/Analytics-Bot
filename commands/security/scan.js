const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField  } = require('discord.js');
const axios = require('axios');
const { QuickDB } = require("quick.db");
const db = new QuickDB({ filePath: "databases/blacklist.sqlite" })
const EmojiManager = require("../../classes/EmojiManager")
const {UserScanner} = require("../../classes/UserScanner")
const {TranslationManager} = require("../../classes/TranslationManager")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('scan')
		.setDescription('User analysis')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers)
        .setDescriptionLocalizations({
            fr: "Analyser un utilisateur",
        })
        .addUserOption(option =>
            option.setName('user')
                .setNameLocalizations({
                    fr: 'utilisateur',
                })
                .setDescriptionLocalizations({
                    fr: "Utilisateur à scanner",
                })
                .setRequired(true)
                .setDescription('User to scann')),

	async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        let start = Date.now()

        let translator = new TranslationManager()
        translator.loadFromCmd(interaction)

        let scanner = new UserScanner(interaction.options.getMember("user"), interaction.locale);

        let infos = {
            "avatar": { name: translator.get("avatar"), value: EmojiManager.get("loading")+' '+translator.getMisc("loading")+"..." },
            "creation": { name: translator.get("creation"), value: EmojiManager.get("loading")+' '+translator.getMisc("loading")+"..." },
            "messages": { name: translator.get("messages"), value: EmojiManager.get("loading")+' '+translator.getMisc("loading")+"..." },
            "database": { name: translator.get("database"), value: EmojiManager.get("loading")+' '+translator.getMisc("loading")+"..." },
        };

        function getResults(data){
            infos[data.type].value = (data.result ? EmojiManager.get(data.result)+" " : "")+data.value+" `("+data.points+" points)`";
            editEmbed(interaction, infos, scanner.getScore(), start, translator)
        }

        scanner.scannAvatar().then(getResults)

        scanner.scannDate().then(getResults)

        scanner.scannMessages().then(getResults)

        scanner.scannDatabase().then(getResults)

        //await db.push("blacklist.users", {id: 491769129318088714, username: "ok", reason: "test"});
        //console.log(await db.get("blacklist.users"));
	},
};


async function editEmbed(interaction, infos, score, start=0, translator){
    let embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("Analytic's | "+translator.get("title"))
        .setDescription('```Score : ' + score +'```')
        .setThumbnail(interaction.options.getMember("user").user.avatarURL())
        .setTimestamp()
        .setFooter({ text: translator.get("time")+" : "+((Date.now() - start)/1000).toFixed(2)+"s" })
        Object.values(infos).forEach(v => {
            embed.addFields(
                { name: v.name, value: v.value },
            )
        })
        
    await interaction.editReply({ embeds: [embed] })
}