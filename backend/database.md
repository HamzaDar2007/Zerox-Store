Multi-Vendor Ecommerce Platform
Complete Normalized Database Schema
28 Modules · 3NF Normalized · UUID Primary Keys · RBAC · 6 Domains
48
Tables
28
Modules
6
Domains
3NF
Normalized
UUID
Primary Keys
JSONB
Audit Diffs


Domain Overview
Domain
Modules Covered
Key Design Decisions
Auth & Access
Users, Roles, Permissions, RBAC, Sessions, Tokens, Addresses
role_permissions junction; auth_tokens typed enum; UUID PKs throughout
Catalog
Categories, Brands, Sellers, Stores, Products, Variants, Reviews
Attributes pattern via variant_attribute_values; product_categories many-to-many
Commerce
Cart, Wishlist, Coupons, Flash Sales, Orders, Payments, Subscriptions, Returns
Coupon scopes exclusive CHECK; order shipping snapshot; JSONB payment metadata
Logistics
Warehouses, Inventory, Shipping Zones & Methods, Shipments
Inventory at warehouse×variant; qty_available is a generated column
Communication
Notifications, Chat, Search
Single notifications table with channel enum; chat participants junction
Analytics & Admin
Audit Logs
JSONB diff — stores only changed fields, never full row duplication


Design Principles
Principle
Rationale
3NF Normalization
All tables are in Third Normal Form. Every non-key attribute depends on the whole key and nothing but the key. Calculated values (e.g. qty_available) use generated columns rather than stored redundancy.
UUID Primary Keys
All tables use UUID PKs generated with gen_random_uuid(). This avoids sequential ID enumeration attacks, enables distributed key generation, and simplifies data migration.
Attributes Pattern
Product variants use an EAV-inspired junction (variant_attribute_values) instead of flat columns. This supports unlimited attribute dimensions (Color, Size, Material…) without schema changes.
Inventory Granularity
Inventory is tracked at the warehouse × variant level. qty_available is a PostgreSQL generated column (qty_on_hand − qty_reserved), ensuring consistency without application-level logic.
Coupon Scoping
coupon_scopes uses a scope_type enum with an exclusive CHECK constraint. Exactly one of user_id, product_id, or category_id can be set, enforced at the database level.
Notifications Design
A single notifications table with a channel enum (email, sms, push, in_app, webhook) avoids table proliferation and enables unified querying across all delivery channels.
Audit Log Strategy
audit_logs stores only the JSONB diff {before: {…}, after: {…}} — never the full row. This reduces storage by 80-90% and avoids PII replication. A GIN index enables fast JSON key search.
Address Snapshot
Order shipping addresses are denormalized as VARCHAR columns on the orders table. This is intentional — a user may change their address after placing an order, and the original address must be preserved.


Domain 1 — Auth & Access
Modules: Users  ·  Roles  ·  Permissions  ·  Role-Permissions (RBAC)  ·  Auth Sessions & Tokens
8 tables in this domain
roles
PK: id (UUID)    Application roles (admin, seller, buyer, etc.)
Column(s)
Type
Constraint
Description
id
UUID
PK
Primary key
name
VARCHAR(100)
UNIQUE NOT NULL
Role identifier e.g. "admin"
description
TEXT


Human-readable description
is_system
BOOLEAN
NOT NULL DEFAULT FALSE
System roles cannot be deleted
created_at / updated_at
TIMESTAMPTZ
NOT NULL
Timestamps


permissions
PK: id (UUID)    Granular permission codes per module
Column(s)
Type
Constraint
Description
id
UUID
PK
Primary key
code
VARCHAR(200)
UNIQUE NOT NULL
Dot-notation code e.g. "order:read"
module
VARCHAR(100)
NOT NULL
Owning module e.g. "orders"
description
TEXT


Human-readable description


role_permissions
PK: (role_id, permission_id)    Junction — RBAC grant table
Column(s)
Type
Constraint
Description
role_id
UUID
FK → roles
Role being granted permission
permission_id
UUID
FK → permissions
Permission being granted
granted_at
TIMESTAMPTZ
NOT NULL
When the grant was made


