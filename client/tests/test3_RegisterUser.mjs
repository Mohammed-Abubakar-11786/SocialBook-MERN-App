// tests/test.mjs
import { Builder, By, until } from "selenium-webdriver";
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

  it("should successfully register a new user", async function () {
    await driver.get("http://localhost:5173/signup");

    // Fill out the form
    await driver.findElement(By.name("username")).sendKeys("TestUser8");
    await driver
      .findElement(By.name("email"))
      .sendKeys("testuser8@example.com");
    await driver.findElement(By.name("password")).sendKeys("Password123");
    await driver
      .findElement(By.name("confirmPassword"))
      .sendKeys("Password123");

    // Upload a dummy image (adjust the path to an actual image on your system)
    const fileInput = await driver.findElement(By.id("imageInp"));
    await fileInput.sendKeys("C:/abuzar documents/abuzar (1).jpg");

    // Click the signup button
    await driver.findElement(By.css('button[type="submit"]')).click();

    // Wait for the manual flash success element to be displayed
    await driver.wait(
      until.elementLocated(By.css("#manualflashSuccess")),
      10000
    );

    // Locate the SuccMsg element within the manual flash success container
    const successMessageElement = await driver.findElement(
      By.css("#manualflashSuccess #SuccMsg")
    );

    // Get the text of the success message
    const successMessageText = await successMessageElement.getText();

    // Verify the success message text
    expect(successMessageText).to.equal("");

    // "Welcome 🫡 Abubakar You Are Logged In 😀 🎉🎉🎉"
    // Wait for the URL to change to the login page
    await driver.wait(
      async function () {
        return (await driver.getCurrentUrl()) === "http://localhost:5173/login";
      },
      10000,
      "URL did not change to the login page"
    );

    // Verify the URL has changed
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.equal("http://localhost:5173/login");
  });
});
