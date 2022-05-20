import express, { Express, Request, Response } from 'express';
import { RowDataPacket } from 'mysql2';
import db from './Database';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import 'dotenv/config';
import session from 'express-session';
import sqlStore from 'express-mysql-session';
import cors from 'cors';

const sessionOptions = {
    secret: 'yellow chicken',
    resave: false,
    saveUninitialized: true,
    name: 'ticket-share-back',
    cookie: {
        maxAge: 3600000
    }
}
const MySQLStore = sqlStore(session);
const sessionStore = new MySQLStore({}, db.pool)
const geocodingCache = new Map();
declare module 'express-session' {
    interface SessionData {
        visited: number | undefined,
        user: { id: number, username: string } | undefined,
    }
}


const app: Express = express();
// app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(session(sessionOptions));

app.use((req: Request, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000').setHeader('Access-Control-Allow-Headers', 'Content-Type').setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.session) {
        if (req.session?.user) {
            req.user = req.session.user;
        };
        console.log(req.session)
    }
    return next();
})
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


const isLoggedIn = (req: Request, res: Response, next: Function) => {
    if (req.user) return next();
    res.redirect('/');
}

app.get('/', async (req: Request, res: Response): Promise<void> => {
    let test: RowDataPacket[] = await db.getTest();
    console.log(test);
    if (req.session.visited) {
        req.session.visited++;
    } else {
        console.log('got here')
        req.session.visited = 1;
    }
    res.send(`Hello from a typescript server!\nThis is your message:\n${test[0].time}\nYou have visited this page ${req.session.visited} times`);
})
const isNotLoggedIn = (req: Request, res: Response, next: Function) => {
    if (!req.user) {
        return next();
    }
    return res.redirect('/')
}

app.get('/check', (req: Request, res: Response) => {
    let message: string;
    if (req.user) {
        message = `You are correctly logged in ${req.user.username}`
    } else {
        message = `No user is logged in :(`;
    }
    res.status(200).send(message);

})
app.post('/login', isNotLoggedIn, async (req: Request, res: Response) => {
    console.log(`origin: ${req.get('origin')}`)
    let { username, password } = req.body;
    process.stdout.write('body: ')
    console.log(req.body) // REMOVE ME
    if (username === 'simone' && password === 'bigsecret') {
        console.log('credentials verified');
        req.session.user = { id: 1, username: 'simone' }
    }
    if (req.session.visited) req.session.visited++
    else req.session.visited = 1;
    req.session.save(err => {
        if (err) throw err;
        res.status(200).send(req.session.user)
    })
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
    let tickets = await db.getValidTickets();
    // console.log(tickets);
    res.setHeader('Access-Control-Allow-Origin', '*').json(tickets);
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