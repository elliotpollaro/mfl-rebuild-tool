from flask import Flask, render_template_string, request, jsonify, session
from datetime import datetime, timedelta
import logging
import secrets
import traceback
from flask_cors import CORS
from mfl_auth import MFLAuthProvider
from functools import lru_cache
import time

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

# Configure CORS with specific origins
CORS(app, 
     supports_credentials=True,
     resources={
         r"/*": {
             "origins": ["http://localhost:3000"],
             "methods": ["GET", "POST", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "expose_headers": ["Content-Range", "X-Content-Range"],
             "supports_credentials": True
         }
     })

# Global MFL auth provider
mfl_auth = MFLAuthProvider()

# Cache and rate limiting configuration
CACHE_DURATION = 600  # Increase cache to 10 minutes
MIN_REQUEST_INTERVAL = 1.0  # Reduce to 1 second between requests
RETRY_WAIT = 3.0  # Reduce retry wait to 3 seconds
MAX_CACHE_ITEMS = 1000  # Add max cache items limit

# Cache storage
_cache = {}
_last_request_time = 0

def cleanup_cache():
    """Remove oldest items if cache is too large"""
    if len(_cache) > MAX_CACHE_ITEMS:
        sorted_items = sorted(_cache.items(), key=lambda x: x[1][1])  # Sort by timestamp
        for key, _ in sorted_items[:len(_cache) - MAX_CACHE_ITEMS]:
            del _cache[key]

def rate_limit():
    """Global rate limiting"""
    global _last_request_time
    current_time = time.time()
    elapsed = current_time - _last_request_time
    if elapsed < MIN_REQUEST_INTERVAL:
        time.sleep(MIN_REQUEST_INTERVAL - elapsed)
    _last_request_time = time.time()

def get_cache_key(endpoint, **params):
    """Generate a cache key from endpoint and parameters"""
    param_str = '_'.join(f"{k}:{v}" for k, v in sorted(params.items()))
    return f"{endpoint}_{param_str}"

def get_cached_data(cache_key):
    """Get data from cache if valid"""
    if cache_key in _cache:
        data, timestamp = _cache[cache_key]
        if time.time() - timestamp < CACHE_DURATION:
            return data
        del _cache[cache_key]
    return None

def set_cached_data(cache_key, data):
    """Store data in cache with cleanup"""
    cleanup_cache()
    _cache[cache_key] = (data, time.time())

@app.before_request
def before_request():
    """Apply rate limiting before each request"""
    rate_limit()

# Cache responses for 5 minutes
@lru_cache(maxsize=128)
def get_cached_rosters(year, league_id):
    """Get cached roster data with rate limiting"""
    cache_key = get_cache_key('rosters', year=year, league_id=league_id)
    cached_data = get_cached_data(cache_key)
    if cached_data:
        return cached_data

    try:
        rate_limit()
        api_clients = mfl_auth.get_api_clients()
        if not api_clients:
            return None
        data = api_clients['common_league'].get_rosters(year=year, league_id=league_id)
        logger.debug(f"Raw roster data: {data}")
        if data:
            set_cached_data(cache_key, data)
        return data
    except Exception as e:
        logger.error(f"Error fetching rosters: {str(e)}")
        return None

@lru_cache(maxsize=128)
def get_cached_future_draft_picks(year, league_id):
    """Get cached future draft picks data with rate limiting"""
    cache_key = get_cache_key('future_draft_picks', year=year, league_id=league_id)
    cached_data = get_cached_data(cache_key)
    if cached_data:
        return cached_data

    try:
        rate_limit()
        api_clients = mfl_auth.get_api_clients()
        if not api_clients:
            return None
        data = api_clients['common_league'].get_future_draft_picks(year=year, league_id=league_id)
        if data:
            set_cached_data(cache_key, data)
        return data
    except Exception as e:
        logger.error(f"Error fetching future draft picks: {str(e)}")
        return None

@lru_cache(maxsize=128)
def get_cached_players(year, league_id):
    """Get cached player data with rate limiting"""
    cache_key = get_cache_key('players', year=year, league_id=league_id)
    cached_data = get_cached_data(cache_key)
    if cached_data:
        return cached_data

    try:
        rate_limit()
        api_clients = mfl_auth.get_api_clients()
        if not api_clients:
            return None
        data = api_clients['fantasy_content'].get_players(year=year, league_id=league_id, details=1)
        if data:
            set_cached_data(cache_key, data)
        return data
    except Exception as e:
        logger.error(f"Error fetching players: {str(e)}")
        return None

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login to MFL and get leagues"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'error': 'Missing username or password'}), 400

        # Authenticate with MFL (this now includes getting leagues)
        success, message = mfl_auth.authenticate(username, password)
        if not success:
            return jsonify({'error': message}), 401

        # Store auth info in session
        user_info = mfl_auth.get_user_info()
        session['mfl_user_id'] = user_info['mfl_user_id']
        session['username'] = user_info['username']
        session['mfl_cookies'] = user_info['cookies']
        session.modified = True

        return jsonify({
            'success': True,
            'message': 'Successfully logged in',
            'leagues': user_info.get('leagues', [])
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
        logger.error(traceback.format_exc())
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
        logger.error(traceback.format_exc())
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

        user_info = mfl_auth.get_user_info()
        if not user_info or 'league_id' not in user_info:
            return jsonify({'assets': []})

        # Get roster data from cache
        roster_data = get_cached_rosters(2024, user_info['league_id'])
        if not roster_data:
            return jsonify({'assets': []})

        # Get player data from cache
        player_data = get_cached_players(2024, user_info['league_id'])
        if not player_data:
            return jsonify({'assets': []})

        # Create player dictionary for quick lookup
        players_dict = {}
        for player in player_data.get('players', {}).get('player', []):
            players_dict[player['id']] = {
                'name': player.get('name', 'Unknown'),
                'position': player.get('position', '??'),
                'team': player.get('team', 'FA')
            }

        # Get my franchise ID and create franchise name lookup
        league_info = user_info.get('league_info', {})
        my_franchise_id = None
        franchise_names = {}  # Dictionary to store franchise ID to name mapping
        my_franchise = None  # Store the full franchise object

        if league_info and 'league' in league_info:
            franchises = league_info['league'].get('franchises', {}).get('franchise', [])
            for franchise in franchises:
                franchise_names[franchise['id']] = franchise.get('name', 'Unknown')
                if franchise.get('username') == user_info['username']:
                    my_franchise_id = franchise['id']
                    my_franchise = franchise
                    logger.debug(f"Found my franchise: {my_franchise}")

        if not my_franchise_id:
            return jsonify({'assets': []})

        # Transform roster data into assets
        assets = []

        # Process players
        my_roster = None
        franchises = roster_data.get('rosters', {}).get('franchise', [])
        if isinstance(franchises, dict):
            franchises = [franchises]
        
        for franchise in franchises:
            if franchise.get('id') == my_franchise_id:
                my_roster = franchise
                break

        if my_roster:
            players = my_roster.get('player', [])
            if isinstance(players, dict):
                players = [players]

            for player in players:
                if player.get('status', '') != 'TAXI_SQUAD':
                    player_id = player.get('id')
                    if player_id in players_dict:
                        player_info = players_dict[player_id]
                        assets.append({
                            'id': player_id,
                            'name': f"{player_info['name']} ({player_info['position']})",
                            'type': 'player',
                            'details': f"Team: {player_info['team']}"
                        })

        def get_ordinal(n):
            """Convert number to ordinal string (1st, 2nd, 3rd, etc.)"""
            if 10 <= n % 100 <= 20:
                suffix = 'th'
            else:
                suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th')
            return f"{n}{suffix}"

        # Process picks from league info
        future_picks = my_franchise.get('future_draft_picks', '').split(',') if my_franchise else []
        logger.debug(f"Future picks: {future_picks}")
        
        for pick in future_picks:
            if pick:  # Skip empty strings
                parts = pick.split('_')
                logger.debug(f"Processing pick parts: {parts}")
                if len(parts) == 4:  # FP_[franchise]_[year]_[round]
                    franchise_id = parts[1]
                    year = parts[2]
                    round_num = int(parts[3])
                    
                    # Skip if round number is greater than 6
                    if round_num > 6:
                        continue
                        
                    # Get franchise name from the lookup dictionary
                    franchise_name = franchise_names.get(franchise_id, 'Unknown')
                    logger.debug(f"Found franchise name: {franchise_name} for ID: {franchise_id}")
                    
                    assets.append({
                        'id': pick,
                        'name': f"{franchise_name} {year} {get_ordinal(round_num)}",  # Format as "Team Name 2025 1st"
                        'type': 'pick',
                        'details': f"Original Team: {franchise_name}"
                    })

        # Sort assets by type, year, and round for picks, name for players
        def sort_key(asset):
            if asset['type'] == 'pick':
                # Extract year and round from the name
                parts = asset['name'].split()
                year = int(parts[-2])  # Second to last part is the year
                round_text = parts[-1]  # Last part is the round (1st, 2nd, etc.)
                round_num = int(''.join(c for c in round_text if c.isdigit()))  # Extract number from ordinal
                return (asset['type'], year, round_num, asset['name'])
            return (asset['type'], 0, 0, asset['name'])

        assets.sort(key=sort_key)
        
        logger.debug(f"Final assets: {assets}")
        return jsonify({'assets': assets})

    except Exception as e:
        logger.error(f"Error getting my assets: {str(e)}")
        logger.error(traceback.format_exc())
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

        user_info = mfl_auth.get_user_info()
        if not user_info or 'league_id' not in user_info:
            return jsonify({'assets': []})

        # Get roster data from cache
        roster_data = get_cached_rosters(2024, user_info['league_id'])
        if not roster_data:
            return jsonify({'assets': []})

        # Get player data from cache
        player_data = get_cached_players(2024, user_info['league_id'])
        if not player_data:
            return jsonify({'assets': []})

        # Create player dictionary for quick lookup
        players_dict = {}
        for player in player_data.get('players', {}).get('player', []):
            players_dict[player['id']] = {
                'name': player.get('name', 'Unknown'),
                'position': player.get('position', '??'),
                'team': player.get('team', 'FA')
            }

        # Get my franchise ID
        league_info = user_info.get('league_info', {})
        my_franchise_id = None

        if league_info and 'league' in league_info:
            franchises = league_info['league'].get('franchises', {}).get('franchise', [])
            for franchise in franchises:
                if franchise.get('username') == user_info['username']:
                    my_franchise_id = franchise['id']
                    break

        if not my_franchise_id:
            return jsonify({'assets': []})

        # Process rosters to get available assets
        available_assets = []
        franchises = roster_data.get('rosters', {}).get('franchise', [])
        if isinstance(franchises, dict):
            franchises = [franchises]

        logger.debug(f"Processing {len(franchises)} franchises")
        for franchise in franchises:
            # Skip my own franchise
            if franchise.get('id') == my_franchise_id:
                continue

            # Process players
            players = franchise.get('player', [])
            if isinstance(players, dict):
                players = [players]

            for player in players:
                if player.get('status', '') != 'TAXI_SQUAD':
                    player_id = player.get('id')
                    if player_id in players_dict:
                        player_info = players_dict[player_id]
                        available_assets.append({
                            'id': player_id,
                            'name': f"{player_info['name']} ({player_info['position']})",
                            'type': 'player',
                            'details': f"Team: {player_info['team']}",
                            'franchise_id': franchise.get('id')
                        })

        def get_ordinal(n):
            """Convert number to ordinal string (1st, 2nd, 3rd, etc.)"""
            if 10 <= n % 100 <= 20:
                suffix = 'th'
            else:
                suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th')
            return f"{n}{suffix}"

        # Process picks - create unique picks list by year and round
        picks_by_year_round = {}  # Dictionary to store picks by year and round
        if league_info and 'league' in league_info:
            franchises = league_info['league'].get('franchises', {}).get('franchise', [])
            for franchise in franchises:
                if franchise.get('id') != my_franchise_id:
                    future_picks = franchise.get('future_draft_picks', '').split(',')
                    for pick in future_picks:
                        if pick:  # Skip empty strings
                            parts = pick.split('_')
                            if len(parts) == 4:  # FP_[franchise]_[year]_[round]
                                franchise_num = parts[1]  # This is the franchise number, not the round
                                year = parts[2]
                                round_num = int(parts[3])  # This is the actual round number
                                
                                # Skip if round number is greater than 6
                                if round_num > 6:
                                    continue
                                
                                # Create a key for this year and round combination
                                year_round_key = f"{year}_{round_num:02d}"  # Pad round with zeros for proper sorting
                                
                                owner_info = {
                                    'franchise_id': franchise.get('id'),
                                    'franchise_name': franchise.get('name', 'Unknown'),
                                    'pick_id': pick,  # Store the actual pick ID
                                    'original_franchise': franchise_num
                                }
                                
                                if year_round_key not in picks_by_year_round:
                                    picks_by_year_round[year_round_key] = {
                                        'id': year_round_key,
                                        'name': f"{year} {get_ordinal(round_num)}",  # Format as "2025 1st"
                                        'type': 'pick',
                                        'details': f"Available from {len([owner_info])} team(s)",
                                        'owners': [],
                                        'sort_key': (int(year), round_num)  # Add sort key for proper sorting
                                    }
                                
                                picks_by_year_round[year_round_key]['owners'].append(owner_info)
                                # Update the details with the current count of owners
                                picks_by_year_round[year_round_key]['details'] = f"Available from {len(picks_by_year_round[year_round_key]['owners'])} team(s)"

        # Add consolidated picks to available assets, sorted by year and round
        sorted_picks = sorted(picks_by_year_round.values(), key=lambda x: (x['sort_key'][0], x['sort_key'][1]))
        available_assets.extend(sorted_picks)

        # Sort assets: players alphabetically, then picks by year and round
        available_assets.sort(key=lambda x: (
            x['type'],  # Players first, then picks
            x.get('sort_key', (0, 0)) if x['type'] == 'pick' else (0, 0),  # Sort picks by year and round
            x['name']  # Sort players by name
        ))
        
        logger.debug(f"Total available assets: {len(available_assets)}")
        return jsonify({'assets': available_assets})

    except Exception as e:
        logger.error(f"Error getting available assets: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

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
                    # Only consider franchises that have exactly the required number of picks
                    if available_count != required_count:
                        has_exact_picks = False
                        break
                if has_exact_picks:
                    valid_franchises.add(franchise_id)
                    logger.debug(f"Added franchise {franchise_id} to valid franchises - has exact number of required picks")

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
        if successful_trades:
            return jsonify({
                'success': True,
                'message': f"Successfully sent {len(successful_trades)} trade{'' if len(successful_trades) == 1 else 's'}",
                'successful_trades': successful_trades,
                'failed_trades': failed_trades
            })
        else:
            return jsonify({
                'success': False,
                'error': "No trades were sent successfully",
                'failed_trades': failed_trades
            })

    except Exception as e:
        logger.error(f"Error in submit_trade: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/api/auth/leagues')
def get_leagues():
    """Get user's leagues"""
    try:
        if not mfl_auth.is_authenticated():
            return jsonify({'error': 'Not authenticated'}), 401

        user_info = mfl_auth.get_user_info()
        leagues = user_info.get('leagues', [])
        
        return jsonify({
            'success': True,
            'leagues': leagues
        })

    except Exception as e:
        logger.error(f"Error getting leagues: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True) 