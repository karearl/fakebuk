import { Table, Column, Model, PrimaryKey, AutoIncrement, DataType, ForeignKey } from 'sequelize-typescript';
import { User } from './User';

@Table({ tableName: 'posts', createdAt: 'created_at', updatedAt: false})
export class Post extends Model {
    
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    post_id!: number;

    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    user_id!: number;

    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    original_poster_id!: number;

    @Column(DataType.TEXT)
    content!: string;

    @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
    created_at!: Date;
}