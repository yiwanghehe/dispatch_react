import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import apiImpl from "./api/apiImpl";

// --- 样式定义 (主要更新 Sidebar) ---

// 根容器
const PanelContainer = styled.div`
    background: #ffffff;
    padding: 24px 32px;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    width: 1200px;
    max-width: 95%;
    min-height: 600px;
    border: 1px solid #e9ecef;
    display: flex;
    flex-direction: column;
`;

// 头部
const PanelHeader = styled.div`
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 16px;
    margin-bottom: 24px;
    flex-shrink: 0;
`;

// 标题
const PanelTitle = styled.h2`
    margin: 0;
    font-size: 1.5em;
    color: #333;
    text-align: center;
`;

// 主内容包装器
const MainContentWrapper = styled.div`
    display: flex;
    gap: 24px;
    flex-grow: 1;
    overflow: hidden;
`;

// 左侧边栏 (添加了自定义滚动条样式)
const Sidebar = styled.div`
    width: 250px;
    height: 600px;
    flex-shrink: 0;
    border-right: 1px solid #e9ecef;
    padding-right: 16px; /* 稍微减少右边距，为滚动条留出空间 */
    overflow-y: auto; /* 当内容溢出时显示垂直滚动条 */

    /* --- 新增：自定义滚动条样式 (适用于 Webkit 内核浏览器如 Chrome, Safari) --- */
    &::-webkit-scrollbar {
        width: 6px; /* 滚动条宽度 */
    }

    &::-webkit-scrollbar-track {
        background: transparent; /* 轨道背景色 */
        border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: #ccc; /* 滚动条滑块颜色 */
        border-radius: 3px;
        transition: background-color 0.2s;
    }

    &::-webkit-scrollbar-thumb:hover {
        background-color: #999; /* 鼠标悬浮时滑块颜色 */
    }
`;

// 侧边栏列表项
const SidebarItem = styled.div`
    padding: 12px 16px;
    margin-bottom: 8px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1em;
    font-weight: 500;
    transition: background-color 0.2s ease, color 0.2s ease;

    background-color: ${props => props.isActive ? '#007aff' : 'transparent'};
    color: ${props => props.isActive ? '#ffffff' : '#333'};

    &:hover {
        background-color: ${props => props.isActive ? '#0056b3' : '#f1f1f1'};
    }
`;

// 右侧内容区域
const ContentArea = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    padding: 5px 10px 5px 5px; /* 调整内边距以适应滚动条 */
`;

// 单个会话卡片
const SessionCard = styled.div`
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 10px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

// 会话卡片标题
const SessionHeader = styled.h3`
    margin-top: 0;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e9ecef;
    font-size: 1.25em;
    color: #212529;
`;

// 结果展示网格
const ResultsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 20px;
`;

// 单个数据项
const ResultItem = styled.div`
    background-color: #ffffff;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.07);
    }
`;

// 数据标签
const Label = styled.span`
    font-size: 0.9em;
    color: #666;
    margin-bottom: 8px;
    text-align: center;
`;

// 数据值
const Value = styled.span`
    font-size: 1.4em;
    font-weight: 600;
    color: ${props => (props.isNA ? '#999' : '#007aff')};
`;


// --- 辅助函数 (保持不变) ---
const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
};

const formatNumber = (num, unit = '') => {
    if (num === null || num === undefined) return 'N/A';
    const formattedNum = num.toLocaleString('en-US');
    return `${formattedNum}${unit}`;
};

const formatBoolean = (bool) => {
    return bool ? '是' : '否';
};


/**
 * 展示数据沙箱历史记录的面板组件 (两栏布局)
 */
export default function SimulationSessionsPanel() {
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);

    useEffect(() => {
        apiImpl.getSessions().then(res => {
            const fetchedSessions = res.data;
            setSessions(fetchedSessions);

            if (fetchedSessions && fetchedSessions.length > 0) {
                setSelectedSession(fetchedSessions[0]);
            }
        });
    }, []);

    const renderSessionDetails = (session) => (
        <SessionCard>
            <SessionHeader>{session.sessionName}</SessionHeader>
            <ResultsGrid>
                {/* 配置信息 */}
                <ResultItem><Label>开始时间</Label><Value isNA={!session.startTime}>{formatDateTime(session.startTime)}</Value></ResultItem>
                <ResultItem><Label>结束时间</Label><Value isNA={!session.endTime}>{formatDateTime(session.endTime)}</Value></ResultItem>
                <ResultItem><Label>使用加权</Label><Value>{formatBoolean(session.useWeight)}</Value></ResultItem>
                <ResultItem><Label>时间权重</Label><Value isNA={session.weightTime === null}>{formatNumber(session.weightTime)}</Value></ResultItem>
                <ResultItem><Label>浪费载重权重</Label><Value isNA={session.weightWastedLoad === null}>{formatNumber(session.weightWastedLoad)}</Value></ResultItem>
                <ResultItem><Label>空闲时间权重</Label><Value isNA={session.weightWastedIdle === null}>{formatNumber(session.weightWastedIdle)}</Value></ResultItem>

                {/* 结果指标 */}
                <ResultItem><Label>平均空载距离</Label><Value isNA={session.avgNoLoadDistance === null}>{formatNumber(session.avgNoLoadDistance, ' m')}</Value></ResultItem>
                <ResultItem><Label>平均装载距离</Label><Value isNA={session.avgLoadDistance === null}>{formatNumber(session.avgLoadDistance, ' m')}</Value></ResultItem>
                <ResultItem><Label>平均总耗时</Label><Value isNA={session.avgTotalDuration === null}>{formatNumber(session.avgTotalDuration, ' s')}</Value></ResultItem>
                <ResultItem><Label>平均等待时间</Label><Value isNA={session.avgWaitingDuration === null}>{formatNumber(session.avgWaitingDuration, ' s')}</Value></ResultItem>
                <ResultItem><Label>完成任务数</Label><Value isNA={session.totalDemandsCompleted === null}>{formatNumber(session.totalDemandsCompleted)}</Value></ResultItem>
                <ResultItem><Label>总浪费载重</Label><Value isNA={session.totalWastedCapacity === null}>{formatNumber(session.totalWastedCapacity)}</Value></ResultItem>
            </ResultsGrid>
        </SessionCard>
    );

    return (
        <PanelContainer>
            <PanelHeader>
                <PanelTitle>数据沙箱历史记录</PanelTitle>
            </PanelHeader>

            <MainContentWrapper>
                <Sidebar>
                    {sessions.length > 0 ? (
                        sessions.map(session => (
                            <SidebarItem
                                key={session.id}
                                isActive={selectedSession && selectedSession.id === session.id}
                                onClick={() => setSelectedSession(session)}
                            >
                                {session.sessionName}
                            </SidebarItem>
                        ))
                    ) : (
                        <p style={{ color: '#666', textAlign: 'center' }}>加载中...</p>
                    )}
                </Sidebar>

                <ContentArea>
                    {selectedSession ? (
                        renderSessionDetails(selectedSession)
                    ) : (
                        <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
                            暂无历史记录或未选择会话。
                        </p>
                    )}
                </ContentArea>
            </MainContentWrapper>
        </PanelContainer>
    );
}
