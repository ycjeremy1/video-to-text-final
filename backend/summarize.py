import cohere
from backend import server  


co = cohere.Client("33TEfaTYuW7TwDsd5V0K16p4qkiqAoKcmohI9t5o")


def summarize(file):
    text = server.local_transcribe(file)
    text = (
        "Give relevant bullet points for a summary of the following conversation (labelled Summary), relevant key words (labeled key words), questions to test understanding (labelled questions for further learning) Do not state anything afterwards. " + str(text)
    )

    response = co.generate(
        prompt=text
    )
    return (response.generations[0].text)



