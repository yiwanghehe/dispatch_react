import React, {useEffect, useRef, useState} from 'react';
import AMapLoader from "@amap/amap-jsapi-loader";
import initPathSimplifier from "../ui/PathSimplifier";
import initPointSimplifier from "../ui/PointSimplifier";
import ShowMarker from "../components/ShowMarker";
import KeywordSearch from "../components/KeywordSearch";
import styled from 'styled-components';
import CreateFactory from "../components/CreateFactory";
import StartRunning from "../components/StartRunning";
import ShowVehicleStatus from "../components/ShowVehicleStatus";
import EventBus from "../utils/eventBus";
import AddTask from "../components/AddTask";
import ShowDispatchResult from "../components/ShowDispatchResult";

export default function Map() {

    // AMap 控件可见性的状态
    const [scaleVisible, setScaleVisible] = useState(false);
    const [toolBarVisible, setToolBarVisible] = useState(false);
    const [controlBarVisible, setControlBarVisible] = useState(false);
    const [hawkEyeVisible, setHawkEyeVisible] = useState(false);

    // 自定义组件可见性的状态
    const [keywordSearchVisible, setKeywordSearchVisible] = useState(false);
    const [showMarkerVisible, setShowMarkerVisible] = useState(false);
    const [createFactoryVisible, setCreateFactoryVisible] = useState(false);
    const [addTaskVisible, setAddTaskVisible] = useState(false);
    const [startRunningVisible, setStartRunningVisible] = useState(false);
    const [showVehicleStatusVisible, setShowVehicleStatusVisible] = useState(false);
    const [singleVehicleKeyToDisplay, setSingleVehicleKeyToDisplay] = useState(null);
    const [isSingleVehiclePanelVisible, setIsSingleVehiclePanelVisible] = useState(false);
    const [showDispatchResultVisible, setShowDispatchResultVisible] = useState(false);

    // 控制卡片展开/收缩
    const [controlCardExpanded, setControlCardExpanded] = useState(false);
    // 控制所有车辆状态展开/收缩
    const [vehicleStatusExpanded, setVehicleStatusExpanded] = useState(false);
    const [vehicleStatusIsPinned, setVehicleStatusIsPinned] = useState(false);

    // 用于保存 AMap 控件实例和地图实例的 Refs
    const mapInstance = useRef(null);
    const scaleControl = useRef(null);
    const toolBarControl = useRef(null);
    const controlBarControl = useRef(null);
    const hawkEyeControl = useRef(null);

    // 保存ShowMarker管理的标记的POI数据
    const [pD, setPD] = useState([]);
    // 用于保存 路径数据 和 导航ID 的状态
    const [myPath, setMyPath] = useState({});
    const [navigationId, setNavigationId] = useState({});
    // 用于保存车辆的状态
    const [vehicleStatus, setVehicleStatus] = useState([
        {
            "id": 12,
            "plateNumber": "苏C1004中",
            "typeId": 2,
            "status": "IDLE",
            "currentLng": "117.706775",
            "currentLat": "34.108575",
            "currentDemandId": null,
            "lastUpdateTime": null,
            "traveledPolyline": null,
            "totalShippingVolume": null,
            "totalShippingWeight": null,
            "routeDistance": 0, // 任务预计距离
            "routeDuration": 0, // 任务预计时间
            "waitingDuration": 0,
            "loadDistance": 0,
            "loadDuration": 0,
            "noLoadDistance": 0,
            "noLoadDuration": 0,
            "maxLoadWeight": 0,
            "currentLoad": 0,
            "wastedLoad": 0,
            // 新加的字段
            "originName": null,
            "destinationName": null
        },]);

    // 用于 PathSimplifier/PointSimplifier 实例的 Ref
    const pathSimplifierInsRef = useRef(null);
    const pointSimplifierInsRef = useRef(null);

    // Toggle functions for AMap controls
    const toggleScale = () => {
        setScaleVisible(prev => {
            const newState = !prev;
            if (scaleControl.current) {
                newState ? scaleControl.current.show() : scaleControl.current.hide();
            }
            return newState;
        });
    };
    const toggleToolBar = () => {
        setToolBarVisible(prev => {
            const newState = !prev;
            if (toolBarControl.current) {
                newState ? toolBarControl.current.show() : toolBarControl.current.hide();
            }
            return newState;
        });
    };
    const toggleControlBar = () => {
        setControlBarVisible(prev => {
            const newState = !prev;
            if (controlBarControl.current) {
                newState ? controlBarControl.current.show() : controlBarControl.current.hide();
            }
            return newState;
        });
    };
    const toggleHawkEye = () => {
        setHawkEyeVisible(prev => {
            const newState = !prev;
            if (hawkEyeControl.current) {
                newState ? hawkEyeControl.current.show() : hawkEyeControl.current.hide();
            }
            return newState;
        });
    };

    // Toggle functions for custom components
    const toggleKeywordSearch = () => setKeywordSearchVisible(prev => !prev);
    const toggleShowMarker = () => setShowMarkerVisible(prev => !prev);
    const toggleCreateFactory = () => setCreateFactoryVisible(prev => !prev);
    const toggleAddTask = () => setAddTaskVisible(prev => !prev);
    const toggleStartRunning = () => setStartRunningVisible(prev => !prev);
    const toggleShowVehicleStatus = () => setShowVehicleStatusVisible(prev => !prev);
    const toggleShowDispatchResult = () => setShowDispatchResultVisible(prev => !prev);


    useEffect(() => {
        window._AMapSecurityConfig = {
            securityJsCode: "2c57a2993e6615070ed0b4a373fe5d7c",
        };

        AMapLoader.load({
            key: "a1459e41d9eaabe608d1bc5cebd27c4f",
            version: "2.0",
            plugins: ["AMap.Scale", "AMap.ToolBar", "AMap.ControlBar", "AMap.HawkEye"],
            AMapUI: {
                version: "1.1",
            }
        }).then((AMap) => {
            // 创建地图实例
            const map = new AMap.Map("container", {
                viewMode: "3D",
                zoom: 11,
                center: [116.684485, 34.594657]
            });
            mapInstance.current = map;
            window.map = map; // 根据原始 Vue 代码，也全局存储以供 AMapUI 访问

            // 创建并添加 AMap 控件
            scaleControl.current = new AMap.Scale({ visible: scaleVisible });
            toolBarControl.current = new AMap.ToolBar({
                visible: toolBarVisible,
                position: { top: '110px', right: '40px' },
            });
            controlBarControl.current = new AMap.ControlBar({
                visible: controlBarVisible,
                position: { top: '10px', right: '10px' },
            });
            hawkEyeControl.current = new AMap.HawkEye({ visible: hawkEyeVisible });

            map.addControl(scaleControl.current);
            map.addControl(toolBarControl.current);
            map.addControl(controlBarControl.current);
            map.addControl(hawkEyeControl.current);

            // 加载AMapUI组件库
            // eslint-disable-next-line no-undef
            AMapUI.load(['ui/misc/PathSimplifier', 'lib/$'], function(PathSimplifier, $) {
                if (!PathSimplifier.supportCanvas) {
                    // Replace alert with a more user-friendly message box if needed
                    console.warn('当前环境不支持 Canvas！PathSimplifier 将无法使用。');
                }
                // console.log('PathSimplifier loaded successfully.');
                // 初始化路径简化器
                pathSimplifierInsRef.current = initPathSimplifier(PathSimplifier, mapInstance.current);
            });

            //加载PointSimplifier
            // eslint-disable-next-line no-undef
            AMapUI.load(['ui/misc/PointSimplifier', 'lib/utils', 'lib/$'], function(PointSimplifier, utils, $) {
                if (!PointSimplifier.supportCanvas) {
                    // Replace alert with a more user-friendly message box if needed
                    console.warn('当前环境不支持 Canvas！PointSimplifier 将无法使用。');
                }
                // console.log('PointSimplifier loaded successfully.');
                pointSimplifierInsRef.current = initPointSimplifier(PointSimplifier, mapInstance.current, utils, $);
            });
        }).catch((e) => {
            console.error("AMap 加载错误:", e);
        });

        // 订阅事件
        const unsubscribe = EventBus.subscribe('showSingleVehicleStatus', (vehicleKey) => {
            setSingleVehicleKeyToDisplay(vehicleKey);
            setIsSingleVehiclePanelVisible(true);
        });

        // 订阅隐藏事件 (可选，你可以用同一个事件传递 null 来隐藏)
        const unsubscribeHide = EventBus.subscribe('hideSingleVehicleStatus', () => {
            setIsSingleVehiclePanelVisible(false);
            setSingleVehicleKeyToDisplay(null);
        });

        // 卸载时的清理函数
        return () => {
            // 清理订阅
            unsubscribe();
            unsubscribeHide();

            if (mapInstance.current) {
                mapInstance.current.destroy();
                mapInstance.current = null;
                // 如果 window.map 是由该组件设置的，则进行清理
                if (window.map === mapInstance.current) {
                    delete window.map;
                }
            }
        };
    }, []);

    useEffect(() => {
        if(pathSimplifierInsRef.current && pathSimplifierInsRef.current._updatePaths) {
            // 重新渲染 PathSimplifier
            pathSimplifierInsRef.current._updatePaths(myPath, navigationId);
            // console.log('PathSimplifier updated with new paths:', myPath);
        }
    }, [myPath]);

    useEffect(() => {
        if(pointSimplifierInsRef.current && pointSimplifierInsRef.current._updatePoints) {
            // 更新 PointSimplifier 数据
            pointSimplifierInsRef.current._updatePoints(pD);
        }
    }, [pD]);

    // Added to manage the mouse leave timer
    const leaveTimer = useRef(null);

    const handleMouseEnter = (setControlExpanded) => {
        // Clear any pending leave timer
        if (leaveTimer.current) {
            clearTimeout(leaveTimer.current);
            leaveTimer.current = null;
        }
        setControlExpanded(true);
    };

    const handleMouseLeave = (setControlExpanded, isPinned) => {
        if(isPinned) return; // 如果是固定状态，则不收起
        // Set a timer to retract the card after a short delay
        leaveTimer.current = setTimeout(() => {
            setControlExpanded(false);
        }, 300); // 300ms delay, adjust as needed
    };


    return (
        <div style={mapWrapperStyle}>
            {/* Map Container */}
            <div id="container" style={container}></div>

            {/* Input Card for Map Controls - 使用 StyledControlCard */}
            <StyledControlCard
                onMouseEnter={handleMouseEnter.bind(null, setControlCardExpanded)}
                onMouseLeave={handleMouseLeave.bind(null, setControlCardExpanded, false)}
                $expanded={controlCardExpanded} // 传递 expanded 状态给 styled component
            >
                <div style={sectionTitleStyle}>地图控件</div>
                {/* Checkbox for Scale */}
                <StyledCheckboxLabel>
                    <StyledCheckboxInput
                        type="checkbox"
                        checked={scaleVisible}
                        onChange={toggleScale}
                    />
                    比例尺
                </StyledCheckboxLabel>
                {/* Checkbox for ToolBar */}
                <StyledCheckboxLabel>
                    <StyledCheckboxInput
                        type="checkbox"
                        checked={toolBarVisible}
                        onChange={toggleToolBar}
                    />
                    工具条
                </StyledCheckboxLabel>
                {/* Checkbox for ControlBar */}
                <StyledCheckboxLabel>
                    <StyledCheckboxInput
                        type="checkbox"
                        checked={controlBarVisible}
                        onChange={toggleControlBar}
                    />
                    工具条方向盘
                </StyledCheckboxLabel>
                {/* Checkbox for HawkEye */}
                <StyledCheckboxLabel>
                    <StyledCheckboxInput
                        type="checkbox"
                        checked={hawkEyeVisible}
                        onChange={toggleHawkEye}
                    />
                    显示鹰眼
                </StyledCheckboxLabel>

                <StyledSeparator/> {/* Separator */}

                <div style={sectionTitleStyle}>自定义功能</div>
                {/* Checkbox for Keyword Search */}
                <StyledCheckboxLabel>
                    <StyledCheckboxInput
                        type="checkbox"
                        checked={keywordSearchVisible}
                        onChange={toggleKeywordSearch}
                    />
                    关键字搜索
                </StyledCheckboxLabel>
                {/* Checkbox for Show Marker */}
                <StyledCheckboxLabel>
                    <StyledCheckboxInput
                        type="checkbox"
                        checked={showMarkerVisible}
                        onChange={toggleShowMarker}
                    />
                    显示标记点
                </StyledCheckboxLabel>
                {/* Checkbox for Create Factory */}
                {/*<StyledCheckboxLabel>*/}
                {/*    <StyledCheckboxInput*/}
                {/*        type="checkbox"*/}
                {/*        checked={createFactoryVisible}*/}
                {/*        onChange={toggleCreateFactory}*/}
                {/*    />*/}
                {/*    生成工厂*/}
                {/*</StyledCheckboxLabel>*/}
                {/*<StyledCheckboxLabel>*/}
                {/*    <StyledCheckboxInput*/}
                {/*        type="checkbox"*/}
                {/*        checked={addTaskVisible}*/}
                {/*        onChange={toggleAddTask}*/}
                {/*    />*/}
                {/*    添加任务*/}
                {/*</StyledCheckboxLabel>*/}
                {/* Checkbox for Start Running */}
                <StyledCheckboxLabel>
                    <StyledCheckboxInput
                        type="checkbox"
                        checked={startRunningVisible}
                        onChange={toggleStartRunning}
                    />
                    派送车辆
                </StyledCheckboxLabel>
                {/* Checkbox for Show Vehicle Status */}
                <StyledCheckboxLabel>
                    <StyledCheckboxInput
                        type="checkbox"
                        checked={showVehicleStatusVisible}
                        onChange={toggleShowVehicleStatus}
                    />
                    所有车辆状态
                </StyledCheckboxLabel>
                <StyledCheckboxLabel>
                    <StyledCheckboxInput
                        type="checkbox"
                        checked={showDispatchResultVisible}
                        onChange={toggleShowDispatchResult}
                    />
                    调度结果(数据沙箱)
                </StyledCheckboxLabel>
            </StyledControlCard>

            {/* Conditional Component Rendering - Overlay Panels */}
            <div style={{
                ...overlayPanelStyle,
                width: '80%',
                maxWidth: '400px',
                minWidth: '200px',
                visibility: keywordSearchVisible ? 'visible' : 'hidden',
                opacity: keywordSearchVisible ? 1 : 0,
                pointerEvents: keywordSearchVisible ? 'auto' : 'none',
                transition: 'visibility 0s, opacity 0.3s ease-in-out'
            }}>
                <KeywordSearch/>
            </div>

            <div style={{
                ...overlayPanelStyle,
                width: '80%',
                maxWidth: '600px',
                maxHeight: '800px',
                overflowY: 'auto',
                visibility: showMarkerVisible ? 'visible' : 'hidden',
                opacity: showMarkerVisible ? 1 : 0,
                pointerEvents: showMarkerVisible ? 'auto' : 'none',
                transition: 'visibility 0s, opacity 0.3s ease-in-out'
            }}>
                <ShowMarker pD={pD} setPD={setPD}/>
            </div>

            {createFactoryVisible && (
                <div style={{...overlayPanelStyle, width: '80%', maxWidth: '400px', minWidth: '200px'}}>
                    <CreateFactory setPD={setPD}/>
                </div>
            )}

            {addTaskVisible && (
                <div style={{...overlayPanelStyle, width: '80%', maxWidth: '400px', minWidth: '200px'}}>
                    <AddTask pD={pD}/>
                </div>
            )}

            {showDispatchResultVisible && (
                <div style={{...overlayPanelStyle,
                    width: '100%',
                    maxWidth: '1000px',
                    minWidth: '200px',
                    height: '80%',
                    maxHeight: '800px',
                    overflowY: 'auto',
                }}>
                    <ShowDispatchResult vehicleStatus={vehicleStatus}/>
                </div>
            )}

            <div style={{
                ...overlayPanelStyle,
                width: '80%',
                maxWidth: '400px',
                minWidth: '200px',
                overflowY: 'auto',
                visibility: startRunningVisible ? 'visible' : 'hidden',
                opacity: startRunningVisible ? 1 : 0,
                pointerEvents: startRunningVisible ? 'auto' : 'none',
                transition: 'visibility 0s, opacity 0.3s ease-in-out'
            }}>
                <StartRunning vehicleStatus={vehicleStatus} setVehicleStatus={setVehicleStatus} setNavigationId={setNavigationId}
                              setMyPath={setMyPath}/>
            </div>

            <StyledVehicleStatusCard
                onMouseEnter={handleMouseEnter.bind(null, setVehicleStatusExpanded)}
                onMouseLeave={handleMouseLeave.bind(null, setVehicleStatusExpanded, vehicleStatusIsPinned)}
                $expanded={vehicleStatusExpanded}>

                <div style={{
                    // 确保这个 div 内部的内容不会干扰 PinButton 的布局
                    ...allVehicleStatusStyle,
                    visibility: showVehicleStatusVisible ? 'visible' : 'hidden',
                    opacity: showVehicleStatusVisible ? 1 : 0,
                    pointerEvents: showVehicleStatusVisible ? 'auto' : 'none',
                    transition: 'visibility 0s, opacity 0.3s ease-in-out',
                    display: 'flex', /* 添加 flex 布局 */
                    flexDirection: 'column', /* 垂直排列 */
                    alignItems: 'center', /* 水平居中 */
                    justifyContent: 'flex-start', /* 顶部对齐 */
                    width: '100%', /* 确保 div 宽度足够 */
                }}>
                    <PinButton
                        onClick={() => setVehicleStatusIsPinned(prev => !prev)}
                        $isPinned={vehicleStatusIsPinned}
                    >
                        {/* 移除 svg 的 viewBox，因为它应该由 svg 标签本身定义，而不是样式 */}
                        <span role="img" aria-label="pin">{vehicleStatusIsPinned ? '📌' : '📍'}</span>
                        {vehicleStatusIsPinned ? '取消固定' : '固定面板'}
                    </PinButton>
                    <ShowVehicleStatus vehicleStatus={vehicleStatus}/>
                </div>
            </StyledVehicleStatusCard>

            <div style={{
                ...overlayPanelStyle,
                // position:'relative',
                width: '80%',
                maxWidth: '400px',
                minWidth: '200px',
                maxHeight: '80vh',
                // overflowY: 'auto',
                visibility: isSingleVehiclePanelVisible ? 'visible' : 'hidden', // 只根据这个状态控制可见性
                opacity: isSingleVehiclePanelVisible ? 1 : 0,
                pointerEvents: isSingleVehiclePanelVisible ? 'auto' : 'none',
                transition: 'visibility 0s, opacity 0.3s ease-in-out',
                padding: '1.5rem', // 添加内边距
            }}>
                {isSingleVehiclePanelVisible && singleVehicleKeyToDisplay && (
                    <>
                        <CloseButton onClick={() => setIsSingleVehiclePanelVisible(false)}>
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </CloseButton>
                        <ShowVehicleStatus plateNumber={singleVehicleKeyToDisplay} vehicleStatus={vehicleStatus}/>
                    </>
                )}
            </div>

        </div>
    );
}

