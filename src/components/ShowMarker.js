// ShowMarker.js
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import apiImpl from "./api/apiImpl";
import styled from 'styled-components';

export default function ShowMarker({ pD, setPD }) {
  const [pois, setPois] = useState([]);
  const [selectedPois, setSelectedPois] = useState([]); // 这个状态需要与 pD 同步
  const [selectAll, setSelectAll] = useState(false);
  const markers = useRef({});
  const [searchQuery, setSearchQuery] = useState('');

  // --- 初始数据获取 ---
  useEffect(() => {
    const fetchPois = async () => {
      try {
        console.log("ShowMarker: 正在获取所有POI...");
        const res = await apiImpl.getAllPois();
        if (res && res.code === 200) {
          setPois(res.data);
          console.log("ShowMarker: POI获取成功，数量:", res.data.length);
        }
      } catch (error) {
        console.error("ShowMarker: 获取POI时出错:", error);
      }
    };
    fetchPois();
  }, []);

  // --- 关键修改 1: 同步 `selectedPois` 与 `pD` ---
  // 当父组件的 pD prop 变化时，更新 ShowMarker 内部的 selectedPois 状态
  // 这确保了从 CreateFactory 添加的 POI 也能在 ShowMarker 中显示为已选
  useEffect(() => {
    // console.log("ShowMarker: pD prop 已更新，同步 selectedPois...", pD);
    // 使用新的数组引用来确保状态更新被 React 检测到
    setSelectedPois([...pD]);
    console.log(pD);
  }, [pD]); // 依赖 pD，当 pD 引用变化时触发

  // --- 性能优化点 2: 使用 useMemo 缓存过滤后的 POI 列表 ---
  const filteredPois = useMemo(() => {
    return pois.filter(poi =>
        poi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poi.sim_type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pois, searchQuery]);

  // `createMarker` 辅助函数：仅用于更新内部 `markers.current` ref
  const createMarker = useCallback((poi) => {
    markers.current[poi.id] = poi;
  }, []);

  // `operateMarker` 函数：用于单个 POI 的添加/移除操作
  const operateMarker = useCallback((poi, operation) => {
    setPD(prevPD => {
      let newPD;
      if (operation === 'remove') {
        newPD = prevPD.filter(p => p.id !== poi.id);
        if (markers.current[poi.id]) {
          delete markers.current[poi.id];
        }
      } else if (operation === 'add') {
        if (!prevPD.some(p => p.id === poi.id)) {
          newPD = [...prevPD, poi];
          createMarker(poi);
        } else {
          newPD = prevPD;
        }
      } else {
        newPD = prevPD;
      }
      return newPD;
    });
  }, [setPD, createMarker]);

  // `handleCheckboxChange` 函数：处理单个复选框的改变
  const handleCheckboxChange = useCallback((event, poi) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      // 当勾选时，通过 operateMarker 更新 pD，然后上面的 useEffect 会同步 selectedPois
      operateMarker(poi, 'add');
    } else {
      // 当取消勾选时，通过 operateMarker 更新 pD，然后上面的 useEffect 会同步 selectedPois
      operateMarker(poi, 'remove');
    }
    // 注意: 这里不再直接调用 setSelectedPois，因为它会由 pD 的变化统一同步
  }, [operateMarker]);

  // `handleSelectAll` 函数：处理“全选”复选框的改变
  const handleSelectAll = useCallback((event) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);

    setPD(prevPD => {
      let updatedPD = [...prevPD];

      if (isChecked) {
        filteredPois.forEach(poi => {
          if (!updatedPD.some(p => p.id === poi.id)) {
            updatedPD.push(poi);
            createMarker(poi);
          }
        });
      } else {
        // 取消全选时，只移除当前 filteredPois 中的项
        updatedPD = updatedPD.filter(p => !filteredPois.some(fp => fp.id === p.id));
        filteredPois.forEach(poi => {
          if (markers.current[poi.id]) {
            delete markers.current[poi.id];
          }
        });
      }
      return updatedPD;
    });
    // 注意: 这里也不再直接调用 setSelectedPois，它会由 pD 的变化统一同步
  }, [filteredPois, createMarker, setPD]);

  // `handleSearchChange` 函数：处理搜索框输入
  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  // --- 统一管理 `selectAll` 状态的副作用 ---
  useEffect(() => {
    if (filteredPois.length > 0) {
      // 检查当前过滤后的 POI 是否都在 selectedPois 中
      const allFilteredSelected = filteredPois.every(poi =>
          selectedPois.some(selectedPoi => selectedPoi.id === poi.id)
      );
      setSelectAll(allFilteredSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedPois, filteredPois]);

  // `handleRowClick` 函数：处理行点击事件
  const handleRowClick = useCallback((poi) => {
    const isCurrentlySelected = selectedPois.some(selectedPoi => selectedPoi.id === poi.id);
    const syntheticEvent = { target: { checked: !isCurrentlySelected } };
    handleCheckboxChange(syntheticEvent, poi);
  }, [selectedPois, handleCheckboxChange]);

  return (
      <ShowMarkerContainer>
        <SearchInput
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="搜索 POI"
        />

        <CheckboxLabel>
          <StyledCheckbox
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
          />
          全选
        </CheckboxLabel>

        <PoisListContainer>
          <PoisTable>
            <tbody>
            {filteredPois.map(poi => (
                <PoisTableRow
                    key={poi.id}
                    onClick={() => handleRowClick(poi)}
                    role="row"
                >
                  <PoisTableCell>
                    <StyledCheckbox
                        type="checkbox"
                        // 这里的 checked 状态现在直接依赖 selectedPois
                        checked={selectedPois.some(selectedPoi => selectedPoi.id === poi.id)}
                        onChange={(e) => handleCheckboxChange(e, poi)}
                        onClick={(e) => e.stopPropagation()}
                        value={poi.id}
                    />
                    <div>
                      <PoiName>{poi.name}</PoiName>
                      <PoiLocation>{poi.lng}, {poi.lat}</PoiLocation>
                    </div>
                  </PoisTableCell>
                </PoisTableRow>
            ))}
            {filteredPois.length === 0 && (
                <tr>
                  <NoPoisMessage colSpan="1">无匹配 POI 数据</NoPoisMessage>
                </tr>
            )}
            </tbody>
          </PoisTable>
        </PoisListContainer>
      </ShowMarkerContainer>
  );
}

// --- Styled Components Definitions (保持不变) ---
const ShowMarkerContainer = styled.div`
  padding: 1.5rem;
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.15), 0 4px 8px -2px rgba(0, 0, 0, 0.08);
  color: #1f2937;
  transition: all 0.3s ease-in-out;
  font-family: 'Inter', sans-serif;
  width: 100%;
  max-width: 28rem;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
`;

const SearchInput = styled.input`
  width: 80%;
  padding: 0.875rem 1.25rem;
  margin-bottom: 1.25rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  font-size: 1rem;
  line-height: 1.5rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  cursor: pointer;
  color: #4a5568;
  user-select: none;
  font-size: 1rem;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: #2563eb;
  }
`;

const StyledCheckbox = styled.input`
  margin-right: 0.75rem;
  height: 1.25rem;
  width: 1.25rem;
  border-radius: 0.25rem;
  accent-color: #2563eb;
  border: 1px solid #d1d5db;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
  }
`;

const PoisListContainer = styled.div`
  max-height: 28rem;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
  background-color: #f9fafb;
  padding: 0.75rem;
`;

const PoisTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 0.75rem;
`;

const PoisTableRow = styled.tr`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.07);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  padding: 1rem;
  margin-left: 0.5rem;
  margin-right: 0.5rem;

  &:hover {
    background-color: #e0f2fe;
  }
  &:focus-within {
    background-color: #e0f2fe;
    outline: none;
  }
`;

const PoisTableCell = styled.td`
  display: flex;
  align-items: center;
  width: 100%;
`;

const PoiName = styled.div`
  font-weight: 600;
  font-size: 1.125rem;
  color: #111827;
`;

const PoiLocation = styled.div`
  font-size: 0.875rem;
  color: #4b5563;
  margin-top: 0.25rem;
`;

const NoPoisMessage = styled.td`
  text-align: center;
  padding: 1.5rem 0;
  color: #6b7280;
  font-style: italic;
`;