users
PK: id (UUID)    Platform user accounts
Column(s)
Type
Constraint
Description
id
UUID
PK
Primary key
email
VARCHAR(320)
UNIQUE NOT NULL
Login email
phone
VARCHAR(30)


Optional phone number
password_hash
TEXT
NOT NULL
Bcrypt / argon2 hash
first_name / last_name
VARCHAR(100)


Display name parts
avatar_url
TEXT


Profile picture URL
is_active
BOOLEAN
DEFAULT TRUE
Account enabled flag
is_email_verified
BOOLEAN
DEFAULT FALSE
Email confirmation status
is_phone_verified
BOOLEAN
DEFAULT FALSE
Phone confirmation status


user_roles
PK: (user_id, role_id)    Junction — assigns roles to users
Column(s)
Type
Constraint
Description
user_id
UUID
FK → users
Subject user
role_id
UUID
FK → roles
Assigned role
granted_by
UUID
FK → users (nullable)
Admin who made the grant
granted_at
TIMESTAMPTZ
NOT NULL
Grant timestamp


auth_sessions
PK: id (UUID)    Active refresh token sessions
Column(s)
Type
Constraint
Description
user_id
UUID
FK → users
Session owner
refresh_token
TEXT
UNIQUE NOT NULL
Hashed refresh token
ip_address
INET


Client IP at login
user_agent / device_type
TEXT / VARCHAR


Client metadata
expires_at
TIMESTAMPTZ
NOT NULL
Token expiry
revoked_at
TIMESTAMPTZ


Logout or revocation time


auth_tokens
PK: id (UUID)    One-time tokens (email verify, password reset)
Column(s)
Type
Constraint
Description
user_id
UUID
FK → users
Token owner
token_hash
TEXT
UNIQUE NOT NULL
SHA-256 of raw token
type
VARCHAR(50)
CHECK ENUM
email_verification | password_reset | phone_verification | two_factor
expires_at
TIMESTAMPTZ
NOT NULL
Token expiry
used_at
TIMESTAMPTZ


Consumed timestamp


user_addresses
PK: id (UUID)    Saved shipping / billing addresses
Column(s)
Type
Constraint
Description
user_id
UUID
FK → users
Address owner
label
VARCHAR(50)


"home", "work", etc.
line1 / line2
TEXT
line1 NOT NULL
Street address lines
city / state / postal_code
VARCHAR
city NOT NULL
Geographic fields
country
CHAR(2)
NOT NULL
ISO 3166-1 alpha-2 code
is_default
BOOLEAN
DEFAULT FALSE
Default address flag



Domain 2 — Catalog
Modules: Categories  ·  Brands  ·  Sellers  ·  Stores  ·  Products  ·  Product Variants  ·  Attributes Pattern  ·  Reviews
12 tables in this domain
categories
PK: id (UUID)    Self-referencing category tree (adjacency list)
Column(s)
Type
Constraint
Description
id
UUID
PK
Primary key
parent_id
UUID
FK → categories (nullable)
Parent node — NULL for root categories
name / slug
VARCHAR
slug UNIQUE NOT NULL
Display name and URL slug
description / image_url
TEXT


Optional metadata
sort_order
INT
DEFAULT 0
Ordering within siblings
is_active
BOOLEAN
DEFAULT TRUE
Visibility flag


brands
PK: id (UUID)    Product brand registry
Column(s)
Type
Constraint
Description
id
UUID
PK
Primary key
name / slug
VARCHAR
slug UNIQUE NOT NULL
Brand identity
logo_url / website_url
TEXT


Brand assets
is_active
BOOLEAN
DEFAULT TRUE
Visibility flag


sellers
PK: id (UUID)    Vendor / merchant profiles
Column(s)
Type
Constraint
Description
user_id
UUID
UNIQUE FK → users
One seller per user account
display_name / legal_name
VARCHAR
display_name NOT NULL
Storefront and legal names
tax_id
VARCHAR(100)


Tax identification number
commission_rate
NUMERIC(5,2)
DEFAULT 10.00
Platform commission %
status
VARCHAR(30)
CHECK ENUM
pending | active | suspended | banned
approved_by
UUID
FK → users (nullable)
Admin who approved the seller


