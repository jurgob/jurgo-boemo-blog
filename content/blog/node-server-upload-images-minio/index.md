---
  slug: "/posts/node-server-upload-images-minio/"
  date: 2024-09-21 15:19
  title: "Implementing a Node.js/Express Server Using MinIO for Image Uploads"
  draft: false
  description: "In this article, we'll set up a Node.js server using Express and MinIO for image uploads and downloads. Is gonna be fully functional locally without requiring any AWS credentials"
  categories: []
  keywords: []
---


# Implementing a Node.js/Express Server Using MinIO for Image Uploads

## What We're Going to Do

In this article, we'll set up a **Node.js server** using **Express** and **MinIO** for image uploads and downloads. Is gonna be fully functional locally without requiring any AWS credentials. Our server will have two key features:

1. **Generate Pre-signed URLs**:  
   - **Endpoint**: `http://localhost:3000/api/urls/:key`
   - This will generate `PUT` and `GET` pre-signed URLs for securely uploading and downloading files from MinIO without exposing credentials. the put url could be used by any http client to upload an image

2. **Upload an Image from a URL**:  
   - **Endpoint**: `/api/uploads/url?url=imageUrl&key=keyName`
   - This will download an image from a given URL, upload it to MinIO with a specified `key`, and return a public URL to access the image.

