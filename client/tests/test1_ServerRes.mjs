// tests/test.mjs
import { Builder, By, Key, until } from "selenium-webdriver";
import { expect } from "chai";
import { describe, before, after, it } from "mocha";
import "chromedriver";

describe("React App Selenium Test", function () {
  this.timeout(30000); // Extend default Mocha timeout as Selenium tests can take a while

  let driver;

  before(async function () {
    driver = await new Builder().forBrowser("chrome").build();
  });

  after(async function () {
    await driver.quit();
  });

  it("Server Responds Success", async function () {
    await driver.get("http://localhost:5173/"); // Replace with your React app URL
    const title = await driver.getTitle();
    expect(title).to.equal("Vite + React"); // Replace with your actual title
  });
});
