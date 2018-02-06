const socketio = require("socket.io-client");

let socket = socketio('https://hmt.gswcm.net/scantron');

socket.on('connect', () => {
	console.log('Connected to ', socket.id);
	socket.emit('scanData','0301 1111111111111111111222222222222222223333 00000');
	socket.disconnect();
});
