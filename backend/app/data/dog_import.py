import json
from enum import Enum


class GenderEnum(str, Enum):
    male = "Male"
    female = "Female"


class StatusEnum(str, Enum):
    available = "Available"
    sold = "Sold"
    stud = "Available For Stud"
    retired = "Retired"


def map_wp_dog_to_model(dog_data):
    gender_map = {"Male": GenderEnum.male, "Female": GenderEnum.female}
    status = StatusEnum.retired if dog_data.get("retired") else None

    dog = {
        "name": dog_data["title"],
        "gender": gender_map[dog_data["gender"]],
        "is_retired": dog_data.get("retired", False),
        "profile_photo": dog_data["img"],
        "description": dog_data["description"],
        "status": status,
        "pedigree_link": dog_data["url"],
    }

    dna_info = extract_dna_info(dog_data["description"])
    health_info = {
        "dna": dna_info,
        "carrier_status": "",
        "extra_info": "",
        "dog_name": dog_data["title"],
    }

    photo = {
        "photo_url": dog_data["img"],
        "alt": f"{dog_data['title']}'s photo",
        "dog_name": dog_data["title"],
    }

    return dog, health_info, photo


def extract_dna_info(description):
    dna_start = description.find("DNA:")
    if dna_start != -1:
        return description[dna_start + 4 :].strip()
    return ""


def map_wp_breeding_to_model(breeding_data):
    breeding = {
        "breeding_date": breeding_data["date"],
        "expected_birth_date": None,
        "description": breeding_data["content"]["rendered"],
        "link": breeding_data["link"],
        "title": breeding_data["title"]["rendered"],
        # Note: You would need to map the dog names to IDs in your seed process
        "female_dog_name": None,
        "male_dog_name": None,
    }
    return breeding


def map_wp_production_to_model(production_data):
    # Extracting the necessary fields from the provided data
    title = production_data.get("title", {}).get("rendered", "Unnamed Production")
    description = production_data.get("content", {}).get("rendered", "")

    # Attempt to find the profile photo using og:image data in yoast_head_json if featured_image is not available
    profile_photo = None
    if "yoast_head_json" in production_data:
        og_images = production_data["yoast_head_json"].get("og_image", [])
        if og_images:
            profile_photo = og_images[0].get("url", None)

    # If ACF data exists and is more appropriate, use it
    acf_featured_image = production_data.get("acf", {}).get("featured_image", None)
    if acf_featured_image:
        profile_photo = acf_featured_image  # Replace with actual logic to retrieve the URL from the ID

    production = {
        "name": title,
        "description": description,
        "owner": None,  # Example owner, update with actual data if available
        "sire_name": None,  # Map if the data is available
        "dam_name": None,  # Map if the data is available
        "gender": GenderEnum.male,  # You might need to adjust this based on your data
        "dog_names": [],  # Update with actual dog names if available
        "profile_photo": profile_photo,
    }

    return production


def main():
    with open("wordpress_data.json", "r") as file:
        data = json.load(file)

    dogs_data = data["tp/v1/dogs/males"] + data["tp/v1/dogs/females"]
    breedings_data = data["wp/v2/breeding"]
    productions_data = data[
        "wp/v2/production"
    ]
    print(f'\n{productions_data[0]["yoast_head"]}\n')
    all_dogs = []
    all_health_infos = []
    all_photos = []
    all_breedings = []
    all_productions = []

    for dog_data in dogs_data:
        dog, health_info, photo = map_wp_dog_to_model(dog_data)
        all_dogs.append(dog)
        all_health_infos.append(health_info)
        all_photos.append(photo)

    for breeding_data in breedings_data:
        breeding = map_wp_breeding_to_model(breeding_data)
        all_breedings.append(breeding)

    for production_data in productions_data:
        production = map_wp_production_to_model(production_data)
        all_productions.append(production)

    seed_data = {
        "dogs": all_dogs,
        "health_infos": all_health_infos,
        "photos": all_photos,
        "breedings": all_breedings,
        "productions": all_productions,
    }

    with open("seed_data.json", "w") as file:
        json.dump(seed_data, file, indent=4)


if __name__ == "__main__":
    main()
