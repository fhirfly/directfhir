import request from 'supertest';
import app from '../app';
import fs from 'fs';
import { doesNotMatch } from 'assert';
import {jest} from '@jest/globals'
import { Readable } from 'stream';

jest.mock('fs');
jest.mock('dotenv-safe');

// OPTION - 1
const mockedFS = jest.mocked(fs, true)

it('return 404 if there is not file', async () => {
  const listeners = [];
  try {
    const mockedFS = jest.mocked(fs, true)
    mockedFS.existsSync.mockImplementation(() => false);
    mockedFS.createReadStream.mockImplementationOnce(() => {
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

it('return file', async () => {
  const fileContent = 'hello world';
  
  try {
    const mockedFS = jest.mocked(fs, true)
    mockedFS.existsSync.mockImplementation(() => true);
    mockedFS.createReadStream.mockImplementationOnce(() => {
      return Readable.from(fileContent);
    });

    const response = await request(app)
      .get('/folder/file')
      .set({
        'Content-Type': 'application/fhir+json',
      })
      .responseType('text')

    console.log({
      response,
      // output,
    });
    //console.log(Buffer.from(response.body).toString());
    expect(Buffer.from(response.body).toString()).toBe(fileContent);
  } catch (err) {
    console.trace(err);
  }

});