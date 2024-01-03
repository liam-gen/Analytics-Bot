const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		let state = 0;
		let activities = [
			{
				name: "bientôt..."
			},
			{
				name: "liamgenjs.vercel.app",
			}
		]
		

		setInterval(function(){
			state = (state + 1) % activities.length;
			client.user.setPresence({ activities: [activities[state]] });
		}, 10000)
	},
};