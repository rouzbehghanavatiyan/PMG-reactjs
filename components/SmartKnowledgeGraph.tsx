import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Network,
  MessageSquare,
  Database,
  Upload,
  Trash2,
  Search,
  Plus,
  Info,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  RefreshCw,
  FileText,
  ThumbsUp,
  ThumbsDown,
  ZoomIn,
  ZoomOut,
  Edit,
} from "lucide-react";
import { useLanguage } from "../src/contexts/LanguageContext";
import { useHasPermission } from "../src/hooks/usePermissions";
import { useMediaQuery } from "react-responsive";
import { useAppSelector } from "../src/features/store";

const baseURL = "http://172.16.10.15:3001";

interface GraphDoc {
  id: number;
  title: string;
  file_name: string;
  is_enabled: boolean;
  entity_count: number;
  relation_count: number;
  strict_mode: boolean;
  created_at: string;
}

interface ChatSession {
  id: string;
  title: string;
  active_document_ids: string[];
  created_at: string;
}

interface Message {
  id?: number;
  role: "user" | "model";
  text: string;
  reaction?: string | null;
  subgraph?: Subgraph;
  communities?: any[] | null;
}

interface SubgraphNode {
  id: string;
  type: string;
  val: number;
  description: string;
  x?: number;
  y?: number;
}

interface SubgraphLink {
  source: string;
  target: string;
  label: string;
  description: string;
}

interface Subgraph {
  nodes: SubgraphNode[];
  links: SubgraphLink[];
}

// --- MARKDOWN AND RICH-TEXT FORMATTING HELPERS ---
const parseBoldAndItalicsOnly = (
  text: string,
  baseKey: string,
): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let keyIdx = 0;

  // Split by '**' to find bold blocks.
  // Every odd index in the split result is a bold block (if closed properly).
  // If the last block is opened but not closed, we treat it as normal text.
  const boldParts = text.split("**");

  boldParts.forEach((boldBlock, boldIdx) => {
    const isBold = boldIdx % 2 === 1 && boldIdx < boldParts.length; // only odd indices are bolded

    // Within this block (whether bold or normal), parse italics '*'
    const italicParts = boldBlock.split("*");
    const blockNodes: React.ReactNode[] = [];

    italicParts.forEach((italicBlock, italicIdx) => {
      const isItalic = italicIdx % 2 === 1 && italicIdx < italicParts.length;

      const key = `${baseKey}-${boldIdx}-${italicIdx}-${keyIdx++}`;
      if (isItalic) {
        blockNodes.push(
          <em key={key} className="italic text-bmw-text/90 font-medium">
            {italicBlock}
          </em>,
        );
      } else {
        blockNodes.push(<span key={key}>{italicBlock}</span>);
      }
    });

    const blockKey = `${baseKey}-block-${boldIdx}-${keyIdx++}`;
    if (isBold) {
      parts.push(
        <strong
          key={blockKey}
          className="font-extrabold text-bmw-blue bg-bmw-blue/5 px-1.5 py-0.5 rounded mx-0.5 border border-bmw-blue/10"
        >
          {blockNodes}
        </strong>,
      );
    } else {
      parts.push(...blockNodes);
    }
  });

  return parts;
};

const parseRichInlineStyles = (
  text: string,
  baseKey: number,
): React.ReactNode[] => {
  const codeParts = text.split("`");
  if (codeParts.length > 1) {
    return codeParts.flatMap((part, idx) => {
      const currentKey = `${baseKey}-code-${idx}`;
      if (idx % 2 === 1) {
        return [
          <code
            key={currentKey}
            className="font-mono text-xs bg-bmw-border text-red-400 px-1.5 py-0.5 rounded mx-0.5 border border-bmw-border/50"
          >
            {part}
          </code>,
        ];
      } else {
        return parseBoldAndItalicsOnly(part, currentKey);
      }
    });
  }

  return parseBoldAndItalicsOnly(text, String(baseKey));
};

const parseInlineStyles = (chunkText: string, isRtl: boolean) => {
  if (!chunkText) return "";

  const docRegex = /\[[Dd]ocument\s*:\s*([^\]]+)\]/gi;
  const parts: React.ReactNode[] = [];
  let currentText = chunkText;
  let key = 0;
  let match;
  let lastIndex = 0;

  while ((match = docRegex.exec(currentText)) !== null) {
    const matchIndex = match.index;
    const docTitle = match[1];

    if (matchIndex > lastIndex) {
      parts.push(
        ...parseRichInlineStyles(
          currentText.substring(lastIndex, matchIndex),
          key++,
        ),
      );
    }

    parts.push(
      <span
        key={`doc-${key++}`}
        className="inline-flex items-center gap-1 px-2 py-0.5 mx-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[11px] font-bold transition-all shadow-sm"
        title={isRtl ? `سند مرجع: ${docTitle}` : `Source Document: ${docTitle}`}
      >
        📖 {isRtl ? "سند مرجع:" : "Source:"}{" "}
        <span className="underline decoration-dotted font-medium">
          {docTitle}
        </span>
      </span>,
    );

    lastIndex = docRegex.lastIndex;
  }

  if (lastIndex < currentText.length) {
    parts.push(
      ...parseRichInlineStyles(currentText.substring(lastIndex), key++),
    );
  }

  return parts.length > 0 ? parts : chunkText;
};

const formatResponseText = (text: string, isRtl: boolean) => {
  if (!text) return "";

  const lines = text.split("\n");
  const renderedElements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLanguage = "";

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const trimmed = line.trim();

    // Handle code block boundaries
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        const codeText = codeBlockLines.join("\n");
        renderedElements.push(
          <div
            key={`codeblock-container-${lineIdx}`}
            className="my-3 overflow-hidden rounded-lg border border-bmw-border shadow-md bg-zinc-950 font-mono text-[11px] text-zinc-200 w-full"
          >
            {codeBlockLanguage && (
              <div className="bg-zinc-900 px-4 py-1.5 border-b border-zinc-800 text-zinc-400 text-[10px] flex justify-between items-center select-none">
                <span>{codeBlockLanguage}</span>
                <span>Code</span>
              </div>
            )}
            <pre
              className="p-4 overflow-x-auto whitespace-pre leading-relaxed custom-scrollbar text-left"
              dir="ltr"
            >
              <code>{codeText}</code>
            </pre>
          </div>,
        );
        inCodeBlock = false;
        codeBlockLines = [];
        codeBlockLanguage = "";
      } else {
        inCodeBlock = true;
        codeBlockLanguage = trimmed.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Check if it's a horizontal rule
    if (trimmed === "---" || trimmed === "***") {
      renderedElements.push(
        <hr
          key={lineIdx}
          className="my-4 border-t-2 border-dashed border-bmw-border opacity-70"
        />,
      );
      continue;
    }

    // Check if it's a heading
    if (line.startsWith("### ")) {
      renderedElements.push(
        <h3
          key={lineIdx}
          className="text-sm md:text-base font-extrabold text-bmw-blue mt-4 mb-2 flex items-center gap-1.5 border-b border-bmw-border pb-1"
        >
          <span className="h-3.5 w-1 bg-bmw-blue rounded-full"></span>
          {parseInlineStyles(line.slice(4), isRtl)}
        </h3>,
      );
      continue;
    }
    if (line.startsWith("## ")) {
      renderedElements.push(
        <h2
          key={lineIdx}
          className="text-base md:text-lg font-black text-bmw-blue mt-5 mb-2.5 flex items-center gap-1.5"
        >
          <span className="h-4 w-1.5 bg-bmw-blue rounded-full"></span>
          {parseInlineStyles(line.slice(3), isRtl)}
        </h2>,
      );
      continue;
    }
    if (line.startsWith("# ")) {
      renderedElements.push(
        <h1
          key={lineIdx}
          className="text-lg md:text-xl font-black text-bmw-blue mt-6 mb-3 border-b-2 border-bmw-border pb-1.5 flex items-center gap-2"
        >
          <span className="h-5 w-2 bg-bmw-blue rounded-full"></span>
          {parseInlineStyles(line.slice(2), isRtl)}
        </h1>,
      );
      continue;
    }

    // Check if it's a bullet list
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      const cleanLine = trimmed.substring(2);
      renderedElements.push(
        <div
          key={lineIdx}
          className="flex items-start gap-2 my-1 pl-4 rtl:pl-0 rtl:pr-4"
        >
          <span className="text-bmw-blue font-bold mt-1 text-[10px] shrink-0 select-none">
            •
          </span>
          <span className="flex-1 text-xs md:text-sm text-bmw-text leading-relaxed">
            {parseInlineStyles(cleanLine, isRtl)}
          </span>
        </div>,
      );
      continue;
    }

    // Check if it's a numbered list
    const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
    if (numMatch) {
      renderedElements.push(
        <div
          key={lineIdx}
          className="flex items-start gap-2 my-1 pl-4 rtl:pl-0 rtl:pr-4"
        >
          <span className="text-bmw-blue font-bold font-mono text-[10px] shrink-0 select-none">
            {numMatch[1]}.
          </span>
          <span className="flex-1 text-xs md:text-sm text-bmw-text leading-relaxed">
            {parseInlineStyles(numMatch[2], isRtl)}
          </span>
        </div>,
      );
      continue;
    }

    // Empty lines act as small spacing buffers
    if (trimmed === "") {
      renderedElements.push(<div key={lineIdx} className="h-2" />);
      continue;
    }

    // Default body paragraph
    renderedElements.push(
      <p
        key={lineIdx}
        className="text-xs md:text-sm my-1 text-bmw-text leading-relaxed whitespace-pre-wrap"
      >
        {parseInlineStyles(line, isRtl)}
      </p>,
    );
  }

  if (inCodeBlock && codeBlockLines.length > 0) {
    const codeText = codeBlockLines.join("\n");
    renderedElements.push(
      <div
        key="unfinished-codeblock"
        className="my-3 overflow-hidden rounded-lg border border-bmw-border shadow-md bg-zinc-950 font-mono text-[11px] text-zinc-200"
      >
        <pre
          className="p-4 overflow-x-auto whitespace-pre leading-relaxed custom-scrollbar text-left"
          dir="ltr"
        >
          <code>{codeText}</code>
        </pre>
      </div>,
    );
  }

  return renderedElements;
};

