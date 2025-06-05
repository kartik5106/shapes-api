#python server to handle backend functionality 

from flask import Flask ,request, jsonify 
from openai import OpenAI
from flask_cors import CORS # Import CORS
import os 

app = Flask(__name__)
CORS(app)

# Shapes_APIKEY = os.getenv("SHAPES_API_KEY") 
shapes_client = OpenAI(
    api_key=Shapes_APIKEY,
    base_url="https://api.shapes.inc/v1/",
)

@app.route('/chat',methods=['POST'])
def chat():
    user_message=request.json.get('message')
    user_model=request.json.get('shapesincId')

    response = shapes_client.chat.completions.create(
    model=f"shapesinc/{user_model}",
    messages=[
        {"role": "user", "content": f"{user_message}"}
    ])

    reply = response.choices[0].message.content

    return jsonify({"reply": reply})

if __name__ =='__main__':
    app.run(debug=True)