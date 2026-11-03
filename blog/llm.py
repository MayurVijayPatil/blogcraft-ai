import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model

load_dotenv()

def get_llm():
    """Create and return a ChatGroq LLM instance."""

    provider = os.getenv("LLM_PROVIDER")
    model = os.getenv("LLM_MODEL")
    
    
    api_key =os.getenv(f"{provider.upper()}_API_KEY")

    if not api_key:
     raise ValueError(f"your api key for the provider: {provider} is invalid/expired.Please Check it!")


    llm = init_chat_model(
      model = model,
      model_provider = provider,
      temperature = 0.7,
      api_key = api_key
    )

    return llm 

