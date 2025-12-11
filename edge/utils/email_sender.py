import smtplib
from email.message import EmailMessage

def send_email_with_attachment(
    sender_email,
    sender_password,
    receiver_email,
    subject,
    body,
    file_path
):
    msg = EmailMessage()
    msg["From"] = sender_email
    msg["To"] = receiver_email
    msg["Subject"] = subject

    msg.set_content(body)

    # Attach file
    with open(file_path, "rb") as f:
        file_data = f.read()
        file_name = file_path.split("\\")[-1]

    msg.add_attachment(
        file_data,
        maintype="application",
        subtype="octet-stream",
        filename=file_name,
    )

    # Gmail SMTP
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender_email, sender_password)
        server.send_message(msg)

    print("✅ Email sent successfully!")
