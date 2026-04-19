jest.mock("nodemailer", () => ({
  createTransport: jest.fn(),
}));

const nodemailer = require("nodemailer");
const { generateOtp, sendOtp } = require("../../services/otpService");

describe("otpService unit tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EMAIL_USER = "sender@example.com";
    process.env.EMAIL_PASS = "secret";
  });

  test("generateOtp returns a numeric 6-digit string", () => {
    const otp = generateOtp();

    expect(otp).toMatch(/^\d{6}$/);
  });

  test("sendOtp uses nodemailer transporter and sends expected payload", async () => {
    const sendMail = jest.fn().mockResolvedValue({ messageId: "id-1" });
    nodemailer.createTransport.mockReturnValue({ sendMail });

    await sendOtp("student@example.com", "123456");

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: "gmail",
      auth: {
        user: "sender@example.com",
        pass: "secret",
      },
    });

    expect(sendMail).toHaveBeenCalledWith({
      from: "sender@example.com",
      to: "student@example.com",
      subject: "Your OTP Code",
      text: "Your OTP is 123456",
    });
  });
});