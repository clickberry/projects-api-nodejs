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
MONGODB_CONNECTION | mongodb://mongo_host:mongo_port/projects | MongoDB connection string.
TOKEN_ACCESSSECRET | MDdDRDhBOD*** | Access token secret.
TOKEN_RELATIONSECRET | MDdDRDhBOD*** | Relation token secret.
NSQD_ADDRESS | bus.yourdomain.com | A hostname or an IP address of the NSQD running instance.
NSQD_PORT | 4150 | A TCP port number of the NSQD running instance to publish events.
SIGN_SECRET | MDdDRDhBOD*** | Sekret key for verify signed videos and screenshots URI-s.
PORT | 8080 | Container port.

# Events
The service generates events to the Bus (messaging service) in response to API requests.

## Send events
Topic | Message | Description
:-- | :-- | :--
project-creates | [Project Dto](#project-dto) | Created project.
project-updates | [Project Dto](#project-dto) | Edited project.
project-deletes | {projectId: *projectId*} | Project ID.

# API
## DTO
### Project Dto
| Param   | Description |
|----------|-------------|
| id     | Project ID.|
| userId     | Owner user ID|
| videoId     | Video ID|
| name     | Name of project|
| description     | Description of project|
| created     | Date of create project|
| videos     | List of [Encoded videos](#encodeded-video-dto)|
| imageUri | Uri of image |
| isPrivate| Private state - true/false |
| isHidden| Hidden state - true/false |
| viewsCounter| [Counter](#counter-dto). Field for views count. **id** value alwawys **"views"**|
| resharesCounter| [Counter](#counter-dto). Field for reshares count. **id** value alwawys **"reshares"**|
| counters| List of [Counters](#counter-dto)|
| relationToken| JWT with {id: *project ID*, ownerId: *user ID*, userId: *user ID*}|

### Encodeded Video Dto
| Param   | Description |
|----------|-------------|
| contentType     | Content type such as *video/mp4* or *video/webm*|
| uri     | Uri of encoding video|
| width     | Width of video frame|
| height     | Height of video frame |

### Counter Dto
| Param   | Description |
|----------|-------------|
| id     | Counter ID|
| name     | Name|
| relationToken| JWT with {id: *counter ID*, ownerId: *project ID*, userId: *user ID*}|

### Videos Dto
| Param   | Description |
|----------|-------------|
| id     | Video id|
| encoded     |List of [Encoded videos](#encodeded-video-dto)|
| sign     | Signature of concat all encoded video uri and video ID with comma separated *(uri_mp4_360,uri_webm_360,video_id)*|

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
| videos     | [Videos](#videos-dto)|
| imageUri | Uri of image |
| isHidden| Hidden state - true/false |
| isPrivate| Private statate - true/false |

### Response
| HTTP       |      Value                                                         |
|------------|--------------------------------------------------------------------|
| StatusCode | 201                                                                |
| Body |  [Project Dto](#project-dto)                                                             |

## PUT /:projectId
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
| isHidden| Hidden state - true/false |
| isPrivate| Private statate - true/false |

### Response
| HTTP       |      Value                                                         |
|------------|--------------------------------------------------------------------|
| StatusCode | 200                                                                |
| Body |  [Project Dto](#project-dto)                                                             |

## GET /
Gets all user projects.

### Request
#### Header
| Param   | Value |
|----------|-------------|
| Authorization     | "JWT [accessToken]" |

### Response
| HTTP       |      Value                                                         |
|------------|--------------------------------------------------------------------|
| StatusCode | 200                                                            |
| Body | List of [Project Dto](#project-dto)                                                            |

## GET /all?last=&top=
Gets all public projects from all users.

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
| Body | List of [Project Dto](#project-dto)                                                            |

## GET /:projectId
Gets project by id. Anonymous user gets project if *isPrivate=false*.

### Request
#### Header
| Param   | Value ||
|----------|-------------|---|
| Authorization     | "JWT [accessToken]" |***Optional***|

### Response
| HTTP       |      Value                                                         |
|------------|--------------------------------------------------------------------|
| StatusCode | 200                                                            |
| Body | [Project Dto](#project-dto)                                                            |

## DELETE /:projectId
Removes user project by id.

### Request
#### Header
| Param   | Value |
|----------|-------------|
| Authorization     | "JWT [accessToken]" |

### Response
| HTTP       |      Value                                                         |
|------------|--------------------------------------------------------------------|
| StatusCode | 200                                                            |

## GET /user/:userId
Gets all public user projects by userId.

### Response
| HTTP       |      Value                                                         |
|------------|--------------------------------------------------------------------|
| StatusCode | 200                                                            |
| Body | List of [Project Dto](#project-dto)                                                            |

# License
Source code is under GNU GPL v3 [license](LICENSE).

