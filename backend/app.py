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


