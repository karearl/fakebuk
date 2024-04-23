import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { User } from "../models/User";

export const isTokenExpired = async (token: Date) => {
    return token < new Date();
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

export  const sendResetTokenEmail = async (email: string, token: string, expiration: Date) => {
    const user = await User.findOne({ where: { email: { [Op.eq]: email } } });
    if (!user) {
        throw new Error('No user with this email address exists');
    }
    console.log('Sending reset token email to (notrly!):', email);
    console.log('Reset token:', token);
    // Send email here
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
};

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

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password_hash = hashedPassword;
    user.reset_token = null as unknown as string;
    user.reset_token_expiration = null as unknown as Date;
    user.last_password_reset_at = new Date();
    await user.save();
    return user.reset_token;
};
