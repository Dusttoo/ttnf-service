from app.schemas import (
    Dog as DogSchema,
    Production as ProductionSchema,
    DogChildSchema,
    Litter as LitterSchema,
    Breeding as BreedingSchema,
    Page as PageSchema,
    PageCreate as PageCreateSchema,
    PageUpdate as PageUpdateSchema,
    NavLink as NavLinkSchema,
    Author,
    IMeta,
    Translation,
    Announcement as AnnouncementSchema,
    TagResponse,
    ServiceCategoryResponse,
    ServiceResponse,
    ServiceListResponse,
    ServiceStatus,
    WaitlistResponse,
    Photo as PhotoSchema,)
from app.models import Dog, Litter, Breeding, Production, NavLink, Announcement, Page, Tag, ServiceCategory, Service, \
    WaitlistEntry
import json
from typing import Union, Dict, Any, List
import logging
from uuid import UUID
from datetime import datetime

logger = logging.getLogger(__name__)


def convert_to_dog_schema(dog: Dog) -> DogSchema:
    photos = sorted(
        dog.photos,
        key=lambda photo: photo.position if photo.position is not None else float('inf')
    )
    return DogSchema(
        id=dog.id,
        name=dog.name,
        dob=dog.dob,
        gender=dog.gender,
        color=dog.color,
        statuses=[status.status for status in dog.statuses], 
        profile_photo=dog.profile_photo,
        stud_fee=dog.stud_fee,
        sale_fee=dog.sale_fee,
        description=dog.description,
        pedigree_link=dog.pedigree_link,
        video_url=dog.video_url,
        parent_male_id=dog.parent_male_id,
        parent_female_id=dog.parent_female_id,
        is_production=dog.is_production,
        is_retired=dog.is_retired,
        health_infos=dog.health_infos,
        photos=[
            PhotoSchema(
                id=photo.id,
                dog_id=photo.dog_id,
                photo_url=photo.photo_url,
                alt=photo.alt,
                position=photo.position
            )
            for photo in photos
        ],
        productions=[convert_to_production_schema(prod) for prod in dog.productions],
        children=[
            DogChildSchema(
                id=child.id,
                name=child.name,
                dob=child.dob,
                gender=child.gender,
                profile_photo=child.profile_photo,
            )
            for child in dog.children
        ],
    )


def convert_to_breeding_schema(breeding: Breeding) -> BreedingSchema:
    return BreedingSchema(
        id=breeding.id,
        female_dog_id=breeding.female_dog_id,
        male_dog_id=breeding.male_dog_id,
        breeding_date=str(breeding.breeding_date) if breeding.breeding_date else None,
        expected_birth_date=(
            str(breeding.expected_birth_date) if breeding.expected_birth_date else None
        ),
        description=breeding.description,
        manual_sire_name=breeding.manual_sire_name,
        manual_sire_color=breeding.manual_sire_color,
        manual_sire_image_url=breeding.manual_sire_image_url,
        manual_sire_pedigree_link=breeding.manual_sire_pedigree_link,
        female_dog=(
            convert_to_dog_schema(breeding.female_dog) if breeding.female_dog else None
        ),
        male_dog=(
            convert_to_dog_schema(breeding.male_dog) if breeding.male_dog else None
        ),
    )


def convert_to_litter_schema(litter: Litter) -> LitterSchema:
    description = None
    if litter.description:
        try:
            description = (
                json.loads(litter.description)
                if isinstance(litter.description, str)
                else litter.description
            )
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON in litter description: {litter.description}")
            description = {
                "content": litter.description
            }

    return LitterSchema(
        id=litter.id,
        breeding_id=litter.breeding_id,
        birth_date=litter.birth_date,
        number_of_puppies=litter.number_of_puppies,
        description=description,
        litter_url=litter.litter_url,
        puppies=[convert_to_dog_schema(puppy) for puppy in litter.puppies],
        breeding=convert_to_breeding_schema(litter.breeding),
    )


def convert_to_production_schema(production: Production) -> ProductionSchema:
    return ProductionSchema(
        id=production.id,
        name=production.name,
        dob=production.dob,
        gender=production.gender,
        owner=production.owner,
        description=production.description,
        profile_photo=production.profile_photo,
        sire_id=production.sire_id,
        dam_id=production.dam_id,
    )


def convert_to_navigation_schema(navigation: NavLink) -> NavLinkSchema:
    return NavLinkSchema(
        id=navigation.id,
        title=navigation.title,
        slug=navigation.slug,
        editable=navigation.editable,
        parent_id=navigation.parent_id,
        position=navigation.position,
    )


