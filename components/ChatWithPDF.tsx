
import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  Database,
  Search,
  MessageSquare,
  Trash2,
  Plus,
  Send,
  Upload,
  History,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Loader2,
  RefreshCw,
  CheckCircle2,
  Info,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "../src/contexts/LanguageContext";
import { useMediaQuery } from "react-responsive";
import { useHasPermission } from "../src/hooks/usePermissions";
import { useAppSelector } from "../src/features/store";
const baseURL = "http://172.16.10.15:3001";

interface ChatSession {
  id: string;
  title: string;
  active_document_ids: number[];
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id?: number;
  role: "user" | "model";
  text: string;
  reaction?: string | null;
  searchDiagnostics?: any;
}

interface RagDoc {
  id: number;
  title: string;
  file_name: string;
  chunk_count: number;
  created_at: string;
  is_enabled?: boolean;
  doc_year?: number;
  doc_section?: string;
  docYear?: number;
  docSection?: string;
}

interface RagChunk {
  id: number;
  chunk_index: number;
  content: string;
}

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

  const regex =
    /\[(?:(?:Document|Citation|سند|منبع|ارجاع)\s*:?\s*([^|\]\n]+)(?:\|([^\]\n]+))?|([^|\]\n]+)\|([^\]\n]+))\]/gi;
  const parts: React.ReactNode[] = [];
  let currentText = chunkText;
  let key = 0;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(currentText)) !== null) {
    const matchIndex = match.index;
    const docTitle = (match[1] || match[3] || "").trim();

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
        key={`citation-${key++}`}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/10 text-[10px] font-semibold select-none"
      >
        <span>📄</span>
        <span>{docTitle}</span>
      </span>,
    );

    lastIndex = regex.lastIndex;
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

