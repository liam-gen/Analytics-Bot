const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField  } = require('discord.js');
const axios = require('axios');
const { QuickDB } = require("quick.db");
const db = new QuickDB({ filePath: "databases/blacklist.sqlite" })
const EmojiManager = require("../../classes/EmojiManager")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('scan')
		.setDescription('Analyser un utilisateur')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addUserOption(option =>
            option.setName('user')
                .setRequired(true)
                .setDescription('Utiliseteur à scanner')),

	async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        let start = Date.now()

        let infos = {
            "avatar": { name: 'Photo de profil', value: EmojiManager.get("loading")+' Chargement...' },
            "creation": { name: 'Date de création', value: EmojiManager.get("loading")+' Chargement...' },
            "messages": { name: 'Messages', value: EmojiManager.get("loading")+' Chargement...' },
            "database": { name: 'Base de données publiques', value: EmojiManager.get("loading")+' Chargement...' },
        };


        //await db.push("blacklist.users", {id: 491769129318088714, username: "ok", reason: "test"});

        
        let score = 0;
        let member = interaction.options.getMember("user");

        let avatar = member.user.avatar;

        if(avatar){
            score += 5;
            infos["avatar"].value = EmojiManager.get("success")+" Modifiée (`+5 points`)"
            editEmbed(interaction, infos, score, start)
        }
        else{
            score -= 5;
            infos["avatar"].value = EmojiManager.get("warning")+" Aucune (`-5 points`)"
            editEmbed(interaction, infos, score, start)
        }

        let joinedDate = member.joinedAt
        let creationDate = member.user.createdAt
        
        let difference = parseInt((Date.now() - creationDate) / (1000 * 60))

        let date = new Date(member.user.createdAt)
        date = getFormattedDate(date)
        // Un mois
        if(difference > 43800){
            score += 20
            infos["creation"].value = EmojiManager.get("success")+" "+date+" `(+20 points)`"
            editEmbed(interaction, infos, score, start)
        }
        // Une semaine
        else if(difference > 10080){
            score += 10
            infos["creation"].value = EmojiManager.get("success")+" "+date+" `(+10 points)`"
            editEmbed(interaction, infos, score, start)
        }
        // Un jour
        else if(difference > 1440){
            score += 1
            infos["creation"].value = EmojiManager.get("wwarning")+" "+date+" `(+1 points)`"
            editEmbed(interaction, infos, score, start)
        }

        else{
            score -= 10
            infos["creation"].value = EmojiManager.get("danger")+" "+date+" `(-10 points)`"
            editEmbed(interaction, infos, score, start)
        }

        let messages = 0;

        let channels = interaction.guild.channels.cache.filter(channel => channel.type == 0)

        for (const channel of Array.from(channels.values())) {
            let msgs = await channel.messages.fetch({ limit: 100, cache: false });
            messages += msgs.filter(message => message.author.id === member.user.id).size;
        }

        score += Number((messages / 10).toFixed(1))

        infos["messages"].value = messages+" `(+"+(messages / 10).toFixed(1)+" points)`"
        editEmbed(interaction, infos, score, start)

        let data = await axios.get('https://api-rd.artivain.com/v1/check?id=382869186042658818')

        if(data.data.blacklist){
            score -= 20

            infos["database"].value = EmojiManager.get("danger")+" Blacklisté `(-20 points)`"
            editEmbed(interaction, infos, score, start)
        }
        else if(data.data.suspect){
            score -= 5

            infos["database"].value = EmojiManager.get("danger")+" Suspecté `(-5 points)`"
            editEmbed(interaction, infos, score, start)
        }
        else{
            infos["database"].value = EmojiManager.get("success")+" Aucun résultat"
            editEmbed(interaction, infos, score, start)
        }

        //console.log(await db.get("blacklist.users"));
	},
};

function getFormattedDate(date) {
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();

    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;
    sec = (sec < 10 ? "0" : "") + sec;

    return day+"/"+month+"/"+date.getFullYear()+" à "+hour+":"+min+":"+sec
}

async function editEmbed(interaction, infos, score, start=0){
    let embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("Analytic's | Analyse d'utilisateur")
        .setDescription('```Score : ' + score +'```')
        .setThumbnail(interaction.options.getMember("user").user.avatarURL())
        .setTimestamp()
        .setFooter({ text: "Durée de l'analyse : "+((Date.now() - start)/1000).toFixed(2)+"s" })
        Object.values(infos).forEach(v => {
            embed.addFields(
                { name: v.name, value: v.value },
            )
        })
        

        await interaction.editReply({ embeds: [embed] })
}