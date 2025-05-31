import asyncio
from googletrans import Translator
from backend import server
from flask import jsonify



async def translate_text(file):
     test = server.local_transcribe(file)
     async with Translator() as translator:
      translation = await translator.translate(test, dest='zh-cn')
      response_data = {
            'original': translation.origin,
            'translated': translation.text,
            'source_lang': translation.src,
            'dest_lang': translation.dest
        }
        
      return jsonify(response_data)



def run_translate(file):
      return asyncio.run(translate_text(file))