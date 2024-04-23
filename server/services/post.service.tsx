import jwt, { JwtPayload } from 'jsonwebtoken';
import { Post } from "../models/Post";
import { User } from "../models/User";


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
