const healths = require("../health");
const guardians = require("../guardian");
const payments = require("../payment")
exports.send_payment_info = (line_id) => {
  try {
      const find_child_from_guardian = await guardians.findOne({
        line_id,
      });
      const info = await payments.find({child:find_child_from_guardian.child})
      console.log(info);
      if (info.length>1) {
          var temp = []
          for (let i = 0; i < info.length; i++) {
              if (info[i].outstanding_balance===0) {
                  temp.push(
                      `รายการ${info[i].topic} ชำระครบแล้ว`
                  )
              } else {
                temp.push(
                  `รายการ${info[i].topic} , ค้างชำระ ${info[i].outstanding_balance}บาท` 
               ) 
              }
          }
          return temp
      } else if(info.length===0) {
          return null
      }else{
        if (info[0].outstanding_balance===0) {
            return `รายการ${info[0].topic} ชำระครบแล้ว`
        }else{
            return `รายการ${info[0].topic} , ค้างชำระ ${info[0].outstanding_balance}บาท`
        }
      }
  } catch (error) {
    console.log("[ERROR] at send_health_info_func");
    console.log(error);
    return;
  }
};

exports.send_health_info = async (line_id) => {
  try {
    const find_child_from_guardian = await guardians.findOne({
      line_id,
    });
    
    console.log(moment().format("YYYY-MM-DD"));
    const info = await healths.findOne({
      date: moment().format("YYYY-MM-DD") + "T00:00:00.000+00:00",
      child: find_child_from_guardian.child,
    });
    console.log(info);
    if (info !== null) {
      if (info.temperature) {
        return `น้องสบายดีครับวันนี้ ^ ^`;
      } else if (info.temperature === false) {
        return `น้องไม่สบายนะครับวันนี้`;
      } else {
        return `น้องยังไม่ได้ตรวจไข้ครับวันนี้`;
      }
    } else {
      return `น้องยังไม่ได้ตรวจไข้ครับวันนี้`;
    }
  } catch (error) {
    console.log("[ERROR] at send_health_info_func");
    console.log(error);
    return;
  }
};
