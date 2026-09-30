# KETO Hotel - Backend (Django + DRF + SQLite)

## Setup
```bash
python -m venv venv && source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data        # demo data + admin/user
python manage.py runserver        # http://127.0.0.1:8000
```
Demo logins: **admin@keto.com / Admin@123** (admin) | **user@gmail.com / User@123** (user)
Django admin panel: http://127.0.0.1:8000/admin/ | Emails terminal me print hoti hain (console backend).

## API  (base: /api/)  — JWT: header `Authorization: Bearer <access>`
| Method | URL | Access | Kaam |
|---|---|---|---|
| POST | auth/register/ , auth/login/ , auth/refresh/ | public | signup / login (email+password) |
| GET/PATCH | auth/me/ | user | profile (name, phone, avatar) |
| POST | auth/change-password/ | user | password change |
| GET | rooms/?room_type=&min_price=&max_price=&guests=&wifi=true&start=&end=&search=&ordering= | public | rooms + filters + date availability |
| GET | rooms/{id}/ , rooms/{id}/availability/ | public | detail / booked dates |
| GET/POST | rooms/{id}/reviews/ | public / user | reviews |
| POST/PUT/PATCH/DELETE | rooms/ , rooms/{id}/ (multipart, image) | admin | Add / Update / Delete room |
| POST | bookings/ | user | book (conflict -> "Room is already booked please try different date") |
| GET | bookings/?status= | user(own) / admin(all) | list |
| POST | bookings/{id}/cancel/ | user | cancel |
| POST | bookings/{id}/approve/ , reject/ | admin | status + email customer ko |
| DELETE | bookings/{id}/ | admin | delete |
| GET/POST/DELETE | gallery/ (multipart `image`) | public read / admin write | gallery |
| GET/POST/PUT/DELETE | blog/ (slug) | public read / admin write | blog |
| POST | contact/ | public | contact form |
| GET/DELETE | contact/ , contact/{id}/ | admin | messages |
| POST | contact/{id}/mark_read/ , contact/{id}/send-mail/ | admin | reply: greeting, mail_body, action_text, action_url, end_line |
| POST | newsletter/ | public | subscribe |
| GET | admin/subscribers/ , admin/stats/ | admin | dashboard cards + charts data |