stores
PK: id (UUID)    Branded storefronts within a seller account
Column(s)
Type
Constraint
Description
seller_id
UUID
FK → sellers
Store owner
name / slug
VARCHAR
slug UNIQUE NOT NULL
Store identity
description / logo_url / banner_url
TEXT


Storefront assets
is_active
BOOLEAN
DEFAULT TRUE
Store visibility


products
PK: id (UUID)    Product master record
Column(s)
Type
Constraint
Description
store_id
UUID
FK → stores NOT NULL
Owning store
category_id / brand_id
UUID
FK → categories / brands
Primary categorization
name / slug
VARCHAR
slug UNIQUE NOT NULL
Product identity
short_desc / full_desc
TEXT


Marketing copy
base_price
NUMERIC(14,4)
NOT NULL
Default price (overridden per variant)
currency
CHAR(3)
DEFAULT "USD"
ISO 4217 currency code
is_active / is_digital / requires_shipping
BOOLEAN


Product flags
tax_class
VARCHAR(50)


Tax classification code


attribute_keys
PK: id (UUID)    Reusable attribute dimensions (Color, Size, Material)
Column(s)
Type
Constraint
Description
name / slug
VARCHAR
slug UNIQUE NOT NULL
Attribute identity
input_type
VARCHAR(30)
CHECK ENUM
select | swatch | text | boolean


attribute_values
PK: id (UUID)    Allowed values per attribute key
Column(s)
Type
Constraint
Description
attribute_key_id
UUID
FK → attribute_keys
Owning dimension
value / display_value
VARCHAR(200)
value NOT NULL
Stored and display values
sort_order
INT
DEFAULT 0
Option ordering
UNIQUE


(attribute_key_id, value)
No duplicate values per key


product_variants
PK: id (UUID)    Specific purchasable units (e.g. Red / XL)
Column(s)
Type
Constraint
Description
product_id
UUID
FK → products
Parent product
sku
VARCHAR(200)
UNIQUE NOT NULL
Stock keeping unit
price
NUMERIC(14,4)
nullable
Override price; falls back to product.base_price
weight_grams
INT


Shipping weight
is_active
BOOLEAN
DEFAULT TRUE
Variant availability


variant_attribute_values
PK: (variant_id, attribute_key_id)    Junction — assigns attribute values to variants (the attributes pattern)
Column(s)
Type
Constraint
Description
variant_id
UUID
FK → product_variants
Target variant
attribute_key_id
UUID
FK → attribute_keys
Dimension (e.g. "Color")
attribute_value_id
UUID
FK → attribute_values
Selected value (e.g. "Red")


product_images
PK: id (UUID)    Product and variant images
Column(s)
Type
Constraint
Description
product_id
UUID
FK → products
Parent product
variant_id
UUID
FK → product_variants (nullable)
Variant-specific image
url / alt_text
TEXT
url NOT NULL
Image asset and accessibility text
sort_order / is_primary
INT / BOOLEAN


Display order and hero image flag


product_categories
PK: (product_id, category_id)    Junction — allows products to appear in multiple categories
Column(s)
Type
Constraint
Description
product_id
UUID
FK → products
Product reference
category_id
UUID
FK → categories
Category reference


reviews
PK: id (UUID)    Verified customer product reviews
Column(s)
Type
Constraint
Description
product_id
UUID
FK → products
Reviewed product
user_id
UUID
FK → users
Review author
order_id
UUID
FK → orders (nullable)
Tied to a specific purchase
rating
SMALLINT
CHECK 1–5
Star rating
title / body
VARCHAR / TEXT


Review content
is_verified
BOOLEAN
DEFAULT FALSE
Purchased-and-verified badge
status
VARCHAR(20)
CHECK ENUM
pending | approved | rejected
UNIQUE


(product_id, user_id, order_id)
One review per purchase



Domain 3 — Commerce
Modules: Cart  ·  Wishlist  ·  Coupons  ·  Flash Sales  ·  Orders  ·  Payments  ·  Subscriptions  ·  Returns
16 tables in this domain
carts
PK: id (UUID)    Shopping cart session (supports guest carts via session_id)
Column(s)
Type
Constraint
Description
user_id
UUID
FK → users (nullable)
Authenticated user cart
session_id
VARCHAR(200)
nullable
Guest cart session token
currency
CHAR(3)
DEFAULT "USD"
Cart currency
coupon_id
UUID
FK → coupons (nullable)
Applied coupon
CHECK