def convert_to_page_schema(page: Union[Page, dict]) -> PageSchema:
    content = page["content"] if isinstance(page, dict) else page.content
    if isinstance(content, str):
        try:
            content = json.loads(content)
        except json.JSONDecodeError:
            pass

    meta = page["meta"] if isinstance(page, dict) else page.meta
    if meta and isinstance(meta, dict):
        meta = IMeta(**meta)

    author = page["author"] if isinstance(page, dict) else page.author
    if author and isinstance(author, dict):
        author = Author(**author)

    translations = page["translations"] if isinstance(page, dict) else page.translations
    if translations and isinstance(translations, list):
        translations = [Translation(**translation) for translation in translations]

    announcements = page["announcements"] if isinstance(page, dict) else page.announcements
    if announcements and isinstance(announcements, list):
        announcements = [
            convert_to_announcement_schema(announcement)
            for announcement in announcements
        ]

    # Handle carousel images from different sources
    carousel_images = None
    if isinstance(page, dict):
        # Handle when page is a dictionary (JSON)
        carousel_images = (
            page["custom_values"].get("carouselImages")
            or page["custom_values"].get("heroContent", {}).get("carouselImages")
            or page.get("carousel", [])
        )
    else:
        # Handle when page is an SQLAlchemy model
        carousel_images = (
            page.custom_values.get("carouselImages")
            or page.custom_values.get("heroContent", {}).get("carouselImages")
            or page.carousel
        )

    if carousel_images and isinstance(carousel_images, list):
        carousel_images = [
            {
                "id": item.get("id"),
                "src": item.get("src"),
                "alt": item.get("alt")
            }
            for item in carousel_images if item.get("src")
        ]

    return PageSchema(
        id=str(page["id"]) if isinstance(page, dict) else str(page.id),
        type=page["type"] if isinstance(page, dict) else page.type,
        name=page["name"] if isinstance(page, dict) else page.name,
        slug=page["slug"] if isinstance(page, dict) else page.slug,
        meta=meta,
        custom_values=page["custom_values"] if isinstance(page, dict) else page.custom_values,
        external_data=page["external_data"] if isinstance(page, dict) else page.external_data,
        content=content,
        author_id=page["author_id"] if isinstance(page, dict) else page.author_id,
        author=author,
        status=page["status"] if isinstance(page, dict) else page.status,
        is_locked=page["is_locked"] if isinstance(page, dict) else page.is_locked,
        tags=page["tags"] if isinstance(page, dict) else page.tags,
        created_at=page["created_at"] if isinstance(page, dict) else (
            page.created_at.isoformat() if page.created_at else None),
        published_at=page["published_at"] if isinstance(page, dict) else (
            page.published_at.isoformat() if page.published_at else None),
        language=page["language"] if isinstance(page, dict) else page.language,
        translations=translations,
        updated_at=page["updated_at"] if isinstance(page, dict) else (
            page.updated_at.isoformat() if page.updated_at else None),
        announcements=announcements,
        carousel_images=carousel_images
    )

def convert_to_announcement_schema(announcement: Announcement) -> AnnouncementSchema:
    return AnnouncementSchema(
        id=announcement["id"] if isinstance(announcement, dict) else announcement.id,
        title=announcement["title"] if isinstance(announcement, dict) else announcement.title,
        date=announcement["date"] if isinstance(announcement, dict) else announcement.date.isoformat(),
        message=announcement["message"] if isinstance(announcement, dict) else announcement.message,
        category=announcement["category"] if isinstance(announcement, dict) else announcement.category,
        page_id=str(announcement["page_id"]) if isinstance(announcement, dict) and announcement["page_id"] else str(announcement.page_id) if announcement.page_id else None,
    )


def convert_to_tag_schema(tag: Tag) -> TagResponse:
    return TagResponse(
        id=tag.id,
        name=tag.name,
    )


def convert_to_service_category_schema(category: ServiceCategory) -> ServiceCategoryResponse:
    return ServiceCategoryResponse(
        id=category.id,
        name=category.name,
        display=category.display,
        position=category.position,
    )


def convert_to_service_schema(service: Service) -> ServiceResponse:
    # shipping_info = None
    # if service.shipping_info:
    #     shipping_info = convert_to_shipping_info_schema(service.shipping_info)

    tags = [convert_to_tag_schema(tag) for tag in service.tags] if service.tags else []

    availability = service.availability.value

    return ServiceResponse(
        id=service.id,
        name=service.name,
        description=service.description,
        price=service.price,
        availability=availability,
        cta_name=service.cta_name,
        cta_link=service.cta_link,
        disclaimer=service.disclaimer,
        eta=service.eta,
        estimated_price=service.estimated_price,
        shipping_type=service.shipping_type,
        image=service.image,
        tags=tags,
        category=convert_to_service_category_schema(service.category) if service.category else None,
    )


def convert_to_service_list_schema(services: List[Service]) -> ServiceListResponse:
    return ServiceListResponse(
        services=[convert_to_service_schema(service) for service in services]
    )


def convert_to_waitlist_schema(waitlist_entry: WaitlistEntry) -> WaitlistResponse:
    return WaitlistResponse(
        id=waitlist_entry.id,
        name=waitlist_entry.name,
        email=waitlist_entry.email,
        phone=waitlist_entry.phone,
        gender_preference=waitlist_entry.gender_preference,
        color_preference=waitlist_entry.color_preference,
        sires=[convert_to_dog_schema(sire) for sire in waitlist_entry.sires] if waitlist_entry.sires else [],
        dams=[convert_to_dog_schema(dam) for dam in waitlist_entry.dams] if waitlist_entry.dams else [],
        breeding_id=waitlist_entry.breeding_id,
        additional_info=waitlist_entry.additional_info,
        created_at=datetime.now(),
    )
