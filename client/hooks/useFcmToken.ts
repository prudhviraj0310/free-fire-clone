"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';

// ⚠️ To use this, you need to install firebase client SDK
// import { getMessaging, getToken } from "firebase/messaging";
// import { initializeApp } from "firebase/app";

/*
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
// const app = initializeApp(firebaseConfig);
// const messaging = getMessaging(app);
*/

export const useFcmToken = () => {
    const [token, setToken] = useState<string | null>(null);
    const [permission, setPermission] = useState<string>('default');

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        try {
            if (typeof window === 'undefined') return;

            const permission = await Notification.requestPermission();
            setPermission(permission);

            if (permission === 'granted') {
                console.log('Notification permission granted.');

                // MOCK TOKEN GENERATION
                const mockToken = `mock-fcm-token-${Date.now()}`;
                setToken(mockToken);
                await saveTokenToServer(mockToken);

                /* REAL IMPLEMENTATION:
                const currentToken = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
                if (currentToken) {
                    setToken(currentToken);
                    await saveTokenToServer(currentToken);
                }
                */
            }
        } catch (error) {
            console.error('An error occurred while retrieving token. ', error);
        }
    };

    const saveTokenToServer = async (fcmToken: string) => {
        const authToken = localStorage.getItem('token');
        if (!authToken) return;

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/update-fcm`, {
                fcmToken
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('FCM Token saved to server');
        } catch (error) {
            console.error('Failed to save FCM token', error);
        }
    };

    return { token, permission, requestPermission };
};
