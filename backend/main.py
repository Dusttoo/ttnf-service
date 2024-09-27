import asyncio
import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from opencensus.ext.azure.log_exporter import AzureLogHandler
from opencensus.ext.azure.trace_exporter import AzureExporter
from opencensus.ext.fastapi.fastapi_middleware import FastAPIMiddleware
from opencensus.trace.samplers import ProbabilitySampler

from app.api import setup_routes
from app.api.errors.handlers import setup_error_handlers
from app.core.config import settings


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


# Middleware to log request and response details
@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(time.time())  # Simple request ID using timestamp
    try:
        logger.info(f"[{request_id}] Request started: {request.method} {request.url}")
        start_time = time.time()

        # Log request headers
        logger.info(f"[{request_id}] Headers: {request.headers}")

        # Handle the request body differently based on its content type
        if request.method in ("POST", "PUT", "PATCH"):
            content_type = request.headers.get("content-type", "")

            # Log request body if it's text-based (JSON, text, form-data)
            if "application/json" in content_type or "text" in content_type:
                try:
                    body = await request.body()
                    logger.info(f"[{request_id}] Request Body: {body.decode('utf-8')}")
                except UnicodeDecodeError:
                    logger.warning(
                        f"[{request_id}] Unable to decode request body as UTF-8"
                    )
            else:
                # For binary data, log the content type and size instead of trying to decode
                body = await request.body()
                logger.info(
                    f"[{request_id}] Binary request body received. Content type: {content_type}, size: {len(body)} bytes"
                )

        # Proceed with the request and get the response
        response = await call_next(request)

        # Log response details
        process_time = time.time() - start_time
        logger.info(f"[{request_id}] Response status: {response.status_code}")
        logger.info(f"[{request_id}] Process time: {process_time:.4f} seconds")

        # Buffer and log the response body if it's not too large
        if isinstance(response, Response):
            response_body = b"".join([chunk async for chunk in response.body_iterator])

            # Log the response body if it's text-based
            content_type = response.headers.get("content-type", "")
            if "application/json" in content_type or "text" in content_type:
                logger.info(
                    f"[{request_id}] Response Body: {response_body.decode('utf-8')}"
                )
            else:
                logger.info(
                    f"[{request_id}] Binary response body with content type: {content_type}, size: {len(response_body)} bytes"
                )

            # Return the buffered response with the correct body
            return Response(
                content=response_body,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.media_type,
            )
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
