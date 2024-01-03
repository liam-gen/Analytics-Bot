const {BaseScanner} = require("./BaseScanner")
const {PermissionsBitField, User} = require("discord.js")
const {UserScanner} = require("./UserScanner")

let {TranslationManager} = require("./TranslationManager")
class GuildScanner extends BaseScanner{
    constructor(guild, locale="en-US"){
        super()
        this.guild = guild;
        this.translate = new TranslationManager();
        this.translate.loadFromClass("GuildScanner", locale)
    }

    scannLevel(){
        return new Promise((res, rej) => {
            let securityLevel = this.guild.verificationLevel;
            let levels = this.translate.get("levels");

            if(securityLevel >= 2){
                this.score += 5;
                this.results["security"] = {name:this.translate.get("security"), value: levels[securityLevel], points: 5, result: "success", type: "security", data: {securityLevel: securityLevel}}
            }
            else{
                this.score -= 10;
                this.results["security"] = {name:this.translate.get("security"), value: levels[securityLevel], points: -10, result: "danger", type: "security", data: {securityLevel: securityLevel}}
            }
    
            res(this.results["security"])
        })
    }

    scannChannels(memberRole){
        return new Promise((res, rej) => {

            let channels = this.guild.channels.cache.filter(channel => {
                const canSpeak = memberRole.permissionsIn(channel).has(PermissionsBitField.Flags.SendMessages);
                const canView = memberRole.permissionsIn(channel).has(PermissionsBitField.Flags.ViewChannel);

                return channel.type == 0 && channel.rateLimitPerUser == 0 && canSpeak && canView;
            });

            if(channels.size == 0){
                this.score += 5;
                this.results["channels"] = {name:this.translate.get("channels"), value: this.translate.get("no_spam")+".", points: 5, result: "success", type: "channels", data: {channels: channels}}
            }
            else{
                this.score -= channels.size;
                this.results["channels"] = {name:this.translate.get("channels"), value: channels.map(channel => "<#"+channel.id+">").join(", "), points: -channels.size, result: "danger", type: "channels", data: {channels: channels}}
            }
    
            res(this.results["channels"])
        })
    }

    scannRoles(){
        return new Promise((res, rej) => {

            let roles = this.guild.roles.cache.filter(role => role.mentionable == true);

            if(roles.size == 0){
                this.score += 5;
                this.results["roles"] = {name:this.translate.get("roles"), value: this.translate.get("no_roles")+".", points: 5, result: "success", type: "roles", data: {roles: roles}}
            }
            else{
                this.score -= roles.size;
                this.results["roles"] = {name:this.translate.get("roles"), value: roles.map(role => "<@&"+role.id+">").join(", "), points: -roles.size, result: "danger", type: "roles", data: {roles: roles}}
            }
    
            res(this.results["roles"])
        })
    }

    scannBots(){
        return new Promise((res, rej) => {

            let bots = this.guild.members.cache.filter(member => member.user.bot && !(member.presence ? member.presence.status : false));

            if(bots.size == 0){
                this.score += 5;
                this.results["bots"] = {name:this.translate.get("bots"), value:this.translate.get("no_bots")+".", points: 5, result: "success", type: "bots", data: {bots: bots}}
            }
            else{
                this.score -= bots.size;
                this.results["bots"] = {name:this.translate.get("bots"), value: bots.map(bot => "<@"+bot.id+">").join(", "), points: -bots.size, result: "warning", type: "bots", data: {bots: bots}}
            }
    
            res(this.results["bots"])
        })
    }

    scannUsers(ignore_messages=false){
        return new Promise(async (res, rej) => {

            //let users = this.guild.members.cache.filter(async member => {let scanner = new UserScanner(member);let i = await scanner.scann();console.log(i.score < 10);return i.score < 10});
            let users = [];
            let data_users = [];
            for (const user of Array.from(this.guild.members.cache.values())) {
                let scanner = new UserScanner(user);
                let i = await scanner.scann(ignore_messages);
                if(i.score < 10){
                    users.push("<@"+user.id+"> `("+i.score+" points)`")
                    data_users.push(user.id)
                }
            }

            if(users.length == 0){
                this.score += 5;
                this.results["users"] = {value: this.translate.get("no_users")+".", points: 5, result: "success", type: "users", data: {users: data_users}}
            }
            else{
                this.score -= users.length;
                this.results["users"] = { value: users.join(", "), points: -users.length, result: "warning", type: "users", data: {users: data_users}}
            }
    
            res(this.results["users"])
        })
    }


    scann(memberRole, ignore_messages=false){
        return new Promise(async (res, rej) => {
            await this.scannLevel()
            await this.scannChannels(memberRole)
            await this.scannRoles()
            await this.scannBots()
            await this.scannUsers(ignore_messages)
            await res({results: this.results, score: this.score})
        })  
    }
}

module.exports = {GuildScanner}