import express, { Express, Request, Response } from 'express';
import { RowDataPacket } from 'mysql2';
import db from './Database';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import 'dotenv/config';
const geocodingCache = new Map();

const app: Express = express();
app.use(bodyParser.urlencoded({ extended: true }))


const PORT: Number = 5000;
const parseFloatAndThrow = (numberString: string) => {
    let result = parseFloat(numberString);
    if (!Number.isNaN(result))
        return result;
    throw Error(`${numberString} cannot be converted to a float`)
}
const checkTimeValidity = (hourAndMinutes: string) => {
    let timeFormat = /([01]?[0-9]|2[0-3]):[0-5][0-9]/;
    if (!timeFormat.test(hourAndMinutes)) {
        console.log(`Time format did not match expected regex`)
        return false;
    }
    let today = new Date();
    let currentTimeInMinutes = today.getHours() * 60 + today.getMinutes();
    let ticketTimeInMinutes = parseInt(hourAndMinutes.substring(0, 2)) * 60 + parseInt(hourAndMinutes.substring(3));
    if (ticketTimeInMinutes - currentTimeInMinutes < 15) {
        console.log(`Ticket has less than 15 minutes remaining`)
        return false;
    }
    return true
    // need to decide which tickets should be sellable. I don't think people should schedule sales for days ahead, just for the current day.
    // Also tickets with less than a certain remaining time available should not be sellable (e.g. 15 minutes)
    // Periodically I need to purge old tickets from the database (I need to save a date for when the ticket was created)
    // And on the map I'll only query tickets for the current date and that have > 15 mins left from the current time.

}
const datetimeFromTime = (hourAndMinutes: string) => {
    //  YYYY-MM-DD HH:MM:SS
    let today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${hourAndMinutes}:00`
}

app.use((req, res, next) => {
    req.user = { id: 1, username: 'simone' };
    return next();
})

const isLoggedIn = (req: Request, res: Response, next: Function) => {
    if (req.user) return next();
    res.redirect('/');
}

app.get('/', async (req: Request, res: Response): Promise<void> => {
    let test: RowDataPacket[] = await db.getTest();
    console.log(test);
    res.send(`Hello from a typescript server!\nThis is your message:\n${test[0].time}`);
})

app.post('/ticket', isLoggedIn, async (req: Request, res: Response): Promise<void> => {
    let { price, expireTime, latitude, longitude } = req.body;
    [price, latitude, longitude] = [price, latitude, longitude].map(stringValue => parseFloatAndThrow(stringValue));
    if (!checkTimeValidity(expireTime)) {
        throw Error(`Expire time is not valid`);
        return;
    }
    let datetime = datetimeFromTime(expireTime)
    console.log(req.body)
    await db.createTicket(price, datetime, req.user.id, latitude, longitude);
})
app.get('/api/tickets', async (req: Request, res: Response) => {
})
app.get('/api/geocoding/:search', async (req: Request, res: Response) => {
    try {
        let search = req.params.search;
        let results;
        if (geocodingCache.has(search)) {
            results = geocodingCache.get(search);
        } else {
            let response = await fetch(`http://www.mapquestapi.com/geocoding/v1/address?key=${process.env.GEOCODING_API_KEY}&location=${search}`)
            results = await response.json();
            geocodingCache.set(search, results);
        }
        res.status(200).setHeader('Access-Control-Allow-Origin', '*').send(results);
    } catch (e) {
        throw e;
    }
})

app.listen(PORT, (): void => {
    console.log(`Listening on port ${PORT}`);
})