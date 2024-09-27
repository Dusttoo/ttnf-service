# isort: skip_file
import logging
import asyncio
from fastapi import FastAPI, Request
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from app.api import setup_routes
from app.core.config import settings
from app.api.errors.handlers import setup_error_handlers
from opencensus.ext.azure.log_exporter import AzureLogHandler
from opencensus.ext.azure.trace_exporter import AzureExporter
from opencensus.ext.fastapi.fastapi_middleware import FastAPIMiddleware
from opencensus.trace.samplers import ProbabilitySampler
import time

def create_application() -> FastAPI:
    application = FastAPI(title=settings.project_name)
    setup_routes(application)
    setup_error_handlers(application)
    return application

app = create_application()

origins = [
    "http://localhost:3000",
    "http://0.0.0.0:3000/",
    "https://texastopnotchfrenchies.com",
    "https://dev.texastopnotchfrenchies.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Content-Type", "Authorization"],
)

INSTRUMENTATION_KEY = settings.instrumentation_key

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
logger.addHandler(
    AzureLogHandler(connection_string=f"InstrumentationKey={INSTRUMENTATION_KEY}")
)

exporter = AzureExporter(connection_string=f"InstrumentationKey={INSTRUMENTATION_KEY}")
sampler = ProbabilitySampler(1.0)
FastAPIMiddleware(app, exporter=exporter, sampler=sampler)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(time.time())
    try:
        logger.info(f"[{request_id}] Request started: {request.method} {request.url}")
        start_time = time.time()

        logger.info(f"[{request_id}] Headers: {request.headers}")

        if request.method in ("POST", "PUT", "PATCH"):
            body = await request.body()
            logger.info(f"[{request_id}] Request Body: {body.decode('utf-8')}")

        response = await call_next(request)

        process_time = time.time() - start_time
        logger.info(f"[{request_id}] Response status: {response.status_code}")
        logger.info(f"[{request_id}] Process time: {process_time:.4f} seconds")

        if isinstance(response, Response):
            response_body = b"".join([chunk async for chunk in response.body_iterator])
            logger.info(f"[{request_id}] Response Body: {response_body.decode('utf-8')}")

            return Response(content=response_body, status_code=response.status_code, headers=dict(response.headers), media_type=response.media_type)
        else:
            return response

    except asyncio.CancelledError as cancel_error:
        logger.error(f"[{request_id}] Request was cancelled: {cancel_error}")
        raise
    except Exception as exc:
        logger.error(f"[{request_id}] Unexpected error: {exc}", exc_info=True)
        raise

@app.get("/")
async def root():
    return {"message": "Welcome to the API"}