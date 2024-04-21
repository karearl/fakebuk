import { Sequelize } from 'sequelize-typescript';
import { sequelizeOptions } from '../config';
import { User } from './models/User';
import { Post } from './models/Post';
import { Image } from './models/Image';
import { Comment } from './models/Comment';
import { PostLike } from './models/PostLike';
import { CommentLike } from './models/CommentLike';
import { Op } from 'sequelize';
import bcrypt = require('bcryptjs');
import crypto from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';


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

export const isTokenExpired = async (token: Date) => {
    return token < new Date();
}

export  const sendResetTokenEmail = async (email: string, token: string, expiration: Date) => {
    const user = await User.findOne({ where: { email: { [Op.eq]: email } } });
    if (!user) {
        throw new Error('No user with this email address exists');
    }
    console.log('Sending reset token email to:', email);
    console.log('Reset token:', token);
    // Send email here
}

export const generateResetToken = () => {
    return crypto.randomBytes(20).toString('hex');
  };
  

export const storeResetToken = async (email: string, token: string) => {
    const user = await User.findOne({ where: { email: { [Op.eq]: email } } });
    if (!user) {
        throw new Error('No user with this email address exists');
    }
    console.log('Storing reset token:', token);
    user.reset_token = token;
    user.reset_token_expiration = new Date(Date.now() + 3600000);
    console.log('Token expiration:', user.reset_token_expiration);
    await user.save();
};

export const getTokenExpiration = async (email: string) => {
    const user = await User.findOne({ where: { email: { [Op.eq]: email } } });
    if (!user) {
        throw new Error('No user with this email address exists');
    }
    return user.reset_token_expiration as Date;
}

export const resetPassword = async (email: string, token: string, newPassword: string) => {
    const user = await User.findOne({ where: { email: { [Op.eq]: email } } });
    console.log('Resetting password for user:', user?.user_id);
    
    if (!user) {
        throw new Error('No user with this email address exists');
    }

    if (user.reset_token !== token) {
        throw new Error('Invalid reset token');
    }

    if (user.reset_token_expiration && user.reset_token_expiration < new Date()) {
        throw new Error('Reset token has expired');
    }




    console.log('Reset token:', user.reset_token);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password_hash = hashedPassword;
    console.log('old password:', user.password_hash, 'new password:', hashedPassword);
    user.reset_token = null as unknown as string;
    user.reset_token_expiration = null as unknown as Date;
    user.last_password_reset_at = new Date();
    await user.save();
    return user.reset_token;
};


export const registerUser = async (email: string, password: string, firstname: string, lastname: string, birthdate: Date, gender: string) => {
    // Check if a user with the given email already exists
    const existingUser = await User.findOne({ where: { email: { [Op.eq]: email } } });
    const hashedPassword = await bcrypt.hash(password, 10);
    if (existingUser) {
        throw new Error('A user with this email already exists');
    }

    try {
        await User.create({
            username: email.split('@')[0] + Math.floor(Math.random() * 1000),
            email: email,
            password_hash: hashedPassword,
            first_name: firstname,
            last_name: lastname,
            date_of_birth: birthdate,
            gender: gender,
            created_at: new Date(),
            updated_at: new Date()
        });
    } catch (error) {
        console.error('Error during registration:', error);
    }
};
export const checkEmailExists = async (email: string) => {
    return User.findOne({
        where: {
            email: email
        }
    });
}

export const updateProfilePicture = async (token: string, url: string) => {
    try {
        const secret = process.env.JWT_SECRET as string;
        const decoded: JwtPayload = jwt.verify(token, secret) as JwtPayload;
        const userId = decoded.id;

        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        user.profile_picture = url;
        await user.save();
    } catch (error) {
        console.error('Error updating profile picture:', error);
        throw error;
    }
};

export const authenticateUser = async (email: string, password: string) => {
    const user = await User.findOne({
        where: {
            email: email
        }
    });
    if (user && await bcrypt.compare(password, user.password_hash)) {
        return user;
    }
    return null;
};