// 根容器样式
const mapWrapperStyle = {
    position: 'relative',
    width: '100%',
    height: '100vh', // 使用vh确保占满视口高度
    fontFamily: 'Inter, sans-serif',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center', // Center the map
};

// 地图容器样式
const container = {
    width: '100%',
    height: '100%', // 让地图容器填充父级，即mapWrapperStyle的高度
    position: 'absolute', // 相对于 mapWrapperStyle 绝对定位
    top: 0,
    left: 0,
    borderRadius: '0.75rem', // rounded-lg, still good to keep for aesthetics
    zIndex: 1, // Ensure map is behind controls
};

// 使用 styled-components 定义控制卡片样式，以便支持动态 left 属性和过渡
const StyledControlCard = styled.div`
    position: absolute;
    top: 1.25rem; /* top-5 */
    left: ${props => props.$expanded ? '3.0rem' : '-200px'};
    z-index: 10;
    padding: 1rem; /* p-4 */
    background-color: white;
    border-radius: 0.5rem; /* rounded-lg */
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
    display: flex;
    flex-direction: column;
    gap: 0.5rem; /* space-y-2 */
    transition: left 0.5s ease-in-out; /* Add transition for smooth slide effect */
    width: 200px; /* Give it a fixed width so we know how much to slide it */
`;

