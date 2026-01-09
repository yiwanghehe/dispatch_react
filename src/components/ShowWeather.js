import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import apiImpl from "./api/apiImpl";
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
    }
};

export default function ShowWeather({ visible }) {
    const [weatherData, setWeatherData] = useState(null);
    const [isDemo, setIsDemo] = useState(false);

    const fetchRealWeather = async () => {
        // Default to '徐州市' as per previous requirement
        const city = '徐州市';
        try {
            const res = await apiImpl.getWeather(city);
            if (res && res.code === 200) {
                setWeatherData(res.data);
                setIsDemo(false);
            } else {
                // 如果接口调用成功但返回结果不是 200，或者 apiImpl 内部捕获了错误返回 undefined
                // 强制使用 Demo 数据，防止一直 loading
                console.warn("Weather API returned invalid response or failed, switching to demo mode.");
                setWeatherData(DEMO_DATA.sunny);
                setIsDemo(true);
            }
        } catch (error) {
            console.error("Failed to fetch weather", error);
            // Fallback to demo if backend fails
            setWeatherData(DEMO_DATA.sunny);
            setIsDemo(true);
        }
    };

    useEffect(() => {
        if (!visible) return;
        fetchRealWeather();
    }, [visible]);

    const handleDemoSwitch = (type) => {
        if (DEMO_DATA[type]) {
            setWeatherData(DEMO_DATA[type]);
            setIsDemo(true);
        }
    };

    if (!visible) return null;
    if (!weatherData) return <WeatherCard><div>Loading Weather...</div></WeatherCard>;

    return (
        <>
            <WeatherEffects weatherType={weatherData.weather} />
            <WeatherCard>
                <Title>{weatherData.city} {isDemo ? '(模拟)' : '实时'}天气</Title>
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
                    <DetailItem>
                        <Label>发布:</Label> {weatherData.reportTime}
                    </DetailItem>
                </Details>
                
                <ControlPanel>
                    <ControlLabel>调控天气:</ControlLabel>
                    <ButtonGroup>
                        <MiniButton onClick={() => handleDemoSwitch('sunny')} $active={isDemo && weatherData.weather.includes('晴')}>☀️ 晴</MiniButton>
                        <MiniButton onClick={() => handleDemoSwitch('rainy')} $active={isDemo && weatherData.weather.includes('雨')}>🌧️ 雨</MiniButton>
                        <MiniButton onClick={() => handleDemoSwitch('cloudy')} $active={isDemo && weatherData.weather.includes('云')}>☁️ 云</MiniButton>
                    </ButtonGroup>
                    <ResetButton onClick={fetchRealWeather}>🔄 恢复实时</ResetButton>
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
