import request from "supertest";
import app from "../app";
import fs from "fs";
import { jest } from "@jest/globals";

it("return 200 if file was deleted", async () => {
  const mockedFS = jest.mocked(fs, true);

  const folder = 'folder';
  const filename = 'filename';
  const url = `/${folder}/${filename}`;

  const payload = {
    resourceType: "Patient",
  };

  mockedFS.writeFile.mockImplementationOnce((path, body, callback) => {
    callback();
  });

  const response = await request(app)
    .put(url)
    .set({
      "Content-Type": "application/json",
    })
    .send(JSON.stringify(payload))
    .responseType("text");

  expect(response.statusCode).toBe(200);

  const [filepath, body] = mockedFS.writeFile.mock.calls[0];

  expect(filepath).toBe(`/tmp/gitfhir/${folder}/${filename}`);
  expect(body).toBe(JSON.stringify(payload));
});
