const moment = require('moment')

const healths = require('../models/health')
const guardians = require('../models/guardian')
const payments = require('../model/payment')

exports.sendPaymentInfo = async (lineId) => {
  try {
    const findChildFromGuardian = await guardians.findOne({
      lineId
    })

    const info = await payments.find({ child: findChildFromGuardian.child })
    console.log(info)

    if (info.length > 1) {
      const temp = []

      for (let i = 0; i < info.length; i++) {
        if (info[i].outstanding_balance === 0) {
          temp.push(`รายการ${info[i].topic} ชำระครบแล้ว`)
        } else {
          temp.push(
            `รายการ${info[i].topic} , ค้างชำระ ${info[i].outstanding_balance}บาท`
          )
        }
      }
      return temp
    } else if (info.length === 0) {
      return null
    } else {
      if (info[0].outstanding_balance === 0) {
        return `รายการ${info[0].topic} ชำระครบแล้ว`
      } else {
        return `รายการ${info[0].topic} , ค้างชำระ ${info[0].outstanding_balance}บาท`
      }
    }
  } catch (error) {
    console.log('[ERROR] at send_health_info_func')
    console.log(error)
    return 0
  }
}

exports.sendHealthInfo = async (lineId) => {
  try {
    const findChildFromGuardian = await guardians.findOne({
      lineId
    })
    console.log(findChildFromGuardian)

    const info = await healths.findOne({
      date: moment().format('YYYY-MM-DD') + 'T00:00:00.000+00:00',
      child: findChildFromGuardian.child
    })
    console.log(info)

    if (info === null) {
      console.log('in null')
      return 'น้องยังไม่ได้ตรวจไข้ครับวันนี้'
    } else {
      if (info.temperature) {
        return 'น้องสบายดีครับวันนี้ ^ ^'
      } else if (info.temperature === false) {
        return 'น้องไม่สบายนะครับวันนี้'
      } else {
        return 'น้องยังไม่ได้ตรวจไข้ครับวันนี้'
      }
    }
  } catch (error) {
    console.log('[ERROR] at send_health_info_func')
    console.log(error)
    return 0
  }
}
