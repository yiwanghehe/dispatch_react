
export const handleApiError = async (error, apiName) => {

    if (error.response && error.response.data) {
        // 后端返回结构化错误信息
        console.error(apiName + '出错:', error.response.data);
        alert(error.response.data.msg || apiName + '失败');
        if( error.response.data.code === 401) {
            return Promise.reject(new Error('身份验证失败，请重新登录'));
        }
    } else {
        // 网络错误或其他异常
        console.error(apiName + '失败:', error.msg);
        // alert(apiName + '失败: ' + error.msg);
    }
};
