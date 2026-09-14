'use client';

import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageContainer } from '@/components/layout/PageContainer';
import { GridStatus } from '@/components/dashboard/GridStatus';
import { DemandCard } from '@/components/dashboard/DemandCard';
import { RenewableCard } from '@/components/dashboard/RenewableCard';
import { CurtailmentCard } from '@/components/dashboard/CurtailmentCard';
import { ReserveCard } from '@/components/dashboard/ReserveCard';
import { ForecastChart } from '@/components/dashboard/ForecastChart';
import { RenewableChart } from '@/components/dashboard/RenewableChart';
import { GridStressDrivers } from '@/components/dashboard/GridStressDrivers';
import { CriticalAlerts } from '@/components/dashboard/CriticalAlerts';
import { CriticalAssetCard } from '@/components/dashboard/CriticalAssetCard';
import { RootCausePanel } from '@/components/dashboard/RootCausePanel';
import { OperatorBrief } from '@/components/dashboard/OperatorBrief';
import { NextBestAction } from '@/components/dashboard/NextBestAction';
import UnderperformancePanel from '@/components/UnderperformancePanel';
import FinancialImpactPanel from '@/components/FinancialImpactPanel';
import HITLApprovalPanel from '@/components/HITLApprovalPanel';

export default function DashboardPage() {
  const queryClient = useQueryClient();

  const { data: gridStatus } = useQuery({ queryKey: ['gridStatus'], queryFn: () => api.getGridStatus() });
  const { data: gridStress } = useQuery({ queryKey: ['gridStress'], queryFn: () => api.getGridStress() });
  const { data: demandSummary } = useQuery({ queryKey: ['demandSummary'], queryFn: () => api.getDemandSummary() });
  const { data: renewableSummary } = useQuery({ queryKey: ['renewableSummary'], queryFn: () => api.getRenewableSummary() });
  const { data: curtailmentSummary } = useQuery({ queryKey: ['curtailmentSummary'], queryFn: () => api.getCurtailmentSummary() });
  const { data: reserveSummary } = useQuery({ queryKey: ['reserveSummary'], queryFn: () => api.getReserveSummary() });
  const { data: forecasts } = useQuery({ queryKey: ['forecasts'], queryFn: () => api.getForecasts() });
  const { data: criticalAsset } = useQuery({ queryKey: ['criticalAsset'], queryFn: () => api.getAsset('SOLAR_B17') });
  const { data: rca } = useQuery({ queryKey: ['rca'], queryFn: () => api.getRCA('SOLAR_B17') });
  const { data: anomalies } = useQuery({ queryKey: ['anomalies'], queryFn: () => api.getAnomalies() });
  const { data: recommendations } = useQuery({ queryKey: ['recommendations'], queryFn: () => api.getRecommendations() });
  const { data: briefMarkdown } = useQuery({ queryKey: ['operatorBrief'], queryFn: () => api.getOperatorBrief() });
  const { data: underperformance } = useQuery({ queryKey: ['underperformance'], queryFn: () => api.getUnderperformance() });
  const { data: financialImpact } = useQuery({ queryKey: ['financialImpact'], queryFn: () => api.getFinancialImpact() });
  const { data: hitlData } = useQuery({ queryKey: ['hitlQueue'], queryFn: () => api.getHITLQueue() });

  const refreshHITL = () => queryClient.invalidateQueries({ queryKey: ['hitlQueue'] });

  return (
    <PageContainer className="space-y-6">
      {/* 1. Hero Grid Status Banner */}
      {gridStatus && <GridStatus status={gridStatus} />}

      {/* 2. Four Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {demandSummary && <DemandCard summary={demandSummary} />}
        {renewableSummary && <RenewableCard summary={renewableSummary} />}
        {curtailmentSummary && <CurtailmentCard summary={curtailmentSummary} />}
        {reserveSummary && <ReserveCard summary={reserveSummary} />}
      </div>

      {/* 3. Predictive Forecast Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {forecasts?.demand && <ForecastChart data={forecasts.demand} />}
        {forecasts?.renewable && <RenewableChart data={forecasts.renewable} />}
      </div>

      {/* 4. Grid Stress Breakdown & Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {gridStress && <GridStressDrivers stress={gridStress} />}
        {anomalies && <CriticalAlerts anomalies={anomalies} />}
      </div>

      {/* 5. Critical Asset Alert & Root Cause Analysis (RCA) Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {criticalAsset && <CriticalAssetCard asset={criticalAsset} />}
        {rca && <RootCausePanel rca={rca} />}
      </div>

      {/* 6. Renewable Underperformance Detection & Financial Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UnderperformancePanel data={underperformance} />
        <FinancialImpactPanel data={financialImpact} />
      </div>

      {/* 7. AI Operator Executive Briefing */}
      {briefMarkdown && <OperatorBrief briefMarkdown={briefMarkdown} />}

      {/* 8. Next-Best Operator Actions */}
      {recommendations && <NextBestAction actions={recommendations} />}

      {/* 9. Human-in-the-Loop Approval Queue */}
      <HITLApprovalPanel data={hitlData} onRefresh={refreshHITL} />
    </PageContainer>
  );
}
