
🛒 E-Commerce Marketplace
Complete Database Design Document
Daraz-like Multi-Vendor Platform


📋 Project
E-commerce Store
👤 Client
Rana Awais
🏢 Company
Labverse
🗄️ Database
PostgreSQL + TypeORM



Total Tables: 112  |  Modules: 33  |  Version: 2.0
Last Updated: March 12, 2026

📊 Database Overview

Yeh document E-Commerce platform ke complete database design ko cover karta hai — actual TypeORM entity implementation ke hisaab se updated hai. Har module ki tables, columns, data types aur relationships yahan detail mein explain ki gayi hain.

Module
Tables
Count
🔐 Auth & Users
users, roles, permissions, user_roles, sessions, addresses, login_history
7
🏪 Sellers & Stores
sellers, stores, seller_wallets, wallet_transactions, seller_documents, seller_violations, store_followers
7
🗂️ Categories & Brands
categories, brands, attributes, attribute_groups, attribute_options, brand_categories, category_attributes
7
📦 Products
products, product_variants, product_images, product_attributes, product_questions, product_answers, price_history
7
🛒 Cart & Checkout
carts, cart_items, wishlists, checkout_sessions
4
📋 Orders
orders, order_items, shipments, shipment_items, order_status_history, order_snapshots
6
💳 Payments & Refunds
payments, refunds, payment_attempts, saved_payment_methods
4
⭐ Reviews
reviews, review_helpfulness, review_reports
3
🎯 Marketing
vouchers, voucher_usages, voucher_conditions, voucher_products, campaigns, campaign_products, flash_sales, flash_sale_products
8
🔔 Notifications
notifications, notification_preferences, notification_templates
3
💰 Wallet
seller_wallets, wallet_transactions
2
📦 Inventory
inventory, warehouses, stock_movements, stock_reservations, inventory_transfers, inventory_transfer_items
6
↩️ Returns
return_requests, return_reasons, return_images, return_shipments
4
🎁 Bundles
product_bundles, bundle_items
2
🔄 Subscriptions
subscriptions, subscription_orders
2
⚖️ Disputes
disputes, dispute_evidence, dispute_messages
3
🏷️ Tax
tax_classes, tax_zones, tax_rates, order_tax_lines
4
🚚 Shipping
shipping_carriers, shipping_methods, shipping_zones, shipping_rates, delivery_slots
5
🔍 Search
search_history, recently_viewed, product_recommendations, product_comparisons
4
🎖️ Loyalty
loyalty_points, loyalty_tiers, loyalty_transactions, referral_codes, referrals
5
🔧 System
system_settings, feature_flags
2
📋 Audit
audit_logs, user_activity_logs
2
🌐 i18n
languages, currencies, currency_rate_history, translations
4
💬 Chat
conversations, messages
2
📄 CMS
banners, pages
2
🔍 SEO
seo_metadata, url_redirects
2
🎫 Tickets
tickets, ticket_categories, ticket_messages
3
⚙️ Operations
bulk_operations, import_export_jobs
2



🔐 MODULE 1 – AUTH & USERS


1.1 users
Platform ke sab users (Customer, Seller, Admin, Super Admin) is table mein hain.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK, DEFAULT uuid_generate_v4()
Unique identifier
name
VARCHAR(100)
NOT NULL
User ka poora naam
email
VARCHAR(150)
NOT NULL, UNIQUE
Login email
password
VARCHAR(255)
NOT NULL, SELECT: false
Bcrypt hashed password (hidden from queries)
phone
VARCHAR(20)
NULLABLE
Mobile number
role
ENUM(UserRole)
NOT NULL, DEFAULT 'customer'
customer | seller | admin | super_admin
is_email_verified
BOOLEAN
DEFAULT false
Email verify hua ya nahi
email_verified_at
TIMESTAMPTZ
NULLABLE
Email verification timestamp
phone_verified_at
TIMESTAMPTZ
NULLABLE
Phone verification timestamp
is_active
BOOLEAN
DEFAULT true
Account active hai ya nahi
profile_image
VARCHAR(500)
NULLABLE
S3 image URL
date_of_birth
DATE
NULLABLE
User ki date of birth
gender
ENUM(Gender)
NULLABLE
male | female | other | prefer_not_to_say
referral_code
VARCHAR(20)
NULLABLE, UNIQUE
User ka unique referral code
last_login_at
TIMESTAMPTZ
NULLABLE
Last successful login
last_login_ip
INET
NULLABLE
Last login IP address
login_attempts
SMALLINT
DEFAULT 0
Failed login attempts counter (max 10)
locked_until
TIMESTAMPTZ
NULLABLE
Account lock expiry (15-min after 5 failures)
two_factor_enabled
BOOLEAN
DEFAULT false
2FA active hai?
two_factor_secret
VARCHAR(255)
NULLABLE, SELECT: false
2FA TOTP secret (hidden)
two_factor_backup_codes
TEXT[]
NULLABLE, SELECT: false
Backup codes array (hidden)
preferred_language_id
UUID
NULLABLE
User ki preferred language
preferred_currency_id
UUID
NULLABLE
User ki preferred currency
deleted_at
TIMESTAMPTZ
NULLABLE
Soft delete timestamp
created_at
TIMESTAMPTZ
DEFAULT NOW()
Registration date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update date

⚠️ Note: preferred_language_id aur preferred_currency_id ke FK relationships missing hain (i18n module se link hona chahiye)


1.2 roles
RBAC ke liye role definitions.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Unique ID
name
VARCHAR(50)
NOT NULL, UNIQUE
customer, seller, admin, super_admin
display_name
VARCHAR(100)
NULLABLE
User-friendly role name
description
TEXT
NULLABLE
Role ki description
is_system
BOOLEAN
DEFAULT false
System role hai? (delete nahi ho sakta)
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date

🔗 Relations: roles → permissions (OneToMany)


1.3 permissions
Har role ke permissions define karta hai.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Unique ID
🔗 role_id
UUID
FK → roles.id, ON DELETE CASCADE
Kis role ka permission
module
VARCHAR(50)
NOT NULL
products, orders, users, etc.
action
VARCHAR(50)
NOT NULL
create, read, update, delete
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date

🔗 Relations: permissions.role_id → roles.id (ManyToOne)
⚠️ Missing UNIQUE constraint on (role_id, module, action) — duplicates possible


1.4 user_roles
Users ko multiple roles assign karne ke liye junction table.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
ID
🔗 user_id
UUID
FK → users.id, ON DELETE CASCADE
User ID
🔗 role_id
UUID
FK → roles.id, ON DELETE CASCADE
Role ID
🔗 assigned_by
UUID
FK → users.id, NULLABLE
Kis admin ne assign kiya
assigned_at
TIMESTAMPTZ
DEFAULT NOW()
Assignment date

🔗 Relations: user_roles.user_id → users.id | user_roles.role_id → roles.id | user_roles.assigned_by → users.id
⚠️ Missing UNIQUE constraint on (user_id, role_id) — duplicate assignments possible
⚠️ Note: Yeh table users.role ENUM ke saath co-exists — dual role system hai


1.5 sessions
JWT refresh tokens aur active sessions store karta hai.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Session ID
🔗 user_id
UUID
FK → users.id, ON DELETE CASCADE
Kis user ki session
refresh_token
TEXT
NOT NULL
Hashed refresh token
ip_address
INET
NULLABLE
User ka IP
user_agent
TEXT
NULLABLE
Browser/device info
device_fingerprint
VARCHAR(255)
NULLABLE
Device fingerprint for multi-device tracking
is_valid
BOOLEAN
DEFAULT true
Token valid hai ya revoked
last_activity_at
TIMESTAMPTZ
DEFAULT NOW()
Last token usage time
expires_at
TIMESTAMPTZ
NOT NULL
Token expiry time (7 days)
created_at
TIMESTAMPTZ
DEFAULT NOW()
Login time

🔗 Relations: sessions.user_id → users.id (ManyToOne)


1.6 addresses
Users ke delivery aur billing addresses store karta hai.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Address ID
🔗 user_id
UUID
FK → users.id, ON DELETE CASCADE
Kis user ka address
label
VARCHAR(50)
NULLABLE
Home, Office, etc.
full_name
VARCHAR(100)
NOT NULL
Receiver ka naam
phone
VARCHAR(20)
NOT NULL
Contact number
country
VARCHAR(100)
DEFAULT 'Pakistan'
Country name
province
VARCHAR(100)
NOT NULL
State/Province
city
VARCHAR(100)
NOT NULL
City naam
area
VARCHAR(100)
NULLABLE
Area/Town
street_address
TEXT
NOT NULL
Complete address
postal_code
VARCHAR(20)
NULLABLE
Postal/ZIP code
latitude
DECIMAL(10,7)
NULLABLE
GPS latitude
longitude
DECIMAL(10,7)
NULLABLE
GPS longitude
delivery_instructions
TEXT
NULLABLE
Courier ke liye special instructions
is_default_shipping
BOOLEAN
DEFAULT false
Default shipping address?
is_default_billing
BOOLEAN
DEFAULT false
Default billing address?
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: addresses.user_id → users.id (ManyToOne)


1.7 login_history
Login attempts ka audit trail.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
History ID
🔗 user_id
UUID
FK → users.id, ON DELETE CASCADE
User ID
login_at
TIMESTAMPTZ
DEFAULT NOW()
Login attempt time
ip_address
INET
NULLABLE
Login IP
user_agent
TEXT
NULLABLE
Browser info
device_fingerprint
VARCHAR(255)
NULLABLE
Device fingerprint
status
ENUM(LoginStatus)
DEFAULT 'success'
success | failed | blocked
failure_reason
TEXT
NULLABLE
Failure ki wajah
location_country
VARCHAR(100)
NULLABLE
GeoIP country
location_city
VARCHAR(100)
NULLABLE
GeoIP city

🔗 Relations: login_history.user_id → users.id (ManyToOne)



🏪 MODULE 2 – SELLERS & STORES


2.1 sellers
Seller onboarding details, verification, banking, aur performance metrics.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Seller ID
🔗 user_id
UUID
FK → users.id, OneToOne
Seller ka user account
business_name
VARCHAR(200)
NOT NULL
Business ya company naam
business_name_ar
VARCHAR(200)
NULLABLE
Arabic business name (i18n)
cnic
VARCHAR(15)
NULLABLE
CNIC number
cnic_front_image
VARCHAR(500)
NULLABLE
CNIC front image URL
cnic_back_image
VARCHAR(500)
NULLABLE
CNIC back image URL
bank_name
VARCHAR(100)
NULLABLE
Bank ka naam
bank_account_number
VARCHAR(30)
NULLABLE
Account number
bank_account_title
VARCHAR(100)
NULLABLE
Account title
bank_iban
VARCHAR(34)
NULLABLE
International Bank Account Number
bank_swift
VARCHAR(11)
NULLABLE
SWIFT/BIC code
payout_frequency
ENUM(PayoutFrequency)
DEFAULT 'weekly'
daily | weekly | biweekly | monthly
commission_rate
DECIMAL(5,2)
DEFAULT 10.00
Platform commission % (0-50)
verification_status
ENUM(VerificationStatus)
DEFAULT 'pending'
pending | under_review | approved | rejected | suspended
verified_at
TIMESTAMPTZ
NULLABLE
Approval date
verified_by
UUID
NULLABLE
Approving admin (⚠️ Missing FK to users)
rejection_reason
TEXT
NULLABLE
Rejection ki wajah
suspension_reason
TEXT
NULLABLE
Suspension ki wajah
suspended_at
TIMESTAMPTZ
NULLABLE
Suspension timestamp
vacation_mode
BOOLEAN
DEFAULT false
Store temporarily closed
vacation_start_date
DATE
NULLABLE
Vacation start
vacation_end_date
DATE
NULLABLE
Vacation end
avg_response_time
INTERVAL
NULLABLE
Average customer response time
total_products
INTEGER
DEFAULT 0
Total active products (denormalized)
total_orders
INTEGER
DEFAULT 0
Total completed orders (denormalized)
total_revenue
DECIMAL(16,2)
DEFAULT 0.00
Total revenue earned (denormalized)
created_at
TIMESTAMPTZ
DEFAULT NOW()
Registration date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: sellers.user_id → users.id (OneToOne) | sellers → stores (OneToMany) | sellers → wallet (OneToOne) | sellers → documents (OneToMany) | sellers → violations (OneToMany)


