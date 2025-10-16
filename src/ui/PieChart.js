// PieChart.js
import React from 'react';
import styled from 'styled-components';

const PieChartContainer = styled.div`
  width: 70px; /* 调整饼图大小 */
  height: 70px;
  margin-bottom: 0.75rem; /* 与下方文字的间距 */
`;

const Svg = styled.svg`
  width: 100%;
  height: 100%;
  transform: rotate(-90deg); /* 让起始点从12点钟方向开始 */
  border-radius: 50%;
`;

const CircleBackground = styled.circle`
  fill: var(--color-border); /* 背景颜色 */
`;

const CircleProgress = styled.circle`
  fill: none;
  transition: stroke-dashoffset 0.5s ease-in-out;
`;

/**
 * 一个简单的SVG饼图/环形图组件
 * @param {number} percentage - 要显示的百分比 (0-100).
 * @param {string} color - 进度条的颜色.
 */
const PieChart = ({ percentage, color }) => {
    const radius = 20; // 圆的半径
    const circumference = 2 * Math.PI * radius; // 圆的周长
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <PieChartContainer>
            <Svg viewBox="0 0 50 50">
                <CircleBackground cx="25" cy="25" r={radius} />
                <CircleProgress
                    stroke={color}
                    strokeWidth="10"    /* 环形的宽度 */
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    cx="25"
                    cy="25"
                    r={radius}
                />
            </Svg>
        </PieChartContainer>
    );
};

export default PieChart;
