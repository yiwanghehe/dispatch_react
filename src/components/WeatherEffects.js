import React, { useEffect, useMemo, useRef, useState } from 'react';
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

const Rain = ({ dropCount = 1000, backgroundAlpha = 0.1 } = {}) => {
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

            // 给雨天加一点底色，显得更阴沉（雷暴可传更小 alpha）
            ctx.fillStyle = `rgba(0, 0, 0, ${backgroundAlpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

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

// --- 雪天效果 (Canvas) ---
const SnowCanvas = styled.canvas`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 12;
`;

const SnowBackdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 11;
    /* 冷色+轻微变暗，让白色雪花在浅色底图上也明显 */
    background:
        radial-gradient(circle at 30% 20%, rgba(220, 235, 255, 0.22), rgba(0, 0, 0, 0) 55%),
        radial-gradient(circle at 70% 60%, rgba(220, 235, 255, 0.16), rgba(0, 0, 0, 0) 60%),
        rgba(0, 0, 0, 0.10);
    mix-blend-mode: multiply;
`;

const Snow = () => {
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

        const flakes = [];
        const flakeCount = 560;
        for (let i = 0; i < flakeCount; i++) {
            flakes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 3.6 + 1.2,
                speedY: Math.random() * 2.0 + 0.6,
                driftX: Math.random() * 1.8 - 0.9,
                opacity: Math.random() * 0.55 + 0.35,
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.shadowColor = 'rgba(0,0,0,0.18)';
            ctx.shadowBlur = 3;

            flakes.forEach(f => {
                ctx.beginPath();
                ctx.fillStyle = `rgba(255,255,255,${f.opacity})`;
                ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
                ctx.fill();

                f.y += f.speedY;
                f.x += f.driftX;

                if (f.y > canvas.height + 10) {
                    f.y = -10;
                    f.x = Math.random() * canvas.width;
                }
                if (f.x > canvas.width + 10) f.x = -10;
                if (f.x < -10) f.x = canvas.width + 10;
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <>
            <SnowBackdrop />
            <SnowCanvas ref={canvasRef} />
        </>
    );
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

// --- 大雾效果 (Fog) ---
const FogOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 12;
    background:
        radial-gradient(circle at 20% 30%, rgba(255,255,255,0.35), rgba(255,255,255,0) 55%),
        radial-gradient(circle at 70% 60%, rgba(255,255,255,0.30), rgba(255,255,255,0) 60%),
        radial-gradient(circle at 50% 20%, rgba(255,255,255,0.25), rgba(255,255,255,0) 55%),
        rgba(255,255,255,0.10);
    backdrop-filter: blur(2px);
    filter: blur(0.5px);
`;

const Fog = () => <FogOverlay />;

// --- 雷暴效果 (Thunderstorm) ---
const ThunderBackdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 11;
    /* 更暗的天幕，让雷更有对比 */
    background:
        radial-gradient(circle at 50% 0%, rgba(0,0,0,0.72), rgba(0,0,0,0) 60%),
        radial-gradient(circle at 18% 35%, rgba(0,0,0,0.62), rgba(0,0,0,0) 60%),
        radial-gradient(circle at 80% 55%, rgba(0,0,0,0.48), rgba(0,0,0,0) 65%),
        rgba(0, 0, 0, 0.40);
`;

const ThunderShake = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 12;
    animation: ${props => (props.$on ? 'thunderShake 260ms linear' : 'none')};

    @keyframes thunderShake {
        0% { transform: translate(0, 0); }
        15% { transform: translate(-2px, 1px); }
        30% { transform: translate(2px, -1px); }
        45% { transform: translate(-3px, 2px); }
        60% { transform: translate(3px, -2px); }
        75% { transform: translate(-2px, -1px); }
        100% { transform: translate(0, 0); }
    }
`;

const LightningBolt = styled.div`
    position: fixed;
    top: 0;
    left: ${props => props.$x}%;
    width: 320px;
    height: 60vh;
    pointer-events: none;
    z-index: 14;
    opacity: ${props => (props.$on ? 1 : 0)};
    transition: opacity 80ms ease-in-out;
    transform: translateX(-50%) skewX(-8deg);
    filter: drop-shadow(0 0 26px rgba(255,255,255,0.95)) drop-shadow(0 0 10px rgba(140, 200, 255, 0.55));

    animation: ${props => (props.$on ? 'boltFlicker 700ms steps(2, end) infinite' : 'none')};

    @keyframes boltFlicker {
        0% { opacity: 1; }
        10% { opacity: 0.65; }
        20% { opacity: 1; }
        35% { opacity: 0.45; }
        50% { opacity: 1; }
        65% { opacity: 0.75; }
        80% { opacity: 1; }
        100% { opacity: 0.6; }
    }

    /* 用 clip-path 做闪电形状 */
    background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(210, 235, 255, 0.55) 45%, rgba(255,255,255,0.12));
    clip-path: polygon(
        48% 0%,
        58% 0%,
        52% 26%,
        66% 26%,
        36% 60%,
        48% 60%,
        34% 100%,
        52% 62%,
        40% 62%
    );
`;

const ThunderFlash = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 15;
    background:
        radial-gradient(circle at 50% 30%, rgba(255,255,255,0.95), rgba(255,255,255,0) 55%),
        rgba(255, 255, 255, 0.0);
    opacity: ${props => (props.$on ? 1 : 0)};
    transition: opacity 70ms ease-in-out;
    mix-blend-mode: screen;
`;

const Thunderstorm = () => {
    const [flashOn, setFlashOn] = useState(false);
    const [boltOn, setBoltOn] = useState(false);
    const [boltX, setBoltX] = useState(55);
    const timeoutRef = useRef(null);
    const subTimeoutsRef = useRef([]);

    const scheduleNext = useMemo(() => {
        return () => {
            // 增加打雷频率：1.2s ~ 3.5s 随机一次
            const delay = 1200 + Math.random() * 2300;
            timeoutRef.current = setTimeout(() => {
                setBoltX(20 + Math.random() * 60);

                // 闪两下更像雷（同时显示闪电形状）
                setBoltOn(true);
                setFlashOn(true);
                subTimeoutsRef.current.push(setTimeout(() => setFlashOn(false), 110));
                subTimeoutsRef.current.push(setTimeout(() => setFlashOn(true), 230));
                subTimeoutsRef.current.push(setTimeout(() => setFlashOn(false), 360));
                // 再来一次弱一点的补闪，提升“存在感”
                subTimeoutsRef.current.push(setTimeout(() => setFlashOn(true), 520));
                subTimeoutsRef.current.push(setTimeout(() => setFlashOn(false), 640));
                // 闪电保持更久，确保肉眼能捕捉到
                subTimeoutsRef.current.push(setTimeout(() => setBoltOn(false), 900));
                scheduleNext();
            }, delay);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        scheduleNext();
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            subTimeoutsRef.current.forEach(t => clearTimeout(t));
            subTimeoutsRef.current = [];
        };
    }, [scheduleNext]);

    return (
        <>
            <ThunderBackdrop />
            <ThunderShake $on={flashOn} />
            {/* 雷暴：保留小雨，但通过阴云+闪电让它和“普通雨”明显区分 */}
            <Rain dropCount={420} backgroundAlpha={0.05} />
            <LightningBolt $on={boltOn} $x={boltX} />
            <ThunderFlash $on={flashOn} />
        </>
    );
};


// --- 主组件 ---
export default function WeatherEffects({ weatherType }) {
    if (!weatherType) return null;

    if (weatherType.includes('雨')) {
        return <Rain />;
    } else if (weatherType.includes('雪')) {
        return <Snow />;
    } else if (weatherType.includes('雾')) {
        return <Fog />;
    } else if (weatherType.includes('雷')) {
        return <Thunderstorm />;
    } else if (weatherType.includes('云') || weatherType.includes('阴')) {
        return <Cloudy />;
    } else if (weatherType.includes('晴')) {
        return <Sunny />;
    }

    return null;
}

