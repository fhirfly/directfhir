import request from 'supertest';
import app from '../app';
import fs from 'fs';
import { jest } from '@jest/globals';
import { Readable } from 'stream';

it('return try to do a search', async () => {
  const fileContent = {
    entry: [{ id: 'data' }],
    id: '0245f397-6g82-427a-bf00-100000000000',
    meta: { lastUpdated: '' },
    resourceType: 'Bundle',
    total: 1,
    type: 'searchset',
  };

  try {
    const mockedFS = jest.mocked(fs, true)
    mockedFS.existsSync.mockImplementation(() => true);
    mockedFS.createReadStream.mockImplementationOnce(() => {
      return Readable.from(fileContent.string);
    });

    const response = await request(app)
      .get('/folder/file?_id=123')
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
