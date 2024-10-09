from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas import ServiceStatus, ShippingType, TagCreate, TagResponse, ServiceCategoryCreate, ServiceCategoryResponse, ShippingInfo, ServiceCreate, ServiceResponse, ServiceListResponse
from app.services import ServicesService
from app.core import get_database_session
from app.utils import NotFoundError

service_router = APIRouter()
services_service = ServicesService()

# Routes for Tags
@service_router.get("/tags", response_model=List[TagResponse])
async def get_all_tags(db: AsyncSession = Depends(get_database_session)):
    """Route to get all tags."""
    tags = await services_service.get_tags(db)
    return tags


@service_router.get("/tags/{tag_id}", response_model=TagResponse)
async def get_tag_by_id(tag_id: int, db: AsyncSession = Depends(get_database_session)):
    """Route to get a tag by its ID."""
    tag = await services_service.get_tag_by_id(tag_id, db)
    if not tag:
        raise NotFoundError(name="Tag", message=f"Tag with id {tag_id} not found")
    return tag


@service_router.post("/tags", response_model=TagResponse)
async def create_tag(
    tag_create: TagCreate, db: AsyncSession = Depends(get_database_session)
):
    """Route to create a new tag."""
    try:
        new_tag = await services_service.create_tag(tag_create, db)
        return new_tag
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@service_router.put("/tags/{tag_id}", response_model=TagResponse)
async def update_tag(
    tag_id: int, tag_update: TagCreate, db: AsyncSession = Depends(get_database_session)
):
    """Route to update an existing tag."""
    tag = await services_service.update_tag(tag_id, tag_update, db)
    if not tag:
        raise NotFoundError(name="Tag", message=f"Tag with id {tag_id} not found")
    return tag


@service_router.delete("/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(tag_id: int, db: AsyncSession = Depends(get_database_session)):
    """Route to delete a tag."""
    tag = await services_service.get_tag_by_id(tag_id, db)
    if not tag:
        raise NotFoundError(name="Tag", message=f"Tag with id {tag_id} not found")

    await services_service.delete_tag(tag_id, db)
    return

@service_router.get("/categories", response_model=List[ServiceCategoryResponse])
async def get_all_categories(db: AsyncSession = Depends(get_database_session)):
    """Route to get all categories."""
    categories = await services_service.get_categories(db)
    return categories


@service_router.get("/categories/{category_id}", response_model=ServiceCategoryResponse)
async def get_category_by_id(category_id: int, db: AsyncSession = Depends(get_database_session)):
    """Route to get a category by its ID."""
    category = await services_service.get_category_by_id(category_id, db)
    if not category:
        raise NotFoundError(name="Category", message=f"Category with id {category_id} not found")
    return category


@service_router.post("/categories", response_model=ServiceCategoryResponse)
async def create_category(
    category_create: ServiceCategoryCreate, db: AsyncSession = Depends(get_database_session)
):
    """Route to create a new category."""
    try:
        new_category = await services_service.create_category(category_create, db)
        return new_category
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@service_router.put("/categories/{category_id}", response_model=ServiceCategoryResponse)
async def update_category(
    category_id: int, category_update: ServiceCategoryCreate, db: AsyncSession = Depends(get_database_session)
):
    """Route to update an existing category."""
    category = await services_service.update_category(category_id, category_update, db)
    if not category:
        raise NotFoundError(name="Category", message=f"Category with id {category_id} not found")
    return category


@service_router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: int, db: AsyncSession = Depends(get_database_session)):
    """Route to delete a category."""
    category = await services_service.get_category_by_id(category_id, db)
    if not category:
        raise NotFoundError(name="Category", message=f"Category with id {category_id} not found")

    await services_service.delete_category(category_id, db)
    return

