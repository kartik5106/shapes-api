#python server to handle backend functionality 

from flask import Flask ,request, jsonify 
from openai import OpenAI

shapes_client = OpenAI(
    api_key="api key here",
    base_url="https://api.shapes.inc/v1/",
)

app=Flask(__name__)

@app.route('/chat',methods=['POST'])
def chat():
    user_message=request.json.get('message')
    user_model=request.json.get('shapesincId')

    response = shapes_client.chat.completions.create(
    model=f"shapesinc/{user_model}",
    messages=[
        {"role": "user", "content": f"{user_message}"}
    ])

    reply = f"bot response: {response}"

    return jsonify({"reply": reply})

if __name__ =='__main__':
    app.run(debug=True)