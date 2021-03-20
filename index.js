const express = require('express')
const line = require('@line/bot-sdk')

require('dotenv').config()
require('./models/mongo')

const {
  sendHealthInfo,
  sendPaymentInfo
} = require('./helpers/send_response')

// create LINE SDK config from env variables
const config = {
  channelAccessToken:
    `${process.env.TOKEN}`,
  channelSecret: `${process.env.CHANNEL_SECRET}`
}

// create LINE SDK client
const app = express()
const client = new line.Client(config)

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  // console.log("req.body");
  console.log(req.body)
  // console.log("----------");
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err)
      res.status(500).end()
    })
})

async function handleEvent (event) {
  console.log(event)
  const guardianLineId = event.source.userId
  let payload = {}
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null)
  }
  if (
    event.message.text === 'ขอบคุณครับ' ||
    event.message.text === 'ขอบคุณค่ะ' ||
    event.message.text === 'ขอบคุณ' ||
    event.message.text === 'ขอบคุณคะ'
  ) {
    payload = {
      type: 'text',
      text: 'ยินดีครับ ^ ^'
    }
  } else if (
    event.message.text === 'Thank you' ||
    event.message.text === 'Thx' ||
    event.message.text === 'thx'
  ) {
    payload = {
      type: 'text',
      text: 'Your welcome ^ ^'
    }
  } else if (event.message.text === 'check_health') {
    const result = await sendHealthInfo(guardianLineId)
    console.log(result)

    payload = {
      type: 'text',
      text: result
    }
  } else if (event.message.text === 'check_payment') {
    const replyPayment = await sendPaymentInfo(guardianLineId)
    console.log(replyPayment)

    payload = {
      type: 'text',
      text: replyPayment
    }
  } else {
    payload = {
      type: 'text',
      text: 'ฉันไม่สามารถตอบโต้คำถามนี้ได้ ขอโทษนะ'
    }
  }
  // use reply API
  return client.replyMessage(event.replyToken, payload)
}

// listen on port
app.listen(process.env.PORT, () => {
  console.log(`listening on ${process.env.PORT}`)
})
