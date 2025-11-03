import { Plus, Trash2, Network } from 'lucide-react';
import { useNetworkStore } from '@/store/networkStore';
import { TrafficFlow } from '@/types';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SidebarLeft() {
  const { nodes, flows, addFlow, deleteFlow, updateFlow } = useNetworkStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newFlow, setNewFlow] = useState<Partial<TrafficFlow>>({
    source: '',
    destination: '',
    bandwidth: 10,
    duration: 60,
  });

  const handleAddFlow = () => {
    if (!newFlow.source || !newFlow.destination || newFlow.source === newFlow.destination) {
      alert('Please select different source and destination nodes');
      return;
    }

    addFlow({
      id: `flow-${Date.now()}`,
      source: newFlow.source!,
      destination: newFlow.destination!,
      bandwidth: newFlow.bandwidth || 10,
      duration: newFlow.duration || 60,
    });

    setNewFlow({
      source: '',
      destination: '',
      bandwidth: 10,
      duration: 60,
    });
    setShowAddDialog(false);
  };

  return (
    <div className="w-80 bg-secondary/30 backdrop-blur-md border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Network className="w-5 h-5" />
          Traffic Generators
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          <AnimatePresence>
            {flows.map((flow) => {
              const sourceNode = nodes.find((n) => n.id === flow.source);
              const destNode = nodes.find((n) => n.id === flow.destination);

              return (
                <motion.div
                  key={flow.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-secondary/50 p-3 rounded-lg border border-border"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {sourceNode?.label || flow.source} → {destNode?.label || flow.destination}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {flow.bandwidth} Mbps • {flow.duration}s
                      </div>
                    </div>
                    <button
                      onClick={() => deleteFlow(flow.id)}
                      className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {flows.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No traffic flows. Click "Add" to create one.
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <button
          onClick={() => setShowAddDialog(true)}
          disabled={nodes.length < 2}
          className="w-full px-4 py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Flow
        </button>
      </div>

      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-secondary p-6 rounded-lg border border-border w-96"
          >
            <h3 className="text-lg font-semibold mb-4">Add Traffic Flow</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Source Node</label>
                <select
                  value={newFlow.source}
                  onChange={(e) => setNewFlow({ ...newFlow, source: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
                >
                  <option value="">Select source...</option>
                  {nodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Destination Node</label>
                <select
                  value={newFlow.destination}
                  onChange={(e) => setNewFlow({ ...newFlow, destination: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
                >
                  <option value="">Select destination...</option>
                  {nodes
                    .filter((n) => n.id !== newFlow.source)
                    .map((node) => (
                      <option key={node.id} value={node.id}>
                        {node.label}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Bandwidth (Mbps)</label>
                <input
                  type="number"
                  min="1"
                  value={newFlow.bandwidth}
                  onChange={(e) => setNewFlow({ ...newFlow, bandwidth: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Duration (seconds)</label>
                <input
                  type="number"
                  min="1"
                  value={newFlow.duration}
                  onChange={(e) => setNewFlow({ ...newFlow, duration: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowAddDialog(false)}
                className="flex-1 px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFlow}
                className="flex-1 px-4 py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
              >
                Add
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
