const admin = require('firebase-admin');

// ⚠️ IMPORTANT: You must replace this with your actual Service Account path
// const serviceAccount = require('../../firebase-adminsdk.json'); 

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

/**
 * Send a push notification to a specific device
 * @param {string} token - The FCM registration token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional data payload
 */
exports.sendNotification = async (token, title, body, data = {}) => {
    // Mock implementation if Firebase is not configured
    // if (!token) return;

    console.log(`[MOCK FCM] Sending to ${token}: ${title} - ${body}`);

    /* REAL IMPLEMENTATION:
    try {
        const message = {
            notification: { title, body },
            data,
            token
        };
        await admin.messaging().send(message);
        console.log('Successfully sent message');
    } catch (error) {
        console.error('Error sending message:', error);
    }
    */
};

/**
 * Send to a topic (e.g. 'all_users')
 */
exports.sendToTopic = async (topic, title, body) => {
    console.log(`[MOCK FCM] Sending to Topic ${topic}: ${title} - ${body}`);
};
