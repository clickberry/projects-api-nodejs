# Dockerized Projects API
Projects micro-service on Node.js. This a micro-service for link together videos, screenshots, images, metadata and etc.

* [Architecture](#architecture)
* [Technologies](#technologies)
* [Environment Variables](#environment-variables)
* [Events](#events)
* [API](#api)
* [License](#license)

# Architecture
The application is a REST API service with database and messaging service (Bus) dependencies.

# Technologies
* Node.js
* MongoDB/Mongoose
* Express.js
* Passport.js
* Official nsqjs driver for NSQ messaging service

# Environment Variables
The service should be properly configured with following environment variables.

Key | Value | Description
:-- | :-- | :-- 
MONGODB_CONNECTION | mongodb://mongo_host:mongo_port/videos | MongoDB connection string.
TOKEN_ACCESSSECRET | MDdDRDhBOD*** | Access token secret.
NSQD_ADDRESS | bus.yourdomain.com | A hostname or an IP address of the NSQD running instance.
NSQD_PORT | 4150 | A TCP port number of the NSQD running instance to publish events.
SIGN_SECRET | MDdDRDhBOD*** | Sekret key for verify signed videos and screenshots URI-s.

# Events
The service generates events to the Bus (messaging service) in response to API requests.

## Send events
Topic | Message | Description
:-- | :-- | :--
project-creates | [Project Dto](#project-dto) | Created project.
project-removes | {projectId: *projectId*} | Project ID.

# API
## DTO
### Project Dto
| Param   | Description |
|----------|-------------|
| id     | Project ID.|
| userId     | Owner user ID|
| name     | Name of project|
| description     | Description of project|
| created     | Date of create project|
| videos     | List of [Encoded videos](#encodeded-video-dto)|
| imageUri | Uri of image |
| isPrivate| Private statate - true/false |
| relationToken| JWT with {id: *entity ID*, ownerId: *user ID of entity owner*}|

### Encodeded Video Dto
| Param   | Description |
|----------|-------------|
| contentType     | Content type such as *video/mp4* or *video/webm*|
| uri     | Uri of encoding video|
| width     | Width of video frame|
| height     | Height of video frame |
| sign     | Uri signature. **Only for Request**|

## POST /
Creates project.

### Request
#### Header
| Param   | Value |
|----------|-------------|
| Authorization     | "JWT [accessToken]" |

#### Body 
| Param    | Description |
|----------|-------------|
| name     | Name of project|
| description     | Description of project|
| videos     | List of [Encoded videos](#encodeded-video-dto)|
| imageUri | Uri of image |
| isPrivate| Private statate - true/false |

### Response
| HTTP       |      Value                                                         |
|------------|--------------------------------------------------------------------|
| StatusCode | 201                                                                |
| Body |  [Project Dto](#project-dto)                                                             |

## PUT /
Edits project.

### Request
#### Header
| Param   | Value |
|----------|-------------|
| Authorization     | "JWT [accessToken]" |

#### Body 
| Param    | Description |
|----------|-------------|
| name     | Name of project|
| description     | Description of project|
| imageUri | Uri of image |
| isPrivate| Private statate - true/false |

### Response
| HTTP       |      Value                                                         |
|------------|--------------------------------------------------------------------|
| StatusCode | 200                                                                |
| Body |  [Project Dto](#project-dto)                                                             |

## GET /
Get all user projects.

### Request
#### Header
| Param   | Value |
|----------|-------------|
| Authorization     | "JWT [accessToken]" |

### Response
| HTTP       |      Value                                                         |
|------------|--------------------------------------------------------------------|
| StatusCode | 200                                                            |
| Body | [Project Dto](#project-dto)                                                            |

## GET /all?last=&top=
Get all public projects from all users.

### Request
### Query Param
| Param    | Description |
|----------|-------------|
| last    |  Last project ID since which will finding projects |
| top    |  Quantity projects for getting|

### Response
| HTTP       |      Value                                                         |
|------------|--------------------------------------------------------------------|
| StatusCode | 200                                                            |
| Body | [Project Dto](#project-dto)                                                            |

## GET /:projectId
Get user project by id.

### Request
#### Header
| Param   | Value |
|----------|-------------|
| Authorization     | "JWT [accessToken]" |

### Response
| HTTP       |      Value                                                         |
|------------|--------------------------------------------------------------------|
| StatusCode | 200                                                            |
| Body | [Project Dto](#project-dto)                                                            |

## DELETE /:projectId
Remove user project by id.

### Request
#### Header
| Param   | Value |
|----------|-------------|
| Authorization     | "JWT [accessToken]" |

### Response
| HTTP       |      Value                                                         |
|------------|--------------------------------------------------------------------|
| StatusCode | 200                                                            |

# License
Source code is under GNU GPL v3 [license](LICENSE).

