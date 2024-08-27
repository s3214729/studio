from ninja import Schema

class TextSchema(Schema):
    text: str

class SpeechSchema(Schema):
    filename: str
    content_type: str
    input: str
    file_url: str
    
__all__ = [
    "TextSchema",
    "SpeechSchema"
]