user_id IS NOT NULL OR session_id IS NOT NULL
Must have owner


cart_items
PK: id (UUID)    Line items within a cart
Column(s)
Type
Constraint
Description
cart_id
UUID
FK → carts
Parent cart
variant_id
UUID
FK → product_variants
Selected variant
quantity
INT
CHECK > 0
Item count
unit_price
NUMERIC(14,4)
NOT NULL
Price snapshot at add-to-cart time
UNIQUE


(cart_id, variant_id)
No duplicate lines


wishlists
PK: id (UUID)    Named wishlist per user
Column(s)
Type
Constraint
Description
user_id
UUID
FK → users
Wishlist owner
name
VARCHAR(200)
DEFAULT "My Wishlist"
Custom label
is_public
BOOLEAN
DEFAULT FALSE
Public sharing flag


wishlist_items
PK: id (UUID)    Junction — variant saved to wishlist
Column(s)
Type
Constraint
Description
wishlist_id
UUID
FK → wishlists
Parent wishlist
variant_id
UUID
FK → product_variants
Saved variant
UNIQUE


(wishlist_id, variant_id)
No duplicate entries


coupons
PK: id (UUID)    Discount coupon definitions
Column(s)
Type
Constraint
Description
code
VARCHAR(50)
UNIQUE NOT NULL
Promotional code
discount_type
VARCHAR(20)
CHECK ENUM
percentage | fixed | free_shipping
discount_value
NUMERIC(14,4)
NOT NULL
Amount or percentage
max_discount
NUMERIC(14,4)


Cap for percentage discounts
min_order_value
NUMERIC(14,4)


Minimum cart value to apply
usage_limit / per_user_limit
INT


Global and per-user usage caps
is_active
BOOLEAN
DEFAULT TRUE
Coupon enabled flag
starts_at / expires_at
TIMESTAMPTZ


Validity window


coupon_scopes
PK: id (UUID)    Restricts coupon applicability: global, per-user, per-product, or per-category
Column(s)
Type
Constraint
Description
coupon_id
UUID
FK → coupons
Parent coupon
scope_type
VARCHAR(20)
CHECK ENUM
global | user | product | category
user_id
UUID
FK → users (nullable)
Set only when scope_type = "user"
product_id
UUID
FK → products (nullable)
Set only when scope_type = "product"
category_id
UUID
FK → categories (nullable)
Set only when scope_type = "category"
CHECK


coupon_scope_exclusive
Exactly one scope reference must be set


coupon_usages
PK: id (UUID)    Tracks each coupon redemption for limit enforcement
Column(s)
Type
Constraint
Description
coupon_id
UUID
FK → coupons
Redeemed coupon
user_id
UUID
FK → users
Redeeming user
order_id
UUID
FK → orders (nullable)
Associated order


flash_sales
PK: id (UUID)    Time-boxed promotional events
Column(s)
Type
Constraint
Description
name
VARCHAR(300)
NOT NULL
Campaign name
starts_at / ends_at
TIMESTAMPTZ
NOT NULL
Sale window (CHECK ends_at > starts_at)
is_active
BOOLEAN
DEFAULT TRUE
Enabled flag


flash_sale_items
PK: id (UUID)    Variants included in a flash sale with limited quantity
Column(s)
Type
Constraint
Description
flash_sale_id
UUID
FK → flash_sales
Parent sale event
variant_id
UUID
FK → product_variants
Discounted variant
sale_price
NUMERIC(14,4)
NOT NULL
Flash sale unit price
quantity_limit / quantity_sold
INT


Stock cap and sold count
UNIQUE


(flash_sale_id, variant_id)
One entry per variant per sale


orders
PK: id (UUID)    Customer purchase records
Column(s)
Type
Constraint
Description
user_id
UUID
FK → users
Ordering customer
coupon_id
UUID
FK → coupons (nullable)
Applied coupon
status
VARCHAR(30)
CHECK ENUM
pending | confirmed | processing | shipped | delivered | cancelled | refunded
subtotal / discount_amount / shipping_amount / tax_amount / total_amount
NUMERIC(14,4)
NOT NULL
Order financials
shipping_* fields
VARCHAR / TEXT
snapshot
Address snapshot — denormalized intentionally


