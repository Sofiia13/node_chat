import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import roomsRouter from './routes/rooms.js';
import messagesRouter from './routes/messages.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/rooms', roomsRouter);
app.use('/api', messagesRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
