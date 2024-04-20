import { Table, Column, Model, PrimaryKey, AutoIncrement, DataType, ForeignKey } from 'sequelize-typescript';
import { Post } from './Post';

@Table({ tableName: 'images', createdAt: 'created_at' })
export class Image extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    image_id!: number;

    @ForeignKey(() => Post)
    @Column(DataType.INTEGER)
    post_id!: number;

    @Column(DataType.STRING)
    image_url!: string;

    @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
    created_at!: Date;
}

export default Image;