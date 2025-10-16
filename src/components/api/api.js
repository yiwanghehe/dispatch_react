import axios from "axios";
import config from "./config.js";


const apiClient = axios.create({
    baseURL: config.BACKEND_URL,
    timeout: 5000,
})

// 特殊 axios 实例，设置不同的超时时间
const longTimeoutApiClient = axios.create({
    baseURL: config.BACKEND_URL,
    timeout: 10000, // 更长的超时时间
});

const neverOutApiClient = axios.create({
    baseURL: config.BACKEND_URL,
    timeout: -1, // 更长的超时时间
});

const publicApi = {

    // 关键字搜索
    keywordSearch: (keywords, region, page_size, page_num) =>
        apiClient.post('/keywordsearch', {
            keywords: keywords,
            region: region,
            page_size: page_size,
            page_num: page_num
        }),

    // 获取全部POI
    getAllPois: () =>
        apiClient.get('/poi/getAll'),

    // 添加poi点
    addPois: (rawPOIs, simType) =>
        apiClient.post(`/poi/addpois?simType=${simType}`, rawPOIs, {
            headers: {
                'Content-Type': 'application/json'
            }
        }),

    // 获取全部PoiSimType类型
    getAllSimType: () =>
        apiClient.get('/poi/getAllSimType'),

    // // 创建工厂
    // createFactory: () =>
    //     neverOutApiClient.post('/factory/create'),
    //
    // // 创建车辆
    // createVehicle: (type, id, index) =>
    //     apiClient.get(`/status/${type}/${id}/${index}`),
    //
    // // 启动车辆
    // startVehicle: () =>
    //     neverOutApiClient.get('/status/start'),
    //
    // // 获取车辆状态
    // getVehicleStatus: (type, id, index) =>
    //     apiClient.get(`/${type}/${id}/${index}/getCarData`),
    //
    // // 手动添加调度任务
    // addDispatchTask: (taskName, origin, destination, goodWeight, goodVolume) =>
    //     apiClient.post('/addtask', {
    //         taskName: taskName,
    //         origin: origin,
    //         destination: destination,
    //         goodWeight: goodWeight,
    //         goodVolume: goodVolume
    //     }),

    // 启动仿真
    startSimulation: (useWeight, weight_WASTED_IDLE, weight_WASTED_LOAD, weight_TIME) =>
        apiClient.post('/simulation/start', {
            useWeight: useWeight,
            weight_WASTED_IDLE: weight_WASTED_IDLE,
            weight_WASTED_LOAD: weight_WASTED_LOAD,
            weight_TIME: weight_TIME
        }),

    // 停止仿真
    stopSimulation: () =>
        apiClient.post('/simulation/stop'),

    // 查询数据沙箱
    getSessions: () =>
        apiClient.get('/simulation/sessions'),
}

export default {
    public: publicApi
}
