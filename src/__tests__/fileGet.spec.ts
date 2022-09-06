import request from 'supertest';
import app from '../app';
import fs from 'fs';
import { Readable } from 'stream';
import MemoryStream from 'memorystream';

// import mockFs from  'mock-fs';

jest.mock('fs');
jest.mock('dotenv-safe');

it('return 404 if there is not file', async () => {
  const listeners = [];

  try {
    fs.existsSync.mockImplementation(() => false);
    fs.createReadStream.mockImplementationOnce(() => {
        return {
          on: (event, callback) => {
            listeners.push(callback);
            callback({
              code: 'ENOENT',
            });
          },
          pipe: () => {},
        }

    });

    const response = await request(app)
      .get('/folder/file')
      .set({
        'Content-Type': 'application/fhir+json',
      });

    expect(response.statusCode).toBe(404);
  } catch (err) {
    console.log(err);

    expect(err.statusCode).toBe(404);
  }
});

it.only('return file', async () => {
  const fileContent = 'hello world';
  try {
    fs.existsSync.mockImplementation(() => true);
    fs.createReadStream.mockImplementationOnce(() => {
      return Readable.from(fileContent);
    });

    const output = new MemoryStream();

    const response = await request(app)
      .get('/folder/file')
      .set({
        'Content-Type': 'application/fhir+json',
      })
      .responseType('blob')

    console.log({
      response,
      // output,
    });

    expect(response.rawResponse).toBe(fileContent);
  } catch (err) {
    console.trace(err);
    expect(err.statusCode).toBe(200);
    expect(err.rawResponse).toBe(fileContent);
  }
});