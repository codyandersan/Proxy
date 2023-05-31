const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const MAX_PAYLOAD_SIZE = 2 * 1024 * 1024; // 5MB maximum payload size

app.get('/', (req, res) => {
    res.send('Visit /proxy?url=');
});

app.get('/proxy', async (req, res) => {
    const queries = req.query;
    const url = queries.url + "?" + Object.keys(queries).map((key) => {
        if (key !== "url") {
            return key + '=' + queries[key];
        }
    }).join('&');

    try {
        const response = await axios.head(url); // Fetch only headers to get file size
        const fileSize = parseInt(response.headers['content-length']);

        res.setHeader('Content-Length', fileSize);

        const totalChunks = Math.ceil(fileSize / MAX_PAYLOAD_SIZE);
        const chunkSize = Math.ceil(fileSize / totalChunks);

        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const rangeStart = chunkIndex * chunkSize;
            const rangeEnd = Math.min(rangeStart + chunkSize - 1, fileSize - 1);
            const rangeHeader = `bytes=${rangeStart}-${rangeEnd}`;

            const chunkResponse = await axios.get(url, {
                headers: { Range: rangeHeader },
                responseType: 'arraybuffer',
            });

            const chunkBuffer = Buffer.from(chunkResponse.data);
            res.write(chunkBuffer);
        }

        res.end();
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Error occurred while proxying the request.');
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