const ChatWithPDF: React.FC = () => {
  const { t, language } = useLanguage();
  const isRtl = language === "fa";
  const { hasPermission } = useHasPermission();

  // Tab states: 'chat' | 'admin'
  const [activeTab, setActiveTab] = useState<"chat" | "admin">("chat");

  // Global States
  const [ragDocs, setRagDocs] = useState<RagDoc[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [userId] = useState<string>("behzad-naderloo"); // default/logged-in user
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  // Tab 1: Chat States
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [deleteSessionConfirm, setDeleteSessionConfirm] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [inputText, setInputText] = useState("");
  const [selectedDocIds, setSelectedDocIds] = useState<number[]>([]);
  const [isLoadingChat, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDocSelectorExpanded, setIsDocSelectorExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [visibleCount, setVisibleCount] = useState(5);
  const userLogin = useAppSelector(
    (state) => state?.main?.userProfile?.userLogin,
  );
  // Advanced Search & Filter States
  const [hybridSearch, setHybridSearch] = useState(true);
  const [semanticWeight, setSemanticWeight] = useState(0.6);
  const [keywordWeight, setKeywordWeight] = useState(0.4);
  const [reranking, setReranking] = useState(true);
  const [queryTransformation, setQueryTransformation] = useState(true);
  const [filterYear, setFilterYear] = useState("all");
  const [filterSection, setFilterSection] = useState("all");
  const [lastDiagnostics, setLastDiagnostics] = useState<any>(null);
  const [isSearchConfigOpen, setIsSearchConfigOpen] = useState(false);

  // Auto-save RAG current chat draft
  const handleInputChange = (text: string) => {
    setInputText(text);
    if (activeSessionId) {
      localStorage.setItem(`rag_draft_${activeSessionId}`, text);
    }
  };

  // Restore RAG current chat draft on session change
  useEffect(() => {
    if (activeSessionId) {
      const savedDraft = localStorage.getItem(`rag_draft_${activeSessionId}`);
      setInputText(savedDraft || "");
    } else {
      setInputText("");
    }
  }, [activeSessionId]);

  // Handle up/down reaction
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
      await fetch(`${baseURL}/api/rag/chat/message/reaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: msgId, reaction: newReaction }),
      });
    } catch (err) {
      console.error("Error saving RAG message reaction:", err);
    }
  };

  // Tab 2: Admin/Upload States
  const [docTitle, setDocTitle] = useState("");
  const [docYear, setDocYear] = useState(2026);
  const [docSection, setDocSection] = useState("بخش عمومی");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setRagUploadProgress] = useState(0);
  const [uploadStatus, setRagUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [currentChunkInfo, setCurrentChunkInfo] = useState<{
    index: number;
    total: number;
    id: number;
    snippet: string;
  } | null>(null);

  // Document Chunks Editor States
  const [editingDoc, setEditingDoc] = useState<RagDoc | null>(null);
  const [editDocTitle, setEditDocTitle] = useState("");
  const [editDocYear, setEditDocYear] = useState("");
  const [editDocSection, setEditDocSection] = useState("");
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [editChunks, setEditChunks] = useState<RagChunk[]>([]);
  const [chunkSearch, setChunkSearch] = useState("");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [replaceMessage, setReplaceMessage] = useState<string | null>(null);
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  const handleStartEditDoc = async (doc: RagDoc) => {
    setEditingDoc(doc);
    setEditDocTitle(doc.title || "");
    setEditDocYear(String(doc.doc_year || doc.docYear || 2026));
    setEditDocSection(doc.doc_section || doc.docSection || "بخش عمومی");
    setIsLoadingDetails(true);
    setDetailsError(null);
    setEditChunks([]);
    setChunkSearch("");
    setFindText("");
    setReplaceText("");
    setReplaceMessage(null);

    try {
      const res = await fetch(`${baseURL}/api/rag/documents/${doc.id}/details`);
      if (!res.ok)
        throw new Error(
          isRtl
            ? "خطا در دریافت اطلاعات بخش‌های سند"
            : "Failed to load document chunks details",
        );
      const data = await res.json();
      setEditChunks(data.chunks || []);
    } catch (err: any) {
      console.error("Error loading chunks details:", err);
      setDetailsError(err.message || "Error loading details.");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSaveDocDetails = async () => {
    if (!editingDoc) return;
    setIsSavingDetails(true);
    setDetailsError(null);

    try {
      const res = await fetch(
        `${baseURL}/api/rag/documents/${editingDoc.id}/update-chunks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editDocTitle,
            docYear: editDocYear ? Number(editDocYear) : undefined,
            docSection: editDocSection,
            chunks: editChunks,
          }),
        },
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.error ||
            (isRtl ? "خطا در ذخیره‌سازی اطلاعات" : "Failed to save chunks"),
        );
      }

      await fetchRagDocs();
      setEditingDoc(null);
    } catch (err: any) {
      console.error("Error saving chunks details:", err);
      setDetailsError(err.message || "Error saving changes.");
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleFindAndReplace = () => {
    if (!findText) {
      setReplaceMessage(
        isRtl
          ? "لطفاً عبارت مبدا را وارد کنید."
          : "Please enter find text first.",
      );
      return;
    }

    let matchCount = 0;
    const updatedChunks = editChunks.map((chunk) => {
      const regex = new RegExp(findText, "g");
      const matches = chunk.content.match(regex);
      if (matches) {
        matchCount += matches.length;
      }
      const newContent = chunk.content.replace(regex, replaceText);
      return { ...chunk, content: newContent };
    });

    setEditChunks(updatedChunks);

    if (matchCount === 0) {
      setReplaceMessage(isRtl ? "هیچ موردی یافت نشد." : "No matches found.");
    } else {
      setReplaceMessage(
        isRtl
          ? `تعداد ${matchCount} مورد تغییر یافت (موقت در حافظه). برای اعمال دائمی، ذخیره را بزنید.`
          : `Replaced ${matchCount} occurrence(s) in memory. Click "Save Changes" to save permanently.`,
      );
    }
    setTimeout(() => setReplaceMessage(null), 6000);
  };

  const handleAddEditChunk = () => {
    const nextIndex =
      editChunks.length > 0
        ? Math.max(...editChunks.map((c) => c.chunk_index)) + 1
        : 0;
    const newChunk: RagChunk = {
      id: -Math.floor(Math.random() * 1000000),
      chunk_index: nextIndex,
      content: "",
    };
    setEditChunks([...editChunks, newChunk]);
  };

  const handleUpdateEditChunk = (id: number, content: string) => {
    setEditChunks((prev) =>
      prev.map((c) => (c.id === id ? { ...c, content } : c)),
    );
  };

  const handleRemoveEditChunk = (id: number) => {
    setEditChunks((prev) => prev.filter((c) => c.id !== id));
  };

  // Search & Filter state for User Chat Tab
  const [userDocSearchQuery, setUserDocSearchQuery] = useState("");

  // Search & Filter state for Admin RAG Tab
  const [adminDocSearchQuery, setAdminDocSearchQuery] = useState("");
  const [adminDocFilterStatus, setAdminDocFilterStatus] = useState<
    "all" | "enabled" | "disabled"
  >("all");

  // Fetch indexed documents list
  const fetchRagDocs = async () => {
    setIsLoadingDocs(true);
    try {
      const res = await fetch(`${baseURL}/api/rag/documents`);
      if (res.ok) {
        const data = await res.json();
        setRagDocs(data);
      }
    } catch (err) {
      console.error("Error fetching RAG documents:", err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  // Fetch all chat sessions for this user
  const fetchSessions = async (shouldSelectDefault = false) => {
    try {
      const res = await fetch(
        `${baseURL}/api/rag/chat/sessions?userId=${userLogin?.personalCode}`,
      );
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);

        // If shouldSelectDefault is true and there's an active session, load it
        if (
          shouldSelectDefault &&
          data.sessions &&
          data.sessions.length > 0 &&
          !activeSessionId
        ) {
          handleSelectSession(data.sessions[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  };

  // Initialize data on load
  useEffect(() => {
    fetchRagDocs();
    fetchSessions(false);
    handleNewChat();
  }, [userLogin?.personalCode]);

  // Set default intro message
  const setDefaultIntro = () => {
    setMessages([
      {
        role: "model",
        text: isRtl
          ? "سلام! به بخش گفتگوی هوشمند با اسناد سازمانی خوش آمدید. لطفاً اسناد فعال خود را از نوار بالا انتخاب کرده و سوال خود را مطرح کنید."
          : "Hello! Welcome to Smart Organization Documents Chat Assistant. Please select your active documents from the list above and ask any questions!",
      },
    ]);
  };

  // Start a completely new chat session
  const handleNewChat = () => {
    const newId = "session-" + Math.random().toString(36).substring(2, 11);
    setActiveSessionId(newId);
    setVisibleCount(5);
    setDefaultIntro();
  };

  // Load selected session's chat history
  const handleSelectSession = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    setVisibleCount(5);
    setIsSidebarOpen(false);
    setIsLoading(true);
    try {
      const foundSession = sessions.find((s) => s.id === sessionId);
      if (foundSession && foundSession.active_document_ids) {
        setSelectedDocIds(foundSession.active_document_ids);
      }

      const res = await fetch(`${baseURL}/api/rag/chat/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        const data = await res.json();
        const history = data.history || [];
        if (history.length > 0) {
          setMessages(history);
        } else {
          setDefaultIntro();
        }
      } else {
        setDefaultIntro();
      }
    } catch (err) {
      console.error("Error loading session history:", err);
      setDefaultIntro();
    } finally {
      setIsLoading(false);
    }
  };

  // Delete chat session
  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const found = sessions.find((s) => s.id === sessionId);
    setDeleteSessionConfirm({
      id: sessionId,
      title: found ? found.title : isRtl ? "این گفتگو" : "this chat session",
    });
  };

  const handleConfirmDeleteSession = async () => {
    if (!deleteSessionConfirm) return;
    const sessionId = deleteSessionConfirm.id;
    setDeleteSessionConfirm(null);
    try {
      const res = await fetch(`${baseURL}/api/rag/chat/sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const updated = sessions.filter((s) => s.id !== sessionId);
        setSessions(updated);
        if (activeSessionId === sessionId) {
          if (updated.length > 0) {
            handleSelectSession(updated[0].id);
          } else {
            handleNewChat();
          }
        }
      }
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoadingChat]);

  // Send message
  const handleSend = async () => {
    if (!inputText.trim() || isLoadingChat) return;

    const query = inputText.trim();
    const userMessage: ChatMessage = { role: "user", text: query };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    // Clear draft from localStorage on send
    if (activeSessionId) {
      localStorage.removeItem(`rag_draft_${activeSessionId}`);
    } else {
      localStorage.removeItem(`rag_draft_session-`);
    }

    setIsLoading(true);

    // If session ID isn't set, generate one now
    const sessionId =
      activeSessionId ||
      "session-" + Math.random().toString(36).substring(2, 11);
    if (!activeSessionId) {
      setActiveSessionId(sessionId);
    }

    try {
      const chatHistory = messages
        .filter(
          (m) => !m.text.startsWith("سلام!") && !m.text.startsWith("Hello!"),
        )
        .map((m) => ({
          role: m.role,
          content: m.text,
        }));
      chatHistory.push({ role: "user", content: query });

      const res = await fetch(`${baseURL}/api/rag/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          documentIds: selectedDocIds,
          appLanguage: language,
          sessionId,
          userId: userLogin?.personalCode,
          searchSettings: {
            hybridSearch,
            semanticWeight,
            keywordWeight,
            reranking,
            queryTransformation,
            metadataFilters: {
              year: filterYear,
              section: filterSection,
            },
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => {
          const updated = [...prev];
          // Update last user message with actual database ID
          if (
            updated.length > 0 &&
            updated[updated.length - 1].role === "user"
          ) {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              id: data.userMessageId,
            };
          }
          return [
            ...updated,
            {
              id: data.modelMessageId,
              role: "model",
              text: data.reply,
              reaction: null,
              searchDiagnostics: data.searchDiagnostics,
            },
          ];
        });
        setLastDiagnostics(data.searchDiagnostics);
        // Refresh sessions list to pull updated/newly created session details
        fetchSessions();
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text:
              data.error ||
              (isRtl ? "با عرض پوزش خطایی رخ داد." : "An error occurred."),
          },
        ]);
      }
    } catch (err) {
      console.error("RAG Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: isRtl
            ? "ارتباط با سرور امکان‌پذیر نبود."
            : "Failed to connect to the server.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!docTitle) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[_\-]/g, " ");
        setDocTitle(cleanName);
      }
    }
  };

  // Handle PDF upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadMsg(null);
    setCurrentChunkInfo(null);
    if (!selectedFile) {
      setUploadMsg({
        type: "error",
        text: isRtl
          ? "لطفاً ابتدا یک فایل انتخاب کنید."
          : "Please select a PDF file first.",
      });
      return;
    }
    if (!docTitle.trim()) {
      setUploadMsg({
        type: "error",
        text: isRtl
          ? "لطفاً عنوان سند را وارد کنید."
          : "Please enter a document title.",
      });
      return;
    }

    setIsUploading(true);
    setRagUploadProgress(5);
    setRagUploadStatus(isRtl ? "در حال خواندن فایل..." : "Reading PDF file...");

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = (reader.result as string).split(",")[1];
        try {
          const res = await fetch(`${baseURL}/api/rag/upload`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: docTitle.trim(),
              fileName: selectedFile.name,
              fileBase64: base64String,
              docYear,
              docSection,
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
            throw new Error("No response body stream.");
          }

          const streamReader = res.body.getReader();
          const decoder = new TextDecoder("utf-8");
          let buffer = "";

          while (true) {
            const { value, done } = await streamReader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              let cleanLine = line.trim();
              if (!cleanLine) continue;
              if (cleanLine.startsWith("data: ")) {
                cleanLine = cleanLine.substring(6).trim();
              }
              try {
                const data = JSON.parse(cleanLine);
                if (data.event === "start") {
                  setRagUploadProgress(10);
                  setRagUploadStatus(
                    isRtl ? "در حال خواندن فایل..." : "Reading PDF file...",
                  );
                } else if (data.event === "parsed") {
                  setRagUploadProgress(20);
                  setRagUploadStatus(
                    isRtl
                      ? "آنالیز ساختار سند به پایان رسید."
                      : "PDF parsing completed.",
                  );
                } else if (data.event === "chunking") {
                  setRagUploadProgress(25);
                  setRagUploadStatus(
                    isRtl
                      ? `تقسیم‌بندی به ${data.totalChunks} بخش...`
                      : `Splitting into ${data.totalChunks} chunks...`,
                  );
                } else if (data.event === "doc_saved") {
                  setRagUploadProgress(28);
                  setRagUploadStatus(
                    isRtl
                      ? "سند ذخیره شد. در حال تولید بردارها..."
                      : "Document saved. Generating vector embeddings...",
                  );
                } else if (data.event === "chunk_processed") {
                  const percent = Math.floor(
                    28 + (data.index / data.total) * 67,
                  );
                  setRagUploadProgress(percent);
                  setRagUploadStatus(
                    isRtl
                      ? `پردازش بخش ${data.index} از ${data.total}...`
                      : `Processing chunk ${data.index} of ${data.total}...`,
                  );
                  setCurrentChunkInfo({
                    index: data.index,
                    total: data.total,
                    id: data.chunkId,
                    snippet: data.textSnippet,
                  });
                } else if (data.event === "success") {
                  setRagUploadProgress(100);
                  setRagUploadStatus(
                    isRtl ? "موفقیت‌آمیز!" : "Successfully indexed!",
                  );
                  setUploadMsg({
                    type: "success",
                    text: isRtl
                      ? `سند "${docTitle}" با موفقیت تحلیل و به تعداد ${data.stats.chunkCount} بخش ذخیره شد.`
                      : `Document "${docTitle}" successfully processed into ${data.stats.chunkCount} semantic chunks!`,
                  });
                  setDocTitle("");
                  setSelectedFile(null);
                  setCurrentChunkInfo(null);
                  const fileInput = document.getElementById(
                    "pdf-file-input",
                  ) as HTMLInputElement;
                  if (fileInput) fileInput.value = "";
                  fetchRagDocs();
                } else if (data.event === "error") {
                  throw new Error(data.error);
                }
              } catch (parseErr) {
                console.error("Failed to parse stream line:", line, parseErr);
              }
            }
          }
        } catch (err: any) {
          setRagUploadProgress(0);
          setCurrentChunkInfo(null);
          setUploadMsg({
            type: "error",
            text: err.message || "Error uploading file.",
          });
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (err: any) {
      setRagUploadProgress(0);
      setCurrentChunkInfo(null);
      setUploadMsg({
        type: "error",
        text: err.message || "Error reading file.",
      });
      setIsUploading(false);
    }
  };

  // Delete document
  const handleDeleteDoc = (id: number, title: string) => {
    setDeleteConfirmDoc({ id, title });
  };

  // Toggle document enable/disable state
  const handleToggleDocEnable = async (id: number, currentEnabled: boolean) => {
    try {
      const res = await fetch(`${baseURL}/api/rag/documents/${id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !currentEnabled }),
      });
      if (res.ok) {
        fetchRagDocs();
      }
    } catch (err) {
      console.error("Error toggling document status:", err);
    }
  };

  // Toggle document selection for chat focus
  const handleToggleDocSelection = (id: number) => {
    setSelectedDocIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((docId) => docId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Filtered documents for user chat selection
  const filteredEnabledDocs = ragDocs
    .filter((doc) => doc.is_enabled !== false)
    .filter((doc) => {
      if (!userDocSearchQuery.trim()) return true;
      const query = userDocSearchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(query) ||
        (doc.file_name && doc.file_name.toLowerCase().includes(query))
      );
    });

  // Filtered documents for admin list
  const filteredAdminDocs = ragDocs.filter((doc) => {
    // 1. Filter by status
    if (adminDocFilterStatus === "enabled" && doc.is_enabled === false)
      return false;
    if (adminDocFilterStatus === "disabled" && doc.is_enabled !== false)
      return false;

    // 2. Filter by search query
    if (!adminDocSearchQuery.trim()) return true;
    const query = adminDocSearchQuery.toLowerCase();
    const matchesTitle = doc.title.toLowerCase().includes(query);
    const matchesFileName =
      doc.file_name && doc.file_name.toLowerCase().includes(query);
    const dateStr = new Date(doc.created_at).toLocaleDateString(
      language === "fa" ? "fa-IR" : "en-US",
    );
    const matchesDate = dateStr.includes(query);

    return matchesTitle || matchesFileName || matchesDate;
  });

  return (
    <div className="space-y-6 animate-fade-in" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-bmw-border pb-5">
        <div>
          <h1 className="text-3xl font-bold text-bmw-text tracking-tight">
            {isRtl
              ? "مکالمه هوشمند با اسناد سازمانی"
              : "Chat with PDF Documents"}
          </h1>
          <p className="text-bmw-textSec text-sm mt-1">
            {isRtl
              ? "مستقیماً با محتوای اسناد و مدارک سازمانی، چت کنید و پاسخهای علمی و دقیق دریافت کنید."
              : "Upload reference guides, policies, or contracts and ask questions directly about their contents."}
          </p>
        </div>

        <div className="flex bg-bmw-surface p-1 rounded-lg border border-bmw-border shadow-md">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-2 text-xs md:text-sm font-bold rounded-md transition-all ${
              activeTab === "chat"
                ? "bg-bmw-blue text-white shadow-lg"
                : "text-bmw-textSec hover:text-bmw-text"
            }`}
          >
            {isRtl ? "گفتگوی هوشمند" : "AI Assistant Chat"}
          </button>
          {hasPermission("ChatSmart.show") && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-4 py-2 text-xs md:text-sm font-bold rounded-md transition-all ${
                activeTab === "admin"
                  ? "bg-bmw-blue text-white shadow-lg"
                  : "text-bmw-textSec hover:text-bmw-text"
              }`}
            >
              {isRtl ? "مدیریت اسناد" : "Document Manager"}
            </button>
          )}
        </div>
      </div>
      {/* RAG Chat Assistant Tab */}
      {activeTab === "chat" && (
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Sidebar (History & Past Sessions) */}
          <div
            className={`${isSidebarOpen || isDesktop ? "flex" : "hidden"} col-span-12 lg:col-span-4 bg-bmw-surface border border-bmw-border
            rounded-xl p-4 flex-col h-[350px] lg:h-[650px] overflow-hidden shadow-sm`}
          >
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-bmw-border">
              <span className="text-xs font-bold text-bmw-text uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-bmw-blue" />
                {isRtl ? "تاریخچه گفتگوها" : "Conversations"}
              </span>
              <button
                onClick={handleNewChat}
                className="bg-bmw-blue hover:bg-blue-600 text-white p-1.5 rounded-lg transition-all"
                title={isRtl ? "مکالمه جدید" : "New Chat"}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
              {sessions.length === 0 ? (
                <p className="text-xs text-bmw-textSec italic text-center py-8">
                  {isRtl
                    ? "هیچ گفتگویی یافت نشد."
                    : "No conversations started yet."}
                </p>
              ) : (
                sessions.map((sess) => {
                  const isActive = sess.id === activeSessionId;
                  return (
                    <div
                      key={sess.id}
                      onClick={() => handleSelectSession(sess.id)}
                      className={`group flex items-center justify-between p-3 rounded-lg text-sm transition-all cursor-pointer border ${
                        isActive
                          ? "bg-bmw-blue/10 border-bmw-blue/30 text-bmw-text font-semibold"
                          : "border-transparent text-bmw-textSec hover:bg-bmw-hover hover:text-bmw-text"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MessageSquare
                          className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-bmw-blue" : "text-bmw-textSec"}`}
                        />
                        <span className="truncate text-xs">{sess.title}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSession(e, sess.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-bmw-textSec hover:text-red-400 transition-all"
                        title={isRtl ? "حذف" : "Delete"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Main Chat Interface */}
          <div className="lg:col-span-8 col-span-12 bg-bmw-surface border border-bmw-border rounded-xl flex flex-col h-[500px] sm:h-[600px] lg:h-[650px] overflow-hidden shadow-sm relative">
            {/* Mobile-only header to toggle history/sidebar */}
            <div className="lg:hidden h-14 border-b border-bmw-border px-4 flex items-center justify-between bg-bmw-hover/50 shrink-0 select-none">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="flex items-center gap-1.5 text-xs text-bmw-text hover:bg-bmw-hover px-3 py-1.5 rounded-lg border border-bmw-border bg-bmw-surface transition-all cursor-pointer font-bold shadow-sm"
              >
                <History className="w-4 h-4 text-bmw-blue" />
                <span>{isRtl ? "تاریخچه گفتگوها" : "History"}</span>
              </button>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-mono text-bmw-textSec font-bold">
                  GEMINI 2.5 ACTIVE
                </span>
              </div>
            </div>

            {/* Top Selector Panel: Select PDF context */}
            <div className="bg-bmw-hover border-b border-bmw-border p-3 md:p-4 flex flex-col gap-2.5 transition-all">
              <div
                onClick={() => setIsDocSelectorExpanded(!isDocSelectorExpanded)}
                className="flex items-center justify-between cursor-pointer hover:opacity-90 select-none"
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Database
                    size={14}
                    className="text-bmw-blue animate-pulse shrink-0"
                  />
                  <span className="text-[11px] sm:text-xs font-bold text-bmw-text tracking-wide uppercase">
                    {isRtl
                      ? "منابع جستجوی معنایی (RAG)"
                      : "Semantic Query Sources (RAG)"}
                  </span>
                  <span className="text-[9px] sm:text-[10px] bg-bmw-blue/15 text-bmw-blue px-2 py-0.5 rounded-full font-bold">
                    {selectedDocIds.length === 0
                      ? isRtl
                        ? "همه اسناد فعال"
                        : "All Active Docs"
                      : isRtl
                        ? `${selectedDocIds.length} سند انتخاب شده`
                        : `${selectedDocIds.length} Selected`}
                  </span>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-bmw-blue bg-bmw-blue/10 hover:bg-bmw-blue/20 px-2 py-1 rounded-md transition-all border border-bmw-blue/20 cursor-pointer"
                >
                  <span>
                    {isDocSelectorExpanded
                      ? isRtl
                        ? "بستن تنظیمات منابع"
                        : "Hide Sources"
                      : isRtl
                        ? "تنظیم و انتخاب منابع"
                        : "Manage Sources"}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${isDocSelectorExpanded ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              {isDocSelectorExpanded && (
                <div className="flex flex-col gap-3 animate-fade-in pt-2 border-t border-bmw-border/30">
                  <p className="text-[10px] text-bmw-textSec leading-relaxed">
                    {isRtl
                      ? "اسناد مورد نظر برای پاسخ‌دهی هوشمند را انتخاب کنید. اگر هیچ سندی را انتخاب نکنید، جستجو بر روی همه اسناد فعال انجام می‌شود."
                      : "Select specific source documents to target. If none are selected, queries search across all enabled sources."}
                  </p>

                  {ragDocs.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bmw-surface/50 border border-bmw-border/50 rounded-xl p-2.5">
                      {/* Local Document search */}
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={userDocSearchQuery}
                          onChange={(e) =>
                            setUserDocSearchQuery(e.target.value)
                          }
                          placeholder={
                            isRtl
                              ? "جستجو در عنوان یا نام فایل..."
                              : "Search active sources..."
                          }
                          className="w-full bg-bmw-surface border border-bmw-border/80 rounded-lg pl-7 pr-3 py-1.5 text-[11px] text-bmw-text focus:outline-none focus:border-bmw-blue/50 transition-all placeholder:text-[10px]"
                        />
                        <Search
                          size={11}
                          className="absolute left-2.5 top-2.5 text-bmw-textSec"
                        />
                        {userDocSearchQuery && (
                          <button
                            onClick={() => setUserDocSearchQuery("")}
                            className="absolute right-2.5 top-2 text-[10px] text-bmw-textSec hover:text-bmw-text font-semibold px-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Select/Deselect actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const enabled = ragDocs.filter(
                              (d) => d.is_enabled !== false,
                            );
                            const enabledIds = enabled.map((d) => d.id);
                            const allSelected = enabledIds.every((id) =>
                              selectedDocIds.includes(id),
                            );
                            if (allSelected) {
                              setSelectedDocIds([]);
                            } else {
                              setSelectedDocIds(enabledIds);
                            }
                          }}
                          className="text-[10px] text-bmw-blue hover:text-blue-400 bg-bmw-blue/5 hover:bg-bmw-blue/10 border border-bmw-blue/10 rounded-lg px-3 py-1.5 font-bold transition-all"
                        >
                          {ragDocs
                            .filter((d) => d.is_enabled !== false)
                            .every((d) => selectedDocIds.includes(d.id)) &&
                          selectedDocIds.length > 0
                            ? isRtl
                              ? "لغو انتخاب همه"
                              : "Clear All"
                            : isRtl
                              ? "انتخاب همه فعال‌ها"
                              : "Select All Active"}
                        </button>
                      </div>
                    </div>
                  )}

                  {ragDocs.length === 0 ? (
                    <p className="text-[11px] text-bmw-textSec bg-bmw-base p-3 rounded-lg text-center border border-dashed border-bmw-border">
                      {isRtl
                        ? "هیچ سندی وجود ندارد."
                        : "No knowledge documents found."}
                    </p>
                  ) : (
                    (() => {
                      const enabledDocs = ragDocs.filter(
                        (d) => d.is_enabled !== false,
                      );
                      const filteredDocs = enabledDocs.filter((doc) => {
                        const matchTitle = (doc.title || "")
                          .toLowerCase()
                          .includes(userDocSearchQuery.toLowerCase());
                        const matchFile = (doc.file_name || "")
                          .toLowerCase()
                          .includes(userDocSearchQuery.toLowerCase());
                        return matchTitle || matchFile;
                      });

                      return (
                        <div className="flex flex-col gap-2">
                          {/* Interactive scroll list with responsive larger max-height */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                            {filteredDocs.map((doc) => {
                              const isSelected = selectedDocIds.includes(
                                doc.id,
                              );
                              return (
                                <button
                                  key={doc.id}
                                  type="button"
                                  onClick={() =>
                                    handleToggleDocSelection(doc.id)
                                  }
                                  className={`flex items-start gap-2.5 text-left w-full p-2.5 rounded-lg transition-all text-xs border ${
                                    isSelected
                                      ? "bg-bmw-blue/10 border-bmw-blue/40 text-bmw-blue font-semibold shadow-sm"
                                      : "bg-bmw-surface border-bmw-border/30 hover:bg-bmw-hover text-bmw-textSec"
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
                                    <div
                                      className="text-[9px] text-bmw-textSec font-mono mt-0.5 truncate opacity-70"
                                      title={doc.file_name}
                                    >
                                      {doc.file_name}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-0.5 shrink-0 select-none text-[9px] text-right">
                                    <span className="font-mono font-medium opacity-80 px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-bmw-text/80">
                                      {doc.chunk_count}{" "}
                                      {isRtl ? "بخش" : "chunks"}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}

                            {filteredDocs.length === 0 &&
                              enabledDocs.length > 0 && (
                                <div className="col-span-full text-center p-4 bg-bmw-base/30 rounded border border-bmw-border/50">
                                  <p className="text-[10px] text-bmw-textSec">
                                    {isRtl
                                      ? "هیچ موردی با جستجوی شما مطابقت ندارد."
                                      : "No active sources match your search."}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => setUserDocSearchQuery("")}
                                    className="text-[10px] text-bmw-blue hover:underline mt-1 font-medium bg-transparent border-0 cursor-pointer"
                                  >
                                    {isRtl
                                      ? "پاک کردن جستجو"
                                      : "Clear Search Query"}
                                  </button>
                                </div>
                              )}

                            {enabledDocs.length === 0 && (
                              <div className="col-span-full text-center p-4 bg-amber-950/10 border border-amber-900/30 rounded-lg">
                                <p className="text-[11px] text-amber-400">
                                  {isRtl
                                    ? "تمام اسناد غیرفعال هستند. لطفاً به بخش مدیریت اسناد بروید."
                                    : "All documents are currently disabled. Please enable them in the Document Manager tab."}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Display Selected Filtered helper if query is active */}
                          {userDocSearchQuery && filteredDocs.length > 0 && (
                            <div className="flex items-center justify-between pt-1 border-t border-bmw-border/30 text-[10px] text-bmw-textSec">
                              <span>
                                {isRtl
                                  ? `نتایج جستجو: ${filteredDocs.length} سند`
                                  : `Found ${filteredDocs.length} matching`}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const filteredIds = filteredDocs.map(
                                    (d) => d.id,
                                  );
                                  const allSelected = filteredIds.every((id) =>
                                    selectedDocIds.includes(id),
                                  );
                                  if (allSelected) {
                                    // Deselect filtered
                                    setSelectedDocIds((prev) =>
                                      prev.filter(
                                        (id) => !filteredIds.includes(id),
                                      ),
                                    );
                                  } else {
                                    // Select filtered
                                    setSelectedDocIds((prev) =>
                                      Array.from(
                                        new Set([...prev, ...filteredIds]),
                                      ),
                                    );
                                  }
                                }}
                                className="text-bmw-blue hover:underline font-medium bg-transparent border-0 cursor-pointer"
                              >
                                {filteredDocs.every((d) =>
                                  selectedDocIds.includes(d.id),
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
              )}
            </div>

            {/* Advanced Search & Filtering Configuration Panel */}
            <div className="border border-bmw-border/60 bg-bmw-surface/30 rounded-2xl p-4 mt-3">
              <button
                type="button"
                onClick={() => setIsSearchConfigOpen(!isSearchConfigOpen)}
                className="w-full flex items-center justify-between text-xs font-bold text-bmw-blue/90 hover:text-bmw-blue transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Search size={14} className="text-bmw-blue" />
                  <span>
                    {isRtl
                      ? "تنظیمات جستجوی ترکیبی و فیلترهای پیشرفته اسناد"
                      : "Hybrid Search Settings & Advanced Document Filters"}
                  </span>
                  {(hybridSearch ||
                    reranking ||
                    filterYear !== "all" ||
                    filterSection !== "all") && (
                    <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
                  )}
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isSearchConfigOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isSearchConfigOpen && (
                <div className="mt-4 pt-3 border-t border-bmw-border/50 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in text-xs">
                  {/* Left column: Search algorithms */}
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-bmw-text flex items-center gap-1.5">
                        <span>
                          {isRtl
                            ? "جستجوی ترکیبی (Hybrid Search)"
                            : "Hybrid Search"}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-bmw-blue rounded font-normal font-mono">
                          Vector + BM25
                        </span>
                      </label>
                      <input
                        type="checkbox"
                        checked={hybridSearch}
                        onChange={(e) => setHybridSearch(e.target.checked)}
                        className="w-4 h-4 rounded text-bmw-blue focus:ring-bmw-blue border-bmw-border"
                      />
                    </div>

                    {hybridSearch && (
                      <div className="space-y-2 bg-bmw-base/40 p-2.5 rounded-xl border border-bmw-border/30">
                        <div className="flex items-center justify-between text-[11px] text-bmw-textSec">
                          <span>
                            {isRtl
                              ? `وزن معنایی: ${semanticWeight}`
                              : `Semantic Weight: ${semanticWeight}`}
                          </span>
                          <span>
                            {isRtl
                              ? `وزن کلمه‌ای: ${keywordWeight}`
                              : `Keyword Weight: ${keywordWeight}`}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={semanticWeight}
                          onChange={(e) => {
                            const sem = Number(e.target.value);
                            setSemanticWeight(sem);
                            setKeywordWeight(Number((1 - sem).toFixed(1)));
                          }}
                          className="w-full h-1.5 bg-bmw-border rounded-lg appearance-none cursor-pointer accent-bmw-blue"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <label className="font-bold text-bmw-text flex items-center gap-1.5">
                        <span>
                          {isRtl ? "رتبه‌بندی مجدد (Reranking)" : "Reranking"}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded font-normal font-mono">
                          Cross-Encoder
                        </span>
                      </label>
                      <input
                        type="checkbox"
                        checked={reranking}
                        onChange={(e) => setReranking(e.target.checked)}
                        className="w-4 h-4 rounded text-bmw-blue focus:ring-bmw-blue border-bmw-border cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="font-bold text-bmw-text flex items-center gap-1.5">
                        <span>
                          {isRtl
                            ? "بازنویسی هوشمند کوئری"
                            : "Query Transformation"}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded font-normal font-mono">
                          Gemini Rewrite
                        </span>
                      </label>
                      <input
                        type="checkbox"
                        checked={queryTransformation}
                        onChange={(e) =>
                          setQueryTransformation(e.target.checked)
                        }
                        className="w-4 h-4 rounded text-bmw-blue focus:ring-bmw-blue border-bmw-border cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Right column: Filters */}
                  <div className="space-y-3.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-bmw-text">
                        {isRtl
                          ? "فیلتر بر اساس سال سند"
                          : "Filter by Document Year"}
                      </label>
                      <select
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                        className="bg-bmw-surface border border-bmw-border/80 rounded-lg p-2 text-xs focus:outline-none focus:border-bmw-blue/50"
                      >
                        <option value="all">
                          {isRtl ? "همه سال‌ها" : "All Years"}
                        </option>
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-bmw-text">
                        {isRtl
                          ? "فیلتر بر اساس بخش/فصل"
                          : "Filter by Section/Chapter"}
                      </label>
                      <select
                        value={filterSection}
                        onChange={(e) => setFilterSection(e.target.value)}
                        className="bg-bmw-surface border border-bmw-border/80 rounded-lg p-2 text-xs focus:outline-none focus:border-bmw-blue/50"
                      >
                        <option value="all">
                          {isRtl ? "همه بخش‌ها" : "All Sections"}
                        </option>
                        <option value="فصل اول">
                          {isRtl ? "فصل اول / بخش ۱" : "Chapter 1 / Section 1"}
                        </option>
                        <option value="فصل دوم">
                          {isRtl ? "فصل دوم / بخش ۲" : "Chapter 2 / Section 2"}
                        </option>
                        <option value="فصل سوم">
                          {isRtl ? "فصل سوم / بخش ۳" : "Chapter 3 / Section 3"}
                        </option>
                        <option value="فصل چهارم">
                          {isRtl
                            ? "فصل چهارم / بخش ۴"
                            : "Chapter 4 / Section 4"}
                        </option>
                        <option value="بخش عمومی">
                          {isRtl ? "بخش عمومی" : "General Section"}
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Bottom banner for query extraction */}
                  <div className="col-span-full mt-2 p-2 bg-bmw-blue/5 border border-bmw-blue/15 rounded-xl flex items-center gap-2 text-[10px] text-bmw-textSec">
                    <Info size={12} className="text-bmw-blue shrink-0" />
                    <span>
                      {isRtl
                        ? 'سیستم به صورت خودکار فیلترها را از متن سوال شما نیز استخراج می‌کند (مانند: "در اسناد سال ۲۰۲۳ و فصل دوم").'
                        : 'The system also auto-extracts metadata filters from your query (e.g. "in 2023 documents under chapter 2").'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Conversation Messages List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
              {messages.slice(0, visibleCount).map((msg, index) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={index}
                    className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
                  >
                    <div
                      className={`p-4 rounded-xl shadow-sm max-w-[85%] md:max-w-[75%] ${
                        isUser
                          ? "bg-bmw-blue text-white rounded-tr-none"
                          : "bg-bmw-hover text-bmw-text border border-bmw-border rounded-tl-none"
                      }`}
                    >
                      {isUser ? (
                        <p className="text-xs md:text-sm whitespace-pre-wrap leading-relaxed">
                          {msg.text}
                        </p>
                      ) : (
                        <div className="space-y-1 text-xs md:text-sm leading-relaxed">
                          {formatResponseText(msg.text, isRtl)}

                          {/* Reaction system for model responses */}
                          {msg.id && (
                            <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-bmw-border/40 text-bmw-textSec">
                              <span className="text-[10px] select-none opacity-70">
                                {isRtl ? "بازخورد:" : "Feedback:"}
                              </span>
                              <button
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
                            </div>
                          )}

                          {msg.searchDiagnostics && (
                            <div className="mt-3 bg-bmw-base p-2.5 rounded-lg border border-bmw-border/60 text-[10px] text-bmw-textSec space-y-2 select-none">
                              <details className="group">
                                <summary className="flex items-center justify-between cursor-pointer font-bold text-bmw-text select-none">
                                  <span className="flex items-center gap-1.5 text-[11px] text-bmw-blue/90">
                                    <Database
                                      size={12}
                                      className="text-bmw-blue shrink-0"
                                    />
                                    {isRtl
                                      ? "جزئیات فنی موتور جستجو و رتبه‌بندی"
                                      : "Search Engine & Reranking Diagnostics"}
                                  </span>
                                  <span className="text-[10px] text-bmw-textSec group-open:rotate-180 transition-transform">
                                    ▼
                                  </span>
                                </summary>

                                <div className="mt-2 pt-2 border-t border-bmw-border/40 space-y-2.5 animate-fade-in text-[10.5px]">
                                  <div className="flex flex-wrap gap-1.5">
                                    <span className="px-1.5 py-0.5 bg-blue-500/5 border border-blue-500/10 text-bmw-blue rounded">
                                      {isRtl
                                        ? "جستجوی ترکیبی:"
                                        : "Hybrid Search:"}{" "}
                                      {msg.searchDiagnostics.isHybridEnabled
                                        ? "✓"
                                        : "✗"}
                                    </span>
                                    {msg.searchDiagnostics.isHybridEnabled && (
                                      <span className="px-1.5 py-0.5 bg-zinc-500/5 border border-zinc-500/10 rounded">
                                        W:{" "}
                                        {msg.searchDiagnostics.semanticWeight}S
                                        / {msg.searchDiagnostics.keywordWeight}K
                                      </span>
                                    )}
                                    <span className="px-1.5 py-0.5 bg-purple-500/5 border border-purple-500/10 text-purple-600 dark:text-purple-400 rounded">
                                      {isRtl ? "رتبه‌بندی مجدد:" : "Reranker:"}{" "}
                                      {msg.searchDiagnostics.isRerankingEnabled
                                        ? "✓"
                                        : "✗"}
                                    </span>
                                    <span className="px-1.5 py-0.5 bg-zinc-500/5 border border-zinc-500/10 rounded">
                                      {isRtl
                                        ? `تعداد کل تکه‌ها: ${msg.searchDiagnostics.retrievedCount}`
                                        : `Total chunks: ${msg.searchDiagnostics.retrievedCount}`}
                                    </span>
                                  </div>

                                  {msg.searchDiagnostics.queryTransformation &&
                                    msg.searchDiagnostics.queryTransformation
                                      .enabled && (
                                      <div className="bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/20 space-y-1.5 text-[10px]">
                                        <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                                          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse animate-duration-1000 shrink-0" />
                                          <span>
                                            {isRtl
                                              ? "بهینه‌سازی و بازنویسی هوشمند سوال (Query Transformation):"
                                              : "Query Transformation Diagnostics:"}
                                          </span>
                                        </div>
                                        <div className="space-y-1">
                                          <div>
                                            <span className="text-bmw-text font-bold">
                                              {isRtl
                                                ? "سوالClarified نهایی:"
                                                : "Clarified Search Query:"}{" "}
                                            </span>
                                            <span className="text-bmw-textSec italic">
                                              "
                                              {
                                                msg.searchDiagnostics
                                                  .queryTransformation
                                                  .clarifiedQuery
                                              }
                                              "
                                            </span>
                                          </div>
                                          {msg.searchDiagnostics
                                            .queryTransformation.variations &&
                                            msg.searchDiagnostics
                                              .queryTransformation.variations
                                              .length > 0 && (
                                              <div>
                                                <span className="text-bmw-text font-bold block">
                                                  {isRtl
                                                    ? "نسخه‌های موازی تولید شده برای جستجوی کلیدواژه‌ای:"
                                                    : "Parallel search variations generated:"}
                                                </span>
                                                <ul className="list-disc pl-4 rtl:pl-0 rtl:pr-4 space-y-0.5 mt-0.5 font-sans">
                                                  {msg.searchDiagnostics.queryTransformation.variations.map(
                                                    (
                                                      v: string,
                                                      idx: number,
                                                    ) => (
                                                      <li
                                                        key={idx}
                                                        className="text-bmw-textSec italic"
                                                      >
                                                        "{v}"
                                                      </li>
                                                    ),
                                                  )}
                                                </ul>
                                              </div>
                                            )}
                                        </div>
                                      </div>
                                    )}

                                  <div className="bg-bmw-surface p-1.5 rounded border border-bmw-border/30 grid grid-cols-2 gap-2 text-[10px]">
                                    <div>
                                      <span className="font-bold block text-bmw-text">
                                        {isRtl
                                          ? "فیلترهای اعمال‌شده:"
                                          : "Applied Filters:"}
                                      </span>
                                      <span className="font-mono text-bmw-textSec">
                                        Year:{" "}
                                        {msg.searchDiagnostics.filtersApplied
                                          ?.year || "all"}
                                        , Sec:{" "}
                                        {msg.searchDiagnostics.filtersApplied
                                          ?.section || "all"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-bold block text-bmw-text">
                                        {isRtl
                                          ? "استخراج خودکار از سوال:"
                                          : "Auto-extracted from query:"}
                                      </span>
                                      <span className="font-mono text-bmw-textSec">
                                        Year:{" "}
                                        {msg.searchDiagnostics.extractedFilters
                                          ?.year || "none"}
                                        , Sec:{" "}
                                        {msg.searchDiagnostics.extractedFilters
                                          ?.section || "none"}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <span className="font-bold text-bmw-text block">
                                      {isRtl
                                        ? "۵ تکه سند برتر راه‌یافته به مدل:"
                                        : "Top 5 document chunks used as context:"}
                                    </span>
                                    <div className="space-y-1 max-h-[140px] overflow-y-auto custom-scrollbar pr-0.5">
                                      {msg.searchDiagnostics.topChunks?.map(
                                        (chunk: any, cidx: number) => (
                                          <div
                                            key={cidx}
                                            className="p-2 bg-bmw-surface/50 border border-bmw-border/40 rounded flex flex-col gap-1 text-[10px]"
                                          >
                                            <div className="flex items-center justify-between font-bold text-bmw-text">
                                              <span className="truncate max-w-[60%]">
                                                [{chunk.title}]
                                              </span>
                                              <div className="flex items-center gap-1 text-[9px] font-mono shrink-0">
                                                <span className="px-1 bg-blue-500/5 text-bmw-blue rounded">
                                                  S: {chunk.semanticScore}
                                                </span>
                                                <span className="px-1 bg-amber-500/5 text-amber-600 rounded">
                                                  K: {chunk.keywordScore}
                                                </span>
                                                {chunk.rerankScore !==
                                                  undefined && (
                                                  <span className="px-1 bg-purple-500/5 text-purple-600 rounded font-bold">
                                                    Rerank: {chunk.rerankScore}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                            <p className="text-bmw-textSec line-clamp-2 italic">
                                              "{chunk.snippet}"
                                            </p>
                                            {chunk.rerankReason && (
                                              <span className="text-[9px] text-purple-600 dark:text-purple-400 font-medium">
                                                💡 Reason: {chunk.rerankReason}
                                              </span>
                                            )}
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </details>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Show more messages lazy loading button */}
              {messages.length > visibleCount && (
                <div className="flex justify-center my-4 animate-fade-in">
                  <button
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

              {isLoadingChat && (
                <div className="flex justify-start animate-pulse">
                  <div className="p-4 rounded-xl bg-bmw-hover text-bmw-text border border-bmw-border rounded-tl-none">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-bmw-blue rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-bmw-blue rounded-full animate-bounce delay-150"></span>
                      <span className="w-1.5 h-1.5 bg-bmw-blue rounded-full animate-bounce delay-300"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Form Query Input */}
            <div className="p-4 border-t border-bmw-border bg-bmw-surface/50">
              <div className="flex gap-2 max-w-4xl mx-auto">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={
                    isRtl
                      ? "سوالی در مورد اسناد انتخاب شده بپرسید..."
                      : "Ask a question about the active documents..."
                  }
                  className="flex-1 bg-bmw-input text-bmw-text border border-bmw-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-bmw-blue focus:ring-1 focus:ring-bmw-blue transition-all placeholder:text-bmw-textSec"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoadingChat || !inputText.trim()}
                  className="bg-bmw-blue text-white hover:bg-blue-600 px-5 py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-md shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {isRtl ? "ارسال" : "Send"}
                  </span>
                </button>
              </div>
              <p className="text-[10px] text-center text-bmw-textSec mt-2">
                {isRtl
                  ? "این سیستم با مدل هوش مصنوعی Gemini-2.5-Flash و با جستجوی برداری پیشرفته تغذیه می‌شود."
                  : "RAG Retrieval and document chat powered by Google Gemini-2.5-Flash."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Document Management Tab (Admin panel for uploading PDFs and vector indexing) */}
      {activeTab === "admin" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Upload Form Box */}
          <div className="lg:col-span-1 bg-bmw-surface border border-bmw-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-bmw-text pb-2 border-b border-bmw-border flex items-center gap-2">
              <Upload className="w-5 h-5 text-bmw-blue" />
              {isRtl ? "بارگذاری سند PDF جدید" : "Index New PDF Document"}
            </h3>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-bmw-textSec uppercase tracking-wider mb-1.5">
                  {isRtl ? "عنوان سند" : "Document Title"}
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-bmw-input text-bmw-text border border-bmw-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-bmw-blue focus:ring-1 focus:ring-bmw-blue transition-all"
                  placeholder={
                    isRtl
                      ? "مثلاً: آیین‌نامه فنی بی‌ام‌و، مینی، ترا، اوپل و ..."
                      : "e.g. BMW Technical Manual"
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-bmw-textSec uppercase tracking-wider mb-1.5">
                    {isRtl ? "سال سند" : "Document Year"}
                  </label>
                  <select
                    value={docYear}
                    onChange={(e) => setDocYear(Number(e.target.value))}
                    className="w-full bg-bmw-input text-bmw-text border border-bmw-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-bmw-blue focus:ring-1 focus:ring-bmw-blue transition-all cursor-pointer"
                  >
                    <option value={2026}>2026</option>
                    <option value={2025}>2025</option>
                    <option value={2024}>2024</option>
                    <option value={2023}>2023</option>
                    <option value={2022}>2022</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-bmw-textSec uppercase tracking-wider mb-1.5">
                    {isRtl ? "بخش / فصل سند" : "Document Section"}
                  </label>
                  <select
                    value={docSection}
                    onChange={(e) => setDocSection(e.target.value)}
                    className="w-full bg-bmw-input text-bmw-text border border-bmw-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-bmw-blue focus:ring-1 focus:ring-bmw-blue transition-all cursor-pointer"
                  >
                    <option value="بخش عمومی">
                      {isRtl ? "بخش عمومی" : "General Section"}
                    </option>
                    <option value="فصل اول">
                      {isRtl ? "فصل اول" : "Chapter 1"}
                    </option>
                    <option value="فصل دوم">
                      {isRtl ? "فصل دوم" : "Chapter 2"}
                    </option>
                    <option value="فصل سوم">
                      {isRtl ? "فصل سوم" : "Chapter 3"}
                    </option>
                    <option value="فصل چهارم">
                      {isRtl ? "فصل چهارم" : "Chapter 4"}
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-bmw-textSec uppercase tracking-wider mb-1.5">
                  {isRtl ? "انتخاب فایل PDF" : "Choose PDF File"}
                </label>
                <label className="cursor-pointer border border-dashed border-bmw-border hover:border-bmw-blue bg-bmw-input rounded-xl p-6 text-center flex flex-col items-center justify-center gap-2 transition-all">
                  <FileText className="w-8 h-8 text-bmw-textSec" />
                  <span className="text-xs font-bold text-bmw-text">
                    {selectedFile
                      ? selectedFile.name
                      : isRtl
                        ? "انتخاب فایل (.pdf)"
                        : "Select PDF Document"}
                  </span>
                  <span className="text-[10px] text-bmw-textSec">
                    {isRtl ? "حداکثر حجم: ۵۰ مگابایت" : "Max size: 50MB"}
                  </span>
                  <input
                    type="file"
                    id="pdf-file-input"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                </label>
              </div>

              {uploadMsg && (
                <div
                  className={`p-4 rounded-lg border text-xs flex gap-2 items-start ${
                    uploadMsg.type === "success"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}
                >
                  {uploadMsg.type === "success" ? (
                    <Check className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{uploadMsg.text}</span>
                </div>
              )}

              {isUploading && (
                <div className="space-y-2 bg-bmw-hover p-4 rounded-lg border border-bmw-border">
                  <div className="flex justify-between items-center text-xs font-bold text-bmw-text">
                    <span className="text-bmw-blue animate-pulse">
                      {uploadStatus}
                    </span>
                    <span className="font-mono">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-bmw-input rounded-full h-2 overflow-hidden border border-bmw-border">
                    <div
                      className="bg-bmw-blue h-full rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  {currentChunkInfo && (
                    <div className="mt-3 pt-2.5 border-t border-bmw-border/50 text-[11px] space-y-1 text-start animate-in fade-in duration-200">
                      <div className="flex justify-between font-mono text-bmw-textSec">
                        <span>
                          {isRtl ? "بخش در حال پردازش:" : "Chunk Index:"}{" "}
                          <span className="text-bmw-blue font-extrabold bg-bmw-blue/5 px-1.5 py-0.5 rounded">
                            #{currentChunkInfo.index}
                          </span>{" "}
                          / {currentChunkInfo.total}
                        </span>
                        <span>
                          {isRtl ? "شناسه پایگاه داده (ID):" : "Database ID:"}{" "}
                          <span className="text-amber-500 font-extrabold bg-amber-500/5 px-1.5 py-0.5 rounded">
                            {currentChunkInfo.id}
                          </span>
                        </span>
                      </div>
                      <div className="bg-bmw-input p-2 rounded text-[10px] text-bmw-textSec font-mono truncate border border-bmw-border/30 mt-1">
                        "{currentChunkInfo.snippet}..."
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-bmw-blue hover:bg-blue-600 text-white font-bold py-2.5 rounded-lg text-sm transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {isUploading
                  ? isRtl
                    ? "در حال ایندکس..."
                    : "Indexing..."
                  : isRtl
                    ? "آپلود و تحلیل وکتور"
                    : "Upload & Index RAG"}
              </button>
            </form>
          </div>

          {/* Uploaded Documents List */}
          <div className="lg:col-span-2 bg-bmw-surface border border-bmw-border rounded-xl p-5 shadow-sm space-y-4 h-[500px] lg:h-[650px] flex flex-col overflow-hidden">
            <h3 className="text-base font-bold text-bmw-text pb-2 border-b border-bmw-border flex items-center gap-2">
              <Database className="w-5 h-5 text-bmw-blue" />
              {isRtl
                ? "اسناد تحلیل شده در پایگاه داده"
                : "Indexed PDF Collection"}
            </h3>

            {/* Search and Filter Row for Admin Tab */}
            {ragDocs.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-2.5 justify-stretch">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 right-3 flex items-center pr-1.5 pointer-events-none text-bmw-textSec">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={adminDocSearchQuery}
                    onChange={(e) => setAdminDocSearchQuery(e.target.value)}
                    placeholder={
                      isRtl
                        ? "جستجو بر اساس نام، فایل یا تاریخ..."
                        : "Search by name, file or date..."
                    }
                    className="w-full bg-bmw-input border border-bmw-border rounded-lg pr-9 pl-3 py-2 text-xs text-bmw-text focus:outline-none focus:border-bmw-blue focus:ring-1 focus:ring-bmw-blue transition-all"
                  />
                  {adminDocSearchQuery && (
                    <button
                      onClick={() => setAdminDocSearchQuery("")}
                      className="absolute inset-y-0 left-2.5 flex items-center pr-1.5 text-bmw-textSec hover:text-bmw-text text-xs border-0 bg-transparent cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex bg-bmw-input p-0.5 rounded-lg border border-bmw-border self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setAdminDocFilterStatus("all")}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      adminDocFilterStatus === "all"
                        ? "bg-bmw-blue text-white shadow-sm"
                        : "text-bmw-textSec hover:text-bmw-text"
                    }`}
                  >
                    {isRtl ? "همه" : "All"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminDocFilterStatus("enabled")}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      adminDocFilterStatus === "enabled"
                        ? "bg-green-500 text-white shadow-sm"
                        : "text-bmw-textSec hover:text-bmw-text"
                    }`}
                  >
                    {isRtl ? "فعال" : "Enabled"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminDocFilterStatus("disabled")}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      adminDocFilterStatus === "disabled"
                        ? "bg-gray-500 text-white shadow-sm"
                        : "text-bmw-textSec hover:text-bmw-text"
                    }`}
                  >
                    {isRtl ? "غیرفعال" : "Disabled"}
                  </button>
                </div>
              </div>
            )}

            {isLoadingDocs ? (
              <p className="text-xs text-bmw-textSec italic text-center py-8">
                {isRtl
                  ? "در حال دریافت لیست اسناد..."
                  : "Loading document database..."}
              </p>
            ) : ragDocs.length === 0 ? (
              <p className="text-xs text-bmw-textSec italic text-center py-8">
                {isRtl
                  ? "هیچ سندی بارگذاری و ایندکس نشده است."
                  : "No indexed PDF documents found in database."}
              </p>
            ) : filteredAdminDocs.length === 0 ? (
              <p className="text-xs text-red-400 italic text-center py-8">
                {isRtl
                  ? "هیچ سندی با این مشخصات یافت نشد."
                  : "No documents match your search or filter criteria."}
              </p>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredAdminDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-bmw-hover border border-bmw-border rounded-lg flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-bmw-blue/10 text-bmw-blue rounded-lg">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-bmw-text truncate">
                          {doc.title}
                        </h4>
                        <p className="text-[10px] text-bmw-textSec mt-0.5 truncate">
                          File: {doc.file_name} • Chunks:{" "}
                          <span className="font-bold text-bmw-blue">
                            {doc.chunk_count}
                          </span>{" "}
                          • Date:{" "}
                          {new Date(doc.created_at).toLocaleDateString(
                            language === "fa" ? "fa-IR" : "en-US",
                          )}
                        </p>
                        <div className="flex gap-1.5 mt-1">
                          <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-bmw-blue rounded font-bold font-mono">
                            {doc.doc_year || doc.docYear || 2026}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-600 rounded font-bold">
                            {doc.doc_section || doc.docSection || "بخش عمومی"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() =>
                          handleToggleDocEnable(
                            doc.id,
                            doc.is_enabled !== false,
                          )
                        }
                        className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-medium ${
                          doc.is_enabled !== false
                            ? "text-green-500 hover:bg-green-500/10"
                            : "text-gray-500 hover:bg-gray-500/10"
                        }`}
                        title={
                          doc.is_enabled !== false
                            ? isRtl
                              ? "غیرفعال کردن سند"
                              : "Disable Document"
                            : isRtl
                              ? "فعال کردن سند"
                              : "Enable Document"
                        }
                      >
                        {doc.is_enabled !== false ? (
                          <>
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline text-[10px]">
                              {isRtl ? "فعال" : "Enabled"}
                            </span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4" />
                            <span className="hidden sm:inline text-[10px]">
                              {isRtl ? "غیرفعال" : "Disabled"}
                            </span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleStartEditDoc(doc)}
                        className="text-bmw-textSec hover:text-bmw-blue p-1.5 rounded-lg hover:bg-bmw-blue/10 transition-all"
                        title={
                          isRtl ? "ویرایش بخش‌های سند" : "Edit Document Chunks"
                        }
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDoc(doc.id, doc.title)}
                        className="text-bmw-textSec hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                        title={isRtl ? "حذف" : "Delete"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document Chunks Editor Modal */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => !isSavingDetails && setEditingDoc(null)}
          ></div>

          {/* Content Card */}
          <div
            className="relative w-full max-w-5xl bg-bmw-surface border border-bmw-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-start"
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
                      ? "ویرایش و اصلاح بخش‌های متنی سند (RAG)"
                      : "Edit & Refine Document Semantic Chunks (RAG)"}
                  </h3>
                  <p className="text-[11px] text-bmw-textSec mt-0.5 font-mono">
                    {editingDoc.title} ({editingDoc.file_name})
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSavingDetails}
                onClick={() => setEditingDoc(null)}
                className="text-bmw-textSec hover:text-bmw-text text-lg p-1.5 focus:outline-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Loader */}
            {isLoadingDetails ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="animate-spin text-bmw-blue" size={32} />
                <span className="text-xs text-bmw-textSec">
                  {isRtl
                    ? "در حال دریافت اطلاعات بخش‌ها..."
                    : "Retrieving document chunks..."}
                </span>
              </div>
            ) : (
              <>
                {/* Search & Actions Bar */}
                <div className="border-b border-bmw-border p-3 flex flex-wrap items-center justify-between gap-3 bg-bmw-base/20">
                  <div className="text-xs text-bmw-text font-bold">
                    {isRtl ? "لیست بخش‌های سند:" : "Document Chunks:"}{" "}
                    <span className="bg-bmw-blue/15 text-bmw-blue px-2 py-0.5 rounded-full text-[10px] font-mono ml-1">
                      {editChunks.length} {isRtl ? "بخش" : "chunks"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={
                          isRtl ? "جستجو در محتوا..." : "Search content..."
                        }
                        value={chunkSearch}
                        onChange={(e) => setChunkSearch(e.target.value)}
                        className="bg-bmw-base border border-bmw-border rounded-lg px-3 py-1.5 text-[11px] text-bmw-text pl-8 focus:outline-none focus:border-bmw-blue/50 w-44"
                      />
                      <Search
                        size={11}
                        className="absolute left-2.5 top-2.5 text-bmw-textSec"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddEditChunk}
                      className="bg-bmw-blue/10 hover:bg-bmw-blue/20 text-bmw-blue border border-bmw-blue/30 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>{isRtl ? "افزودن بخش جدید" : "Add Chunk"}</span>
                    </button>
                  </div>
                </div>

                {/* Find & Replace Bar */}
                <div className="border-b border-bmw-border p-3 flex flex-wrap items-center justify-between gap-3 bg-bmw-base/10">
                  <div className="flex items-center gap-2 text-xs font-semibold text-bmw-text">
                    <RefreshCw
                      size={13}
                      className="text-bmw-blue animate-spin"
                      style={{ animationDuration: "3s" }}
                    />
                    <span>
                      {isRtl
                        ? "جستجو و جایگزینی همگانی"
                        : "Global Find & Replace"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-bmw-textSec">
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
                      <span className="text-[10px] text-bmw-textSec">
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
                      className="bg-bmw-blue hover:bg-blue-700 text-white px-3.5 py-1 rounded-lg text-xs font-semibold shadow-md transition-all flex items-center gap-1 cursor-pointer"
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
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-h-[300px] max-h-[55vh] custom-scrollbar">
                  {detailsError && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs flex items-center gap-2">
                      <AlertCircle size={14} />
                      <span>{detailsError}</span>
                    </div>
                  )}

                  {/* Document Metadata Update Fields */}
                  <div className="p-4 bg-bmw-blue/5 border border-bmw-blue/15 rounded-xl flex flex-col gap-3">
                    <h4 className="text-[11px] font-bold text-bmw-blue uppercase tracking-wider flex items-center gap-1.5">
                      <Database size={11} />
                      {isRtl
                        ? "ویرایش اطلاعات و متادیتای کلی سند"
                        : "Edit Overall Document Details & Metadata"}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-bmw-textSec uppercase tracking-wider mb-1">
                          {isRtl ? "عنوان کلی سند" : "Document Title"}
                        </label>
                        <input
                          type="text"
                          value={editDocTitle}
                          onChange={(e) => setEditDocTitle(e.target.value)}
                          className="w-full bg-bmw-base border border-bmw-border rounded-lg p-2 text-xs text-bmw-text focus:outline-none focus:border-bmw-blue/50"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-bmw-textSec uppercase tracking-wider mb-1">
                          {isRtl ? "سال انتشار سند" : "Publish Year"}
                        </label>
                        <select
                          value={editDocYear}
                          onChange={(e) => setEditDocYear(e.target.value)}
                          className="w-full bg-bmw-base border border-bmw-border rounded-lg p-2 text-xs text-bmw-text focus:outline-none focus:border-bmw-blue/50 cursor-pointer"
                        >
                          <option value="2026">2026</option>
                          <option value="2025">2025</option>
                          <option value="2024">2024</option>
                          <option value="2023">2023</option>
                          <option value="2022">2022</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-bmw-textSec uppercase tracking-wider mb-1">
                          {isRtl ? "بخش / فصل سند" : "Section / Chapter"}
                        </label>
                        <select
                          value={editDocSection}
                          onChange={(e) => setEditDocSection(e.target.value)}
                          className="w-full bg-bmw-base border border-bmw-border rounded-lg p-2 text-xs text-bmw-text focus:outline-none focus:border-bmw-blue/50 cursor-pointer"
                        >
                          <option value="بخش عمومی">
                            {isRtl ? "بخش عمومی" : "General Section"}
                          </option>
                          <option value="فصل اول">
                            {isRtl ? "فصل اول" : "Chapter 1"}
                          </option>
                          <option value="فصل دوم">
                            {isRtl ? "فصل دوم" : "Chapter 2"}
                          </option>
                          <option value="فصل سوم">
                            {isRtl ? "فصل سوم" : "Chapter 3"}
                          </option>
                          <option value="فصل چهارم">
                            {isRtl ? "فصل چهارم" : "Chapter 4"}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Chunks List */}
                  {(() => {
                    const filteredChunks = editChunks.filter((c) =>
                      c.content
                        .toLowerCase()
                        .includes(chunkSearch.toLowerCase()),
                    );

                    if (filteredChunks.length > 0) {
                      return (
                        <div className="space-y-3">
                          {filteredChunks.map((chunk, idx) => (
                            <div
                              key={chunk.id}
                              className="p-3 bg-bmw-hover border border-bmw-border rounded-lg flex flex-col gap-2"
                            >
                              <div className="flex items-center justify-between border-b border-bmw-border/30 pb-2">
                                <span className="text-[11px] font-mono text-bmw-textSec font-bold">
                                  {isRtl
                                    ? `بخش #${idx + 1}`
                                    : `Chunk #${idx + 1}`}{" "}
                                  (Index: {chunk.chunk_index})
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveEditChunk(chunk.id)
                                  }
                                  className="text-bmw-textSec hover:text-red-400 p-1 rounded-md hover:bg-red-500/5 transition-all cursor-pointer"
                                  title={
                                    isRtl ? "حذف این بخش" : "Remove this chunk"
                                  }
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                              <textarea
                                value={chunk.content}
                                onChange={(e) =>
                                  handleUpdateEditChunk(
                                    chunk.id,
                                    e.target.value,
                                  )
                                }
                                rows={4}
                                placeholder={
                                  isRtl
                                    ? "محتوای بخش متنی را بنویسید..."
                                    : "Write chunk content here..."
                                }
                                className="w-full bg-bmw-base border border-bmw-border rounded-md p-2.5 text-xs text-bmw-text focus:outline-none focus:border-bmw-blue resize-y font-sans leading-relaxed"
                              />
                            </div>
                          ))}
                        </div>
                      );
                    } else {
                      return (
                        <div className="text-center py-12 bg-bmw-base/20 border border-dashed border-bmw-border/80 rounded-xl">
                          <Database
                            className="mx-auto text-bmw-textSec opacity-40 mb-2"
                            size={24}
                          />
                          <p className="text-xs text-bmw-textSec">
                            {chunkSearch
                              ? isRtl
                                ? "بخشی با این محتوا یافت نشد."
                                : "No chunks found matching search query."
                              : isRtl
                                ? 'هیچ بخشی یافت نشد. برای ایجاد بخش جدید "+ افزودن بخش جدید" را بزنید.'
                                : 'No chunks found. Click "+ Add Chunk" to create a new one.'}
                          </p>
                        </div>
                      );
                    }
                  })()}
                </div>

                {/* Footer Actions */}
                <div className="border-t border-bmw-border p-4 bg-bmw-base/50 flex justify-between items-center gap-4">
                  <span className="text-[10px] text-bmw-textSec leading-relaxed hidden sm:block max-w-md">
                    {isRtl
                      ? "* نکته: بخش‌های خالی پس از ذخیره نادیده گرفته خواهند شد. تمامی تغییرات بلافاصله در بانک اطلاعاتی بروزرسانی شده و در پاسخ‌دهی بعدی RAG لحاظ می‌شوند."
                      : "* Tip: Empty chunks will be skipped upon saving. All updates are immediately stored in the database and active in future PDF Chat queries."}
                  </span>
                  <div className="flex gap-2 justify-end flex-1 sm:flex-initial">
                    <button
                      type="button"
                      disabled={isSavingDetails}
                      onClick={() => setEditingDoc(null)}
                      className="px-4 py-2 border border-bmw-border text-bmw-textSec hover:bg-bmw-hover rounded-lg text-xs font-medium transition-all cursor-pointer"
                    >
                      {isRtl ? "انصراف" : "Cancel"}
                    </button>
                    <button
                      type="button"
                      disabled={isSavingDetails}
                      onClick={handleSaveDocDetails}
                      className="px-4 py-2 bg-bmw-blue hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {isSavingDetails ? (
                        <>
                          <Loader2 className="animate-spin" size={13} />
                          {isRtl ? "در حال ذخیره‌سازی..." : "Saving Changes..."}
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
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with elegant blur */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setDeleteConfirmDoc(null)}
          ></div>

          {/* Modal Card */}
          <div className="relative bg-bmw-surface border border-bmw-border rounded-xl p-6 shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/10 text-red-500 rounded-full border border-red-500/20 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0 text-start">
                <h3 className="text-base font-extrabold text-bmw-text">
                  {isRtl
                    ? "حذف کامل سند و اطلاعات مرتبط"
                    : "Complete Document Deletion"}
                </h3>
                <p className="text-xs text-bmw-textSec mt-2 leading-relaxed">
                  {isRtl
                    ? `آیا از حذف کامل سند "${deleteConfirmDoc.title}" اطمینان دارید؟ با تأیید این کار، تمامی بخش‌ها (Chunks) و کل تاریخچه گفتگوهای کاربران مرتبط با این سند به طور دائم از پایگاه داده حذف خواهد شد.`
                    : `Are you sure you want to completely delete "${deleteConfirmDoc.title}"? This will permanently erase all associated semantic chunks and user chat histories from the database.`}
                </p>
                <p className="text-[10px] text-red-400 font-bold mt-2">
                  {isRtl
                    ? "⚠️ این عملیات غیرقابل بازگشت است!"
                    : "⚠️ This action is irreversible!"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 border-t border-bmw-border pt-4">
              <button
                type="button"
                onClick={() => setDeleteConfirmDoc(null)}
                className="px-4 py-2 bg-bmw-hover text-bmw-text border border-bmw-border rounded-lg text-xs font-bold hover:bg-bmw-base transition-all cursor-pointer"
              >
                {isRtl ? "انصراف" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const doc = deleteConfirmDoc;
                  setDeleteConfirmDoc(null);
                  try {
                    const res = await fetch(
                      `${baseURL}/api/rag/documents/${doc.id}`,
                      {
                        method: "DELETE",
                      },
                    );
                    if (res.ok) {
                      fetchRagDocs();
                      fetchSessions(false);
                      handleNewChat();
                    }
                  } catch (err) {
                    console.error("Error deleting document:", err);
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isRtl ? "تأیید و حذف کامل" : "Confirm & Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Session Confirmation Modal */}
      {deleteSessionConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with elegant blur */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setDeleteSessionConfirm(null)}
          ></div>

          {/* Modal Card */}
          <div
            className="relative bg-bmw-surface border border-bmw-border rounded-xl p-6 shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200"
            dir={isRtl ? "rtl" : "ltr"}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/10 text-red-500 rounded-full border border-red-500/20 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0 text-start">
                <h3 className="text-base font-extrabold text-bmw-text">
                  {isRtl ? "حذف سابقه گفتگو" : "Delete Chat History"}
                </h3>
                <p className="text-xs text-bmw-textSec mt-2 leading-relaxed">
                  {isRtl
                    ? `آیا از حذف کامل سابقه این گفتگو "${deleteSessionConfirm.title}" اطمینان دارید؟ با تأیید این کار، تمامی پیام‌های رد و بدل شده در این گفتگو به طور دائم از پایگاه داده حذف خواهد شد.`
                    : `Are you sure you want to delete the chat history for "${deleteSessionConfirm.title}"? This will permanently erase all exchanged messages in this conversation from the database.`}
                </p>
                <p className="text-[10px] text-red-400 font-bold mt-2">
                  {isRtl
                    ? "⚠️ این عملیات غیرقابل بازگشت است!"
                    : "⚠️ This action is irreversible!"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 border-t border-bmw-border pt-4">
              <button
                type="button"
                onClick={() => setDeleteSessionConfirm(null)}
                className="px-4 py-2 bg-bmw-hover text-bmw-text border border-bmw-border rounded-lg text-xs font-bold hover:bg-bmw-base transition-all cursor-pointer"
              >
                {isRtl ? "انصراف" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSession}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isRtl ? "تأیید و حذف" : "Confirm & Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWithPDF;
