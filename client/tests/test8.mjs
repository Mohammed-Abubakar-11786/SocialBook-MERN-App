import { Builder, By, until } from "selenium-webdriver";
// import { expect } from "chai";
import { describe, before, after, it } from "mocha";

describe("Web Chat Application Tests", function () {
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

  it("should send and receive messages back and forth", async function () {
    // Sender sends a message
    const senderMessage = "Hello, this is a test message!";
    const messageInputSender = await senderDriver.findElement(By.id("text"));
    await messageInputSender.sendKeys(senderMessage);

    const sendButtonSender = await senderDriver.findElement(
      By.css("button.text-primary.hover\\:text-secondary")
    );
    await sendButtonSender.click();

    // Receiver sends a reply
    const receiverReply = "Hi, I received your message!";
    const messageInputReceiver = await receiverDriver.findElement(
      By.id("text")
    );
    await messageInputReceiver.sendKeys(receiverReply);

    const sendButtonReceiver = await receiverDriver.findElement(
      By.css("button.text-primary.hover\\:text-secondary")
    );
    await sendButtonReceiver.click();
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
