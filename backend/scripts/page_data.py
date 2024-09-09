import uuid
from datetime import datetime

default_page_data = [
    {
        "id": str(uuid.uuid4()),
        "type": "page",
        "name": "Home",
        "slug": "home",
        "meta": {
            "title": "Home",
            "description": "Welcome to our home page",
            "keywords": "home, dogs, breeding",
        },
        "content": [
            {
                "id": str(uuid.uuid4()),
                "type": "HeaderBlock",
                "props": {
                    "content": "Welcome to Our Home Page",
                    "level": 1,
                    "style": {
                        "textAlign": "center",
                        "color": "#333",
                    },
                },
            },
            {
                "id": str(uuid.uuid4()),
                "type": "TextBlock",
                "props": {
                    "content": "We are dedicated to breeding the best dogs with love and care.",
                    "style": {
                        "fontSize": "18px",
                        "textAlign": "center",
                    },
                },
            },
            {
                "id": str(uuid.uuid4()),
                "type": "ImageBlock",
                "props": {
                    "url": "https://via.placeholder.com/600x400",
                    "alt": "Placeholder image",
                    "style": {
                        "width": "100%",
                        "height": "auto",
                        "display": "block",
                        "margin": "0 auto",
                    },
                },
            },
            {
                "id": str(uuid.uuid4()),
                "type": "ButtonBlock",
                "props": {
                    "label": "Learn More",
                    "url": "/about",
                    "style": {
                        "display": "block",
                        "margin": "20px auto",
                        "padding": "10px 20px",
                        "backgroundColor": "#007bff",
                        "color": "#fff",
                        "textAlign": "center",
                        "borderRadius": "5px",
                    },
                },
            },
        ],
        "status": "published",
        "is_locked": False,
        "tags": ["home"],
        "language": "en",
        "created_at": datetime.now().isoformat(),
        "published_at": datetime.now().isoformat(),
    },
    {
        "id": str(uuid.uuid4()),
        "type": "page",
        "name": "About",
        "slug": "about",
        "meta": {
            "title": "About Us",
            "description": "Learn more about us",
            "keywords": "about, dogs, breeding",
        },
        "content": [
            {
                "id": str(uuid.uuid4()),
                "type": "HeaderBlock",
                "props": {
                    "content": "About Us",
                    "level": 1,
                    "style": {
                        "textAlign": "left",
                        "color": "#333",
                    },
                },
            },
            {
                "id": str(uuid.uuid4()),
                "type": "TextBlock",
                "props": {
                    "content": "Our breeding program is centered on the health and well-being of our dogs.",
                    "style": {
                        "fontSize": "18px",
                        "textAlign": "left",
                    },
                },
            },
            {
                "id": str(uuid.uuid4()),
                "type": "ImageBlock",
                "props": {
                    "url": "https://via.placeholder.com/800x400",
                    "alt": "About us image",
                    "style": {
                        "width": "100%",
                        "height": "auto",
                        "display": "block",
                        "margin": "20px 0",
                    },
                },
            },
            {
                "id": str(uuid.uuid4()),
                "type": "TextBlock",
                "props": {
                    "content": "We focus on quality, not quantity, and strive to produce dogs that are not only beautiful but also healthy and happy.",
                    "style": {
                        "fontSize": "16px",
                        "textAlign": "left",
                        "marginBottom": "20px",
                    },
                },
            },
        ],
        "status": "published",
        "is_locked": False,
        "tags": ["about"],
        "language": "en",
        "created_at": datetime.now().isoformat(),
        "published_at": datetime.now().isoformat(),
    },
    {
        "id": str(uuid.uuid4()),
        "type": "page",
        "name": "Our Services",
        "slug": "our-services",
        "meta": {
            "title": "Our Services",
            "description": "Learn about the services we offer",
            "keywords": "services, dog breeding, training",
        },
        "content": [
            {
                "id": str(uuid.uuid4()),
                "type": "HeaderBlock",
                "props": {
                    "content": "Our Services",
                    "level": 1,
                    "style": {
                        "textAlign": "left",
                        "color": "#333",
                    },
                },
            },
            {
                "id": str(uuid.uuid4()),
                "type": "TextBlock",
                "props": {
                    "content": "We offer a range of services to help you find the perfect companion.",
                    "style": {
                        "fontSize": "18px",
                        "textAlign": "left",
                    },
                },
            },
            {
                "id": str(uuid.uuid4()),
                "type": "ListBlock",
                "props": {
                    "items": [
                        "Dog breeding",
                        "Puppy training",
                        "Veterinary care",
                        "Adoption services",
                    ],
                    "listStyleType": "disc",
                    "style": {
                        "fontSize": "16px",
                        "paddingLeft": "20px",
                    },
                },
            },
        ],
        "status": "published",
        "is_locked": False,
        "tags": ["services"],
        "language": "en",
        "created_at": datetime.now().isoformat(),
        "published_at": datetime.now().isoformat(),
    },
    {
        "id": str(uuid.uuid4()),
        "type": "page",
        "name": "Contact",
        "slug": "contact",
        "meta": {
            "title": "Contact Us",
            "description": "Get in touch with us",
            "keywords": "contact, reach out",
        },
        "content": [
            {
                "id": str(uuid.uuid4()),
                "type": "HeaderBlock",
                "props": {
                    "content": "Contact Us",
                    "level": 1,
                    "style": {
                        "textAlign": "center",
                        "color": "#333",
                    },
                },
            },
            {
                "id": str(uuid.uuid4()),
                "type": "TextBlock",
                "props": {
                    "content": "We would love to hear from you! Please reach out to us through any of the following methods.",
                    "style": {
                        "fontSize": "18px",
                        "textAlign": "center",
                    },
                },
            },
            {
                "id": str(uuid.uuid4()),
                "type": "TextBlock",
                "props": {
                    "content": "Email: info@example.com\nPhone: 123-456-7890",
                    "style": {
                        "fontSize": "16px",
                        "textAlign": "center",
                    },
                },
            },
        ],
        "status": "published",
        "is_locked": False,
        "tags": ["contact"],
        "language": "en",
        "created_at": datetime.now().isoformat(),
        "published_at": datetime.now().isoformat(),
    },
]
