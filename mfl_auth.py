from pymfl.api import (
    CommonLeagueInfoAPIClient,
    FantasyContentAPIClient,
    LeaguePlayersAPIClient,
    UserFunctionsAPIClient,
    TransactionsAPIClient,
    SessionAPIClient,
)
from pymfl.api.config.APIConfig import APIConfig, YearAPIConfig

import logging
import requests
import xml.etree.ElementTree as ET
import time

logger = logging.getLogger(__name__)

class MFLAuthProvider:
    def __init__(self, year="2024", user_agent="ElliotTradeBot"):
        self.year = int(year)  # Make sure year is an integer
        self.user_agent = user_agent
        self.base_url = f"https://api.myfantasyleague.com/{year}"
        self.session = requests.Session()
        self._api_clients = None
        self.user_info = None
        self._config = None
        self._password = None  # Store the original password
        self._last_request_time = 0
        self._min_request_interval = 2.0  # Increase to 2 seconds between requests
        self._retry_wait = 5.0  # Wait 5 seconds on rate limit

    def _rate_limit(self):
        """Ensure minimum time between requests"""
        current_time = time.time()
        elapsed = current_time - self._last_request_time
        if elapsed < self._min_request_interval:
            wait_time = self._min_request_interval - elapsed
            logger.debug(f"Rate limiting: waiting {wait_time:.2f} seconds")
            time.sleep(wait_time)
        self._last_request_time = time.time()

    def _make_request(self, method, url, **kwargs):
        """Make a rate-limited request"""
        self._rate_limit()
        response = self.session.request(method, url, **kwargs)
        if response.status_code == 429:
            logger.debug(f"Rate limited, waiting {self._retry_wait} seconds before retry")
            time.sleep(self._retry_wait)
            self._rate_limit()
            response = self.session.request(method, url, **kwargs)
        return response

    def authenticate(self, username, password):
        """Authenticate with MFL and get user info"""
        try:
            logger.info(f"Authenticating user {username} with MFL")
            self._password = password  # Store the original password

            # Get MFL user ID and cookies
            mfl_user_id = SessionAPIClient.get_mfl_user_id(
                year=self.year,
                username=username,
                password=password
            )

            # Create session with cookies
            cookies = {
                'MFL_USER_ID': mfl_user_id,
                'MFL_PW_SEQ': '1'  # This is typically set by MFL
            }

            # Get user info from MFL
            user_info_url = f"https://api.myfantasyleague.com/{self.year}/export"
            params = {
                "TYPE": "myleagues",
                "JSON": 1  # Use JSON instead of XML
            }
            response = requests.get(user_info_url, params=params, cookies=cookies)
            response.raise_for_status()

            # Parse JSON response
            user_leagues = response.json()
            logger.debug(f"Raw JSON response: {user_leagues}")

            # Extract leagues from JSON response
            leagues = []
            if 'leagues' in user_leagues and 'league' in user_leagues['leagues']:
                league_data = user_leagues['leagues']['league']
                # Handle both single league (dict) and multiple leagues (list)
                if isinstance(league_data, dict):
                    league_data = [league_data]
                
                for league in league_data:
                    league_info = {
                        'id': league.get('league_id'),
                        'name': league.get('name'),
                        'url': league.get('url'),
                        'franchise_id': league.get('franchise_id')
                    }
                    leagues.append(league_info)
                    logger.debug(f"Found league: {league_info}")

            logger.info(f"Found {len(leagues)} leagues for user {username}")

            # Store user info with cookies and leagues
            self.user_info = {
                'username': username,
                'mfl_user_id': mfl_user_id,
                'cookies': cookies,
                'leagues': leagues
            }

            # Register initial API config
            APIConfig.add_config_for_year_and_league_id(
                year=self.year,
                league_id='00000',
                username=username,
                password=password,
                user_agent_name=self.user_agent,
                franchise_id='0000'  # Default franchise ID for initial config
            )

            # Get the registered config
            self._config = APIConfig.get_config_by_year_and_league_id(
                year=self.year,
                league_id='00000'
            )

            logger.info(f"Successfully authenticated user {username}")
            return True, "Authentication successful"

        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {str(e)}")
            return False, "Failed to connect to MFL"

        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return False, str(e)

    def setup_api_clients(self, league_id):
        """Setup API clients for the selected league"""
        try:
            if not self.user_info:
                raise Exception("Not authenticated")

            # Find the franchise ID from the leagues we already have
            franchise_id = None
            for league in self.user_info.get('leagues', []):
                if league['id'] == league_id:
                    franchise_id = league['franchise_id']
                    break

            if not franchise_id:
                raise Exception(f"Could not find franchise ID for league {league_id}")

            # Initialize API clients
            self._api_clients = {
                'common_league': CommonLeagueInfoAPIClient(),
                'league_players': LeaguePlayersAPIClient(),
                'transactions': TransactionsAPIClient(),
                'fantasy_content': FantasyContentAPIClient(),
                'user_functions': UserFunctionsAPIClient()
            }

            # Register API config for the selected league
            APIConfig.add_config_for_year_and_league_id(
                year=self.year,
                league_id=league_id,
                username=self.user_info['username'],
                password=self._password,
                user_agent_name=self.user_agent,
                franchise_id=franchise_id
            )

            # Get the config for this league
            config = APIConfig.get_config_by_year_and_league_id(
                year=self.year,
                league_id=league_id
            )

            # Set config for each client
            for client in self._api_clients.values():
                client.config = config

            logger.info(f"Successfully set up API clients for league {league_id} with franchise ID {franchise_id}")
            return True, "Successfully set up API clients"

        except Exception as e:
            logger.error(f"Failed to setup API clients: {str(e)}")
            return False, str(e)

    def select_league(self, league_id):
        """Select and configure a league"""
        try:
            if not self.user_info:
                raise Exception("Not authenticated")

            # Setup API clients for this league
            success, message = self.setup_api_clients(league_id)
            if not success:
                raise Exception(f"Failed to setup API clients: {message}")

            # Get league info using the common league client
            league_info = self._api_clients['common_league'].get_league(
                year=self.year,
                league_id=league_id
            )
            if not league_info:
                raise Exception("Failed to get league info")

            self.user_info['league_id'] = league_id
            self.user_info['league_info'] = league_info

            return True, league_info

        except Exception as e:
            logger.error(f"Failed to select league: {str(e)}")
            return False, str(e)

    def get_user_info(self):
        """Get current user info"""
        return self.user_info

    def is_authenticated(self):
        """Check if user is authenticated"""
        return bool(self.user_info)

    def get_api_clients(self):
        """Get API clients for the authenticated user"""
        if not self._api_clients:
            raise Exception("API clients not initialized. Please select a league first.")
        return self._api_clients

    def logout(self):
        """Clear authentication state"""
        self.session = requests.Session()
        self.user_info = None
        self._api_clients = None
        return True, "Logged out successfully"

    def get_leagues(self):
        """Get user's leagues"""
        try:
            if not self.user_info:
                raise Exception("Not authenticated")

            # If we already have leagues cached, return them
            if 'leagues' in self.user_info:
                return True, self.user_info['leagues']

            leagues_url = f"{self.base_url}/export"
            leagues_params = {
                'TYPE': 'myleagues',
                'XML': 1
            }

            response = self._make_request('GET', leagues_url, params=leagues_params)
            if response.status_code != 200:
                raise Exception(f"Failed to fetch leagues (Status: {response.status_code})")

            root = ET.fromstring(response.text)
            leagues = []
            for league in root.findall('.//league'):
                league_data = {
                    'id': league.get('league_id'),
                    'name': league.get('name'),
                    'franchise_id': league.get('franchise_id'),
                    'url': league.get('url')
                }
                if league_data['id'] and league_data['name']:
                    leagues.append(league_data)

            # Cache the leagues in user_info
            self.user_info['leagues'] = leagues
            return True, leagues

        except Exception as e:
            logger.error(f"Failed to get leagues: {str(e)}")
            return False, str(e) 