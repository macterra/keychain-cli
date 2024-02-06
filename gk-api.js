import express from 'express';
import morgan from 'morgan';
import * as gatekeeper from './gatekeeper.js';

gatekeeper.start();

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.get('/version', async (req, res) => {
    try {
        res.json(1);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.get('/did/:did', async (req, res) => {
    try {
        const doc = await gatekeeper.resolveDid(req.params.did);
        res.json(JSON.parse(doc));
    } catch (error) {
        console.error(error);
        res.status(500).send(error.toString());
    }
});

app.post('/did', async (req, res) => {
    try {
        const txn = req.body;
        const did = await gatekeeper.createDid(txn);
        res.json({ did: did });
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

const port = 3000;
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

export default server;


