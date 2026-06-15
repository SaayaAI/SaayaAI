import os
import requests
from flask import Flask, request
import google.generativeai as genai

app = Flask(__name__)

# Environment Variables
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
WHATSAPP_TOKEN = os.environ.get("WHATSAPP_TOKEN")
PHONE_NUMBER_ID = os.environ.get("PHONE_NUMBER_ID")

VERIFY_TOKEN = "myloveaitoken2026"

# Gemini Setup
genai.configure(api_key=GEMINI_API_KEY)

# Gemini Model
model = genai.GenerativeModel("gemini-1.5-flash")


def get_gemini_response(user_text):
    try:
        response = model.generate_content(user_text)
        return response.text

    except Exception as e:
        print("Gemini Error:", str(e))
        return "Sorry, abhi AI response nahi de pa raha."


def send_whatsapp_message(to, body):

    url = f"https://graph.facebook.com/v25.0/{PHONE_NUMBER_ID}/messages"

    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }

    data = {
        "messaging_product": "whatsapp",
        "to": to,
        "text": {
            "body": body
        }
    }

    response = requests.post(
        url,
        headers=headers,
        json=data
    )

    print("WhatsApp API Status:", response.status_code)
    print("WhatsApp API Response:", response.text)


@app.route("/webhook", methods=["GET", "POST"])
def webhook():

    # Verification
    if request.method == "GET":

        token = request.args.get("hub.verify_token")

        if token == VERIFY_TOKEN:
            return request.args.get("hub.challenge")

        return "Invalid Verify Token", 403

    # Incoming Message
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

                    # Gemini Response
                    reply = get_gemini_response(user_text)

                    print("AI Reply:", reply)

                    send_whatsapp_message(sender, reply)

        except Exception as e:

            print("ERROR:", str(e))

        return "OK", 200


@app.route("/")
def home():
    return "Saaya AI Running Successfully"


if __name__ == "__main__":

    port = int(os.environ.get("PORT", 10000))

    app.run(
        host="0.0.0.0",
        port=port
    )