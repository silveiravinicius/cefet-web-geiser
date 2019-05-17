var express = require('express'),
    app = express(),
    fs = require('fs'),
 	Handlebars = require('handlebars');

var games, 						//get the content from jogosPorJogador.json
 	notPlayedYet, 				//counter variable that counts the games that haven't been played yet by the player
 	orderedListOfGames, 		//get the list of games bought by a player and order it
    player, 			//list of steamids
    playerSteamId, 				//the player steamid
    players, 					//get the content from jogadores.json
    topFive, 					//get the 5 games most played by a player 
    topPlayed, 					//get the game most played by a player
 	urlJogador = '/jogador/'; 	//auxiliar variable used in app.get

var _ = require('underscore');

// carregar "banco de dados" (data/jogadores.json e dtaa/jogosPorJogador.json)
// você pode colocar o conteúdo dos arquivos json no objeto "db" logo abaixo
// dica: 3-4 linhas de código (você deve usar o módulo de filesystem (fs))
players = JSON.parse(fs.readFileSync('server/data/jogadores.json')).players;
games 	= JSON.parse(fs.readFileSync('server/data/jogosPorJogador.json'));

// configurar qual templating engine usar. Sugestão: hbs (handlebars)
//app.set('view engine', '???');
app.set('view engine', 'hbs');

// EXERCÍCIO 2
// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json
app.set('views', 'server/views');

app.get('/', function (req, res) {
	res.render('index', {
		players: players
	});
});

// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter umas 15 linhas de código

/**LÓGICA DE SELEÇÃO*/
app.get(urlJogador + '*', function (req, res) {
	calculateParameters(req);

	res.render('jogador', {
		player: 		player,
		games: 			games[playerSteamId],
		notPlayedYet: 	notPlayedYet,
		favoriteGame: 	topPlayed,
		topFive: 		topFive,
	});
});

function calculateParameters (req) {
	players = JSON.parse(fs.readFileSync('server/data/jogadores.json')).players;
	games 	= JSON.parse(fs.readFileSync('server/data/jogosPorJogador.json'));

	player 				= _.find(players, function(num) { return req.url.indexOf(num.steamid) != -1 }); //return the steamids of all players
	playerSteamId 		= _.find(Object.keys(games), function(num) { return num == player.steamid }); //return the player steamid
	orderedListOfGames 	= _.sortBy(games[playerSteamId].games, 'playtime_forever'); //get the games bought by the player above
	notPlayedYet 		= 0; //count variable
	topFive 			= _.map(_.chain(_.last(orderedListOfGames, [5])).reverse().value(), function (num) { 
							num.playtime_forever = Math.round(num.playtime_forever/60); 
							return num; }); //order the list 
	topPlayed 			= [topFive[0], player.steamid]; //get the most played game by the player and add the player steamid to the list

	//count the number of games not played by the person
	for (var i = 0; i < games[playerSteamId].games.length; i++)
		if (games[playerSteamId].games[i].playtime_forever == 0)
			notPlayedYet++;
}


//EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
// dica: 1 linha de código
app.use(express.static('client'));

// abrir servidor na porta 3000
// dica: 1-3 linhas de código

app.listen(3000, function () {
  console.log('Listening');
});