import api from "./api.js";
import {handleApiError} from "./errorHandler.js";


const keywordSearch = async(keywords, region, page_size, page_num) => {
    try {
        const res = await api.public.keywordSearch(keywords, region, page_size, page_num);
        if (res.data.code === 200) {
            return res.data;
        } else {
            console.error('关键字搜索失败:', res.data.message);
            alert('错误:' + res.data.message);
        }
    } catch (error) {
        handleApiError(error, '关键字搜索');
    }
}

const getAllPois = async() => {
    try {
        const res = await api.public.getAllPois();
        if (res.data.code === 200) {
            return res.data;
        } else {
            console.error('获取全部POI失败:', res.data.message);
            alert('错误:' + res.data.message);
        }
    } catch (error) {
        handleApiError(error, '获取全部POI');
    }
}

const addPois = async(rawPOIs, simType) => {
    try {
        const res = await api.public.addPois(rawPOIs, simType);
        if (res.data.code === 200) {
            return res.data;
        } else {
            console.error('添加POI失败:', res.data.message);
            alert('错误:' + res.data.message);
        }
    } catch (error) {
        handleApiError(error, '添加POI');
    }
}

const getAllSimType = async() => {
    try {
        const res = await api.public.getAllSimType();
        if (res.data.code === 200) {
            return res.data;
        } else {
            console.error('获取PoiSimType:', res.data.message);
            alert('错误:' + res.data.message);
        }
    } catch (error) {
        handleApiError(error, '获取PoiSimType');
    }
}

// const createFactory = async() => {
//     try {
//         const res = await api.public.createFactory();
//         if (res.data.code === 200) {
//             return res.data;
//         } else {
//             console.error('创建工厂失败:', res.data.message);
//             alert('错误:' + res.data.message);
//         }
//     } catch (error) {
//         handleApiError(error, '创建工厂');
//     }
// }
//
// const createVehicle = async(vehicleKey) => {
//     const [type, id, index] = vehicleKey.split('_');
//     try {
//         const res = await api.public.createVehicle(type, id, index);
//         if (res.data.code === 200) {
//             console.log("首次起终点数据:", res.data);
//             return res.data;
//         } else {
//             console.error('派送车辆失败:', res.data.message);
//             alert('错误:' + res.data.message);
//         }
//     } catch (error) {
//         handleApiError(error, '派送车辆');
//     }
// }
//
// const startVehicle = async() => {
//     try {
//         const res = await api.public.startVehicle();
//         if (res.data.code === 200) {
//             return res.data;
//         } else {
//             console.error('启动车辆失败:', res.data.message);
//             alert('错误:' + res.data.message);
//         }
//     } catch (error) {
//         handleApiError(error, '启动车辆');
//     }
// }
//
// const getVehicleStatus = async(vehicleKey) => {
//     const [type, id, index] = vehicleKey.split('_');
//     try {
//         const res = await api.public.getVehicleStatus(type, id, index);
//         if (res.data.code === 200) {
//             return res.data;
//         } else {
//             console.error('获取车辆状态失败:', res.data.message);
//             alert('错误:' + res.data.message);
//         }
//     } catch (error) {
//         handleApiError(error, '获取车辆状态');
//     }
// }
//
// const addDispatchTask = async(taskName, origin, destination, goodWeight, goodVolume) => {
//     try {
//         const originObject ={
//             lon: origin.split(',').map(Number)[0],
//             lat: origin.split(',').map(Number)[1]
//         }
//         const destinationObject ={
//             lon: origin.split(',').map(Number)[0],
//             lat: origin.split(',').map(Number)[1]
//         }
//         const res = await api.public.addDispatchTask(taskName, originObject, destinationObject, goodWeight, goodVolume);
//         if (res.data.code === 200) {
//             return res.data;
//         } else {
//             console.error('添加调度任务失败:', res.data.message);
//             alert('错误:' + res.data.message);
//         }
//     } catch (error) {
//         handleApiError(error, '添加调度任务');
//     }
// }

const startSimulation = async(useWeight, weight_WASTED_IDLE, weight_WASTED_LOAD, weight_TIME) => {
    try {
        const res = await api.public.startSimulation(useWeight, weight_WASTED_IDLE, weight_WASTED_LOAD, weight_TIME);
        if (res.data.code === 200) {
            console.log("启动仿真成功");
            return res.data;
        } else {
            console.error('启动仿真:', res.data.message);
            alert('错误:' + res.data.message);
        }
    } catch (error) {
        handleApiError(error, '启动仿真');
    }
}

const stopSimulation = async() => {
    try {
        const res = await api.public.stopSimulation();
        if (res.data.code === 200) {
            console.log("停止仿真成功");
            return res.data;
        } else {
            console.error('停止仿真:', res.data.message);
            alert('错误:' + res.data.message);
        }
    } catch (error) {
        handleApiError(error, '停止仿真');
    }
}

const getSessions = async() => {
    try {
        const res = await api.public.getSessions();
        if (res.data.code === 200) {
            console.log("获取数据沙箱成功");
            return res.data;
        } else {
            console.error('获取数据沙箱:', res.data.message);
            alert('错误:' + res.data.message);
        }
    } catch (error) {
        handleApiError(error, '获取数据沙箱');
    }
}

const getWeather = async(city) => {
    try {
        const res = await api.public.getWeather(city);
        if (res.data.code === 200) {
            return res.data;
        } else {
            console.error('获取天气失败:', res.data.message);
        }
    } catch (error) {
        handleApiError(error, '获取天气');
    }
}

export default {
    keywordSearch,
    getAllPois,
    addPois,
    getAllSimType,
    // createFactory,
    // createVehicle,
    // startVehicle,
    // getVehicleStatus,
    // addDispatchTask,
    startSimulation,
    stopSimulation,
    getSessions,
    getWeather,

}
