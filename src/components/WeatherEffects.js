import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

// --- 雨天效果 (Canvas) ---
const RainCanvas = styled.canvas`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 12; /* 位于地图控件之下，地图之上，或者根据需要调整 */
    background-color: rgba(0, 0, 0, 0.1); /* 给雨天加一点底色，显得更阴沉 */
`;

const Rain = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const drops = [];
        const dropCount = 1000; // 增加雨滴数量 (原200)

        for (let i = 0; i < dropCount; i++) {
            drops.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                length: Math.random() * 25 + 15, // 雨滴更长
                speed: Math.random() * 15 + 10,   // 下落更快
                opacity: Math.random() * 0.5 + 0.3 // 透明度
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.lineWidth = 1.5; // 线条加粗
            ctx.lineCap = 'round';

            drops.forEach(drop => {
                ctx.strokeStyle = `rgba(174, 194, 224, ${drop.opacity})`;
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x, drop.y + drop.length);
                ctx.stroke();

                drop.y += drop.speed;
                if (drop.y > canvas.height) {
                    drop.y = -drop.length;
                    drop.x = Math.random() * canvas.width;
                }
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <RainCanvas ref={canvasRef} />;
};

// --- 多云/阴天效果 (CSS Overlay) ---
const CloudyOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background-color: rgba(0, 0, 0, 0.3); /* 变暗程度加深 (原0.2) */
    z-index: 12;
    transition: background-color 1s ease;
    overflow: hidden; /* 防止云朵飘出产生滚动条 */
`;

const Cloud = styled.div`
    position: absolute;
    top: ${props => props.top}%;
    left: -20%;
    width: ${props => props.width || '300px'}; /* 可配置宽度 */
    height: ${props => props.height || '100px'};
    background: #f0f0f0; /* 云朵颜色稍微加深一点，更显眼 */
    border-radius: 100px;
    opacity: 0.8; /* 不透明度增加 (原0.6) */
    filter: blur(15px); /* 模糊减少一点，轮廓更清晰 */
    animation: moveClouds ${props => props.duration}s linear infinite;
    z-index: 13;
    
    &::after, &::before {
        content: '';
        position: absolute;
        background: #f0f0f0;
        width: 35%;
        height: 100%;
        border-radius: 50%;
        top: -45%;
        left: 15%;
    }
    &::before {
        width: 40%;
        height: 120%;
        top: -60%;
        left: 40%;
    }

    @keyframes moveClouds {
        0% { transform: translateX(0); }
        100% { transform: translateX(140vw); } /* 移动距离加长确保完全移出 */
    }
`;

const Cloudy = () => {
    return (
        <CloudyOverlay>
            <Cloud top={15} duration={35} width="350px" height="110px" style={{opacity: 0.7}} />
            <Cloud top={40} duration={50} width="450px" height="140px" style={{opacity: 0.5}} />
            <Cloud top={5} duration={65} width="250px" height="80px" style={{opacity: 0.6, animationDelay: '-10s'}} />
            <Cloud top={60} duration={45} width="500px" height="160px" style={{opacity: 0.4, animationDelay: '-20s'}} />
        </CloudyOverlay>
    );
};

// --- 晴天效果 (Sunny) ---
const SunnyOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background: radial-gradient(circle at 90% 10%, rgba(255, 223, 0, 0.2) 0%, rgba(255, 255, 255, 0) 50%);
    z-index: 12;
    mix-blend-mode: overlay;
`;

const Sunny = () => {
    return <SunnyOverlay />;
};


// --- 主组件 ---
export default function WeatherEffects({ weatherType }) {
    if (!weatherType) return null;

    if (weatherType.includes('雨')) {
        return <Rain />;
    } else if (weatherType.includes('云') || weatherType.includes('阴')) {
        return <Cloudy />;
    } else if (weatherType.includes('晴')) {
        return <Sunny />;
    }

    return null;
}

