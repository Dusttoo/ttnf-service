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
    Announcement as AnnouncementSchema
)
from app.models import Dog, Litter, Breeding, Production, NavLink, Announcement, Page
import json
from typing import Union, Dict, Any
import logging
from uuid import UUID
from datetime import datetime

logger = logging.getLogger(__name__)


def convert_to_dog_schema(dog: Dog) -> DogSchema:
    return DogSchema(
        id=dog.id,
        name=dog.name,
        dob=dog.dob,
        gender=dog.gender,
        color=dog.color,
        status=dog.status,
        profile_photo=dog.profile_photo,
        stud_fee=dog.stud_fee,
        sale_fee=dog.sale_fee,
        description=dog.description,
        pedigree_link=dog.pedigree_link,
        video_url=dog.video_url,
        parent_male_id=dog.parent_male_id,
        parent_female_id=dog.parent_female_id,
        is_production=dog.is_production,
        health_infos=dog.health_infos,
        photos=dog.photos,
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

from typing import Union
from datetime import datetime
import json

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
            AnnouncementSchema(
                id=announcement.get("id") if isinstance(announcement, dict) else announcement.id,
                title=announcement.get("title") if isinstance(announcement, dict) else announcement.title,
                date=announcement["date"] if isinstance(announcement, dict)
                else (announcement.date.isoformat() if isinstance(announcement.date, datetime) else announcement.date),
                message=announcement.get("message") if isinstance(announcement, dict) else announcement.message,
                category=announcement.get("category") if isinstance(announcement, dict) else announcement.category
            )
            for announcement in announcements
        ]

    carousel = page["carousel"] if isinstance(page, dict) else page.carousel
    if carousel and isinstance(carousel, list):
        carousel = [
            {
                "src": item.get("src"),
                "alt": item.get("alt")
            }
            for item in carousel if item.get("src")
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
        created_at=page["created_at"] if isinstance(page, dict) else (page.created_at.isoformat() if page.created_at else None),
        published_at=page["published_at"] if isinstance(page, dict) else (page.published_at.isoformat() if page.published_at else None),
        language=page["language"] if isinstance(page, dict) else page.language,
        translations=translations,
        updated_at=page["updated_at"] if isinstance(page, dict) else (page.updated_at.isoformat() if page.updated_at else None),
        announcements=announcements,
        carousel=carousel  # Include the carousel data
    )
