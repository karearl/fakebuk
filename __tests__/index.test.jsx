// FILEPATH: /f:/Code/HTML/fakebuk/__tests__/index.test.tsx
jest.mock('../src/index', () => ({
  server: {
    get: jest.fn().mockImplementation((url, callback) => callback({}, {
      status: (code) => ({
        send: (response) => ({ code, response }),
      }),
    })),
    post: jest.fn().mockImplementation((url, callback) => callback({}, {
      status: (code) => ({
        send: (response) => ({ code, response }),
      }),
    })),
    address: jest.fn().mockReturnValue({ port: 3000 }),
  },
}));

import request from 'supertest';
import { server } from '../src/index';
import { checkPassword, sequelize } from "../src/database";

describe('/', () => {
    test('=> GET 200', async () => {
        const response = await request(server).get("/");
        expect(response.statusCode).toBe(200);
    });
});

describe('/register', () => {
    test('=> GET 200', async () => {
        const response = await request(server).get("/register");
        expect(response.statusCode).toBe(200);
    });

    test('=> POST 303 ', async () => {
        const response = await request(server).post("/register").send({
            firstName: 'Test',
            lastName: 'User',
            newEmail: 'testuser@example.com',
            newPassword: 'Passw0rd!',
            birthday: '2000-01-01',
            gender: 'male'
        });
        expect(response.statusCode).toBe(303);
    });
});

describe('/login', () => {
    test('=> POST 200', async () => {
        const response = await request(server).post("/login").send({
            username: 'testuser@example.com',
            password: 'Passw0rd!'
        });
        expect(response.statusCode).toBe(307);
    });
});

describe('/users/${username}', () => {
    test('=> GET 200', async () => {
        const response = await request(server).get("/users/Test.User567");
        expect(response.statusCode).toBe(200);
    });
});

describe('/forgotPassword', () => {
    test('=> GET 200', async () => {
        const response = await request(server).get("/forgotPassword");
        expect(response.statusCode).toBe(200);
    });
});


describe('checkPassword(${correct_email}, ${correct_password})', () => {
    test("=> ${correct_username}", async () => {
        const user = await checkPassword("jackie.chan@live.com", "q153246Q");
        expect(user.username).toBe("Jackie.Chan385");
    });
});

describe('checkPassword(${wrong_email}, ${correct_password})', () => {
    test("=> NULL", async () => {
        const user = await checkPassword("wrong@email.com", "q153246Q");  
        expect(user).toBeNull();
    });
});

describe('checkPassword(${correct_email}, ${wrong_password})' , () => {
    test("=> NULL", async () => {
        const user = await checkPassword("jackie.chan@live.com", "wrong");
        expect(user).toBeNull();
    });
});

afterAll(async () => {
   await sequelize.close();
});