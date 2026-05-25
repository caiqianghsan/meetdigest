export type StreamPhase = 'idle' | 'analyzing' | 'summarizing' | 'extracting' | 'insights' | 'done';

export type InsightType = 'decisions' | 'risks' | 'opportunities' | 'openQuestions';

export type Priority = 'high' | 'medium' | 'low';

export type ActiveTab = 'summary' | 'actions' | 'insights' | 'preview' | 'chat';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface ActionItem {
  id: number;
  owner: string;
  task: string;
  deadline: string;
  priority: Priority;
}

export interface SummaryData {
  topic: string;
  date: string;
  participants: string;
  threeLines: string[];
  background: string;
  keyPoints: string[];
  conclusion: string;
}

export interface InsightsData {
  decisions: string[];
  risks: string[];
  opportunities: string[];
  openQuestions: string[];
}

export interface DigestResult {
  summary: SummaryData;
  actionItems: ActionItem[];
  insights: InsightsData;
  generatedAt: string;
}

export interface HistoryRecord {
  id: string;
  topic: string;
  generatedAt: string;
  inputText: string;
  result: DigestResult;
}

export type StreamEventType = 'progress' | 'summary' | 'actionItems' | 'insights' | 'done' | 'error';

export interface ProgressData {
  phase: StreamPhase;
  message: string;
}

export interface StreamEvent {
  type: StreamEventType;
  data: ProgressData | SummaryData | { items: ActionItem[] } | InsightsData | { message: string } | null;
}
