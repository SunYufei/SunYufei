---
title: Python 实现SMTP发送
categories: Python
date: 2022-03-21
---

&emsp;<!--more-->

```python
from email.header import Header
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
import smtplib
import time

# 发件人与收件人
sender = ''
receiver = ''

# 附件目录
folder = Path('attachment')

# connect smtp server
host = 'mail.xxx.com'
port = 465
username = ''
password = ''

smtp = smtplib.SMTP_SSL(host=host)
smtp.connect(host, port)
smtp.login(username, password)

# make mail and send
for idx, file in enumerate(folder.rglob('*.*')):
    try:
        msg = MIMEMultipart()

        msg['From'] = sender
        msg['To'] = receiver
        msg['Subject'] = Header(file.name, 'utf-8')

        attach = MIMEText(file.open('rb').read(), 'base64', 'utf-8')
        attach['Content-Disposition'] = f'attachment; filename="{file.name}"'

        msg.attach(attach)

        print(idx + 1, file, f'{file.stat().st_size/1024/1024:.2f}MB', end=' ')
        print(smtp.sendmail(sender, receiver, msg.as_bytes()))
    except Exception as e:
        print(e)
    finally:
        if idx % 6 == 5:
            print('sleep 60s')
            time.sleep(60)
            print('re-login')
            smtp = smtplib.SMTP_SSL(host=host)
            smtp.connect(host, port)
            smtp.login(username, password)
```
