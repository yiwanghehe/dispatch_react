import truck from "../imgs/truck.png";
import {throttle} from "lodash";
import { showSingleVehicleStatus, hideSingleVehicleStatus } from '../components/ShowSingleVehicleStatus'; // 导入函数


function initPathSimplifier(PathSimplifier, map) {

    setTimeout(() => {
        let element = document.querySelector("#container > div.amap-maps > div.amap-layers > div.amap-e > div.amap-ui-pathsimplifier-container")
        if (element) {
            element.style.position = 'absolute';
            // console.log('amap-ui-pathsimplifier-container Element found.');
        } else {
            // console.log('amap-ui-pathsimplifier-container Element not found.');
        }
    }, 1000);

    let pathSimplifierIns = new PathSimplifier({
        zIndex: 100,
        autoSetFitView: false,
        map: map,

        getPath: function(pathData, pathIndex) {
            return pathData.path;
        },
        getHoverTitle: function(pathData, pathIndex, pointIndex) {
            if (pointIndex >= 0) {
                return pathData.name + '，点：' + (pointIndex + 1) + '/' + pathData.path.length + '<br/>' +
                    '经纬度：' + pathData.path[pointIndex].join(',');
            }
            return pathData.name + '，点数量' + pathData.path.length;
        },
        renderOptions: {
            renderAllPointsIfNumberBelow: 100
        }
    });

    // 点击路径/点时的事件处理
    pathSimplifierIns.on('pathClick pointClick', function(e, info) {
        // 显示车辆状态
        console.log("车辆名字:", info.pathData.name);
        showSingleVehicleStatus(info.pathData.name); // 直接调用函数
    })
    // 鼠标悬停路径/点时的事件处理
    // pathSimplifierIns.on('pathMouseover pointMouseover', function(e, info) {
    // })
    window.pathSimplifierIns = pathSimplifierIns;

    function onload() {
        pathSimplifierIns.renderLater();
    }

    function onerror(e) {
        console.log(e);
    }

    const endIdxs = {};
    const data = [];
    const navgs = {};

    async function processPath(key, myPath, navigationId) {
        let keyData = data.find(item => item.name === `${key}`);
        if (!keyData) {
            endIdxs[key] = 0;
            keyData = { name: `${key}`, path: [] };
            data.push(keyData);
        }

        // Use myPath instead of the outer myPath
        if (!myPath[key] || !Array.isArray(myPath[key])) {
            console.warn(`路径数据 ${key} 不存在或不是数组，跳过处理。`);
            return;
        }

        endIdxs[key] = myPath[key].length - 1;
        keyData.path = myPath[key];

        if (keyData.path.length > 0) {
            if (navigationId && typeof navigationId[key] !== 'undefined') {
                navgs[key] = pathSimplifierIns.createPathNavigator(navigationId[key], {
                    loop: false,
                    speed: 10000000,
                    pathNavigatorStyle: {
                        width: 32,
                        height: 32,
                        content: PathSimplifier.Render.Canvas.getImageContent(truck, onload, onerror)
                    }
                });
                navgs[key].start();
            } else {
                console.warn(`navigationId[${key}] 不存在，无法创建导航器。`);
                return;
            }
        }
    }


    const _updatePaths = async (myPath, navigationId) => {
        const keys = Object.keys(myPath);

        data.length = 0;
        keys.forEach(key => {
            if (myPath[key] && Array.isArray(myPath[key])) {
                data.push({ name: `${key}`, path: myPath[key] });
            }
        });

        pathSimplifierIns.setData(data);

        const promises = keys.map(key => processPath(key, myPath, navigationId));
        await Promise.all(promises);
    };

    pathSimplifierIns._updatePaths = throttle(_updatePaths, 1000);
    return pathSimplifierIns;
}

export default initPathSimplifier;
