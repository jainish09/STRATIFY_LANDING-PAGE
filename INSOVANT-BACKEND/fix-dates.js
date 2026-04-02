const firebase = require('firebase/compat/app');
require('firebase/compat/firestore');
const firebaseConfig = {
    apiKey: "AIzaSyDDWY7pLUYKKXMbM5ppiyXMgErXGiprd-k",
    authDomain: "stratify-6a696.firebaseapp.com",
    projectId: "stratify-6a696"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function fixDates() {
    try {
        console.log("Checking DB for old date formats...");
        const snapshot = await db.collection('linkedin_newsletters').get();
        let count = 0;
        let promises = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Validating if it's not starting with full ISO year like "202..." or containing 'T'
            if (data.published_at && !data.published_at.includes('T')) {
                const date = new Date(data.published_at);
                if (!isNaN(date.getTime())) {
                    const isoDate = date.toISOString();
                    console.log(`Fixing doc ${doc.id}: ${data.published_at} -> ${isoDate}`);
                    promises.push(db.collection('linkedin_newsletters').doc(doc.id).update({
                        published_at: isoDate
                    }));
                    count++;
                }
            }
        });
        await Promise.all(promises);
        console.log(`DONE. Fixed ${count} documents.`);
    } catch (e) {
        console.error("ERROR:", e);
    }
    process.exit(0);
}
fixDates();