order_items
PK: id (UUID)    Line items within an order
Column(s)
Type
Constraint
Description
order_id
UUID
FK → orders
Parent order
variant_id
UUID
FK → product_variants
Purchased variant
store_id
UUID
FK → stores
Selling store
sku_snapshot / name_snapshot
VARCHAR / VARCHAR
NOT NULL
Immutable point-in-time data
unit_price / discount_amount / tax_amount / total_amount
NUMERIC(14,4)
NOT NULL
Line financials
flash_sale_id
UUID
FK → flash_sales (nullable)
If purchased during a flash sale


payments
PK: id (UUID)    Payment transactions per order
Column(s)
Type
Constraint
Description
order_id
UUID
FK → orders
Associated order
user_id
UUID
FK → users
Paying user
gateway
VARCHAR(50)
NOT NULL
stripe | paypal | cod | etc.
gateway_tx_id
TEXT


External transaction reference
method
VARCHAR(50)
NOT NULL
card | wallet | bank_transfer
amount / currency
NUMERIC / CHAR(3)
NOT NULL
Payment amount and currency
status
VARCHAR(20)
CHECK ENUM
pending | authorized | captured | failed | refunded | cancelled
metadata
JSONB


Gateway-specific payload (GIN indexed)


subscription_plans
PK: id (UUID)    Recurring billing plan templates
Column(s)
Type
Constraint
Description
name / description
VARCHAR / TEXT
name NOT NULL
Plan details
price / currency
NUMERIC / CHAR(3)
NOT NULL
Billing amount
interval / interval_count
VARCHAR / INT
NOT NULL
daily | weekly | monthly | yearly + count
trial_days
INT
DEFAULT 0
Free trial period


subscriptions
PK: id (UUID)    User subscription instances
Column(s)
Type
Constraint
Description
user_id
UUID
FK → users
Subscriber
plan_id
UUID
FK → subscription_plans
Active plan
status
VARCHAR(20)
CHECK ENUM
trialing | active | past_due | cancelled | expired
gateway / gateway_sub_id
VARCHAR / TEXT


External subscription reference
current_period_start / end
TIMESTAMPTZ
NOT NULL
Billing cycle window
trial_ends_at / cancelled_at
TIMESTAMPTZ


Lifecycle timestamps


returns
PK: id (UUID)    Return / refund requests
Column(s)
Type
Constraint
Description
order_id
UUID
FK → orders
Original order
user_id
UUID
FK → users
Requesting customer
reason
TEXT
NOT NULL
Return justification
status
VARCHAR(30)
CHECK ENUM
requested | approved | rejected | received | refunded
refund_amount
NUMERIC(14,4)


Approved refund value
reviewed_by
UUID
FK → users (nullable)
Admin reviewer


return_items
PK: id (UUID)    Line items within a return request
Column(s)
Type
Constraint
Description
return_id
UUID
FK → returns
Parent return
order_item_id
UUID
FK → order_items
Specific line being returned
quantity
INT
CHECK > 0
Units being returned
condition / notes
VARCHAR / TEXT


Item condition and notes



Domain 4 — Logistics
Modules: Warehouses  ·  Inventory  ·  Shipping Zones & Methods  ·  Shipments
7 tables in this domain
warehouses
PK: id (UUID)    Physical warehouse locations
Column(s)
Type
Constraint
Description
code
VARCHAR(20)
UNIQUE NOT NULL
Short warehouse identifier
name
VARCHAR(200)
NOT NULL
Warehouse display name
line1 / city / country
TEXT / VARCHAR
NOT NULL
Physical address
is_active
BOOLEAN
DEFAULT TRUE
Operational flag


inventory
PK: id (UUID)    Stock levels tracked at warehouse × variant granularity
Column(s)
Type
Constraint
Description
warehouse_id
UUID
FK → warehouses
Storage location
variant_id
UUID
FK → product_variants
Stocked variant
qty_on_hand
INT
CHECK >= 0
Physical units in warehouse
qty_reserved
INT
CHECK >= 0
Units allocated to pending orders
qty_available
INT
GENERATED (on_hand - reserved)
Available to purchase — computed column
low_stock_threshold
INT
DEFAULT 5
Alert threshold
UNIQUE


