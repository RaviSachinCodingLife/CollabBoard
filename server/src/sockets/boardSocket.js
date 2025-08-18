const Board = require('../models/Board');
const { uploadBufferToS3 } = require('../services/s3');

module.exports = (io, socket) => {
  socket.on('joinBoard', ({ boardId }) => {
    if (!boardId) return;
    socket.join(boardId);
    socket.to(boardId).emit('presence', { action: 'joined', userId: socket.user.id, socketId: socket.id });
  });

  socket.on('leaveBoard', ({ boardId }) => {
    if (!boardId) return;
    socket.leave(boardId);
    socket.to(boardId).emit('presence', { action: 'left', userId: socket.user.id, socketId: socket.id });
  });

  socket.on('draw', async (payload) => {
    if (!payload || !payload.boardId) return;
    const { boardId, op } = payload;

    socket.to(boardId).emit('draw', { op, userId: socket.user.id });

    try {
      await Board.findByIdAndUpdate(boardId, { $push: { elements: op } }, { new: false });
    } catch (err) {
      console.error('persist draw', err.message);
    }
  });

  socket.on('saveSnapshot', async ({ boardId, dataUrl, filename = 'snapshot.png' }) => {
    if (!boardId || !dataUrl) return;
    try {
      const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
      if (!matches) return;

      const contentType = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      const key = `snapshots/${boardId}/${Date.now()}-${filename.replace(/\s+/g, '_')}`;

      await uploadBufferToS3(key, buffer, contentType);
      const url = `${process.env.CLOUDFRONT_URL}/${key}`;

      await Board.findByIdAndUpdate(boardId, {
        $push: { snapshots: { key, url, uploadedAt: new Date() } }
      }, { new: true });

      io.to(boardId).emit('snapshotSaved', { key, url, uploadedAt: new Date() });
    } catch (err) {
      console.error('saveSnapshot error', err);
      socket.emit('error', { message: 'Snapshot save failed' });
    }
  });

  socket.on('disconnect', (reason) => {
  });
};
