// tests/test.mjs
import { Builder, By, Key, until } from "selenium-webdriver";
import { expect } from "chai";
import { describe, before, after, it } from "mocha";
import "chromedriver";

describe("React App Selenium Tests - online Test", function () {
  this.timeout(60000); // Extend default Mocha timeout as Selenium tests can take a while

  let driver;

  before(async function () {
    driver = await new Builder().forBrowser("chrome").build();
  });

  after(async function () {
    await driver.quit();
  });

  it("should logout user Abubakar", async function () {
    await driver.get("http://localhost:5173/login");
    await driver.findElement(By.name("username")).sendKeys("Abubakar");
    await driver.findElement(By.name("password")).sendKeys("7861", Key.RETURN);
    // Wait for the welcome message to be displayed
    await driver.wait(until.elementLocated(By.id("SuccMsg")), 10000);

    // Verify the welcome message
    const welcomeMessage = await driver.findElement(By.id("SuccMsg")).getText();
    console.log(welcomeMessage);
    expect(welcomeMessage).to.equal("");
    await driver.sleep(4000);
    // Click the profile button
    const settingBtn = await driver.findElement(
      By.css('img[class="w-10 h-12 rounded-full ml-4"]')
    );
    await settingBtn.click();
    await driver.sleep(1000);

    // Click the logout button
    const logoutBtn = await driver.findElement(
      By.css(
        'div[class="settingUserInfo flex items-center mb-2 cursor-pointer"]'
      )
    );
    await logoutBtn.click();
    await driver.sleep(3000);
  });
});
