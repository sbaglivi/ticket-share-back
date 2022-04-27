import { Connection } from 'mysql2';
import mysql, {RowDataPacket, FieldPacket} from 'mysql2';
import {Pool} from 'mysql2/promise';
import { PoolConnection } from 'mysql2/promise';
import {format, escape, escapeId} from 'sqlstring';

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
    async getTest():Promise<queryResults>{
        try {
        let [results, _]:[queryResults, queryFields]= await this.pool.query('SELECT * FROM time_test');
        return results;
        } catch(e) {
            throw e;
        }
    }
    async deleteById(table:string, id:number):Promise<queryResults>{
        try {
            let [results, _]:[queryResults, queryFields] = await this.pool.query(`DELETE FROM ?? WHERE id = ?`, [table, id]);
            return results;
        } catch (e) {
            throw e;
        }
    }
    buildUpdateString(tableName:string, fields:string[], values:string[], id:number):string{
        let str = `UPDATE ${escapeId(tableName)} SET ${escapeId(fields[0])} = ${escape(values[0])}`;
        if(fields.length > 1){
            for(let i=1; i<fields.length; i++){
                str += `, ${escapeId(fields[i])} = ${escape(values[i])}`
            }
        }
        str += ` WHERE id = ${escape(id)}`;
        return str;
    }

    async createUser(username:string, hash:string):Promise<queryResults> {
        try {
            let [results, _]:[queryResults, queryFields] = await this.pool.query(`INSERT INTO users(username, hash) VALUES (?, ?)`, [username, hash]);
            return results
        } catch(e) {
            throw e;
        }
    }
    async updateUser(fields:string[], values:string[], id:number):Promise<queryResults>{
        try {
            let sqlString:string = this.buildUpdateString('users', fields, values, id);
            let [results, _]:[queryResults, queryFields] = await this.pool.query(sqlString);
            return results
        } catch(e) {
            throw e;
        }
    }
    async deleteUserById(id:number):Promise<queryResults>{
        try {
            let results:queryResults = await this.deleteById('users', id);
            return results; 
        } catch (error) {
           throw error; 
        }
    }
    async createTicket(price:number, expireTime: string, sellerId:number, latitude:number, longitude:number):Promise<queryResults>{
        try {
            let [results, _]:[queryResults, queryFields] = await this.pool.query(`INSERT INTO tickets(price, expire_time, seller_id, latitude, longitude) VALUES (?, ?, ?, ?, ?)`, [price, expireTime, sellerId, latitude, longitude]);
            return results;
        } catch (e) {
           throw e; 
        }
    }
}

export default new Database();