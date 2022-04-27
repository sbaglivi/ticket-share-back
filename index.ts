import express, {Express, Request, Response} from 'express';
import { RowDataPacket } from 'mysql2';
import db from './Database';

const app: Express = express();

const PORT:Number = 3000;

app.use((req,res,next) => {
    req.user = {id: 1, username: 'simone'};
    return next();
})

const isLoggedIn = (req:Request,res:Response,next:Function) => {
    if(req.user) return next();
    res.redirect('/');
}

app.get('/', async (req:Request, res:Response):Promise<void> => {
    let test:RowDataPacket[] = await db.getTest();
    console.log(test);
    res.send(`Hello from a typescript server!\nThis is your message:\n${test[0].time}`);
})

app.post('/ticket', isLoggedIn, async (req:Request, res:Response):Promise<void> => {
let {price, expireTime, latitude, longitude} = req.body;
    await db.createTicket(price, expireTime, req.user.id, latitude, longitude);
    res.redirect('/');
})

app.listen(PORT, ():void => {
    console.log(`Listening on port ${PORT}`);
})