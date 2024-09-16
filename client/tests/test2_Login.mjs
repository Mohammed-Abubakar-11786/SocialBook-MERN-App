// tests/test.mjs
import { Builder, By, Key, until } from "selenium-webdriver";
import { expect } from "chai";
import { describe, before, after, it } from "mocha";
import "chromedriver";

describe("React App Selenium Test", function () {
  this.timeout(60000); // Extend default Mocha timeout as Selenium tests can take a while

  let driver;

  before(async function () {
    driver = await new Builder().forBrowser("chrome").build();
  });

  after(async function () {
    await driver.quit();
  });

  it("should log in a user", async function () {
    await driver.get("http://localhost:5173/login");
    await driver.findElement(By.name("username")).sendKeys("Abubakar");
    await driver.findElement(By.name("password")).sendKeys("7861", Key.RETURN);
    // Wait for the welcome message to be displayed
    await driver.wait(until.elementLocated(By.id("SuccMsg")), 10000);

    // Verify the welcome message
    const welcomeMessage = await driver.findElement(By.id("SuccMsg")).getText();
    console.log(welcomeMessage);
    expect(welcomeMessage).to.equal("");
  });
});
