import express, {Express, Request, Response} from 'express';
import { RowDataPacket } from 'mysql2';
import db from './Database';

const app: Express = express();

const PORT:Number = 3000;

app.get('/', async (req:Request, res:Response):Promise<void> => {
    let test:RowDataPacket[] = await db.getTest();
    res.send(`Hello from a typescript server!\nThis is your message:\n${test[0].value}`);
})

app.listen(PORT, ():void => {
    console.log(`Listening on port ${PORT}`);
})