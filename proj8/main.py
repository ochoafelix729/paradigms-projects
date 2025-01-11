# skeleton:
#     1) imports
#     2) key encryption
#     3) system and user messages
#     4) functions - back-end
#     5) Gradio - front-end

# import statements

from openai import OpenAI
import gradio as gr
from dotenv import load_dotenv
import os


# API key connection

load_dotenv()
api_key = os.getenv('OPENAI_API_KEY')
openai = OpenAI()

# languages list

langs = [
    'python',
    'c',
    'cpp',
    'json',
    'html',
    'css',
    'javascript',
    'typescript',
    'sql'
]


# system prompt

system_prompt = f"You are an assistant that receives some code (can be any of the programming langauges in {langs}) that could use some comments. You will analyze the code to see where placing comments would be beneficial."

# user prompt

def user_prompt(code):
    prompt = f"Analyze this code and respond with the same code, but add comments where beneficial. This provided code can be any of the programming languages in {langs}. Do not make any other modifications to the code. For example, if a user submits the following code: def funct(a, b): return a+b, write a comment above the function stating that it is an adding function. However, if it seems rather obvious, do not insert a comment. Assume the programmer is at an intermediate level of proficiency. \n\n "
    prompt += code
    
    return prompt

# define our messages parameter

def messages(code):
    return [
        {'role': 'system', 'content': system_prompt},
        {'role': 'user', 'content': user_prompt(code)}
    ]

# comment function

def comment(code, lang):
    stream = openai.chat.completions.create(
        model = 'gpt-4o-mini',
        messages = messages(code),
        stream = True
    )

    # stream response

    response = ""
    for chunk in stream:
        fragment = chunk.choices[0].delta.content or ""
        response += fragment
        yield response.replace(f'```{lang}\n','').replace('```','')

# function used by 'Clear' button

def clear():
    return "", ""

# front-end

with gr.Blocks(fill_width = True) as view:

    with gr.Row():
        lang = gr.Dropdown(langs, label = "Select programming language:", value = "python")

    with gr.Row():
        # left - input
        input = gr.Code(language = "python", label = "Enter your code", lines = 13)

        # right - output
        output = gr.Code(language = "python", label = "Commented code:")
    
    with gr.Row():
        # left - submit button
        submit_button = gr.Button("Submit")

        # right - clear button
        clear_button = gr.Button("Clear")
        

    lang.change(fn=lambda selected_lang: gr.update(language=selected_lang),
                inputs=lang, outputs=input)

    # submit button
    submit_button.click(fn = comment,inputs = [input, lang], outputs = output)

    # clear button
    clear_button.click(fn = clear, inputs = None, outputs = [input, output])


# define main function

def main():
    view.launch(inbrowser = True)

if __name__ == "__main__":
    main()

