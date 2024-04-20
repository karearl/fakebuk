import { Table, Column, Model, PrimaryKey, DataType, ForeignKey } from 'sequelize-typescript';
import { User } from './User';
import { Comment } from './Comment';

@Table({ tableName: 'comment_likes' })
export class CommentLike extends Model {
    @PrimaryKey
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    user_id!: number;

    @PrimaryKey
    @ForeignKey(() => Comment)
    @Column(DataType.INTEGER)
    comment_id!: number;
}

export default CommentLike;