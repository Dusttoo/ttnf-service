import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.api import setup_routes
from app.core.config import settings
from app.api.errors.handlers import setup_error_handlers
from opencensus.ext.azure.log_exporter import AzureLogHandler
from opencensus.ext.azure.trace_exporter import AzureExporter
from opencensus.ext.fastapi.fastapi_middleware import FastAPIMiddleware
from opencensus.trace.samplers import ProbabilitySampler


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


@app.get("/")
async def root():
    return {"message": "Welcome to the API"}
