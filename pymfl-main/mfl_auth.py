def get_api_clients():
    """Get API clients for the authenticated user"""
    return {
        'league': CommonLeagueInfoAPIClient(),
        'players': LeaguePlayersAPIClient(),
        'transactions': TransactionsAPIClient,
        'content': FantasyContentAPIClient(),
        'user': UserFunctionsAPIClient()
    } 