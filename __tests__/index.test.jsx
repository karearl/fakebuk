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

describe('Test /', () => {
    test('=> GET 200', async () => {
        const response = await request(server).get("/");
        expect(response.statusCode).toBe(200);
    });
});

describe('Test /register', () => {
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

describe('Test /login', () => {
    test('=> POST 200', async () => {
        const response = await request(server).post("/login").send({
            username: 'testuser@example.com',
            password: 'Passw0rd!'
        });
        expect(response.statusCode).toBe(307);
    });
});

describe('Test /users/Test.User567', () => {
    test('=> GET 200', async () => {
        const response = await request(server).get("/users/Test.User567");
        expect(response.statusCode).toBe(200);
    });
});

describe('Test /forgotPassword', () => {
    test('=> GET 200', async () => {
        const response = await request(server).get("/forgotPassword");
        expect(response.statusCode).toBe(200);
    });
});


test("checkPassword returns user if password is correct", async () => {
  const user = await checkPassword("jackie.chan@live.com", "q153246Q");
  expect(user.username).toBe("Jackie.Chan385");
});

test("checkPassword returns null if email is incorrect", async () => {
    const user = await checkPassword("wrong", "q153246Q");  
    expect(user).toBeNull();
});

test("checkPassword returns null if email is correct but password is incorrect", async () => {
    const user = await checkPassword("jackie.chan@live.com", "wrong");
    expect(user).toBeNull();
});

afterAll(async () => {
   await sequelize.close();
});