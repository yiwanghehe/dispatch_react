// "117.524522,34.218911;117.524828,34.218978;117.527124,34.219552"
// 解析为：[[117.524522, 34.218911],[117.524828, 34.218978],[117.527124, 34.219552]]
export function parseCoordinates(str) {
    // 检查输入是否为字符串类型
    if (typeof str !== 'string') {
        return [[]];
    }

    const result = [];
    let currentPair = [];
    let startIndex = 0; // 标记当前数字的起始位置

    for (let i = 0; i < str.length; i++) {
        const char = str[i];

        // 当遇到逗号时，说明第一个数字结束
        if (char === ',') {
            // 截取从 startIndex 到当前位置的子串，并转换为数字
            const num = parseFloat(str.substring(startIndex, i));
            currentPair.push(num);
            // 更新下一个数字的起始位置
            startIndex = i + 1;
        }
        // 当遇到分号时，说明第二个数字（即一个坐标对）结束
        else if (char === ';') {
            const num = parseFloat(str.substring(startIndex, i));
            currentPair.push(num);
            // 将完整的坐标对推入结果数组
            result.push(currentPair);
            // 重置 currentPair 以供下一个坐标使用
            currentPair = [];
            startIndex = i + 1;
        }
    }

    // 处理字符串末尾的最后一个坐标对
    // 循环结束后，最后一个数字后面没有分号，需要单独处理
    if (startIndex < str.length) {
        const num = parseFloat(str.substring(startIndex));
        currentPair.push(num);
        result.push(currentPair);
    }

    return result;
}
