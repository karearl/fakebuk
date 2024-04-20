import { Table, Column, Model, PrimaryKey, DataType, ForeignKey } from 'sequelize-typescript';
import { Post } from './Post';
import { User } from './User';

@Table({ tableName: 'post_likes' })
export class PostLike extends Model {
    @PrimaryKey
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    user_id!: number;

    @PrimaryKey
    @ForeignKey(() => Post)
    @Column(DataType.INTEGER)
    post_id!: number;
}

export default PostLike;