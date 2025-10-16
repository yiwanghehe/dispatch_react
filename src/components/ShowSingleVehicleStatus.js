// src/components/ShowSingleVehicleStatus.js (不再是组件，而是函数)
import EventBus from '../utils/eventBus';

export function showSingleVehicleStatus(vehicleKey) {
    EventBus.publish('showSingleVehicleStatus', vehicleKey);
}

export function hideSingleVehicleStatus() {
    EventBus.publish('hideSingleVehicleStatus');
}
