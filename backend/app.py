'''
I need log in
registration

customer
browse sellers
browse those sellers product catalog
View cart
add to cart
remove from cart
change quantity of item

add address
place order
pay for the order
insert payment information
view orders and order info including updated shipments
get notifications for orders and cart

seller
create, edit, and delete products from catalog
    including images
view sub orders
update sub order status
create shipment and add information
adjust stock
view paid orders
get notifications about inventory

admiin
view all users and accounts

sql functions:
add to cart
create order from cart
create shipment for suborder
low stock notification

'''

from flask import Flask, request, jsonify, g
from supabase import create_client, Client
import os, jwt, re, functools

app = Flask(__name__)
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
SUPABASE_ANON_KEY = os.environ["SUPABASE_ANON_KEY"]
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

@app.get('/')
def home():
    return jsonify({'message': 'Welcome to Marketly!'})

def valid_email(email):
    regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if (re.match(regex,email)):
        return True
    return False

def valid_password(password):
    if len(password) < 8:
        return "Password must be at least 8 characters long."
    
    if not re.search(r'[A-Z]', password):
        return "Password must contain at least one uppercase letter."
    
    if not re.search(r'[a-z]', password):
        return "Password must contain at least one lowercase letter."
    
    if not re.search(r'\d', password):
        return "Password must contain at least one digit."
    
    if not re.search(r'[!@#$%^&*(),.?\":{}|<>]', password):
        return "Password must contain at least one special character."
    
    return True


@app.post('/signup')
def signup():
    pass

@app.post('/login')
def login():
    pass

@app.get('/sellers')
def displaySellersList():
    query = (supabase.table("Sellers")
             .select("id, business_name")
             .execute())
    return jsonify(query.data), 200

@app.get('/sellers/<seller_id>/products')
def displaySellerProducts(seller_id):
    query = (supabase.table("Products")
             .select("id, pname, price, stoack, image")
             .eq("seller_id", seller_id)
             .execute())
    return jsonify(query.data), 200


@app.get('/products/<product_id>')
def displayItemInfo(product_id):
    query = (supabase.table("Products")
             .select("*")
             .eq("id", product_id)
             .single()
             .execute())
    
    return jsonify(query.data), 200

# cart
@app.get('/cart/items')
def getCartItems():
    q = (supabase.table("Cart_Items")
         .select("*")
         .eq("id", g.user["id"])
         .execute())
    
    return jsonify(q.data), 200


@app.post('/cart/items')
def addToCart():
    body = request.get_json() or {}
    product_id = body.get("product_id")
    qty = int(body.get("quantity", 1))

    if not product_id or qty < 1:
        return jsonify({"error": "Product_id and quantity > 0 required"}), 400
    
    res = supabase.rpc("fn_add_to_cart", {"p_uid": g.user["id"], "p_product_id": product_id, "p_qty": qty}).execute()

    return jsonify(res.data), 201

@app.put('/cart/items/<item_id>')
def updateCartItem(item_id):
    body = request.get_json() or {}
    qty = int(body.get("quantity", 1))
    if qty < 1:
        return jsonify({"error": "Quanitity > 0 required"}), 400
    
    res = supabase.rpc("fn_update_cart_item_qty", {"p_uid": g.user["id"], "p_item_id": item_id, "p_qty": qty}).execute()
    
    return jsonify(res.data), 200


@app.delete('/cart/items/<item_id>')
def removeCartItem(item_id):
    res = supabase.rpc("fn_remove_from_cart", {"p_uid": g.user["id"], "p_item_id": item_id}).execute()
    return jsonify(res.data), 200

# orders
@app.post('/orders')
def createOrder():
    body = request.get_json() or {}
    address = body.get("address_id")
    payToken = body.get("payment_token")
    

@app.get('/customers/me/orders')
def listCustomerOrders():
    pass

@app.get('/sellers/me/suborders')
def listSellerOrders():
    pass

@app.post('/suborders/<suborder_id>/shipments')
def createShipment():
    pass

# display notifications
@app.get('/notifications')
def getNotifications():
    pass

# add and remove products from Seller catalog
@app.get('/myCatalog')
def displaySellerCatalog():
    pass

@app.post('/myCatalog')
def addToCalaog():
    pass

@app.put('/myCatalog')
def updateProduct(product_id):
    pass

@app.delete('/myCatalog')
def removeProduct(product_id):
    pass








