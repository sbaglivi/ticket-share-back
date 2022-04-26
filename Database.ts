import { Connection } from 'mysql2';
import mysql, {RowDataPacket, FieldPacket} from 'mysql2';
import {Pool} from 'mysql2/promise';
import { PoolConnection } from 'mysql2/promise';

const CONNECTION_OPTIONS = {
    host: 'localhost',
    user: 'simone',
    password: 'enomis',
    database: 'ticket_share'
}
// let [err, results] = await connection.execute('SELECT * FROM test');

type queryResults = RowDataPacket[];
type queryFields = FieldPacket[];

class Database {
    pool: Pool;
    constructor(){
        this.pool = mysql.createPool(CONNECTION_OPTIONS).promise();
    }
    async getTest(){
        try {
        let [results, _]:[queryResults, queryFields]= await this.pool.query('SELECT * FROM test');
        return results;
        } catch(e) {
            throw e;
        }
    }
}

export default new Database();

/*
ticket
- id 
- price
- expireTime
- sellerId
- location

landing page is split in half: buy or sell
buy sends to map that shows points for tickets
there is an alternative buy view that uses a table
it would be helpful to have a prompt to use location or search bar to get user position or where he's looking.
Then I can use this position to center the map on it or show on the table distance from point.

sell is similar to submit page

*/
