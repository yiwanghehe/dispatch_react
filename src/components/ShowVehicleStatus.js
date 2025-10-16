import React, { useMemo } from 'react';
import styled from 'styled-components';
import PieChart from '../ui/PieChart'; // 假设 PieChart 组件路径正确

// 接收更新后的 prop，并重命名以保持内部逻辑一致
export default function ShowVehicleStatus({ plateNumber: propPlateNumber, vehicleStatus: vehicles }) {

  // --- 基于新数据结构的计算属性 (useMemo) for Fleet Overview ---
  // 总里程 (m -> km)
  const totalDistance = useMemo(() => vehicles.reduce((sum, v) => sum + v.loadDistance + v.noLoadDistance, 0), [vehicles]);
  // 总运输重量 (单位: 吨)
  const totalWeight = useMemo(() => vehicles.reduce((sum, v) => sum + (v.totalShippingWeight || 0), 0), [vehicles]);

  // 平均空闲率
  const averageIdleRate = useMemo(() => {
    if (vehicles.length === 0) return 0;
    // 空闲时间 = 等待时间
    const totalIdleTime = vehicles.reduce((sum, v) => {
      const idle = v.waitingDuration;
      return sum + Math.max(0, idle);
    }, 0);
    const totalTime = vehicles.reduce((sum, v) => sum + v.loadDuration + v.noLoadDuration + v.waitingDuration, 0);
    return totalTime > 0 ? (totalIdleTime / totalTime * 100) : 0;
  }, [vehicles]);

  // 平均有效里程率 (载货里程 / 总里程)
  const averageEffectiveMileageRate = useMemo(() => {
    if (vehicles.length === 0) return 0;
    const totalLoadDistance = vehicles.reduce((sum, v) => sum + v.loadDistance, 0);
    return totalDistance > 0 ? (totalLoadDistance / totalDistance * 100) : 0;
  }, [vehicles, totalDistance]);

  // 平均载重利用率 (当前载重 / 最大载重)
  const averageLoadUtilizationRate = useMemo(() => {
    if (vehicles.length === 0) return 0;
    const totalCurrentLoad = vehicles.reduce((sum, v) => sum + v.currentLoad, 0);
    const totalMaxLoad = vehicles.reduce((sum, v) => sum + v.maxLoadWeight, 0);
    return totalMaxLoad > 0 ? (totalCurrentLoad / totalMaxLoad * 100) : 0;
  }, [vehicles]);


  // --- Helper Function ---
  const statusInfo = (status) => {
    // 兼容新的大写状态
    const lowerCaseStatus = status ? status.toLowerCase() : 'unknown';
    switch (lowerCaseStatus) {
      case 'idle': return { text: '空闲', class: 'status-idle' };
      case 'moving_to_pickup': return { text: '前往装货点', class: 'status-movingToPickUp' };
      case 'loading': return { text: '装货中', class: 'status-loading' };
      case 'in_transit': return { text: '运输中', class: 'status-inTransit' };
      case 'unloading': return { text: '卸货中', class: 'status-unloading' };
      case 'maintenance': return { text: '维护保养', class: 'status-maintenance' };
      case 'refused': return { text: '离线/拒绝', class: 'status-refused' };
      default: return { text: '未知', class: 'status-unknown' };
    }
  };

  // 根据 propPlateNumber 过滤车辆数据
  const filteredVehicles = useMemo(() => {
    if (propPlateNumber) {
      return vehicles.filter(v => v.plateNumber === propPlateNumber);
    }
    return vehicles;
  }, [vehicles, propPlateNumber]);

  // 如果没有找到匹配的车辆，可以返回一个提示
  if (propPlateNumber && filteredVehicles.length === 0) {
    return (
        <DashboardContainer style={{ backgroundColor: 'var(--color-background)' }}>
          <ContentWrapper>
            <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem', fontSize: '2.0rem' }}>
              未找到车辆：{propPlateNumber}
            </p>
          </ContentWrapper>
        </DashboardContainer>
    );
  }

  // 根据 propPlateNumber 的存在与否，调整渲染结构
  const isSingleVehicleView = propPlateNumber !== undefined;

  // 时间单位转换函数 (s -> h)
  const formatDuration = (seconds) => (seconds / 3600).toFixed(1);
  // 距离单位转换函数 (m -> km)
  const formatDistance = (meters) => (meters / 1000).toFixed(1);

  return (
      <DashboardContainer $isSingleVehicle={isSingleVehicleView}>
        <ContentWrapper $isSingleVehicle={isSingleVehicleView}>
          {/* Header and Overview Grid only visible in full fleet view */}
          {!isSingleVehicleView && (
              <>
                {/* Fleet Overview */}
                <OverviewGrid>
                  <OverviewCard>
                    <CardLabel>车辆总数</CardLabel>
                    <CardValue>{vehicles.length}</CardValue>
                  </OverviewCard>
                  <OverviewCard>
                    <CardLabel>总行驶里程</CardLabel>
                    <CardValue>{formatDistance(totalDistance)} km</CardValue>
                  </OverviewCard>
                  <OverviewCard>
                    <CardLabel>总运输重量</CardLabel>
                    <CardValue>{totalWeight.toFixed(1)} 吨</CardValue>
                  </OverviewCard>
                  <OverviewCardWithChart>
                    <CardLabel>平均载重利用率</CardLabel>
                    <PieChart percentage={averageLoadUtilizationRate} color="var(--color-task)" />
                    <CardValue className={averageLoadUtilizationRate > 70 ? 'text-good' : 'text-bad'}>
                      {averageLoadUtilizationRate.toFixed(1)} %
                    </CardValue>
                  </OverviewCardWithChart>
                  <OverviewCardWithChart>
                    <CardLabel>平均有效里程率</CardLabel>
                    <PieChart percentage={averageEffectiveMileageRate} color="var(--color-mileage)" />
                    <CardValue className={averageEffectiveMileageRate > 70 ? 'text-good' : 'text-bad'}>
                      {averageEffectiveMileageRate.toFixed(1)} %
                    </CardValue>
                  </OverviewCardWithChart>
                  <OverviewCardWithChart>
                    <CardLabel>平均空闲率</CardLabel>
                    <PieChart percentage={averageIdleRate} color="var(--color-idle)" />
                    <CardValue className={averageIdleRate > 30 ? 'text-bad' : 'text-good'}>
                      {averageIdleRate.toFixed(1)} %
                    </CardValue>
                  </OverviewCardWithChart>
                </OverviewGrid>
              </>
          )}

          {/* Vehicle Cards Grid */}
          <VehicleGrid $isSingleVehicle={isSingleVehicleView}>
            {filteredVehicles.map(v => {
              // 为单个车辆计算派生指标
              // 新的空闲时长 = 等待时间
              const idleDuration = Math.max(0, v.waitingDuration);
              const totalDuration = v.loadDuration + v.noLoadDuration + v.waitingDuration;
              const idleRate = totalDuration > 0 ? (idleDuration / totalDuration) * 100 : 0;

              const totalDistance = v.loadDistance + v.noLoadDistance;
              const effectiveMileageRate = totalDistance > 0 ? (v.loadDistance / totalDistance) * 100 : 0;

              const totalDrivingDuration = v.loadDuration + v.noLoadDuration;
              const loadUtilizationRate = v.maxLoadWeight > 0 ? (v.currentLoad / v.maxLoadWeight * 100) : 0;

              return (
                  <VehicleCard key={v.id} $isSingleVehicle={isSingleVehicleView}>
                    <CardHeader>
                      <CardTitle>{v.plateNumber}</CardTitle>
                      <StatusBadge className={statusInfo(v.status).class}>
                        {statusInfo(v.status).text}
                      </StatusBadge>
                      <CardSubtitle>总运行时长: {formatDuration(totalDuration)} h</CardSubtitle>
                    </CardHeader>

                    <CardBody>
                      <InfoSection>
                        <InfoItem>
                          <InfoLabel>当前坐标:</InfoLabel>
                          <InfoValue>{parseFloat(v.currentLng).toFixed(4)}, {parseFloat(v.currentLat).toFixed(4)}</InfoValue>
                        </InfoItem>

                        {/* --- 新增的起点和终点显示 --- */}
                        {v.originName && (
                            <InfoItem>
                              <InfoLabel>起点:</InfoLabel>
                              <InfoValue>{v.originName}</InfoValue>
                            </InfoItem>
                        )}
                        {v.destinationName && (
                            <InfoItem>
                              <InfoLabel>终点:</InfoLabel>
                              <InfoValue>{v.destinationName}</InfoValue>
                            </InfoItem>
                        )}
                        {/* --- 修改结束 --- */}

                        <InfoItem>
                          <InfoLabel>空闲率:</InfoLabel>
                          <InfoValue className={idleRate > 30 ? 'text-bad' : 'text-good'}>{idleRate.toFixed(1)} %</InfoValue>
                        </InfoItem>
                        <InfoItem>
                          <InfoLabel>载重利用率:</InfoLabel>
                          <InfoValue className={loadUtilizationRate > 70 ? 'text-good' : 'text-bad'}>
                            {loadUtilizationRate.toFixed(1)} %
                          </InfoValue>
                        </InfoItem>
                      </InfoSection>

                      <AnalysisSection>
                        <AnalysisTitle>时间分析 ({formatDuration(totalDuration)} h)</AnalysisTitle>
                        <ProgressBarContainer className="is-flex">
                          <ProgressSegment
                              className="color-task"
                              style={{ width: `${totalDuration > 0 ? (v.loadDuration / totalDuration) * 100 : 0}%` }}
                              title={`载货行驶: ${formatDuration(v.loadDuration)}h`}
                          />
                          <ProgressSegment
                              className="color-mileage"
                              style={{ filter: 'brightness(70%)', width: `${totalDuration > 0 ? (v.noLoadDuration / totalDuration) * 100 : 0}%` }}
                              title={`空载行驶: ${formatDuration(v.noLoadDuration)}h`}
                          />
                          {/* 等待时间已合并到空闲时间中 */}
                          <ProgressSegment
                              className="color-idle"
                              style={{ width: `${totalDuration > 0 ? (idleDuration / totalDuration) * 100 : 0}%` }}
                              title={`空闲: ${formatDuration(idleDuration)}h`}
                          />
                        </ProgressBarContainer>
                        <ProgressLabels>
                          <span>行驶: {formatDuration(totalDrivingDuration)}h</span>
                          <span>空闲: {formatDuration(idleDuration)}h</span>
                        </ProgressLabels>
                      </AnalysisSection>

                      <AnalysisSection>
                        <AnalysisTitle>里程分析 ({formatDistance(v.loadDistance + v.noLoadDistance)} km)</AnalysisTitle>
                        <ProgressBarContainer>
                          <ProgressSegment
                              className="color-mileage"
                              style={{ width: `${effectiveMileageRate}%` }}
                              title={`有效里程: ${formatDistance(v.loadDistance)}km`}
                          />
                          <ProgressSegment
                              className="color-idle"
                              style={{ width: `${100 - effectiveMileageRate}%`, filter: 'brightness(70%)' }}
                              title={`空驶里程: ${formatDistance(v.noLoadDistance)}km`}
                          />
                        </ProgressBarContainer>
                        <AnalysisLabel>空驶里程: {formatDistance(v.noLoadDistance)} km ({totalDistance > 0 ? (v.noLoadDistance / (v.loadDistance + v.noLoadDistance) * 100).toFixed(0) : 0}%)</AnalysisLabel>
                      </AnalysisSection>

                      <AnalysisSection>
                        <AnalysisTitle>载重分析 ({v.maxLoadWeight.toFixed(1)} 吨)</AnalysisTitle>
                        <ProgressBarContainer>
                          <ProgressSegment
                              className="color-task"
                              style={{ width: `${loadUtilizationRate}%` }}
                          />
                        </ProgressBarContainer>
                        <AnalysisLabel>当前载重: {v.currentLoad.toFixed(1)} 吨 ({loadUtilizationRate.toFixed(0)}%)</AnalysisLabel>
                      </AnalysisSection>

                    </CardBody>
                  </VehicleCard>
              )})}
          </VehicleGrid>
        </ContentWrapper>
      </DashboardContainer>
  );
}

