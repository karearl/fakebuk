import { Sequelize } from 'sequelize-typescript';
import { User } from '../entities/User';
import { Op } from 'sequelize';

const sequelize = new Sequelize({
    dialect: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'q153246Q',
    database: 'fakebuk',
    models: [User],
});

export const setupDatabase = async (): Promise<Sequelize> => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
    return sequelize;
};

export const registerUser = async (email: string, password: string, firstname: string, lastname: string, birthdate: Date, gender: string) => {
    // Check if a user with the given email already exists
    const existingUser = await User.findOne({ where: { Email: { [Op.eq]: email } } });

    if (existingUser) {
        throw new Error('A user with this email already exists');
    }

    await User.create({
        Username: email.split('@')[0],
        Email: email,
        Password: password, // Remember to hash the password before storing
        FullName: firstname + ' ' + lastname,
        FirstName: firstname,
        LastName: lastname,
        BirthDate: birthdate,
        Gender: gender
    });
};



export const checkEmailExists = async (email: string) => {
    return User.findOne({
        where: {
            Email: email
        }
    });
}

export const loginUser = async (email: string, password: string) => {
    return User.findOne({
        where: {
            Email: email,
            Password: password
        }
    });
};

export const checkPassword = async (email: string, password: string) => {
    return User.findOne({
        where: {
            Email: email,
            Password: password
        }
    });
};

export const getUserByFullName = async (firstName: string, lastName: string) => {
    return User.findOne({
        where: {
            FullName: firstName + ' ' + lastName
        }
    });
}

export const getUserByEmail = async (email: string) => {
    try {
        return await User.findOne({
            where: {
                Email: email
            }
        });
    } catch (error) {
        console.error(`Error fetching user with email ${email}:`, error);
        throw error;
    }
};

export const getAllUsers = async () => {
    return User.findAll();
};

export default setupDatabase;