const nodemailer = require("nodemailer");


const sendEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const generateOTP = () => {
            const otpLength = 6;
            let otp = "";
            for (let i = 0; i < otpLength; i++) {
                otp += Math.floor(Math.random() * 10);
            }
            return otp;
        }
        const otp = generateOTP();

        let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSWORD,

            },

        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"madhusmita238091@gmail.com',
            to: "lonemohsin4@gmail.com",
            subject: "OTP from the mail",
            text: `Your OTP is: ${otp}`,
            html: "<b>Hii iam madhu</b>",
            html: `<b>Your OTP is: ${otp}</b>`,

        });

        console.log("Email sent:", info.messageId);

        res.status(200).send({ status: true, message: "Email sent successfully!" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).send({ status: false, message: "An error occurred while sending the email." });
    }
};

module.exports = { sendEmail }
