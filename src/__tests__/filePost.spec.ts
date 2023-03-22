import request from 'supertest';
import app from '../app';
import fs from 'fs';
import { jest } from '@jest/globals';

function binaryParser(res, callback) {
  res.setEncoding('binary');
  res.data = '';
  res.on('data', function (chunk) {
    res.data += chunk;
  });
  res.on('end', function () {
    callback(null, new Buffer(res.data, 'binary'));
  });
}

it('return 200 if folder was created', async () => {
  const mockedFS = jest.mocked(fs, true);

  const folder = 'folder';
  const url = `/${folder}`;

  mockedFS.writeFile.mockImplementationOnce((path, body, callback) => {
    console.log("write");
    callback();
  });

  const payload = {
    resourceType: 'Condition',
    meta: {
      profile: [
        'http://hl7.org/fhir/us/core/StructureDefinition/us-core-condition',
      ],
    },
    clinicalStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: 'active',
        },
      ],
    },
    verificationStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
          code: 'confirmed',
        },
      ],
    },
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-category',
            code: 'encounter-diagnosis',
            display: 'Encounter Diagnosis',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: '302870006',
          display: 'Hypertriglyceridemia (disorder)',
        },
      ],
      text: 'Hypertriglyceridemia (disorder)',
    },
    subject: {
      reference: 'urn:uuid:c1b1ad2b-f2f3-8e54-7833-19f4ca081945',
    },
    encounter: {
      reference: 'urn:uuid:389e7c01-989c-f89f-5852-8706097bdb30',
    },
    onsetDateTime: '1986-04-14T18:51:27-05:00',
    recordedDate: '1986-04-14T18:51:27-05:00',
  };

  const response = await request(app)
    .post(url)
    .set({
      'Content-Type': 'application/json',
    })
    .send(JSON.stringify(payload))
    .responseType('text');

  expect(response.statusCode).toBe(201);

  console.log({
    l: response.location,
    h: response.headers,
  });
});