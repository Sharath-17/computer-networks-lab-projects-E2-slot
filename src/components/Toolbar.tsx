import { Play, Square, RotateCcw, Upload, Download, Settings } from 'lucide-react';
import { useNetworkStore } from '@/store/networkStore';
import { useState } from 'react';
import { cn } from '@/utils/cn';

export default function Toolbar() {
  const { 
    isSimulating, 
    setSimulating, 
    reset, 
    exportTopology, 
    importTopology,
    clearMetrics 
  } = useNetworkStore();
  const [showSettings, setShowSettings] = useState(false);

  const handleRun = async () => {
    if (isSimulating) {
      // Stop simulation
      try {
        await fetch('http://localhost:3001/api/stop-simulation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topologyId: 'default' }),
        });
        setSimulating(false);
        // Clear metrics when stopping
        clearMetrics();
      } catch (error) {
        console.error('Failed to stop simulation:', error);
      }
    } else {
      // Start simulation
      try {
        await fetch('http://localhost:3001/api/run-simulation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topologyId: 'default' }),
        });
        setSimulating(true);
      } catch (error) {
        console.error('Failed to start simulation:', error);
      }
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset the topology? This will clear all nodes, links, and flows.')) {
      // Stop simulation first if running
      if (isSimulating) {
        try {
          await fetch('http://localhost:3001/api/stop-simulation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topologyId: 'default' }),
          });
        } catch (error) {
          console.error('Failed to stop simulation:', error);
        }
      }
      // Reset all state (including metrics and simulation flag)
      reset();
    }
  };

  const handleExport = () => {
    const topology = exportTopology();
    const dataStr = JSON.stringify(topology, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `network-topology-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            importTopology(data);
          } catch (error) {
            alert('Failed to import topology. Invalid JSON file.');
            console.error(error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="h-14 bg-secondary/50 backdrop-blur-md border-b border-border flex items-center px-4 gap-2 z-50">
      <button
        onClick={handleRun}
        className={cn(
          "px-4 py-2 rounded-md flex items-center gap-2 transition-colors",
          isSimulating
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-primary hover:bg-primary/90 text-primary-foreground"
        )}
      >
        {isSimulating ? (
          <>
            <Square className="w-4 h-4" />
            Stop
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Run
          </>
        )}
      </button>

      <button
        onClick={handleReset}
        className="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 text-foreground flex items-center gap-2 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Reset
      </button>

      <div className="flex-1" />

      <button
        onClick={handleImport}
        className="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 text-foreground flex items-center gap-2 transition-colors"
      >
        <Upload className="w-4 h-4" />
        Import
      </button>

      <button
        onClick={handleExport}
        className="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 text-foreground flex items-center gap-2 transition-colors"
      >
        <Download className="w-4 h-4" />
        Export
      </button>

      <button
        onClick={() => setShowSettings(!showSettings)}
        className="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 text-foreground flex items-center gap-2 transition-colors"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
}
