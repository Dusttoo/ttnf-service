import xml.etree.ElementTree as ET
import json


def extract_data_from_xml(xml_file, json_file):
    # Parse the XML file
    tree = ET.parse(xml_file)
    root = tree.getroot()

    # Namespace mapping
    namespaces = {"wp": "http://wordpress.org/export/1.2/"}

    # List to hold extracted data
    data = []

    # Iterate over each item element
    for item in root.findall("./channel/item"):
        # Extract the link
        link = item.find("link").text

        # Extract the wp:attachment_url
        attachment_url = item.find("wp:attachment_url", namespaces).text

        # Append extracted data to the list
        data.append({"link": link, "attachment_url": attachment_url})

    # Write data to JSON file
    with open(json_file, "w") as f:
        json.dump(data, f, indent=4)


# Example usage
extract_data_from_xml(
    "texastopnotchfrenchies.WordPress.2024-05-24.xml",
    "gallery_data.json",
)
