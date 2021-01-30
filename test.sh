curl -H 'Content-Type: application/json' -H 'Authorization: Bearer {exBaua04Is156G9zTpYwWOHZ6G7fSErmWVb52ft27laxkvlteQ16YoreJXMS8X0onZ7wQ+/saIZf6nhffBeX8bhXt42hpVF9kMKpQK7oWg0GSvN9+jBbxixWzciyWRr/yuuu9wY1s6NhoqJjAYK4uAdB04t89/1O/w1cDnyilFU=}' -X POST -d '{
        "to": [],
        "messages":[
          {
            "type":"text",
            "text":"น้องไม่มาเรียนวันนี้นะครับ"
          },
          {
            "type":"text",
            "text":"ตอนนี้เวลา 20:58:0"
          }
        ]
      }' https://api.line.me/v2/bot/message/multicast