We’ll deploy **MinIO** locally using **Docker Compose** and implement the server using **Node.js**, **express**, **Axios** and the **[AWS Typescript SDK](https://github.com/aws/aws-sdk-js-v3)** (this last one will be configured to use minio instead of s3 in the backend).


## For the Impatient

If you want to dive right in, you can find the complete working code in the repository below. Follow the instructions in the `README` to get started:

👉 [https://github.com/jurgob/s3-test-minio](https://github.com/jurgob/s3-test-minio)


## Introduction to S3, MinIO and Pre-signed URLs

### Amazon S3 and Minio
**Amazon S3 (Simple Storage Service)** is a popular cloud storage solution that allows you to store and retrieve large amounts of data. It's often used for file uploads, backups, and serving static content. However, S3 itself is a **closed-source service**, making it challenging to test locally without using the cloud.

To address this issue, we can use **MinIO**, an open-source, S3-compatible storage solution that can be run locally. MinIO enables developers to simulate S3 interactions without needing an internet connection or an AWS account. You can use **MinIO** through the official AWS s3 sdk just chaning the service url to point at the Minio url.

### Pre-signed URLs?

**Pre-signed URLs** are secure, time-limited links that allow you to perform specific actions (like uploading or downloading files) without exposing your credentials. They are commonly used in scenarios where direct access to S3 (or a compatible service like MinIO) is required, but security is a concern.

**Why do you need them?**

#### Example: PUT Pre-signed URL

A **PUT** pre-signed URL allows you to upload a file directly to S3 (or MinIO) without needing credentials on the client-side.

```bash
# Example PUT request with a pre-signed URL
PUT https://bucketname.s3.amazonaws.com/yourkey?X-Amz-Expires=600&... # your presigned url

Headers:
Content-Type: image/jpeg
Content-Lenght: {fileSize}

Body: 
{the image content in binary format}
```
check the **uploadStream()** function defined below to see how to do it with axios.


### Why Are Pre-signed URLs Needed?

Pre-signed URLs are essential for securely uploading and downloading files directly to cloud storage (like S3 or MinIO) **without putting your backend in the middle of the process**. 

Managing file upload on the backend side is much harder then what you may thig, so Instead of routing large file uploads through your server, pre-signed URLs let clients upload files **directly** to storage (usually hosted by AWS), reducing [your] server load and improving efficiency. The URLs are temporary and grant **limited access** to specific files, ensuring security while allowing clients to upload or download files without exposing your credentials.





## Architecture Quick Overview
- **Node.js Server (Express):** Handles the API logic, generates pre-signed URLs, and uploads images to MinIO.
- **A set of docker compose services including:** 
    - **minio**: MinIO is a high-performance, self-hosted object storage service that is fully compatible with Amazon S3 APIs. It allows you to store large amounts of unstructured data (like images, videos, backups).
    - **createbuckets**: a script to do the initial setup of minio
- **npm run dev:** this npm script will spin up both the nodejs server and the docker compose. Is gonna be the only thing you need to run to make the server work.


## Setting up the server dependencies with docker compose

First, let's set up our MinIO instance. We'll be using Docker to run MinIO locally, and Docker Compose will make this process seamless.

Create a `docker-compose.yml` file with the following content:

```yaml
version: '3.8'

services:
  minio:
    image: minio/minio
    container_name: minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minio_username
      - MINIO_ROOT_PASSWORD=minio_password
    volumes:
      - /tmp/mino_data:/data
    command: server /data --console-address ":9001"

  createbuckets:
    image: minio/mc
    depends_on:
      - minio
    entrypoint: >
      /bin/sh -c "
      /usr/bin/mc alias set myminio http://minio:9000 minio_username minio_password;
      /usr/bin/mc mb myminio/miniobucket;
      /usr/bin/mc policy set public myminio/miniobucket;
      exit 0;
      "
```

if you run this with `npm run dev:server` and you navigate to `http://localhost:9001`. you should see the minio dashboard. you can login using `minio_username` as username and `minio_password` as password

you can now run `npm run cli` and see an image upload in your system.

### Explaining the Docker Compose File

This `docker-compose.yml` file is designed to run a local **MinIO** instance and automatically create a bucket with public access. Here's a breakdown of what each section does:


`version: '3.8'`: Specifies the version of Docker Compose being used.

`services:`: Defines the services (containers) that Docker will run.

`minio:`
- **Image**: Uses the official `minio/minio` image to run MinIO.
- **Container Name**: Names the container `minio`.
- **Ports**: 
    - Maps port `9000` on the host to `9000` on the container for the MinIO API.
    - Maps port `9001` on the host to `9001` on the container for the MinIO web console.
- **Environment Variables**: Sets up the root credentials for accessing MinIO:
    - `MINIO_ROOT_USER`: Sets the username.
    - `MINIO_ROOT_PASSWORD`: Sets the password.
- **Volumes**: Mounts `/tmp/mino_data` on the host to `/data` inside the container, ensuring that data persists locally.
- **Command**: Starts MinIO in server mode, storing data in `/data` and running the web console on `port 9001`.

`createbuckets:`
- **Image**: Uses the `minio/mc` image (MinIO client) to manage the MinIO instance.
- **depends_on**: Ensures that this service runs only after the `minio` container is up and running.
- **Entrypoint**: Runs a shell script to:
1. Set up an alias (`myminio`) pointing to the MinIO instance at `http://minio:9000` with the credentials.
2. Create a new bucket named `miniobucket`.
3. Set the bucket's policy to public, allowing anyone to access objects in the bucket.
4. Exit the script after the setup.

This setup ensures MinIO starts, creates a bucket, and configures it for public access automatically.



## Creating the Node.js server

There are gonna be 2 files: 

- `src/index.ts` -> this is contain the really intresting part. it's were we are gonna use the offical aws s3 sdk, configure it to point at our loca **minio**,  we are gonna use it to create presigned urls and we are gonna use **axios** to both download images and to upload images into minio.

- `src/server.ts` -> this will containt the server endpoints definition

### Understanding: `src/index.ts`

The `index.ts` file is responsible for interacting with MinIO by generating **pre-signed URLs** and **uploading files** via streams. Let’s break it down:

#### 1. ***Setting Up MinIO Client***
```ts
const s3Client = new S3Client({ 
    region: "REGION",
    credentials: {
        accessKeyId: "minio_username",
        secretAccessKey: "minio_password",
    }, 
    endpoint: "http://127.0.0.1:9000",
});
```

- A **MinIO** client is created using AWS SDK’s ```S3Client```.
- The credentials (```accessKeyId``` and ```secretAccessKey```) are set to the values defined in the Docker Compose file (```minio_username``` and ```minio_password```).
- The ```endpoint points``` to the local MinIO instance running on ```localhost:9000```.

#### 2. ***Generating Pre-signed URLs***


```ts
xport const generatePresignedUrl = async (objectKey: string, cmd : "get"| "put"): Promise<string> => {
    const bucketName: string = "miniobucket";
    if (!["get", "put"].includes(cmd)){
        throw "unkdonw cmd option"
    }
    let CmdObj = cmd === "put" ? PutObjectCommand : GetObjectCommand

    const commandOptions = {
        Bucket: bucketName,
        Key: objectKey,
      }

    const command = cmd === "put" 
        ? new PutObjectCommand(commandOptions) 
        : new GetObjectCommand(commandOptions) 
        
    try {
      const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });
      console.log("Presigned URL:", presignedUrl);
      return presignedUrl;
    } catch (err) {
      console.error("Error generating presigned URL:", err);
      throw err;
    }
  };
```


- This function generates pre-signed URLs for either uploading (PUT) or downloading (GET) a file from MinIO.
- The URL is generated using the AWS SDK’s getSignedUrl function and is valid for 600 seconds (10 minutes).
- The pre-signed URL is a secure, temporary URL that allows users to interact with a specific object (file) without needing credentials.

#### 4. ***Uploading a Stream to MinIO***

```ts
export const uploadStream = async (presignedUrl: string, readStream: Readable, contentLength: string, contentType: string): Promise<void> => {
    try {
        const response = await axios.put(presignedUrl, readStream, {
            headers: {
                'Content-Type': contentType,
                'Content-Length': contentLength,
            },
        });
    } catch (error: any) {
        throw error;
    }
};
```
 

- This function uploads a stream (e.g., an image file) to MinIO using a PUT pre-signed URL.
- **Axios** is used to send a `PUT` request with the stream and required headers:
    - **Content-Type:** The MIME type (e.g., `image/jpeg`).
    - **Content-Length:** The size of the image.

If the request is successful, the image will be stored in the MinIO bucket, accessible via the **GET pre-signed URL**.

#### Key Takeaways
- Pre-signed URLs enable secure, time-limited access to specific files in MinIO.
- The server uploads files by sending streams (image data) using a pre-signed PUT URL.
- Axios handles both generating and uploading streams, while the AWS SDK is used to interact with MinIO.


#### The complete `src/index.ts` file:

```ts
import axios from "axios";
import {createReadStream,statSync} from "fs";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { stat} from "fs/promises";
import { Readable } from "node:stream";

const s3Client = new S3Client({ 
    region: "REGION",
    credentials: {
        accessKeyId: "minio_username",
        secretAccessKey: "minio_password",
    }, 
    endpoint: "http://127.0.0.1:9000",
});

export const generatePresignedUrl = async (objectKey: string, cmd : "get"| "put"): Promise<string> => {
    const bucketName: string = "miniobucket";
    if (!["get", "put"].includes(cmd)){
        throw "unkdonw cmd option"
    }
    let CmdObj = cmd === "put" ? PutObjectCommand : GetObjectCommand

    const commandOptions = {
        Bucket: bucketName,
        Key: objectKey,
      }

    const command = cmd === "put" 
        ? new PutObjectCommand(commandOptions) 
        : new GetObjectCommand(commandOptions) 
        
    try {
      const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });
      console.log("Presigned URL:", presignedUrl);
      return presignedUrl;
    } catch (err) {
      console.error("Error generating presigned URL:", err);
      throw err;
    }
  };


export  const uploadFileWithPresignedUrl = async (presignedUrl: string, filePath: string): Promise<void> => {
    const fileStream = createReadStream(filePath);
    const fileStats = await stat(filePath);

    await uploadStream(presignedUrl, fileStream, fileStats.size.toString(), "image/jpeg")

};

export  const uploadStream = async (presignedUrl: string, readStream: Readable, contentLength: string, contentType: string): Promise<void> => {
  try {
    const response = await axios.put(presignedUrl, readStream, {
      headers: {
        'Content-Type': "image/jpeg",
        'Content-Length': contentLength,
      },
    });
  
  } catch (error:any ) {
      console.error("ERROR UPLOADING THE IMAGE:")
      if (error.response) {
          console.error(error.response?.data)
          return 
      }else{
          console.log(error)
      }
      throw error;
  }
};
```

### Understanding `src/server.ts` 

This Node.js server built with **Express** provides an API to download an image from a given URL, upload it to MinIO, and return a pre-signed `GET` URL for retrieval. Here’s how the image download and upload process works.

#### **Endpoint**: `/api/uploads/images`
This route handles the logic for downloading an image from a given URL and uploading it to MinIO.

```ts
app.get('/api/uploads/images', async (req: Request, res: Response) => {
    
    try{
        const { url , key} = req.query;
        console.log({ url , key})
        if (!url || typeof url !== 'string') {
            throw {
                status: 400,
                message: 'The url query parameter is required',
                example: '/api/uploads/images?key=example&url=https://example.com/image.jpg'
            } as HTTPError;
            throw new Error('The imageUrl query parameter is required');
        }
        if (!key || typeof key !== 'string') {
            throw {
                status: 400,
                message: 'The key query parameter is required',
                example: '/api/uploads/images?key=example&url=https://example.com/image.jpg'
            } as HTTPError;
        }

        const [put, get] = await Promise.all([
            generatePresignedUrl(key, "put"),
            generatePresignedUrl(key, "get"),
        ])
        
        // download the content of the imageUrl param and put it in a readable stream. check the content type is an image. retrive the content length and put it in a variable
        const response = await axios.get(url, { responseType: 'stream' });
        const contentType = response.headers['content-type'];
        const contentLength = parseInt(response.headers['content-length'], 10);

        if (!contentType.startsWith('image/')) {
            throw new Error('The URL does not point to an image');
        }
        const imageStream = response.data as Readable;
        await uploadStream(put, imageStream, contentLength.toString(), contentType);


        res.json({
            key,
            contentType,
            contentLength,
            imageUrl: url,
            getUrl: get
        });

    }catch(e){
        httpError(res, e)
    }
});
```



#####  1. Get Query Parameters:
`url`: The URL of the image to download.
`key`: The unique key externally provied (name) for the file in MinIO.
The server validates that both the url and key parameters are provided.


#####  2. Generating Pre-signed URLs

```ts
const [put, get] = await Promise.all([
    generatePresignedUrl(key, "put"),
    generatePresignedUrl(key, "get"),
]);
```

- `PUT Pre-signed URL`: Used to upload the image to MinIO.
- `GET Pre-signed URL`: Generated for retrieving the image after upload.
These URLs are generated using the generatePresignedUrl function, which communicates with MinIO to create temporary access URLs for uploading and downloading files.

##### 3. Downloading the Image

```ts
const response = await axios.get(url, { responseType: 'stream' });
const contentType = response.headers['content-type'];
const contentLength = parseInt(response.headers['content-length'], 10);

if (!contentType.startsWith('image/')) {
    throw new Error('The URL does not point to an image');
}
```

- Image Download: The server uses Axios to download the image from the provided url. It requests the image as a stream (```responseType: 'stream'```), making it easier to handle large files without loading the entire file into memory.
- Headers:
    - contentType: The MIME type of the image, ensuring it is a valid image format.
    - contentLength: The size of the image file.

The server checks if the downloaded file is an image by verifying if the content-type starts with "image/".


##### 4. Uploading the Image to MinIO

```ts
const imageStream = response.data as Readable;
await uploadStream(put, imageStream, contentLength.toString(), contentType);

```

- Stream Upload: The server takes the downloaded image (which is a readable stream) and uploads it to MinIO using the PUT pre-signed URL.
- The `uploadStream` function handles the actual file upload:
- **Headers**:
    - `Content-Type`: Set to the downloaded image’s MIME type.
    - `Content-Length`: Set to the size of the image.

This ensures that the image is uploaded in the correct format and size.

##### 5. Response to Client

```ts
res.json({
    key,
    contentType,
    contentLength,
    imageUrl: url,
    getUrl: get
});

```

After the image is successfully uploaded, the server responds with:
- `key`: The unique key (name) under which the image was saved in MinIO.
- `contentType`: The MIME type of the image.
- `contentLength`: The size of the image.
- `imageUrl`: The original URL from which the image was downloaded.
- `getUrl`: A pre-signed GET URL that allows the user to download the image from MinIO.

#### **Endpoint**: `/api/urls/:key`

This is the entire endpoint code; it is quite self-explanatory at this point:

```ts
app.get('/api/urls/:key', async (req: Request, res: Response) => {
    try{
        const {key} = req.params;
        const [put, get] = await Promise.all([
            generatePresignedUrl(key, "put"),
            generatePresignedUrl(key, "get"),
        ])

        res.json({
            put:put,
            get
        });

    }catch(e){
        httpError(res, e);
    }
});
```


### The entire `scr/server.ts`:

```ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import { generatePresignedUrl, uploadStream } from ".";
import axios from 'axios';
import { Readable } from 'stream';

const app = express();
type HTTPError = {
    status: number,
    message: string,
    example?: string
}
app.use(cors());
app.use(express.json());

app.get('/api/urls/:key', async (req: Request, res: Response) => {
    try{
        const {key} = req.params;
        const [put, get] = await Promise.all([
            generatePresignedUrl(key, "put"),
            generatePresignedUrl(key, "get"),
        ])

        res.json({
            put:put,
            get
        });

    }catch(e){
        httpError(res, e);
    }
});

// add an endpoit /api/upload/images/:key/:url which genereate a get presigned url and upload the image to the presigned url and return the get presigned url
app.get('/api/uploads/images', async (req: Request, res: Response) => {
    
    try{
        const { url , key} = req.query;
        console.log({ url , key})
        if (!url || typeof url !== 'string') {
            throw {
                status: 400,
                message: 'The url query parameter is required',
                example: '/api/uploads/images?key=example&url=https://example.com/image.jpg'
            } as HTTPError;
            throw new Error('The imageUrl query parameter is required');
        }
        if (!key || typeof key !== 'string') {
            throw {
                status: 400,
                message: 'The key query parameter is required',
                example: '/api/uploads/images?key=example&url=https://example.com/image.jpg'
            } as HTTPError;
        }

        const [put, get] = await Promise.all([
            generatePresignedUrl(key, "put"),
            generatePresignedUrl(key, "get"),
        ])
        
        // download the content of the imageUrl param and put it in a readable stream. check the content type is an image. retrive the content length and put it in a variable
        const response = await axios.get(url, { responseType: 'stream' });
        const contentType = response.headers['content-type'];
        const contentLength = parseInt(response.headers['content-length'], 10);

        if (!contentType.startsWith('image/')) {
            throw new Error('The URL does not point to an image');
        }
        const imageStream = response.data as Readable;
        await uploadStream(put, imageStream, contentLength.toString(), contentType);


        res.json({
            key,
            contentType,
            contentLength,
            imageUrl: url,
            getUrl: get
        });

    }catch(e){
        httpError(res, e)
    }
});

const httpError = (res: Response, err: unknown) => {
    console.error(`ERROR: `, err);
    if(err 
        && typeof err === "object" 
        && "status" in err
        && "message" in err
        && "example" in err){
        const _err = err as HTTPError;
        
        res.status(_err.status)
        return res.json({
            message: _err.message,
            example: _err.example, 
        });
    }else {
        res.status(500)
        return res.json({
            status: 500, 
            message: err?.toString()
        });
    }
};

// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
```


## Npm scripts:

is worth to mention how the npm scripts are working in this project. 

```json
{
  "name": "s3-test",
  ...
  "scripts": {
    "cli": "tsx src/cli.ts",
    "start:db": "docker compose up",
    "server": "tsx src/server.ts",
    "dev:server": "node --import=tsx --watch src/server.ts",
    "dev": "concurrently --kill-others=true 'npm run start:db' 'npm run dev:server' "
  },
  ...
  
}
```

- *dev*: start the server and the docker compose using concurrently
- *start:db*: docker copose
- *dev:server*: spin up the node.js server with hotreloading

- *cli*: run a test to upload the test.jpeg image in the asset directory




## Conclusion
You've now successfully set up a Node.js server with MinIO for handling image uploads using pre-signed URLs. MinIO offers a cost-effective, self-hosted alternative to AWS S3 for object storage, and the use of pre-signed URLs allows clients to securely upload and retrieve files without exposing sensitive credentials.

For the complete code, visit the repository [here](https://github.com/jurgob/s3-test-minio) and start building your own object storage solution locally with Node.js and MinIO.