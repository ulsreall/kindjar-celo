import React, { useMemo, useEffect, useState } from 'react';
import { formatUnits } from 'viem';
import type { Campaign } from './main';

type AgentInsight = {
  campaign: Campaign;
  score: number;
  badge: string;
  reason: string;
  analysis: string[];
};

function scoreCampaign(c: Campaign): AgentInsight {
  const raised = Number(formatUnits(c.totalRaised, 18));
  let score = 50;
  const analysis: string[] = [];

  if (c.active) {
    score += 15;
    analysis.push('✅ Open now and accepting donations');
  }

  if (raised > 100) {
    score += 20;
    analysis.push(`💰 Strong support with ${raised.toFixed(1)} cUSD raised`);
  } else if (raised > 30) {
    score += 12;
    analysis.push(`📈 Growing support — ${raised.toFixed(1)} cUSD raised so far`);
  } else if (raised > 0) {
    score += 5;
    analysis.push(`🌱 Early stage — ${raised.toFixed(1)} cUSD raised, room to grow`);
  } else {
    analysis.push(`🆕 New jar — you could be the first donor!`);
  }

  const name = c.name.toLowerCase();
  if (name.includes('food') || name.includes('water') || name.includes('health')) {
    score += 12;
    analysis.push('🎯 Supports basic needs with clear local impact');
  }
  if (name.includes('school') || name.includes('education') || name.includes('learn')) {
    score += 10;
    analysis.push('📚 Education support with long-term value');
  }
  if (name.includes('community') || name.includes('public') || name.includes('local')) {
    score += 5;
    analysis.push('🌍 Community-focused and easy to understand');
  }

  let badge = '🌱';
  if (score >= 90) badge = '🌟';
  else if (score >= 75) badge = '🔥';
  else if (score >= 60) badge = '💪';

  return { campaign: c, score: Math.min(score, 100), badge, reason: analysis[0], analysis };
}

type Props = {
  campaigns: Campaign[];
};

