const express = require('express');
const app = express();
const http = require('http').createServer(app)
const io = require('socket.io')(http)
// app.express();

app.use(express.static(__dirname + '/'));

app.get('/', (req,res)=>{
    res.sendFile(__dirname + '/index.html')
})

let gameState = {
    players: {}
};

io.on('connection', function(socket){
    // io.emit('id',socket.id)
    socket.on('moverCarro', function(movements){
        movements.id = socket.id;
        gameState.players[socket.id] = movements;
        socket.broadcast.emit('carroMovido', gameState);
    });
    socket.on('disconnect', function() {
        delete gameState.players[socket.id]
    });
});
  
http.listen(3000, function(){
    console.log('listening on *:3000');
});