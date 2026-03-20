try {
    require('firebase/compat/app');
    console.log('firebase/compat/app: OK');
} catch (e) {
    console.error('firebase/compat/app: FAILED -', e.message);
}

try {
    require('rss-parser');
    console.log('rss-parser: OK');
} catch (e) {
    console.error('rss-parser: FAILED -', e.message);
}

try {
    require('node-cron');
    console.log('node-cron: OK');
} catch (e) {
    console.error('node-cron: FAILED -', e.message);
}
