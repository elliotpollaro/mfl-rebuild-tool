from flask import Flask, render_template_string, request, jsonify, session
from datetime import datetime, timedelta
import logging
import secrets
from flask_cors import CORS
from mfl_auth import MFLAuthProvider
import traceback

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.debug = True
app.secret_key = secrets.token_hex(16)
app.config['SESSION_COOKIE_SECURE'] = False  # Allow non-HTTPS for development
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)

# Configure CORS
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

# Global MFL auth provider
mfl_auth = MFLAuthProvider()

# Add this CSS to the style section
css = '''
    /* ... existing styles ... */

    .league-select {
        background-color: #2a2f3e !important;
        color: white !important;
        border: 1px solid #4a5568 !important;
        border-radius: 0.375rem !important;
        padding: 0.5rem 1rem !important;
        width: 100% !important;
        opacity: 1 !important;
    }

    .league-select option {
        background-color: #2a2f3e !important;
        color: white !important;
        padding: 0.5rem 1rem !important;
        opacity: 1 !important;
    }

    .league-select:hover, .league-select:focus {
        background-color: #374151 !important;
        border-color: #6b7280 !important;
        outline: none !important;
    }
'''

# Update the league selector HTML to use the new class
league_selector = '''
    <select id="league-select" class="league-select" onchange="selectLeague(this.value)">
        <option value="">Select a league</option>
        {% for league in leagues %}
            <option value="{{ league.id }}">{{ league.name }}</option>
        {% endfor %}
    </select>
'''

