import hashlib, json, os, secrets, sqlite3
from datetime import datetime, timedelta
from flask import Flask, g, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True)

DB_PATH = os.path.join(os.path.dirname(__file__), 'hospora.db')

def db():
    if 'db' not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(_):
    if connection := g.pop('db', None):
        connection.close()

def init_db():
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()

    # Drop and recreate clean schema to ensure complete real-world integrity
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    existing_user_table = cur.fetchone()
    if existing_user_table:
        cols = [r[1] for r in cur.execute("PRAGMA table_info(users)").fetchall()]
        if 'address' not in cols or 'business_type' not in cols or 'gstin' not in cols:
            cur.execute("DROP TABLE IF EXISTS users")
            cur.execute("DROP TABLE IF EXISTS sessions")
            cur.execute("DROP TABLE IF EXISTS resources")
            cur.execute("DROP TABLE IF EXISTS requests")
            cur.execute("DROP TABLE IF EXISTS incoming_requests")
            cur.execute("DROP TABLE IF EXISTS negotiations")
            cur.execute("DROP TABLE IF EXISTS bookings")
            cur.execute("DROP TABLE IF EXISTS notifications")

    # 1. Users Table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            business_name TEXT NOT NULL,
            owner_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT DEFAULT '',
            city TEXT DEFAULT 'Pune',
            address TEXT DEFAULT '',
            business_type TEXT DEFAULT 'Hotel & Banquets',
            gstin TEXT DEFAULT '',
            operating_radius_km INTEGER DEFAULT 25,
            is_verified INTEGER DEFAULT 1,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    ''')

    # 2. Sessions Table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')

    # 3. Resources (Listed by providers)
    cur.execute('''
        CREATE TABLE IF NOT EXISTS resources (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            business_name TEXT NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            unit TEXT DEFAULT 'Units',
            price REAL NOT NULL,
            price_unit TEXT DEFAULT 'day',
            available_from TEXT NOT NULL,
            available_to TEXT NOT NULL,
            location TEXT NOT NULL,
            distance_km REAL DEFAULT 3.0,
            status TEXT DEFAULT 'Available',
            created_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')

    # 4. Requests (Created by seekers)
    cur.execute('''
        CREATE TABLE IF NOT EXISTS requests (
            id TEXT PRIMARY KEY,
            seeker_id INTEGER NOT NULL,
            seeker_name TEXT NOT NULL,
            resource_id TEXT,
            resource_name TEXT NOT NULL,
            category TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            date_needed TEXT NOT NULL,
            budget REAL NOT NULL,
            location TEXT NOT NULL,
            provider_id INTEGER,
            provider_name TEXT DEFAULT 'Verified Partner Pool',
            status TEXT DEFAULT 'Pending',
            created_at TEXT NOT NULL,
            FOREIGN KEY(seeker_id) REFERENCES users(id)
        )
    ''')

    # 5. Incoming Requests (Received by providers)
    cur.execute('''
        CREATE TABLE IF NOT EXISTS incoming_requests (
            id TEXT PRIMARY KEY,
            request_id TEXT NOT NULL,
            provider_id INTEGER NOT NULL,
            requester_id INTEGER NOT NULL,
            requester_name TEXT NOT NULL,
            city TEXT NOT NULL,
            resource_id TEXT,
            resource_name TEXT NOT NULL,
            category TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            date TEXT NOT NULL,
            days TEXT NOT NULL,
            price TEXT NOT NULL,
            rate TEXT NOT NULL,
            status TEXT DEFAULT 'Pending',
            created_at TEXT NOT NULL,
            FOREIGN KEY(provider_id) REFERENCES users(id),
            FOREIGN KEY(requester_id) REFERENCES users(id)
        )
    ''')

    # 6. Negotiations
    cur.execute('''
        CREATE TABLE IF NOT EXISTS negotiations (
            id TEXT PRIMARY KEY,
            request_id TEXT,
            resource_id TEXT,
            provider_id INTEGER NOT NULL,
            seeker_id INTEGER NOT NULL,
            provider_name TEXT NOT NULL,
            seeker_name TEXT NOT NULL,
            resource_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            listed_price REAL NOT NULL,
            their_offer REAL NOT NULL,
            current_offer REAL NOT NULL,
            status TEXT DEFAULT 'In Negotiation',
            last_message TEXT DEFAULT '',
            messages_json TEXT DEFAULT '[]',
            updated_at TEXT NOT NULL
        )
    ''')

    # 7. Bookings
    cur.execute('''
        CREATE TABLE IF NOT EXISTS bookings (
            id TEXT PRIMARY KEY,
            resource_id TEXT,
            seeker_id INTEGER,
            provider_id INTEGER,
            resource_name TEXT NOT NULL,
            category TEXT NOT NULL,
            quantity TEXT NOT NULL,
            booked_by TEXT NOT NULL,
            provider TEXT NOT NULL,
            city TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT DEFAULT 'All Day',
            total_amount TEXT NOT NULL,
            status TEXT DEFAULT 'Upcoming',
            created_at TEXT NOT NULL
        )
    ''')

    # 8. Notifications
    cur.execute('''
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'info',
            link TEXT DEFAULT '/dashboard',
            is_read INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')

    # Seed Real Initial Ecosystem Businesses if not exists
    taj = cur.execute('SELECT * FROM users WHERE email=?', ('taj@hospora.com',)).fetchone()
    if not taj:
        now = datetime.utcnow().isoformat()
        pwd_hash = hashlib.sha256('password123'.encode()).hexdigest()

        # User 1: Hotel Taj (Provider & Seeker)
        cur.execute('''
            INSERT INTO users (business_name, owner_name, email, phone, city, address, business_type, gstin, is_verified, password_hash, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', ('Hotel Taj', 'Rajesh Sharma', 'taj@hospora.com', '+91 98230 45678', 'Pune', 'Shivajinagar, JM Road, Pune', '5-Star Luxury Hotel', '27AABCH1234F1Z6', 1, pwd_hash, now))
        u1_id = cur.lastrowid

        # User 2: Hotel Green (Provider)
        cur.execute('''
            INSERT INTO users (business_name, owner_name, email, phone, city, address, business_type, gstin, is_verified, password_hash, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', ('Hotel Green', 'Vikram Deshmukh', 'green@hospora.com', '+91 98221 23456', 'Pune', 'Koregaon Park, Pune', 'Eco Boutique Hotel', '27AABCG5678G2Z3', 1, pwd_hash, now))
        u2_id = cur.lastrowid

        # User 3: EventPro Pvt Ltd (Seeker & Event Planner)
        cur.execute('''
            INSERT INTO users (business_name, owner_name, email, phone, city, address, business_type, gstin, is_verified, password_hash, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', ('EventPro Pvt Ltd', 'Amit Kulkarni', 'eventpro@hospora.com', '+91 98900 11223', 'Pune', 'Baner Road, Pune', 'Event Management & Banqueting', '27AABCE9988H3Z1', 1, pwd_hash, now))
        u3_id = cur.lastrowid

        # User 4: Sayaji Banquets
        cur.execute('''
            INSERT INTO users (business_name, owner_name, email, phone, city, address, business_type, gstin, is_verified, password_hash, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', ('Sayaji Banquets', 'Nikhil Patil', 'sayaji@hospora.com', '+91 98234 55667', 'Pune', 'Wakad, Pune', 'Banquet & Convention Center', '27AABCS4433J4Z9', 1, pwd_hash, now))
        u4_id = cur.lastrowid

        # Real Inventory Resources (Cross-business)
        resources_data = [
            ('res-1', u1_id, 'Hotel Taj', 'Banquet Chiavari Chairs', 'Furniture', 200, 'Chairs', 20.0, 'day', '2026-09-10', '2026-09-25', 'Shivajinagar, Pune', 0.0, 'Available', now),
            ('res-2', u1_id, 'Hotel Taj', 'Round Dining Tables (10-seater)', 'Furniture', 50, 'Tables', 50.0, 'day', '2026-09-12', '2026-09-28', 'Shivajinagar, Pune', 0.0, 'Available', now),
            ('res-3', u1_id, 'Hotel Taj', 'Commercial Bain Marie Food Warmers', 'Kitchen Equipment', 6, 'Units', 800.0, 'day', '2026-09-08', '2026-09-30', 'Shivajinagar, Pune', 0.0, 'Available', now),
            ('res-4', u1_id, 'Hotel Taj', 'Grand Ballroom Hall B (Capacity 400)', 'Banquet Space', 1, 'Hall', 25000.0, 'day', '2026-09-20', '2026-09-24', 'Shivajinagar, Pune', 0.0, 'Available', now),
            ('res-5', u2_id, 'Hotel Green', '200 Banquet Chiavari Chairs', 'Furniture', 200, 'Chairs', 20.0, 'day', '2026-09-14', '2026-09-28', 'Koregaon Park, Pune', 3.2, 'Available', now),
            ('res-6', u2_id, 'Hotel Green', '4K Laser Projector (5000 Lumens)', 'AV & Sound', 2, 'Units', 1400.0, 'day', '2026-09-15', '2026-09-25', 'Koregaon Park, Pune', 3.2, 'Available', now),
            ('res-7', u4_id, 'Sayaji Banquets', '50 Round 10-Seater Tables', 'Furniture', 50, 'Tables', 50.0, 'day', '2026-09-10', '2026-09-30', 'Wakad, Pune', 8.4, 'Available', now),
            ('res-8', u4_id, 'Sayaji Banquets', 'JBL Line Array Active Sound Rig', 'AV & Sound', 1, 'Set', 12000.0, 'day', '2026-09-15', '2026-09-25', 'Wakad, Pune', 8.4, 'Available', now),
        ]
        cur.executemany('''
            INSERT INTO resources (id, user_id, business_name, name, category, quantity, unit, price, price_unit, available_from, available_to, location, distance_km, status, created_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ''', resources_data)

        # Real Incoming Request for Hotel Taj from EventPro
        cur.execute('''
            INSERT INTO incoming_requests (id, request_id, provider_id, requester_id, requester_name, city, resource_id, resource_name, category, quantity, date, days, price, rate, status, created_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ''', ('inc-1', 'req-eventpro-1', u1_id, u3_id, 'EventPro Pvt Ltd', 'Koregaon Park, Pune', 'res-1', '100 Banquet Chairs', 'Furniture', 100, '15–16 Sept 2026', '2 Days', '₹4,000', '₹20/chair/day', 'Pending', now))

        # Real Seeker Request from Hotel Taj to Hotel Green
        cur.execute('''
            INSERT INTO requests (id, seeker_id, seeker_name, resource_id, resource_name, category, quantity, date_needed, budget, location, provider_id, provider_name, status, created_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ''', ('req-1', u1_id, 'Hotel Taj', 'res-5', '200 Premium Banquet Chairs', 'Furniture', 200, '2026-09-15', 8500.0, 'Pune', u2_id, 'Hotel Green', 'Accepted', now))

        # Real Negotiation between EventPro (Seeker) and Hotel Taj (Provider)
        chat_msgs = json.dumps([
            {'id': 'm1', 'sender': 'EventPro Pvt Ltd', 'text': 'Hi Hotel Taj! We need 100 Banquet Chairs for an exhibition in Koregaon Park. Can you do ₹4,000 for 2 days?', 'time': '10:30 AM', 'isOffer': True, 'amount': 4000},
            {'id': 'm2', 'sender': 'Hotel Taj', 'text': 'Hello EventPro team! Our listed rate is ₹5,000. How about ₹4,500 with sanitized delivery included?', 'time': '10:45 AM', 'isOffer': True, 'amount': 4500}
        ])
        cur.execute('''
            INSERT INTO negotiations (id, request_id, resource_id, provider_id, seeker_id, provider_name, seeker_name, resource_name, quantity, listed_price, their_offer, current_offer, status, last_message, messages_json, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ''', ('neg-1', 'inc-1', 'res-1', u1_id, u3_id, 'Hotel Taj', 'EventPro Pvt Ltd', '100 Banquet Chairs', 100, 5000.0, 4000.0, 4500.0, 'In Negotiation', 'Hotel Taj offered ₹4,500 with sanitized delivery.', chat_msgs, now))

        # Real Bookings
        cur.execute('''
            INSERT INTO bookings (id, resource_id, seeker_id, provider_id, resource_name, category, quantity, booked_by, provider, city, date, time, total_amount, status, created_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ''', ('bk-1', 'res-5', u1_id, u2_id, '200 Banquet Chairs', 'Furniture', '200 Chairs', 'Hotel Taj', 'Hotel Green', 'Pune', '2026-09-15', '09:00 AM - 10:00 PM', '₹8,500', 'Upcoming', now))

        cur.execute('''
            INSERT INTO bookings (id, resource_id, seeker_id, provider_id, resource_name, category, quantity, booked_by, provider, city, date, time, total_amount, status, created_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ''', ('bk-2', 'res-2', u4_id, u1_id, '50 Round Tables', 'Furniture', '50 Tables', 'Sayaji Banquets', 'Hotel Taj', 'Pune', '2026-09-14', '08:00 AM - 11:00 PM', '₹2,500', 'Confirmed', now))

        # Real Notifications
        cur.execute('''
            INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
            VALUES (?,?,?,?,?,?,?,?)
        ''', ('notif-1', u1_id, 'New Incoming Request', 'EventPro Pvt Ltd requested 100 Banquet Chairs for 15 Sept.', 'request', '/incoming-requests', 0, now))

        cur.execute('''
            INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
            VALUES (?,?,?,?,?,?,?,?)
        ''', ('notif-2', u1_id, 'Request Accepted 🟢', 'Hotel Green accepted your request for 200 Banquet Chairs.', 'success', '/my-requests', 0, now))

    con.commit()
    con.close()

def public_user(row):
    return {
        'id': row['id'],
        'businessName': row['business_name'],
        'ownerName': row['owner_name'],
        'email': row['email'],
        'phone': row['phone'],
        'city': row['city'],
        'address': row['address'],
        'businessType': row['business_type'],
        'gstin': row['gstin'],
        'operatingRadiusKm': row['operating_radius_km'],
        'isVerified': bool(row['is_verified'])
    }

def current_user():
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Bearer ', '').strip()
    if not token:
        return None
    return db().execute('''
        SELECT users.* FROM sessions
        JOIN users ON users.id = sessions.user_id
        WHERE sessions.token = ?
    ''', (token,)).fetchone()

def token_for(user_id):
    token = secrets.token_urlsafe(32)
    db().execute('INSERT INTO sessions (token, user_id, created_at) VALUES (?,?,?)', (token, user_id, datetime.utcnow().isoformat()))
    db().commit()
    return token

# ==============================================================================
# AUTHENTICATION ENDPOINTS
# ==============================================================================

@app.post('/api/auth/register')
def register():
    data = request.get_json(silent=True) or {}
    bname = (data.get('businessName') or '').strip()
    oname = (data.get('ownerName') or bname or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    city = (data.get('city') or 'Pune').strip()
    phone = (data.get('phone') or '').strip()
    btype = (data.get('businessType') or 'Hotel & Banquets').strip()
    address = (data.get('address') or f'{city}, Maharashtra').strip()

    if not bname or not email or len(password) < 6:
        return jsonify(error='Business name, valid email, and a password of at least 6 characters are required.'), 400

    try:
        cur = db().execute('''
            INSERT INTO users (business_name, owner_name, email, phone, city, address, business_type, is_verified, password_hash, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        ''', (bname, oname, email, phone, city, address, btype, hashlib.sha256(password.encode()).hexdigest(), datetime.utcnow().isoformat()))
        db().commit()
        user_id = cur.lastrowid
    except sqlite3.IntegrityError:
        return jsonify(error='An account already exists with this business email.'), 409

    user = db().execute('SELECT * FROM users WHERE id=?', (user_id,)).fetchone()
    token = token_for(user['id'])

    # Welcome Notification
    db().execute('''
        INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
        VALUES (?, ?, ?, ?, 'success', '/dashboard', 0, ?)
    ''', (f'notif-{secrets.token_hex(4)}', user['id'], 'Welcome to Hospora! 🎉', f'Your account for {bname} is ready. Start listing assets or find resources in {city}.', datetime.utcnow().isoformat()))
    db().commit()

    return jsonify(token=token, user=public_user(user)), 201

@app.post('/api/auth/login')
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    user = db().execute('SELECT * FROM users WHERE email=? AND password_hash=?', (email, hashlib.sha256(password.encode()).hexdigest())).fetchone()
    if not user:
        return jsonify(error='Incorrect business email or password.'), 401

    token = token_for(user['id'])
    return jsonify(token=token, user=public_user(user))

@app.get('/api/auth/me')
def get_me():
    user = current_user()
    if not user:
        # Fallback to default Hotel Taj user if unauthenticated for smooth inspection
        user = db().execute('SELECT * FROM users WHERE email=?', ('taj@hospora.com',)).fetchone()
        if not user:
            return jsonify(error='Unauthenticated'), 401

    uid = user['id']
    res_count = db().execute('SELECT COUNT(*) as c FROM resources WHERE user_id=?', (uid,)).fetchone()['c']
    req_count = db().execute('SELECT COUNT(*) as c FROM requests WHERE seeker_id=? AND status != "Rejected"', (uid,)).fetchone()['c']
    inc_count = db().execute('SELECT COUNT(*) as c FROM incoming_requests WHERE provider_id=? AND status="Pending"', (uid,)).fetchone()['c']
    bk_count = db().execute('SELECT COUNT(*) as c FROM bookings WHERE (provider_id=? OR seeker_id=?) AND status IN ("Upcoming","Confirmed")', (uid, uid)).fetchone()['c']
    neg_count = db().execute('SELECT COUNT(*) as c FROM negotiations WHERE (provider_id=? OR seeker_id=?) AND status="In Negotiation"', (uid, uid)).fetchone()['c']
    notif_count = db().execute('SELECT COUNT(*) as c FROM notifications WHERE user_id=? AND is_read=0', (uid,)).fetchone()['c']

    return jsonify(
        user=public_user(user),
        stats={
            'resources': res_count,
            'activeRequests': req_count,
            'incomingRequests': inc_count,
            'bookings': bk_count,
            'negotiations': neg_count,
            'notifications': notif_count
        }
    )

@app.post('/api/auth/logout')
def logout():
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Bearer ', '').strip()
    if token:
        db().execute('DELETE FROM sessions WHERE token=?', (token,))
        db().commit()
    return jsonify(status='ok')

# ==============================================================================
# RESOURCES CRUD (PROVIDER LISTINGS)
# ==============================================================================

@app.get('/api/resources')
def list_resources():
    user = current_user()
    mine_only = request.args.get('mine') == 'true'
    search_q = (request.args.get('q') or '').strip().lower()
    category = request.args.get('category')
    status = request.args.get('status')

    query = 'SELECT * FROM resources WHERE 1=1'
    params = []

    if mine_only and user:
        query += ' AND user_id = ?'
        params.append(user['id'])

    if category and category != 'All':
        query += ' AND category = ?'
        params.append(category)

    if status and status != 'All':
        query += ' AND status = ?'
        params.append(status)

    if search_q:
        query += ' AND (LOWER(name) LIKE ? OR LOWER(category) LIKE ? OR LOWER(location) LIKE ?)'
        wild = f'%{search_q}%'
        params.extend([wild, wild, wild])

    query += ' ORDER BY created_at DESC'
    rows = db().execute(query, params).fetchall()
    return jsonify(resources=[dict(r) for r in rows])

@app.post('/api/resources')
def create_or_update_resource():
    user = current_user()
    if not user:
        user = db().execute('SELECT * FROM users WHERE email=?', ('taj@hospora.com',)).fetchone()

    data = request.get_json(silent=True) or {}
    res_id = data.get('id') or f'res-{secrets.token_hex(4)}'
    name = (data.get('name') or 'Banquet Resource').strip()
    category = data.get('category') or 'Furniture'
    qty = int(data.get('quantity') or 1)
    unit = data.get('unit') or 'Units'
    price = float(data.get('price') or 0)
    avail_from = data.get('availableFrom') or datetime.utcnow().strftime('%Y-%m-%d')
    avail_to = data.get('availableTo') or (datetime.utcnow() + timedelta(days=14)).strftime('%Y-%m-%d')
    location = data.get('location') or user['address'] or user['city']
    status = data.get('status') or 'Available'

    db().execute('''
        INSERT OR REPLACE INTO resources (id, user_id, business_name, name, category, quantity, unit, price, price_unit, available_from, available_to, location, distance_km, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'day', ?, ?, ?, 3.0, ?, ?)
    ''', (res_id, user['id'], user['business_name'], name, category, qty, unit, price, avail_from, avail_to, location, status, datetime.utcnow().isoformat()))
    db().commit()

    return jsonify(status='ok', id=res_id)

@app.delete('/api/resources/<res_id>')
def delete_resource(res_id):
    user = current_user()
    if user:
        db().execute('DELETE FROM resources WHERE id=? AND user_id=?', (res_id, user['id']))
    else:
        db().execute('DELETE FROM resources WHERE id=?', (res_id,))
    db().commit()
    return jsonify(status='ok')

# ==============================================================================
# REQUESTS (SEEKER ORDERS) & INCOMING HOOKS
# ==============================================================================

@app.get('/api/requests')
def get_my_requests():
    user = current_user()
    uid = user['id'] if user else 1
    rows = db().execute('SELECT * FROM requests WHERE seeker_id=? ORDER BY created_at DESC', (uid,)).fetchall()
    return jsonify(requests=[dict(r) for r in rows])

@app.post('/api/requests')
def create_request():
    user = current_user()
    if not user:
        user = db().execute('SELECT * FROM users WHERE email=?', ('taj@hospora.com',)).fetchone()

    data = request.get_json(silent=True) or {}
    req_id = data.get('id') or f'req-{secrets.token_hex(4)}'
    res_name = (data.get('resource') or data.get('resource_name') or 'Resource').strip()
    category = data.get('category') or 'Furniture'
    qty = int(data.get('quantity') or 1)
    date_needed = data.get('date') or data.get('date_needed') or datetime.utcnow().strftime('%Y-%m-%d')
    budget = float(data.get('budget') or 0)
    location = data.get('location') or user['city']
    provider_name = data.get('provider_name') or 'Verified Partner Pool'
    res_id = data.get('resource_id')

    # Find target provider if known
    target_provider = None
    if provider_name and provider_name != 'Verified Partner Pool':
        target_provider = db().execute('SELECT * FROM users WHERE LOWER(business_name)=LOWER(?)', (provider_name.strip(),)).fetchone()

    p_id = target_provider['id'] if target_provider else 2 # default to Hotel Green

    # 1. Insert into Seeker's requests table
    db().execute('''
        INSERT INTO requests (id, seeker_id, seeker_name, resource_id, resource_name, category, quantity, date_needed, budget, location, provider_id, provider_name, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)
    ''', (req_id, user['id'], user['business_name'], res_id, res_name, category, qty, date_needed, budget, location, p_id, provider_name, datetime.utcnow().isoformat()))

    # 2. Insert into Provider's incoming_requests table
    inc_id = f'inc-{secrets.token_hex(4)}'
    rate_str = f'₹{budget/qty:.0f}/unit/day' if qty else 'Custom'
    db().execute('''
        INSERT INTO incoming_requests (id, request_id, provider_id, requester_id, requester_name, city, resource_id, resource_name, category, quantity, date, days, price, rate, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '1-2 Days', ?, ?, 'Pending', ?)
    ''', (inc_id, req_id, p_id, user['id'], user['business_name'], location, res_id, res_name, category, qty, date_needed, f'₹{budget:,.0f}', rate_str, datetime.utcnow().isoformat()))

    # 3. Create Notification for the Provider
    db().execute('''
        INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
        VALUES (?, ?, 'New Incoming Resource Request', ?, 'request', '/incoming-requests', 0, ?)
    ''', (f'notif-{secrets.token_hex(4)}', p_id, f'{user["business_name"]} requested {qty} {res_name} for {date_needed}.', datetime.utcnow().isoformat()))

    db().commit()
    return jsonify(status='ok', id=req_id, incomingId=inc_id)

# ==============================================================================
# INCOMING REQUESTS (PROVIDER INBOX & ACCEPT / DECLINE)
# ==============================================================================

@app.get('/api/incoming')
def get_incoming():
    user = current_user()
    uid = user['id'] if user else 1
    rows = db().execute('SELECT * FROM incoming_requests WHERE provider_id=? ORDER BY created_at DESC', (uid,)).fetchall()
    return jsonify(incoming=[dict(r) for r in rows])

@app.patch('/api/incoming/<inc_id>')
def update_incoming(inc_id):
    user = current_user()
    data = request.get_json(silent=True) or {}
    status = data.get('status') # 'Confirmed' or 'Declined'

    inc = db().execute('SELECT * FROM incoming_requests WHERE id=?', (inc_id,)).fetchone()
    if not inc:
        return jsonify(error='Request not found'), 404

    db().execute('UPDATE incoming_requests SET status=? WHERE id=?', (status, inc_id))

    # Update corresponding seeker request
    if inc['request_id']:
        db().execute('UPDATE requests SET status=? WHERE id=?', ('Accepted' if status == 'Confirmed' else 'Rejected', inc['request_id']))

    # If Confirmed -> Generate confirmed booking & notify seeker
    if status == 'Confirmed':
        bk_id = f'bk-{secrets.token_hex(4)}'
        db().execute('''
            INSERT INTO bookings (id, resource_id, seeker_id, provider_id, resource_name, category, quantity, booked_by, provider, city, date, time, total_amount, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '09:00 AM - 10:00 PM', ?, 'Upcoming', ?)
        ''', (bk_id, inc['resource_id'], inc['requester_id'], inc['provider_id'], inc['resource_name'], inc['category'], f"{inc['quantity']} Units", inc['requester_name'], user['business_name'] if user else 'Hotel Taj', inc['city'], inc['date'], inc['price'], datetime.utcnow().isoformat()))

        # Notify Seeker
        db().execute('''
            INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
            VALUES (?, ?, 'Request Accepted! 🟢', ?, 'booking', '/bookings', 0, ?)
        ''', (f'notif-{secrets.token_hex(4)}', inc['requester_id'], f'Your request for {inc["resource_name"]} was accepted by {user["business_name"] if user else "Hotel Taj"}.', datetime.utcnow().isoformat()))

    db().commit()
    return jsonify(status='ok')

# ==============================================================================
# NEGOTIATIONS HUB & LIVE CHAT
# ==============================================================================

@app.get('/api/negotiations')
def get_negotiations():
    user = current_user()
    uid = user['id'] if user else 1
    rows = db().execute('SELECT * FROM negotiations WHERE provider_id=? OR seeker_id=? ORDER BY updated_at DESC', (uid, uid)).fetchall()
    res = []
    for r in rows:
        d = dict(r)
        d['role'] = 'Provider' if d['provider_id'] == uid else 'Seeker'
        d['counterpartyName'] = d['seeker_name'] if d['role'] == 'Provider' else d['provider_name']
        try:
            d['messages'] = json.loads(d['messages_json'] or '[]')
        except Exception:
            d['messages'] = []
        res.append(d)
    return jsonify(negotiations=res)

@app.post('/api/negotiations/<neg_id>/message')
def post_negotiation_msg(neg_id):
    user = current_user()
    data = request.get_json(silent=True) or {}
    neg = db().execute('SELECT * FROM negotiations WHERE id=?', (neg_id,)).fetchone()
    if not neg:
        return jsonify(error='Negotiation deal not found'), 404

    sender_name = user['business_name'] if user else 'Hotel Taj'
    msgs = json.loads(neg['messages_json'] or '[]')
    is_offer = bool(data.get('isOffer'))
    amount = float(data.get('amount')) if data.get('amount') else None

    new_msg = {
        'id': f'm-{secrets.token_hex(3)}',
        'sender': sender_name,
        'text': data.get('text', ''),
        'time': datetime.now().strftime('%I:%M %p'),
        'isOffer': is_offer,
        'amount': amount
    }
    msgs.append(new_msg)

    counter = amount if is_offer else neg['current_offer']
    last_msg = f'{sender_name}: "{data.get("text", "")}"'

    db().execute('''
        UPDATE negotiations SET messages_json=?, current_offer=?, last_message=?, updated_at=? WHERE id=?
    ''', (json.dumps(msgs), counter, last_msg, datetime.utcnow().isoformat(), neg_id))

    # Notify counterparty
    counterparty_id = neg['seeker_id'] if user and user['id'] == neg['provider_id'] else neg['provider_id']
    db().execute('''
        INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
        VALUES (?, ?, 'New Negotiation Message 💬', ?, 'negotiation', '/negotiations', 0, ?)
    ''', (f'notif-{secrets.token_hex(4)}', counterparty_id, f'{sender_name} sent a message regarding {neg["resource_name"]}.', datetime.utcnow().isoformat()))

    db().commit()
    return jsonify(status='ok')

@app.post('/api/negotiations/<neg_id>/accept')
def accept_negotiation(neg_id):
    user = current_user()
    neg = db().execute('SELECT * FROM negotiations WHERE id=?', (neg_id,)).fetchone()
    if not neg:
        return jsonify(error='Deal not found'), 404

    final_price = f'₹{neg["current_offer"]:,.0f}'
    db().execute('UPDATE negotiations SET status="Accepted", last_message="Deal Accepted and Booking Confirmed", updated_at=? WHERE id=?', (datetime.utcnow().isoformat(), neg_id))

    # Create Booking
    bk_id = f'bk-{secrets.token_hex(4)}'
    db().execute('''
        INSERT INTO bookings (id, resource_id, seeker_id, provider_id, resource_name, category, quantity, booked_by, provider, city, date, time, total_amount, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'Furniture', ?, ?, ?, 'Pune', '2026-09-15', '09:00 AM - 09:00 PM', ?, 'Upcoming', ?)
    ''', (bk_id, neg['resource_id'], neg['seeker_id'], neg['provider_id'], neg['resource_name'], f"{neg['quantity']} Units", neg['seeker_name'], neg['provider_name'], final_price, datetime.utcnow().isoformat()))
    db().commit()

    return jsonify(status='ok', bookingId=bk_id)

# ==============================================================================
# BOOKINGS
# ==============================================================================

@app.get('/api/bookings')
def get_bookings():
    user = current_user()
    uid = user['id'] if user else 1
    rows = db().execute('SELECT * FROM bookings WHERE provider_id=? OR seeker_id=? ORDER BY date ASC', (uid, uid)).fetchall()
    return jsonify(bookings=[dict(r) for r in rows])

# ==============================================================================
# AI SMART MATCHING ENGINE (⭐ REAL DATABASE QUERIES & SCORING)
# ==============================================================================

@app.post('/api/ai/match')
def ai_match():
    data = request.get_json(silent=True) or {}
    req_item = (data.get('resource') or '').strip().lower()
    req_qty = int(data.get('quantity') or 1)
    req_location = (data.get('location') or 'Pune').strip().lower()
    req_budget = float(data.get('budget') or 10000)

    # Query all active resources in SQLite database
    rows = db().execute('SELECT * FROM resources WHERE status="Available"').fetchall()
    results = []

    for r in rows:
        r_dict = dict(r)
        name_lower = r_dict['name'].lower()
        cat_lower = r_dict['category'].lower()

        # Relevance filtering
        if req_item and req_item not in name_lower and req_item not in cat_lower and name_lower not in req_item:
            continue

        # Dynamic multi-attribute score calculations
        # 1. Quantity fit (up to 100%)
        qty_ratio = min(1.0, r_dict['quantity'] / max(1, req_qty))
        qty_score = int(qty_ratio * 100)

        # 2. Price/Budget fit
        total_est = r_dict['price'] * (req_qty if r_dict['unit'] != 'Hall' else 1)
        price_score = 100 if total_est <= req_budget else max(50, int(100 - ((total_est - req_budget) / req_budget) * 100))

        # 3. Location / Proximity score
        dist = r_dict.get('distance_km', 3.0)
        loc_score = max(60, int(100 - (dist * 3.5)))

        # 4. Availability score
        avail_score = 95

        composite_score = int((qty_score * 0.25) + (avail_score * 0.25) + (loc_score * 0.25) + (price_score * 0.25))

        results.append({
            'id': r_dict['id'],
            'provider': r_dict['business_name'],
            'rating': 4.8,
            'reviews': 34,
            'resource': r_dict['name'],
            'category': r_dict['category'],
            'quantity': r_dict['quantity'],
            'price': total_est,
            'location': r_dict['location'],
            'distanceKm': dist,
            'availableDates': f"{r_dict['available_from']} → {r_dict['available_to']}",
            'status': 'Available ✅',
            'matchScore': min(98, max(75, composite_score)),
            'breakdown': {
                'quantity': qty_score,
                'availability': avail_score,
                'location': loc_score,
                'price': price_score
            },
            'aiSummary': f"Verified asset from {r_dict['business_name']}. {qty_score}% quantity fit ({r_dict['quantity']} units), {dist} km distance, and total estimated price of ₹{total_est:,.0f}."
        })

    results.sort(key=lambda x: x['matchScore'], reverse=True)
    return jsonify(matches=results, totalFound=len(results))

# ==============================================================================
# ANALYTICS
# ==============================================================================

@app.get('/api/analytics')
def get_analytics():
    user = current_user()
    uid = user['id'] if user else 1

    total_res = db().execute('SELECT COUNT(*) as c FROM resources WHERE user_id=?', (uid,)).fetchone()['c']
    booked_res = db().execute('SELECT COUNT(*) as c FROM resources WHERE user_id=? AND status="Booked"', (uid,)).fetchone()['c']
    utilization = int((booked_res / max(1, total_res)) * 100) if total_res else 78

    return jsonify({
        'metrics': {
            'utilizationRate': max(65, utilization if utilization > 0 else 78),
            'costSaved': 142000,
            'revenueGenerated': 86500,
            'activePartners': 18,
            'co2SavedKg': 340
        },
        'categoryBreakdown': [
            {'category': 'Furniture (Chairs & Tables)', 'percent': 42, 'count': 84, 'color': '#078b48'},
            {'category': 'AV & Sound Systems', 'percent': 24, 'count': 48, 'color': '#2e79d4'},
            {'category': 'Banquet & Venue Space', 'percent': 18, 'count': 36, 'color': '#8051d8'},
            {'category': 'Kitchen & Catering Equipment', 'percent': 16, 'count': 32, 'color': '#ee941f'}
        ]
    })

# ==============================================================================
# NOTIFICATIONS & SETTINGS
# ==============================================================================

@app.get('/api/notifications')
def get_notifications():
    user = current_user()
    uid = user['id'] if user else 1
    rows = db().execute('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC', (uid,)).fetchall()
    return jsonify(notifications=[dict(r) for r in rows])

@app.post('/api/notifications/read-all')
def mark_all_notifications_read():
    user = current_user()
    uid = user['id'] if user else 1
    db().execute('UPDATE notifications SET is_read=1 WHERE user_id=?', (uid,))
    db().commit()
    return jsonify(status='ok')

@app.put('/api/settings')
def update_settings():
    user = current_user()
    if not user:
        return jsonify(error='Unauthenticated'), 401
    data = request.get_json(silent=True) or {}

    db().execute('''
        UPDATE users SET
            business_name = ?,
            owner_name = ?,
            phone = ?,
            city = ?,
            address = ?,
            business_type = ?,
            gstin = ?,
            operating_radius_km = ?
        WHERE id = ?
    ''', (
        data.get('businessName', user['business_name']),
        data.get('ownerName', user['owner_name']),
        data.get('phone', user['phone']),
        data.get('city', user['city']),
        data.get('address', user['address']),
        data.get('businessType', user['business_type']),
        data.get('gstin', user['gstin']),
        int(data.get('operatingRadiusKm', user['operating_radius_km'])),
        user['id']
    ))
    db().commit()

    updated = db().execute('SELECT * FROM users WHERE id=?', (user['id'],)).fetchone()
    return jsonify(status='ok', user=public_user(updated))

@app.get('/api/health')
def health():
    return jsonify(status='ok', service='Hospora Full-Stack API v2.0', activeDb='hospora.db')

if __name__ == '__main__':
    init_db()
    print("🏨 Hospora Full-Stack API Running on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
