import request from "supertest";
import app from "../app";
import fs from "fs";
import { jest } from "@jest/globals";

it("return 200 if file was deleted", async () => {
  const mockedFS = jest.mocked(fs, true);

  const folder = 'folder';
  const filename = 'filename';
  const url = `/${folder}/${filename}`;

  mockedFS.unlink.mockImplementationOnce((path, callback) => {
    callback(filename, null);
  });

  const response = await request(app)
    .delete(url)
    .set({
      "Content-Type": "application/fhir+json",
    })
    .responseType("text");

  expect(response.statusCode).toBe(200);
});