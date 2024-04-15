import { SequelizeOptions } from 'sequelize-typescript';

if (!process.env.MYSQL_ROOT_PASSWORD || !process.env.MYSQL_DATABASE || !process.env.MYSQL_USER) {
    console.error('Missing required environment variable. Check your .env file or environment variables.');
    process.exit(1);
}

export const sequelizeOptions: SequelizeOptions = {
    dialect: 'mysql',
    host: 'localhost',
    port: 3306,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE
};