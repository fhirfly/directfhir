import request from 'supertest';
import app from '../app';
import fs from 'fs';
import { jest } from '@jest/globals';
import { Readable } from 'stream';

it('return metadata', async () => {
  const mockedFS = jest.mocked(fs, true);

  const folder = 'metadata';
  const url = `/${folder}`;

  const fileContent = 'hello world';
  mockedFS.createReadStream.mockImplementationOnce(() => {
    return Readable.from(fileContent);
  });

  const response = await request(app)
    .get(url)
    .set({
      'Content-Type': 'application/fhir+json',
    })
    .responseType('text');

  expect(response.status).toBe(200);
  expect(Buffer.from(response.body).toString()).toBe(fileContent);
});

it('return try to do a search', async () => {
  const mockedFS = jest.mocked(fs, true);

  const folder = 'search';
  const url = `/${folder}?_id=123`;

  const fileContent = 'hello world';
  mockedFS.createReadStream.mockImplementationOnce(() => {
    return Readable.from(fileContent);
  });

  const response = await request(app)
    .get(url)
    .set({
      'Content-Type': 'application/fhir+json',
    })
    .responseType('text');

  expect(response.status).toBe(400);
  expect(Buffer.from(response.body).toString()).toBe('Bad Request');
});

it('return bundle baed on files', async () => {
  const mockedFS = jest.mocked(fs, true);

  const folder = 'Patient';
  const url = `/${folder}`;

  const fileContent = 'hello world';

  mockedFS.readdir.mockImplementationOnce((path, callback) => {
    callback(null, ['1.json']);
  });

  mockedFS.readFile.mockImplementationOnce((path, callback) => {
    callback(
      null,
      JSON.stringify({
        id: 'data',
      }),
    );
  });

  const response = await request(app)
    .get(url)
    .set({
      'Content-Type': 'application/fhir+json',
    })
    .responseType('text');

  expect(response.status).toBe(200);

  expect(JSON.parse(Buffer.from(response.body).toString())).toEqual({
    entry: [{ id: 'data' }],
    id: '0245f397-6g82-427a-bf00-100000000000',
    meta: { lastUpdated: '' },
    resourceType: 'Bundle',
    total: 1,
    type: 'searchset',
  });
});
