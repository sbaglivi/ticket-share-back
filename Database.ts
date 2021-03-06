import mysql, { RowDataPacket, FieldPacket } from 'mysql2';
import { Pool } from 'mysql2/promise';
import { escape, escapeId } from 'sqlstring';

const CONNECTION_OPTIONS = {
    host: 'localhost',
    user: 'simone',
    password: 'enomis',
    database: 'ticket_share',
    dateStrings: true

}

type queryResults = RowDataPacket[];
type queryFields = FieldPacket[];

class Database {
    pool: Pool;
    constructor() {
        this.pool = mysql.createPool(CONNECTION_OPTIONS).promise();
        this.deleteInvalidTickets();
        this.deleteOldTicketsAndCreateNewOnes();
    }
    async deleteOldTicketsAndCreateNewOnes() {
        await this.pool.query('TRUNCATE TABLE tickets');
        await this.createFakeTickets();
    }
    async getTest(): Promise<queryResults> {
        try {
            let [results, _]: [queryResults, queryFields] = await this.pool.query('SELECT * FROM time_test');
            return results;
        } catch (e) {
            throw e;
        }
    }
    async deleteById(table: string, id: number): Promise<queryResults> {
        try {
            let [results, _]: [queryResults, queryFields] = await this.pool.query(`DELETE FROM ?? WHERE id = ?`, [table, id]);
            return results;
        } catch (e) {
            throw e;
        }
    }
    buildUpdateString(tableName: string, fields: string[], values: string[], id: number): string {
        let str = `UPDATE ${escapeId(tableName)} SET ${escapeId(fields[0])} = ${escape(values[0])}`;
        if (fields.length > 1) {
            for (let i = 1; i < fields.length; i++) {
                str += `, ${escapeId(fields[i])} = ${escape(values[i])}`
            }
        }
        str += ` WHERE id = ${escape(id)}`;
        return str;
    }

    async createUser(username: string, hash: string): Promise<queryResults> {
        try {
            let [results, _]: [queryResults, queryFields] = await this.pool.query(`INSERT INTO users(username, hash) VALUES (?, ?)`, [username, hash]);
            return results
        } catch (e) {
            throw e;
        }
    }
    async updateUser(fields: string[], values: string[], id: number): Promise<queryResults> {
        try {
            let sqlString: string = this.buildUpdateString('users', fields, values, id);
            let [results, _]: [queryResults, queryFields] = await this.pool.query(sqlString);
            return results
        } catch (e) {
            throw e;
        }
    }
    async deleteUserById(id: number): Promise<queryResults> {
        try {
            let results: queryResults = await this.deleteById('users', id);
            return results;
        } catch (error) {
            throw error;
        }
    }
    async createTicket(price: number, datetime: string, sellerId: number, latitude: number, longitude: number): Promise<queryResults> {
        try {
            let [results, _]: [queryResults, queryFields] = await this.pool.query(`INSERT INTO tickets(price, datetime, seller_id, latitude, longitude) VALUES (?, ?, ?, ?, ?)`, [price, datetime, sellerId, latitude, longitude]);
            return results;
        } catch (e) {
            throw e;
        }
    }
    async getValidTickets(): Promise<queryResults> {
        try {
            let [results, _]: [queryResults, queryFields] = await this.pool.query(`SELECT * FROM tickets WHERE datetime > DATE_ADD(NOW(), INTERVAL 15 MINUTE)`);
            console.log(results.length)
            return results;
        } catch (e) {
            throw e;
        }
    }
    async deleteInvalidTickets(): Promise<void> {
        try {
            await this.pool.query(`DELETE FROM tickets WHERE datetime < DATE_ADD(NOW(), INTERVAL 15 MINUTE)`);
        } catch (e) {
            throw e;
        }
    }
    async createFakeTickets(): Promise<void> {
        const [minLat, maxLat] = [43.76908, 43.77723];
        const [minLong, maxLong] = [11.24296, 11.26631];
        const [minPrice, maxPrice] = [0, 1.25]; // here step is 0.05
        const priceStep = 0.05;
        const user = {
            username: 'simone',
            id: 1
        };
        let today = new Date();
        let [currentMinutes, currentHours] = [today.getMinutes(), today.getHours()];
        let maxOffsetInMinutes = (23 * 60 + 59) - (currentHours * 60 + currentMinutes);
        let minOffsetInMinutes = 20;
        const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        try {
            for (let i = 0; i < 10; i++) {
                let price = Math.floor(((maxPrice - minPrice) / priceStep + 1) * Math.random()) * priceStep + minPrice;
                price = Math.round(price * 100) / 100; // strips away small numbers from float operations
                let lat = Math.random() * (maxLat - minLat) + minLat;
                let long = Math.random() * (maxLong - minLong) + minLong;
                let minutesOffset = Math.floor((maxOffsetInMinutes - minOffsetInMinutes + 1) * Math.random()) + minOffsetInMinutes;
                let time = this.calculateTimeAfterOffset(currentHours, currentMinutes, minutesOffset);
                let datetime = `${date} ${time}:00`;
                await this.createTicket(price, datetime, user.id, lat, long);
            }
        } catch (e) {
            throw e;
        }
    }
    calculateTimeAfterOffset(hours: number, minutes: number, minutesOffset: number): string {
        let minutesToAdd = minutesOffset % 60;
        let hoursToAdd = Math.floor(minutesOffset / 60);
        let newMinutes, newHours;
        if (minutes + minutesToAdd > 59) {
            hoursToAdd++;
            newMinutes = (minutes + minutesToAdd) % 60;
        } else {
            newMinutes = minutes + minutesToAdd;
        }
        newHours = hours + hoursToAdd;
        return (`${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`)
    }
}

export default new Database();