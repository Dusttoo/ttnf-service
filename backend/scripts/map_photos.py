import logging
import re
import asyncio
import httpx
from io import BytesIO
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.future import select
from app.core.database import Base
from app.models import Dog, Production, Photo
from app.core.config import settings
from app.services.image_service import MediaService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_URL = settings.sqlalchemy_database_url.replace(
    "postgresql://", "postgresql+asyncpg://"
)


def create_async_session(database_url: str):
    try:
        engine = create_async_engine(database_url, echo=True)
        async_session = sessionmaker(
            bind=engine, class_=AsyncSession, expire_on_commit=False
        )
        logger.info("Database connected and async session created.")
        return async_session
    except SQLAlchemyError as e:
        logger.error("Error connecting to the database: %s", e)
        raise


async def download_image(url: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()  # Raise exception for 4xx/5xx responses
            return response.content
    except (httpx.HTTPError, httpx.RequestError) as exc:
        logger.error(f"Error downloading image from {url}: {exc}")
        return None


async def upload_and_map_image(entry, session: AsyncSession):
    try:
        attachment_url = entry.get("attachment_url")
        link = entry.get("link")

        # Updated regex to match the new URL format
        match = re.match(
            r"https://texastopnotchfrenchies\.com/(dogs|productions|planned-breedings|home|available)/([^/]+)/([^/]+)",
            link,
        )
        if not match:
            logger.error(f"URL does not match the expected pattern: {link}")
            return

        entry_type = match.group(1)
        dog_name = match.group(2).replace("-", " ")  # Normalize the dog name
        image_filename = match.group(3)

        # Download the image from the attachment_url
        image_content = await download_image(attachment_url)
        if not image_content:
            return

        file = UploadFile(filename=image_filename, file=BytesIO(image_content))

        # Upload image to the new container
        media_url, _ = await MediaService.upload_media(file, entry_type)

        if entry_type == "dogs":
            # Fetch the corresponding Dog entry
            result = await session.execute(
                select(Dog).filter(Dog.name.ilike(dog_name))
            )
            dog = result.scalars().first()
            if dog:
                # Create a new Photo entry with the uploaded media URL
                photo = Photo(dog_id=dog.id, photo_url=media_url, alt=dog.name)
                session.add(photo)
                logger.info(f"Added photo for Dog: {dog.name}")
            else:
                logger.warning(f"No Dog entry found for name: {dog_name}")

        elif entry_type == "productions":
            # Fetch the corresponding Production entry
            result = await session.execute(
                select(Production).filter(Production.name.ilike(dog_name))
            )
            production = result.scalars().first()
            if production:
                # Update the profile_photo for the Production entry
                production.profile_photo = media_url
                logger.info(f"Set profile photo for Production: {production.name}")
            else:
                logger.warning(f"No Production entry found for name: {dog_name}")

        # Commit the session to save changes
        await session.commit()

    except Exception as e:
        logger.error(f"An error occurred while processing {entry}: {e}")
        await session.rollback()


async def map_files_to_entries(blob_urls):
    try:
        # Initialize a new async session for each task to avoid concurrent session access
        async_session = create_async_session(DATABASE_URL)
        for entry in blob_urls:
            async with async_session() as session:
                await upload_and_map_image(entry, session)

    except Exception as e:
        logger.error(f"An error occurred: {e}")
    finally:
        await async_session.close()


async def main():
    # Example blob_urls
    blob_urls = [
        {
            "link": "https://texastopnotchfrenchies.com/productions/henry/henry-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/henry.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/mr-gus/gus/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/gus-e1712891546481.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/louie/louie-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/louie.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/phyllis-sinatra-gambino/phyliss/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/phyliss.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/ladybug/ladybug-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/ladybug.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/astra/astra-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/astra.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/nixi-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/nixi.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/ghost-ryder/ghost-rider/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/ghost-rider-e1712891385972.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/theodore/theodore-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/theodore.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/diesel/diesel-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/diesel.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/mia/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/mia.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/luna/luna-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/luna.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/blue/blue-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/blue.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/coco-2/coco-3/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/coco.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/kaz-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/kaz.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/lenni-lou/lennie-lou/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/lennie-lou.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/taja/taja-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/taja.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/lex-luther/lex-luther-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/lex-luther.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/kiwi/kiwi-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/kiwi.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/maxx/max/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/max.png"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/skipper/skipper-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/skipper.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/miss-fia/miss-fia-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/miss-fia.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/beau-louie/321125488_449959877344054_5238302612400792525_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321125488_449959877344054_5238302612400792525_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/pyper-rose/320725632_480007080921435_4813727481997858277_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/320725632_480007080921435_4813727481997858277_n.jpeg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/priscilla/priscilla-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/priscilla.jpeg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/home/320277169_920956245566116_7512405805898762110_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/320277169_920956245566116_7512405805898762110_n-e1672265908918.jpeg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/home/g0yapf7-1-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/G0yapF7-1-1-e1672266707517.jpeg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/bucee/321065746_496008432620776_5167445284308649468_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321065746_496008432620776_5167445284308649468_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/taz/319719896_1332773640859147_2711974200206006097_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/319719896_1332773640859147_2711974200206006097_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/cash-money/320532681_8854288564588754_5040864790697386630_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/320532681_8854288564588754_5040864790697386630_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/tito-and-blaze/320673452_643562310830840_8575212893564166994_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/320673452_643562310830840_8575212893564166994_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/sassy-kaz/320838029_913910196265404_5787663995364399620_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/320838029_913910196265404_5787663995364399620_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/princess-zelda-and-link/322368847_843344766776387_6864419373881527354_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/322368847_843344766776387_6864419373881527354_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/kb/320512292_1473727086451989_7761702554420139796_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/320512292_1473727086451989_7761702554420139796_n-e1712892085312.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/sariya/320785485_970342687257933_2608109952351664243_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/320785485_970342687257933_2608109952351664243_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/nixi/321584436_4212818425508884_5629351479619592445_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321584436_4212818425508884_5629351479619592445_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/archie/321238333_1090144671655609_8972072037043063940_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321238333_1090144671655609_8972072037043063940_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/nacho/321547543_882879146468335_8033042244382536117_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321547543_882879146468335_8033042244382536117_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/yenko/312875742_522733856526371_4979629198425035519_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/312875742_522733856526371_4979629198425035519_n.jpeg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/trilogy/321039929_730916408311399_2176271158431773988_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321039929_730916408311399_2176271158431773988_n-e1712890639102.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/maverick/322033339_941019917310258_6417652171640222308_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/322033339_941019917310258_6417652171640222308_n.jpeg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/dirty-money/322157838_983882819666988_7557432193029401292_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/322157838_983882819666988_7557432193029401292_n.jpeg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/jett/321241813_724571395761648_533889674935729052_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321241813_724571395761648_533889674935729052_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/hippo/322412507_822789385482763_9190988332662906450_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/322412507_822789385482763_9190988332662906450_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/rocky/321412336_5815715448523463_4363941821320453174_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321412336_5815715448523463_4363941821320453174_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/franklin/320933184_563473532317557_7953962819661646456_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/320933184_563473532317557_7953962819661646456_n-e1712891076347.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/hunter/322509704_448725750644888_8507755398535051440_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/322509704_448725750644888_8507755398535051440_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/mila/322727106_620586843401127_7920537362025844886_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/322727106_620586843401127_7920537362025844886_n-e1712891218885.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/hippo/322598388_459909679675790_4729468334884758802_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/322598388_459909679675790_4729468334884758802_n-e1712892402152.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/tinkerbell/322406664_3464967900390867_6470570793647966645_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/322406664_3464967900390867_6470570793647966645_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/gizmo/321497403_2324488771065234_140106699871566325_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321497403_2324488771065234_140106699871566325_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/hayzl/321588300_1134692130525568_4295670201657316074_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321588300_1134692130525568_4295670201657316074_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/peavy/322367570_539702081541842_6458900131414708575_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/322367570_539702081541842_6458900131414708575_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/dotti-lucille/322000681_662265512303755_111816062361874193_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/322000681_662265512303755_111816062361874193_n-e1712890724258.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/handsome-jack/322373718_530430929135119_9087733965002784447_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/322373718_530430929135119_9087733965002784447_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/kiva/321613866_880398632983113_1617924259952184038_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321613866_880398632983113_1617924259952184038_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/coco/321307030_887437462388761_6984147149926255318_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321307030_887437462388761_6984147149926255318_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/lonely-star/322672804_550510236714683_4724983136898470687_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/322672804_550510236714683_4724983136898470687_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/kyah/321930219_685261899810912_5262342118464570189_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321930219_685261899810912_5262342118464570189_n-e1712892197835.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/draco/320679155_875018396975326_4492696543522927967_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/320679155_875018396975326_4492696543522927967_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/olive/321291102_6087672807930291_1323920882250336083_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321291102_6087672807930291_1323920882250336083_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/cartel/321380920_829859504761289_8417141378320718756_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321380920_829859504761289_8417141378320718756_n-e1712892323114.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/buttons/321800910_565437861718926_8948389343645369731_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321800910_565437861718926_8948389343645369731_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/yuli/321769495_693939079113975_7625551546316323247_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321769495_693939079113975_7625551546316323247_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/kayda/321493028_541187298037158_7917954918097001634_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321493028_541187298037158_7917954918097001634_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/yuki/321418947_704549474520439_5584726999378381040_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321418947_704549474520439_5584726999378381040_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/stella-2/321282461_478851031101601_507017038685586429_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321282461_478851031101601_507017038685586429_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/rocko/320989006_849780859618579_6923275542863964355_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/320989006_849780859618579_6923275542863964355_n-e1712890548863.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/doc-holliday/321550690_720938859758891_4028855972471748163_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321550690_720938859758891_4028855972471748163_n-e1712892802638.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/beau/322134026_1536520910182982_4556544161321842587_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/322134026_1536520910182982_4556544161321842587_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/kali/320244200_1008332056649960_8379979610511662235_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/320244200_1008332056649960_8379979610511662235_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/covid/320432601_1189063541701500_3432589543216782029_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/320432601_1189063541701500_3432589543216782029_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/money-man/321384080_3251527741765379_5647966188854973611_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321384080_3251527741765379_5647966188854973611_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/doc/225714305_421039125983565_3986952111257721617_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/225714305_421039125983565_3986952111257721617_n-scaled-e1712892250279.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/noah/321860847_1209184493328666_4702633823122990470_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321860847_1209184493328666_4702633823122990470_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/fendi/318844929_482827783966385_8706495796074777404_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/318844929_482827783966385_8706495796074777404_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/lonely-star/322518552_866518767992205_4751204998563451582_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/322518552_866518767992205_4751204998563451582_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/montana/320827790_873863010479649_3870539961339766508_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/320827790_873863010479649_3870539961339766508_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/stitch/322017984_1320746662022343_3260521707854718848_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/322017984_1320746662022343_3260521707854718848_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/fiona/322136581_686264033141538_9143814772207053820_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/322136581_686264033141538_9143814772207053820_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/322475667_718382856478200_651015187140076560_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/322475667_718382856478200_651015187140076560_n.jpeg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/321921227_1259331964620529_2062271736528125201_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321921227_1259331964620529_2062271736528125201_n.jpeg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/lex-luther/322068568_6073801869318371_3552850007424810820_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/322068568_6073801869318371_3552850007424810820_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/xo/322097025_1326488101497119_3621122591900720914_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/322097025_1326488101497119_3621122591900720914_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/yazzy/321651374_1675878889498803_725193204273055643_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321651374_1675878889498803_725193204273055643_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/abigail/322552015_503740175161589_5371086554270110275_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/322552015_503740175161589_5371086554270110275_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/toka/321296317_5840502306015917_6258034135144877157_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321296317_5840502306015917_6258034135144877157_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/lil-grizzly/322000705_569919441184905_6230523754785139830_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/322000705_569919441184905_6230523754785139830_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/finn/322191934_1516563065490790_2628980848444223237_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/322191934_1516563065490790_2628980848444223237_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/olive-2/320532673_480122934196323_5374298091933816752_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/320532673_480122934196323_5374298091933816752_n-e1712890455704.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/322475667_718382856478200_651015187140076560_n-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/322475667_718382856478200_651015187140076560_n-1.jpeg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/322535598_5917162268344551_3575349239111597684_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/01/322535598_5917162268344551_3575349239111597684_n.mp4"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/nova/322017984_516309240594977_7476530727794682761_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/01/322017984_516309240594977_7476530727794682761_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/the-bread-winner/321724021_933817181328600_8840690424071565808_n/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321724021_933817181328600_8840690424071565808_n.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/beef/321850973_3439722349629186_8600580363610781867_n-1/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/321850973_3439722349629186_8600580363610781867_n-1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/paper-trail/322548821_556130496417817_1062106101502430922_n-1/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/322548821_556130496417817_1062106101502430922_n-1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yenko/fb_img_1672544884138-1/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/FB_IMG_1672544884138-1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/kayda/collagemaker_20230101_004232686/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/CollageMaker_20230101_004232686.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/tonga/tonga7/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/tonga7-scaled.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/pita/mygirl7/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/mygirl7.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/pita/mygirl/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/mygirl.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yuki/20230121_121809/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/20230121_121809-scaled.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/cream2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/cream2.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/creamneon3/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/creamneon3.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/link/image000000004/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/image000000004.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/cash/20210822_222333/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/20210822_222333.png"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/dusty-baker-norman/20230215_212927/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/20230215_212927.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/chevy-joe/img_2646/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/IMG_2646.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/aspen/fb_img_1676518927493/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/FB_IMG_1676518927493.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/the-breadwinner/bread6/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/bread6.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/mia/20230215_215405/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/20230215_215405.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/aspen/fb_img_1676518927493-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/FB_IMG_1676518927493-1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/aspen/fb_img_1676518933834/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/FB_IMG_1676518933834.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/tonga/tonga4-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/tonga4.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/astra/20230119_204739/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/20230119_204739.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/toka/toka6/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/toka6.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/toka/toka4/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/toka4.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/toka/toka3-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/toka3.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/toka/toka2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/toka2.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/toka/toka-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/toka.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/malakai/malakai3-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/malakai3.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/malakai/malakai2-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/malakai2.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/malakai/malakai1-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/malakai1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/malakai/malakai1-3/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/malakai1-1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/rainbow/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/rainbow.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/creamneon3-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/creamneon3.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/rainbow-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/rainbow-1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/cream4/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/cream4.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/cash-money/image0000011/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/image0000011.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/cream5/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/cream5.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/lilac1/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/lilac1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/neon4/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/neon4.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/neon2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/neon2.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/lilac1-1/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/lilac1-1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_3834/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/IMG_3834.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/cash-money/cash1/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/cash1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/cash-money/cash12/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/cash12.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/cash-money/cash5/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/cash5.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yanmar/yan4/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/yan4.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yanmar/yan3/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/yan3.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yanmar/yan/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/yan.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yenko/attachment/18/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/18.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yenko/attachment/17/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/17.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yenko/attachment/9/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/9.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yenko/attachment/7/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/7.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yenko/attachment/4/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/4.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yenko/20230321_194929/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/20230321_194929.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yenko/335720455_1824617011227062_3550325297653098609_n-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/335720455_1824617011227062_3550325297653098609_n-2.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yenko/335773271_1638525866607713_5328791404310869934_n-1/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/335773271_1638525866607713_5328791404310869934_n-1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/aspen/20230321_195019/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/20230321_195019.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/aspen/20230321_194951/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/20230321_194951.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/aspen/20230321_195036/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/20230321_195036.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/breedings/narco-x-peavy/white_logo_color_background/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/white_logo_color_background-scaled.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/plat11/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/plat11.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/yuki/335501891_190297930388795_1409648663227025891_n-1/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/335501891_190297930388795_1409648663227025891_n-1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/dirty-money/dirty1/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/dirty1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/blu/redwhiteblue5/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/redwhiteblue5.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/ice/img_03201/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/IMG_03201.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/luna-2/merlegirl5/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/merlegirl5.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/kamikaze/lilmerle12/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/lilmerle12.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/ricky-baker/20230321_205149/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/20230321_205149.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/lila/20230321_205952/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/20230321_205952.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yuki/335501891_190297930388795_1409648663227025891_n-1-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/335501891_190297930388795_1409648663227025891_n-1-1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yuki/333609828_1763092720764197_848691622521364423_n-1/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/333609828_1763092720764197_848691622521364423_n-1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/priscilla/fb_img_1679451180368/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/FB_IMG_1679451180368.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/pita/pita-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/pita.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/duffy/20230321_212830/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/20230321_212830.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/louie-2/plat4/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/plat4.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/tonga/tonga4-3/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/tonga4.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/kamikaze/lilmerle12-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/lilmerle12-1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/kamikaze/lilmerle2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/lilmerle2.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/kamikaze/lilmerle9/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/lilmerle9.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/kamikaze/merle9/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/merle9.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/kamikaze/merle8/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/merle8.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/kamikaze/merle6/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/merle6.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/kamikaze/merle4/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/merle4.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/kamikaze/merle3/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/merle3.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/kamikaze/merle2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/merle2.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/kamikaze/merle1/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/merle1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/pita/pita-3/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/pita.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/pita/pita1/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/pita1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/pita/mygirl7-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/mygirl7-1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/xgx67pg-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/Xgx67pg-e1680016681651.png"
        },
        {
            "link": "https://texastopnotchfrenchies.com/untitled-design/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/Untitled-design.png"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/april1o/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/04/april1o.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/april1g/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/04/april1g.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/april1d/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/04/april1d.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/april1f/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/04/april1f.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/april1s/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/04/april1s.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/april1p/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/04/april1p-scaled.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/tuna/img_9206/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/IMG_9206.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/tater/screenshot_20230402-172824_business-suite/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/04/Screenshot_20230402-172824_Business-Suite.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/chevy-joe/20230403_142637/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/20230403_142637.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/neva/april15ww/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/04/april15ww.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/neva/april15b/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/04/april15b.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/neva/april15v/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/04/april15v.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/neva/april15c/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/04/april15c.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/neva/april15x/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/04/april15x.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/neva/april15z/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/04/april15z.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/neva/april15l/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/04/april15l.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/tonga/april15a/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/april15a.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/thunder-cat/april15h/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/april15h.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/thunder-cat/april15q/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/april15q.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/beef/april15y/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/april15y.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/rueger/20230426_194351/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/04/20230426_194351.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/cash-money/april27k/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/april27k.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/cash-money/april27j/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/april27j.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/kamikaze/april27p/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/april27p.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/kamikaze/april27t/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/april27t.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/kamikaze/april27q/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/april27q.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/kamikaze/april27o/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/april27o.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/kamikaze/april27i/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/april27i.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yuli/april27h/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/april27h.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yuli/april27g/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/april27g.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yuli/april27f/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/april27f.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yuli/april27d/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/april27d.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yuli/april27s/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/april27s.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yuli/april27a/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/april27a.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yuli/april27y/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/april27y.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yuli/april27r/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/april27r.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yuli/april27w/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/april27w.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/sassy-kaz/img_3586/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/IMG_3586.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/pyper/pyper30628/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/06/pyper30628.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/pyper/pyper30628-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/06/pyper30628-1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/pyper/pyper20628/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/06/pyper20628.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/pyper/pyper10628/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/06/pyper10628.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/paper-trail/paper80628/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/paper80628.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/paper-trail/paper70628/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/paper70628.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/paper-trail/paper60628/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/paper60628.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/paper-trail/paper50628/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/paper50628.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/paper-trail/paper30628/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/paper30628.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/paper-trail/paper10628/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/paper10628.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/paper-trail/paper0628/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/paper0628.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/the-bread-winner/bred90628/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/bred90628.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/the-bread-winner/bread80628/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/bread80628.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/the-bread-winner/bread70628/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/bread70628.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/the-bread-winner/bread60628/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/bread60628.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/the-bread-winner/bread50628/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/bread50628.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/the-bread-winner/bread40628/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/bread40628.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/the-bread-winner/bread30628/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/bread30628.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/the-bread-winner/bread20628/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/bread20628.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/the-bread-winner/bread10628/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/bread10628.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/the-bread-winner/bread0628/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/bread0628.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yenko/yenko-june21a/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/yenko-june21a.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yenko/yenko-june21p/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/yenko-june21p.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yenko/yenko-june21o/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/yenko-june21o.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yenko/yenko-june21i/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/yenko-june21i.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yenko/yenko-june21u/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/yenko-june21u.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yenko/yenko-june21y/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/yenko-june21y.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yenko/yenko-june21t/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/yenko-june21t.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yenko/yenko-june21-r/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/yenko-june21-r.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/fendi/screenshot_20230705-174303_gallery/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/Screenshot_20230705-174303_Gallery.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/yuli/screenshot_20230705-174700_gallery/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/Screenshot_20230705-174700_Gallery.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/abigail/screenshot_20230705-174642_gallery/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/Screenshot_20230705-174642_Gallery.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/tito-and-blaze/img_5463/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/IMG_5463-e1712890044497.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/rocky/received_596741889266879/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/received_596741889266879.jpeg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/buttons/received_659564505524200/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/received_659564505524200-e1712890841923.jpeg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/duffy/screenshot_20230705-174611_gallery/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/Screenshot_20230705-174611_Gallery.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/planned-breedings/kamikze-1/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/08/kamikze-1-scaled.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/planned-breedings/pita-1/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/08/pita-1-scaled.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/planned-breedings/20230808_210931/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/08/20230808_210931-scaled.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/planned-breedings/pita2-1/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/08/Pita2-1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/planned-breedings/screenshot_20230812_001308_instagram/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/08/Screenshot_20230812_001308_Instagram.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/planned-breedings/20230807_1751590/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/08/20230807_1751590.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/planned-breedings/screenshot_20230816_164324_samsung-notes/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/08/Screenshot_20230816_164324_Samsung-Notes.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/planned-breedings/fb_img_1689609639627/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/08/FB_IMG_1689609639627.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/planned-breedings/fb_img_1689609635398/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/08/FB_IMG_1689609635398.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/collagemaker_20230610_010459398/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/08/CollageMaker_20230610_010459398-scaled.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/image0000011-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/08/image0000011.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/screenshot_20230705-174611_gallery-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/08/Screenshot_20230705-174611_Gallery.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/aspen/screenshot_20230727-120443_gallery/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/Screenshot_20230727-120443_Gallery.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/aspen/screenshot_20230727-120454_gallery/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/Screenshot_20230727-120454_Gallery.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/aspen/screenshot_20230727-120506_gallery/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/Screenshot_20230727-120506_Gallery.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/aspen/screenshot_20230812_001308_instagram-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/Screenshot_20230812_001308_Instagram.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/aspen/kamikaze3-1/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/kamikaze3-1-scaled.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/sassy-kaz/img_4507/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/IMG_4507.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/duffy/screenshot_20230705-174428_gallery/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/Screenshot_20230705-174428_Gallery.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/duffy/screenshot_20230705-174428_gallery-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/Screenshot_20230705-174428_Gallery-1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/stella-3/screenshot_20230705-174319_gallery/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/08/Screenshot_20230705-174319_Gallery.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/mia/img_1001/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/IMG_1001.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/recommendations/untitled-document/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/08/Untitled-document.pdf"
        },
        {
            "link": "https://texastopnotchfrenchies.com/recommendations/untitled-document-1/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/08/Untitled-document-1.pdf"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/blu/img_1395/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/IMG_1395.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/chevy-joe/chevyjoe/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/02/chevyjoe.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/ice/ice4/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/ice4.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/kamikaze/kamikze/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/kamikze-scaled.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/planned-breedings/collagemaker_20230914_162800339/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/09/CollageMaker_20230914_162800339-scaled.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/planned-breedings/collagemaker_20230914_162800339-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/09/CollageMaker_20230914_162800339-1-scaled.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/planned-breedings/collagemaker_20230914_162800339-3/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/09/CollageMaker_20230914_162800339-2-scaled.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/planned-breedings/collagemaker_20230914_162800339-4/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/09/CollageMaker_20230914_162800339-3.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/cash-money/cash5-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/cash5-1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/planned-breedings/img_20231025_121614_314/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/10/IMG_20231025_121614_314-scaled.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/planned-breedings/img_20231025_121614_314-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/10/IMG_20231025_121614_314-1-scaled.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/planned-breedings/img_20231025_121614_314-3/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/10/IMG_20231025_121614_314-2-scaled.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/planned-breedings/img_20231025_121614_314-4/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/10/IMG_20231025_121614_314-3.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_8826/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/10/IMG_8826.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_8765/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/10/IMG_8765.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_8761/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/10/IMG_8761.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_8906/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/10/IMG_8906.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_8906-1/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/10/IMG_8906-1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_8751/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/10/IMG_8751.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_8751-1/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/10/IMG_8751-1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/high-roller/20231011_221035/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/11/20231011_221035.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/frankie/img_3026/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/11/IMG_3026.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/bank-roll/img_8202/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/11/IMG_8202.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/kamikaze/img_8516/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/IMG_8516.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/taz/img_0035/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/IMG_0035.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/kamikaze/img_8618/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/03/IMG_8618.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_9152/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/12/IMG_9152.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_9278/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/12/IMG_9278.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_9185/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/12/IMG_9185.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_9131/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/12/IMG_9131.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/louie/img_9281/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/12/IMG_9281.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/louie/img_9294/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/12/IMG_9294.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/louie/img_9296/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/12/IMG_9296.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/louie/img_9304/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/12/IMG_9304.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/louie/img_9305/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/12/IMG_9305.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/louie/img_9306/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/12/IMG_9306.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/louie/img_9307/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/12/IMG_9307.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/louie/img_9317/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/12/IMG_9317.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_9743/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/IMG_9743.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_9709/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/IMG_9709.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_9549/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/IMG_9549.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/high-roller/20231011_221035-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/20231011_221035.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/high-roller/img_8327/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/IMG_8327.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/high-roller/img_8338/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/IMG_8338.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/high-roller/img_8449/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/IMG_8449.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/kayda/img_9353/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/IMG_9353.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/vida/img_9416/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/IMG_9416.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/neva/april15ww-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/04/april15ww-1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/neva/april15c-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/04/april15c-1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/thunder-cat/img_9501/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/IMG_9501.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/thunder-cat/img_9501-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/IMG_9501-1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/lex-luther/20231230_101803/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/20231230_101803.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/drax/image00000016/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/image00000016.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/jon-benet/img_0220/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/IMG_0220.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/wrenly/img_7871/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/IMG_7871.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/frankie/20240116_211238/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2023/11/20240116_211238.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/sassy-kaz/20240116_211805/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/20240116_211805.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/priscilla/fb_img_1702496768352/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/FB_IMG_1702496768352-e1712890120926.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/the-breadwinner/img_9651/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/IMG_9651.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/dirty-money/img_9343/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/IMG_9343.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/bunny/img_9572/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_9572.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/bunny/img_9578/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_9578.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/bunny/img_9619/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_9619.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/bunny/img_9628/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_9628.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/bunny/img_9631/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_9631.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_0073/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_0073.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_0079/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_0079.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_0109/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_0109.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_0125/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_0125.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_0141/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_0141.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_0167/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_0167.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_0196/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_0196.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_0197/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_0197.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_0200/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_0200.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_0274/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_0274.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_0281/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_0281.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_0285/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_0285.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_0323/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_0323.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_0342/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_0342.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/available/img_0019/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_0019.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/bunny/img_0839/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_0839.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/high-roller/img_0633/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/IMG_0633.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/high-roller/img_0671/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/IMG_0671.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/high-roller/img_0696/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/IMG_0696.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/high-roller/img_0697/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/IMG_0697.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/high-roller/img_0713/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/IMG_0713.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/high-roller/img_0720/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/IMG_0720.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/high-roller/img_0736/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/IMG_0736.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/high-roller/img_0737/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/IMG_0737.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/high-roller/img_0759/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/IMG_0759.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/high-roller/img_0760/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/IMG_0760.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/high-roller/img_0762/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/IMG_0762.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/high-roller/img_0765/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/IMG_0765.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/high-roller/img_0766/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/IMG_0766.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/high-roller/img_0801/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/IMG_0801.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/high-roller/img_0849/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/IMG_0849.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/high-roller/img_0863/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/IMG_0863.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/astra/img_0801-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/IMG_0801.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/the-bread-winner/img_9554/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/IMG_9554.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/dogs/yuki/april1e/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/april1e.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/nova-2/img_0409/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_0409.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/chanel/img_0019-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_0019-1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/topnotch-r-zip/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/11/topnotch-r.zip"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/chump-change/img_0412/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_0412.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/sully/img_0285-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_0285-1.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/pricilla-jelly-bean-jo/img_9185-2/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_9185.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/chump-change/img_4572/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_4572.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/cocoa-pebbles-and-thor/img_1191/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_1191.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/ransom/img_7036/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_7036.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/mera-jolee/fullsizer/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/FullSizeR.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/drax/attachment/1259564200461928391/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/01/1259564200461928391.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/princess-zelda-and-link/attachment/14864839161379000481/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/14864839161379000481.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/chanel/img_3599/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/02/IMG_3599.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/kiwi/img_0722/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/IMG_0722-e1712888098355.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/louis/img_7203/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/04/IMG_7203-e1712889826488.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/winter/messenger_creation_66333073-6cc3-4bca-8ebc-634122da3d82_0/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/04/Messenger_creation_66333073-6CC3-4BCA-8EBC-634122DA3D82_0.jpeg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/tuffy-lou/screenshot_20240411_213507_gallery/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2024/04/Screenshot_20240411_213507_Gallery-e1712889540401.jpg"
        },
        {
            "link": "https://texastopnotchfrenchies.com/productions/ladybug/messenger_creation_c230f007-fe1f-4055-9101-5fa7aba18efc_0/",
            "attachment_url": "https://texastopnotchfrenchies.com/wp-content/uploads/2022/12/Messenger_creation_C230F007-FE1F-4055-9101-5FA7ABA18EFC_0-scaled-e1712891860891.jpeg"
        }
    ]
    await map_files_to_entries(blob_urls)


if __name__ == "__main__":
    asyncio.run(main())
    logger.info("Images successfully mapped")
