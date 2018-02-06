module.exports = (io) => {
	io.on('connect', socket => {
		console.log(`Connected to ${socket.id}`);		
		socket.on('scanData', data => {			
			socket.broadcast.emit('addScanData', data);
		});
	});
};