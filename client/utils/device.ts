import { Device } from '@capacitor/device';

export const getDeviceId = async () => {
    try {
        const info = await Device.getId();
        return info.identifier;
    } catch (e) {
        // Fallback for web/dev
        let webId = localStorage.getItem('device_id');
        if (!webId) {
            webId = 'web_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('device_id', webId);
        }
        return webId;
    }
};