// 定义车辆状态卡片样式，以便支持动态 left 属性和过渡
const StyledVehicleStatusCard = styled.div`
    position: absolute;
    top: 1.55rem;
    width: 800px;
    right: ${props => props.$expanded ? '0.0rem' : '-750px'};
    z-index: 11;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-radius: 0.5rem;
    transition: right 0.5s ease-in-out;
    align-items: center; /* 这个属性会让子项在交叉轴（水平方向）居中 */
`;

const allVehicleStatusStyle = {
    maxWidth: '800px',
    maxHeight: '800px',
    overflowY: 'auto',
}

// 小节标题样式
const sectionTitleStyle = {
    fontSize: '0.875rem', // text-sm
    fontWeight: '600', // font-semibold
    color: '#1f2937', // text-gray-800
    marginBottom: '0.5rem', // mb-2
};

// 浮层面板通用样式
const overlayPanelStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 20,
    transition: 'all 0.3s ease-in-out',
    // backgroundColor: 'white',
    borderRadius: '0.75rem', // rounded-lg
    // boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // Deeper shadow for modals
    padding: '1.5rem', // p-6
    // Widths and max-widths are handled by inline style in JSX for flexibility per component
};

// 右侧浮层面板样式
const rightOverlayPanelStyle = {
    position: 'absolute',
    top: '50%',
    right: '1rem', // right-4
    transform: 'translateY(-50%)',
    zIndex: 20,
    transition: 'all 0.3s ease-in-out',
    // backgroundColor: 'white',
    borderRadius: '0.75rem', // rounded-lg
    // boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // Deeper shadow for modals
    padding: '1.5rem', // p-6
    maxHeight: '80vh', // max-h-[800px] changed to vh for responsiveness
    overflowY: 'auto', // overflow-y-auto
    // Widths and max-widths are handled by inline style in JSX for flexibility per component
};
// 使用 styled-components 定义可复用的样式化组件
const StyledCheckboxLabel = styled.label`
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #4a5568; /* text-gray-700 */
    transition: color 0.2s ease-in-out;
    margin-bottom: 0.5rem; /* Equivalent to space-y-2 on parent, but applied to each label */

    &:hover {
        color: #2563eb; /* hover:text-blue-700 */
    }
`;