export const checkPassword = async (email: string, password: string) => {
    const user = await User.findOne({ where: { email: email } });
    if (user && await bcrypt.compare(password, user.password_hash)) {
        return user;
    } else {
        return null;
    }
};

export const getUserByUsername = async (username: string) => {
    try {
        return await User.findOne({
            where: {
                username: username
            }
        });
    }
    catch (error) {
        console.error(`Error fetching user with username ${username}:`, error);
        throw error;
    }
}

export const getPostsForUser = async (user: User) => {
    try {
        return Post.findAll({
            where: {
                user_id: user.user_id
            }
        });
    }
    catch (error) {
        console.error(`Error fetching posts for ${user.username}`, error);
        throw error;
    }
}

export const getAllPosts = async () => {
    try {
        return Post.findAll();
    }
    catch (error) {
        console.error('Error fetching all posts:', error);
        throw error;
    }
}

export const addPost = async (token: string, content: string) => {
    const secret = process.env.JWT_SECRET as string;
    const decoded: JwtPayload = jwt.verify(token, secret) as JwtPayload;
    const user = await User.findByPk(decoded.id);
    if (!user) {
        throw new Error('User not found');
    }
    return Post.create({
        user_id: user.user_id,
        content: content,
        created_at: new Date()
    });
}

export const getPostById = async (id: number) => {
    try {
        return await Post.findOne({
            where: {
                post_id: id
            }
        });
    }
    catch (error) {
        console.error(`Error fetching post with id ${id}:`, error);
        throw error;
    }
}

export const addComment = async (user: User, post: Post, content: string) => {
    return Comment.create({
        user_id: user.user_id,
        post_id: post.post_id,
        content: content,
        created_at: new Date()
    });
}

export const getCommentsForPost = async (post: Post) => {
    try {
        return Comment.findAll({
            where: {
                post_id: post.post_id
            }
        });
    }
    catch (error) {
        console.error(`Error fetching comments for post ${post.post_id}`, error);
        throw error;
    }
}

export const deleteAllPosts = async () => {
    try {
        return Post.destroy({
            where: {}
        });
    }
    catch (error) {
        console.error('Error deleting all posts:', error);
        throw error;
    }
}

export const deleteAllComments = async () => {
    try {
        return Comment.destroy({
            where: {}
        });
    }
    catch (error) {
        console.error('Error deleting all comments:', error);
        throw error;
    }
}

export const getUserById = async (id: number) => {
    try {
        return await User.findOne({
            where: {
                user_id: id
            }
        });
    }
    catch (error) {
        console.error(`Error fetching user with id ${id}:`, error);
        throw error;
    }
}

export const getSafeAllUsers = async () => {
    try {
        return await User.findAll({
            attributes: ['username', 'first_name', 'last_name', 'date_of_birth', 'gender']
        }); 
    }
    catch (error) {
        console.error('Error fetching all users:', error);
        throw error;
    }
}

export const getSafeUserByUsername = async (username: string) => {
    try {
        const user = await User.findOne({
            where: {
                username: username
            },
            attributes: ['username', 'first_name', 'last_name', 'date_of_birth', 'gender']  // Only return these attributes
        });

        if (!user) {
            return { message: `User with username ${username} does not exist.`};
        }

        return user;
    }
    catch (error) {
        console.error(`Error fetching user with username ${username}:`, error);
        throw error;
    }
}


export const getUserByEmail = async (email: string) => {
    try {
        console.log('Fetching user with email:', email);
        return await User.findOne({
            where: {
                email: email
            }
        });
    } catch (error) {
        console.error(`Error fetching user with email ${email}:`, error);
        throw error;
    }
};

export const getUserFromToken = async (token: string) => {
    try {
        return await User.findOne({
            where: {
                reset_token: token
            }
        });

    } catch (error) {
        console.error(`Error fetching user with reset token ${token}:`, error);
        throw error;
    }
}

export const getEmailFromToken = async (token: string) => {
    try {
        return await User.findOne({
            where: {
                reset_token: token
            }
        });
    } catch (error) {
        console.error(`Error fetching user with reset token ${token}:`, error);
        throw error;
    }
}

export const getAllUsers = async () => {
    return User.findAll();
};

export default setupDatabase;