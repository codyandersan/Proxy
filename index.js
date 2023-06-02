const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(cors());

app.get('/', (req, res) => {
    res.send('Visit /download?url=');
});

app.get('/download', async (req, res) => {
    const queries = req.query;
    const videoUrl = queries.url + "?" + Object.keys(queries).map((key) => {
        if (key !== "url" && key !== "filename") {
            return key + '=' + queries[key];
        }
    }).join('&');
    const filename = queries.filename;
    console.log(videoUrl);
    console.log(filename);

    try {
        const response = await axios.get(videoUrl, { responseType: 'stream' });
        const fileSize = response.headers['content-length'];

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', response.headers['content-type']);
        res.setHeader('Content-Length', fileSize);

        response.data.pipe(res);
    } catch (error) {
        console.error('Error occurred while downloading the video:', error);
        res.status(500).send('Failed to download the video');
    }
});

const port = parseInt(process.env.PORT) || 8080;

app.listen(port, "0.0.0.0", () => {
    console.log(`App listening on port ${port}`);
});


// const express = require('express');
// const axios = require('axios');
// const cors = require('cors');

// const app = express();
// app.use(cors());

// app.get('/', (req, res) => {
//     res.send('Visit /proxy?url=');
// });

// app.get('/proxy', async (req, res) => {
//     const queries = req.query;
//     console.log(queries)
//     const url = queries.url + "?" + Object.keys(queries).map((key) => {
//         if (key !== "url") {
//             return key + '=' + queries[key];
//         }
//     }).join('&');

//     console.log(url);
//     try {
//         const response = await axios.get(url);

//         // Set appropriate headers for the proxied response
//         res.set(response.headers);

//         // Pipe the response from the URL back to the client
//         response.data.pipe(res);
//     } catch (error) {
//         console.error('Error:', error.message);
//         res.status(500).send('Error occurred while proxying the request.');
//     }
// });

// const port = parseInt(process.env.PORT) || 8080;

// app.listen(port, () => {
//     console.log(`App listening on port ${port}`);
// });