import { Table, Column, Model, PrimaryKey, AutoIncrement, DataType, ForeignKey } from 'sequelize-typescript';
import { Post } from './Post';
import { User } from './User';


@Table({ tableName: 'comments', createdAt: 'created_at', updatedAt: false})
export class Comment extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    comment_id!: number;

    @ForeignKey(() => Post)
    @Column(DataType.INTEGER)
    post_id!: number;

    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    user_id!: number;

    @Column(DataType.TEXT)
    content!: string;

    @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
    created_at!: Date;
}

export default Comment;