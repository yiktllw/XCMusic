const axios = require('axios')
axios({
    url: 'http://m7.music.126.net/20241015223047/227478f60d115528a97221fb7997c3b9/ymusic/9065/bda4/4a93/5115086053aa12810f96bfa213dbd517.mp3',
    method: 'GET',
    responseType: 'stream',
    family: 4,
    timeout: 30000
}).then(res => { console.log(typeof res.data.pipe) })