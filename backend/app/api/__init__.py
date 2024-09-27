from fastapi import FastAPI


def setup_routes(app: FastAPI):
    from app.api.routes import (
        auth_router,
        breeding_router,
        dog_router,
        litter_router,
        media_router,
        navigation_router,
        page_router,
        production_router,
        search_router,
        settings_router,
        user_router,
        utils_router,
    )

    app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
    app.include_router(dog_router, prefix="/api/v1/dogs", tags=["Dogs"])
    app.include_router(breeding_router, prefix="/api/v1/breedings", tags=["Breedings"])
    app.include_router(litter_router, prefix="/api/v1/litters", tags=["Litters"])
    app.include_router(
        production_router, prefix="/api/v1/productions", tags=["Productions"]
    )
    app.include_router(user_router, prefix="/api/v1/users", tags=["Users"])
    app.include_router(media_router, prefix="/api/v1/images", tags=["Images"])
    app.include_router(search_router, prefix="/api/v1/search", tags=["search"])
    app.include_router(page_router, prefix="/api/v1/pages", tags=["Pages"])
    app.include_router(
        navigation_router, prefix="/api/v1/navigation", tags=["Navigation"]
    )
    app.include_router(utils_router, prefix="/api/v1/utils", tags=["Utilities"])
    app.include_router(settings_router, prefix="/api/v1/settings", tags=["Utilities"])
