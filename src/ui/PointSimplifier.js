function initPointSimplifier(PointSimplifier, map, utils, $) {
    setTimeout(() => {
        let element = document.querySelector("#container > div.amap-maps > div.amap-layers > div.amap-layer.amap-e > div.amap-ui-pointsimplifier-container")
        if (element) {
            element.style.position = 'absolute';
            // console.log('amap-ui-pointsimplifier-container Element found.');
        } else {
            // console.log('amap-ui-pointsimplifier-container Element not found.');
        }
    }, 1000); // 延迟1秒
    /**
     * 自定义的分组绘制引擎
     */
    function MyCanvasRender(pointSimplifierIns, opts) {
        MyCanvasRender.__super__.constructor.apply(this, arguments);
    }

    utils.inherit(MyCanvasRender, PointSimplifier.Render.Canvas);

    utils.extend(MyCanvasRender.prototype, {
        renderNormalPoints: function (zoom, activePoints, shadowPoints) {
            MyCanvasRender.__super__.renderNormalPoints.call(this, zoom, null, shadowPoints);

            var pointStyle = this.getOption('pointStyle'),
                getPointsGroupKey = this.getOption('getPointsGroupKey'),
                pointStyleGroup = this.getOption('pointStyleGroup'),
                pointSimplifierIns = this.getPointSimplifierInstance(),
                groups = {};

            for (var i = 0, len = activePoints.length; i < len; i++) {
                var point = activePoints[i],
                    dataIndex = point.idx,
                    dataItem = pointSimplifierIns.getDataItemByIndex(dataIndex),
                    key = getPointsGroupKey.call(this, dataItem, dataIndex);

                if (!groups[key]) {
                    groups[key] = [];
                }

                groups[key].push(activePoints[i]);
            }

            for (var k in groups) {
                var styleOptions = utils.extend({}, pointStyle, pointStyleGroup[k]);
                this.drawPointsWithStyleOptions(groups[k], styleOptions);
            }
        }
    });

    var poiData = [];


    var pointSimplifierIns = new PointSimplifier({
        zIndex: 300,
        map: map,
        autoSetFitView: false,
        getPosition: function (item) {
            return [item.lng, item.lat];
        },
        getHoverTitle: function (dataItem, idx) {
            return '地点: ' + dataItem.name + '<br>类型: ' + dataItem.simType + '<br>坐标: ' + dataItem.lng + ',' + dataItem.lat;
        },
        renderConstructor: MyCanvasRender,
        renderOptions: {
            getPointsGroupKey: function (dataItem, dataIndex) {
                return dataItem.simType;
            },
            pointStyleGroup: {
                'restaurant': {fillStyle: '#ff0000'}, // 红色
                'hotel': {fillStyle: '#f781bf'},       // 粉色

                '加油站': {fillStyle: '#ffff00'}, // 黄色

                'LUMBER_YARD': {fillStyle: '#00ff00'}, // 林场绿色
                'SAWMILL': {fillStyle: '#377eb8'}, // 锯木厂/木材厂蓝色
                'FURNITURE_FACTORY': {fillStyle: '#4575b4'}, // 家具厂深蓝色
                'FURNITURE_MARKET': {fillStyle: '#ffcc00'}, // 家具市场金黄色

                'IRON_MINE': {fillStyle: '#000000'}, // 铁矿/钢材厂黑色
                'STEEL_MILL': {fillStyle: '#e41a1c'}, // 钢铁厂亮红色
                'HARDWARE_FACTORY': {fillStyle: '#dede00'}, // 五金厂金色

            }
        }
    });

    pointSimplifierIns.setData(poiData); // 设置POI数据

    $('#loadingTip').remove(); // 移除加载提示


    const updatePoints = (pD) => {
        pointSimplifierIns.setData(pD);
    }
    pointSimplifierIns._updatePoints = updatePoints;

    return pointSimplifierIns;
}
export default initPointSimplifier;
