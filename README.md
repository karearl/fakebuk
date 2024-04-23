# fakebuk.com

# Setup

1. Clone the repository:
    ```sh
    git clone https://github.com/karearl/fakebuk.git
    ```
2. Navigate to the project directory:
    ```sh
    cd fakebuk
    ```
3. Create a `.env` file and add the following environment variables:
    ```env
    MYSQL_ROOT_PASSWORD=mysql_root_password
    MYSQL_DATABASE=mysql_database
    MYSQL_USER=mysql_user
    JWT_SECRET=jwt_secret
    ```
4. Set up a MySQL server.
5. Install the project dependencies:
    ```sh
    npm install
    ```
6. Run the development server:
    ```sh
    npm run dev
    ```

## Features

- [x] User registration and authentication
    - [ ] Change current auth implementaion to use Clerk
- [ ] Profile customization
    - [x] Add ability to change profile picture
    - [ ] Add ability to edit user bio
- [x] Posting status updates or photos
    - [ ] Add ability to edit and delete posts
- [ ] Liking and commenting on posts
    - [ ] Implement like feature in [`Post`](server/models/Post.tsx)
    - [ ] Implement comment feature in [`Comment`](server/models/Comment.tsx)
- [ ] Following other users
    - [ ] Add follow feature in [`User`](server/models/User.tsx)
- [ ] Direct messaging between users
    - [ ] Create a new `Message` model
    - [ ] Implement messaging feature in a new `message.service.tsx`
- [ ] Notifications for social interactions
    - [ ] Create a new `Notification` model
    - [ ] Implement notification feature in a new `notification.service.tsx`
- [ ] Search functionality for users and content
    - [ ] Add search feature in [`User`](server/models/User.tsx) and [`Post`](server/models/Post.tsx)
- [ ] Trending topics or hashtags
    - [ ] Add hashtag feature in [`Post`](server/models/Post.tsx)
    - [ ] Implement trending topics feature in `post.service.tsx`
- [x] Privacy settings for posts and user profiles
- [ ] Ability to share or retweet posts
    - [ ] Add share feature in [`Post`](server/models/Post.tsx)
- [ ] Mobile responsive design
    - [ ] Update CSS in `client/css/`
- [ ] User tagging in posts
    - [ ] Add user tagging feature in [`Post`](server/models/Post.tsx)
- [ ] Post scheduling
    - [ ] Add post scheduling feature in [`Post`](server/models/Post.tsx)
- [ ] User blocking and reporting
    - [ ] Add block and report features in [`User`](server/models/User.tsx)
- [ ] Post and comment reporting
    - [ ] Add report feature in [`Post`](server/models/Post.tsx) and [`Comment`](server/models/Comment.tsx)
- [ ] User verification
    - [ ] Add verification feature in [`User`](server/models/User.tsx)
- [ ] Two-factor authentication
    - [ ] Implement two-factor authentication in `auth.service.tsx`
- [ ] Integration with other social media platforms
    - [ ] Implement social media integration in `auth.service.tsx`
- [ ] Dark mode
    - [ ] Add dark mode toggle in `client/css/`
- [ ] Localization and internationalization
    - [ ] Implement localization in `client/`

## Tasks

- [ ] Enhance User Interface
    - [ ] Style Profile Page
    - [ ] Style Individual Posts
    - [ ] Style Comments Section
- [ ] Improve User Experience
    - [ ] Implement Infinite Scrolling for Posts
    - [ ] Add Loading Indicators for Asynchronous Actions
    - [ ] Improve Form Validation and Error Messages
- [ ] Backend Enhancements
    - [ ] Optimize Database Queries
    - [ ] Implement Caching for Improved Performance
    - [ ] Add More Comprehensive API Error Handling
- [ ] Testing
    - [ ] Write Unit Tests for Backend Logic
    - [ ] Write Integration Tests for API Endpoints
    - [ ] Perform End-to-End Testing with a Testing Framework like Cypress
- [ ] Documentation
    - [ ] Update README with Project Setup Instructions
    - [ ] Document API Endpoints
    - [ ] Write Developer Documentation