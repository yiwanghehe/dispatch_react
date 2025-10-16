// src/utils/eventBus.js
const eventHandlers = {};

const EventBus = {
    subscribe(event, handler) {
        if (!eventHandlers[event]) {
            eventHandlers[event] = [];
        }
        eventHandlers[event].push(handler);
        return () => { // 返回一个取消订阅的函数
            eventHandlers[event] = eventHandlers[event].filter(h => h !== handler);
        };
    },

    publish(event, data) {
        if (eventHandlers[event]) {
            eventHandlers[event].forEach(handler => handler(data));
        }
    }
};

export default EventBus;
