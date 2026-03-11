import type { DigestResult } from '@/types';

const PRIORITY_LABEL: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

export function buildMarkdown(result: DigestResult): string {
  const { summary, actionItems, insights, generatedAt } = result;
  const date = new Date(generatedAt).toLocaleString('zh-CN');

  const lines: string[] = [];

  lines.push(`# ${summary.topic || '会议纪要'}`);
  lines.push('');
  lines.push(`> 生成时间：${date} | 由 MeetDigest 自动生成`);
  if (summary.date) lines.push(`> 会议日期：${summary.date}`);
  if (summary.participants) lines.push(`> 参与人员：${summary.participants}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // 三句话摘要
  lines.push('## 三句话摘要');
  lines.push('');
  summary.threeLines.forEach(line => lines.push(`- ${line}`));
  lines.push('');
  lines.push('---');
  lines.push('');

  // 详细摘要
  lines.push('## 详细摘要');
  lines.push('');
  if (summary.background) {
    lines.push('### 背景与目标');
    lines.push('');
    lines.push(summary.background);
    lines.push('');
  }
  if (summary.keyPoints?.length) {
    lines.push('### 讨论要点');
    lines.push('');
    summary.keyPoints.forEach((p, i) => lines.push(`${i + 1}. ${p}`));
    lines.push('');
  }
  if (summary.conclusion) {
    lines.push('### 核心结论');
    lines.push('');
    lines.push(summary.conclusion);
    lines.push('');
  }
  lines.push('---');
  lines.push('');

  // Action Items
  lines.push('## Action Items');
  lines.push('');
  if (actionItems.length === 0) {
    lines.push('*暂无行动项*');
  } else {
    actionItems.forEach(item => {
      const deadline = item.deadline && item.deadline !== '-' ? `（截止：${item.deadline}）` : '';
      const priority = `[优先级：${PRIORITY_LABEL[item.priority] ?? item.priority}]`;
      lines.push(`- [ ] **${item.owner}** — ${item.task}${deadline} ${priority}`);
    });
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // 关键洞察
  lines.push('## 关键洞察');
  lines.push('');
  if (insights.decisions.length) {
    lines.push('### 决策点');
    insights.decisions.forEach(d => lines.push(`- ${d}`));
    lines.push('');
  }
  if (insights.risks.length) {
    lines.push('### 风险');
    insights.risks.forEach(r => lines.push(`- ${r}`));
    lines.push('');
  }
  if (insights.opportunities.length) {
    lines.push('### 机会');
    insights.opportunities.forEach(o => lines.push(`- ${o}`));
    lines.push('');
  }
  if (insights.openQuestions.length) {
    lines.push('### 待澄清');
    insights.openQuestions.forEach(q => lines.push(`- ${q}`));
    lines.push('');
  }

  return lines.join('\n');
}

export function generateFileName(topic: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const safeTopic = (topic || '会议纪要').slice(0, 8).replace(/[\\/:*?"<>|]/g, '');
  return `MeetDigest_${date}_${safeTopic}.md`;
}
