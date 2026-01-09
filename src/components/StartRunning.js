import React, {useRef, useEffect, useState} from 'react';
import styled from 'styled-components';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import {parseCoordinates} from "../utils/parseCoordinates";
import apiImpl from "./api/apiImpl";

export default function StartRunning({ vehicleStatus, setVehicleStatus, setNavigationId, setMyPath }) {
    const vehicleIntervals = useRef({});

    // 仿真参数的状态
    const [useWeight, setUseWeight] = useState(false);
    const [weight_WASTED_IDLE, setWeight_WASTED_IDLE] = useState('1.0');
    const [weight_WASTED_LOAD, setWeight_WASTED_LOAD] = useState('0.5');
    const [weight_TIME, setWeight_TIME] = useState('0.1');

    useEffect(() => {
        return () => {
            for (const key in vehicleIntervals.current) {
                clearInterval(vehicleIntervals.current[key]);
            }
        };
    }, []);

    useEffect(() => {
        console.log("车辆状态数组:", vehicleStatus);
    }, [vehicleStatus]);

    const handleStartSimulation = () => {
        if (useWeight) {
            // 如果使用权重，确保输入不为空
            if (!weight_WASTED_IDLE || !weight_WASTED_LOAD || !weight_TIME) {
                alert("请填写所有权重参数！");
                return;
            }
            apiImpl.startSimulation(
                true,
                parseFloat(weight_WASTED_IDLE),
                parseFloat(weight_WASTED_LOAD),
                parseFloat(weight_TIME)
            );
        } else {
            // 如果不使用权重，使用默认值（例如都为0）
            apiImpl.startSimulation(false, 0, 0, 0);
        }
    };

    const handleStopSimulation = () => {
        apiImpl.stopSimulation();
    };

    async function updateVehicleStatus() {
        try{
            await connectWebSocket();
        } catch (error) {
            console.error("启动WebSocket调度服务失败:", error.message);
        }
    }

    async function connectWebSocket() {
        let client = null;
        const connectVehicleWebSocket = () => {
            const socket = new SockJS('http://localhost:8087/ws');
            client = new Client({
                webSocketFactory: () => socket,
                debug: (str) => {
                    // console.log(str);
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 40000,
                heartbeatOutgoing: 40000,
            });

            client.onConnect = () => {
                console.log(`WebSocket 连接成功`);
                client.subscribe(`/topic/vehicles/all`, (message) => {
                    try {
                        const vehicleStatusMap = JSON.parse(message.body);
                        console.log(`车辆状态Map:`, vehicleStatusMap);
                        // 更新车辆状态
                        const vehicleStatusArray = Object.values(vehicleStatusMap);
                        // 后端推送实际是 List<VehicleDto>（JSON 数组）；这里统一存数组，方便上层 find/filter
                        setVehicleStatus(Array.isArray(vehicleStatusMap) ? vehicleStatusMap : vehicleStatusArray);

                        // 更新路径
                        setMyPath(prevPath => {
                            const vehicleKeyToPath = vehicleStatusArray.reduce((acc, vehicle) => {
                                const vehicleKey = vehicle.plateNumber;
                                const traveledPolyline = vehicle.traveledPolyline;

                                acc[vehicleKey] = parseCoordinates(traveledPolyline);
                                return acc;
                            }, {});

                            return {
                                ...prevPath,
                                ...vehicleKeyToPath
                            };
                        });

                        // 更新 navigationId
                        setNavigationId(prevNavigationId => {
                            const updatedNavigationId = { ...prevNavigationId };

                            // 获取当前所有车辆的key
                            const currentVehicleKeys = vehicleStatusArray.map(vehicle => vehicle.plateNumber);

                            // 为每个车辆分配新的ID（从0开始）
                            currentVehicleKeys.forEach((vehicleKey, index) => {
                                updatedNavigationId[vehicleKey] = index;
                            });

                            return updatedNavigationId;
                        });
                    } catch (error) {
                        console.error(`解析车辆数据失败:`, error);
                    }
                });
            };

            client.onStompError = (frame) => {
                console.error(`代理错误: `, frame.headers['message']);
                console.error('详情:', frame.body);
            };

            client.onWebSocketClose = () => {
                console.log(`WebSocket 关闭`);
            };

            client.activate();
        };

        // 连接 WebSocket
        connectVehicleWebSocket();

        // 清理函数
        return () => {
            client.deactivate();
            console.log(`清理 WebSocket 连接`);
        };
    }

    return (
        <StartRunningTable>
            <tbody>
                <tr>
                    <TableCell>使用权重</TableCell>
                    <TableCell>
                        <StyledCheckbox
                            type="checkbox"
                            checked={useWeight}
                            onChange={(e) => setUseWeight(e.target.checked)}
                        />
                    </TableCell>
                </tr>
                <tr>
                    <TableCell>空闲浪费权重</TableCell>
                    <TableCell>
                        <StyledInput
                            type="number"
                            value={weight_WASTED_IDLE}
                            onChange={(e) => setWeight_WASTED_IDLE(e.target.value)}
                            disabled={!useWeight}
                            placeholder={useWeight ? "请输入数值" : "已禁用"}
                        />
                    </TableCell>
                </tr>
                <tr>
                    <TableCell>负载浪费权重</TableCell>
                    <TableCell>
                        <StyledInput
                            type="number"
                            value={weight_WASTED_LOAD}
                            onChange={(e) => setWeight_WASTED_LOAD(e.target.value)}
                            disabled={!useWeight}
                            placeholder={useWeight ? "请输入数值" : "已禁用"}
                        />
                    </TableCell>
                </tr>
                <tr>
                    <TableCell>时间权重</TableCell>
                    <TableCell>
                        <StyledInput
                            type="number"
                            value={weight_TIME}
                            onChange={(e) => setWeight_TIME(e.target.value)}
                            disabled={!useWeight}
                            placeholder={useWeight ? "请输入数值" : "已禁用"}
                        />
                    </TableCell>
                </tr>
                <tr>
                    <TableCell colSpan="2">
                        <StyledButton onClick={handleStartSimulation}>
                            启动仿真
                        </StyledButton>
                    </TableCell>
                </tr>
                <tr>
                    <TableCell colSpan="2">
                        <StyledButton onClick={handleStopSimulation} style={{backgroundColor: '#dc3545'}}>
                            停止仿真
                        </StyledButton>
                    </TableCell>
                </tr>
                <tr>
                    <TableCell colSpan="2">
                        <StyledButton onClick={updateVehicleStatus}>
                            获取车辆状态
                        </StyledButton>
                    </TableCell>
                </tr>
            </tbody>
        </StartRunningTable>
    );
}
// --- Styled Components Definitions ---

// Styled table for the task/dispatch form
const StartRunningTable = styled.table`
    width: 100%;
    max-width: 350px;
    /* margin: 150px auto; removed fixed margin, component will be positioned by parent */
    border-collapse: collapse;
    border-spacing: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Consistent shadow with other components */
    background-color: white;
    border-radius: 0.75rem; /* Consistent border-radius */
    overflow: hidden; /* Ensures border-radius applies to content */
    font-family: 'Arial', sans-serif; /* Consistent font */
`;

// Styled table cells
const TableCell = styled.td`
    padding: 0.75rem 1rem; /* Consistent padding */
    vertical-align: middle;
    text-align: center;
    border-bottom: 1px solid #ddd; /* Light border */
    color: #333; /* Darker text color */
    font-size: 1rem;

    &:first-child {
        font-weight: 500; /* Label font weight */
        white-space: nowrap; /* Prevent label wrapping */
    }

    &:last-child {
        border-bottom: none; /* No border for the last cell in the tbody */
    }
`;

// Styled input field
const StyledInput = styled.input`
    width: calc(100% - 16px); /* Adjust width for padding */
    padding: 0.6rem 0.8rem;
    border: 1px solid #ccc;
    border-radius: 0.375rem;
    outline: none;
    box-sizing: border-box; /* Include padding in element's total width and height */
    font-size: 1rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus {
        border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3);
    }
`;

const StyledCheckbox = styled.input`
    transform: scale(1.5); /* 放大复选框使其更易于点击 */
    margin-right: 8px; /* 调整与右侧边缘的距离 */
    cursor: pointer;
`;

// Styled button
const StyledButton = styled.button`
    display: block;
    width: calc(100% - 2rem); /* Adjusted width to account for cell padding */
    margin: 0.75rem auto; /* Center button and provide vertical margin */
    padding: 0.8rem 1.25rem;
    background-color: #007bff;
    color: white;
    font-size: 1rem;
    font-weight: 600; /* Consistent font weight */
    border: none;
    border-radius: 0.5rem; /* Consistent border-radius */
    cursor: pointer;
    text-align: center;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* Consistent shadow */

    &:hover,
    &:focus {
        background-color: #0056b3;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
        transform: translateY(-2px);
        outline: none;
    }

    &:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
`;
