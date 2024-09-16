import { Builder, By, until } from "selenium-webdriver";
// import { expect } from "chai";
import path from "path"; // For handling file paths
import { getDirname } from "./utils.mjs";
import { describe, before, after, it } from "mocha";

const __dirname = getDirname(import.meta.url);

describe("Web Chat Application Tests - Image Sending", function () {
  this.timeout(70000);
  let senderDriver, receiverDriver;

  before(async function () {
    senderDriver = await new Builder().forBrowser("chrome").build();
    receiverDriver = await new Builder().forBrowser("chrome").build();

    // Login for Sender
    await senderDriver.get("http://localhost:3000/email");
    await login(senderDriver, "demo@gmail.com", "1234");

    // Login for Receiver
    await receiverDriver.get("http://localhost:3000/email");
    await login(receiverDriver, "demo1@gmail.com", "1234");

    // Navigate to chat interfaces
    await senderDriver.get("http://localhost:3000/66af0c0b1ed5a6d184063d52"); // Sender chat URL
    await receiverDriver.get("http://localhost:3000/66af0b931ed5a6d184063d2f"); // Receiver chat URL

    // Wait for the chat input field to be visible on both sides
    await senderDriver.wait(until.elementLocated(By.id("text")), 20000);
    await receiverDriver.wait(until.elementLocated(By.id("text")), 20000);
  });

  after(async function () {
    await senderDriver.quit();
    await receiverDriver.quit();
  });

  it("should send an image", async function () {
    // Step 1: Open the image upload options
    const plusIconButton = await senderDriver.findElement(
      By.className(
        "flex justify-center items-center w-11 h-11 rounded-full hover:bg-primary hover:text-white"
      )
    );
    await plusIconButton.click();

    // Step 2: Click on the image upload option
    const imageOption = await senderDriver.findElement(
      By.className(
        "flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer"
      )
    );
    await imageOption.click();

    // Step 3: Upload an image
    // Locate the hidden file input element

    // Provide the path to the image
    const imagePath = path.resolve(
      __dirname,
      "C:\\Users\\adity\\Downloads\\demo.jpeg"
    ); // Adjust path as needed
    await senderDriver.findElement(By.id("uploadImage")).sendKeys(imagePath);
    await senderDriver.sleep(5000);

    // Step 4: Send the image
    const sendButtonSender = await senderDriver.findElement(
      By.css("button.text-primary.hover\\:text-secondary")
    );
    await sendButtonSender.click();

    // Add a delay to ensure the message is sent
    await senderDriver.sleep(2000);
  });

  async function login(driver, email, password) {
    const emailInput = await driver.findElement(By.id("email"));
    await emailInput.sendKeys(email);
    await driver.sleep(2000);

    const emailSubmitButton = await driver.findElement(
      By.className(
        "bg-primary text-lg px-4 py-1 hover:bg-secondary rounded mt-2 font-bold text-white leading-relaxed tracking-wide"
      )
    );
    await emailSubmitButton.click();
    await driver.sleep(2000);

    const passwordInput = await driver.findElement(By.id("password"));
    await passwordInput.sendKeys(password);
    await driver.sleep(2000);

    const passwordSubmitButton = await driver.findElement(
      By.className(
        "bg-primary text-lg px-4 py-1 hover:bg-secondary rounded mt-2 font-bold text-white leading-relaxed tracking-wide"
      )
    );
    await passwordSubmitButton.click();
    await driver.sleep(2000);
  }
});