// --- Styled Components Definitions (保持不变) ---

const DashboardContainer = styled.div`
  background-color: ${props => props.$isSingleVehicle ? '' : ''};
  min-height: ${props => props.$isSingleVehicle ? 'auto' : '40vh'};
  color: var(--color-text-primary);
  font-family: sans-serif;
  padding: ${props => props.$isSingleVehicle ? '1rem' : '2rem'};
  border-radius: ${props => props.$isSingleVehicle ? '0.5rem' : '0'};
  box-shadow: ${props => props.$isSingleVehicle ? '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)' : 'none'};
`;

const ContentWrapper = styled.div`
  max-width: ${props => props.$isSingleVehicle ? 'auto' : '1280px'};
  margin: 0 auto;
`;

const OverviewGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: 2rem;

  @media (min-width: 640px) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  @media (min-width: 1024px) { grid-template-columns: repeat(3, minmax(0, 1fr)); } /* 减少列数以适应卡片数量 */
  @media (min-width: 1280px) { grid-template-columns: repeat(6, minmax(0, 1fr)); } /* 调整为6列 */
`;

const OverviewCard = styled.div`
  background-color: var(--color-card);
  padding: 1.5rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const OverviewCardWithChart = styled(OverviewCard)`
  padding: 1rem;
  justify-content: space-between;
`;

