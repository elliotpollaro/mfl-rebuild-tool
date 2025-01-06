from pymfl.api.MFLAPIClient import MFLAPIClient
from datetime import datetime, timedelta
import requests
import xml.etree.ElementTree as ET


class TransactionsAPIClient(MFLAPIClient):
    """
    Client for handling MFL transactions including trades, waivers, and other roster moves.
    """

    def __init__(self):
        super().__init__()
        self._config = None

    @property
    def config(self):
        return self._config

    @config.setter
    def config(self, value):
        self._config = value

    @classmethod
    def get_transactions(cls, *, year: int, league_id: str, **kwargs) -> dict:
        """
        All non-pending transactions for a given league.
        Note that this can be a very large set, so it's recommended that you filter the result using one or more of the available parameters.
        If the request comes from an owner in the league, it will return the pending transactions for that owner's franchise.
        If it comes from the commissioner, it will return all pending transactions.
        Private league access restricted to league owners.
        """
        # If the week is specified, it returns the transactions for that week.
        week: int = kwargs.pop("week", None)
        # Returns only transactions of the specified type.
        # Types are: WAIVER, BBID_WAIVER, FREE_AGENT, WAIVER_REQUEST, BBID_WAIVER_REQUEST, TRADE, IR, TAXI, AUCTION_INIT, AUCTION_BID, AUCTION_WON, SURVIVOR_PICK, POOL_PICK.
        # You may also specify a value of * to indicate all transaction types or DEFAULT for the default transaction type set.
        # You can ask for multiple types by separating them with commas.
        trans_type: str = kwargs.pop("trans_type", None)
        # When set, returns just the transactions for the specified franchise.
        franchise: str = kwargs.pop("franchise", None)
        # When set, returns just the transactions for the number of days specified by this parameter.
        days: int = kwargs.pop("days", None)
        # Restricts the results to just this many entries.
        # Note than when this field is specified, only transactions from the most common types are returned.
        count: int = kwargs.pop("count", None)
        filters = [("TYPE", "transactions"), ("L", league_id), ("JSON", 1)]
        cls._add_filter_if_given("W", week, filters)
        cls._add_filter_if_given("TRANS_TYPE", trans_type, filters)
        cls._add_filter_if_given("FRANCHISE", franchise, filters)
        cls._add_filter_if_given("DAYS", days, filters)
        cls._add_filter_if_given("COUNT", count, filters)
        url = cls._build_route(cls._MFL_APP_BASE_URL, year, cls._EXPORT_ROUTE)
        url = cls._add_filters(url, *filters)
        return cls._get_for_year_and_league_id(url=url, year=year, league_id=league_id)

    @classmethod
    def get_pending_waivers(cls, *, year: int, league_id: str, **kwargs) -> dict:
        """
        Pending waivers that the current franchise has submitted, but have not yet been processed.
        Access restricted to league owners.
        """
        # When request comes from the league commissioner, this indicates which franchise they want.
        # Pass in '0000' to get trades pending commissioner action).
        franchise_id: str = kwargs.pop("franchise_id", None)
        filters = [("TYPE", "pendingWaivers"), ("L", league_id), ("JSON", 1)]
        cls._add_filter_if_given("FRANCHISE_ID", franchise_id, filters)
        url = cls._build_route(cls._MFL_APP_BASE_URL, year, cls._EXPORT_ROUTE)
        url = cls._add_filters(url, *filters)
        return cls._get_for_year_and_league_id(url=url, year=year, league_id=league_id)

    @classmethod
    def get_pending_trades(cls, *, year: int, league_id: str, **kwargs) -> dict:
        """
        Pending trades that the current franchise has offered to other franchises, or has been offered to by other franchises.
        Access restricted to league owners.
        """
        # When request comes from the league commissioner, this indicates which franchise they want.
        # Pass in '0000' to get trades pending commissioner action).
        franchise_id: str = kwargs.pop("franchise_id", None)
        filters = [("TYPE", "pendingTrades"), ("L", league_id), ("JSON", 1)]
        cls._add_filter_if_given("FRANCHISE_ID", franchise_id, filters)
        url = cls._build_route(cls._MFL_APP_BASE_URL, year, cls._EXPORT_ROUTE)
        url = cls._add_filters(url, *filters)
        return cls._get_for_year_and_league_id(url=url, year=year, league_id=league_id)

    @classmethod
    def get_trade_bait(cls, *, year: int, league_id: str, **kwargs) -> dict:
        """
        The Trade Bait for all franchises in a league.
        Private league access restricted to league owners.
        """
        # When set, this will also return draft picks offered.
        # Current year draft picks look like DP_02_05 which refers to the 3rd round 6th pick
        # (the round and pick values in the string are one less than the actual round/pick).
        # For future years picks, they are identified like FP_0005_2018_2
        # where 0005 refers to the franchise id who originally owns the draft pick, then the year and then the round
        # (in this case the rounds are the actual rounds, not one less).
        # This also includes Blind Bid dollars (in leagues that use them), which will be specified as BB_10 to indicate $10 in blind bid dollars.
        include_draft_picks: bool = kwargs.pop("include_draft_picks", None)
        filters = [("TYPE", "tradeBait"), ("L", league_id), ("JSON", 1)]
        cls._add_filter_if_given("INCLUDE_DRAFT_PICKS", include_draft_picks, filters)
        url = cls._build_route(cls._MFL_APP_BASE_URL, year, cls._EXPORT_ROUTE)
        url = cls._add_filters(url, *filters)
        return cls._get_for_year_and_league_id(url=url, year=year, league_id=league_id)

    @classmethod
    def get_assets(cls, *, year: int, league_id: str) -> dict:
        """
        All tradable assets (players, current year draft picks, future draft picks) for a given league.
        Access restricted to league owners.
        """
        filters = [("TYPE", "assets"), ("L", league_id), ("JSON", 1)]
        url = cls._build_route(cls._MFL_APP_BASE_URL, year, cls._EXPORT_ROUTE)
        url = cls._add_filters(url, *filters)
        return cls._get_for_year_and_league_id(url=url, year=year, league_id=league_id)

    def submit_trade(self, *, year: int, league_id: str, franchise_id: str, giving_up: str, receiving: str) -> bool:
        """
        Submit a trade offer to another franchise.
        Access restricted to league owners.
        
        Args:
            year: The league year
            league_id: The league ID
            franchise_id: The franchise ID to trade with
            giving_up: Comma-separated list of player/pick IDs you are giving up
            receiving: Comma-separated list of player/pick IDs you are receiving
            
        Returns:
            bool: True if trade was submitted successfully, False otherwise
        """
        try:
            # Build URL using base class method
            url = self._build_route(self._MFL_APP_BASE_URL, year, "import")
            
            # Calculate expiration date (7 days from now)
            expiration_str = (datetime.now() + timedelta(days=7)).strftime('%Y%m%d%H%M%S')
            
            # Get the user's franchise ID from the config or use the one from user_info
            my_franchise_id = getattr(self.config, 'franchise_id', None)
            if not my_franchise_id:
                # Get user info from MFL
                user_info_url = self._build_route(self._MFL_APP_BASE_URL, year, self._EXPORT_ROUTE)
                user_info_url = self._add_filters(user_info_url, ("TYPE", "myleagues"), ("JSON", 1))
                print(f"Fetching user info from: {user_info_url}")
                user_info_response = requests.get(user_info_url, cookies={
                    "MFL_USER_ID": self.config.mfl_user_id,
                    "MFL_LAST_LEAGUE_ID": league_id
                })
                user_info_response.raise_for_status()
                user_info = user_info_response.json()
                print(f"MFL Response: {user_info}")
                
                # Find the franchise ID for this league
                if 'leagues' in user_info and 'league' in user_info['leagues']:
                    leagues = user_info['leagues']['league']
                    if not isinstance(leagues, list):
                        leagues = [leagues]  # Convert single league to list
                    
                    for league in leagues:
                        print(f"Checking league: {league}")
                        if str(league.get('id')) == str(league_id):
                            my_franchise_id = league.get('franchise_id')
                            print(f"Found franchise ID: {my_franchise_id}")
                            break
                
                if not my_franchise_id:
                    raise Exception("Could not determine your franchise ID")
            
            # Build the request parameters
            filters = [
                ("TYPE", "tradeProposal"),
                ("L", league_id),
                ("FRANCHISE", my_franchise_id),  # The franchise proposing the trade
                ("OFFEREDTO", franchise_id),  # The franchise receiving the trade
                ("WILL_GIVE_UP", giving_up),
                ("WILL_RECEIVE", receiving),
                ("EXPIRES", expiration_str),
                ("XML", 1)
            ]
            
            # Add parameters to URL using base class method
            url = self._add_filters(url, *filters)
            
            # Set up cookies for authentication
            cookies = {
                "MFL_USER_ID": self.config.mfl_user_id,
                "MFL_LAST_LEAGUE_ID": league_id
            }
            
            # Submit trade using GET request
            response = requests.get(url, cookies=cookies)
            response.raise_for_status()
            
            # Parse XML response
            xml_response = ET.fromstring(response.content)
            
            # Check for successful trade submission
            # MFL returns "OK" for successful trade submissions
            if xml_response.text == "OK" or xml_response.tag == "success" or (xml_response.find("status") is not None and xml_response.find("status").text == "OK"):
                print(f"Successfully submitted trade to franchise {franchise_id}")
                return True
            else:
                error_msg = xml_response.text if xml_response.text else ET.tostring(xml_response)
                print(f"Trade submission failed. Response: {error_msg}")
                return False
                
        except Exception as e:
            print(f"Error submitting trade to MFL: {str(e)}")
            return False

    def _get_cookies(self, year: str) -> requests.cookies.RequestsCookieJar:
        """Get authenticated session cookies"""
        session = requests.Session()
        
        # Use XML API for authentication
        auth_url = f"https://api.myfantasyleague.com/{year}/login"
        auth_data = {
            'USERNAME': self._username,
            'PASSWORD': self._password,
            'XML': 1
        }
        
        response = session.post(auth_url, data=auth_data)
        
        if response.status_code == 200 and 'MFL_USER_ID' in session.cookies:
            return session.cookies
        else:
            raise Exception("Authentication failed")
