import { Table, Column, Model, PrimaryKey, AutoIncrement, Unique, AllowNull, Default, DataType } from 'sequelize-typescript';

@Table({ tableName: 'Users', timestamps: false })
export class User extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    UserID!: number;

    @Unique
    @Column(DataType.STRING(50))
    Username!: string;

    @Unique
    @Column(DataType.STRING(100))
    Email!: string;

    @Column(DataType.STRING(255))
    Password!: string;

    @Column(DataType.STRING(100))
    FullName!: string;

    @Column(DataType.STRING(100))
    FirstName!: string;

    @Column(DataType.STRING(100))
    LastName!: string;

    @AllowNull
    @Column(DataType.DATE)
    BirthDate!: Date;

    @AllowNull
    @Column(DataType.ENUM('Male', 'Female', 'Other'))
    Gender!: string;

    @AllowNull
    @Column(DataType.STRING(100))
    Location!: string;

    @AllowNull
    @Column(DataType.TEXT)
    About!: string;

    @AllowNull
    @Column(DataType.STRING(255))
    ProfilePicture!: string;

    @AllowNull
    @Column(DataType.STRING(255))
    CoverPhoto!: string;

    @Default(DataType.NOW)
    @Column(DataType.DATE)
    JoinedDate!: Date;
}