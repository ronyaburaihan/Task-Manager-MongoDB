const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (name, email) => {
    sgMail.send({
        to: email,
        from: {
            name: 'Task Manager',
            email: 'com.techdoctorbd@gmail.com'
        },
        subject: 'Thanks for joining in!',
        text: `Hey ${name}, A warm welcome and lots of good wishes on becoming part of our growing application. Congratulations and on behalf of all the members. We are all happy and excited about your inputs and contribution to our Application.`
    })
}

const sendCancellationEmail = (name, email) => {
    sgMail.send({
        to: email,
        from: {
            name: 'Task Manager',
            email: 'com.techdoctorbd@gmail.com'
        },
        subject: 'Sorry to see you go!',
        text: `Goodbye, ${name}. I hope to see you back sometime soon.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}