const fs = require("fs")

class TranslationManager{

    constructor(){
        this.default_language = "en-US"
    }

    loadFromCmd(interaction){
        this.data = {
            method: "commands",
            name: interaction.commandName
        }
        
        let locale = interaction.locale ? interaction.locale : this.default_language 
        this.locale = locale;

        if (fs.existsSync(__dirname+"/../languages/"+locale+".json")) {
            let file = require(__dirname+"/../languages/"+locale+".json");
            this.file = file["commands"][interaction.commandName]
            if(!this.file){
                this.locale = this.default_language ;
                file = require(__dirname+"/../languages/"+this.default_language +".json");
                this.file = file["commands"][interaction.commandName]
            }
        }
        else{
            this.locale = this.default_language;
            const file = require(__dirname+"/../languages/"+this.default_language +".json");
            this.file = file["commands"][interaction.commandName]
        }
    }

    loadFromClass(name, locale=this.default_language){
        this.data = {
            method: "class",
            name: name
        }

        if (fs.existsSync(__dirname+"/../languages/"+locale+".json")) {
            const file = require(__dirname+"/../languages/"+locale+".json");
            this.locale = locale;
            this.file = file["classes"][name]
            if(!this.file){
                file = require(__dirname+"/../languages/"+this.default_language +".json");
                this.file = file["classes"][name]
            }
        }
        else{
            const file = require(__dirname+"/../languages/"+this.default_language +".json");
            this.locale = this.default_language;
            this.file = file["classes"][name]
        }
    }

    get(data){
        return this.file[data] ? this.file[data] : this.getDefault(data)
    }

    getJSON(){
        return this.file
    }

    getMisc(data){
        return require(__dirname+"/../languages/"+this.locale+".json")["misc"][data]
    }

    getDefault(data){
        return require(__dirname+"/../languages/"+this.default_language +".json")[this.data.method][this.data.name][data]
    }
}

module.exports = { TranslationManager }