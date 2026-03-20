const https = require('https');
const url = 'https://rss.app/feeds/3y9lhAzVzU8UXX9Z.xml';

https.get(url, (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Body length:', data.length);
        if (data.length > 500) {
            console.log('Snippet:', data.substring(0, 500));
        } else {
            console.log('Body:', data);
        }
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