(warehouse_id, variant_id)
One record per location-variant pair


shipping_zones
PK: id (UUID)    Geographic regions for shipping rate grouping
Column(s)
Type
Constraint
Description
name
VARCHAR(200)
NOT NULL
Zone label e.g. "North America"
is_active
BOOLEAN
DEFAULT TRUE
Zone enabled flag


shipping_zone_countries
PK: (zone_id, country)    Junction — maps ISO country codes to shipping zones
Column(s)
Type
Constraint
Description
zone_id
UUID
FK → shipping_zones
Parent zone
country
CHAR(2)
NOT NULL
ISO 3166-1 alpha-2 country code


shipping_methods
PK: id (UUID)    Carrier services and rate structures per zone
Column(s)
Type
Constraint
Description
zone_id
UUID
FK → shipping_zones
Applicable zone
name / carrier
VARCHAR
name NOT NULL
Method and carrier name
estimated_days_min / max
INT


Delivery window estimate
base_rate / per_kg_rate
NUMERIC(14,4)
NOT NULL
Rate components
free_threshold
NUMERIC(14,4)


Order value for free shipping
is_active
BOOLEAN
DEFAULT TRUE
Method availability


shipments
PK: id (UUID)    Shipment records per order
Column(s)
Type
Constraint
Description
order_id
UUID
FK → orders
Fulfilling order
warehouse_id
UUID
FK → warehouses
Dispatching warehouse
shipping_method_id
UUID
FK → shipping_methods
Carrier method used
tracking_number / carrier
VARCHAR


External tracking info
status
VARCHAR(30)
CHECK ENUM
preparing | dispatched | in_transit | out_for_delivery | delivered | failed | returned
dispatched_at / delivered_at
TIMESTAMPTZ


Lifecycle timestamps


shipment_events
PK: id (UUID)    Tracking event history per shipment
Column(s)
Type
Constraint
Description
shipment_id
UUID
FK → shipments
Parent shipment
status
VARCHAR(30)
NOT NULL
Event status code
location
VARCHAR(300)


Geographic location at event
description
TEXT


Human-readable event detail
occurred_at
TIMESTAMPTZ
NOT NULL
Event timestamp



Domain 5 — Communication
Modules: Notifications  ·  Chat  ·  Search
5 tables in this domain
notifications
PK: id (UUID)    Unified notification table — all channels in one place
Column(s)
Type
Constraint
Description
user_id
UUID
FK → users
Recipient
channel
VARCHAR(20)
CHECK ENUM
email | sms | push | in_app | webhook
type
VARCHAR(100)
NOT NULL
Event type e.g. "order.shipped"
title / body
VARCHAR / TEXT


Notification content
action_url
TEXT


Deep link for clickable notifications
is_read / read_at
BOOLEAN / TIMESTAMPTZ
DEFAULT FALSE
Read tracking for in_app
sent_at
TIMESTAMPTZ


Delivery timestamp
metadata
JSONB


Channel-specific payload (GIN indexed)


chat_threads
PK: id (UUID)    Conversation containers (buyer–seller, support)
Column(s)
Type
Constraint
Description
subject
VARCHAR(300)


Thread topic
order_id
UUID
FK → orders (nullable)
Order-related thread
product_id
UUID
FK → products (nullable)
Product-related thread
status
VARCHAR(20)
CHECK ENUM
open | resolved | archived


chat_thread_participants
PK: (thread_id, user_id)    Junction — members of a chat thread
Column(s)
Type
Constraint
Description
thread_id
UUID
FK → chat_threads
Thread reference
user_id
UUID
FK → users
Participant user
joined_at
TIMESTAMPTZ
NOT NULL
When user entered thread
last_read_at
TIMESTAMPTZ


For unread message badges


chat_messages
PK: id (UUID)    Individual messages within a thread
Column(s)
Type
Constraint
Description
thread_id
UUID
FK → chat_threads
Parent thread
sender_id
UUID
FK → users
Message author
body
TEXT
NOT NULL
Message content
attachment_url
TEXT


Optional file/image attachment
sent_at
TIMESTAMPTZ
NOT NULL
Send timestamp
deleted_at
TIMESTAMPTZ


