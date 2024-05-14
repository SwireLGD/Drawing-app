import express from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import { ActiveConnections, Drawings, IncomingMessage } from './types';
import crypto from 'crypto';

const app = express();

expressWs(app);

const port = 8000;
app.use(cors());

const router = express.Router();
const activeConnections: ActiveConnections = {};
const canvasState: Drawings[] = [];

router.ws('/canvas',  (ws, req) => {
    const id = crypto.randomUUID();
    console.log('client connected! id=', id);
    activeConnections[id] = ws;

    ws.send(JSON.stringify({ type: 'INITIAL_STATE', payload: canvasState }));


    ws.on('close', () => {
        console.log('client disconnected! id=', id);
        delete activeConnections[id];
    });

    let username = 'Anonymous';


    ws.on('message', (msg) => {
        let decodedMessage;
        try {
            decodedMessage = JSON.parse(msg.toString()) as Drawings;
        } catch (error) {
            console.error(error);
            return;
        }

        if (!decodedMessage.color) {
            decodedMessage.color = 'black';
        }

        if (decodedMessage.x !== undefined && decodedMessage.y !== undefined) {
            canvasState.push(decodedMessage);
            Object.values(activeConnections).forEach(conn => {
                conn.send(JSON.stringify({
                    type: 'NEW_DRAW',
                    payload: decodedMessage
                }));
            });
        }
    });
});

app.use(router);

app.listen(port, () => {
    console.log(`Server started on ${port} port!`);
});