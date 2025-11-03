export interface Node {
  id: string;
  label: string;
  position: { x: number; y: number };
  type?: string;
}

export interface Link {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface TrafficFlow {
  id: string;
  source: string;
  destination: string;
  bandwidth: number; // Mbps
  duration: number; // seconds
}

export interface NetworkMetrics {
  latency: number; // ms
  throughput: number; // Mbps
  jitter: number; // ms
  packetLoss: number; // %
  timestamp?: number;
}

export interface TopologyData {
  nodes: Node[];
  links: Link[];
  flows: TrafficFlow[];
}
