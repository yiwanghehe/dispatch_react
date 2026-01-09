import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import WeatherEffects from "./WeatherEffects";

// Demo Data
const DEMO_DATA = {
    sunny: {
        city: '徐州市',
        temperature: '26',
        weather: '晴',
        windDirection: '东南',
        windPower: '3',
        humidity: '45',
        reportTime: '2024-01-09 14:00'
    },
    rainy: {
        city: '徐州市',
        temperature: '18',
        weather: '中雨',
        windDirection: '西北',
        windPower: '5',
        humidity: '92',
        reportTime: '2024-01-09 14:00'
    },
    cloudy: {
        city: '徐州市',
        temperature: '22',
        weather: '多云',
        windDirection: '东',
        windPower: '2',
        humidity: '60',
        reportTime: '2024-01-09 14:00'
    },
    snowy: {
        city: '徐州市',
        temperature: '-2',
        weather: '下雪',
        windDirection: '北',
        windPower: '4',
        humidity: '78',
        reportTime: '2024-01-09 14:00'
    },
    foggy: {
        city: '徐州市',
        temperature: '6',
        weather: '大雾',
        windDirection: '东',
        windPower: '1',
        humidity: '95',
        reportTime: '2024-01-09 14:00'
    },
    thunderstorm: {
        city: '徐州市',
        temperature: '20',
        weather: '雷暴',
        windDirection: '西南',
        windPower: '6',
        humidity: '88',
        reportTime: '2024-01-09 14:00'
    }
};

const mapBackendWeatherToText = (raw) => {
    if (!raw) return null;
    const w = String(raw);
    // 如果已经是中文描述，直接返回
    if (w.includes('雨') || w.includes('云') || w.includes('阴') || w.includes('晴') || w.includes('雪') || w.includes('雾') || w.includes('雷')) {
        return w;
    }
    const map = {
        SUNNY: '晴',
        CLOUDY: '多云',
        RAINY: '小雨',
        HEAVY_RAIN: '大雨',
        SNOWY: '下雪',
        FOGGY: '大雾',
        THUNDERSTORM: '雷暴',
    };
    return map[w] || w;
};

