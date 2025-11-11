import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNetworkStore } from '@/store/networkStore';
import Toolbar from '@/components/Toolbar';
import SidebarLeft from '@/components/SidebarLeft';
import SidebarRight from '@/components/SidebarRight';
import Canvas from '@/components/Canvas';

let socket: Socket | null = null;

function App() {
  const { addMetric, setSimulating } = useNetworkStore();

  useEffect(() => {
    // Initialize Socket.io connection
    socket = io('http://localhost:3001');

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    const handleMetricsUpdate = (data: { metrics: any }) => {
      // Only add metrics if simulation is actually running
      const currentState = useNetworkStore.getState();
      if (currentState.isSimulating) {
        addMetric(data.metrics);
      }
    };

    socket.on('metrics-update', handleMetricsUpdate);

    socket.on('simulation-stopped', () => {
      setSimulating(false);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [addMetric, setSimulating]);

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        <SidebarLeft />
        <div className="flex-1 relative">
          <Canvas />
        </div>
        <SidebarRight />
      </div>
    </div>
  );
}

export default App;
