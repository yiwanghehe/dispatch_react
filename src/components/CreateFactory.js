// CreateFactory.js
import React from 'react';
import apiImpl from "./api/apiImpl";
import styled from 'styled-components';

// 接收 setPD 作为 prop
export default function CreateFactory({ setPD }) {
    async function createFactoryHandler() {
        try {
            const res = await apiImpl.createFactory();

            if (res && res.code === 200) {
                console.log("创建工厂成功 - 原始 res.data:", res.data);

                const newPoisFromFactories = [];

                // --- 核心逻辑修改: 处理 res.data 为对象结构 ---
                let factoriesToProcess = [];
                if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
                    // 如果 res.data 是一个对象 (如 {1: {...}, 2: {...}})
                    factoriesToProcess = Object.values(res.data.factoryMap); // 提取所有值 (即工厂对象)
                } else {
                    console.warn("API 返回的 res.data 格式不符合预期 (既不是对象也不是数组):", res.data);
                    return; // 格式不正确则直接返回
                }

                factoriesToProcess.forEach(factory => {
                    // 检查每个 `factory` 是否有效，并且 `poiData` 字段是否存在且是一个对象 (不是数组)
                    if (factory && factory.poiData && typeof factory.poiData === 'object' && !Array.isArray(factory.poiData)) {
                        newPoisFromFactories.push(factory.poiData);
                    } else {
                        // 这个警告现在会更准确地指示哪个'factory'对象有问题
                        console.warn("工厂对象中未找到有效 poiData 或其格式不正确 (此工厂):", factory);
                    }
                });

                // 使用函数式更新 setPD，确保基于最新的状态进行更新
                setPD(prevPD => {
                    // 过滤掉已存在的 POI，避免重复添加。确保 POI 具有有效的 ID。
                    const uniqueNewPois = newPoisFromFactories.filter(newPoi =>
                        newPoi && newPoi.id && !prevPD.some(existingPoi => existingPoi && existingPoi.id === newPoi.id)
                    );

                    if (uniqueNewPois.length > 0) {
                        const updatedPD = [...prevPD, ...uniqueNewPois];
                        console.log("CreateFactory - 更新 pD，新增 POI 数量:", uniqueNewPois.length, "总 pD 数量:", updatedPD.length);
                        return updatedPD;
                    }
                    return prevPD; // 如果没有新的唯一 POI，则不改变 pD 状态
                });

            } else {
                console.error("创建工厂失败，API 响应码或数据不正确:", res);
            }
        } catch (error) {
            console.error("创建工厂请求出错:", error);
        }
    }

    return (
        <FactoryTable>
            <tbody>
            <tr>
                <TitleCell>创建工厂</TitleCell>
            </tr>
            <tr>
                <TableCell colSpan="2">
                    <GenerateFactoryButton onClick={createFactoryHandler}>
                        生成初始工厂
                    </GenerateFactoryButton>
                </TableCell>
            </tr>
            </tbody>
        </FactoryTable>
    );
}

// --- Styled Components Definitions (保持不变) ---
const FactoryTable = styled.table`
    width: 100%;
    max-width: 350px;
    margin: 0 auto;
    border-collapse: collapse;
    border-spacing: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
`;

const TableCell = styled.td`
    padding: 16px 8px;
    vertical-align: middle;
    text-align: center;
    border-bottom: 1px solid #ddd;

    &:last-child {
        border-bottom: none;
    }
`;

const TitleCell = styled(TableCell)`
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
    padding-bottom: 20px;
`;

const GenerateFactoryButton = styled.button`
    display: block;
    width: 100%;
    padding: 12px;
    background-color: #007bff;
    color: white;
    font-size: 16px;
    font-weight: 500;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    text-align: center;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &:hover,
    &:focus {
        background-color: #0056b3;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transform: translateY(-1px);
        outline: none;
    }

    &:active {
        transform: translateY(0);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
    }
`;