// --- INTERACTIVE SVG GRAPH VISUALIZER ---
const InteractiveGraph: React.FC<{ subgraph: Subgraph; isRtl: boolean }> = ({
  subgraph,
  isRtl,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 400 });
  const [hoveredNode, setHoveredNode] = useState<SubgraphNode | null>(null);
  const [hoveredLink, setHoveredLink] = useState<SubgraphLink | null>(null);
  const [selectedNode, setSelectedNode] = useState<SubgraphNode | null>(null);

  // Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Node Manual Drag state
  const [customNodePositions, setCustomNodePositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const draggedNodeStart = useRef({ x: 0, y: 0 });
  const draggedNodeOffset = useRef({ x: 0, y: 0 });
  const hasMovedNode = useRef(false);

  // Reset custom layout when subgraph query changes
  useEffect(() => {
    setCustomNodePositions({});
  }, [subgraph]);

  // Measure container
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width: width || 500, height: height || 400 });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { nodes, links } = subgraph;
  const { width, height } = dimensions;

  const [activeFilter, setActiveFilter] = useState<
    "all" | "semantic" | "structural"
  >("all");

  const filteredNodes = nodes.filter((node) => {
    const typeLower = node.type?.toLowerCase() || "";
    const isStructural = ["document", "section", "paragraph"].includes(
      typeLower,
    );
    if (activeFilter === "semantic") return !isStructural;
    if (activeFilter === "structural") return isStructural;
    return true; // 'all'
  });

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

  const filteredLinks = links.filter((link) => {
    return filteredNodeIds.has(link.source) && filteredNodeIds.has(link.target);
  });

  // Simple static circular/random force placement layout for safety and simplicity
  // Place nodes on an elegant layout around a center
  const center = { x: width / 2, y: height / 2 };

  // Calculate node positions with custom positions override
  const computedNodes = filteredNodes.map((node, index) => {
    if (customNodePositions[node.id]) {
      return { ...node, ...customNodePositions[node.id] };
    }

    if (filteredNodes.length === 1) {
      return { ...node, x: center.x, y: center.y };
    }
    // Distribute nodes elegantly in concentric circles or double rings
    const ring = index % 2 === 0 ? 1 : 2;
    const ringRadius =
      ring === 1
        ? Math.min(width, height) * 0.22
        : Math.min(width, height) * 0.38;
    const angle = (index / filteredNodes.length) * 2 * Math.PI + ring * 0.5;

    return {
      ...node,
      x: center.x + ringRadius * Math.cos(angle),
      y: center.y + ringRadius * Math.sin(angle),
    };
  });

  // Create a map to fetch computed positions easily
  const nodePosMap = new Map<string, { x: number; y: number }>();
  computedNodes.forEach((node) => {
    nodePosMap.set(node.id, { x: node.x, y: node.y });
  });

  // Assign distinct node colors based on entity types
  const getNodeColor = (type: string) => {
    const t = type?.toLowerCase() || "";
    if (t === "document") return "#ec4899"; // Pink
    if (t === "section") return "#14b8a6"; // Teal
    if (t === "paragraph") return "#06b6d4"; // Cyan
    if (t.includes("person") || t.includes("individual")) return "#3b82f6"; // Blue
    if (
      t.includes("organization") ||
      t.includes("company") ||
      t.includes("dealer")
    )
      return "#10b981"; // Green
    if (t.includes("brand")) return "#8b5cf6"; // Purple
    if (t.includes("product") || t.includes("car")) return "#f59e0b"; // Amber
    if (t.includes("policy") || t.includes("rule")) return "#ef4444"; // Red
    return "#6b7280"; // Gray
  };

  // Zoom In / Out / Reset functions
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.15, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.15, 0.4));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setCustomNodePositions({}); // Reset custom offsets as well
  };

  // Mouse/Touch panning and node dragging events
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return; // Only left-click drags
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggedNodeId) {
      const dx = (e.clientX - draggedNodeStart.current.x) / zoom;
      const dy = (e.clientY - draggedNodeStart.current.y) / zoom;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMovedNode.current = true;
      }
      setCustomNodePositions((prev) => ({
        ...prev,
        [draggedNodeId]: {
          x: draggedNodeOffset.current.x + dx,
          y: draggedNodeOffset.current.y + dy,
        },
      }));
      return;
    }
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNodeId(null);
  };

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (draggedNodeId && e.touches.length === 1) {
      const dx = (e.touches[0].clientX - draggedNodeStart.current.x) / zoom;
      const dy = (e.touches[0].clientY - draggedNodeStart.current.y) / zoom;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMovedNode.current = true;
      }
      setCustomNodePositions((prev) => ({
        ...prev,
        [draggedNodeId]: {
          x: draggedNodeOffset.current.x + dx,
          y: draggedNodeOffset.current.y + dy,
        },
      }));
      return;
    }
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.current.x,
      y: e.touches[0].clientY - dragStart.current.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setDraggedNodeId(null);
  };

  return (
    <div
      className="relative border border-bmw-border bg-bmw-base/50 rounded-xl overflow-hidden h-[420px]"
      ref={containerRef}
    >
      {/* Visual Header / Legend / Controls */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-3 items-center justify-between z-20">
        {/* Graph Mode Buttons */}
        <div className="flex items-center gap-1 bg-bmw-surface/90 border border-bmw-border p-1 rounded-lg backdrop-blur shadow-md pointer-events-auto">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
              activeFilter === "all"
                ? "bg-bmw-blue text-white shadow-sm"
                : "text-bmw-text-sec hover:text-bmw-text"
            }`}
          >
            {isRtl ? "ترکیبی (کل گراف)" : "Combined"}
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("semantic")}
            className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
              activeFilter === "semantic"
                ? "bg-bmw-blue text-white shadow-sm"
                : "text-bmw-text-sec hover:text-bmw-text"
            }`}
          >
            {isRtl ? "محتوایی (Semantic)" : "Semantic"}
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("structural")}
            className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
              activeFilter === "structural"
                ? "bg-bmw-blue text-white shadow-sm"
                : "text-bmw-text-sec hover:text-bmw-text"
            }`}
          >
            {isRtl ? "ساختار سند (Hierarchy)" : "Structure"}
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 text-[9px] font-mono bg-bmw-surface/80 border border-bmw-border px-2 py-1 rounded backdrop-blur pointer-events-none items-center">
          <span className="text-[10px] font-mono text-bmw-text-sec flex items-center gap-1 border-r border-bmw-border pr-2 rtl:border-r-0 rtl:border-l rtl:pr-0 rtl:pl-2 mr-1">
            <Network size={11} className="text-bmw-blue" />(
            {filteredNodes.length} N, {filteredLinks.length} L)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {isRtl ? "شخص" : "Person"}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {isRtl ? "سازمان" : "Org"}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            {isRtl ? "برند" : "Brand"}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {isRtl ? "محصول" : "Product"}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
            {isRtl ? "سند" : "Doc"}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            {isRtl ? "بخش" : "Sec"}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            {isRtl ? "بند" : "Para"}
          </span>
        </div>
      </div>

      {/* Floating Zoom & Pan Controls */}
      {filteredNodes.length > 0 && (
        <div className="absolute top-16 right-3 flex flex-col gap-1.5 z-20">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 rounded-lg bg-bmw-surface/90 border border-bmw-border text-bmw-text hover:text-bmw-blue hover:bg-bmw-hover transition-all shadow-md flex items-center justify-center"
            title={isRtl ? "بزرگنمایی" : "Zoom In"}
          >
            <ZoomIn size={15} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 rounded-lg bg-bmw-surface/90 border border-bmw-border text-bmw-text hover:text-bmw-blue hover:bg-bmw-hover transition-all shadow-md flex items-center justify-center"
            title={isRtl ? "کوچکنمایی" : "Zoom Out"}
          >
            <ZoomOut size={15} />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-2 rounded-lg bg-bmw-surface/90 border border-bmw-border text-bmw-text hover:text-bmw-blue hover:bg-bmw-hover transition-all shadow-md flex items-center justify-center"
            title={isRtl ? "بازنشانی نما" : "Reset View"}
          >
            <RefreshCw size={13} className="animate-hover:spin" />
          </button>
        </div>
      )}

      {filteredNodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <Network size={44} className="text-bmw-border animate-pulse mb-3" />
          <p className="text-xs text-bmw-text-sec max-w-xs leading-relaxed">
            {nodes.length > 0
              ? isRtl
                ? "در این حالتِ فیلتر گراف، هیچ گره‌ای یافت نشد. حالت ترکیبی یا حالت دیگر را امتحان کنید."
                : "No nodes found for this filter. Try changing the graph mode above."
              : isRtl
                ? "گراف دانش در این بخش ظاهر خواهد شد. برای مشاهده ارتباطات مفاهیم، سوالی بپرسید."
                : "Knowledge sub-graph will render here. Ask a query to inspect entity relationship networks."}
          </p>
        </div>
      ) : (
        <svg
          className={`w-full h-full select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          viewBox={`0 0 ${width} ${height}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#4b5563" />
            </marker>
          </defs>

          {/* Group wrapper applying translation and scaling zoom */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Links Layer */}
            {filteredLinks.map((link, idx) => {
              const start = nodePosMap.get(link.source);
              const end = nodePosMap.get(link.target);
              if (!start || !end) return null;

              const isHovered =
                hoveredLink === link ||
                (hoveredNode &&
                  (hoveredNode.id === link.source ||
                    hoveredNode.id === link.target));

              return (
                <g key={`link-${idx}`} className="transition-all duration-300">
                  {/* Invisible thicker path for easier hover */}
                  <path
                    d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="8"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredLink(link)}
                    onMouseLeave={() => setHoveredLink(null)}
                  />

                  {/* Visible line */}
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={isHovered ? "#1c69d4" : "#374151"}
                    strokeWidth={isHovered ? 2.5 : 1.2}
                    strokeDasharray={isHovered ? "4,4" : undefined}
                    markerEnd="url(#arrow)"
                    className="transition-all duration-200"
                  />

                  {/* Connection Label */}
                  <g
                    transform={`translate(${(start.x + end.x) / 2}, ${(start.y + end.y) / 2 - 4})`}
                  >
                    <rect
                      x="-35"
                      y="-6"
                      width="70"
                      height="12"
                      className="fill-bmw-surface stroke-bmw-border opacity-95"
                      rx="3"
                      strokeWidth="0.5"
                    />
                    <text
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      className="text-[7px] font-mono font-semibold fill-bmw-text-sec"
                    >
                      {link.label.length > 12
                        ? link.label.substring(0, 10) + ".."
                        : link.label}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Nodes Layer */}
            {computedNodes.map((node) => {
              const isHovered =
                hoveredNode === node ||
                (hoveredLink &&
                  (hoveredLink.source === node.id ||
                    hoveredLink.target === node.id));
              const isSelected = selectedNode === node;
              const size = node.val === 1.5 ? 14 : 10;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onMouseDown={(e) => {
                    e.stopPropagation(); // prevent SVG panning
                    setDraggedNodeId(node.id);
                    hasMovedNode.current = false;
                    draggedNodeStart.current = { x: e.clientX, y: e.clientY };
                    draggedNodeOffset.current = { x: node.x, y: node.y };
                  }}
                  onTouchStart={(e) => {
                    if (e.touches.length === 1) {
                      e.stopPropagation(); // prevent SVG panning
                      setDraggedNodeId(node.id);
                      hasMovedNode.current = false;
                      draggedNodeStart.current = {
                        x: e.touches[0].clientX,
                        y: e.touches[0].clientY,
                      };
                      draggedNodeOffset.current = { x: node.x, y: node.y };
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Prevent select action if it was primarily a drag
                    if (!hasMovedNode.current) {
                      setSelectedNode(node === selectedNode ? null : node);
                    }
                  }}
                >
                  {/* Node Outer Ring Highlight */}
                  {(isHovered || isSelected) && (
                    <circle
                      r={size + 6}
                      fill="none"
                      stroke={getNodeColor(node.type)}
                      strokeWidth="1.5"
                      className="opacity-70 animate-ping"
                      style={{ animationDuration: "3s" }}
                    />
                  )}

                  {/* Node Base */}
                  <circle
                    r={size}
                    fill={getNodeColor(node.type)}
                    stroke="#111215"
                    strokeWidth="2"
                    className="shadow-lg transition-transform hover:scale-110"
                  />

                  {/* Inner core */}
                  <circle
                    r={size * 0.4}
                    fill="#ffffff"
                    className="opacity-20"
                  />

                  {/* Text Label Backdrop */}
                  <g transform={`translate(0, ${size + 11})`}>
                    <rect
                      x={-(node.id.length * 3.5) - 4}
                      y="-7"
                      width={node.id.length * 7 + 8}
                      height="13"
                      className="fill-bmw-surface stroke-bmw-border opacity-95"
                      rx="4"
                      strokeWidth="0.5"
                    />
                    <text
                      textAnchor="middle"
                      className="text-[8px] font-medium fill-bmw-text select-none"
                    >
                      {node.id}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      )}

      {/* Side Detail Card for Selected/Hovered Node */}
      <AnimatePresence>
        {(selectedNode || hoveredNode) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-3 left-3 right-3 bg-bmw-surface/95 border border-bmw-border p-3 rounded-lg backdrop-blur shadow-2xl flex flex-col gap-1 z-10 text-xs text-bmw-text"
          >
            <div className="flex justify-between items-start gap-2">
              <span className="font-semibold text-bmw-text flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: getNodeColor(
                      (selectedNode || hoveredNode)!.type,
                    ),
                  }}
                />
                {(selectedNode || hoveredNode)!.id}
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-bmw-text-sec">
                {(selectedNode || hoveredNode)!.type || "Concept"}
              </span>
            </div>
            {(selectedNode || hoveredNode)!.description && (
              <p className="text-[11px] text-bmw-text-sec mt-1 leading-relaxed">
                {(selectedNode || hoveredNode)!.description}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MAIN GRAPH RAG WORKSPACE ---
export const SmartKnowledgeGraph: React.FC = () => {
  const { language, t, dir } = useLanguage();
  const isRtl = language === "fa";
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  // State Tabs
  const [activeTab, setActiveTab] = useState<"chat" | "admin">("chat");

  // --- CORE DATABASE STATE ---
  const [documents, setDocuments] = useState<GraphDoc[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [activeDocumentIds, setActiveDocumentIds] = useState<number[]>([]);

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [docSearchQuery, setDocSearchQuery] = useState<string>("");

  // Interactive Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [currentSubgraph, setCurrentSubgraph] = useState<Subgraph>({
    nodes: [],
    links: [],
  });
  const [currentActiveGraphMessageIndex, setCurrentActiveGraphMessageIndex] =
    useState<number | null>(null);
  const [loadingSubgraphIndex, setLoadingSubgraphIndex] = useState<
    number | null
  >(null);

  // Upload Management State
  const [uploadTitle, setUploadTitle] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadLogs, setUploadLogs] = useState<string[]>([]);
  const [uploadPercentage, setUploadPercentage] = useState<number>(0);

  // Custom Confirmation Dialogs State
  const [deleteSessionConfirm, setDeleteSessionConfirm] = useState<{
    id: string;
    isOpen: boolean;
  } | null>(null);
  const [deleteDocConfirm, setDeleteDocConfirm] = useState<{
    id: number;
    isOpen: boolean;
  } | null>(null);
  const [selectedCommunityModal, setSelectedCommunityModal] = useState<
    any | null
  >(null);

  // --- ENTITY AND RELATIONSHIP EDIT STATE ---
  const [editingDoc, setEditingDoc] = useState<GraphDoc | null>(null);
  const [editEntities, setEditEntities] = useState<any[]>([]);
  const [editRelationships, setEditRelationships] = useState<any[]>([]);
  const [docCommunities, setDocCommunities] = useState<any[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [isSavingDetails, setIsSavingDetails] = useState<boolean>(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [activeEditTab, setActiveEditTab] = useState<
    "entities" | "relationships" | "communities"
  >("entities");
  const [entitySearch, setEntitySearch] = useState<string>("");
  const [relationSearch, setRelationSearch] = useState<string>("");
  const [isAnalyzingCommunities, setIsAnalyzingCommunities] =
    useState<boolean>(false);

  const [findText, setFindText] = useState<string>("");
  const [replaceText, setReplaceText] = useState<string>("");
  const [replaceMessage, setReplaceMessage] = useState<string | null>(null);
  const userLogin = useAppSelector(
    (state) => state?.main?.userProfile?.userLogin,
  );
  const { hasPermission } = useHasPermission();

  // Entity Resolution States
  const [isResolvingEntities, setIsResolvingEntities] =
    useState<boolean>(false);
  const [entityResolutionReport, setEntityResolutionReport] = useState<
    any[] | null
  >(null);

  // Find & Replace Feature
  const handleFindAndReplace = () => {
    if (!findText) {
      setReplaceMessage(
        isRtl
          ? "لطفاً عبارت مورد نظر برای جستجو را وارد کنید."
          : "Please enter the text to find.",
      );
      setTimeout(() => setReplaceMessage(null), 3000);
      return;
    }

    const replaceInString = (
      str: string | null | undefined,
      target: string,
      replacement: string,
    ) => {
      if (!str) return "";
      return str.split(target).join(replacement);
    };

    let entMatchCount = 0;
    let relMatchCount = 0;

    const updatedEntities = editEntities.map((ent) => {
      const newName = replaceInString(ent.name, findText, replaceText);
      const newType = replaceInString(ent.type, findText, replaceText);
      const newDesc = replaceInString(ent.description, findText, replaceText);

      if (
        ent.name !== newName ||
        ent.type !== newType ||
        ent.description !== newDesc
      ) {
        entMatchCount++;
      }

      return {
        ...ent,
        name: newName,
        type: newType,
        description: newDesc,
      };
    });

    const updatedRelationships = editRelationships.map((rel) => {
      const newSource = replaceInString(
        rel.source_entity,
        findText,
        replaceText,
      );
      const newTarget = replaceInString(
        rel.target_entity,
        findText,
        replaceText,
      );
      const newRelation = replaceInString(
        rel.relation_type,
        findText,
        replaceText,
      );
      const newDesc = replaceInString(rel.description, findText, replaceText);

      if (
        rel.source_entity !== newSource ||
        rel.target_entity !== newTarget ||
        rel.relation_type !== newRelation ||
        rel.description !== newDesc
      ) {
        relMatchCount++;
      }

      return {
        ...rel,
        source_entity: newSource,
        target_entity: newTarget,
        relation_type: newRelation,
        description: newDesc,
      };
    });

    setEditEntities(updatedEntities);
    setEditRelationships(updatedRelationships);

    if (entMatchCount === 0 && relMatchCount === 0) {
      setReplaceMessage(isRtl ? "هیچ موردی یافت نشد." : "No matches found.");
    } else {
      setReplaceMessage(
        isRtl
          ? `تعداد ${entMatchCount} موجودیت و ${relMatchCount} رابطه تغییر یافتند (موقت در حافظه). برای اعمال دائمی، ذخیره را بزنید.`
          : `Updated ${entMatchCount} entities and ${relMatchCount} relationships in memory. Click "Save Changes" to save permanently.`,
      );
    }
    setTimeout(() => setReplaceMessage(null), 6000);
  };

  // Open Edit Mode
  const handleStartEditDoc = async (doc: GraphDoc) => {
    setEditingDoc(doc);
    setIsLoadingDetails(true);
    setDetailsError(null);
    setEditEntities([]);
    setEditRelationships([]);
    setDocCommunities([]);
    setActiveEditTab("entities");
    setEntitySearch("");
    setRelationSearch("");
    setFindText("");
    setReplaceText("");
    setReplaceMessage(null);

    try {
      const res = await fetch(
        `${baseURL}/api/graph/documents/${doc.id}/details`,
      );
      if (!res.ok)
        throw new Error(
          isRtl
            ? "خطا در دریافت اطلاعات گراف سند"
            : "Failed to load document graph details",
        );
      const data = await res.json();
      setEditEntities(data.entities || []);
      setEditRelationships(data.relationships || []);

      // Load existing communities
      const commRes = await fetch(
        `${baseURL}/api/graph/documents/${doc.id}/communities`,
      );
      if (commRes.ok) {
        const commData = await commRes.json();
        setDocCommunities(commData.communities || []);
      }
    } catch (err: any) {
      console.error("Error loading document details:", err);
      setDetailsError(err.message || "Error loading details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Trigger AI Community Summarization and Clustering
  const handleTriggerCommunityDetection = async () => {
    if (!editingDoc) return;
    setIsAnalyzingCommunities(true);
    setDetailsError(null);
    try {
      const res = await fetch(
        `${baseURL}/api/graph/documents/${editingDoc.id}/communities`,
        {
          method: "POST",
        },
      );
      if (!res.ok)
        throw new Error(
          isRtl
            ? "خطا در اجرای خوشه‌بندی انجمن‌ها"
            : "Community clustering failed",
        );
      const data = await res.json();
      if (data.success) {
        setDocCommunities(data.communities || []);
        setActiveEditTab("communities");
      }
    } catch (err: any) {
      console.error("Error running community clustering:", err);
      setDetailsError(
        err.message || "Error occurred during community detection.",
      );
    } finally {
      setIsAnalyzingCommunities(false);
    }
  };

  // Trigger AI Entity Resolution
  const handleTriggerEntityResolution = async () => {
    if (!editingDoc) return;
    setIsResolvingEntities(true);
    setDetailsError(null);
    setEntityResolutionReport(null);
    try {
      const res = await fetch(
        `${baseURL}/api/graph/documents/${editingDoc.id}/entity-resolution`,
        {
          method: "POST",
        },
      );
      if (!res.ok)
        throw new Error(
          isRtl
            ? "خطا در اجرای ادغام موجودیت‌ها"
            : "Entity resolution execution failed",
        );
      const data = await res.json();

      if (data.success) {
        // Refresh editing details
        setIsLoadingDetails(true);
        const detailRes = await fetch(
          `${baseURL}/api/graph/documents/${editingDoc.id}/details`,
        );
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          setEditEntities(detailData.entities || []);
          setEditRelationships(detailData.relationships || []);
        }
        setIsLoadingDetails(false);
        setEntityResolutionReport(data.mergedGroups || []);
      }
    } catch (err: any) {
      console.error("Error triggering entity resolution:", err);
      setDetailsError(
        err.message || "Error occurred during Entity Resolution.",
      );
    } finally {
      setIsResolvingEntities(false);
    }
  };

  // Add Entity
  const handleAddEditEntity = () => {
    setEditEntities((prev) => [
      ...prev,
      {
        id: "new-" + Date.now() + Math.random().toString(36).substring(2, 6),
        name: "",
        type: "Concept",
        description: "",
      },
    ]);
  };

  // Update Entity Field
  const handleUpdateEditEntity = (
    id: string | number,
    field: string,
    value: string,
  ) => {
    setEditEntities((prev) =>
      prev.map((ent) => {
        if (ent.id === id) {
          return { ...ent, [field]: value };
        }
        return ent;
      }),
    );
  };

  // Remove Entity
  const handleRemoveEditEntity = (id: string | number) => {
    setEditEntities((prev) => prev.filter((ent) => ent.id !== id));
  };

  // Add Relationship
  const handleAddEditRelationship = () => {
    setEditRelationships((prev) => [
      ...prev,
      {
        id:
          "new-rel-" + Date.now() + Math.random().toString(36).substring(2, 6),
        source_entity: "",
        target_entity: "",
        relation_type: "",
        description: "",
      },
    ]);
  };

  // Update Relationship Field
  const handleUpdateEditRelationship = (
    id: string | number,
    field: string,
    value: string,
  ) => {
    setEditRelationships((prev) =>
      prev.map((rel) => {
        if (rel.id === id) {
          return { ...rel, [field]: value };
        }
        return rel;
      }),
    );
  };

  // Remove Relationship
  const handleRemoveEditRelationship = (id: string | number) => {
    setEditRelationships((prev) => prev.filter((rel) => rel.id !== id));
  };

  // Save/Submit All Changes
  const handleSaveDocDetails = async () => {
    if (!editingDoc) return;
    setIsSavingDetails(true);
    setDetailsError(null);

    // Basic Validation: Ensure names/fields are not empty
    const cleanedEntities = editEntities.filter(
      (ent) => ent.name && ent.name.trim().length > 0,
    );
    const cleanedRelations = editRelationships.filter(
      (rel) => rel.source_entity && rel.target_entity && rel.relation_type,
    );

    try {
      const res = await fetch(
        `${baseURL}/api/graph/documents/${editingDoc.id}/update-graph`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entities: cleanedEntities,
            relationships: cleanedRelations,
          }),
        },
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.error ||
            (isRtl ? "خطا در ثبت تغییرات" : "Failed to save changes"),
        );
      }

      // Close modal and refresh document registry count/data
      setEditingDoc(null);
      fetchDocuments(); // Refresh documents to update registry counts
    } catch (err: any) {
      console.error("Error saving document details:", err);
      setDetailsError(err.message || "Error occurred while saving changes");
    } finally {
      setIsSavingDetails(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [visibleCount, setVisibleCount] = useState(5);

  // Auto-save Graph current chat draft
  const handleInputChange = (text: string) => {
    setUserInput(text);
    if (selectedSessionId) {
      localStorage.setItem(`graph_draft_${selectedSessionId}`, text);
    }
  };

  // Restore Graph current chat draft on session change
  useEffect(() => {
    if (selectedSessionId) {
      const savedDraft = localStorage.getItem(
        `graph_draft_${selectedSessionId}`,
      );
      setUserInput(savedDraft || "");
    } else {
      setUserInput("");
    }
  }, [selectedSessionId]);

  // Handle Graph reaction
  const handleReaction = async (
    msgId: number | undefined,
    index: number,
    reactionType: "up" | "down",
  ) => {
    if (!msgId) return;

    const currentReaction = messages[index].reaction;
    const newReaction = currentReaction === reactionType ? null : reactionType;

    // Optimistically update locally
    setMessages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], reaction: newReaction };
      return updated;
    });

    try {
      await fetch(`${baseURL}/api/graph/chat/message/reaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: msgId, reaction: newReaction }),
      });
    } catch (err) {
      console.error("Error saving Graph message reaction:", err);
    }
  };

  // Load documents and sessions on startup
  useEffect(() => {
    fetchDocuments();
    fetchSessions();
  }, [userLogin?.personalCode]);

  // Sync selected session's history
  useEffect(() => {
    setVisibleCount(5); // Reset visible messages count
    if (!selectedSessionId) {
      setMessages([]);
      setCurrentSubgraph({ nodes: [], links: [] });
      return;
    }
    fetchChatHistory(selectedSessionId);
  }, [selectedSessionId]);

  // Scroll chat bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Fetch Documents
  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${baseURL}/api/graph/documents`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setDocuments(data);
      }
    } catch (err) {
      console.error("Error fetching graph documents:", err);
    }
  };

  // Fetch Sessions
  const fetchSessions = async () => {
    try {
      const res = await fetch(
        `${baseURL}/api/graph/chat/sessions?userId=${userLogin?.personalCode}`,
      );
      const data = await res.json();
      if (data && Array.isArray(data.sessions)) {
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error("Error fetching graph sessions:", err);
    }
  };

  // Handle viewing specific message's graph
  const handleViewMessageGraph = async (msg: Message, index: number) => {
    if (msg.subgraph && msg.subgraph.nodes && msg.subgraph.nodes.length > 0) {
      setCurrentSubgraph(msg.subgraph);
      setCurrentActiveGraphMessageIndex(index);
      return;
    }

    if (!msg.id) return;
    setLoadingSubgraphIndex(index);
    try {
      const res = await fetch(
        `${baseURL}/api/graph/chat/message/${msg.id}/subgraph`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.subgraph) {
          // Update the message in our local messages array to save the subgraph
          setMessages((prev) => {
            const updated = [...prev];
            if (updated[index]) {
              updated[index] = { ...updated[index], subgraph: data.subgraph };
            }
            return updated;
          });
          setCurrentSubgraph(data.subgraph);
          setCurrentActiveGraphMessageIndex(index);
        }
      }
    } catch (err) {
      console.error("Error fetching message subgraph:", err);
    } finally {
      setLoadingSubgraphIndex(null);
    }
  };

  // Fetch Chat History
  const fetchChatHistory = async (sessionId: string) => {
    try {
      const res = await fetch(`${baseURL}/api/graph/chat/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data && Array.isArray(data.history)) {
        const parsedHistory = data.history.map((h: any) => ({
          id: h.id,
          role: h.role,
          text: h.text,
          reaction: h.reaction,
          subgraph: h.subgraph
            ? typeof h.subgraph === "string"
              ? JSON.parse(h.subgraph)
              : h.subgraph
            : null,
          communities: h.communities
            ? typeof h.communities === "string"
              ? JSON.parse(h.communities)
              : h.communities
            : null,
        }));
        setMessages(parsedHistory);

        // Find the last model response and automatically select/display its graph
        if (parsedHistory.length > 0) {
          const lastModelIndex = parsedHistory
            .map((m, i) => (m.role === "model" ? i : -1))
            .filter((idx) => idx !== -1)
            .pop();
          if (lastModelIndex !== undefined && lastModelIndex !== -1) {
            const lastModelMsg = parsedHistory[lastModelIndex];
            if (
              lastModelMsg.subgraph &&
              lastModelMsg.subgraph.nodes?.length > 0
            ) {
              setCurrentSubgraph(lastModelMsg.subgraph);
              setCurrentActiveGraphMessageIndex(lastModelIndex);
            } else {
              // Lazy load or reconstruct on first load
              handleViewMessageGraph(lastModelMsg, lastModelIndex);
            }
          } else {
            setCurrentSubgraph({ nodes: [], links: [] });
            setCurrentActiveGraphMessageIndex(null);
          }
        } else {
          setCurrentSubgraph({ nodes: [], links: [] });
          setCurrentActiveGraphMessageIndex(null);
        }
      }
    } catch (err) {
      console.error("Error loading chat history:", err);
    }
  };

  // Toggle Document Enable/Disable state
  const handleToggleDoc = async (docId: number, isEnabled: boolean) => {
    try {
      const res = await fetch(
        `${baseURL}/api/graph/documents/${docId}/toggle`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isEnabled: !isEnabled }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === docId ? { ...d, is_enabled: !isEnabled } : d,
          ),
        );
      }
    } catch (err) {
      console.error("Error toggling document:", err);
    }
  };

  // Toggle Document Strict mode (answering strictly limited to the document's extracted facts)
  const handleToggleStrict = async (docId: number, strictMode: boolean) => {
    try {
      const res = await fetch(
        `${baseURL}/api/graph/documents/${docId}/strict-mode`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ strictMode: !strictMode }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === docId ? { ...d, strict_mode: !strictMode } : d,
          ),
        );
      }
    } catch (err) {
      console.error("Error toggling strict mode:", err);
    }
  };

  // Delete Document Confirmation Trigger
  const handleDeleteDoc = (docId: number) => {
    setDeleteDocConfirm({ id: docId, isOpen: true });
  };

  // Actual deletion after confirmation
  const confirmDeleteDoc = async () => {
    if (!deleteDocConfirm) return;
    const docId = deleteDocConfirm.id;
    try {
      const res = await fetch(`${baseURL}/api/graph/documents/${docId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        // Reset active documents list
        setActiveDocumentIds((prev) => prev.filter((id) => id !== docId));
      }
    } catch (err) {
      console.error("Error deleting document:", err);
    } finally {
      setDeleteDocConfirm(null);
    }
  };

  // Select/Deselect Active Documents
  const handleToggleActiveDoc = (docId: number) => {
    setActiveDocumentIds((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId],
    );
  };

  // Select All/None Active Documents
  const handleToggleAllActiveDocs = () => {
    const enabledDocs = documents.filter((d) => d.is_enabled);
    if (activeDocumentIds.length === enabledDocs.length) {
      setActiveDocumentIds([]);
    } else {
      setActiveDocumentIds(enabledDocs.map((d) => d.id));
    }
  };

  // Create New Chat Session
  const handleNewSession = () => {
    const newId = "graph-session-" + Date.now();
    const newSess: ChatSession = {
      id: newId,
      title: isRtl ? "گفتگوی شبکه دانش جدید" : "New Knowledge Graph Chat",
      active_document_ids: activeDocumentIds.map(String),
      created_at: new Date().toISOString(),
    };
    setSessions((prev) => [newSess, ...prev]);
    setSelectedSessionId(newId);
    setMessages([]);
    setCurrentSubgraph({ nodes: [], links: [] });
  };

  // Delete Chat Session Confirmation Trigger
  const handleDeleteSession = (sessId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteSessionConfirm({ id: sessId, isOpen: true });
  };

  // Actual deletion after confirmation
  const confirmDeleteSession = async () => {
    if (!deleteSessionConfirm) return;
    const sessId = deleteSessionConfirm.id;
    try {
      const res = await fetch(`${baseURL}/api/graph/chat/sessions/${sessId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSessions((prev) => prev.filter((s) => s.id !== sessId));
        if (selectedSessionId === sessId) {
          setSelectedSessionId("");
          setMessages([]);
          setCurrentSubgraph({ nodes: [], links: [] });
        }
      }
    } catch (err) {
      console.error("Error deleting session:", err);
    } finally {
      setDeleteSessionConfirm(null);
    }
  };

  // Upload Document with SSE Stream
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === "application/pdf") {
      setSelectedFile(files[0]);
      if (!uploadTitle) {
        setUploadTitle(files[0].name.replace(".pdf", ""));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      if (!uploadTitle) {
        setUploadTitle(files[0].name.replace(".pdf", ""));
      }
    }
  };

  const handleStartUpload = () => {
    if (!selectedFile || !uploadTitle.trim()) return;

    setIsUploading(true);
    setUploadLogs([]);
    setUploadPercentage(5);
    setUploadProgress(isRtl ? "در حال تبدیل فایل..." : "Converting PDF...");

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(",")[1];

        // Start EventSource-like fetch request
        const res = await fetch(`${baseURL}/api/graph/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: uploadTitle.trim(),
            fileName: selectedFile.name,
            fileBase64: base64,
          }),
        });

        if (!res.ok) {
          let errorText = "Failed to process document.";
          try {
            const data = await res.json();
            errorText = data.error || errorText;
          } catch (err) {}
          throw new Error(errorText);
        }

        if (!res.body) {
          throw new Error("ReadableStream not supported.");
        }

        const readerStream = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await readerStream.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            if (part.startsWith("data: ")) {
              try {
                const eventData = JSON.parse(part.substring(6));
                handleUploadSSEEvent(eventData);
              } catch (parseErr) {
                console.error("Error parsing SSE event data:", parseErr);
              }
            }
          }
        }
      } catch (err: any) {
        console.error("Upload failed:", err);
        setUploadLogs((prev) => [
          ...prev,
          `[ERROR] ${err.message || "Error uploading document"}`,
        ]);
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  // Robust SSE Events Processor
  const handleUploadSSEEvent = (data: any) => {
    const {
      event,
      message,
      totalChunks,
      index,
      entitiesFound,
      relationsFound,
      error,
      totalEntities,
      totalRelations,
    } = data;

    if (event === "start") {
      setUploadLogs((prev) => [...prev, `[SYSTEM] ${message}`]);
      setUploadPercentage(15);
    } else if (event === "parsed") {
      setUploadLogs((prev) => [
        ...prev,
        `[SYSTEM] ${message} (Total Pages: ${data.pageCount})`,
      ]);
      setUploadPercentage(30);
    } else if (event === "chunking") {
      setUploadLogs((prev) => [...prev, `[CHUNK] ${message}`]);
      setUploadPercentage(40);
    } else if (event === "doc_saved") {
      setUploadLogs((prev) => [
        ...prev,
        `[DB] ${message} (Database Document ID: ${data.docId})`,
      ]);
    } else if (event === "chunk_processing") {
      setUploadProgress(message);
      const percentage = Math.min(
        40 + Math.round((index / totalChunks) * 55),
        95,
      );
      setUploadPercentage(percentage);
    } else if (event === "chunk_processed") {
      setUploadLogs((prev) => [
        ...prev,
        `[ANALYSIS] Section ${index}/${data.total} completed: Extracted ${entitiesFound} entities, ${relationsFound} relations.`,
      ]);
    } else if (event === "success") {
      setUploadLogs((prev) => [...prev, `[SUCCESS] ${message}`]);
      setUploadPercentage(100);
      setUploadProgress(
        isRtl ? "به‌طور کامل ذخیره شد!" : "Successfully completed!",
      );
      setIsUploading(false);

      // Reset input fields
      setUploadTitle("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Reload Documents list
      fetchDocuments();
    } else if (event === "error") {
      setUploadLogs((prev) => [...prev, `[ERROR] ${error}`]);
      setUploadProgress(isRtl ? "خطایی رخ داده است." : "Extraction error.");
      setIsUploading(false);
    }
  };

  // Chat Query Submission (Graph retrieval + Fusion + Answer)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isTyping) return;

    const userText = userInput.trim();
    setUserInput("");

    // Clear saved draft from localStorage on send
    if (selectedSessionId) {
      localStorage.removeItem(`graph_draft_${selectedSessionId}`);
    } else {
      localStorage.removeItem(`graph_draft_session-`);
    }

    // Append User Message
    const userMsg: Message = { role: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);

    setIsTyping(true);

    // If no session exists, create one in background first
    let activeSessId = selectedSessionId;
    if (!activeSessId) {
      activeSessId = "graph-session-" + Date.now();
      setSelectedSessionId(activeSessId);
      const newSess: ChatSession = {
        id: activeSessId,
        title: userText.substring(0, 30) + "...",
        active_document_ids: activeDocumentIds.map(String),
        created_at: new Date().toISOString(),
      };
      setSessions((prev) => [newSess, ...prev]);
    }

    try {
      const chatPayload = {
        messages: [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.text,
        })),
        documentIds: activeDocumentIds,
        appLanguage: language,
        sessionId: activeSessId,
        userId: userLogin?.personalCode,
      };

      const res = await fetch(`${baseURL}/api/graph/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chatPayload),
      });

      const data = await res.json();
      setIsTyping(false);

      if (data && data.text) {
        // Append Model Message with returned ID, and update user message with returned ID
        setMessages((prev) => {
          const updated = [...prev];
          if (
            updated.length > 0 &&
            updated[updated.length - 1].role === "user"
          ) {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              id: data.userMessageId,
            };
          }
          const modelMsgIndex = updated.length;
          setCurrentActiveGraphMessageIndex(modelMsgIndex);
          return [
            ...updated,
            {
              id: data.modelMessageId,
              role: "model",
              text: data.text,
              subgraph: data.subgraph,
              communities: data.communities,
              reaction: null,
            },
          ];
        });

        // Draw Interactive Visual Sub-graph
        if (
          data.subgraph &&
          data.subgraph.nodes &&
          data.subgraph.nodes.length > 0
        ) {
          setCurrentSubgraph(data.subgraph);
        }
      } else {
        throw new Error(data.error || "Server returned invalid response");
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: isRtl
            ? `متاسفانه خطایی در ارتباط با سرور رخ داد: ${err.message}`
            : `Sorry, an error occurred while generating the answer: ${err.message}`,
        },
      ]);
    }
  };

  // Filtering for document list
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType === "all") return matchesSearch;
    if (filterType === "active") return matchesSearch && doc.is_enabled;
    if (filterType === "disabled") return matchesSearch && !doc.is_enabled;
    return matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6" dir={dir}>
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-bmw-border pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-sans font-medium tracking-tight text-bmw-text flex items-center gap-2">
            <Network className="text-bmw-blue" size={28} />
            {isRtl ? "شبکه دانش هوشمند" : "Smart Knowledge Network"}
            <span className="text-xs font-mono text-bmw-blue border border-bmw-blue/30 px-2 py-0.5 rounded bg-bmw-blue/10">
              Graph RAG
            </span>
          </h1>
          <p className="text-sm text-bmw-text-sec mt-1 leading-relaxed">
            {isRtl
              ? "پایگاه اطلاعاتی مجهز به گراف دانش سازمانی پرشیا خودرو برای استخراج روابط و تحلیل‌های ساختاری عمیق."
              : "Structure-aware Knowledge Graph search & semantic analysis workspace for corporate assets."}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-bmw-surface p-1 rounded-lg border border-bmw-border self-start">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md transition-all ${
              activeTab === "chat"
                ? "bg-bmw-blue text-white shadow"
                : "text-bmw-text-sec hover:text-bmw-text"
            }`}
          >
            <MessageSquare size={14} />
            {isRtl ? "مکالمه روابط سازمانی" : "Graph Workspace"}
          </button>
          {hasPermission("ChatSmart.Read") && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md transition-all ${
                activeTab === "admin"
                  ? "bg-bmw-blue text-white shadow"
                  : "text-bmw-text-sec hover:text-bmw-text"
              }`}
            >
              <Database size={14} />
              {isRtl ? "مدیریت شبکه اسناد" : "Knowledge Management"}
            </button>
          )}
        </div>
      </div>

      {/* WORKSPACE CONTENT */}
      {activeTab === "chat" ? (
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* SIDEBAR: active documents list + chat history */}
          <div className="lg:col-span-4 col-span-12 flex flex-col gap-6">
            {/* Active Documents Control */}
            <div className="bg-bmw-surface border border-bmw-border rounded-xl p-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-bmw-text tracking-wide uppercase flex items-center gap-1.5">
                    <FileText
                      size={14}
                      className="text-bmw-text-sec animate-pulse"
                    />
                    {isRtl ? "اسناد گراف فعال" : "Graph Sources"}
                  </span>
                  <span className="text-[10px] bg-bmw-blue/10 text-bmw-blue px-2 py-0.5 rounded-full font-semibold">
                    {activeDocumentIds.length} /{" "}
                    {documents.filter((d) => d.is_enabled).length}
                  </span>
                </div>
                <p className="text-[10px] text-bmw-text-sec leading-relaxed">
                  {isRtl
                    ? "اسناد مورد نظر برای کوئری و جستجوی معنایی را انتخاب کنید."
                    : "Select source documents to target for semantic retrieval."}
                </p>
              </div>

              {documents.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  {/* Local Document search */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={docSearchQuery}
                      onChange={(e) => setDocSearchQuery(e.target.value)}
                      placeholder={
                        isRtl ? "جستجوی سند..." : "Search sources..."
                      }
                      className="w-full bg-bmw-base border border-bmw-border rounded-lg pl-7 pr-3 py-1 text-[11px] text-bmw-text focus:outline-none focus:border-bmw-blue/50 transition-all placeholder:text-[10px]"
                    />
                    <Search
                      size={11}
                      className="absolute left-2.5 top-2 text-bmw-text-sec"
                    />
                    {docSearchQuery && (
                      <button
                        onClick={() => setDocSearchQuery("")}
                        className="absolute right-2 top-1.5 text-[9px] text-bmw-text-sec hover:text-bmw-text font-semibold px-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Select/Deselect action */}
                  <button
                    onClick={handleToggleAllActiveDocs}
                    className="shrink-0 text-[10px] text-bmw-blue hover:text-blue-400 bg-bmw-blue/5 hover:bg-bmw-blue/10 border border-bmw-blue/10 rounded px-2 py-1 font-medium transition-all"
                  >
                    {activeDocumentIds.length ===
                    documents.filter((d) => d.is_enabled).length
                      ? isRtl
                        ? "لغو انتخاب"
                        : "Clear All"
                      : isRtl
                        ? "انتخاب همه"
                        : "Select All"}
                  </button>
                </div>
              )}

              {documents.length === 0 ? (
                <p className="text-[11px] text-bmw-text-sec bg-bmw-base p-3 rounded text-center border border-dashed border-bmw-border">
                  {isRtl
                    ? "هیچ سند گرافی وجود ندارد."
                    : "No knowledge documents found."}
                </p>
              ) : (
                (() => {
                  const enabledDocs = documents.filter((d) => d.is_enabled);
                  const filteredDocs = enabledDocs.filter((doc) => {
                    const matchTitle = (doc.title || "")
                      .toLowerCase()
                      .includes(docSearchQuery.toLowerCase());
                    const matchFile = (doc.file_name || "")
                      .toLowerCase()
                      .includes(docSearchQuery.toLowerCase());
                    return matchTitle || matchFile;
                  });

                  return (
                    <div className="flex flex-col gap-1.5">
                      {/* Interactive scroll list with responsive larger max-height */}
                      <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                        {filteredDocs.map((doc) => {
                          const isSelected = activeDocumentIds.includes(doc.id);
                          return (
                            <button
                              key={doc.id}
                              onClick={() => handleToggleActiveDoc(doc.id)}
                              className={`flex items-start gap-2.5 text-left w-full p-2.5 rounded-lg transition-all text-xs border ${
                                isSelected
                                  ? "bg-bmw-blue/10 border-bmw-blue/40 text-bmw-blue font-semibold shadow-sm"
                                  : "bg-bmw-base/50 border-bmw-border/30 hover:bg-bmw-hover text-bmw-text-sec"
                              }`}
                            >
                              <div
                                className={`mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-all ${
                                  isSelected
                                    ? "bg-bmw-blue border-bmw-blue text-white"
                                    : "border-bmw-border bg-bmw-surface"
                                }`}
                              >
                                {isSelected && (
                                  <span className="text-[8px] font-bold">
                                    ✓
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div
                                  className="truncate font-medium text-[11px] text-bmw-text"
                                  title={doc.title}
                                >
                                  {doc.title}
                                </div>
                                <div className="text-[9px] text-bmw-text-sec font-mono mt-0.5 truncate opacity-70">
                                  {doc.file_name}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-0.5 shrink-0 select-none text-[9px] text-right">
                                <span className="font-mono font-medium opacity-80 px-1 bg-white/5 rounded text-[10px]">
                                  {doc.entity_count} N
                                </span>
                                <span className="font-mono text-[8px] opacity-60">
                                  {doc.relation_count} R
                                </span>
                              </div>
                            </button>
                          );
                        })}

                        {filteredDocs.length === 0 &&
                          enabledDocs.length > 0 && (
                            <div className="text-center p-4 bg-bmw-base/30 rounded border border-bmw-border/50">
                              <p className="text-[10px] text-bmw-text-sec">
                                {isRtl
                                  ? "هیچ موردی با جستجوی شما مطابقت ندارد."
                                  : "No active sources match your search."}
                              </p>
                              <button
                                type="button"
                                onClick={() => setDocSearchQuery("")}
                                className="text-[10px] text-bmw-blue hover:underline mt-1 font-medium"
                              >
                                {isRtl
                                  ? "پاک کردن جستجو"
                                  : "Clear Search Query"}
                              </button>
                            </div>
                          )}

                        {enabledDocs.length === 0 && (
                          <p className="text-[11px] text-amber-400 bg-amber-950/20 border border-amber-900/30 p-2.5 rounded text-center">
                            {isRtl
                              ? "تمام اسناد غیرفعال هستند. لطفاً به بخش مدیریت بروید."
                              : "All documents are disabled. Enable them in management."}
                          </p>
                        )}
                      </div>

                      {/* Display Selected Filtered helper if query is active */}
                      {docSearchQuery && filteredDocs.length > 0 && (
                        <div className="flex items-center justify-between pt-1 border-t border-bmw-border/30 text-[10px] text-bmw-text-sec">
                          <span>
                            {isRtl
                              ? `نتایج جستجو: ${filteredDocs.length} سند`
                              : `Found ${filteredDocs.length} matching`}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const filteredIds = filteredDocs.map((d) => d.id);
                              const allSelected = filteredIds.every((id) =>
                                activeDocumentIds.includes(id),
                              );
                              if (allSelected) {
                                // Deselect filtered
                                setActiveDocumentIds((prev) =>
                                  prev.filter(
                                    (id) => !filteredIds.includes(id),
                                  ),
                                );
                              } else {
                                // Select filtered
                                setActiveDocumentIds((prev) =>
                                  Array.from(
                                    new Set([...prev, ...filteredIds]),
                                  ),
                                );
                              }
                            }}
                            className="text-bmw-blue hover:underline font-medium"
                          >
                            {filteredDocs.every((d) =>
                              activeDocumentIds.includes(d.id),
                            )
                              ? isRtl
                                ? "غیرفعال‌سازی این لیست"
                                : "Deselect These"
                              : isRtl
                                ? "فعال‌سازی همه‌ی این لیست"
                                : "Select These"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>

            {/* Chat sessions navigation */}
            <div className="bg-bmw-surface border border-bmw-border rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-bmw-text tracking-wide uppercase flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-bmw-text-sec" />
                  {isRtl ? "تاریخچه گفتگوها" : "Graph Chat Logs"}
                </span>
                <button
                  onClick={handleNewSession}
                  className="flex items-center gap-1 text-[10px] text-bmw-blue bg-bmw-blue/10 border border-bmw-blue/30 px-2 py-1 rounded hover:bg-bmw-blue hover:text-white transition-all"
                >
                  <Plus size={12} />
                  {isRtl ? "گفتگوی جدید" : "New Session"}
                </button>
              </div>

              <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                {sessions.map((sess) => {
                  const isSelected = selectedSessionId === sess.id;
                  return (
                    <div
                      key={sess.id}
                      onClick={() => setSelectedSessionId(sess.id)}
                      className={`flex items-center justify-between w-full p-2.5 rounded-lg cursor-pointer transition-all border ${
                        isSelected
                          ? "bg-bmw-hover border-bmw-border text-bmw-text font-semibold shadow-sm"
                          : "bg-transparent border-transparent hover:bg-bmw-hover/50 text-bmw-text-sec"
                      }`}
                    >
                      <span className="truncate text-xs text-left max-w-[200px]">
                        {sess.title}
                      </span>
                      <button
                        onClick={(e) => handleDeleteSession(sess.id, e)}
                        className="text-bmw-text-sec hover:text-red-400 p-1"
                        title="Delete session"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}

                {sessions.length === 0 && (
                  <p className="text-[11px] text-bmw-text-sec bg-bmw-base p-4 rounded text-center">
                    {isRtl
                      ? "هیچ گفتگویی آغاز نشده است."
                      : "No active discussions."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* CHAT DISPLAY + VISUAL SUB-GRAPH */}
          <div className="lg:col-span-8  col-span-12 flex flex-col gap-6">
            {/* Real-time Interactive SVG Graph Visualization */}
            <InteractiveGraph subgraph={currentSubgraph} isRtl={isRtl} />

            {/* Chat Conversation Shell */}
            <div className="bg-bmw-surface border border-bmw-border rounded-xl overflow-hidden flex flex-col h-[500px]">
              {/* Session Top Bar */}
              <div className="h-14 border-b border-bmw-border px-4 flex items-center justify-between bg-bmw-surface/50">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-bmw-text">
                    {selectedSessionId
                      ? sessions.find((s) => s.id === selectedSessionId)?.title
                      : isRtl
                        ? "گفتگوی موقت"
                        : "Temporary Workspace"}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-bmw-text-sec">
                  SYSTEM: Active
                </span>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 self-center animate-fade-in">
                    <Sparkles
                      className="text-bmw-blue/40 animate-bounce mb-3"
                      size={32}
                    />
                    <h3 className="text-sm font-semibold text-bmw-text mb-1">
                      {isRtl
                        ? "آغاز تحلیل عمیق روابط"
                        : "Semantic Connection Network"}
                    </h3>
                    <p className="text-xs text-bmw-text-sec max-w-sm leading-relaxed">
                      {isRtl
                        ? "یک سوال در رابطه با سیاست‌ها، نمایندگی‌ها یا ساختار سازمانی پرشیا خودرو مطرح کنید تا ربات با تحلیل گراف پاسخ دهد."
                        : "Ask any question about organizations, BMW parameters or policies to let the agent explore structural links."}
                    </p>
                  </div>
                )}

                {messages.slice(0, visibleCount).map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-bmw-blue text-white rounded-br-none"
                          : "bg-bmw-base text-bmw-text border border-bmw-border rounded-tl-none"
                      }`}
                    >
                      {/* Markdown representation helper */}
                      {msg.role === "user" ? (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <div className="space-y-1">
                          {formatResponseText(msg.text, isRtl)}

                          {/* Related Communities Links Section */}
                          {msg.communities && msg.communities.length > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-bmw-border/30 flex flex-col gap-1.5">
                              <div className="flex items-center gap-1.5 text-bmw-blue font-semibold text-[10px] uppercase tracking-wider select-none">
                                <Network size={11} className="animate-pulse" />
                                <span>
                                  {isRtl
                                    ? "انجمن‌های مرتبط شناسایی شده:"
                                    : "Identified Related Communities:"}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-0.5">
                                {msg.communities.map(
                                  (comm: any, cIdx: number) => (
                                    <button
                                      key={cIdx}
                                      type="button"
                                      onClick={() =>
                                        setSelectedCommunityModal(comm)
                                      }
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-bmw-blue/10 hover:bg-bmw-blue hover:text-white border border-bmw-blue/20 text-[10px] text-bmw-blue transition-all font-medium shadow-sm hover:shadow-md cursor-pointer"
                                    >
                                      <span>🔗</span>
                                      <span>{comm.title}</span>
                                    </button>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                          {/* Reaction system for model responses */}
                          {msg.id && (
                            <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-bmw-border/40 text-bmw-textSec">
                              <span className="text-[10px] select-none opacity-70">
                                {isRtl ? "بازخورد:" : "Feedback:"}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleReaction(msg.id, index, "up")
                                }
                                className={`p-1 rounded-md transition-all ${
                                  msg.reaction === "up"
                                    ? "text-green-500 bg-green-500/10 border border-green-500/20"
                                    : "text-bmw-textSec hover:text-bmw-text hover:bg-bmw-border"
                                }`}
                                title={isRtl ? "مفید بود" : "Helpful"}
                              >
                                <ThumbsUp className="w-3 h-3 fill-current" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleReaction(msg.id, index, "down")
                                }
                                className={`p-1 rounded-md transition-all ${
                                  msg.reaction === "down"
                                    ? "text-red-500 bg-red-500/10 border border-red-500/20"
                                    : "text-bmw-textSec hover:text-bmw-text hover:bg-bmw-border"
                                }`}
                                title={isRtl ? "غیرمفید بود" : "Not helpful"}
                              >
                                <ThumbsDown className="w-3 h-3 fill-current" />
                              </button>

                              <div className="flex-1" />

                              <button
                                type="button"
                                disabled={loadingSubgraphIndex === index}
                                onClick={() =>
                                  handleViewMessageGraph(msg, index)
                                }
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium transition-all border ${
                                  currentActiveGraphMessageIndex === index
                                    ? "bg-bmw-blue text-white border-bmw-blue/40 shadow-sm font-semibold"
                                    : "bg-bmw-surface/40 border-bmw-border/50 hover:bg-bmw-hover/80 text-bmw-text"
                                }`}
                              >
                                {loadingSubgraphIndex === index ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Network className="w-3 h-3" />
                                )}
                                <span>
                                  {loadingSubgraphIndex === index
                                    ? isRtl
                                      ? "در حال بارگذاری..."
                                      : "Loading..."
                                    : isRtl
                                      ? "مشاهده گراف پیام"
                                      : "View Graph"}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Show more messages lazy loading button */}
                {messages.length > visibleCount && (
                  <div className="flex justify-center my-4 animate-fade-in">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 5)}
                      className="px-4 py-2 text-xs font-bold text-bmw-blue bg-bmw-blue/10 hover:bg-bmw-blue/20 border border-bmw-blue/20 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>
                        {isRtl ? "نمایش پیام‌های بیشتر" : "Show More Messages"}
                      </span>
                      <span className="bg-bmw-blue text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                        {messages.length - visibleCount}
                      </span>
                    </button>
                  </div>
                )}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-bmw-base border border-bmw-border rounded-xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                      <Loader2
                        className="animate-spin text-bmw-blue"
                        size={14}
                      />
                      <span className="text-xs text-bmw-text-sec">
                        {isRtl
                          ? "در حال ردگیری روابط گراف..."
                          : "Navigating graph connections..."}
                      </span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-bmw-border bg-bmw-surface/50 flex gap-2"
              >
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={
                    isRtl
                      ? "در رابطه با اسناد یا نمایندگی‌ها بپرسید..."
                      : "Ask about documents or dealer connections..."
                  }
                  className="flex-1 bg-bmw-base border border-bmw-border rounded-lg px-4 py-2.5 text-xs text-bmw-text focus:outline-none focus:border-bmw-blue transition-colors"
                />
                <button
                  type="submit"
                  disabled={!userInput.trim() || isTyping}
                  className="bg-bmw-blue text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* ==================== ADMIN / MANAGEMENT PANEL ==================== */
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* LEFT: Upload PDF Document */}
          <div className="lg:col-span-5 col-span-12 bg-bmw-surface border border-bmw-border rounded-xl p-6 flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-semibold text-bmw-text uppercase tracking-wide flex items-center gap-2">
                <Upload size={16} className="text-bmw-blue" />
                {isRtl
                  ? "بارگذاری سند و ساخت گراف روابط"
                  : "Upload & Construct Knowledge Graph"}
              </h2>
              <p className="text-[11px] text-bmw-text-sec mt-1 leading-relaxed">
                {isRtl
                  ? "یک فایل پی‌دی‌اف انتخاب کنید تا با پردازش هوشمند، موجودیت‌ها و پیوندهای آن استخراج شده و به گراف پیوند بخورند."
                  : "Submit a corporate PDF to parse content and construct semantic relations using generative AI models."}
              </p>
            </div>

            {/* Title field */}
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[11px] font-medium text-bmw-text-sec">
                {isRtl ? "عنوان دلخواه سند" : "Document Title"}
              </label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder={
                  isRtl
                    ? "به‌طور مثال: آیین‌نامه گارانتی مانیان خودرو"
                    : "e.g., Warranty Coverage Agreement"
                }
                className="bg-bmw-base border border-bmw-border rounded-lg px-3 py-2 text-xs text-bmw-text focus:outline-none focus:border-bmw-blue"
              />
            </div>

            {/* Drag Drop Box */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-bmw-border hover:border-bmw-blue/50 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-bmw-base/30 hover:bg-bmw-base/60 transition-all text-center"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                className="hidden"
              />
              <FileText
                size={36}
                className={selectedFile ? "text-bmw-blue" : "text-bmw-text-sec"}
              />
              {selectedFile ? (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-bmw-text max-w-[200px] truncate">
                    {selectedFile.name}
                  </span>
                  <span className="text-[10px] text-bmw-text-sec font-mono">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-bmw-text">
                    {isRtl
                      ? "فایل PDF خود را رها کنید یا کلیک کنید"
                      : "Drop your PDF here or click to browse"}
                  </span>
                  <span className="text-[10px] text-bmw-text-sec">
                    {isRtl
                      ? "تنها فرمت PDF قابل پذیرش است"
                      : "Only PDF documents are supported"}
                  </span>
                </div>
              )}
            </div>

            {/* Run Button */}
            <button
              onClick={handleStartUpload}
              disabled={isUploading || !selectedFile || !uploadTitle.trim()}
              className="w-full bg-bmw-blue hover:bg-blue-700 disabled:opacity-40 text-white font-medium py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition-all mt-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  {isRtl
                    ? "در حال آنالیز و استخراج..."
                    : "Extracting Structural Relations..."}
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  {isRtl
                    ? "پردازش هوشمند و استخراج گراف"
                    : "Process & Generate Graph"}
                </>
              )}
            </button>

            {/* LIVE STREAM PROGRESS LOGGER */}
            {isUploading && (
              <div className="flex flex-col gap-2 bg-bmw-base p-4 rounded-xl border border-bmw-border mt-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-bmw-blue font-semibold flex items-center gap-1">
                    <Loader2 className="animate-spin" size={10} />
                    {uploadProgress}
                  </span>
                  <span className="font-mono text-bmw-text-sec">
                    {uploadPercentage}%
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-bmw-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-bmw-blue transition-all duration-300"
                    style={{ width: `${uploadPercentage}%` }}
                  />
                </div>
                {/* Logs terminal */}
                <div className="h-28 overflow-y-auto bg-black/60 p-2 rounded border border-bmw-border/80 font-mono text-[9px] text-emerald-400 flex flex-col gap-1 mt-1">
                  {uploadLogs.map((log, idx) => (
                    <div key={idx} className="leading-normal truncate">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Document List & Details Table */}
          <div className="lg:col-span-7 col-span-12 flex flex-col gap-6">
            {/* Table wrapper */}
            <div className="bg-bmw-surface border border-bmw-border rounded-xl p-5 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-sm font-semibold text-bmw-text uppercase tracking-wide">
                  {isRtl ? "لیست کل اسناد گراف" : "Extracted Document Registry"}
                </h2>

                {/* Search / Filter box */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={isRtl ? "جستجو..." : "Search..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-bmw-base border border-bmw-border rounded px-3 py-1 text-[11px] text-bmw-text pl-8 focus:outline-none"
                    />
                    <Search
                      size={12}
                      className="absolute left-2.5 top-2 text-bmw-text-sec"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-bmw-base border border-bmw-border rounded px-2 py-1 text-[11px] text-bmw-text-sec focus:outline-none"
                  >
                    <option value="all">{isRtl ? "همه" : "All"}</option>
                    <option value="active">
                      {isRtl ? "فعال‌ها" : "Active"}
                    </option>
                    <option value="disabled">
                      {isRtl ? "غیرفعال‌ها" : "Disabled"}
                    </option>
                  </select>
                </div>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-bmw-border text-bmw-text-sec font-semibold">
                      <th className="py-2.5 px-3 text-left">
                        {isRtl ? "عنوان" : "Title"}
                      </th>
                      <th className="py-2.5 px-2 text-center">
                        {isRtl ? "موجودیت‌ها" : "Entities"}
                      </th>
                      <th className="py-2.5 px-2 text-center">
                        {isRtl ? "رابطه‌ها" : "Relations"}
                      </th>
                      <th className="py-2.5 px-2 text-center">
                        {isRtl ? "وضعیت" : "Status"}
                      </th>
                      <th className="py-2.5 px-2 text-center">
                        {isRtl ? "پاسخ محدود (Strict)" : "Strict RAG"}
                      </th>
                      <th className="py-2.5 px-3 text-center">
                        {isRtl ? "عملیات" : "Actions"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((doc) => (
                      <tr
                        key={doc.id}
                        className="border-b border-bmw-border/50 hover:bg-bmw-base/20 transition-all"
                      >
                        <td className="py-3 px-3 text-bmw-text font-medium">
                          <div className="flex flex-col">
                            <span>{doc.title}</span>
                            <span className="text-[10px] text-bmw-text-sec font-mono">
                              {doc.file_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center text-bmw-blue font-mono font-bold">
                          {doc.entity_count}
                        </td>
                        <td className="py-3 px-2 text-center text-emerald-400 font-mono font-bold">
                          {doc.relation_count}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() =>
                              handleToggleDoc(doc.id, doc.is_enabled)
                            }
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                              doc.is_enabled
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : "bg-red-500/10 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {doc.is_enabled
                              ? isRtl
                                ? "فعال"
                                : "Active"
                              : isRtl
                                ? "غیرفعال"
                                : "Disabled"}
                          </button>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() =>
                              handleToggleStrict(doc.id, doc.strict_mode)
                            }
                            className={`px-2.5 py-0.5 rounded text-[10px] font-semibold tracking-wide transition-all ${
                              doc.strict_mode
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
                                : "bg-bmw-base text-bmw-text-sec border border-bmw-border hover:bg-bmw-hover hover:text-bmw-text"
                            }`}
                            title={
                              isRtl
                                ? "محدود کردن پاسخ‌ها فقط به فکت‌ها و روابط استخراج شده از این سند (بدون استفاده از اطلاعات خارجی)"
                                : "Restrict responses strictly to extracted concepts and relationships from this document (no external assumptions)"
                            }
                          >
                            {doc.strict_mode
                              ? isRtl
                                ? "فعال (محدود)"
                                : "Strict"
                              : isRtl
                                ? "غیرفعال (عادی)"
                                : "Normal"}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleStartEditDoc(doc)}
                              className="text-bmw-text-sec hover:text-bmw-blue p-1 transition-colors"
                              title={
                                isRtl
                                  ? "ویرایش موجودیت‌ها و رابطه‌ها"
                                  : "Edit entities and relationships"
                              }
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteDoc(doc.id)}
                              className="text-bmw-text-sec hover:text-red-400 p-1 transition-colors"
                              title="Delete file"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredDocuments.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-6 text-center text-bmw-text-sec text-xs"
                        >
                          {isRtl
                            ? "هیچ سندی یافت نشد."
                            : "No documents matching filters found."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CUSTOM CONFIRMATION DIALOGS ==================== */}
      <AnimatePresence>
        {/* Delete Session Modal */}
        {deleteSessionConfirm?.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteSessionConfirm(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Content Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-bmw-surface border border-bmw-border rounded-xl shadow-2xl p-6 overflow-hidden rtl:text-right ltr:text-left"
              dir={isRtl ? "rtl" : "ltr"}
            >
              <div className="flex items-center gap-3 border-b border-bmw-border pb-4 mb-4">
                <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                  <Trash2 size={20} />
                </div>
                <h3 className="text-sm font-semibold text-bmw-text">
                  {isRtl ? "حذف سابقه گفتگو" : "Delete Chat History"}
                </h3>
              </div>
              <p className="text-xs text-bmw-text-sec leading-relaxed mb-6">
                {isRtl
                  ? "آیا از حذف این گفتگو اطمینان دارید؟ این عملیات غیر قابل بازگشت بوده و تمامی پیام‌های این گفتگو به همراه سابقه آن به طور کامل از بانک اطلاعاتی حذف خواهند شد."
                  : "Are you sure you want to delete this conversation? This action is irreversible and all messages in this discussion will be permanently removed from the database."}
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setDeleteSessionConfirm(null)}
                  className="px-4 py-2 border border-bmw-border text-bmw-text-sec hover:bg-bmw-hover rounded-lg text-xs font-medium transition-all"
                >
                  {isRtl ? "انصراف" : "Cancel"}
                </button>
                <button
                  onClick={confirmDeleteSession}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium shadow-md transition-all"
                >
                  {isRtl ? "بله، حذف شود" : "Yes, Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Document Modal */}
        {deleteDocConfirm?.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteDocConfirm(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Content Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-bmw-surface border border-bmw-border rounded-xl shadow-2xl p-6 overflow-hidden rtl:text-right ltr:text-left"
              dir={isRtl ? "rtl" : "ltr"}
            >
              <div className="flex items-center gap-3 border-b border-bmw-border pb-4 mb-4">
                <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                  <Trash2 size={20} />
                </div>
                <h3 className="text-sm font-semibold text-bmw-text">
                  {isRtl ? "حذف سند گراف روابط" : "Delete Graph Document"}
                </h3>
              </div>
              <p className="text-xs text-bmw-text-sec leading-relaxed mb-6">
                {isRtl
                  ? "آیا از حذف این سند گراف اطمینان دارید؟ با تأیید شما، تمامی موجودیت‌ها، رابطه‌ها و اطلاعات مستخرج از این سند به همراه تمامی گفت‌وگوها و پیام‌های کاربران درباره این سند به طور کامل از بانک اطلاعاتی حذف خواهند شد."
                  : "Are you sure you want to delete this graph document? Upon confirmation, all entities, relationships, extracted parameters, and related chat history from all users will be permanently deleted from the database."}
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setDeleteDocConfirm(null)}
                  className="px-4 py-2 border border-bmw-border text-bmw-text-sec hover:bg-bmw-hover rounded-lg text-xs font-medium transition-all"
                >
                  {isRtl ? "انصراف" : "Cancel"}
                </button>
                <button
                  onClick={confirmDeleteDoc}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium shadow-md transition-all"
                >
                  {isRtl ? "بله، حذف شود" : "Yes, Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Entity & Relationship Editor Modal */}
        {editingDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSavingDetails && setEditingDoc(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            {/* Content Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-bmw-surface border border-bmw-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] rtl:text-right ltr:text-left"
              dir={isRtl ? "rtl" : "ltr"}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-bmw-border p-4 bg-bmw-base/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-bmw-blue/10 text-bmw-blue rounded-lg">
                    <Database size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-bmw-text">
                      {isRtl
                        ? "ویرایش و اصلاح گراف روابط سند"
                        : "Edit & Refine Document Knowledge Graph"}
                    </h3>
                    <p className="text-[11px] text-bmw-text-sec mt-0.5 font-mono">
                      {editingDoc.title} ({editingDoc.file_name})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isSavingDetails}
                  onClick={() => setEditingDoc(null)}
                  className="text-bmw-text-sec hover:text-bmw-text text-lg p-1.5 focus:outline-none"
                >
                  ✕
                </button>
              </div>

              {/* Loader */}
              {isLoadingDetails ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="animate-spin text-bmw-blue" size={32} />
                  <span className="text-xs text-bmw-text-sec">
                    {isRtl
                      ? "در حال دریافت اطلاعات گراف..."
                      : "Retrieving knowledge graph records..."}
                  </span>
                </div>
              ) : (
                <>
                  {/* Tab Selector & Actions */}
                  <div className="border-b border-bmw-border p-3 flex flex-wrap items-center justify-between gap-3 bg-bmw-base/20">
                    <div className="flex gap-1.5 bg-bmw-base p-1 rounded-lg border border-bmw-border/60">
                      <button
                        type="button"
                        onClick={() => setActiveEditTab("entities")}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          activeEditTab === "entities"
                            ? "bg-bmw-blue text-white shadow-sm font-semibold"
                            : "text-bmw-text-sec hover:text-bmw-text"
                        }`}
                      >
                        {isRtl ? "موجودیت‌ها" : "Entities"}
                        <span className="rtl:mr-1.5 ltr:ml-1.5 bg-white/20 text-white px-1.5 py-0.5 rounded-full text-[10px] font-mono">
                          {editEntities.length}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveEditTab("relationships")}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          activeEditTab === "relationships"
                            ? "bg-bmw-blue text-white shadow-sm font-semibold"
                            : "text-bmw-text-sec hover:text-bmw-text"
                        }`}
                      >
                        {isRtl ? "رابطه‌ها" : "Relationships"}
                        <span className="rtl:mr-1.5 ltr:ml-1.5 bg-white/20 text-white px-1.5 py-0.5 rounded-full text-[10px] font-mono">
                          {editRelationships.length}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveEditTab("communities")}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          activeEditTab === "communities"
                            ? "bg-bmw-blue text-white shadow-sm font-semibold"
                            : "text-bmw-text-sec hover:text-bmw-text"
                        }`}
                      >
                        {isRtl
                          ? "انجمن‌های موضوعی (AI)"
                          : "Thematic Communities (AI)"}
                        <span className="rtl:mr-1.5 ltr:ml-1.5 bg-white/20 text-white px-1.5 py-0.5 rounded-full text-[10px] font-mono">
                          {docCommunities.length}
                        </span>
                      </button>
                    </div>

                    {/* Search & Adding */}
                    {activeEditTab !== "communities" ? (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={
                              activeEditTab === "entities"
                                ? isRtl
                                  ? "جستجوی موجودیت..."
                                  : "Search entity..."
                                : isRtl
                                  ? "جستجوی رابطه..."
                                  : "Search relation..."
                            }
                            value={
                              activeEditTab === "entities"
                                ? entitySearch
                                : relationSearch
                            }
                            onChange={(e) =>
                              activeEditTab === "entities"
                                ? setEntitySearch(e.target.value)
                                : setRelationSearch(e.target.value)
                            }
                            className="bg-bmw-base border border-bmw-border rounded-lg px-3 py-1.5 text-[11px] text-bmw-text pl-8 focus:outline-none focus:border-bmw-blue/50 w-44"
                          />
                          <Search
                            size={11}
                            className="absolute left-2.5 top-2.5 text-bmw-text-sec"
                          />
                        </div>

                        <button
                          type="button"
                          disabled={isResolvingEntities}
                          onClick={handleTriggerEntityResolution}
                          className="bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                          title={
                            isRtl
                              ? "ادغام و رفع هم‌پوشانی‌های اسامی توسط هوش مصنوعی"
                              : "Auto-resolve duplicate and overlapping entities using AI"
                          }
                        >
                          {isResolvingEntities ? (
                            <Loader2
                              size={13}
                              className="animate-spin text-purple-400"
                            />
                          ) : (
                            <Sparkles
                              size={13}
                              className="text-purple-400 animate-pulse"
                            />
                          )}
                          <span>
                            {isRtl
                              ? "ادغام خودکار موجودیت‌ها (AI)"
                              : "AI Entity Resolution"}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={
                            activeEditTab === "entities"
                              ? handleAddEditEntity
                              : handleAddEditRelationship
                          }
                          className="bg-bmw-blue/10 hover:bg-bmw-blue/20 text-bmw-blue border border-bmw-blue/30 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <Plus size={13} />
                          <span>
                            {activeEditTab === "entities"
                              ? isRtl
                                ? "افزودن موجودیت"
                                : "Add Entity"
                              : isRtl
                                ? "افزودن رابطه"
                                : "Add Relationship"}
                          </span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isAnalyzingCommunities}
                        onClick={handleTriggerCommunityDetection}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
                      >
                        {isAnalyzingCommunities ? (
                          <Loader2
                            size={13}
                            className="animate-spin text-white"
                          />
                        ) : (
                          <Sparkles
                            size={13}
                            className="text-white animate-pulse"
                          />
                        )}
                        <span>
                          {isRtl
                            ? "استخراج انجمن‌های موضوعی (AI)"
                            : "Extract Thematic Communities (AI)"}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Find & Replace Bar */}
                  <div className="border-b border-bmw-border p-3 flex flex-wrap items-center justify-between gap-3 bg-bmw-base/10">
                    <div className="flex items-center gap-2 text-xs font-semibold text-bmw-text">
                      <RefreshCw
                        size={13}
                        className="text-bmw-blue animate-spin-slow"
                      />
                      <span>
                        {isRtl
                          ? "جستجو و جایگزینی همگانی"
                          : "Global Find & Replace"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-bmw-text-sec">
                          {isRtl ? "جستجو:" : "Find:"}
                        </span>
                        <input
                          type="text"
                          placeholder={
                            isRtl ? "عبارت مبدا..." : "Text to find..."
                          }
                          value={findText}
                          onChange={(e) => setFindText(e.target.value)}
                          className="bg-bmw-base border border-bmw-border rounded-lg px-2.5 py-1 text-xs text-bmw-text focus:outline-none focus:border-bmw-blue/50 w-32 sm:w-40"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-bmw-text-sec">
                          {isRtl ? "جایگزینی:" : "Replace:"}
                        </span>
                        <input
                          type="text"
                          placeholder={
                            isRtl ? "عبارت جدید..." : "Replace with..."
                          }
                          value={replaceText}
                          onChange={(e) => setReplaceText(e.target.value)}
                          className="bg-bmw-base border border-bmw-border rounded-lg px-2.5 py-1 text-xs text-bmw-text focus:outline-none focus:border-bmw-blue/50 w-32 sm:w-40"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleFindAndReplace}
                        className="bg-bmw-blue hover:bg-blue-700 text-white px-3.5 py-1 rounded-lg text-xs font-semibold shadow-md transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 size={12} />
                        <span>{isRtl ? "جایگزینی همگانی" : "Replace All"}</span>
                      </button>
                    </div>
                  </div>

                  {replaceMessage && (
                    <div className="bg-bmw-blue/10 border-b border-bmw-blue/20 text-bmw-blue px-4 py-2.5 text-xs flex items-center gap-2 transition-all">
                      <Info size={14} className="shrink-0 animate-pulse" />
                      <span>{replaceMessage}</span>
                    </div>
                  )}

                  {/* Editor Scroll Content */}
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-[300px] max-h-[55vh]">
                    {detailsError && (
                      <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs flex items-center gap-2 animate-fade-in">
                        <AlertCircle size={14} />
                        <span>{detailsError}</span>
                      </div>
                    )}

                    {entityResolutionReport && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-lg text-xs flex flex-col gap-2 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1.5">
                            <CheckCircle2
                              size={14}
                              className="text-emerald-400 animate-bounce"
                            />
                            {isRtl
                              ? "ادغام و رفع ابهام موجودیت‌ها با موفقیت انجام شد!"
                              : "Entity Resolution completed successfully!"}
                          </span>
                          <button
                            type="button"
                            className="text-emerald-400 hover:text-white font-bold"
                            onClick={() => setEntityResolutionReport(null)}
                          >
                            ✕
                          </button>
                        </div>
                        {entityResolutionReport.length > 0 ? (
                          <div className="flex flex-col gap-1.5 mt-1 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
                            {entityResolutionReport.map(
                              (g: any, index: number) => (
                                <div
                                  key={index}
                                  className="bg-emerald-950/20 p-2 rounded border border-emerald-500/10 flex flex-col gap-0.5"
                                >
                                  <span className="font-semibold text-white text-xs">
                                    {isRtl
                                      ? `ادغام در «${g.canonical}»`
                                      : `Merged into "${g.canonical}"`}
                                  </span>
                                  <span className="text-[10px] text-emerald-400/80">
                                    {isRtl
                                      ? `عبارت‌های ادغام‌شده: ${g.aliases.join(", ")}`
                                      : `Merged aliases: ${g.aliases.join(", ")}`}
                                  </span>
                                  {g.explanation && (
                                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed italic">
                                      {g.explanation}
                                    </p>
                                  )}
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-emerald-400/80">
                            {isRtl
                              ? "موجودیت همپوشان یا نام‌های تکراری جدیدی یافت نشد. همه چیز مرتب است!"
                              : "No new overlapping entities or aliases were found. Everything is clean!"}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Entities Form List */}
                    {activeEditTab === "entities" && (
                      <div className="flex flex-col gap-2">
                        {editEntities.filter(
                          (ent) =>
                            ent.name
                              ?.toLowerCase()
                              .includes(entitySearch.toLowerCase()) ||
                            ent.type
                              ?.toLowerCase()
                              .includes(entitySearch.toLowerCase()) ||
                            ent.description
                              ?.toLowerCase()
                              .includes(entitySearch.toLowerCase()),
                        ).length > 0 ? (
                          <div className="border border-bmw-border rounded-lg overflow-hidden bg-bmw-base/10">
                            {/* Table Headers */}
                            <div className="grid grid-cols-12 gap-3 bg-bmw-base p-2.5 border-b border-bmw-border font-semibold text-bmw-text-sec text-[11px]">
                              <div className="col-span-4">
                                {isRtl
                                  ? "نام موجودیت (یکتا)"
                                  : "Entity Name (Unique)"}
                              </div>
                              <div className="col-span-3">
                                {isRtl ? "نوع موجودیت" : "Entity Type"}
                              </div>
                              <div className="col-span-4">
                                {isRtl ? "توضیحات کوتاه" : "Short Description"}
                              </div>
                              <div className="col-span-1 text-center">
                                {isRtl ? "حذف" : "Delete"}
                              </div>
                            </div>

                            {/* Table Rows */}
                            <div className="divide-y divide-bmw-border/50 max-h-[45vh] overflow-y-auto">
                              {editEntities
                                .filter(
                                  (ent) =>
                                    ent.name
                                      ?.toLowerCase()
                                      .includes(entitySearch.toLowerCase()) ||
                                    ent.type
                                      ?.toLowerCase()
                                      .includes(entitySearch.toLowerCase()) ||
                                    ent.description
                                      ?.toLowerCase()
                                      .includes(entitySearch.toLowerCase()),
                                )
                                .map((ent) => (
                                  <div
                                    key={ent.id}
                                    className="grid grid-cols-12 gap-3 p-2 bg-bmw-surface items-center hover:bg-bmw-base/10 transition-colors"
                                  >
                                    {/* Name Input */}
                                    <div className="col-span-4">
                                      <input
                                        type="text"
                                        value={ent.name}
                                        onChange={(e) =>
                                          handleUpdateEditEntity(
                                            ent.id,
                                            "name",
                                            e.target.value,
                                          )
                                        }
                                        placeholder={
                                          isRtl
                                            ? "نام را وارد کنید..."
                                            : "Enter name..."
                                        }
                                        className="w-full bg-bmw-base border border-bmw-border rounded-md px-2.5 py-1.5 text-xs text-bmw-text focus:outline-none focus:border-bmw-blue"
                                      />
                                    </div>

                                    {/* Type Select */}
                                    <div className="col-span-3">
                                      <select
                                        value={ent.type}
                                        onChange={(e) =>
                                          handleUpdateEditEntity(
                                            ent.id,
                                            "type",
                                            e.target.value,
                                          )
                                        }
                                        className="w-full bg-bmw-base border border-bmw-border rounded-md px-2 py-1.5 text-xs text-bmw-text focus:outline-none focus:border-bmw-blue"
                                      >
                                        <option value="Person">
                                          {isRtl ? "شخص (Person)" : "Person"}
                                        </option>
                                        <option value="Organization">
                                          {isRtl
                                            ? "سازمان (Organization)"
                                            : "Organization"}
                                        </option>
                                        <option value="Brand">
                                          {isRtl ? "برند (Brand)" : "Brand"}
                                        </option>
                                        <option value="Product">
                                          {isRtl
                                            ? "محصول (Product)"
                                            : "Product"}
                                        </option>
                                        <option value="Policy">
                                          {isRtl
                                            ? "آیین‌نامه / سیاست (Policy)"
                                            : "Policy"}
                                        </option>
                                        <option value="Process">
                                          {isRtl
                                            ? "فرآیند (Process)"
                                            : "Process"}
                                        </option>
                                        <option value="Location">
                                          {isRtl
                                            ? "مکان (Location)"
                                            : "Location"}
                                        </option>
                                        <option value="Concept">
                                          {isRtl
                                            ? "مفهوم (Concept)"
                                            : "Concept"}
                                        </option>
                                      </select>
                                    </div>

                                    {/* Description Textarea */}
                                    <div className="col-span-4">
                                      <textarea
                                        rows={1}
                                        value={ent.description || ""}
                                        onChange={(e) =>
                                          handleUpdateEditEntity(
                                            ent.id,
                                            "description",
                                            e.target.value,
                                          )
                                        }
                                        placeholder={
                                          isRtl
                                            ? "مثال: مدت گارانتی موتور..."
                                            : "e.g., Engine coverage details..."
                                        }
                                        className="w-full bg-bmw-base border border-bmw-border rounded-md px-2.5 py-1.5 text-xs text-bmw-text focus:outline-none focus:border-bmw-blue resize-none min-h-[34px]"
                                      />
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-1 text-center">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveEditEntity(ent.id)
                                        }
                                        className="text-bmw-text-sec hover:text-red-400 p-1 rounded-md hover:bg-red-500/5 transition-all"
                                        title={
                                          isRtl
                                            ? "حذف موجودیت"
                                            : "Remove Entity"
                                        }
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-10 bg-bmw-base/20 border border-dashed border-bmw-border/80 rounded-xl">
                            <Database
                              className="mx-auto text-bmw-text-sec opacity-40 mb-2"
                              size={24}
                            />
                            <p className="text-xs text-bmw-text-sec">
                              {entitySearch
                                ? isRtl
                                  ? "موجودیتی با این عبارت یافت نشد."
                                  : "No entities found matching search."
                                : isRtl
                                  ? 'هیچ موجودیتی وجود ندارد. برای شروع "افزودن موجودیت" را بزنید.'
                                  : 'No entities found. Click "Add Entity" to create one.'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Relationships Form List */}
                    {activeEditTab === "relationships" && (
                      <div className="flex flex-col gap-2">
                        {editRelationships.filter(
                          (rel) =>
                            rel.source_entity
                              ?.toLowerCase()
                              .includes(relationSearch.toLowerCase()) ||
                            rel.target_entity
                              ?.toLowerCase()
                              .includes(relationSearch.toLowerCase()) ||
                            rel.relation_type
                              ?.toLowerCase()
                              .includes(relationSearch.toLowerCase()) ||
                            rel.description
                              ?.toLowerCase()
                              .includes(relationSearch.toLowerCase()),
                        ).length > 0 ? (
                          <div className="border border-bmw-border rounded-lg overflow-hidden bg-bmw-base/10">
                            {/* Table Headers */}
                            <div className="grid grid-cols-12 gap-3 bg-bmw-base p-2.5 border-b border-bmw-border font-semibold text-bmw-text-sec text-[11px]">
                              <div className="col-span-3">
                                {isRtl
                                  ? "موجودیت مبدا (Source)"
                                  : "Source Entity"}
                              </div>
                              <div className="col-span-3">
                                {isRtl ? "نوع رابطه (VERB)" : "Relation Type"}
                              </div>
                              <div className="col-span-3">
                                {isRtl
                                  ? "موجودیت مقصد (Target)"
                                  : "Target Entity"}
                              </div>
                              <div className="col-span-2">
                                {isRtl ? "توضیحات" : "Description"}
                              </div>
                              <div className="col-span-1 text-center">
                                {isRtl ? "حذف" : "Delete"}
                              </div>
                            </div>

                            {/* Table Rows */}
                            <div className="divide-y divide-bmw-border/50 max-h-[45vh] overflow-y-auto">
                              {editRelationships
                                .filter(
                                  (rel) =>
                                    rel.source_entity
                                      ?.toLowerCase()
                                      .includes(relationSearch.toLowerCase()) ||
                                    rel.target_entity
                                      ?.toLowerCase()
                                      .includes(relationSearch.toLowerCase()) ||
                                    rel.relation_type
                                      ?.toLowerCase()
                                      .includes(relationSearch.toLowerCase()) ||
                                    rel.description
                                      ?.toLowerCase()
                                      .includes(relationSearch.toLowerCase()),
                                )
                                .map((rel) => (
                                  <div
                                    key={rel.id}
                                    className="grid grid-cols-12 gap-3 p-2 bg-bmw-surface items-center hover:bg-bmw-base/10 transition-colors"
                                  >
                                    {/* Source Input */}
                                    <div className="col-span-3">
                                      <input
                                        type="text"
                                        value={rel.source_entity}
                                        onChange={(e) =>
                                          handleUpdateEditRelationship(
                                            rel.id,
                                            "source_entity",
                                            e.target.value,
                                          )
                                        }
                                        placeholder={
                                          isRtl
                                            ? "مثال: ب‌ام‌و..."
                                            : "e.g., BMW..."
                                        }
                                        className="w-full bg-bmw-base border border-bmw-border rounded-md px-2.5 py-1.5 text-xs text-bmw-text focus:outline-none focus:border-bmw-blue"
                                      />
                                    </div>

                                    {/* Relation Type Input */}
                                    <div className="col-span-3">
                                      <input
                                        type="text"
                                        value={rel.relation_type}
                                        onChange={(e) =>
                                          handleUpdateEditRelationship(
                                            rel.id,
                                            "relation_type",
                                            e.target.value,
                                          )
                                        }
                                        placeholder={
                                          isRtl
                                            ? "مثال: WARRANTY_FOR..."
                                            : "e.g., HAS_WARRANTY..."
                                        }
                                        className="w-full bg-bmw-base border border-bmw-border rounded-md px-2.5 py-1.5 text-xs text-bmw-text focus:outline-none focus:border-bmw-blue uppercase"
                                      />
                                    </div>

                                    {/* Target Input */}
                                    <div className="col-span-3">
                                      <input
                                        type="text"
                                        value={rel.target_entity}
                                        onChange={(e) =>
                                          handleUpdateEditRelationship(
                                            rel.id,
                                            "target_entity",
                                            e.target.value,
                                          )
                                        }
                                        placeholder={
                                          isRtl
                                            ? "مثال: موتور..."
                                            : "e.g., Engine..."
                                        }
                                        className="w-full bg-bmw-base border border-bmw-border rounded-md px-2.5 py-1.5 text-xs text-bmw-text focus:outline-none focus:border-bmw-blue"
                                      />
                                    </div>

                                    {/* Description Textarea */}
                                    <div className="col-span-2">
                                      <textarea
                                        rows={1}
                                        value={rel.description || ""}
                                        onChange={(e) =>
                                          handleUpdateEditRelationship(
                                            rel.id,
                                            "description",
                                            e.target.value,
                                          )
                                        }
                                        placeholder={
                                          isRtl
                                            ? "توضیح رابطه..."
                                            : "Explain relation..."
                                        }
                                        className="w-full bg-bmw-base border border-bmw-border rounded-md px-2.5 py-1.5 text-xs text-bmw-text focus:outline-none focus:border-bmw-blue resize-none min-h-[34px]"
                                      />
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-1 text-center">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveEditRelationship(rel.id)
                                        }
                                        className="text-bmw-text-sec hover:text-red-400 p-1 rounded-md hover:bg-red-500/5 transition-all"
                                        title={
                                          isRtl
                                            ? "حذف رابطه"
                                            : "Remove Relationship"
                                        }
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-10 bg-bmw-base/20 border border-dashed border-bmw-border/80 rounded-xl">
                            <Network
                              className="mx-auto text-bmw-text-sec opacity-40 mb-2"
                              size={24}
                            />
                            <p className="text-xs text-bmw-text-sec">
                              {relationSearch
                                ? isRtl
                                  ? "رابطه‌ای با این عبارت یافت نشد."
                                  : "No relationships found matching search."
                                : isRtl
                                  ? 'هیچ رابطه‌ای وجود ندارد. برای شروع "افزودن رابطه" را بزنید.'
                                  : 'No relationships found. Click "Add Relationship" to create one.'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Thematic Communities List */}
                    {activeEditTab === "communities" && (
                      <div className="flex flex-col gap-4 animate-fade-in">
                        {docCommunities.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {docCommunities.map((comm, index) => {
                              let entityArray: string[] = [];
                              try {
                                entityArray =
                                  typeof comm.entities === "string"
                                    ? JSON.parse(comm.entities)
                                    : comm.entities;
                              } catch (e) {
                                entityArray = comm.entities || [];
                              }

                              return (
                                <div
                                  key={comm.id || index}
                                  className="bg-bmw-surface border border-bmw-border hover:border-amber-500/40 rounded-xl p-4 transition-all shadow-sm flex flex-col gap-2.5 relative overflow-hidden group"
                                >
                                  {/* Ambient Background Accent */}
                                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />

                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center text-[10px] font-bold">
                                      {index + 1}
                                    </span>
                                    <h4 className="text-xs font-bold text-bmw-text group-hover:text-amber-500 transition-colors">
                                      {comm.title}
                                    </h4>
                                  </div>

                                  <p className="text-[11px] text-bmw-text-sec leading-relaxed">
                                    {comm.summary}
                                  </p>

                                  <div className="mt-1 flex flex-col gap-1.5">
                                    <span className="text-[9px] font-semibold uppercase text-bmw-text-sec tracking-wider">
                                      {isRtl
                                        ? "اعضای کلیدی این انجمن:"
                                        : "Key Community Members:"}
                                    </span>
                                    <div className="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto custom-scrollbar pr-1">
                                      {entityArray.map(
                                        (ent: string, idx: number) => (
                                          <span
                                            key={idx}
                                            className="text-[10px] bg-bmw-base border border-bmw-border text-bmw-text px-2 py-0.5 rounded font-medium shadow-sm transition-all hover:border-bmw-blue/30"
                                          >
                                            {ent}
                                          </span>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-bmw-base/20 border border-dashed border-bmw-border/80 rounded-xl max-w-xl mx-auto flex flex-col items-center justify-center">
                            <Sparkles
                              className="text-amber-500 animate-pulse mb-3"
                              size={32}
                            />
                            <h4 className="text-xs font-bold text-bmw-text mb-1">
                              {isRtl
                                ? "انجمن موضوعی برای این سند یافت نشد"
                                : "No Thematic Communities Yet"}
                            </h4>
                            <p className="text-[11px] text-bmw-text-sec max-w-sm leading-relaxed mb-4">
                              {isRtl
                                ? "با استفاده از الگوریتم خوشه‌بندی شبکه و مدل‌های پیشرفته هوش مصنوعی، می‌توانید مفاهیم مرتبط این سند را به صورت خودکار دسته‌بندی و خلاصه‌سازی کنید."
                                : "Segment connected document concepts automatically into cluster themes using network topology and AI summary engines."}
                            </p>
                            <button
                              type="button"
                              disabled={isAnalyzingCommunities}
                              onClick={handleTriggerCommunityDetection}
                              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
                            >
                              {isAnalyzingCommunities ? (
                                <Loader2
                                  size={13}
                                  className="animate-spin text-white"
                                />
                              ) : (
                                <Sparkles
                                  size={13}
                                  className="text-white animate-pulse"
                                />
                              )}
                              <span>
                                {isRtl
                                  ? "اجرا و استخراج انجمن‌های موضوعی (AI)"
                                  : "Detect & Summarize Communities (AI)"}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="border-t border-bmw-border p-4 bg-bmw-base/50 flex justify-between items-center gap-4">
                    <span className="text-[10px] text-bmw-text-sec leading-relaxed hidden sm:block max-w-md">
                      {isRtl
                        ? "* نکته: نام‌های خالی یا روابط ناقص پس از ذخیره نادیده گرفته خواهند شد. تمامی تغییرات بلافاصله در بانک اطلاعاتی بروزرسانی شده و در کوئری‌های بعدی Graph RAG لحاظ می‌شوند."
                        : "* Tip: Blank entity names or incomplete relationships will be skipped upon save. All changes are immediately persistent and will affect future Graph RAG responses."}
                    </span>
                    <div className="flex gap-2 justify-end flex-1 sm:flex-initial">
                      <button
                        type="button"
                        disabled={isSavingDetails}
                        onClick={() => setEditingDoc(null)}
                        className="px-4 py-2 border border-bmw-border text-bmw-text-sec hover:bg-bmw-hover rounded-lg text-xs font-medium transition-all"
                      >
                        {isRtl ? "انصراف" : "Cancel"}
                      </button>
                      <button
                        type="button"
                        disabled={isSavingDetails}
                        onClick={handleSaveDocDetails}
                        className="px-4 py-2 bg-bmw-blue hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                      >
                        {isSavingDetails ? (
                          <>
                            <Loader2 className="animate-spin" size={13} />
                            {isRtl
                              ? "در حال ذخیره‌سازی..."
                              : "Saving Changes..."}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={13} />
                            {isRtl ? "ثبت و ذخیره تغییرات" : "Save Changes"}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}

        {/* Related Community Viewer Modal */}
        {selectedCommunityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCommunityModal(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            {/* Content Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-bmw-surface border border-bmw-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] rtl:text-right ltr:text-left"
              dir={isRtl ? "rtl" : "ltr"}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-bmw-border p-4 bg-bmw-base/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                    <Network size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-bmw-text">
                      {isRtl
                        ? "جزئیات انجمن موضوعی"
                        : "Thematic Community Details"}
                    </h3>
                    {selectedCommunityModal.document_title && (
                      <p className="text-[10px] text-bmw-text-sec mt-0.5">
                        {isRtl
                          ? `سند مرجع: ${selectedCommunityModal.document_title}`
                          : `Reference Document: ${selectedCommunityModal.document_title}`}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCommunityModal(null)}
                  className="p-1 rounded-md text-bmw-text-sec hover:bg-bmw-hover hover:text-bmw-text transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                {/* Title */}
                <div>
                  <h4 className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
                    {isRtl ? "موضوع / عنوان انجمن" : "Community Title / Theme"}
                  </h4>
                  <p className="text-sm font-bold text-bmw-text leading-snug">
                    {selectedCommunityModal.title}
                  </p>
                </div>

                {/* Summary */}
                <div>
                  <h4 className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1.5">
                    {isRtl
                      ? "خلاصه و تحلیل انجمن (AI)"
                      : "AI Summary & Analysis"}
                  </h4>
                  <div className="bg-bmw-base/40 border border-bmw-border/60 rounded-lg p-3.5 text-xs text-bmw-text leading-relaxed whitespace-pre-line">
                    {selectedCommunityModal.summary}
                  </div>
                </div>

                {/* Entities / Members */}
                <div>
                  <h4 className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">
                    {isRtl
                      ? "اعضای کلیدی این انجمن (موجودیت‌ها)"
                      : "Key Community Members (Entities)"}
                  </h4>
                  <div className="flex flex-wrap gap-1.5 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                    {selectedCommunityModal.entities &&
                      selectedCommunityModal.entities.map(
                        (ent: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-bmw-base border border-bmw-border hover:border-bmw-blue/40 text-bmw-text px-2.5 py-1 rounded-md font-medium transition-colors shadow-sm select-none"
                          >
                            {ent}
                          </span>
                        ),
                      )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-bmw-border p-3.5 bg-bmw-base/50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedCommunityModal(null)}
                  className="px-4 py-1.5 bg-bmw-blue hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  {isRtl ? "متوجه شدم" : "Got it"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartKnowledgeGraph;
