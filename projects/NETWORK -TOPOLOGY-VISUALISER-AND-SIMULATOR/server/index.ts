import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Store active simulations
const activeSimulations = new Map<string, NodeJS.Timeout>();

// Generate realistic network metrics
function generateMetrics() {
  return {
    latency: Math.round((Math.random() * 50 + 10) * 100) / 100, // 10-60ms
    throughput: Math.round((Math.random() * 100 + 10) * 100) / 100, // 10-110 Mbps
    jitter: Math.round((Math.random() * 10 + 0.5) * 100) / 100, // 0.5-10.5ms
    packetLoss: Math.round((Math.random() * 2 + 0.1) * 100) / 100, // 0.1-2.1%
  };
}

// POST endpoint to start simulation
app.post('/api/run-simulation', (req, res) => {
  const { topologyId } = req.body;
  const simId = topologyId || 'default';

  // Clear existing simulation if any
  if (activeSimulations.has(simId)) {
    clearInterval(activeSimulations.get(simId)!);
  }

  // Start new simulation
  const interval = setInterval(() => {
    const metrics = generateMetrics();
    io.emit('metrics-update', { topologyId: simId, metrics });
  }, 1000); // Update every second

  activeSimulations.set(simId, interval);

  res.json({ success: true, message: 'Simulation started', topologyId: simId });
});

// POST endpoint to stop simulation
app.post('/api/stop-simulation', (req, res) => {
  const { topologyId } = req.body;
  const simId = topologyId || 'default';

  if (activeSimulations.has(simId)) {
    clearInterval(activeSimulations.get(simId)!);
    activeSimulations.delete(simId);
    io.emit('simulation-stopped', { topologyId: simId });
  }

  res.json({ success: true, message: 'Simulation stopped' });
});

// GET endpoint for metrics
app.get('/api/get-metrics', (req, res) => {
  const metrics = generateMetrics();
  res.json({ metrics });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
