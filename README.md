# BlogCraft AI

BlogCraft AI generates a blog post from a topic using a three-step language model workflow: title generation, structured outlining, and streamed Markdown writing. It includes both a browser interface and a terminal interface, and saves generated posts locally.

## Features

- Choose a writing tone, target length, and language.
- Generate a title and structured outline before drafting the post.
- Stream generated text in the browser or terminal.
- Save completed posts as Markdown files in `outputs/`.
- Run as a FastAPI web application or a command-line program.

## Requirements

- Python 3.10 or newer
- A Groq API key (or credentials for another LangChain-supported provider)

## Setup

Create and activate a virtual environment, then install the dependencies:

```bash
python -m venv .venv
# Windows PowerShell
.venv\\Scripts\\Activate.ps1
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and add your provider credentials. The default configuration uses Groq:

```dotenv
LLM_PROVIDER=groq
LLM_MODEL=llama-3.3-70b-versatile
GROQ_API_KEY=your_groq_api_key
```

Keep `.env` private. It is excluded from Git.

## Run the web app

Start the API from the project root:

```bash
uvicorn api:app --reload
```

Open [http://127.0.0.1:8000/app/](http://127.0.0.1:8000/app/). The API documentation is available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

## Run the command-line app

```bash
python main.py
```

Enter a topic, then choose a tone, length, and language. Type `q` to exit.

## Project layout

```text
blog/       Prompt chains, model setup, schemas, and file output
frontend/   Browser interface (HTML, CSS, and JavaScript)
outputs/    Generated Markdown files (created locally and not committed)
api.py      FastAPI app and streaming endpoint
main.py     Command-line app
```

## Configuration

`LLM_PROVIDER` and `LLM_MODEL` select the provider and model used by LangChain. Set the matching provider key in `.env` (for example, `GROQ_API_KEY` when using Groq). The application sends prompts to that provider, so review its data and usage policies before use.

## License

No license has been selected yet. All rights remain with the author unless a license is added.