const StyledCheckboxInput = styled.input`
    margin-right: 0.5rem; /* mr-2 */
    height: 1rem; /* h-4 */
    width: 1rem; /* w-4 */
    border-radius: 0.25rem; /* rounded */
    border: 1px solid #d1d5db; /* border-gray-300 */
    accent-color: #2563eb; /* text-blue-600 for checked state */
    /* Remove focus ring from here, it should be handled by the browser default or a focus-visible polyfill */
    /* If you want custom focus styles, you'd need a more advanced setup */

    &:focus {
        outline: none; /* remove default outline */
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5); /* focus:ring-blue-500 */
    }
`;

const StyledSeparator = styled.div`
    border-top: 1px solid #e5e7eb; /* border-t border-gray-200 */
    margin-top: 0.75rem; /* my-2 */
    margin-bottom: 0.75rem; /* my-2 */
    padding-top: 0.5rem; /* pt-2 */
`;

const CloseButton = styled.button`
    position: absolute;
    top: 0.0rem;
    right: 0.0rem;
    background: #bfc8d8;
    border: none;
    cursor: pointer;
    z-index: 10;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    transition: all 0.2s ease-in-out;

    &:hover {
        background-color: #f18a8a;
        transform: scale(1.1);
    }

    svg {
        width: 1.2rem;
        height: 1.2rem;
        fill: #4a5568;
        transition: fill 0.2s ease-in-out;
    }

    &:hover svg {
        fill: #2563eb;
    }`;

const PinButton = styled.button`
    margin-top: 0.5rem;
    background-color: rgba(255, 255, 255, 0.9);
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    padding: 0.25rem 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 1.2rem;
    color: #4a5568;
    cursor: pointer;
    z-index: 30;
    transition: all 0.2s ease-in-out;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* 添加一些阴影使其更突出 */

    &:hover {
        background-color: #f3f4f6;
        color: #1f2937;
    }

    svg {
        width: 1.25rem;
        height: 1.25rem;
        transition: transform 0.2s ease;
    }

    ${props => props.$isPinned && `
        background-color: #dbeafe;
        color: #1e40af;
        font-weight: 600;

        svg {
            transform: rotate(45deg);
        }
    `}
`;

