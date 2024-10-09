from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from app.models import ServiceStatus, ShippingType, Tag, ServiceCategory, Service, service_tags
from app.schemas import ServiceStatus, ShippingType, TagCreate, TagResponse, ServiceCategoryCreate, ServiceCategoryResponse, ShippingInfo, ServiceCreate, ServiceResponse, ServiceListResponse
from app.utils.schema_converters import (
    convert_to_tag_schema,
    convert_to_service_category_schema,
    convert_to_service_schema,
    convert_to_service_list_schema
)

class ServicesService:
    async def get_tags(self, db: AsyncSession) -> List[TagResponse]:
        query = select(Tag)
        result = await db.execute(query)
        tags = result.scalars().all()
        return [convert_to_tag_schema(tag) for tag in tags]

    async def get_tag_by_id(self, tag_id: int, db: AsyncSession) -> TagResponse:
        query = select(Tag).filter(Tag.id == tag_id)
        result = await db.execute(query)
        tag = result.scalars().first()
        if tag:
            return convert_to_tag_schema(tag)
        return None  # Handle this in route

    async def create_tag(self, tag_data: TagCreate, db: AsyncSession) -> TagResponse:
        tag = Tag(name=tag_data.name)
        db.add(tag)
        await db.commit()
        await db.refresh(tag)
        return convert_to_tag_schema(tag)

    async def update_tag(self, tag_id: int, tag_data: TagCreate, db: AsyncSession) -> TagResponse:
        query = select(Tag).filter(Tag.id == tag_id)
        result = await db.execute(query)
        tag = result.scalars().first()

        if tag:
            tag.name = tag_data.name
            await db.commit()
            await db.refresh(tag)
            return convert_to_tag_schema(tag)
        return None  # Handle this in route

    async def delete_tag(self, tag_id: int, db: AsyncSession):
        query = select(Tag).filter(Tag.id == tag_id)
        result = await db.execute(query)
        tag = result.scalars().first()

        if tag:
            await db.delete(tag)
            await db.commit()
        return None

    async def get_categories(self, db: AsyncSession) -> List[ServiceCategoryResponse]:
        """Fetch all service categories from the database."""
        query = select(ServiceCategory)
        result = await db.execute(query)
        categories = result.scalars().all()
        return [convert_to_service_category_schema(category) for category in categories]

    async def get_category_by_id(self, category_id: int, db: AsyncSession) -> ServiceCategoryResponse:
        """Fetch a single service category by its ID."""
        query = select(ServiceCategory).filter(ServiceCategory.id == category_id)
        result = await db.execute(query)
        category = result.scalars().first()
        if not category:
            raise NoResultFound(f"Category with id {category_id} not found")
        return convert_to_service_category_schema(category)

    async def create_category(self, category_data: ServiceCategoryCreate, db: AsyncSession) -> ServiceCategoryResponse:
        """Create a new service category."""
        new_category = ServiceCategory(**category_data.dict())
        db.add(new_category)
        await db.commit()
        await db.refresh(new_category)
        return convert_to_service_category_schema(new_category)

    async def update_category(self, category_id: int, category_data: ServiceCategoryCreate, db: AsyncSession) -> ServiceCategoryResponse:
        """Update an existing service category."""
        query = select(ServiceCategory).filter(ServiceCategory.id == category_id)
        result = await db.execute(query)
        category = result.scalars().first()

        if not category:
            raise NoResultFound(f"Category with id {category_id} not found")

        for field, value in category_data.dict().items():
            setattr(category, field, value)

        await db.commit()
        await db.refresh(category)
        return convert_to_service_category_schema(category)

    async def delete_category(self, category_id: int, db: AsyncSession):
        """Delete a service category by its ID."""
        query = select(ServiceCategory).filter(ServiceCategory.id == category_id)
        result = await db.execute(query)
        category = result.scalars().first()

        if not category:
            raise NoResultFound(f"Category with id {category_id} not found")

        await db.delete(category)
        await db.commit()

    # async def get_shipping_info_by_service_id(self, service_id: int, db: AsyncSession) -> ShippingInfo:
    #     """Fetch shipping info for a specific service by the service ID."""
    #     query = select(ShippingInfoModel).filter(ShippingInfoModel.service_id == service_id)
    #     result = await db.execute(query)
    #     shipping_info = result.scalars().first()
    #
    #     if not shipping_info:
    #         raise NoResultFound(f"No shipping info found for service id {service_id}")
    #
    #     return convert_to_shipping_info_schema(shipping_info)
    #
    # async def get_shipping_info_options(self, db: AsyncSession) -> List[ShippingInfo]:
    #     """Fetch all available shipping info options."""
    #     query = select(ShippingInfoModel)
    #     result = await db.execute(query)
    #     shipping_infos = result.scalars().all()
    #
    #     return [convert_to_shipping_info_schema(shipping_info) for shipping_info in shipping_infos]
    #
    # async def create_shipping_info(self, shipping_info_data: ShippingInfoCreate, db: AsyncSession) -> ShippingInfo:
    #     """Create a new shipping info entry."""
    #     new_shipping_info = ShippingInfoModel(**shipping_info_data.dict())
    #     db.add(new_shipping_info)
    #     await db.commit()
    #     await db.refresh(new_shipping_info)
    #
    #     return convert_to_shipping_info_schema(new_shipping_info)
    #
    # async def update_shipping_info(self, shipping_info_id: int, shipping_info_data: ShippingInfoCreate, db: AsyncSession) -> ShippingInfo:
    #     """Update an existing shipping info entry."""
    #     query = select(ShippingInfoModel).filter(ShippingInfoModel.id == shipping_info_id)
    #     result = await db.execute(query)
    #     shipping_info = result.scalars().first()
    #
    #     if not shipping_info:
    #         raise NoResultFound(f"No shipping info found with id {shipping_info_id}")
    #
    #     for field, value in shipping_info_data.dict().items():
    #         setattr(shipping_info, field, value)
    #
    #     await db.commit()
    #     await db.refresh(shipping_info)
    #
    #     return convert_to_shipping_info_schema(shipping_info)
    #
    # async def delete_shipping_info(self, shipping_info_id: int, db: AsyncSession):
    #     """Delete a shipping info entry by its ID."""
    #     query = select(ShippingInfoModel).filter(ShippingInfoModel.id == shipping_info_id)
    #     result = await db.execute(query)
    #     shipping_info = result.scalars().first()
    #
    #     if not shipping_info:
    #         raise NoResultFound(f"No shipping info found with id {shipping_info_id}")
    #
    #     await db.delete(shipping_info)
    #     await db.commit()

    async def get_all_services(self, db: AsyncSession) -> ServiceListResponse:
        """Fetch all available services."""
        query = select(Service).options(selectinload(Service.category), selectinload(Service.tags))
        result = await db.execute(query)
        services = result.scalars().all()

        return convert_to_service_list_schema(services)

    async def get_service_by_id(self, service_id: int, db: AsyncSession) -> ServiceResponse:
        """Fetch a service by its ID."""
        query = select(Service).filter(Service.id == service_id).options(
            selectinload(Service.category),
            selectinload(Service.tags),
        )
        result = await db.execute(query)
        service = result.scalars().first()

        if not service:
            raise NoResultFound(f"No service found with id {service_id}")

        return convert_to_service_schema(service)

    async def get_services_by_category(self, category_id: int, db: AsyncSession) -> ServiceListResponse:
        """Fetch all services that belong to a specific category."""
        query = select(Service).filter(Service.category_id == category_id).options(
            selectinload(Service.category),
            selectinload(Service.tags),
        )
        result = await db.execute(query)
        services = result.scalars().all()

        if not services:
            raise NoResultFound(f"No services found in category with id {category_id}")

        return convert_to_service_list_schema(services)

    async def get_services_by_tag(self, tag_id: int, db: AsyncSession) -> ServiceListResponse:
        """Fetch all services associated with a specific tag."""
        query = select(Service).join(Service.tags).filter(Tag.id == tag_id).options(
            selectinload(Service.category),
            selectinload(Service.tags),
        )
        result = await db.execute(query)
        services = result.scalars().all()

        if not services:
            raise NoResultFound(f"No services found with tag id {tag_id}")

        return convert_to_service_list_schema(services)

    async def create_service(self, service_data: ServiceCreate, db: AsyncSession) -> ServiceResponse:
        """Create a new service."""
        new_service = Service(**service_data.dict(exclude={"availability"}))

        if service_data.availability:
            # Map Pydantic enum to SQLAlchemy enum (ServiceStatus)
            new_service.availability = ServiceStatus[service_data.availability.name]

        if service_data.category_id:
            category_query = select(ServiceCategory).filter(ServiceCategory.id == service_data.category_id)
            result = await db.execute(category_query)
            category = result.scalars().first()
            if category:
                new_service.category = category

        if service_data.tags:
            tag_query = select(Tag).filter(Tag.name.in_(service_data.tags))
            result = await db.execute(tag_query)
            tags = result.scalars().all()
            if tags:
                new_service.tags.extend(tags)

        db.add(new_service)
        await db.commit()
        await db.refresh(new_service)

        return convert_to_service_schema(new_service)

    async def update_service(self, service_id: int, service_data: ServiceCreate, db: AsyncSession) -> ServiceResponse:
        """Update an existing service."""
        query = select(Service).filter(Service.id == service_id).options(
            selectinload(Service.category),
            selectinload(Service.tags),
        )
        result = await db.execute(query)
        service = result.scalars().first()

        if not service:
            raise NoResultFound(f"No service found with id {service_id}")

        for field, value in service_data.dict().items():
            setattr(service, field, value)

        # Handle relationships (e.g., category, tags)
        if service_data.category_id:
            category_query = select(ServiceCategory).filter(ServiceCategory.id == service_data.category_id)
            result = await db.execute(category_query)
            category = result.scalars().first()
            if category:
                service.category = category

        if service_data.tag_ids:
            tag_query = select(Tag).filter(Tag.id.in_(service_data.tag_ids))
            result = await db.execute(tag_query)
            tags = result.scalars().all()
            if tags:
                service.tags = tags

        await db.commit()
        await db.refresh(service)

        return convert_to_service_schema(service)

    async def delete_service(self, service_id: int, db: AsyncSession):
        """Delete a service by its ID."""
        query = select(Service).filter(Service.id == service_id)
        result = await db.execute(query)
        service = result.scalars().first()

        if not service:
            raise NoResultFound(f"No service found with id {service_id}")

        await db.delete(service)
        await db.commit()

