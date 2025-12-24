import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import axios from 'axios';

const usePushNotifications = (user: any) => {
    useEffect(() => {
        if (!user || Capacitor.getPlatform() === 'web') return;

        const registerPush = async () => {
            let permStatus = await PushNotifications.checkPermissions();

            if (permStatus.receive === 'prompt') {
                permStatus = await PushNotifications.requestPermissions();
            }

            if (permStatus.receive !== 'granted') {
                console.log('User denied permissions!');
                return;
            }

            await PushNotifications.register();
        };

        registerPush();

        const addListeners = async () => {
            await PushNotifications.addListener('registration', async token => {
                console.log('Push Registration Token:', token.value);
                // Send token to backend
                try {
                    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
                    const authToken = localStorage.getItem("token");
                    if (authToken) {
                        await axios.post(
                            `${API_URL}/notifications/register-token`,
                            { fcmToken: token.value },
                            { headers: { Authorization: `Bearer ${authToken}` } }
                        );
                        console.log('FCM Token sent to server');
                    }
                } catch (error) {
                    console.error('Error sending FCM token:', error);
                }
            });

            await PushNotifications.addListener('registrationError', err => {
                console.error('Registration error:', err.error);
            });

            await PushNotifications.addListener('pushNotificationReceived', notification => {
                console.log('Push received:', notification);
                // Can show a local toast/banner here if needed, 
                // but usually the system handles it if app is in background.
                // If app is foreground, we might want to show a custom UI.
            });

            await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
                console.log('Push action performed:', notification);
                // Navigation logic can go here (e.g., clicking notification opens specific match)
                const data = notification.notification.data;
                if (data?.matchId) {
                    window.location.href = `/tournament?id=${data.matchId}`;
                }
            });
        };

        addListeners();

        return () => {
            if (Capacitor.getPlatform() !== 'web') {
                PushNotifications.removeAllListeners();
            }
        };
    }, [user]);
};

export default usePushNotifications;
