import os
import requests
from flask import Flask, request

app = Flask(__name__)

WHATSAPP_TOKEN = os.environ.get("WHATSAPP_TOKEN")
PHONE_NUMBER_ID = os.environ.get("PHONE_NUMBER_ID")

def send_whatsapp_message(to, body):
    url = f"https://graph.facebook.com/v25.0/{PHONE_NUMBER_ID}/messages"

    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }

    data = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {
            "body": body
        }
    }

    response = requests.post(url, headers=headers, json=data)

    print("WhatsApp API Status:", response.status_code)
    print("WhatsApp API Response:", response.text)

@app.route("/")
def home():
    return "Saaya AI Running"

@app.route("/webhook", methods=["GET", "POST"])
def webhook():

    if request.method == "GET":
        verify_token = "myloveaitoken2026"

        if request.args.get("hub.verify_token") == verify_token:
            return request.args.get("hub.challenge")

        return "Invalid Verify Token", 403

    if request.method == "POST":

        data = request.json

        print("========== WEBHOOK HIT ==========")
        print(data)

        try:
            entry = data["entry"][0]
            changes = entry["changes"][0]
            value = changes["value"]

            if "messages" in value:

                message = value["messages"][0]

                sender = message["from"]

                if message["type"] == "text":
                    user_text = message["text"]["body"]

                    print("User Message:", user_text)

                    reply = f"Namaste 🙏\n\nSaaya AI ne aapka message receive kar liya:\n\n{user_text}"

                    send_whatsapp_message(sender, reply)

        except Exception as e:
            print("ERROR:", str(e))

        return "OK", 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)