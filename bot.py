import os
import requests
from flask import Flask, request
from groq import Groq

app = Flask(__name__)

WHATSAPP_TOKEN = os.environ.get("WHATSAPP_TOKEN")
PHONE_NUMBER_ID = os.environ.get("PHONE_NUMBER_ID")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

VERIFY_TOKEN = "myloveaitoken2026"

client = Groq(api_key=GROQ_API_KEY)


def get_ai_response(user_text):
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "Tum Saaya AI ho. Hindi aur English dono me friendly jawab do."
                },
                {
                    "role": "user",
                    "content": user_text
                }
            ],
            model="llama-3.3-70b-versatile"
        
        )

        return chat_completion.choices[0].message.content

    except Exception as e:
        print("Groq Error:", str(e))
        return "Sorry, AI abhi busy hai. Thodi der baad try karo."


def send_whatsapp_message(to, body):

    url = f"https://graph.facebook.com/v25.0/{PHONE_NUMBER_ID}/messages"

    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {
            "body": body
        }
    }

    response = requests.post(url, headers=headers, json=payload)

    print(response.status_code)
    print(response.text)


@app.route("/", methods=["GET"])
def home():
    return "Saaya AI Running"


@app.route("/webhook", methods=["GET"])
def verify():

    mode = request.args.get("hub.mode")
    token = request.args.get("hub.verify_token")
    challenge = request.args.get("hub.challenge")

    if mode and token:

        if mode == "subscribe" and token == VERIFY_TOKEN:
            return challenge, 200

    return "Verification failed", 403


@app.route("/webhook", methods=["POST"])
def webhook():

    data = request.get_json()

    try:
        message = data["entry"][0]["changes"][0]["value"]["messages"][0]

        sender = message["from"]
        user_text = message["text"]["body"]

        print("User:", user_text)

        ai_reply = get_ai_response(user_text)

        print("AI:", ai_reply)

        send_whatsapp_message(sender, ai_reply)

    except Exception as e:
        print("Webhook Error:", str(e))

    return "ok", 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)