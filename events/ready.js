const { Events } = require('discord.js');

const readline = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
});

function evaluate(client){
	readline.question('> ', data => {
		console.log(eval(data));
		evaluate(client)
	});
}

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		evaluate(client)

		let state = 0;
		let activities = [
			{
				name: "en bêta"
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