const CardLabel = styled.p`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  text-align: center;
  margin-top: 0.25rem;
`;

const CardValue = styled.p`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-text-primary);
  line-height: 1;

  &.text-good { color: var(--color-good); }
  &.text-bad { color: var(--color-bad); }
`;

const VehicleGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: ${props => props.$isSingleVehicle ? '1fr' : 'repeat(1, minmax(0, 1fr))'};

  @media (min-width: 768px) { grid-template-columns: ${props => props.$isSingleVehicle ? '1fr' : 'repeat(2, minmax(0, 1fr))'}; }
  @media (min-width: 1024px) { grid-template-columns: ${props => props.$isSingleVehicle ? '1fr' : 'repeat(3, minmax(0, 1fr))'}; }
  @media (min-width: 1280px) { grid-template-columns: ${props => props.$isSingleVehicle ? '1fr' : 'repeat(3, minmax(0, 1fr))'}; }
`;

const VehicleCard = styled.div`
  background-color: var(--color-card);
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
  width: ${props => props.$isSingleVehicle ? 'auto' : '100%'};

  &:hover {
    transform: translateY(-4px);
  }
`;

const CardHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  position: relative;
`;

const CardTitle = styled.div`
  font-weight: bold;
  font-size: 1.125rem;
  color: var(--color-text-brand);
  padding-right: 90px;
`;

