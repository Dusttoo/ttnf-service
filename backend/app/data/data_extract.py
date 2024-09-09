import requests
import json


def fetch_data_from_wordpress(endpoint):
    url = f"https://texastopnotchfrenchies.com/wp-json/{endpoint}"
    response = requests.get(url)

    if response.status_code == 200:
        try:
            return response.json() 
        except json.JSONDecodeError:
            print(f"Error decoding JSON from {url}")
            return None
    else:
        print(f"Failed to fetch {endpoint}: {response.status_code}")
        return None


def main():
    endpoints = [
        "tp/v1/dogs/males",
        "tp/v1/dogs/females",
        "wp/v2/breeding",
        "wp/v2/litter",
        "wp/v2/production",
        "wp/v2/posts",
        "wp/v2/users",
    ]
    data = {}

    for endpoint in endpoints:
        data[endpoint] = fetch_data_from_wordpress(endpoint)

    # Optionally, save the data to a JSON file
    with open("wordpress_data.json", "w") as file:
        json.dump(data, file, indent=4)


if __name__ == "__main__":
    main()
