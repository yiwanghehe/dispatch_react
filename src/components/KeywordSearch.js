import React, { useState } from 'react';
import AddPoi from './AddPoi';
import apiImpl from './api/apiImpl';
import styled from 'styled-components'; // 导入 styled-components

export default function KeywordSearch() {
  const [keywords, setKeywords] = useState('电子科技大学');
  const [region, setRegion] = useState('成都市');
  const [pageSize, setPageSize] = useState(10);
  const [pageNum, setPageNum] = useState(1);
  const [allPois, setAllPois] = useState([]);
  const [selectedPois, setSelectedPois] = useState([]);
  const [addPoisVisible, setAddPoisVisible] = useState(false);

  const handleSearch = async () => {
    await apiImpl.keywordSearch(
        keywords,
        region,
        pageSize,
        pageNum
    ).then(res => {
      if (res && res.code === 200) {
        setAllPois(res.data.pois);
        setSelectedPois([]);
        setPageNum(prev => prev + 1);
        setAddPoisVisible(true);
      }
    });
  };

  return (
      <div style={mainContainerStyle}>
        <div style={keywordSearchContainerStyle}>
          <h2 style={keywordSearchTitleStyle}>关键字搜索</h2>
          <table style={tableStyle}>
            <tbody>
            <tr>
              <td style={tableCellLabelStyle}>关键字</td>
              <td>
                <StyledInput /* 使用 StyledInput 组件 */
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="输入关键字"
                />
              </td>
            </tr>
            <tr>
              <td style={tableCellLabelStyle}>搜索区划</td>
              <td>
                <StyledInput /* 使用 StyledInput 组件 */
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="可输入citycode,adcode,cityname"
                />
              </td>
            </tr>
            <tr>
              <td style={tableCellLabelStyle}>每页数据条数</td>
              <td>
                <StyledInput /* 使用 StyledInput 组件 */
                    type="number"
                    value={pageSize}
                    onChange={(e) => setPageSize(parseInt(e.target.value) || 10)}
                    placeholder="取值1-25,默认10"
                    min="1"
                    max="25"
                />
              </td>
            </tr>
            <tr>
              <td style={tableCellLabelStyle}>页码</td>
              <td>
                <StyledInput /* 使用 StyledInput 组件 */
                    type="number"
                    value={pageNum}
                    onChange={(e) => setPageNum(parseInt(e.target.value) || 1)}
                    placeholder="默认1"
                    min="1"
                />
              </td>
            </tr>
            <tr>
              <td colSpan="2" style={searchButtonContainerStyle}>
                <StyledSearchButton
                    onClick={handleSearch}
                >
                  <span>搜索</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                  </svg>
                </StyledSearchButton>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        {addPoisVisible && (
            <div style={addPoiWrapperStyle}>
              <AddPoi
                  allPois={allPois}
                  selectedPois={selectedPois}
                  setSelectedPois={setSelectedPois}
              />
            </div>
        )}
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

const keywordSearchContainerStyle = {
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

const keywordSearchTitleStyle = {
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

const searchButtonContainerStyle = {
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
const StyledSearchButton = styled.button`
  width: 80%;
  margin: 0 auto; /* Ensures button is centered if its width is less than container */
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

  &:hover { /* styled-components 支持直接使用 CSS 伪类 */
    background-color: #0056b3; /* 深蓝色 */
    transform: translateY(-2px); /* 向上微移 */
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.4); /* 焦点光圈 */
  }

  &:active { /* 添加点击效果 */
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }
`;

// 使用 styled-components 定义样式化的输入框
const StyledInput = styled.input`
  width: 80%; /* Adjusted width */
  padding: 0.6rem 0.8rem;
  border: 1px solid #ccc;
  border-radius: 0.375rem;
  outline: none; /* Remove default outline */
  font-size: 1.05rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease; /* Smooth transition for focus effects */

  &:focus {
    border-color: #007bff; /* Change border color on focus */
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3); /* Add a subtle blue glow on focus */
  }
`;

