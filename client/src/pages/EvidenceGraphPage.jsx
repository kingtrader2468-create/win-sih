import { useCallback, useEffect, useMemo, useState } from 'react';
import { Background, Controls, Handle, Position, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  AlertCircle,
  ArrowLeft,
  Database,
  Eye,
  FileText,
  MapPinned,
  Radio,
  ShipWheel,
  Workflow
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import EvidenceDrawer from '../components/EvidenceDrawer.jsx';
import { getEvidenceGraph, markEvidenceInvestigated } from '../services/apiClient.js';
import './EvidenceGraphPage.css';

const iconMap = {
  Finding: Workflow,
  Dataset: Database,
  Observation: Eye,
  Expedition: ShipWheel,
  Station: MapPinned,
  Publication: FileText,
  Media: Radio
};

const typeLevels = {
  Finding: 0,
  Publication: 1,
  Dataset: 1,
  Observation: 2,
  Expedition: 3,
  Station: 4,
  Media: 4
};

function EvidenceNode({ data, selected }) {
  const Icon = iconMap[data.type] || FileText;
  return (
    <div
      className={`evidence-custom-node flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest border transition-all cursor-pointer min-w-[210px] max-w-[240px] shadow-sm ${
        selected
          ? 'border-primary ring-2 ring-primary/40 shadow-md bg-primary-fixed/10'
          : 'border-surface-container-high/80 hover:border-primary/50'
      }`}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-outline-variant !border-none" />
      <div className="w-8 h-8 rounded-lg bg-surface-container-low text-primary flex items-center justify-center shrink-0 border border-surface-container-high/60">
        <Icon aria-hidden="true" size={16} />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <span className="font-data-tabular text-[9px] uppercase font-bold tracking-wider text-outline">
            {data.type}
          </span>
          {data.year && (
            <span className="font-data-tabular text-[10px] text-outline font-medium">
              {data.year}
            </span>
          )}
        </div>
        <strong className="font-title-sm text-xs font-bold text-on-surface line-clamp-2 leading-tight mt-0.5">
          {data.title}
        </strong>
      </div>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-outline-variant !border-none" />
    </div>
  );
}

const nodeTypes = { evidence: EvidenceNode };

function EvidenceGraphPage() {
  const { id } = useParams();
  const [graph, setGraph] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    getEvidenceGraph(id, controller.signal)
      .then((data) => {
        if (!ignore) {
          setGraph(data);
          const defaultNode = data.nodes?.find((node) => node.id === data.findingId) || data.nodes?.[0] || null;
          setSelectedNode(defaultNode);
          setStatus('success');
          markEvidenceInvestigated(id);
        }
      })
      .catch((requestError) => {
        if (!ignore && requestError.name !== 'AbortError') {
          setError(requestError.message);
          setStatus('error');
        }
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [id]);

  // Compute positioned nodes in left-to-right provenance columns
  const nodes = useMemo(() => {
    if (!graph?.nodes) return [];
    const levelCounts = {};

    return graph.nodes.map((node) => {
      const level = typeLevels[node.type] ?? 1;
      const countAtLevel = levelCounts[level] || 0;
      levelCounts[level] = countAtLevel + 1;

      const x = 50 + level * 280;
      const y = 60 + countAtLevel * 130;

      return {
        id: node.id,
        type: 'evidence',
        position: { x, y },
        data: node,
        selected: selectedNode?.id === node.id
      };
    });
  }, [graph, selectedNode]);

  // Compute directed edges with active highlighting
  const edges = useMemo(() => {
    if (!graph?.edges) return [];
    return graph.edges.map((edge) => {
      const isConnected = selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target);
      return {
        ...edge,
        animated: Boolean(isConnected),
        style: {
          stroke: isConnected ? '#1ea7e8' : '#cbd5e1',
          strokeWidth: isConnected ? 2.5 : 1.5
        },
        labelStyle: {
          fill: isConnected ? '#00658f' : '#64748b',
          fontSize: 11,
          fontWeight: isConnected ? 700 : 500
        }
      };
    });
  }, [graph, selectedNode]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node.data);
  }, []);

  if (status === 'idle' && !graph) {
    return (
      <div className="w-full bg-surface-container-lowest min-h-screen">
        <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl flex flex-col items-center justify-center min-h-[400px]">
          <span className="loading-mark" aria-hidden="true" />
          <p className="font-body-md text-on-surface-variant mt-3">Loading source evidence provenance graph…</p>
        </section>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-full bg-surface-container-lowest min-h-screen">
        <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-xl">
          <div className="bg-surface-container-lowest rounded-2xl p-space-xl border border-error/20 flex flex-col items-start gap-4 shadow-sm">
            <div className="flex items-center gap-3 text-error">
              <AlertCircle aria-hidden="true" size={24} />
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Evidence graph unavailable</h2>
            </div>
            <p className="font-body-md text-on-surface-variant">{error}</p>
            <Link className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-low text-on-surface font-label-md font-semibold hover:bg-surface-container transition-colors" to="/research">
              <ArrowLeft size={16} /> Back to Research Explorer
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const findingNode = graph?.nodes?.find((n) => n.id === graph.findingId);
  const relatedResearchId = findingNode?.relatedResearch;

  return (
    <div className="w-full bg-surface-container-lowest min-h-screen">
      <section className="max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg py-space-lg flex flex-col gap-space-lg">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Link
                className="inline-flex items-center gap-1.5 font-label-sm text-xs font-semibold text-primary hover:text-primary-container transition-colors"
                to={relatedResearchId ? `/research/${relatedResearchId}` : '/research'}
              >
                <ArrowLeft aria-hidden="true" size={14} /> Back to Research Resource
              </Link>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
                Scientific Provenance · MoES / NCPOR
              </span>
            </div>
            <h1 className="font-headline-lg lg:font-display-sm text-headline-lg lg:text-display-sm font-extrabold text-on-surface tracking-tight">
              Polar Evidence Graph
            </h1>
            <p className="font-body-md text-body-sm text-on-surface-variant max-w-2xl leading-relaxed">
              Trace this scientific finding through its complete provenance chain: observation datasets, expeditions, research station telemetry, publications, and media records.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low border border-surface-container-high text-on-surface font-data-tabular text-label-sm font-bold shadow-2xs">
              <Workflow size={14} className="text-primary" />
              {graph?.nodes?.length || 0} Connected Evidence Nodes
            </span>
          </div>
        </div>

        {/* Graph & Drawer Workspace */}
        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
          {/* ReactFlow Interactive Canvas */}
          <div className="lg:col-span-8 xl:col-span-9 bg-surface-container-low/40 relative min-h-[520px] lg:min-h-[620px]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodeClick={onNodeClick}
              fitView
              fitViewOptions={{ padding: 0.25 }}
              minZoom={0.3}
              maxZoom={1.5}
            >
              <Background color="#cbd5e1" gap={24} size={1} />
              <Controls showInteractive={false} className="!rounded-lg !shadow-sm !border !border-surface-container-high overflow-hidden" />
            </ReactFlow>

            {/* Canvas Legend Overlay */}
            <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 p-2 px-3 rounded-lg bg-surface-container-lowest/90 backdrop-blur-sm border border-surface-container-high/60 shadow-2xs text-[11px] font-data-tabular text-outline">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary" /> Finding
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-tertiary" /> Dataset
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-secondary" /> Observation
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-outline" /> Station / Expedition
              </span>
            </div>
          </div>

          {/* Evidence Drawer Inspector */}
          <div className="lg:col-span-4 xl:col-span-3 border-t lg:border-t-0 lg:border-l border-surface-container-high/60 bg-surface-container-lowest flex flex-col">
            <EvidenceDrawer
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default EvidenceGraphPage;
