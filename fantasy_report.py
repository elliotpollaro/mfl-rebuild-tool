from pymfl.api import ScoringAndResultsAPIClient, TransactionsAPIClient, NFLContentAPIClient
from pymfl.api.config import APIConfig
from datetime import datetime

# Configuration
LEAGUE_ID = "12345"
MFL_USERNAME = "your_username"
MFL_PASSWORD = "your_password"
USER_AGENT = "your_user_agent"
CURRENT_YEAR = datetime.now().year

def setup_api():
    """Configure the API with your credentials"""
    APIConfig.add_config_for_year_and_league_id(
        year=CURRENT_YEAR,
        league_id=LEAGUE_ID,
        username=MFL_USERNAME,
        password=MFL_PASSWORD,
        user_agent_name=USER_AGENT
    )

def get_league_standings():
    """Fetch and print current league standings"""
    standings = ScoringAndResultsAPIClient.get_league_standings(
        year=CURRENT_YEAR,
        league_id=LEAGUE_ID
    )
    
    print("\n=== LEAGUE STANDINGS ===")
    # Note: You'll need to parse the standings dictionary based on the actual response structure
    for franchise in standings.get('standings', {}).get('franchise', []):
        print(f"Team: {franchise.get('name')} - Record: {franchise.get('h2hw')}-{franchise.get('h2hl')}")

def get_recent_transactions(count=5):
    """Fetch and print recent transactions"""
    transactions = TransactionsAPIClient.get_transactions(
        year=CURRENT_YEAR,
        league_id=LEAGUE_ID
    )
    
    print("\n=== RECENT TRANSACTIONS ===")
    # Note: You'll need to parse the transactions dictionary based on the actual response structure
    for transaction in transactions.get('transactions', {}).get('transaction', [])[:count]:
        print(f"Type: {transaction.get('type')} - Date: {transaction.get('timestamp')}")

def get_weekly_schedule(week):
    """Fetch and print NFL schedule for specified week"""
    schedule = NFLContentAPIClient.get_nfl_schedule(
        year=CURRENT_YEAR,
        league_id=LEAGUE_ID,
        week=str(week)
    )
    
    print(f"\n=== NFL SCHEDULE WEEK {week} ===")
    # Note: You'll need to parse the schedule dictionary based on the actual response structure
    for game in schedule.get('schedule', {}).get('game', []):
        print(f"{game.get('away')} @ {game.get('home')} - {game.get('kickoff')}")

def main():
    try:
        # Set up API configuration
        setup_api()
        
        # Get various information
        get_league_standings()
        get_recent_transactions(5)
        get_weekly_schedule(1)  # Change week number as needed
        
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main() 