Soft delete timestamp


search_queries
PK: id (UUID)    Search query log for analytics and recommendations
Column(s)
Type
Constraint
Description
user_id
UUID
FK → users (nullable)
Authenticated searcher
session_id
VARCHAR(200)


Guest session identifier
query
TEXT
NOT NULL
Search string entered
result_count
INT


Number of results returned
clicked_product
UUID
FK → products (nullable)
First clicked result
searched_at
TIMESTAMPTZ
NOT NULL
Query timestamp



Domain 6 — Analytics & Admin
Modules: Audit Logs
1 table in this domain
audit_logs
PK: id (UUID)    Immutable change log — stores JSONB diffs, not full row copies
Column(s)
Type
Constraint
Description
actor_id
UUID
FK → users (nullable)
User who performed the action
action
VARCHAR(50)
CHECK ENUM
insert | update | delete | login | logout | export
table_name
VARCHAR(100)
NOT NULL
Affected database table
record_id
UUID


PK of the modified row
diff
JSONB


{"before": {field: val}, "after": {field: val}} — only changed fields (GIN indexed)
ip_address
INET


Actor IP address
user_agent
TEXT


Browser / API client string
occurred_at
TIMESTAMPTZ
NOT NULL (DESC indexed)
Immutable event timestamp



Key Relationships & Junction Tables
From Table
Type
To Table
Junction / FK Column
users
M:N
roles
user_roles (junction)
roles
M:N
permissions
role_permissions (junction)
users
1:N
user_addresses
user_addresses.user_id
users
1:1
sellers
sellers.user_id (UNIQUE)
sellers
1:N
stores
stores.seller_id
products
M:N
categories
product_categories (junction)
product_variants
M:N
attribute_values
variant_attribute_values (junction)
warehouses
M:N
product_variants
inventory (junction + qty columns)
shipping_zones
M:N
countries (ISO)
shipping_zone_countries (junction)
chat_threads
M:N
users
chat_thread_participants (junction)
coupons
1:N
coupon_scopes
coupon_scopes.coupon_id (exclusive CHECK)
orders
1:N
order_items
order_items.order_id
orders
1:N
shipments
shipments.order_id
orders
1:N
payments
payments.order_id
orders
1:N
returns
returns.order_id


Index Strategy
Auth & Access
  idx_user_roles_user ON user_roles(user_id)
  idx_auth_sessions_user ON auth_sessions(user_id)
  idx_auth_tokens_user ON auth_tokens(user_id)
  idx_user_addresses_user ON user_addresses(user_id)
Catalog
  idx_products_store ON products(store_id)
  idx_products_category ON products(category_id)
  idx_products_brand ON products(brand_id)
  idx_variants_product ON product_variants(product_id)
  idx_product_images_product ON product_images(product_id)
  idx_categories_parent ON categories(parent_id)
  idx_reviews_product ON reviews(product_id)
Commerce
  idx_cart_items_cart ON cart_items(cart_id)
  idx_orders_user ON orders(user_id)
  idx_order_items_order ON order_items(order_id)
  idx_payments_order ON payments(order_id)
  idx_returns_order ON returns(order_id)
  idx_coupon_usages_coupon ON coupon_usages(coupon_id)
  idx_subscriptions_user ON subscriptions(user_id)
  idx_payments_metadata USING GIN (metadata) — JSONB
Logistics
  idx_inventory_warehouse ON inventory(warehouse_id)
  idx_inventory_variant ON inventory(variant_id)
  idx_shipments_order ON shipments(order_id)
  idx_shipment_events_ship ON shipment_events(shipment_id)
Communication
  idx_notifications_user ON notifications(user_id)
  idx_notifications_channel ON notifications(channel)
  idx_chat_messages_thread ON chat_messages(thread_id)
  idx_search_queries_user ON search_queries(user_id)
  idx_notifications_meta USING GIN (metadata) — JSONB
Analytics & Admin
  idx_audit_logs_actor ON audit_logs(actor_id)
  idx_audit_logs_table ON audit_logs(table_name, record_id)
  idx_audit_logs_occurred ON audit_logs(occurred_at DESC)
  idx_audit_logs_diff USING GIN (diff) — JSONB
