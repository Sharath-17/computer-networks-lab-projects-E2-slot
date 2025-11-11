import { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  Panel,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, Link as LinkIcon, MousePointer2, Zap } from 'lucide-react';
import { useNetworkStore } from '@/store/networkStore';
import CustomNode from './Node';
import { motion } from 'framer-motion';

const nodeTypes = {
  custom: CustomNode,
};

export default function Canvas() {
  const {
    nodes: storeNodes,
    links: storeLinks,
    addNode: addStoreNode,
    addLink: addStoreLink,
    updateNode: updateStoreNode,
  } = useNetworkStore();

  // Convert store nodes to React Flow format
  const convertStoreNodesToReactFlow = useCallback((storeNodes: any[]) => {
    return storeNodes.map((node) => ({
      id: node.id,
      type: 'custom',
      position: node.position,
      data: { label: node.label },
    }));
  }, []);

  // Convert store links to React Flow edges
  const convertStoreLinksToReactFlow = useCallback((storeLinks: any[]) => {
    return storeLinks.map((link) => ({
      id: link.id,
      source: link.source,
      target: link.target,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed },
    }));
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(
    convertStoreNodesToReactFlow(storeNodes)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    convertStoreLinksToReactFlow(storeLinks)
  );

  // Sync store changes to React Flow
  useEffect(() => {
    setNodes(convertStoreNodesToReactFlow(storeNodes));
  }, [storeNodes, convertStoreNodesToReactFlow, setNodes]);

  useEffect(() => {
    setEdges(convertStoreLinksToReactFlow(storeLinks));
  }, [storeLinks, convertStoreLinksToReactFlow, setEdges]);

  const [mode, setMode] = useState<'select' | 'add-node' | 'add-link' | 'test'>('select');
  const [linkSource, setLinkSource] = useState<string | null>(null);
  const nodeIdCounter = useRef(1);

  // Sync React Flow node changes to store
  const onNodesChangeInternal = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      
      // Update store when nodes are dragged or changed
      changes.forEach((change: any) => {
        if (change.type === 'position' && change.position) {
          updateStoreNode(change.id, { position: change.position });
        }
      });
    },
    [onNodesChange, updateStoreNode]
  );

  const onEdgesChangeInternal = useCallback(
    (changes: any) => {
      onEdgesChange(changes);
      // Edge changes are mostly handled by add/delete operations
    },
    [onEdgesChange]
  );

  const handleAddNode = useCallback(() => {
    const newNode: Node = {
      id: `node-${nodeIdCounter.current++}`,
      type: 'custom',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
      data: {
        label: `Node ${nodeIdCounter.current - 1}`,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    addStoreNode({
      id: newNode.id,
      label: newNode.data.label,
      position: newNode.position,
    });
    setMode('select');
  }, [setNodes, addStoreNode]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target && params.source !== params.target) {
        const newEdge = {
          ...params,
          id: `edge-${Date.now()}`,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
        };
        setEdges((eds) => addEdge(newEdge as Edge, eds));
        addStoreLink({
          id: newEdge.id!,
          source: params.source,
          target: params.target,
        });
        if (mode === 'add-link') {
          setLinkSource(null);
          setMode('select');
        }
      }
    },
    [setEdges, addStoreLink, mode]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (mode === 'add-link') {
        if (!linkSource) {
          setLinkSource(node.id);
        } else if (linkSource !== node.id) {
          onConnect({ source: linkSource, target: node.id, sourceHandle: null, targetHandle: null });
          setLinkSource(null);
          setMode('select');
        }
      }
    },
    [mode, linkSource, onConnect]
  );

  const onPaneClick = useCallback(() => {
    if (mode === 'add-node') {
      handleAddNode();
    }
  }, [mode, handleAddNode]);


  const handleTest = useCallback(() => {
    if (nodes.length < 2) {
      alert('Add at least 2 nodes to test connectivity');
      return;
    }
    alert('Test mode: Click on nodes to check connectivity');
    setMode('test');
  }, [nodes.length]);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeInternal}
        onEdgesChange={onEdgesChangeInternal}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            return 'hsl(var(--primary))';
          }}
          maskColor="hsl(var(--background) / 0.8)"
        />
        <Panel position="top-left" className="m-4">
          <div className="bg-secondary/80 backdrop-blur-md rounded-lg border border-border p-2 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode('select')}
              className={`p-2 rounded transition-colors ${
                mode === 'select'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80 text-foreground'
              }`}
              title="Select"
            >
              <MousePointer2 className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddNode}
              className={`p-2 rounded transition-colors ${
                mode === 'add-node'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80 text-foreground'
              }`}
              title="Add Node"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setMode('add-link');
                setLinkSource(null);
              }}
              className={`p-2 rounded transition-colors ${
                mode === 'add-link'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80 text-foreground'
              }`}
              title="Add Link"
            >
              <LinkIcon className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTest}
              className={`p-2 rounded transition-colors ${
                mode === 'test'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80 text-foreground'
              }`}
              title="Test"
            >
              <Zap className="w-5 h-5" />
            </motion.button>
          </div>
        </Panel>
      </ReactFlow>

      <style>{`
        .react-flow__node {
          cursor: ${mode === 'add-link' ? 'crosshair' : 'grab'};
        }
        .react-flow__node:active {
          cursor: ${mode === 'add-link' ? 'crosshair' : 'grabbing'};
        }
        .react-flow__node.selected {
          outline: 2px solid hsl(var(--primary));
        }
      `}</style>
    </div>
  );
}
