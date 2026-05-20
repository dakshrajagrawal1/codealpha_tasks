# LUXE — Django E-Commerce Store

## Setup & Run

```bash
# Install dependencies
pip install django

# Apply migrations (already done)
python manage.py migrate

# Create admin user (optional)
python create_admin.py

# Start the server
python manage.py runserver
```

Then open http://127.0.0.1:8000

## Admin Panel
http://127.0.0.1:8000/admin  (admin / admin123)

## Features
- Product listing with category filters
- Product detail page with quantity selector
- Session-based shopping cart (add, update, remove)
- Related products on detail page
- Responsive dark luxury theme

## Project Structure
```
estore/
  shop/          ← Django app
    models.py    ← Product, Category
    views.py     ← All views + cart API
    urls.py      ← URL routing
    admin.py     ← Admin config
  templates/
    base.html
    shop/
      product_list.html
      product_detail.html
      cart.html
  estore/
    settings.py
    urls.py
```
