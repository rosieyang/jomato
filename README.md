<h1 align="center">Jomato API</h1>

<p align="center">
  <img src="https://github.com/junghwayang/jomato/blob/master/jomato.png" width="600" />
</p>
  
<h3 align="center">A comprehensive REST API for exploring local restaurants</h3>
<p align="center">Built with: Node.js, Express, MongoDB

---

## Restaurants : `/api/restaurants`

### CRUD

- `GET /` : Get all restaurants
- `GET /:id` : Get single restaurant
- `POST /` : Create new restaurant
- `PATCH /:id` : Update restaurant
- `DELETE /:id` : Delete restaurant
 
### Special Query

- `GET /within/:distance/:unit/near/:latlng` : Get restaurants within distance near point
  - e.g. `/within/10/km/near/-33.873,151.207` : Get restaurants within 10km near point that is -33.873 degrees latitude and 151.207 degrees longitude
- `GET /distances-from/:latlng/unit/:unit` : Get distances from point to all restaurants
- `GET /stats-by-suburb` : Get aggregation for restaurants by suburb
- `GET /stats-by-cuisine` : Get aggregation for restaurants by cuisine
- `GET /monthly-stats/:year` : Get aggregation for restaurants by monthly activity
- `GET /top-5-by-suburb/:suburb` : Get 5 high ratings restaurants by suburb
- `GET /top-5-by-cuisine/:cuisine` : Get 5 high ratings restaurants by cuisine

### Upload Images

- `POST /:id/cover-image` : Upload cover image of restaurant
- `POST /:id/image` : Upload image of restaurant
- `POST /:id/menu` : Upload menu image of restaurant

### Manage Staff List

- `GET /:id/staff` : Get all staff list of a restaurant
- `POST /:id/staff` : Add staff to restaurant's staff list
- `DELETE /:id/staff` : Remove staff from restaurant's staff list

---

## Reviews : `/api/reviews`

### CRUD

- `GET /` : Get all reviews
- `GET /:id` : Get single review
- `POST /` : Create new review
- `PATCH /:id` : Update review
- `DELETE /:id` : Delete review

### Special Query

- `GET /monthly-stats/:year` : Get aggregation for reviews by monthly activity

---

## Users : `/api/users`

### CRUD (for Admin)

- `GET /` : Get all users
- `GET /:id` : Get single user
- `POST /` : Create new user
- `PATCH /:id` : Update user
- `DELETE /:id` : Delete user

### Account Settings for user

- `GET /me` : Get logged in user
- `PATCH /me` : Update logged in user's name/email/mobile number
- `DELETE /me` : Deactivate logged in user
- `POST /me/photo` : Upload user profile photo

---

## User Authentication : `/api/users`

- `POST /signup` : Signup user
- `POST /login` : Login user
- `POST /forgot-password` : Forgot password. Send password reset token to email.
- `PATCH /reset-password/:resetToken` : Reset password with password reset token.
- `PATCH /update-password` : Update password if user-entered current password is correct.
