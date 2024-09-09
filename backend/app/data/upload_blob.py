import json
import os
import requests
from urllib.parse import urlparse
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
from azure.core.exceptions import ResourceExistsError


def upload_images_from_json_to_azure_blob(json_file, container_name, connection_string):
    # Read JSON file
    with open(json_file, "r") as f:
        data = json.load(f)

    # Create the BlobServiceClient object which will be used to create a container client
    blob_service_client = BlobServiceClient.from_connection_string(connection_string)

    try:
        # Create the container if it does not exist
        container_client = blob_service_client.create_container(container_name)
    except ResourceExistsError:
        # The container already exists
        container_client = blob_service_client.get_container_client(container_name)

    # Process each item in the JSON file
    for item in data:
        link = item["link"]
        attachment_url = item["attachment_url"]

        # Extract the directory structure and file name from the link and attachment_url
        parsed_link = urlparse(link)
        path_parts = parsed_link.path.strip("/").split("/")
        folder_structure = "/".join(path_parts[:-1])
        file_name = os.path.basename(attachment_url)

        # Full blob path
        blob_name = f"{folder_structure}/{file_name}"

        # Fetch the image from the URL
        response = requests.get(attachment_url)
        if response.status_code == 200:
            image_data = response.content
        else:
            print(
                f"Failed to fetch image from {attachment_url}. Status code: {response.status_code}"
            )
            continue

        # Create a blob client
        blob_client = container_client.get_blob_client(blob_name)

        # Upload the image data to the blob
        blob_client.upload_blob(image_data, overwrite=True)
        print(f"Uploaded image to {blob_client.url}")


# Example usage
connection_string = "DefaultEndpointsProtocol=https;AccountName=ttnfstore;AccountKey=z99du9pLQHa06Z0DPILsi5wUJl2ETtDCMDA6L6ZqjZagHHBmo1nNEOmYComXWPRalBVdrLf8c0Tz+AStApDaKA==;EndpointSuffix=core.windows.net"
json_file = "gallery_data.json"
container_name = "ttnf"

upload_images_from_json_to_azure_blob(json_file, container_name, connection_string)
