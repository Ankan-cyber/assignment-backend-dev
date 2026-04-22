const {TransactionalEmailsApi, SendSmtpEmail} = require("@getbrevo/brevo");

let emailAPI = new TransactionalEmailsApi();

emailAPI.authentications.apiKey.apiKey = process.env.BREVO_API_KEY


const sendPasswordResetEmail = (name, email, link) => {
  const year = new Date().getFullYear();

  let message = new SendSmtpEmail();
  
  message.subject = "Password Reset CloudNotePro"
  message.sender = {name: "CloudNotePro", email: "noreply@mail.ankanroy.in"}
  message.replyTo = {email: "contact@mail.ankanroy.in"}
  message.to = [{ email, name }]
  message.textContent = "User Account Password Reset"
  message.htmlContent = `
    <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="utf-8">
  </head>
  <body style="padding:0; margin:0;background-color:#eee;">
  <div style="width:100%;height:100%;margin:0px;padding:0;font-family: sans-serif;">
      <div style="margin:0px auto;">
          <div style="background-color:#fff;clear:both;color:#666;line-height: 32px; max-width: 500px; margin: 50px auto;border-radius: 5px 5px 5px 5px; box-shadow: 0px 15px 40px -15px #999;">
  
          <div style="color: #fff;text-align:center; padding:0px 0px 0px; background-image: url('https://notes.ankanroy.in/logo512.png'); background-repeat: no-repeat; background-position: center; background-size: contain; background-color: #000000; width:100%; height:125px; border-radius: 5px 5px 0px 0px;" aria-label="logo">
          </div>
          <div style="font-family:'Helvetica Neue','Helvetica',Helvetica,Arial,sans-serif;margin-top:0;margin-right:0;margin-bottom:0;margin-left:0;padding-top:0;padding-right:0;padding-bottom:10px;padding-left:0;font-size:15px;">
                       
             <p style="text-align:center; font-size:23px; color:#4280D6; font-weight:500; padding:10px 30px 0px 30px;">Password Reset</p>
  
  <hr style="background-color: #4280D6; margin: 10px auto; border: 0; height: 1px; width: 150px;">
  
  <p style="padding:10px 30px;">Hey <strong>${name}</strong>, it seems that you forgot your password. Did Will Smith use one of those flashy thingies from Men in Black on you?</p>
  
  <p style="text-align:center;"><img src="https://notes.ankanroy.in/flash.gif" width="100%" alt="gif"></p>
  
  <p style="padding:10px 30px;">Click the link below to reset the password. Be sure to use a strong and unique password that you did not use anywhere else.</p>
  
  <p style="padding:0px 30px 0px;text-align:center;">
    <a href="${link}" style="font-size:20px; display:block; color: #fff; background-color: #4CAF50; padding:10px 0px; width:100%; margin:10px auto; text-align:center;text-decoration:none;border-radius:5px;">Reset Password</a>
  </p>
  
  <p style="padding:10px 30px;">If you didn't request a password reset, please ignore this email and do something fun. It's a nice day.</p>
  
  <p style="padding:10px 30px;text-align:center;background: black;color: white;">${year} © CloudNotePro</p>
             
          </div>
      </div>
  </div>
  </div>
  </body>
  </html>
  `

  emailAPI.sendTransacEmail(message).then(res => {
    console.log(JSON.stringify(res.body));
  }).catch(err =>{
    console.error("Error sending email:", err.body);
  });
}

module.exports = sendPasswordResetEmail;