template = '''
<!DOCTYPE html>
<html>
<head>
    <title>MFL Trade Sender</title>
    <style>
        /* ... existing styles ... */
        .search-container {
            margin-bottom: 1rem;
            width: 100%;
        }
        .search-input {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #4a5568;
            border-radius: 0.375rem;
            background-color: #2a2f3e;
            color: white;
        }
        .search-input:focus {
            outline: none;
            border-color: #6b7280;
        }
        .league-select {
            background-color: #2a2f3e !important;
            color: white !important;
            border: 1px solid #4a5568 !important;
            border-radius: 0.375rem !important;
            padding: 0.5rem 1rem !important;
            width: 100% !important;
            opacity: 1 !important;
        }
        .league-select option {
            background-color: #2a2f3e !important;
            color: white !important;
            padding: 0.5rem 1rem !important;
            opacity: 1 !important;
        }
        .league-select:hover, .league-select:focus {
            background-color: #374151 !important;
            border-color: #6b7280 !important;
            outline: none !important;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>MFL Trade Sender</h1>
            <div id="auth-section">
                {% if not authenticated %}
                <div class="auth-form">
                    <input type="text" id="username" placeholder="Username">
                    <input type="password" id="password" placeholder="Password">
                    <button onclick="login()">Login</button>
                </div>
                {% else %}
                <div class="user-info">
                    <span>Welcome, {{ username }}!</span>
                    <button onclick="logout()">Logout</button>
                </div>
                {% endif %}
            </div>
            {% if leagues %}
            <div class="league-selector">
                <select id="league-select" class="league-select" onchange="selectLeague(this.value)">
                    <option value="">Select a league</option>
                    {% for league in leagues %}
                        <option value="{{ league.id }}">{{ league.name }}</option>
                    {% endfor %}
                </select>
            </div>
            {% endif %}
        </div>
        <div class="trade-container">
            <div class="assets-column">
                <h2>Your Assets</h2>
                <div class="search-container">
                    <input type="text" class="search-input" 
                           placeholder="Search your assets..." 
                           oninput="searchMyAssets(this.value)">
                </div>
                <div id="my-assets" class="asset-list">
                    <!-- My assets will be populated here -->
                </div>
            </div>
            <div class="assets-column">
                <h2>Available Assets</h2>
                <div class="search-container">
                    <input type="text" class="search-input" 
                           placeholder="Search available assets..." 
                           oninput="searchAvailableAssets(this.value)">
                </div>
                <div id="available-assets" class="asset-list">
                    <!-- Available assets will be populated here -->
                </div>
            </div>
        </div>
    </div>
    <script>
        // ... existing JavaScript ...

        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        const searchMyAssets = debounce(function(query) {
            try {
                const searchQuery = query.toLowerCase();
                const assetList = document.getElementById('my-assets');
                if (!assetList) return;
                
                const assets = assetList.getElementsByClassName('asset-item');
                Array.from(assets).forEach(asset => {
                    const name = asset.getElementsByClassName('asset-name')[0]?.textContent.toLowerCase() || '';
                    const details = asset.getElementsByClassName('asset-details')[0]?.textContent.toLowerCase() || '';
                    if (name.includes(searchQuery) || details.includes(searchQuery)) {
                        asset.style.display = '';
                    } else {
                        asset.style.display = 'none';
                    }
                });
            } catch (error) {
                console.error('Error searching my assets:', error);
            }
        }, 300);

        const searchAvailableAssets = debounce(function(query) {
            try {
                const searchQuery = query.toLowerCase();
                const assetList = document.getElementById('available-assets');
                if (!assetList) return;
                
                const assets = assetList.getElementsByClassName('asset-item');
                Array.from(assets).forEach(asset => {
                    const name = asset.getElementsByClassName('asset-name')[0]?.textContent.toLowerCase() || '';
                    const details = asset.getElementsByClassName('asset-details')[0]?.textContent.toLowerCase() || '';
                    if (name.includes(searchQuery) || details.includes(searchQuery)) {
                        asset.style.display = '';
                    } else {
                        asset.style.display = 'none';
                    }
                });
            } catch (error) {
                console.error('Error searching available assets:', error);
            }
        }, 300);
    </script>
</body>
</html>
'''

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login to MFL and get leagues"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Missing username or password'}), 400

        # Authenticate with MFL
        success, message = mfl_auth.authenticate(username, password)
        if not success:
            return jsonify({'error': message}), 401

        # Store auth info in session
        user_info = mfl_auth.get_user_info()
        session['mfl_user_id'] = user_info['mfl_user_id']
        session['username'] = user_info['username']
        session['mfl_cookies'] = user_info['cookies']
        session.modified = True

        # Get leagues
        success, leagues = mfl_auth.get_leagues()
        if not success:
            return jsonify({'error': leagues}), 500

                return jsonify({
                    'success': True,
            'message': 'Successfully logged in',
                    'leagues': leagues
                })
            
    except Exception as e:
        logger.error(f"Error in login: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/select-league', methods=['POST'])
def select_league():
    """Select a league and store its info"""
    try:
        if not mfl_auth.is_authenticated():
            return jsonify({'error': 'Not authenticated'}), 401

        data = request.get_json()
        league_id = data.get('league_id')
        
        if not league_id:
            return jsonify({'error': 'Missing league_id'}), 400

        # Select league and get info
        success, league_info = mfl_auth.select_league(league_id)
        if not success:
            return jsonify({'error': league_info}), 500

        # Update session
        session['league_id'] = league_id
        session['league_info'] = league_info
        session.modified = True
        
        return jsonify({
            'success': True,
            'message': 'Successfully selected league'
        })
        
    except Exception as e:
        logger.error(f"Error in select_league: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/status')
def auth_status():
    """Check authentication status"""
    try:
        if not mfl_auth.is_authenticated():
            return jsonify({
                'authenticated': False,
                'message': 'Not logged in'
            })
            
        user_info = mfl_auth.get_user_info()
        league_id = user_info.get('league_id')
        
        if not league_id:
            return jsonify({
                'authenticated': True,
                'league_selected': False,
                'message': 'Logged in but no league selected'
            })

        return jsonify({
            'authenticated': True,
            'league_selected': True,
            'username': user_info['username'],
            'league_id': league_id,
            'message': 'Fully authenticated'
        })

    except Exception as e:
        logger.error(f"Error in auth_status: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout and clear session"""
    success, message = mfl_auth.logout()
    session.clear()
    return jsonify({'success': success, 'message': message})

@app.route('/get_my_assets')
def get_my_assets():
    """Get the user's assets"""
    try:
        if not mfl_auth.is_authenticated():
            return jsonify({'assets': []})

        api_clients = mfl_auth.get_api_clients()
        if not api_clients:
            return jsonify({'error': 'API clients not initialized'}), 500

        # Get roster data
        roster_data = api_clients['common_league'].get_rosters()
        if not roster_data:
            return jsonify({'assets': []})

        # Get player data
        player_data = api_clients['fantasy_content'].get_players(details=1)
        if not player_data:
            return jsonify({'assets': []})

        # Process and return assets
        # ... (rest of the asset processing logic remains the same)

    except Exception as e:
        logger.error(f"Error getting my assets: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/get_available_assets')
def get_available_assets():
    """Get available assets for trading"""
    try:
        if not mfl_auth.is_authenticated():
            return jsonify({'assets': []})

        api_clients = mfl_auth.get_api_clients()
        if not api_clients:
            return jsonify({'error': 'API clients not initialized'}), 500

        # Get roster data
        roster_data = api_clients['common_league'].get_rosters()
        if not roster_data:
            return jsonify({'assets': []})

        # Get player data
        player_data = api_clients['fantasy_content'].get_players(details=1)
        if not player_data:
            return jsonify({'assets': []})

        # Process and return assets
        # ... (rest of the asset processing logic remains the same)
            
    except Exception as e:
        logger.error(f"Error getting available assets: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/submit_trade', methods=['POST'])
def submit_trade():
    """Submit trades to all teams that own the requested picks"""
    try:
        if not mfl_auth.is_authenticated():
            return jsonify({'error': 'Not authenticated'}), 401

        data = request.get_json()
        logger.debug(f"Received trade data: {data}")
        
        giving = data.get('giving', [])  # What I'm giving up
        receiving = data.get('receiving', [])  # What I want to receive
        
        if not giving or not receiving:
            return jsonify({
                'success': False,
                'error': "Must specify both giving and receiving items"
            })

        # Get my franchise ID
        user_info = mfl_auth.get_user_info()
        my_franchise_id = None
        if user_info and 'league_info' in user_info:
            franchises = user_info['league_info']['league'].get('franchises', {}).get('franchise', [])
            for franchise in franchises:
                if franchise.get('username') == user_info['username']:
                    my_franchise_id = franchise['id']
                    break

        if not my_franchise_id:
            return jsonify({
                'success': False,
                'error': "Could not determine your franchise ID"
            })

        # Get available assets to check ownership
        available_assets_response = get_available_assets()
        available_assets = available_assets_response.json['assets']

        # Track successful and failed trades
        successful_trades = []
        failed_trades = []

        # First, organize all receiving items by franchise
        # Count how many of each pick we need
        pick_requirements = {}
        for item in receiving:
            if item['type'] == 'pick':
                pick_requirements[item['id']] = pick_requirements.get(item['id'], 0) + 1

        logger.debug(f"Pick requirements: {pick_requirements}")

        # First pass: identify franchises that have all required picks
        valid_franchises = set()  # Franchises that have all required picks
        franchise_pick_counts = {}  # Track what picks each franchise has
        franchise_pick_ids = {}  # Track the actual pick IDs for each franchise
        
        if pick_requirements:  # Only do this check if we're requesting picks
            # First gather all pick information
            for pick_type, required_count in pick_requirements.items():
                matching_asset = next(
                    (asset for asset in available_assets 
                    if asset['id'] == pick_type and asset['type'] == 'pick'),
                    None
                )
                
                if matching_asset and matching_asset.get('owners'):
                    # Group picks by franchise
                    for owner in matching_asset['owners']:
                        franchise_id = owner['franchise_id']
                        if franchise_id == my_franchise_id:
                            continue
                            
                        # Initialize data structures for this franchise if needed
                        if franchise_id not in franchise_pick_counts:
                            franchise_pick_counts[franchise_id] = {}
                            franchise_pick_ids[franchise_id] = {}
                            
                        # Initialize counters and lists for this pick type
                        if pick_type not in franchise_pick_counts[franchise_id]:
                            franchise_pick_counts[franchise_id][pick_type] = 0
                            franchise_pick_ids[franchise_id][pick_type] = []
                            
                        # Count this pick and store its ID
                        franchise_pick_counts[franchise_id][pick_type] += 1
                        franchise_pick_ids[franchise_id][pick_type].append(owner['pick_id'])

            logger.debug(f"Franchise pick counts: {franchise_pick_counts}")

            # Now check which franchises have exactly the required number of each pick type
            for franchise_id, pick_counts in franchise_pick_counts.items():
                has_exact_picks = True
                for pick_type, required_count in pick_requirements.items():
                    available_count = pick_counts.get(pick_type, 0)
                    logger.debug(f"Franchise {franchise_id} has {available_count} of pick {pick_type}, need {required_count}")
                    if available_count < required_count:
                        has_exact_picks = False
                        break
                if has_exact_picks:
                    valid_franchises.add(franchise_id)

            logger.debug(f"Valid franchises with exact pick counts: {valid_franchises}")

        # Build trades only for valid franchises
        trades_by_franchise = {}
        for franchise_id in valid_franchises:
            trades_by_franchise[franchise_id] = {
                'franchise_name': None,  # Will be set below
                'receiving': set()
            }
            
            # Add all required picks from this franchise
            for pick_type, required_count in pick_requirements.items():
                pick_ids = franchise_pick_ids[franchise_id][pick_type][:required_count]
                trades_by_franchise[franchise_id]['receiving'].update(pick_ids)

            # Set franchise name
            for item in receiving:
                matching_asset = next(
                    (asset for asset in available_assets 
                    if asset['id'] == item['id'] and asset['type'] == item['type']),
                    None
                )
                if matching_asset and matching_asset.get('owners'):
                    for owner in matching_asset['owners']:
                        if owner['franchise_id'] == franchise_id:
                            trades_by_franchise[franchise_id]['franchise_name'] = owner['franchise_name']
                            break
                    if trades_by_franchise[franchise_id]['franchise_name']:
                        break

            if not trades_by_franchise[franchise_id]['franchise_name']:
                trades_by_franchise[franchise_id]['franchise_name'] = 'Unknown'

        # Add non-pick assets only to franchises that have all required picks
        for item in receiving:
            if item['type'] != 'pick':
                matching_asset = next(
                    (asset for asset in available_assets 
                    if asset['id'] == item['id'] and asset['type'] == item['type']),
                    None
                )
                if matching_asset:
                    franchise_id = matching_asset.get('franchise_id')
                    if franchise_id and franchise_id != my_franchise_id:
                        if not pick_requirements or franchise_id in valid_franchises:
                            if franchise_id not in trades_by_franchise:
                                trades_by_franchise[franchise_id] = {
                                    'franchise_name': matching_asset.get('franchise_name', 'Unknown'),
                                    'receiving': set()
                                }
                            trades_by_franchise[franchise_id]['receiving'].add(item['id'])

        # What I'm giving up (same for all trades)
        giving_ids = [item['id'] for item in giving]
        
        logger.debug(f"Final trades to send: {trades_by_franchise}")
        
        # Now send one trade per franchise with all items
        for franchise_id, trade_info in trades_by_franchise.items():
            receiving_ids = list(trade_info['receiving'])  # Convert set to list
            
            logger.debug(f"Sending trade to franchise {franchise_id}")
            logger.debug(f"Giving: {giving_ids}")
            logger.debug(f"Receiving: {receiving_ids}")

            try:
                # Submit the trade
                api_clients = mfl_auth.get_api_clients()
                if not api_clients:
                    return jsonify({'error': 'API clients not initialized'}), 500

                # Convert lists to comma-separated strings
                giving_str = ','.join(giving_ids)
                receiving_str = ','.join(receiving_ids)

                success = api_clients['transactions'].submit_trade(
                    year=2024,
                    league_id=user_info['league_id'],
                    franchise_id=franchise_id,
                    giving_up=giving_str,
                    receiving=receiving_str
                )

                if success:
                    successful_trades.append({
                        'franchise_id': franchise_id,
                        'franchise_name': trade_info['franchise_name']
                    })
                else:
                    failed_trades.append({
                        'franchise_id': franchise_id,
                        'franchise_name': trade_info['franchise_name']
                    })
            except Exception as e:
                logger.error(f"Error submitting trade to franchise {franchise_id}: {str(e)}")
                failed_trades.append({
                    'franchise_id': franchise_id,
                    'franchise_name': trade_info['franchise_name'],
                    'error': str(e)
                })

        # Return results
        return jsonify({
            'success': True,
            'message': f"Successfully submitted {len(successful_trades)} trade(s)",
            'successful': successful_trades,
            'failed': failed_trades
        })

    except Exception as e:
        logger.error(f"Error in submit_trade: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True) 