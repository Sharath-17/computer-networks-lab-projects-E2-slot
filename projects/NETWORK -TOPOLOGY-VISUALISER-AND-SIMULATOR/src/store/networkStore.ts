import { create } from 'zustand';
import { Node, Link, TrafficFlow, NetworkMetrics } from '@/types';

interface NetworkState {
  nodes: Node[];
  links: Link[];
  flows: TrafficFlow[];
  metrics: NetworkMetrics[];
  isSimulating: boolean;
  selectedMetric: 'latency' | 'throughput' | 'jitter' | 'packetLoss';
  
  // Node actions
  addNode: (node: Node) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  deleteNode: (id: string) => void;
  
  // Link actions
  addLink: (link: Link) => void;
  deleteLink: (id: string) => void;
  
  // Flow actions
  addFlow: (flow: TrafficFlow) => void;
  deleteFlow: (id: string) => void;
  updateFlow: (id: string, updates: Partial<TrafficFlow>) => void;
  
  // Metrics actions
  addMetric: (metric: NetworkMetrics) => void;
  clearMetrics: () => void;
  setSelectedMetric: (metric: 'latency' | 'throughput' | 'jitter' | 'packetLoss') => void;
  
  // Simulation actions
  setSimulating: (isSimulating: boolean) => void;
  
  // Reset
  reset: () => void;
  
  // Import/Export
  importTopology: (data: { nodes: Node[]; links: Link[]; flows: TrafficFlow[] }) => void;
  exportTopology: () => { nodes: Node[]; links: Link[]; flows: TrafficFlow[] };
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  nodes: [],
  links: [],
  flows: [],
  metrics: [],
  isSimulating: false,
  selectedMetric: 'latency',

  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  
  updateNode: (id, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      ),
    })),
  
  deleteNode: (id) =>
    set((state) => {
      // Also delete associated links and flows
      const newLinks = state.links.filter(
        (link) => link.source !== id && link.target !== id
      );
      const newFlows = state.flows.filter(
        (flow) => flow.source !== id && flow.destination !== id
      );
      return {
        nodes: state.nodes.filter((node) => node.id !== id),
        links: newLinks,
        flows: newFlows,
      };
    }),

  addLink: (link) =>
    set((state) => {
      // Check if link already exists
      const exists = state.links.some(
        (l) =>
          (l.source === link.source && l.target === link.target) ||
          (l.source === link.target && l.target === link.source)
      );
      if (exists) return state;
      return { links: [...state.links, link] };
    }),
  
  deleteLink: (id) =>
    set((state) => ({
      links: state.links.filter((link) => link.id !== id),
    })),

  addFlow: (flow) => set((state) => ({ flows: [...state.flows, flow] })),
  
  deleteFlow: (id) =>
    set((state) => ({
      flows: state.flows.filter((flow) => flow.id !== id),
    })),
  
  updateFlow: (id, updates) =>
    set((state) => ({
      flows: state.flows.map((flow) =>
        flow.id === id ? { ...flow, ...updates } : flow
      ),
    })),

  addMetric: (metric) =>
    set((state) => {
      const newMetrics = [...state.metrics, { ...metric, timestamp: Date.now() }];
      // Keep only last 60 metrics (1 minute at 1s intervals)
      return { metrics: newMetrics.slice(-60) };
    }),
  
  clearMetrics: () => set({ metrics: [] }),
  
  setSelectedMetric: (metric) => set({ selectedMetric: metric }),

  setSimulating: (isSimulating) => set({ isSimulating }),

  reset: () =>
    set({
      nodes: [],
      links: [],
      flows: [],
      metrics: [],
      isSimulating: false,
    }),

  importTopology: (data) =>
    set({
      nodes: data.nodes,
      links: data.links,
      flows: data.flows,
    }),

  exportTopology: () => {
    const state = get();
    return {
      nodes: state.nodes,
      links: state.links,
      flows: state.flows,
    };
  },
}));
