import React, {useEffect, useState} from 'react';
import AddPoi from './AddPoi';
import apiImpl from './api/apiImpl';
import styled from 'styled-components'; // 导入 styled-components

export default function AddTask({pD}) {
    const [taskName, setTaskName] = useState('运输货物');
    // 将 origin 和 destination 初始化为空字符串，等待用户选择
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [goodWeight, setGoodWeight] = useState(0);
    const [goodVolume, setGoodVolume] = useState(0);

    useEffect(() => {
        console.log("pD 更新:", pD);
        // 如果 pD 有数据，可以考虑设置默认的 origin/destination
        if (pD && pD.length > 0) {
            // 可以选择第一个作为默认值，或者不设置，让用户选择
            // setOrigin(`${pD[0].poi_lon},${pD[0].poi_lat}`);
            // setDestination(`${pD[0].poi_lon},${pD[0].poi_lat}`);
        }
    }, [pD]);

    // 处理 origin 下拉选择框的变化
    const handleOriginChange = (e) => {
        const selectedPoiName = e.target.value;
        const selectedPoi = pD.find(poi => poi.poi_name === selectedPoiName);
        if (selectedPoi) {
            setOrigin(`${selectedPoi.poi_lon},${selectedPoi.poi_lat}`);
        } else {
            setOrigin(''); // 如果没有匹配到，则清空
        }
    };

    // 处理 destination 下拉选择框的变化
    const handleDestinationChange = (e) => {
        const selectedPoiName = e.target.value;
        const selectedPoi = pD.find(poi => poi.poi_name === selectedPoiName);
        if (selectedPoi) {
            setDestination(`${selectedPoi.poi_lon},${selectedPoi.poi_lat}`);
        } else {
            setDestination(''); // 如果没有匹配到，则清空
        }
    };

    const handleAdd = async () => {
        // 在发送请求前，检查 origin 和 destination 是否已选择
        if (!origin || !destination) {
            alert('请选择装货地和卸货地！');
            return;
        }

        await apiImpl.addDispatchTask(
            taskName,
            origin,
            destination,
            goodWeight,
            goodVolume
        ).then(res => {
            if (res && res.code === 200) {
                console.log("任务添加成功:", res.data);
                // 清空输入框
                setTaskName('');
                setOrigin(''); // 清空选择
                setDestination(''); // 清空选择
                setGoodWeight(0);
                setGoodVolume(0);
            }
        });
    };

    return (
        <div style={mainContainerStyle}>
            <div style={addTaskContainerStyle}>
                <h2 style={addTaskTitleStyle}>添加任务</h2>
                <table style={tableStyle}>
                    <tbody>
                    <tr>
                        <td style={tableCellLabelStyle}>任务名称</td>
                        <td>
                            <StyledInput
                                type="text"
                                value={taskName}
                                onChange={(e) => setTaskName(e.target.value)}
                                placeholder="输入任务名称"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td style={tableCellLabelStyle}>装货地</td>
                        <td>
                            <StyledSelect onChange={handleOriginChange} value={pD.find(poi => `${poi.poi_lon},${poi.poi_lat}` === origin)?.poi_name || ''}>
                                <option value="">请选择装货地</option>
                                {pD.map((poi, index) => (
                                    <option key={index} value={poi.poi_name}>
                                        {poi.poi_name}
                                    </option>
                                ))}
                            </StyledSelect>
                        </td>
                    </tr>
                    <tr>
                        <td style={tableCellLabelStyle}>卸货地</td>
                        <td>
                            <StyledSelect onChange={handleDestinationChange} value={pD.find(poi => `${poi.poi_lon},${poi.poi_lat}` === destination)?.poi_name || ''}>
                                <option value="">请选择卸货地</option>
                                {pD.map((poi, index) => (
                                    <option key={index} value={poi.poi_name}>
                                        {poi.poi_name}
                                    </option>
                                ))}
                            </StyledSelect>
                        </td>
                    </tr>
                    <tr>
                        <td style={tableCellLabelStyle}>货物重量</td>
                        <td>
                            <StyledInput
                                type="number"
                                value={goodWeight}
                                onChange={(e) => setGoodWeight(parseInt(e.target.value))}
                                placeholder="货物重量"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td style={tableCellLabelStyle}>货物体积</td>
                        <td>
                            <StyledInput
                                type="number"
                                value={goodVolume}
                                onChange={(e) => setGoodVolume(parseInt(e.target.value))}
                                placeholder="货物体积"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2" style={addTaskButtonContainerStyle}>
                            <StyledAddTaskButton
                                onClick={handleAdd}
                            >
                                <span>添加</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                     strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="m21 21-4.3-4.3"/>
                                </svg>
                            </StyledAddTaskButton>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const mainContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: '2rem',
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
};

const addTaskContainerStyle = {
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '0.75rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxWidth: '26rem',
    minWidth: '22rem',
    border: '1px solid #e0e0e0',
};

const addTaskTitleStyle = {
    fontSize: '1.8rem',
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: '1.5rem',
    borderBottom: '2px solid #007bff',
    paddingBottom: '0.5rem',
};

const tableStyle = {
    width: '100%',
    textAlign: 'left',
    tableLayout: 'fixed',
};

const tableCellLabelStyle = {
    paddingTop: '0.75rem',
    paddingBottom: '0.75rem',
    paddingRight: '1rem',
    fontWeight: '500',
    color: '#555',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
};

const addTaskButtonContainerStyle = {
    paddingTop: '1.5rem',
    textAlign: 'center',
};

const addPoiWrapperStyle = {
    width: '100%',
    maxWidth: '28rem',
    minWidth: '24rem',
};

// --- Styled Components Definitions ---

// 使用 styled-components 定义样式化的搜索按钮
const StyledAddTaskButton = styled.button`
    width: 80%;
    margin: 0 auto;
    padding: 0.8rem 1.5rem;
    background-color: #007bff;
    color: white;
    font-weight: 600;
    border-radius: 0.5rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    cursor: pointer;
    border: none;

    &:hover {
        background-color: #0056b3;
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
    }

    &:focus {
        outline: none;
        box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.4);
    }

    &:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    }
`;

// 使用 styled-components 定义样式化的输入框
const StyledInput = styled.input`
    width: 80%;
    padding: 0.6rem 0.8rem;
    border: 1px solid #ccc;
    border-radius: 0.375rem;
    outline: none;
    font-size: 1.05rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus {
        border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3);
    }
`;

// 新增：使用 styled-components 定义样式化的下拉选择框
const StyledSelect = styled.select`
  width: 80%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 0.375rem;
  outline: none;
  font-size: 1.05rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background-color: white; /* 确保背景色为白色 */
  appearance: none; /* 移除默认的下拉箭头 */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='%23666' d='M10 12l-6-6 1.41-1.41L10 9.17l4.59-4.58L16 6z'/%3E%3C/svg%3E"); /* 自定义下拉箭头 */
  background-repeat: no-repeat;
  background-position: right 0.8rem center;
  background-size: 0.8em;
  cursor: pointer;

  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3);
  }
`;
