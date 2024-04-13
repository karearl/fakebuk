import { Table, Column, Model, PrimaryKey, AutoIncrement, Unique, AllowNull, DataType } from 'sequelize-typescript';

@Table({ tableName: 'users', createdAt: 'created_at', updatedAt: 'updated_at' })
export class User extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    user_id!: number;

    @Unique
    @AllowNull(false)
    @Column(DataType.STRING(50))
    username!: string;

    @Unique
    @AllowNull(false)
    @Column(DataType.STRING(100))
    email!: string;

    @AllowNull(false)
    @Column(DataType.STRING(255))
    password_hash!: string;

    @Column(DataType.STRING(50))
    first_name?: string;

    @Column(DataType.STRING(50))
    last_name?: string;

    @Column(DataType.TIME)
    date_of_birth?: Date;

    @Column(DataType.ENUM('Male', 'Female', 'Other'))
    gender?: string;

    @AllowNull(false)
    @Column({ type: DataType.TIME, defaultValue: DataType.NOW })
    created_at!: Date;

    @AllowNull(false)
    @Column({ type: DataType.TIME, defaultValue: DataType.NOW })
    updated_at!: Date;

    @AllowNull(true)
    @Column({ type: DataType.STRING(255), defaultValue: null })
    reset_token?: string;

    @AllowNull(true)
    @Column({ type: DataType.TIME, defaultValue: null })
    reset_token_expiration?: Date;

    @AllowNull(true)
    @Column({ type: DataType.TIME, defaultValue: null})
    last_password_reset_at?: Date;
}