# @service_router.get("/shipping-info/{service_id}", response_model=ShippingInfo)
# async def get_shipping_info_by_service_id(service_id: int, db: AsyncSession = Depends(get_database_session)):
#     """Route to get shipping information for a specific service."""
#     shipping_info = await services_service.get_shipping_info_by_service_id(service_id, db)
#     if not shipping_info:
#         raise NotFoundError(name="Shipping Info", message=f"No shipping information found for service ID {service_id}")
#     return shipping_info
#
#
# @service_router.get("/shipping-info", response_model=List[ShippingInfo])
# async def get_all_shipping_info_options(db: AsyncSession = Depends(get_database_session)):
#     """Route to get all available shipping options."""
#     shipping_info_options = await services_service.get_shipping_info_options(db)
#     return shipping_info_options
#
#
# @service_router.post("/shipping-info", response_model=ShippingInfo)
# async def create_shipping_info(
#     shipping_info_create: ShippingInfoCreate, db: AsyncSession = Depends(get_database_session)
# ):
#     """Route to create new shipping information."""
#     try:
#         new_shipping_info = await services_service.create_shipping_info(shipping_info_create, db)
#         return new_shipping_info
#     except Exception as e:
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
#
#
# @service_router.put("/shipping-info/{shipping_info_id}", response_model=ShippingInfo)
# async def update_shipping_info(
#     shipping_info_id: int, shipping_info_update: ShippingInfoCreate, db: AsyncSession = Depends(get_database_session)
# ):
#     """Route to update existing shipping information."""
#     shipping_info = await services_service.update_shipping_info(shipping_info_id, shipping_info_update, db)
#     if not shipping_info:
#         raise NotFoundError(name="Shipping Info", message=f"Shipping information with id {shipping_info_id} not found")
#     return shipping_info
#
#
# @service_router.delete("/shipping-info/{shipping_info_id}", status_code=status.HTTP_204_NO_CONTENT)
# async def delete_shipping_info(shipping_info_id: int, db: AsyncSession = Depends(get_database_session)):
#     """Route to delete shipping information."""
#     shipping_info = await services_service.get_shipping_info_by_service_id(shipping_info_id, db)
#     if not shipping_info:
#         raise NotFoundError(name="Shipping Info", message=f"Shipping information with id {shipping_info_id} not found")
#
#     await services_service.delete_shipping_info(shipping_info_id, db)
#     return

@service_router.get("/services", response_model=ServiceListResponse)
async def get_all_services(db: AsyncSession = Depends(get_database_session)):
    """Route to get a list of all services."""
    services = await services_service.get_all_services(db)
    return services


@service_router.get("/services/{service_id}", response_model=ServiceResponse)
async def get_service_by_id(service_id: int, db: AsyncSession = Depends(get_database_session)):
    """Route to get a specific service by ID."""
    service = await services_service.get_service_by_id(service_id, db)
    if not service:
        raise NotFoundError(name="Service", message=f"Service with id {service_id} not found")
    return service


@service_router.get("/services/category/{category_id}", response_model=ServiceListResponse)
async def get_services_by_category(category_id: int, db: AsyncSession = Depends(get_database_session)):
    """Route to get services by category ID."""
    services = await services_service.get_services_by_category(category_id, db)
    if not services:
        raise NotFoundError(name="Service", message=f"No services found for category id {category_id}")
    return services


@service_router.get("/services/tag/{tag_id}", response_model=ServiceListResponse)
async def get_services_by_tag(tag_id: int, db: AsyncSession = Depends(get_database_session)):
    """Route to get services by tag ID."""
    services = await services_service.get_services_by_tag(tag_id, db)
    if not services:
        raise NotFoundError(name="Service", message=f"No services found for tag id {tag_id}")
    return services


@service_router.post("/services", response_model=ServiceResponse)
async def create_service(
    service_create: ServiceCreate, db: AsyncSession = Depends(get_database_session)
):
    """Route to create a new service."""
    try:
        new_service = await services_service.create_service(service_create, db)
        return new_service
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@service_router.put("/services/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: int, service_update: ServiceCreate, db: AsyncSession = Depends(get_database_session)
):
    """Route to update an existing service."""
    service = await services_service.update_service(service_id, service_update, db)
    if not service:
        raise NotFoundError(name="Service", message=f"Service with id {service_id} not found")
    return service


@service_router.delete("/services/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(service_id: int, db: AsyncSession = Depends(get_database_session)):
    """Route to delete a service by ID."""
    service = await services_service.get_service_by_id(service_id, db)
    if not service:
        raise NotFoundError(name="Service", message=f"Service with id {service_id} not found")

    await services_service.delete_service(service_id, db)
    return