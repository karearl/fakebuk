import { Sequelize } from 'sequelize-typescript';
import { sequelizeOptions } from '../config';
import { Comment } from './models/Comment';
import { CommentLike } from './models/CommentLike';
import { Image } from './models/Image';
import { Post } from './models/Post';
import { PostLike } from './models/PostLike';
import { User } from './models/User';

export const sequelize = new Sequelize({
    ...sequelizeOptions,
    models: [User, Post, Image, Comment, PostLike, CommentLike]
});

export const setupDatabase = async (): Promise<Sequelize> => {
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`)
    if (process.env.NODE_ENV !== 'test') {
        console.log(`Connecting to database at ${sequelizeOptions.host}`)
        try {
            await sequelize.authenticate();
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    }
    return sequelize;
};

export default setupDatabase;