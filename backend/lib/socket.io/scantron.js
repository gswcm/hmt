module.exports = (io) => {
	io.on('connect', socket => {
		console.log(`Connected to ${socket.id}`);		
		socket.on('scanData', data => {			
			io.emit('addScanData', data);
		});
	});
};