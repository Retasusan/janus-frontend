"use client";

import React, { useEffect, useState } from 'react';
import { ChannelPlugin } from '@/types/plugin';
import { ChannelType, BaseChannel } from '@/types/channel';
import { BarChart, Plus, Vote, Users, TrendingUp, CheckCircle, Circle } from 'lucide-react';

function SurveyContent({ channel }: { channel: BaseChannel }) {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<number, number | number[]>>({});
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [optionsText, setOptionsText] = useState('');
  const [showResults, setShowResults] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await globalThis.fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/surveys`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setSurveys(Array.isArray(data) ? data : []);
        } else {
          setSurveys([]);
        }
      } catch (e) {
        setSurveys([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [channel]);

  const createSurvey = async () => {
    const opts = optionsText.split('\n').map((s) => s.trim()).filter(Boolean).map((text) => ({ text }));
    if (!question.trim() || opts.length === 0) return;
    try {
      const res = await globalThis.fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/surveys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ survey: { question: question.trim(), survey_options_attributes: opts } }),
      });
      if (res.ok) {
        setQuestion('');
        setOptionsText('');
        const data = await res.json();
        setSurveys(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      // ignore for now
    }
  };

  const vote = async (surveyId: number, optionId: number | number[]) => {
    const payload = { option_id: Array.isArray(optionId) ? optionId[0] : optionId };
    try {
      const res = await globalThis.fetch(`/api/servers/${channel.serverId}/channels/${channel.id}/surveys/${surveyId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setSurveys(Array.isArray(data) ? data : []);
        // Show results after voting
        setShowResults(prev => ({ ...prev, [surveyId]: true }));
      }
    } catch (e) {
      // ignore
    }
  };

  const toggleResults = (surveyId: number) => {
    setShowResults(prev => ({ ...prev, [surveyId]: !prev[surveyId] }));
  };

  if (loading) return (
    <div className="h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400"></div>
        <p className="text-purple-400 font-medium">アンケートを読み込み中...</p>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20">
      {/* ヘッダー */}
      <div className="border-b border-white/10 p-6 bg-white/5 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <BarChart className="w-8 h-8 mr-3 text-purple-400" />
              アンケート・投票
            </h1>
            <p className="text-gray-300">みんなの意見を集めよう • {surveys.length} 件のアンケート</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* アンケート作成フォーム */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Vote className="w-5 h-5 mr-2 text-purple-400" />
              新しいアンケートを作成
            </h3>
            <div className="space-y-4">
              <input 
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors" 
                value={question} 
                onChange={(e) => setQuestion(e.target.value)} 
                placeholder="質問文を入力してください..." 
              />
              <textarea 
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors resize-none" 
                rows={4}
                value={optionsText} 
                onChange={(e) => setOptionsText(e.target.value)} 
                placeholder="選択肢を入力してください（改行で区切る）&#10;例：&#10;選択肢1&#10;選択肢2&#10;選択肢3" 
              />
            </div>
            <div className="flex justify-end mt-4">
              <button 
                onClick={createSurvey} 
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 px-6 py-3 rounded-xl font-medium text-white transition-all transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>作成</span>
              </button>
            </div>
          </div>

          {/* アンケートリスト */}
          {surveys.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <BarChart className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <p className="text-xl font-semibold">アンケートがありません</p>
              <p className="text-gray-400">最初のアンケートを作成してください</p>
            </div>
          ) : (
            <div className="space-y-6">
              {surveys.map((survey) => {
                const totalVotes = survey.survey_options.reduce((acc: number, o: any) => acc + (o.votes_count || 0), 0);
                const showResultsForSurvey = showResults[survey.id];

                return (
                  <div 
                    key={survey.id} 
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">{survey.question}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {totalVotes} 票
                          </span>
                          <span className="flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {survey.survey_options.length} 選択肢
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => toggleResults(survey.id)}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white text-sm transition-all"
                      >
                        {showResultsForSurvey ? '投票画面' : '結果を見る'}
                      </button>
                    </div>

                    {!showResultsForSurvey ? (
                      // 投票画面
                      <div className="space-y-4">
                        <div className="space-y-3">
                          {survey.survey_options.map((option: any) => {
                            const isMultiple = survey.multiple;
                            const selectedForSurvey = selected[survey.id];
                            const checked = isMultiple
                              ? Array.isArray(selectedForSurvey) && (selectedForSurvey as number[]).includes(option.id)
                              : selectedForSurvey === option.id;

                            return (
                              <label 
                                key={option.id} 
                                className="flex items-center space-x-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-all group/option"
                              >
                                <div className="relative">
                                  <input
                                    type={isMultiple ? 'checkbox' : 'radio'}
                                    name={`survey-${survey.id}`}
                                    checked={!!checked}
                                    onChange={(e) => {
                                      setSelected((prev) => {
                                        const copy = { ...prev };
                                        if (isMultiple) {
                                          const arr = Array.isArray(copy[survey.id]) ? [...(copy[survey.id] as number[])] : [];
                                          if (e.target.checked) arr.push(option.id); else {
                                            const idx = arr.indexOf(option.id); if (idx >= 0) arr.splice(idx, 1);
                                          }
                                          copy[survey.id] = arr;
                                        } else {
                                          copy[survey.id] = option.id;
                                        }
                                        return copy;
                                      });
                                    }}
                                    className="sr-only"
                                  />
                                  {checked ? (
                                    <CheckCircle className="w-5 h-5 text-purple-400" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-gray-400 group-hover/option:text-purple-400 transition-colors" />
                                  )}
                                </div>
                                <span className="text-white font-medium">{option.text}</span>
                              </label>
                            );
                          })}
                        </div>

                        <div className="flex justify-end pt-4">
                          <button
                            onClick={() => {
                              const sel = selected[survey.id];
                              if (!sel) return;
                              vote(survey.id, sel as any);
                            }}
                            disabled={!selected[survey.id]}
                            className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 px-6 py-3 rounded-xl font-medium text-white transition-all transform hover:-translate-y-1 hover:shadow-lg disabled:transform-none disabled:shadow-none flex items-center space-x-2"
                          >
                            <Vote className="w-4 h-4" />
                            <span>投票する</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      // 結果画面
                      <div className="space-y-4">
                        <div className="bg-purple-600/20 border border-purple-600/30 rounded-xl p-4">
                          <h4 className="text-lg font-bold text-white mb-2 flex items-center">
                            📊 投票結果
                          </h4>
                          <p className="text-purple-300">合計 {totalVotes} 票が投じられました</p>
                        </div>

                        <div className="space-y-3">
                          {survey.survey_options.map((option: any) => {
                            const pct = totalVotes > 0 ? Math.round(((option.votes_count || 0) / totalVotes) * 100) : 0;
                            return (
                              <div key={option.id} className="bg-white/5 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-white font-medium">{option.text}</span>
                                  <div className="text-right">
                                    <span className="text-white font-bold">{option.votes_count || 0}票</span>
                                    <span className="text-gray-400 text-sm ml-2">({pct}%)</span>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-3">
                                  <div 
                                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                                    style={{ width: `${pct}%` }} 
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const surveyPlugin: ChannelPlugin = {
  meta: {
    type: ChannelType.SURVEY,
    name: 'アンケート',
    description: '簡単な投票・アンケート',
    icon: <span>📊</span>,
    color: '#ef4444',
  },
  ContentComponent: SurveyContent,
};
