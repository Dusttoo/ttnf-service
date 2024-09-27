import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.utils import NotFoundError, PermissionDeniedError

logger = logging.getLogger(__name__)


def setup_error_handlers(app: FastAPI):

    # Not Found Error Handler
    @app.exception_handler(NotFoundError)
    async def not_found_exception_handler(request: Request, exc: NotFoundError):
        logger.warning(f"NotFoundError: {exc.message} for URL: {request.url}")
        return JSONResponse(status_code=404, content={"message": exc.message})

    # Permission Denied Error Handler
    @app.exception_handler(PermissionDeniedError)
    async def permission_denied_handler(request: Request, exc: PermissionDeniedError):
        logger.warning(f"PermissionDeniedError: {exc.message} for URL: {request.url}")
        return JSONResponse(status_code=403, content={"message": exc.message})

    # SQLAlchemy Database Error Handler
    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_error_handler(request: Request, exc: SQLAlchemyError):
        logger.error(
            f"SQLAlchemyError: {str(exc)} for URL: {request.url}", exc_info=True
        )
        return JSONResponse(status_code=500, content={"message": "Database error"})

    # Validation Error Handler
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ):
        logger.warning(f"ValidationError: {exc.errors()} for URL: {request.url}")
        return JSONResponse(status_code=422, content={"errors": exc.errors()})

    # Unhandled Error Handler
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.error(
            f"Unhandled Exception: {str(exc)} for URL: {request.url}", exc_info=True
        )
        return JSONResponse(
            status_code=500,
            content={"message": "Internal Server Error"},
        )
