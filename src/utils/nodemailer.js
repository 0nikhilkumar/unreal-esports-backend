import nodemailer from "nodemailer";

export const sendMail = async (email, otp, username, status) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.USER_EMAIL_ID,
        pass: process.env.USER_PASSWORD,
      },
    });

    let info = await transporter.sendMail({
      from: "Unreal Esports <unrealesports@gmail.com>",
      to: email,
      subject: `${
        status === "Sign Up"
          ? "Unreal Esports Email Verification"
          : "Unreal Esports Forgot Password"
      }`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your OTP from Unreal Esports</title>
        <style>

        body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f7fafc;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        }

        .bg-gray-100 {
        background-color: #f7fafc;
        }

        .bg-white {
        background-color: #ffffff;
        }

        .bg-gradient-to-r {
        background-image: linear-gradient(135deg, #6b21a8, #3730a3);
        }

        .max-w-2xl {
        max-width: 640px;
        }

        .text-indigo-700 {
        color: #4c51bf;
        }

        .text-white {
        color: white;
        }

        .text-gray-700 {
        color: #4a5568;
        }

        .text-gray-600 {
        color: #718096;
        }

        .text-gray-800 {
        color: #2d3748;
        }

        .text-sm {
        font-size: 0.875rem;
        }

        .text-lg {
        font-size: 1.125rem;
        }

        .text-xl {
        font-size: 1.25rem;
        }

        .text-2xl {
        font-size: 1.5rem;
        }

        .text-4xl {
        font-size: 2.25rem;
        }

        .font-bold {
        font-weight: 700;
        }

        .font-semibold {
        font-weight: 600;
        }

        .tracking-wider {
        letter-spacing: 0.05em;
        }

        .p-8 {
        padding: 2rem;
        }

        .py-4 {
        padding-top: 1rem;
        padding-bottom: 1rem;
        }

        .px-4 {
        padding-left: 1rem;
        padding-right: 1rem;
        }

        .mb-6 {
        margin-bottom: 1.5rem;
        }

        .mb-4 {
        margin-bottom: 1rem;
        }

        .space-x-4 {
        margin-left: -1rem;
        }

        .space-x-4 > * {
        margin-left: 1rem;
        }

        .w-8 {
        width: 2rem;
        }

        .h-8 {
        height: 2rem;
        }

        .flex {
        display: flex;
        }

        .justify-center {
        justify-content: center;
        }

        .items-center {
        align-items: center;
        }

        .text-center {
        text-align: center;
        }

        .rounded-lg {
        border-radius: 0.5rem;
        }

        .shadow-lg {
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        }

        .border {
        border-width: 1px;
        border-color: #e2e8f0;
        }

        @media (max-width: 640px) {
        .max-w-2xl {
            max-width: 100%;
        }

        .p-8 {
            padding: 1rem;
        }
        }

        </style>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
        </head>
        <body class="bg-gray-100 min-h-screen flex justify-center items-center py-4">
        <div class="bg-white max-w-2xl w-full rounded-lg shadow-lg">
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-600 to-indigo-700 flex justify-center items-center">
        <img src="./public/images/logo-fav.png" alt="Unreal Esports Logo" width="100px" />
        <span class="text-white font-bold text-lg tracking-wider">Unreal Esports</span>
        </div>

        <!-- Body -->
        <div class="p-8">
        <h1 class="text-indigo-700 text-2xl font-semibold text-center mb-6">Your One-Time Password (OTP)</h1>
        <p class="text-gray-700 text-lg mb-4">Hello ${username},</p>
        <p class="text-gray-700 text-lg mb-4">
            You've requested a one-time password for ${status==="Sign Up" ? "Unreal Esports account verification" : "Unreal Esports account reset password"}.
        </p>

        <div class="bg-gray-100 border rounded-lg py-6 text-center mb-6">
            <span class="text-4xl font-bold text-indigo-700 tracking-widest">${otp}</span>
        </div>

        <p class="text-gray-700 text-lg mb-4">
            This OTP will expire in 10 minutes. If you didn't request this code, please ignore this email or contact our support team immediately.
        </p>
        <p class="text-gray-700 text-lg mb-4">Game on!</p>
        <p class="text-gray-700 text-lg mb-4">The Unreal Esports Team</p>
        </div>

        <!-- Footer -->
        <div class="bg-gradient-to-r from-purple-600 to-indigo-700 py-6 text-center">
        <p class="text-white text-sm mb-4 tracking-wider">Follow us on social media:</p>
        <div class="flex justify-center space-x-4 mb-4">
            <a href="#" class="w-8 h-8 flex justify-center items-center">
            <i class="fab fa-facebook-f text-xl text-white"></i>
            </a>
            <a href="#" class="w-8 h-8 flex justify-center items-center">
            <i class="fab fa-twitter text-xl text-white"></i>
            </a>
            <a href="#" class="w-8 h-8 flex justify-center items-center">
            <i class="fab fa-instagram text-xl text-white"></i>
            </a>
        </div>
        <p class="text-white tracking-wider text-xs">&copy; 2025 Unreal Esports. All rights reserved.</p>
        </div>
    </div>
    </body>

    </html>
    `,
    });

    if(!info){
        return console.error({message:"Email Sent Error on line: 285"});
    }
    console.log("Email Sent Successfully: %s", info.messageId);
  } catch (error) {
    console.log(error);
  }
};
