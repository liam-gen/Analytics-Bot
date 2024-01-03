class EmojiManagerBase{
    constructor()
    {
        this.emojis = {
            "success": "<:succes:993947162171941015>",
            "danger": "<:danger:993939815324196944>",
            "warning": "<:warning:993939759758065774>",
            "error": "<:nope:995686247798407238>",
            "loading": "<a:chargement:993884322232795247> "
        }
    }

    get(emoji){
        return this.emojis[emoji]
    }
}

module.exports = new EmojiManagerBase()