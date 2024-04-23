import jwt, { JwtPayload } from 'jsonwebtoken';
import { Op } from 'sequelize';
import { User } from "../models/User";
import bcrypt = require('bcryptjs');

export const registerUser = async (email: string, password: string, firstname: string, lastname: string, birthdate: Date, gender: string) => {
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
};


export const checkPassword = async (email: string, password: string) => {
    const user = await User.findOne({ where: { email: email } });
    if (user && await bcrypt.compare(password, user.password_hash)) {
        return user;
    } else {
        return null;
    }
};

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

export const checkEmailExists = async (email: string) => {
    return User.findOne({
        where: {
            email: email
        }
    });
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
};

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
};

export const getAllUsers = async () => {
    return User.findAll();
};

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
};

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
};