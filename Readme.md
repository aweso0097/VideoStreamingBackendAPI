

```markdown
# Video Streaming Backend API

A robust, production-grade REST API built for a video streaming platform. This backend handles complex media management, secure user authentication, community interactions, and high-performance data querying using native database array mutations and multi-stage aggregation pipelines.

## 🚀 Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB & Mongoose
* **Media Storage:** Cloudinary (via Multer)
* **Authentication:** JSON Web Tokens (JWT Access & Refresh)
* **Security:** bcrypt, express-rate-limit, express-mongo-sanitize

## ✨ Enterprise-Grade Features

* **High-Performance Querying:** Implemented B-Tree Text and Compound indexing to prevent collection scans (`COLLSCAN`), dropping query time from $O(N)$ to $O(\log N)$ for paginated video feeds and search.
* **Complex Aggregation Pipelines:** Built deep `$lookup` pipelines with `$project`, `$group`, and `$unwind` stages to serve dynamic dashboard analytics and fully populated playlist records in a single database trip.
* **Native Array Mutations:** Leveraged database-level operators (`$addToSet`, `$pull`) for playlist and watch history management, ensuring atomic operations and zero memory-bloat on the Node server.
* **Polymorphic Data Models:** Designed a unified, polymorphic `Like` schema capable of associating interactions across Videos, Comments, and Tweets cleanly.
* **Security & Hardening:** Protected against brute-force attacks with IP-based rate limiting, neutralized NoSQL query injection payloads with input sanitization, and implemented strict 403 authorization boundary checks across all mutating endpoints.
* **Deep System Healthcheck:** Built a liveness probe endpoint that validates live Mongoose connection state (`readyState`) rather than just static server uptime.

## 🛠️ Local Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd <your-repo-folder>

```

2. **Install dependencies:**
```bash
npm install

```


3. **Configure Environment Variables:**
Create a `.env` file in the root directory and add the following keys (see `.env.sample` if available):
```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

```


4. **Start the server:**
```bash
npm run dev

```



## 👨‍💻 Author

**Chandan  Gupta**

```


