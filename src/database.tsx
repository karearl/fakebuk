import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/User';
import { Op } from 'sequelize';
import bcrypt = require('bcryptjs');
import crypto from 'crypto';

export const sequelize = new Sequelize({
    dialect: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'q153246Q',
    database: 'fakebuk',
    models: [User]
});

export const setupDatabase = async (): Promise<Sequelize> => {
    if (process.env.NODE_ENV !== 'test') {
        try {
            await sequelize.authenticate();
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    }
    return sequelize;
};

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
            gender: gender
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