export default function AgentInsights({ campaigns }: Props) {
  const [selectedInsight, setSelectedInsight] = useState<number | null>(null);

  const insights = useMemo(
    () => campaigns.map(scoreCampaign).sort((a, b) => b.score - a.score),
    [campaigns],
  );

  const totalRaised = campaigns.reduce((sum, c) => sum + Number(formatUnits(c.totalRaised, 18)), 0);
  const activeCount = campaigns.filter((c) => c.active).length;
  const avgScore = insights.length ? Math.round(insights.reduce((s, i) => s + i.score, 0) / insights.length) : 0;

  useEffect(() => {
    if (insights.length > 0 && selectedInsight === null) setSelectedInsight(0);
  }, [insights]);

  const current = selectedInsight !== null ? insights[selectedInsight] : null;

  return (
    <section className="panel agent-insights" id="agent">
      <div className="agent-section-header">
        <div>
          <div className="agent-section-badge">🤖 AI Agent</div>
          <h2>AI guide for donors</h2>
          <p className="subtitle">A simple helper that explains which jars are active, how much support they have, and why people might donate.</p>
        </div>
      </div>

      {/* Overview stats */}
      <div className="agent-overview">
        <div className="agent-stat">
          <div className="agent-stat-icon">📊</div>
          <div className="agent-stat-value">{avgScore}</div>
          <div className="agent-stat-label">Avg rating</div>
        </div>
        <div className="agent-stat">
          <div className="agent-stat-icon">🎯</div>
          <div className="agent-stat-value">{activeCount}</div>
          <div className="agent-stat-label">Open causes</div>
        </div>
        <div className="agent-stat">
          <div className="agent-stat-icon">💰</div>
          <div className="agent-stat-value agent-stat-value-small">{totalRaised.toFixed(1)} cUSD</div>
          <div className="agent-stat-label">Donated</div>
        </div>
        <div className="agent-stat">
          <div className="agent-stat-icon">⛓️</div>
          <div className="agent-stat-value">100%</div>
          <div className="agent-stat-label">Public proof</div>
        </div>
      </div>

      {/* Campaign rankings */}
      <div className="agent-rankings">
        <div className="agent-rankings-list">
          {insights.map((insight, i) => (
            <button
              key={insight.campaign.id.toString()}
              className={`agent-rank-card ${selectedInsight === i ? 'active' : ''}`}
              onClick={() => setSelectedInsight(i)}
            >
              <div className="agent-rank-num">#{i + 1}</div>
              <div className="agent-rank-info">
                <div className="agent-rank-name">
                  {insight.badge} {insight.campaign.name}
                </div>
                <div className="agent-raised">
                  {formatUnits(insight.campaign.totalRaised, 18)} cUSD raised
                </div>
              </div>
              <div className="agent-score">
                <div className="agent-score-ring">
                  <svg viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(145,245,183,0.12)"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={insight.score >= 80 ? '#35d07f' : insight.score >= 60 ? '#d8ff3e' : '#91f5b7'}
                      strokeWidth="3"
                      strokeDasharray={`${insight.score}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>{insight.score}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        {current && (
          <div className="agent-detail">
            <div className="agent-detail-header">
              <span className="agent-detail-badge">{current.badge}</span>
              <h3>{current.campaign.name}</h3>
            </div>
            <p className="agent-detail-desc">{current.campaign.description}</p>
            <div className="agent-detail-score">
              <div className="agent-detail-score-bar">
                <div
                  className="agent-detail-score-fill"
                  style={{
                    width: `${current.score}%`,
                    background: current.score >= 80 ? 'linear-gradient(90deg, #35d07f, #d8ff3e)' : current.score >= 60 ? 'linear-gradient(90deg, #d8ff3e, #35d07f)' : 'linear-gradient(90deg, #91f5b7, #d8ff3e)',
                  }}
                />
              </div>
              <div className="agent-detail-score-label">
                Donor rating: <strong>{current.score}/100</strong>
              </div>
            </div>
            <div className="agent-detail-analysis">
              <div className="agent-detail-title">Why this jar stands out</div>
              {current.analysis.map((a, i) => (
                <div key={i} className="agent-detail-item">{a}</div>
              ))}
            </div>
            <div className="agent-detail-meta">
              <div className="agent-meta-item">
                <span className="agent-meta-label">Raised so far</span>
                <span className="agent-meta-value">{formatUnits(current.campaign.totalRaised, 18)} cUSD</span>
              </div>
              <div className="agent-meta-item">
                <span className="agent-meta-label">Status</span>
                <span className="agent-meta-value">{current.campaign.active ? '🟢 Active' : '🔴 Inactive'}</span>
              </div>
              <div className="agent-meta-item">
                <span className="agent-meta-label">Network</span>
                <span className="agent-meta-value">Celo Mainnet</span>
              </div>
            </div>
            <div className="agent-detail-verdict">
              {current.score >= 80 && '🌟 Top pick. This jar already has strong support and a clear reason to donate.'}
              {current.score >= 60 && current.score < 80 && '💪 Good choice. This jar is active and has growing support.'}
              {current.score < 60 && '🌱 Early jar. Your donation can help this cause get started.'}
            </div>
          </div>
        )}
      </div>

      {/* Agent capabilities */}
      <div className="agent-capabilities">
        <div className="agent-cap">
          <div className="agent-cap-icon">📊</div>
          <strong>Simple ratings</strong>
          <span>Ratings use donation totals and active status, not hidden data</span>
        </div>
        <div className="agent-cap">
          <div className="agent-cap-icon">🎯</div>
          <strong>Clear suggestions</strong>
          <span>Helps donors choose a jar without reading technical details</span>
        </div>
        <div className="agent-cap">
          <div className="agent-cap-icon">🔍</div>
          <strong>Proof check</strong>
          <span>Links and totals can be checked on Celoscan</span>
        </div>
        <div className="agent-cap">
          <div className="agent-cap-icon">💡</div>
          <strong>Step-by-step help</strong>
          <span>Guides new users through MiniPay or a Celo wallet</span>
        </div>
      </div>
    </section>
  );
}
