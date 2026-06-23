import os
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from pypdf import PdfReader

# 1. Load configuration
load_dotenv(dotenv_path="backend/.env")
api_key = os.getenv("GEMINI_API_KEY")

# 2. Initialize App and AI Client
app = FastAPI(title="StudyBuddy AI Backend")
ai_client = genai.Client(api_key=api_key)

UPLOAD_DIR = "backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 🧠 Global temporary memory to store our PDF text across endpoints
latest_pdf_context = ""

class QuestionRequest(BaseModel):
    prompt: str

@app.get("/")
def home():
    return {"message": "Welcome to the StudyBuddy AI Backend!"}

# --- Pillar 1: General AI Chat ---
@app.post("/ask")
def ask_gemini(request: QuestionRequest):
    try:
        response = ai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=request.prompt,
        )
        return {"question": request.prompt, "response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Pillar 2: PDF Upload & Remember Text ---
@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    global latest_pdf_context  # Tells Python to update our global memory variable
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported!")
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        reader = PdfReader(file_path)
        extracted_text = ""
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_text += text + "\n"
        
        # Save the text into our global memory variable for Pillar 3
        latest_pdf_context = extracted_text
        
        return {
            "filename": file.filename,
            "status": "Successfully uploaded and loaded into active AI context memory!",
            "total_pages": len(reader.pages),
            "extracted_characters": len(extracted_text)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

# --- Pillar 3: Contextual Q&A (Chat with your Study Guide) ---
@app.post("/ask-pdf")
def ask_about_pdf(request: QuestionRequest):
    global latest_pdf_context
    
    # Check if a document has actually been uploaded yet
    if not latest_pdf_context or latest_pdf_context.strip() == "":
        raise HTTPException(status_code=400, detail="Your AI context memory is empty! Please upload a PDF file first.")
    
    try:
        # Build a compound system prompt instructing Gemini how to behave
        master_prompt = f"""
        You are a brilliant study assistant for StudyBuddy AI. 
        Your task is to answer the student's question using only the provided context extracted from their study document.
        
        --- STUDY MATERIAL CONTEXT ---
        {latest_pdf_context}
        ------------------------------
        
        Student Question: {request.prompt}
        
        Provide a helpful, accurate study answer based on the material above.
        """
        
        response = ai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=master_prompt,
        )
        return {"response": response.text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))