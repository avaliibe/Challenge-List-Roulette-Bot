// Variables used for API shit
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const xhr = new XMLHttpRequest();
const url = 'https://gdchallengelist.com/api/v1/demons/';

// Variables used for discord.js shit
const discord = require('discord.js');
const client = new discord.Client();
const config = require('./config.json');

// Other miscellaneous variables
let response, embed, video, publisher, x, mainPos;
let users = [];
let percentages = [];
let challenges = [];
let nums = [];
let canRespond = false;

xhr.open('GET', url + '?name=AbomiNation');
xhr.responseType = 'json';
xhr.onload = () => {
    response = JSON.parse(xhr.responseText);
    mainPos = response[0].position;
    console.log(mainPos);
    generateNums();
};
xhr.send();

function generateNums() {
    for(let i = 0; i < mainPos; i++)
    {
        nums.push(i);
    }
    canRespond = true;
}

client.on('ready', () => {
    client.user.setPresence({activity: { name: "use !help to see commands." }});
});

// Checks for when a message is send
client.on('message', msg => {
    if(canRespond === false) { return; }
    // Converts the contents of the message to lowercase
    let msgLower = msg.content.toLowerCase();

    // Checks if the message starts with the prefix.
    if(msgLower.charAt(0) != config.prefix) {
        return;
    }

    // Sets the message variable to a version without the exclamation point
    msgLower = msgLower.replace(config.prefix, '');

    // Checks what if whats if the message is a command
    if(msgLower === 'generate') {
        // Checks if the user has already started a game
        if(users.includes(msg.author.id)) {
            // Creates and send the embed
            embed = new discord.MessageEmbed()
                .setTitle('You\'ve already started a game.')
                .setDescription(`Use ${config.prefix}endgame to end it.`);
            msg.channel.send(embed);
            return;
        }

        x = Math.floor(Math.random() * nums.length);
        // Stuff for API
        xhr.open('GET', url + nums[x] + '/');
        xhr.responseType = 'json';
        xhr.onload = () => {                   
            // Makes the response variable the cotents of response from the server
            console.log(xhr);
            response = JSON.parse(xhr.responseText);
            if(response.data.publisher === undefined) {
                publisher = 'No publisher found.';
            } else {
                publisher = response.data.publisher.name;
            }

            // Grabs the video ID
            video = response.data.video.replace('https://www.youtube.com/watch?v=', '');

            // Makes the embed to be sent back to the user
            embed = new discord.MessageEmbed()
                .setTitle(`Level: ${response.data.name}`)
                .setURL(response.data.video)
                .setThumbnail(`https://img.youtube.com/vi/${video}/0.jpg`)
                .addFields(
                    { name: 'By:', value: publisher, inline: true },
                    { name: '_ _', value: '_ _', inline: true },
                    { name: 'Required Percentage:', value: '1', inline: true }
                );
            msg.channel.send(embed);
            
            // Adds the user's ID and the default percentage to the two arrays.
            users.push(msg.author.id);
            challenges.push(nums);
                 
            for(let i = 0; i < users.length; i++)
            {
                if(msg.author.id === users[i])
                { 
                    challenges[i].splice(x, 1);
                }
            }
            percentages.push(1);
            };
            xhr.send();
    } else if(msgLower.includes('percent') && msgLower.indexOf('percent') === 0)
    {
        // Checks if a user has started a game
        if(users.includes(msg.author.id) === false) {
            // Creates the embed and sends it.
            embed = new discord.MessageEmbed()
                .setTitle('No game found!')
                .setDescription(`Use ${config.prefix}generate to start one.`);
            msg.channel.send(embed);
            return;
        }

        // Loops through the array
        for(let i = 0; i < users.length; i++)
        {
            // Checks if the author of the message is equal to the index i in the array
            if(msg.author.id === users[i])
            {
                x = Math.floor(Math.random() * challenges[i].length); 
                console.log(x);
                // Stuff for API
                xhr.open('GET', url + challenges[i][x] + '/');
                xhr.responseType = 'json';
                xhr.onload = () => {
                // Makes the response variable the contents of response from the server
                response = JSON.parse(xhr.responseText);

                if(response.data.publisher === undefined) {
                    publisher = 'No publisher found.';
                } else {
                    publisher = response.data.publisher.name;
                }

                // Grabs the video ID
                if(response.data.video != undefined) {
                    video = response.data.video.replace('https://www.youtube.com/watch?v=', '');
                }
                
                // Replaces the word percent with a blank
                msgLower = msgLower.replace('percent ', '');

                // Converts the number to an integer
                msgLower = parseInt(msgLower);

                // Checks if the message is a number
                if(isNumeric(msgLower)) {                        

                    // If the message is lower than the number linked with the user, it sends a message saying its too small, and returns
                        if(msgLower < percentages[i]) { 
                            embed = new discord.MessageEmbed()
                                .setTitle('Percentage too small!')
                                .setDescription(`Required Percentage: ${percentages[i]}`);
                            msg.channel.send(embed);
                            return;
                        } else if( msgLower == 100 || challenges[i].length == 0) {
                            embed = new discord.MessageEmbed() 
                                .setTitle('Congratulations! You have won the challenge!')
                            msg.channel.send(embed);
                            users.splice(i, 1);
                            percentages.splice(i, 1);
                            challenges.splice(i, 1);
                            return;
                        }
                        // Creates the embed to be sent
                        embed = new discord.MessageEmbed()
                        .setTitle(`Level: ${response.data.name}`)
                        .setURL(response.data.video)
                        .setThumbnail(`https://img.youtube.com/vi/${video}/0.jpg`)
                        .addFields(
                            { name: 'By:', value: publisher, inline: true },
                            { name: '_ _', value: '_ _', inline: true },
                            { name: 'Required Percentage:', value: msgLower += 1, inline: true }
                        );
                        msg.channel.send(embed);
                        // Replaces the old percentage with the new one
                        percentages.splice(i, i, msgLower);
                        challenges[i].splice(x, 1);
                        
                    } else {
                        embed = new discord.MessageEmbed()
                            .setTitle('Invalid input.');
                        msg.channel.send(embed);
                    }
                }
                xhr.send();
                return;
            }
        }
    } else if(msgLower === 'endgame') {
        // Loops through users array
        for(let i = 0; i < users.length; i++)
        {
            // Checks if the user is the one at index i
            if(users[i] === msg.author.id) {
                // Removes the user's id and percentage
                users.splice(i, 1);
                percentages.splice(i, 1);
                challenges.splice(i, 1);
                // Creates and sends embed.
                embed = new discord.MessageEmbed()
                    .setTitle('Game ended.');
                msg.channel.send(embed);
            }
        }
    } else if(msgLower === 'help') {
        embed = new discord.MessageEmbed()
            .setTitle('Commands:')
            .addFields(
                { name: `${config.prefix}generate`, value: 'Begins a game of the roulette, only works\nif the user has not created a game yet.'},
                { name: `${config.prefix}percent [percentage]`, value: 'Lets you input the percentage you got on the level,\nand lets you onto the next level.'},
                { name: `${config.prefix}endgame`, value: 'Ends the game.'},
                { name: `${config.prefix}server`, value: 'Sends the link to the support server.'}
            );
        msg.channel.send(embed);
    } else if(msgLower === 'server') {
        embed = new discord.MessageEmbed()
            .setTitle('https://discord.gg/Zp83TZP9VF');
        msg.channel.send(embed);
    }
});

function isNumeric(value) {
    return /^\d+$/.test(value);
}

client.login(config.token);