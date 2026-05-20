from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST
import json
from .models import Product, Category


def product_list(request):
    categories = Category.objects.all()
    category_id = request.GET.get('category')
    products = Product.objects.all()
    if category_id:
        products = products.filter(category_id=category_id)
    return render(request, 'shop/product_list.html', {
        'products': products,
        'categories': categories,
        'selected_category': int(category_id) if category_id else None,
    })


def product_detail(request, pk):
    product = get_object_or_404(Product, pk=pk)
    related = Product.objects.filter(category=product.category).exclude(pk=pk)[:4]
    return render(request, 'shop/product_detail.html', {
        'product': product,
        'related': related,
    })


def cart(request):
    return render(request, 'shop/cart.html')


@require_POST
def cart_add(request):
    data = json.loads(request.body)
    cart = request.session.get('cart', {})
    pid = str(data['product_id'])
    qty = int(data.get('quantity', 1))
    product = get_object_or_404(Product, pk=pid)
    if pid in cart:
        cart[pid]['quantity'] += qty
    else:
        cart[pid] = {
            'name': product.name,
            'price': str(product.price),
            'image_url': product.image_url,
            'quantity': qty,
        }
    request.session['cart'] = cart
    total_items = sum(v['quantity'] for v in cart.values())
    return JsonResponse({'success': True, 'total_items': total_items})


@require_POST
def cart_update(request):
    data = json.loads(request.body)
    cart = request.session.get('cart', {})
    pid = str(data['product_id'])
    qty = int(data['quantity'])
    if qty <= 0:
        cart.pop(pid, None)
    else:
        if pid in cart:
            cart[pid]['quantity'] = qty
    request.session['cart'] = cart
    total = sum(float(v['price']) * v['quantity'] for v in cart.values())
    total_items = sum(v['quantity'] for v in cart.values())
    return JsonResponse({'success': True, 'total': f'{total:.2f}', 'total_items': total_items})


@require_POST
def cart_remove(request):
    data = json.loads(request.body)
    cart = request.session.get('cart', {})
    cart.pop(str(data['product_id']), None)
    request.session['cart'] = cart
    total = sum(float(v['price']) * v['quantity'] for v in cart.values())
    total_items = sum(v['quantity'] for v in cart.values())
    return JsonResponse({'success': True, 'total': f'{total:.2f}', 'total_items': total_items})


def cart_data(request):
    cart = request.session.get('cart', {})
    total_items = sum(v['quantity'] for v in cart.values())
    return JsonResponse({'total_items': total_items})


def cart_items(request):
    cart = request.session.get('cart', {})
    items = []
    for pid, item in cart.items():
        items.append({
            'id': pid,
            'name': item['name'],
            'price': float(item['price']),
            'image_url': item.get('image_url', ''),
            'quantity': item['quantity'],
        })
    total = sum(i['price'] * i['quantity'] for i in items)
    return JsonResponse({'items': items, 'total': f'{total:.2f}'})