const CardSubtitle = styled.p`
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
`;

const StatusBadge = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;

  &.status-inTransit {
    background-color: rgba(34, 197, 94, 0.2);
    color: #86efac;
  }

  &.status-idle {
    background-color: rgba(250, 204, 21, 0.2);
    color: #fde047;
  }

  &.status-movingToPickUp {
    background-color: rgba(59, 130, 246, 0.2);
    color: #93c5fd;
  }

  &.status-refused {
    background-color: rgba(107, 114, 128, 0.2);
    color: #9ca3af;
  }

  &.status-loading {
    background-color: rgba(249, 115, 22, 0.2);
    color: #fdba74;
  }

  &.status-unloading {
    background-color: rgba(239, 68, 68, 0.2);
    color: #f87171;
  }

  &.status-maintenance {
    background-color: rgba(239, 68, 68, 0.2);
    color: #f3f3f3;
  }

  &.status-unknown {
    background-color: rgba(239, 68, 68, 0.2);
    color: #fca5a5;
  }
`;

const CardBody = styled.div`
  padding: 1rem;
`;

const InfoSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem 1rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px dashed var(--color-border);
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const InfoLabel = styled.span`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
`;

const InfoValue = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);

  &.text-good { color: var(--color-good); }
  &.text-bad { color: var(--color-bad); }
`;

const AnalysisSection = styled.div`
  margin-bottom: 1.25rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const AnalysisTitle = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: #d1d5db;
  margin-bottom: 0.5rem;
`;

const AnalysisLabel = styled.p`
  font-size: 0.75rem;
  text-align: right;
  margin-top: 0.25rem;
  color: var(--color-text-secondary);
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  background-color: var(--color-border);
  border-radius: 9999px;
  height: 0.625rem; /* 10px */
  overflow: hidden;
  display: flex;
`;

const ProgressSegment = styled.div`
  height: 100%;
  transition: width 0.5s ease;

  &.color-task { background-color: var(--color-task); }
  &.color-wait { background-color: var(--color-wait); }
  &.color-idle { background-color: var(--color-idle); }
  &.color-mileage { background-color: var(--color-mileage); }
  &.color-weight { background-color: var(--color-weight); }
`;

const ProgressLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  color: var(--color-text-secondary);
`;
