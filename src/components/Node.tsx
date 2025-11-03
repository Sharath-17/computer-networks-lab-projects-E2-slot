import { useCallback, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Trash2, Edit2 } from 'lucide-react';
import { useNetworkStore } from '@/store/networkStore';
import { motion } from 'framer-motion';

export default function CustomNode({ id, data, selected }: NodeProps) {
  const { updateNode, deleteNode } = useNetworkStore();
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || id);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm('Delete this node?')) {
        deleteNode(id);
      }
    },
    [id, deleteNode]
  );

  const handleLabelChange = useCallback(() => {
    updateNode(id, { label });
    setIsEditing(false);
  }, [id, label, updateNode]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleDelete(e);
    },
    [handleDelete]
  );

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`relative group ${selected ? 'ring-2 ring-primary' : ''}`}
      onContextMenu={handleContextMenu}
    >
      <Handle type="target" position={Position.Top} />
      
      <div className="bg-secondary border-2 border-border rounded-lg px-4 py-3 min-w-[120px] shadow-lg">
        {isEditing ? (
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleLabelChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleLabelChange();
              if (e.key === 'Escape') {
                setLabel(data.label || id);
                setIsEditing(false);
              }
            }}
            className="w-full bg-background border border-border rounded px-2 py-1 text-sm text-foreground"
            autoFocus
          />
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-foreground cursor-default">
              {label}
            </span>
            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="p-1 hover:bg-secondary rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title="Edit node"
              >
                <Edit2 className="w-3 h-3 text-muted-foreground hover:text-foreground" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 hover:bg-red-600/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete node (or right-click)"
              >
                <Trash2 className="w-3 h-3 text-red-400 hover:text-red-300" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </motion.div>
  );
}
