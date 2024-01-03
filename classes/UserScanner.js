const axios = require('axios')
const {BaseScanner} = require("./BaseScanner")
const {TranslationManager} = require("../classes/TranslationManager")

class UserScanner extends BaseScanner{
    constructor(member, locale="en-US"){
        super()
        this.member = member;
        this.translator = new TranslationManager()
        this.translator.loadFromClass("UserScanner", locale)
    }

    scannAvatar(){
        return new Promise((res, rej) => {
            let avatar = this.member.user.avatar;

            if(avatar){
                this.score += 5;
                this.results["avatar"] = {name: this.translator.get("avatar"), value: this.translator.getMisc("edited"), points: 5, result: "success", type: "avatar"}
            }
            else{
                this.score -= 5;
                this.results["avatar"] = {name: this.translator.get("avatar"), value: this.translator.getMisc("none"), points: -5, result: "warning", type: "avatar"}
            }
    
            res(this.results["avatar"])
        })
    }

    scannMessages(){
        return new Promise(async (res, rej) => {
            let messages = 0;

            let channels = this.member.guild.channels.cache.filter(channel => channel.type == 0)

            for (const channel of Array.from(channels.values())) {
                let msgs = await channel.messages.fetch({ limit: 100, cache: false });
                messages += msgs.filter(message => message.author.id === this.member.user.id).size;
            }

            this.score += Number((messages / 10).toFixed(1));
            this.results["messages"] = {name: this.translator.get("messages"), value: messages, points: Number((messages / 10).toFixed(1)), type: "messages", result: null}

            res(this.results["messages"])
        })
    }

    scannDate(){
        return new Promise((res, rej) => {
            let creationDate = this.member.user.createdAt
            
            let difference = parseInt((Date.now() - creationDate) / (1000 * 60))

            let date = new Date(this.member.user.createdAt)
            date = this.getFormattedDate(date)
            // Un mois
            if(difference > 43800){
                this.score += 20;
                this.results["creation"] = {name: this.translator.get("creation"), value: date, points: 20, result: "success", type: "creation"}
            }
            // Une semaine
            else if(difference > 10080){
                this.score += 10;
                this.results["creation"] = {name: this.translator.get("creation"), value: date, points: 10, result: "success", type: "creation"}
            }
            // Un jour
            else if(difference > 1440){
                this.score += 1;
                this.results["creation"] = {name: this.translator.get("creation"), value: date, points: 1, result: "warning", type: "creation"}
            }

            else{
                this.score -= 10;
                this.results["creation"] = {name: this.translator.get("creation"), value: date, points: -10, result: "danger", type: "creation"}
            }

            res(this.results["creation"])
        })
    }

    scannDatabase(){

        return new Promise(async (res, rej) => {
            let data = await axios.get('https://api-rd.artivain.com/v1/check?id=382869186042658818')

            if(data.data.blacklist){
                this.score -= 20;
                this.results["blacklist"] = {name: this.translator.get("database"), value: this.translator.getMisc("blacklisted"), points: -20, result: "danger", type: "database"}
            }
            else if(data.data.suspect){
                this.score -= 5;
                this.results["blacklist"] = {name: this.translator.get("database"), value: this.translator.getMisc("suepected"), points: -5, result: "warning", type: "database"}
            }
            else{
                this.results["blacklist"] = {name: this.translator.get("database"), value: this.translator.getMisc("no_results"), points: 0, result: "success", type: "database"}
            }
            res(this.results["blacklist"])
        })
    }

    getFormattedDate(date) {
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

    scann(ignore_messages=false){
        return new Promise(async (res, rej) => {
            await this.scannAvatar()
            await this.scannDatabase()
            await this.scannDate()
            if(!ignore_messages) await this.scannMessages()
            await res({results: this.results, score: this.score})
        })  
    }
}

module.exports = {UserScanner}