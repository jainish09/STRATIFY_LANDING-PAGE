const Parser = require('rss-parser');
const firebase = require('firebase/compat/app');
require('firebase/compat/firestore');
const cron = require('node-cron');

// --- Firebase Initialization ---
const firebaseConfig = {
    apiKey: "AIzaSyDDWY7pLUYKKXMbM5ppiyXMgErXGiprd-k",
    authDomain: "stratify-6a696.firebaseapp.com",
    projectId: "stratify-6a696",
    storageBucket: "stratify-6a696.firebasestorage.app",
    messagingSenderId: "950340236076",
    appId: "1:950340236076:web:8c547a2f06b1bb24057289",
    measurementId: "G-1L3RLJWDB2"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const FEED_URL = 'https://rss.app/feeds/oHgLIMGe2PmKMzRK.xml';

const parser = new Parser({
    customFields: {
        item: [
            ['media:content', 'mediaContent']
        ]
    }
});

async function fetchNewsletters() {
    console.log(`[${new Date().toISOString()}] Fetching NEW RSS feed...`);
    try {
        const feed = await parser.parseURL(FEED_URL);
        const items = [...feed.items].reverse();

        let insertedCount = 0;

        for (const item of items) {
            const title = item.title;
            const link = item.link;
            const date = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();

            let imageUrl = null;
            if (item.mediaContent && item.mediaContent['$'] && item.mediaContent['$'].url) {
                imageUrl = item.mediaContent['$'].url;
            } else if (item.content) {
                const imgMatch = item.content.match(/<img[^>]+src="?([^"\s]+)"?\s*\/>/);
                if (imgMatch && imgMatch[1]) {
                    imageUrl = imgMatch[1];
                }
            }

            let description = item.contentSnippet || item.content || '';
            if (description.length > 200) {
                description = description.substring(0, 197) + '...';
            }

            // In Firestore, we use 'set' with {merge: true} or a unique ID check
            // We'll use a sanitized version of the title/link as a document ID to avoid duplicates
            const docId = link.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 255);

            await db.collection('linkedin_newsletters').doc(docId).set({
                title,
                description,
                link,
                published_at: date,
                image_url: imageUrl,
                synced_at: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            console.log(`Successfully synced: ${title}`);
            insertedCount++;
        }

        console.log(`[${new Date().toISOString()}] Sync complete. Total processed: ${insertedCount}`);

    } catch (error) {
        console.error('Failed to fetch or parse RSS feed:', error.message);
    }
}

// 1. Run immediately
fetchNewsletters();

// 2. Schedule every 6 hours
cron.schedule('0 */6 * * *', () => {
    fetchNewsletters();
});

console.log('LinkedIn RSS Fetcher is running (Firebase Version).');
