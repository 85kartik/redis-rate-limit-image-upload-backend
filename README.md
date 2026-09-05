# Backend MVC + Redis + Load Balancer

Node.js/Express backend using **MVC architecture**, **MongoDB**, **Redis caching**, and a custom **round-robin load balancer**.

## Architecture

```text
                  Client / Postman
                        |
                        | HTTP :8080
                        v
                +------------------+
                |  Load Balancer   |
                |   :8080          |
                +--------+---------+
                         |
             Round-Robin Routing
                         |
          +--------------+--------------+---------------+
          |              |              |               |
          v              v              v               v
       :3000           :3001          :3002          :3003
      Backend 1       Backend 2      Backend 3      Backend 4
          |              |              |              |
          +--------------+--------------+--------------+
                         |
                 +-------+-------+
                 |               |
                 v               v
              MongoDB          Redis
             Database          Cache
```

## Technologies

* Node.js
* Express.js
* MongoDB / Mongoose
* Redis
* JWT
* bcryptjs
* http-proxy

## Ports

| Service       |    Port |
| ------------- | ------: |
| Load Balancer |  `8080` |
| Backend 1     |  `3000` |
| Backend 2     |  `3001` |
| Backend 3     |  `3002` |
| Backend 4     |  `3003` |
| MongoDB       | `27017` |
| Redis         |  `6379` |

## Run

### 1. Start 4 backend instances

```bash
npm run start:instances
```

### 2. Start Load Balancer

```bash
node loadBalancer.js
```

### 3. Use the Load Balancer

```text
http://localhost:8080
```

Do **not** send client requests directly to `3000–3003`.

## Redis Cache

Profile requests use Redis first:

```text
Request
   |
   v
 Redis
  / \
Hit  Miss
 |     |
Return MongoDB
       |
       v
    Save Redis
```

Profile cache expires after **5 minutes**.

## Load Balancing

Requests are distributed using round-robin:

```text
Request 1 → :3000
Request 2 → :3001
Request 3 → :3002
Request 4 → :3003
Request 5 → :3000
```

## Project Flow

```text
Client
  ↓
Load Balancer :8080
  ↓
Backend :3000/:3001/:3002/:3003
  ↓
Controller
  ↓
MongoDB
  +
Redis Cache
```
