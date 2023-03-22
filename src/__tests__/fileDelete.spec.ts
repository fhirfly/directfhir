import request from "supertest";
import app from "../app";
import fs from "fs";
import { jest } from "@jest/globals";

it("return 200 if file was deleted", async () => {
  try {
    const mockedFS = jest.mocked(fs, true)
    mockedFS.existsSync.mockImplementation(() => true);
    mockedFS.createWriteStream.mockImplementationOnce(() => {
      const response = request(app)
      .delete('/folder/file')
      .set({
        'Content-Type': 'application/json',
      })
      .send()
      .responseType('application/json');

      expect(response.statusCode).toBe(200);
      console.log({
        l: response.location,
        h: response.headers,
      });
    });
}
catch (err) {
    console.trace(err);
  }
});