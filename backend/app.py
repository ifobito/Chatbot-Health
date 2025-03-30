import os 
import asyncio
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from googlesearch import search
from bs4 import BeautifulSoup
from aiohttp import ClientSession
from concurrent.futures import ThreadPoolExecutor
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI
from langchain_redis import RedisChatMessageHistory
from langchain_groq import ChatGroq
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import requests
from fastapi.middleware.cors import CORSMiddleware
from langchain_google_genai import ChatGoogleGenerativeAI
from fastapi.responses import StreamingResponse
import json


load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://hospitals.ifobito.online"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

groq_api_key = os.getenv('GROQ_API_KEY')
api_key = os.getenv('GENAI_API_KEY')

llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro-exp-03-25", api_key=api_key, streaming=True)
llm_classifier = ChatGroq(model="llama-3.3-70b-versatile", api_key=groq_api_key, streaming=True)
REDIS_URL = os.getenv("REDIS_URL")
print(f"Connecting to Redis at: {REDIS_URL}")

class QuestionRequest(BaseModel):
    question: str

async def async_search(query: str, num_results: int = 3):
    loop = asyncio.get_running_loop()
    with ThreadPoolExecutor() as pool:
        urls = await loop.run_in_executor(
            pool, lambda: list(search(f"{query} site:tamanhhospital.vn", num_results=num_results, unique=True))
        )
    return urls

async def fetch_content(url: str, session: ClientSession) -> str:
    try:
        async with session.get(url, timeout=10) as response:
            html = await response.text()
            soup = BeautifulSoup(html, 'html.parser')
            title = soup.find("h1").text.strip() if soup.find("h1") else "Không tìm thấy tiêu đề"
            content = soup.find("div", attrs={"id": "ftwp-postcontent"})
            content_text = content.text.strip() if content else "Không tìm thấy nội dung"
            title = title.replace("\n", " ").strip()
            content_text = content_text.replace("\n", " ").strip()
            return f"{title}\n{content_text}\n"
    except Exception as e:
        return "bạn hãy trả lời theo ý của bạn nhé"
    
async def get_content(query: str) -> str:
    urls = await async_search(query, num_results=3)
    contents = ""
    async with ClientSession() as session:
        tasks = [fetch_content(url, session) for url in urls]
        results = await asyncio.gather(*tasks)
        contents = "\n".join(results)
    return contents, urls


system_template = """
            Bạn là "Tam Anh Hospital, trợ lý tư vấn sức khỏe tại Bệnh viện Đa khoa Quốc tế Tâm Anh, hỗ trợ khách hàng với các câu hỏi y khoa. Hãy trả lời bằng tiếng Việt, chỉ được sử dụng kiến thức y khoa được cung cấp và định dạng đầu ra bằng Markdown. Khi ngoài phạm vi kiến thức, lịch sự từ chối trả lời. Xưng "em" và gọi khách là anh Obito.
                Kịch bản trả lời:
                Chào khách hàng (VD: "Tam Anh Hospital cảm ơn câu hỏi của anh Obito, em xin trả lời như sau : ").
                Giải đáp thắc mắc:
                Xác định vấn đề (nếu cần): Xác nhận và giải thích rõ vấn đề.
                Nguyên nhân (nếu cần): Mô tả chi tiết các nguyên nhân tiềm ẩn.
                Các bước xử lý cụ thể hoặc sơ cứu (nếu có): Hướng dẫn chi tiết.
                Điều trị và phòng ngừa (nếu cần): Đưa ra khuyến nghị dài hạn về lối sống, dinh dưỡng và điều trị.
                Đề nghị khách hỏi thêm hoặc đề nghị khách đến đến bệnh viện Tam Anh Hospital gần nhất nếu cảm thấy tình trạng khách hàng không ổn.
                Khi nói về bệnh viện, bạn phải nói về Tam Anh Hospital, không phải là bất kì bệnh viện nào khác, nếu không bạn sẽ bị sa thải

                Lưu ý:
                - Không trả lời câu hỏi ngoài phạm vi kiến thức.
                - Lịch sự từ chối trả lời.
                - Không trả lời câu hỏi không liên quan đến y khoa.
                - Không trả lời câu hỏi về chính trị, tôn giáo, giới tính, chủng tộc, v.v.
                - Không trả lời câu hỏi về bệnh viện khác ngoài Tam Anh Hospital.
                - Không trả lời câu hỏi về giá cả, chất lượng dịch vụ, v.v.
                - Không trả lời câu hỏi về thông tin cá nhân của bệnh nhân.
                - Không trả lời câu hỏi về các bệnh lý quá nghiêm trọng hoặc cần chuyên gia chẩn đoán.                
                - Không trả lời bằng tiếng Anh trừ trường hợp cần thiết.
                Sau đây là kiến thức được cung cấp:
                {content}

            """



system_query = """
                Giả sử bạn là chuyên gia xác thực câu hỏi y khoa, bạn hãy trả lời câu hỏi sau có phải là câu hỏi y khoa không?
                câu hỏi y khoa là câu hỏi liên quan đến sức khỏe, bệnh tật, triệu chứng, chẩn đoán, điều trị, phòng ngừa, tên loại bệnh, tên bệnh viện, tên thuốc, tên bác sĩ, v.v.
                Nếu câu hỏi là y khoa thì hãy trả về "health", nếu không phải thì trả về "normal"
                Lưu ý không giải thiết câu hỏi, chỉ trả lời "health" hoặc "normal".
                Sau đây là câu hỏi:
                {human_question}
                """

prompt_template = ChatPromptTemplate.from_messages(
    [
        ("system", system_template), 
        MessagesPlaceholder(variable_name="history"),
        ("human", "{human_question}"),
    ]
)

prompt_query = ChatPromptTemplate.from_messages(
    [
        ("system", system_query), 
        ("human", "{human_question}"),
    ]
)

def get_redis_history(session_id: str) -> BaseChatMessageHistory:
    return RedisChatMessageHistory(session_id, redis_url=REDIS_URL)

chain = prompt_template | llm

chain_with_history = RunnableWithMessageHistory(
    chain, get_redis_history, input_messages_key="human_question", history_messages_key="history"
)

chain_query = prompt_query | llm_classifier


@app.get("/")
async def home():
    return {"message": "Chào mừng đến với Tam Anh Hospital!"}


@app.post("/ask")
async def ask(request: QuestionRequest):
    try:
        user_input = request.question
        if not user_input:
            raise HTTPException(status_code=400, detail="Question is required")

        session_id = "admin_123"
        reference_urls = []

        async def process_question():
            verify_input = await chain_query.ainvoke({"human_question": user_input})
            print(verify_input)
            is_health_question = verify_input.content.strip().lower() == "health"

            content = ""
            if is_health_question:
                content_text, reference_urls = await get_content(user_input)
                content = content_text
            else:
                content = "Định dạng đầu ra bằng Markdown"
                reference_urls = []
            
            response_content = ""
            async for chunk in chain_with_history.astream(
                {"content": content, "human_question": user_input},
                config={"configurable": {"session_id": session_id}}
            ):
                response_content += chunk.content
                yield f"{chunk.content}\n"
            
            if is_health_question and reference_urls:
                # Thêm delimiter để frontend biết đây là phần tài liệu tham khảo
                yield "\n\n###TÀI LIỆU THAM KHẢO###\n"
                for url in reference_urls:
                    yield f"{url}\n"

        return StreamingResponse(process_question(), media_type="text/plain")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Exception occurred: {str(e)}")

