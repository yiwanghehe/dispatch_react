import React, {useEffect, useState} from 'react';
import apiImpl from "./api/apiImpl";
import styled from 'styled-components'; // 导入 styled-components

export default function AddPoi({ allPois, selectedPois, setSelectedPois }) {
  const [poiSimTypes, setPoiSimTypes] = useState([]);
  const [poiSimType, setPoiSimType] = useState('');

  // --- 初始数据PoiSimType获取 ---
  useEffect(() => {
    const fetchPoiSimType = async () => {
      await apiImpl.getAllSimType().then(res => {
        if (res && res.code === 200) {
          console.log(res);
          setPoiSimTypes(res.data);
        }
      });
    };
    fetchPoiSimType();
  }, []);

  const handleRowClick = (poi) => {
    setSelectedPois(prevSelectedPois => {
      const isSelected = prevSelectedPois.some(selectedPoi => selectedPoi.id === poi.id);
      if (isSelected) {
        return prevSelectedPois.filter(selectedPoi => selectedPoi.id !== poi.id);
      } else {
        return [...prevSelectedPois, poi];
      }
    });
  };

  const handlePoiSimTypeChange = (event) => {
    setPoiSimType(event.target.value);
  };

  const handleAdd = async () => {
    console.log(poiSimType)
    await apiImpl.addPois(selectedPois, poiSimType)
        .then(res => {
          if (res && res.code === 200) {
            console.log("成功添加 POI");
          } else {
            console.error("添加 POI 失败:", res);
          }
        })
        .catch(error => {
          console.error("添加 POI 时发生错误:", error);
        });
  };

  return (
      <div style={addPoiContainerStyle}>
        <h2 style={addPoiTitleStyle}>选择标记点</h2>
        <div style={poiListContainerStyle}>
          <table style={poiTableStyle}>
            <tbody>
            {allPois.length > 0 ? (
                allPois.map(poi => (
                    <tr
                        key={poi.id}
                        onClick={() => handleRowClick(poi)}
                        style={{
                          ...poiTableRowStyle,
                          backgroundColor: selectedPois.some(selectedPoi => selectedPoi.id === poi.id) ? '#e6f7ff' : 'transparent'
                        }}
                    >
                      <td style={poiTableCellStyle}>
                        <input
                            type="checkbox"
                            checked={selectedPois.some(selectedPoi => selectedPoi.id === poi.id)}
                            onChange={() => {}}
                            style={checkboxStyle}
                        />
                        <div>
                          <div style={poiNameStyle}>{poi.name}</div>
                          <div style={poiLocationStyle}>{poi.location}</div>
                        </div>
                      </td>
                    </tr>
                ))
            ) : (
                <tr>
                  <td colSpan="1" style={noPoiMessageCellStyle}>
                    <p style={noPoiMessageStyle}>没有可用的POI数据，请先搜索。</p>
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>

        <div style={addButtonContainerStyle}>
          <select
              value={poiSimType}
              onChange={handlePoiSimTypeChange}
              style={selectTypeStyle} // (这个样式在下一步添加)
          >
            <option value="" disabled>-- 请选择POI类型 --</option>
            {poiSimTypes.map(type => (
                // 注意: 根据你的数据结构修改 'type.id' 和 'type.typeName'
                <option key={type} value={type}>
                  {type}
                </option>
            ))}
          </select>

          <StyledAddButton // 使用 styled-components 组件
              onClick={handleAdd}
              disabled={selectedPois.length === 0}
          >
            <span>添加选中的POI</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <path d="m9 11 3 3L22 4"/>
            </svg>
          </StyledAddButton>
        </div>
      </div>
  );
}

// 以下样式保持不变
const addPoiContainerStyle = {
  padding: '1.5rem',
  backgroundColor: '#f8f9fa',
  borderRadius: '0.75rem',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  maxWidth: '28rem',
  minWidth: '24rem',
  border: '1px solid #e0e0e0',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const addPoiTitleStyle = {
  fontSize: '1.6rem',
  fontWeight: '600',
  color: '#333',
  textAlign: 'center',
  marginBottom: '1rem',
  borderBottom: '2px solid #28a745',
  paddingBottom: '0.5rem',
};

const poiListContainerStyle = {
  maxHeight: '22rem',
  overflowY: 'auto',
  marginBottom: '1.5rem',
  border: '1px solid #ddd',
  borderRadius: '0.5rem',
  backgroundColor: 'white',
  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
};

const poiTableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
};

const poiTableRowStyle = {
  cursor: 'pointer',
  transition: 'background-color 0.15s ease-in-out',
  borderBottom: '1px solid #eee',
};

const poiTableCellStyle = {
  padding: '0.8rem 1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.8rem',
};

const checkboxStyle = {
  height: '1.1rem',
  width: '1.1rem',
  accentColor: '#28a745',
  borderRadius: '0.25rem',
  border: '1px solid #999',
  cursor: 'pointer',
};

const poiNameStyle = {
  fontWeight: '600',
  color: '#222',
  fontSize: '1rem',
};

const poiLocationStyle = {
  fontSize: '0.85rem',
  color: '#666',
  marginTop: '0.2rem',
};

const noPoiMessageCellStyle = {
  padding: '2rem',
  textAlign: 'center',
};

const noPoiMessageStyle = {
  color: '#888',
  fontSize: '1rem',
};

const addButtonContainerStyle = {
  textAlign: 'center',
  marginTop: '1rem',
};
// 使用 styled-components 定义样式化的添加按钮
const StyledAddButton = styled.button`
  width: 80%;
  margin: 0 auto;
  padding: 0.8rem 1.5rem;
  background-color: #28a745; /* 绿色背景 */
  color: white;
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
    background-color: #218838; /* 深绿色 */
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 4px rgba(40, 167, 69, 0.4); /* 焦点光圈 */
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    background-color: #cccccc; /* 禁用状态的颜色 */
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;

const selectTypeStyle = {
  width: '80%',
  padding: '0.7rem',
  marginBottom: '1rem',
  borderRadius: '0.5rem',
  border: '1px solid #ccc',
  fontSize: '1rem',
  backgroundColor: 'white',
  cursor: 'pointer',
  textAlign: 'center'
};
