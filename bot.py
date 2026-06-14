import os
import requests
from flask import Flask, request
import google.generativeai as genai

app = Flask(__name__)

# Render ke environment se keys uthayega
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
WHATSAPP_TOKEN = os.environ.get("WHATSAPP_TOKEN")
PHONE_NUMBER_ID = os.environ.get("PHONE_NUMBER_ID")

# Gemini Configure karo
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

def get_gemini_response(user_text):
    try:
        response = model.generate_content(user_text)
        return response.text
    except Exception:
        return "Sorry, main abhi response nahi de pa raha."

def send_whatsapp_message(to, body):
    url = f"https://graph.facebook.com/v25.0/{PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}", 
        "Content-Type": "application/json"
    }
    data = {
        "messaging_product": "whatsapp",
        "to": to,
        "text": {"body": body}
    }
    requests.post(url, headers=headers, json=data)

@app.route('/webhook', methods=['GET', 'POST'])
def webhook():
    if request.method == 'GET':
        if request.args.get("hub.verify_token") == "myloveaitoken2026":
            return request.args.get("hub.challenge")
        return "Invalid Token"
    
    if request.method == 'POST':
        data = request.json
        if 'entry' in data and 'changes' in data['entry'][0]:
            value = data['entry'][0]['changes'][0]['value']
            if 'messages' in value:
                msg_data = value['messages'][0]
                sender = msg_data['from']
                user_text = msg_data['text']['body']
                reply = get_gemini_response(user_text)
                send_whatsapp_message(sender, reply)
        return "OK", 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
    