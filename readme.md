# API for Product Management with Airtable and File Upload

This is a simple API for managing products, integrated with Airtable, supporting CRUD operations, including the ability to upload and delete multiple images.

## 🚀 Features

- [Setup](#setup)
- [API Endpoints](#api-endpoints)
  - [GET All Products](#get-all-products)
  - [GET Single Product](#get-single-product)
  - [POST New Product](#post-new-product)
  - [PUT Update Product](#put-update-product)
  - [DELETE Product](#delete-product)
- [Explanation](#explanation)
---
## ⚙️ Setup

  ### 🔧 Prerequisites

  - Node.js (version 14 or higher)
  - NPM or Yarn
  - Airtable API key and Base ID
  - Frontend that can connect to the API (e.g., a static HTML page)

  ### 🌟 Installation

  1. Clone this repository:

  ```bash
  git clone https://github.com/your-username/product-management-api.git
  cd product-management-api
  ```

  2. Install dependencies:

  ```bash
  npm install
  ```

  3. Create a `.env` file in the root of the project with the following environment variables:

  ```bash
  AIRTABLE_API_KEY=your_airtable_api_key
  AIRTABLE_BASE_ID=your_airtable_base_id
  AIRTABLE_TABLE_NAME=your_airtable_table_name
  ```

  4. Install Multer for file upload and express, cors for handling requests:

  ```bash
  npm install multer axios express cors dotenv
  ```

  5. Running server. This will start the server on `http://localhost:3000`:

  ```bash
  node index.js
  ```
---
## 🔥 API ENDPOINT
  ### GET Product
  - **URL**: `/api/products`
  - **Method**: `GET`
  - **Description**: Retrieves a list of products.
  - **Response**: JSON object containing a list of products.
  ```bash
  curl http://localhost:3000/api/products
  ```
  ### GET Single Product
  - **URL**: `/api/products/:id`
  - **Method**: `GET`
  - **Description**: Retrieves a product by its ID.
  - **Response**: JSON object containing the product details.
  ```bash
  curl http://localhost:3000/api/products/{id}
  ```
  ### POST Product
  - **URL**: `/api/products`
  - **Method**: `POST`
  - **Description**: Create a new product. You need to send a multipart form request with images (multiple image files), name, price, and description fields.
  - **Request Body**: JSON object containing product details.
  - **Response**: JSON object containing the created product details.
  - **Example using Curl**: 
  ```bash
  curl -X POST http://localhost:3000/api/products \
    -F "name=Product Name" \
    -F "price=100" \
    -F "description=Product Description" \
    -F "images=@/path/to/image1.jpg" \
    -F "images=@/path/to/image2.jpg"
  ```
  ### PUT Product
  - **URL**: `/api/products/:id`
  - **Method**: `PUT`
  - **Description**: Update a product by its ID. You can also remove images by passing a list of image URLs to be removed.
  - **Request Body**: JSON object containing updated product details.
  - **Response**: JSON object containing the updated product details.
  - **Example using Curl**: 
  ```bash
  curl -X PUT http://localhost:3000/api/products/{id} \
    -F "name=Updated Product Name" \
    -F "price=150" \
    -F "description=Updated Description" \
    -F "removeImages=['http://localhost:3000/uploads/oldimage.jpg']" \
    -F "images=@/path/to/newimage.jpg"
  ```
  ### DELETE Product
  - **URL**: `/api/products/:id`
  - **Method**: `DELETE`
  - **Description**: Delete a product and its associated images from the server.
  - **Response**: JSON object containing a success message.
  - **Example using Curl**: 
  ```bash
  curl -X DELETE http://localhost:3000/api/products/{id}
  ```
---
## 💡 Explanation:
  - **Setup**: Describes how to install dependencies and create a `.env` file for configuration.
  - **API Endpoints**: Describes the available API endpoints, how to access them using `curl` for testing.
  - **Running the API**: Provides instructions on how to run the API server.