export default function ShowWeather({ visible, vehicle }) {
    const [weatherData, setWeatherData] = useState(null);
    const [mode, setMode] = useState('vehicle'); // vehicle | demo
    const [demoType, setDemoType] = useState('sunny');
    const lastVehicleKeyRef = useRef(null);

    const vehicleWeatherText = useMemo(() => {
        if (!vehicle) return null;
        return mapBackendWeatherToText(vehicle.weather || vehicle.weatherCondition);
    }, [vehicle]);

    // 选中车辆变化时：自动切回 vehicle 模式，确保天气跟随当前车辆
    useEffect(() => {
        if (!visible) return;
        const key = vehicle?.id ?? vehicle?.plateNumber ?? null;
        if (key !== lastVehicleKeyRef.current) {
            lastVehicleKeyRef.current = key;
            setMode('vehicle');
        }
    }, [visible, vehicle]);

    useEffect(() => {
        if (!visible) return;

        if (mode === 'demo') {
            setWeatherData(DEMO_DATA[demoType] || DEMO_DATA.sunny);
            return;
        }

        // mode === 'vehicle'
        if (vehicle && vehicleWeatherText) {
            setWeatherData({
                city: '车载气象',
                temperature: '--',
                weather: vehicleWeatherText,
                windDirection: '-',
                windPower: '-',
                humidity: '-',
                reportTime: '随车辆状态更新',
                speedFactor: vehicle.speedFactor,
                speed: vehicle.speed,
                adjustedSpeed: vehicle.adjustedSpeed,
            });
            return;
        }
        // 未选中车辆或后端未返回天气字段
        setWeatherData(null);
    }, [visible, mode, demoType, vehicle, vehicleWeatherText]);

    const handleDemoSwitch = (type) => {
        if (DEMO_DATA[type]) {
            setMode('demo');
            setDemoType(type);
        }
    };

    if (!visible) return null;
    if (!weatherData) {
        return (
            <WeatherCard>
                <Title>车辆天气</Title>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
                    未选中车辆或暂无天气数据，请先点击车辆查看；也可以切换到模拟天气验证特效。
                </div>
                <ControlPanel>
                    <ControlLabel>模拟天气:</ControlLabel>
                    <ButtonGroup>
                        <MiniButton onClick={() => handleDemoSwitch('sunny')}>☀️ 晴</MiniButton>
                        <MiniButton onClick={() => handleDemoSwitch('rainy')}>🌧️ 雨</MiniButton>
                        <MiniButton onClick={() => handleDemoSwitch('cloudy')}>☁️ 云</MiniButton>
                        <MiniButton onClick={() => handleDemoSwitch('snowy')}>❄️ 雪</MiniButton>
                        <MiniButton onClick={() => handleDemoSwitch('foggy')}>🌫️ 雾</MiniButton>
                        <MiniButton onClick={() => handleDemoSwitch('thunderstorm')}>⛈️ 雷</MiniButton>
                    </ButtonGroup>
                </ControlPanel>
            </WeatherCard>
        );
    }

    return (
        <>
            <WeatherEffects weatherType={weatherData.weather} />
            <WeatherCard>
                <Title>{weatherData.city} {mode === 'demo' ? '(模拟)' : '(车辆)'}天气</Title>
                <WeatherInfo>
                <MainInfo>
                    <Temp>{weatherData.temperature}°</Temp>
                    <Condition>{weatherData.weather}</Condition>
                </MainInfo>
                <Details>
                    <DetailItem>
                        <Label>风向:</Label> {weatherData.windDirection}风
                    </DetailItem>
                    <DetailItem>
                        <Label>风力:</Label> {weatherData.windPower} 级
                    </DetailItem>
                    <DetailItem>
                        <Label>湿度:</Label> {weatherData.humidity}%
                    </DetailItem>
                    {mode !== 'demo' && (
                        <>
                            <DetailItem>
                                <Label>速度系数:</Label> {typeof weatherData.speedFactor === 'number' ? weatherData.speedFactor.toFixed(2) : '-'}
                            </DetailItem>
                            <DetailItem>
                                <Label>当前速度:</Label> {typeof weatherData.speed === 'number' ? weatherData.speed.toFixed(2) : '-'}
                            </DetailItem>
                            <DetailItem>
                                <Label>调整后速度:</Label> {typeof weatherData.adjustedSpeed === 'number' ? weatherData.adjustedSpeed.toFixed(2) : '-'}
                            </DetailItem>
                        </>
                    )}
                    <DetailItem>
                        <Label>发布:</Label> {weatherData.reportTime}
                    </DetailItem>
                </Details>
                
                <ControlPanel>
                    <ControlLabel>模拟天气:</ControlLabel>
                    <ButtonGroup>
                        <MiniButton onClick={() => handleDemoSwitch('sunny')} $active={mode === 'demo' && weatherData.weather.includes('晴')}>☀️ 晴</MiniButton>
                        <MiniButton onClick={() => handleDemoSwitch('rainy')} $active={mode === 'demo' && weatherData.weather.includes('雨')}>🌧️ 雨</MiniButton>
                        <MiniButton onClick={() => handleDemoSwitch('cloudy')} $active={mode === 'demo' && weatherData.weather.includes('云')}>☁️ 云</MiniButton>
                        <MiniButton onClick={() => handleDemoSwitch('snowy')} $active={mode === 'demo' && weatherData.weather.includes('雪')}>❄️ 雪</MiniButton>
                        <MiniButton onClick={() => handleDemoSwitch('foggy')} $active={mode === 'demo' && weatherData.weather.includes('雾')}>🌫️ 雾</MiniButton>
                        <MiniButton onClick={() => handleDemoSwitch('thunderstorm')} $active={mode === 'demo' && weatherData.weather.includes('雷')}>⛈️ 雷</MiniButton>
                    </ButtonGroup>
                    <ResetButton onClick={() => setMode('vehicle')}>🔄 使用车辆天气</ResetButton>
                </ControlPanel>

            </WeatherInfo>
        </WeatherCard>
        </>
    );
}

const WeatherCard = styled.div`
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    color: #333;
    width: 220px; /* Slightly wider for buttons */
    font-family: 'Inter', sans-serif;
`;

const Title = styled.h3`
    margin: 0 0 10px 0;
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
`;

const WeatherInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const MainInfo = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const Temp = styled.div`
    font-size: 32px;
    font-weight: bold;
    color: #2563eb;
`;

const Condition = styled.div`
    font-size: 16px;
    color: #4b5563;
`;

const Details = styled.div`
    font-size: 12px;
    color: #6b7280;
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const DetailItem = styled.div`
    display: flex;
    justify-content: space-between;
`;

const Label = styled.span`
    color: #9ca3af;
`;

const ControlPanel = styled.div`
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed #e5e7eb;
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const ControlLabel = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: #4b5563;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 6px;
    justify-content: space-between;
`;

const MiniButton = styled.button`
    background-color: ${props => props.$active ? '#dbeafe' : '#f3f4f6'};
    color: ${props => props.$active ? '#1e40af' : '#4b5563'};
    border: 1px solid ${props => props.$active ? '#bfdbfe' : '#e5e7eb'};
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 12px;
    cursor: pointer;
    flex: 1;
    transition: all 0.2s;

    &:hover {
        background-color: #dbeafe;
    }
`;

const ResetButton = styled.button`
    background-color: transparent;
    color: #6b7280;
    border: 1px solid transparent;
    font-size: 11px;
    cursor: pointer;
    text-align: right;
    padding: 4px 0;
    
    &:hover {
        color: #2563eb;
        text-decoration: underline;
    }
`;
