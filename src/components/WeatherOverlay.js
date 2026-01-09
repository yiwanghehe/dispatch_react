import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9; /* 位于地图之上(zIndex:1)，但低于控件(zIndex:10) */
  overflow: hidden;
  display: ${props => props.$visible ? 'block' : 'none'};
`;

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
`;

export default function WeatherOverlay({ weather }) {
    const canvasRef = useRef(null);
    const requestRef = useRef(null);
    const particlesRef = useRef([]);

    // 映射天气描述到内部类型
    const getWeatherType = (w) => {
        if (!w) return null;
        if (w.includes('雨')) return 'rain';
        if (w.includes('雪')) return 'snow';
        if (w.includes('云') || w.includes('阴')) return 'cloud';
        // 晴天或者其他暂无特效
        return null;
    };

    const type = getWeatherType(weather);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !type) {
            if(requestRef.current) cancelAnimationFrame(requestRef.current);
            return;
        }

        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;

        // 初始化粒子
        const initParticles = () => {
            const count = type === 'rain' ? 1000 : (type === 'snow' ? 200 : 0);
            particlesRef.current = [];
            for (let i = 0; i < count; i++) {
                particlesRef.current.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    speedY: type === 'rain' ? Math.random() * 15 + 10 : Math.random() * 2 + 1,
                    speedX: type === 'rain' ? -1 : Math.random() * 2 - 1, // 雨稍微有点斜，雪飘忽
                    length: type === 'rain' ? Math.random() * 20 + 10 : Math.random() * 3 + 2,
                    opacity: Math.random() * 0.5 + 0.1
                });
            }
        };

        initParticles();

        const draw = () => {
            // 清空画布
            ctx.clearRect(0, 0, width, height);

            // 绘制逻辑
            ctx.fillStyle = type === 'rain' ? 'rgba(174, 194, 224, 0.5)' : 'rgba(255, 255, 255, 0.8)';
            ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
            ctx.lineWidth = 1;

            if (type === 'cloud') {
                // 简单的阴天蒙版效果，不使用粒子
                ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.fillRect(0, 0, width, height);
            } else {
                // 雨或雪
                particlesRef.current.forEach(p => {
                    if (type === 'rain') {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p.x + p.speedX, p.y + p.length);
                        ctx.stroke();
                    } else if (type === 'snow') {
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.length, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    // 更新位置
                    p.y += p.speedY;
                    p.x += p.speedX;

                    // 循环
                    if (p.y > height) {
                        p.y = -p.length;
                        p.x = Math.random() * width;
                    }
                    if (p.x > width || p.x < 0) {
                        p.x = Math.random() * width;
                    }
                });
            }

            requestRef.current = requestAnimationFrame(draw);
        };

        draw();

        // Handle resize
        const handleResize = () => {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
            initParticles();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            window.removeEventListener('resize', handleResize);
        };
    }, [type]);

    return (
        <OverlayContainer $visible={!!type}>
            <Canvas ref={canvasRef} />
        </OverlayContainer>
    );
}