2.2 stores
Seller ka public store page. Ek seller ke multiple stores ho sakte hain.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Store ID
🔗 seller_id
UUID
FK → sellers.id
Seller ka ID
name
VARCHAR(100)
NOT NULL
Store ka naam
slug
VARCHAR(100)
NOT NULL, UNIQUE
URL-friendly name
logo_url
VARCHAR(500)
NULLABLE
Store logo
banner_url
VARCHAR(500)
NULLABLE
Banner image
description
TEXT
NULLABLE
Store description
return_policy
TEXT
NULLABLE
Return policy text
shipping_policy
TEXT
NULLABLE
Shipping policy text
rating
DECIMAL(3,2)
DEFAULT 0.00
Average store rating
total_reviews
INTEGER
DEFAULT 0
Total reviews (denormalized)
total_sales
INTEGER
DEFAULT 0
Total orders completed (denormalized)
total_followers
INTEGER
DEFAULT 0
Total followers (denormalized)
is_active
BOOLEAN
DEFAULT true
Store active hai?
is_featured
BOOLEAN
DEFAULT false
Featured store?
created_at
TIMESTAMPTZ
DEFAULT NOW()
Store creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: stores.seller_id → sellers.id (ManyToOne) | stores → followers (OneToMany)
⚠️ Note: Document originally specified OneToOne (1 store per seller), but code implements OneToMany (multiple stores)


2.3 seller_wallets

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Wallet ID
🔗 seller_id
UUID
FK → sellers.id, UNIQUE
Seller ka ID
balance
DECIMAL(14,2)
DEFAULT 0.00
Current available balance
pending_balance
DECIMAL(14,2)
DEFAULT 0.00
Pending clearance balance
total_earned
DECIMAL(16,2)
DEFAULT 0.00
Total earnings
total_withdrawn
DECIMAL(16,2)
DEFAULT 0.00
Total withdrawn
currency_code
VARCHAR(3)
DEFAULT 'PKR'
Wallet currency
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last updated

🔗 Relations: seller_wallets.seller_id → sellers.id (OneToOne) | seller_wallets → wallet_transactions (OneToMany)
CHECK: balance >= 0, pending_balance >= 0


2.4 wallet_transactions

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Transaction ID
🔗 wallet_id
UUID
FK → seller_wallets.id
Wallet ID
🔗 order_id
UUID
FK → orders.id, NULLABLE
Related order
type
ENUM(WalletTxType)
NOT NULL
credit | debit | withdrawal | refund_credit | commission_deduction | payout | adjustment | bonus
amount
DECIMAL(12,2)
NOT NULL, CHECK > 0
Transaction amount
commission
DECIMAL(12,2)
DEFAULT 0.00
Platform commission
net_amount
DECIMAL(12,2)
NOT NULL
Amount after commission
description
TEXT
NULLABLE
Transaction note
status
ENUM(WalletTxStatus)
DEFAULT 'completed'
pending | completed | failed | reversed
created_at
TIMESTAMPTZ
DEFAULT NOW()
Transaction date


2.5 seller_documents
KYC aur verification documents.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Document ID
🔗 seller_id
UUID
FK → sellers.id
Seller ID
document_type
ENUM(SellerDocType)
NOT NULL
business_license | tax_certificate | id_card | cnic | bank_statement | address_proof
file_url
VARCHAR(500)
NOT NULL
Document file URL
status
ENUM(DocStatus)
DEFAULT 'pending'
pending | approved | rejected | expired
🔗 reviewed_by
UUID
FK → users.id, NULLABLE
Reviewing admin
reviewed_at
TIMESTAMPTZ
NULLABLE
Review timestamp
rejection_reason
TEXT
NULLABLE
Rejection reason
expires_at
DATE
NULLABLE
Document expiry date
created_at
TIMESTAMPTZ
DEFAULT NOW()
Upload date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update


2.6 seller_violations
Policy violations tracking.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Violation ID
🔗 seller_id
UUID
FK → sellers.id
Seller ID
violation_type
VARCHAR(100)
NOT NULL
Type of violation
severity
ENUM(ViolationSeverity)
DEFAULT 'warning'
warning | minor | major | critical
description
TEXT
NULLABLE
Violation details
evidence_urls
JSONB
NULLABLE
Array of evidence image URLs
penalty_action
ENUM(ViolationPenalty)
NULLABLE
warning | listing_suspended | account_suspended | fine | permanent_ban
fine_amount
DECIMAL(12,2)
NULLABLE
Fine amount if applicable
🔗 issued_by
UUID
FK → users.id, NULLABLE
Issuing admin
appealed_at
TIMESTAMPTZ
NULLABLE
Appeal submission date
appeal_note
TEXT
NULLABLE
Seller ka appeal
resolved_at
TIMESTAMPTZ
NULLABLE
Resolution date
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date


2.7 store_followers

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Follow ID
🔗 store_id
UUID
FK → stores.id, ON DELETE CASCADE
Store ID
🔗 user_id
UUID
FK → users.id
User ID
followed_at
TIMESTAMPTZ
DEFAULT NOW()
Follow date

📝 UNIQUE constraint on (store_id, user_id) – ek user ek store sirf ek baar follow kar sakta



🗂️ MODULE 3 – CATEGORIES & BRANDS


3.1 categories
Hierarchical categories with depth tracking. Electronics → Mobile Phones → Smartphones

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Category ID
🔗 parent_id
UUID
FK → categories.id, NULLABLE
Parent category (null = top level)
name
VARCHAR(100)
NOT NULL
Category naam
slug
VARCHAR(100)
NOT NULL, UNIQUE
URL friendly naam
image_url
VARCHAR(500)
NULLABLE
Category image
icon_url
VARCHAR(500)
NULLABLE
Category icon
description
TEXT
NULLABLE
Category description
meta_title
VARCHAR(255)
NULLABLE
SEO title
meta_description
VARCHAR(500)
NULLABLE
SEO description
commission_rate
DECIMAL(5,2)
NULLABLE
Category-level commission override
is_active
BOOLEAN
DEFAULT true
Active hai?
is_featured
BOOLEAN
DEFAULT false
Featured category?
sort_order
INTEGER
DEFAULT 0
Display order
depth
INTEGER
DEFAULT 0
Nesting depth level
path
TEXT
NULLABLE
Full path (e.g., "electronics/phones/smartphones")
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: categories.parent_id → categories.id (Self-referencing ManyToOne) | categories → children (OneToMany)


3.2 brands

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Brand ID
name
VARCHAR(100)
NOT NULL
Brand naam
slug
VARCHAR(100)
NOT NULL, UNIQUE
URL friendly
logo_url
VARCHAR(500)
NULLABLE
Brand logo
description
TEXT
NULLABLE
Brand description
website_url
VARCHAR(500)
NULLABLE
Brand website
country_of_origin
VARCHAR(3)
NULLABLE
ISO country code
is_active
BOOLEAN
DEFAULT true
Active hai?
is_featured
BOOLEAN
DEFAULT false
Featured brand?
meta_title
VARCHAR(255)
NULLABLE
SEO title
meta_description
VARCHAR(500)
NULLABLE
SEO description
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update


3.3 attributes
Category-level product attributes (e.g., Color, Size, RAM).

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Attribute ID
🔗 attribute_group_id
UUID
FK → attribute_groups.id, NULLABLE
Parent group
name
VARCHAR(100)
NOT NULL
Attribute naam
slug
VARCHAR(100)
NOT NULL, UNIQUE
URL friendly
type
ENUM(AttributeType)
DEFAULT 'text'
text | number | boolean | select | multi_select | color | date
unit
VARCHAR(20)
NULLABLE
Unit of measurement (kg, cm, etc.)
is_filterable
BOOLEAN
DEFAULT false
Product filter mein show ho?
is_required
BOOLEAN
DEFAULT false
Required hai?
is_variant_attribute
BOOLEAN
DEFAULT false
Variant selection mein use ho?
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date


3.4 attribute_groups

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Group ID
name
VARCHAR(100)
NOT NULL
Group naam (e.g., "Physical Specs")
slug
VARCHAR(100)
NOT NULL, UNIQUE
URL friendly
sort_order
INTEGER
DEFAULT 0
Display order
is_active
BOOLEAN
DEFAULT true
Active hai?
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date


