# src/utils/emailer.py

import smtplib
from email.message import EmailMessage
from pathlib import Path

class EmailSender:

    def __init__(self, sender_email, app_password, receiver_email):
        self.sender_email = sender_email
        self.password = app_password
        self.receiver_email = receiver_email

    def send_log(self, file_path):
        """
        Sends CSV log file over email
        """

        msg = EmailMessage()
        msg["Subject"] = "Traffic AI Vehicle Detection Log"
        msg["From"] = self.sender_email
        msg["To"] = self.receiver_email

        msg.set_content("Attached is the vehicle detection CSV log from latest run.")

        file_path = Path(file_path)

        with open(file_path, "rb") as f:
            data = f.read()

        msg.add_attachment(
            data,
            maintype="application",
            subtype="octet-stream",
            filename=file_path.name,
        )

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(self.sender_email, self.password)
            server.send_message(msg)

        print("[EMAIL] CSV log emailed successfully")
