开启服务 默认4443接口
```
node app.js
```

访问接口地址

http://127.0.0.1:4443/api/email/sendemail

格式
```
{
  email: '',
  password: '',
  subject: '',
  receiverItemsArray: [[''],['']],
  content: '',
}
```