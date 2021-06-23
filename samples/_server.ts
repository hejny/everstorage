/* tslint:disable:no-console */
import express from 'express';
// import opn from 'open';
import serveIndex from 'serve-index';
import serveStatic from 'serve-static';

// TODO: To touchcontroller

const PORT = 7012;

const staticBasePath = './';

const app = express();

app.use(serveStatic(staticBasePath, { index: false }));
app.use(
    serveIndex(staticBasePath, {
        icons: true,
        filter: (filename, index, files, dir) =>
            /(\.html|samples)$/.test(filename),
    }),
);
app.listen(PORT);

console.info(
    `Static server listening on port ${PORT}.\nOpen it on http://localhost:${PORT}/samples/`,
);
// Note: not opening the browser opn(`http://localhost:${PORT}/samples/`);
