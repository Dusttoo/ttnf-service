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

    # Setup routes and error handlers
    setup_routes(application)
    setup_error_handlers(application)

    if application.openapi_schema:
        return application.openapi_schema

    openapi_schema = application.openapi()  # Generate the OpenAPI schema once

    # Add security schemes for OAuth2PasswordBearer
    openapi_schema["components"]["securitySchemes"] = {
        "OAuth2PasswordBearer": {
            "type": "oauth2",
            "flows": {
                "password": {
                    "tokenUrl": "/api/v1/auth/token",
                    "scopes": {}
                }
            }
        }
    }

    # Optionally apply security globally
    openapi_schema["security"] = [{"OAuth2PasswordBearer": []}]

    application.openapi_schema = openapi_schema  # Cache the OpenAPI schema

    return application


app = create_application()

origins = [
    "http://localhost:3000",
    "https://localhost:3000",
    "http://0.0.0.0:3000/",
    "https://0.0.0.0:3000/",
    "https://texastopnotchfrenchies.com",
    "https://dev.texastopnotchfrenchies.com"
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
# logger.addHandler(
#     AzureLogHandler(connection_string=f"InstrumentationKey={INSTRUMENTATION_KEY}")
# )

# exporter = AzureExporter(connection_string=f"InstrumentationKey={INSTRUMENTATION_KEY}")
# sampler = ProbabilitySampler(1.0)
FastAPIMiddleware(app)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(time.time())
    try:
        logger.info(f"[{request_id}] Request started: {request.method} {request.url}")
        start_time = time.time()

        logger.info(f"[{request_id}] Headers: {request.headers}")

        # Check the content type for binary data (e.g., file upload)
        content_type = request.headers.get("Content-Type", "")
        if request.method in ("POST", "PUT", "PATCH"):
            body = await request.body()

            if "multipart/form-data" in content_type:  # File uploads or binary data
                logger.info(f"[{request_id}] Request Body: [binary data skipped]")
            else:
                try:
                    logger.info(f"[{request_id}] Request Body: {body.decode('utf-8')}")
                except UnicodeDecodeError:
                    logger.warning(f"[{request_id}] Could not decode body, possibly binary data.")

        response = await call_next(request)

        process_time = time.time() - start_time
        logger.info(f"[{request_id}] Response status: {response.status_code}")
        logger.info(f"[{request_id}] Process time: {process_time:.4f} seconds")

        # Check if response is binary and skip logging if it is
        if isinstance(response, Response):
            response_body = b"".join([chunk async for chunk in response.body_iterator])

            if "application/octet-stream" in response.headers.get("Content-Type", ""):
                logger.info(f"[{request_id}] Response Body: [binary data skipped]")
            else:
                try:
                    logger.info(f"[{request_id}] Response Body: ")
                except UnicodeDecodeError:
                    logger.warning(f"[{request_id}] Could not decode response body, possibly binary data.")

            return Response(content=response_body, status_code=response.status_code, headers=dict(response.headers),
                            media_type=response.media_type)
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


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