3.5 attribute_options
Select/multi-select attributes ke predefined values.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Option ID
🔗 attribute_id
UUID
FK → attributes.id, ON DELETE CASCADE
Parent attribute
value
VARCHAR(200)
NOT NULL
Option value (e.g., "Red", "XL")
color_hex
VARCHAR(7)
NULLABLE
Color swatch (#FF0000)
image_url
VARCHAR(500)
NULLABLE
Option image
sort_order
INTEGER
DEFAULT 0
Display order
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date

📝 UNIQUE constraint on (attribute_id, value)


3.6 brand_categories
Brands aur categories ka many-to-many mapping.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
ID
🔗 brand_id
UUID
FK → brands.id, ON DELETE CASCADE
Brand ID
🔗 category_id
UUID
FK → categories.id, ON DELETE CASCADE
Category ID

📝 UNIQUE constraint on (brand_id, category_id)


3.7 category_attributes
Categories ke saath attributes ka mapping.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
ID
🔗 category_id
UUID
FK → categories.id, ON DELETE CASCADE
Category ID
🔗 attribute_id
UUID
FK → attributes.id, ON DELETE CASCADE
Attribute ID
is_required
BOOLEAN
DEFAULT false
Is category ke liye required?
sort_order
INTEGER
DEFAULT 0
Display order

📝 UNIQUE constraint on (category_id, attribute_id)



📦 MODULE 4 – PRODUCTS


4.1 products
Main product information with full e-commerce fields.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Product ID
🔗 seller_id
UUID
FK → sellers.id
Seller ID
🔗 category_id
UUID
FK → categories.id
Category ID
🔗 brand_id
UUID
FK → brands.id, NULLABLE
Brand ID
name
VARCHAR(300)
NOT NULL
Product naam
slug
VARCHAR(300)
NOT NULL, UNIQUE, INDEXED
URL friendly naam
description
TEXT
NULLABLE
Full description
short_description
VARCHAR(500)
NULLABLE
Short description
price
DECIMAL(12,2)
NOT NULL, CHECK > 0
Current selling price
compare_at_price
DECIMAL(12,2)
NULLABLE, CHECK >= price
Original/compare price (for discounts)
cost_price
DECIMAL(12,2)
NULLABLE
Seller ka cost price
currency_code
VARCHAR(3)
DEFAULT 'PKR'
Currency
stock
INTEGER
DEFAULT 0, CHECK >= 0
Total stock (⚠️ also in Inventory module)
low_stock_threshold
INTEGER
DEFAULT 5
Low stock alert level
sku
VARCHAR(100)
UNIQUE, NULLABLE
Stock Keeping Unit
barcode
VARCHAR(50)
NULLABLE
Barcode (EAN/UPC)
weight
DECIMAL(10,2)
NULLABLE
Product weight
weight_unit
VARCHAR(10)
DEFAULT 'kg'
Weight unit
length
DECIMAL(8,2)
NULLABLE
Package length
width
DECIMAL(8,2)
NULLABLE
Package width
height
DECIMAL(8,2)
NULLABLE
Package height
dimension_unit
VARCHAR(10)
DEFAULT 'cm'
Dimension unit
warranty_type
ENUM(WarrantyType)
NULLABLE
brand | seller | marketplace | none
warranty_duration_months
SMALLINT
NULLABLE
Warranty period
tags
TEXT[]
NULLABLE
Product tags array (GIN indexed)
status
ENUM(ProductStatus)
DEFAULT 'draft'
draft | pending_review | active | published | inactive | out_of_stock | discontinued | rejected
is_featured
BOOLEAN
DEFAULT false
Featured product?
is_digital
BOOLEAN
DEFAULT false
Digital product? (no shipping)
requires_shipping
BOOLEAN
DEFAULT true
Needs physical shipping?
is_taxable
BOOLEAN
DEFAULT true
Tax applicable?
avg_rating
DECIMAL(3,2)
DEFAULT 0.00, CHECK 0-5
Average customer rating
total_reviews
INTEGER
DEFAULT 0
Total reviews count (denormalized)
total_sales
INTEGER
DEFAULT 0
Total units sold (denormalized)
view_count
INTEGER
DEFAULT 0
Product views
meta_title
VARCHAR(255)
NULLABLE
SEO title
meta_description
VARCHAR(500)
NULLABLE
SEO description
deleted_at
TIMESTAMPTZ
NULLABLE
Soft delete
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: products.seller_id → sellers.id | products.category_id → categories.id | products.brand_id → brands.id | products → variants (OneToMany) | products → images (OneToMany) | products → attributes (OneToMany)


4.2 product_variants
Product ke alag alag variants (Color, Size, etc.).

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Variant ID
🔗 product_id
UUID
FK → products.id, ON DELETE CASCADE
Parent product
name
VARCHAR(200)
NULLABLE
Variant naam (Red-XL)
sku
VARCHAR(100)
UNIQUE, NULLABLE
Variant SKU
barcode
VARCHAR(50)
NULLABLE
Variant barcode
price
DECIMAL(12,2)
NOT NULL, CHECK > 0
Variant price
compare_at_price
DECIMAL(12,2)
NULLABLE
Compare price
cost_price
DECIMAL(12,2)
NULLABLE
Cost price
stock
INTEGER
DEFAULT 0, CHECK >= 0
Variant stock
weight
DECIMAL(10,2)
NULLABLE
Variant weight
length
DECIMAL(8,2)
NULLABLE
Length
width
DECIMAL(8,2)
NULLABLE
Width
height
DECIMAL(8,2)
NULLABLE
Height
options
JSONB
NULLABLE
{color: 'Red', size: 'XL'}
image_url
VARCHAR(500)
NULLABLE
Variant image
is_active
BOOLEAN
DEFAULT true
Active hai?
sort_order
INTEGER
DEFAULT 0
Display order
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: product_variants.product_id → products.id (ManyToOne, CASCADE)


4.3 product_images

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Image ID
🔗 product_id
UUID
FK → products.id, ON DELETE CASCADE
Product ID
🔗 variant_id
UUID
FK → product_variants.id, NULLABLE
Variant-specific image
url
VARCHAR(500)
NOT NULL
S3 image URL
alt_text
VARCHAR(200)
NULLABLE
Alt text for SEO
is_primary
BOOLEAN
DEFAULT false
Main image hai?
sort_order
INTEGER
DEFAULT 0
Display sequence
created_at
TIMESTAMPTZ
DEFAULT NOW()
Upload date

🔗 Relations: product_images.product_id → products.id | product_images.variant_id → product_variants.id


4.4 product_attributes
Products ke specific attribute values.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
ID
🔗 product_id
UUID
FK → products.id, ON DELETE CASCADE
Product
🔗 attribute_id
UUID
FK → attributes.id
Attribute definition
🔗 attribute_option_id
UUID
FK → attribute_options.id, NULLABLE
Pre-defined option (for select types)
value_text
TEXT
NULLABLE
Free-text value
value_numeric
DECIMAL(14,4)
NULLABLE
Numeric value
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date


4.5 product_questions
Customer product questions (Q&A section).

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Question ID
🔗 product_id
UUID
FK → products.id, ON DELETE CASCADE
Product
🔗 user_id
UUID
FK → users.id
Asker
question_text
TEXT
NOT NULL
Question text
is_approved
BOOLEAN
DEFAULT false
Admin approved?
is_featured
BOOLEAN
DEFAULT false
Featured question?
answer_count
INTEGER
DEFAULT 0
Total answers (denormalized)
created_at
TIMESTAMPTZ
DEFAULT NOW()
Asked date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update


4.6 product_answers

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Answer ID
🔗 question_id
UUID
FK → product_questions.id, ON DELETE CASCADE
Parent question
🔗 user_id
UUID
FK → users.id, NULLABLE
Answerer (user)
🔗 seller_id
UUID
FK → sellers.id, NULLABLE
Answerer (seller)
answer_text
TEXT
NOT NULL
Answer text
is_seller_answer
BOOLEAN
DEFAULT false
Seller ki reply hai?
is_approved
BOOLEAN
DEFAULT false
Admin approved?
upvote_count
INTEGER
DEFAULT 0
Helpful votes (denormalized)
created_at
TIMESTAMPTZ
DEFAULT NOW()
Created date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update


4.7 price_history
Product price changes ka audit trail.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
History ID
🔗 product_id
UUID
FK → products.id, ON DELETE CASCADE
Product
🔗 variant_id
UUID
FK → product_variants.id, NULLABLE
Variant (if variant-level)
old_price
DECIMAL(12,2)
NOT NULL
Purani price
new_price
DECIMAL(12,2)
NOT NULL
Nayi price
🔗 changed_by
UUID
FK → users.id, NULLABLE
Who changed
change_reason
VARCHAR(200)
NULLABLE
Reason for change
created_at
TIMESTAMPTZ
DEFAULT NOW()
Change date



🛒 MODULE 5 – CART & CHECKOUT


5.1 carts
Supports both logged-in users aur guest sessions.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Cart ID
🔗 user_id
UUID
FK → users.id, NULLABLE
Cart owner (null for guests)
session_id
VARCHAR(255)
NULLABLE
Guest session ID
currency_code
VARCHAR(3)
DEFAULT 'PKR'
Cart currency
voucher_id
UUID
NULLABLE
Applied voucher (⚠️ Missing FK to vouchers)
discount_amount
DECIMAL(12,2)
DEFAULT 0.00
Voucher discount
last_activity_at
TIMESTAMPTZ
NULLABLE
Last cart update (for abandoned cart tracking)
abandoned_email_sent
BOOLEAN
DEFAULT false
Abandoned cart email bheja gaya?
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update


5.2 cart_items

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Cart Item ID
🔗 cart_id
UUID
FK → carts.id, ON DELETE CASCADE
Cart ID
🔗 product_id
UUID
FK → products.id
Product ID
🔗 variant_id
UUID
FK → product_variants.id, NULLABLE
Selected variant
quantity
INTEGER
DEFAULT 1, CHECK > 0
Quantity
price_at_addition
DECIMAL(12,2)
NOT NULL, CHECK > 0
Price locked at add time
created_at
TIMESTAMPTZ
DEFAULT NOW()
Added date

📝 UNIQUE constraint on (cart_id, product_id, variant_id)


5.3 wishlists

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Wishlist Item ID
🔗 user_id
UUID
FK → users.id
User ID
🔗 product_id
UUID
FK → products.id, ON DELETE CASCADE
Product ID
notify_on_sale
BOOLEAN
DEFAULT false
Notify when price drops?
notify_on_restock
BOOLEAN
DEFAULT false
Notify when restocked?
created_at
TIMESTAMPTZ
DEFAULT NOW()
Added date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

📝 UNIQUE constraint on (user_id, product_id)


5.4 checkout_sessions
Step-by-step checkout state tracking.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Session ID
🔗 user_id
UUID
FK → users.id, NULLABLE
User
🔗 cart_id
UUID
FK → carts.id
Cart
session_token
VARCHAR(255)
UNIQUE
Unique checkout token
step
ENUM(CheckoutStep)
DEFAULT 'cart_review'
Current checkout step
shipping_address_id
UUID
NULLABLE
Selected shipping address (⚠️ Missing FK)
billing_address_id
UUID
NULLABLE
Selected billing address (⚠️ Missing FK)
shipping_method_id
UUID
NULLABLE
Selected shipping method (⚠️ Missing FK)
payment_method
VARCHAR(50)
NULLABLE
Selected payment method
cart_snapshot
JSONB
NULLABLE
Cart state snapshot for recovery
subtotal
DECIMAL(12,2)
DEFAULT 0.00
Items total
discount_amount
DECIMAL(12,2)
DEFAULT 0.00
Discount
tax_amount
DECIMAL(12,2)
DEFAULT 0.00
Tax
shipping_amount
DECIMAL(12,2)
DEFAULT 0.00
Shipping cost
total_amount
DECIMAL(14,2)
DEFAULT 0.00
Final total
loyalty_points_used
INTEGER
DEFAULT 0
Points redeemed
loyalty_discount
DECIMAL(12,2)
DEFAULT 0.00
Points discount value
gift_wrap_requested
BOOLEAN
DEFAULT false
Gift wrap?
gift_message
VARCHAR(500)
NULLABLE
Gift message
device_type
VARCHAR(20)
NULLABLE
mobile | desktop | tablet
ip_address
INET
NULLABLE
User IP
expires_at
TIMESTAMPTZ
NULLABLE
Session expiry
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update



📋 MODULE 6 – ORDERS


6.1 orders
Customer ke placed orders. Per-store orders (not per-seller).

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Order ID
🔗 user_id
UUID
FK → users.id
Customer ID
🔗 store_id
UUID
FK → stores.id
Store ID
order_number
VARCHAR(50)
NOT NULL, UNIQUE
ORD-20240221-001
status
ENUM(OrderStatus)
DEFAULT 'pending'
pending_payment | pending | confirmed | processing | partially_shipped | shipped | out_for_delivery | delivered | completed | cancelled | partially_cancelled | refunded | partially_refunded
currency_code
VARCHAR(3)
DEFAULT 'PKR'
Currency
subtotal
DECIMAL(12,2)
NOT NULL, CHECK > 0
Items ka total
discount_amount
DECIMAL(12,2)
DEFAULT 0.00
Voucher/promo discount
tax_amount
DECIMAL(12,2)
DEFAULT 0.00
Tax amount
shipping_amount
DECIMAL(12,2)
DEFAULT 0.00, CHECK >= 0
Shipping cost
total_amount
DECIMAL(14,2)
NOT NULL
Final payable amount
voucher_id
UUID
NULLABLE
Applied voucher ID
voucher_code
VARCHAR(50)
NULLABLE
Voucher code snapshot
shipping_address
JSONB
NOT NULL
Shipping address snapshot (immutable)
billing_address
JSONB
NULLABLE
Billing address snapshot
shipping_method
VARCHAR(100)
NULLABLE
Selected shipping method
payment_method
VARCHAR(50)
NULLABLE
cod | card | jazzcash | easypaisa | etc.
customer_notes
TEXT
NULLABLE
Customer notes
seller_notes
TEXT
NULLABLE
Seller internal notes
internal_notes
TEXT
NULLABLE
Admin internal notes
is_gift
BOOLEAN
DEFAULT false
Gift order?
gift_message
VARCHAR(500)
NULLABLE
Gift message
gift_wrap_requested
BOOLEAN
DEFAULT false
Gift wrap?
loyalty_points_earned
INTEGER
DEFAULT 0
Points earned from order
loyalty_points_used
INTEGER
DEFAULT 0
Points spent on order
loyalty_discount
DECIMAL(12,2)
DEFAULT 0.00
Points discount value
estimated_delivery_date
DATE
NULLABLE
Expected delivery
actual_delivery_date
DATE
NULLABLE
Actual delivery date
source_platform
VARCHAR(50)
DEFAULT 'web'
web | mobile_app | api
device_type
VARCHAR(20)
NULLABLE
User device type
ip_address
INET
NULLABLE
Order placement IP
placed_at
TIMESTAMPTZ
NULLABLE
Placement timestamp
confirmed_at
TIMESTAMPTZ
NULLABLE
Confirmation timestamp
shipped_at
TIMESTAMPTZ
NULLABLE
Shipping timestamp
delivered_at
TIMESTAMPTZ
NULLABLE
Delivery timestamp
cancelled_at
TIMESTAMPTZ
NULLABLE
Cancel timestamp
cancellation_reason
TEXT
NULLABLE
Cancel reason
created_at
TIMESTAMPTZ
DEFAULT NOW()
Order creation time
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: orders → user | orders → store | orders → items (OneToMany) | orders → statusHistory (OneToMany) | orders → shipments (OneToMany)


6.2 order_items
Har order ke andar products ki detail with snapshot.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Order Item ID
🔗 order_id
UUID
FK → orders.id, ON DELETE CASCADE
Order ID
🔗 product_id
UUID
FK → products.id
Product ID
🔗 variant_id
UUID
FK → product_variants.id, NULLABLE
Variant
product_snapshot
JSONB
NOT NULL
Full product data snapshot (name, image, specs)
quantity
INTEGER
NOT NULL, CHECK > 0
Quantity ordered
unit_price
DECIMAL(12,2)
NOT NULL, CHECK > 0
Price per unit at order time
original_price
DECIMAL(12,2)
NULLABLE
Original price before discount
discount_amount
DECIMAL(12,2)
DEFAULT 0.00
Item-level discount
tax_amount
DECIMAL(12,2)
DEFAULT 0.00
Item tax
total_amount
DECIMAL(12,2)
NOT NULL, CHECK > 0
Final item total
status
ENUM(OrderItemStatus)
DEFAULT 'pending'
pending | confirmed | processing | shipped | delivered | cancelled | returned | refunded | exchanged
is_gift
BOOLEAN
DEFAULT false
Gift item?
fulfilled_quantity
INTEGER
DEFAULT 0
Shipped quantity
returned_quantity
INTEGER
DEFAULT 0
Returned quantity
refunded_quantity
INTEGER
DEFAULT 0
Refunded quantity
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update


6.3 shipments

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Shipment ID
🔗 order_id
UUID
FK → orders.id, ON DELETE CASCADE
Order ID
shipment_number
VARCHAR(50)
UNIQUE
Shipment tracking number
carrier_id
UUID
NULLABLE
Carrier reference
carrier_name
VARCHAR(100)
NULLABLE
TCS, Leopards, etc.
tracking_number
VARCHAR(100)
NULLABLE
Courier tracking number
tracking_url
TEXT
NULLABLE
Track karne ki URL
status
ENUM(ShipmentStatus)
DEFAULT 'pending'
pending | processing | dispatched | in_transit | out_for_delivery | delivered | failed | returned
shipping_cost
DECIMAL(12,2)
DEFAULT 0.00
Shipping cost
weight_kg
DECIMAL(10,3)
NULLABLE
Shipment weight
dimensions
JSONB
NULLABLE
{length, width, height}
shipped_at
TIMESTAMPTZ
NULLABLE
Dispatch time
delivered_at
TIMESTAMPTZ
NULLABLE
Delivery time
estimated_delivery_at
TIMESTAMPTZ
NULLABLE
Expected delivery time
delivery_address
JSONB
NOT NULL
Delivery address snapshot
delivery_instructions
TEXT
NULLABLE
Special instructions
metadata
JSONB
NULLABLE
Extra data
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: shipments → order (ManyToOne, CASCADE) | shipments → items (OneToMany)


6.4 shipment_items

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
ID
🔗 shipment_id
UUID
FK → shipments.id, ON DELETE CASCADE
Shipment
🔗 order_item_id
UUID
FK → order_items.id
Order item
quantity
INTEGER
NOT NULL, CHECK > 0
Items in this shipment
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date


6.5 order_status_history
Order status changes ka audit trail.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
History ID
🔗 order_id
UUID
FK → orders.id, ON DELETE CASCADE
Order
previous_status
ENUM(OrderStatus)
NULLABLE
Previous status
new_status
ENUM(OrderStatus)
NOT NULL
New status
🔗 changed_by
UUID
FK → users.id, NULLABLE
Who changed
notes
TEXT
NULLABLE
Change notes
metadata
JSONB
NULLABLE
Extra data
created_at
TIMESTAMPTZ
DEFAULT NOW()
Change time


6.6 order_snapshots

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Snapshot ID
🔗 order_id
UUID
FK → orders.id, ON DELETE CASCADE
Order
snapshot_type
VARCHAR(50)
NOT NULL
Type (e.g., "creation", "payment", "shipping")
snapshot_data
JSONB
NOT NULL
Complete order state at point in time
created_at
TIMESTAMPTZ
DEFAULT NOW()
Snapshot time



💳 MODULE 7 – PAYMENTS & REFUNDS


7.1 payments

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Payment ID
🔗 order_id
UUID
FK → orders.id
Order ID
🔗 user_id
UUID
FK → users.id
Payer
payment_number
VARCHAR(50)
UNIQUE
Payment reference number
amount
DECIMAL(14,2)
NOT NULL, CHECK > 0
Payment amount
currency_code
VARCHAR(3)
DEFAULT 'PKR'
Currency
payment_method
ENUM(PaymentMethod)
NOT NULL
cod | credit_card | debit_card | jazzcash | easypaisa | bank_transfer | wallet | loyalty_points | stripe
status
ENUM(PaymentStatus)
DEFAULT 'pending'
pending | authorized | captured | paid | completed | failed | cancelled | refunded | partially_refunded
gateway_name
VARCHAR(50)
NULLABLE
Payment gateway
gateway_transaction_id
VARCHAR(255)
NULLABLE
Gateway txn ID
gateway_response
JSONB
NULLABLE
Raw gateway response
paid_at
TIMESTAMPTZ
NULLABLE
Payment success time
failed_at
TIMESTAMPTZ
NULLABLE
Failure time
failure_reason
TEXT
NULLABLE
Failure reason
refunded_amount
DECIMAL(14,2)
DEFAULT 0.00
Total refunded from this payment
metadata
JSONB
NULLABLE
Extra data
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: payments → order | payments → user | payments → attempts (OneToMany)


7.2 refunds

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Refund ID
🔗 payment_id
UUID
FK → payments.id
Source payment
refund_number
VARCHAR(50)
UNIQUE
Refund reference
amount
DECIMAL(14,2)
NOT NULL, CHECK > 0
Refund amount
reason
ENUM(RefundReason)
NULLABLE
Predefined reason
reason_details
TEXT
NULLABLE
Additional details
status
ENUM(RefundStatus)
DEFAULT 'pending'
pending | requested | approved | rejected | processing | processed | completed | failed
gateway_refund_id
VARCHAR(255)
NULLABLE
Gateway refund ID
gateway_response
JSONB
NULLABLE
Gateway response
🔗 processed_by
UUID
FK → users.id, NULLABLE
Processing admin
processed_at
TIMESTAMPTZ
NULLABLE
Process time
metadata
JSONB
NULLABLE
Extra data
created_at
TIMESTAMPTZ
DEFAULT NOW()
Request date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update


7.3 payment_attempts

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Attempt ID
🔗 payment_id
UUID
FK → payments.id, ON DELETE CASCADE
Payment
attempt_number
INTEGER
NOT NULL, CHECK > 0
Attempt sequence
status
ENUM(PaymentAttemptStatus)
DEFAULT 'initiated'
initiated | processing | success | failed
gateway_name
VARCHAR(50)
NULLABLE
Gateway used
gateway_request
JSONB
NULLABLE
Request payload
gateway_response
JSONB
NULLABLE
Response payload
error_code
VARCHAR(50)
NULLABLE
Error code
error_message
TEXT
NULLABLE
Error detail
ip_address
INET
NULLABLE
User IP
user_agent
TEXT
NULLABLE
Browser info
created_at
TIMESTAMPTZ
DEFAULT NOW()
Attempt time


7.4 saved_payment_methods

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Method ID
🔗 user_id
UUID
FK → users.id
User
payment_method
VARCHAR(50)
NULLABLE
Method type (⚠️ should be enum)
nickname
VARCHAR(100)
NULLABLE
User-friendly name
is_default
BOOLEAN
DEFAULT false
Default method?
gateway_token
VARCHAR(255)
NULLABLE
Tokenized payment ref (⚠️ should be encrypted)
card_last_four
VARCHAR(4)
NULLABLE
Last 4 digits
card_brand
VARCHAR(20)
NULLABLE
Visa, Mastercard, etc.
card_expiry_month
INTEGER
NULLABLE, CHECK 1-12
Expiry month
card_expiry_year
INTEGER
NULLABLE
Expiry year
bank_name
VARCHAR(100)
NULLABLE
Bank name
account_last_four
VARCHAR(4)
NULLABLE
Bank account last 4
wallet_provider
VARCHAR(50)
NULLABLE
JazzCash, Easypaisa
wallet_id
VARCHAR(255)
NULLABLE
Wallet identifier
metadata
JSONB
NULLABLE
Extra data
expires_at
TIMESTAMPTZ
NULLABLE
Token expiry
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update



⭐ MODULE 8 – REVIEWS & RATINGS


8.1 reviews
Reviews with moderation workflow, pros/cons support, aur seller response.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Review ID
🔗 product_id
UUID
FK → products.id
Product ID
🔗 user_id
UUID
FK → users.id
Customer ID
🔗 order_id
UUID
FK → orders.id, NULLABLE
Verify purchase
rating
INTEGER
NOT NULL, CHECK (1-5)
Star rating
title
VARCHAR(255)
NULLABLE
Review heading
content
TEXT
NULLABLE
Review text
pros
TEXT[]
DEFAULT '{}'
Positive points
cons
TEXT[]
DEFAULT '{}'
Negative points
images
TEXT[]
DEFAULT '{}'
Review image URLs
is_verified_purchase
BOOLEAN
DEFAULT true
Purchase verified
status
ENUM(ReviewStatus)
DEFAULT 'pending'
pending | approved | rejected | flagged
helpful_count
INTEGER
DEFAULT 0
Helpful votes (denormalized)
not_helpful_count
INTEGER
DEFAULT 0
Not helpful votes (denormalized)
seller_response
TEXT
NULLABLE
Seller ka jawab
seller_response_at
TIMESTAMPTZ
NULLABLE
Reply time
🔗 moderated_by
UUID
FK → users.id, NULLABLE
Moderator
moderated_at
TIMESTAMPTZ
NULLABLE
Moderation time
moderation_notes
TEXT
NULLABLE
Moderation notes
created_at
TIMESTAMPTZ
DEFAULT NOW()
Review date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

📝 UNIQUE constraint on (user_id, product_id) – ek user ek product par sirf ek review
🔗 Relations: reviews → product | reviews → user | reviews → order | reviews → helpfulness (OneToMany) | reviews → reports (OneToMany)


8.2 review_helpfulness

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Vote ID
🔗 review_id
UUID
FK → reviews.id, ON DELETE CASCADE
Review
🔗 user_id
UUID
FK → users.id
Voter
is_helpful
BOOLEAN
NOT NULL
Helpful ya not helpful
created_at
TIMESTAMPTZ
DEFAULT NOW()
Vote time

📝 UNIQUE constraint on (review_id, user_id)


8.3 review_reports

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Report ID
🔗 review_id
UUID
FK → reviews.id, ON DELETE CASCADE
Reported review
🔗 reported_by
UUID
FK → users.id
Reporter
reason
ENUM(ReviewReportReason)
NOT NULL
Report reason
details
TEXT
NULLABLE
Additional details
status
ENUM(ReviewReportStatus)
DEFAULT 'pending'
pending | reviewed | dismissed | action_taken
🔗 reviewed_by
UUID
FK → users.id, NULLABLE
Reviewing admin
reviewed_at
TIMESTAMPTZ
NULLABLE
Review time
resolution_notes
TEXT
NULLABLE
Resolution details
created_at
TIMESTAMPTZ
DEFAULT NOW()
Report date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update



🎯 MODULE 9 – MARKETING


9.1 vouchers

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Voucher ID
code
VARCHAR(50)
NOT NULL, UNIQUE
Coupon code e.g. EID20
name
VARCHAR(200)
NULLABLE
Display name
description
TEXT
NULLABLE
Description
🔗 seller_id
UUID
FK → sellers.id, NULLABLE
Seller-specific voucher (null = platform)
type
ENUM(VoucherType)
NOT NULL
percentage | fixed | free_shipping
discount_value
DECIMAL(12,2)
NOT NULL
% ya fixed amount
min_order_amount
DECIMAL(12,2)
DEFAULT 0.00
Minimum order required
max_discount
DECIMAL(12,2)
NULLABLE
Max discount cap
applicable_to
ENUM(VoucherScope)
DEFAULT 'all'
all | category | product | brand
applicable_ids
JSONB
NULLABLE
Category/product IDs (⚠️ better to use voucher_products)
total_limit
INTEGER
NULLABLE
Total uses allowed
per_user_limit
INTEGER
DEFAULT 1
Per user use limit
used_count
INTEGER
DEFAULT 0
Total times used (denormalized)
first_order_only
BOOLEAN
DEFAULT false
Only for first-time buyers?
stackable
BOOLEAN
DEFAULT false
Can combine with others?
display_on_store
BOOLEAN
DEFAULT true
Show on store page?
currency_code
VARCHAR(3)
DEFAULT 'PKR'
Currency
starts_at
TIMESTAMPTZ
NOT NULL
Validity start
expires_at
TIMESTAMPTZ
NOT NULL
Validity end
is_active
BOOLEAN
DEFAULT true
Active hai?
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: vouchers → seller | vouchers → conditions (OneToMany) | vouchers → products (OneToMany) | vouchers → usages (OneToMany)


9.2 voucher_usages

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Usage ID
🔗 voucher_id
UUID
FK → vouchers.id
Voucher ID
🔗 user_id
UUID
FK → users.id
User ID
🔗 order_id
UUID
FK → orders.id
Order ID
discount_applied
DECIMAL(12,2)
NOT NULL
Applied discount
used_at
TIMESTAMPTZ
DEFAULT NOW()
Usage time


9.3 voucher_conditions
Flexible voucher conditions (JSON-based rules).

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Condition ID
🔗 voucher_id
UUID
FK → vouchers.id, ON DELETE CASCADE
Voucher
condition_type
VARCHAR(50)
NOT NULL
Condition type (⚠️ should be enum)
condition_value
JSONB
NOT NULL
Condition parameters
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date


9.4 voucher_products
Voucher ke applicable products/categories/brands.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
ID
🔗 voucher_id
UUID
FK → vouchers.id, ON DELETE CASCADE
Voucher
🔗 product_id
UUID
FK → products.id, NULLABLE, ON DELETE CASCADE
Specific product
🔗 category_id
UUID
FK → categories.id, NULLABLE, ON DELETE CASCADE
Specific category
🔗 brand_id
UUID
FK → brands.id, NULLABLE, ON DELETE CASCADE
Specific brand

⚠️ No CHECK constraint ensuring at least one of product/category/brand is set


9.5 campaigns

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Campaign ID
name
VARCHAR(200)
NOT NULL
Campaign naam
slug
VARCHAR(200)
NULLABLE, UNIQUE
URL slug
description
TEXT
NULLABLE
Description
type
ENUM(CampaignType)
DEFAULT 'seasonal'
seasonal | clearance | holiday | flash | etc.
banner_url
VARCHAR(500)
NULLABLE
Desktop banner image
mobile_banner_url
VARCHAR(500)
NULLABLE
Mobile banner image
thumbnail_url
VARCHAR(500)
NULLABLE
Thumbnail image
discount_percentage
DECIMAL(5,2)
NULLABLE
Campaign-wide discount %
starts_at
TIMESTAMPTZ
NOT NULL
Start time
ends_at
TIMESTAMPTZ
NOT NULL
End time
is_active
BOOLEAN
DEFAULT true
Active hai?
is_featured
BOOLEAN
DEFAULT false
Featured?
meta_title
VARCHAR(255)
NULLABLE
SEO title
meta_description
VARCHAR(500)
NULLABLE
SEO description
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: campaigns → products (OneToMany)


9.6 campaign_products

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
ID
🔗 campaign_id
UUID
FK → campaigns.id, ON DELETE CASCADE
Campaign ID
🔗 product_id
UUID
FK → products.id, ON DELETE CASCADE
Product ID
sale_price
DECIMAL(12,2)
NULLABLE
Campaign specific price
discount_percentage
DECIMAL(5,2)
NULLABLE
Product-level discount %
stock_limit
INTEGER
NULLABLE
Limited stock for campaign
sold_count
INTEGER
DEFAULT 0
Sold count (denormalized)
sort_order
INTEGER
DEFAULT 0
Display order

📝 UNIQUE on (campaign_id, product_id)


9.7 flash_sales

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Flash Sale ID
name
VARCHAR(200)
NOT NULL
Sale naam
slug
VARCHAR(200)
NULLABLE, UNIQUE
URL slug
description
TEXT
NULLABLE
Description
banner_url
VARCHAR(500)
NULLABLE
Banner image
starts_at
TIMESTAMPTZ
NOT NULL
Sale start time
ends_at
TIMESTAMPTZ
NOT NULL
Sale end time
is_active
BOOLEAN
DEFAULT true
Active hai?
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: flash_sales → products (OneToMany)


9.8 flash_sale_products

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
ID
🔗 flash_sale_id
UUID
FK → flash_sales.id, ON DELETE CASCADE
Flash sale
🔗 product_id
UUID
FK → products.id, ON DELETE CASCADE
Product
variant_id
UUID
NULLABLE
Variant (⚠️ Missing FK to product_variants)
sale_price
DECIMAL(12,2)
NOT NULL
Flash sale price
original_price
DECIMAL(12,2)
NOT NULL
Original price
stock_limit
INTEGER
NOT NULL
Limited stock
sold_count
INTEGER
DEFAULT 0
Sold count (denormalized)
per_user_limit
INTEGER
DEFAULT 1
Max per user
sort_order
INTEGER
DEFAULT 0
Display order

📝 UNIQUE on (flash_sale_id, product_id)



🔔 MODULE 10 – NOTIFICATIONS


10.1 notifications
Multi-channel notification system.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Notification ID
🔗 user_id
UUID
FK → users.id
Target user
type
ENUM(NotificationType)
NOT NULL
order_placed | shipped | review | promo | etc.
channel
ENUM(NotificationChannel)
NOT NULL
email | sms | push | in_app
title
VARCHAR(255)
NOT NULL
Notification heading
body
TEXT
NOT NULL
Full message
data
JSONB
NULLABLE
Extra data {order_id, etc.}
status
ENUM(NotificationStatus)
DEFAULT 'pending'
pending | sent | delivered | failed | read
read_at
TIMESTAMPTZ
NULLABLE
Read time
sent_at
TIMESTAMPTZ
NULLABLE
Send time
error_message
TEXT
NULLABLE
Delivery error
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation time


10.2 notification_preferences
User ke per-channel notification settings.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Preference ID
🔗 user_id
UUID
FK → users.id
User
type
VARCHAR(50)
NULLABLE
Notification type (⚠️ should be enum)
channel
ENUM(NotificationChannel)
NOT NULL
Channel
is_enabled
BOOLEAN
DEFAULT true
Enabled?
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

📝 UNIQUE constraint on (user_id, type, channel)


10.3 notification_templates
Notification templates for consistent messaging.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Template ID
code
VARCHAR(100)
UNIQUE
Template code (e.g., "ORDER_PLACED")
name
VARCHAR(255)
NOT NULL
Template name
type
VARCHAR(50)
NULLABLE
Template type (⚠️ should be enum)
channels
NotificationChannel[]
DEFAULT '{}'
Applicable channels
subject
VARCHAR(255)
NULLABLE
Email subject
body
TEXT
NULLABLE
Plain text body
html_body
TEXT
NULLABLE
HTML email body
sms_body
VARCHAR(160)
NULLABLE
SMS body (160 char limit)
push_title
VARCHAR(100)
NULLABLE
Push notification title
push_body
VARCHAR(255)
NULLABLE
Push notification body
variables
TEXT[]
DEFAULT '{}'
Template variables list
is_active
BOOLEAN
DEFAULT true
Active?
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update



⚡ DATABASE INDEXES – Performance Optimization


Table
Column(s)
Reason
users
email (partial unique WHERE deleted_at IS NULL)
Fast login lookup with soft delete support
users
role
Role filter ke liye
users
phone, referral_code, created_at
Search and sort
products
slug (unique), name (trigram + tsvector GIN)
Full-text and fuzzy search
products
(seller_id, status, created_at DESC)
Seller product listing
products
(category_id, status), (brand_id, status)
Category/brand browse
products
avg_rating DESC, total_sales DESC
Top rated/selling
products
tags (GIN index)
Tag-based search
product_variants
sku (unique)
SKU lookup
orders
(user_id, created_at DESC)
Customer order history
orders
status, order_number
Status filter and order lookup
orders
(payment_method, status)
Payment analytics
order_items
order_id, product_id, seller_id, status
Order item queries
order_status_history
(order_id, created_at DESC)
Order audit trail
sessions
(user_id, expires_at), is_valid
Session validation
login_history
(user_id, login_at DESC)
Login audit
reviews
(product_id, status)
Product reviews
vouchers
code
Coupon validation
stores
slug (unique), seller_id
Store lookup
stores
name (trigram search)
Store search
wallet_transactions
(wallet_id, created_at DESC)
Wallet history
payments
order_id, (status, created_at), gateway_transaction_id
Payment queries
refunds
order_id, user_id, (status, created_at)
Refund queries
carts
user_id, session_id
Cart lookup
wishlists
(user_id, created_at DESC)
Wishlist listing
checkout_sessions
(user_id, created_at DESC), step
Checkout tracking



🔗 ENTITY RELATIONSHIPS SUMMARY


Relation
Type
Description
users → sellers
OneToOne
Har user sirf ek seller account rakh sakta
sellers → stores
OneToMany
Seller ke multiple stores (⚠️ doc originally said OneToOne)
sellers → wallet
OneToOne
Har seller ka ek wallet
sellers → documents
OneToMany
Multiple KYC documents
sellers → violations
OneToMany
Violation records
stores → followers
OneToMany
Store followers
categories → categories
Self ManyToOne
Parent/child hierarchy
categories → products
OneToMany
Category mein multiple products
categories → attributes
ManyToMany via junction
Category-specific attributes
brands → categories
ManyToMany via junction
Brand-category mapping
products → variants
OneToMany
Product ke multiple variants
products → images
OneToMany
Product ki multiple images
products → attributes
OneToMany
Product attribute values
products → questions
OneToMany
Product Q&A
users → carts
OneToMany
User ke carts (nullable for guests)
carts → cart_items
OneToMany
Cart mein multiple items
users → orders
OneToMany
User ke multiple orders
orders → order_items
OneToMany
Order mein multiple products
orders → shipments
OneToMany
Order ke multiple shipments
orders → statusHistory
OneToMany
Status change audit trail
shipments → shipment_items
OneToMany
Items per shipment
orders → payments
OneToMany
Multiple payment attempts possible
payments → attempts
OneToMany
Payment retry history
payments → refunds
OneToMany
Payment se refunds
products → reviews
OneToMany
Product ki multiple reviews
reviews → helpfulness
OneToMany
Helpful/not helpful votes
reviews → reports
OneToMany
Abuse reports
vouchers → usages
OneToMany
Usage tracking
vouchers → conditions
OneToMany
Flexible conditions
vouchers → products
OneToMany
Applicable items
campaigns → products
OneToMany
Campaign products
flash_sales → products
OneToMany
Flash sale products
sellers → wallet → transactions
OneToMany
Wallet ki multiple transactions
users → roles
ManyToMany via junction
User role assignments
roles → permissions
OneToMany
Role permissions
users → notifications
OneToMany
User notifications



📦 MODULE 11 – INVENTORY


11.1 inventory
Warehouse-level stock tracking. Per product/variant per warehouse.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Inventory record ID
🔗 product_id
UUID
FK → products.id, NOT NULL
Product
🔗 product_variant_id
UUID
FK → product_variants.id, NULLABLE
Variant (null = parent product)
🔗 warehouse_id
UUID
FK → warehouses.id, NOT NULL
Warehouse
quantity_on_hand
INTEGER
DEFAULT 0
Physical stock count
quantity_reserved
INTEGER
DEFAULT 0
Reserved for orders
quantity_available
INTEGER
DEFAULT 0
Available stock (⚠️ denormalized, should = on_hand - reserved)
low_stock_threshold
INTEGER
DEFAULT 10
Alert threshold
reorder_point
INTEGER
NULLABLE
Auto-reorder level
reorder_quantity
INTEGER
NULLABLE
Auto-reorder quantity
last_restocked_at
TIMESTAMPTZ
NULLABLE
Last restock time
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

📝 UNIQUE constraint on (product_id, product_variant_id, warehouse_id)
⚠️ Dual stock management: products.stock AND inventory module both exist — pick one source of truth


11.2 warehouses

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Warehouse ID
🔗 seller_id
UUID
FK → sellers.id, NULLABLE
Seller-specific warehouse
name
VARCHAR(100)
NOT NULL
Warehouse naam
code
VARCHAR(20)
UNIQUE
Warehouse code
address_line1
VARCHAR(200)
NULLABLE
Address line 1
address_line2
VARCHAR(200)
NULLABLE
Address line 2
city
VARCHAR(100)
NULLABLE
City
state
VARCHAR(100)
NULLABLE
State/Province
postal_code
VARCHAR(20)
NULLABLE
Postal code
country_code
VARCHAR(3)
DEFAULT 'PK'
ISO country code
latitude
DECIMAL(10,7)
NULLABLE
GPS latitude
longitude
DECIMAL(10,7)
NULLABLE
GPS longitude
contact_name
VARCHAR(100)
NULLABLE
Contact person
contact_phone
VARCHAR(20)
NULLABLE
Contact phone
contact_email
VARCHAR(150)
NULLABLE
Contact email
is_active
BOOLEAN
DEFAULT true
Active?
is_default
BOOLEAN
DEFAULT false
Default warehouse?
priority
INTEGER
DEFAULT 0
Fulfillment priority
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: warehouses.seller_id → sellers.id | warehouses → inventory (OneToMany)


11.3 stock_movements
Stock in/out ka audit trail.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Movement ID
🔗 inventory_id
UUID
FK → inventory.id, NOT NULL
Inventory record
type
ENUM(StockMovementType)
NOT NULL
in | out | adjustment | transfer | return | damage | correction
quantity
INTEGER
NOT NULL
Movement quantity
quantity_before
INTEGER
NOT NULL
Stock before movement
quantity_after
INTEGER
NOT NULL
Stock after movement
reference_type
VARCHAR(50)
NULLABLE
Source type (order, transfer, etc.)
reference_id
UUID
NULLABLE
Source entity ID
cost_per_unit
DECIMAL(12,2)
NULLABLE
Cost per unit
note
TEXT
NULLABLE
Movement note
🔗 created_by
UUID
FK → users.id, NULLABLE
Who created
created_at
TIMESTAMPTZ
DEFAULT NOW()
Movement date

🔗 Relations: stock_movements.inventory_id → inventory.id | stock_movements.created_by → users.id


11.4 stock_reservations

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Reservation ID
🔗 inventory_id
UUID
FK → inventory.id, NOT NULL
Inventory record
🔗 product_id
UUID
FK → products.id, NOT NULL
Product
order_id
UUID
NULLABLE
Order (⚠️ Missing FK constraint)
cart_id
UUID
NULLABLE
Cart (⚠️ Missing FK constraint)
quantity
INTEGER
NOT NULL
Reserved quantity
status
ENUM(ReservationStatus)
DEFAULT 'held'
held | committed | released | expired
expires_at
TIMESTAMPTZ
NULLABLE
Reservation expiry
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

⚠️ Missing CHECK constraint: exactly one of order_id or cart_id should be non-null


11.5 inventory_transfers

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Transfer ID
transfer_number
VARCHAR(50)
UNIQUE
Transfer reference
🔗 from_warehouse_id
UUID
FK → warehouses.id, NOT NULL
Source warehouse
🔗 to_warehouse_id
UUID
FK → warehouses.id, NOT NULL
Destination warehouse
status
ENUM(TransferStatus)
DEFAULT 'pending'
pending | approved | shipped | completed | cancelled
notes
TEXT
NULLABLE
Transfer notes
🔗 initiated_by
UUID
FK → users.id, NOT NULL
Initiator
🔗 approved_by
UUID
FK → users.id, NULLABLE
Approver
approved_at
TIMESTAMPTZ
NULLABLE
Approval time
shipped_at
TIMESTAMPTZ
NULLABLE
Shipping time
completed_at
TIMESTAMPTZ
NULLABLE
Completion time (⚠️ entity field is receivedAt but column is completed_at)
cancelled_at
TIMESTAMPTZ
NULLABLE
Cancellation time
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: transfers → from_warehouse | transfers → to_warehouse | transfers → items (OneToMany)


11.6 inventory_transfer_items

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Item ID
🔗 transfer_id
UUID
FK → inventory_transfers.id, ON DELETE CASCADE
Parent transfer
🔗 product_id
UUID
FK → products.id, NOT NULL
Product
🔗 product_variant_id
UUID
FK → product_variants.id, NULLABLE
Variant
quantity_requested
INTEGER
NOT NULL
Requested quantity
quantity_shipped
INTEGER
NULLABLE
Shipped quantity
quantity_received
INTEGER
NULLABLE
Received quantity



↩️ MODULE 12 – RETURNS


12.1 return_requests

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Return ID
return_number
VARCHAR(50)
UNIQUE
Return reference number
🔗 order_id
UUID
FK → orders.id, NOT NULL
Order
🔗 order_item_id
UUID
FK → order_items.id, NOT NULL
Specific order item
🔗 user_id
UUID
FK → users.id, NOT NULL
Customer
🔗 reason_id
UUID
FK → return_reasons.id, NULLABLE
Predefined reason
reason_details
TEXT
NULLABLE
Additional details
type
ENUM(ReturnType)
NOT NULL
return | exchange | repair
status
ENUM(ReturnStatus)
DEFAULT 'requested'
requested | approved | rejected | processing | shipped | received | refunded | completed | cancelled
quantity
INTEGER
NOT NULL
Return quantity
refund_amount
DECIMAL(14,2)
NULLABLE
Approved refund amount
resolution
ENUM(ReturnResolution)
NULLABLE
refund | exchange | repair | store_credit
reviewed_by
UUID
NULLABLE
Review admin (⚠️ Missing FK to users)
reviewed_at
TIMESTAMPTZ
NULLABLE
Review time
reviewer_notes
TEXT
NULLABLE
Admin notes
customer_notes
TEXT
NULLABLE
Customer notes
received_at
TIMESTAMPTZ
NULLABLE
Return received time
completed_at
TIMESTAMPTZ
NULLABLE
Completion time
created_at
TIMESTAMPTZ
DEFAULT NOW()
Request date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: return_requests → order | return_requests → order_item | return_requests → user | return_requests → reason | return_requests → images (OneToMany) | return_requests → shipments (OneToMany)


12.2 return_reasons

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Reason ID
reason_text
VARCHAR(100)
NOT NULL
Reason naam (⚠️ entity field is name but column is reason_text)
description
TEXT
NULLABLE
Detailed description
is_active
BOOLEAN
DEFAULT true
Active?
requires_image
BOOLEAN
DEFAULT false
Image required? (⚠️ entity field is requiresImages but column is requires_image)
sort_order
INTEGER
DEFAULT 0
Display order
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update


12.3 return_images

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Image ID
🔗 return_request_id
UUID
FK → return_requests.id, ON DELETE CASCADE
Return request
image_url
TEXT
NOT NULL
Image URL
description
TEXT
NULLABLE
Image description
sort_order
INTEGER
DEFAULT 0
Display order
created_at
TIMESTAMPTZ
DEFAULT NOW()
Upload date


12.4 return_shipments
Return pickup aur delivery tracking.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Shipment ID
🔗 return_request_id
UUID
FK → return_requests.id, ON DELETE CASCADE
Return request
direction
ENUM(ReturnShipmentDirection)
NOT NULL
customer_to_warehouse | warehouse_to_customer
carrier_name
VARCHAR(100)
NULLABLE
Carrier naam
tracking_number
VARCHAR(100)
NULLABLE
Tracking number
tracking_url
TEXT
NULLABLE
Tracking URL
status
ENUM(ReturnShipmentStatus)
DEFAULT 'pending'
pending | shipped | in_transit | delivered | failed
shipped_at
TIMESTAMPTZ
NULLABLE
Ship time
delivered_at
TIMESTAMPTZ
NULLABLE
Delivery time
notes
TEXT
NULLABLE
Shipment notes
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update



🎁 MODULE 13 – BUNDLES


13.1 product_bundles

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Bundle ID
name
VARCHAR(200)
NOT NULL
Bundle naam
slug
VARCHAR(200)
UNIQUE
URL slug
description
TEXT
NULLABLE
Description
image_url
VARCHAR(500)
NULLABLE
Bundle image
discount_type
ENUM(VoucherType)
DEFAULT 'percentage'
percentage | fixed
discount_value
DECIMAL(12,2)
NOT NULL
Discount amount
bundle_price
DECIMAL(14,2)
NULLABLE
Final bundle price (⚠️ denormalized)
original_total_price
DECIMAL(14,2)
NULLABLE
Sum of individual prices (⚠️ denormalized)
starts_at
TIMESTAMPTZ
NULLABLE
Bundle availability start
ends_at
TIMESTAMPTZ
NULLABLE
Bundle availability end
is_active
BOOLEAN
DEFAULT true
Active?
🔗 seller_id
UUID
FK → sellers.id, NULLABLE
Seller
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: product_bundles → items (OneToMany) | product_bundles → seller (ManyToOne)


13.2 bundle_items

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Item ID
🔗 bundle_id
UUID
FK → product_bundles.id, ON DELETE CASCADE
Parent bundle
🔗 product_id
UUID
FK → products.id, ON DELETE CASCADE
Product
🔗 variant_id
UUID
FK → product_variants.id, NULLABLE
Specific variant
quantity
INTEGER
DEFAULT 1
Quantity in bundle
sort_order
INTEGER
DEFAULT 0
Display order

📝 UNIQUE constraint on (bundle_id, product_id, variant_id)



🔄 MODULE 14 – SUBSCRIPTIONS


14.1 subscriptions
Recurring product delivery subscriptions.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Subscription ID
🔗 user_id
UUID
FK → users.id, NOT NULL
Subscriber
🔗 product_id
UUID
FK → products.id, NOT NULL
Product
🔗 variant_id
UUID
FK → product_variants.id, NULLABLE
Variant
quantity
INTEGER
DEFAULT 1
Delivery quantity
frequency
ENUM(SubscriptionFrequency)
NOT NULL
weekly | biweekly | monthly | bimonthly | quarterly
🔗 delivery_address_id
UUID
FK → addresses.id, NOT NULL
Delivery address
🔗 payment_method_id
UUID
FK → saved_payment_methods.id, NULLABLE
Payment method
unit_price
DECIMAL(12,2)
NOT NULL
Per-unit price
discount_percentage
DECIMAL(5,2)
DEFAULT 0
Subscription discount %
next_delivery_date
DATE
NOT NULL
Next scheduled delivery
last_order_date
DATE
NULLABLE
Last order created
status
ENUM(SubscriptionStatus)
DEFAULT 'active'
active | paused | cancelled | expired
paused_at
TIMESTAMPTZ
NULLABLE
Pause timestamp (⚠️ no mutual exclusion with cancelledAt)
cancelled_at
TIMESTAMPTZ
NULLABLE
Cancel timestamp
cancellation_reason
TEXT
NULLABLE
Cancel reason
total_orders
INTEGER
DEFAULT 0
Total orders (denormalized)
total_spent
DECIMAL(14,2)
DEFAULT 0
Total spent (denormalized)
stripe_subscription_id
VARCHAR(255)
NULLABLE
Stripe subscription ID
stripe_customer_id
VARCHAR(255)
NULLABLE
Stripe customer ID
stripe_price_id
VARCHAR(255)
NULLABLE
Stripe price ID
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: subscriptions → user | subscriptions → product | subscriptions → variant | subscriptions → address | subscriptions → payment_method | subscriptions → subscription_orders (OneToMany)


14.2 subscription_orders

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Record ID
🔗 subscription_id
UUID
FK → subscriptions.id, ON DELETE CASCADE
Subscription
🔗 order_id
UUID
FK → orders.id, NULLABLE
Generated order
scheduled_date
DATE
NOT NULL
Scheduled delivery date
actual_date
DATE
NULLABLE
Actual delivery date
status
VARCHAR(30)
DEFAULT 'scheduled'
(⚠️ Should be ENUM: scheduled | processing | completed | failed | skipped)
failure_reason
TEXT
NULLABLE
Failure reason
retry_count
SMALLINT
DEFAULT 0
Retry attempts
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date



⚖️ MODULE 15 – DISPUTES


15.1 disputes
Order disputes between customer and seller.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Dispute ID
dispute_number
VARCHAR(50)
UNIQUE
Dispute reference
🔗 order_id
UUID
FK → orders.id, NOT NULL
Related order
🔗 opened_by
UUID
FK → users.id, NOT NULL
Customer who opened
🔗 against_user_id
UUID
FK → users.id, NOT NULL
Seller against dispute
type
ENUM(DisputeType)
NOT NULL
item_not_received | item_not_as_described | counterfeit | defective | wrong_item | overcharged
status
ENUM(DisputeStatus)
DEFAULT 'open'
open | under_review | escalated | resolved | closed | cancelled
subject
VARCHAR(255)
NOT NULL
Dispute subject
description
TEXT
NOT NULL
Dispute details
disputed_amount
DECIMAL(14,2)
NULLABLE
Disputed amount
resolution
ENUM(DisputeResolution)
NULLABLE
refund | partial_refund | replacement | seller_favor | buyer_favor
resolution_note
TEXT
NULLABLE
Resolution notes
resolution_amount
DECIMAL(14,2)
NULLABLE
Resolved amount
🔗 assigned_admin_id
UUID
FK → users.id, NULLABLE
Assigned admin
escalated_at
TIMESTAMPTZ
NULLABLE
Escalation time
resolved_at
TIMESTAMPTZ
NULLABLE
Resolution time
🔗 resolved_by
UUID
FK → users.id, NULLABLE
Resolving admin
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: disputes → order | disputes → opener (user) | disputes → against (user) | disputes → admin | disputes → resolver | disputes → messages (OneToMany) | disputes → evidence (OneToMany)


15.2 dispute_evidence

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Evidence ID
🔗 dispute_id
UUID
FK → disputes.id, ON DELETE CASCADE
Dispute
🔗 submitted_by
UUID
FK → users.id, NOT NULL
Submitter
type
VARCHAR(50)
NOT NULL
Evidence type (⚠️ should be enum)
file_url
TEXT
NULLABLE
File URL
description
TEXT
NULLABLE
Evidence description
created_at
TIMESTAMPTZ
DEFAULT NOW()
Upload date


15.3 dispute_messages

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Message ID
🔗 dispute_id
UUID
FK → disputes.id, ON DELETE CASCADE
Dispute
🔗 sender_id
UUID
FK → users.id, NOT NULL
Message sender
message
TEXT
NOT NULL
Message content
is_internal
BOOLEAN
DEFAULT false
Admin internal note?
attachments
JSONB
NULLABLE
File attachments
read_at
TIMESTAMPTZ
NULLABLE
Read time
created_at
TIMESTAMPTZ
DEFAULT NOW()
Send time



🏷️ MODULE 16 – TAX


16.1 tax_classes

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Tax Class ID
name
VARCHAR(100)
NOT NULL
Tax class (Standard, Reduced, Zero)
description
TEXT
NULLABLE
Description
is_default
BOOLEAN
DEFAULT false
Default tax class?
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: tax_classes → tax_rates (OneToMany)


16.2 tax_zones

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Tax Zone ID
name
VARCHAR(100)
NOT NULL
Zone naam
country_code
VARCHAR(3)
NOT NULL
ISO country code
state_code
VARCHAR(10)
NULLABLE
State/Province code
city
VARCHAR(100)
NULLABLE
City
postal_code_pattern
VARCHAR(50)
NULLABLE
Regex pattern for postal codes
is_active
BOOLEAN
DEFAULT true
Active?
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date

🔗 Relations: tax_zones → tax_rates (OneToMany)


16.3 tax_rates
Tax class + zone = specific rate.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Rate ID
🔗 tax_class_id
UUID
FK → tax_classes.id, ON DELETE CASCADE
Tax class
🔗 tax_zone_id
UUID
FK → tax_zones.id, ON DELETE CASCADE
Tax zone
name
VARCHAR(100)
NOT NULL
Rate naam (e.g., "Punjab GST 17%")
rate
DECIMAL(5,2)
NOT NULL
Tax rate percentage
priority
INTEGER
DEFAULT 0
Calculation priority
is_compound
BOOLEAN
DEFAULT false
Compound tax?
is_shipping
BOOLEAN
DEFAULT false
Applies to shipping?
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

📝 UNIQUE constraint on (tax_class_id, tax_zone_id)


16.4 order_tax_lines
Per-order tax breakdown.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Tax Line ID
🔗 order_id
UUID
FK → orders.id, ON DELETE CASCADE
Order
🔗 tax_rate_id
UUID
FK → tax_rates.id, NULLABLE
Applied tax rate
tax_name
VARCHAR(100)
NOT NULL
Tax naam snapshot
tax_rate_value
DECIMAL(5,2)
NOT NULL
Rate % snapshot
taxable_amount
DECIMAL(12,2)
NOT NULL
Taxable base
tax_amount
DECIMAL(12,2)
NOT NULL
Calculated tax
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date



🚚 MODULE 17 – SHIPPING


17.1 shipping_carriers

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Carrier ID
name
VARCHAR(100)
NOT NULL
TCS, Leopards, etc.
code
VARCHAR(50)
NOT NULL, UNIQUE
Carrier code
logo
TEXT
NULLABLE
Carrier logo URL
tracking_url_template
TEXT
NULLABLE
Template URL with {tracking_number}
is_active
BOOLEAN
DEFAULT true
Active?
settings
JSONB
NULLABLE
Carrier-specific config
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update


17.2 shipping_methods

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Method ID
name
VARCHAR(100)
NOT NULL
Standard, Express, etc.
code
VARCHAR(50)
NOT NULL, UNIQUE
Method code
type
ENUM(ShippingMethodType)
DEFAULT 'standard'
standard | express | same_day | overnight | economy | freight
description
TEXT
NULLABLE
Method description
is_active
BOOLEAN
DEFAULT true
Active?
sort_order
INTEGER
DEFAULT 0
Display order
estimated_days_min
INTEGER
NULLABLE
Min delivery days
estimated_days_max
INTEGER
NULLABLE
Max delivery days
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
NULLABLE
Last update

🔗 Relations: shipping_methods → rates (OneToMany)


17.3 shipping_zones

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Zone ID
name
VARCHAR(100)
NOT NULL
Zone naam
description
TEXT
NULLABLE
Description
countries
VARCHAR(2)[]
DEFAULT '{}'
ISO country codes array
states
VARCHAR(100)[]
DEFAULT '{}'
State/Province names
postcodes
VARCHAR(20)[]
DEFAULT '{}'
Postal code patterns
is_default
BOOLEAN
DEFAULT false
Default zone?
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: shipping_zones → rates (OneToMany)


17.4 shipping_rates
Shipping method + zone = specific rate.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Rate ID
🔗 shipping_method_id
UUID
FK → shipping_methods.id, ON DELETE CASCADE
Method
🔗 shipping_zone_id
UUID
FK → shipping_zones.id, ON DELETE CASCADE
Zone
rate_type
ENUM(ShippingRateType)
DEFAULT 'flat'
flat | weight_based | item_based | tiered
base_rate
DECIMAL(12,2)
NOT NULL
Base shipping cost
per_kg_rate
DECIMAL(12,2)
NULLABLE
Rate per kg (for weight_based)
per_item_rate
DECIMAL(12,2)
NULLABLE
Rate per item (for item_based)
min_order_amount
DECIMAL(12,2)
NULLABLE
Min order for this rate
max_order_amount
DECIMAL(12,2)
NULLABLE
Max order for this rate
free_shipping_threshold
DECIMAL(12,2)
NULLABLE
Free shipping above this amount
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

📝 UNIQUE constraint on (shipping_method_id, shipping_zone_id)


17.5 delivery_slots

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Slot ID
name
VARCHAR(100)
NOT NULL
Morning, Evening, etc.
start_time
TIME
NOT NULL
Slot start
end_time
TIME
NOT NULL
Slot end
days_of_week
INTEGER[]
DEFAULT '{}'
0=Sun, 6=Sat
max_orders
INTEGER
NULLABLE
Max orders per slot
additional_fee
DECIMAL(12,2)
DEFAULT 0
Extra fee for this slot
is_active
BOOLEAN
DEFAULT true
Active?
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update



🔍 MODULE 18 – SEARCH & DISCOVERY


18.1 search_history

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Search ID
🔗 user_id
UUID
FK → users.id, NULLABLE
User (null = guest)
session_id
VARCHAR(255)
NULLABLE
Guest session ID
search_query
VARCHAR(255)
NOT NULL
Search text
results_count
INTEGER
DEFAULT 0
Number of results
filters
JSONB
NULLABLE
Applied filters
clicked_product_id
UUID
NULLABLE
Product clicked from results
created_at
TIMESTAMPTZ
DEFAULT NOW()
Search time

📝 INDEX on (user_id, created_at)


18.2 recently_viewed

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Record ID
🔗 user_id
UUID
FK → users.id, NULLABLE
User
session_id
VARCHAR(255)
NULLABLE
Guest session
🔗 product_id
UUID
FK → products.id, ON DELETE CASCADE
Viewed product
view_count
INTEGER
DEFAULT 1
View count
last_viewed_at
TIMESTAMPTZ
NOT NULL
Last view time
created_at
TIMESTAMPTZ
DEFAULT NOW()
First view time

📝 UNIQUE constraint on (user_id, product_id)


18.3 product_recommendations

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Recommendation ID
🔗 source_product_id
UUID
FK → products.id, ON DELETE CASCADE
Source product
🔗 recommended_product_id
UUID
FK → products.id, ON DELETE CASCADE
Recommended product
type
ENUM(RecommendationType)
NOT NULL
frequently_bought_together | similar | complementary | viewed_also_viewed
score
DECIMAL(5,4)
DEFAULT 0
Relevance score
is_manual
BOOLEAN
DEFAULT false
Manually curated?
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update


18.4 product_comparisons

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Comparison ID
🔗 user_id
UUID
FK → users.id, NULLABLE
User
session_id
VARCHAR(255)
NULLABLE
Guest session
product_ids
UUID[]
NOT NULL
Array of product UUIDs being compared
comparison_key
VARCHAR(255)
NULLABLE
Hash key for quick lookup
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date



🎖️ MODULE 19 – LOYALTY & REFERRALS


19.1 loyalty_points

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Points record ID
🔗 user_id
UUID
FK → users.id, NOT NULL, UNIQUE (OneToOne)
User
🔗 tier_id
UUID
FK → loyalty_tiers.id, NULLABLE
Current loyalty tier
total_earned
INTEGER
DEFAULT 0
Total points earned
total_redeemed
INTEGER
DEFAULT 0
Total points used
total_expired
INTEGER
DEFAULT 0
Total points expired
available_balance
INTEGER
DEFAULT 0
Current balance (⚠️ denormalized = earned - redeemed - expired)
lifetime_points
INTEGER
DEFAULT 0
All-time points
tier_recalculated_at
TIMESTAMPTZ
NULLABLE
Last tier check
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update


19.2 loyalty_tiers

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Tier ID
name
VARCHAR(50)
NOT NULL, UNIQUE
Bronze, Silver, Gold, Platinum
min_points
INTEGER
DEFAULT 0
Min points for tier
max_points
INTEGER
NULLABLE
Max points (null = unlimited)
earn_multiplier
DECIMAL(3,2)
DEFAULT 1.0
Points earning multiplier
benefits
JSONB
NULLABLE
Tier benefits description
icon_url
VARCHAR(500)
NULLABLE
Tier icon
color_hex
VARCHAR(7)
NULLABLE
Tier color
sort_order
INTEGER
DEFAULT 0
Display order
is_active
BOOLEAN
DEFAULT true
Active?
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date


19.3 loyalty_transactions
Points earning/spending history.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Transaction ID
🔗 user_id
UUID
FK → users.id, NOT NULL
User
type
ENUM(LoyaltyTransactionType)
NOT NULL
earn | redeem | expire | bonus | adjustment | referral_bonus
points
INTEGER
NOT NULL
Points amount (+/-)
balance_after
INTEGER
NOT NULL
Balance after transaction
reference_type
VARCHAR(50)
NULLABLE
Source type (order, referral, etc.)
reference_id
UUID
NULLABLE
Source entity ID
description
TEXT
NULLABLE
Transaction description
expires_at
TIMESTAMPTZ
NULLABLE
Points expiry date
created_at
TIMESTAMPTZ
DEFAULT NOW()
Transaction date


19.4 referral_codes

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Referral Code ID
🔗 user_id
UUID
FK → users.id, NOT NULL, UNIQUE (OneToOne)
Code owner
code
VARCHAR(20)
NOT NULL, UNIQUE
Referral code
total_referrals
INTEGER
DEFAULT 0
Total successful referrals (denormalized)
total_points_earned
INTEGER
DEFAULT 0
Total points from referrals (denormalized)
is_active
BOOLEAN
DEFAULT true
Active?
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date


19.5 referrals
Referral tracking between users.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Referral ID
🔗 referrer_user_id
UUID
FK → users.id, NOT NULL
Referrer
🔗 referred_user_id
UUID
FK → users.id, NOT NULL, UNIQUE
Referred user (can only be referred once)
🔗 referral_code_id
UUID
FK → referral_codes.id, NOT NULL
Used code
status
ENUM(ReferralStatus)
DEFAULT 'pending'
pending | qualified | rewarded | expired
points_awarded
INTEGER
DEFAULT 0
Points given
rewarded_at
TIMESTAMPTZ
NULLABLE
Reward time
qualified_at
TIMESTAMPTZ
NULLABLE
Qualification time (e.g., first purchase)
created_at
TIMESTAMPTZ
DEFAULT NOW()
Referral date



🔧 MODULE 20 – SYSTEM SETTINGS


20.1 system_settings

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Setting ID
group
VARCHAR(50)
NOT NULL
Setting group (e.g., "general", "payment", "shipping")
key
VARCHAR(100)
NOT NULL, UNIQUE
Setting key
value
TEXT
NULLABLE
Setting value
value_type
VARCHAR(20)
DEFAULT 'string'
string | number | boolean | json
display_name
VARCHAR(200)
NULLABLE
Admin-friendly name
description
TEXT
NULLABLE
Setting description
is_public
BOOLEAN
DEFAULT false
Visible to frontend?
is_encrypted
BOOLEAN
DEFAULT false
Value encrypted?
🔗 updated_by
UUID
FK → users.id, NULLABLE
Last updater
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update


20.2 feature_flags

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Flag ID
name
VARCHAR(100)
NOT NULL, UNIQUE
Flag naam (e.g., "enable_loyalty_points")
description
TEXT
NULLABLE
Description
is_enabled
BOOLEAN
DEFAULT false
Globally enabled?
rollout_percentage
DECIMAL(5,2)
DEFAULT 0
Progressive rollout %
conditions
JSONB
NULLABLE
Targeting conditions
enabled_for_roles
UserRole[]
NULLABLE
Specific roles
enabled_for_users
UUID[]
NULLABLE
Specific user IDs
🔗 updated_by
UUID
FK → users.id, NULLABLE
Last updater
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update



📋 MODULE 21 – AUDIT LOGGING


21.1 audit_logs
System-wide change audit trail.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Audit ID
🔗 user_id
UUID
FK → users.id, NULLABLE
Actor
action
ENUM(AuditAction)
NOT NULL
create | update | delete | view | login | logout | export | import
entity_type
VARCHAR(50)
NOT NULL
Affected entity type (polymorphic)
entity_id
UUID
NULLABLE
Affected entity ID (polymorphic)
old_values
JSONB
NULLABLE
Previous state
new_values
JSONB
NULLABLE
New state
changed_fields
TEXT[]
NULLABLE
List of changed field names
ip_address
INET
NULLABLE
Actor IP
user_agent
TEXT
NULLABLE
Browser info
session_id
UUID
NULLABLE
Session reference
description
TEXT
NULLABLE
Human-readable description
created_at
TIMESTAMPTZ
DEFAULT NOW()
Event time


21.2 user_activity_logs
User browsing and activity tracking.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Activity ID
🔗 user_id
UUID
FK → users.id, NULLABLE
User
session_id
VARCHAR(255)
NULLABLE
Session ID
activity_type
VARCHAR(50)
NOT NULL
page_view | product_view | search | cart_add | etc.
entity_type
VARCHAR(50)
NULLABLE
Related entity type
entity_id
UUID
NULLABLE
Related entity ID
metadata
JSONB
NULLABLE
Extra data
ip_address
INET
NULLABLE
User IP
user_agent
TEXT
NULLABLE
Browser info
device_type
VARCHAR(20)
NULLABLE
mobile | desktop | tablet
referrer_url
VARCHAR(500)
NULLABLE
Referrer URL
page_url
VARCHAR(500)
NULLABLE
Page URL
created_at
TIMESTAMPTZ
DEFAULT NOW()
Activity time



🌐 MODULE 22 – INTERNATIONALIZATION (i18n)


22.1 languages

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Language ID
code
VARCHAR(5)
UNIQUE
ISO language code (en, ur, ar)
name
VARCHAR(100)
NOT NULL
English name
native_name
VARCHAR(100)
NULLABLE
Native name (اردو)
direction
ENUM(TextDirection)
DEFAULT 'ltr'
ltr | rtl
is_default
BOOLEAN
DEFAULT false
Default language?
is_active
BOOLEAN
DEFAULT true
Active?
sort_order
INTEGER
DEFAULT 0
Display order
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date


22.2 currencies

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Currency ID
code
VARCHAR(3)
UNIQUE
ISO currency code (PKR, USD)
name
VARCHAR(100)
NOT NULL
Currency name
symbol
VARCHAR(10)
NOT NULL
Symbol (Rs, $)
symbol_position
VARCHAR(10)
DEFAULT 'before'
before | after
decimal_places
SMALLINT
DEFAULT 2
Decimal digits
thousands_separator
VARCHAR(3)
DEFAULT ','
Thousands separator
decimal_separator
VARCHAR(3)
DEFAULT '.'
Decimal separator
exchange_rate
DECIMAL(12,6)
DEFAULT 1.0
Rate relative to base currency
is_default
BOOLEAN
DEFAULT false
Default currency?
is_active
BOOLEAN
DEFAULT true
Active?
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: currencies → rate_history (OneToMany)


22.3 currency_rate_history

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Record ID
🔗 currency_id
UUID
FK → currencies.id, ON DELETE CASCADE
Currency
rate
DECIMAL(12,6)
NOT NULL
Historical rate
source
VARCHAR(100)
NULLABLE
Rate source (e.g., "ECB", "manual")
recorded_at
TIMESTAMPTZ
DEFAULT NOW()
Recording time


22.4 translations
Polymorphic translations for any entity.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Translation ID
🔗 language_id
UUID
FK → languages.id, ON DELETE CASCADE
Target language
entity_type
VARCHAR(50)
NOT NULL
Entity type (product, category, etc.)
entity_id
UUID
NOT NULL
Entity ID
field_name
VARCHAR(100)
NOT NULL
Field being translated (name, description)
translated_value
TEXT
NOT NULL
Translated text
is_auto_translated
BOOLEAN
DEFAULT false
Machine translation?
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

📝 UNIQUE constraint on (language_id, entity_type, entity_id, field_name)



💬 MODULE 23 – CHAT


23.1 conversations

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Conversation ID
type
VARCHAR(50)
NULLABLE
Conversation type
🔗 buyer_id
UUID
FK → users.id
Buyer
seller_id
UUID
NOT NULL
Seller (⚠️ Missing FK to sellers/users)
🔗 customer_id
UUID
FK → users.id, NULLABLE
Customer (alternate reference)
🔗 order_id
UUID
FK → orders.id, NULLABLE
Related order
subject
VARCHAR(255)
NULLABLE
Conversation subject
status
ENUM(ConversationStatus)
DEFAULT 'active'
active | archived | closed | blocked
last_message_at
TIMESTAMPTZ
NULLABLE
Last message time
customer_unread_count
INTEGER
DEFAULT 0
Unread by customer (denormalized)
store_unread_count
INTEGER
DEFAULT 0
Unread by store (denormalized)
created_at
TIMESTAMPTZ
DEFAULT NOW()
Start time
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: conversations → messages (OneToMany) | conversations → buyer | conversations → customer | conversations → order


23.2 messages

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Message ID
🔗 conversation_id
UUID
FK → conversations.id, ON DELETE CASCADE
Conversation
🔗 sender_id
UUID
FK → users.id
Sender
sender_type
ENUM(MessageSenderType)
NOT NULL
customer | seller | admin | system
message_type
ENUM(MessageType)
DEFAULT 'text'
text | image | file | product_link | order_update | system
content
TEXT
NOT NULL
Message content
attachments
JSONB
NULLABLE
File attachments
is_read
BOOLEAN
DEFAULT false
Read by recipient?
read_at
TIMESTAMPTZ
NULLABLE
Read time
is_system_message
BOOLEAN
DEFAULT false
System message?
created_at
TIMESTAMPTZ
DEFAULT NOW()
Send time
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update



📄 MODULE 24 – CMS (Content Management)


24.1 banners

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Banner ID
title
VARCHAR(200)
NOT NULL
Banner title
subtitle
VARCHAR(300)
NULLABLE
Subtitle
image_url
VARCHAR(500)
NOT NULL
Desktop image
mobile_image_url
VARCHAR(500)
NULLABLE
Mobile image
link_url
VARCHAR(500)
NULLABLE
Click URL
link_type
ENUM(BannerLinkType)
NULLABLE
product | category | campaign | external | page
link_target_id
UUID
NULLABLE
Target entity ID
position
ENUM(BannerPosition)
DEFAULT 'homepage_hero'
homepage_hero | homepage_secondary | category_top | sidebar
sort_order
INTEGER
DEFAULT 0
Display order
starts_at
TIMESTAMPTZ
NULLABLE
Show from
ends_at
TIMESTAMPTZ
NULLABLE
Show until
is_active
BOOLEAN
DEFAULT true
Active?
view_count
INTEGER
DEFAULT 0
Impressions (denormalized)
click_count
INTEGER
DEFAULT 0
Clicks (denormalized)
🔗 created_by
UUID
FK → users.id, NULLABLE
Creator
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update


24.2 pages
Static CMS pages with hierarchy.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Page ID
slug
VARCHAR(200)
UNIQUE
URL slug
title
VARCHAR(200)
NOT NULL
Page title
content
TEXT
NOT NULL
Page content (HTML)
excerpt
VARCHAR(500)
NULLABLE
Short excerpt
meta_title
VARCHAR(255)
NULLABLE
SEO title
meta_description
VARCHAR(500)
NULLABLE
SEO description
🔗 parent_id
UUID
FK → pages.id, NULLABLE (self-referencing)
Parent page
sort_order
INTEGER
DEFAULT 0
Display order
is_published
BOOLEAN
DEFAULT false
Published?
published_at
TIMESTAMPTZ
NULLABLE
Publish date
🔗 author_id
UUID
FK → users.id, NULLABLE
Author
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: pages → parent (self ManyToOne) | pages → children (OneToMany) | pages → author (ManyToOne)



🔍 MODULE 25 – SEO


25.1 seo_metadata
Polymorphic SEO metadata for any entity.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
SEO ID
entity_type
VARCHAR(50)
NOT NULL
Entity type (product, category, etc.)
entity_id
UUID
NOT NULL
Entity ID
meta_title
VARCHAR(255)
NULLABLE
Title tag
meta_description
VARCHAR(500)
NULLABLE
Meta description
meta_keywords
TEXT[]
NULLABLE
Keywords array
canonical_url
VARCHAR(500)
NULLABLE
Canonical URL
og_title
VARCHAR(255)
NULLABLE
Open Graph title
og_description
VARCHAR(500)
NULLABLE
OG description
og_image_url
VARCHAR(500)
NULLABLE
OG image
og_type
VARCHAR(50)
DEFAULT 'website'
OG type
twitter_card_type
VARCHAR(30)
NULLABLE
Twitter card type
twitter_title
VARCHAR(255)
NULLABLE
Twitter title
twitter_description
VARCHAR(500)
NULLABLE
Twitter description
twitter_image_url
VARCHAR(500)
NULLABLE
Twitter image
structured_data
JSONB
NULLABLE
JSON-LD structured data
robots_directive
VARCHAR(100)
DEFAULT 'index, follow'
Robots directive
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

📝 UNIQUE constraint on (entity_type, entity_id)


25.2 url_redirects

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Redirect ID
source_url
VARCHAR(500)
UNIQUE
Old URL
target_url
VARCHAR(500)
NOT NULL
New URL
redirect_type
ENUM(RedirectType)
DEFAULT '301'
permanent_301 | temporary_302 | temporary_307
is_active
BOOLEAN
DEFAULT true
Active?
hit_count
INTEGER
DEFAULT 0
Usage count
last_hit_at
TIMESTAMPTZ
NULLABLE
Last redirect time
🔗 created_by
UUID
FK → users.id, NULLABLE
Creator
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date



🎫 MODULE 26 – SUPPORT TICKETS


26.1 tickets

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Ticket ID
ticket_number
VARCHAR(50)
UNIQUE
Ticket reference
🔗 user_id
UUID
FK → users.id
Submitter
🔗 category_id
UUID
FK → ticket_categories.id, NULLABLE
Category
subject
VARCHAR(255)
NOT NULL
Ticket subject
description
TEXT
NOT NULL
Ticket description
status
ENUM(TicketStatus)
DEFAULT 'open'
open | in_progress | waiting_customer | waiting_staff | resolved | closed | reopened
priority
ENUM(TicketPriority)
DEFAULT 'medium'
low | medium | high | urgent
🔗 assigned_to
UUID
FK → users.id, NULLABLE
Assigned agent
order_id
UUID
NULLABLE
Related order (⚠️ Missing FK constraint)
attachments
JSONB
NULLABLE
File attachments
first_response_at
TIMESTAMPTZ
NULLABLE
First response SLA
resolved_at
TIMESTAMPTZ
NULLABLE
Resolution time
closed_at
TIMESTAMPTZ
NULLABLE
Close time
satisfaction_rating
INTEGER
NULLABLE
CSAT 1-5
satisfaction_comment
TEXT
NULLABLE
Feedback text
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: tickets → user | tickets → category | tickets → assigned agent | tickets → messages (OneToMany)


26.2 ticket_messages

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Message ID
🔗 ticket_id
UUID
FK → tickets.id, ON DELETE CASCADE
Ticket
🔗 sender_id
UUID
FK → users.id
Sender
is_staff
BOOLEAN
DEFAULT false
Staff reply?
message
TEXT
NOT NULL
Message content
attachments
JSONB
NULLABLE
File attachments
is_internal_note
BOOLEAN
DEFAULT false
Internal note?
created_at
TIMESTAMPTZ
DEFAULT NOW()
Send time


26.3 ticket_categories
Hierarchical ticket categories.

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Category ID
name
VARCHAR(100)
NOT NULL
Category naam
description
TEXT
NULLABLE
Description
🔗 parent_id
UUID
FK → ticket_categories.id, NULLABLE (self-referencing)
Parent category
is_active
BOOLEAN
DEFAULT true
Active?
sort_order
INTEGER
DEFAULT 0
Display order
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update

🔗 Relations: ticket_categories → parent (self ManyToOne) | ticket_categories → children (OneToMany)



⚙️ MODULE 27 – OPERATIONS


27.1 bulk_operations

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Operation ID
🔗 user_id
UUID
FK → users.id, NOT NULL
Initiator
operation_type
ENUM(BulkOperationType)
NOT NULL
update | delete | activate | deactivate | export
entity_type
VARCHAR(50)
NOT NULL
Entity type (products, orders, etc.)
status
ENUM(JobStatus)
DEFAULT 'pending'
pending | processing | completed | failed | cancelled
entity_ids
UUID[]
NOT NULL
Target entity IDs
parameters
JSONB
NOT NULL
Operation parameters
total_count
INTEGER
NOT NULL
Total items
success_count
INTEGER
DEFAULT 0
Successful items
failure_count
INTEGER
DEFAULT 0
Failed items
error_log
JSONB
NULLABLE
Error details
started_at
TIMESTAMPTZ
NULLABLE
Start time
completed_at
TIMESTAMPTZ
NULLABLE
Completion time
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update


27.2 import_export_jobs

Column
Data Type
Constraints
Description
🔑 id
UUID
PK
Job ID
🔗 user_id
UUID
FK → users.id, NOT NULL
Initiator
type
ENUM(ImportJobType)
NOT NULL
import_products | export_products | import_orders | export_orders | etc.
status
ENUM(JobStatus)
DEFAULT 'pending'
pending | processing | completed | failed | cancelled
source_file_url
VARCHAR(500)
NULLABLE
Import file URL
result_file_url
VARCHAR(500)
NULLABLE
Export/result file URL
total_rows
INTEGER
DEFAULT 0
Total rows
processed_rows
INTEGER
DEFAULT 0
Processed rows
success_rows
INTEGER
DEFAULT 0
Success rows
failed_rows
INTEGER
DEFAULT 0
Failed rows
error_log
JSONB
NULLABLE
Error details
error_summary
TEXT
NULLABLE
Summary of errors
options
JSONB
NULLABLE
Job options/config
started_at
TIMESTAMPTZ
NULLABLE
Start time
completed_at
TIMESTAMPTZ
NULLABLE
Completion time
created_at
TIMESTAMPTZ
DEFAULT NOW()
Creation date
updated_at
TIMESTAMPTZ
DEFAULT NOW()
Last update



📝 DESIGN NOTES & CONVENTIONS

1. **Primary Keys**: ALL tables use UUID with `uuid_generate_v4()` — no auto-increment integers
2. **Naming**: snake_case for DB columns, camelCase in TypeORM entities
3. **Timestamps**: All tables have `created_at` (TIMESTAMPTZ). Most have `updated_at`
4. **Soft Deletes**: Only `users` and `products` tables use `deleted_at` soft delete
5. **Enums**: PostgreSQL native ENUMs via TypeORM — 23+ enum types defined in `common/enums/`
6. **JSONB Usage**: Used for flexible data (payment gateway responses, shipping dimensions, product snapshots, settings)
7. **Array Types**: PostgreSQL arrays used for tags, images, backup codes, postal codes
8. **Polymorphic References**: audit_logs, user_activity_logs, translations, seo_metadata use string-based entity_type + entity_id pattern (not FK-constrained)
9. **Denormalized Counters**: Multiple tables have count/total fields that need DB triggers or application-level sync
10. **Migrations**: `synchronize: false` — all schema changes via TypeORM migrations only
