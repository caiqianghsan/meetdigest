'use client';

import { useDigestStore } from '@/store/digestStore';
import { MAX_CHARS } from '@/lib/utils/constants';

const EXAMPLE_TEXT = `会议主题：2026年Q2产品规划评审
时间：2026年3月10日
参会人：张伟（产品总监）、李娜（技术负责人）、王强（设计主管）、陈敏（运营总监）

---

张伟：好，我们开始吧。今天的核心议题是确定Q2的产品优先级。根据Q1的数据，用户留存率下降了8%，DAU增长停滞，这是我们需要重点解决的问题。

李娜：从技术角度来看，我认为性能优化是首要任务。我们的首屏加载时间已经达到4.2秒，这对用户体验影响很大。我们团队评估过，大概需要3周时间完成核心优化。

王强：设计团队上周做了用户调研，47%的用户反馈说界面不够直观，尤其是新用户引导流程。我建议把用户引导优化列为P0。

陈敏：从运营数据来看，流失主要发生在注册后第3天和第7天。我们需要针对这两个节点设计激活策略。另外，我们竞品上周刚推出了AI智能推荐功能，反响很好，我们是否考虑跟进？

张伟：好，我来总结一下决策：第一，性能优化定为P0，李娜负责，3月底完成；第二，新用户引导优化定为P1，王强负责，4月中旬完成；第三，AI推荐功能我们先做竞品分析再决定，陈敏下周五前出报告。关于预算，这三项加起来超出了我们的季度预算，需要提交给CFO审批，但技术和设计可以先启动前期工作。还有一个风险要注意，李娜你们技术团队下个月有两个人要休假，人力是否够？

李娜：人力确实有些紧张，我会在本周评估，如果需要可能要申请外包支持。`;

export function TextInputArea() {
  const { inputText, setInputText, isStreaming } = useDigestStore();
  const charCount = inputText.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">输入内容</label>
        <span className={`text-xs ${isOverLimit ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
          {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </span>
      </div>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        disabled={isStreaming}
        placeholder="粘贴会议记录、访谈内容或任何文字..."
        className={`w-full h-72 px-4 py-3 text-sm text-gray-800 bg-white rounded-xl border resize-none
          placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors
          ${isOverLimit ? 'border-red-400' : 'border-gray-200'}`}
      />
      {isOverLimit && (
        <p className="text-xs text-red-500">内容超出限制，请删减至 {MAX_CHARS.toLocaleString()} 字符以内</p>
      )}
      {!inputText && (
        <button
          onClick={() => setInputText(EXAMPLE_TEXT)}
          disabled={isStreaming}
          className="text-xs text-blue-500 hover:text-blue-700 text-left transition-colors disabled:opacity-50"
        >
          使用示例内容
        </button>
      )}
    </div>
  );
}
